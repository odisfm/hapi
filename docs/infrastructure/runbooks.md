# Runbooks

Day-to-day procedures for the production environment. For the first-time
setup of an AWS account, see [Deploying to the RACE AWS account](deploy-to-race.md).
For how the pieces fit together, see [infrastructure design](infrastructure-design.md).

Everything runs in AWS region `ap-southeast-2` (Sydney), in the AWS account
owned by RACE.

> **Who runs what.** Admins apply `infra/bootstrap` and `infra/platform`
> from a laptop. `infra/db` and `infra/app` are only ever applied by the
> pipeline (CodeBuild). Never run `tofu apply` on `db` or `app` yourself.

Contents:

- [Before you start](#before-you-start)
- [Deploys](#deploys)
- [Where to look when something's wrong](#where-to-look-when-somethings-wrong)
- [A deploy failed](#a-deploy-failed)
- [Undo a bad release](#undo-a-bad-release)
- [Database access (SSM port forward)](#database-access-ssm-port-forward)
- [Back up and restore the database](#back-up-and-restore-the-database)
- [Create an admin user](#create-an-admin-user)
- [Rotate the Mailgun key](#rotate-the-mailgun-key)
- [Team access](#team-access)
- [NAT instance (fck-nat)](#nat-instance-fck-nat)
- [Pause and resume (to save money)](#pause-and-resume-to-save-money)
- [Upgrades](#upgrades)
- [Adding another environment](#adding-another-environment)

---

## Before you start

You need the tools from
[step 2 of the deploy guide](deploy-to-race.md#2-install-the-tools) and an
AWS CLI profile for the RACE account
([step 3](deploy-to-race.md#3-set-up-aws-credentials)). In every terminal:

```sh
export AWS_PROFILE=hapi AWS_REGION=ap-southeast-2
```

Some commands read outputs from the `platform` root. On a machine that
hasn't used it before, initialise it once (this only reads state; it
changes nothing):

```sh
BUCKET=$(aws s3api list-buckets \
  --query "Buckets[?starts_with(Name,'hapi-tfstate-')].Name | [0]" --output text)
tofu -chdir=infra/platform init \
  -backend-config="bucket=$BUCKET" \
  -backend-config="key=prod/platform.tfstate" \
  -backend-config="region=ap-southeast-2"
```

---

## Deploys

Merge a pull request into `main` in CodeCommit. EventBridge starts the
CodeBuild project `hapi-prod-deploy` for that exact commit, and it runs:

checks → Lambda bundles → `db` root → migrations → `app` root → frontend.

See [CI/CD](../processes/CI-CD.md) for what each step does.

- **If a check fails,** nothing is applied.
- **If a later step fails,** the steps after it don't run. Fix the cause and
  merge again, or re-run the build.

To re-run a failed or missed build for the current `main`:

```sh
aws codebuild start-build --project-name hapi-prod-deploy --query build.id
```

Follow a build in the CodeBuild console or with
`aws logs tail /aws/codebuild/hapi-prod-deploy --follow`.

> **Two merges in quick succession:** only one build runs at a time. A build
> triggered while another is running **fails to start** instead of
> queueing, so an older commit can never be deployed over a newer one. If
> that happens, start a build by hand once the first finishes. It builds the
> latest `main`.

There are no automatic checks on pull requests. Run the checks locally
before asking for review (see [CI/CD](../processes/CI-CD.md#checks)).

---

## Where to look when something's wrong

There are no alarms. Nobody is notified when something fails, so check
the logs after a deploy and whenever a user reports a problem.

| What | Where |
|---|---|
| The API (every request the site makes) | CloudWatch log group `/aws/lambda/hapi-prod-api` |
| Video processing | `/aws/lambda/hapi-prod-transcode-in` and `/aws/lambda/hapi-prod-transcode-out`; MediaConvert console → Jobs |
| Weekly media clean-up | `/aws/lambda/hapi-prod-media-cleanup` |
| Deploys | `/aws/codebuild/hapi-prod-deploy`, or the CodeBuild console |
| The database | RDS console → `hapi-prod` → Logs & events |

From a terminal:

```sh
aws logs tail /aws/lambda/hapi-prod-api --since 1h            # the last hour
aws logs tail /aws/lambda/hapi-prod-api --follow              # live
aws logs tail /aws/lambda/hapi-prod-api --since 1d --filter-pattern ERROR
```

Lambda logs are kept for 30 days.

---

## A deploy failed

Open the build's log. Each step starts with a line beginning `==>`, and
the last one before the error is the step that failed. Nothing after a
failed step runs.

| Step (`==>` line) | What failed | What to do |
|---|---|---|
| `Installing OpenTofu`, `Fetching RDS CA bundle` | Downloading tools | Usually the NAT instance or a download site was down. Check the [NAT](#nat-instance-fck-nat), then re-run the build. |
| `npm ci` … `npm audit` | The checks | Fix the code in a pull request. For `npm audit`, see [Fix a failing npm audit](../dev/common-tasks.md#fix-a-failing-npm-audit). Nothing was deployed. |
| `Building … Lambda` | Bundling | A build error; reproduce with `bash ci/build-lambdas.sh` locally. Nothing was deployed. |
| `Applying db root` | Database users and permissions | Usually the database was stopped or unreachable. Check `hapi-prod` is "Available" in RDS, then re-run. |
| `prisma migrate deploy` | A migration | See [A migration failed](#a-migration-failed). The new code was **not** deployed. |
| `Applying app root` | Lambdas, API Gateway, CloudFront, buckets | Read the OpenTofu error. Some changes may already be applied; re-running applies the rest. `AccessDenied` usually means RACE's boundary blocks something. |
| `Building frontend` … `Invalidating CloudFront` | The website | The API is already updated, but the website isn't. Fix and re-run. |

Re-run a build for the current `main`:
`aws codebuild start-build --project-name hapi-prod-deploy`.

**`Error acquiring the state lock`:** a build was stopped in the middle of
an apply and left its lock behind. Make sure no build is running, then
remove it. The error message shows the lock ID and which root (`db` or
`app`) is locked:

```sh
tofu -chdir=infra/app init \
  -backend-config="bucket=$BUCKET" \
  -backend-config="key=prod/app.tfstate" \
  -backend-config="region=ap-southeast-2"
tofu -chdir=infra/app force-unlock <lock ID>
```

### A migration failed

A migration that fails part-way is recorded as failed. Every later deploy
then stops at `prisma migrate deploy` with error `P3009` until it's
resolved.

1. Read the error in the build log to see what went wrong.
2. Open the [database tunnel](#database-access-ssm-port-forward) as
   `hapi_owner` and export `DATABASE_URL`.
3. Look at what the migration changed before it failed. Undo any part of it
   that did apply, so the database is back as it was before.
4. Mark it as rolled back:

   ```sh
   cd shared
   npx prisma migrate resolve --rolled-back <migration folder name>
   ```

5. Fix the migration in a pull request. Because it never applied, you may
   edit this one. Merging it deploys it again.

---

## Undo a bad release

There's no rollback button. To undo a change, revert its commit and merge
the revert like any other change:

```sh
git switch main && git pull
git switch -c revert-bad-change
git revert <commit>          # for a merge commit: git revert -m 1 <commit>
git push -u origin revert-bad-change
```

Then open and merge a pull request; it deploys like any other change.

**Migrations aren't undone.** Reverting a commit that contained a migration
leaves the database change in place. The old code then runs against the
new schema, which is fine if the migration only added things. If it
didn't, write a new migration that reverses it.

---

## Database access (SSM port forward)

The database isn't reachable from the internet. To connect from your
laptop, open a tunnel through the NAT instance with AWS Systems Manager
(SSM) Session Manager. There's no SSH and no open port. AWS CloudShell
can't reach the database either, because it runs outside the VPC.

You need permission for `ssm:StartSession` on the NAT instance (with the
`AWS-StartPortForwardingSessionToRemoteHost` document) and for
`rds-db:connect` as the database user.

```sh
DB_HOST=$(aws rds describe-db-instances --db-instance-identifier hapi-prod \
  --query 'DBInstances[0].Endpoint.Address' --output text)
NAT_ID=$(aws ec2 describe-instances \
  --filters Name=tag:hapi:role,Values=hapi-prod-fck-nat Name=instance-state-name,Values=running \
  --query 'Reservations[0].Instances[0].InstanceId' --output text)

# Terminal 1: keep this running.
aws ssm start-session --target "$NAT_ID" \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters "host=$DB_HOST,portNumber=5432,localPortNumber=15432"
```

In a second terminal (set `AWS_PROFILE`, `AWS_REGION` and `DB_HOST` there
too), generate a login token. There are no database passwords: you sign in
with a token from IAM, valid for 15 minutes. It must be generated for the
**real** database hostname, not `localhost`.

```sh
TOKEN=$(aws rds generate-db-auth-token \
  --hostname "$DB_HOST" --port 5432 --username hapi_owner --region ap-southeast-2)

PGPASSWORD="$TOKEN" psql "host=localhost port=15432 dbname=hapi user=hapi_owner sslmode=require"
```

To use the token from Node (Prisma, or the scripts in `shared/`), URL-encode
it into `DATABASE_URL`:

```sh
ENC=$(node -e 'process.stdout.write(encodeURIComponent(process.argv[1]))' "$TOKEN")
export DATABASE_URL="postgresql://hapi_owner:${ENC}@localhost:15432/hapi?sslmode=no-verify"
```

You connect to `localhost`, so the certificate's hostname can't match.
Encrypt but **don't** verify the hostname, and **only for this tunnel**:

| Client | Setting |
|---|---|
| `psql` / libpq | `sslmode=require` (encrypts, doesn't verify) |
| Node (`pg`, Prisma, our scripts) | `sslmode=no-verify`. Node's `pg` treats `require` as full verification, which fails through the tunnel. |

**Which user:**

- `hapi_owner` owns every table and can change the schema. Use it for
  one-off fixes and scripts, and be careful.
- `hapi_app` can only read and write rows. It's what the application uses,
  and the safer choice for investigating. Generate the token with
  `--username hapi_app` instead.
- The RDS master user (its password is managed by RDS in Secrets Manager)
  is only for the pipeline's `db` step. Don't use it day to day.

When it goes wrong:

| Symptom | Cause |
|---|---|
| `Connection refused` on `localhost:15432` | The tunnel has closed. SSM ends idle sessions after about 20 minutes. Restart it in terminal 1. |
| `PAM authentication failed` | The token expired (after 15 minutes) or was generated for the wrong hostname or user. Generate a new one. |
| RDS log says `empty password returned by client` | `$TOKEN` is empty in this shell. It was generated in another terminal, or lost in a multi-line paste. |
| Prisma or Node error with no message | Usually one of the above. Test with `psql` first; its errors are clearer. |

---

## Back up and restore the database

### What's backed up

- **Automatic backups:** RDS keeps 7 days of backups. You can restore to
  any moment in that window, to within about 5 minutes. Daily backups run
  at 14:00–15:00 UTC (about 01:00 Sydney).
- **Manual snapshots:** take one before anything risky (RDS console →
  `hapi-prod` → Actions → Take snapshot, or
  `aws rds create-db-snapshot --db-instance-identifier hapi-prod --db-snapshot-identifier hapi-prod-before-<thing>`).
  They're kept until you delete them.
- **Final snapshot:** if the instance is ever deleted, RDS takes
  `hapi-prod-final` first. Deletion protection is also on.

**Media isn't backed up.** The S3 buckets have no versioning, so a deleted
image or video can't be recovered. A restored database may refer to files
that no longer exist.

### How restoring works

You never restore over the live database. You restore a **copy** as a
temporary instance, then take what you need from it:

- **A few rows** (someone deleted a project): look up the rows in the copy
  and re-insert them into production.
- **Everything** (the data is badly damaged): dump the whole copy and load
  it into production.

> These steps haven't been run against this deployment yet. Practise them
> once before you need them: restore a copy and load it into your **local**
> database instead of production.

You need `psql`, `pg_dump` and `pg_restore` version 17 (the PostgreSQL 17
client tools).

### 1. Restore a copy

```sh
# Network settings of the live instance, so the copy is reachable through the tunnel.
read SUBNET_GROUP SG <<< "$(aws rds describe-db-instances --db-instance-identifier hapi-prod \
  --query 'DBInstances[0].[DBSubnetGroup.DBSubnetGroupName,VpcSecurityGroups[0].VpcSecurityGroupId]' \
  --output text)"

# Which times can you restore to?
aws rds describe-db-instances --db-instance-identifier hapi-prod \
  --query 'DBInstances[0].LatestRestorableTime'

aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier hapi-prod \
  --target-db-instance-identifier hapi-prod-restore \
  --restore-time 2026-11-20T03:00:00Z \
  --db-instance-class db.t4g.micro \
  --db-subnet-group-name "$SUBNET_GROUP" \
  --vpc-security-group-ids "$SG" \
  --no-publicly-accessible --no-multi-az --no-deletion-protection \
  --enable-iam-database-authentication

aws rds wait db-instance-available --db-instance-identifier hapi-prod-restore   # 10-20 minutes
```

The restore time is in UTC. Choose a moment just before the damage. To
restore from a snapshot instead, use `aws rds restore-db-instance-from-db-snapshot`
with `--db-snapshot-identifier <snapshot>` in place of the source and time,
and the same other options.

### 2. Connect to the copy

Open a second tunnel, on port **15433**, alongside the usual one to
production on 15432 (see [Database access](#database-access-ssm-port-forward)):

```sh
RESTORE_HOST=$(aws rds describe-db-instances --db-instance-identifier hapi-prod-restore \
  --query 'DBInstances[0].Endpoint.Address' --output text)

aws ssm start-session --target "$NAT_ID" \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters "host=$RESTORE_HOST,portNumber=5432,localPortNumber=15433"
```

In another terminal:

```sh
RESTORE_TOKEN=$(aws rds generate-db-auth-token \
  --hostname "$RESTORE_HOST" --port 5432 --username hapi_owner --region ap-southeast-2)
PGPASSWORD="$RESTORE_TOKEN" psql "host=localhost port=15433 dbname=hapi user=hapi_owner sslmode=require"
```

The copy has the same users and data as production at the restore time.

### 3a. Copy back a few rows

Find the rows in the copy, then insert them into production (port 15432).
Parent rows go before the rows that refer to them. For a deleted project,
that's `Project`, then `ProjectSlug`, `ProjectOwner`, `ProjectVersion`,
`ProjectMedia`, then the link tables. `\copy` in `psql` can move rows via a
CSV file:

```sql
-- in the copy (15433)
\copy (SELECT * FROM "Project" WHERE id = '<id>') TO 'project.csv' CSV HEADER
-- in production (15432)
\copy "Project" FROM 'project.csv' CSV HEADER
```

### 3b. Replace everything

This overwrites production with the copy. Anything written to production
since the restore time is lost. Do it when the site is quiet, and don't
merge anything while it runs.

```sh
# Take a snapshot of production first, in case this goes wrong.
aws rds create-db-snapshot --db-instance-identifier hapi-prod \
  --db-snapshot-identifier hapi-prod-before-restore-$(date +%Y%m%d%H%M)

# Dump the copy.
PGPASSWORD="$RESTORE_TOKEN" pg_dump \
  "host=localhost port=15433 dbname=hapi user=hapi_owner sslmode=require" \
  --format=custom --file=hapi-restore.dump

# Load it into production, replacing what's there.
PROD_TOKEN=$(aws rds generate-db-auth-token \
  --hostname "$DB_HOST" --port 5432 --username hapi_owner --region ap-southeast-2)
PGPASSWORD="$PROD_TOKEN" pg_restore --clean --if-exists --no-owner --single-transaction \
  --dbname "host=localhost port=15432 dbname=hapi user=hapi_owner sslmode=require" \
  hapi-restore.dump
```

`--single-transaction` means a failure changes nothing. Afterwards, check
the site, then delete `hapi-restore.dump`: it contains every user's data,
including password hashes.

**If the instance itself is gone:** restore the snapshot (`hapi-prod-final`
or a manual one) as `hapi-prod-restore` as in step 1. Run the `platform`
apply, which creates a new, empty `hapi-prod`, then a deploy, which
creates the tables. Then follow 3b.

### 4. Delete the copy

It costs the same as the production database while it runs:

```sh
aws rds delete-db-instance --db-instance-identifier hapi-prod-restore \
  --skip-final-snapshot --delete-automated-backups
```

---

## Create an admin user

Use this for the first admin of a new environment, or to add an admin when
nobody can log in to add one through the site. (Admins can create other
users from the dashboard.)

Open the tunnel and export `DATABASE_URL` as in
[Database access](#database-access-ssm-port-forward). Then read the
password without echoing it, so it stays out of your shell history. Paste
this line **on its own**: in a multi-line paste, `read` takes the next line
as the password.

```sh
read -s "ADMIN_PASSWORD?Temporary admin password: "     # zsh
# bash: read -rsp 'Temporary admin password: ' ADMIN_PASSWORD
```

Then:

```sh
ADMIN_EMAIL='someone@example.com' ADMIN_NAME='Site Admin' ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  npm run db:create-admin --workspace shared
unset ADMIN_PASSWORD DATABASE_URL
```

- Pass the plain password. The script hashes it the same way the API does.
- Tell the new admin to change the password after logging in, at
  `/reset-password/new-password`. The site doesn't force them to (see
  [known issues](../known-issues.md#users-are-never-forced-to-change-their-password)).
- The script is safe to re-run: if the email already exists, it does
  nothing. It never deletes anything.
- It doesn't read `.env`, so a missing `DATABASE_URL` is an error rather
  than a silent write to your local database.

> **Never run `db:populate` against AWS.** It deletes every row in the
> database before loading demo data. It's for local development only.

---

## Rotate the Mailgun key

Do this when someone who had the key leaves, or if it may have leaked.

1. In Mailgun, create a new sending key for the domain. Don't delete the
   old one yet.
2. Store it (see the [deploy guide](deploy-to-race.md#store-the-mailgun-key)
   for why it goes through a file):

   ```sh
   printf '%s' 'NEW-KEY' > /tmp/mg
   aws secretsmanager put-secret-value --secret-id hapi/prod/mailgun-key \
     --secret-string file:///tmp/mg
   rm /tmp/mg
   ```

3. The API reads the key when a Lambda container starts, so running
   containers still have the old one. Make Lambda start fresh ones by
   changing the function's configuration (the next deploy sets the
   description back, which is harmless):

   ```sh
   aws lambda update-function-configuration --function-name hapi-prod-api \
     --description "Mailgun key rotated $(date +%F)"
   ```

4. Check email works (use "Forgot password?" on the login page).
5. Delete the old key in Mailgun.

---

## Team access

What a team member needs, and how to remove it when they leave.

| Access | Comes from |
|---|---|
| AWS (console, CLI, Git) | The IAM user RACE provides |
| Site admin login | Another admin creates it (Dashboard → Users) |
| Mailgun, Umami | HAPI's accounts with those services |

### The shared AWS user

The RACE account comes with one IAM user, which the whole team shares:

- **Store its credentials in a password manager** that the team shares.
  Never put them in Git, chat or email.
- If RACE can give each person their own IAM user, ask for it. It's safer,
  you can remove one person without affecting everyone else, and pull
  request approvals can be turned on. (They're off because CodeCommit
  doesn't let a user approve their own pull request; see
  [branching and committing](../processes/branching-and-committing.md#approvals).)

### When someone leaves

1. **Rotate the access key.** IAM allows two keys at once, so nobody is
   locked out:

   ```sh
   USER_NAME=$(aws sts get-caller-identity --query Arn --output text | cut -d/ -f2)
   aws iam list-access-keys --user-name "$USER_NAME"
   aws iam create-access-key --user-name "$USER_NAME"        # give the new key to the team
   # once everyone has switched (`aws configure --profile hapi`):
   aws iam update-access-key --user-name "$USER_NAME" --access-key-id <OLD KEY ID> --status Inactive
   aws iam delete-access-key --user-name "$USER_NAME" --access-key-id <OLD KEY ID>
   ```

   If the user isn't allowed to manage its own keys, ask RACE to do it.
2. **Change the console password** of the IAM user, if they knew it.
3. **Their site login:** set a new password for it by hand (see
   [Manage users](../dev/common-tasks.md#manage-users)) rather than deleting
   it. Deleting an admin who has reviewed projects currently breaks the
   project queue (see [known issues](../known-issues.md#deleting-an-admin-who-has-rejected-a-version-breaks-the-project-queue)).
4. **Mailgun and Umami:** change the passwords if they were shared, and
   [rotate the Mailgun key](#rotate-the-mailgun-key) if they could see it.

---

## NAT instance (fck-nat)

Lambdas, CodeBuild and the database live in private subnets. Their outbound
internet access goes through one small EC2 instance running
[fck-nat](https://fck-nat.dev), an open-source NAT image (`t4g.nano`, a few
dollars a month instead of about $40+ for an AWS NAT Gateway).

What needs it:

- sending email (Mailgun)
- reading the Mailgun key from Secrets Manager
- starting video processing (the MediaConvert API)
- CodeBuild (fetching the source, npm packages and tools)

What doesn't: the database is inside the VPC, and S3 traffic goes through a
VPC endpoint. **The site keeps working without the NAT**; only email, video
processing and deploys stop.

It runs in an Auto Scaling group of exactly one instance, so a failed
instance is replaced automatically. Private routes point at a fixed network
interface (ENI), and each new instance attaches that ENI and moves the NAT's
Elastic IP onto itself. So routes and the outbound IP address
(`tofu -chdir=infra/platform output nat_egress_ip`) never change.

### Patching

Systems Manager installs OS patches every Saturday at 16:00 UTC: 03:00
Sunday in Sydney during daylight saving, 02:00 otherwise. If a patch needs a
reboot, outbound internet is down for a few minutes:

- Emails sent in that window fail. (The API tries to load the Mailgun key
  again on the next send.)
- Video uploads may fail to start processing.
- A deploy running at that moment may fail. Re-run it.

Patching only runs on its schedule. Applying `platform` doesn't patch or
reboot the NAT.

Check patch status, or patch now:

```sh
NAT_ID=$(aws ec2 describe-instances \
  --filters Name=tag:hapi:role,Values=hapi-prod-fck-nat Name=instance-state-name,Values=running \
  --query 'Reservations[0].Instances[0].InstanceId' --output text)

aws ssm describe-instance-patch-states --instance-ids "$NAT_ID"
aws ssm start-associations-once --association-ids \
  "$(aws ssm list-associations --association-filter-list key=AssociationName,value=hapi-prod-fck-nat-patch \
     --query 'Associations[0].AssociationId' --output text)"
```

### Replace the instance (or pick up a new fck-nat image)

The launch template uses the newest official fck-nat image as of the last
`platform` apply. Running instances aren't replaced automatically. To
replace one (a few minutes without outbound internet):

```sh
tofu -chdir=infra/platform apply -var-file=prod.tfvars   # picks up the newest image
aws ec2 terminate-instances --instance-ids "$NAT_ID"
# The Auto Scaling group launches a replacement, which takes over the ENI and the Elastic IP.
```

If a new image misbehaves, pin a known-good one with the `ami_id` input of
the `fck_nat` module (`infra/modules/fck_nat`).

### Not showing in Systems Manager

If the instance is running but isn't `Online` in Systems Manager (Fleet
Manager), Session Manager and patching won't work:

- check the instance profile `rmit-hapi-prod-fck-nat` is attached
- check the instance can reach the internet (it's in a public subnet)

The instance's start-up script installs the SSM agent if the image lacks
it.

---

## Pause and resume (to save money)

Most of the fixed monthly cost is the database and the NAT instance. If
the site isn't needed for a while, you can stop both. **While paused, the
site loads but shows no content**, because the API can't reach the
database. Email, video processing and deploys also stop.

**Pause:**

```sh
aws rds stop-db-instance --db-instance-identifier hapi-prod
aws autoscaling update-auto-scaling-group --auto-scaling-group-name hapi-prod-fck-nat \
  --min-size 0 --max-size 0 --desired-capacity 0
```

- Storage, backups and the NAT's Elastic IP are still charged.
- **RDS restarts a stopped instance by itself after 7 days.** Stop it again
  if the pause is longer.
- Don't merge anything while paused. A build can't download its source
  without the NAT, and it hangs until it times out.

**Resume**, in this order:

```sh
aws rds start-db-instance --db-instance-identifier hapi-prod
aws autoscaling update-auto-scaling-group --auto-scaling-group-name hapi-prod-fck-nat \
  --min-size 1 --max-size 1 --desired-capacity 1

aws rds wait db-instance-available --db-instance-identifier hapi-prod   # ~5-10 minutes
```

Then wait until the NAT shows `Online` (see
[Check the NAT](deploy-to-race.md#check-the-nat-instance)) before merging
anything or starting a build.

A `platform` apply also sets the NAT back to one instance.

---

## Upgrades

AWS emails notices about deprecations and required upgrades (Lambda
runtimes, database versions, certificates) to the account's contact
address, which belongs to RACE. **Ask RACE to forward anything that
mentions `hapi`.** Otherwise the first sign of a missed deadline may be a
broken deploy.

### Node.js

The Lambdas run on `nodejs24.x`. Node 24 is supported until April 2028,
and AWS will deprecate the Lambda runtime around then. To move to a newer
version:

1. Change `runtime = "nodejs24.x"` in `infra/app/backend.tf` and
   `infra/app/misc_lambda.tf`.
2. Change `runtime-versions: nodejs:` in `buildspec.yml`. If the CodeBuild
   image doesn't offer that version, also update `codebuild_image` in
   `infra/platform/variables.tf` and apply `platform` first.
3. Use the same version locally, and update the version in
   [the dev environment guide](../dev/dev-environment.md).
4. Run all the checks, then merge.

### PostgreSQL

- **Minor versions** (17.x) are installed automatically in the weekly
  maintenance window (Sunday 17:00–18:00 UTC, about 04:00 Monday Sydney).
- **Major versions** (for example 17 → 18) are a deliberate change. Plan a
  few minutes of downtime.
  1. Test locally first. Change `major_version` in
     `shared/supabase/config.toml`, recreate the local database, and run
     the migrations and tests.
  2. Take a [manual snapshot](#back-up-and-restore-the-database).
  3. In `infra/platform/rds.tf`, change `engine_version`, change the
     parameter group's `family` (for example `postgres18`), and add
     `allow_major_version_upgrade = true` to the instance.
  4. Apply `platform`.

**Timing:** changes to the database instance (version, instance class) wait
for the next maintenance window, because `apply_immediately = false`. To
apply one straight away, set it to `true` for that apply, then back.

### OpenTofu and providers

- **OpenTofu itself:** the pipeline installs the version in `tofu_version`
  (`infra/platform/variables.tf`). Change it, apply `platform`, and install
  the same version locally.
- **Providers** (the AWS and PostgreSQL plugins) are pinned by the
  `.terraform.lock.hcl` file in each root. To update one root's providers:

  ```sh
  tofu -chdir=infra/app init -upgrade -backend=false
  tofu -chdir=infra/app providers lock \
    -platform=linux_amd64 -platform=linux_arm64 -platform=darwin_amd64 -platform=darwin_arm64
  ```

  Commit the lock file. Lock all four platforms, so the pipeline (Linux)
  and everyone's laptops agree.

### Everything else

- **npm packages:** see [common tasks](../dev/common-tasks.md#add-or-update-a-dependency).
- **The NAT instance's image:** see
  [Replace the instance](#replace-the-instance-or-pick-up-a-new-fck-nat-image).

---

## Adding another environment

For example a `staging` environment. No structural changes are needed:

1. Pick a network range that doesn't overlap another environment's. The
   defaults are `staging = 10.20.0.0/16` and `dev = 10.30.0.0/16`.
2. Copy `infra/platform/prod.tfvars` to `infra/platform/<env>.tfvars`. Set
   `environment`, `deploy_branch` (the branch that deploys it, for example
   `staging`), and anything sized differently.
3. Optionally, copy `infra/app/prod.tfvars` to `infra/app/<env>.tfvars` for
   different Lambda concurrency, log retention or domain. The pipeline uses
   it automatically. Without it, the defaults apply.
4. Apply `platform` with state key `<env>/platform.tfstate` and
   `-var-file=<env>.tfvars`.
5. Set its Mailgun secret (`hapi/<env>/mailgun-key`), push to its branch to
   start the first build, then [create an admin](#create-an-admin-user).

Each environment gets its own VPC, database, NAT, buckets, CloudFront
distribution and pipeline, so expect roughly the same running cost again.
