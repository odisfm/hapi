import {createHono} from "../helpers/createHono";
import { db } from "@hapi/shared"
import {filterProject, filterProjectPreview} from "../utils/filters/filterProject.js";
import {
    AlterProjectSlugRequestSchema,
    type ProjectSearchQuery,
    UpdateProjectRequestSchema
} from "@hapi/shared/types/apiRequests";
import type {ApprovalStatus} from "@hapi/shared/prisma/enums";
import type {
    ProjectDetailsAdminResponse,
    ProjectDetailsResponse, ProjectGetSlugsResponse,
    ProjectSearchResponse
} from "@hapi/shared/types/apiResponses";
import Fuse from "fuse.js"
import {needsAuth} from "../middleware/needsAuth";
import type {ProjectAdminType} from "@hapi/shared/types/project";

const SEARCH_SCORE_CUTOFF = 0.6 // 0 - exact match, 1 - no match

export const projectRouter = createHono()

export const MAX_SEARCH_LIMIT = 20
export const DEFAULT_SEARCH_LIMIT = 10

projectRouter.get("/search", async (c) => {
    const query = c.req.query()
    const searchQuery: ProjectSearchQuery = {
        searchTerm: query.searchTerm,
        cursor: query?.cursor,
        category: query?.category,
        showcase: query?.showcase,
        approvalStatus: query.approvalStatus ? query.approvalStatus as ApprovalStatus : undefined,
        page: query.page !== undefined ? Number(query.page) : undefined,
        published: (query.published === "published" || query.published === "unpublished") ? query.published : undefined
    }
    if (query.limit) {
        try {
            const limit = Number(query.limit)
            if (isNaN(limit)) {
                throw new Error("Why can I do this???")
            }
            searchQuery.limit = Number(query.limit)
        }
        catch {
            searchQuery.limit = DEFAULT_SEARCH_LIMIT
        }
    } else {
        searchQuery.limit = DEFAULT_SEARCH_LIMIT
    }
    searchQuery.limit = Math.min(searchQuery.limit, MAX_SEARCH_LIMIT)

    const user = c.get("user")
    const userRole = user?.role || null

    if (userRole !== "ADMIN" && searchQuery.approvalStatus) {
        searchQuery.approvalStatus = undefined
    }
    if (userRole !== "ADMIN" && searchQuery.published) {
        searchQuery.published = "published"
    }

    const records = await db.project.findMany({
        where: {
            ...(searchQuery.showcase && {showcaseId: searchQuery.showcase}),
            ...(searchQuery.category && {categoryId: searchQuery.category}),
            ...(searchQuery.approvalStatus && {approvalStatus: searchQuery.approvalStatus}),
            ...(userRole !== "ADMIN" && {published: true}),
        },
        include: {
            showcase: true,
            category: true,
            media: true,
            slugs: {
                take: 1,
                orderBy: {
                    assignedDate: "desc"
                }
            }
        },
        orderBy: [
            {showcase: {publishedDate: "desc"}},
            {name: "asc"}
        ]
    })
    const now = new Date()

    let filteredRecords = records.filter(r => {
        if (userRole === "ADMIN") {
            if (searchQuery.published === "published") {

                return r.showcase.publishedDate && r.showcase.publishedDate < now && r.published
            } else if (searchQuery.published === "unpublished") {
                return !r.showcase.publishedDate || r.showcase.publishedDate > now || !r.published
            } else {
                return true
            }
        }
        if (!r.showcase.publishedDate || r.showcase.publishedDate > now) {
            return false
        }
        if (userRole !== "ADMIN" && !r.published) return false
        return true
    })

    if (searchQuery.searchTerm) {
        const searchItems = filteredRecords.map(
            i => ({...i, categoryName: i.category.name})
        );
        const fuse = new Fuse(
            searchItems, {
                useTokenSearch: true,
                ignoreLocation: true,
                ignoreDiacritics: true,
                fieldNormWeight: 0.7,
                threshold: 0.8,
                keys: [
                    {name: "name", weight: 5},
                    {name: "subtitle", weight: 3},
                    {name: "description", weight: 1},
                    {name: "developers", weight: 1},
                    {name: "categoryName", weight: 3}
                ],
                includeScore: true
            }
        )
        let searchResult = fuse.search(searchQuery.searchTerm)
        searchResult = searchResult.filter((r) => {
            return r.score && r.score <= SEARCH_SCORE_CUTOFF
        })
        filteredRecords = searchResult.map((r) => {
            const { categoryName, ...item } = r.item;
            return item;
        });
    }

    let processedRecords = filteredRecords.map((r) => {
        return filterProjectPreview(r)
    })

    const resultCount = processedRecords.length

    if (searchQuery.page !== undefined) {
        const first = searchQuery.limit * searchQuery.page
        processedRecords = processedRecords.slice(first)
    } else {
        let cursorIndex: number | null = null
        if (searchQuery.cursor) {
            cursorIndex = processedRecords.findIndex(r => r.id === searchQuery.cursor);
            if (cursorIndex === -1) {
                return c.json({error: `Invalid cursor: ${searchQuery.cursor}`}, 400)
            }

            processedRecords = processedRecords.slice(cursorIndex + 1)
        }
    }

    processedRecords = processedRecords.slice(0, searchQuery.limit)

    return c.json({
        projects: processedRecords,
        info: {
            totalResults: resultCount
        }
    } satisfies ProjectSearchResponse)
})

projectRouter.get("/:projectSlug", async (c) => {
    const projectSlug = c.req.param("projectSlug")
    const slugRecord = await db.projectSlug.findUnique({
            where: {
                slug: projectSlug
            },
            include: {
                project: {
                    include: {
                        showcase: true,
                        media: true,
                        category: true,
                        slugs: {
                            take: 1,
                            orderBy: {
                                assignedDate: "desc"
                            }
                        }
                    }
                }
            }
        }
    )
    if (!slugRecord || !slugRecord.project.published) {
        return c.json({
            error: `No project found called '${projectSlug}'`
        }, 404)
    }
    const record = slugRecord.project
    const showcasePublic = record.showcase.publishedDate && record.showcase.publishedDate < new Date()
    const userRole = c.get("user")?.role || null
    if (!showcasePublic && userRole !== "ADMIN") {
        return c.json({
            error: `No project found called '${projectSlug}'`
        }, 404)
    }
    const project = filterProject(record, userRole)
    return c.json({
        project
    } satisfies ProjectDetailsResponse)
})

projectRouter.get("/id/:projectId", needsAuth, async (c) => {
    const projectId = c.req.param("projectId")
    try {
        const record = await db.project.findUnique({
            where: {id: projectId},
            include: {
                media: true,
                category: true,
                showcase: true,
                slugs: true
            }
        })

        if (!record) {
            return c.json({error: "Project not found"}, 404)
        }

        const project = filterProject(record!, c.get("user")!.role) as ProjectAdminType
        return c.json({project: project} satisfies ProjectDetailsAdminResponse, 200)

    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})

projectRouter.patch("/", needsAuth, async (c) => {
    let body
    try {
        body = UpdateProjectRequestSchema.parse(await c.req.json())
    } catch (e) {
        console.error(e)
        return c.json({error: "Malformed input"}, 400)
    }
    try {
        const { media, ...project } = body.project;
        await db.project.upsert({
            where: {id: project.id},
            create: {
                ...project
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

projectRouter.post("/", needsAuth, async (c) => {
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
                ...project
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
            include: {showcase: true, media: true, category: true, slugs: {take: 1, orderBy: {assignedDate: "desc"}}}
        })

        const p = filterProject(record!, user.role) as ProjectAdminType

        return c.json({project: p} satisfies ProjectDetailsAdminResponse, 201)
    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})

projectRouter.delete("/:projectId", needsAuth, async (c) => {
    const user = c.get("user")!
    if (user.role !== "ADMIN") {
        return c.json({error: "Unauthorised"}, 403)
    }
    const projectId = c.req.param("projectId")

    try {
        await db.project.delete({where: {id: projectId}})
        return c.json({}, 200)
    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})
