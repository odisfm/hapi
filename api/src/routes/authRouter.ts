import {createHono} from "../helpers/createHono";
import type {LoginSuccessResponse, PasswordChangeFailureResponse, UserDetails} from "@hapi/shared/types/apiResponses";
import {CreateUserRequestSchema, LoginRequestSchema, PasswordChangeRequestSchema} from "@hapi/shared/types/apiRequests";
import {db} from "@hapi/shared";
import {checkPassword, hashPassword} from "../helpers/password";
import {SESSION_EXPIRY} from "../consts";
import {deleteCookie, setCookie} from "hono/cookie";
import {authCookieOptions} from "../utils/cookieOptions";
import { needsAuth } from "../middleware/needsAuth";
import {PasswordSchema} from "@hapi/shared/types/password";
import * as z from "zod";
import type {UserRole} from "@hapi/shared/prisma/enums.js";
import {Prisma} from "@hapi/shared/prisma/client.js";

export const authRouter = createHono()

authRouter.post("/login", async (c) => {
    const user = c.get("user")
    if (user) {
        return c.json(
            {
                user:
                    {name: user.name, email: user.email}
            } satisfies LoginSuccessResponse, 200)
    }

    let body
    try {
        body = LoginRequestSchema.parse(await c.req.json())
    } catch (e) {
        return c.json({error: "Malformed input"}, 400)
    }

    try {
        const userRecord = await db.user.findUnique({
            where: {email: body.email.toLowerCase()}
        })
        const credentialsValid = Boolean(userRecord && await checkPassword(body.password, userRecord.password))
        if (!credentialsValid || !userRecord) {
            return c.json({error: "Invalid credentials"}, 401)
        }

        const sessionRecord = await db.session.create({
            data: {
                userId: userRecord.id,
                expiry: new Date(Date.now() + SESSION_EXPIRY)
            }
        })

        setCookie(c, "sessionId", sessionRecord.id, authCookieOptions)

        return c.json({
            user: {
                email: userRecord.email, name: userRecord.name
            }
        } satisfies LoginSuccessResponse, 200)


    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})

authRouter.post("/logout", needsAuth, async (c) => {
    try {
        await db.session.delete({
            where: {id: c.get("sessionId")}
        })
    } catch (e) {
        console.error(e)
    }
    deleteCookie(c, "sessionId")
    return c.json({}, 200)

})

authRouter.post("/logout/all", needsAuth, async (c) => {
    try {
        await db.session.deleteMany({
            where: {userId: c.get("user")!.id}
        })
    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
    deleteCookie(c, "sessionId")
    return c.json({}, 200)

})

authRouter.post("/password", needsAuth, async (c) => {
    let body
    try {
        body = PasswordChangeRequestSchema.parse(await c.req.json())
    } catch (e) {
        return c.json({error: "Malformed input"}, 400)
    }
    let password
    try {
        password = PasswordSchema.parse(body.password)
    } catch (e) {
        if (e instanceof z.ZodError) {
            const zError = e as z.ZodError
            return c.json({
                errors: zError.issues.map(i => i.message)
            } satisfies PasswordChangeFailureResponse, 400)
        } else {
            // shouldn't happen
            return c.json({error: "Internal server error"}, 500)
        }
    }
    const passwordHash = await hashPassword(password)
    try {
        await db.user.update({
            where: {id: c.get("user")!.id},
            data: {password: passwordHash}
        })
        await db.session.deleteMany({
            where: {
                userId: c.get("user")!.id,
                id: {
                    not: c.get("sessionId")
                }
            }
        })
    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }

    return c.json({}, 200)

})

authRouter.post("/create", needsAuth, async (c) => {
    const requestingUser = c.get("user")!
    if (requestingUser.role !== "ADMIN") {
        return c.json({error: "Insufficient privileges to create user"}, 403)
    }
    let body
    try {
        body = CreateUserRequestSchema.parse(await c.req.json())
    } catch (e) {
        if (e instanceof z.ZodError) {
            return c.json({
                error: "Malformed input"}, 400)
        } else {
            // shouldn't happen
            console.error(e)
            return c.json({error: "Internal server error"}, 500)
        }
    }

    try {
        await db.user.create({
            data: {
                name: body.name,
                email: body.email.toLowerCase(),
                password: await hashPassword(body.password),
                role: body.role as UserRole
            }
        })

        return c.json({}, 200)
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if ((e as Prisma.PrismaClientKnownRequestError).code === "P2002") {
                return c.json({error: "Existing user with email"}, 409)
            } else {
                console.error(e)
                return c.json({error: "Internal server error"}, 500)
            }
        } else {
            console.error(e)
            return c.json({error: "Internal server error"}, 500)
        }
    }
})

authRouter.get("/me", needsAuth, (c) => {
    return c.json({
        user: {
            email: c.get("user")!.email, name: c.get("user")!.name
        }
    } satisfies LoginSuccessResponse, 200)
})
