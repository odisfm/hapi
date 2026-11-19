locals {
  api_lambda_zip = "${path.module}/../../api/dist/lambda.zip"
}

resource "aws_s3_bucket" "lambda_artifacts" {
  bucket           = "hapi-lambda-artifacts-${var.environment}-${local.bucket_suffix}"
  bucket_namespace = "account-regional"
  force_destroy    = true # build artifacts only; rebuilt on every deploy
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

# Old zips are never referenced again once a function is updated.
resource "aws_s3_bucket_lifecycle_configuration" "lambda_artifacts" {
  bucket = aws_s3_bucket.lambda_artifacts.id

  rule {
    id     = "expire-old-artifacts"
    status = "Enabled"

    filter {}

    expiration {
      days = 90
    }
  }
}

resource "aws_s3_object" "api_code" {
  bucket = aws_s3_bucket.lambda_artifacts.id
  key    = "api/${filebase64sha256(local.api_lambda_zip)}.zip"
  source = local.api_lambda_zip
}

resource "aws_cloudwatch_log_group" "lambda" {
  for_each = local.lambda_names

  name              = "/aws/lambda/${each.value}"
  retention_in_days = var.lambda_log_retention_days
}

resource "aws_lambda_function" "api" {
  function_name    = local.lambda_names.api
  s3_bucket        = aws_s3_object.api_code.bucket
  s3_key           = aws_s3_object.api_code.key
  source_code_hash = filebase64sha256(local.api_lambda_zip)
  handler          = "lambda.handler"
  runtime          = "nodejs24.x"
  architectures    = ["x86_64"] # the bundled sharp binary is linux-x64-glibc
  role             = module.lambda_role_api.arn
  timeout          = 30
  memory_size      = 512

  reserved_concurrent_executions = var.lambda_reserved_concurrency.api

  vpc_config {
    subnet_ids         = local.lambda_vpc_config.subnet_ids
    security_group_ids = local.lambda_vpc_config.security_group_ids
  }

  environment {
    variables = merge(local.db_env, {
      BUCKET_ICONS = aws_s3_bucket.icons_bucket.bucket
      BUCKET_MEDIA = aws_s3_bucket.screenshots_bucket.bucket

      EMAIL_PROVIDER = local.platform.email_provider
      EMAIL_DOMAIN   = local.platform.email_domain
      # The ARN, not the key: api/src/lambda.ts reads the value at init.
      MAILGUN_SECRET_ARN = local.platform.mailgun_secret_arn

      WEBSITE_URL = "https://${local.site_host}"
    })
  }

  depends_on = [aws_cloudwatch_log_group.lambda]
}

resource "aws_apigatewayv2_api" "http" {
  name          = "${local.name}-api"
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
