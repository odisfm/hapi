import {describe, test, expect} from "vitest";
import {type ShowcaseGetPayload} from "@hapi/shared/src/generated/prisma/models/Showcase.js";
import {filterShowcase} from "./filterShowcase.js";

type ShowcasePayload = ShowcaseGetPayload<{
    include: {
        projects: {include: {media: true, category: true}}
    }
}>

const mockPayload: ShowcasePayload = {
    description: "lorem ipsum",
    id: "abcd-1234",
    name: "Apple Foundation Program",
    publishedDate: new Date("2026-01-01"),
    semester: 1,
    year: 2026,
    projects: []
}

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