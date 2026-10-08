#!/usr/bin/env bash
# Spark's kit. Containers start fresh; run this once per session.
# The canine builder only needs the repo's own npm deps (Playwright, already in package.json) and Chromium at /opt/pw-browsers.
set -e
cd "$(dirname "$0")/../.."
[ -d node_modules/playwright ] || npm install
python3 -c "import PIL" 2>/dev/null || pip install --quiet pillow   # contact sheets
echo "Spark kit ready: node tools/spark/canine-sdf/shot.mjs <wolf|wolfCoat|dingo|husky|hound> <clay|coat|flat> <yaw> out.png [w] [h]"
