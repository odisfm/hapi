import {beforeEach, describe, expect, test, vi} from "vitest";

vi.mock("@hapi/shared", () => import("../test/mockDb"))

import {db} from "@hapi/shared";
import type {AnalyticsProjectResponse, AnalyticsShowcaseResponse} from "@hapi/shared/types/apiResponses";
import {app} from "../index";
import {makeProject, makeShowcase} from "../test/fixtures";
import {resetDb} from "../test/mockDb";
import {loginAs} from "../test/auth";

beforeEach(() => {
    resetDb()
})

describe("GET /analytics/project", () => {
    test("ranks projects by views, most viewed first", async () => {
        vi.mocked(db.project.findMany).mockResolvedValue([
            {...makeProject({id: "a"}), _count: {views: 5}},
            {...makeProject({id: "b"}), _count: {views: 20}},
            {...makeProject({id: "c"}), _count: {views: 0}},
        ] as never)
        const res = await app.request("/analytics/project", {headers: loginAs("ADMIN")})
        expect(res.status).toBe(200)
        const json = await res.json() as AnalyticsProjectResponse
        expect(json.analytics.map(a => [a.project.id, a.views])).toEqual([["b", 20], ["a", 5], ["c", 0]])
    })

    test("counts only views within the date range", async () => {
        vi.mocked(db.project.findMany).mockResolvedValue([])
        await app.request("/analytics/project?startDate=2026-01-01&endDate=2026-02-01", {headers: loginAs("ADMIN")})
        expect(db.project.findMany).toHaveBeenCalledWith(expect.objectContaining({
            include: expect.objectContaining({
                _count: {select: {views: {where: {viewDate: {gt: "2026-01-01", lt: "2026-02-01"}}}}},
            }),
        }))
    })
})

describe("GET /analytics/showcase", () => {
    test("ranks showcases by views and exposes the project count", async () => {
        vi.mocked(db.showcase.findMany).mockResolvedValue([
            {...makeShowcase({id: "a"}), slugs: [], _count: {views: 1, projects: 3, media: 0}},
            {...makeShowcase({id: "b"}), slugs: [], _count: {views: 9, projects: 4, media: 0}},
        ] as never)
        const res = await app.request("/analytics/showcase", {headers: loginAs("ADMIN")})
        expect(res.status).toBe(200)
        const json = await res.json() as AnalyticsShowcaseResponse
        expect(json.analytics.map(a => [a.showcase.id, a.views, a.showcase._count.projects])).toEqual([
            ["b", 9, 4],
            ["a", 1, 3],
        ])
    })

    test("counts only views within the date range", async () => {
        vi.mocked(db.showcase.findMany).mockResolvedValue([])
        await app.request("/analytics/showcase?startDate=2026-01-01&endDate=2026-02-01", {headers: loginAs("ADMIN")})
        const {include} = vi.mocked(db.showcase.findMany).mock.calls[0][0]!
        expect(include!._count).toMatchObject({
            select: {views: {where: {viewDate: {gt: new Date("2026-01-01"), lt: new Date("2026-02-01")}}}},
        })
    })
})

describe("limit", () => {
    test.each(["project", "showcase"] as const)("/analytics/%s returns at most `limit` results", async (kind) => {
        const records = ["a", "b", "c"].map((id, i) => kind === "project"
            ? {...makeProject({id}), _count: {views: i}}
            : {...makeShowcase({id}), slugs: [], _count: {views: i, projects: 0, media: 0}})
        vi.mocked(kind === "project" ? db.project.findMany : db.showcase.findMany).mockResolvedValue(records as never)
        const res = await app.request(`/analytics/${kind}?limit=2`, {headers: loginAs("ADMIN")})
        expect(res.status).toBe(200)
        const json = await res.json() as {analytics: unknown[]}
        expect(json.analytics).toHaveLength(2)
    })

    test.each(["abc", "0", "-1", "1.5"])("rejects limit=%s", async (limit) => {
        vi.spyOn(console, "error").mockImplementation(() => {})
        const res = await app.request(`/analytics/project?limit=${limit}`, {headers: loginAs("ADMIN")})
        expect(res.status).toBe(400)
    })
})
