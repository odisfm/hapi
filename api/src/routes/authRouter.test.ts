import { describe, test, expect, vi, beforeEach } from "vitest"
import * as z from "zod"

vi.mock("@hapi/shared", () => import("../test/mockDb"))

vi.mock("../helpers/sendEmail", () => ({
    sendEmail: vi.fn(async () => {})
}))

import { db } from "@hapi/shared"
import {checkPassword, hashPassword} from "../helpers/password";
import {sendEmail} from "../helpers/sendEmail";
import {Prisma} from "@hapi/shared/prisma/client";
import {authRouter} from "./authRouter";
import {LoginSuccessResponseSchema} from "@hapi/shared/types/apiResponses";
import {app} from "../index";
import {makeSession, makeUser} from "../test/fixtures";
import {resetDb} from "../test/mockDb";
import {loginAs} from "../test/auth";

beforeEach(() => {
    resetDb()
    vi.mocked(sendEmail).mockClear()
    vi.spyOn(console, "error").mockImplementation(() => {})
})

function post(path: string, body: unknown, headers: Record<string, string> = {}) {
    return app.request(path, {method: "POST", headers, body: JSON.stringify(body)})
}

describe("login", () => {
    test("accepts valid credentials", async () => {
        const inputPassword = "Password1!"
        const passwordHash = await hashPassword(inputPassword)
        const user = makeUser({email: "test@example.com", password: passwordHash, role: "ADMIN"})
        vi.mocked(db.user.findUnique).mockResolvedValue(user)
        vi.mocked(db.session.create).mockResolvedValue(makeSession({user}))
        const res = await authRouter.request("/login", {
            method: "POST",
            body: JSON.stringify({
                email: "test@example.com",
                password: inputPassword
            })
        })
        expect(res.status).toBe(200)
        expect(z.validate(LoginSuccessResponseSchema, await res.json())).toBe(true)
    })

    test("rejects invalid password", async () => {
        vi.mocked(db.user.findUnique).mockResolvedValue(makeUser({
            email: "test@example.com",
            password: await hashPassword("Password2@"),
            role: "ADMIN",
        }))
        const res = await authRouter.request("/login", {
            method: "POST",
            body: JSON.stringify({
                email: "test@example.com",
                password: "Password1!"
            })
        })
        expect(res.status).toBe(401)
        const json = await res.json() as {error: string}
        expect(json.error).toBe("Invalid credentials")
    })

    test("rejects invalid email", async () => {
        vi.mocked(db.user.findUnique).mockResolvedValue(null)
        const res = await authRouter.request("/login", {
            method: "POST",
            body: JSON.stringify({
                email: "fakeguy@example.com",
                password: "Password1!"
            })
        })
        expect(res.status).toBe(401)
    })
})

describe("create new user", () => {
    test("admin user can create new user", async () => {
        const headers = loginAs("ADMIN")
        vi.mocked(db.user.create).mockResolvedValue(makeUser({role: "ADMIN"}))
        const res = await app.request("/auth/create", {
            method: "POST",
            body: JSON.stringify({
                name: "Other user",
                email: "b@example.com",
                role: "ADMIN"
            }),
            headers,
        })
        expect(res.status).toBe(200)
    })

    test("student user can't create new user", async () => {
        const res = await app.request("/auth/create", {
            method: "POST",
            body: JSON.stringify({}),
            headers: loginAs("STUDENT"),
        })
        expect(res.status).toBe(403)
    })
})

describe("/me", () => {
    test("works", async () => {
        const res = await app.request("/auth/me", {
            method: "GET",
            headers: loginAs("ADMIN"),
        })
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(z.validate(LoginSuccessResponseSchema, json)).toBe(true)
    })
})

describe("login when already logged in", () => {
    test("returns the current user without checking credentials", async () => {
        const res = await post("/auth/login", {}, loginAs("STUDENT", {email: "me@example.com"}))
        expect(res.status).toBe(200)
        expect(await res.json()).toMatchObject({user: {email: "me@example.com"}})
        expect(db.user.findUnique).not.toHaveBeenCalled()
    })
})

describe("login input", () => {
    test("rejects malformed input", async () => {
        const res = await post("/auth/login", {email: "not-an-email"})
        expect(res.status).toBe(400)
    })

    test("looks up the email case-insensitively", async () => {
        vi.mocked(db.user.findUnique).mockResolvedValue(null)
        await post("/auth/login", {email: "Test@Example.com", password: "Password1!"})
        expect(db.user.findUnique).toHaveBeenCalledWith({where: {email: "test@example.com"}})
    })
})

describe("logout", () => {
    test("deletes only the current session and clears the cookie", async () => {
        const headers = loginAs("STUDENT")
        const sessionId = headers.Cookie.split("=")[1]
        vi.mocked(db.session.delete).mockResolvedValue(makeSession())
        const res = await post("/auth/logout", {}, headers)
        expect(res.status).toBe(200)
        expect(db.session.delete).toHaveBeenCalledWith({where: {id: sessionId}})
        expect(res.headers.get("Set-Cookie")).toMatch(/sessionId=;/)
    })

    test("still clears the cookie if the session can't be deleted", async () => {
        vi.mocked(db.session.delete).mockRejectedValue(new Error("gone"))
        const res = await post("/auth/logout", {}, loginAs("STUDENT"))
        expect(res.status).toBe(200)
        expect(res.headers.get("Set-Cookie")).toMatch(/sessionId=;/)
    })

    test("logout/all deletes every session belonging to the user", async () => {
        vi.mocked(db.session.deleteMany).mockResolvedValue({count: 3})
        const res = await post("/auth/logout/all", {}, loginAs("STUDENT", {id: "user-1"}))
        expect(res.status).toBe(200)
        expect(db.session.deleteMany).toHaveBeenCalledWith({where: {userId: "user-1"}})
    })
})

describe("change password", () => {
    test("rejects a weak password with the reasons", async () => {
        const res = await post("/auth/password", {password: "short"}, loginAs("STUDENT"))
        expect(res.status).toBe(400)
        const json = await res.json() as {errors: string[]}
        expect(json.errors).toContain("Must contain an uppercase letter")
        expect(db.user.update).not.toHaveBeenCalled()
    })

    test("rejects malformed input", async () => {
        const res = await post("/auth/password", {}, loginAs("STUDENT"))
        expect(res.status).toBe(400)
    })

    test("stores a hash of the new password and logs out other sessions", async () => {
        const headers = loginAs("STUDENT", {id: "user-1"})
        const sessionId = headers.Cookie.split("=")[1]
        vi.mocked(db.user.update).mockResolvedValue(makeUser())
        vi.mocked(db.session.deleteMany).mockResolvedValue({count: 1})
        const res = await post("/auth/password", {password: "NewPassword1!"}, headers)
        expect(res.status).toBe(200)

        const {data} = vi.mocked(db.user.update).mock.calls[0][0]
        expect(data.password).not.toBe("NewPassword1!")
        expect(await checkPassword("NewPassword1!", data.password as string)).toBe(true)
        expect(db.session.deleteMany).toHaveBeenCalledWith({
            where: {userId: "user-1", id: {not: sessionId}},
        })
    })
})

describe("create user", () => {
    test("lowercases the email, hashes a generated password and emails it to the user", async () => {
        vi.mocked(db.user.create).mockResolvedValue(makeUser())
        const res = await post("/auth/create", {name: "New", email: "New@Example.com", role: "STUDENT"}, loginAs("ADMIN"))
        expect(res.status).toBe(200)

        const {data} = vi.mocked(db.user.create).mock.calls[0][0]
        expect(data.email).toBe("new@example.com")
        const emailBody = vi.mocked(sendEmail).mock.calls[0][2]
        const plainPassword = emailBody.match(/Password: (.+)$/)![1]
        expect(await checkPassword(plainPassword, data.password)).toBe(true)
    })

    test("409s when the email is taken", async () => {
        vi.mocked(db.user.create).mockRejectedValue(
            new Prisma.PrismaClientKnownRequestError("dupe", {code: "P2002", clientVersion: "test"})
        )
        const res = await post("/auth/create", {name: "New", email: "new@example.com", role: "STUDENT"}, loginAs("ADMIN"))
        expect(res.status).toBe(409)
        expect(sendEmail).not.toHaveBeenCalled()
    })

    test("rejects malformed input", async () => {
        const res = await post("/auth/create", {name: "New", email: "new@example.com", role: "WIZARD"}, loginAs("ADMIN"))
        expect(res.status).toBe(400)
    })
})

describe("batch create users", () => {
    test("skips users whose email already exists", async () => {
        vi.mocked(db.user.findMany).mockResolvedValue([makeUser({email: "old@example.com"})])
        vi.mocked(db.user.createMany).mockResolvedValue({count: 1})
        const res = await post("/auth/create/batch", {
            users: [
                {name: "Old", email: "old@example.com", role: "STUDENT"},
                {name: "New", email: "new@example.com", role: "STUDENT"},
            ],
        }, loginAs("ADMIN"))
        expect(res.status).toBe(200)

        const {data} = vi.mocked(db.user.createMany).mock.calls[0][0]!
        expect(data).toEqual([expect.objectContaining({email: "new@example.com"})])
        expect(data).toEqual([expect.not.objectContaining({plainPassword: expect.anything()})])
        expect(sendEmail).toHaveBeenCalledOnce()
        expect(sendEmail).toHaveBeenCalledWith("new@example.com", expect.any(String), expect.any(String))
    })

    test("rejects malformed input", async () => {
        const res = await post("/auth/create/batch", {users: [{email: "x"}]}, loginAs("ADMIN"))
        expect(res.status).toBe(400)
    })
})

describe("forgot password", () => {
    test("returns 200 without sending anything for an unknown email", async () => {
        vi.mocked(db.user.findUnique).mockResolvedValue(null)
        const res = await post("/auth/forgot-password", {email: "nobody@example.com"})
        expect(res.status).toBe(200)
        expect(sendEmail).not.toHaveBeenCalled()
    })

    test("rejects a missing email", async () => {
        const res = await post("/auth/forgot-password", {})
        expect(res.status).toBe(400)
    })

    test("invalidates previous requests and emails a code that matches the stored hash", async () => {
        const user = makeUser({id: "user-1", email: "me@example.com"})
        vi.mocked(db.user.findUnique).mockResolvedValue(user)
        vi.mocked(db.passwordResetRequest.updateMany).mockResolvedValue({count: 1})
        vi.mocked(db.passwordResetRequest.create).mockResolvedValue({} as never)
        const res = await post("/auth/forgot-password", {email: "me@example.com"})
        expect(res.status).toBe(200)

        expect(db.passwordResetRequest.updateMany).toHaveBeenCalledWith({
            where: {userId: "user-1"}, data: {expiry: null},
        })
        const {data} = vi.mocked(db.passwordResetRequest.create).mock.calls[0][0]
        expect(data.expiry).toBeInstanceOf(Date)
        expect((data.expiry as Date).getTime()).toBeGreaterThan(Date.now())
        const emailBody = vi.mocked(sendEmail).mock.calls[0][2]
        const code = emailBody.match(/code is:\n\n(\S+)/)![1]
        expect(await checkPassword(code, data.code)).toBe(true)
    })
})

describe("verify password reset code", () => {
    async function userWithResetCode(code: string | null) {
        return {
            ...makeUser({id: "user-1", email: "me@example.com"}),
            passwordResetRequest: code === null ? [] : [{code: await hashPassword(code)}],
        } as never
    }

    test("logs the user in and flags them to reset their password", async () => {
        vi.mocked(db.user.findUnique).mockResolvedValue(await userWithResetCode("ABCD2345"))
        vi.mocked(db.session.create).mockResolvedValue(makeSession({id: "new-session"}))
        vi.mocked(db.user.update).mockResolvedValue(makeUser())
        const res = await post("/auth/forgot-password/verify", {email: "me@example.com", code: "abcd2345"})
        expect(res.status).toBe(200)
        expect(await res.json()).toMatchObject({user: {needsPasswordReset: true}})
        expect(res.headers.get("Set-Cookie")).toMatch(/sessionId=new-session/)
        expect(db.user.update).toHaveBeenCalledWith({where: {id: "user-1"}, data: {needsPasswordReset: true}})
    })

    test("rejects a wrong code", async () => {
        vi.mocked(db.user.findUnique).mockResolvedValue(await userWithResetCode("ABCD2345"))
        const res = await post("/auth/forgot-password/verify", {email: "me@example.com", code: "WRONG123"})
        expect(res.status).toBe(400)
        expect(db.session.create).not.toHaveBeenCalled()
    })

    test("rejects when there is no unexpired request", async () => {
        vi.mocked(db.user.findUnique).mockResolvedValue(await userWithResetCode(null))
        const res = await post("/auth/forgot-password/verify", {email: "me@example.com", code: "ABCD2345"})
        expect(res.status).toBe(400)
    })

    test("rejects an unknown email", async () => {
        vi.mocked(db.user.findUnique).mockResolvedValue(null)
        const res = await post("/auth/forgot-password/verify", {email: "nobody@example.com", code: "ABCD2345"})
        expect(res.status).toBe(400)
    })

    test("rejects missing fields", async () => {
        const res = await post("/auth/forgot-password/verify", {email: "me@example.com"})
        expect(res.status).toBe(400)
    })
})

describe("list users", () => {
    test("doesn't expose password hashes", async () => {
        vi.mocked(db.user.findMany).mockResolvedValue([makeUser({password: "salt:hash"})])
        const res = await app.request("/auth/users", {headers: loginAs("ADMIN")})
        expect(res.status).toBe(200)
        const json = await res.json() as {users: object[]}
        expect(json.users).toHaveLength(1)
        expect(json.users[0]).not.toHaveProperty("password")
        expect(json.users[0]).not.toHaveProperty("id")
    })
})

describe("delete user", () => {
    function deleteUser(email: string | undefined, headers: Record<string, string>) {
        return app.request("/auth/user", {method: "DELETE", headers, body: JSON.stringify({email})})
    }

    test("admins can't delete their own account", async () => {
        const headers = loginAs("ADMIN", {id: "admin-1"})
        vi.mocked(db.user.findUnique).mockResolvedValue(makeUser({id: "admin-1"}))
        const res = await deleteUser("admin@example.com", headers)
        expect(res.status).toBe(400)
        expect(db.user.delete).not.toHaveBeenCalled()
    })

    test("deletes another user", async () => {
        const headers = loginAs("ADMIN", {id: "admin-1"})
        vi.mocked(db.user.findUnique).mockResolvedValue(makeUser({id: "user-2"}))
        vi.mocked(db.user.delete).mockResolvedValue(makeUser())
        const res = await deleteUser("user@example.com", headers)
        expect(res.status).toBe(200)
        expect(db.user.delete).toHaveBeenCalledWith({where: {id: "user-2"}})
    })

    test("404s for an unknown email", async () => {
        const headers = loginAs("ADMIN")
        vi.mocked(db.user.findUnique).mockResolvedValue(null)
        const res = await deleteUser("nobody@example.com", headers)
        expect(res.status).toBe(404)
    })

    test("rejects a missing email", async () => {
        const res = await deleteUser(undefined, loginAs("ADMIN"))
        expect(res.status).toBe(400)
    })
})

describe("email case-insensitivity", () => {
    test("forgot-password looks up the email lowercased", async () => {
        vi.mocked(db.user.findUnique).mockResolvedValue(null)
        await post("/auth/forgot-password", {email: "Me@Example.com"})
        expect(db.user.findUnique).toHaveBeenCalledWith({where: {email: "me@example.com"}})
    })

    test("verify looks up the email lowercased", async () => {
        vi.mocked(db.user.findUnique).mockResolvedValue(null)
        await post("/auth/forgot-password/verify", {email: "Me@Example.com", code: "ABCD2345"})
        expect(db.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({where: {email: "me@example.com"}}))
    })

    test("delete user looks up the email lowercased", async () => {
        const headers = loginAs("ADMIN")
        vi.mocked(db.user.findUnique).mockResolvedValue(null)
        await app.request("/auth/user", {method: "DELETE", headers, body: JSON.stringify({email: "Me@Example.com"})})
        expect(db.user.findUnique).toHaveBeenCalledWith({where: {email: "me@example.com"}})
    })

    test("batch create lowercases emails and treats differently-cased existing emails as duplicates", async () => {
        vi.mocked(db.user.findMany).mockResolvedValue([makeUser({email: "Old@Example.com"})])
        vi.mocked(db.user.createMany).mockResolvedValue({count: 1})
        const res = await post("/auth/create/batch", {
            users: [
                {name: "Old", email: "old@example.com", role: "STUDENT"},
                {name: "New", email: "New@Example.com", role: "STUDENT"},
            ],
        }, loginAs("ADMIN"))
        expect(res.status).toBe(200)
        const {data} = vi.mocked(db.user.createMany).mock.calls[0][0]!
        expect(data).toEqual([expect.objectContaining({email: "new@example.com"})])
    })

    test.each([
        ["/auth/forgot-password", {email: 123}],
        ["/auth/forgot-password/verify", {email: ["a"], code: "ABCD2345"}],
    ])("%s rejects a non-string email with 400", async (path, body) => {
        const res = await post(path, body)
        expect(res.status).toBe(400)
    })
})
