# Den Gear pipeline (how Firefly fits gear to the dogs)

Written Oct 5, 2026 by Firefly. This is the method, in one place, so it never gets lost. The rules behind it are in the `den-dog-anatomy` skill (sections 9 and 10); the tools are in `tools/lens/`.

## The idea in one paragraph

A gear piece is drawn **once** and fits **every dog** because it is drawn against that dog's **connection points** (`GEAR.MOUNTS` in `engine/gear.js`), never against one dog's numbers. Shapes that must be flush with a body (collar, torso, sleeves) are **compiled offline** from the dog's own outline with shapely, then pasted into `engine/gear.js` as `COMPILED`. Everything is checked with numbers (Den Lens), not by eye: grid in drawing units, a part probe, geometry, image measuring, before/after ghosts and a lint.

## The pieces of the pipeline

| Step | Where | What it does |
|---|---|---|
| Mounts | `GEAR.MOUNTS` (`engine/gear.js`) | One row per dog: collar edges R/F, tail centreline and guard layout, torso params, sleeve gaps. A new dog is one more row. |
| Compile | `python3 tools/lens/compile_mounts.py` | Cuts the collar, torso and sleeves from each dog's body and leg shapes (shapely), rounds every corner, writes `COMPILED` into `engine/gear.js`. Re-run when a mount row or a dog's outline changes. |
| Pieces | `GEAR.collar / tailguard / tailring / armor` | Build parts from the mount. Code letter + six digits (band, fitting, style, gem, rarity, infusion). Same code on every dog. |
| Layers | `piece.layersFor(rig)` | A piece can have several layers on different joints (torso at the root, a sleeve on each leg). `RIG.attachPiece` attaches them all. |
| Hosting | `parts.follow = "body"` | Gear that must draw above the limbs is hosted at the root and copies the body joint's transform each tick, so it bobs with the body. `parts.hides` hides the dog's own parts (its collar) while worn. |
| Bench | `apps/gear-bench/index.html` | Both dogs side by side. `node tools/bench/rebuild-gear-bench.mjs` swaps the current `engine/*.js` into it. |
| Publish | only when GrumpyDingo asks | Publish `apps/gear-bench/index.html` to the Gear Bench artifact URL in `artifacts.json`. |

## Den Lens (tools/lens)

- `node tools/lens/lens.cjs shot --rig hero,hero2 --box x,y,w,h --scale s --grid --gear <codes> [--hide collar,tag] [--walk --phase .2] [--ref HEAD] [--lines ...]`: renders in drawing units. `--ref <git ref>` builds from that commit's engine files (before/after).
- `lens.cjs probe --rig hero2 --at 44,10 --gear <code>`: which parts cover a point, in draw order.
- `lens.cjs export` / `lens.cjs piece`: the rigs' raw data and a worn piece's layers, for the Python tools.
- `geom.py`: exact geometry from the rig data (silhouettes, chords, band footprints). `place_band.py`: a band from an angle. `measure_image.py`: angle and centre of a colour in a screenshot. `diff.py`: before/after ghost and SSIM. `refoverlay.py`: a reference photo fitted by landmarks, for measuring (never tracing).
- `lint.py <codes>`: flush, gaps, stray fragments, spurs, duplicate nodes, line weights, on every dog and every layer. Run it before showing GrumpyDingo anything.
- Python deps: `pip install -r tools/lens/requirements.txt`. Node: `npm install` (Playwright).

## Rules that came out of the work

- **Measure, never eyeball.** Docs and shapes can disagree (hero2's collar was drawn at 57° while the sheet and GrumpyDingo's red line said 35°). Fix the shape.
- **Flush means cut to the body.** Compile the piece against the body outline; no clip masks at runtime.
- **One outline per shape**, under the fill, at twice the style-sheet weight (`LINE`: contour .32, interior .22, detail .14), round joins, corners rounded to at least the contour weight.
- **Spacing rule:** the guard's gaps ARE the ring slots (`ringSlots(rig)`); never place a ring from a separate number.
- **Layer order:** paw covers under bracelets under the torso piece; the collar over the torso piece. On the tail the guard goes under the rings.
- **Rings** are the fitting material; the band material is the gem's socket. Oak and Dark wood are also fittings.
- **One style at a time:** nail one style on both dogs before the next. Styles differ in silhouette and construction, not decoration.
- **Cosmetics first:** even, symmetric parts and thin consistent gaps beat coverage for its own sake.

## Gotchas found (so they are not found twice)

- The root's `origin` scales and rotates the drawing but does not shift it; position is where drawing (0,0) goes. Pixi world transforms are stale off-screen: multiply the chain yourself when probing.
- The body is drawn over the tail root (so the root tucks into the rump): a tail guard is hidden until about 29% of the tail on hero2. Check what the body covers before placing a seat.
- Diamond helpers must be given numbers, not formatted strings (`x + r` becomes string concatenation).
- A line lying exactly on a polygon edge intersects to nothing; measure the chord before cutting.
- The body joint bobs (hero .6 per half stride and up to 1.2, hero2 .45) while the legs do not. Gear on the body follows the bob; gear on a leg does not, so a seam between them slides. Cover such seams with the torso piece.

## Adding things

- **A new dog:** add its row to `GEAR.MOUNTS` (collar edges, tail, torso, sleeve gaps), run `compile_mounts.py`, run `lint.py` on every code, look at it in the bench.
- **A new style:** one style at a time; its own silhouette/construction in `gear.js`, compiled shapes if it must be flush, lint, then the bench.
- **New sets (planned):** once every slot exists, use these pieces and tools to make a template, so a new set is a choice of styles and materials per slot.
