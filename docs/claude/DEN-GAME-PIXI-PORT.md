# Den Game — Pixi Port

Decided Oct 3, 2026 (GrumpyDingo: "lets pixi port, with the new hero"). PixiJS v8.22 (MIT), vendored like Proton (`pixi.min.js`, 840 KB), credited in `CREDITS`. The port goes in slices, each kill-checked (`sim/t40.js`, `sim/t45b.js`) and published on its own; the DOM game keeps running underneath until a slice takes something over.

## Why Pixi (and what it is not)
- One WebGL canvas for the field instead of hundreds of DOM nodes with CSS filters (`drop-shadow`, `hue-rotate`, `brightness`) that repaint every frame. That is where the smoothness comes from; the status engine made the fight loop simpler, not faster.
- Rigged drawings with real joints (the IK pass needs them), lighting and shaders later, particles already in Proton.
- Not a rewrite of the windows: Den bar, Inventory, Smithy, Library stay DOM. Only the field (sky, parallax, hero, creatures, weapons, hits, status chips) moves.

## The Den Rig (RIG) — `engine/rig.js`, `engine/rig_den.js`
A rig is data: parts (SVG paths / lines in the 62×38 drawing space), joints (containers with an `origin`, nested by `in`), tracks (the CSS walk keyframes, verbatim, sampled in JS with the same ease-in-out segments), states (tells: joint rotations and shown/hidden parts).
- `RIG.define(id, def)`; `RIG.build(PIXI, id)` → Container with `.rig.tick(dt)`, `.set("ears-back", on)`, `.walk(on)`, `.face(±1)`, `.seed(ph)`.
- A rig scales and mirrors about its centre (31,19). Left-facers are `scale.x = -1`: one gait, the mirror is free (the CSS rig needed L keyframes).
- Far legs are tinted ×.78 (the old `filter:brightness(.78)`), two-tone pale parts are paint names in the palette.
- Geometry is a shared `GraphicsContext` per (rig, part, far): tessellated once, every copy of a rig reuses it. `RIG.warm(PIXI, id)` builds them at boot.
- Tracks carry `v` (degrees) and/or `x`/`y`; joints can have `period` (own clock, e.g. tail wag, hover), `always` (runs while standing), `bob`. States: `{joint, rot|x|y|scale}`, `{part, show}`, `{alpha}`. Parts tagged `state:1` are hidden unless a state shows them (eyes that go ember, wire that lifts).
- **Drawing never touches `Math.random`** (seeds come from position): the fixed-seed kill checks must stay identical, and they do.
- The nine Meadow creatures are registered (`hollowhorn kindling burrs clockhead fencepost mound bramble puffball shade`) from the Workbench paths, using the negated (left-facing) walk tracks plus `armsw/armfo`, `nod`, `lurch`, `hover`, `bob`, `twitch`. Each has an `angry` state = its tell from the bible.
- The hero is registered: body, tail (wag on its own 1.4 s period), ears as joints, four three-segment legs. States so far: `ears-back`, `ears-up`, `howl`. GrumpyDingo dropped the hackles ridge (Oct 3). Missing: `head-low`, `shake`, `paw-shake`, `fluff` (need a head joint; next).

## Bench
Den Pixi Bench (https://claude.ai/artifact/LXdgL2k38t7ZdjDBk5r4Bw): the hero big and at game size, walk / face left / ears back / howl toggles, a crowd of 60 for the frame cost. Verified against the Workbench: same drawing, same gait. GrumpyDingo's machine: 75 fps with 62 rigs (Oct 3). Build hitch gone since contexts are shared (`RIG.warm` at boot). The bench also shows the nine creatures with their angry tells.

## Slices
1. ✅ **Rig + bench** (Oct 3). Hero on a Pixi rig, tells as states.
2. ✅ **Pixi field under the DOM** (v0.50, Oct 3). `pixiBoot()` (after `fkSetup`) makes one `PIXI.Application` canvas `#pixi` inside `section.hero` (z 3, under `#battle` and the `fx-light` canvas, so the lighting pass lights it like everything else), sized `STAGE.w × STAGE.h` in stage units; `pixiFit()` (called from `stageFit`) sets `resolution = dpr × STAGE.s` so zoom stays crisp. The hero rig sits in a wrapper container; `pixiFrame` (Pixi ticker) copies the old `#dingo`'s `offsetLeft/Top`, its svg's computed CSS `transform` (so Pounce, Whirl, go-home still animate) and opacity onto the wrapper, sets `walk` from `.fighting`, and sets rig states from `SE.active(DINGO)` tells. `body.pixi-on` hides the old svg (visibility only; it stays as the anchor). `RIG` + `registerDenRigs` are inlined above `SMITHY` like `SE`; `pixi.min.js` is a script tag next to Proton, copied by `build.py`, published as an artifact file. Kill check: 6 at five sizes, trace identical. If WebGL fails, `PX.on` stays false and the DOM dingo shows.
   - Not yet on the rig: wearables (`w-head-*`, `w-neck-*`, `w-eyes-*`), costumes, buddy firefly, auras (`destiny`, `wraith`, `smoky`), the Den's mini dingo (`.mdingo`, still DOM).
3. ✅ **Creatures drawn as rigs** (v0.51, Oct 3), rendering only. `rigFor(E)` picks a rig by trait (`RIG_BY_TRAIT`: phasing→shade, healer→hollowhorn, flying→clockhead, swarm→burrs, splitter→puffball, shover→bramble, thrower/armored→fencepost, fast→kindling, shield→mound, else bramble); bosses, megas, titans, king and thief keep their emoji. `rigEnemy(E)` builds the rig and tags `E.el` `.rigged` (emoji hidden); `rigEnemiesFrame` keeps every rig on its element (centre `E.x`, feet on the `.eart` bottom), fades on `.efade`/`.dead`, destroys when the element leaves, stops the walk on `noact`/`.close`, and sets `angry` on `.close` (about to strike) or Enraged. The hp bar, name and chips are still DOM above the rig.
   - **Roster itself unchanged** (names, hp, traits, spawn tables): that's §0.2 / a balance talk, not a rendering slice. Still to come here: creature conditions (Burrs, Scorched, Frostbit, Stunned) as rig states; hit flash; hp/name/chips drawn by Pixi; baby/swarm sizes tuned; bosses as rigs once the boss creature exists.
4. **Weapons and hits.** Orbiting weapons, dmg pops, sparks (Proton already has a Pixi renderer).
5. **Sky and parallax.** Sun fixed to the sky layer (kills the zoom bug), painted layers, lighting tint from the sky engine.
6. **Cleanup.** Old battle CSS and DOM paths removed; `art-base.css`/`art-alt.css` creature sheets retired once no creature uses them.

## Rules
- One rig per thing, from data; no hand-built Containers in the game.
- Tells and statuses come from the status engine only.
- Each slice: back up, build, `node --check`, kill check, DEVLOG, publish, doc.
