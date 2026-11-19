variable "name" {
  description = "Name prefix for resources, e.g. hapi-prod."
  type        = string
}

variable "role_name" {
  description = "IAM role / instance profile name (rmit- prefixed)."
  type        = string
}

variable "iam_role_path" {
  type    = string
  default = "/"
}

variable "permissions_boundary_arn" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "vpc_cidr" {
  description = "Traffic from this CIDR is allowed into the NAT."
  type        = string
}

variable "subnet_id" {
  description = "Public subnet for the static ENI and the ASG (one AZ; an ENI can only attach in its own AZ)."
  type        = string
}

variable "instance_type" {
  description = "Must be an arm64 (Graviton) type to match the AMI."
  type        = string
  default     = "t4g.nano"
}

variable "ami_id" {
  description = "Pin a specific fck-nat AMI. Null = latest official arm64 AL2023 image."
  type        = string
  default     = null
}

variable "patch_schedule" {
  description = "SSM association schedule (cron in UTC)."
  type        = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
