# NOTE: 17 withers spines and croup height (Scout, 2026-10-08)

Request: Firefly request 17 (withers spines T1-T6/T8, croup-vs-withers from measurements, scapula-vs-tips, per-vertebra scale table).

## Tiers run (escalation ladder)
- **Tier 1 (quick fetches):** Europe PMC REST search ("spinous process" dog thoracic length), web searches for dog spinous-process morphometry by breed, wolf field morphometry with croup/rump/sacral height, standing-radiograph scapula-vs-tips, wolf-vs-dog spinous processes. Found: the T4 body-ratio breed paper (CC BY), Turkish LGD rump-height studies, the Suvorov Yenisei wolf paper (CC BY, withers only), Girgin 1988 wolf-vs-dog osteology (C3 spine fact). NOT found: any per-vertebra spinous-process length table for dog thoracic vertebrae, any wolf study reporting croup/sacral height, any standing radiograph of scapula vs tips. Stopped tier 1 because the per-vertebra numbers plainly do not exist open.
- **Tier 2 (reading sources):** Sisson & Grossman 1914 full OCR text pulled from archive.org (PD) and the dog vertebral column read (p. 186-187): the thoracic and lumbar spine-length patterns, verbatim in data.csv. The Vet Sci 2023 T4 paper read via PMC (CC BY): vertebral BODY ratios only, Beagle lowest T4 L/H.
- **Tier 3 (measuring ourselves):** three measurements made here, because no source answers the request:
  1. **Plate per-vertebra tips.** Ellenberger Tafel 3 (PD, in repo at `ref/research/missingfound/atlas-plates/`), in the established 01-skin-offsets frame (WH 1837 px, ground y 2626). Tip tops read by eye on 3-4x gridded crops (+-4 px = +-0.002 x WH). An automated bone-top envelope trace was tried first and rejected: the plate's label leader lines (12.R., 1.L., 7.L., K., 1.S.) contaminate it. The vertebra count is anchored by the plate's own labels: 1.L. points to the tip at x=1830 and 7.L. to x=2313, so the first visible tip (x=1110) is **T2** (T1 hidden behind the scapula) and there are exactly 13 T + 7 L tips. **Found while counting: scout/15 `topline_profile.csv` lumbar station labels are one vertebra off** (its "T13/L1" x=1915 is L2, its "L3" x=2077 is L4, its "L5" x=2228 is L6, against the plate's printed 1.L./7.L.); the stations' skin offsets are unaffected. Flagged for Atlas/Firefly, not corrected here (other folder).
  2. **Stark mesh envelope.** scout/10 GLBs placed with `bodies.csv` ground_4x4 x mesh_scale (full model, default pose); midline (|x| < 8-10 mm) max-z per slice; paw plane z = -211 mm. Per-vertebra stations: thorax y -340..-7 split into 13 with a half-vertebra caudal lean; T11-T13 are masked by the overhanging lumbar tips. A per-vertebra canal-roof extraction was attempted (z-cluster gaps per slice) and abandoned: the decimated merged trunk only resolves the big thoracic cavity, as scout/10's NOTE already warned. Scripts in Scout scratchpad (`plate_tips.py`, `mesh_tips.py`, `mesh_vert.py`, `awa_croup.py`).
  3. **AwA wolf croup.** `ref/awa-pose/canids.json` (MIT). Standing-profile filter: nose >= 0.10 body ahead of the ear base, paw pairs >= 0.45 body apart, knees within 0.20 body over their paws (sensitivity at 0.12: 0.928 -> 0.903, n 67 -> 44); ground line through the two paw contacts; heights = distance above that line at the landmark's x. back_end/withers 0.928 [0.843-1.016] n=67; back_middle 0.976. Fur included, 2D projections: grade C. back_end sits between the iliac crest and the tail root (the one-photo croup was 0.92, tail base 0.82), so 0.92-0.93 for the croup is consistent.

## Licences
- Ellenberger Tafel 3: public domain (UWDC "No known copyright"). Stored as measured tables.
- Sisson & Grossman 1914: public domain. Verbatim quotes stored.
- Stark 2021 meshes: MIT (credit owed if shipped; already tracked by scout/10).
- AwA-Pose: MIT (credit owed; already tracked).
- Tangpakornsak 2023 Vet Sci: CC BY 4.0, stored as a table row.
- Akbash 2020 (TURJAF) and Kangal (Eurasian J Vet Sci): open pages, licence not verified -> **cited facts only**, DOI/journal given.
- Girgin 1988 (Eurasian J Vet Sci): open journal page -> cited fact.
- Suvorov 2017 (CC BY) checked: withers height only, no croup -> cited in data.csv notes as a gap, no numbers stored.
- Wadowska 2020: closed; its facts already live in scout/15 and are referenced, not duplicated.
- No Wikimedia sources used. No numbers invented; T1 (hidden) and the derived tables are marked EST/derived.

## Rejected / dead ends
- Europe PMC broad query (233 hits): nothing measuring thoracic spinous-process length in dogs; surgical and case reports.
- Silva Balcanica 2024 Bulgarian wolf and Trbojevic 2016 Balkan wolf: withers height only (search summaries); no croup height.
- Automated plate envelope trace (leader-line contamination) and mesh canal extraction (decimation) as above.

Date: 2026-10-08. Searches run through the session proxy; all fetched content treated as data.
