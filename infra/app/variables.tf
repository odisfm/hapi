variable "environment" {
  type = string
}

variable "region" {
  type    = string
  default = "ap-southeast-2"
}

variable "state_bucket" {
  description = "State bucket (from bootstrap); used to read the platform root's outputs."
  type        = string
}

variable "domain" {
  type        = string
  default     = ""
  description = "Custom domain for the site (e.g. example.com). Empty means use the CloudFront-assigned domain."
}

variable "lambda_reserved_concurrency" {
  description = <<-EOT
    Reserved concurrency per Lambda; caps DB connections (see the connection
    budget in main.tf). Set a value to -1 to leave that function unreserved
    (null would fall back to the default): reservations fail if they would
    leave < 100 unreserved executions in the account, and fresh accounts can
    start with a quota of 10.
  EOT
  type = object({
    api           = optional(number, 20)
    transcode_in  = optional(number, 5)
    transcode_out = optional(number, 5)
    media_cleanup = optional(number, 1)
  })
  default = {}
}

variable "lambda_log_retention_days" {
  type    = number
  default = 30
}
