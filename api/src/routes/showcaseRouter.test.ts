import { describe, expect, test, vi, beforeEach } from 'vitest'
import { showcaseRouter } from "./showcaseRouter";

vi.mock("@hapi/shared", () => ({
    db: {
        showcase: {
            findMany: vi.fn(),
        },
        showcaseSlug: {
            findUnique: vi.fn(),
        }
    },
}))

import { db } from "@hapi/shared"
import type {ShowcaseGetPayload} from "@hapi/shared/prisma/models/Showcase";
import type {ShowcaseFeaturedResponse} from "@hapi/shared/types/apiResponses";
import type {ShowcaseSlugGetPayload} from "@hapi/shared/prisma/models/ShowcaseSlug";

beforeEach(() => {
    vi.clearAllMocks()
})

type ShowcasePayload = ShowcaseGetPayload<{
    include: {
        projects: {
            where: {
                published: true
            },
            include: {
                showcase: true,
                slugs: {
                    take: 1,
                    orderBy: {
                        assignedDate: "desc"
                    }
                },
                versions: {
                    take: 1,
                    where: {
                        submissionStatus: "APPROVED"
                    },
                    include: {
                        media: {include: {media: true}},
                        categories: {include: {category: true}}
                    }
                }
            }
        }
    }
}>

type ShowcaseSlugPayload = ShowcaseSlugGetPayload<any>

type ShowcaseFindMany = ShowcasePayload[]

describe("GET /:showcaseSlug", async () => {
    test("404s on unpublished showcase for public user", async () => {
        vi.mocked(db.showcaseSlug.findUnique).mockResolvedValue({
            slug: "my-showcase",
            showcaseId: "",
            assignedDate: new Date(),
            showcase: {
                id: "",
                publishedDate: new Date(Date.now() + 1000),
            }
        } as unknown as ShowcaseSlugPayload)

        const res = await showcaseRouter.request("/myShowcase")
        expect(res.status).toBe(404)
    })
})
