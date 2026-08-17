import { Hono } from 'hono'
import { db } from "@hapi/shared"
import { deleteCookie, setCookie } from 'hono/cookie';
import { csrf } from 'hono/csrf';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';

export const app = new Hono()

app.use(
    cors({
      origin: process.env.ALLOWED_CORS ? process.env.ALLOWED_CORS.split(" ") : [],
    })
)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})
