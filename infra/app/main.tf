# Per-environment application stack, applied by CodeBuild (buildspec.yml)
# after the db root and migrations. Everything shared with other roots (VPC,
# subnets, security groups, RDS, secrets, IAM boundary) comes from the
# platform root's state, which this root can read but not write.

terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # bucket/key/region passed with -backend-config; key = "<env>/app.tfstate"
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
      Root        = "app"
    }
  }
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
data "aws_partition" "current" {}

data "terraform_remote_state" "platform" {
  backend = "s3"

  config = {
    bucket = var.state_bucket
    key    = "${var.environment}/platform.tfstate"
    region = var.region
  }
}

locals {
  platform = data.terraform_remote_state.platform.outputs

  name       = "hapi-${var.environment}"
  role_name  = "rmit-hapi-${var.environment}"
  account_id = data.aws_caller_identity.current.account_id
  partition  = data.aws_partition.current.partition

  bucket_suffix = "${local.account_id}-${data.aws_region.current.region}-an"

  db_app_user = "hapi_app"
  db_app_user_arn = join("", [
    "arn:${local.partition}:rds-db:${var.region}:${local.account_id}:dbuser:",
    "${local.platform.db_resource_id}/${local.db_app_user}",
  ])

  # Environment shared by every Lambda that talks to the database.
  # Connection budget (plan 6.4):
  #   sum(reserved concurrency of VPC Lambdas) * DB_POOL_MAX + ~5 admin/migration
  #   must stay below RDS max_connections (~80-100 on db.t4g.micro).
  #   Defaults: (20 + 5 + 5 + 1) * 1 + 5 = 36.
  db_env = {
    ENVIRONMENT = var.environment
    DB_HOST     = local.platform.db_host
    DB_PORT     = tostring(local.platform.db_port)
    DB_NAME     = local.platform.db_name
    DB_USER     = local.db_app_user
    DB_POOL_MAX = "1"
    # Node 20+ Lambda runtimes no longer load the Amazon CAs (incl. RDS) by
    # default; this file contains them.
    NODE_EXTRA_CA_CERTS = "/var/runtime/ca-cert.pem"
  }

  lambda_vpc_config = {
    subnet_ids         = local.platform.private_subnet_ids
    security_group_ids = [local.platform.lambda_sg_id]
  }
}
