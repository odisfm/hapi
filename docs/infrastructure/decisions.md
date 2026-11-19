# Decisions

Why the infrastructure and tooling are the way they are. Read this before
changing something that looks odd: there's usually a reason, and this page
says when that reason stops applying.

For how things work, see [infrastructure design](infrastructure-design.md).
For problems we know about, see [known issues](../known-issues.md).

---

## Where it runs

### AWS, in RACE's account, in Sydney

- **Decision:** everything runs in an AWS account owned by RACE, RMIT's team
  that provides AWS accounts to academics and students. The region is
  `ap-southeast-2` (Sydney).
- **Why:** RMIT's arrangement with AWS goes through RACE, and RACE's
  accounts come with RMIT's security rules.
- **Consequences:** RACE's rules shape a lot of what follows:
  - every IAM role is named `rmit-…` and carries RACE's permissions
    boundary
  - the infrastructure creates no IAM users or access keys
  - humans use one IAM user that RACE provides

### Only one environment (`prod`)

- **Decision:** there is no staging environment.
- **Why:** each environment has its own database, NAT and pipeline, so a
  second one roughly doubles the fixed cost.
- **Consequences:** changes are tested locally, then go straight to
  production.
- **Revisit:** the infrastructure can add environments without structural
  changes ([runbook](runbooks.md#adding-another-environment)), but see the
  staging gaps in [known issues](../known-issues.md#adding-a-staging-environment).

### The site starts empty

- **Decision:** no data was copied from the capstone-era environments
  (databases on Supabase, and a different AWS account).
- **Why:** they held demo data only.

---

## Source control and deployment

### CodeCommit and CodeBuild instead of GitHub Actions

- **Decision:** the code lives in AWS CodeCommit. Deploys run in AWS
  CodeBuild, started by EventBridge when `main` changes.
- **Why:** a GitHub Actions deploy needs long-lived AWS access keys stored
  in GitHub, and RACE's account allows no IAM users or keys. CodeBuild runs
  as an IAM role instead.
- **Consequences:**
  - Git authenticates with AWS credentials through `git-remote-codecommit`.
  - The GitHub repository is kept for now as a read-only copy. Pushing to
    it deploys nothing.

### Every merge to `main` deploys, with no approval step

- **Decision:** every merge into `main` runs the checks and, if they pass,
  deploys to production.
- **Why:** simple, and the team is small.
- **Consequences:** the checks don't run on pull requests, so a broken
  change can be merged and then fail at deploy (nothing is deployed, but
  `main` is broken until fixed). Run the checks locally before review.
- **Revisit:** a second, checks-only CodeBuild project triggered by
  CodeCommit pull request events would add PR checks.

### One build at a time; extra builds fail instead of queueing

- **Decision:** the CodeBuild project allows one build at a time. A build
  triggered while another runs fails to start.
- **Why:** if builds queued, an older commit could be deployed after a
  newer one.
- **Consequences:** after two quick merges, start a build by hand
  (`aws codebuild start-build --project-name hapi-prod-deploy`). It builds
  the latest `main`.

### `npm audit` blocks deploys

- **Decision:** a high or critical advisory in a **production** dependency
  fails the build. Development-only dependencies don't.
- **Why:** known vulnerabilities in code that actually runs in production
  get fixed before they're deployed.
- **Consequences:** a newly published advisory can block deploys without
  any code change. See
  [Fix a failing npm audit](../dev/common-tasks.md#fix-a-failing-npm-audit).

### OpenTofu, split into roots by lifecycle

- **Decision:** the infrastructure is [OpenTofu](https://opentofu.org/)
  (the open-source fork of Terraform), version pinned. It's split into
  separate roots:

  | Root | Applied by | When |
  |---|---|---|
  | `bootstrap` | An admin | Once per account |
  | `platform` | An admin | When it changes |
  | `db` | The pipeline | Every deploy |
  | `app` | The pipeline | Every deploy |
  | `local_dev` | An admin | Once per account |

- **Why:**
  - The state bucket and repository must exist before anything else.
  - The pipeline runs inside the VPC, so the VPC must exist before the
    pipeline.
  - The pipeline must not be able to change its own permissions.
  - The database must exist before migrations, and migrations must run
    before new code.
- **Consequences:** changes to `infra/platform` don't deploy through the
  pipeline. An admin applies them. The code stays Terraform-compatible.

---

## Network

### Lambdas, database and pipeline in private subnets

- **Decision:** nothing except the NAT instance has a public address. Only
  CloudFront and API Gateway accept traffic from the internet.
- **Why:** RACE's security expectations, and the database should never be
  reachable from the internet.
- **Consequences:**
  - Humans reach the database only through an SSM tunnel.
  - Anything that needs the internet goes through the NAT.

### A NAT instance (fck-nat), not an AWS NAT Gateway

- **Decision:** one `t4g.nano` instance running
  [fck-nat](https://fck-nat.dev) provides outbound internet, in an Auto
  Scaling group of one, with a fixed network interface and IP. S3 traffic
  uses a free VPC gateway endpoint instead.
- **Why:** a NAT Gateway costs about US$40+ a month before traffic. The
  instance costs a few dollars.
- **Consequences:**
  - It's a single instance. If it fails, outbound internet stops for a few
    minutes until the replacement is up: email, video processing and
    deploys, but not the site itself.
  - It needs weekly OS patching (automatic), with a brief outage when it
    reboots.
- **Revisit:** if outbound reliability starts to matter more than cost,
  replace it with a NAT Gateway.

### API Gateway behind CloudFront

- **Decision:** CloudFront serves the website, the media and the API
  (`/api/*` → API Gateway → Lambda) from one domain.
- **Why:** everything shares one origin, so there's no CORS in production,
  and the session cookie works.

### No custom domain yet

- **Decision:** the site uses its CloudFront address
  (`https://<id>.cloudfront.net`).
- **Why:** a domain needs approval from RMIT, which isn't settled.
- **Revisit:** `infra/app` has a `domain` variable. A custom domain also
  needs an ACM certificate in `us-east-1` and DNS records, which aren't
  built yet.

---

## Database

### RDS PostgreSQL 17, single-AZ, no RDS Proxy

- **Decision:** one `db.t4g.micro` instance in one availability zone.
  Version 17 matches local development (Supabase Local).
- **Why:**
  - Multi-AZ roughly doubles the database cost, for protection against an
    AZ outage that this site can tolerate.
  - RDS Proxy adds cost.
  - Connection limits are handled another way: each Lambda container uses a
    single connection, and reserved concurrency caps the number of
    containers (budget in `infra/app/main.tf`).
- **Consequences:**
  - An AZ outage takes the site down until AWS recovers it.
  - With the concurrency reservations off (`-1`, while the account's Lambda
    quota is low), the account quota caps connections instead.

### No database passwords (IAM database authentication)

- **Decision:** the application (`hapi_app`) and migrations (`hapi_owner`)
  log in with short-lived tokens signed by their IAM role. Only the RDS
  master user has a password, which RDS manages and rotates in Secrets
  Manager, and only the pipeline reads it.
- **Why:** no password to leak, rotate or store.
- **Consequences:**
  - Humans also connect with tokens (see the
    [tunnel runbook](runbooks.md#database-access-ssm-port-forward)).
  - The first IAM login on a fresh instance can be slow, which is why
    migrations use a 30-second connect timeout.

### Database users and permissions as code

- **Decision:** the `db` root creates the `hapi_owner` and `hapi_app` users
  and their permissions, and the pipeline applies it on every deploy.
  `hapi_owner` owns the schema. `hapi_app` can only read and write rows.
- **Why:** the application can't damage the schema, and new tables are
  covered automatically (default privileges).

---

## Identity and secrets

### Every role through one module

- **Decision:** all IAM roles are created by `infra/modules/iam_role`. It
  enforces the `rmit-` name and RACE's permissions boundary. Permissions
  are inline and scoped to specific resources.
- **Why:** RACE's rules can't be forgotten. Inline policies avoid relying
  on attaching AWS managed policies, which the boundary might forbid.
- **Consequences:**
  - The pipeline's role can create roles only with the boundary, and only
    for its own environment.
  - It can't modify its own role, its trigger's role or the NAT's role.

### Mailgun for email, its key in Secrets Manager

- **Decision:** email goes through Mailgun's US API. The key is stored in
  Secrets Manager, and the API reads it at start-up. The API is given only
  the secret's ARN.
- **Why:** Mailgun was already set up and working. Amazon SES in a new
  account starts in a sandbox and needs AWS approval before it can email
  anyone.
- **Consequences:**
  - The Mailgun key is the only application secret.
  - The SES code path is still in the app, unused, and production has no
    SES permissions.

### Humans share one IAM user from RACE

- **Decision:** RACE provides one IAM user, and the team shares it through
  a CLI profile.
- **Why:** that's what RACE provides. The infrastructure itself never
  creates users.
- **Consequences:**
  - Pull request approvals are off, because CodeCommit doesn't let a user
    approve their own pull request.
  - Offboarding means rotating the shared key
    ([runbook](runbooks.md#team-access)).
  - If RACE ever provides individual users, or IAM Identity Center
    (SSO), everything works unchanged with them.

### No alarms

- **Decision:** there are no CloudWatch alarms or notifications.
- **Why:** there's no agreed place to send them yet.
- **Consequences:** problems are found by users or by checking the logs
  ([runbook](runbooks.md#where-to-look-when-somethings-wrong)).
- **Revisit:** an alarm on API Lambda errors, sent to a team email list
  through SNS, would be the most useful first one.

---

## Local development

- **Supabase Local** (PostgreSQL 17 in Docker) is the local database, so
  developers need no AWS access for most work.
- **Media** uses shared development buckets in the RACE account
  (`infra/local_dev`), separate from production, because the API uploads
  straight to S3. See [the dev environment guide](../dev/dev-environment.md#media-images-and-video).
- **Video processing** only runs in AWS. There's no local equivalent.
