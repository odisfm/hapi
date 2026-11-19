output "env_file" {
  description = "Lines for a developer's .env (print with: tofu -chdir=infra/local_dev output -raw env_file)."
  value       = <<-EOT
    BUCKET_ICONS="${aws_s3_bucket.this["icons"].bucket}"
    BUCKET_MEDIA="${aws_s3_bucket.this["media"].bucket}"
    VITE_S3_ICON_BUCKET="https://${aws_cloudfront_distribution.this.domain_name}/icons/"
    VITE_S3_MEDIA_BUCKET="https://${aws_cloudfront_distribution.this.domain_name}/media/"
    AWS_REGION="${var.region}"
  EOT
}

output "icons_bucket" {
  value = aws_s3_bucket.this["icons"].bucket
}

output "media_bucket" {
  value = aws_s3_bucket.this["media"].bucket
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.this.domain_name
}
