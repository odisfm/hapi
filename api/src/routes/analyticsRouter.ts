import {createHono} from "../helpers/createHono";
import {needsAuth} from "../middleware/needsAuth";
import {AnalyticsProjectRequestSchema, AnalyticsShowcaseSchema} from "@hapi/shared/types/apiRequests";
import {db} from "@hapi/shared";
import type {AnalyticsProjectResponse, AnalyticsShowcaseResponse} from "@hapi/shared/types/apiResponses";
import {filterProjectPreview} from "../utils/filters/filterProject";

export const analyticsRouter = createHono()


analyticsRouter.get("/example", needsAuth, async (c) => {
    const user = c.get("user")!
    if (user.role !== "ADMIN") {
        return c.json({error: "Unauthorised"}, 403)
    }

    return c.json({}, 200)
})

analyticsRouter.get("/showcase", needsAuth, async (c) => {
    const user = c.get("user")!
    if (user.role !== "ADMIN") {
        return c.json({error: "Unauthorised"}, 403)
    }
    let query
    try {
        query = AnalyticsShowcaseSchema.parse(c.req.query())
    } catch (e) {
        console.error(e)
        return c.json({error: "Malformed request"}, 400)
    }
    const records = await db.showcase.findMany({
        ...(query.limit && {take: query.limit}),
        include: {
            _count: {
                select: {
                    views: {
                        where: {
                            viewDate: {
                                ...(query.endDate && {lt: query.endDate}),
                                ...(query.startDate && {gt: query.startDate})
                            }
                        }
                    },
                    projects: true,
                    media: {include: {media: true}}
                }
            },
            slugs: {
                take: 1,
                orderBy: {
                    assignedDate: "desc"
                }
            }
        }
    })

    let data = records.map(({ _count, ...showcase }) => ({
        views: _count.views,
        showcase: {
            ...showcase,
            _count: { projects: _count.projects },
        },
    })).sort((a, b) => {
        return b.views - a.views
    })

    if (query.limit) {
        data = data.slice(0, query.limit)
    }

    return c.json({analytics: data} satisfies AnalyticsShowcaseResponse, 200)
})

analyticsRouter.get("/project", needsAuth, async (c) => {
    const user = c.get("user")!
    if (user.role !== "ADMIN") {
        return c.json({error: "Unauthorised"}, 403)
    }
    let query
    try {
        query = AnalyticsProjectRequestSchema.parse(c.req.query())
    } catch (e) {
        console.error(e)
        return c.json({error: "Malformed request"}, 400)
    }
    const records = await db.project.findMany({
        include: {
            slugs: {
                take: 1,
                orderBy: {
                    assignedDate: "desc"
                }
            },
            showcase: true,
            versions: {
                include: {
                    categories: {include: {category: true}},
                    media: {include: {media: true}}
                }
            },
            _count: {
                select: {
                    views: {
                        where: {
                            viewDate: {
                                ...(query.endDate && {lt: query.endDate}),
                                ...(query.startDate && {gt: query.startDate})
                            }
                        }
                    },
                }
            }
        }
    })

    let data = records.map((r) => {
        return {
            views: r._count.views,
            project: filterProjectPreview(r)
        }
    }).sort((a, b) => {
        return b.views - a.views
    })

    if (query.limit) {
        data = data.slice(0, query.limit)
    }

    return c.json({analytics: data} satisfies AnalyticsProjectResponse, 200)
})
