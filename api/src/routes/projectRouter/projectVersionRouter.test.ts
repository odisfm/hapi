import {beforeEach, describe, expect, test, vi} from "vitest";

vi.mock("@hapi/shared", () => import("../../test/mockDb"))

import {db} from "@hapi/shared";
import {app} from "../../index";
import {
    inFuture,
    makeOwnership,
    makeProject,
    makeShowcase,
    makeUser,
    makeVersion,
    makeVersionWithProject,
} from "../../test/fixtures";
import type {ProjectVersionsSearchResponse} from "@hapi/shared/types/apiResponses";
import {resetDb} from "../../test/mockDb";
import {loginAs} from "../../test/auth";

const OWNER_ID = "owner-1"

function versionOwnedBy(ownerId: string) {
    const record = makeVersionWithProject({id: "version-1"})
    record.project.ownerships = [makeOwnership(ownerId, record.projectId)]
    return record
}

beforeEach(() => {
    resetDb()
})

describe("GET /project/id/:versionId", () => {
    test("rejects students who don't own the project", async () => {
        vi.mocked(db.projectVersion.findUnique).mockResolvedValue(versionOwnedBy("someone-else"))
        const res = await app.request("/project/id/version-1", {headers: loginAs("STUDENT", {id: OWNER_ID})})
        expect(res.status).toBe(403)
    })

    test("allows the owning student", async () => {
        vi.mocked(db.projectVersion.findUnique).mockResolvedValue(versionOwnedBy(OWNER_ID))
        const res = await app.request("/project/id/version-1", {headers: loginAs("STUDENT", {id: OWNER_ID})})
        expect(res.status).toBe(200)
    })
})

describe("DELETE /project/version/:versionId", () => {
    function deleteVersion(headers: Record<string, string>) {
        return app.request("/project/version/version-1", {method: "DELETE", headers})
    }

    function versionWithSibling(ownerId: string) {
        const record = versionOwnedBy(ownerId)
        record.project.versions.push(makeVersion({projectId: record.projectId}))
        return record
    }

    test("rejects students who don't own the project", async () => {
        vi.mocked(db.projectVersion.findUnique).mockResolvedValue(versionWithSibling("someone-else"))
        const res = await deleteVersion(loginAs("STUDENT", {id: OWNER_ID}))
        expect(res.status).toBe(403)
    })

    test.each([
        ["the owning student", "STUDENT"],
        ["an admin", "ADMIN"],
    ] as const)("allows %s", async (_, role) => {
        vi.mocked(db.projectVersion.findUnique).mockResolvedValue(versionWithSibling(OWNER_ID))
        vi.mocked(db.projectVersion.delete).mockResolvedValue(makeVersion())
        const res = await deleteVersion(loginAs(role, {id: OWNER_ID}))
        expect(res.status).toBe(200)
        expect(db.projectVersion.delete).toHaveBeenCalledWith({where: {id: "version-1"}})
    })
})

describe("PATCH /project/version/:versionId/status", () => {
    function setStatus(body: object, headers: Record<string, string>) {
        return app.request("/project/version/version-1/status", {
            method: "PATCH",
            headers,
            body: JSON.stringify(body),
        })
    }

    test.each(["APPROVED", "REJECTED", "SUPERSEDED"])("rejects students setting status %s", async (status) => {
        const res = await setStatus({status}, loginAs("STUDENT", {id: OWNER_ID}))
        expect(res.status).toBe(403)
    })

    test("rejects students setting a rejection reason", async () => {
        const res = await setStatus({status: "PENDING", rejectionReason: "nope"}, loginAs("STUDENT", {id: OWNER_ID}))
        expect(res.status).toBe(403)
    })

    test("rejects students submitting a project they don't own", async () => {
        vi.mocked(db.projectVersion.findUnique).mockResolvedValue(versionOwnedBy("someone-else"))
        const res = await setStatus({status: "PENDING"}, loginAs("STUDENT", {id: OWNER_ID}))
        expect(res.status).toBe(403)
    })

    test("lets the owning student submit for review, without recording a reviewer", async () => {
        vi.mocked(db.projectVersion.findUnique).mockResolvedValue(versionOwnedBy(OWNER_ID))
        vi.mocked(db.projectVersion.update).mockResolvedValue(makeVersion())
        const res = await setStatus({status: "PENDING"}, loginAs("STUDENT", {id: OWNER_ID}))
        expect(res.status).toBe(200)
        expect(db.projectVersion.update).toHaveBeenCalledWith({
            where: {id: "version-1"},
            data: {submissionStatus: "PENDING"},
        })
    })

    test("lets admins approve, superseding the previously approved version and recording the reviewer", async () => {
        const record = versionOwnedBy(OWNER_ID)
        vi.mocked(db.projectVersion.findUnique).mockResolvedValue(record)
        vi.mocked(db.projectVersion.updateMany).mockResolvedValue({count: 1})
        vi.mocked(db.projectVersion.update).mockResolvedValue(makeVersion())
        const res = await setStatus({status: "APPROVED"}, loginAs("ADMIN", {id: "admin-1"}))
        expect(res.status).toBe(200)
        expect(db.projectVersion.updateMany).toHaveBeenCalledWith({
            where: {projectId: record.projectId, submissionStatus: "APPROVED"},
            data: {submissionStatus: "SUPERSEDED"},
        })
        expect(db.projectVersion.update).toHaveBeenCalledWith({
            where: {id: "version-1"},
            data: {submissionStatus: "APPROVED", reviewerId: "admin-1", reviewedAt: expect.any(Date)},
        })
    })
})

describe("POST /project/version/:versionId/new", () => {
    test("rejects students who don't own the project", async () => {
        vi.mocked(db.projectVersion.findUnique).mockResolvedValue(versionOwnedBy("someone-else"))
        const res = await app.request("/project/version/version-1/new", {
            method: "POST",
            headers: loginAs("STUDENT", {id: OWNER_ID}),
        })
        expect(res.status).toBe(403)
    })

    test("lets the owning student create a new draft version", async () => {
        vi.mocked(db.projectVersion.findUnique).mockResolvedValue(versionOwnedBy(OWNER_ID))
        vi.mocked(db.projectVersion.create).mockResolvedValue(makeVersion({id: "version-2"}))
        vi.mocked(db.projectVersionMedia.createManyAndReturn).mockResolvedValue([])
        vi.mocked(db.projectCategory.createManyAndReturn).mockResolvedValue([])
        const res = await app.request("/project/version/version-1/new", {
            method: "POST",
            headers: loginAs("STUDENT", {id: OWNER_ID}),
        })
        expect(res.status).toBe(200)
        expect(await res.json()).toMatchObject({versionId: "version-2"})
        expect(db.projectVersion.create).toHaveBeenCalledWith({
            data: expect.objectContaining({submissionStatus: "NOT_SUBMITTED"}),
        })
    })
})

describe("GET /project/versions", () => {
    test.each([
        ["only lists students' own projects", "STUDENT", {ownerId: OWNER_ID}],
        ["lists all projects for admins", "ADMIN", {}],
    ] as const)("%s", async (_, role, where) => {
        vi.mocked(db.projectOwner.findMany).mockResolvedValue([])
        const res = await app.request("/project/versions", {headers: loginAs(role, {id: OWNER_ID})})
        expect(res.status).toBe(200)
        expect(db.projectOwner.findMany).toHaveBeenCalledWith(expect.objectContaining({where}))
    })
})

describe("DELETE /project/version/:versionId guards", () => {
    test("refuses to delete a project's only version", async () => {
        vi.mocked(db.projectVersion.findUnique).mockResolvedValue(versionOwnedBy(OWNER_ID))
        const res = await app.request("/project/version/version-1", {method: "DELETE", headers: loginAs("ADMIN")})
        expect(res.status).toBe(400)
        expect(db.projectVersion.delete).not.toHaveBeenCalled()
    })

    test("404s for an unknown version", async () => {
        vi.mocked(db.projectVersion.findUnique).mockResolvedValue(null)
        const res = await app.request("/project/version/version-1", {method: "DELETE", headers: loginAs("ADMIN")})
        expect(res.status).toBe(404)
    })
})

describe("PATCH /project/version/:versionId/status rejection", () => {
    test("records the admin's rejection reason", async () => {
        vi.mocked(db.projectVersion.findUnique).mockResolvedValue(versionOwnedBy(OWNER_ID))
        vi.mocked(db.projectVersion.update).mockResolvedValue(makeVersion())
        const res = await app.request("/project/version/version-1/status", {
            method: "PATCH",
            headers: loginAs("ADMIN", {id: "admin-1"}),
            body: JSON.stringify({status: "REJECTED", rejectionReason: "Needs screenshots"}),
        })
        expect(res.status).toBe(200)
        expect(db.projectVersion.updateMany).not.toHaveBeenCalled()
        expect(db.projectVersion.update).toHaveBeenCalledWith({
            where: {id: "version-1"},
            data: {
                submissionStatus: "REJECTED",
                rejectionReason: "Needs screenshots",
                reviewerId: "admin-1",
                reviewedAt: expect.any(Date),
            },
        })
    })
})

describe("POST /project/version/:versionId/new copying", () => {
    test("copies the previous version's media and categories onto the new version", async () => {
        const record = {
            ...versionOwnedBy(OWNER_ID),
            media: [{mediaId: "m1", projectVersionId: "version-1", deviceType: "PHONE", order: "a"}],
            categories: [{categoryId: "c1", projectVersionId: "version-1"}],
        }
        vi.mocked(db.projectVersion.findUnique).mockResolvedValue(record as never)
        vi.mocked(db.projectVersion.create).mockResolvedValue(makeVersion({id: "version-2"}))
        vi.mocked(db.projectVersionMedia.createManyAndReturn).mockResolvedValue([])
        vi.mocked(db.projectCategory.createManyAndReturn).mockResolvedValue([])
        const res = await app.request("/project/version/version-1/new", {method: "POST", headers: loginAs("ADMIN")})
        expect(res.status).toBe(200)
        expect(db.projectVersionMedia.createManyAndReturn).toHaveBeenCalledWith({
            data: [{mediaId: "m1", projectVersionId: "version-2", deviceType: "PHONE", order: "a"}],
        })
        expect(db.projectCategory.createManyAndReturn).toHaveBeenCalledWith({
            data: [{categoryId: "c1", projectVersionId: "version-2"}],
        })
        const {data} = vi.mocked(db.projectVersion.create).mock.calls[0][0]
        expect(data).not.toHaveProperty("id")
    })

    test("404s for an unknown version", async () => {
        vi.mocked(db.projectVersion.findUnique).mockResolvedValue(null)
        const res = await app.request("/project/version/version-1/new", {method: "POST", headers: loginAs("ADMIN")})
        expect(res.status).toBe(404)
    })
})

describe("GET /project/versions summaries", () => {
    const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000)
    const reviewer = makeUser({name: "Reviewer"})

    function ownerRecord(versions: ReturnType<typeof makeVersion>[], projectOverrides = {}) {
        const owner = makeUser({id: OWNER_ID, name: "Owner"})
        const project = makeProject({id: "project-1", slug: "the-app", ...projectOverrides})
        return {
            ownerId: OWNER_ID,
            projectId: project.id,
            project: {
                ...project,
                versions: versions.map(v => ({...v, reviewer: v.reviewerId ? reviewer : null})),
                ownerships: [{ownerId: OWNER_ID, projectId: project.id, owner}],
            },
        }
    }

    async function getSummaries(role: "STUDENT" | "ADMIN", records: object[]) {
        vi.mocked(db.projectOwner.findMany).mockResolvedValue(records as never)
        const res = await app.request("/project/versions", {headers: loginAs(role, {id: OWNER_ID})})
        expect(res.status).toBe(200)
        return (await res.json() as ProjectVersionsSearchResponse).versions
    }

    test("summarises the approved version, latest draft and rejection feedback", async () => {
        const [summary] = await getSummaries("STUDENT", [ownerRecord([
            makeVersion({id: "approved", name: "Live name", submissionStatus: "APPROVED", reviewedAt: daysAgo(10)}),
            makeVersion({id: "old-rejection", submissionStatus: "REJECTED", createdAt: daysAgo(8), reviewedAt: daysAgo(7), reviewerId: reviewer.id, rejectionReason: "first"}),
            makeVersion({id: "new-rejection", submissionStatus: "REJECTED", createdAt: daysAgo(6), reviewedAt: daysAgo(5), reviewerId: reviewer.id, rejectionReason: "second"}),
            makeVersion({id: "draft", submissionStatus: "NOT_SUBMITTED", createdAt: daysAgo(1)}),
        ])])

        expect(summary).toMatchObject({
            projectId: "project-1",
            projectSlug: "the-app",
            name: "Live name",
            approvedVersion: {id: "approved", live: true},
            alternateVersion: {id: "draft", status: "NOT_SUBMITTED"},
            users: [{id: OWNER_ID, name: "Owner"}],
        })
        expect(summary.feedbackHistory.map(f => f.feedback)).toEqual(["second", "first"])
        expect(summary.feedbackHistory[0].reviewer).toBe("Reviewer")
    })

    test("uses the latest draft's name when nothing is approved", async () => {
        const [summary] = await getSummaries("STUDENT", [ownerRecord([
            makeVersion({submissionStatus: "PENDING", name: "Draft name"}),
        ])])
        expect(summary.name).toBe("Draft name")
        expect(summary.approvedVersion).toBeUndefined()
    })

    test.each([
        ["the project is unpublished", {published: false}],
        ["the showcase isn't published yet", {showcase: makeShowcase({publishedDate: inFuture()})}],
    ])("doesn't mark the approved version live when %s", async (_, overrides) => {
        const [summary] = await getSummaries("STUDENT", [ownerRecord([
            makeVersion({submissionStatus: "APPROVED"}),
        ], overrides)])
        expect(summary.approvedVersion?.live).toBe(false)
    })

    test("admins only see projects with a version awaiting review", async () => {
        const summaries = await getSummaries("ADMIN", [
            ownerRecord([makeVersion({submissionStatus: "APPROVED"})]),
            ownerRecord([makeVersion({id: "pending", submissionStatus: "PENDING"})]),
        ])
        expect(summaries.map(s => s.alternateVersion?.id)).toEqual(["pending"])
    })
})
