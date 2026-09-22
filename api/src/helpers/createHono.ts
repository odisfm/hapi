import {Hono} from "hono";
import {type UserGetPayload} from "@hapi/shared/prisma/models";

export function createHono() {
    return new Hono<{Variables: AppVariables}>()
}

type AppVariables = {
    user?: UserGetPayload<any>,
    sessionId?: string,
}
