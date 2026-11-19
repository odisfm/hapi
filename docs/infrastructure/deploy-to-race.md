# Deploying to the RACE AWS account

This guide takes you from an empty AWS account to a working HAPI Showcase
site. Follow it once, in order. After that, deploys are automatic (see
[CI/CD](../processes/CI-CD.md)) and day-to-day tasks are in the
[runbooks](runbooks.md).

**Who it's for:** whoever sets up the production environment. That's likely
someone at HAPI, with help from RACE. You need to be comfortable in a
terminal and know basic AWS terms (IAM, S3, regions). You don't need to know
this codebase.

**What you end up with:** the site live at a CloudFront URL, an admin login,
and a pipeline that deploys every change merged to `main`.

**Time:** about 2 hours of active work. Several steps wait on AWS (the
database takes about 15 minutes, CloudFront about 15 more). Mailgun domain
verification can take up to a day if you're waiting on DNS changes, so
[start that first](#4-set-up-mailgun).

> **Who runs what.** You run steps 6 and 7 (the `bootstrap` and `platform`
> infrastructure) from your laptop. Everything after that (the database
> roles, migrations, the application and the frontend) is deployed by the
> pipeline. Never run `tofu apply` on `infra/db` or `infra/app` yourself.

Contents:

1. [What you need from RACE](#1-what-you-need-from-race)
2. [Install the tools](#2-install-the-tools)
3. [Set up AWS credentials](#3-set-up-aws-credentials)
4. [Set up Mailgun](#4-set-up-mailgun)
5. [Set up Umami (optional)](#5-set-up-umami-optional)
6. [Bootstrap the account](#6-bootstrap-the-account)
7. [Create the platform](#7-create-the-platform)
8. [Run the first deploy](#8-run-the-first-deploy)
9. [Create the first admin](#9-create-the-first-admin)
10. [Check the deployment](#10-check-the-deployment)
11. [Afterwards](#11-afterwards)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. What you need from RACE

RACE owns the AWS account. Before you start, get these from them:

| Item | Notes |
|---|---|
| An IAM user with console access **and** an access key | You use it for every step here. This project never creates IAM users itself. |
| The **permissions boundary ARN** | Looks like `arn:aws:iam::123456789012:policy/<name>`. RACE requires every IAM role to carry it, so the infrastructure attaches it to every role it creates. |
| Confirmation the account can use region `ap-southeast-2` (Sydney) | Everything is deployed there. |

RACE's rules this project already follows:

- Every IAM role and instance profile is named `rmit-…`, for example
  `rmit-hapi-prod-api`. Other resources are named `hapi-…`.
- Every role has RACE's permissions boundary attached.
- There are no IAM users or access keys in the infrastructure. Machines use
  roles.

RACE doesn't pre-create anything else. Two AWS **service-linked roles**
(`AWSServiceRoleForRDS` and `AWSServiceRoleForAutoScaling`) are created
automatically the first time step 7 uses RDS and Auto Scaling. That needs
`iam:CreateServiceLinkedRole`, which the RACE user should have. If it
doesn't, see [Troubleshooting](#12-troubleshooting).

---

## 2. Install the tools

On macOS or Linux. On Windows, use
[WSL](https://learn.microsoft.com/en-us/windows/wsl/install) and run
everything inside it.

| Tool | Version | Install |
|---|---|---|
| Git | any | |
| AWS CLI | v2 | [Install guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) |
| OpenTofu | **1.12.6** exactly (the same version the pipeline uses) | [Install guide](https://opentofu.org/docs/intro/install/) |
| Session Manager plugin | latest | [Install guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html). Needed to reach the database in step 9. |
| `git-remote-codecommit` | latest | `pip install git-remote-codecommit`. Lets Git use your AWS credentials. |
| Node.js | 24 | [nodejs.org](https://nodejs.org/). Needed to create the first admin in step 9. |
| `psql` | 17 (optional) | Any PostgreSQL 17 client. Handy for checking the database. |

Check them:

```sh
git --version
aws --version            # aws-cli/2.x
tofu version             # OpenTofu v1.12.6
session-manager-plugin --version
node --version           # v24.x
```

Get the code and install its dependencies:

```sh
git clone https://github.com/odisfm/hapi.git
cd hapi
npm ci
```

Run every command in this guide from the repository root unless it says
otherwise.

---

## 3. Set up AWS credentials

Create a CLI profile from the RACE user's access key. This guide calls the
profile `hapi`; any name works if you use it consistently.

```sh
aws configure --profile hapi
# AWS Access Key ID:     <from RACE>
# AWS Secret Access Key: <from RACE>
# Default region name:   ap-southeast-2
# Default output format: json
```

Use it for the rest of this guide, in every terminal you open:

```sh
export AWS_PROFILE=hapi AWS_REGION=ap-southeast-2
aws sts get-caller-identity     # shows the RACE account ID and your user
```

Git also uses this profile (through `git-remote-codecommit`). There are no
Git passwords or SSH keys.

Then check the RACE boundary policy exists:

```sh
aws iam get-policy --policy-arn '<boundary ARN from RACE>' --query Policy.PolicyName
```

### Check the Lambda concurrency quota

New AWS accounts often allow only 10 concurrent Lambda executions. This
matters because the app reserves some concurrency for each function, to cap
how many database connections it can open, and AWS refuses reservations that
would leave fewer than 100 unreserved.

```sh
aws lambda get-account-settings --query AccountLimit.ConcurrentExecutions
```

- **1000 or more:** open `infra/app/prod.tfvars` and set the reservations to
  the recommended values (`api = 20`, `transcode_in = 5`,
  `transcode_out = 5`, `media_cleanup = 1`).
- **Less than 1000:** leave them at `-1` (unreserved), which is how the
  repository ships. It works fine at low traffic. To raise the quota, ask
  RACE or request it yourself in the Service Quotas console (Lambda →
  "Concurrent executions"), then change the values in a normal pull request.

---

## 4. Set up Mailgun

The site sends email (password resets, new student accounts) through
[Mailgun](https://www.mailgun.com/). HAPI needs its own Mailgun account.

1. **Create the account in Mailgun's US region.** The app sends to
   `api.mailgun.net`, the US endpoint. An account or domain in the EU region
   won't work.
2. **Add a sending domain.** Use a subdomain you control the DNS for, for
   example `mg.<your domain>`. Mailgun lists the DNS records to add (SPF and
   DKIM `TXT` records, usually also `MX` and a tracking `CNAME`). Add them,
   or ask whoever runs the domain's DNS to, then wait until Mailgun shows the
   domain as verified.
   - Email is sent from `hapi-team@<sending domain>`.
   - **No domain yet?** Mailgun's sandbox domain works for a first deploy,
     but it only delivers to up to five "authorised recipients" that you
     add in Mailgun. Switch to a real domain before real users need email.
3. **Create a sending key** for that domain (in the domain's settings, under
   sending keys). A domain sending key can only send mail from that domain,
   so it's safer than an account-wide API key. Keep it somewhere safe for
   now. It goes into AWS Secrets Manager in step 7, and nowhere else.

Write down the sending domain. It goes in `infra/platform/prod.tfvars` as
`email_domain`.

---

## 5. Set up Umami (optional)

[Umami](https://umami.is/) records page views. Without it the site works
normally, and the admin Analytics page says analytics isn't configured.
(The "Most viewed projects" table on that page uses the site's own data and
works either way.)

1. Create an account on [Umami Cloud](https://cloud.umami.is/), or use a
   self-hosted Umami.
2. Add a website. Its tracking code looks like
   `<script defer src="https://cloud.umami.is/script.js" data-website-id="…">`.
   Note the `src` URL and the website ID.
3. Optional: enable a **share URL** for the website. Admins see it as an
   "Analytics Dashboard" button.

These go in `infra/platform/prod.tfvars` as `umami_script_url`,
`umami_website_id` and `umami_dashboard_url`. They aren't secrets: the
script URL and website ID end up in the public website code anyway. You can
add them later; see [Afterwards](#11-afterwards).

---

## 6. Bootstrap the account

`infra/bootstrap` creates two account-level things:

- the S3 bucket that stores OpenTofu state for every other part of the
  infrastructure
- the CodeCommit repository the pipeline deploys from

The state bucket doesn't exist yet, so the first apply keeps its state on
your laptop, then moves it into the bucket.

**Pull request approvals:** by default, merging into `main` needs one
approval. CodeCommit doesn't let the author of a pull request approve it, so
if your whole team signs in as the one RACE user, nobody could ever approve
anything. In that case add `-var pr_approvals_required=0` to the
`tofu apply` below. If each person has their own IAM user, leave it out.

```sh
cd infra/bootstrap

# 1. First apply, with local state.
mv backend.tf backend.tf.off
tofu init
tofu apply                       # review the plan, then type "yes"
BUCKET=$(tofu output -raw state_bucket)
echo "$BUCKET"                   # write this down

# 2. Move the state into the bucket it just created.
mv backend.tf.off backend.tf
tofu init -migrate-state \
  -backend-config="bucket=$BUCKET" \
  -backend-config="key=bootstrap.tfstate" \
  -backend-config="region=ap-southeast-2"   # answer "yes" to copy the state
tofu plan                        # expect: No changes
rm -f terraform.tfstate terraform.tfstate.backup

cd ../..
```

Now push the code to CodeCommit. Nothing deploys yet, because the pipeline
doesn't exist until step 7.

```sh
git remote add aws "codecommit::ap-southeast-2://$AWS_PROFILE@hapi"
git push aws main
```

From now on, CodeCommit is where the code lives and what gets deployed.

---

## 7. Create the platform

`infra/platform` creates everything the application runs on: the network
(VPC), the NAT instance that gives private resources internet access, the
PostgreSQL database, the container for the Mailgun secret, and the CodeBuild
pipeline. See [infrastructure design](infrastructure-design.md) for how it
fits together.

### Fill in `prod.tfvars`

Edit `infra/platform/prod.tfvars` and set:

| Setting | Value |
|---|---|
| `permissions_boundary_arn` | The boundary ARN from RACE |
| `state_bucket` | The bucket name from step 6 (`$BUCKET`) |
| `email_domain` | The Mailgun sending domain from step 4 |
| `umami_*` | The values from step 5, or leave them empty |

Everything in this file is safe to commit: it holds no secrets.

### Apply

```sh
tofu -chdir=infra/platform init \
  -backend-config="bucket=$BUCKET" \
  -backend-config="key=prod/platform.tfstate" \
  -backend-config="region=ap-southeast-2"
tofu -chdir=infra/platform apply -var-file=prod.tfvars
```

Review the plan and type `yes`. It takes 15 to 20 minutes, mostly creating
the database.

### Store the Mailgun key

OpenTofu only creates an empty secret, so the key never appears in
OpenTofu's state. Set its value yourself. Writing it to a file first keeps
it out of your shell history:

```sh
printf '%s' 'PASTE-THE-SENDING-KEY-HERE' > /tmp/mg   # or create the file in an editor
aws secretsmanager put-secret-value \
  --secret-id hapi/prod/mailgun-key \
  --secret-string file:///tmp/mg
rm /tmp/mg
```

Store just the key itself, not JSON. The site's outbound traffic always
comes from one fixed IP address. If you want to restrict the Mailgun key to
that IP, find it with
`tofu -chdir=infra/platform output nat_egress_ip`.

### Check the NAT instance

Lambdas, the pipeline and the database tunnel all depend on the NAT
instance. Check it's running and registered with Systems Manager (it can
take a few minutes after the apply):

```sh
aws ssm describe-instance-information \
  --filters Key=tag:hapi:role,Values=hapi-prod-fck-nat \
  --query 'InstanceInformationList[].[InstanceId,PingStatus]' --output text
# expect: i-0123456789abcdef0   Online
```

### Commit `prod.tfvars`

Commit your `prod.tfvars` changes and push them, so the repository records
the values the platform was built with:

```sh
git add infra/platform/prod.tfvars infra/app/prod.tfvars
git commit -m "Configure prod platform"
git push aws main
```

This push starts the first build (step 8). Pushing to `main` directly is
fine this once. From now on, changes go through pull requests (see
[branching and committing](../processes/branching-and-committing.md)).

---

## 8. Run the first deploy

The push at the end of step 7 started the first build. If you didn't push
anything, start one by hand:

```sh
aws codebuild start-build --project-name hapi-prod-deploy --query build.id
```

Watch it in the AWS console (CodeBuild → Build projects →
`hapi-prod-deploy`) or in your terminal:

```sh
aws logs tail /aws/codebuild/hapi-prod-deploy --follow
```

A first build takes 20 to 30 minutes. It runs the checks, sets up the
database users, runs the migrations, creates the application (Lambdas, API
Gateway, CloudFront, S3 buckets), then uploads the frontend. Near the end,
the log prints the site address:

```
Live at https://d1234abcd.cloudfront.net
```

The site is up but empty. Nobody can log in yet.

If the build fails, the log shows which step failed. See
[Troubleshooting](#12-troubleshooting).

---

## 9. Create the first admin

The database is in a private network and can't be reached from the
internet. To create the first admin, open a tunnel to it from your laptop
and run a script.

1. Open the tunnel and connect, following
   [Database access](runbooks.md#database-access-ssm-port-forward) in the
   runbooks. Stop once you've exported `DATABASE_URL`.
2. Then follow [Create an admin user](runbooks.md#create-an-admin-user).

Log in at the site address (`/admin-login`) with the email and temporary
password you chose. Then change the password at `/reset-password/new-password`.
The site doesn't make you change it, so don't skip this.

**Before you add projects,** create at least one showcase, because every
project belongs to one. Create some categories too.

---

## 10. Check the deployment

Work through this list. If anything fails, check
[Troubleshooting](#12-troubleshooting).

**The site and pipeline**

- [ ] The site loads at the CloudFront URL, and you can log in as the
      admin.
- [ ] Merging a small change into `main` starts exactly one build, and the
      change goes live.

**Email and media**

- [ ] Email works: create a student account, or use "forgot password", and
      the email arrives.
- [ ] Video works: upload a video to a project. Within a few minutes it
      finishes processing and plays.
- [ ] The weekly media clean-up works. It runs every Monday at 03:00
      Melbourne time. Once at least one project has an icon and a
      screenshot, run it now:
      `aws lambda invoke --function-name hapi-prod-media-cleanup /tmp/out.json && cat /tmp/out.json`
      (expect a summary such as `{"deletedIcons":0,…}`). On an empty site
      it deliberately fails with "No in-use icons found". That's a safety
      check, not a fault.

**Security**

- [ ] Every role has RACE's boundary attached. (`list-roles` doesn't show
      boundaries, so this checks each role.)

      ```sh
      for r in $(aws iam list-roles --query "Roles[?starts_with(RoleName,'rmit-hapi')].RoleName" --output text); do
        aws iam get-role --role-name "$r" \
          --query '[Role.RoleName,Role.PermissionsBoundary.PermissionsBoundaryArn]' --output text
      done
      ```

- [ ] The Lambda functions (`hapi-prod-*`) have no passwords or keys in
      their environment variables (Lambda console → function →
      Configuration → Environment variables).
- [ ] The database isn't public: in the RDS console, `hapi-prod` shows
      "Publicly accessible: No".

**Resilience** (optional, but worth doing once)

- [ ] Terminate the NAT instance (EC2 console, the instance tagged
      `hapi:role = hapi-prod-fck-nat`). Within about 5 minutes a replacement
      is running, and `nat_egress_ip` is unchanged. Outbound internet
      (email, video processing) is down until then; the site itself keeps
      working.
- [ ] After the first Saturday, the NAT's weekly patching shows a
      successful run (Systems Manager → State Manager →
      `hapi-prod-fck-nat-patch`).

---

## 11. Afterwards

- **Share access.** Other team members need the RACE IAM user's
  credentials (or their own user) to work with the repository. See the
  [dev environment guide](../dev/dev-environment.md).
- **Set up media for local development.** Developers need the shared dev
  buckets to work on anything involving images or uploads. Create them once
  with `infra/local_dev`; see
  [Create the dev buckets](../dev/dev-environment.md#create-the-dev-buckets).
- **Changing the site:** merge a pull request into `main` in CodeCommit.
  See [CI/CD](../processes/CI-CD.md).
- **Changing platform settings** (Umami values, database size, the pipeline
  itself): edit `infra/platform/prod.tfvars` or `infra/platform/*.tf`, run
  `tofu -chdir=infra/platform apply -var-file=prod.tfvars`, then commit.
  Umami values only reach the site on the next build, so start one
  afterwards (`aws codebuild start-build --project-name hapi-prod-deploy`).
- **Everything else** (database access, more admins, the NAT instance,
  failed builds): see the [runbooks](runbooks.md).

---

## 12. Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `AccessDenied` during step 6 or 7 | The RACE user lacks a permission. The error names the action (for example `iam:CreateRole`). Send it to RACE. |
| Step 7 fails creating RDS or the Auto Scaling group, mentioning a service-linked role | The RACE user can't run `iam:CreateServiceLinkedRole`. Ask RACE to create `AWSServiceRoleForRDS` and `AWSServiceRoleForAutoScaling` (or grant the permission), then re-run the apply. |
| Build fails in `apply-app` with `AccessDenied` | RACE's boundary blocks something the application needs. The error names the action and the role. Send both to RACE. |
| Build fails in `apply-app`: `…decreases account's UnreservedConcurrentExecution below its minimum value…` | The Lambda concurrency quota is too low for the reservations. Set every value in `infra/app/prod.tfvars` to `-1` (see [step 3](#check-the-lambda-concurrency-quota)). |
| Build fails creating the CloudFront distribution: the account must be verified | New AWS accounts sometimes need AWS Support to enable CloudFront. Ask RACE to open a support case, then start a new build. |
| Build hangs at `DOWNLOAD_SOURCE` | The NAT instance isn't running, so the build can't reach CodeCommit. Stop the build, check the NAT ([step 7](#check-the-nat-instance)), then start a new one. |
| Build fails in `checks` | A lint error, type error, failing test or a high-severity `npm audit` advisory. The log shows which. Fix it in a pull request. |
| Build fails in `migrate` with `P1001` | The database wasn't reachable in time. Check `hapi-prod` is "Available" in the RDS console, then start a new build. |
| `aws codebuild start-build` fails: concurrent build limit | A build is already running. Only one runs at a time; wait for it to finish. |
| Emails don't arrive | Check the Mailgun logs. If Mailgun never received them, read the `hapi-prod-api` Lambda's logs in CloudWatch. Usual causes: the domain isn't verified yet, the account is in the EU region, the secret value is wrong, or the sandbox domain's recipient isn't authorised. |
| The site shows an old version | CloudFront caching. The deploy invalidates the cache, so a hard refresh usually fixes it. |
