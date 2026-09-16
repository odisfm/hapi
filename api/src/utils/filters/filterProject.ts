import {
    type ProjectType,
    type ProjectPreviewType,
    type ProjectAdminType,
} from "@hapi/shared/types/project";
import {type ProjectGetPayload} from "@hapi/shared/prisma/models/Project.js";
import {type UserRole} from "@hapi/shared/prisma/enums.js";

const DEFAULT_ORDER = "zzzzzzzzzzzzz"

type ProjectPayload = ProjectGetPayload<{
    include: {
        media: true,
        category: true,
        showcase: true,
        ProjectSlug: true
    }
}>

export function filterProjectPreview(project: ProjectPayload): ProjectPreviewType {
    return {
        iconUrl: project.iconUrl,
        id: project.id,
        name: project.name,
        order: project.order || DEFAULT_ORDER,
        subtitle: project.subtitle || "",
        slug: project.ProjectSlug[0].slug
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
        developers: project.developers,
        slug: project.ProjectSlug[0].slug
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
