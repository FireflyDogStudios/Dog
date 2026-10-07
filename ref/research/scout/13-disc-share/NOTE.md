# 13 Disc share of the canine spine

Scout, 2026-10-07, for `docs/claude/DEN-SCOUT-REQUEST-DISCS-2026-10-07.md` (approval A-004). The 51 GB Czeibert CT fallback was **not** approved and was not downloaded.

## Files
- `data.csv`: 86 rows. Columns: `region, level, quantity, value, unit, n, breed, chondro, method, source, doi, licence, use, confidence, notes`.
  - `use` values:
    - `table`: a CC BY or MIT source, stored as a table;
    - `single cited fact`: from an NC-ND paper, a few numbers with their DOI;
    - `derived`: our own arithmetic on stored numbers;
    - `estimate`: a transfer between species or sources (grade EST);
    - `do not use`: a known artefact, kept so nobody measures it again.
- `SUMMARY.md`: the status, a share table by region, the recommendation, the 8% question and the gaps.

## Sources used
| Source | What it gives | Licence | Stored as |
|---|---|---|---|
| Düver et al. 2018, Front Vet Sci 5:248, doi 10.3389/fvets.2018.00248 | Cervical disc length / vertebral body length (MRI) for 5 breeds, and by level C2-C3..C6-C7 | CC BY 4.0 | table |
| De Decker et al. 2012, BMC Vet Res 8:126, doi 10.1186/1746-6148-8-126 | Cervical disc width in mm (MRI, widest point), Dobermans and English Foxhounds, by level | CC BY 2.0 | table |
| Gavira et al. 2025, Osteoarthritis Cartilage Open 7:100557, doi 10.1016/j.ocarto.2024.100557 | Lumbar CT of 20 Labrador/Golden Retrievers: disc 7.1 mm, vertebral body lengths 23.1 mm (ventral) and 25.3 mm (dorsal), total lumbar length 217.5 mm | CC BY-NC-ND 4.0 | 4 cited facts, plus 1 derived share |
| Law et al. 2025 IOB raw data (github chrisjlaw) | Wolf centrum lengths, n = 2 | no licence file | derived means only, as before |
| Stark et al. 2021 dog model meshes (`../10-stark-meshes/`) | Our own measurement of body lengths and the gaps between bodies, by level | MIT model files | table (grade C) |

Table 1 of Gavira 2025 is an image. It was read from the PMC figure (`/articles/instance/11754510/bin/fx1.jpg`), not from text.

## Searches (Europe PMC REST, open access first; full text via `/PMC{id}/fullTextXML`)
- **Brief terms, run as Europe PMC queries:**
  - disc height with vertebral body length, "disc height index" and "disc height ratio";
  - "intervertebral disc space" with width or height, radiograph or CT, lumbar and normal;
  - "vertebral body length" with CT and morphometry;
  - "disk width" or "disc width" with "vertebral body";
  - disc height with MRI and Pfirrmann;
  - wolf, coyote, dingo or *Canis lupus* with vertebra* and measurement or morphometr*;
  - wolf, coyote, dingo or *Canis lupus* with "intervertebral disc", "intervertebral disk" or "intervertebral space";
  - "intervertebral disk width" in the title;
  - Doberman or Great Dane, cervical, MRI or CT, with disc width or body length;
  - author da Costa RC with morphometry;
  - lumbar morphometry with CT or radiograph and length;
  - lumbosacral or L7-S1 disc height;
  - finite element models of the canine spine;
  - micro-CT with disc height;
  - the thoracic disc with thickness, height or width;
  - disc length as a percentage of vertebral column length;
  - comparative or allometric disc height across carnivorans or mammals.
- **Full texts opened and scanned for disc numbers:**
  - **Used:** PMC6182047 (Düver), PMC3411421 (De Decker), PMC11754510 (Gavira).
  - **Opened, no usable numbers:**
    - PMC12301062: Beagle L6-L7 finite element model; the disc was designed, not measured;
    - PMC10751973: disc height index relative to adjacent body height only;
    - PMC5650136: Beagle disc replacement; disc height index as % of controls only;
    - PMC11435567: cats, Th1-S1 disc widths, in figures only (not a canid);
    - PMC12767475: red fox cervical CT, vertebral body lengths only, no discs;
    - others with no numbers: PMC12810450, PMC10985344, PMC11611492, PMC11631885, PMC11022603, PMC13098911, PMC10899331, PMC5089627, PMC8224572, PMC3722130, PMC10705131, PMC6823970, PMC12539129, PMC11281609;
    - PMC9656418: wolf spinal fractures, a case series with no measurements.
- **Closed papers, known but not used for numbers:**
  - da Costa et al. 2006, AJVR 67:1601: Doberman MRI morphometry with disc width;
  - De Decker et al. 2011, AJVR 72:1496;
  - Martin-Vaquero et al. 2014, Vet J (Great Danes, MRI);
  - Bray & Burbidge 1998, JAAHA 34:55/135.

  Whatever "discs are x% of column length" statement may be in textbooks or Bray & Burbidge was not verified, so it is not used.
- **Law et al. 2021 Am Nat and 2025 IOB:** headers checked (`data/data.csv`, `rawdata.csv`). Both hold centrum lengths (`*_CL`) and summed body lengths, but **no disc or intervertebral spacing**.
- **Not found:** any measured wolf, coyote or dingo disc value. Thoracic disc thickness in non-chondrodystrophic dogs. Normal radiographic disc *space* values with numbers.
- **Hosts:**
  - **Europe PMC:** a few search calls returned empty bodies; each worked on retry.
  - **europepmc.org/articles/.../bin:** 403, so the PMC figure URL was used.
  - **GitHub API:** blocked for this repo, so raw.githubusercontent.com was used.
  - **Not used:** Wikimedia. MDPI was not fetched directly; its papers were read through Europe PMC.

## Stark mesh measurement (fallback, grade C)
- **Meshes:**
  - `cervix.glb` holds C1-C7;
  - `thorax.glb` holds T1-T13 with the ribs and sternebrae;
  - `abdomen.glb` holds L1-L7.

  Each is one connected component, so the vertebrae were separated by **sagittal sections** (plane normal = left-right X), not by component.
- **True midline:** found from transverse sections:
  - cervix x ~ 8-10 mm;
  - thorax x ~ 6 mm;
  - abdomen x ~ 2-6 mm.

  An early thorax pass at x = -2..0 was about 7 mm off the midline. It cut the lateral body rims and read gaps of about 4 mm. It was discarded.
- **Body polygons:** picked near a hand-placed row line. A body midline was made from the mid-height of the polygons, moving-averaged over 15 mm. Along that midline (and parallel lines ±0.75 and ±1.5 mm), stretches inside bone are bodies and stretches outside are gaps (drop-outs under 2 mm ignored).
- **Kept runs:** only those that found exactly 6 (C2-C7), 13 (T1-T13) or 7 (L1-L7) bodies. Medians and IQR are taken over these runs: cervical 27 runs, thoracic 18, lumbar 34.
- **Checked by eye:**
  - overlays saved in the scratchpad (`/tmp/claude-0/disc/ov_*.png`, `junctions.png`, `junc3.png`): 13 rectangular thoracic bodies, 7 lumbar, 6 cervical, each gap visible;
  - a centroid-to-centroid chord method gave the same cervical and lumbar gaps within about 0.3 mm.
- **Junction gaps:** C7-T1, T13-L1 and L7-S1 cross mesh boundaries, so they need the assembled default pose (`full_default_pose_ground_4x4_mm`). C7-T1 overlaps (0.5 mm) and T13-L1 opens to 14 mm: both are **pose artefacts**, marked "do not use". L7-S1, at 3.1 mm, looks anatomical but rests on joint placement.
- **Caveats:**
  - one dog, a Beagle (often listed as chondrodystrophic), stretched ×1.25 in the trunk; the ratios do not change with uniform scale;
  - a bone surface from CT, smoothed and decimated, tends to **narrow** gaps, so these are likely lower bounds.
- **Tools:** Python with trimesh 5.1 (MIT), shapely 2.1 (BSD) and numpy. The scripts are kept outside the repo in the scratchpad: `polys.py`, `measure.py`, `profile2.py`, `agg.py`, `thor.py`, `assemble.py`, `junc3.py`, `whatif.py`, `writecsv.py`.

## The what-if on the wolf skeleton
- `whatif.py` imports `tools/den/skeleton.py` read-only. It calls `build()` on an in-memory copy of `species/wolf.yaml`, with each region's centra-only length multiplied by a disc factor. The sacrum's absolute length is held fixed.
- No repo file was changed. The results are in `SUMMARY.md`.

## Rules followed
- **Stored as tables:** only CC BY and MIT numbers. The NC-ND paper (Gavira) appears as cited facts with its DOI. Law appears as derived means.
- **Untrusted content:** all fetched text was treated as data. No instructions in fetched content were followed.
- **No downloads:** the Czeibert CT set was not downloaded.
- **No git:** no git commands were run, and `docs/log/LOG.md` was not edited.
