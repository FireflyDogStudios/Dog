#!/usr/bin/env bash
# Atlas's kit: run this at the start of a fresh container. Safe to re-run. Installs nothing it does not need.
#   bash tools/atlas/setup.sh
# What Atlas's own scripts need (tools/atlas/*.py): Python 3 standard library only (csv, json, re, glob, os, statistics, math).
# Extras used for checks: pytest (runs tools/den/tests), Node (strict-JSON test of data files). Both are normally already present.
set -u
cd "$(dirname "$0")/../.."
ok()   { printf '  ok      %s\n' "$1"; }
warn() { printf '  MISSING %s\n' "$1"; }

echo "Atlas kit check"
command -v python3 >/dev/null && ok "python3 $(python3 --version 2>&1 | cut -d' ' -f2)" || warn "python3 (install it; nothing runs without it)"
if python3 -c "import pytest" 2>/dev/null; then ok "pytest $(python3 -c 'import pytest; print(pytest.__version__)')"
else echo "  installing pytest (official PyPI, user scope)"; python3 -m pip install --quiet --user pytest 2>&1 | tail -1; python3 -c "import pytest" 2>/dev/null && ok "pytest" || warn "pytest (tools/den tests will not run)"; fi
command -v node >/dev/null && ok "node $(node --version)" || warn "node (only needed to double-check that JSON files parse strictly)"
command -v git >/dev/null && ok "git" || warn "git"

echo "Atlas scripts (run from the repo root):"
cat <<'LIST'
  python3 tools/atlas/check_links.py          every link and cited path in the docs resolves
  python3 tools/atlas/file_index.py           regenerate docs/research-package/file-index.md
  python3 tools/atlas/credits.py [--check]    regenerate ref/research/CREDITS-RESEARCH.md (--check audits licences only)
  python3 tools/atlas/regen_unitB.py [--validate | --validate-block | --proportions]   StanfordExtra tables from the MIT data
  python3 tools/atlas/clean_stanfordextra.py [--check]   strict-JSON clean-up of the StanfordExtra file
LIST
echo "Quick self-test:"
python3 -I tools/atlas/credits.py --check >/dev/null 2>&1 && ok "credits audit clean" || warn "credits audit reports problems (run: python3 tools/atlas/credits.py --check)"
python3 tools/atlas/check_links.py >/dev/null 2>&1 && ok "links resolve" || warn "unresolved links (run: python3 tools/atlas/check_links.py)"
