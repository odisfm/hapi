import {describe, test, expect, vi} from "vitest";

// index.ts reads ALLOWED_CORS when it's imported
vi.hoisted(() => {
    process.env.ALLOWED_CORS = "http://localhost:5173"
})

const {app} = await import("./index.js")

describe("server", () => {
    test("server is running", async () => {
        const res = await app.request("/");
        expect(await res.text()).toEqual("Hello Hono!");
    })
})

describe("CSRF protection", () => {
    // csrf() runs before routing, so a request it lets through reaches the 404 for this path
    const path = "/no-such-route"
    const postAs = (headers: Record<string, string>) =>
        app.request(path, {method: "POST", headers, body: JSON.stringify({})})

    test("rejects a form-style POST from another site", async () => {
        const res = await postAs({"Content-Type": "text/plain", "Sec-Fetch-Site": "cross-site", Origin: "https://evil.example"})
        expect(res.status).toBe(403)
    })

    test("rejects a form-style POST with neither header", async () => {
        const res = await postAs({"Content-Type": "text/plain"})
        expect(res.status).toBe(403)
    })

    test("rejects a same-site but cross-origin POST from an origin not in ALLOWED_CORS", async () => {
        const res = await postAs({"Sec-Fetch-Site": "same-site", Origin: "http://localhost:4000"})
        expect(res.status).toBe(403)
    })

    test("allows a same-origin POST (production)", async () => {
        const res = await postAs({"Sec-Fetch-Site": "same-origin", Origin: "https://example.cloudfront.net"})
        expect(res.status).toBe(404)
    })

    test("allows a POST from an origin in ALLOWED_CORS (local dev)", async () => {
        const res = await postAs({"Sec-Fetch-Site": "same-site", Origin: "http://localhost:5173"})
        expect(res.status).toBe(404)
    })

    test("allows GET from anywhere", async () => {
        const res = await app.request(path, {headers: {"Sec-Fetch-Site": "cross-site", Origin: "https://evil.example"}})
        expect(res.status).toBe(404)
    })
})
