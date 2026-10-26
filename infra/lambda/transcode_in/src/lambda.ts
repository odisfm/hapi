import { S3Client, type DeleteObjectCommandInput, DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
    MediaConvertClient,
    type CreateJobCommandInput,
    type JobSettings,
    type Input, type OutputGroup, type Output, CreateJobCommand, type OutputGroupSettings,
    ProbeCommand
} from "@aws-sdk/client-mediaconvert";
import type { S3Event } from "aws-lambda";
import {db} from "@hapi/shared/db"

const s3 = new S3Client();
const mediaConvertClient = new MediaConvertClient()

const MAX_LONG_EDGE = 1920;

type ProbeInfo = { hasAudio: boolean; width: number; height: number, duration: number };

async function probeMedia(bucket: string, key: string): Promise<ProbeInfo> {
    const res = await mediaConvertClient.send(new ProbeCommand({
        InputFiles: [{ FileUrl: `s3://${bucket}/${key}` }],
    }));

    const result = res.ProbeResults?.[0];
    if (!result?.Container?.Format) {
        throw new Error(`Unrecognized media format: ${key}`);
    }

    const videoTrack = result.Container.Tracks?.find(t => t.TrackType === "video");
    const width = videoTrack?.VideoProperties?.Width;
    const height = videoTrack?.VideoProperties?.Height;
    if (!width || !height) {
        throw new Error(`No video track with dimensions found: ${key}`);
    }

    const duration = result.Container.Duration!

    return {
        hasAudio: (result.TrackMappings?.[0]?.AudioTrackIndexes?.length ?? 0) > 0,
        width,
        height,
        duration
    };
}

function outputDimensions(width: number, height: number) {
    const isVertical = height > width;
    const longEdge = isVertical ? height : width;
    const scale = Math.min(1, MAX_LONG_EDGE / longEdge);
    const even = (n: number) => Math.max(2, Math.floor((n * scale) / 2) * 2);
    return { width: even(width), height: even(height), isVertical };
}

export const handler = async (event: S3Event) => {

    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const baseName = key.replace(/\.[^/.]+$/, "");
    const destination = `s3://${process.env.OUTPUT_BUCKET}/${baseName
        .replace("transcode_in/", "transcode_out/")
    }`;
    const uri = baseName.replace("transcode_in/", "");
    let success = false;
    let didDeductCredits = false
    const { hasAudio, width, height, duration } = await probeMedia(bucket, key);
    const roundedDurationMinutes = Math.round(duration / 60);
    const record = await db.projectMedia.findUnique({
        where: {
            mediaUrl: uri
        },
        include: {
            project: {
                include: {
                    ownerships: {
                        include: {
                            owner: true
                        }
                    }
                }
            }
        }
    })
    if (!record) {
        throw new Error(`No DB record with URI ${uri}`)
    }
    const owner = record.project.ownerships[0].owner
    // DB schema technically allows multiple project owners but this is not implemented on frontend

    try {

        if (owner.videoTranscodeCredits !== null) { // admins have null (unlimited credits)
            if (roundedDurationMinutes > owner.videoTranscodeCredits) {
                await db.projectMedia.update({
                    where: {
                        mediaUrl: uri
                    },
                    data: {
                        status: "FAILED",
                        failureReason: "Not enough video upload credits"
                    }
                })
                await s3.send(new DeleteObjectCommand({
                    Bucket: bucket,
                    Key: key,
                }))

                return
            }
            await db.user.update({
                where: {
                    id: owner.id
                },
                data: {
                    videoTranscodeCredits: {
                        decrement: roundedDurationMinutes
                    }
                }
            })
            didDeductCredits = true
        }

        const dims = outputDimensions(width, height);

        const jobSettings: JobSettings = {
            Inputs: [
                {
                    FileInput: `s3://${bucket}/${key}`,
                    VideoSelector: {
                        Rotate: "AUTO"
                    },
                    TimecodeSource: "ZEROBASED",
                    ...(hasAudio && {
                        AudioSelectors: {
                            "Audio Selector 1": {
                                DefaultSelection: "DEFAULT",
                            },
                        },
                    }),
                } satisfies Input,
            ],
            OutputGroups: [
                {
                    Name: "File Group",
                    OutputGroupSettings: {
                        Type: "FILE_GROUP_SETTINGS",
                        FileGroupSettings: {
                            Destination: destination,
                        },
                    } satisfies OutputGroupSettings,
                    Outputs: [
                        {
                            Extension: "webm",
                            ContainerSettings: {
                                Container: "WEBM",
                            },
                            VideoDescription: {
                                Width: dims.width,
                                Height: dims.height,
                                ScalingBehavior: "STRETCH_TO_OUTPUT",
                                AntiAlias: "ENABLED",
                                Sharpness: 50,
                                CodecSettings: {
                                    Codec: "VP9",
                                    Vp9Settings: {
                                        RateControlMode: "VBR",
                                        Bitrate: 5_000_000,
                                        MaxBitrate: 8_000_000,
                                        QualityTuningLevel: "MULTI_PASS_HQ",
                                        FramerateControl: "INITIALIZE_FROM_SOURCE",
                                        ParControl: "INITIALIZE_FROM_SOURCE",
                                    },
                                },
                            },
                            ...(hasAudio && {AudioDescriptions: [
                                {
                                    AudioSourceName: "Audio Selector 1",
                                    CodecSettings: {
                                        Codec: "OPUS",
                                        OpusSettings: {
                                            Bitrate: 128_000,
                                            Channels: 2,
                                            SampleRate: 48_000,
                                        },
                                    },
                                },
                            ]})
                        } satisfies Output,
                    ],
                } satisfies OutputGroup,
            ],
        };
        const convertJobInput: CreateJobCommandInput = {
            Role: process.env.ROLE_ARN,
            Settings: jobSettings
        }

        await mediaConvertClient.send(new CreateJobCommand(convertJobInput))
        success = true;

    } catch (err) {
        console.error(err);
    } finally {
        if (!success) {
            await db.projectMedia.update({
                where: {mediaUrl: uri},
                data: {
                    status: "FAILED",
                    failureReason: "Uncaught error"
                }
            })

            await s3.send(new DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            } satisfies DeleteObjectCommandInput))

            if (didDeductCredits) {
                await db.user.update({
                    where: {
                        id: owner.id
                    },
                    data: {
                        videoTranscodeCredits: {
                            increment: roundedDurationMinutes
                        }
                    }
                })
            }

        }
    }
};
