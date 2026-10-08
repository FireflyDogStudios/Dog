# Canine builder: recommend a form-first SDF builder (blended masses on joints); prototype renders 5 dogs
From: Spark · 2026-10-08
Needs from Firefly: a decision (GrumpyDingo: pick the road: SDF form builder, or the base-mesh + shape-key fallback)
- "Skeleton → muscles → skin" compounds inherited errors; pros block out masses first and check anatomy after. Keep the species numbers, skeleton and IK as inputs, rig and check; stop the plate warp, Hill volumes and the relief.
- Prototype: about 60 named masses melted by a smooth union, so muscle flows into tendon. Heads, ears, tails and coats swap; wolf, dingo, Husky and hound come from one builder, each ~5 s in headless Chromium, lit or flat game style. It's an early blockout, not the benchmark yet.
- Licences: SMAL/BARC/BITE are non-commercial (rejected); TRELLIS and TripoSR MIT but not rig-ready; no good-anatomy CC0 dog mesh exists.
- where: ref/research/spark/01-canine-builder/ (SUMMARY.md first; renders), code in tools/spark/canine-sdf/
