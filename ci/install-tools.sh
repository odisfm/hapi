#!/usr/bin/env bash
# Install pinned OpenTofu (checksum-verified) and fetch the RDS CA bundle.
# shellcheck source=lib.sh
source "$(dirname "$0")/lib.sh"

require_env TOFU_VERSION AWS_REGION RDS_CA_BUNDLE

log "Installing OpenTofu ${TOFU_VERSION}"
work="$(mktemp -d)"
base="https://github.com/opentofu/opentofu/releases/download/v${TOFU_VERSION}"
zip="tofu_${TOFU_VERSION}_linux_amd64.zip"
sums="tofu_${TOFU_VERSION}_SHA256SUMS"

curl -fsSL --retry 3 -o "$work/$zip" "$base/$zip"
curl -fsSL --retry 3 -o "$work/$sums" "$base/$sums"
(cd "$work" && grep " ${zip}\$" "$sums" | sha256sum --check --strict -)
unzip -o -q "$work/$zip" tofu -d /usr/local/bin
rm -rf "$work"
tofu version

# Used by the db root (sslrootcert, verify-full) and by prisma migrate
# (sslcert + sslaccept=strict).
log "Fetching RDS CA bundle for ${AWS_REGION}"
curl -fsSL --retry 3 -o "$RDS_CA_BUNDLE" \
    "https://truststore.pki.rds.amazonaws.com/${AWS_REGION}/${AWS_REGION}-bundle.pem"
grep -c 'BEGIN CERTIFICATE' "$RDS_CA_BUNDLE" | xargs -I{} echo "{} certificates in $RDS_CA_BUNDLE"

node --version
npm --version
