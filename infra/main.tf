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
    bucket       = "tfstate"
    key          = "${var.environment}.tfstate"
    encrypt      = true
    use_lockfile = true
  }
}
