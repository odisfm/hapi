import {createHono} from "../helpers/createHono";
import {db} from "@hapi/shared"
import {filterShowcase} from "../utils/filters/filterShowcase.js";
import {
    type ProjectDetailsAdminResponse,
    type ShowcaseAdminDetailsResponse,
    type ShowcaseFeaturedResponse,
    type ShowcaseListResponse, type ShowcasePublicDetailsResponse
} from "@hapi/shared/types/apiResponses"
import type {ShowcaseAdminType} from "@hapi/shared/types/showcase";
import {needsAuth} from "../middleware/needsAuth";
import {addYears} from "date-fns";
import {UpdateShowcaseRequestSchema} from "@hapi/shared/types/apiRequests";
import {Prisma} from "@hapi/shared/prisma/client";

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
                        slugs: {
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
            },
            include: {
                _count: {
                    select: { projects: true },
                },
            },
        })
        return c.json({showcases: records} satisfies ShowcaseListResponse, 200)
    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})

showcaseRouter.get(":showcaseId", async (c) => {
    const user = c.get("user")
    const userRole = user?.role || null
    const showcaseId = c.req.param("showcaseId")
    try {
        const record = await db.showcase.findUnique({
            where: {
                id: showcaseId,
                ...(userRole !== "ADMIN" && { publishedDate: { lt: new Date() } }),
            },
            include: {
                projects: {
                    where: {
                        ...(userRole !== "ADMIN" && { published: true }),
                    },
                    include: {
                        slugs: {
                            take: 1,
                            orderBy: {
                                assignedDate: "desc"
                            }
                        },
                        media: true,
                        category: true,
                        showcase: true
                    }
                }
            }
        });
        if (!record) {
            return c.json({error: `No showcase with id ${showcaseId}`}, 404)
        }

        const filteredRecord = filterShowcase(record, userRole)

        if (userRole === "ADMIN") {
            return c.json({
                showcase: filteredRecord as ShowcaseAdminType
            } satisfies ShowcaseAdminDetailsResponse, 200)
        } else {
            return c.json({
                showcase: filteredRecord
            } satisfies ShowcasePublicDetailsResponse, 200)
        }


    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server errror"}, 500)
    }
})

showcaseRouter.post("", needsAuth, async (c) => {
    const user = c.get("user")!
    if (user.role !== "ADMIN") {
        return c.json({error: "Not authorised"}, 403)
    }
    try {
        const record = await db.showcase.create({
            data: {
                year: addYears(new Date(), 1).getFullYear(),
                semester: 0,
                description: "",
                name: "",
                publishedDate: null
            }
        })
        const showcase = filterShowcase({...record, projects: []}, user.role) as ShowcaseAdminType

        return c.json({
            showcase: showcase
        } satisfies ShowcaseAdminDetailsResponse, 200)
    } catch (e) {
        return c.json({error: "Internal server error"}, 500)
    }
})

showcaseRouter.patch("/", needsAuth, async (c) => {
    const user = c.get("user")!
    if (user.role !== "ADMIN") {
        return c.json({error: "Not authorised"}, 403)
    }
    let update
    try {
        update = UpdateShowcaseRequestSchema.parse(await c.req.json())
    } catch (e) {
        console.error(e)
        return c.json({error: "Malformed input"}, 400)
    }
    try {
        const record = await db.showcase.update({
            where: {id: update.showcase.id},
            data: {
                ...update.showcase
            }
        })

        return c.json({}, 200)
    } catch (e) {
        console.error(e)
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            return c.json({error: `Existing showcase called ${update.showcase.name} with year ${update.showcase.year} and semester ${update.showcase.semester}`})
        }
        return c.json({error: "Internal server error"}, 500)
    }
})

showcaseRouter.delete("/:showcaseId", needsAuth, async (c) => {
    const user = c.get("user")!
    if (user.role !== "ADMIN") {
        return c.json({error: "Not authorised"}, 403)
    }
    const showcaseId = c.req.param("showcaseId")
    try {
        await db.showcase.delete({
            where: {id: showcaseId},
        })
        return c.json({}, 200)
    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})
