import * as z from "zod"
import {SubmissionStatus} from "../generated/prisma/enums.js";
import {ProjectMediaSchema} from "./projectMedia.js";



export const ProjectPreviewSchema = z.object({
    id: z.uuidv4(),
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

export const ProjectPublicSchema = ProjectPreviewSchema.extend({
    categories: z.array(z.string()),
    description: z.string(),
    links: z.array(z.string()),
    media: z.array(ProjectMediaSchema),
    showcaseId: z.uuidv4()
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