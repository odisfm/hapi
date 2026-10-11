locals {
  transcode_in_lambda_zip = "${path.module}/lambda/transcode_in/dist/lambda.zip"
}

resource "aws_lambda_function" "transcode_in" {
  function_name    = "transcode_in-${var.environment}"
  filename         = local.transcode_in_lambda_zip
  source_code_hash = filebase64sha256(local.transcode_in_lambda_zip)
  handler          = "lambda.handler"
  runtime          = "nodejs24.x"
  role             = data.aws_iam_role.lambda_exec_role.arn
  timeout          = 30
  memory_size      = 512

  environment {
    variables = {
      ENVIRONMENT  = var.environment
      DATABASE_URL = var.lambda_db_url
      OUTPUT_BUCKET = aws_s3_bucket.screenshots_bucket.bucket
      ROLE_ARN = var.transcode_role_arn
    }
  }
}

resource "aws_lambda_permission" "allow_transcode_in" {
  statement_id  = "AllowS3InvokeTranscodeIn"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.transcode_in.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.screenshots_bucket.arn
}

resource "aws_lambda_permission" "allow_transcode_out" {
  statement_id  = "AllowS3InvokeTranscodeOut"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.transcode_out.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.screenshots_bucket.arn
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

  depends_on = [aws_lambda_permission.allow_transcode_in, aws_lambda_permission.allow_transcode_out]
}

locals {
  transcode_out_lambda_zip = "${path.module}/lambda/transcode_out/dist/lambda.zip"
}

resource "aws_lambda_function" "transcode_out" {
  function_name = "transcode_out-${var.environment}"
  filename      = local.transcode_out_lambda_zip
  source_code_hash = filebase64sha256(local.transcode_out_lambda_zip)
  handler       = "lambda.handler"
  runtime       = "nodejs24.x"
  role          = data.aws_iam_role.lambda_exec_role.arn
  timeout       = 30
  memory_size   = 512

  environment {
    variables = {
      ENVIRONMENT  = var.environment
      DATABASE_URL = var.lambda_db_url
    }
  }
}

locals {
  media_cleanup_lambda_zip = "${path.module}/lambda/media_cleanup/dist/lambda.zip"
}

resource "aws_lambda_function" "media_cleanup" {
  function_name    = "media_cleanup-${var.environment}"
  filename         = local.media_cleanup_lambda_zip
  source_code_hash = filebase64sha256(local.media_cleanup_lambda_zip)
  handler          = "lambda.handler"
  runtime          = "nodejs24.x"
  role             = data.aws_iam_role.lambda_exec_role.arn
  timeout          = 30
  memory_size      = 512

  environment {
    variables = {
      ENVIRONMENT  = var.environment
      DATABASE_URL = var.lambda_db_url
      BUCKET_ICONS = aws_s3_bucket.icons_bucket.bucket
      BUCKET_MEDIA = aws_s3_bucket.screenshots_bucket.bucket
    }
  }
}

resource "aws_scheduler_schedule" "media_cleanup" {
  name = "media_cleanup-${var.environment}"

  flexible_time_window {
    mode = "OFF"
  }

  # Every Monday at 03:00 Melbourne time
  schedule_expression          = "cron(0 3 ? * MON *)"
  schedule_expression_timezone = "Australia/Melbourne"

  target {
    arn      = aws_lambda_function.media_cleanup.arn
    role_arn = aws_iam_role.media_cleanup_scheduler.arn
  }
}

resource "aws_iam_role" "media_cleanup_scheduler" {
  name = "media_cleanup-scheduler-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "scheduler.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "media_cleanup_scheduler" {
  role = aws_iam_role.media_cleanup_scheduler.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "lambda:InvokeFunction"
      Resource = aws_lambda_function.media_cleanup.arn
    }]
  })
}
