#!/bin/bash
# Den kit setup for Claude Code cloud sessions: the Node tools (Playwright, pixelmatch, paper, resvg) and the Python tools for tools/lens (V1) and tools/den (V2).
# Idempotent; Chromium is pre-installed in the cloud image (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD), so nothing downloads a browser.
set -euo pipefail
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then exit 0; fi
cd "$CLAUDE_PROJECT_DIR"
npm install --no-audit --no-fund --silent
if ! command -v uv >/dev/null 2>&1; then pip install -q uv; fi
UV_NO_CACHE=1 uv pip install --system -q -r tools/lens/requirements.txt -r tools/den/requirements.txt
# Heavy tools (Blender, OpenSim, MuJoCo, PyVista) and the apt tools, in the background so the session starts fast.
( apt-get install -y -q --no-install-recommends inkscape gifsicle libegl1 libgl1 libxi6 libxxf86vm1 libxfixes3 libxrender1 libxkbcommon0 libsm6 libosmesa6 \
    || (apt-get update -q && apt-get install -y -q --no-install-recommends inkscape gifsicle libegl1 libgl1 libxi6 libxxf86vm1 libxfixes3 libxrender1 libxkbcommon0 libsm6 libosmesa6)
  UV_NO_CACHE=1 uv pip install --system -q -r tools/den/requirements-heavy.txt ) > /tmp/den-heavy.log 2>&1 &
