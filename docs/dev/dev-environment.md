# Setting up a development environment

This gets the site running on your machine: the frontend, the API and a
local PostgreSQL database. You don't need an AWS account for most
development work. You only need one for [media uploads](#media-images-and-video)
and [deploying](../processes/CI-CD.md).

## Prerequisites

### Install required software

- [Node.js](https://nodejs.org/) **24** with npm. That's the version the
  pipeline and AWS Lambda use.
- [Docker Desktop](https://www.docker.com/products/docker-desktop/). The
  local database runs in Docker.
- [Git](https://git-scm.com/)
- Windows only: [WSL](https://learn.microsoft.com/en-us/windows/wsl/install).
  The rest of this guide assumes you run commands inside WSL.

### Get the code

The code lives in an AWS CodeCommit repository called `hapi`, in the RACE
AWS account (region `ap-southeast-2`). Every merge to its `main` branch
deploys to production. See [CI/CD](../processes/CI-CD.md).

Git signs in with your AWS credentials, through
[`git-remote-codecommit`](https://github.com/aws/git-remote-codecommit).
There are no Git passwords or SSH keys.

1. Install the [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
   and `git-remote-codecommit`:

   ```sh
   pip install git-remote-codecommit
   ```

2. Create an AWS CLI profile called `hapi` with the access key for the RACE
   account. Ask whoever manages the team's AWS access.

   ```sh
   aws configure --profile hapi     # region: ap-southeast-2
   ```

3. Clone:

   ```sh
   git clone codecommit::ap-southeast-2://hapi@hapi
   cd hapi
   ```

   The URL format is `codecommit::<region>://<profile>@<repository>`.

A copy of the code is also on [GitHub](https://github.com/odisfm/hapi). Use
it to read the code without AWS access, but **CodeCommit is the source of
truth**. Pushing to GitHub deploys nothing.

Work on a branch and open a pull request; don't push to `main`. See
[branching and committing](../processes/branching-and-committing.md).

### Install dependencies

From the repository root:

```sh
npm install
```

This is an npm workspaces monorepo. One install covers every package:

| Folder | What it is |
|---|---|
| `client/` | The website (React, Vite, Tailwind) |
| `api/` | The API (Hono). Runs on AWS Lambda in production and as a Node server locally. |
| `shared/` | Code both use: the database schema and client (Prisma), shared types, scripts |
| `infra/lambda/*` | The media-processing Lambdas |
| `infra/` | The AWS infrastructure (OpenTofu). See [infrastructure design](../infrastructure/infrastructure-design.md). |

### Create `.env`

In the repository root, copy `.env.example` to `.env`:

```sh
cp .env.example .env
```

The defaults are enough to run the site locally, minus media. Each variable
is explained in `.env.example`. A few to know about:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Points at the local database. Leave it as is. |
| `EMAIL_PROVIDER` | Leave as `mock`: emails are printed in the API's terminal instead of sent. That's how you see password reset codes locally. |
| `DEFAULT_ADMIN_*`, `DEFAULT_STUDENT_*` | Logins created when you [load demo data](#load-demo-data). Choose your own. |
| `AWS_*`, `BUCKET_*`, `VITE_S3_*` | Only for [media](#media-images-and-video). |

`.env` is ignored by Git. Never commit it.

## The local database

The local database is [Supabase Local](https://supabase.com/docs/guides/local-development),
a PostgreSQL 17 server in Docker, the same version as production. Its
config is in `shared/supabase/`, so run the Supabase commands from
`shared/`.

### Start it

With Docker running:

```sh
cd shared
npx supabase start     # the first run downloads images and takes a few minutes
```

Stop it with `npx supabase stop`. Data survives restarts.

### Apply the schema

The first time, and whenever someone changes the
[database schema](../../shared/prisma/schema.prisma):

```sh
cd shared
npm run db:migrate:deploy
npx prisma generate
```

- `db:migrate:deploy` applies any migrations your database doesn't have
  yet. It then runs `prisma db push`, which makes your database match the
  schema file even where no migration exists yet.
- `prisma generate` rebuilds the Prisma client, the TypeScript code the API
  uses to query the database. Run it after every schema change, or the
  types won't match.

If your local database gets into a state the migrations can't fix, wipe it
and start again:

```sh
cd shared
npm run db:reset
```

Then [load the demo data](#load-demo-data) again.

### Load demo data

To fill the database with demo projects, showcases and categories, from the
repository root:

```sh
npm run db:populate --workspace shared
```

**This deletes everything in the database first.** So does `db:reset`. Both
refuse to run unless `DATABASE_URL` points at this computer and the
database isn't an Amazon RDS one (`shared/src/scripts/localDbGuard.ts`).
The second check is what stops them wiping production through the
[database tunnel](../infrastructure/runbooks.md#database-access-ssm-port-forward),
which is also on `localhost`. `.env` doesn't override a `DATABASE_URL`
already exported in your shell, so `unset DATABASE_URL` after using the
tunnel.

It also creates the admin and student logins from `DEFAULT_ADMIN_*` and
`DEFAULT_STUDENT_*` in `.env`, if they're set. The demo projects' images
won't load unless you've set up [media](#media-images-and-video).

See [the script](../../shared/src/scripts/populateDb/populateDb.ts).

### Look at the data

Supabase Studio, a web UI for the database, runs at
<http://127.0.0.1:54323> while the database is running.

## Running the site

Use two terminals, both in the repository root.

**API:**

```sh
npm run api:dev
```

The API runs at <http://localhost:3000> and restarts when you change its
code. To call it by hand, use something like [Bruno](https://www.usebruno.com/).
Emails it "sends" appear in this terminal.

**Website:**

```sh
npm run client:dev
```

Open the address it prints (<http://localhost:5173>). Log in with the
`DEFAULT_ADMIN_*` details from `.env`.

## Media (images and video)

Icons, screenshots and videos are stored in S3, even locally: the API
uploads straight to the buckets named in `BUCKET_ICONS` and `BUCKET_MEDIA`,
and the site loads images from `VITE_S3_ICON_BUCKET` and
`VITE_S3_MEDIA_BUCKET`. Without them, everything else works, but images
don't show and uploads fail.

The RACE account has a set of buckets for local development, created by
[`infra/local_dev`](../../infra/local_dev/main.tf):

| Bucket | Used for |
|---|---|
| `hapi-local-icons-<account>-ap-southeast-2-an` | App icons (`BUCKET_ICONS`) |
| `hapi-local-media-<account>-ap-southeast-2-an` | Screenshots, hero art and video (`BUCKET_MEDIA`) |

A CloudFront distribution serves them at `/icons/` and `/media/`, the same
way production does. All developers share these buckets, and their
contents are disposable.

**Don't point local development at the production buckets** (`hapi-*-prod-*`).
The production clean-up job deletes files the production database doesn't
reference, and a mistake could overwrite or delete real media.

### Use the dev buckets

1. Make sure your `hapi` AWS profile works (`aws sts get-caller-identity
   --profile hapi`). The API uses it to upload.
2. Print the settings for `.env`. This reads the `local_dev` state, which
   needs the state bucket's name:

   ```sh
   BUCKET=$(aws s3api list-buckets --profile hapi \
     --query "Buckets[?starts_with(Name,'hapi-tfstate-')].Name | [0]" --output text)
   tofu -chdir=infra/local_dev init \
     -backend-config="bucket=$BUCKET" \
     -backend-config="key=local-dev.tfstate" \
     -backend-config="region=ap-southeast-2"
   AWS_PROFILE=hapi tofu -chdir=infra/local_dev output -raw env_file
   ```

   If you don't have OpenTofu installed, ask someone who does for these
   lines; they're the same for everyone.

3. Replace the matching lines in the media section of `.env` with the
   output, and set `AWS_PROFILE="hapi"`.
4. Restart `npm run api:dev` and `npm run client:dev`.

Uploaded icons and screenshots now appear. Video processing (MediaConvert)
only runs in the deployed environments, so videos uploaded locally stay
"processing", and their raw uploads are deleted after 7 days.

The demo projects from `db:populate` refer to images that aren't in these
buckets, so they show without images. Projects you create or edit yourself
work normally.

### Create the dev buckets

This is only needed once per AWS account. If the
`hapi-local-*` buckets already exist, skip it. An admin applies it from a
laptop, like `infra/platform` (see the
[deploy guide](../infrastructure/deploy-to-race.md) for the tools and
credentials):

```sh
tofu -chdir=infra/local_dev init \
  -backend-config="bucket=$BUCKET" \
  -backend-config="key=local-dev.tfstate" \
  -backend-config="region=ap-southeast-2"
tofu -chdir=infra/local_dev apply
```

It creates the two buckets and the CloudFront distribution (about 5 to 10
minutes) and nothing else: no IAM roles or users. The cost is a few cents a
month at development volumes.

If the local website runs somewhere other than `http://localhost:5173`, add
that address to the `allowed_origins` variable, or video uploads will be
blocked by the browser.

## Tests and checks

The pipeline runs these on every merge to `main`, and a failure blocks the
deploy. Nothing runs them on pull requests, so run them yourself before
asking for review. From the repository root:

```sh
npm run lint --workspace client --workspace api --workspace shared
npm run typecheck --workspaces --if-present
npm run test --workspaces --if-present
```

While you work, run one package's tests in watch mode from its folder:

```sh
cd client      # or api, shared
npm run test:watch
```

See [frontend testing](frontend-testing.md) for how the client tests are
written.

## Next

- [How the code works](architecture.md): a tour of the codebase
- [Common tasks](common-tasks.md): schema changes, new endpoints and pages,
  users, publishing content
