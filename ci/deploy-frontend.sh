#!/usr/bin/env bash
# Build the client with the app root's outputs, upload it, invalidate
# CloudFront (ported from deploy.yml). Runs only after apply-app succeeded.
# shellcheck source=lib.sh
source "$(dirname "$0")/lib.sh"

out() {
    tofu -chdir="$REPO_ROOT/infra/app" output -raw "$1"
}

cloudfront_id="$(out cloudfront_id)"
frontend_bucket="$(out frontend_bucket_name)"

log "Building frontend"
cd "$REPO_ROOT/client"
VITE_API_URL=/api \
VITE_S3_ICON_BUCKET="$(out icon_bucket_url)" \
VITE_S3_MEDIA_BUCKET="$(out media_bucket_url)" \
VITE_UMAMI_SCRIPT_URL="${VITE_UMAMI_SCRIPT_URL:-}" \
VITE_UMAMI_WEBSITE_ID="${VITE_UMAMI_WEBSITE_ID:-}" \
VITE_UMAMI_DASHBOARD_URL="${VITE_UMAMI_DASHBOARD_URL:-}" \
    npx vite build

log "Uploading to s3://${frontend_bucket}"
# Hashed assets are immutable; everything else (index.html etc.) must revalidate.
aws s3 sync dist/assets "s3://${frontend_bucket}/assets" --delete \
    --cache-control "public,max-age=31536000,immutable"
aws s3 sync dist/ "s3://${frontend_bucket}" --delete \
    --exclude "assets/*" \
    --cache-control "no-cache"

log "Invalidating CloudFront ${cloudfront_id}"
aws cloudfront create-invalidation --distribution-id "$cloudfront_id" --paths "/*" \
    --query 'Invalidation.Id' --output text

log "Live at $(out cloudfront_url)"
