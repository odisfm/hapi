import {db} from "@hapi/shared";
import type {UserRole} from "@hapi/shared/prisma/enums";

export async function canEditProject(user: {id: string, role: UserRole}, projectId: string) {
    if (user.role === "ADMIN") {
        return true
    }
    const ownership = await db.projectOwner.findUnique({
        where: {ownerId_projectId: {ownerId: user.id, projectId}}
    })
    return ownership !== null
}
