#!/usr/bin/env bash
# Apply infra/app (Lambdas, API Gateway, CloudFront, buckets). Everything it
# needs from the platform root is read from platform state, so only
# non-secret locators are passed here.
#
# Per-env tuning (reserved concurrency, log retention, custom domain) lives in
# the committed infra/app/<env>.tfvars, used if present. Non-secret only.
# shellcheck source=lib.sh
source "$(dirname "$0")/lib.sh"

require_env ENVIRONMENT TF_STATE_BUCKET AWS_REGION

tofu_init app "${ENVIRONMENT}/app.tfstate"

var_file_args=()
var_file="$REPO_ROOT/infra/app/${ENVIRONMENT}.tfvars"
if [ -f "$var_file" ]; then
    log "Using infra/app/${ENVIRONMENT}.tfvars"
    var_file_args=(-var-file="$var_file")
fi

log "Applying app root"
tofu -chdir="$REPO_ROOT/infra/app" apply -input=false -auto-approve \
    ${var_file_args[@]+"${var_file_args[@]}"} \
    -var "environment=$ENVIRONMENT" \
    -var "region=$AWS_REGION" \
    -var "state_bucket=$TF_STATE_BUCKET"
