# 18 Spinous-process lean per vertebra (T1-T13, L1-L7)

Scout sub-agent, Oct 8 2026, for Firefly's 3D skeleton correction (item 18). Data in `data.csv`.

## Sign convention
Positive lean = tip leans **caudally**; negative = cranially. Angle is between the process axis (base midpoint → tip) and the perpendicular to the column reference line. Two references are given:
- `*_lean_vs_vertical_deg`: against true vertical in the drawing / ground frame (pose-dependent).
- `*_lean_vs_column_deg`: against the perpendicular to a smoothed line through the process bases (arch-top/"saddle" line), a proxy for the vertebral body long axis. **Pose-independent; use this column for the per-vertebra mesh correction.**

## Tiers searched
1. Tier 1 (quick search): Europe PMC REST for measured canine spinous-process inclination ("spinous process" + inclination/anticlinal + dog/canine + thoracic/lumbar; and a wolf variant). No open table of per-vertebra inclination angles found.
2. Tier 2 (read sources): Sisson & Grossman 1914 OCR (PD, archive.org, already in Scout scratchpad `dl/sisson.txt`), dog vertebral column p.186-187 - qualitative pattern only, rows at the bottom of `data.csv`. Tremolada et al. 2025 (PMC11754510, CC BY-NC-ND) defines a lumbar "spinous process angle (Q)" per vertebra for Labrador/Golden and French Bulldog CTs, but the numeric table is published as an image (not machine-readable in the XML) and the licence is ND - kept as a cited fact only, no values stored.
3. Tier 3 (measured ourselves): both primary datasets below.

## Method - plate (primary, grade B)
- Ellenberger & Baum Tafel 3 (PD), `ref/research/missingfound/atlas-plates/tafel3_skeleton_left-lateral.jpg`, frame from prior work: WH = 1837 px, ground y = 2626, dog faces LEFT (caudal = +x).
- Tip and base-midpoint points picked manually on 2-4x gridded crops, then verified by drawing every axis back onto the plate and adjusting (3 rounds). Base midpoint = centre of the shaft where it meets the arch. Tip = centre of the rounded top (not the overhanging corner).
- T1-T3 bases are hidden behind the scapula: lean comes from the visible shaft segment only (grade C), base extrapolated along that axis to T4's process length (Sisson: "first three or four about equal in length") - offsets for T1-T3 are EST. L7's base is behind the ilium; its visible nub is near vertical and Sisson calls L7 the exception to the forward lean, so L7 = 0 deg EST.
- Column reference: quadratic fit through the real base points; slope ~4.6 deg (T1) to 6.4 deg (L7), rising caudally.
- Tip offset = horizontal (x) distance base-midpoint → tip, positive caudal, divided by that vertebra's base-to-base spacing (centrum+disc proxy, stated because true centrum ends are occluded by ribs).

## Vertebra numbering - CORRECTION to the prior frame note
The task sheet said "first visible thoracic tip at x≈1110 is T2, T1 hidden". Counting tips between the plate's own printed anchors contradicts that: there are **13 distinct spinous tips** cranial of the "1.L." anchor (L1 tip x≈1830): x ≈ 1122, 1174, 1216, 1268, 1327, 1386, 1443, 1495, 1540, 1589, 1626, 1683, 1757. Numbering back from L1 makes the first visible nub **T1** (x≈1122; only its tip clears the scapula). This also lands the near-vertical (anticlinal) process at **T11** (x≈1626, -2.4 deg), matching Sisson, and the plate's "12.R." leader ends exactly on the 1683 process (consistent with R = Rueckenwirbel, i.e. T12). Under the old numbering the anticlinal would fall at T12 and there would be 14 thoracics - impossible. So: first visible tip = T1, nothing marked T1-EST-hidden; T1's *base* is still hidden (grade C).

## Method - Stark mesh (grade A-C by vertebra)
- `ref/research/scout/10-stark-meshes/` (MIT), full model, placed with `ground_4x4 @ diag(mesh_scale)`; frame X=left, Y=caudal, Z=up, mm.
- Thoracic and lumbar vertebrae are **merged** single bodies (`thorax.glb`, `abdomen.glb` are each one geometry - the per-vertebra claim in the task sheet is wrong), so processes were segmented from a midline slab (|x| < 9 mm): dorsal-profile peaks = tips, saddles between peaks = segment bounds and floor; axis = line fit through per-z-bin y-centroids, median over 5 fit ranges (half-spread reported as the uncertainty column).
- The **default pose is not a stance**: the thoracic column rises caudally ~15-31 deg in the ground frame while the lumbar column is nearly level (-10..+3 deg). Ground-frame mesh leans are therefore reported only for reference; the correction uses the column-relative numbers, which are rigid-body-internal and pose-independent.
- 12 thoracic processes resolved = T1-T12; **T13 could not be separated** (its short process merges with the mesh's caudal cut face at this decimation) - T13 mesh = EST. T10-T12 are graded C: mammillary processes are not separable from spinous processes there at this decimation, so tip identification is ambiguous (half-spreads up to +-33 deg before the median).
- Mesh spinous processes are short: free length ~45-57 mm at T1-T6 falling to ~11-22 mm caudally (Beagle CT stretched x1.25 trunk). Plate free lengths at the withers are ~80 px = 4.3 % of WH *above the base*, and the plate withers processes are relatively much longer. Length correction is a separate question from lean; lengths are in `data.csv`.

## T1 tip vs scapula top
- Plate: scapula dorsal-most point ≈ (1150, 857) +-10 px; T1 tip (1122, 842) → T1 tip is ~28 px cranial of the scapula top = **1.5 % of WH (~1 cm on a 55-60 cm dog)**, and pokes ~15 px above it. NOT ~10 cm; on this standing plate the withers peak is essentially over the scapular cartilage with T1 immediately cranial.
- Mesh (full model, default pose): scapula top at y=-271.8, z=422.8; T1 tip y=-314.3, z≈370.6 → T1 tip **43.6 mm cranial** of the scapula top, but the scapula top is **74 mm HIGHER than the T1 tip** and lies over T3 - the default pose carries the scapula unnaturally high/caudal (limb pose is known to be unnatural, see 10-stark-meshes NOTE). Scapula placement is pose, not bone shape; do not treat the mesh value as anatomy.

## Licences
- Ellenberger & Baum Tafel 3: public domain (authors died 1929/1932; published 1898-1911). Measured table stored (grade B/C).
- Stark et al. 2021 meshes: MIT (LICENSE-stark.txt in 10-stark-meshes). Measured table stored.
- Sisson & Grossman 1914: public domain. Quoted pattern rows stored.
- Tremolada et al. 2025 (PMC11754510): CC BY-NC-ND → fact-only row, no values stored (table is an image anyway).
- Miller's Anatomy of the Dog: not consulted this round (closed; nothing needed beyond Sisson).

## Rejected / dead sources
- `dl/j.1469-7580.2008.00961.x.pdf` and `...00962.x.pdf` in the Scout scratchpad are HTML error pages from a failed earlier download, not PDFs - unusable.
- Europe PMC wolf search (142 hits scanned): no wolf-specific spinous-process inclination measurements exist in the open literature → **wolf gap confirmed**; wolves assumed to follow the general canid pattern (13T/7L, anticlinal ≈ T11) - EST only.
- PMC12897383 (biportal endoscopy, CC BY) and other surgical papers: approach angles, not process inclinations - not used.

## Scripts (Scout scratchpad `spine18/`, not in repo)
`grid.py`/`grid2.py`/`z4.py`/`z5.py` (gridded crops), `strip.py` (tip-count strip), `overlay.py` (axis-overlay verification), `picks.json` (final picked points), `plate_final.py` (plate angles → `plate_results.json`), `mesh_robust.py` (mesh angles → `mesh_results.json`, `mesh_check5.png`), `zoom_caudal.py` (T13 check), `build_csv.py` (writes `data.csv`). Verification plots (`ov1-3.png`, `mesh_check*.png`) stay in the scratchpad per the no-images-in-repo rule.
