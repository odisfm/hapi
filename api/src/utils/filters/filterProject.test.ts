import {describe, test, expect} from "vitest";
import {filterProjectPreview, filterProject} from "./filterProject.js";
import {makeProject} from "../../test/fixtures.js";

const mockPayload = makeProject()

describe("Project details filtering by role and context", () => {
    test("should return minimal details for preview", () => {
        const project: any = filterProjectPreview(mockPayload);
        expect(project?.description).toBeUndefined()
        expect(project?.media).toBeUndefined()
    })

    test("should omit privileged information for public users", () => {
        const project: any = filterProject(mockPayload, null)
        expect(project?.submissionStatus).toBeUndefined()
        expect(project?.rejectionReason).toBeUndefined()
    })

    test("should include privileged information for admin users", () => {
        const project: any = filterProject(mockPayload, "ADMIN")
        expect(project?.submissionStatus).toEqual("APPROVED")
        expect(project?.rejectionReason).toBeNull()
    })
})
