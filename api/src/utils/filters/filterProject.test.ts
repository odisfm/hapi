import {describe, test, expect} from "vitest";
import {type ProjectGetPayload} from "@hapi/shared/prisma/models"
import {filterProjectPreview, filterProject} from "./filterProject.js";

type ProjectPayload = ProjectGetPayload<{
    include: {
        versions: {
            include: {
                categories: {include: {category: true}},
                media: {include: {media: true}}
            }
        },
        showcase: true,
        slugs: true
    }
}>

const mockPayload: ProjectPayload = {
    id: "",
    order: "a",
    showcaseId: "",
    published: true,
    featured: false,
    showcase: {
        name: "",
        id: "",
        description: null,
        year: 0,
        semester: 0,
        publishedDate: null
    },
    slugs: [
        {
            assignedDate: new Date(),
            slug: "test-project",
            projectId: "",
        }
    ],
    versions: [
        {
            id: "",
            projectId: "",
            name: "",
            submissionStatus: "APPROVED",
            categories: [],
            description: "",
            subtitle: "",
            links: [],
            developerNames: [],
            iconUrl: "",
            rejectionReason: null,
            media: [],
            submittedAt: null,
            createdAt: new Date(),
            reviewedAt: null,
            reviewerId: null,
            heroArtUrl: null,

        }
    ],
    canBeHero: true
}

describe("Project details filtering by role and context", () => {
    test("should return minimal details for preview", () => {
        const project: any = filterProjectPreview(mockPayload);
        expect(project?.description).toBeUndefined()
        expect(project?.media).toBeUndefined()
    })

    test("should omit privileged information for public users", () => {
        const project: any = filterProject(mockPayload, null)
        expect(project?.approvalStatus).toBeUndefined()
        expect(project?.rejectionReason).toBeUndefined()
    })

    test("should include privileged information for admin users", () => {
        const project: any = filterProject(mockPayload, "ADMIN")
        expect(project?.submissionStatus).toEqual("APPROVED")
        expect(project?.rejectionReason).toBeNull()
    })
})
