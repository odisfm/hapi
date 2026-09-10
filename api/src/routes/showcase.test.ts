import { describe, expect, test, vi, beforeEach } from 'vitest'
import { showcaseRouter } from "./showcase.js";

vi.mock("@hapi/shared", () => ({
    db: {
        showcase: {
            findMany: vi.fn(),
        },
    },
}))

import { db } from "@hapi/shared"
import type {ShowcaseGetPayload} from "@hapi/shared/src/generated/prisma/models/Showcase.js";
import type {ShowcaseFeaturedResponse} from "@hapi/shared/src/types/apiResponses.js";

beforeEach(() => {
    vi.clearAllMocks()
})

type ShowcasePayload = ShowcaseGetPayload<{
    include: {
        projects: {
            include: {
                media: true,
                ProjectSlug: true,
                category: true,
                showcase: true
            }
        }
    }
}>

type ShowcaseFindMany = ShowcasePayload[]

describe("GET /showcase/featured", async () => {
    test("returns a list of showcases", async () => {
        vi.mocked(db.showcase.findMany).mockResolvedValue([
            {
                id: "a",
                name: "Capstone",
                year: 2026,
                semester: 1,
                description: "",
                projects: [],
                publishedDate: new Date(Date.now() - 1000),

            } satisfies ShowcasePayload,
            {
                id: "b",
                name: "Capstone",
                year: 2025,
                semester: 2,
                description: "",
                projects: [],
                publishedDate: new Date(Date.now() - 1000),

            } satisfies ShowcasePayload,
            {
                id: "c",
                name: "Capstone",
                year: 2025,
                semester: 1,
                description: "",
                projects: [],
                publishedDate: new Date(Date.now() - 1000),

            } satisfies ShowcasePayload,
        ] as unknown as ShowcaseFindMany)

        const res = await showcaseRouter.request("/featured")
        const json: ShowcaseFeaturedResponse = await res.json()
        expect(json.showcases).toBeDefined()
        expect(json.showcases.length).toBe(3)
    })

    test("omits unpublished showcase", async () => {
        vi.mocked(db.showcase.findMany).mockResolvedValue([
            {
                id: "a",
                name: "Capstone",
                year: 2026,
                semester: 1,
                description: "",
                projects: [],
                publishedDate: new Date(Date.now() - 1000),

            } satisfies ShowcasePayload,
            {
                id: "b",
                name: "Capstone",
                year: 2025,
                semester: 2,
                description: "",
                projects: [],
                publishedDate: null,

            } satisfies ShowcasePayload,
        ] as unknown as ShowcaseFindMany)
        const res = await showcaseRouter.request("/featured")
        const json: ShowcaseFeaturedResponse = await res.json()
        expect(json.showcases.length).toEqual(1)
    })
})

