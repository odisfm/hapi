#!/usr/bin/env bash
# Pre-deploy gate: lint, typecheck, tests, npm audit. Any failure aborts
# the build before anything is applied.
# shellcheck source=lib.sh
source "$(dirname "$0")/lib.sh"
cd "$REPO_ROOT"

# The CodeBuild project sets these for apply-db/migrate. The checks must not
# see them: with DB_HOST set, shared/src/db.ts switches to IAM-auth mode at
# import and every test that imports it fails. This script runs in its own
# process, so the later steps still get them.
unset DB_HOST DB_PORT DB_NAME DB_MASTER_USERNAME DB_MASTER_SECRET_ARN

log "npm ci"
npm ci --no-audit

log "Prisma generate + validate"
(cd shared && DISABLE_ERD=true npx prisma generate && npx prisma validate)

log "Lint"
npm run lint --workspace client --workspace api --workspace shared

log "Typecheck"
npm run typecheck --workspaces --if-present

log "Tests (shared, client, api, infra/lambda/*)"
npm run test --workspaces --if-present

# Production dependencies only: an advisory in a dev tool must not block a
# deploy.
log "npm audit (production dependencies, high+)"
npm audit --omit=dev --audit-level=high
