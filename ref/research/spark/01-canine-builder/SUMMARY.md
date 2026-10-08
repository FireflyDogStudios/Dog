# A canine builder: stop reverse-engineering, start building forms (Spark, Oct 8 2026)

Request: `docs/claude/DEN-SPARK-REQUEST-canine-builder-2026-10-08.md` (GrumpyDingo via Firefly).

## The answer
**Recommendation: a form-first, parametric builder made of blended volumes (signed distance fields, "SDF").**
- **What it is:** a dog is about 60 named masses: ribcage, croup, thigh, triceps, gaskin, Achilles tendon, cranium, muzzle and so on. Each mass is an ellipsoid or a tapered capsule hung on a joint chain that our species numbers build. A *smooth union* melts the masses together, so muscle flows into muscle and into tendon by construction. That is the quality GrumpyDingo's benchmark has and our relief lacks.
- **How parts swap:** heads, ears, tails and coats are separate modules. The proof is five dogs from one builder: wolf (clay and coat), dingo, Husky and a drop-eared hound. Each is a preset of about 15 numbers, and each renders in about 5 s in headless Chromium.
- **How it fits a 2D game:** the same function renders a lit 3D look and a flat game look (`variants-flat.png`), from any angle and in any pose. It can make sprites, or SVG outlines later.
- **Rigging:** posing is moving joints. The masses ride their bones, so there are no skin weights to paint.

**Fallback:** bake the same builder to a mesh (marching cubes), give it shape keys, and add a Rigify quadruped rig in Blender. Use this if we ever need sculpted surface detail or Blender rendering. The two roads share everything up to the mesh, so choosing the fallback later costs little.

## Why the current road is stuck
"Skeleton, then muscles, then skin" is the right order for *science*, not for *looking right*.
- **Errors compound:** every layer inherits the faults of the one under it: Beagle bones, then the plate muscles warped onto them, then a 2.5D relief. That is why each fix so far has corrected inherited data and never improved the look.
- **Pros don't build this way:** professional animal sculptors block out the big masses first (ZBrush ZSpheres, then DynaMesh). They check against anatomy afterwards. Film muscle systems (Ziva, Weta's Tissue) still need a sculpted target and weeks per creature.
- **The relief can't succeed:** a side-view height field can't hold the volumes the benchmark shows.

## What we keep and what we stop
- **Keep:**
  - the species files and all graded numbers, which become the builder's inputs (bone lengths, ratios, toplines, widths, tuck-up);
  - the 3D skeleton and the IK and gait work (`ref/research/procedural/`), now used as the rig and as a check, not as the base of the mesh;
  - Shutter's measured outlines, used to score each preset's silhouette;
  - the Ellenberger plates, used as the map of *which* masses exist and where they attach.
- **Stop:**
  - the thin-plate warp of plate muscles;
  - Hill volumes as geometry;
  - the height-field relief;
  - the per-bone fixes aimed at making the mesh look right.

## Honest state of the prototype
- It is a **blockout**: about two hours of tuning, with the masses placed by eye from the wolf's numbers. Look at `wolf-clay-side.png` next to the benchmark, and expect "early ZSphere stage", not finished sculpt.
- Known faults:
  - the back has a step at the loin;
  - the shoulder mass reads as a ball;
  - the thigh is too pillar-like;
  - the paws are slipper-shaped.
- **The gap to the benchmark is more masses with better placement**, not a new method. Each fix is one line in one module and holds for every dog.

## What changes
1. Spark turns `tools/spark/canine-sdf/` into `engine/canine/`, which reads `species/*.yaml` directly so presets live with the species.
2. Forge and Palette iterate the masses against Shutter's outlines, with GrumpyDingo judging one change at a time. A silhouette score (intersection over union against the measured outlines) keeps tuning honest.
3. Later: poses from the IK solver, then sprite frames or SVG export into the game.

## Files
- **Renders:**
  - `wolf-clay-side.png`, `wolf-clay-threequarter.png`: the anatomy clay against the benchmark;
  - `wolf-coat-side.png`;
  - `variants-coat.png`, `variants-flat.png`: one builder, four dogs, lit and flat.
- **Code:** `tools/spark/canine-sdf/`:
  - `canine.js` is the builder;
  - `render.html` is the WebGL raymarcher;
  - `shot.mjs` takes a screenshot (`node tools/spark/canine-sdf/shot.mjs husky coat 0 out.png`);
  - `dump.mjs` prints the masses.
- **Method, options and licences:** `NOTE.md`.
