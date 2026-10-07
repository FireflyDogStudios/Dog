#!/usr/bin/env bash
# Scout's kit: the packages Scout's research sessions and sub-agents use repeatedly.
# Fresh containers: run  bash tools/scout/setup.sh  once; then use PYTHONPATH=/tmp/scoutpy python3 ...
# Everything installs OUTSIDE the repo (no venvs/caches in git, per DEN-TEAM house rules).
set -euo pipefail
TARGET="${SCOUT_PYLIB:-/tmp/scoutpy}"
mkdir -p "$TARGET"
pip install -q --target "$TARGET" \
  trimesh fast-simplification numpy scipy shapely scikit-image \
  pdfplumber opencv-python-headless pycocotools
echo "Scout kit installed to $TARGET"
echo "Use: PYTHONPATH=$TARGET python3 -I <script>   (plus system PIL/matplotlib already present)"
# Licences (tools only, never shipped): trimesh MIT, fast-simplification MIT, numpy/scipy BSD,
# shapely BSD-3, scikit-image BSD-3, pdfplumber MIT, opencv Apache-2.0, pycocotools BSD.
