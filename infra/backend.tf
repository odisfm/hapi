locals {
  api_lambda_zip = "${path.module}/../api/dist/lambda.zip"
}

data "aws_iam_role" "lambda_exec_role" {
  name = "lambda_exec_role"
}

resource "aws_s3_bucket" "lambda_artifacts" {
  bucket = "lambda-artifacts-${var.environment}-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_object" "api_code" {
  bucket = aws_s3_bucket.lambda_artifacts.id
  key    = "api/${filebase64sha256(local.api_lambda_zip)}.zip"
  source = local.api_lambda_zip
}

resource "aws_s3_bucket_public_access_block" "lambda_artifacts" {
  bucket = aws_s3_bucket.lambda_artifacts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "lambda_artifacts" {
  bucket = aws_s3_bucket.lambda_artifacts.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_lambda_function" "api" {
  function_name    = "api-${var.environment}"
  s3_bucket        = aws_s3_object.api_code.bucket
  s3_key           = aws_s3_object.api_code.key
  source_code_hash = filebase64sha256(local.api_lambda_zip)
  handler          = "lambda.handler"
  runtime          = "nodejs24.x"
  role             = data.aws_iam_role.lambda_exec_role.arn
  timeout          = 30
  memory_size      = 512

  environment {
    variables = {
      ENVIRONMENT  = var.environment
      DATABASE_URL = var.lambda_db_url

      BUCKET_ICONS       = aws_s3_bucket.icons_bucket.bucket
      BUCKET_MEDIA = aws_s3_bucket.screenshots_bucket.bucket

      MAILGUN_DOMAIN = var.mailgun_domain
      MAILGUN_KEY = var.mailgun_key
    }
  }
}

resource "aws_apigatewayv2_api" "http" {
  name          = "api-gateway-${var.environment}"
  protocol_type = "HTTP"

}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "proxy" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}

output "api_direct_url" {
  description = "Direct API Gateway invoke URL, bypassing CloudFront"
  value       = aws_apigatewayv2_stage.default.invoke_url
}
