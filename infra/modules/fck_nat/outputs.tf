output "static_eni_id" {
  description = "Target for private 0.0.0.0/0 routes."
  value       = aws_network_interface.static.id
}

output "security_group_id" {
  value = aws_security_group.this.id
}

output "asg_name" {
  value = aws_autoscaling_group.this.name
}

output "launch_template_id" {
  value = aws_launch_template.this.id
}

output "egress_public_ip" {
  description = "Stable public IP for all outbound traffic from private subnets."
  value       = aws_eip.this.public_ip
}

output "role_name" {
  value = module.role.name
}

output "role_arn" {
  value = module.role.arn
}

output "instance_tag" {
  description = "Tag key/value carried by the NAT instance (for SSM targeting)."
  value       = { key = local.role_tag_key, value = local.role_tag_value }
}
