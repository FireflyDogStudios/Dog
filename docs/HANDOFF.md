> **Superseded for current work (Oct 7, 2026):** read `docs/claude/DEN-LEAD-HANDOFF.md` first. This file is the Oct 3 game snapshot (before the `apps/den-ledger/src` split) and stays for the game-side details.

# The Den Ledger — everything, packed (Oct 3, 2026)

A cozy idle AFK-MMORPG about a Carolina Dog (American Dingo). Designed by **GrumpyDingo** (a dingo dog; the game is about a dingo, built by dingoes, with dog values). Coded with Claude, who goes by **Firefly** on this project. This zip is the whole thing: the game, its engines, the benches, the test harness, every design doc, the two skills Firefly works from, the references, and this note for whoever picks up the mantle.

## 1. What is in here

| Folder | What |
|---|---|
| `game/index.html` | The live game source (v0.54). One file: HTML, CSS and JS, with the engines inlined (`RIG`, `registerDenRigs`, `SE`, the Smithy). |
| `game/build.py` → `game/dist/` | Build: splits the art CSS out, copies `proton.web.min.js` and `pixi.min.js`. **Publish `dist/index.html`** to the game artifact (the other files stay attached to it). |
| `game/backups/v51–v53.html` | The last three published versions (every earlier one is in the artifact's version history). |
| `game/sim/` | The test harness (DEN-SIM-HARNESS.md). `make_game_copy.py` makes `sim/game.html`; `t40.js` is the kill check (expect **6 kills at 5 window sizes**); `t45b.js` is the seed-12345 trace that must stay **identical** (`/tmp/t45b_old.txt` was the reference; regenerate it from the last good build before touching combat). Playwright, headless, swiftshader flags for WebGL. |
| `engine/` | The engines as standalone files, **single source of truth** (the game inlines copies; re-inline after every change): `se.js` status & skill engine (+ `se_den.js` Den definitions, `se_test.js` 48 tests), `rig.js` Den Rig (jointed Pixi drawings from data), `rig_den.js` the hero, `hero2` and the nine Meadow creatures, `gear.js` the Smithy gear (collar, tail guard, tail rings, body armor). |
| `pixi/bench/` | **Den Gear Bench** (`gear.tpl.html` → `build_gear_bench.py` → `collar.html`, published as the Gear Bench artifact) and the Den Pixi Bench (`bench.tpl.html`/`bench.html`). `shot_hero.js` renders the hero big on pink/black/blue; `walkframes.js`/`gaitframes.js` render stride frames and a GIF; `legdbg.js` paints each leg piece its own colour. `smithy_extract.js` is the Smithy block pulled out of the game for the bench. |
| `art-dingo-workbench/`, `art-stillroom/`, `art-proto/` | Earlier art benches: the Den Dingo Workbench (old hero + creatures as SVG/CSS rigs), the Stillroom (brews, gems, foods, materials), prototypes. |
| `icons/` | game-icons.net set (CC BY 3.0, credited in-game). |
| `docs/` | All 32 Project docs, verbatim (`BoonsDebuffsLootThoughts.txt` is trimmed to GrumpyDingo's own notes; the pasted wiki pages are not reproduced). Start with `claude/DEN-GAME-MASTER-LIST.md`. |
| `skills/` | `den-dog-anatomy` and `den-creature-design` as SKILL.md folders (see §4). |
| `ref/` | References: GrumpyDingo's Carolina Dog photos (flipped to face right) and the trot silhouette; OpenCat's gait tables (MIT) for timing cross-checks; the svg-character-animator idle/motion notes (MIT); the svg-design skill (for path craft). |
| `artifact-files/` | Odds and ends published alongside artifacts. |

Live artifacts (private to GrumpyDingo's account; versions are kept there):
- The game: https://claude.ai/artifact/APeiXGfpJhnYRfjs7NorsT (db + user capabilities)
- Den Gear Bench (hero2 + gear): https://claude.ai/artifact/YM5BQsk83Kwd1S6pGG3EcL
- Den Pixi Bench (hero + creatures): https://claude.ai/artifact/LXdgL2k38t7ZdjDBk5r4Bw
- Den Dingo Workbench: https://claude.ai/artifact/2N5JULUbfKNkKB3szMUo8Y
- Den Stillroom: https://claude.ai/artifact/T5Y5iGAeRTPMQEfFhJJs4M

## 2. How to work on it

1. Edit `engine/*.js` (or `game/index.html` for game code). Engines are inlined in the game above `const SMITHY`; after an engine change, re-inline it (the game must carry the same text).
2. `cd game && python3 build.py` → `dist/`. Publish `dist/index.html` to the game artifact URL (keeps attached files).
3. Before and after anything that touches combat, loot, the rig or the engines: `node sim/t40.js` (6 kills × 5 sizes) and `node sim/t45b.js` (trace identical). **Drawing must never touch `Math.random`** (seed from `E.x`); that is how the trace stays identical.
4. Every publish gets a new `DEVLOG` block in the game.
5. Benches: `python3 pixi/bench/build_gear_bench.py` then publish `pixi/bench/collar.html` to the Gear Bench URL.
6. Hero review: `node pixi/bench/shot_hero.js <outdir> hero2` (pink/black/blue at 14×, plus game size), `node pixi/bench/walkframes.js` for stride frames. Judge big renders, never pixel zooms.

Tooling that exists in the cloud workspace and must be recreated elsewhere: Node 22 + Playwright with Chromium (`--use-gl=swiftshader --enable-webgl --ignore-gpu-blocklist` for WebGL headless), Python 3 with Pillow, a static server on port 8766 for `t42.js`.

## 3. Standing rules (GrumpyDingo's; the Master List has the full set)

- Libraries first; credit them in `CREDITS`. No long sims; talk before power-curve or balance work. Desktop game; half-width windows must work. Meadow only (other zones shelved). Auto-salvage never touches sets, relics, locked or socketed items. **Original art only**: learn from GW2/ESO/Diablo/PoE, never copy names or assets. Mechanics read plainly (Lesser / Greater, not Growl / Howl). No pop-ups for things the world shows. Effects via Proton presets. One slice at a time, kill-check before and after. Everything that can be an engine, is one.
- Working style: plans in bullets, talk before big moves, create content first and balance later, **one issue at a time** on art with GrumpyDingo judging every change, and say so plainly and early when a tool makes something hard to see or do.

## 4. Skills (install these first)

Both are in `skills/`; put each folder under your agent's skills directory (Claude Code: `~/.claude/skills/<name>/SKILL.md`).
- **den-dog-anatomy** — the Carolina Dog breed standard, anatomy and joint bends, the rig map, gaits, idle/alive motion, the mistakes already made, and the review process (big vector renders on pink/black/blue, contrast-paint any part that blends in, walk frames for anything near a joint, one change at a time). Use it for anything touching the hero or any canine.
- **den-creature-design** — the creature rules (verified attachment, jointed legs, data rigs ready for IK, mirrored gaits for left-facers, horror/wrongness rules, the flat two-tone language). Use it for any creature.
- Also useful: a Pixi/Playwright screenshot routine is already scripted; the OpenCat gait tables in `ref/` are for timing only (two-joint robot legs do not transfer to a dog).

## 5. Where things stand

- **Game** v0.54: status & skill engine wired through everything (buff tiers Lesser/base/Greater defined, numbers TBD; GW2-shaped conditions), Pixi port slices 1–3 (hero and creature rigs rendered in Pixi over the old DOM), old hero `hero` still in the game.
- **hero2** (Gear Bench v39): the redrawn Carolina Dog, measured off GrumpyDingo's photos: angel wing, chest line with forechest, croup and tail root, tail carried out with an upward fishhook and pale underside, hind leg with thigh/gaskin/hock lined up by construction, elbow and pastern straight, ears at the back of the skull, eye on the skull, collar looping the neck, calm walk with linear stance and matched strides. **Approved piece by piece; not yet in the game.** Its numbers are in `docs/claude/DEN-GAME-HERO2-FIT-SHEET.md`.
- **Next**: refit the gear to hero2 (collar → tail guard → tail rings → body armor) from the fit sheet, then swap the game to `hero2` (`RIG.build(PIXI,"hero2")`), kill-check, publish. After that: the remaining gear pieces (head piece, paw covers, bracelets, body cover), gear stats/levels/slots (none exist yet), set bonuses 2/4/6, the gait pass (trot for Zoomies, gallop for Pounce, a head joint, idle motion), Pixi slices 4–6, creature conditions as rig states, and the balance talk.
- Parked, by choice: icons pass, healer stalemate, damage runaway, the dingo taking damage, real gaits (see the Master List §7).

## 6. Advice for whoever picks this up

- Read the Master List, the Constitution and the Vibes doc before writing code; the Code Guide explains the game file's layout. Read the fit sheet before touching gear.
- The game is one big file on purpose (it ships as one artifact). Keep engines as the source of truth and inline them; do not fork logic into the game file.
- The kill checks are the contract. If the trace changes and you did not mean to change combat, you touched randomness somewhere (usually drawing code).
- GrumpyDingo sees things in the art instantly that are easy to miss: render big, on flat backgrounds, paint parts in contrasting colours, and show stride frames, not one pose. Cuts are cheap; don't argue for a drawing.
- Keep mechanics readable by a player on first sight; keep the dingo's voice in descriptions, not in rule names.
- Do not copy anyone's art, names or assets. Measure proportions off reference photos and draw your own.
- When unsure, ask GrumpyDingo; when a tool is making you half-blind, say so.
