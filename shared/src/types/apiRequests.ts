import * as z from "zod"
import {DeviceType, SubmissionStatus, UserRole} from "../generated/prisma/enums.js";
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
    approvalStatus?: SubmissionStatus,
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

export const CreateProjectRequestSchema = z.object({
    showcaseId: z.uuidv4().optional(),
})

export const UpdateProjectRequestSchema = z.object({
    project: z.object({
        id: z.uuidv4(),
        canBeHero: z.boolean().optional(),
        order: z.string().optional(),
        showcaseId: z.uuidv4().optional(),
        published: z.boolean().optional(),
        featured: z.boolean().optional(),
    }).optional(),
    projectVersion: z.object({
        id: z.uuidv4(),
        name: z.string().optional(),
        subtitle: z.string().optional(),
        description: z.string().optional(),
        iconUrl: z.string().optional(),
        developerNames: z.array(z.string()).optional(),
        links: z.array(z.string()).optional(),
        heroArtUrl: z.string().optional(),
        categoryIds: z.array(z.uuidv4()).optional(),
        media: z.array(ProjectMediaSchema).optional(),
    }).optional(),
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

export const UpdateProjectVersionStatusRequestSchema = z.object({
    status: z.enum(SubmissionStatus),
    rejectionReason: z.string().optional(),
})

export type UpdateProjectVersionStatusRequestType = z.infer<typeof UpdateProjectVersionStatusRequestSchema>
