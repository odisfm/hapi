import { createHono } from "../../helpers/createHono";
import {needsAuth} from "../../middleware/needsAuth";
import {UpdateProjectRequestSchema} from "@hapi/shared/types/apiRequests";
import {db} from "@hapi/shared";
import {Prisma} from "@hapi/shared/prisma/client";

export const projectRouterPatch = createHono()

projectRouterPatch.patch("/", needsAuth, async (c) => {
    let body
    try {
        body = UpdateProjectRequestSchema.parse(await c.req.json())
    } catch (e) {
        console.error(e)
        return c.json({error: "Malformed input"}, 400)
    }
    try {
        const { media, categoryIds, ...project } = body.project;
        await db.project.upsert({
            where: {id: project.id},
            create: {
                ...project,
                featured: false
            },
            update: {
                ...project
            }
        })
        for (const m of media) {
            await db.projectMedia.update({
                where: {id: m.id},
                data: {
                    mediaType: m.mediaType,
                    deviceType: m.deviceType,
                    mediaUrl: m.uri,
                    order: m.order
                }
            })
        }
        await db.projectCategory.deleteMany({
            where: {
                projectId: project.id,
            }
        })
        await db.projectCategory.createMany({
            data: categoryIds.map((cid) => {
                return {
                    projectId: project.id,
                    categoryId: cid
                }
            })
        })

        const slugRecords = await db.projectSlug.findMany({where: {projectId: project.id}})
        if (!slugRecords.length) {
            await db.projectSlug.create({data: {slug: project.id, projectId: project.id, assignedDate: new Date()}})
        }

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
