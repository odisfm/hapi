import {v4} from 'uuid';

export function createUuid():string { return v4() }

export function resolveStorageUrl(bucketUrl: string, storageKey: string, extension = "") {
    if (storageKey.startsWith("http://") || storageKey.startsWith("https://")) {
        return storageKey;
    }

    return `${bucketUrl}${storageKey}${extension}`;
}

export async function throwErrorFromResponse(response: Response): Promise<never> {
    let json: unknown
    try {
        json = await response.json()
    } catch {
        throw new Error(response.statusText)
    }

    if (
        typeof json === 'object' &&
        json !== null &&
        'error' in json &&
        typeof json.error === 'string'
    ) {
        throw new Error(json.error)
    }

    throw new Error(response.statusText)
}
