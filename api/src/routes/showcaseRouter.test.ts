import { describe, expect, test, vi, beforeEach } from 'vitest'
import { showcaseRouter } from "./showcaseRouter";

vi.mock("@hapi/shared", () => import("../test/mockDb"))

import { db } from "@hapi/shared"
import {inFuture, makeShowcase, makeShowcaseSlug} from "../test/fixtures";
import {resetDb} from "../test/mockDb";
import {loginAs} from "../test/auth";
import {app} from "../index";

beforeEach(() => {
    resetDb()
})

describe("GET /:showcaseSlug", async () => {
    test("404s on unpublished showcase for public user", async () => {
        vi.mocked(db.showcaseSlug.findUnique).mockResolvedValue(makeShowcaseSlug({
            slug: "my-showcase",
            showcase: makeShowcase({publishedDate: inFuture()}),
        }))

        const res = await showcaseRouter.request("/my-showcase")
        expect(res.status).toBe(404)
    })
})

describe("GET /showcase/all", () => {
    test("only lists published showcases for anonymous users", async () => {
        vi.mocked(db.showcase.findMany).mockResolvedValue([])
        await app.request("/showcase/all")
        expect(db.showcase.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: {publishedDate: {lt: expect.any(Date), not: null}},
        }))
    })

    test.each(["ADMIN", "STUDENT"] as const)("lists all showcases for %s users", async (role) => {
        // Students pick upcoming, unpublished showcases when creating a project
        vi.mocked(db.showcase.findMany).mockResolvedValue([])
        await app.request("/showcase/all", {headers: loginAs(role)})
        expect(db.showcase.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: {publishedDate: {}},
        }))
    })
})

describe("DELETE /showcase/id/:showcaseId/slug", () => {
    test("only deletes the slug from the given showcase", async () => {
        vi.mocked(db.showcaseSlug.delete).mockResolvedValue(makeShowcaseSlug())
        const res = await app.request("/showcase/id/showcase-1/slug", {
            method: "DELETE",
            headers: loginAs("ADMIN"),
            body: JSON.stringify({slug: "My-Showcase"}),
        })
        expect(res.status).toBe(200)
        expect(db.showcaseSlug.delete).toHaveBeenCalledWith({
            where: {slug: "my-showcase", showcaseId: "showcase-1"},
        })
    })
})

describe("GET /showcase/id/:showcaseId", () => {
    test("restricts anonymous users to published showcases and projects, and hides the publish date", async () => {
        vi.mocked(db.showcase.findUnique).mockResolvedValue(makeShowcase())
        const res = await app.request("/showcase/id/showcase-1")
        const query = vi.mocked(db.showcase.findUnique).mock.calls[0][0]
        expect(query.where).toEqual({id: "showcase-1", publishedDate: {lt: expect.any(Date)}})
        expect(query.include?.projects).toMatchObject({where: {published: true}})
        const json = await res.json() as {showcase: {publishedDate?: string}}
        expect(json.showcase.publishedDate).toBeUndefined()
    })

    test("shows admins unpublished showcases and projects, with the publish date", async () => {
        vi.mocked(db.showcase.findUnique).mockResolvedValue(makeShowcase())
        const res = await app.request("/showcase/id/showcase-1", {headers: loginAs("ADMIN")})
        const query = vi.mocked(db.showcase.findUnique).mock.calls[0][0]
        expect(query.where).toEqual({id: "showcase-1"})
        expect(query.include?.projects).toMatchObject({where: {}})
        const json = await res.json() as {showcase: {publishedDate?: string}}
        expect(json.showcase.publishedDate).toBeDefined()
    })
})
