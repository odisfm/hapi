# Account-level resources, applied once per AWS account by an admin from a
# laptop (runbook: docs/infrastructure/runbooks.md, "Bootstrap").
#
# The very first apply uses local state because the state bucket does not
# exist yet; see backend.tf for how to migrate the state into the bucket.

terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project   = "hapi"
      ManagedBy = "opentofu"
      Root      = "bootstrap"
    }
  }
}

data "aws_caller_identity" "current" {}

locals {
  account_id = data.aws_caller_identity.current.account_id
}

# ---------------------------------------------------------------------------
# Terraform/OpenTofu state bucket (shared by every root and every env)
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "state" {
  bucket           = "hapi-tfstate-${local.account_id}-${var.region}-an"
  bucket_namespace = "account-regional"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket = aws_s3_bucket.state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "state" {
  bucket = aws_s3_bucket.state.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "state" {
  bucket = aws_s3_bucket.state.id

  rule {
    id     = "expire-noncurrent-versions"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = var.state_noncurrent_version_days
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }

  depends_on = [aws_s3_bucket_versioning.state]
}

data "aws_iam_policy_document" "state" {
  statement {
    sid     = "DenyInsecureTransport"
    effect  = "Deny"
    actions = ["s3:*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    resources = [
      aws_s3_bucket.state.arn,
      "${aws_s3_bucket.state.arn}/*",
    ]

    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

resource "aws_s3_bucket_policy" "state" {
  bucket = aws_s3_bucket.state.id
  policy = data.aws_iam_policy_document.state.json

  depends_on = [aws_s3_bucket_public_access_block.state]
}

# ---------------------------------------------------------------------------
# Source repository
# ---------------------------------------------------------------------------

resource "aws_codecommit_repository" "hapi" {
  repository_name = var.codecommit_repo_name
  description     = "HAPI application and infrastructure"
  default_branch  = "main"
}

# Pull requests into main need N approvals before they can be merged.
# NOTE: CodeCommit does not let the author of a pull request approve it. If
# every human shares one IAM identity, nobody can satisfy this rule; set
# `pr_approvals_required = 0` in that case.
resource "aws_codecommit_approval_rule_template" "main" {
  count = var.pr_approvals_required > 0 ? 1 : 0

  name        = "hapi-main-requires-approval"
  description = "Pull requests into main need ${var.pr_approvals_required} approval(s)."

  content = jsonencode({
    Version               = "2018-11-08"
    DestinationReferences = ["refs/heads/main"]
    Statements = [{
      Type                    = "Approvers"
      NumberOfApprovalsNeeded = var.pr_approvals_required
    }]
  })
}

resource "aws_codecommit_approval_rule_template_association" "main" {
  count = var.pr_approvals_required > 0 ? 1 : 0

  approval_rule_template_name = aws_codecommit_approval_rule_template.main[0].name
  repository_name             = aws_codecommit_repository.hapi.repository_name
}
