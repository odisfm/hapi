import * as z from "zod"
import type {ShowcaseType} from "./showcase.js";
import type {ProjectAdminType, ProjectPreviewType, ProjectType} from "./project.js";
import type {Category} from "../generated/prisma/client.js";
import type {ShowcaseGetPayload} from "../generated/prisma/models/Showcase";
import type {ProjectMediaModel} from "../generated/prisma/models/ProjectMedia";

export type ShowcaseFeaturedResponse = {
    showcases: ShowcaseType[]
}

export type ShowcaseListResponse = {
    showcases: ShowcaseGetPayload<{}>[]
}

export type ProjectSearchResponse = {
    projects: ProjectPreviewType[];
    info: SearchInfo
}

export type SearchInfo = {
    totalResults: number
}

export type CategoryResponse = {
    categories: Category[]
}

export type ProjectDetailsResponse = {
    project: ProjectType
}

export type ProjectDetailsAdminResponse = {
    project: ProjectAdminType
}

export const UserDetailsSchema = z.object({
    email: z.email(),
    name: z.string(),
})

export type UserDetails = z.infer<typeof UserDetailsSchema>

export const LoginSuccessResponseSchema = z.object({
    user: UserDetailsSchema
})

export type LoginSuccessResponse = z.infer<typeof LoginSuccessResponseSchema>

export const PasswordChangeFailureResponseSchema = z.object({
    errors: z.array(z.string()),
})

export type PasswordChangeFailureResponse = z.infer<typeof PasswordChangeFailureResponseSchema>

export type CreateProjectMediaResponse = {
    projectMedia: ProjectMediaModel
}