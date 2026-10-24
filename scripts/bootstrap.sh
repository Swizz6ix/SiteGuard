#!/usr/bin/env bash
set -euo pipefail
corepack enable
corepack prepare pnpm@10.18.0 --activate
pnpm install
pnpm build
pnpm test
pnpm siteguard health
