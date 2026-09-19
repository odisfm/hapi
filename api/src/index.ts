import {createHono} from "./helpers/createHono";
import { db } from "@hapi/shared"
import { csrf } from 'hono/csrf';
import { cors } from 'hono/cors';
import {type CategoryResponse} from "@hapi/shared/types/apiResponses"
import {showcaseRouter} from "./routes/showcaseRouter";
import {projectRouter} from "./routes/projectRouter";
import {authRouter} from "./routes/authRouter";
import {mediaRouter} from "./routes/mediaRouter";
import {sessionMiddleware} from "./middleware/session";
let serverDelay = [0, 0]
if (process.env.SERVER_DELAY) {
    const delayNum = Number(process.env.SERVER_DELAY);
    serverDelay[0] = delayNum * .8
    serverDelay[1] = delayNum * 1.2
}

export const app = createHono()

app.use(
    cors({
        origin: process.env.ALLOWED_CORS ? process.env.ALLOWED_CORS.split(" ") : [],
        credentials: true
    })
)

app.use("*", async (c, next) => {
    if (serverDelay[0] && serverDelay[1]) {
        const [min, max] = serverDelay;
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return await next();
    } else {
        return await next()
    }
})

app.use("*", sessionMiddleware)

app.route("/auth", authRouter)
app.route("/showcase", showcaseRouter)
app.route("/project", projectRouter)
app.route("/media", mediaRouter)

app.get("/category", async (c) => {
    const records = await db.category.findMany()
    return c.json({
        categories: records
    } satisfies CategoryResponse)
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})
