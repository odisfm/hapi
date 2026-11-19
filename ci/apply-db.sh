#!/usr/bin/env bash
# Apply infra/db (Postgres roles/grants) as the RDS master user.
#
# The master password is read from the RDS-managed secret into PGPASSWORD,
# which the postgresql provider reads directly. It is never a tofu variable,
# never in state, and never printed (this script does not use set -x).
# shellcheck source=lib.sh
source "$(dirname "$0")/lib.sh"

require_env ENVIRONMENT DB_HOST DB_PORT DB_NAME DB_MASTER_USERNAME DB_MASTER_SECRET_ARN RDS_CA_BUNDLE

tofu_init db "${ENVIRONMENT}/db.tfstate"

log "Reading RDS master credentials"
PGPASSWORD="$(aws secretsmanager get-secret-value \
    --secret-id "$DB_MASTER_SECRET_ARN" \
    --query SecretString --output text | jq -r .password)"
if [ -z "$PGPASSWORD" ] || [ "$PGPASSWORD" = "null" ]; then
    echo "Could not read the master password from the RDS-managed secret" >&2
    exit 1
fi
export PGPASSWORD
trap 'unset PGPASSWORD' EXIT

log "Applying db root"
tofu -chdir="$REPO_ROOT/infra/db" apply -input=false -auto-approve \
    -var "environment=$ENVIRONMENT" \
    -var "db_host=$DB_HOST" \
    -var "db_port=$DB_PORT" \
    -var "db_name=$DB_NAME" \
    -var "db_master_username=$DB_MASTER_USERNAME" \
    -var "sslmode=verify-full" \
    -var "sslrootcert=$RDS_CA_BUNDLE"
