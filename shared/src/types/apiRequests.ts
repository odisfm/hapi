import * as z from "zod"
import {type ApprovalStatus, DeviceType, UserRole} from "../generated/prisma/enums.js";
import {PasswordSchema} from "./password";
import {ProjectAdminSchema} from "./project";
import {ProjectMediaSchema} from "./projectMedia";
import {ShowcaseAdminSchema} from "./showcase";

export type ProjectSearchQuery = {
    searchTerm?: string,
    /** how many results to return **/
    limit?: number,
    /** when paginating, the UUID of the last project returned **/
    cursor?: string,
    page?: number,
    /** UUIDs of categories to search, joined on "," **/
    category?: string,
    /** UUID of capstone **/
    showcase?: string,
    /** admin only **/
    approvalStatus?: ApprovalStatus,
    published?: "published" | "unpublished"
}

export const LoginRequestSchema = z.object({
    email: z.email(),
    password: z.string(),
})

export const PasswordChangeRequestSchema = z.object({
    password: z.string(),
})

export const CreateUserRequestSchema = z.object({
    email: z.email(),
    name: z.string(),
    password: PasswordSchema,
    role: z.enum(UserRole)
})

export const UpdateProjectRequestSchema = z.object({
    project: ProjectAdminSchema.omit({slug: true, categories: true}).extend({
        iconUrl: z.string(),
        order: z.string().optional(),
        categoryIds: z.array(z.uuidv4()),
        showcaseId: z.uuidv4(),
        media: z.array(ProjectMediaSchema)
    })
})

export type UpdateProjectRequestType = z.infer<typeof UpdateProjectRequestSchema>

export const CreateProjectMediaRequestSchema = z.object({
    projectId: z.uuidv4(),
    deviceType: z.enum(DeviceType),
})

export type CreateProjectMediaRequestType = z.infer<typeof CreateProjectMediaRequestSchema>

export const CreateProjectHeroArtRequestSchema = z.object({
    projectId: z.uuidv4(),
})

export type CreateProjectHeroArtRequestType = z.infer<typeof CreateProjectHeroArtRequestSchema>

export const AlterProjectSlugRequestSchema = z.object({
    slug: z.string(),
})

export type AlterProjectSlugRequestType = z.infer<typeof AlterProjectSlugRequestSchema>

export const UpdateShowcaseRequestSchema = z.object({
    showcase: ShowcaseAdminSchema.omit({projects: true}),
})

export type UpdateShowcaseRequestType = z.infer<typeof UpdateShowcaseRequestSchema>
