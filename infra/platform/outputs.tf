# Consumed by the db and app roots (terraform_remote_state) and by runbooks.

output "environment" {
  value = var.environment
}

output "region" {
  value = var.region
}

output "permissions_boundary_arn" {
  value = var.permissions_boundary_arn
}

output "iam_role_path" {
  value = var.iam_role_path
}

output "vpc_id" {
  value = aws_vpc.main.id
}

output "vpc_cidr" {
  value = local.vpc_cidr
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}

output "lambda_sg_id" {
  value = aws_security_group.lambda.id
}

output "codebuild_sg_id" {
  value = aws_security_group.codebuild.id
}

output "db_host" {
  value = aws_db_instance.main.address
}

output "db_port" {
  value = aws_db_instance.main.port
}

output "db_name" {
  value = aws_db_instance.main.db_name
}

output "db_resource_id" {
  description = "For rds-db:connect ARNs: arn:aws:rds-db:<region>:<account>:dbuser:<id>/<user>"
  value       = aws_db_instance.main.resource_id
}

output "db_master_username" {
  value = aws_db_instance.main.username
}

output "db_master_secret_arn" {
  value = local.db_master_secret_arn
}

output "mailgun_secret_arn" {
  value = aws_secretsmanager_secret.mailgun_key.arn
}

output "email_provider" {
  value = "mailgun"
}

output "email_domain" {
  value = var.email_domain
}

output "fck_nat_asg_name" {
  value = module.fck_nat.asg_name
}

output "nat_egress_ip" {
  description = "Stable public IP of all outbound traffic (e.g. for Mailgun IP allowlisting)."
  value       = module.fck_nat.egress_public_ip
}

output "codebuild_role_arn" {
  value = module.codebuild_role.arn
}

output "codebuild_project_name" {
  value = aws_codebuild_project.deploy.name
}
