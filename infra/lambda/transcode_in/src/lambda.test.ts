import {beforeEach, describe, expect, test, vi} from "vitest";
import {mockReset} from "vitest-mock-extended";
import type {S3Event} from "aws-lambda";

const {s3Send, mediaConvertSend, Command} = vi.hoisted(() => {
    class Command<T> {
        input: T
        constructor(input: T) {
            this.input = input
        }
    }
    return {s3Send: vi.fn(), mediaConvertSend: vi.fn(), Command}
})

vi.mock("@aws-sdk/client-s3", () => ({
    S3Client: class { send = s3Send },
    DeleteObjectCommand: class DeleteObjectCommand extends Command<{Bucket: string, Key: string}> {},
}))

vi.mock("@aws-sdk/client-mediaconvert", () => ({
    MediaConvertClient: class { send = mediaConvertSend },
    ProbeCommand: class ProbeCommand extends Command<object> {},
    CreateJobCommand: class CreateJobCommand extends Command<object> {},
}))

vi.mock("@hapi/shared/db", async () => {
    const {mockDeep} = await import("vitest-mock-extended")
    return {db: mockDeep()}
})

import {db} from "@hapi/shared/db";
import {handler} from "./lambda";

const URI = "video-uuid"
const THREE_MINUTES = 180 // seconds

type Payer = {id: string, videoTranscodeCredits: number | null}

const student = (id: string, credits: number): Payer => ({id, videoTranscodeCredits: credits})
const admin: Payer = {id: "admin-1", videoTranscodeCredits: null}

function s3Event(): S3Event {
    return {Records: [{s3: {bucket: {name: "in-bucket"}, object: {key: `transcode_in/${URI}.mov`}}}]} as unknown as S3Event
}

function stubMedia(uploader: Payer | null, owners: Payer[]) {
    vi.mocked(db.projectMedia.findUnique).mockResolvedValue({
        mediaUrl: URI,
        uploader,
        project: {ownerships: owners.map((owner) => ({owner}))},
    } as never)
}

function chargedUserIds() {
    return vi.mocked(db.user.update).mock.calls.map(([args]) => args.where.id)
}

function jobsCreated() {
    return mediaConvertSend.mock.calls.filter(([command]) => command.constructor.name === "CreateJobCommand").length
}

function failureReason() {
    const failed = vi.mocked(db.projectMedia.update).mock.calls.find(([args]) => args.data.status === "FAILED")
    return failed?.[0].data.failureReason
}

beforeEach(() => {
    s3Send.mockReset().mockResolvedValue({})
    mediaConvertSend.mockReset().mockImplementation(async (command: {constructor: {name: string}}) => {
        if (command.constructor.name === "ProbeCommand") {
            return {
                ProbeResults: [{
                    Container: {
                        Format: "mov",
                        Duration: THREE_MINUTES,
                        Tracks: [{TrackType: "video", VideoProperties: {Width: 1920, Height: 1080}}],
                    },
                    TrackMappings: [{AudioTrackIndexes: []}],
                }],
            }
        }
        return {}
    })
    mockReset(db)
    vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("charging video credits", () => {
    test("charges the uploader, not the project's owner", async () => {
        stubMedia(student("uploader", 10), [student("owner", 10)])

        await handler(s3Event())

        expect(chargedUserIds()).toEqual(["uploader"])
        expect(db.user.update).toHaveBeenCalledWith({
            where: {id: "uploader"},
            data: {videoTranscodeCredits: {decrement: 3}},
        })
        expect(jobsCreated()).toBe(1)
    })

    test("doesn't charge anyone when an admin uploads to a student's project", async () => {
        stubMedia(admin, [student("owner", 10)])

        await handler(s3Event())

        expect(db.user.update).not.toHaveBeenCalled()
        expect(jobsCreated()).toBe(1)
    })

    test("falls back to the owner when no uploader was recorded", async () => {
        stubMedia(null, [student("owner", 10)])

        await handler(s3Event())

        expect(chargedUserIds()).toEqual(["owner"])
        expect(jobsCreated()).toBe(1)
    })

    test("fails the upload when the uploader is out of credits, even if the owner isn't", async () => {
        stubMedia(student("uploader", 2), [student("owner", 10)])

        await handler(s3Event())

        expect(failureReason()).toBe("Not enough video upload credits")
        expect(db.user.update).not.toHaveBeenCalled()
        expect(jobsCreated()).toBe(0)
    })

    test("fails the upload, rather than leaving it pending, when there's nobody to charge", async () => {
        stubMedia(null, [])

        await handler(s3Event())

        expect(failureReason()).toBe("Uncaught error")
        expect(jobsCreated()).toBe(0)
        expect(s3Send).toHaveBeenCalledWith(expect.objectContaining({input: {Bucket: "in-bucket", Key: `transcode_in/${URI}.mov`}}))
    })

    test("refunds the uploader if the transcode job can't be created", async () => {
        stubMedia(student("uploader", 10), [student("owner", 10)])
        const probe = mediaConvertSend.getMockImplementation()!
        mediaConvertSend.mockImplementation(async (command: {constructor: {name: string}}) => {
            if (command.constructor.name === "CreateJobCommand") throw new Error("MediaConvert down")
            return probe(command)
        })

        await handler(s3Event())

        expect(db.user.update).toHaveBeenLastCalledWith({
            where: {id: "uploader"},
            data: {videoTranscodeCredits: {increment: 3}},
        })
        expect(failureReason()).toBe("Uncaught error")
    })
})
