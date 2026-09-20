resource "aws_s3_bucket" "icons_bucket" {
  bucket           = "icons-${var.environment}-${local.bucket_suffix}"
  bucket_namespace = "account-regional"
}

resource "aws_s3_bucket" "screenshots_bucket" {
  bucket           = "screenshots-${var.environment}-${local.bucket_suffix}"
  bucket_namespace = "account-regional"
}


output "media_bucket_url" {
  value = "https://${aws_s3_bucket.screenshots_bucket.bucket_regional_domain_name}/"
}

output "icon_bucket_url" {
  value = "https://${aws_s3_bucket.icons_bucket.bucket_regional_domain_name}/"
}
