import {createHono} from "../helpers/createHono";
import {db} from "@hapi/shared"
import {filterShowcase} from "../utils/filters/filterShowcase.js";
import {type ShowcaseFeaturedResponse, type ShowcaseListResponse} from "@hapi/shared/types/apiResponses"

const NUM_FEATURED_SHOWCASES = 3
const NUM_FEATURED_PROJECTS = 9

export const showcaseRouter = createHono()

showcaseRouter.get("featured", async (c) => {
        let showcaseRecords = await db.showcase.findMany({
            where: {
                publishedDate: {
                    lt: new Date(),
                }
            },
            take: NUM_FEATURED_SHOWCASES,
            include: {
                projects: {
                    where: {
                      published: true
                    },
                    take: NUM_FEATURED_PROJECTS,
                    include: {
                        media: true,
                        category: true,
                        showcase: true,
                        ProjectSlug: {
                            take: 1,
                            orderBy: {
                                assignedDate: "desc"
                            }
                        }
                    },
                    orderBy: {
                        order: "asc"
                    }
                }
            }
        })
        const userRole = c.get("user")?.role || null
        if (userRole !== "ADMIN") {
            const now = new Date()
            showcaseRecords = showcaseRecords.filter(s => {
                return s.publishedDate && s.publishedDate < now
            })
        }
        let showcases = showcaseRecords.map(s => filterShowcase(s, userRole))


        return c.json({
            showcases: showcases
        } satisfies ShowcaseFeaturedResponse);
    }
)

showcaseRouter.get("all", async (c) => {
    const user = c.get("user")
    try {
        const records = await db.showcase.findMany({
            where: {
                publishedDate: {
                    ...(user?.role !== "ADMIN" && {
                        lt: new Date(),
                        not: null,
                    }),
                },
            }
        })
        return c.json({showcases: records} satisfies ShowcaseListResponse, 200)
    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})
