import {beforeEach, describe, expect, test, vi} from "vitest";

vi.mock("@hapi/shared", () => import("../test/mockDb"))

import {db} from "@hapi/shared";
import {createHono} from "../helpers/createHono";
import {sessionMiddleware} from "./session";
import {inPast, makeSession, makeUser} from "../test/fixtures";
import {resetDb} from "../test/mockDb";

const app = createHono()
app.use(sessionMiddleware)
app.get("/", (c) => c.json({userId: c.get("user")?.id ?? null, sessionId: c.get("sessionId") ?? null}))

beforeEach(() => {
    resetDb()
})

async function requestWithSession(sessionId?: string) {
    const res = await app.request("/", {
        headers: sessionId ? {Cookie: `sessionId=${sessionId}`} : {},
    })
    return {res, json: await res.json() as {userId: string | null, sessionId: string | null}}
}

describe("sessionMiddleware", () => {
    test("leaves request anonymous without a cookie, and doesn't query the db", async () => {
        const {json} = await requestWithSession()
        expect(json).toEqual({userId: null, sessionId: null})
        expect(db.session.findUnique).not.toHaveBeenCalled()
    })

    test("sets the user and session for a valid session", async () => {
        const session = makeSession({user: makeUser({id: "user-1"})})
        vi.mocked(db.session.findUnique).mockResolvedValue(session)
        const {json} = await requestWithSession(session.id)
        expect(json).toEqual({userId: "user-1", sessionId: session.id})
        expect(db.session.findUnique).toHaveBeenCalledWith(expect.objectContaining({where: {id: session.id}}))
    })

    test("treats an unknown session as anonymous and clears the cookie", async () => {
        vi.mocked(db.session.findUnique).mockResolvedValue(null)
        const {res, json} = await requestWithSession("unknown")
        expect(json).toEqual({userId: null, sessionId: null})
        expect(res.headers.get("Set-Cookie")).toMatch(/^sessionId=;.*Max-Age=0/)
    })

    test("treats an expired session as anonymous and clears the cookie", async () => {
        const session = makeSession({expiry: inPast()})
        vi.mocked(db.session.findUnique).mockResolvedValue(session)
        const {res, json} = await requestWithSession(session.id)
        expect(json).toEqual({userId: null, sessionId: null})
        expect(res.headers.get("Set-Cookie")).toMatch(/^sessionId=;.*Max-Age=0/)
    })
})
