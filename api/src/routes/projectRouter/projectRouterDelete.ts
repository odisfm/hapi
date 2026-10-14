import {createHono} from "../../helpers/createHono";
import {needsAuth} from "../../middleware/needsAuth";
import {db} from "@hapi/shared";
import {AlterProjectSlugRequestSchema} from "@hapi/shared/types/apiRequests";
import {DeleteObjectsCommand} from "@aws-sdk/client-s3";
import {s3} from "../../services/s3";

export const projectRouterDelete = createHono()

projectRouterDelete.delete("/:projectId", needsAuth, async (c) => {
    const user = c.get("user")!
    if (user.role !== "ADMIN") {
        return c.json({error: "Unauthorised"}, 403)
    }
    const projectId = c.req.param("projectId")

    try {
        const toDelete = await db.project.findUnique({
            where: {id: projectId},
            include: {media: true, versions: true}
        })
        if (!toDelete) {
            return c.json({error: "Not found"}, 404)
        }
        await db.project.delete({where: {id: projectId}})
        const mediaUris = new Set<string>
        for (const m of toDelete.media) {
            mediaUris.add(m.mediaUrl + (m.mediaType === "SCREENSHOT" ? ".webp" : ".webm"))
        }
        for (const v of toDelete.versions) {
            if (v.heroArtUrl) {
                mediaUris.add(`${v.heroArtUrl}.webp`)
            }
        }

        if (mediaUris.size) {
            await s3.send(new DeleteObjectsCommand({
                Bucket: process.env.BUCKET_MEDIA,
                Delete: {
                    Objects: [...mediaUris].map((m) => {
                        return {Key: m}
                    })
                }
            }))
        }

        const iconUris = new Set<String>
        for (const v of toDelete.versions) {
            if (!v.iconUrl) continue
            iconUris.add(v.iconUrl)
        }

        if (iconUris.size) {
            await s3.send(new DeleteObjectsCommand({
                Bucket: process.env.BUCKET_ICONS,
                Delete: {
                    Objects: [...iconUris].map((m) => {
                        return {Key: `${m}.webp`}
                    })
                }
            }))
        }

        return c.json({}, 200)
    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})

projectRouterDelete.delete("/id/:projectId/slug", needsAuth, async (c) => {
    const projectId = c.req.param("projectId")
    let body
    try {
        body = AlterProjectSlugRequestSchema.parse(await c.req.json())
    } catch {
        return c.json({error: "Malformed data"}, 400)
    }
    try {
        await db.projectSlug.delete({
            where: {slug: body.slug.toLowerCase(), projectId: projectId}
        })
        return c.json({}, 200)
    } catch (e) {
        return c.json({error: "Internal server error"}, 500)
    }
})
