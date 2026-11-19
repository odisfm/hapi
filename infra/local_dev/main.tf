# Media buckets for LOCAL development (docs/dev/dev-environment.md, "Media").
#
# The API running on a developer's laptop uploads icons and screenshots to S3
# and the local website loads them from S3, just like production. These
# buckets give local development somewhere to do that without touching the
# production buckets (whose clean-up job deletes files the production
# database doesn't reference).
#
# One set per AWS account, shared by every developer. Contents are
# disposable. Applied by an admin from a laptop, like platform:
#
#   tofu -chdir=infra/local_dev init \
#     -backend-config=bucket=<state bucket> \
#     -backend-config=key=local-dev.tfstate \
#     -backend-config=region=ap-southeast-2
#   tofu -chdir=infra/local_dev apply
#
# Names deliberately avoid the `hapi-<thing>-<env>-...` pattern used by the
# environments, so no environment's pipeline role can touch them.

terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # bucket/key/region passed with -backend-config; key = "local-dev.tfstate"
  backend "s3" {
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project   = "hapi"
      ManagedBy = "opentofu"
      Root      = "local_dev"
    }
  }
}

data "aws_caller_identity" "current" {}

locals {
  name          = "hapi-local"
  bucket_suffix = "${data.aws_caller_identity.current.account_id}-${var.region}-an"

  # Same split as production: icons in one bucket, screenshots/video in the
  # other. Keys map to the API's BUCKET_ICONS / BUCKET_MEDIA.
  buckets = {
    icons = "hapi-local-icons-${local.bucket_suffix}"
    media = "hapi-local-media-${local.bucket_suffix}"
  }
}

# ---------------------------------------------------------------------------
# Buckets (private; read through CloudFront below)
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "this" {
  for_each = local.buckets

  bucket           = each.value
  bucket_namespace = "account-regional"
  force_destroy    = true # development data only
}

resource "aws_s3_bucket_public_access_block" "this" {
  for_each = aws_s3_bucket.this

  bucket                  = each.value.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  for_each = aws_s3_bucket.this

  bucket = each.value.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

data "aws_iam_policy_document" "cloudfront_read" {
  for_each = aws_s3_bucket.this

  statement {
    sid       = "AllowCloudFrontServicePrincipalRead"
    actions   = ["s3:GetObject"]
    resources = ["${each.value.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.this.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "this" {
  for_each = aws_s3_bucket.this

  bucket = each.value.id
  policy = data.aws_iam_policy_document.cloudfront_read[each.key].json

  depends_on = [aws_s3_bucket_public_access_block.this]
}

# Videos are uploaded from the browser with a presigned PUT, so the local
# website's origin must be allowed.
resource "aws_s3_bucket_cors_configuration" "media" {
  bucket = aws_s3_bucket.this["media"].id

  cors_rule {
    allowed_origins = var.allowed_origins
    allowed_methods = ["PUT"]
    allowed_headers = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Video processing (MediaConvert) only runs in the deployed environments, so
# raw uploads under transcode_in/ are never picked up locally. Expire them.
resource "aws_s3_bucket_lifecycle_configuration" "media" {
  bucket = aws_s3_bucket.this["media"].id

  rule {
    id     = "expire-unprocessed-video"
    status = "Enabled"

    filter {
      prefix = "transcode_in/"
    }

    expiration {
      days = 7
    }
  }

  rule {
    id     = "abort-incomplete-uploads"
    status = "Enabled"

    filter {}

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# ---------------------------------------------------------------------------
# CloudFront: serves /icons/* and /media/* like production does
# ---------------------------------------------------------------------------

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

resource "aws_cloudfront_origin_access_control" "this" {
  name                              = "${local.name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_function" "strip_first_segment" {
  name    = "${local.name}-strip-first-segment"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = file("${path.module}/../functions/strip-first-segment.js")
}

resource "aws_cloudfront_distribution" "this" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "HAPI local development media"
  price_class     = "PriceClass_100"

  dynamic "origin" {
    for_each = aws_s3_bucket.this

    content {
      origin_id                = origin.key
      domain_name              = origin.value.bucket_regional_domain_name
      origin_access_control_id = aws_cloudfront_origin_access_control.this.id
    }
  }

  ordered_cache_behavior {
    path_pattern     = "/media/*"
    target_origin_id = "media"

    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]
    cache_policy_id = data.aws_cloudfront_cache_policy.caching_optimized.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.strip_first_segment.arn
    }
  }

  # Everything else, including /icons/*, goes to the icons bucket.
  default_cache_behavior {
    target_origin_id = "icons"

    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]
    cache_policy_id = data.aws_cloudfront_cache_policy.caching_optimized.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.strip_first_segment.arn
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
