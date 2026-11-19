# Every IAM role in this project goes through this module so that the
# `rmit-` name prefix, the role path and the permissions boundary can never be
# forgotten (RACE requires all three). Permissions are inline only: the
# boundary or SCPs in the RACE account may forbid attaching managed policies.

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

variable "name" {
  description = "Role name. Must start with `rmit-` and be at most 64 characters."
  type        = string

  validation {
    condition     = startswith(var.name, "rmit-") && length(var.name) <= 64
    error_message = "IAM role names must start with \"rmit-\" and be at most 64 characters."
  }
}

variable "description" {
  type    = string
  default = null
}

variable "path" {
  description = "IAM path for the role (and instance profile)."
  type        = string
  default     = "/"

  validation {
    condition     = startswith(var.path, "/") && endswith(var.path, "/")
    error_message = "IAM paths must start and end with \"/\"."
  }
}

variable "permissions_boundary_arn" {
  description = "ARN of the permissions boundary policy attached to the role."
  type        = string

  validation {
    condition     = can(regex("^arn:aws[a-z-]*:iam::(\\d{12}|aws):policy/.+", var.permissions_boundary_arn))
    error_message = "permissions_boundary_arn must be an IAM policy ARN."
  }
}

variable "trusted_services" {
  description = "Service principals allowed to assume the role (e.g. lambda.amazonaws.com)."
  type        = list(string)
}

variable "trust_conditions" {
  description = "Optional extra conditions on the trust policy, e.g. aws:SourceAccount."
  type = list(object({
    test     = string
    variable = string
    values   = list(string)
  }))
  default = []
}

variable "inline_policies" {
  description = "Map of inline policy name => policy JSON."
  type        = map(string)
  default     = {}
}

variable "create_instance_profile" {
  description = "Also create an EC2 instance profile with the same name."
  type        = bool
  default     = false
}

variable "max_session_duration" {
  type    = number
  default = 3600
}

variable "tags" {
  type    = map(string)
  default = {}
}

data "aws_iam_policy_document" "trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = var.trusted_services
    }

    dynamic "condition" {
      for_each = var.trust_conditions
      content {
        test     = condition.value.test
        variable = condition.value.variable
        values   = condition.value.values
      }
    }
  }
}

resource "aws_iam_role" "this" {
  name                 = var.name
  path                 = var.path
  description          = var.description
  assume_role_policy   = data.aws_iam_policy_document.trust.json
  permissions_boundary = var.permissions_boundary_arn
  max_session_duration = var.max_session_duration
  tags                 = var.tags
}

resource "aws_iam_role_policy" "this" {
  for_each = var.inline_policies

  name   = each.key
  role   = aws_iam_role.this.id
  policy = each.value
}

resource "aws_iam_instance_profile" "this" {
  count = var.create_instance_profile ? 1 : 0

  name = var.name
  path = var.path
  role = aws_iam_role.this.name
  tags = var.tags
}

output "name" {
  value = aws_iam_role.this.name
}

output "arn" {
  value = aws_iam_role.this.arn
}

output "id" {
  value = aws_iam_role.this.id
}

output "instance_profile_name" {
  value = try(aws_iam_instance_profile.this[0].name, null)
}

output "instance_profile_arn" {
  value = try(aws_iam_instance_profile.this[0].arn, null)
}
