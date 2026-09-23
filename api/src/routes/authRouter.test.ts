import { describe, test, expect, vi, beforeEach } from "vitest"
import * as z from "zod"

vi.mock("@hapi/shared", () => ({
    db: {
        session: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        }
    },
}))

import { db } from "@hapi/shared"
import type {UserGetPayload} from "@hapi/shared/prisma/models/User";
import {hashPassword} from "../helpers/password";
import {authRouter} from "./authRouter";
import {LoginSuccessResponseSchema, UserDetailsSchema} from "@hapi/shared/types/apiResponses";
import type {SessionGetPayload} from "@hapi/shared/prisma/models/Session";
import {app} from "../index";
import type {UserRole} from "@hapi/shared/prisma/enums";

beforeEach(() => {
    vi.clearAllMocks()
})

describe("login", () => {
    test("accepts valid credentials", async () => {
        const inputPassword = "Password1!"
        const passwordHash = await hashPassword(inputPassword)
        vi.mocked(db.user.findUnique).mockResolvedValue({
            email: "test@example.com",
            password: passwordHash,
            name: "Test User",
            role: "ADMIN",
            id: "test-user",
            needsPasswordReset: false,

        } as unknown as UserGetPayload<any>)
        vi.mocked(db.session.create).mockResolvedValue({
            id: "test-session",
            userId: "test-user",
        } as unknown as SessionGetPayload<any>)
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
        vi.mocked(db.user.findUnique).mockResolvedValue({
            email: "test@example.com",
            password: await hashPassword("Password2@"),
            name: "Test User",
            role: "ADMIN",
            id: "test-user"

        } as unknown as UserGetPayload<any>)
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
        vi.mocked(db.session.findUnique).mockResolvedValue({
            id: "admin-session",
            userId: "admin-id",
            expires: new Date(Date.now() + 10000),
            user: {
                name: "Admin User",
                email: "a@eexample.com",
                role: "ADMIN",
            }
        } as unknown as SessionGetPayload<{include: {user: true}}>)
        vi.mocked(db.user.create).mockResolvedValue({
            id: "new-id",
            name: "",
            email: "",
            role: "ADMIN",
            password: "",
            needsPasswordReset: false
        })
        const res = await app.request("/auth/create", {
            method: "POST",
            body: JSON.stringify({
                name: "Other user",
                email: "b@example.com",
                password: "$trongP4ssword!",
                role: "ADMIN"
            }),
            headers: {"Cookie": "sessionId=admin-session"}
        })
        expect(res.status).toBe(200)
    })

    test("student user can't create new user", async () => {
        vi.mocked(db.session.findUnique).mockResolvedValue({
            id: "student-session",
            userId: "student-id",
            expires: new Date(Date.now() + 10000),
            user: {
                name: "Student User",
                email: "a@eexample.com",
                role: "STUDENT" as UserRole, // doesn't actually exist yet
            }
        } as unknown as SessionGetPayload<{include: {user: true}}>)
        const res = await app.request("/auth/create", {
            method: "POST",
            body: JSON.stringify({}),
            headers: {"Cookie": "sessionId=student-session"}
        })
        expect(res.status).toBe(403)
    })
})

describe("/me", () => {
    test("works", async () => {
        vi.mocked(db.session.findUnique).mockResolvedValue({
            id: "admin-session",
            userId: "admin-id",
            expires: new Date(Date.now() + 10000),
            user: {
                name: "Admin User",
                email: "a@eexample.com",
                role: "ADMIN",
                needsPasswordReset: false
            }
        } as unknown as SessionGetPayload<{include: {user: true}}>)
        const res = await app.request("/auth/me", {
            method: "GET",
            headers: {"Cookie": "sessionId=admin-session"}
        })
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(z.validate(LoginSuccessResponseSchema, json)).toBe(true)
    })
})
