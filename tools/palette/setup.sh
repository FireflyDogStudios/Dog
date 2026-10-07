#!/usr/bin/env bash
# Palette's kit. Reinstall in a fresh container: bash tools/palette/setup.sh
# contrast.py needs only the standard library. Pillow is for checking renders (silhouettes, game-size crops).
set -e
python3 -c 'import PIL' 2>/dev/null || pip install -q pillow
echo "Palette kit ready: tools/palette/contrast.py"
