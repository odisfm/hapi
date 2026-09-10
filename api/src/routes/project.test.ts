import { describe, expect, test, vi, beforeEach } from 'vitest'
import {projectRouter} from "./project.js";

vi.mock("@hapi/shared", () => ({
    db: {
        projectSlug: {
            findUnique: vi.fn(),
        },
        project: {
            findMany: vi.fn(),
        },
    },
}))

import { db } from "@hapi/shared"
import type {ProjectSlugGetPayload} from "@hapi/shared/src/generated/prisma/models/ProjectSlug.js";
import type {ProjectDetailsResponse, ProjectSearchResponse} from "@hapi/shared/src/types/apiResponses.js";
import type {ProjectGetPayload} from "@hapi/shared/src/generated/prisma/models/Project.js";

beforeEach(() => {
    vi.clearAllMocks()
})

type SlugWithProject = ProjectSlugGetPayload<{
    include: {
        project: {
            include: {
                showcase: true
                media: true
                category: true
                ProjectSlug: true
            }
        }
    }
}>

type ProjectFindMany = ProjectGetPayload<{
    include: {
        media: true,
        category: true
        ProjectSlug: true
        showcase: true
    }
}>[]

describe("GET /project", async () => {
    test("returns a project with valid slug", async () => {
        vi.mocked(db.projectSlug.findUnique).mockResolvedValue({
            slug: "my-cool-app",
            project: {
                showcase: {publishedDate: new Date(Date.now() - 1000)},
                media: [],
                category: {name: "Games"},
                ProjectSlug: [
                    {slug: "my-cool-app"},
                ],
            },
        } as unknown as SlugWithProject)
        const res = await projectRouter.request("/my-cool-app")
        const json: ProjectDetailsResponse = await res.json()
        expect(json.project).toBeDefined()
        expect(json.project.slug).toEqual("my-cool-app")
    })

    test("404s on a non-existing slug", async () => {
        vi.mocked(db.projectSlug.findUnique).mockResolvedValue(null)
        const res = await projectRouter.request("/sfdjsdjf")
        expect(res.status).toEqual(404)
    })

    test("404s on a valid slug with an unpublished showcase", async () => {
        vi.mocked(db.projectSlug.findUnique).mockResolvedValue({
            slug: "my-cool-app",
            project: {
                showcase: {publishedDate: new Date(Date.now() + 1000)},
                media: [],
                category: {name: "Games"},
                ProjectSlug: [
                    {slug: "my-cool-app"},
                ],
            },
        } as unknown as SlugWithProject)
        const res = await projectRouter.request("/my-cool-app")
        expect(res.status).toEqual(404)
    })
})

describe("GET /project/search", async () => {
    test("excludes projects unrelated to search term", async () => {
        vi.mocked(db.project.findMany).mockResolvedValue([
            {
                name: "Cool game app",
                ProjectSlug: [
                    {slug: "my-cool-app"},
                ],
                media: [],
                category: {name: "Games"},
                showcase: {
                    publishedDate: new Date(Date.now() - 1000),
                }
            },
            {
                name: "We hate fun",
                ProjectSlug: [
                    {slug: "we-hate-fun"}
                ],
                media: [],
                category: {name: "Business"},
                showcase: {
                    publishedDate: new Date(Date.now() - 1000),
                }
            }
        ] as unknown as ProjectFindMany)
        const params = new URLSearchParams({
            "searchTerm": "game"
        })
        const res = await projectRouter.request(`/search?${params}`)
        expect(res.status).toBe(200)
        const json: ProjectSearchResponse = await res.json()
        for (const p of json.projects) {
            expect(p.slug).not.toEqual("we-hate-fun")
        }
    })

    test("cursor and limit function correctly", async () => {
        vi.mocked(db.project.findMany).mockResolvedValue([
            {
                id: "a",
                name: "Cool game app",
                ProjectSlug: [
                    {slug: "my-cool-app"},
                ],
                media: [],
                category: {name: "Games"},
                showcase: {
                    publishedDate: new Date(Date.now() - 1000),
                }
            },
            {
                id: "b",
                name: "We hate fun",
                ProjectSlug: [
                    {slug: "we-hate-fun"}
                ],
                media: [],
                category: {name: "Business"},
                showcase: {
                    publishedDate: new Date(Date.now() - 1000),
                }
            },
            {
                id: "c",
                name: "Yet another app",
                ProjectSlug: [
                    {slug: "yaa"}
                ],
                media: [],
                category: {name: "Health"},
                showcase: {
                    publishedDate: new Date(Date.now() - 1000),
                }
            }
        ] as unknown as ProjectFindMany)
        let params = new URLSearchParams({
            "limit": "1",
        })
        let res = await projectRouter.request(`/search?${params}`)
        let json: ProjectSearchResponse = await res.json()

        let id = json.projects[0].id
        expect(id).toBe("a")

        params = new URLSearchParams({
            "limit": "1", "cursor": "a"
        })
        res = await projectRouter.request(`/search?${params}`)
        json = await res.json()

        id = json.projects[0].id
        expect(id).toBe("b")

        params = new URLSearchParams({
            "limit": "1", "cursor": "b"
        })
        res = await projectRouter.request(`/search?${params}`)
        json = await res.json()

        id = json.projects[0].id
        expect(id).toBe("c")

        params = new URLSearchParams({
            "limit": "1", "cursor": "c"
        })
        res = await projectRouter.request(`/search?${params}`)
        json = await res.json()
        expect(json.projects.length).toBe(0)
        expect(json.info.totalResults).toBe(3)

    })

})
