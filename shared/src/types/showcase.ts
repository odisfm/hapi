import {type ProjectPreviewType} from './project.js';

export type ShowcasePublicType = {
    id: string;
    name: string;
    year: number;
    semester: number;
    description?: string;
    projects: ProjectPreviewType[]
}

export type ShowcaseAdminType = ShowcasePublicType & {
    publishedDate: Date | null;
}

export type ShowcaseType = ShowcasePublicType | ShowcaseAdminType
