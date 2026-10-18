import { createHono } from "../../helpers/createHono";
import {needsAuth} from "../../middleware/needsAuth";
import {UpdateProjectRequestSchema} from "@hapi/shared/types/apiRequests";
import {db} from "@hapi/shared";
import {Prisma} from "@hapi/shared/prisma/client";
import {canEditProject} from "../../utils/canEditProject";

export const projectRouterPatch = createHono()

projectRouterPatch.patch("/", needsAuth, async (c) => {
    const user = c.get("user")!
    let body
    try {
        body = UpdateProjectRequestSchema.parse(await c.req.json())
    } catch (e) {
        console.error(e)
        return c.json({error: "Malformed input"}, 400)
    }
    if (body.project && user.role !== "ADMIN") {
        return c.json({error: `Unauthorised to edit base project details: ${JSON.stringify(body.project)}`}, 403)
    }
    if (body.projectVersion) {
        const version = await db.projectVersion.findUnique({
            where: {id: body.projectVersion.id},
            select: {projectId: true, submissionStatus: true}
        })
        if (!version) {
            return c.json({error: "Not found"}, 404)
        }
        if (user.role !== "ADMIN") {
            if (!await canEditProject(user, version.projectId)) {
                return c.json({error: "Unauthorised"}, 403)
            }
            if (version.submissionStatus !== "NOT_SUBMITTED") {
                return c.json({error: "Only versions that haven't been submitted can be edited"}, 403)
            }
        }
        if (body.projectVersion.media?.length) {
            const mediaIds = new Set(body.projectVersion.media.map((m) => m.id))
            const ownMediaCount = await db.projectMedia.count({
                where: {id: {in: [...mediaIds]}, projectId: version.projectId}
            })
            if (ownMediaCount !== mediaIds.size) {
                return c.json({error: "Media must belong to the version's project"}, 400)
            }
        }
    }

    const transaction = await db.$transaction(async () => {
        if (body.project) {
            const {id, ...projectUpdates} = body.project
            await db.project.update({
                where: {
                    id: body.project.id
                },
                data: projectUpdates
            })
        }
        if (body.projectVersion) {
            const {id, categoryIds, media, ...versionUpdates} = body.projectVersion
            await db.projectVersion.update({
                where: {
                    id: body.projectVersion.id
                },
                data: versionUpdates
            })

            if (categoryIds) {
                await db.projectCategory.deleteMany({
                    where: {projectVersionId: body.projectVersion.id}
                })
                await db.projectCategory.createMany({
                    data: categoryIds.map((c) => {
                        return {
                            categoryId: c,
                            projectVersionId: body.projectVersion!.id
                        }
                    })
                })
            }

            if (media) {
                await db.projectVersionMedia.deleteMany({
                    where: {projectVersionId: body.projectVersion.id}
                })

                await db.projectVersionMedia.createMany({
                    data: media.map((_m) => {
                        console.log(_m)
                        const {id: mediaId, uri, mediaType, status, ...m} = _m
                        return {
                            ...m,
                            mediaId,
                            projectVersionId: body.projectVersion!.id
                        }
                    })
                })
            }
        }

    })

    try {
        return c.json({}, 201)
    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})

projectRouterPatch.patch("/batch", needsAuth, async (c) => {
    try {
        const user = c.get("user")!
        if (user.role !== "ADMIN") return c.json({error: "Unauthorised"}, 403)
        const body = await c.req.json()
        const updates = body.projects

        console.log(updates)

        await db.$transaction(
            updates.map(({ id, ...data }: { id: string } & Prisma.ProjectUpdateInput) =>
                db.project.update({
                    where: { id },
                    data,
                })
            )
        )
        return c.json({}, 200)

    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})
