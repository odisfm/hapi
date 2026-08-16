data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

provider "aws" {
  region = "ap-southeast-4"
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket       = "tfstate-${data.aws_caller_identity.current.account_id}-${data.aws_region.current.region}-an"
    key          = "${var.environment}.tfstate"
    encrypt      = true
    use_lockfile = true
  }
}
