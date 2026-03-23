#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"

mkdir -p "${SCRIPT_DIR}/results"

if [ -f "${ENV_FILE}" ]; then
  set -a
  # shellcheck disable=SC1090
  . "${ENV_FILE}"
  set +a
fi

if command -v k6 >/dev/null 2>&1; then
  exec k6 "$@"
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Neither k6 nor docker is available. Install k6 or use Docker to run the performance test." >&2
  exit 1
fi

DOCKER_USER_ARGS=()
if command -v id >/dev/null 2>&1; then
  DOCKER_USER_ARGS=(--user "$(id -u):$(id -g)")
fi

DOCKER_ENV_ARGS=()
if [ -f "${ENV_FILE}" ]; then
  DOCKER_ENV_ARGS=(--env-file "${ENV_FILE}")
fi

exec docker run --rm -i \
  "${DOCKER_USER_ARGS[@]}" \
  "${DOCKER_ENV_ARGS[@]}" \
  -v "${SCRIPT_DIR}:/work" \
  -w /work \
  grafana/k6:latest "$@"
