variable "environment" {
 type = string
}

variable "lambda_db_url" {
 type = string
}

variable "mailgun_key" {
  type = string
}

variable "email_provider" {
  type = string
}

variable "email_domain" {
  type = string
}

variable "transcode_role_arn" {
 type = string
}

variable "domain" {
  type        = string
  default     = ""
  description = "Custom domain for the site (e.g. example.com). Empty means use the CloudFront-assigned domain."
}