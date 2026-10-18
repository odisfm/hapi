import {describe, test, expect} from "vitest";
import {filterShowcase} from "./filterShowcase.js";
import {makeShowcase} from "../../test/fixtures.js";

const mockPayload = makeShowcase()

describe("Showcase details filtering by role and context", () => {
    test("should omit privileged information for public users", () => {
        const showcase: any = filterShowcase(mockPayload, null)
        expect(showcase?.publishedDate).toBeUndefined()
    })

    test("should include privileged information for admin users", () => {
        const showcase: any = filterShowcase(mockPayload, "ADMIN")
        expect(showcase.publishedDate instanceof Date).toEqual(true)
    })
})
