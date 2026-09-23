import * as z from 'zod'
import {ProjectPreviewSchema} from './project.js';

export const ShowcasePublicSchema = z.object({
    id: z.uuidv4(),
    name: z.string(),
    year: z.number(),
    semester: z.number(),
    description: z.string().optional(),
    projects: z.array(ProjectPreviewSchema),
})

export type ShowcasePublicType = z.infer<typeof ShowcasePublicSchema>

export const ShowcaseAdminSchema = ShowcasePublicSchema.extend({
    publishedDate: z.union([z.coerce.date(), z.null()])
})

export type ShowcaseAdminType = ShowcasePublicType & {
    publishedDate: Date | null;
}

export type ShowcaseType = ShowcasePublicType | ShowcaseAdminType


