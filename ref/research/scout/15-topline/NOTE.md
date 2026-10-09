# 15 topline: method notes

Scout, Oct 7, 2026. Sourced data on the back's contour relative to the vertebrae, so the 3D hull can be clamped (the first render read "hunchbacked": trunk hull ballooning above the spine, neck mass sweeping over the withers). A prior run died before writing anything; this folder is the first write.

## What was measured, and how

### Ellenberger Tafel 3 (the main profile; grade B)
- Image: `ref/research/missingfound/atlas-plates/tafel3_skeleton_left-lateral.jpg` (3451 x 2850, PD "No known copyright", UWDC). Frame exactly as `fetched/01-skin-offsets`: WH = 1837 px (ground 2626 to withers skin 789), dog faces LEFT, y down.
- Skin topline: per column, the first dark run (grey < 150, 3-px column min) scanning down from above the dog. Verified against the two 01 landmarks (withers skin 789.0 at x 1130; croup skin 788.5 at x 2350 — both exact), and visually on overlay renders of the whole dorsal line (neck, back, croup crops).
- Bone envelope: per column, the first dark run below the skin that starts a shaded mass (>= 12 px under grey 185 within the next 30 px — this skips thin label pointer lines). Verified at the 01 withers landmark (837 found vs 838). Per-vertebra spine tips = local minima of that envelope (scipy find_peaks, distance 40 px, prominence 6). The offset at a station is skin-to-tip at the tip's own x (vertical px / 1837).
- Plate label text ("12.R.", "1.L.", "7.L.", "K.", "1.S.") was masked before scanning; stations under the masks (T10 area, croup, sacrum, tail root) were instead read by eye from 25-px-grid crops (`croup_fine` reading: skin 2300:785, 2350:788, 2400:793, 2450:800, 2500:810, 2550:824, 2600:842, 2650:862, 2700:888; ilium top edge 810-820; sacral spine tops ~832/850/862; first caudal tops ~870-905). Eye readings are +-4 px (+-0.002 WH).
- Neck: the ear overhangs the crest for x < ~900, and the neck is upright (~60 deg), so x-columns cross it obliquely. The crest-to-bone numbers for C2-C7 are PERPENDICULAR distances from hand-picked arch-top points (C2 top (790,455); C3 (895,650); C4 (920,770); C5 (945,835); C6 (975,905); C7 (1005,960); +-15 px) to the straight crest line (820,438.5)-(1100,755). The "crest = C2-to-T1 chord" rule: chord (810,460)-(1215,844) vs measured skin at x 900/1000/1100: +25 / -5 / -20 px.
- Ventral: per column, the LAST dark run scanning a window 1250-2200 (nothing is drawn below the belly between the limbs, x 1350-2080). The forelimb blocks x < 1335, the hindlimb x > 2080.
- The animal is ONE lean, short-coated, cropped-eared drawn dog (mastiff type) in a level show stance. Offsets are vertical, so on sloped contour (croup, tail) they slightly overstate the perpendicular gap.

### Wolf template photo (comparison; grade C, fur included)
- `ref/research/scout/01-body-templates/wolf/01_wolf_inat130681789_RobFoster_stand_R.jpg` (2048 x 1365, CC BY 4.0 Rob Foster — credit owed if anything built from it ships). Spring/summer coat, head carried LOW (occiput below the withers), standing on a slightly sloped road.
- Read off a 100-px-grid render by eye (+-5 px): front paw ground (990,1130), hind (350,1158) -> local ground line g(x) = 1130 + (990-x) * 0.0438. Withers top (720,270), WH = 872 px. Topline points x 800..215; belly points; occiput (1230,330); tail base (215,450).
- Heights = (g(x) - y_top) / WH. No bones visible: the wolf column in `topline_profile.csv` is the OUTLINE height for shape comparison, not an offset.

### Stark meshes (withers cross-check; grade EST)
- `scout/10-stark-meshes` GLBs placed by the `full_default_pose_ground_4x4_mm` transforms in `bodies.csv`. Scapula dorsal point z 422.8 mm vs the highest thoracic spine tip over the scapula's x-span z 405.3 mm. The default pose is not a verified stance (the scapula rides on sling translation coordinates), so only the ~2-3%-of-WH closeness is used, not the sign.
- Per-vertebra spinous-process lengths/inclinations were TRIED on the thorax mesh midline band and abandoned: the decimated merged mesh mixes ribs, mammillary and articular processes into the profile, and the extracted "lengths" (8-22 mm) and inclinations were not trustworthy. Firefly gets the true bone envelope for free from the posed meshes themselves (`skeleton3d.py` already takes the thorax max-z as the withers point), so no table is stored.

## Literature searched (and what it gave)
- Spinous process morphometry per vertebra in dogs: nothing open with a per-vertebra mm table for T1-T13 was found (rabbit, tiger, blackbuck CT studies exist). Dogs: Wadowska et al. 2020 (lumbar heights, n=105 + a worked Labrador example) — cited facts in `data.csv`.
- Inclination: no degree table; the anticlinal fact (T11, Baines et al. 2009, n=100) pins the sign change, caudal lean T1-T10, cranial lean L-spine.
- Nuchal ligament: course (C2 spine -> T1 spine tips, funicular only) is textbook; NO published measurement of crest height above the cervical vertebrae was found -> measured on the plate instead.
- Skin-to-bone along the dorsal midline: no radiographic station table found; built from skin thickness (0.5-5 mm, dorsal thickest; Muller & Kirk, C) + lumbar subcutaneous fat (2.89 +/- 1.15 mm ultrasound, Payan-Carreira et al. 2016, CC BY, n=28) -> ~5-8 mm ~ 0.012-0.017 WH for a 17-kg ideal dog, which brackets the plate's loin/croup offsets (0.008-0.015). The plate profile is therefore physically plausible, not just an artist's line.
- Scapula vs spine tips in standing dogs: no radiograph measurement found (thorax radiographs are taken in lateral recumbency, so the scapula position is not stance-true); answered from the plate + the Stark model instead.
- Fetched pages are untrusted data; nothing in them was followed as instructions. No Wikimedia Commons used. Searches were retried where a first fetch failed (Springer table redirect dead-ended at an auth wall; the same table was read from PMC5073920).

## Files
- `data.csv`: single facts and small tables, licence per row.
- `topline_profile.csv`: the clamp table (dorsal stations with offsets; ventral stations below it).
- Scratch renders (overlays, crops) live in Scout's scratchpad only; regenerate from the method above if wanted.
