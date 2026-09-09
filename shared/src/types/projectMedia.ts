import {type MediaType, type DeviceType} from "../generated/prisma/enums.js";

export type ProjectMediaType = {
    uri: string,
    mediaType: MediaType,
    deviceType: DeviceType,
    order: string
};
