import {type ApprovalStatus} from "../generated/prisma/enums.js";
import {type ProjectMediaType} from "./projectMedia.js";

export type ProjectPreviewType = {
    id: string,
    name: string,
    subtitle?: string,
    iconUrl: string,
    order: string,
}

export type ProjectPublicType = ProjectPreviewType & {
    category: string;
    description: string,
    developers: string[];
    links: string[];
    media: ProjectMediaType[]
}

export type ProjectAdminType = ProjectPublicType & {
    approvalStatus: ApprovalStatus;
    rejectionReason: string | null;
}

export type ProjectType = ProjectPublicType