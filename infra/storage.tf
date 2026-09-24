resource "aws_s3_bucket" "icons_bucket" {
  bucket           = "icons-${var.environment}-${local.bucket_suffix}"
  bucket_namespace = "account-regional"
}

resource "aws_s3_bucket" "screenshots_bucket" {
  bucket           = "screenshots-${var.environment}-${local.bucket_suffix}"
  bucket_namespace = "account-regional"
}

resource "aws_s3_bucket_cors_configuration" "screenshots_bucket" {
  bucket = aws_s3_bucket.screenshots_bucket.id

  cors_rule {
    allowed_origins = concat(
      ["https://${aws_cloudfront_distribution.main.domain_name}"],
        var.environment == "dev" ? ["http://localhost:5173"] : []
    )
    allowed_methods = ["PUT"]
    allowed_headers = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

output "media_bucket_url" {
  value = "https://${aws_s3_bucket.screenshots_bucket.bucket_regional_domain_name}/"
}

output "icon_bucket_url" {
  value = "https://${aws_s3_bucket.icons_bucket.bucket_regional_domain_name}/"
}
