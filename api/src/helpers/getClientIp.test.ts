import {describe, expect, test} from "vitest";
import {Hono} from "hono";
import {getClientIp} from "./getClientIp";

const app = new Hono().get("/", (c) => c.text(getClientIp(c) ?? "none"))

async function ipFor(headers: Record<string, string>, env: object = {incoming: {socket: {remoteAddress: "10.0.0.1"}}}) {
    const res = await app.request("/", {headers}, env)
    return res.text()
}

/** What @hono/aws-lambda's handler passes as env for an API Gateway HTTP API request */
function lambdaEnv(sourceIp: string) {
    const requestContext = {http: {sourceIp}}
    return {event: {requestContext}, requestContext}
}

describe("getClientIp", () => {
    test("uses CloudFront's viewer address, without the port", async () => {
        expect(await ipFor({"CloudFront-Viewer-Address": "203.0.113.7:46532"})).toBe("203.0.113.7")
    })

    test("handles an IPv6 viewer address", async () => {
        expect(await ipFor({"CloudFront-Viewer-Address": "2001:db8::8a2e:370:7334:46532"})).toBe("2001:db8::8a2e:370:7334")
    })

    test("falls back to the API Gateway source IP in Lambda when the header is missing", async () => {
        expect(await ipFor({}, lambdaEnv("198.51.100.9"))).toBe("198.51.100.9")
    })

    test("prefers the viewer address over the API Gateway source IP (CloudFront's edge)", async () => {
        expect(await ipFor({"CloudFront-Viewer-Address": "203.0.113.7:46532"}, lambdaEnv("198.51.100.9"))).toBe("203.0.113.7")
    })

    test("falls back to the socket address locally", async () => {
        expect(await ipFor({})).toBe("10.0.0.1")
    })
})
