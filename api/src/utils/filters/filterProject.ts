import {
    type ProjectType,
    type ProjectPreviewType,
    type ProjectAdminType, type ProjectPublicType, type ProjectStudentType,
} from "@hapi/shared/types/project";
import {type ProjectGetPayload} from "@hapi/shared/prisma/models";
import {type UserRole} from "@hapi/shared/prisma/enums";

const DEFAULT_ORDER = "zzzzzzzzzzzzz"

type ProjectPayload = ProjectGetPayload<{
    include: {
        showcase: true,
        slugs: true,
        versions: {
            include: {
                media: {
                    include: {
                        media: true,
                    }
                },
                categories: {
                    include: {
                        category: true,
                    }
                },
            }
        }
    }
}>

export function filterProjectPreview(project: ProjectPayload): ProjectPreviewType {
    const version = project.versions![0]
    return {
        iconUrl: version.iconUrl,
        id: project.id,
        versionId: version.id,
        name: version.name,
        order: project.order || DEFAULT_ORDER,
        subtitle: version.subtitle || "",
        slug: project.slugs[0].slug,
        developers: version.developerNames,
        featured: project.featured,
        heroArtUrl: version.heroArtUrl || undefined
    }
}

export function filterProject(project: ProjectPayload, role: UserRole | null): ProjectType {
    const version = project.versions[0]!
    const media = version.media
    let _project: ProjectPublicType = {
        description: version.description,
        iconUrl: version.iconUrl,
        heroArtUrl: version.heroArtUrl || undefined,
        id: project.id,
        versionId: version.id,
        name: version.name,
        order: project.order || DEFAULT_ORDER,
        links: version.links,
        subtitle: version.subtitle || "",
        featured: project.featured,
        media: media.map(vm => {
            return {
                id: vm.mediaId,
                uri: vm.media.mediaUrl,
                order: vm.order,
                mediaType: vm.media.mediaType,
                deviceType: vm.deviceType,
                status: vm.media.status,
            }
        }),
        developers: version.developerNames,
        showcaseId: project.showcaseId,
        categories: version.categories.map(pc => pc.category.name),
        slug: project.slugs[0].slug
    }
    const _projectStudent: ProjectStudentType = {
        ..._project,
        submissionStatus: version.submissionStatus,
        rejectionReason: version.rejectionReason,
    }
    if (role === "STUDENT") {
        return _projectStudent
    }
    if (role === "ADMIN") {
        const _projectAdmin: ProjectAdminType = {
            ..._projectStudent,
            published: project.published,
            canBeHero: project.canBeHero,
        }
        return _projectAdmin;
    }
    return _project
}
