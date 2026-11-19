# Runbooks

Operational procedures for the AWS deployment described in
[infrastructure-design.md](infrastructure-design.md). Region is
`ap-southeast-2` (Sydney) throughout.

> **Who runs what.** Admins run the `bootstrap` and `platform` roots from a
> laptop. The `db` and `app` roots are only ever applied by the pipeline
> (CodeBuild). Nobody runs `tofu apply` on `db` or `app` by hand.

Contents:

1. [Prerequisites](#1-prerequisites)
2. [Bootstrap (once per AWS account)](#2-bootstrap-once-per-aws-account)
3. [Platform (once per environment)](#3-platform-once-per-environment)
4. [First deploy](#4-first-deploy)
5. [Ongoing deploys](#5-ongoing-deploys)
6. [Database access for humans (SSM port forward)](#6-database-access-for-humans-ssm-port-forward)
7. [Create the first admin user](#7-create-the-first-admin-user)
8. [fck-nat (NAT instance)](#8-fck-nat-nat-instance)
9. [Adding another environment](#9-adding-another-environment)
10. [Migration: rehearsal in the team's private account](#10-migration-rehearsal-in-the-teams-private-account)
11. [Migration: the client's account](#11-migration-the-clients-account)
12. [Open questions](#12-open-questions)

---

## 1. Prerequisites

Tools on the admin's machine:

| Tool | Notes |
|---|---|
| AWS CLI v2 | |
| OpenTofu | Same version as `tofu_version` in `infra/platform/variables.tf` (currently `1.12.6`). |
| Session Manager plugin | For [DB access](#6-database-access-for-humans-ssm-port-forward). [Install](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html). |
| `git-remote-codecommit` | `pip install git-remote-codecommit` |
| `psql` (optional) | Any Postgres 17 client. |

### AWS credentials

**This project never creates IAM users.** Humans authenticate with whatever
identity the account owner provides:

- **Client account:** an IAM user created *by the client* (not by this
  repository's code). Configure it as a named CLI profile and enable MFA if
  the client allows it:

  ```sh
  aws configure --profile hapi-admin      # access key + secret from the client
  export AWS_PROFILE=hapi-admin AWS_REGION=ap-southeast-2
  aws sts get-caller-identity             # sanity check
  ```

- **Rehearsal account:** an IAM user created by hand to mirror the client's
  ([§10.0](#100-admin-identity-for-the-rehearsal)). Do not use the root user's
  access keys.

If the account later offers IAM Identity Center (SSO), `aws configure sso`
works with every command here unchanged.

Git never uses HTTPS Git credentials or SSH keys. `git-remote-codecommit`
signs requests with the active AWS profile.

### Values you need

| Value | Where it comes from |
|---|---|
| Account ID | `aws sts get-caller-identity` |
| `permissions_boundary_arn` | Client (Q1). Rehearsal: the stand-in policy from §10.3. |
| `iam_role_path` | Client, if mandated; otherwise `/`. |
| VPC CIDR | Client (Q3) or the default `10.10.0.0/16` for `prod`. |
| Mailgun sending domain and API key | The team's Mailgun account. |

---

## 2. Bootstrap (once per AWS account)

Creates the state bucket and the CodeCommit repository. The state bucket
doesn't exist yet, so the first apply uses local state and is then migrated.

```sh
cd infra/bootstrap

# 1. First apply, local state.
mv backend.tf backend.tf.off
tofu init
tofu apply            # set -var pr_approvals_required=0 if every human shares one IAM identity (see below)
BUCKET=$(tofu output -raw state_bucket)

# 2. Move the state into the bucket it just created.
mv backend.tf.off backend.tf
tofu init -migrate-state \
  -backend-config="bucket=$BUCKET" \
  -backend-config="key=bootstrap.tfstate" \
  -backend-config="region=ap-southeast-2"
tofu plan             # expect: No changes
rm -f terraform.tfstate terraform.tfstate.backup

# 3. Push the code. Nothing deploys yet: the pipeline does not exist.
cd ../..
git remote add aws "codecommit::ap-southeast-2://$AWS_PROFILE@hapi"
git push aws main
```

> **PR approvals:** CodeCommit does not let a pull request's author approve
> it. If the whole team works through one shared IAM user, the approval rule
> can never be satisfied, so set `pr_approvals_required = 0`.

Never commit `terraform.tfstate`. `.gitignore` already excludes it.

---

## 3. Platform (once per environment)

Creates the VPC, NAT, RDS, the Mailgun secret container and the CodeBuild
pipeline. Re-run it whenever `infra/platform` changes.

```sh
# Fill in the TODOs in infra/platform/prod.tfvars first (boundary ARN,
# state bucket, email domain). Non-secret values only; safe to commit.
tofu -chdir=infra/platform init \
  -backend-config="bucket=$BUCKET" \
  -backend-config="key=prod/platform.tfstate" \
  -backend-config="region=ap-southeast-2"
tofu -chdir=infra/platform apply -var-file=prod.tfvars
```

RDS creation takes about 10 to 15 minutes.

### Set the Mailgun key

Terraform creates only the secret's container, so its value never enters
state. Set the value from a file so it doesn't end up in your shell history:

```sh
printf '%s' 'key-xxxxxxxx' > /tmp/mg   # or paste into an editor
aws secretsmanager put-secret-value \
  --secret-id hapi/prod/mailgun-key \
  --secret-string file:///tmp/mg
rm /tmp/mg
```

The value is the bare API key, not JSON. If Mailgun's API key has an IP
allowlist, add the NAT's fixed egress IP:
`tofu -chdir=infra/platform output nat_egress_ip`.

### Check the NAT

```sh
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names "$(tofu -chdir=infra/platform output -raw fck_nat_asg_name)" \
  --query 'AutoScalingGroups[0].Instances[].[InstanceId,HealthStatus,LifecycleState]'
aws ssm describe-instance-information \
  --filters Key=tag:hapi:role,Values=hapi-prod-fck-nat \
  --query 'InstanceInformationList[].[InstanceId,PingStatus]'   # expect Online
```

If the instance is healthy but not `Online` in SSM, see
[§8](#8-fck-nat-nat-instance) ("SSM agent").

---

## 4. First deploy

The repository was pushed before the pipeline existed, so start the first
build by hand:

```sh
aws codebuild start-build --project-name hapi-prod-deploy
```

Watch it in the CodeBuild console or with
`aws logs tail /aws/codebuild/hapi-prod-deploy --follow`. A first build takes
around 15 to 20 minutes, most of it creating the CloudFront distribution.

Then:

1. [Create the first admin](#7-create-the-first-admin-user).
2. Open `tofu -chdir=infra/app output cloudfront_url`. You'll need app-root
   state access to read it; it's also printed at the end of the build log.
3. Work through the acceptance checks in [§10.6](#106-verify).

---

## 5. Ongoing deploys

Merge a pull request into `main` in CodeCommit. EventBridge starts
`hapi-prod-deploy` for that exact commit, and it runs:

checks → Lambda bundles → `db` root → migrations → `app` root → frontend.

If any check fails, nothing is applied. If a later step fails, the steps
after it don't run. Re-run a failed or missed build for the current `main`
with `aws codebuild start-build --project-name hapi-prod-deploy`.

> **Two merges in quick succession:** the project allows one build at a time.
> A build triggered while another is running **fails to start** rather than
> queueing (so an older commit can never be applied over a newer one). If
> that happens, start a build by hand once the first finishes; it builds
> the latest `main`.

There are no automatic checks on pull requests yet. Run
`npm run lint`, `npm run typecheck --workspaces --if-present` and
`npm test --workspaces` locally before asking for review.

---

## 6. Database access for humans (SSM port forward)

RDS is not reachable from the internet. Admins tunnel through the NAT
instance with Session Manager; no SSH, no open ports. (CloudShell can't
reach it either: CloudShell runs outside the VPC, so `psql` from there just
hangs.)

Needs: `ssm:StartSession` on the NAT instance and the
`AWS-StartPortForwardingSessionToRemoteHost` document, and `rds-db:connect`
for the database user (`hapi_owner` below).

```sh
DB_HOST=$(tofu -chdir=infra/platform output -raw db_host)
NAT_ID=$(aws ec2 describe-instances \
  --filters Name=tag:hapi:role,Values=hapi-prod-fck-nat Name=instance-state-name,Values=running \
  --query 'Reservations[0].Instances[0].InstanceId' --output text)

# Terminal 1: keep this running.
aws ssm start-session --target "$NAT_ID" \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters "host=$DB_HOST,portNumber=5432,localPortNumber=15432"
```

```sh
# Terminal 2. The token must be generated for the REAL RDS hostname, and is
# valid for 15 minutes (only needed when connecting).
TOKEN=$(aws rds generate-db-auth-token \
  --hostname "$DB_HOST" --port 5432 --username hapi_owner --region ap-southeast-2)

PGPASSWORD="$TOKEN" psql "host=localhost port=15432 dbname=hapi user=hapi_owner sslmode=require"
```

When it goes wrong:

| Symptom | Cause |
|---|---|
| `Connection refused` on `localhost:15432` | The tunnel has closed (SSM ends idle sessions after about 20 minutes). Restart it in terminal 1. |
| RDS log: `empty password returned by client` | `$TOKEN` is empty in this shell (generated in another terminal, or lost in a multi-line paste). |
| Prisma/Node error with no message | Usually one of the above. Test with `psql` first; its errors are clearer. |

Because you connect to `localhost`, the certificate's hostname cannot match.
Use TLS **without** hostname verification **only for this tunnel**:

| Client | Setting |
|---|---|
| `psql` / libpq | `sslmode=require` (encrypts, doesn't verify) |
| Node (`pg`, Prisma client, our scripts) | `?sslmode=no-verify` in `DATABASE_URL`. Node's `pg` treats `require` as full verification, which fails through the tunnel. |

To use the token in a URL, URL-encode it:

```sh
ENC=$(node -e 'process.stdout.write(encodeURIComponent(process.argv[1]))' "$TOKEN")
export DATABASE_URL="postgresql://hapi_owner:${ENC}@localhost:15432/hapi?sslmode=no-verify"
```

`hapi_owner` owns every table, so be careful. For read-only investigation,
prefer `hapi_app` (generate the token with `--username hapi_app`; you'll
need `rds-db:connect` on it).

The RDS master password (RDS-managed secret) is only for the pipeline's
`db` root. Don't use it day to day.

---

## 7. Create the first admin user

Once per environment, after the first deploy (so the tables exist). With the
tunnel from §6 open and `DATABASE_URL` exported:

Read the password without echoing it, so it stays out of your shell
history. Paste this line **on its own**: in a multi-line paste, `read`
takes the next pasted line as the password. (zsh syntax; in bash use
`read -rsp 'Temporary admin password: ' ADMIN_PASSWORD`.)

```sh
read -s "ADMIN_PASSWORD?Temporary admin password: "
```

Then:

```sh
ADMIN_EMAIL='someone@example.com' ADMIN_NAME='Site Admin' ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  npm run db:create-admin --workspace shared
unset ADMIN_PASSWORD DATABASE_URL
```

- Pass the plain password: the script hashes it (the same `hashPassword`
  the API uses).
- The script is idempotent: if the email exists, it does nothing.
- It never truncates or deletes anything. (`db:populate` does truncate, so
  **never run it against AWS**.)
- The admin must change the password on first login.
- The script does not read `.env`, so a missing `DATABASE_URL` is an
  error, not a silent write to your local database.

---

## 8. fck-nat (NAT instance)

One `t4g.nano` [fck-nat](https://fck-nat.dev) instance in an Auto Scaling
Group (min = max = 1) gives the private subnets internet egress: email,
Secrets Manager, the MediaConvert API, and npm/GitHub for CodeBuild. S3 goes
through the gateway endpoint, and RDS is inside the VPC. **Neither depends
on the NAT.**

How it fails over: private routes point at a fixed "static" ENI. Each new
instance attaches that ENI, then moves the NAT's Elastic IP onto itself, so
routes and the egress IP never change.

### Patching

SSM State Manager runs `AWS-RunPatchBaseline` (install, reboot if needed)
every Saturday 16:00 UTC, which is 03:00 Sunday Sydney in summer and 02:00
in winter. A reboot interrupts **outbound internet from Lambdas and
CodeBuild for a few minutes**:

- Email sending fails during that window (the api retries loading the
  Mailgun key on the next send).
- Video uploads may fail to start a MediaConvert job.
- A deploy running at that moment may fail; re-run it.

DB and S3 traffic are unaffected.

The association only runs on its schedule (`apply_only_at_cron_interval`),
so creating or changing it with a platform apply does not patch or reboot
the NAT on the spot.

Check compliance / run now:

```sh
aws ssm describe-instance-patch-states --instance-ids "$NAT_ID"
aws ssm start-associations-once --association-ids \
  "$(aws ssm list-associations --association-filter-list key=AssociationName,value=hapi-prod-fck-nat-patch \
     --query 'Associations[0].AssociationId' --output text)"
```

### Replace the instance (or pick up a new fck-nat AMI)

The launch template follows the newest official fck-nat AMI as of the last
`platform` apply. Running instances are not replaced automatically. To
replace one (a few minutes of egress outage):

```sh
tofu -chdir=infra/platform apply -var-file=prod.tfvars   # refreshes the AMI
aws ec2 terminate-instances --instance-ids "$NAT_ID"
# The ASG launches a replacement, which re-attaches the static ENI and the EIP.
```

Pin an AMI with the module's `ami_id` input if a new image misbehaves.

### SSM agent

The user data installs and enables `amazon-ssm-agent` if the AMI doesn't
ship it. If the instance still isn't `Online` in SSM, check the instance
profile `rmit-hapi-prod-fck-nat` and that outbound HTTPS works from the
public subnet.

---

## 9. Adding another environment

No structural changes are needed:

1. Pick a non-overlapping CIDR (defaults: `staging = 10.20.0.0/16`,
   `dev = 10.30.0.0/16`).
2. Copy `infra/platform/prod.tfvars` to `<env>.tfvars`; set `environment`,
   `deploy_branch` (e.g. `staging`) and anything sized differently.
   Optionally copy `infra/app/prod.tfvars` to `infra/app/<env>.tfvars` for
   per-env reserved concurrency, log retention or domain (the pipeline uses
   it automatically; without it the defaults apply).
3. Apply `platform` with key `<env>/platform.tfstate`, set the Mailgun
   secret, start the first build, and create an admin.

Mind the connection budget (`infra/app/main.tf`): each env's
reserved-concurrency total is separate, but each env has its own RDS.

---

## 10. Migration: rehearsal in the team's private account

Do everything in this section in the team's own account first. **No data is
migrated**: the new environment starts empty.

### 10.0 Admin identity for the rehearsal

Mirror the client setup: as root, create one IAM user by hand (console),
outside this repository. Ideally give it the same permissions the client's
user will have (Q14); otherwise `AdministratorAccess`. Create an access key,
enable MFA, and stop using root.

### 10.1 Tag the pre-migration code

```sh
git tag pre-migration <last commit on main before this work>
git push origin pre-migration
```

### 10.2 Tear down the old stacks (old code, `ap-southeast-4`)

The old stacks are destroyed with the **old** code. For each of `staging`
and `production`:

```sh
git worktree add ../hapi-old pre-migration
cd ../hapi-old

# Old state lives in the old TF_STATE_BUCKET (GitHub Actions variable).
OLD_BUCKET=<old TF_STATE_BUCKET>
ENV=staging        # then: production
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)

# 1. Empty the buckets (destroy fails on non-empty buckets).
for b in frontend icons screenshots; do
  aws s3 rm "s3://$b-$ENV-$ACCOUNT-ap-southeast-4-an" --recursive --region ap-southeast-4
done
aws s3 rm "s3://lambda-artifacts-$ENV-$ACCOUNT" --recursive --region ap-southeast-4

# 2. The old config hashes the Lambda zips, so they must exist (contents don't matter).
mkdir -p api/dist infra/lambda/{transcode_in,transcode_out,media_cleanup}/dist
for z in api/dist infra/lambda/{transcode_in,transcode_out,media_cleanup}/dist; do echo x > $z/lambda.zip; done

# 3. Destroy, with dummy values for the variables.
cd infra
tofu init -reconfigure -backend-config="bucket=$OLD_BUCKET" -backend-config="key=$ENV.tfstate"
tofu destroy \
  -var environment=$ENV -var lambda_db_url=x -var mailgun_key=x \
  -var email_provider=mock -var email_domain=x -var transcode_role_arn=x
```

Then, by hand (they were never in Terraform):

- Delete the IAM role `lambda_exec_role` and the MediaConvert role that
  `TRANSCODE_ROLE_ARN` pointed at.
- Delete the GitHub Actions IAM user and its access keys.
- Empty (all versions) and delete the old state bucket.
- Delete the GitHub Actions secrets for AWS and the databases.

### 10.3 Stand-in permissions boundary

Until the client's real boundary JSON is available (Q1), create a stand-in
boundary that is permissive but blocks what the client's boundary
presumably blocks:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Sid": "AllowAll", "Effect": "Allow", "Action": "*", "Resource": "*" },
    {
      "Sid": "NoIamUsersOrKeys",
      "Effect": "Deny",
      "Action": ["iam:CreateUser", "iam:CreateAccessKey", "iam:CreateLoginProfile"],
      "Resource": "*"
    }
  ]
}
```

```sh
aws iam create-policy --policy-name rmit-hapi-standin-boundary \
  --policy-document file://standin-boundary.json
```

Use its ARN as `permissions_boundary_arn`. Replace it with the real JSON as
soon as the client provides it, and re-run the rehearsal: a stricter
boundary is the most likely thing to break the client deploy.

### 10.4 Build the new environment

Follow §2 → §3 → §4 → §7 in `ap-southeast-2`.

### 10.5 Supabase

Pause or delete the Supabase staging and production projects once §10.6
passes. Local development still uses Supabase Local.

### 10.6 Verify

- [ ] A PR merged into `main` triggers exactly one build. A deliberately
      failing test aborts it before any `tofu apply`.
- [ ] A successful build applies migrations and `app`; the site loads at the
      CloudFront URL and `/api/*` responds.
- [ ] Every `rmit-hapi-*` role has the boundary. `list-roles` doesn't return
      `PermissionsBoundary` (it always shows `None`), so check each role:
      `for r in $(aws iam list-roles --query "Roles[?starts_with(RoleName,'rmit-hapi')].RoleName" --output text); do aws iam get-role --role-name $r --query '[Role.RoleName,Role.PermissionsBoundary.PermissionsBoundaryArn]' --output text; done`.
      The project created no IAM users.
- [ ] Lambda configuration shows private subnets and no `DATABASE_URL`,
      passwords or keys in environment variables.
- [ ] `tofu state pull` for each root contains neither the Mailgun key nor
      the RDS master password (grep for both).
- [ ] RDS: `PubliclyAccessible = false`; parameter `rds.force_ssl = 1`.
- [ ] Email sends (e.g. a password reset).
- [ ] Video upload → `transcode_in` → MediaConvert → `transcode_out` →
      playable.
- [ ] `media_cleanup` runs (invoke it, or wait for Monday 03:00 Melbourne).
- [ ] Terminate the NAT instance: a replacement appears and egress returns
      with the same IP, with no route changes.
- [ ] The SSM patch association has a successful run.
- [ ] §6 tunnel works; the admin from §7 exists and is forced to reset the
      password.

---

## 11. Migration: the client's account

### 11.1 Prerequisites to confirm with the client

- [ ] Answers to the [open questions](#12-open-questions).
- [ ] CodeCommit, CodeBuild, MediaConvert, RDS, EC2, Lambda, CloudFront,
      Secrets Manager and SSM are available and allowed by SCPs in
      `ap-southeast-2`.
- [ ] SCPs allow Internet Gateways, Elastic IPs and public IPv4 on EC2,
      which fck-nat needs. **If not, stop:** the egress design must change.
- [ ] Service-linked roles for RDS (`AWSServiceRoleForRDS`) and Auto Scaling
      (`AWSServiceRoleForAutoScaling`) exist, or the provided user may
      `iam:CreateServiceLinkedRole`. They cannot carry the `rmit-` prefix or a
      boundary (Q10).
- [ ] Lambda concurrent-executions quota is at least 1000. Reserved
      concurrency (31 by default) fails if it would leave fewer than 100
      unreserved, and new accounts can start at 10. Until it's raised, set
      every value in `lambda_reserved_concurrency` in the committed
      `infra/app/prod.tfvars` to `-1` (check the rehearsal account too:
      `aws lambda get-account-settings`).
- [ ] CloudFront can create distributions (new accounts are sometimes held
      for verification).
- [ ] The provided IAM user's permissions (Q14) cover everything in §2, §3,
      §6 and §7.

### 11.2 Run

§2 → §3 → §4 → §7, then the checks in §10.6.

### 11.3 Retire GitHub

Only after §11.2 passes: remove `.github/workflows/`, delete the GitHub
secrets, and archive the repository or keep it as a mirror (decision
pending, Q12).

---

## 12. Open questions

Placeholders are in place for each; update this table as answers arrive.

| # | Question | Placeholder / current answer |
|---|---|---|
| Q1 | Permissions boundary ARN, JSON, and any required role path? | Required variable, no default. Path `/`. Stand-in for rehearsal (§10.3). |
| Q2 | Do SCPs allow IGW / EIP / public IPv4 on EC2? | Assumed yes (fck-nat depends on it). |
| Q3 | Allocated VPC CIDR? | `10.10.0.0/16` |
| Q4 | Multi-AZ RDS? | **Decided:** single-AZ. |
| Q5 | Mailgun or SES? | **Decided:** Mailgun. SES code stays in the app but is unused, with no IAM. |
| Q6 | OpenTofu or Terraform? | **Decided:** OpenTofu. |
| Q7 | Custom domain? | **Decided:** not now; CloudFront URL. |
| Q8 | Should `npm audit` block deploys? | **Decided:** yes, production dependencies, high and above. |
| Q9 | Client-side admin; `ssm:StartSession` and `rds-db:connect`? | See Q14. |
| Q10 | Will the client pre-create the RDS / Auto Scaling service-linked roles? | Unknown. |
| Q11 | Where should alarms go? | **Decided:** no alarms for now. |
| Q12 | Retire GitHub or keep a mirror? | Decide later. |
| Q13 | Does `rmit-` apply beyond roles and instance profiles? | Assumed roles and instance profiles only. |
| Q14 | What can the client-provided IAM user do? Needs: create roles **with the boundary** (`iam:CreateRole`, `PutRolePolicy`, `PassRole` to CodeBuild/EC2/Lambda/Events), `iam:CreateServiceLinkedRole`, full access to the services in §11.1, `ssm:StartSession`, `rds-db:connect`, `secretsmanager:PutSecretValue`. Is it MFA-protected? Shared by the team? | Unknown. |
