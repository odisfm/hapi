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
    encrypt      = true
    use_lockfile = true
  }
}
