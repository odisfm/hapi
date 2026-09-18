import { createMiddleware } from "hono/factory";
import { db } from "@hapi/shared";
import { deleteCookie, getCookie } from "hono/cookie";

export const sessionMiddleware = createMiddleware(async (c, next) => {
    const sessionId = getCookie(c, "sessionId");
    if (!sessionId) return await next();

    const record = await db.session.findUnique({
        where: { id: sessionId },
        include: { user: true },
    });

    if (!record || record.expiry < new Date()) {
        deleteCookie(c, "sessionId");
        return await next();
    }

    c.set("user", record.user);
    c.set("sessionId", sessionId);
    return await next();
});
