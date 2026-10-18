import {beforeEach, describe, expect, test, vi} from "vitest";

vi.mock("@hapi/shared", () => import("../test/mockDb"))
vi.mock("../helpers/sendEmail", () => ({
    sendEmail: async () => {}
}))

import {app} from "../index";
import {resetDb} from "../test/mockDb";
import {loginAs} from "../test/auth";

const ADMIN_ONLY_ROUTES = [
    ["POST", "/auth/create"],
    ["POST", "/auth/create/batch"],
    ["GET", "/auth/users"],
    ["DELETE", "/auth/user"],
    ["POST", "/showcase"],
    ["PATCH", "/showcase"],
    ["DELETE", "/showcase/id/showcase-1"],
    ["GET", "/showcase/id/showcase-1/slug"],
    ["POST", "/showcase/id/showcase-1/slug"],
    ["DELETE", "/showcase/id/showcase-1/slug"],
    ["PATCH", "/project/batch"],
    ["DELETE", "/project/project-1"],
    ["GET", "/project/id/project-1/slug"],
    ["POST", "/project/id/project-1/slug"],
    ["DELETE", "/project/id/project-1/slug"],
    ["POST", "/category"],
    ["PATCH", "/category/category-1"],
    ["DELETE", "/category/category-1"],
    ["GET", "/analytics/example"],
    ["GET", "/analytics/showcase"],
    ["GET", "/analytics/project"],
] as const

function request(method: string, path: string, headers: Record<string, string>) {
    return app.request(path, {
        method,
        headers,
        ...(method !== "GET" && {body: JSON.stringify({})}),
    })
}

beforeEach(() => {
    resetDb()
    vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("admin-only routes", () => {
    // The db mock throws on unstubbed calls, so a 403 also shows the role check runs before any db access
    test.each(ADMIN_ONLY_ROUTES)("%s %s rejects students with 403", async (method, path) => {
        const res = await request(method, path, loginAs("STUDENT"))
        expect(res.status).toBe(403)
    })

    test.each(ADMIN_ONLY_ROUTES)("%s %s lets admins past the role check", async (method, path) => {
        const res = await request(method, path, loginAs("ADMIN"))
        expect(res.status).not.toBe(403)
    })
})

describe("PATCH /project", () => {
    test("rejects students editing base project details", async () => {
        const res = await app.request("/project", {
            method: "PATCH",
            headers: loginAs("STUDENT"),
            body: JSON.stringify({project: {id: crypto.randomUUID(), featured: true}}),
        })
        expect(res.status).toBe(403)
    })
})
