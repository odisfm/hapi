variable "environment" {
  description = "Environment name, e.g. prod. Used in every resource name."
  type        = string

  validation {
    condition     = can(regex("^[a-z][a-z0-9]{1,9}$", var.environment))
    error_message = "environment must be 2-10 lowercase alphanumeric characters starting with a letter."
  }
}

variable "region" {
  type    = string
  default = "ap-southeast-2"
}

# ---------------------------------------------------------------------------
# IAM
# ---------------------------------------------------------------------------

variable "permissions_boundary_arn" {
  description = "Permissions boundary attached to every role (required, provided by RACE)."
  type        = string
}

variable "iam_role_path" {
  description = "IAM path for every role, in case RACE mandates one."
  type        = string
  default     = "/"
}

# ---------------------------------------------------------------------------
# Network
# ---------------------------------------------------------------------------

variable "vpc_cidrs" {
  description = "Default VPC CIDR per environment. Ranges must not overlap."
  type        = map(string)
  default = {
    prod    = "10.10.0.0/16"
    staging = "10.20.0.0/16"
    dev     = "10.30.0.0/16"
  }
}

variable "vpc_cidr" {
  description = "Override the VPC CIDR for this env (e.g. a range allocated by RACE)."
  type        = string
  default     = null
}

variable "az_count" {
  description = "Number of AZs (RDS subnet groups need at least 2)."
  type        = number
  default     = 2

  validation {
    condition     = var.az_count >= 2
    error_message = "az_count must be at least 2."
  }
}

variable "fck_nat_instance_type" {
  description = "arm64 instance type for the NAT."
  type        = string
  default     = "t4g.nano"
}

variable "patch_schedule" {
  description = <<-EOT
    SSM patch association schedule. SSM cron is UTC. The default is Saturday
    16:00 UTC = Sunday 03:00 AEDT (Oct-Apr) / 02:00 AEST (Apr-Oct).
  EOT
  type        = string
  default     = "cron(0 16 ? * SAT *)"
}

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

variable "db_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "GiB of gp3 storage."
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Storage autoscaling ceiling in GiB (0 disables autoscaling)."
  type        = number
  default     = 100
}

variable "db_deletion_protection" {
  description = "Set false only when deliberately tearing an env down."
  type        = bool
  default     = true
}

# ---------------------------------------------------------------------------
# App configuration (non-secret; read by the app root via remote state)
# ---------------------------------------------------------------------------

variable "email_domain" {
  description = "Domain emails are sent from (Mailgun sending domain)."
  type        = string
}

variable "umami_script_url" {
  description = "Baked into the public frontend bundle; not a secret."
  type        = string
  default     = ""
}

variable "umami_website_id" {
  type    = string
  default = ""
}

variable "umami_dashboard_url" {
  type    = string
  default = ""
}

# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------

variable "state_bucket" {
  description = "State bucket created by the bootstrap root."
  type        = string
}

variable "codecommit_repo_name" {
  type    = string
  default = "hapi"
}

variable "deploy_branch" {
  description = "Branch whose pushes deploy this env."
  type        = string
  default     = "main"
}

variable "tofu_version" {
  description = "OpenTofu version installed by the buildspec (pinned)."
  type        = string
  default     = "1.12.6"
}

variable "codebuild_image" {
  description = "Must be x86_64 (the sharp bundle targets linux-x64-glibc) and provide Node 24."
  type        = string
  default     = "aws/codebuild/amazonlinux-x86_64-standard:6.0"
}

variable "codebuild_compute_type" {
  type    = string
  default = "BUILD_GENERAL1_MEDIUM"
}
