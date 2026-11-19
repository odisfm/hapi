# Known issues

Problems we know about but haven't fixed, roughly in order of importance,
followed by traps that have caught people before. When you fix one,
delete it from this page in the same pull request.

Contents:

- [Missing or incomplete](#missing-or-incomplete)
- [Adding a staging environment](#adding-a-staging-environment)
- [Code quality](#code-quality)
- [Gotchas](#gotchas)

---

## Missing or incomplete

| Gap | Notes |
|---|---|
| No checks on pull requests | Checks only run after a merge. See [decisions](infrastructure/decisions.md#every-merge-to-main-deploys-with-no-approval-step). |
| No alarms | Failures are only noticed by users or by reading logs. See [decisions](infrastructure/decisions.md#no-alarms). |
| No custom domain | See [decisions](infrastructure/decisions.md#no-custom-domain-yet). |
| Demo data has no images | `db:populate`'s projects refer to images that no longer exist in any bucket. Local demo projects show without images. |
| Media isn't backed up | The S3 buckets have no versioning. See [backups](infrastructure/runbooks.md#back-up-and-restore-the-database). |
| The database restore runbook hasn't been tested | Practise it once before you need it. |
| Very old browsers can't save in production | The CSRF check accepts a request in production only if the browser sends `Sec-Fetch-Site: same-origin`. Browsers from before 2023 (Safari before 16.4, for example) don't, so their uploads and saves get a 403. Checking the `Origin` header instead would need the API to know the CloudFront address, but CloudFront is created after the API. See [the API](dev/architecture.md#7-the-api). |

---

## Adding a staging environment

The [runbook](infrastructure/runbooks.md#adding-another-environment)
covers the infrastructure, but a second environment has gaps:

- **Its first build will probably fail.** Without
  `infra/app/<env>.tfvars`, the `app` root falls back to reserving Lambda
  concurrency (20/5/5/1), which AWS rejects while the account's quota is
  below 1000. Copy `infra/app/prod.tfvars` to fix this, or change the
  defaults in `infra/app/variables.tf` to `-1`.
- **It shares the Lambda quota with production.** The concurrency quota
  covers the whole AWS account, so a busy staging site can slow
  production. A separate AWS account for staging avoids this.
- **There's no release flow.** Only `main` needs an approval (if any).
  Pushes to the staging branch deploy straight away. Agree a flow first,
  for example: features → `staging` → test → merge `staging` into `main`.
- **The runbook commands name `hapi-prod-*`.** Substitute the environment
  name.
- **It costs roughly as much as production again.**

---

## Code quality

- **The API's TypeScript isn't linted.** `api/eslint.config.js` has no
  `files` pattern, so ESLint only checks `.js` files there. Add
  TypeScript linting like `client/` has, then fix what it finds.
- **Role checks are written by hand in each handler**
  (`if (user.role !== "ADMIN")`). An `adminOnly` middleware would make
  mistakes less likely.
- **Some handlers don't validate their input with zod.** They read the
  body directly, for example `/auth/forgot-password` and `/media/video`.
- **Search filters in memory.** `GET /project/search` loads every visible
  project, then filters and pages in JavaScript. That's fine for hundreds
  of projects, but slow for thousands.
- **`db:migrate:deploy` also runs `prisma db push`**
  (`shared/package.json`). It can make a local database match the schema
  without a migration, which hides a forgotten migration until it fails in
  the pipeline. Run `prisma migrate dev` when changing the schema
  ([common tasks](dev/common-tasks.md#change-the-database-schema)).
- **Leftovers:**
  - the unused SES email code (`api/src/services/simpleEmailService.ts`)
  - `GET /analytics/example`
  - `api/src/index.ts`'s `GET /` ("Hello Hono!")
  - a `// todo: link to site` in `authRouter.ts`

---

## Gotchas

Things that look wrong, or that are easy to get wrong. Most were learned
the hard way while building the AWS setup.

**Application**

- **Inside a transaction, use `tx`, never `db`.** Each production Lambda
  has one database connection. A query on `db` inside a transaction waits
  for the connection the transaction holds, and fails after 5 seconds
  (Prisma error `P2028`). Locally there's a pool of 10, so the bug hides.
- **Media URLs in the database have no extension.** Images are
  `<uuid>.webp` and videos `<uuid>.webm` in S3, but the database stores
  just the UUID.
- **The project editor's `:projectId` route parameter is a version ID.**

**Database connections**

- **Node's `pg` treats `sslmode=require` as full certificate verification**,
  unlike `psql`, where it only encrypts. Through the database tunnel
  (`localhost`), Node needs `sslmode=no-verify`.
- **Prisma's migration engine ignores `sslrootcert`.** It needs `sslcert`
  (the CA bundle path) plus `sslaccept=strict`; see `ci/migrate.sh`.
- **IAM database tokens last 15 minutes and must be URL-encoded** in a
  connection string. They're only checked when connecting, so a session
  that's already open keeps working.
- **The first IAM login to a new database can take over 5 seconds.**
  That's why migrations use `connect_timeout=30`.
- **Don't give the RDS master user permanent membership of `hapi_owner`.**
  It would inherit `rds_iam`, which can stop it logging in with its
  password. The PostgreSQL provider grants membership temporarily when it
  needs it.

**AWS**

- **Reserved concurrency fails if it would leave fewer than 100 unreserved
  executions** in the account. New accounts often have a quota of 10. Use
  `-1` for "unreserved". `null` doesn't work, because OpenTofu's
  `optional()` turns it back into the default.
- **CodeBuild in the VPC fetches its source through the NAT.** With the NAT
  down, a build hangs at `DOWNLOAD_SOURCE` instead of failing.
- **Extra CodeBuild builds fail to start; they don't queue.**
- **CodeCommit doesn't let a pull request's author approve it.**
- **The `sharp` image library is bundled for x86_64 Linux.** The API
  Lambda and CodeBuild must stay on x86_64.
- **SSM schedules are in UTC**, so the NAT patch time shifts by an hour with
  daylight saving.
- **A NAT network interface can only attach in its own availability
  zone,** so the fck-nat Auto Scaling group is pinned to that subnet.

**OpenTofu**

- **`tofu validate` on `infra/app` needs the Lambda zips to exist.** Run
  `bash ci/build-lambdas.sh` first, or create placeholder zips.
- **The S3 state backend needs plain `s3:ListBucket`.** A prefix condition
  breaks `tofu init`.
- **`create_before_destroy` with a fixed `name` can't replace a resource**
  (the names clash). The RDS parameter group uses `name_prefix` for this
  reason.
- **Lock provider versions for all four platforms**
  (`linux_amd64`, `linux_arm64`, `darwin_amd64`, `darwin_arm64`), or the
  pipeline and laptops disagree. See
  [upgrades](infrastructure/runbooks.md#opentofu-and-providers).

**Shell scripts**

- **`set -o pipefail` with `cmd | grep -q` fails randomly**, because
  `grep -q` exits early and `cmd` gets SIGPIPE. Use `grep … >/dev/null`.
- **macOS ships Bash 3.2.** With `set -u`, `"${arr[@]}"` on an empty
  array is an error. Use `${arr[@]+"${arr[@]}"}`.
