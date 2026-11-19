# Database roles and privileges, applied by CodeBuild from inside the VPC as
# the RDS master user, BEFORE migrations run (see buildspec.yml).
#
#   hapi_owner  IAM auth. Runs Prisma migrations, so it owns every table.
#   hapi_app    IAM auth. Used by the Lambdas: DML only.
#
# The master password is read from the PGPASSWORD environment variable (set by
# the buildspec from the RDS-managed secret). It is never a variable or a data
# source, so it never lands in state.

terraform {
  required_version = ">= 1.10"

  required_providers {
    postgresql = {
      source  = "cyrilgdn/postgresql"
      version = "~> 1.26"
    }
  }

  # bucket/key/region passed with -backend-config; key = "<env>/db.tfstate"
  backend "s3" {
    encrypt      = true
    use_lockfile = true
  }
}

provider "postgresql" {
  host             = var.db_host
  port             = var.db_port
  database         = var.db_name
  username         = var.db_master_username
  sslmode          = var.sslmode
  sslrootcert      = var.sslrootcert
  connect_timeout  = 15
  superuser        = false # the RDS master is not a real superuser
  expected_version = "17"
}

locals {
  # Membership in rds_iam makes RDS require an IAM token instead of a password.
  rds_iam_role = "rds_iam"
}

resource "postgresql_role" "owner" {
  name  = "hapi_owner"
  login = true
  roles = [local.rds_iam_role]
}

resource "postgresql_role" "app" {
  name  = "hapi_app"
  login = true
  roles = [local.rds_iam_role]
}

# Postgres 15+ no longer grants CREATE on schema public to everyone.
resource "postgresql_grant" "owner_schema" {
  database    = var.db_name
  schema      = "public"
  role        = postgresql_role.owner.name
  object_type = "schema"
  privileges  = ["CREATE", "USAGE"]
}

resource "postgresql_grant" "app_schema" {
  database    = var.db_name
  schema      = "public"
  role        = postgresql_role.app.name
  object_type = "schema"
  privileges  = ["USAGE"]
}

# Every table/sequence is created by migrations running as hapi_owner, and
# this root always applies before migrations, so default privileges cover all
# of them, including on the first build when no tables exist yet.
#
# The provider temporarily grants hapi_owner to the master for these
# statements and revokes it afterwards. Do NOT make that membership
# permanent: hapi_owner is in rds_iam, so the master would inherit rds_iam and
# lose password login.
resource "postgresql_default_privileges" "app_tables" {
  database    = var.db_name
  schema      = "public"
  owner       = postgresql_role.owner.name
  role        = postgresql_role.app.name
  object_type = "table"
  privileges  = ["SELECT", "INSERT", "UPDATE", "DELETE"]
}

resource "postgresql_default_privileges" "app_sequences" {
  database    = var.db_name
  schema      = "public"
  owner       = postgresql_role.owner.name
  role        = postgresql_role.app.name
  object_type = "sequence"
  privileges  = ["USAGE", "SELECT"]
}
