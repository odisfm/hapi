output "state_bucket" {
  description = "Pass as -backend-config=bucket=... to every root."
  value       = aws_s3_bucket.state.bucket
}

output "state_bucket_arn" {
  value = aws_s3_bucket.state.arn
}

output "codecommit_repo_name" {
  value = aws_codecommit_repository.hapi.repository_name
}

output "codecommit_repo_arn" {
  value = aws_codecommit_repository.hapi.arn
}

output "codecommit_clone_url_grc" {
  description = "git-remote-codecommit URL (prefix with <profile>@ after :// to pick a profile)."
  value       = "codecommit::${var.region}://${aws_codecommit_repository.hapi.repository_name}"
}
