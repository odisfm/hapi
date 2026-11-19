# Common tasks

Step-by-step guides for changes you'll make often. They assume a working
[development environment](dev-environment.md) and some familiarity with
[how the code works](architecture.md).

Contents:

- [Change the database schema](#change-the-database-schema)
- [Add an API endpoint](#add-an-api-endpoint)
- [Add a page](#add-a-page)
- [Add or update a dependency](#add-or-update-a-dependency)
- [Fix a failing `npm audit`](#fix-a-failing-npm-audit)
- [Manage users](#manage-users)
- [Publish content](#publish-content)
- [Look at or fix production data](#look-at-or-fix-production-data)

---

## Change the database schema

The schema is `shared/prisma/schema.prisma`. Every change to it needs a
**migration**: a SQL file in `shared/prisma/migrations/` that the pipeline
applies to the production database before deploying your code.

1. Edit `schema.prisma`.
2. Generate the migration and apply it to your local database. Give it a
   short `snake_case` name for what it does:

   ```sh
   cd shared
   npx dotenv -e ../.env -- npx prisma migrate dev --name add_project_tagline
   ```

   This writes `prisma/migrations/<timestamp>_add_project_tagline/migration.sql`,
   applies it locally, regenerates the Prisma client and updates
   `prisma/ERD.md`.

3. **Read the generated SQL.** Check it does what you meant. Look out for
   anything that drops a column or table, because on production that
   deletes data.
4. Update the code that uses the changed tables, and its tests. Type errors
   show you most places that need changing:
   `npm run typecheck --workspaces --if-present`.
5. Commit the schema, the migration folder and `ERD.md` together.

Rules:

- **Never edit a migration that has been merged.** Production has already
  run it, so your edit would never apply. Fix mistakes with a new migration.
- **Keep migrations compatible with the code that's running.** Migrations
  run before the new code is deployed, so for a minute or so the old code
  runs against the new schema:
  - adding a table, or a column that's optional or has a default, is safe
  - renaming or dropping a column the old code uses breaks the live site
    during the deploy. Do it in two releases: first stop using the column,
    then remove it.
- New tables are readable and writable by the application automatically.
  The database permissions in `infra/db` cover any table the migrations
  create.

If you pull someone else's migration, run `npm run db:migrate:deploy` and
`npx prisma generate` in `shared/` (see
[the dev environment guide](dev-environment.md#apply-the-schema)).

---

## Add an API endpoint

Example: an admin-only `GET /category/:categoryId/stats`.

1. **Choose the router** in `api/src/routes/`, by URL prefix (mount points
   are in `api/src/index.ts`). For a new area, create a router with
   `createHono()` and mount it in `index.ts`.
2. **Define the input** (for a body or query) as a zod schema in
   `shared/src/types/apiRequests.ts`.
3. **Define the response type** in `shared/src/types/apiResponses.ts`. The
   website imports it too.
4. **Write the handler.** The usual shape:

   ```ts
   categoryRouter.get("/:categoryId/stats", needsAuth, async (c) => {
       const user = c.get("user")!
       if (user.role !== "ADMIN") {
           return c.json({error: "Unauthorised"}, 403)
       }

       let query
       try {
           query = CategoryStatsRequestSchema.parse(c.req.query())
       } catch {
           return c.json({error: "Malformed request"}, 400)
       }

       try {
           const stats = await db.category.findUnique({ /* ... */ })
           if (!stats) return c.json({error: "Not found"}, 404)
           return c.json({stats} satisfies CategoryStatsResponse, 200)
       } catch (e) {
           console.error(e)
           return c.json({error: "Internal server error"}, 500)
       }
   })
   ```

   - `needsAuth` returns 401 if nobody is logged in. **Role checks are up to
     you**; there's no admin-only middleware.
   - For project data, use `canEditProject(user, projectId)` to check a
     student owns the project.
   - Public endpoints must hide anything that isn't live. See
     [when the public can see a project](architecture.md#when-the-public-can-see-a-project).
     Return projects through `filterProject` or `filterProjectPreview` so
     fields don't leak.
   - Writes that must happen together go in `db.$transaction(async (tx) => …)`.
     Use `tx` inside it, never `db`.

5. **Test it.** Tests sit next to the router (`categoryRouter.test.ts`).
   They call the app directly with a mocked database, and log in with
   `loginAs`:

   ```ts
   vi.mock("@hapi/shared", () => import("../test/mockDb"))
   // ...
   test("students can't see stats", async () => {
       const res = await app.request("/category/abc/stats", {headers: loginAs("STUDENT")})
       expect(res.status).toBe(403)
   })
   ```

   `loginAs` also sends `Sec-Fetch-Site: same-origin`, as a browser on the
   site would. Without it, the CSRF check rejects POST, PATCH and DELETE
   requests with 403. For a request without `loginAs`, spread in
   `sameOriginHeaders` from `api/src/test/auth.ts`.

   Any database call you don't stub throws, so stub each one with
   `vi.mocked(db.category.findUnique).mockResolvedValue(...)`. Test the
   permission rules as well as the success case.

6. **Call it from the website** (see [Add a page](#add-a-page)). Locally it's
   at `http://localhost:3000/category/abc/stats`; the website prefixes it with
   `API_URL`.

---

## Add a page

1. Create the component in `client/src/pages/public/`, `student/` or `admin/`.
2. Add a route in `client/src/main.tsx`. Admin pages that use the dashboard
   layout go under the `/dashboard` route's `children`.
3. Fetch data like the other pages do:

   ```tsx
   const res = await fetch(`${API_URL}/category`, {credentials: "include"})
   if (!res.ok) await throwErrorFromResponse(res)
   const json: CategoryResponse = await res.json()
   ```

   `credentials: "include"` sends the login cookie. Leave it out only for
   public data.
4. Style it with Tailwind classes. The RMIT colours and fonts are in
   [tailwind.md](tailwind.md).
5. Add a test next to it (`MyPage.test.tsx`). See
   [frontend testing](frontend-testing.md).
6. For a new dashboard tab, add its name to the list of tabs in
   `client/src/pages/admin/AdminDashboard.tsx`. The tab "Foo Bar" links to
   `/dashboard/foo-bar`.

A page hidden from the wrong users isn't protected by hiding it. Make sure
the API endpoints it calls check the user's role.

---

## Add or update a dependency

Install it into the workspace that uses it, from the repository root:

```sh
npm install some-package --workspace api          # runtime dependency
npm install -D some-tool --workspace client       # development only
```

Commit `package.json` and `package-lock.json` together. The pipeline uses
`npm ci`, which fails if they don't match.

Things to check for packages the API or Lambdas use:

- They're bundled into the Lambda zip by esbuild (`api/esbuild.config.ts`,
  `infra/lambda/*/esbuild.config.ts`). Packages with native code (like
  `sharp`) need special handling. See `ci/build-lambdas.sh`.
- Run `npm audit --omit=dev --audit-level=high` before merging. A high or
  critical advisory in a production dependency blocks deploys.

---

## Fix a failing `npm audit`

The pipeline runs `npm audit --omit=dev --audit-level=high`. A **new**
advisory in a production dependency can start failing builds even when
nobody changed any code. Every merge stays blocked until it's fixed.

1. Reproduce it locally:

   ```sh
   npm audit --omit=dev --audit-level=high
   ```

2. Try the automatic fix. It only makes semver-compatible upgrades:

   ```sh
   npm audit fix --omit=dev
   ```

3. If the vulnerable package is a dependency of a dependency, and no fixed
   version of the parent exists yet, force a fixed version with an
   `overrides` entry in the root `package.json` (there are examples there
   already). Then run `npm install`.
4. Run all the checks and tests, then merge the fix.

Advisories in development-only packages (`devDependencies`) don't block
deploys.

---

## Manage users

Most user management is in the admin dashboard, under **Users**.

| Task | How |
|---|---|
| Create a student or admin | Users → create. The site emails them a generated password. |
| Create many students | Users → create, in bulk. Users with existing emails are skipped, and the result lists any emails that failed to send. |
| Change someone's video credits | Users page. Admins can't be changed. |
| Delete a user | Users page. You can't delete yourself. |
| First admin, or nobody can log in | [Runbook: create an admin user](../infrastructure/runbooks.md#create-an-admin-user) |

New users must choose a new password the first time they log in.

**Someone forgot their password:** they use "Forgot password?" on the login
page and get a code by email. If email isn't working, an admin can set a
password by hand:

1. Hash it: `npx tsx api/src/helpers/hashPassword.ts 'New-Temp-Passw0rd!'`
2. Open the [database tunnel](../infrastructure/runbooks.md#database-access-ssm-port-forward),
   then run:

   ```sql
   UPDATE "User" SET password = '<the hash>', "needsPasswordReset" = true
   WHERE email = 'student@example.com';
   ```

3. Send them the temporary password. The site makes them choose a new one
   when they log in.

**Before deleting a user**, know what goes with them:

- Their sessions and their ownership of projects are deleted. Their
  projects stay, with no owner. Nobody can then edit them as a student,
  their pending versions no longer appear in the admin project queue, and
  video uploads to them fail.
- Versions they reviewed lose their reviewer.

If a student is leaving but their projects should stay, it's usually
better not to delete the account.

---

## Publish content

How content becomes public on the site. Most of this happens in the admin
dashboard; the underlying rules are in
[architecture](architecture.md#4-projects-versions-and-the-approval-queue).

1. **Create the showcase** for the cohort (Showcases). It stays hidden
   until its **published date** is set and has passed. Set a future date to
   schedule it.
2. **Create categories** if needed (Categories).
3. **Projects:**
   - Students create their project, edit it, and submit it.
   - Admins review it in the **Project queue**, then approve it, or reject
     it with feedback.
   - Admins can also create projects themselves. Those start approved.
4. **Publish each project.** In the project editor, an admin ticks
   *published* (students can't). A project is public only when it's
   published, has an approved version, and its showcase is public.
5. **The home page** shows the **featured** projects in the order set under
   Featured projects. Featured projects that are also marked *can be hero*
   are eligible for the two large cards at the top, picked at random on
   each visit. Give them hero art.

Students can keep improving a live project. Each change is a new version
that goes through the queue, while the approved version stays live.

---

## Look at or fix production data

There's no admin UI for everything. For anything else:

1. Open the [database tunnel](../infrastructure/runbooks.md#database-access-ssm-port-forward).
2. Look around as `hapi_app` (rows only). Connect as `hapi_owner` only
   when you need to change something.
3. Before changing data, take a manual snapshot in the RDS console
   (`hapi-prod` → Actions → Take snapshot), so you can undo a mistake.

**Never run `db:populate` against production.** It deletes everything.
