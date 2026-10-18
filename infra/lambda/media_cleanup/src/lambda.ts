import {
    S3Client,
    type ListObjectsV2CommandInput,
    ListObjectsV2Command,
    DeleteObjectsCommand
} from "@aws-sdk/client-s3";
import {db} from "@hapi/shared/db"

const s3 = new S3Client();

const IMAGE_EXTENSION = ".webp";
const VIDEO_EXTENSION = ".webm";
const DELETE_BATCH_SIZE = 1000; // S3 DeleteObjects max per request
const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000; // new uploads may not be saved to a version yet

type StoredObject = {key: string, lastModified?: Date};

const stripExtension = (key: string) =>
    key.replace(IMAGE_EXTENSION, "").replace(VIDEO_EXTENSION, "");

const listAllObjects = async (bucket: string): Promise<StoredObject[]> => {
    const objects: StoredObject[] = [];
    let continuationToken: string | undefined;

    do {
        const input: ListObjectsV2CommandInput = {
            Bucket: bucket,
            ContinuationToken: continuationToken
        };

        const response = await s3.send(new ListObjectsV2Command(input));

        for (const object of response.Contents ?? []) {
            if (object.Key) objects.push({key: object.Key, lastModified: object.LastModified});
        }

        continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
    } while (continuationToken);

    return objects;
};

const deleteKeys = async (bucket: string, keys: string[]): Promise<void> => {
    for (let i = 0; i < keys.length; i += DELETE_BATCH_SIZE) {
        const batch = keys.slice(i, i + DELETE_BATCH_SIZE);

        const response = await s3.send(new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: {
                Objects: batch.map((Key) => ({Key})),
                Quiet: true
            }
        }));

        if (response.Errors?.length) {
            console.error("Failed to delete some objects:", response.Errors);
        }
    }
};

export const handler = async function() {
    const iconBucket = process.env.BUCKET_ICONS;
    const mediaBucket = process.env.BUCKET_MEDIA
    if (!iconBucket) {
        throw new Error("BUCKET_ICONS is not set");
    }
    if (!mediaBucket) {
        throw new Error("BUCKET_MEDIA is not set");
    }

    const cutoff = new Date(Date.now() - GRACE_PERIOD_MS);
    const deletable = (objects: StoredObject[], inUse: Set<string>) => objects
        .filter((o) => o.lastModified && o.lastModified < cutoff && !inUse.has(stripExtension(o.key)))
        .map((o) => o.key);

    const iconBucketObjects = await listAllObjects(iconBucket);
    const mediaBucketObjects = await listAllObjects(mediaBucket);

    const versionRecords = await db.projectVersion.findMany({
        include: {
            media: {include: {media: true}}
        }
    })
    const inUseIcons = new Set(
        versionRecords
            .map((v) => v.iconUrl)
            .filter((url): url is string => !!url)
    );

    if (inUseIcons.size === 0) {
        throw new Error("No in-use icons found in DB; aborting to avoid deleting every object.");
    }

    const iconKeys = deletable(iconBucketObjects, inUseIcons);

    await deleteKeys(iconBucket, iconKeys);

    const inUseMedia = new Set<string>()
    for (const v of versionRecords) {
        for (const m of v.media) {
            inUseMedia.add(m.media.mediaUrl)
        }
        if (v.heroArtUrl) {
            inUseMedia.add(v.heroArtUrl)
        }
    }

    if (inUseMedia.size === 0) {
        throw new Error("No in-use media found in DB; aborting to avoid deleting every object.");
    }

    const mediaKeys = deletable(mediaBucketObjects, inUseMedia);

    await deleteKeys(mediaBucket, mediaKeys)

    const deletedMediaRecords = await db.projectMedia.deleteMany({
        where: {versionInclusions: {none: {}}, createdAt: {lt: cutoff}}
    })

    return {
        deletedIcons: iconKeys.length,
        keptIcons: iconBucketObjects.length - iconKeys.length,
        deletedMedia: mediaKeys.length,
        keptMedia: mediaBucketObjects.length - mediaKeys.length,
        deletedMediaRecords: deletedMediaRecords.count,
    };
}
