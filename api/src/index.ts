import {createHono} from "./helpers/createHono";
import { db } from "@hapi/shared"
import { deleteCookie, setCookie } from 'hono/cookie';
import { csrf } from 'hono/csrf';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import {type CategoryResponse} from "@hapi/shared/types/apiResponses"
import {showcaseRouter} from "./routes/showcaseRouter";
import {projectRouter} from "./routes/projectRouter";

export const app = createHono()

app.use(
    cors({
      origin: process.env.ALLOWED_CORS ? process.env.ALLOWED_CORS.split(" ") : [],
    })
)

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
