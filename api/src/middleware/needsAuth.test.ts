import {describe, expect, test} from "vitest";
import {createHono} from "../helpers/createHono";
import {needsAuth} from "./needsAuth";
import {makeUser} from "../test/fixtures";
import type {UserModel} from "@hapi/shared/prisma/models";

function appWithUser(user?: UserModel) {
    const app = createHono()
    app.use(async (c, next) => {
        if (user) c.set("user", user)
        await next()
    })
    app.get("/", needsAuth, (c) => c.text("handler reached"))
    return app
}

describe("needsAuth", () => {
    test("rejects anonymous requests with 401", async () => {
        const res = await appWithUser().request("/")
        expect(res.status).toBe(401)
    })

    test.each(["ADMIN", "STUDENT"] as const)("lets %s users through", async (role) => {
        const res = await appWithUser(makeUser({role})).request("/")
        expect(res.status).toBe(200)
        expect(await res.text()).toBe("handler reached")
    })
})
