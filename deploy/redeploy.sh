#!/usr/bin/env bash
# Run on the VPS, from the repo root (/home/thomas/ppa), to ship an update.
set -euo pipefail

git pull
(cd server && npm ci)
(cd client && npm ci && npm run build)
pm2 reload deploy/ecosystem.config.js --env production
pm2 save
