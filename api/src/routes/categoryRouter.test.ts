import {beforeEach, describe, expect, test, vi} from "vitest";

vi.mock("@hapi/shared", () => import("../test/mockDb"))

import {db} from "@hapi/shared";
import {app} from "../index";
import {resetDb} from "../test/mockDb";
import {loginAs} from "../test/auth";

beforeEach(() => {
    resetDb()
})

function projectCountFilter() {
    const query = vi.mocked(db.category.findMany).mock.calls[0][0]
    const count = query?.include?._count
    return typeof count === "object" && typeof count.select?.projects === "object"
        ? count.select.projects.where
        : undefined
}

describe("GET /category", () => {
    test.each([
        ["anonymous users", null],
        ["students", "STUDENT"],
    ] as const)("only counts live projects for %s", async (_, role) => {
        vi.mocked(db.category.findMany).mockResolvedValue([])
        await app.request("/category", {headers: loginAs(role)})
        expect(projectCountFilter()).toEqual({
            projectVersion: {
                submissionStatus: "APPROVED",
                project: {published: true, showcase: {publishedDate: {lte: expect.any(Date)}}},
            },
        })
    })

    test("counts all projects for admins", async () => {
        vi.mocked(db.category.findMany).mockResolvedValue([])
        await app.request("/category", {headers: loginAs("ADMIN")})
        expect(projectCountFilter()).toEqual({})
    })
})
