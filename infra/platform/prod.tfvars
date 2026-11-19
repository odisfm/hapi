# Non-secret settings for the prod platform. Safe to commit.
# Set the values below before the first apply; see
# docs/infrastructure/deploy-to-race.md, step 7.
#
#   tofu -chdir=infra/platform apply -var-file=prod.tfvars

environment = "prod"
region      = "ap-southeast-2"

# Permissions boundary ARN provided by RACE (the AWS account owner). It is
# attached to every IAM role this project creates.
# permissions_boundary_arn = "arn:aws:iam::<account>:policy/<boundary>"
iam_role_path = "/"

# VPC range: prod uses the default from vpc_cidrs (10.10.0.0/16). Set this
# only to override it.
# vpc_cidr = "10.10.0.0/16"

# The bootstrap root's `state_bucket` output.
# state_bucket = "hapi-tfstate-<account>-ap-southeast-2-an"

# Mailgun sending domain. Emails come from hapi-team@<email_domain>.
# email_domain = "mg.example.com"

# Umami analytics (optional; leave empty to disable). Not secret: these end
# up in the public frontend bundle. Changes reach the site on the next build.
umami_script_url    = ""
umami_website_id    = ""
umami_dashboard_url = ""
