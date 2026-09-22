import {type UserRole} from "@hapi/shared/prisma/enums.js";
import {type ShowcaseGetPayload} from "@hapi/shared/prisma/models/Showcase.js";
import {type ShowcaseType, type ShowcaseAdminType} from "@hapi/shared/types/showcase";
import {filterProjectPreview} from "./filterProject.js";

type ShowcasePayload = ShowcaseGetPayload<{
    include: {
        projects: {
            include: {
                category: true,
                media: true,
                showcase: true,
                slugs: true
            }
        }
    }
}>

export function filterShowcase(showcase: ShowcasePayload, role: UserRole | null): ShowcaseType {
    const _showcase: ShowcaseType = {
        id: showcase.id,
        name: showcase.name,
        description: showcase.description || undefined,
        year: showcase.year,
        semester: showcase.semester,
        projects: showcase.projects.map((project) => filterProjectPreview(project)),

    }
    if (role === "ADMIN") {
        const _showcaseAdmin: ShowcaseAdminType = {
            ..._showcase,
            publishedDate: showcase.publishedDate
        }
        return _showcaseAdmin;
    }
    return _showcase;
}
