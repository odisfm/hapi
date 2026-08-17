import {describe, test, expect} from "vitest";
import {app} from "./index.js";

describe("server", () => {
    test("server is running", async () => {
        const res = await app.request("/");
        expect(await res.text()).toEqual("Hello Hono!");
    })

    test("false is true", () => {
        expect(true).toEqual(false)
    })
})
