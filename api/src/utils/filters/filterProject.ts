import {
    type ProjectType,
    type ProjectPreviewType,
    type ProjectAdminType,
} from "@hapi/shared/src/types/project.js";
import {type ProjectGetPayload} from "@hapi/shared/src/generated/prisma/models/Project.js";
import {type UserRole} from "@hapi/shared/src/generated/prisma/enums.js";

const DEFAULT_ORDER = "zzzzzzzzzzzzz"

type ProjectPayload = ProjectGetPayload<{
    include: {
        media: true,
        category: true,
        showcase: true
    }
}>

export function filterProjectPreview(project: ProjectPayload): ProjectPreviewType {
    return {
        iconUrl: project.iconUrl,
        id: project.id,
        name: project.name,
        order: project.order || DEFAULT_ORDER,
        subtitle: project.subtitle || ""
    }
}

export function filterProject(project: ProjectPayload, role: UserRole | null): ProjectType {
    let _project: ProjectType = {
        description: project.description,
        iconUrl: project.iconUrl,
        id: project.id,
        name: project.name,
        order: project.order || DEFAULT_ORDER,
        links: project.links,
        subtitle: project.subtitle || "",
        media: project.media.map(media => {
            return {
                uri: media.mediaUrl,
                order: media.order,
                mediaType: media.mediaType,
                deviceType: media.deviceType,
            }
        }),
        category: project.category.name,
        developers: project.developers
    }
    if (role === "ADMIN") {
        const _projectAdmin: ProjectAdminType = {
            ..._project,
            approvalStatus: project.approvalStatus,
            rejectionReason: project.rejectionReason,
        }
        return _projectAdmin;
    }
    return _project
}
