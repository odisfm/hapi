import {beforeEach, describe, expect, test, vi} from "vitest";

vi.mock("@hapi/shared", () => import("../test/mockDb"))
vi.mock("../services/s3", () => ({
    s3: {send: vi.fn()},
    createVideoUploadUrl: vi.fn(),
}))

import {db} from "@hapi/shared";
import sharp from "sharp";
import {app} from "../index";
import {s3, createVideoUploadUrl} from "../services/s3";
import {resetDb} from "../test/mockDb";
import {loginAs} from "../test/auth";
import {makeOwnership} from "../test/fixtures";
import type {ProjectMediaModel} from "@hapi/shared/prisma/models";

const OWNER_ID = "owner-1"
const projectId = crypto.randomUUID()

const png = await sharp({
    create: {width: 1, height: 1, channels: 3, background: "white"}
}).png().toBuffer()

function makeMedia(overrides: Partial<ProjectMediaModel> = {}): ProjectMediaModel {
    return {
        id: "media-1",
        projectId,
        mediaUrl: "media-url",
        mediaType: "SCREENSHOT",
        status: "AVAILABLE",
        createdAt: new Date(),
        ...overrides,
    }
}

function ownedBy(ownerId: string | null) {
    vi.mocked(db.projectOwner.findUnique).mockResolvedValue(ownerId ? makeOwnership(ownerId, projectId) : null)
}

function uploadForm(data: object) {
    const form = new FormData()
    form.append("file", new File([new Uint8Array(png)], "image.png", {type: "image/png"}))
    form.append("data", JSON.stringify(data))
    return form
}

beforeEach(() => {
    resetDb()
    vi.mocked(s3.send).mockReset()
    vi.mocked(createVideoUploadUrl).mockReset().mockResolvedValue("https://upload.example.com")
})

describe("image uploads", () => {
    const UPLOADS = [
        ["/media/screenshot", {projectId, deviceType: "PHONE"}, 201],
        ["/media/hero", {projectId}, 201],
    ] as const

    test.each(UPLOADS)("POST %s rejects students who don't own the project", async (path, data) => {
        ownedBy(null)
        const res = await app.request(path, {method: "POST", headers: loginAs("STUDENT", {id: OWNER_ID}), body: uploadForm(data)})
        expect(res.status).toBe(403)
        expect(s3.send).not.toHaveBeenCalled()
    })

    test.each(UPLOADS)("POST %s lets the owning student upload", async (path, data, status) => {
        ownedBy(OWNER_ID)
        vi.mocked(db.projectMedia.create).mockResolvedValue(makeMedia())
        const res = await app.request(path, {method: "POST", headers: loginAs("STUDENT", {id: OWNER_ID}), body: uploadForm(data)})
        expect(res.status).toBe(status)
        expect(s3.send).toHaveBeenCalledOnce()
    })
})

describe("POST /media/video", () => {
    function uploadVideo(headers: Record<string, string>) {
        return app.request("/media/video", {method: "POST", headers, body: JSON.stringify({projectId})})
    }

    test("rejects students who don't own the project", async () => {
        ownedBy(null)
        const res = await uploadVideo(loginAs("STUDENT", {id: OWNER_ID}))
        expect(res.status).toBe(403)
        expect(createVideoUploadUrl).not.toHaveBeenCalled()
    })

    test("lets the owning student upload, returning the pending media record", async () => {
        ownedBy(OWNER_ID)
        const record = makeMedia({mediaType: "VIDEO", status: "PENDING"})
        vi.mocked(db.projectMedia.create).mockResolvedValue(record)
        const res = await uploadVideo(loginAs("STUDENT", {id: OWNER_ID}))
        expect(res.status).toBe(200)
        expect(await res.json()).toEqual({
            presignedUrl: "https://upload.example.com",
            projectMedia: {...record, createdAt: record.createdAt.toISOString()},
        })
        // The db mock doesn't validate fields, so pin the exact columns written
        expect(db.projectMedia.create).toHaveBeenCalledWith({
            data: {mediaUrl: expect.any(String), status: "PENDING", projectId, mediaType: "VIDEO"},
        })
        const {mediaUrl} = vi.mocked(db.projectMedia.create).mock.calls[0][0].data
        expect(createVideoUploadUrl).toHaveBeenCalledWith(mediaUrl)
    })
})

describe("deleting media", () => {
    // Media is removed by unlinking it from a version; unlinked media is cleaned up by a scheduled job
    test.each(["/media/screenshot/media-1", "/media/video/media-1"])("DELETE %s doesn't exist", async (path) => {
        const res = await app.request(path, {method: "DELETE", headers: loginAs("ADMIN")})
        expect(res.status).toBe(404)
        expect(db.projectMedia.delete).not.toHaveBeenCalled()
    })
})
