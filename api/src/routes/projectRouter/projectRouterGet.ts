import {createHono} from "../../helpers/createHono";
import { db } from "@hapi/shared"
import {filterProject, filterProjectPreview} from "../../utils/filters/filterProject";
import {
    AlterProjectSlugRequestSchema,
    type ProjectSearchQuery,
} from "@hapi/shared/types/apiRequests";
import type {SubmissionStatus} from "@hapi/shared/prisma/enums";
import type {
    ProjectDetailsAdminResponse,
    ProjectDetailsResponse, ProjectGetSlugsResponse,
    ProjectSearchResponse
} from "@hapi/shared/types/apiResponses";
import Fuse from "fuse.js"
import {needsAuth} from "../../middleware/needsAuth";
import type {ProjectAdminType} from "@hapi/shared/types/project";
import {NUM_HERO_PROJECTS_FRONT_PAGE} from "@hapi/shared/consts";

const SEARCH_SCORE_CUTOFF = 0.6 // 0 - exact match, 1 - no match

export const projectRouterGet = createHono()

export const MAX_SEARCH_LIMIT = 20
export const DEFAULT_SEARCH_LIMIT = 10

projectRouterGet.get("/featured", async (c) => {
    try {
        const records = await db.project.findMany({
            where: {
                featured: true,
                published: true,
                showcase: {
                    publishedDate: {
                        not: null,
                        lt: new Date()
                    }
                }
            },
            orderBy: {order: "asc"},
            include: {
                showcase: true,
                categories: {
                    include: {
                        category: true
                    }
                },
                media: true,
                slugs: true
            }
        })

        const projects = records.map((r) => filterProjectPreview(r))

        let numHeroProjectsToGet = NUM_HERO_PROJECTS_FRONT_PAGE
        // do we have enough to fill this number ?
        let eligibleHeroes = []
        for (const r of records) {
            if (r.canBeHero) {
                eligibleHeroes.push(r)
            }
        }
        numHeroProjectsToGet = Math.min(numHeroProjectsToGet, eligibleHeroes.length)

        const heroIds: string[] = []
        while (heroIds.length < numHeroProjectsToGet) {
            const rand = Math.floor(Math.random() * eligibleHeroes.length);
            heroIds.push(eligibleHeroes[rand].id);
            eligibleHeroes = eligibleHeroes.toSpliced(rand, 1)
        }

        return c.json({projects: projects, info: {totalResults: projects.length, heroIds}} satisfies ProjectSearchResponse)

    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})

projectRouterGet.get("/search", async (c) => {
    const query = c.req.query()
    const searchQuery: ProjectSearchQuery = {
        searchTerm: query.searchTerm,
        cursor: query?.cursor,
        category: query?.category,
        showcase: query?.showcase,
        approvalStatus: query.approvalStatus ? query.approvalStatus as SubmissionStatus : undefined,
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

    const user = c.get("user")
    const userRole = user?.role || null

    if (userRole !== "ADMIN") {
        searchQuery.limit = Math.min(searchQuery.limit, MAX_SEARCH_LIMIT)
    }

    if (userRole !== "ADMIN" && searchQuery.approvalStatus) {
        searchQuery.approvalStatus = undefined
    }
    if (userRole !== "ADMIN" && searchQuery.published) {
        searchQuery.published = "published"
    }

    const records = await db.project.findMany({
        where: {
            ...(searchQuery.showcase && {showcaseId: searchQuery.showcase}),
            ...(searchQuery.approvalStatus && {approvalStatus: searchQuery.approvalStatus}),
            ...(userRole !== "ADMIN" && {published: true, showcase: {publishedDate: {lt: new Date()}}}),
        },
        include: {
            showcase: true,
            categories: {
                include: {category: true}
            },
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

    let queryCategoryIds: string[] = []
    if (searchQuery.category) {
        queryCategoryIds = searchQuery.category.split(",")
    }

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

    if (queryCategoryIds.length > 0) {
        filteredRecords = filteredRecords.filter(r => {
            for (const c of r.categories) {
                if (queryCategoryIds.includes(c.categoryId)) return true
            }
            return false
        })
    }

    if (searchQuery.searchTerm) {
        const fuse = new Fuse(filteredRecords, {
            useTokenSearch: true,
            ignoreLocation: true,
            ignoreDiacritics: true,
            fieldNormWeight: 0.7,
            threshold: 0.8,
            includeScore: true,
            keys: [
                { name: "name", weight: 5 },
                { name: "subtitle", weight: 3 },
                { name: "description", weight: 1 },
                { name: "developers", weight: 1 },
                { name: "categories.category.name", weight: 3 },
            ],
        });

        filteredRecords = fuse
            .search(searchQuery.searchTerm)
            .filter(r => r.score !== undefined && r.score <= SEARCH_SCORE_CUTOFF)
            .map(r => r.item);
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
            totalResults: resultCount,
            heroIds: []
        }
    } satisfies ProjectSearchResponse)
})

projectRouterGet.get("/:projectSlug", async (c) => {
    const projectSlug = c.req.param("projectSlug").toLowerCase()
    const slugRecord = await db.projectSlug.findUnique({
            where: {
                slug: projectSlug
            },
            include: {
                project: {
                    include: {
                        showcase: true,
                        media: true,
                        categories: {
                            include: {
                                category: true
                            }
                        },
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

projectRouterGet.get("/id/:projectId", needsAuth, async (c) => {
    const projectId = c.req.param("projectId")
    try {
        const record = await db.project.findUnique({
            where: {id: projectId},
            include: {
                media: true,
                categories: {
                    include: {category: true}
                },
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

projectRouterGet.get("/id/:projectId/slug", needsAuth, async (c) => {
    const projectId = c.req.param("projectId")
    try {
        const record = await db.project.findUnique({
            where: {
                id: projectId
            },
            include: {
                slugs: {
                    orderBy: {assignedDate: "desc"}
                }
            }
        })
        if (!record) return c.json({error: "Project not found"}, 404)

        return c.json({slugs: record.slugs} satisfies ProjectGetSlugsResponse, 200)

    } catch (e) {
        return c.json({error: "Internal server error"}, 500)
    }
})

