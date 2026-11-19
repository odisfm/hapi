# Per-environment platform: VPC, NAT, RDS, shared security groups, secret
# containers and the CodeBuild deploy pipeline. Applied by an admin from a
# laptop (runbook: docs/infrastructure/runbooks.md, "Platform"). The pipeline
# itself cannot modify anything in this root.

terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # bucket/key/region are passed with -backend-config at init time.
  # key = "<env>/platform.tfstate"
  backend "s3" {
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project     = "hapi"
      Environment = var.environment
      ManagedBy   = "opentofu"
      Root        = "platform"
    }
  }
}

data "aws_caller_identity" "current" {}
data "aws_partition" "current" {}

data "aws_availability_zones" "available" {
  state = "available"

  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}

locals {
  name       = "hapi-${var.environment}"
  role_name  = "rmit-hapi-${var.environment}"
  account_id = data.aws_caller_identity.current.account_id
  partition  = data.aws_partition.current.partition

  vpc_cidr = coalesce(var.vpc_cidr, lookup(var.vpc_cidrs, var.environment, null))
  azs      = slice(data.aws_availability_zones.available.names, 0, var.az_count)

  # Role ARN prefix for everything this env creates (used by CodeBuild's IAM
  # guardrails). iam_role_path always starts and ends with "/".
  env_role_arn_pattern = "arn:${local.partition}:iam::${local.account_id}:role${var.iam_role_path}${local.role_name}-*"
}
