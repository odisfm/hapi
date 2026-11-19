variable "region" {
  description = "Region for all HAPI infrastructure."
  type        = string
  default     = "ap-southeast-2"
}

variable "codecommit_repo_name" {
  type    = string
  default = "hapi"
}

variable "pr_approvals_required" {
  description = "Approvals needed to merge a PR into main. 0 disables the approval rule template."
  type        = number
  default     = 1

  validation {
    condition     = var.pr_approvals_required >= 0 && floor(var.pr_approvals_required) == var.pr_approvals_required
    error_message = "pr_approvals_required must be a non-negative integer."
  }
}

variable "state_noncurrent_version_days" {
  description = "Days to keep noncurrent versions of state objects."
  type        = number
  default     = 90
}
