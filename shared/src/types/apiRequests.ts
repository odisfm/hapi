import * as z from "zod"
import {type ApprovalStatus, DeviceType, UserRole} from "../generated/prisma/enums.js";
import {PasswordSchema} from "./password";
import {ProjectAdminSchema} from "./project";
import {ProjectMediaSchema} from "./projectMedia";

export type ProjectSearchQuery = {
    searchTerm?: string,
    /** how many results to return **/
    limit?: number,
    /** when paginating, the UUID of the last project returned **/
    cursor?: string,
    /** UUID of category **/
    page?: number,
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
    project: ProjectAdminSchema.omit({slug: true}).extend({
        iconUrl: z.string(),
        order: z.string().optional(),
        category: z.undefined().optional(),
        categoryId: z.uuidv4(),
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

export const AlterProjectSlugRequestSchema = z.object({
    slug: z.string(),
})

export type AlterProjectSlugRequestType = z.infer<typeof AlterProjectSlugRequestSchema>
