resource "aws_s3_bucket" "icons_bucket" {
  bucket           = "icons-${var.environment}-${local.bucket_suffix}"
  bucket_namespace = "account-regional"
}

resource "aws_s3_bucket_public_access_block" "icons_bucket" {
  bucket                  = aws_s3_bucket.icons_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "icons_bucket" {
  bucket = aws_s3_bucket.icons_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

data "aws_iam_policy_document" "icons_bucket_policy" {
  statement {
    sid    = "AllowCloudFrontServicePrincipalRead"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = ["s3:GetObject"]

    resources = ["${aws_s3_bucket.icons_bucket.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.main.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "icons_bucket" {
  bucket = aws_s3_bucket.icons_bucket.id
  policy = data.aws_iam_policy_document.icons_bucket_policy.json

  depends_on = [aws_s3_bucket_public_access_block.icons_bucket]
}

resource "aws_s3_bucket" "screenshots_bucket" {
  bucket           = "screenshots-${var.environment}-${local.bucket_suffix}"
  bucket_namespace = "account-regional"
}

resource "aws_s3_bucket_public_access_block" "screenshots_bucket" {
  bucket                  = aws_s3_bucket.screenshots_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "screenshots_bucket" {
  bucket = aws_s3_bucket.screenshots_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

data "aws_iam_policy_document" "screenshots_bucket_policy" {
  statement {
    sid    = "AllowCloudFrontServicePrincipalRead"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = ["s3:GetObject"]

    resources = ["${aws_s3_bucket.screenshots_bucket.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.main.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "screenshots_bucket" {
  bucket = aws_s3_bucket.screenshots_bucket.id
  policy = data.aws_iam_policy_document.screenshots_bucket_policy.json

  depends_on = [aws_s3_bucket_public_access_block.screenshots_bucket]
}

resource "aws_s3_bucket_cors_configuration" "screenshots_bucket" {
  bucket = aws_s3_bucket.screenshots_bucket.id

  cors_rule {
    allowed_origins = concat(
      ["https://${local.site_host}"],
        var.environment == "dev" ? ["http://localhost:5173"] : []
    )
    allowed_methods = ["PUT"]
    allowed_headers = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

output "media_bucket_url" {
  value = "https://${local.site_host}/media/"
}

output "icon_bucket_url" {
  value = "https://${local.site_host}/icons/"
}
