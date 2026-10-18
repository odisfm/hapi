import { describe, expect, test, vi, beforeEach } from 'vitest'
import { showcaseRouter } from "./showcaseRouter";

vi.mock("@hapi/shared", () => import("../test/mockDb"))

import { db } from "@hapi/shared"
import {inFuture, makeShowcase, makeShowcaseSlug} from "../test/fixtures";
import {resetDb} from "../test/mockDb";

beforeEach(() => {
    resetDb()
})

describe("GET /:showcaseSlug", async () => {
    test("404s on unpublished showcase for public user", async () => {
        vi.mocked(db.showcaseSlug.findUnique).mockResolvedValue(makeShowcaseSlug({
            slug: "my-showcase",
            showcase: makeShowcase({publishedDate: inFuture()}),
        }))

        const res = await showcaseRouter.request("/my-showcase")
        expect(res.status).toBe(404)
    })
})
