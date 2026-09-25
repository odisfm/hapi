import type { S3Event } from "aws-lambda";
import {S3Client, CopyObjectCommand, DeleteObjectCommand, DeleteObjectsCommand} from "@aws-sdk/client-s3"
import {db} from "@hapi/shared/db"

const s3 = new S3Client()


export const handler = async (event: S3Event) => {
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const uri = key.replace("transcode_out/", "").replace("transcode_out/", "").replace(".webm", "")

    const record = await db.projectMedia.findUnique({
        where: {mediaUrl: uri}
    })

    if (!record) {
        throw new Error(`No db entry for key "${uri}"`)
    }

    if (record.mediaType !== "VIDEO") {
        return
    }

    const bucket = event.Records[0].s3.bucket.name;
    await s3.send(new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${encodeURIComponent(key)}`,
        Key: `${uri}.webm`,
    }));
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));


    const deleteRecords = await db.projectMedia.findMany({
        where: {
            mediaUrl: {
                not: uri
            },
            projectId: record.projectId,
            mediaType: "VIDEO"
        }
    })

    await db.$transaction([
        db.projectMedia.update({ where: { mediaUrl: uri }, data: { status: "AVAILABLE" } }),
        db.projectMedia.deleteMany({
            where: { projectId: record.projectId, mediaType: "VIDEO", mediaUrl: { not: uri } },
        }),
    ]);

    if (deleteRecords.length > 0) {
        await s3.send(new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: {
                Objects: deleteRecords.map((r) => {
                    return {
                        Key: r.mediaUrl
                    }
                })
            }
        }))
    }

}