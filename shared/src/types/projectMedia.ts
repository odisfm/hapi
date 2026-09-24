import {MediaType, DeviceType, MediaStatus} from "../generated/prisma/enums.js";
import * as z from "zod";

export const ProjectMediaSchema = z.object({
    id: z.uuidv4(),
    uri: z.string(),
    mediaType: z.enum(MediaType),
    deviceType: z.enum(DeviceType),
    order: z.string(),
    status: z.enum(MediaStatus)
})

export type ProjectMediaType = z.infer<typeof ProjectMediaSchema>;

