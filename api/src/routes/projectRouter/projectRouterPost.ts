import {createHono} from "../../helpers/createHono";
import {needsAuth} from "../../middleware/needsAuth";
import {
    AlterProjectSlugRequestSchema,
    CreateProjectRequestSchema,
    UpdateProjectRequestSchema
} from "@hapi/shared/types/apiRequests";
import {db} from "@hapi/shared";
import {filterProject} from "../../utils/filters/filterProject";
import type {ProjectAdminType} from "@hapi/shared/types/project";
import type {CreateProjectResponse, ProjectDetailsAdminResponse} from "@hapi/shared/types/apiResponses";
import {Prisma} from "@hapi/shared/prisma/client";
import {triggerAsyncId} from "node:async_hooks";

export const projectRouterPost = createHono()

projectRouterPost.post("/", needsAuth, async (c) => {
    const user = c.get("user")!
    let body
    try {
        const json = await c.req.json()
        body = CreateProjectRequestSchema.parse(json)
    } catch (e) {
        console.error(e)
        return c.json({error: e}, 400)
    }
    try {

        let showcaseId = body.showcaseId
        if (!showcaseId) {
            const showcaseRecord = await db.showcase.findFirst()
            if (!showcaseRecord) {
                return c.json({error: "No showcases. Create a showcase before creating projects"}, 400)
            }
            showcaseId = showcaseRecord.id
        }

        const transaction = await db.$transaction(async (tx) => {
            const projectRecord = await db.project.create({
                data: {
                    showcaseId,
                    published: false,
                    canBeHero: false,
                    featured: false,
                    versions: {
                        create: [
                            {
                                name: "My cool project",
                                subtitle: "It's not just x — it's y",
                                description: "",
                                iconUrl: "",
                                developerNames: user.role === "STUDENT" ? [user.name] : [],
                                createdAt: new Date(),
                                submissionStatus: user.role === "ADMIN" ? "APPROVED" : "NOT_SUBMITTED",
                                links: [],
                                categories: {
                                    create: []
                                },
                            }
                        ]
                    }
                },
                include: {versions: true}
            })

            const ownershipRecord = await db.projectOwner.create({
                data: {
                    projectId: projectRecord.id,
                    ownerId: user.id
                }
            })

            const slugRecord = await db.projectSlug.create({
                data: {
                    projectId: projectRecord.id,
                    slug: projectRecord.id,
                    assignedDate: new Date()
                }
            })

            return {
                projectId: projectRecord.id,
                versionId: projectRecord.versions![0].id
            }
        })

        return c.json({
            projectId: transaction.projectId,
            versionId: transaction.versionId
        } satisfies CreateProjectResponse, 200)

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
                where: {slug: body.slug.toLowerCase()},
                include: {
                    project: {
                        include: {
                            versions: {orderBy: {createdAt: "desc"}}
                        }
                    }
                }
            })
            return c.json({
                    error: `Slug already taken by project with name "${existingSlugRecord!.project.versions[0].name}", id "${existingSlugRecord!.project.id}"`}
                , 409)

        }
        return c.json({error: "Internal server error"}, 500)
    }
})
