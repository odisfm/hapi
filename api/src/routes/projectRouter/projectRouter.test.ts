import { describe, expect, test, vi, beforeEach } from 'vitest'

vi.mock("@hapi/shared", () => import("../../test/mockDb"))

import { db } from "@hapi/shared"
import {DEFAULT_SEARCH_LIMIT, MAX_SEARCH_LIMIT, projectRouterGet} from "./projectRouterGet";
import type {
    ProjectDetailsAdminResponse,
    ProjectDetailsResponse,
    ProjectSearchResponse
} from "@hapi/shared/types/apiResponses";
import {app} from "../../index";
import {
    inFuture,
    makeProject,
    makeProjectSlug,
    makeShowcase,
    makeVersionWithProject,
} from "../../test/fixtures";
import {resetDb} from "../../test/mockDb";
import {loginAs} from "../../test/auth";

beforeEach(() => {
    resetDb()
})

const validFindMany = Array.from({length: 100}, (_, i) => makeProject({id: String(i + 1)}))

describe("GET /project", async () => {
    test("returns a project with valid slug", async () => {
        vi.mocked(db.projectSlug.findUnique).mockResolvedValue(makeProjectSlug({
            project: makeProject({slug: "my-cool-app", versionName: "Cool game app"}),
        }))
        vi.mocked(db.projectView.create).mockResolvedValue({id: "view", projectId: "", viewDate: new Date()})
        const res = await projectRouterGet.request("/my-cool-app")
        const json = await res.json() as ProjectDetailsResponse
        expect(json.project).toBeDefined()
        expect(json.project.slug).toEqual("my-cool-app")
    })

    test("404s on a non-existing slug", async () => {
        vi.mocked(db.projectSlug.findUnique).mockResolvedValue(null)
        const res = await projectRouterGet.request("/sfdjsdjf")
        expect(res.status).toEqual(404)
    })

    test("404s on a valid slug with an unpublished showcase", async () => {
        vi.mocked(db.projectSlug.findUnique).mockResolvedValue(makeProjectSlug({
            project: makeProject({
                slug: "my-cool-app",
                showcase: makeShowcase({publishedDate: inFuture()}),
            }),
        }))
        const res = await projectRouterGet.request("/my-cool-app")
        expect(res.status).toEqual(404)
    })
})

describe("GET /project/search", async () => {
    test("excludes projects unrelated to search term", async () => {
        vi.mocked(db.project.findMany).mockResolvedValue([
            makeProject({slug: "my-cool-app", versionName: "Cool game app", categories: ["Games"]}),
            makeProject({slug: "we-hate-fun", versionName: "We hate fun", categories: ["Business"]}),
        ])
        const params = new URLSearchParams({
            "searchTerm": "game"
        })
        const res = await projectRouterGet.request(`/search?${params}`)
        expect(res.status).toBe(200)
        const json = await res.json() as ProjectSearchResponse
        for (const p of json.projects) {
            expect(p.slug).not.toEqual("we-hate-fun")
        }
    })

    test("cursor and limit function correctly", async () => {
        vi.mocked(db.project.findMany).mockResolvedValue([
            makeProject({id: "a", slug: "my-cool-app", versionName: "Cool game app", categories: ["Games"]}),
            makeProject({id: "b", slug: "we-hate-fun", versionName: "We hate fun", categories: ["Business"]}),
            makeProject({id: "c", slug: "yaa", versionName: "Yet another app", categories: ["Health"]}),
        ])
        let params = new URLSearchParams({
            "limit": "1",
        })
        let res = await projectRouterGet.request(`/search?${params}`)
        let json = await res.json() as ProjectSearchResponse

        let id = json.projects[0].id
        expect(id).toBe("a")

        params = new URLSearchParams({
            "limit": "1", "cursor": "a"
        })
        res = await projectRouterGet.request(`/search?${params}`)
        json = await res.json() as ProjectSearchResponse

        id = json.projects[0].id
        expect(id).toBe("b")

        params = new URLSearchParams({
            "limit": "1", "cursor": "b"
        })
        res = await projectRouterGet.request(`/search?${params}`)
        json = await res.json() as ProjectSearchResponse

        id = json.projects[0].id
        expect(id).toBe("c")

        params = new URLSearchParams({
            "limit": "1", "cursor": "c"
        })
        res = await projectRouterGet.request(`/search?${params}`)
        json = await res.json() as ProjectSearchResponse
        expect(json.projects.length).toBe(0)
        expect(json.info.totalResults).toBe(3)

        res = await projectRouterGet.request(`/search?cursor=0`)
        expect(res.status).toBe(400)
    })

    test("enforces search limit", async () => {
        vi.mocked(db.project.findMany).mockResolvedValue(validFindMany)
        const res = await projectRouterGet.request("/search?limit=100")
        const json = (await res.json()) as ProjectSearchResponse
        expect(json.projects.length).toBe(MAX_SEARCH_LIMIT)
    })

    test("ignores malformed limit", async () => {
        vi.mocked(db.project.findMany).mockResolvedValue(validFindMany)
        const res = await projectRouterGet.request("/search?limit=dsdsf")
        const json = (await res.json()) as ProjectSearchResponse
        expect(json.projects.length).toBe(DEFAULT_SEARCH_LIMIT)
    })

    test("paginates correctly", async () => {
        vi.mocked(db.project.findMany).mockResolvedValue(validFindMany)
        let res =  await projectRouterGet.request("/search?page=0")
        let json = (await res.json()) as ProjectSearchResponse
        expect(json.projects[0].id).toBe("1")
        expect(json.projects[9].id).toBe("10")
        res =  await projectRouterGet.request("/search?page=1")
        json = (await res.json()) as ProjectSearchResponse
        expect(json.projects[0].id).toBe("11")
        expect(json.projects[9].id).toBe("20")
    })

    test("admin user can filter by published", async () => {
        const headers = loginAs("ADMIN")
        vi.mocked(db.project.findMany).mockResolvedValue([
            makeProject({id: "a", published: true}),
            makeProject({id: "b", published: false}),
        ])
        const res1 = await app.request("/project/search?published=published", {headers})
        const json1 = (await res1.json()) as ProjectSearchResponse
        expect(json1.projects.length).toBe(1)
        expect(json1.projects[0].id).toBe("a")
        const res2 = await app.request("/project/search?published=unpublished", {headers})
        const json2 = (await res2.json()) as ProjectSearchResponse
        expect(json2.projects.length).toBe(1)
        expect(json2.projects[0].id).toBe("b")
    })
})

describe("GET /project/id/:versionId", () => {
    test("admin can get project by version ID", async () => {
        const headers = loginAs("ADMIN")
        vi.mocked(db.projectVersion.findUnique).mockResolvedValue(makeVersionWithProject({id: "v-a"}))
        const res = await app.request("/project/id/a", {headers})
        const json = (await res.json()) as ProjectDetailsAdminResponse
        expect(json.project.versionId).toBe("v-a")
    })
})


describe("PATCH /project", () => {
    test("rejects malformed input", async () => {
        const res = await app.request("/project", {
            method: "PATCH",
            headers: loginAs("ADMIN"),
            body: JSON.stringify({
                project: {id: 1},
            })
        })
        expect(res.status).toBe(400)
    })

})

describe("POST /project", () => {
    test("rejects malformed input", async () => {
        const res = await app.request("/project", {
            method: "POST",
            headers: loginAs("ADMIN"),
            body: JSON.stringify({
                showcaseId: "not-a-uuid"
            })
        })
        expect(res.status).toBe(400)
    })
})

describe("DELETE /project/:projectId", () => {
    test("rejects non-admin registered user", async () => {
        const res = await app.request("/project/a", {
            method: "DELETE",
            headers: loginAs("STUDENT"),
        })
        expect(res.status).toBe(403)
    })

})