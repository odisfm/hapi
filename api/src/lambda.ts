import { handle } from 'hono/aws-lambda'
import { tryLoadMailgunKey } from './lambdaSecrets.js'

// Secrets must be in process.env before the app (and anything that reads env at
// import time) loads, hence the top-level await before the dynamic import.
await tryLoadMailgunKey()

const { app } = await import('./index.js')

export const handler = handle(app)
