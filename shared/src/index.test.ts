import { describe, expect, test } from "vitest"
import { db } from "./db"

describe("database", () => {
    test("prisma client created", async () => {
        expect(db).toBeDefined()
    })
})
