import {createHono} from "./helpers/createHono";
import { db } from "@hapi/shared"
import { csrf } from 'hono/csrf';
import { cors } from 'hono/cors';
import {type CategoryResponse} from "@hapi/shared/types/apiResponses"
import {showcaseRouter} from "./routes/showcaseRouter";
import {projectRouterGet} from "./routes/projectRouter/projectRouterGet";
import {authRouter} from "./routes/authRouter";
import {mediaRouter} from "./routes/mediaRouter";
import {sessionMiddleware} from "./middleware/session";
import {projectRouterPatch} from "./routes/projectRouter/projectRouterPatch";
import {projectRouterPost} from "./routes/projectRouter/projectRouterPost";
import {projectRouterDelete} from "./routes/projectRouter/projectRouterDelete";
import {projectVersionRouter} from "./routes/projectRouter/projectVersionRouter";
import { categoryRouter } from "./routes/categoryRouter";
import {analyticsRouter} from "./routes/analyticsRouter";
let serverDelay = [0, 0]
if (process.env.SERVER_DELAY) {
    const delayNum = Number(process.env.SERVER_DELAY);
    serverDelay[0] = delayNum * .8
    serverDelay[1] = delayNum * 1.2
}

export const app = createHono()

const allowedOrigins = process.env.ALLOWED_CORS ? process.env.ALLOWED_CORS.split(" ") : []

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true
    })
)

// Rejects form-style requests (form, multipart and text/plain bodies) from other sites.
// Browsers send JSON as text/plain unless told otherwise, so this covers most requests.
// A request passes if either:
// - Sec-Fetch-Site is "same-origin" (production, where CloudFront serves the site and API
//   from one origin; checking Origin alone fails there, because CloudFront doesn't pass the
//   Host header on, so the API sees API Gateway's URL as its own)
// - Origin is in ALLOWED_CORS (local dev, where the website is on another port)
app.use(csrf({origin: allowedOrigins}))

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
app
    .route("/project", projectVersionRouter)
    .route("/project", projectRouterGet)
    .route("/project", projectRouterPatch)
    .route("/project", projectRouterPost)
    .route("/project", projectRouterDelete)
app.route("/media", mediaRouter)
app.route("/analytics", analyticsRouter)

app.route("/category", categoryRouter)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})
