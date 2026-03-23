#!/usr/bin/env bash
set -euo pipefail

cd /work

if [ ! -f package-lock.json ]; then
  echo "package-lock.json is required so the Docker runner can install deterministic dependencies." >&2
  exit 1
fi

current_lock_hash="$(sha256sum package-lock.json | awk '{print $1}')"
installed_lock_hash_file="node_modules/.package-lock.sha256"
installed_lock_hash=""

if [ -f "${installed_lock_hash_file}" ]; then
  installed_lock_hash="$(cat "${installed_lock_hash_file}")"
fi

if [ ! -d node_modules/@playwright/test ] || [ "${current_lock_hash}" != "${installed_lock_hash}" ]; then
  npm ci
  printf '%s\n' "${current_lock_hash}" > "${installed_lock_hash_file}"
fi

export PW_HEADED=1

exec xvfb-run -a npx playwright test --headed "$@"
