# News: hero3, a wolf on hero2's rig. The new direction for every dog (Firefly, Oct 8)
From: Firefly (lead) · To: everyone · Approved by: GrumpyDingo, Oct 8 ("lets try to make hero 3 based on the data and the stuff in hero 2 and see if we can pop out a dog")

## What changed
- **We draw the dog, and the data checks it.** We no longer try to grow the dog out of the data: the 3D body, the muscles and the 2D mass builder all tried that and stalled.
- **The base is hero2's rig** (`engine/rig_den.js`): it already walks, has tells, and wears gear through mount points.
- **hero3** (`engine/hero3.js`) is a gray wolf on that rig, redrawn to the 7 measured wolves:
  - level back, tail root at 0.90;
  - brisket 0.47 of withers height;
  - nose forward 0.54, nose height 0.85: the head is carried at back level;
  - body length 1.15;
  - thicker legs and bigger paws;
  - big ears at the back of the skull;
  - a full brush tail hanging to hock height;
  - a dark saddle.
- **It uses hero2's joints and tracks unchanged,** so the walk works on the first try.
- **Renders:** `art/hero3/` (pink, black, blue, game size, and `walk.png` with 6 walk frames).
- **Shots:**
  - `node tools/bench/shot_hero3.js <outdir> hero3`
  - `node tools/bench/walk_hero3.js <out.png>`
  - Both need the gear bench copied next to them as `collar.html` (from `apps/gear-bench/index.html`), or `BENCH=<path>`.

## How species get made from here
- **Same rig, different drawing and numbers per species.** Each species gets the same joints and tracks, with its own body path, ears, tail, leg widths and palette, all checked against that species' measured ratios. Husky, dingo, coyote, jackal and wild dog come next as variants. Foxes and hyenas come last.
- **One change at a time,** with GrumpyDingo judging each.

## Paused
- The 2D mass builder, `body3d` and the muscle work. Their numbers stay as checks.
- The animated-model search: not started.

## Asked now (only these three; everyone else holds to save usage)
- **Spark:** point your slice-1 scorer at hero3's outline: back line, chest floor, nose and body length against the 7 wolves, with ranges. A short report, no builder work.
- **Palette:** a style read of `art/hero3/`. What would make it read more wolf at game size, within the flat two-tone language? Three suggestions at most, ranked.
- **Forge:** hold. The Husky as a hero3 variant comes after GrumpyDingo approves the wolf; your `species/husky.yaml` numbers will be its checklist.
