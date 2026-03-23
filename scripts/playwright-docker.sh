#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="soucelabs-playwright"
NODE_MODULES_VOLUME="soucelabs-playwright-node-modules"
NPM_CACHE_VOLUME="soucelabs-playwright-npm-cache"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

PLAYWRIGHT_VERSION="$({ 
  cd "${PROJECT_ROOT}"
  node -p "const pkg = require('./package.json'); const version = pkg.devDependencies?.['@playwright/test'] ?? pkg.dependencies?.['@playwright/test']; if (!version) { process.exit(1); } version.replace(/^[^0-9]*/, '').replace(/[^a-zA-Z0-9_.-]/g, '-');"
} )"
PLAYWRIGHT_CACHE_VOLUME="soucelabs-playwright-cache-${PLAYWRIGHT_VERSION}"

DOCKER_TTY_ARGS=()
if [ -t 0 ] && [ -t 1 ]; then
  DOCKER_TTY_ARGS=(-it)
fi

CLI_ARGS=("$@")
UI_MODE=0
UI_PORT=9323

while [ "$#" -gt 0 ]; do
  case "$1" in
    --ui)
      UI_MODE=1
      ;;
    --ui-port=*)
      UI_PORT="${1#--ui-port=}"
      ;;
    --ui-port)
      shift
      if [ "$#" -eq 0 ]; then
        echo "Missing value for --ui-port" >&2
        exit 1
      fi
      UI_PORT="$1"
      ;;
  esac
  shift
done

DOCKER_PORT_ARGS=()
if [ "${UI_MODE}" -eq 1 ]; then
  DOCKER_PORT_ARGS=(-p "${UI_PORT}:${UI_PORT}")
fi

docker build -t "${IMAGE_NAME}" "${PROJECT_ROOT}"

docker volume create "${NODE_MODULES_VOLUME}" >/dev/null
docker volume create "${PLAYWRIGHT_CACHE_VOLUME}" >/dev/null
docker volume create "${NPM_CACHE_VOLUME}" >/dev/null

exec docker run --rm "${DOCKER_TTY_ARGS[@]}" \
  --init \
  --ipc=host \
  "${DOCKER_PORT_ARGS[@]}" \
  -e CI="${CI:-}" \
  -v "${PROJECT_ROOT}:/work" \
  -v "${NODE_MODULES_VOLUME}:/work/node_modules" \
  -v "${PLAYWRIGHT_CACHE_VOLUME}:/ms-playwright" \
  -v "${NPM_CACHE_VOLUME}:/root/.npm" \
  -w /work \
  "${IMAGE_NAME}" \
  "${CLI_ARGS[@]}"
