import {beforeEach, describe, expect, test, vi} from "vitest";
import {mockReset} from "vitest-mock-extended";

const {send} = vi.hoisted(() => ({send: vi.fn()}))

vi.mock("@aws-sdk/client-s3", () => {
    class Command<T> {
        input: T
        constructor(input: T) {
            this.input = input
        }
    }
    return {
        S3Client: class { send = send },
        ListObjectsV2Command: class ListObjectsV2Command extends Command<{Bucket: string}> {},
        DeleteObjectsCommand: class DeleteObjectsCommand extends Command<{Bucket: string, Delete: {Objects: {Key: string}[]}}> {},
    }
})

vi.mock("@hapi/shared/db", async () => {
    const {mockDeep} = await import("vitest-mock-extended")
    return {db: mockDeep()}
})

import {db} from "@hapi/shared/db";
import {handler} from "./lambda";

const DAY = 24 * 60 * 60 * 1000
const old = new Date(Date.now() - 2 * DAY)
const recent = new Date(Date.now() - 60 * 1000)

type StoredObject = {Key: string, LastModified: Date}

function stubBuckets(buckets: Record<string, StoredObject[]>) {
    send.mockImplementation(async (command: {constructor: {name: string}, input: {Bucket: string}}) => {
        if (command.constructor.name === "ListObjectsV2Command") {
            return {Contents: buckets[command.input.Bucket] ?? [], IsTruncated: false}
        }
        return {}
    })
}

function deletedKeys(bucket: string) {
    return send.mock.calls
        .map(([command]) => command)
        .filter((command) => command.constructor.name === "DeleteObjectsCommand" && command.input.Bucket === bucket)
        .flatMap((command) => command.input.Delete.Objects.map((o: {Key: string}) => o.Key))
}

function stubVersions(versions: {iconUrl: string, heroArtUrl?: string, mediaUrls?: string[]}[]) {
    vi.mocked(db.projectVersion.findMany).mockResolvedValue(versions.map((v) => ({
        iconUrl: v.iconUrl,
        heroArtUrl: v.heroArtUrl ?? null,
        media: (v.mediaUrls ?? []).map((mediaUrl) => ({media: {mediaUrl}})),
    })) as never)
}

beforeEach(() => {
    send.mockReset()
    mockReset(db)
    vi.mocked(db.projectMedia.deleteMany).mockResolvedValue({count: 0})
    process.env.BUCKET_ICONS = "icons"
    process.env.BUCKET_MEDIA = "media"
})

describe("media cleanup", () => {
    test("deletes unused files older than the grace period", async () => {
        stubVersions([{iconUrl: "icon-in-use", heroArtUrl: "hero-in-use", mediaUrls: ["shot-in-use"]}])
        stubBuckets({
            icons: [
                {Key: "icon-in-use.webp", LastModified: old},
                {Key: "icon-unused.webp", LastModified: old},
            ],
            media: [
                {Key: "hero-in-use.webp", LastModified: old},
                {Key: "shot-in-use.webp", LastModified: old},
                {Key: "shot-unused.webp", LastModified: old},
                {Key: "video-unused.webm", LastModified: old},
            ],
        })

        await handler()

        expect(deletedKeys("icons")).toEqual(["icon-unused.webp"])
        expect(deletedKeys("media")).toEqual(["shot-unused.webp", "video-unused.webm"])
    })

    test("keeps unused files uploaded within the grace period", async () => {
        stubVersions([{iconUrl: "icon-in-use", mediaUrls: ["shot-in-use"]}])
        stubBuckets({
            icons: [{Key: "icon-new.webp", LastModified: recent}],
            media: [
                {Key: "shot-new.webp", LastModified: recent},
                {Key: "transcode_in/video-new", LastModified: recent},
            ],
        })

        await handler()

        expect(deletedKeys("icons")).toEqual([])
        expect(deletedKeys("media")).toEqual([])
    })

    test("deletes media records linked to no version, once past the grace period", async () => {
        stubVersions([{iconUrl: "icon-in-use", mediaUrls: ["shot-in-use"]}])
        stubBuckets({})
        vi.mocked(db.projectMedia.deleteMany).mockResolvedValue({count: 3})

        const result = await handler()

        const [query] = vi.mocked(db.projectMedia.deleteMany).mock.calls[0]
        expect(query?.where?.versionInclusions).toEqual({none: {}})
        const cutoff = (query?.where?.createdAt as {lt: Date}).lt
        expect(Date.now() - cutoff.getTime()).toBeGreaterThanOrEqual(DAY - 1000)
        expect(Date.now() - cutoff.getTime()).toBeLessThan(DAY + 60 * 1000)
        expect(result.deletedMediaRecords).toBe(3)
    })

    test("aborts without deleting anything if no icons are in use", async () => {
        stubVersions([])
        stubBuckets({icons: [{Key: "icon.webp", LastModified: old}]})

        await expect(handler()).rejects.toThrow(/aborting/)
        expect(deletedKeys("icons")).toEqual([])
        expect(db.projectMedia.deleteMany).not.toHaveBeenCalled()
    })
})
