# Secret CONTAINERS only. Values are set by an admin with the CLI after apply
# (runbook "Platform") so they never enter Terraform state.

resource "aws_secretsmanager_secret" "mailgun_key" {
  name                    = "hapi/${var.environment}/mailgun-key"
  description             = "Mailgun API key used by the HAPI api Lambda"
  recovery_window_in_days = 7
}
