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
