type OwnershipHaver = {
    ownerId: string,
}

export function isOwner(userId: string, records: OwnershipHaver[]) {
    for (const r of records) {
        if (r.ownerId === userId) {
            return true
        }
    }
    return false
}
