# Shared helpers for the ci/*.sh pipeline steps. Source, don't execute.
# shellcheck shell=bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export REPO_ROOT

log() {
    printf '\n==> %s\n' "$*"
}

# Fail with a clear message if any of the named variables is empty/unset.
require_env() {
    local missing=()
    local name
    for name in "$@"; do
        if [ -z "${!name:-}" ]; then
            missing+=("$name")
        fi
    done
    if [ "${#missing[@]}" -gt 0 ]; then
        echo "Missing required environment variable(s): ${missing[*]}" >&2
        exit 1
    fi
}

# tofu_init <root dir under infra/> <state key>
tofu_init() {
    local root="$1" key="$2"
    require_env TF_STATE_BUCKET AWS_REGION
    mkdir -p "${TF_PLUGIN_CACHE_DIR:-$HOME/.cache/tofu-plugins}"
    tofu -chdir="$REPO_ROOT/infra/$root" init -input=false -reconfigure \
        -backend-config="bucket=$TF_STATE_BUCKET" \
        -backend-config="key=$key" \
        -backend-config="region=$AWS_REGION"
}
