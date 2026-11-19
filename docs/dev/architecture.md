# How the code works

A tour of the HAPI Showcase codebase for developers new to it. It explains
the main ideas and points to the code that implements them. For setting up
your machine, see the [dev environment guide](dev-environment.md). For
step-by-step guides to everyday changes, see [common tasks](common-tasks.md).
For AWS, see [infrastructure design](../infrastructure/infrastructure-design.md).

Contents:

1. [What the site does](#1-what-the-site-does)
2. [Repository map](#2-repository-map)
3. [The data model](#3-the-data-model)
4. [Projects, versions and the approval queue](#4-projects-versions-and-the-approval-queue)
5. [Users, logins and sessions](#5-users-logins-and-sessions)
6. [Media: images and video](#6-media-images-and-video)
7. [The API](#7-the-api)
8. [The website](#8-the-website)
9. [Email and analytics](#9-email-and-analytics)
10. [Configuration](#10-configuration)

---

## 1. What the site does

The HAPI Showcase presents apps built by RMIT students at the Hub for Apple
Platform Innovation. It has three kinds of user:

| User | Can |
|---|---|
| **Public** (not logged in) | Browse showcases, categories and projects; search |
| **Student** | Create projects and propose changes to them; each change goes to an admin for approval |
| **Admin** | Everything: approve or reject student changes, edit any project directly, manage showcases, categories, featured projects and users, see analytics |

There is no self sign-up. Admins create every account, and the site emails
the new user a generated password.

How a request flows:

```
Locally:     browser ──► Vite dev server :5173 (website)
             browser ──► Node server :3000 (api/src/server.ts) ──► Supabase Local Postgres

Production:  browser ──► CloudFront ──► S3 (website, /icons, /media)
                                   └──► /api/* ──► API Gateway ──► Lambda (api/src/lambda.ts) ──► RDS Postgres
```

Both run the same Hono app (`api/src/index.ts`). Only the entry point
differs.

---

## 2. Repository map

An npm workspaces monorepo:

```
api/                The API (Hono)
  src/index.ts        the app: middleware and routers
  src/server.ts       local entry point (Node server on :3000)
  src/lambda.ts       production entry point (AWS Lambda)
  src/routes/         one router per area (auth, project, showcase, ...)
  src/middleware/     session lookup, auth guard
  src/helpers/        passwords, email, reset codes, ...
  src/utils/          permission checks, response filters
  src/services/       S3, Mailgun, SES clients
client/             The website (React, Vite, Tailwind, React Router)
  src/main.tsx        all page routes
  src/pages/          public/, student/, admin/
  src/components/     shared components (generic/ for buttons, editors, ...)
  src/contexts/       auth (who's logged in) and modal (dialogs)
shared/             Used by api, client and the Lambdas
  prisma/             schema.prisma, migrations/, ERD.md (generated diagram)
  src/db.ts           the Prisma client every server-side package uses
  src/types/          API request schemas and response types
  src/scripts/        createAdmin, populateDb (demo data)
infra/              AWS infrastructure (OpenTofu) and the media Lambdas
  lambda/             transcode_in, transcode_out, media_cleanup
ci/                 Pipeline scripts, run by buildspec.yml
docs/               You are here
```

How the packages depend on each other:

```
client ──► shared (types only)
api    ──► shared (db + types)
infra/lambda/* ──► shared (db)
```

`shared` exposes these import paths (see `shared/package.json`):
`@hapi/shared` (the `db` client), `@hapi/shared/types/*`,
`@hapi/shared/prisma/*` (generated Prisma types and enums),
`@hapi/shared/utils/*` and `@hapi/shared/consts`.

### Where do I change…?

| To change… | Look in |
|---|---|
| A public page | `client/src/pages/public/` |
| The admin dashboard | `client/src/pages/admin/` (routes in `client/src/main.tsx`) |
| The project editor (admins and students share it) | `client/src/pages/admin/ProjectEditor/` |
| What an endpoint does | `api/src/routes/` (mount points in `api/src/index.ts`) |
| What an endpoint accepts | `shared/src/types/apiRequests.ts` |
| What an endpoint returns | `shared/src/types/apiResponses.ts`, `api/src/utils/filters/` |
| Who may do something | The route handler (role checks), `api/src/utils/canEditProject.ts` |
| Database tables | `shared/prisma/schema.prisma`, plus a migration |
| Image sizes and formats | `api/src/routes/mediaRouter.ts` |
| Video encoding | `infra/lambda/transcode_in/src/lambda.ts` |
| Email text | `api/src/routes/authRouter.ts` |
| Colours and fonts | `client/src/index.css` ([Tailwind tokens](tailwind.md)) |
| Default video credits, number of home-page heroes | `shared/src/consts.ts` |

---

## 3. The data model

The schema is [`shared/prisma/schema.prisma`](../../shared/prisma/schema.prisma).
A diagram of every table is generated into
[`shared/prisma/ERD.md`](../../shared/prisma/ERD.md) by `prisma generate`.

```
Showcase 1──* Project 1──* ProjectVersion *──* Category   (via ProjectCategory)
                │                 │
                │                 └──* ProjectVersionMedia *──1 ProjectMedia
                ├──* ProjectMedia (every file uploaded for the project)
                ├──* ProjectOwner *──1 User
                ├──* ProjectSlug
                └──* ProjectView
User 1──* Session, PasswordResetRequest
Showcase 1──* ShowcaseSlug, ShowcaseView
```

The key ideas:

- **A showcase** is a cohort's collection of projects, identified by name,
  year and semester. `publishedDate` controls when it goes public: empty or
  in the future means hidden. Every project belongs to exactly one
  showcase.
- **A project is split in two.**
  - `Project` holds what only admins control: which showcase, `published`,
    `featured`, `canBeHero` (can appear as a large card on the home page)
    and `order`.
  - `ProjectVersion` holds the content: name, subtitle, description, icon,
    hero art, developers, links, categories and media. A project has many
    versions, so a student can draft changes while the approved version
    stays live. See [section 4](#4-projects-versions-and-the-approval-queue).
- **Owners.** `ProjectOwner` links students to their projects. The schema
  allows several owners per project, but the website only ever sets one:
  the student who created it.
- **Media** is recorded twice. `ProjectMedia` is every file uploaded for a
  project. `ProjectVersionMedia` says which of them a version uses, in which
  order and for which device (iPhone, iPad, Mac, …). Versions can share
  files, so creating a new version copies the links, not the files.
- **Slugs** are the readable names in URLs (`/project/my-app`). A project or
  showcase can have several. The newest (`assignedDate`) is its current
  address, and older ones still resolve, so old links keep working. A new
  project's first slug is its ID. Admins add new slugs in the editor.
- **Ordering** uses [lexorank](https://github.com/dalet-oss/lexorank)
  strings (`Project.order`, `ProjectVersionMedia.order`), so an item can be
  moved between two others without renumbering everything. Sort with
  `shared/src/utils/sortByLexoRank.ts`.
- **Views** (`ProjectView`, `ShowcaseView`) count page views for the admin
  analytics page. See [section 9](#9-email-and-analytics).

### Schema changes

Every schema change needs a migration in `shared/prisma/migrations/`. The
pipeline applies migrations before deploying the new code. See
[branching and committing](../processes/branching-and-committing.md#changes-that-need-extra-care)
for what that means for risky changes.

---

## 4. Projects, versions and the approval queue

This is the part of the code most likely to surprise you.

### Version states

Each `ProjectVersion` has a `submissionStatus`:

```
            student submits             admin approves
NOT_SUBMITTED ──────────────► PENDING ──────────────► APPROVED ──► SUPERSEDED
      ▲                          │                       (when a newer version
      └── student withdraws ─────┤                        is approved)
                                 │ admin rejects (with a reason)
                                 ▼
                              REJECTED
```

- A project has **at most one `APPROVED` version**. That's the one the
  public sees. Approving a version marks the previous approved one
  `SUPERSEDED`.
- To change a project, a student makes a **new version**
  (`POST /project/version/:versionId/new`). It copies an existing version,
  including its categories and media links, as `NOT_SUBMITTED`. The student
  edits it, then submits it (`PENDING`).
- Students can only edit `NOT_SUBMITTED` versions, and can only set
  `NOT_SUBMITTED` or `PENDING`.
- Admins can edit any version in any state. **Editing the approved version
  changes the live site immediately**, with no review.
- A project an admin creates starts with an `APPROVED` version. A project a
  student creates starts as `NOT_SUBMITTED`, unpublished, in the first
  showcase unless they choose one.
- Rejected versions keep their reason, reviewer and date. The student
  dashboard shows them as a feedback history.

The rules live in
[`projectVersionRouter.ts`](../../api/src/routes/projectRouter/projectVersionRouter.ts)
(states, new versions, the queue) and
[`projectRouterPatch.ts`](../../api/src/routes/projectRouter/projectRouterPatch.ts)
(editing).

The **admin project queue** (`/dashboard/project-queue`) lists projects that
have a `PENDING` version. It comes from `GET /project/versions`, which, for
a student, lists their own projects instead.

### When the public can see a project

All three must be true:

1. The project is `published` (admins only).
2. Its showcase's `publishedDate` is set and in the past.
3. It has an `APPROVED` version.

Admins see unpublished projects and showcases too. These checks are repeated
in each public endpoint (`projectRouterGet.ts`, `showcaseRouter.ts`,
`categoryRouter.ts`), so a new public endpoint must apply them itself.

### What each role gets back

The same project is returned in three shapes, built in
[`api/src/utils/filters/filterProject.ts`](../../api/src/utils/filters/filterProject.ts):

| Shape | Adds |
|---|---|
| Public | The content |
| Student | `submissionStatus`, `rejectionReason` |
| Admin | `published`, `canBeHero` |

Return data through these filters rather than returning database records,
so fields don't leak to the wrong user.

---

## 5. Users, logins and sessions

There are two roles, `ADMIN` and `STUDENT` (`User.role`). Admins create
accounts from the dashboard, one at a time or in bulk from a list
(`POST /auth/create`, `POST /auth/create/batch`). The site generates a
password and emails it to the new user.

### Sessions

- Logging in (`POST /auth/login`) checks the password and creates a
  `Session` row. Its ID goes in an HTTP-only cookie, `sessionId`, valid for
  30 days.
- On every request, `api/src/middleware/session.ts` looks the cookie up. If
  the session is valid, it puts the user on the request context
  (`c.get("user")`).
- Routes that need a login use the `needsAuth` middleware, which returns
  401 if there's no user.
- **Role checks are written in each handler**
  (`if (user.role !== "ADMIN") return 403`). There's no shared admin
  middleware, so check a new handler carefully.
- Students' access to a project is checked with `canEditProject` (admin, or
  an owner of the project).
- Changing your password logs out your other sessions. "Log out
  everywhere" (`POST /auth/logout/all`) deletes all of them.

On the website, `client/src/contexts/auth/AuthProvider.tsx` asks
`GET /auth/me` who's logged in when the page loads, and `useAuth()` exposes
the answer to every component.

### Passwords

- Hashed with scrypt and a random salt (`api/src/helpers/password.ts`).
- Rules (8+ characters, upper and lower case, number, symbol) are in
  `shared/src/types/password.ts`. They're applied when a user sets a
  password, not to generated ones.
- To hash a password by hand, for example to fix an account directly in the
  database: `npx tsx api/src/helpers/hashPassword.ts 'the-password'`.

### Forgotten passwords

1. `POST /auth/forgot-password` emails an 8-character code, valid for 15
   minutes. Only a hash of the code is stored, and earlier codes are
   invalidated.
2. `POST /auth/forgot-password/verify` checks the code and logs the user in.
3. The website then asks for a new password (`POST /auth/password`).

The pages are `/reset-password/request`, `/verify` and `/new-password`
(`client/src/pages/admin/PasswordReset/`). A logged-in user can also go
straight to `/reset-password/new-password` to change their password.

> **Not enforced:** `User.needsPasswordReset` is stored, and the
> `createAdmin` script sets it, but nothing makes the user change their
> password, and changing it doesn't clear the flag. A `force-reset` page
> stage exists but nothing links to it. Users keep the generated or
> temporary password until they change it themselves. See
> [known issues](../known-issues.md#users-are-never-forced-to-change-their-password).

---

## 6. Media: images and video

Files live in two S3 buckets, under random UUID names. The database stores
the UUID without an extension.

| Bucket | Holds |
|---|---|
| Icons (`BUCKET_ICONS`) | App icons: `<uuid>.webp` |
| Media (`BUCKET_MEDIA`) | Screenshots and hero art: `<uuid>.webp`. Videos: `<uuid>.webm`, plus the `transcode_in/` and `transcode_out/` working folders. |

The website builds image URLs from the bucket's public base URL
(`VITE_S3_ICON_BUCKET`, `VITE_S3_MEDIA_BUCKET`) plus the UUID and
extension. In production those are `/icons/` and `/media/` on the site's
own CloudFront domain.

### Images

Icons, screenshots and hero art are uploaded to the API as form data
(`api/src/routes/mediaRouter.ts`). The API converts them to WebP with
[sharp](https://sharp.pixelplumbing.com/), resizing them along the way:

| Image | Size |
|---|---|
| Icon | 400 × 400 |
| Screenshot | Fits within 1920 × 1920 |
| Hero art | 2000 wide |

Then it uploads them to S3. Screenshots also get a `ProjectMedia` row
straight away.

(sharp is a native library. That's why the API Lambda and CodeBuild must
stay on x86_64 Linux: see `ci/build-lambdas.sh`.)

### Video

Video is too big for the API, so the browser uploads it straight to S3,
and processing happens in AWS Elemental MediaConvert:

```
1. Website ──POST /media/video──► API: creates ProjectMedia (PENDING), links it to the version,
                                       returns a presigned upload URL
2. Website ──PUT file──► S3 media bucket: transcode_in/<uuid>
3. S3 event ──► transcode_in Lambda:
      - probes the video (length, size, audio)
      - checks and deducts the owner's video credits
      - starts a MediaConvert job (VP9/Opus WebM, long edge max 1920)
      - on any failure: marks the media FAILED, deletes the upload, refunds credits
4. MediaConvert ──► S3: transcode_out/<uuid>.webm
5. S3 event ──► transcode_out Lambda: moves it to <uuid>.webm, marks the media AVAILABLE
```

The Lambdas are in `infra/lambda/`, and the S3 triggers are in
`infra/app/misc_lambda.tf`. Video processing only happens in AWS. Locally,
videos stay `PENDING`.

**Video credits:** one credit is one minute of video, rounded to the
nearest minute. Students start with 10 (`shared/src/consts.ts`), and
admins can change a user's credits on the Users page. `null` means
unlimited. The `createAdmin` script gives admins `null`, but admins created
from the dashboard get 10 like students. Credits are charged to the
project's owner, not the uploader, so an admin uploading to a student's
project uses the student's credits.

### Clean-up

Uploads aren't deleted when a version stops using them, because other
versions may still use them. The `media_cleanup` Lambda
(`infra/lambda/media_cleanup/`) runs every Monday at 03:00 Melbourne time.
It deletes:

- files that no version uses and that are more than 24 hours old (the grace
  period covers uploads not yet saved to a version)
- `ProjectMedia` rows that no version uses

As a safety check, it stops with an error if the database has no icons or
no media in use. That happens on a brand-new, empty site, where it would
otherwise delete every file in the buckets. Deleting a project
(`DELETE /project/:projectId`) deletes its files straight away.

---

## 7. The API

[Hono](https://hono.dev/) app in `api/src/index.ts`. In order, it applies:

1. CORS (`ALLOWED_CORS`; only needed locally, where the website and API are
   on different ports)
2. an optional artificial delay (`SERVER_DELAY`, local only)
3. the session middleware

Then it mounts the routers:

| Mount | Router | Covers |
|---|---|---|
| `/auth` | `authRouter.ts` | Login and logout, current user, passwords, user management |
| `/project` | `projectRouter/*.ts` (five files by HTTP method, plus versions) | Search, featured, project pages, create and edit, versions, slugs, delete |
| `/showcase` | `showcaseRouter.ts` | Showcases and their slugs |
| `/category` | `categoryRouter.ts` | Categories |
| `/media` | `mediaRouter.ts` | Uploads |
| `/analytics` | `analyticsRouter.ts` | View counts for the admin analytics page |

In production, CloudFront sends `/api/*` to API Gateway and strips the
`/api` prefix (`infra/functions/strip-api-prefix.js`). So the website calls
`/api/project/search`, and the router sees `/project/search`.

### Conventions

- **Validate input** with a zod schema from
  `shared/src/types/apiRequests.ts` (`Schema.parse(await c.req.json())`),
  and return 400 on failure. Not every older handler does this.
- **Type the response** with `satisfies` and a type from
  `shared/src/types/apiResponses.ts`, so the website and API agree on the
  shape.
- **Errors** are `{ "error": "message" }` with a suitable status code:
  400 bad input, 401 not logged in, 403 not allowed, 404, 409 conflict,
  500.
- **Use a transaction** (`db.$transaction(async (tx) => …)`) for writes that
  must happen together, and use `tx`, not `db`, inside it. In production
  each Lambda has a single database connection. A query on `db` inside a
  transaction waits for the connection the transaction holds, and times
  out.
- **Tests** sit next to the code (`*.test.ts`) and use the mocked database
  in `api/src/test/`.

### Search

`GET /project/search` loads every visible project, then filters, searches
([Fuse.js](https://www.fusejs.io/) fuzzy matching over name, subtitle,
description, developers and categories), sorts and pages in memory. That's
fine at a few hundred projects, but it would need rework for thousands.

### The database client

`shared/src/db.ts` creates the Prisma client and picks how to connect:

- **`DATABASE_URL` set** (local development, scripts, the database tunnel):
  connect with that URL.
- **`DB_HOST` set** (production Lambdas): connect with IAM database
  authentication. A short-lived token, signed with the Lambda's IAM role,
  replaces the password, over verified TLS. There are no database passwords
  in production.

---

## 8. The website

React with [React Router](https://reactrouter.com/). Vite builds it, and
Tailwind styles it.

- **Routes** are all in `client/src/main.tsx`:
  - public pages: `/`, `/search`, `/categories`, `/showcase`,
    `/showcase/:slug`, `/project/:slug`
  - login and passwords: `/admin-login` (students use it too),
    `/reset-password/:stage`
  - admin: `/dashboard/*`
  - student: `/student/*`
- **The project editor** (`pages/admin/ProjectEditor/`) serves both
  `/dashboard/project/:projectId` and `/student/project/:projectId`, and
  shows or hides fields by role. Despite the name, the `:projectId` route
  parameter is a **version** ID.
- **Page protection is a convenience, not security.** `AdminDashboard` and
  `StudentDashboard` send a visitor with the wrong role elsewhere (to the
  login page, or `/protected`, which picks the right dashboard). What
  actually protects the data is the API rejecting requests from the wrong
  user, so every rule must be enforced there.
- **Calling the API:** pages call `fetch` directly with
  `` `${API_URL}/…` `` (`client/src/consts.ts`) and
  `credentials: "include"` (to send the session cookie), and type the
  response with types from `@hapi/shared/types/apiResponses`. On failure,
  `throwErrorFromResponse` (`client/src/utils/misc.ts`) turns the error
  into an exception.
- **Dialogs** go through the modal context: `useModal().dispatchModal(…)`.
- **Search and filter state** is kept in the URL query string
  (`client/src/hooks/useProjectSearchParams.ts`), so results pages can be
  shared and bookmarked.
- **Styling:** Tailwind classes, with RMIT colours and fonts as custom
  tokens ([tailwind.md](tailwind.md)).
- **Installable app:** the site is a PWA. Icons and iOS splash screens in
  `client/public/` are generated by `client/pwa-assets.config.ts`.
- **Tests:** see [frontend testing](frontend-testing.md).

---

## 9. Email and analytics

### Email

`api/src/helpers/sendEmail.tsx` sends through the provider in
`EMAIL_PROVIDER`:

| Provider | Used |
|---|---|
| `mock` | Locally. Prints the email in the API's terminal. Also the default if the variable is missing. |
| `mailgun` | Production. Sent from `hapi-team@<EMAIL_DOMAIN>` via Mailgun's US API. |
| `aws` | SES. Still in the code, but unused, and production has no SES permissions. |

The site sends three emails, all from `authRouter.ts`: a new account (with
its generated password and a link to the login page), a batch of new
accounts, and a password reset code. They're plain text.

In production, the Mailgun key is read from Secrets Manager when the Lambda
starts (`api/src/lambdaSecrets.ts`). It's never stored in an environment
variable in AWS.

### Analytics

There are two separate systems:

- **The site's own view counts.** Opening a project or showcase page records
  a `ProjectView` or `ShowcaseView`, at most once per visitor IP address
  per 24 hours. These drive the "Most popular" sort and the admin
  analytics tables (`analyticsRouter.ts`).
- **[Umami](https://umami.is/)** (optional) records page views for the
  whole site. If `VITE_UMAMI_SCRIPT_URL` and `VITE_UMAMI_WEBSITE_ID` are
  set, `client/src/main.tsx` adds Umami's script. The admin analytics page
  links to the Umami dashboard (`VITE_UMAMI_DASHBOARD_URL`).

---

## 10. Configuration

Settings reach the code in three ways. Which one applies matters when you
add a setting.

| Kind | Locally | In production | Changing it |
|---|---|---|---|
| **API settings** (`process.env.*` in `api/`) | `.env` | Lambda environment variables, set in `infra/app/backend.tf` | A pull request; applied on deploy |
| **Website settings** (`import.meta.env.VITE_*`) | `.env` | Built into the JavaScript by `ci/deploy-frontend.sh` | Requires a rebuild. They're **public**: anyone can read them in the browser. |
| **Secrets** (only the Mailgun key) | `.env` (`MAILGUN_KEY`) | Secrets Manager, read at start-up | [Set with the AWS CLI](../infrastructure/deploy-to-race.md#store-the-mailgun-key) |

To add an API setting:

1. Read it from `process.env`.
2. Add it to `.env.example`.
3. Add it to the Lambda's `environment` block in `infra/app/backend.tf`.

Never put a secret in a `VITE_*` variable or a Lambda environment variable.
