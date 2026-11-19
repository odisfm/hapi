# Per-env tuning for the prod app root. Safe to commit: non-secret only.
# Used automatically by ci/apply-app.sh (CodeBuild); environment, region and
# state_bucket are passed by that script, so don't set them here.

# Reserved concurrency per Lambda. It caps how many database connections the
# Lambdas can open (budget in main.tf).
#
# AWS rejects reservations that would leave fewer than 100 unreserved
# executions in the account, and new accounts often start with a quota of
# 10. Check the quota with `aws lambda get-account-settings`:
#   - below 1000: keep every value at -1 (unreserved). The account quota
#     itself then caps concurrency, well inside the connection budget.
#   - 1000 or more: use api = 20, transcode_in = 5, transcode_out = 5,
#     media_cleanup = 1.
lambda_reserved_concurrency = {
  api           = -1
  transcode_in  = -1
  transcode_out = -1
  media_cleanup = -1
}

lambda_log_retention_days = 30

# Custom domain for the site. Empty: use the CloudFront URL.
domain = ""
