import {mockDeep, mockReset} from "vitest-mock-extended";
import type {db as RealDb} from "@hapi/shared";

type Db = typeof RealDb

export const db = mockDeep<Db>({
    fallbackMockImplementation: () => {
        throw new Error("Unstubbed db call: stub it in the test, e.g. vi.mocked(db.x.y).mockResolvedValue(...)")
    },
})

function stubTransaction() {
    db.$transaction.mockImplementation((async (arg: unknown) => {
        return typeof arg === "function" ? arg(db) : Promise.all(arg as Promise<unknown>[])
    }) as never)
}

stubTransaction()

/** Clears stubs and call history. Call in `beforeEach`. */
export function resetDb() {
    mockReset(db)
    stubTransaction()
}
