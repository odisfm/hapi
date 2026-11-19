# Connection details come from the CodeBuild environment (set by the platform
# root): DB_HOST, DB_PORT, DB_NAME, DB_MASTER_USERNAME. The password comes from
# PGPASSWORD, never from a variable.

variable "environment" {
  type = string
}

variable "db_host" {
  type = string
}

variable "db_port" {
  type    = number
  default = 5432
}

variable "db_name" {
  type    = string
  default = "hapi"
}

variable "db_master_username" {
  type    = string
  default = "hapi_master"
}

variable "sslmode" {
  description = "verify-full in AWS (with the RDS CA bundle as sslrootcert)."
  type        = string
  default     = "verify-full"
}

variable "sslrootcert" {
  description = "Path to the RDS CA bundle."
  type        = string
  default     = null
}
