# CI/CD

Source lives in AWS CodeCommit. Every merge to `main` is checked and, if
everything passes, deployed to [production](../infrastructure/environments.md).
There is no manual approval step.

```
merge to main (CodeCommit)
  └─ EventBridge rule hapi-prod-deploy-on-main
       └─ CodeBuild project hapi-prod-deploy (runs buildspec.yml inside the VPC)
            1. checks            lint, typecheck, tests, npm audit
            2. build-lambdas     api (+ sharp for linux-x64) and the misc Lambdas
            3. apply-db          Postgres roles and grants (infra/db)
            4. migrate           prisma migrate deploy
            5. apply-app         Lambdas, API Gateway, CloudFront, buckets (infra/app)
            6. deploy-frontend   vite build, S3 upload, CloudFront invalidation
```

Each step is a script in [`ci/`](../../ci), called from
[`buildspec.yml`](../../buildspec.yml). Per-env app settings (reserved
concurrency, log retention, custom domain) are in the committed
[`infra/app/prod.tfvars`](../../infra/app/prod.tfvars), which `apply-app`
uses automatically; change them with a normal PR. The first failure stops the build:

- If a **check** fails, nothing is applied.
- If a **later step** fails, the steps after it don't run. Because migrations
  run before the new code is deployed, the database is never behind the code.

Builds run one at a time. A merge that lands while a build is running does
not start a second build; re-run it from the CodeBuild console or with
`aws codebuild start-build --project-name hapi-prod-deploy` (it builds the
latest `main`).

## Checks

The same checks the old GitHub workflow ran, now in [`ci/checks.sh`](../../ci/checks.sh):

- [Lint](https://www.jetbrains.com/pages/static-code-analysis-guide/linters/)
  client, api and shared
- Typecheck every workspace
- [Tests](https://vitest.dev/) in every workspace: client, api, shared **and**
  the Lambdas in `infra/lambda/*`
- `npm audit --omit=dev --audit-level=high`: a high or critical advisory in a
  **production** dependency blocks the deploy (dev tooling does not)
- `prisma validate`

There are currently no automatic checks on pull requests, so run them
locally before asking for review:

```sh
npm run lint --workspace client --workspace api --workspace shared
npm run typecheck --workspaces --if-present
npm run test --workspaces --if-present
```

## Credentials and secrets

The pipeline has no long-lived credentials. CodeBuild runs as the IAM role
`rmit-hapi-prod-codebuild`, which may only manage this environment's
resources, can only create roles that carry the permissions boundary, and
cannot change its own permissions.

- **Database:** no stored passwords. The pipeline reads the RDS-managed master
  password only to apply `infra/db`. Migrations use a 15-minute IAM token as
  `hapi_owner`.
- **Mailgun key:** held in Secrets Manager. The api Lambda receives only its ARN.
- Nothing secret is written to Terraform state, tfvars, Lambda environment
  variables or build logs.

## Changing the pipeline itself

The CodeBuild project, its role and the trigger live in `infra/platform`,
which only an admin can apply ([runbook](../infrastructure/runbooks.md#3-platform-once-per-environment)).
A change to `buildspec.yml` or `ci/` takes effect on the next build. A change
to the project or its permissions needs a `platform` apply first.

## Legacy GitHub workflows

`.github/workflows/` is kept until the client account is live, because the
old stacks are torn down with the old code
([runbook](../infrastructure/runbooks.md#10-migration-rehearsal-in-the-teams-private-account)).
Those workflows no longer match the infrastructure in `infra/` and must not
be used to deploy.
