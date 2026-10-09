# The Den Game — Engineering Guidebook

How we build and ship the game safely. Read before touching the code. Values live in DEN-GAME-CONSTITUTION.md; plans in DEN-GAME-ROADMAP.md; vibes in DEN-GAME-VIBES.md.

- **Game artifact:** https://claude.ai/artifact/APeiXGfpJhnYRfjs7NorsT (capabilities `db` + `user`)
- **User's own Den (separate codebase, never touched by game work):** https://claude.ai/artifact/NUJoMc4k9TXFYGMdPwgu3F

---

## 1. Getting the code
- `Artifact` action `read` on the game URL; the result names a saved HTML file. Work on a copy in the scratchpad (e.g. `game/index.html`) and keep a backup per version (`game/vNN.html`) before each change.
- Publish with `Artifact` publish + `url` set to the game URL (omit `capabilities` to keep `db`+`user`).
- The file is ~6.4 MB, mostly emoji art (`.eNN`, `.xnNN/.xbNN/.xtNN`, `.ik-*` CSS). **Never print the art.** Use `grep -n ... | cut -c1-200` and read only around the spot.
- Main script is one IIFE (`(function(){ "use strict"; ...`). Functions aren't on `window`.

## 2. Making changes
- Patch with small Python scripts: `assert old in h` then `h.replace(old, new, 1)`. Write the file only at the end of the script, so a failed assert changes nothing.
- When removing a top-level block, end the cut at the next **column-0 line** (`\n[A-Za-z_$(/]`), never at the next `\nfunction` (consts in between get deleted).
- When converting a template-literal expression into a function, match the whole expression, including anything concatenated after the closing backtick (`+ bestiarySection()` was lost once).
- Dead code: `prune.py` removes top-level functions/consts nothing references (cascading). `branches.py` removes `if (a === "x")` action branches with brace matching. Run prune after removals.
- Visible-text renames: replace only in player-facing strings; never in ids, `data-a` values or function names (see the Hatch → Rescue pass).

## 3. Layout and rendering rules
- `LAYOUT[tab]` lists section ids; `LAZY[id]` builds them. `layoutTabs` keeps only elements whose `aria-labelledby` equals the id, so **each LAZY section returns ONE wrapper carrying that id.**
- Each tab's sub-menu (`.subtabs`) is moved into `#subnav`, below the Head home button.
- Unlocks go through `UNLOCKS` / `isUnlocked(k)` (sticky in `state.unlocks`); most are tied to `hasLetter(id)`.
- Letters: `LETTERS` + `zoneLetters()` + `helpLetters()`, checked every 4s by `checkLetters`. Mail item types handled in `claimMail` / `itemLabel`.

## 4. Save safety (Article 10)
- Saves live at `data/users/<user.id()>/save` (per player, private). Fallback is device-only (`localStorage`).
- **Forms:** every `<form>` must be handled in the document-level `submit` listener, which always `preventDefault()`s. A real browser submit navigates away from the Claude bridge and starts a fresh device-only game (Oct 1 incident).
- Device-backup restore only wins if it has at least as much progress (`treats.earned`, `hunt.kills`) as the cloud save.
- Any new state shape goes through `norm()` with safe defaults; migrations run once with a flag.
- **Restoring a player's save:** read `data/users/me/save` with ArtifactData (out_dir), keep the copy, then `set` it back with `if_version` and `savedAt` set ~2 minutes in the future so an open game accepts it instead of overwriting it.
- Never write to a player's save while they're playing unless it's a restore done this way.

## 5. Testing before every publish
1. Syntax: extract the first `<script>` and `node --check`.
2. Boot test with Playwright (Chromium is preinstalled; `NODE_PATH=$(npm root -g)`), page errors collected. The game runs offline with a fresh device save.
3. For internals, make `game/test.html` with `window.__G = {...}` injected right before `function battleFrame(now){`. Never publish the test copy.
4. Click through the tabs touched by the change; test the actual flow (letters, unlocks, forms, trials).
5. Screenshot only when layout matters; prefer text checks.
6. Long tests (>2 min) run in the background with output to a file.
7. Dev mode: password popup (SHA-256 compare) → power ×10,000, all buffs, unlocks everything, Reset my save. Use `localStorage dengame-dev=1` via `addInitScript` in tests.

## 6. Shipping
- **What's new:** append a NEW version block to `DEVLOG` (`{v, d, notes}`) every publish: next version number, date, one short sentence per change. Never edit old blocks (Article 9).
- Update DEN-GAME-ROADMAP.md with what shipped and anything learned.
- Tell the user in plain words what changed and what was tested.

## 7. Telemetry (for tuning the curve)
- `state.tele = {play, ev, snap, last}` saved with each player's save. Events `[playSeconds, type, detail]`; snapshots every 60s `[t, lvl, xp, dps, enemyHp, ttk, kills, meats, coins, bones, weapons, pups, zone, tp, overpower]`.
- Read the user's own data with ArtifactData `get data/users/me/save`. Other players can share via Settings → Stats & timeline → Copy report.

## 7b. Sim harness (pacing tests)
- Files in the scratchpad `sim/`:

  | File | What it does |
  |---|---|
  | `warp.js` | In-page virtual clock: fakes Date, `performance.now`, timers and rAF. Exposes `window.__advance(ms)`. |
  | `game.html` | A copy of the game with `window.__E=(c)=>eval(c);` before the final `})();`. |
  | `bot.js` | Power and casual player behaviour. |
  | `run.js <mode> <hours>` | Runs the sim. Writes `out_<mode>.json` and dumps partial results every 10 sim-minutes. |
  | `analyze.py <modes>` | Prints levels, the unlock timeline and 15-minute snapshots. |

- Runs at roughly 10× real time, slowing late in a run. Start long runs with `setsid nohup ... &`. Never `pkill -f` a pattern that also matches your own shell.
- Compare results against the curve targets in DEN-GAME-ROADMAP.md (Phase 7).

## 7c. Den Smithy (weapon art, v0.16)
- The module sits at the top of the main IIFE as `const SMITHY`. Its source is in the scratchpad `proto/sm/` (`engine.js`, `render.js`, `game_api.js`, assembled into `smithy_module.js`).
- Weapons store `w.code`. `wCode(w)` fills it in lazily for older weapons. `wImg(w, mode)` returns a cached SVG data-URL `<img>`.
  - Modes: `full` (detail, roll reveal), `card` (animated only for epic+), `still` (vault, wall rack, battle).
  - Calm mode forces `still`.
- **Adding a part:** append it to the type's list. **Retiring a part:** remove it from the list but give the others `{v:originalIndex}` so the art code and old codes still work (`resolveParts`).
- Full details: DEN-GAME-SMITHY.md.

## 8. Style for player-facing text
- Warm, short, honest. Rescue (not hatch), Sanctuary = happy home. No guilt, no pressure.
- Every new system gets a letter explaining it, with a Take me there button.

## 9. Licenses
- Emoji: Fluent (MIT), Noto (Apache 2.0), Blobmoji (Apache 2.0), Twemoji (CC BY 4.0, credit line required). Credits live in the Bag footer.
- Smithy weapon art is original (drawn in code by Firefly), so no third-party license is needed.
