import {MediaType, DeviceType} from "../generated/prisma/enums.js";
import * as z from "zod";

export const ProjectMediaSchema = z.object({
    id: z.uuidv4(),
    uri: z.string(),
    mediaType: z.enum(MediaType),
    deviceType: z.enum(DeviceType),
    order: z.string(),
})

export type ProjectMediaType = z.infer<typeof ProjectMediaSchema>;

