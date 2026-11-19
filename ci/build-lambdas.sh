#!/usr/bin/env bash
# Build the Lambda zips the app root uploads (ported from deploy.yml).
# shellcheck source=lib.sh
source "$(dirname "$0")/lib.sh"
cd "$REPO_ROOT"

# The api bundles sharp, whose native binary must match the Lambda platform:
# linux x64 glibc. This is why CodeBuild and the api Lambda stay on x86_64.
SHARP_VERSION="0.35.4"

log "Building api Lambda"
(cd api && npm run build:lambda)

pkg="$(mktemp -d)"
cp api/dist/lambda.mjs "$pkg/"
(
    cd "$pkg"
    npm init -y >/dev/null
    npm install --omit=dev --no-audit --cpu=x64 --os=linux --libc=glibc "sharp@${SHARP_VERSION}"
    rm -f package.json package-lock.json
    rm -f "$REPO_ROOT/api/dist/lambda.zip"
    zip -q -r "$REPO_ROOT/api/dist/lambda.zip" .
)
rm -rf "$pkg"
# (No `grep -q`: with pipefail, its early exit SIGPIPEs unzip and fails the check.)
if ! unzip -Z1 api/dist/lambda.zip | grep '^node_modules/@img/sharp-linux-x64/' >/dev/null; then
    echo "sharp linux-x64 binary missing from api/dist/lambda.zip" >&2
    exit 1
fi

for fn in transcode_in transcode_out media_cleanup; do
    log "Building ${fn} Lambda"
    (
        cd "infra/lambda/$fn"
        npm run build:lambda
        rm -f dist/lambda.zip
        zip -q -j dist/lambda.zip dist/lambda.mjs
    )
done

ls -l api/dist/lambda.zip infra/lambda/*/dist/lambda.zip
