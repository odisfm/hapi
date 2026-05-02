import { Hono } from 'hono'
import { db } from "@change-me/shared"
import { deleteCookie, setCookie } from 'hono/cookie';
import { csrf } from 'hono/csrf';
import { jwt } from 'hono/jwt';

export const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})
