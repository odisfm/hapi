// Deletes all icons/screenshots in the dev or staging bucket and resets them to default

import {
    S3Client,
    type ListObjectsCommandInput,
    ListObjectsCommand,
    type DeleteObjectsCommandInput,
    DeleteObjectsCommand,
    type CopyObjectCommandInput,
    CopyObjectCommand
} from "@aws-sdk/client-s3"

const sourceIconBucketName = process.env.BUCKET_ICONS_SOURCE
if (!sourceIconBucketName) {
    console.error(`Missing env variable "BUCKET_ICONS_SOURCE"`)
    process.exit(1)
}
const sourceMediaBucketName = process.env.BUCKET_MEDIA_SOURCE
if (!sourceMediaBucketName) {
    console.error(`Missing env variable "BUCKET_MEDIA_SOURCE"`)
    process.exit(1)
}
const destinationIconBucketName = process.env.BUCKET_ICONS_DEST
if (!destinationIconBucketName) {
    console.error(`Missing env variable "BUCKET_ICONS_DEST"`)
    process.exit(1)
}
const destinationMediaBucketName = process.env.BUCKET_MEDIA_DEST
if (!destinationMediaBucketName) {
    console.error(`Missing env variable "BUCKET_MEDIA_DEST"`)
    process.exit(1)
}

if (
    destinationIconBucketName.toLowerCase().includes("prod") ||
    destinationMediaBucketName.toLowerCase().includes("prod")
) {
    console.error(`Destination appears to be prod, exiting!`)
    process.exit(1)
}

const s3Client = new S3Client()

async function resetBucket(sourceBucketName: string, destinationBucketName: string) {
    const listDestinationObjectsCommand: ListObjectsCommandInput = {
        Bucket: destinationBucketName
    }
    const destinationObjectsOutput = await s3Client.send(
        new ListObjectsCommand(listDestinationObjectsCommand)
    )

    const existingDestinationObjects = destinationObjectsOutput.Contents

    if (existingDestinationObjects === undefined) {

    } else {
        const deleteDestinationObjectsCommand: DeleteObjectsCommandInput = {
            Bucket: destinationBucketName,
            Delete: {
                Objects: existingDestinationObjects.map(o => ({Key: o.Key!})),
            }
        }

        const res = await s3Client.send(new DeleteObjectsCommand(deleteDestinationObjectsCommand))
        if (res.Errors) {
            for (const e of res.Errors) {
                console.error(`error deleting object ${e.Key}`)
                console.error(e)
            }
        }
    }

    const listSourceObjectsCommand: ListObjectsCommandInput = {
        Bucket: sourceBucketName
    }

    const sourceObjectsOutput = await s3Client.send(new ListObjectsCommand(listSourceObjectsCommand))

    const existingSourceObjects = sourceObjectsOutput.Contents!
    for (const obj of existingSourceObjects) {
        const copyCommandInput: CopyObjectCommandInput = {
            Bucket: destinationBucketName,
            CopySource: encodeURI(`/${sourceBucketName}/${obj.Key}`),
            Key: obj.Key
        }
        await s3Client.send(new CopyObjectCommand(copyCommandInput))
    }
}

console.log(`Resetting icons`)
await resetBucket(sourceIconBucketName, destinationIconBucketName)
console.log(`Success`)
console.log(`Resetting media`)
await resetBucket(sourceMediaBucketName, destinationMediaBucketName)
console.log(`Success`)

console.log(`Done!`)
process.exit(0)
