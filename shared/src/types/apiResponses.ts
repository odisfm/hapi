import type {ShowcaseType} from "./showcase.js";
import type {ProjectPreviewType, ProjectType} from "./project.js";
import type {Category} from "../generated/prisma/client.js";

export type ShowcaseFeaturedResponse = {
    showcases: ShowcaseType[]
}

export type ProjectSearchResponse = {
    projects: ProjectPreviewType[];
    info: SearchInfo
}

type SearchInfo = {
    totalResults: number
}

export type CategoryResponse = {
    categories: Category[]
}

export type ProjectDetailsResponse = {
    project: ProjectType
}
