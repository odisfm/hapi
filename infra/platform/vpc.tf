resource "aws_vpc" "main" {
  cidr_block           = local.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = { Name = local.name }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = local.name }
}

# public: cidrsubnet(n = 0, 1, ...)  -- fck-nat only
resource "aws_subnet" "public" {
  count = var.az_count

  vpc_id                  = aws_vpc.main.id
  availability_zone       = local.azs[count.index]
  cidr_block              = cidrsubnet(local.vpc_cidr, 8, count.index)
  map_public_ip_on_launch = false

  tags = { Name = "${local.name}-public-${local.azs[count.index]}" }
}

# private: cidrsubnet(n = 10, 11, ...)  -- Lambdas, CodeBuild, RDS
resource "aws_subnet" "private" {
  count = var.az_count

  vpc_id            = aws_vpc.main.id
  availability_zone = local.azs[count.index]
  cidr_block        = cidrsubnet(local.vpc_cidr, 8, 10 + count.index)

  tags = { Name = "${local.name}-private-${local.azs[count.index]}" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${local.name}-public" }
}

resource "aws_route" "public_internet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.main.id
}

resource "aws_route_table_association" "public" {
  count = var.az_count

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# One private route table: there is a single NAT, so per-AZ tables would all
# point at the same ENI anyway.
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${local.name}-private" }
}

resource "aws_route" "private_nat" {
  route_table_id         = aws_route_table.private.id
  destination_cidr_block = "0.0.0.0/0"
  network_interface_id   = module.fck_nat.static_eni_id
}

resource "aws_route_table_association" "private" {
  count = var.az_count

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.private.id]

  tags = { Name = "${local.name}-s3" }
}

module "fck_nat" {
  source = "../modules/fck_nat"

  name                     = local.name
  role_name                = "${local.role_name}-fck-nat"
  iam_role_path            = var.iam_role_path
  permissions_boundary_arn = var.permissions_boundary_arn

  vpc_id        = aws_vpc.main.id
  vpc_cidr      = local.vpc_cidr
  subnet_id     = aws_subnet.public[0].id
  instance_type = var.fck_nat_instance_type

  patch_schedule = var.patch_schedule

  depends_on = [aws_route.public_internet]
}

# ---------------------------------------------------------------------------
# Shared security groups (consumed by the app root and CodeBuild)
# ---------------------------------------------------------------------------

resource "aws_security_group" "lambda" {
  name        = "${local.name}-lambda"
  description = "HAPI Lambdas: no ingress, all egress"
  vpc_id      = aws_vpc.main.id
  tags        = { Name = "${local.name}-lambda" }
}

resource "aws_vpc_security_group_egress_rule" "lambda_all" {
  security_group_id = aws_security_group.lambda.id
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_security_group" "codebuild" {
  name        = "${local.name}-codebuild"
  description = "HAPI CodeBuild: no ingress, all egress"
  vpc_id      = aws_vpc.main.id
  tags        = { Name = "${local.name}-codebuild" }
}

resource "aws_vpc_security_group_egress_rule" "codebuild_all" {
  security_group_id = aws_security_group.codebuild.id
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}
