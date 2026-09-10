import {Hono} from 'hono'
import {db} from "@hapi/shared"
import {filterShowcase} from "../utils/filters/filterShowcase.js";
import {type ShowcaseFeaturedResponse} from "@hapi/shared/src/types/apiResponses.js"

const NUM_FEATURED_SHOWCASES = 3
const NUM_FEATURED_PROJECTS = 9

export const showcaseRouter = new Hono()

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
        // todo: get user role
        let userRole = null
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
