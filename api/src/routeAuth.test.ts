import {describe, expect, test, vi} from "vitest";

vi.mock("@hapi/shared", () => import("./test/mockDb"))

import {app} from "./index";
import {needsAuth} from "./middleware/needsAuth";

// Routes reachable without logging in. Every other route must use `needsAuth`.
const PUBLIC_ROUTES = [
    "GET /",
    "POST /auth/login",
    "POST /auth/forgot-password",
    "POST /auth/forgot-password/verify",
    "GET /showcase/all",
    "GET /showcase/:showcaseSlug",
    "GET /showcase/id/:showcaseId",
    "GET /project/featured",
    "GET /project/search",
    "GET /project/:projectSlug",
    "GET /category",
]

function routeAuthMap() {
    const routes = new Map<string, boolean>()
    for (const r of app.routes) {
        if (r.method === "ALL") continue // app-wide middleware
        const key = `${r.method} ${r.path}`
        routes.set(key, (routes.get(key) ?? false) || r.handler === needsAuth)
    }
    return routes
}

describe("route authentication", () => {
    test("every non-public route uses needsAuth", () => {
        const unprotected = [...routeAuthMap()]
            .filter(([route, hasAuth]) => !hasAuth && !PUBLIC_ROUTES.includes(route))
            .map(([route]) => route)
        expect(unprotected).toEqual([])
    })

    test("public route list only contains existing routes", () => {
        const routes = routeAuthMap()
        expect(PUBLIC_ROUTES.filter((r) => !routes.has(r))).toEqual([])
    })
})
