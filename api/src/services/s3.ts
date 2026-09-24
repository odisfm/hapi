import {
    PutObjectCommand,
    type PutObjectCommandInput,
    S3Client,
} from "@aws-sdk/client-s3"
import {
    getSignedUrl,
} from "@aws-sdk/s3-request-presigner"

export const s3 = new S3Client({
    region: process.env.AWS_REGION,
    requestChecksumCalculation: "WHEN_REQUIRED"
})

export async function createVideoUploadUrl(key: string) {
    const commandInput: PutObjectCommandInput = {
        Bucket: process.env.BUCKET_MEDIA,
        Key: `transcode_in/${key}`,
    }
    return getSignedUrl(s3, new PutObjectCommand(commandInput))
}
