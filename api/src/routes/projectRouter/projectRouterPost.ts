import {createHono} from "../../helpers/createHono";
import {needsAuth} from "../../middleware/needsAuth";
import {AlterProjectSlugRequestSchema, UpdateProjectRequestSchema} from "@hapi/shared/types/apiRequests";
import {db} from "@hapi/shared";
import {filterProject} from "../../utils/filters/filterProject";
import type {ProjectAdminType} from "@hapi/shared/types/project";
import type {ProjectDetailsAdminResponse} from "@hapi/shared/types/apiResponses";
import {Prisma} from "@hapi/shared/prisma/client";

export const projectRouterPost = createHono()

projectRouterPost.post("/", needsAuth, async (c) => {
    const user = c.get("user")!
    let body
    try {
        const json = await c.req.json()
        body = UpdateProjectRequestSchema.parse(json)
    } catch (e) {
        console.error(e)
        return c.json({error: e}, 400)
    }
    try {
        const { media, ...project } = body.project;
        await db.project.create({
            data: {
                ...project,
                featured: false
            },
        })
        await db.projectSlug.create({
            data: {
                projectId: project.id,
                slug: project.id,
                assignedDate: new Date()
            }
        })
        // need another query to get the `includes`
        const record = await db.project.findUnique({
            where: {id: project.id},
            include: {
                showcase: true,
                media: true,
                categories: {include: {category: true}},
                slugs: {take: 1, orderBy: {assignedDate: "desc"}}
            }
        })

        const p = filterProject(record!, user.role) as ProjectAdminType

        return c.json({project: p} satisfies ProjectDetailsAdminResponse, 201)
    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})

projectRouterPost.post("/id/:projectId/slug", needsAuth, async (c) => {
    const projectId = c.req.param("projectId")
    let body
    try {
        body = AlterProjectSlugRequestSchema.parse(await c.req.json())
    } catch {
        return c.json({error: "Malformed data"}, 400)
    }
    try {
        await db.projectSlug.create({
            data: {
                projectId,
                slug: body.slug.toLowerCase(),
                assignedDate: new Date()
            }
        })
        return c.json({}, 200)
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            const existingSlugRecord = await db.projectSlug.findUnique({
                where: {slug: body.slug.toLowerCase()}, include: {project: true}
            })
            return c.json({
                    error: `Slug already taken by project with name "${existingSlugRecord!.project.name}"`}
                , 409)

        }
        return c.json({error: "Internal server error"}, 500)
    }
})
