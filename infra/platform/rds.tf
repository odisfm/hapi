# PostgreSQL 17 (matches local Supabase). Only the master user has a password,
# managed by RDS in Secrets Manager. App and migration users log in with IAM
# database authentication (roles created by the db root).

resource "aws_db_subnet_group" "main" {
  name       = local.name
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_db_parameter_group" "main" {
  # name_prefix, not name: with create_before_destroy the replacement (e.g. on
  # a major-version upgrade) would otherwise collide with the existing name.
  name_prefix = "${local.name}-pg17-"
  family      = "postgres17"

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }

  # Close idle sessions after 15 min (frozen Lambda containers keep sockets
  # open). App pools use a 10 min idle timeout so they close first.
  parameter {
    name  = "idle_session_timeout"
    value = "900000"
  }

  parameter {
    name  = "idle_in_transaction_session_timeout"
    value = "60000"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group" "rds" {
  name        = "${local.name}-rds"
  description = "HAPI RDS: 5432 from Lambdas, CodeBuild and the NAT (SSM port forwarding)"
  vpc_id      = aws_vpc.main.id
  tags        = { Name = "${local.name}-rds" }
}

resource "aws_vpc_security_group_ingress_rule" "rds" {
  for_each = {
    lambda    = aws_security_group.lambda.id
    codebuild = aws_security_group.codebuild.id
    fck-nat   = module.fck_nat.security_group_id
  }

  security_group_id            = aws_security_group.rds.id
  description                  = "Postgres from ${each.key}"
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
  referenced_security_group_id = each.value
}

resource "aws_db_instance" "main" {
  identifier = local.name

  engine                     = "postgres"
  engine_version             = "17"
  auto_minor_version_upgrade = true
  instance_class             = var.db_instance_class
  parameter_group_name       = aws_db_parameter_group.main.name

  db_name                             = "hapi"
  username                            = "hapi_master"
  manage_master_user_password         = true
  iam_database_authentication_enabled = true

  storage_type          = "gp3"
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage > 0 ? var.db_max_allocated_storage : null
  storage_encrypted     = true

  # Single-AZ by decision (cost). The subnet group still spans 2 AZs.
  multi_az               = false
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  backup_retention_period   = 7
  backup_window             = "14:00-15:00"         # UTC = ~01:00 Sydney
  maintenance_window        = "sun:17:00-sun:18:00" # UTC = ~Mon 04:00 Sydney, after NAT patching
  copy_tags_to_snapshot     = true
  deletion_protection       = var.db_deletion_protection
  skip_final_snapshot       = false
  final_snapshot_identifier = "${local.name}-final"

  apply_immediately = false
}
