import { db } from "@hapi/shared";
import {createHono} from "../helpers/createHono";
import type {CategoryResponse} from "@hapi/shared/types/apiResponses";
import {needsAuth} from "../middleware/needsAuth";
import {CategoryCreateRequestSchema, CategoryUpdateRequestSchema} from "@hapi/shared/types/apiRequests";
import {Prisma} from "@hapi/shared/prisma/client";

export const categoryRouter = createHono()

async function categoryNameExists(newName: string) {
    const existingRecords = await db.category.findMany()
    const existingNames = existingRecords.map((record) => record.name.toLowerCase())
    return existingNames.includes(newName)
}

categoryRouter.get("/", async (c) => {
    const records = await db.category.findMany({
        orderBy: {
            name: "asc"
        },
        include: {
            _count: {
                select: {
                    projects: {
                        where: {
                            projectVersion: {
                                submissionStatus: "APPROVED",
                                project: {
                                    published: true,
                                    showcase: {
                                        publishedDate: { lte: new Date() },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    })

    const categories = records.map((r) => {
        const {_count, ...c} = r
        return {
            ...c,
            projectCount: _count.projects
        }
    })

    return c.json({categories} satisfies CategoryResponse, 200)
})

categoryRouter.post("/", needsAuth, async (c) => {
    const user = c.get("user")!
    if (user.role !== "ADMIN") {
        return c.json({error: "Unauthorised"}, 403)
    }
    let body
    try {
        body = CategoryCreateRequestSchema.parse(await c.req.json())
    } catch (e) {
        console.error(e)
        return c.json({error: "Malformed request"}, 400)
    }

    if (await categoryNameExists(body.name)) {
        return c.json({error: `Already category called "${body.name}"`}, 400)
    }
    await db.category.create({
        data: {
            name: body.name
        }
    })

    return c.json({}, 200)
})

categoryRouter.patch("/:categoryId", needsAuth, async (c) => {
    const user = c.get("user")!
    const id = c.req.param("categoryId")
    if (user.role !== "ADMIN") {
        return c.json({error: "Unauthorised"}, 403)
    }
    let body
    try {
        body = CategoryUpdateRequestSchema.parse(await c.req.json())
    } catch (e) {
        console.error(e)
        return c.json({error: "Malformed request"}, 400)
    }

    if (body.name && await categoryNameExists(body.name)) {
        return c.json({error: `Already category called "${body.name}"`}, 400)
    }

    try {
        await db.category.update({
            where: {
                id: id
            },
            data: {
                ...body
            }
        })
    } catch (e) {
        console.error(e)
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            return c.json({error: "Not found"}, 404)
        }
        return c.json({error: "Internal server error"}, 500)
    }

    return c.json({}, 200)
})

categoryRouter.delete("/:categoryId", needsAuth, async (c) => {
    const user = c.get("user")!
    const id = c.req.param("categoryId")
    if (user.role !== "ADMIN") {
        return c.json({error: "Unauthorised"}, 403)
    }
    try {
        await db.category.delete({where: {id}})
    } catch (e) {
        console.error(e)
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            return c.json({error: "Not found"}, 404)
        }
        return c.json({error: "Internal server error"}, 500)
    }

    return c.json({}, 200)
})
