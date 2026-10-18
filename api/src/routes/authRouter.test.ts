import { describe, test, expect, vi, beforeEach } from "vitest"
import * as z from "zod"

vi.mock("@hapi/shared", () => import("../test/mockDb"))

vi.mock("../helpers/sendEmail", () => ({
    sendEmail: async () => {}
}))

import { db } from "@hapi/shared"
import {hashPassword} from "../helpers/password";
import {authRouter} from "./authRouter";
import {LoginSuccessResponseSchema} from "@hapi/shared/types/apiResponses";
import {app} from "../index";
import {makeSession, makeUser} from "../test/fixtures";
import {resetDb} from "../test/mockDb";
import {loginAs} from "../test/auth";

beforeEach(() => {
    resetDb()
})

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
