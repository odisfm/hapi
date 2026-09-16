import {createHono} from "./helpers/createHono";
import { db } from "@hapi/shared"
import {deleteCookie, getCookie, setCookie} from 'hono/cookie';
import { csrf } from 'hono/csrf';
import { cors } from 'hono/cors';
import {type CategoryResponse} from "@hapi/shared/types/apiResponses"
import {showcaseRouter} from "./routes/showcaseRouter";
import {projectRouter} from "./routes/projectRouter";
import {authRouter} from "./routes/authRouter";

export const app = createHono()

app.use(
    cors({
        origin: process.env.ALLOWED_CORS ? process.env.ALLOWED_CORS.split(" ") : [],
        credentials: true
    })
)

app.use("*", async (c, next) => {
    const sessionId = getCookie(c, "sessionId")
    if (!sessionId) {
        return await next()
    }
    const now = new Date();
    const record = await db.session.findUnique({
        where: {id: sessionId},
        include: {user: true}
    })
    if (!record || record.expiry < now) {
        deleteCookie(c, "sessionId")
        return await next()
    }
    c.set("user", record.user)
    c.set("sessionId", sessionId)
    return await next()
})

app.route("/auth", authRouter)
app.route("/showcase", showcaseRouter)
app.route("/project", projectRouter)

app.get("/category", async (c) => {
    const records = await db.category.findMany()
    return c.json({
        categories: records
    } satisfies CategoryResponse)
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})
