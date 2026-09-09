import { Hono } from 'hono'
import { db } from "@hapi/shared"
import { deleteCookie, setCookie } from 'hono/cookie';
import { csrf } from 'hono/csrf';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import {type CategoryResponse} from "@hapi/shared/src/types/apiResponses.js"
import {showcaseRouter} from "./routes/showcase.js";
import {projectRouter} from "./routes/project.js";

export const app = new Hono()

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
