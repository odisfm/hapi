import {v4} from 'uuid';

export function createUuid():string { return v4() }

export function resolveStorageUrl(bucketUrl: string, storageKey: string, extension = "") {
    if (storageKey.startsWith("http://") || storageKey.startsWith("https://")) {
        return storageKey;
    }

    return `${bucketUrl}${storageKey}${extension}`;
}

export async function throwErrorFromResponse(response: Response) {
    let json
    try {
        json = await response.json();
    } catch {
        throw new Error(response.statusText)
    }
    if (json.error) {
        throw new Error(json.error)
    } else {
        throw new Error(response.statusText)
    }
}
