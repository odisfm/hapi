import * as z from "zod"
import {SubmissionStatus} from "../generated/prisma/enums.js";
import {ProjectMediaSchema} from "./projectMedia.js";



export const ProjectPreviewSchema = z.object({
    id: z.uuidv4(),
    versionId: z.uuidv4(),
    name: z.string(),
    subtitle: z.string().optional(),
    iconUrl: z.string(),
    heroArtUrl: z.string().optional(),
    order: z.string(),
    slug: z.string(),
    developers: z.array(z.string()),
    featured: z.boolean(),
})

export type ProjectPreviewType = z.infer<typeof ProjectPreviewSchema>

export const ProjectShowcaseSchema = z.object({
    name: z.string(),
    slug: z.string().optional(),
})

export type ProjectShowcaseType = z.infer<typeof ProjectShowcaseSchema>

export const ProjectPublicSchema = ProjectPreviewSchema.extend({
    categories: z.array(z.string()),
    description: z.string(),
    links: z.array(z.string()),
    media: z.array(ProjectMediaSchema),
    showcaseId: z.uuidv4(),
    showcase: ProjectShowcaseSchema.optional(),
})

export type ProjectPublicType = z.infer<typeof ProjectPublicSchema>

export const ProjectStudentSchema = ProjectPublicSchema.extend({
    submissionStatus: z.enum(SubmissionStatus),
    rejectionReason: z.string().nullable(),

})

export type ProjectStudentType = z.infer<typeof ProjectStudentSchema>

export const ProjectAdminSchema = ProjectStudentSchema.extend({
    published: z.boolean(),
    canBeHero: z.boolean(),
})

export type ProjectAdminType = z.infer<typeof ProjectAdminSchema>

export type ProjectType = ProjectPublicType

export const ProjectVersionFeedbackItemSchema = z.object({
    reviewedAt: z.coerce.date(),
    reviewer: z.string(),
    feedback: z.string()
})

export type ProjectVersionFeedbackItemType = z.infer<typeof ProjectVersionFeedbackItemSchema>

export const ProjectVersionSummarySchema = z.object({
    name: z.string(),
    projectId: z.uuidv4(),
    projectSlug: z.string(),
    approvedVersion: z.object({
        id: z.uuidv4(),
        reviewedAt: z.coerce.date().optional(),
        live: z.boolean(),
    }).optional(),
    alternateVersion: z.object({
        id: z.uuidv4(),
        reviewedAt: z.coerce.date().optional(),
        rejectionReason: z.string().optional(),
        status: z.enum(SubmissionStatus)
    }).optional(),
    users: z.array(z.object({
        id: z.uuidv4(),
        name: z.string(),
    })),
    feedbackHistory: z.array(ProjectVersionFeedbackItemSchema),
})

export type ProjectVersionSummaryType = z.infer<typeof ProjectVersionSummarySchema>