import * as z from "zod"
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

