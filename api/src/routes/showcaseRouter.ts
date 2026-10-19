import {createHono} from "../helpers/createHono";
import {db} from "@hapi/shared"
import {filterShowcase} from "../utils/filters/filterShowcase.js";
import {
    type ShowcaseAdminDetailsResponse,
    type ShowcaseGetSlugsResponse,
    type ShowcaseListResponse, type ShowcasePublicDetailsResponse
} from "@hapi/shared/types/apiResponses"
import type {ShowcaseAdminType} from "@hapi/shared/types/showcase";
import {needsAuth} from "../middleware/needsAuth";
import {addDays, addYears} from "date-fns";
import {AlterProjectSlugRequestSchema, UpdateShowcaseRequestSchema} from "@hapi/shared/types/apiRequests";
import {Prisma} from "@hapi/shared/prisma/client";
import {createUuid} from "@hapi/client/src/utils/misc";
import {getShowcaseName} from "@hapi/shared/utils/getShowcaseName";
import type {ShowcaseGetPayload, ShowcaseInclude} from "@hapi/shared/prisma/models/Showcase";
import type {ShowcaseSlugGetPayload} from "@hapi/shared/prisma/models/ShowcaseSlug";
import {getConnInfo} from "../helpers/getConnInfo";

export const showcaseRouter = createHono()

showcaseRouter.get("all", async (c) => {
    const user = c.get("user")
    try {
        const records = await db.showcase.findMany({
            where: {
                publishedDate: {
                    ...(!user?.role && {
                        lt: new Date(),
                        not: null,
                    }),
                },
            },
            include: {
                _count: {
                    select: { projects: true },
                },
                slugs: {
                    take: 1,
                    orderBy: {
                        assignedDate: "desc"
                    }
                }
            },
        })
        return c.json({showcases: records} satisfies ShowcaseListResponse, 200)
    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})

const getShowcaseInclusion = {
    projects: {
        where: {
            published: true
        },
        include: {
            showcase: true,
            slugs: {
                take: 1,
                orderBy: {
                    assignedDate: "desc"
                }
            },
            versions: {
                take: 1,
                where: {
                    submissionStatus: "APPROVED"
                },
                include: {
                    media: {include: {media: true}},
                    categories: {include: {category: true}}
                }
            }
        }
    }
} satisfies ShowcaseInclude<any>

showcaseRouter.get(":showcaseSlug", async (c) => {
    const slug = c.req.param("showcaseSlug").toLowerCase()
    let record = await db.showcaseSlug.findUnique({
        where: {
            slug: slug,
        },
        include: {
            showcase: {
                include: getShowcaseInclusion
            }
        }
    })

    let showcaseRecord: ShowcaseGetPayload<{
        include: typeof getShowcaseInclusion
    }>

    if (!record) {
        const recordById = await db.showcase.findUnique({
            where: {id: slug},
            include: getShowcaseInclusion
        })
        if (!recordById) {
            return c.json({}, 404)
        }
        showcaseRecord = recordById
    } else {
        showcaseRecord = record.showcase
    }


    if (!showcaseRecord.publishedDate || showcaseRecord.publishedDate > new Date()) {
        return c.json({}, 404)
    }

    const showcase = filterShowcase(showcaseRecord, null)

    const connInfo = getConnInfo(c)
    const ipAddress = connInfo.remote.address
    const viewed24HoursRecord = await db.showcaseView.findFirst({
        where: {
            showcaseId: showcase.id,
            viewDate: {
                gt: addDays(new Date(), -1)
            },
            ipAddress
        }
    })
    if (!viewed24HoursRecord) {
        await db.showcaseView.create({
            data: {
                showcaseId: showcase.id,
                viewDate: new Date().toISOString(),
                ipAddress
            }
        })
    }

    return c.json({
        showcase
    } satisfies ShowcasePublicDetailsResponse, 200)

})

showcaseRouter.get("id/:showcaseId", async (c) => {
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
                        showcase: true,
                        slugs: {
                            take: 1,
                            orderBy: {
                                assignedDate: "desc"
                            }
                        },
                        versions: {
                            take: 1,
                            where: {
                                submissionStatus: "APPROVED"
                            },
                            include: {
                                media: {include: {media: true}},
                                categories: {include: {category: true}}
                            }
                        }
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

showcaseRouter.get("id/:showcaseId/slug", needsAuth, async (c) => {
    if (c.get("user")!.role !== "ADMIN") {
        return c.json({error: "Not authorised"}, 403)
    }
    const showcaseId = c.req.param("showcaseId")
    try {
        const record = await db.showcaseSlug.findMany({
            where: {
                showcaseId: showcaseId,
            },
            orderBy: {
                assignedDate: "desc"
            }
        })

        return c.json(
            {
                slugs: record
            } satisfies ShowcaseGetSlugsResponse, 200)
    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})

showcaseRouter.post("id/:showcaseId/slug", needsAuth, async (c) => {
    if (c.get("user")!.role !== "ADMIN") {
        return c.json({error: "Not authorised"}, 403)
    }
    const showcaseId = c.req.param("showcaseId")
    let body
    try {
        body = AlterProjectSlugRequestSchema.parse(await c.req.json())
    } catch {
        return c.json({error: "Malformed data"}, 400)
    }
    try {
        await db.showcaseSlug.create({
            data: {
                slug: body.slug.toLowerCase(),
                showcaseId: showcaseId,
                assignedDate: new Date()
            }
        })
        return c.json({}, 200)
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            const existingRecord = await db.showcaseSlug.findUnique({
                where: {slug: body.slug},
                include: {showcase: true}
            })
            return c.json(
                {error: `Slug taken by showcase with name ${getShowcaseName(existingRecord!.showcase)}`}
            , 400)
        } else {
            console.error(e)
            return c.json({error: "Internal server error"}, 500)
        }
    }
})

showcaseRouter.delete("id/:showcaseId/slug", needsAuth, async (c) => {
    if (c.get("user")!.role !== "ADMIN") {
        return c.json({error: "Not authorised"}, 403)
    }
    const showcaseId = c.req.param("showcaseId")
    let body
    try {
        body = AlterProjectSlugRequestSchema.parse(await c.req.json())
    } catch {
        return c.json({error: "Malformed data"}, 400)
    }
    try {
        await db.showcaseSlug.delete({
            where: {slug: body.slug.toLowerCase(), showcaseId}
        })
        return c.json({}, 200)
    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})

showcaseRouter.post("", needsAuth, async (c) => {
    const user = c.get("user")!
    if (user.role !== "ADMIN") {
        return c.json({error: "Not authorised"}, 403)
    }
    try {
        const id = createUuid()
        const record = await db.showcase.create({
            data: {
                id: id,
                year: addYears(new Date(), 1).getFullYear(),
                semester: 0,
                description: "",
                name: id, // will violate unique constraint if admin makes showcase, doesn't update, makes new
                publishedDate: null
            }
        })
        const showcase = filterShowcase({...record, projects: []}, user.role) as ShowcaseAdminType

        return c.json({
            showcase: showcase
        } satisfies ShowcaseAdminDetailsResponse, 200)
    } catch (e) {
        console.error(e)
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
        console.log(update)
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

showcaseRouter.delete("/id/:showcaseId", needsAuth, async (c) => {
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
