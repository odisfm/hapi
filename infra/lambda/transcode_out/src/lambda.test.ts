import {beforeEach, describe, expect, test, vi} from "vitest";
import {mockReset} from "vitest-mock-extended";
import type {S3Event} from "aws-lambda";

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
        CopyObjectCommand: class CopyObjectCommand extends Command<object> {},
        DeleteObjectCommand: class DeleteObjectCommand extends Command<object> {},
        DeleteObjectsCommand: class DeleteObjectsCommand extends Command<object> {},
    }
})

vi.mock("@hapi/shared/db", async () => {
    const {mockDeep} = await import("vitest-mock-extended")
    return {db: mockDeep()}
})

import {db} from "@hapi/shared/db";
import {handler} from "./lambda";

function transcodedEvent(uri: string) {
    return {
        Records: [{s3: {bucket: {name: "media"}, object: {key: `transcode_out/${uri}.webm`}}}],
    } as unknown as S3Event
}

function sentCommands() {
    return send.mock.calls.map(([command]) => ({name: command.constructor.name, input: command.input}))
}

beforeEach(() => {
    send.mockReset()
    mockReset(db)
})

describe("transcode_out", () => {
    test("moves the transcoded video into place and marks it available, leaving other videos alone", async () => {
        vi.mocked(db.projectMedia.findUnique).mockResolvedValue({
            id: "media-1", projectId: "project-1", mediaUrl: "video-new", mediaType: "VIDEO",
            status: "PENDING", createdAt: new Date(),
        })

        await handler(transcodedEvent("video-new"))

        expect(sentCommands()).toEqual([
            {name: "CopyObjectCommand", input: {Bucket: "media", CopySource: "media/transcode_out%2Fvideo-new.webm", Key: "video-new.webm"}},
            {name: "DeleteObjectCommand", input: {Bucket: "media", Key: "transcode_out/video-new.webm"}},
        ])
        expect(db.projectMedia.update).toHaveBeenCalledWith({where: {mediaUrl: "video-new"}, data: {status: "AVAILABLE"}})
        expect(db.projectMedia.deleteMany).not.toHaveBeenCalled()
    })

    test("throws for an unknown video", async () => {
        vi.mocked(db.projectMedia.findUnique).mockResolvedValue(null)

        await expect(handler(transcodedEvent("unknown"))).rejects.toThrow(/No db entry/)
        expect(send).not.toHaveBeenCalled()
    })
})
