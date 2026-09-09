import { Hono } from 'hono'
import { db } from "@hapi/shared"
import { deleteCookie, setCookie } from 'hono/cookie';
import { csrf } from 'hono/csrf';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
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

app.get('/', (c) => {
  return c.text('Hello Hono!')
})
