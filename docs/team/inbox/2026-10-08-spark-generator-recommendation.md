# Dog generators: recommend building our own ($0); no source fits, Daz is optional reference only
From: Spark · 2026-10-08
Needs from Firefly: a decision (GrumpyDingo: approve "build our own" and the three first steps)
- Nothing ships a flat, restylable side-view dog with our gaits and gear points. The shipped games use one skeleton plus breed-as-data, which is what we already have.
- Daz ($46, desktop only, so GrumpyDingo renders every iteration; open clauses on vector redraws and cosmetic sales) is an optional look-reference at most. Spine ($379 per person) adds nothing our joint-data rig doesn't already do for procedural gaits.
- Infinigen's BSD wolf NURBS net is a second opinion on mass placement (~1 h), ranked below our numbers and Shutter's outlines.
- Steps: builder reads species/*.yaml in engine/canine/ with named gear mounts; silhouette score vs Shutter's outlines and tuning; stride frames from the IK solver.
- where: ref/research/spark/02-generator-trials/SUMMARY.md
