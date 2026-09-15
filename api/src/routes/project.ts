import { Hono } from 'hono'
import { db } from "@hapi/shared"
import {filterProject, filterProjectPreview} from "../utils/filters/filterProject.js";
import {type ProjectSearchQuery} from "@hapi/shared/src/types/projectSearchQuery.js";
import type {ApprovalStatus} from "@hapi/shared/src/generated/prisma/enums.js";
import type {ProjectDetailsResponse, ProjectSearchResponse} from "@hapi/shared/src/types/apiResponses.js";
import Fuse from "fuse.js"

const SEARCH_SCORE_CUTOFF = 0.6 // 0 - exact match, 1 - no match

export const projectRouter = new Hono()

const MAX_SEARCH_LIMIT = 20
const DEFAULT_SEARCH_LIMIT = 10

projectRouter.get("/search", async (c) => {
    const query = c.req.query()
    const searchQuery: ProjectSearchQuery = {
        searchTerm: query.searchTerm,
        cursor: query?.cursor,
        category: query?.category,
        showcase: query?.showcase,
        approvalStatus: query.approvalStatus ? query.approvalStatus as ApprovalStatus : undefined
    }
    if (query.limit) {
        try {
            searchQuery.limit = Number(query.limit)
        }
        catch {
            searchQuery.limit = DEFAULT_SEARCH_LIMIT
        }
    } else {
        searchQuery.limit = DEFAULT_SEARCH_LIMIT
    }
    searchQuery.limit = Math.min(searchQuery.limit, MAX_SEARCH_LIMIT)

    const userRole = null // todo:
    if (userRole !== "ADMIN" && searchQuery.approvalStatus) {
        searchQuery.approvalStatus = undefined
    }

    const records = await db.project.findMany({
        where: {
            ...(searchQuery.showcase && {showcaseId: searchQuery.showcase}),
            ...(searchQuery.category && {categoryId: searchQuery.category}),
            ...(searchQuery.approvalStatus && {approvalStatus: searchQuery.approvalStatus}),
        },
        include: {
            showcase: true,
            category: true,
            media: true,
            ProjectSlug: {
                take: 1,
                orderBy: {
                    assignedDate: "desc"
                }
            }
        },
        orderBy: [
            {showcase: {publishedDate: "desc"}},
            {order: "asc"},
        ]
    })
    const now = new Date()

    let filteredRecords = records.filter(r => {
        if (userRole === "ADMIN") {
            return true
        }
        if (!r.showcase.publishedDate || r.showcase.publishedDate > now) {
            return false
        }
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
    let cursorIndex: number | null = null
    if (searchQuery.cursor) {
        cursorIndex = processedRecords.findIndex(r => r.id === searchQuery.cursor);
        if (cursorIndex === -1) {
            return c.json({error: `Invalid cursor: ${searchQuery.cursor}`}, 400)
        }

        processedRecords = processedRecords.slice(cursorIndex + 1)
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
                        ProjectSlug: {
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
    if (!slugRecord) {
        return c.json({
            error: `No project found called '${projectSlug}'`
        }, 404)
    }
    const record = slugRecord.project
    const showcasePublic = record.showcase.publishedDate && record.showcase.publishedDate < new Date()
    const userRole = null // todo: get user role
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
