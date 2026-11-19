#!/usr/bin/env bash
# Run Prisma migrations as hapi_owner using IAM database authentication.
#
# TLS for Prisma's migration engine (verified against Postgres 17 with a test
# CA): `sslcert` is the CA bundle path and `sslaccept=strict` makes it verify
# the chain and hostname. `sslrootcert` is ignored by the engine.
# shellcheck source=lib.sh
source "$(dirname "$0")/lib.sh"

require_env DB_HOST DB_PORT DB_NAME AWS_REGION RDS_CA_BUNDLE

log "Generating IAM auth token for hapi_owner"
token="$(aws rds generate-db-auth-token \
    --hostname "$DB_HOST" --port "$DB_PORT" \
    --username hapi_owner --region "$AWS_REGION")"
# Tokens contain characters that must be URL-encoded inside a connection string.
encoded="$(node -e 'process.stdout.write(encodeURIComponent(process.argv[1]))' "$token")"
unset token

# connect_timeout: Prisma's default (5 s) is too short for IAM auth on a fresh
# instance. RDS's auth proxy took > 5 s on the first login; Prisma gave up and
# reported it as P1001 "Can't reach database server".
DATABASE_URL="postgresql://hapi_owner:${encoded}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require&sslcert=${RDS_CA_BUNDLE}&sslaccept=strict&connect_timeout=30"
export DATABASE_URL
unset encoded
trap 'unset DATABASE_URL' EXIT

log "prisma migrate deploy"
cd "$REPO_ROOT/shared"
npx prisma migrate deploy
