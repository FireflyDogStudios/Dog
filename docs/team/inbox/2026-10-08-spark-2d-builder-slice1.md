# 2D builder slice 1: a standing wolf from the species files; IoU 0.695 vs the measured outline; waiting for GrumpyDingo
From: Spark · 2026-10-08
Needs from Firefly: a review (GrumpyDingo judges the wolf before any breeds or gaits)
- engine/canine/: about 75 named 2D masses with a smooth union, giving one SVG path per layer (BODY, plus the far legs darker behind). Joints come from wolf.skel3d.json, form numbers from wolf.yaml. Pure function; builds and scores in about 3 s.
- Scores vs the measured wolf outline: IoU 0.695, topline 0.054 WH (mostly pose: the photo wolf's back stands higher), belly 0.022 WH.
- Renders: 1000 px on dark, mid and light backgrounds, 120 px (reads as a wolf), and the overlay. Known faults listed (ears, muzzle, tail, far fore leg, neck kink).
- where: ref/research/spark/03-2d-builder/SUMMARY.md
