# fck-nat (https://fck-nat.dev) in "HA mode": a single NAT instance in an
# Auto Scaling Group (min = max = 1). When the instance is replaced, the new
# one re-attaches the static ENI that private route tables point at, so routes
# never change.
#
# How fck-nat routes (from service/fck-nat.sh, verified 2026-11):
#   * The static ENI (`eni_id`) is attached as device index 1 and is the
#     INSIDE interface: private subnets route 0.0.0.0/0 to it.
#   * Traffic is masqueraded out of the instance's PRIMARY ENI.
#   * If `eip_id` is set, the instance associates that EIP with its own
#     primary ENI on boot (--allow-reassociation), giving a stable egress IP.
# So the EIP is NOT attached to the static ENI; the instance moves it itself.
#
# Written as a local module (rather than the community module) so the role is
# created through ../iam_role with the rmit- name and the permissions boundary.

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}
data "aws_partition" "current" {}

locals {
  region     = data.aws_region.current.region
  account_id = data.aws_caller_identity.current.account_id
  partition  = data.aws_partition.current.partition
  ec2_arn    = "arn:${local.partition}:ec2:${local.region}:${local.account_id}"
  vpc_arn    = "${local.ec2_arn}:vpc/${var.vpc_id}"

  # Tag used to (a) scope ENI attachment to fck-nat instances and (b) target
  # the SSM patch association.
  role_tag_key   = "hapi:role"
  role_tag_value = "${var.name}-fck-nat"

  ami_id = coalesce(var.ami_id, data.aws_ami.fck_nat.id)
}

# Official fck-nat AMIs are published by account 568608671756
# (https://fck-nat.dev/stable/deploying/).
data "aws_ami" "fck_nat" {
  most_recent = true
  owners      = ["568608671756"]

  filter {
    name   = "name"
    values = ["fck-nat-al2023-*-arm64-ebs"]
  }

  filter {
    name   = "architecture"
    values = ["arm64"]
  }
}

# ---------------------------------------------------------------------------
# Networking
# ---------------------------------------------------------------------------

resource "aws_security_group" "this" {
  name        = "${var.name}-fck-nat"
  description = "fck-nat instance: accept anything from inside the VPC, egress anywhere"
  vpc_id      = var.vpc_id

  tags = merge(var.tags, { Name = "${var.name}-fck-nat" })
}

resource "aws_vpc_security_group_ingress_rule" "from_vpc" {
  security_group_id = aws_security_group.this.id
  description       = "All traffic from the VPC"
  ip_protocol       = "-1"
  cidr_ipv4         = var.vpc_cidr
}

resource "aws_vpc_security_group_egress_rule" "all" {
  security_group_id = aws_security_group.this.id
  description       = "All outbound"
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

# Inside interface; private route tables target this ENI.
resource "aws_network_interface" "static" {
  subnet_id         = var.subnet_id
  security_groups   = [aws_security_group.this.id]
  source_dest_check = false
  description       = "${var.name} fck-nat static ENI (private route target)"

  tags = merge(var.tags, {
    Name                 = "${var.name}-fck-nat-static"
    (local.role_tag_key) = local.role_tag_value
  })
}

resource "aws_eip" "this" {
  domain = "vpc"
  tags   = merge(var.tags, { Name = "${var.name}-fck-nat" })
}

# ---------------------------------------------------------------------------
# IAM
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "nat" {
  statement {
    sid       = "DescribeForFckNat"
    actions   = ["ec2:DescribeNetworkInterfaces", "ec2:DescribeInstances", "ec2:DescribeAddresses"]
    resources = ["*"]
  }

  # attach-network-interface: the static ENI ...
  statement {
    sid       = "AttachStaticEni"
    actions   = ["ec2:AttachNetworkInterface"]
    resources = ["${local.ec2_arn}:network-interface/${aws_network_interface.static.id}"]
  }

  # ... to an instance launched by this ASG (tagged by the launch template).
  statement {
    sid       = "AttachToFckNatInstance"
    actions   = ["ec2:AttachNetworkInterface"]
    resources = ["${local.ec2_arn}:instance/*"]

    condition {
      test     = "StringEquals"
      variable = "aws:ResourceTag/${local.role_tag_key}"
      values   = [local.role_tag_value]
    }
  }

  # modify-network-interface-attribute --no-source-dest-check on the
  # instance's own primary ENI, whose ID is not known in advance.
  statement {
    sid       = "DisableSourceDestCheckInVpc"
    actions   = ["ec2:ModifyNetworkInterfaceAttribute", "ec2:AssociateAddress"]
    resources = ["${local.ec2_arn}:network-interface/*"]

    condition {
      test     = "ArnEquals"
      variable = "ec2:Vpc"
      values   = [local.vpc_arn]
    }
  }

  statement {
    sid       = "AssociateOurEip"
    actions   = ["ec2:AssociateAddress"]
    resources = ["${local.ec2_arn}:elastic-ip/${aws_eip.this.allocation_id}"]
  }
}

# Equivalent of the AWS-managed AmazonSSMManagedInstanceCore policy, inlined
# because the boundary/SCPs may forbid attaching managed policies.
data "aws_iam_policy_document" "ssm" {
  statement {
    sid = "SsmCore"
    actions = [
      "ssm:DescribeAssociation",
      "ssm:GetDeployablePatchSnapshotForInstance",
      "ssm:GetDocument",
      "ssm:DescribeDocument",
      "ssm:GetManifest",
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:ListAssociations",
      "ssm:ListInstanceAssociations",
      "ssm:PutInventory",
      "ssm:PutComplianceItems",
      "ssm:PutConfigurePackageResult",
      "ssm:UpdateAssociationStatus",
      "ssm:UpdateInstanceAssociationStatus",
      "ssm:UpdateInstanceInformation",
    ]
    resources = ["*"]
  }

  statement {
    sid = "SsmMessages"
    actions = [
      "ssmmessages:CreateControlChannel",
      "ssmmessages:CreateDataChannel",
      "ssmmessages:OpenControlChannel",
      "ssmmessages:OpenDataChannel",
    ]
    resources = ["*"]
  }

  statement {
    sid = "Ec2Messages"
    actions = [
      "ec2messages:AcknowledgeMessage",
      "ec2messages:DeleteMessage",
      "ec2messages:FailMessage",
      "ec2messages:GetEndpoint",
      "ec2messages:GetMessages",
      "ec2messages:SendReply",
    ]
    resources = ["*"]
  }

  # AWS-RunPatchBaseline downloads its tooling and patch snapshots from
  # AWS-owned buckets in the region.
  statement {
    sid     = "PatchBaselineBuckets"
    actions = ["s3:GetObject"]
    resources = [
      "arn:${local.partition}:s3:::aws-ssm-${local.region}/*",
      "arn:${local.partition}:s3:::patch-baseline-snapshot-${local.region}/*",
    ]
  }
}

module "role" {
  source = "../iam_role"

  name                     = var.role_name
  path                     = var.iam_role_path
  permissions_boundary_arn = var.permissions_boundary_arn
  description              = "fck-nat instance for ${var.name}"
  trusted_services         = ["ec2.amazonaws.com"]
  create_instance_profile  = true

  inline_policies = {
    fck-nat = data.aws_iam_policy_document.nat.json
    ssm     = data.aws_iam_policy_document.ssm.json
  }

  tags = var.tags
}

# ---------------------------------------------------------------------------
# Instance
# ---------------------------------------------------------------------------

resource "aws_launch_template" "this" {
  name                   = "${var.name}-fck-nat"
  image_id               = local.ami_id
  instance_type          = var.instance_type
  update_default_version = true

  iam_instance_profile {
    name = module.role.instance_profile_name
  }

  # The primary ENI is the OUTBOUND interface. It needs a public IP at boot
  # so the instance can reach the EC2 API before it moves the EIP onto itself.
  network_interfaces {
    device_index                = 0
    associate_public_ip_address = true
    security_groups             = [aws_security_group.this.id]
    delete_on_termination       = true
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  monitoring {
    enabled = false
  }

  user_data = base64encode(<<-EOT
    #!/bin/sh
    set -eu
    # Make sure the SSM agent is present and running (Session Manager port
    # forwarding to RDS and the patch association both depend on it).
    if ! rpm -q amazon-ssm-agent >/dev/null 2>&1; then
      dnf install -y amazon-ssm-agent || true
    fi
    systemctl enable --now amazon-ssm-agent || true

    : > /etc/fck-nat.conf
    echo "eni_id=${aws_network_interface.static.id}" >> /etc/fck-nat.conf
    echo "eip_id=${aws_eip.this.allocation_id}" >> /etc/fck-nat.conf
    service fck-nat restart
  EOT
  )

  tag_specifications {
    resource_type = "instance"
    tags = merge(var.tags, {
      Name                 = "${var.name}-fck-nat"
      (local.role_tag_key) = local.role_tag_value
      PatchGroup           = local.role_tag_value
    })
  }

  tag_specifications {
    resource_type = "volume"
    tags          = merge(var.tags, { Name = "${var.name}-fck-nat" })
  }

  tags = var.tags
}

resource "aws_autoscaling_group" "this" {
  name                = "${var.name}-fck-nat"
  min_size            = 1
  max_size            = 1
  desired_capacity    = 1
  health_check_type   = "EC2"
  vpc_zone_identifier = [var.subnet_id] # must be the static ENI's AZ

  # "$Latest": a replacement instance always boots the newest launch template
  # (and so the newest AMI seen at the last platform apply). Running instances
  # are not replaced automatically; see the fck-nat runbook.
  launch_template {
    id      = aws_launch_template.this.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${var.name}-fck-nat"
    propagate_at_launch = false
  }
}

# ---------------------------------------------------------------------------
# Patching (SSM State Manager)
# ---------------------------------------------------------------------------

resource "aws_ssm_association" "patch" {
  name                = "AWS-RunPatchBaseline"
  association_name    = "${var.name}-fck-nat-patch"
  schedule_expression = var.patch_schedule
  compliance_severity = "HIGH"
  # Otherwise SSM runs it (patch + possible reboot = NAT outage) immediately on
  # creation and every time the association changes, not just on schedule.
  apply_only_at_cron_interval = true

  parameters = {
    Operation    = "Install"
    RebootOption = "RebootIfNeeded"
  }

  targets {
    key    = "tag:PatchGroup"
    values = [local.role_tag_value]
  }
}
