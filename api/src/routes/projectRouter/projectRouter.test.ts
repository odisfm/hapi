import { describe, expect, test, vi, beforeEach } from 'vitest'

vi.mock("@hapi/shared", () => import("../../test/mockDb"))
vi.mock("../../services/s3", () => ({
    s3: {send: vi.fn()},
}))

import { db } from "@hapi/shared"
import type {DeleteObjectsCommand} from "@aws-sdk/client-s3";
import {Prisma} from "@hapi/shared/prisma/client";
import {s3} from "../../services/s3";
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
    makeOwnership,
    makeShowcase,
    makeVersion,
    makeVersionWithProject,
} from "../../test/fixtures";
import {resetDb} from "../../test/mockDb";
import {loginAs} from "../../test/auth";
import {NUM_HERO_PROJECTS_FRONT_PAGE} from "@hapi/shared/consts";

beforeEach(() => {
    resetDb()
    vi.mocked(s3.send).mockReset()
    vi.spyOn(console, "error").mockImplementation(() => {})
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

    test("admins can view a project in an unpublished showcase", async () => {
        vi.mocked(db.projectSlug.findUnique).mockResolvedValue(makeProjectSlug({
            project: makeProject({showcase: makeShowcase({publishedDate: inFuture()})}),
        }))
        vi.mocked(db.projectView.create).mockResolvedValue({id: "view", projectId: "", viewDate: new Date()})
        const res = await app.request("/project/test-app", {headers: loginAs("ADMIN")})
        expect(res.status).toBe(200)
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

describe("GET /project/search visibility", () => {
    test("restricts anonymous users to live projects, even when asking for unpublished", async () => {
        vi.mocked(db.project.findMany).mockResolvedValue([
            makeProject({id: "live"}),
            makeProject({id: "upcoming", showcase: makeShowcase({publishedDate: inFuture()})}),
        ])
        const res = await app.request("/project/search?published=unpublished")
        const json = (await res.json()) as ProjectSearchResponse
        expect(json.projects.map((p) => p.id)).toEqual(["live"])
        expect(db.project.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: {published: true, showcase: {publishedDate: {lt: expect.any(Date)}}},
        }))
    })

    test("doesn't cap the result limit for admins", async () => {
        vi.mocked(db.project.findMany).mockResolvedValue(validFindMany)
        const res = await app.request("/project/search?limit=100", {headers: loginAs("ADMIN")})
        const json = (await res.json()) as ProjectSearchResponse
        expect(json.projects.length).toBe(100)
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

    describe("editing a version", () => {
        const versionId = crypto.randomUUID()
        const projectId = crypto.randomUUID()

        function editVersion(headers: Record<string, string>, changes: object = {name: "New name"}) {
            return app.request("/project", {
                method: "PATCH",
                headers,
                body: JSON.stringify({projectVersion: {id: versionId, ...changes}}),
            })
        }

        function versionMedia(id: string) {
            return {id, uri: `${id}-uri`, mediaType: "SCREENSHOT", deviceType: "PHONE", order: "a", status: "AVAILABLE"}
        }

        test("404s when the version doesn't exist", async () => {
            vi.mocked(db.projectVersion.findUnique).mockResolvedValue(null)
            const res = await editVersion(loginAs("STUDENT"))
            expect(res.status).toBe(404)
        })

        test("rejects students who don't own the project", async () => {
            vi.mocked(db.projectVersion.findUnique).mockResolvedValue(makeVersion({id: versionId, projectId}))
            vi.mocked(db.projectOwner.findUnique).mockResolvedValue(null)
            const res = await editVersion(loginAs("STUDENT"))
            expect(res.status).toBe(403)
            expect(db.projectVersion.update).not.toHaveBeenCalled()
        })

        test.each(["PENDING", "APPROVED", "REJECTED", "SUPERSEDED"] as const)(
            "rejects the owning student editing a %s version", async (submissionStatus) => {
                vi.mocked(db.projectVersion.findUnique).mockResolvedValue(makeVersion({id: versionId, projectId, submissionStatus}))
                vi.mocked(db.projectOwner.findUnique).mockResolvedValue(makeOwnership("owner-1", projectId))
                const res = await editVersion(loginAs("STUDENT", {id: "owner-1"}))
                expect(res.status).toBe(403)
                expect(db.projectVersion.update).not.toHaveBeenCalled()
            }
        )

        test("lets the owning student edit a version that hasn't been submitted", async () => {
            vi.mocked(db.projectVersion.findUnique).mockResolvedValue(
                makeVersion({id: versionId, projectId, submissionStatus: "NOT_SUBMITTED"})
            )
            vi.mocked(db.projectOwner.findUnique).mockResolvedValue(makeOwnership("owner-1", projectId))
            vi.mocked(db.projectVersion.update).mockResolvedValue(makeVersion())
            const res = await editVersion(loginAs("STUDENT", {id: "owner-1"}))
            expect(res.status).toBe(201)
            expect(db.projectOwner.findUnique).toHaveBeenCalledWith({
                where: {ownerId_projectId: {ownerId: "owner-1", projectId}},
            })
            expect(db.projectVersion.update).toHaveBeenCalledWith({
                where: {id: versionId},
                data: {name: "New name"},
            })
        })

        test("lets admins edit any version, without an ownership or status check", async () => {
            vi.mocked(db.projectVersion.findUnique).mockResolvedValue(
                makeVersion({id: versionId, projectId, submissionStatus: "APPROVED"})
            )
            vi.mocked(db.projectVersion.update).mockResolvedValue(makeVersion())
            const res = await editVersion(loginAs("ADMIN"))
            expect(res.status).toBe(201)
            expect(db.projectOwner.findUnique).not.toHaveBeenCalled()
        })

        describe("linking media", () => {
            const ownMedia = crypto.randomUUID()
            const otherMedia = crypto.randomUUID()

            beforeEach(() => {
                vi.mocked(db.projectVersion.findUnique).mockResolvedValue(makeVersion({id: versionId, projectId}))
            })

            test("rejects media that doesn't belong to the version's project", async () => {
                vi.mocked(db.projectMedia.count).mockResolvedValue(1)
                const res = await editVersion(loginAs("ADMIN"), {media: [versionMedia(ownMedia), versionMedia(otherMedia)]})
                expect(res.status).toBe(400)
                expect(db.projectMedia.count).toHaveBeenCalledWith({
                    where: {id: {in: [ownMedia, otherMedia]}, projectId},
                })
                expect(db.projectVersionMedia.createMany).not.toHaveBeenCalled()
            })

            test("links media that belongs to the version's project", async () => {
                vi.mocked(db.projectMedia.count).mockResolvedValue(1)
                vi.mocked(db.projectVersion.update).mockResolvedValue(makeVersion())
                vi.mocked(db.projectVersionMedia.deleteMany).mockResolvedValue({count: 0})
                vi.mocked(db.projectVersionMedia.createMany).mockResolvedValue({count: 1})
                const res = await editVersion(loginAs("ADMIN"), {media: [versionMedia(ownMedia)]})
                expect(res.status).toBe(201)
                expect(db.projectVersionMedia.createMany).toHaveBeenCalledWith({
                    data: [{mediaId: ownMedia, projectVersionId: versionId, deviceType: "PHONE", order: "a"}],
                })
            })
        })
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
describe("GET /project/:projectSlug", () => {
    test("404s for an unpublished project", async () => {
        vi.mocked(db.projectSlug.findUnique).mockResolvedValue(makeProjectSlug({project: makeProject({published: false})}))
        const res = await app.request("/project/test-app", {headers: loginAs("ADMIN")})
        expect(res.status).toBe(404)
    })

    test("looks up the slug and records a view", async () => {
        const project = makeProject()
        vi.mocked(db.projectSlug.findUnique).mockResolvedValue(makeProjectSlug({project}))
        vi.mocked(db.projectView.create).mockResolvedValue({id: "view", projectId: "", viewDate: new Date()})
        const res = await app.request("/project/Test-App")
        expect(res.status).toBe(200)
        expect(db.projectSlug.findUnique).toHaveBeenCalledWith(expect.objectContaining({where: {slug: "test-app"}}))
        expect(db.projectView.create).toHaveBeenCalledWith({data: {projectId: project.id, viewDate: expect.any(String)}})
    })
})

describe("GET /project/featured", () => {
    test("drops projects with no approved version", async () => {
        vi.mocked(db.project.findMany).mockResolvedValue([
            makeProject({id: "a"}),
            makeProject({id: "b", versions: []}),
        ])
        const res = await app.request("/project/featured")
        const json = await res.json() as ProjectSearchResponse
        expect(json.projects.map(p => p.id)).toEqual(["a"])
        expect(json.info.totalResults).toBe(1)
    })

    test("picks distinct heroes only from projects that can be heroes", async () => {
        vi.mocked(db.project.findMany).mockResolvedValue([
            makeProject({id: "a", canBeHero: true}),
            makeProject({id: "b", canBeHero: false}),
            makeProject({id: "c", canBeHero: true}),
            makeProject({id: "d", canBeHero: true}),
        ])
        for (let i = 0; i < 10; i++) {
            const res = await app.request("/project/featured")
            const {info} = await res.json() as ProjectSearchResponse
            expect(info.heroIds).toHaveLength(NUM_HERO_PROJECTS_FRONT_PAGE)
            expect(new Set(info.heroIds).size).toBe(info.heroIds.length)
            expect(info.heroIds).not.toContain("b")
        }
    })

    test("returns fewer heroes when not enough are eligible", async () => {
        vi.mocked(db.project.findMany).mockResolvedValue([
            makeProject({id: "a", canBeHero: true}),
            makeProject({id: "b", canBeHero: false}),
        ])
        const res = await app.request("/project/featured")
        const {info} = await res.json() as ProjectSearchResponse
        expect(info.heroIds).toEqual(["a"])
    })
})

describe("GET /project/search filtering and ordering", () => {
    async function search(params: Record<string, string>) {
        const res = await app.request(`/project/search?${new URLSearchParams(params)}`)
        const json = await res.json() as ProjectSearchResponse
        return json.projects.map(p => p.id)
    }

    test("filters by category name", async () => {
        vi.mocked(db.project.findMany).mockResolvedValue([
            makeProject({id: "a", categories: ["Games"]}),
            makeProject({id: "b", categories: ["Business"]}),
            makeProject({id: "c", categories: ["Health", "Games"]}),
        ])
        expect(await search({categoryNames: "Games"})).toEqual(["a", "c"])
        expect(await search({categoryNames: "Business,Health"})).toEqual(["b", "c"])
    })

    test("filters by category id", async () => {
        const a = makeProject({id: "a", categories: ["Games"]})
        const b = makeProject({id: "b", categories: ["Business"]})
        vi.mocked(db.project.findMany).mockResolvedValue([a, b])
        expect(await search({categoryIds: b.versions[0].categories[0].categoryId})).toEqual(["b"])
    })

    test("orders by name", async () => {
        vi.mocked(db.project.findMany).mockResolvedValue([
            makeProject({id: "b", versionName: "Banana"}),
            makeProject({id: "a", versionName: "Apple"}),
            makeProject({id: "c", versionName: "Cherry"}),
        ])
        expect(await search({orderBy: "nameAsc"})).toEqual(["a", "b", "c"])
        expect(await search({orderBy: "nameDesc"})).toEqual(["c", "b", "a"])
    })

    test("orders by showcase date", async () => {
        const at = (daysAgo: number) => makeShowcase({publishedDate: new Date(Date.now() - daysAgo * 86_400_000)})
        vi.mocked(db.project.findMany).mockResolvedValue([
            makeProject({id: "middle", showcase: at(5)}),
            makeProject({id: "newest", showcase: at(1)}),
            makeProject({id: "oldest", showcase: at(10)}),
        ])
        expect(await search({orderBy: "dateAsc"})).toEqual(["oldest", "middle", "newest"])
        expect(await search({orderBy: "dateDesc"})).toEqual(["newest", "middle", "oldest"])
    })

    test("random order returns up to the limit without duplicates", async () => {
        vi.mocked(db.project.findMany).mockResolvedValue(validFindMany)
        const ids = await search({orderBy: "random", limit: "5"})
        expect(ids).toHaveLength(5)
        expect(new Set(ids).size).toBe(5)
    })
})

describe("GET /project/id/:projectId/slug", () => {
    test("returns the project's slugs", async () => {
        const project = makeProject({slug: "my-app"})
        vi.mocked(db.project.findUnique).mockResolvedValue(project)
        const res = await app.request(`/project/id/${project.id}/slug`, {headers: loginAs("ADMIN")})
        expect(res.status).toBe(200)
        const json = await res.json() as {slugs: {slug: string}[]}
        expect(json.slugs.map(s => s.slug)).toEqual(["my-app"])
    })

    test("404s for an unknown project", async () => {
        vi.mocked(db.project.findUnique).mockResolvedValue(null)
        const res = await app.request("/project/id/nope/slug", {headers: loginAs("ADMIN")})
        expect(res.status).toBe(404)
    })
})

describe("POST /project creation", () => {
    function create(headers: Record<string, string>, body: object = {}) {
        return app.request("/project", {method: "POST", headers, body: JSON.stringify(body)})
    }

    function stubCreate() {
        const project = makeProject({id: "project-1"})
        vi.mocked(db.project.create).mockResolvedValue({...project, versions: [makeVersion({id: "version-1"})]} as never)
        vi.mocked(db.projectOwner.create).mockResolvedValue(makeOwnership("", "project-1"))
        vi.mocked(db.projectSlug.create).mockResolvedValue(project.slugs[0])
    }

    test("creates an unpublished draft owned by the student, using their name as developer", async () => {
        const showcase = makeShowcase()
        vi.mocked(db.showcase.findFirst).mockResolvedValue(showcase)
        stubCreate()
        const res = await create(loginAs("STUDENT", {id: "student-1", name: "Sam"}))
        expect(res.status).toBe(200)
        expect(await res.json()).toEqual({projectId: "project-1", versionId: "version-1"})

        const {data} = vi.mocked(db.project.create).mock.calls[0][0]
        expect(data).toMatchObject({showcaseId: showcase.id, published: false, featured: false, canBeHero: false})
        expect(data.versions?.create).toEqual([
            expect.objectContaining({developerNames: ["Sam"], submissionStatus: "NOT_SUBMITTED"}),
        ])
        expect(db.projectOwner.create).toHaveBeenCalledWith({data: {projectId: "project-1", ownerId: "student-1"}})
        expect(db.projectSlug.create).toHaveBeenCalledWith({
            data: expect.objectContaining({projectId: "project-1", slug: "project-1"}),
        })
    })

    test("pre-approves admin-created projects in the requested showcase", async () => {
        const showcaseId = crypto.randomUUID()
        stubCreate()
        const res = await create(loginAs("ADMIN"), {showcaseId})
        expect(res.status).toBe(200)
        expect(db.showcase.findFirst).not.toHaveBeenCalled()
        const {data} = vi.mocked(db.project.create).mock.calls[0][0]
        expect(data.showcaseId).toBe(showcaseId)
        expect(data.versions?.create).toEqual([
            expect.objectContaining({developerNames: [], submissionStatus: "APPROVED"}),
        ])
    })

    test("400s when there are no showcases", async () => {
        vi.mocked(db.showcase.findFirst).mockResolvedValue(null)
        const res = await create(loginAs("STUDENT"))
        expect(res.status).toBe(400)
        expect(db.project.create).not.toHaveBeenCalled()
    })
})

describe("POST /project/id/:projectId/slug", () => {
    function addSlug(slug: string) {
        return app.request("/project/id/project-1/slug", {
            method: "POST",
            headers: loginAs("ADMIN"),
            body: JSON.stringify({slug}),
        })
    }

    test("lowercases the new slug", async () => {
        vi.mocked(db.projectSlug.create).mockResolvedValue({slug: "", projectId: "", assignedDate: new Date()})
        const res = await addSlug("My-App")
        expect(res.status).toBe(200)
        expect(db.projectSlug.create).toHaveBeenCalledWith({
            data: {projectId: "project-1", slug: "my-app", assignedDate: expect.any(Date)},
        })
    })

    test("409s naming the project that already has the slug", async () => {
        vi.mocked(db.projectSlug.create).mockRejectedValue(
            new Prisma.PrismaClientKnownRequestError("dupe", {code: "P2002", clientVersion: "test"})
        )
        vi.mocked(db.projectSlug.findUnique).mockResolvedValue(makeProjectSlug({
            project: makeProject({id: "other-project", versionName: "Other App"}),
        }))
        const res = await addSlug("taken")
        expect(res.status).toBe(409)
        const json = await res.json() as {error: string}
        expect(json.error).toContain("Other App")
        expect(json.error).toContain("other-project")
    })

    test("rejects malformed input", async () => {
        const res = await app.request("/project/id/project-1/slug", {
            method: "POST",
            headers: loginAs("ADMIN"),
            body: JSON.stringify({slug: 1}),
        })
        expect(res.status).toBe(400)
    })
})

describe("DELETE /project/id/:projectId/slug", () => {
    test("only deletes the slug if it belongs to the project", async () => {
        vi.mocked(db.projectSlug.delete).mockResolvedValue({slug: "", projectId: "", assignedDate: new Date()})
        const res = await app.request("/project/id/project-1/slug", {
            method: "DELETE",
            headers: loginAs("ADMIN"),
            body: JSON.stringify({slug: "Old-Slug"}),
        })
        expect(res.status).toBe(200)
        expect(db.projectSlug.delete).toHaveBeenCalledWith({where: {slug: "old-slug", projectId: "project-1"}})
    })
})

describe("DELETE /project/:projectId cleanup", () => {
    function deleteProject() {
        return app.request("/project/project-1", {method: "DELETE", headers: loginAs("ADMIN")})
    }

    function deletedKeys(callIndex: number) {
        const command = vi.mocked(s3.send).mock.calls[callIndex][0] as DeleteObjectsCommand
        return {
            bucket: command.input.Bucket,
            keys: command.input.Delete!.Objects!.map(o => o.Key).sort(),
        }
    }

    test("404s for an unknown project", async () => {
        vi.mocked(db.project.findUnique).mockResolvedValue(null)
        const res = await deleteProject()
        expect(res.status).toBe(404)
        expect(db.project.delete).not.toHaveBeenCalled()
    })

    test("deletes the project's media, hero art and icons from S3", async () => {
        vi.stubEnv("BUCKET_MEDIA", "media-bucket")
        vi.stubEnv("BUCKET_ICONS", "icon-bucket")
        const media = (mediaUrl: string, mediaType: "SCREENSHOT" | "VIDEO") =>
            ({id: mediaUrl, projectId: "project-1", mediaUrl, mediaType, status: "AVAILABLE", createdAt: new Date()} as const)
        vi.mocked(db.project.findUnique).mockResolvedValue(makeProject({
            id: "project-1",
            media: [media("shot", "SCREENSHOT"), media("vid", "VIDEO")],
            versions: [
                makeVersion({heroArtUrl: "hero", iconUrl: "icon"}),
                makeVersion({heroArtUrl: null, iconUrl: "icon"}),
                makeVersion({heroArtUrl: null, iconUrl: ""}),
            ],
        }))
        vi.mocked(db.project.delete).mockResolvedValue(makeProject())
        const res = await deleteProject()
        expect(res.status).toBe(200)
        expect(db.project.delete).toHaveBeenCalledWith({where: {id: "project-1"}})
        expect(deletedKeys(0)).toEqual({bucket: "media-bucket", keys: ["hero.webp", "shot.webp", "vid.webm"]})
        expect(deletedKeys(1)).toEqual({bucket: "icon-bucket", keys: ["icon.webp"]})
        vi.unstubAllEnvs()
    })

    test("doesn't call S3 when there is nothing to delete", async () => {
        vi.mocked(db.project.findUnique).mockResolvedValue(makeProject({versions: [makeVersion({iconUrl: ""})]}))
        vi.mocked(db.project.delete).mockResolvedValue(makeProject())
        const res = await deleteProject()
        expect(res.status).toBe(200)
        expect(s3.send).not.toHaveBeenCalled()
    })
})
