# Import notes (Oct 4, 2026)

How this repo was assembled and what is missing. Sources: the 11 claude.ai artifacts listed in `artifacts.json`, and the Drive pack `den-ledger-everything` (see `MANIFEST-drive-pack.txt`).

## Verified
- `apps/den-ledger` rebuilds **byte-identical** to the live v0.54 page (`node apps/den-ledger/build.mjs --check <saved page>`), and passes the kill check (6 kills x 5 sizes) and the seed-12345 trace.
- Artifact pages were taken from the live artifacts with the service's page wrapper removed.

## Imported from Drive by hand-copy (size-checked against Drive, not hash-checked)
docs, engine, skills, ref, sim (except below), tools/bench, art. Drive's file API returns base64; copies were pasted by agents and sizes compared. Three files needed a same-length typo repaired (`engine/se.js`, `sim/t36.js`, and a one-byte trim on `docs/claude/DEN-GAME-DOG-ANATOMY.md`; its first 9,200 bytes were re-verified exactly against Drive). `DEN-GAME-PIXI-PORT.md` was re-verified byte-for-byte.
`sim/t26.js`: Drive has two files with this name (1 byte apart); the later one was kept.

## Not imported
- `ref/dog/*.png` (Carolina Dog photos, trot silhouettes): listed in the Drive manifest but not present in Drive. They may be in the originating Cowork chat.
- `docs/den-game-sim-logs-v0.15.txt` (22 KB balance-sim log): the copy was blocked mid-write. Regenerable history, not source.
- `sim/out_power_a.json`: could not be copied exactly (the agent patched a digit by inference), so it was left out rather than commit an invented number. Regenerate with `sim/run.js`.
- `game/index.html` (source with inline art), `game/dist/*`, `game/backups/v51-v53.html`: superseded by `apps/den-ledger` (split source + `public/`); artifact version history holds the old builds.
- `game/publish.html`, `pixi/bench/smithy_extract.js`, `pixi/bench/{bench,collar}.html` (built outputs), `art-proto/sm/{smithy.html,smithy_module.js}`, `art-dingo-workbench/workbench.html`: not in Drive or built outputs. `*.BAD-DUPLICATE-delete-me` files skipped.
- `icons/game-icons` (npm `@iconify-json/game-icons@1.2.4`, CC BY 3.0, credited in game): reinstall with npm if needed.
- All `.png/.gif` renders from the art benches; `pixi.min.js` copies (the game's is in `apps/den-ledger/public`).
- `archive/dingo-style-studio` keeps only the canvas `project/` files; its weapon images (`/_blob/...`) are not in the repo.

## Follow-ups worth doing (each its own slice)
1. Build the game from `engine/` (see CLAUDE.md, "Engine drift").
2. Template the benches from `engine/` + `tools/bench/*.tpl.html` and give them the same src/ + build treatment.
3. Reconcile `docs/claude/DEN-GAME-CODE-GUIDE.md` with the `src/js` module names.
