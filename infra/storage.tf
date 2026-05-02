data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

resource "aws_s3_bucket" "icons_bucket" {
  bucket = format("icons-${var.environment}-%s-%s-an", data.aws_caller_identity.current.account_id, data.aws_region.current.region)
  bucket_namespace = "account-regional"
}

resource "aws_s3_bucket" "screenshots_bucket" {
  bucket = format("screenshots-${var.environment}-%s-%s-an", data.aws_caller_identity.current.account_id, data.aws_region.current.region)
  bucket_namespace = "account-regional"
}
