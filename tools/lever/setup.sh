#!/usr/bin/env bash
# Lever's kit: reinstall after a fresh container. Safe to run twice.
set -e
cd "$(dirname "$0")/../.."
[ -d node_modules/playwright ] || npm install --no-audit --no-fund       # playwright comes from package.json; Chromium is pre-installed at /opt/pw-browsers
ln -sfn "$PWD/node_modules" tools/team/inbox-shots/node_modules          # the screenshot tool imports playwright from here (the link is gitignored)
python3 -m unittest discover tools/team/tests 2>&1 | tail -3             # mail.py and relay_outbox.py tests, stdlib only
echo "ready: node tools/team/inbox-shots/flow.mjs \$PWD/apps/team-inbox/index.html   (page checks)"
