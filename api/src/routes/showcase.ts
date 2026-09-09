import {Hono} from 'hono'
import {db} from "@hapi/shared"
import {filterShowcase} from "../utils/filters/filterShowcase.js";

const NUM_FEATURED_SHOWCASES = 3
const NUM_FEATURED_PROJECTS = 9

export const showcaseRouter = new Hono()

showcaseRouter.get("featured", async (c) => {
    const showcaseRecords = await db.showcase.findMany({
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
                    // todo: slugs
                    media: true,
                    category: true
                },
                orderBy: {
                    order: "asc"
                }
            }
        }
    })
    // todo: get user role

    return c.json(showcaseRecords.map(s => filterShowcase(s, null)))
    }
)
