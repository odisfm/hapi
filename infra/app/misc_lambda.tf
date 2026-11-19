locals {
  transcode_in_lambda_zip  = "${path.module}/../lambda/transcode_in/dist/lambda.zip"
  transcode_out_lambda_zip = "${path.module}/../lambda/transcode_out/dist/lambda.zip"
  media_cleanup_lambda_zip = "${path.module}/../lambda/media_cleanup/dist/lambda.zip"
}

# --- transcode_in: S3 upload -> MediaConvert job -------------------------------

resource "aws_s3_object" "transcode_in_code" {
  bucket = aws_s3_bucket.lambda_artifacts.id
  key    = "transcode_in/${filebase64sha256(local.transcode_in_lambda_zip)}.zip"
  source = local.transcode_in_lambda_zip
}

resource "aws_lambda_function" "transcode_in" {
  function_name    = local.lambda_names.transcode_in
  s3_bucket        = aws_s3_object.transcode_in_code.bucket
  s3_key           = aws_s3_object.transcode_in_code.key
  source_code_hash = filebase64sha256(local.transcode_in_lambda_zip)
  handler          = "lambda.handler"
  runtime          = "nodejs24.x"
  role             = module.lambda_role_transcode_in.arn
  timeout          = 30
  memory_size      = 512

  reserved_concurrent_executions = var.lambda_reserved_concurrency.transcode_in

  vpc_config {
    subnet_ids         = local.lambda_vpc_config.subnet_ids
    security_group_ids = local.lambda_vpc_config.security_group_ids
  }

  environment {
    variables = merge(local.db_env, {
      OUTPUT_BUCKET = aws_s3_bucket.screenshots_bucket.bucket
      ROLE_ARN      = module.mediaconvert_role.arn
    })
  }

  depends_on = [aws_cloudwatch_log_group.lambda]
}

resource "aws_lambda_permission" "allow_transcode_in" {
  statement_id   = "AllowS3InvokeTranscodeIn"
  action         = "lambda:InvokeFunction"
  function_name  = aws_lambda_function.transcode_in.function_name
  principal      = "s3.amazonaws.com"
  source_arn     = aws_s3_bucket.screenshots_bucket.arn
  source_account = local.account_id
}

# --- transcode_out: MediaConvert output -> final media + DB status ----------------

resource "aws_s3_object" "transcode_out_code" {
  bucket = aws_s3_bucket.lambda_artifacts.id
  key    = "transcode_out/${filebase64sha256(local.transcode_out_lambda_zip)}.zip"
  source = local.transcode_out_lambda_zip
}

resource "aws_lambda_function" "transcode_out" {
  function_name    = local.lambda_names.transcode_out
  s3_bucket        = aws_s3_object.transcode_out_code.bucket
  s3_key           = aws_s3_object.transcode_out_code.key
  source_code_hash = filebase64sha256(local.transcode_out_lambda_zip)
  handler          = "lambda.handler"
  runtime          = "nodejs24.x"
  role             = module.lambda_role_transcode_out.arn
  timeout          = 30
  memory_size      = 512

  reserved_concurrent_executions = var.lambda_reserved_concurrency.transcode_out

  vpc_config {
    subnet_ids         = local.lambda_vpc_config.subnet_ids
    security_group_ids = local.lambda_vpc_config.security_group_ids
  }

  environment {
    variables = local.db_env
  }

  depends_on = [aws_cloudwatch_log_group.lambda]
}

resource "aws_lambda_permission" "allow_transcode_out" {
  statement_id   = "AllowS3InvokeTranscodeOut"
  action         = "lambda:InvokeFunction"
  function_name  = aws_lambda_function.transcode_out.function_name
  principal      = "s3.amazonaws.com"
  source_arn     = aws_s3_bucket.screenshots_bucket.arn
  source_account = local.account_id
}

resource "aws_s3_bucket_notification" "transcode" {
  bucket = aws_s3_bucket.screenshots_bucket.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.transcode_in.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "transcode_in/"
  }

  lambda_function {
    lambda_function_arn = aws_lambda_function.transcode_out.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "transcode_out/"
  }

  depends_on = [
    aws_lambda_permission.allow_transcode_in,
    aws_lambda_permission.allow_transcode_out,
  ]
}

# --- media_cleanup: weekly removal of unreferenced media --------------------------

resource "aws_s3_object" "media_cleanup_code" {
  bucket = aws_s3_bucket.lambda_artifacts.id
  key    = "media_cleanup/${filebase64sha256(local.media_cleanup_lambda_zip)}.zip"
  source = local.media_cleanup_lambda_zip
}

resource "aws_lambda_function" "media_cleanup" {
  function_name    = local.lambda_names.media_cleanup
  s3_bucket        = aws_s3_object.media_cleanup_code.bucket
  s3_key           = aws_s3_object.media_cleanup_code.key
  source_code_hash = filebase64sha256(local.media_cleanup_lambda_zip)
  handler          = "lambda.handler"
  runtime          = "nodejs24.x"
  role             = module.lambda_role_media_cleanup.arn
  timeout          = 30
  memory_size      = 512

  reserved_concurrent_executions = var.lambda_reserved_concurrency.media_cleanup

  vpc_config {
    subnet_ids         = local.lambda_vpc_config.subnet_ids
    security_group_ids = local.lambda_vpc_config.security_group_ids
  }

  environment {
    variables = merge(local.db_env, {
      BUCKET_ICONS = aws_s3_bucket.icons_bucket.bucket
      BUCKET_MEDIA = aws_s3_bucket.screenshots_bucket.bucket
    })
  }

  depends_on = [aws_cloudwatch_log_group.lambda]
}

resource "aws_scheduler_schedule" "media_cleanup" {
  name = "${local.name}-media-cleanup"

  flexible_time_window {
    mode = "OFF"
  }

  # Every Monday at 03:00 Melbourne time
  schedule_expression          = "cron(0 3 ? * MON *)"
  schedule_expression_timezone = "Australia/Melbourne"

  target {
    arn      = aws_lambda_function.media_cleanup.arn
    role_arn = module.media_cleanup_scheduler_role.arn
  }
}
