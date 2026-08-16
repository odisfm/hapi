resource "aws_s3_bucket" "frontend_bucket" {
  bucket = format("frontend-${var.environment}-%s-%s-an", data.aws_caller_identity.current.account_id, data.aws_region.current.region)
  bucket_namespace = "account-regional"
}

resource "aws_s3_bucket_website_configuration" "example" {
  bucket = format("frontend-${var.environment}-%s-%s-an", data.aws_caller_identity.current.account_id, data.aws_region.current.region)

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

output "frontend_bucket_name" {
  value = aws_s3_bucket.frontend_bucket.bucket
}
