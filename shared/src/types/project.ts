import * as z from "zod"
import {ApprovalStatus} from "../generated/prisma/enums.js";
import {ProjectMediaSchema} from "./projectMedia.js";



export const ProjectPreviewSchema = z.object({
    id: z.uuidv4(),
    name: z.string(),
    subtitle: z.string().optional(),
    iconUrl: z.string(),
    order: z.string(),
    slug: z.string(),
    developers: z.array(z.string()),
})

export type ProjectPreviewType = z.infer<typeof ProjectPreviewSchema>

export const ProjectPublicSchema = ProjectPreviewSchema.extend({
    category: z.string(),
    description: z.string(),
    links: z.array(z.string()),
    media: z.array(ProjectMediaSchema),
    showcaseId: z.uuidv4()
})

export type ProjectPublicType = z.infer<typeof ProjectPublicSchema>

export const ProjectAdminSchema = ProjectPublicSchema.extend({
    approvalStatus: z.enum(ApprovalStatus),
    rejectionReason: z.string().nullable(),
    published: z.boolean()
})

export type ProjectAdminType = z.infer<typeof ProjectAdminSchema>

export type ProjectType = ProjectPublicType