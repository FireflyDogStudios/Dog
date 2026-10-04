# Den Game — Code Guide (current conventions, v0.44)

Written Oct 2, 2026 by Firefly after the big refactor. **Read with DEN-GAME-ENGINEERING.md**; where they disagree, this file is newer. The to-do list lives in **claude/DEN-GAME-MASTER-LIST.md**.

## Workflow
- **Publishing (v0.41):** run `python3 build.py` in the game folder. It makes `dist/index.html` (core styles + script, about 1 MB), `dist/art-base.css` (main art, cached between visits) and `dist/art-alt.css` (extra art sets, loaded after start; `artAltReady` gates `artPick`), and copies `dist/proton.web.min.js` (v0.44). Publish `dist/index.html` with `files: {"art-base.css", "art-alt.css", "proton.web.min.js"}` (files left out of an update are kept). `index.html` stays one self-contained file for testing.
- **Art loading (v0.42):** the published page does NOT use `<link>` for art. A small loader script `fetch()`es `art-base.css` then `art-alt.css`, injects them as `<style>`, and caches them in IndexedDB (`den-art`, keyed by content hash). It retries, falls back to a `<link>`, and shows a notice if all fails. `window.__artReady` gates the boot screen (`bootOut()`, 12 s safety timeout).
- **Boot screen:** `#boot` at the top of `<body>` (inline styles, Field Kit look); removed on the first `render()`. Google Fonts load with `media="print"` so they never block the first paint.
- **Camera zoom:** `camZoom` (1 to 2, saved locally) multiplies the stage scale; `STAGE.camX` shifts the view so the dingo stays about a quarter of the way across. The wheel zooms only over the scene, never over windows or panels.
- Get the code with `Artifact read`; the saved HTML **includes the served wrapper** (an outer doctype/body). Work on `game/index.html`, then strip the wrapper into `publish.html` before every publish (see the Loot 2.0 build log).
- Patch with small Python scripts (`assert old in h`, replace once). Syntax-check the main `<script>` with `node --check` after every patch.
- Test with Playwright + `sim/warp.js` (virtual clock) and a copy with `window.__E=(c)=>eval(c)` (`make_game_copy.py`). Short smoke tests only; **no long sims** until GrumpyDingo asks. Copy `proton.web.min.js` into `sim/` too.
- Append a `DEVLOG` block for every publish (`{v, d, notes}`), and check the block closes with `]}` before the next `,`.

## Removing code safely
- Remove whole `if (a === "…"){…}` action branches with a brace matcher that skips strings and template literals.
- **Pruning dead functions:** only remove a top-level `function` when its name appears nowhere else (excluding its own body), the block is under 8 KB, and `node --check` still passes after each removal. Never trust a single brace-match on this file blindly: regex literals can fool it (an unchecked prune once deleted half the game; it was restored from the backup). Always keep a `vNN_pre_*.html` backup.
- v0.32 removed: weapon rolling, the merge forge, the classic layout (`layoutTabs`, classic HUD, tray button, old mail overlay, mega bar element), firefly/meat-meteor events, and 16 dead functions.

## Systems to use (don't bypass them)
- **Libraries first (strong rule, GrumpyDingo, v0.44).** Before building something, look for an existing library on GitHub or npm and use it. Fetch with `npm pack` (GitHub raw is blocked in the sandbox). Credit it in `CREDITS`.
- **Particles: Proton** (drawcall, MIT, v7.1.5, `proton.web.min.js` next to the page). Every effect is a row in `PFX_PRE` (hit, crit, poof, trail, glint, pickup, ember, bolt). A new effect = a new row + `pfx(kind, x, y, color, {n, r})` in stage units. `pfx()` returns false when Proton is missing or effects are Off, so the old simple effect still plays. Emitters are pooled per kind+colour; never create one per hit. `pfxFrame()` runs from `fxFrame`; canvas `#fx-part` (z 4).
- **Sky & light (v0.43):** `fxFrame`, canvases `fx-shade / fx-light / fx-wx`, `FX.q` quality. See DEN-GAME-SKY-LIGHT.md.
- **No pop-up boxes for things the world shows (v0.44).** Creature actions → `fieldCue(x, y, text, big)` (short label in the Meadow). Debuffs → their status icon. Big wins and welcome-back → `moonBanner` + loot feed + `lootPile`, never a `.lvlup` card.
- **Shelved content stays out of player text.** Check `SHELVED` / `DISABLED` in letters, baskets and seasonal names (e.g. `baitEv()`).
- **Notifications:** `notify(kind, data)` is the only entry point. Kinds: `loot` (feed), `info` (top-right messages, repeats merge ×N), `event` (sky banners, queued), `shout` (pop above the dingo), `mail` (new-mail notice). `toast/feed/moonBanner/floatText/mailNotice` are thin wrappers for old call sites.
- **Statuses:** `STATUS` table (name, game-icons id, boon/cond, description) + `TRAIT_STATUS` (creature trait → status) + `stOf(id, extra)`. The target frame and the player status bar both read from it. Add new buffs/debuffs there.
- **Disabled systems:** `DISABLED` (checked first in `isUnlocked`): Upgrades, the merge forge, events (Trials). Self Care uses `state.selfCareOn`.
- **Windows:** `FK_DOCK` (dock buttons + hotkeys), `fkOpen / fkCloseWin / fkRenderWin`. A window renders its tab's `LAYOUT` sections through `LAZY` with `tab` temporarily set. Mail is the `@mail` window. Head home is `@home`.
- **Click/change handlers must listen on `document`, never on `#app`.** Windows (`.fkw`) are added to `document.body`, outside `#app`. The main `data-a` click and change dispatchers use `inUI(el)` (true inside `#app` or any `.fkw`).
- **HUD:** `fkTick()` (150 ms) draws level, area bar, dock, target frame and status bar. `renderHud()` now just calls it.
- **Icons:** `FKI` (game-icons subset) + `fkIcon(name)`. Add icons from `npm pack @iconify-json/game-icons`.
- **Loot:** `dropWeapon`, `spawnLoot`, `ARSENAL`, `AFFIX` (see DEN-GAME-LOOT-2.md).
- **Inventory (v0.36):** `invSync()` is the only thing that places items in slots; slots hold keys, never copies. New stackable kinds need entries in `invLive / invCount / invSetCount / invInfo`. Equipped weapons live in `huntState().equipped`. The Stash moves things out of their stores (`stashW`, `stashC`).
- **Window frames never scroll (v0.39):** `.fkw` is `overflow:hidden`; a capture-phase scroll listener resets it. Scroll `.fkw-b` yourself; never call `scrollIntoView` there.
- **Den Stage (v0.40):** the scene is in logical units. Never use `getBoundingClientRect()` or `innerWidth` for game logic; use `dingoPos()`, `STAGE`, `STAGE_LANE`, and `stageToScreen()` only to place effects over the page. Scale the hero with the `scale` property, never `transform`.
- **Credits:** add a line to `CREDITS` for every outside asset, font or library.
- **Den bar:** `DEN_DOCK` windows only open at home and close when you leave.
- **Save epoch:** `SAVE_EPOCH` in `blank()` wipes older saves. Never bump it without GrumpyDingo's OK.
- **Scaling:** `--fkz` CSS var (Interface size).

## Still to clean
See section 4 of DEN-GAME-MASTER-LIST.md (classic CSS and Armory functions, Vault, rolling, Halloween, Trials).
