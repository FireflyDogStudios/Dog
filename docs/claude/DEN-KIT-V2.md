# Den kit V2 (Firefly's one command for the gear art)

Written Oct 5, 2026 by Firefly. **V1 is frozen**: `tools/lens/` is unchanged, git tag `kit-v1` (commit `70c9ee0`; the tag could not be pushed through the proxy, so the commit hash is the record). V2 lives in `tools/den/` and calls V1 for everything V1 already does, so there is one place to go and V1 stays the fallback. Compare the two any time: `den lint1`-style checks are V1's, everything else is new.

## Run it
- `./den help` (or `python3 tools/den/den.py help`). `./den doctor` lists what is installed and the optional backends that can be added.
- Default code set = one of every kind: `k0000000 t0000000 r0000000 r1000000 r2000000 c0000000 p0000000 b0000000 b1000000 b2000000 b3000000`. Pass codes to test others: `./den sweep c0000000 b0000000`.
- A full `./den lint` takes about three minutes (software GL); single checks take a few seconds to a minute.

## Commands
- **V1 passthrough:** `shot probe export piece compile place-band measure refoverlay diff1` run the V1 tools unchanged.
- **`lint`** runs everything below plus V1's geometry/style lint; non-zero exit on any failure. **`report`** does the same and writes `tools/den/reports/<time>.md`.
- **`sweep`** the ID pass at standing + 16 gait phases on both dogs. Every part (the dog's and every gear part) is drawn in its own flat colour with no anti-aliasing (`bridge.cjs idframes`), then: *holes* = the dog's own leg showing between two gear pieces in a column (the check V1 could not do, because it only looked at the standing pose); *visibility* = pixels per piece per phase (mostly-hidden notes).
- **`order`** asserts the layer rules from the render order of the actual scene (sock under sleeve under cuff on each leg, tail sleeve under guard under rings, torso over every leg piece, collar over torso). Codes are attached in the bench's registry order (paw covers, armor, bracelets, guard, rings, collar), whatever order you pass them.
- **`xcheck`** analytic vs rendered: for 900 sample points per dog, the topmost gear part computed from the data (shapely, with each part's real pose transform) must match the ID pass within half a pixel. About 97% agrees; the misses are the self-crossing hem shapes of the torso piece (a known soft spot of the polygons, not of the render). A drop below 95% means the renderer and the data disagree.
- **`determinism`** every frame is built twice from scratch and must be pixel-identical (a stray `Math.random` in drawing fails this); notes when a code has a different part list on the two dogs.
- **`flush`** numeric flush per piece per dog (area outside the body, directed Hausdorff distance along the seat) against `tools/den/baselines.json`; `./den baseline --update` after an approved change.
- **`legibility`** outline widths in pixels at game scale (1.42 and 6 px/unit; under about 1 px an outline blurs away) and CIEDE2000 contrast of gear paints against the coat.
- **`sample [n]`** n random codes across every kind through lint and determinism, because the code space is too big to test by hand. It found that every infusion accent line was off the style sheet; they now use `2 * LINE.detail`.
- **`diff a.png b.png [--engine ssim|pixelmatch]`** V1's SSIM, or the anti-aliasing-aware pixelmatch.

## How the ID pass works (the heart of V2)
`tools/den/bridge.cjs` builds the rig and attaches the pieces exactly as the bench does, walks the scene in render order, gives every Graphics an id (its colour is its id), and writes the legend: for each id, what it is (dog part or gear piece/layer/part/paint), its draw order, and its transform in drawing units. Python reads the frames as integer images, so questions like "what is on top here", "how much of this is visible", "is anything bare" are exact counts, not colour hunting.

## Optional backends (extra options, they replace nothing)
Listed by `den doctor`: paper.js (curve-aware booleans), resvg-js (a second renderer), Clipper2 (JS polygon ops), uv, hypothesis, colour-science, Pixi `MeshRope` (bending socks; a texture, so try on one sleeve first). Each is added only when wanted, as its own subcommand or flag.

## Findings so far (V2 on the current art)
- **Real:** `hero`'s wrist at gait phase 0 (and a few pixels at 0.4375 and 0.9375): a cream sliver of the dog's pastern shows where the two sock halves part at the wrist bend, about 0.5u wide near (38.8, 30.3). `hero2` is clean. Standing is clean on both.
- **Fixed:** infusion accents used stroke widths off the style sheet (found by `sample`).
