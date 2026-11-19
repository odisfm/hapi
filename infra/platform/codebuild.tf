# Deploy pipeline: push to var.deploy_branch in CodeCommit -> EventBridge ->
# CodeBuild (in the private subnets) -> buildspec.yml (checks, db root,
# migrations, app root, frontend).

data "aws_codecommit_repository" "hapi" {
  repository_name = var.codecommit_repo_name
}

locals {
  codebuild_project_name = "${local.name}-deploy"
  codebuild_log_group    = "/aws/codebuild/${local.codebuild_project_name}"

  # Resources the pipeline's app root creates; the CodeBuild role is scoped to
  # these name patterns.
  app_bucket_pattern      = "hapi-*-${var.environment}-${local.account_id}-${var.region}-an"
  app_name_prefix         = "${local.name}-"
  db_resource_id          = aws_db_instance.main.resource_id
  db_master_secret_arn    = aws_db_instance.main.master_user_secret[0].secret_arn
  ec2_arn                 = "arn:${local.partition}:ec2:${var.region}:${local.account_id}"
  protected_role_names    = ["${local.role_name}-codebuild", "${local.role_name}-codebuild-trigger", "${local.role_name}-fck-nat"]
  protected_role_arns     = [for n in local.protected_role_names : "arn:${local.partition}:iam::${local.account_id}:role${var.iam_role_path}${n}"]
  state_object_arn_prefix = "arn:${local.partition}:s3:::${var.state_bucket}/${var.environment}"
}

resource "aws_cloudwatch_log_group" "codebuild" {
  name              = local.codebuild_log_group
  retention_in_days = 30
}

# ---------------------------------------------------------------------------
# CodeBuild service role
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "codebuild_base" {
  statement {
    sid       = "OwnLogs"
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["${aws_cloudwatch_log_group.codebuild.arn}:*"]
  }

  statement {
    sid       = "Source"
    actions   = ["codecommit:GitPull"]
    resources = [data.aws_codecommit_repository.hapi.arn]
  }

  statement {
    sid = "CodeBuildInVpc"
    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DeleteNetworkInterface",
      "ec2:DescribeSubnets",
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeDhcpOptions",
      "ec2:DescribeVpcs",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "CodeBuildEniPermission"
    actions   = ["ec2:CreateNetworkInterfacePermission"]
    resources = ["${local.ec2_arn}:network-interface/*"]

    condition {
      test     = "ArnEquals"
      variable = "ec2:Subnet"
      values   = [for s in aws_subnet.private : s.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "ec2:AuthorizedService"
      values   = ["codebuild.amazonaws.com"]
    }
  }

  # --- state -------------------------------------------------------------
  # Unconditional on purpose. A prefix condition breaks the S3 backend:
  #   * `tofu init` lists workspaces under "env:/" (outside any env prefix);
  #   * without ListBucket, reading a state object that does not exist yet
  #     (first build) returns 403 instead of 404, which the backend treats as
  #     an error rather than "empty state".
  # It only exposes key names; object access is scoped below.
  statement {
    sid       = "StateList"
    actions   = ["s3:ListBucket"]
    resources = ["arn:${local.partition}:s3:::${var.state_bucket}"]
  }

  statement {
    sid     = "StateReadWriteDbApp"
    actions = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = [
      "${local.state_object_arn_prefix}/db.tfstate",
      "${local.state_object_arn_prefix}/db.tfstate.tflock",
      "${local.state_object_arn_prefix}/app.tfstate",
      "${local.state_object_arn_prefix}/app.tfstate.tflock",
    ]
  }

  statement {
    sid       = "StateReadPlatform"
    actions   = ["s3:GetObject"]
    resources = ["${local.state_object_arn_prefix}/platform.tfstate"]
  }

  # --- database ----------------------------------------------------------
  statement {
    sid       = "DbMasterSecret"
    actions   = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"]
    resources = [local.db_master_secret_arn]
  }

  statement {
    sid       = "DbConnectAsOwner"
    actions   = ["rds-db:connect"]
    resources = ["arn:${local.partition}:rds-db:${var.region}:${local.account_id}:dbuser:${local.db_resource_id}/hapi_owner"]
  }
}

data "aws_iam_policy_document" "codebuild_iam" {
  # Role management only for this env's roles, and only with the boundary.
  statement {
    sid = "ManageEnvRolesWithBoundary"
    actions = [
      "iam:CreateRole",
      "iam:PutRolePolicy",
      "iam:DeleteRolePolicy",
      "iam:AttachRolePolicy",
      "iam:DetachRolePolicy",
      "iam:PutRolePermissionsBoundary",
    ]
    resources = [local.env_role_arn_pattern]

    condition {
      test     = "StringEquals"
      variable = "iam:PermissionsBoundary"
      values   = [var.permissions_boundary_arn]
    }
  }

  statement {
    sid = "ManageEnvRoles"
    actions = [
      "iam:UpdateAssumeRolePolicy",
      "iam:UpdateRole",
      "iam:UpdateRoleDescription",
      "iam:TagRole",
      "iam:UntagRole",
      "iam:DeleteRole",
      "iam:GetRole",
      "iam:GetRolePolicy",
      "iam:ListRolePolicies",
      "iam:ListAttachedRolePolicies",
      "iam:ListRoleTags",
      "iam:ListInstanceProfilesForRole",
    ]
    resources = [local.env_role_arn_pattern]
  }

  statement {
    sid       = "PassEnvRolesToServices"
    actions   = ["iam:PassRole"]
    resources = [local.env_role_arn_pattern]

    condition {
      test     = "StringEquals"
      variable = "iam:PassedToService"
      values   = ["lambda.amazonaws.com", "scheduler.amazonaws.com", "mediaconvert.amazonaws.com"]
    }
  }

  statement {
    sid       = "NeverRemoveBoundaries"
    effect    = "Deny"
    actions   = ["iam:DeleteRolePermissionsBoundary"]
    resources = ["*"]
  }

  # The pipeline must not be able to change its own permissions or the
  # platform's roles (they match the env role pattern above).
  statement {
    sid       = "ProtectPlatformRoles"
    effect    = "Deny"
    actions   = ["iam:*"]
    resources = local.protected_role_arns
  }
}

data "aws_iam_policy_document" "codebuild_app" {
  # --- Lambda ------------------------------------------------------------
  statement {
    sid       = "LambdaFunctions"
    actions   = ["lambda:*"]
    resources = ["arn:${local.partition}:lambda:${var.region}:${local.account_id}:function:${local.app_name_prefix}*"]
  }

  statement {
    sid       = "LambdaRead"
    actions   = ["lambda:ListFunctions", "lambda:GetAccountSettings"]
    resources = ["*"]
  }

  statement {
    sid = "LambdaLogGroups"
    actions = [
      "logs:CreateLogGroup",
      "logs:DeleteLogGroup",
      "logs:PutRetentionPolicy",
      "logs:DeleteRetentionPolicy",
      "logs:TagResource",
      "logs:UntagResource",
      "logs:ListTagsForResource",
      "logs:ListTagsLogGroup",
      "logs:TagLogGroup",
    ]
    resources = [
      "arn:${local.partition}:logs:${var.region}:${local.account_id}:log-group:/aws/lambda/${local.app_name_prefix}*",
      "arn:${local.partition}:logs:${var.region}:${local.account_id}:log-group:/aws/lambda/${local.app_name_prefix}*:*",
    ]
  }

  statement {
    sid       = "LogsDescribe"
    actions   = ["logs:DescribeLogGroups"]
    resources = ["*"]
  }

  # --- S3 (app buckets: hapi-<thing>-<env>-<account>-<region>-an) ----------
  statement {
    sid     = "AppBuckets"
    actions = ["s3:*"]
    resources = [
      "arn:${local.partition}:s3:::${local.app_bucket_pattern}",
      "arn:${local.partition}:s3:::${local.app_bucket_pattern}/*",
    ]
  }

  # --- API Gateway v2 (IDs are random; cannot scope by name) ---------------
  statement {
    sid     = "ApiGateway"
    actions = ["apigateway:GET", "apigateway:POST", "apigateway:PUT", "apigateway:PATCH", "apigateway:DELETE", "apigateway:TagResource", "apigateway:UntagResource"]
    resources = [
      "arn:${local.partition}:apigateway:${var.region}::/apis",
      "arn:${local.partition}:apigateway:${var.region}::/apis/*",
      "arn:${local.partition}:apigateway:${var.region}::/tags/*",
    ]
  }

  # --- CloudFront ----------------------------------------------------------
  # Distribution and OAC IDs are random; functions can be scoped by name.
  statement {
    sid = "CloudFront"
    actions = [
      "cloudfront:CreateDistribution",
      "cloudfront:CreateDistributionWithTags",
      "cloudfront:UpdateDistribution",
      "cloudfront:DeleteDistribution",
      "cloudfront:GetDistribution",
      "cloudfront:GetDistributionConfig",
      "cloudfront:TagResource",
      "cloudfront:UntagResource",
      "cloudfront:ListTagsForResource",
      "cloudfront:CreateInvalidation",
      "cloudfront:GetInvalidation",
      "cloudfront:CreateOriginAccessControl",
      "cloudfront:UpdateOriginAccessControl",
      "cloudfront:DeleteOriginAccessControl",
      "cloudfront:GetOriginAccessControl",
      "cloudfront:GetOriginAccessControlConfig",
      "cloudfront:ListOriginAccessControls",
      "cloudfront:ListCachePolicies",
      "cloudfront:GetCachePolicy",
      "cloudfront:ListOriginRequestPolicies",
      "cloudfront:GetOriginRequestPolicy",
      "cloudfront:ListDistributions",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "CloudFrontFunctions"
    actions   = ["cloudfront:*Function"]
    resources = ["arn:${local.partition}:cloudfront::${local.account_id}:function/${local.app_name_prefix}*"]
  }

  statement {
    sid       = "CloudFrontListFunctions"
    actions   = ["cloudfront:ListFunctions"]
    resources = ["*"]
  }

  # --- EventBridge Scheduler ----------------------------------------------
  statement {
    sid       = "Scheduler"
    actions   = ["scheduler:CreateSchedule", "scheduler:UpdateSchedule", "scheduler:DeleteSchedule", "scheduler:GetSchedule", "scheduler:TagResource", "scheduler:UntagResource", "scheduler:ListTagsForResource"]
    resources = ["arn:${local.partition}:scheduler:${var.region}:${local.account_id}:schedule/default/${local.app_name_prefix}*"]
  }

  # --- read-only lookups used by tofu/providers ----------------------------
  statement {
    sid = "ReadOnly"
    actions = [
      "ec2:DescribeAccountAttributes",
      "ec2:DescribeAvailabilityZones",
      "ec2:DescribeSecurityGroupRules",
      "ec2:DescribeVpcAttribute",
    ]
    resources = ["*"]
  }
}

module "codebuild_role" {
  source = "../modules/iam_role"

  name                     = "${local.role_name}-codebuild"
  path                     = var.iam_role_path
  permissions_boundary_arn = var.permissions_boundary_arn
  description              = "HAPI ${var.environment} deploy pipeline (applies db and app roots)"
  trusted_services         = ["codebuild.amazonaws.com"]
  trust_conditions = [{
    test     = "StringEquals"
    variable = "aws:SourceAccount"
    values   = [local.account_id]
  }]

  inline_policies = {
    base = data.aws_iam_policy_document.codebuild_base.json
    iam  = data.aws_iam_policy_document.codebuild_iam.json
    app  = data.aws_iam_policy_document.codebuild_app.json
  }
}

# ---------------------------------------------------------------------------
# Project
# ---------------------------------------------------------------------------

resource "aws_codebuild_project" "deploy" {
  name          = local.codebuild_project_name
  description   = "Checks, migrates and deploys HAPI ${var.environment} from ${var.deploy_branch}"
  service_role  = module.codebuild_role.arn
  build_timeout = 60
  # Extra builds started while one is running FAIL to start (they are not
  # queued). Re-run with `aws codebuild start-build` if two merges collide.
  concurrent_build_limit = 1

  source {
    type            = "CODECOMMIT"
    location        = data.aws_codecommit_repository.hapi.clone_url_http
    git_clone_depth = 1
    buildspec       = "buildspec.yml"
  }

  source_version = "refs/heads/${var.deploy_branch}"

  artifacts {
    type = "NO_ARTIFACTS"
  }

  cache {
    type  = "LOCAL"
    modes = ["LOCAL_CUSTOM_CACHE"]
  }

  environment {
    type            = "LINUX_CONTAINER"
    compute_type    = var.codebuild_compute_type
    image           = var.codebuild_image
    privileged_mode = false

    dynamic "environment_variable" {
      for_each = {
        ENVIRONMENT              = var.environment
        TF_STATE_BUCKET          = var.state_bucket
        PLATFORM_STATE_KEY       = "${var.environment}/platform.tfstate"
        TOFU_VERSION             = var.tofu_version
        DB_HOST                  = aws_db_instance.main.address
        DB_PORT                  = tostring(aws_db_instance.main.port)
        DB_NAME                  = aws_db_instance.main.db_name
        DB_MASTER_USERNAME       = aws_db_instance.main.username
        DB_MASTER_SECRET_ARN     = local.db_master_secret_arn
        VITE_UMAMI_SCRIPT_URL    = var.umami_script_url
        VITE_UMAMI_WEBSITE_ID    = var.umami_website_id
        VITE_UMAMI_DASHBOARD_URL = var.umami_dashboard_url
      }
      content {
        name  = environment_variable.key
        value = environment_variable.value
        type  = "PLAINTEXT"
      }
    }
  }

  vpc_config {
    vpc_id             = aws_vpc.main.id
    subnets            = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.codebuild.id]
  }

  logs_config {
    cloudwatch_logs {
      group_name = aws_cloudwatch_log_group.codebuild.name
    }
  }

  # CodeBuild validates VPC access with the role at creation time, and the
  # first build needs the NAT route.
  depends_on = [module.codebuild_role, aws_route.private_nat]
}

# ---------------------------------------------------------------------------
# Trigger: push to the deploy branch
# ---------------------------------------------------------------------------

resource "aws_cloudwatch_event_rule" "deploy_on_push" {
  name        = "${local.name}-deploy-on-${var.deploy_branch}"
  description = "Start ${local.codebuild_project_name} when ${var.deploy_branch} changes"

  event_pattern = jsonencode({
    source        = ["aws.codecommit"]
    "detail-type" = ["CodeCommit Repository State Change"]
    resources     = [data.aws_codecommit_repository.hapi.arn]
    detail = {
      event         = ["referenceCreated", "referenceUpdated"]
      referenceType = ["branch"]
      referenceName = [var.deploy_branch]
    }
  })
}

data "aws_iam_policy_document" "trigger" {
  statement {
    actions   = ["codebuild:StartBuild"]
    resources = [aws_codebuild_project.deploy.arn]
  }
}

module "trigger_role" {
  source = "../modules/iam_role"

  name                     = "${local.role_name}-codebuild-trigger"
  path                     = var.iam_role_path
  permissions_boundary_arn = var.permissions_boundary_arn
  description              = "EventBridge -> CodeBuild for HAPI ${var.environment}"
  trusted_services         = ["events.amazonaws.com"]
  trust_conditions = [{
    test     = "StringEquals"
    variable = "aws:SourceAccount"
    values   = [local.account_id]
  }]

  inline_policies = {
    start-build = data.aws_iam_policy_document.trigger.json
  }
}

resource "aws_cloudwatch_event_target" "deploy" {
  rule     = aws_cloudwatch_event_rule.deploy_on_push.name
  arn      = aws_codebuild_project.deploy.arn
  role_arn = module.trigger_role.arn

  # Build exactly the commit that was pushed.
  input_transformer {
    input_paths = {
      commit = "$.detail.commitId"
    }
    input_template = <<-EOT
      {"sourceVersion": <commit>}
    EOT
  }
}
