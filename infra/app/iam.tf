# One role per function, all through modules/iam_role (rmit- prefix + boundary).
# Replaces the out-of-band `lambda_exec_role` and `TRANSCODE_ROLE_ARN`.

locals {
  lambda_names = {
    api           = "${local.name}-api"
    transcode_in  = "${local.name}-transcode-in"
    transcode_out = "${local.name}-transcode-out"
    media_cleanup = "${local.name}-media-cleanup"
  }

  icons_arn       = aws_s3_bucket.icons_bucket.arn
  screenshots_arn = aws_s3_bucket.screenshots_bucket.arn
}

# Logs + VPC networking + IAM DB auth as hapi_app: needed by every Lambda.
data "aws_iam_policy_document" "lambda_common" {
  for_each = local.lambda_names

  statement {
    sid       = "OwnLogs"
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["${aws_cloudwatch_log_group.lambda[each.key].arn}:*"]
  }

  # Equivalent of AWSLambdaVPCAccessExecutionRole (these actions do not
  # support resource-level permissions).
  statement {
    sid = "VpcNetworking"
    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DescribeSubnets",
      "ec2:DeleteNetworkInterface",
      "ec2:AssignPrivateIpAddresses",
      "ec2:UnassignPrivateIpAddresses",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "DbConnectAsApp"
    actions   = ["rds-db:connect"]
    resources = [local.db_app_user_arn]
  }
}

# --- api ----------------------------------------------------------------------

data "aws_iam_policy_document" "api" {
  # Direct and presigned uploads: icons/<uuid>.webp, media/<uri>.webp,
  # media/transcode_in/<key> (presigned, browser -> S3).
  statement {
    sid       = "Uploads"
    actions   = ["s3:PutObject"]
    resources = ["${local.icons_arn}/*", "${local.screenshots_arn}/*"]
  }

  # Project deletion removes its media (DeleteObjects -> s3:DeleteObject).
  statement {
    sid       = "DeleteProjectMedia"
    actions   = ["s3:DeleteObject"]
    resources = ["${local.icons_arn}/*", "${local.screenshots_arn}/*"]
  }

  statement {
    sid       = "MailgunKey"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [local.platform.mailgun_secret_arn]
  }
}

module "lambda_role_api" {
  source = "../modules/iam_role"

  name                     = "${local.role_name}-api"
  path                     = local.platform.iam_role_path
  permissions_boundary_arn = local.platform.permissions_boundary_arn
  trusted_services         = ["lambda.amazonaws.com"]
  inline_policies = {
    common = data.aws_iam_policy_document.lambda_common["api"].json
    api    = data.aws_iam_policy_document.api.json
  }
}

# --- transcode_in ---------------------------------------------------------------

data "aws_iam_policy_document" "transcode_in" {
  # Probe reads the upload; failed/invalid uploads are deleted.
  statement {
    sid       = "Uploads"
    actions   = ["s3:GetObject", "s3:DeleteObject"]
    resources = ["${local.screenshots_arn}/transcode_in/*"]
  }

  statement {
    sid       = "MediaConvert"
    actions   = ["mediaconvert:CreateJob", "mediaconvert:Probe"]
    resources = ["*"]
  }

  statement {
    sid       = "PassMediaConvertRole"
    actions   = ["iam:PassRole"]
    resources = [module.mediaconvert_role.arn]

    condition {
      test     = "StringEquals"
      variable = "iam:PassedToService"
      values   = ["mediaconvert.amazonaws.com"]
    }
  }
}

module "lambda_role_transcode_in" {
  source = "../modules/iam_role"

  name                     = "${local.role_name}-transcode-in"
  path                     = local.platform.iam_role_path
  permissions_boundary_arn = local.platform.permissions_boundary_arn
  trusted_services         = ["lambda.amazonaws.com"]
  inline_policies = {
    common       = data.aws_iam_policy_document.lambda_common["transcode_in"].json
    transcode-in = data.aws_iam_policy_document.transcode_in.json
  }
}

# --- transcode_out --------------------------------------------------------------

data "aws_iam_policy_document" "transcode_out" {
  # Copy transcode_out/<uri>.webm -> <uri>.webm, then delete the original.
  statement {
    sid       = "ReadAndRemoveOutput"
    actions   = ["s3:GetObject", "s3:DeleteObject"]
    resources = ["${local.screenshots_arn}/transcode_out/*"]
  }

  statement {
    sid       = "WriteFinalMedia"
    actions   = ["s3:PutObject"]
    resources = ["${local.screenshots_arn}/*"]
  }
}

module "lambda_role_transcode_out" {
  source = "../modules/iam_role"

  name                     = "${local.role_name}-transcode-out"
  path                     = local.platform.iam_role_path
  permissions_boundary_arn = local.platform.permissions_boundary_arn
  trusted_services         = ["lambda.amazonaws.com"]
  inline_policies = {
    common        = data.aws_iam_policy_document.lambda_common["transcode_out"].json
    transcode-out = data.aws_iam_policy_document.transcode_out.json
  }
}

# --- media_cleanup --------------------------------------------------------------

data "aws_iam_policy_document" "media_cleanup" {
  statement {
    sid       = "ListBuckets"
    actions   = ["s3:ListBucket"]
    resources = [local.icons_arn, local.screenshots_arn]
  }

  statement {
    sid       = "DeleteUnusedMedia"
    actions   = ["s3:DeleteObject"]
    resources = ["${local.icons_arn}/*", "${local.screenshots_arn}/*"]
  }
}

module "lambda_role_media_cleanup" {
  source = "../modules/iam_role"

  name                     = "${local.role_name}-media-cleanup"
  path                     = local.platform.iam_role_path
  permissions_boundary_arn = local.platform.permissions_boundary_arn
  trusted_services         = ["lambda.amazonaws.com"]
  inline_policies = {
    common        = data.aws_iam_policy_document.lambda_common["media_cleanup"].json
    media-cleanup = data.aws_iam_policy_document.media_cleanup.json
  }
}

# --- MediaConvert service role (passed by transcode_in on CreateJob) ------------

data "aws_iam_policy_document" "mediaconvert" {
  statement {
    sid       = "ReadInput"
    actions   = ["s3:GetObject"]
    resources = ["${local.screenshots_arn}/transcode_in/*"]
  }

  statement {
    sid       = "WriteOutput"
    actions   = ["s3:PutObject"]
    resources = ["${local.screenshots_arn}/transcode_out/*"]
  }

  statement {
    sid       = "BucketLookup"
    actions   = ["s3:ListBucket", "s3:GetBucketLocation"]
    resources = [local.screenshots_arn]
  }
}

module "mediaconvert_role" {
  source = "../modules/iam_role"

  name                     = "${local.role_name}-mediaconvert"
  path                     = local.platform.iam_role_path
  permissions_boundary_arn = local.platform.permissions_boundary_arn
  trusted_services         = ["mediaconvert.amazonaws.com"]
  trust_conditions = [{
    test     = "StringEquals"
    variable = "aws:SourceAccount"
    values   = [local.account_id]
  }]
  inline_policies = {
    s3 = data.aws_iam_policy_document.mediaconvert.json
  }
}

# --- EventBridge Scheduler -> media_cleanup ------------------------------------

data "aws_iam_policy_document" "media_cleanup_scheduler" {
  statement {
    actions   = ["lambda:InvokeFunction"]
    resources = [aws_lambda_function.media_cleanup.arn]
  }
}

module "media_cleanup_scheduler_role" {
  source = "../modules/iam_role"

  name                     = "${local.role_name}-media-cleanup-scheduler"
  path                     = local.platform.iam_role_path
  permissions_boundary_arn = local.platform.permissions_boundary_arn
  trusted_services         = ["scheduler.amazonaws.com"]
  trust_conditions = [{
    test     = "StringEquals"
    variable = "aws:SourceAccount"
    values   = [local.account_id]
  }]
  inline_policies = {
    invoke = data.aws_iam_policy_document.media_cleanup_scheduler.json
  }
}
