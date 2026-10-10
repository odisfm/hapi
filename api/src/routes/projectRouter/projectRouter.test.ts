import { describe, expect, test, vi, beforeEach } from 'vitest'

vi.mock("@hapi/shared", () => ({
    db: {
        projectSlug: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        project: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        projectVersion: {
            findUnique: vi.fn(),
        }
    },
}))

const { sessionMock } = vi.hoisted(() => ({
    sessionMock: vi.fn(),
}))

vi.mock("../../middleware/session", () => ({
    sessionMiddleware: sessionMock,
}))


import { db } from "@hapi/shared"
import {DEFAULT_SEARCH_LIMIT, MAX_SEARCH_LIMIT, projectRouterGet} from "./projectRouterGet";
import type {ProjectSlugGetPayload} from "@hapi/shared/prisma/models/ProjectSlug";
import type {
    ProjectDetailsAdminResponse,
    ProjectDetailsResponse,
    ProjectSearchResponse
} from "@hapi/shared/types/apiResponses";
import type {ProjectGetPayload} from "@hapi/shared/prisma/models/Project";
import {app} from "../../index";
import type {ProjectVersionGetPayload} from "@hapi/shared/prisma/models/ProjectVersion";

beforeEach(() => {
    vi.clearAllMocks()
})

type SlugWithProject = ProjectSlugGetPayload<{
    include: {
        project: {
            include: {
                showcase: true
                media: true
                versions: {
                    include: {
                        media: {include: {media: true}}
                        categories: {
                            include: {
                                category: true
                            }
                        }
                    }
                }
                slugs: true
            }
        }
    }
}>

type ProjectFindMany = ProjectGetPayload<{
    include: {
        showcase: true
        slugs: true
        versions: {
            include: {
                media: {include: {media: true}}
                categories: {
                    include: {
                        category: true
                    }
                }
            }
        }
    }
}>[]

const validProjectFindUnique = {
    id: "a",
    slugs: [
        {slug: "my-cool-app"},
    ],
    media: [],
    order: "",
    versions: [
        {
            id: "v-a",
            name: "Cool game app",
            subtitle: "",
            description: "",
            submissionStatus: "APPROVED",
            categories: [],
            media: [],
            developerNames: [],
            links: []
        }
    ],
    published: true,
    showcase: {
        publishedDate: new Date(Date.now() - 1000),
    }
} as unknown as ProjectGetPayload<{
    include: {
        versions: {
            include: {
                categories: {include: {category: true}},
                media: {include: {media: true}}
            }
        }
        showcase: true,
        media: true}
}>

const validProjectVersionFindUnique = {
    published: true,
    showcase: {
        publishedDate: new Date(Date.now() - 1000),
    },
    project: {
        versions: [
            {
                id: "v-a",
                name: "",
                subtitle: "",
                submissionStatus: "APPROVED",
                categories: [],
                media: [],
                developerNames: [],
                links: [],
                projectId: "a",
            }
        ],
        slugs: [
            {slug: "my-cool-app"},
        ]
    },

} as unknown as ProjectVersionGetPayload<any>

const validFindMany = new Array(100).fill(validProjectFindUnique) as unknown as ProjectFindMany

describe("GET /project", async () => {
    test("returns a project with valid slug", async () => {
        vi.mocked(db.projectSlug.findUnique).mockResolvedValue({
            slug: "my-cool-app",
            project: {
                showcase: {publishedDate: new Date(Date.now() - 1000)},
                media: [],
                versions: [
                    {
                        id: "v-a",
                        name: "Cool game app",
                        submissionStatus: "APPROVED",
                        categories: [],
                        media: [],
                        developerNames: [],
                        links: [],
                    }
                ],
                published: true,
                slugs: [
                    {slug: "my-cool-app"},
                ],
            },
        } as unknown as SlugWithProject)
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
        vi.mocked(db.projectSlug.findUnique).mockResolvedValue({
            slug: "my-cool-app",
            project: {
                showcase: {publishedDate: new Date(Date.now() + 1000)},
                media: [],
                versions: [],
                published: true,
                slugs: [
                    {slug: "my-cool-app"},
                ],
            },
        } as unknown as SlugWithProject)
        const res = await projectRouterGet.request("/my-cool-app")
        expect(res.status).toEqual(404)
    })
})

describe("GET /project/search", async () => {
    test("excludes projects unrelated to search term", async () => {
        vi.mocked(db.project.findMany).mockResolvedValue([
            {
                slugs: [
                    {slug: "my-cool-app"},
                ],
                versions: [
                    {name: "Cool game app", categories: [{category: {name: "Games"}}], media: []},
                ],
                showcase: {
                    publishedDate: new Date(Date.now() - 1000),
                }
            },
            {
                slugs: [
                    {slug: "we-hate-fun"}
                ],
                versions: [
                    {name: "We hate fun", categories: [{category: {name: "Business"}}], media: []},
                ],
                showcase: {
                    publishedDate: new Date(Date.now() - 1000),
                }
            }
        ] as unknown as ProjectFindMany)
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
            {
                id: "a",
                slugs: [
                    {slug: "my-cool-app"},
                ],
                versions: [
                    {name: "Cool game app", categories: [{category: {name: "Games"}}], media: []},
                ],
                published: true,
                showcase: {
                    publishedDate: new Date(Date.now() - 1000),
                }
            },
            {
                id: "b",
                slugs: [
                    {slug: "we-hate-fun"}
                ],
                versions: [
                    {name: "We hate fun", categories: [{category: {name: "Business"}}], media: []},
                ],
                published: true,
                showcase: {
                    publishedDate: new Date(Date.now() - 1000),
                }
            },
            {
                id: "c",
                slugs: [
                    {slug: "yaa"}
                ],
                versions: [
                    {name: "Yet another app", categories: [{category: {name: "Health"}}], media: []},
                ],
                published: true,
                showcase: {
                    publishedDate: new Date(Date.now() - 1000),
                }
            }
        ] as unknown as ProjectFindMany)
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
        vi.mocked(db.project.findMany).mockResolvedValue(
            validFindMany.map((r, i) => ({ ...r, id: String(i + 1) }))
        );
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
        sessionMock.mockImplementation(async (c: any, next: any) => {
            c.set("user", { id: "user_1", role: "ADMIN" })
            await next()
        })
        vi.mocked(db.project.findMany).mockResolvedValue([{
            id: "a",
            slugs: [
                {slug: "my-cool-app"},
            ],
            versions: [
                {name: "Cool game app", categories: [{category: {name: "Games"}}], media: []},
            ],
            published: true,
            showcase: {
                publishedDate: new Date(Date.now() - 1000),
            }
        },
            {
                id: "b",
                slugs: [
                    {slug: "my-cool-app"},
                ],
                versions: [
                    {name: "Cool game app", categories: [{category: {name: "Games"}}], media: []},
                ],
                published: false,
                showcase: {
                    publishedDate: new Date(Date.now() - 1000),
                }
            }] as unknown as ProjectFindMany)
        const res1 = await app.request("/project/search?published=published")
        const json1 = (await res1.json()) as ProjectSearchResponse
        expect(json1.projects.length).toBe(1)
        expect(json1.projects[0].id).toBe("a")
        const res2 = await app.request("/project/search?published=unpublished")
        const json2 = (await res2.json()) as ProjectSearchResponse
        expect(json2.projects.length).toBe(1)
        expect(json2.projects[0].id).toBe("b")
    })
})

describe("GET /project/:versionId", () => {
    test("admin can get project by version ID", async () => {
        sessionMock.mockImplementation(async (c: any, next: any) => {
            c.set("user", {id: "user_1", role: "ADMIN"})
            await next()
        })
        vi.mocked(db.projectVersion.findUnique).mockResolvedValue(validProjectVersionFindUnique)
        const res = await  app.request("/project/id/a")
        const json = (await res.json()) as ProjectDetailsAdminResponse
        expect(json.project.versionId).toBe("v-a")
    })
})


describe("PATCH /project", () => {
    beforeEach(() => {
        sessionMock.mockImplementation(async (c: any, next: any) => {
            c.set("user", { id: "user_1", role: "ADMIN" })
            await next()
        })
    })

    test("rejects malformed input", async () => {
        const res = await app.request("/project", {
            method: "PATCH",
            body: JSON.stringify({
                project: {id: 1},
            })
        })
        expect(res.status).toBe(400)
    })

})

describe("POST /project", () => {
    beforeEach(() => {
        sessionMock.mockImplementation(async (c: any, next: any) => {
            c.set("user", { id: "user_1", role: "ADMIN" })
            await next()
        })
    })

    test("rejects malformed input", async () => {
        const res = await app.request("/project", {
            method: "PATCH",
            body: JSON.stringify({
                project: {id: 1}
            })
        })
        expect(res.status).toBe(400)
    })
})

describe("DELETE /project/:projectId", () => {
    test("rejects non-admin registered user", async () => {
        sessionMock.mockImplementation(async (c: any, next: any) => {
            c.set("user", {
                id: "user_1",
                role: "STUDENT"
            })
            await next()
        })
        const res = await app.request("/project/a", {
            method: "DELETE",
        })
        expect(res.status).toBe(403)
    })

})