import { Hono } from 'hono'
import { db } from "@hapi/shared"
import {filterProject, filterProjectPreview} from "../utils/filters/filterProject.js";
import {type ProjectSearchQuery} from "@hapi/shared/src/types/projectSearchQuery.js";
import type {ApprovalStatus} from "@hapi/shared/src/generated/prisma/enums.js";
import {toTsQuery} from "../utils/toTsQuery.js";

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
            ...(searchQuery.showcase && { showcaseId: searchQuery.showcase }),
            ...(searchQuery.category && { categoryId: searchQuery.category }),
            ...(searchQuery.approvalStatus && { approvalStatus: searchQuery.approvalStatus }),
        },
        ...(query.cursor && { cursor: { id: query.cursor } }),
        include: {
            showcase: true,
            category: true,
            media: true
        },
        orderBy: searchQuery.searchTerm
            ? [
                {
                    _relevance: {
                        fields: ["name", "description", "developers"],
                        search: toTsQuery(searchQuery.searchTerm),
                        sort: "desc",
                    },
                },
            ]
            : [
                { showcase: { publishedDate: "desc" } },
                { order: "asc" },
            ]
    })
    const now = new Date()

    const filteredRecords = records.filter(r => {
        if (userRole === "ADMIN") {
            return true
        }
        if (!r.showcase.publishedDate || r.showcase.publishedDate > now) {
            return false
        }
        return true
    }).map(r => filterProjectPreview(r))

    return c.json(filteredRecords)

})

projectRouter.get("/project/id/:projectId", async (c) => {
    const projectId = c.req.param("projectId")
    const record = await db.project.findUnique({
            where: {
                id: projectId
            },
            include: {
                showcase: true,
                media: true,
                category: true
            }
        }
    )
    if (!record) {
        return c.status(404)
    }
    const showcasePublic = record.showcase.publishedDate && record.showcase.publishedDate < new Date()
    const userRole = null // todo: get user role
    if (!showcasePublic && userRole !== "ADMIN") {
        return c.status(404)
    }
    const project = filterProject(record, userRole)
    return c.json(project)
})
