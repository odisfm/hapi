import {describe, test, expect} from "vitest";
import {type ProjectGetPayload} from "@hapi/shared/src/generated/prisma/models/Project.js";
import {filterProjectPreview, filterProject} from "./filterProject.js";

type ProjectPayload = ProjectGetPayload<{
    include: {
        media: true,
        category: true,
        showcase: true,
        ProjectSlug: true
    }
}>

const mockPayload: ProjectPayload = {
    approvalStatus: "APPROVED",
    category: {
        name: "test",
        id: "dsfdsf"
    },
    categoryId: "",
    description: "",
    developers: [],
    iconUrl: "",
    id: "",
    links: [],
    name: "",
    order: "a",
    rejectionReason: null,
    showcaseId: "",
    subtitle: "",
    media: [],
    showcase: {
        name: "",
        id: "",
        description: null,
        year: 0,
        semester: 0,
        publishedDate: null
    },
    ProjectSlug: [
        {
            assignedDate: new Date(),
            slug: "test-project",
            projectId: "",
            id: ""
        }
    ]
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
        expect(project?.approvalStatus).toEqual("APPROVED")
        expect(project?.rejectionReason).toBeNull()
    })
})
