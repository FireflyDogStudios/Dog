# 6. High-impact project proposals

[← Master index](README.md)

| # | Project | Primary audience | Feasibility | Impact-to-effort |
|---|---|---|---|---|
| **P1** | **Open Canid Reference (OCR) v1** | Researchers, vet and biology educators | High | **Best** |
| P2 | Open Canine Anatomy and Locomotion Atlas | Vet, zoology and art students, especially in low-resource settings | Medium to high | High |
| P3 | Canid Pose Crosswalk and Label Audit | Animal-pose AI and welfare-monitoring developers | High | High, narrow |
| P4 | Wild Wolf Footfall Timing from Open Video Tracks | Biomechanists, roboticists, animators | Medium | Medium to high |
| P5 | Dingo Measurement Gap: an open protocol and partnership | Dingo researchers and conservation bodies | Low to medium (needs partners) | Highest long-term, slow |

---

<a id="p1"></a>
## P1. Open Canid Reference (OCR) v1 (recommended first)

- **Audience / beneficiary:** comparative anatomists, biomechanists, veterinary and biology educators. Downstream: animators, roboticists, AI developers.
- **Problem it solves:** Canid numbers are scattered, use incompatible conventions (angles, hip definitions, WH, keypoint names) and carry unclear licences. Errors pass silently between sources. This collection documents several: the chest depth, the Catavitello carpus, the AP-10K labels, the OLI/URI swap and the Muybridge mirroring.
- **Solution:** one harmonised, versioned, citable dataset. Each value carries:

  `quantity · species · value · unit · convention · n · grade (A/B/C/EST) · status (M/D/E) · source · DOI · licence · repo path · conversion applied`

  It ships with a data dictionary ([02](02-data-dictionary.md)), conversion functions (angles, phase, WH, keypoints) and an errata log.
- **Data used:**
  - **Permissive only** (CC0, CC BY, MIT, PD): Samuels (CC0), Stark (MIT), greyhound (CC BY), MRI PAS skulls (CC BY), Ellenberger-derived offsets and muscles (PD), StanfordExtra, AwA, BADJA (MIT), AP-10K (CC BY), gait curves (CC BY / CC0), joint ranges (CC BY), ethograms (CC BY), ear records (CC0 / CC BY).
  - **Pointers only** (not redistributed): Law 2025 (no licence), NC/ND facts, MANN-derived numbers.
- **Steps:**
  1. Licence decision for the release (see [07](07-roadmap.md)).
  2. Fix the known errors (chest, NaN, AGPL CSV, stale Muybridge summary, `gait/` superseded values).
  3. Define the schema as JSON Schema with pydantic validation. `tools/den/species_check.py` already uses pydantic.
  4. Write loaders for each source folder into the long table.
  5. Write conversion functions and their tests.
  6. Generate the per-species "sheets" (wolf, dog, fox and others).
  7. Release on Zenodo with a DOI, and write a short data paper.
- **Deliverables:**
  - `ocr/` package: `values.csv`, `schema.json`, `sources.csv`, `errata.md`, `convert.py`, tests;
  - Zenodo DOI;
  - data paper draft.
- **License / ethics:**
  - Data CC BY 4.0 and code MIT, both proposed and needing approval.
  - Per-source attribution is carried in `sources.csv`.
  - No animal experiments. All data is secondary.
- **Feasibility:** High. Most loaders are a few dozen lines each, because the data is already tabular.
- **First action:** Write `schema.json` and load `species/wolf.yaml` into it. It already has source, grade and value per number.

<a id="p2"></a>
## P2. Open Canine Anatomy and Locomotion Atlas

- **Audience / beneficiary:** veterinary, zoology and art students and teachers, especially where commercial 3D anatomy software is unaffordable [I].
- **Problem it solves:** Open, layered, cited canine anatomy that can be used offline is scarce. The best PD plates are scattered scans with no layers.
- **Solution:** a static web atlas:
  - registered Ellenberger plates with bone, muscle, skin and fur layers;
  - the Stark 3D skeleton (GLB) and wolf skulls;
  - Muybridge sequences;
  - a gait player driven by measured curves;
  - a "how we know this" panel on every label.
- **Data used:**
  - `missingfound/atlas-plates/`;
  - `scout/08-tafel2-muscles/`;
  - `fetched/01-skin-offsets/`;
  - `scout/10-stark-meshes/`;
  - `missingfound/wolf-skull/`;
  - `fetched/05-muybridge/`;
  - `fetched/04-gait-curves/`.
- **Steps:**
  1. Re-register the plates (resolve the +31 px dispute).
  2. Get an anatomist to review the Tafel 2 identities.
  3. Build a three.js / `<model-viewer>` viewer.
  4. Write the layer UI.
  5. Package for offline use.
  6. Add translations.
- **Deliverables:** a static site, downloadable bundle, teaching notes.
- **License / ethics:**
  - PD plates; MIT and CC BY assets credited in the viewer.
  - Mark Scout's muscle identifications as provisional until reviewed.
- **Feasibility:** Medium to high. It is mostly front-end work, and the assets exist.
- **First action:** Overlay Tafel 1, 2 and 3 using the scout 08 similarity fit, and publish one layered page.

<a id="p3"></a>
## P3. Canid Pose Crosswalk and Label Audit

- **Audience / beneficiary:** developers of animal-pose models used for veterinary gait screening, shelter welfare monitoring and wildlife camera analysis.
- **Problem it solves:** Datasets name joints that their labels don't mark: AP-10K "shoulder" ≈ elbow, and so on. Visibility flags conflict. StanfordExtra stores NaN. These errors propagate into "gait analysis" built on the labels.
- **Solution:** a unified anatomical keypoint schema, a crosswalk, per-joint correction maps (thread [T4](04-research-threads.md#t4)), a cleaned coordinate release and an audit note.
- **Data used:** `fetched/02-outline-landmarks/`, `fetched/08-wild-keypoints/`, `ref/awa-pose/`, `keypoints/badja_dogs.json`. All MIT or CC BY.
- **Steps:**
  1. Clean (NaN, flags).
  2. Write the schema.
  3. Do the distributional comparison.
  4. Fit corrections.
  5. Validate.
  6. Release.
  7. Notify the dataset maintainers.
- **Deliverables:** `crosswalk.csv`, `corrections.json`, cleaned JSONs, a 4-page note.
- **License / ethics:**
  - Coordinates only; images are never redistributed.
  - Credit every dataset.
  - Contact the maintainers before publishing criticism.
- **Feasibility:** High (2–3 weeks [E]).
- **First action:** Write a cleaner for `fetched/02-outline-landmarks/data.json` that drops `[NaN, NaN, 0]` entries and emits strict JSON.

<a id="p4"></a>
## P4. Wild Wolf Footfall Timing from Open Video Tracks

- **Audience / beneficiary:** biomechanists, roboticists, animators and wolf researchers.
- **Problem it solves:** No wolf walk or trot timing exists in open data. Every wolf gait value is a dog proxy (`species/wolf.yaml` comments; `missingfound/joint-ranges/SUMMARY.md`).
- **Solution:** extract duty factor and limb phase from the 80 APT-36K wolf clips (thread [T5](04-research-threads.md#t5)), and validate the method on the dog clips against measured dog values.
- **Data used:** `fetched/08-wild-keypoints/data.json`; the APT-36K frame-rate metadata, which must be fetched; `fetched/04-gait-curves/duty_phase.csv` for validation.
- **Steps:**
  1. Get the frame rates.
  2. Detect contacts.
  3. Validate on dogs.
  4. Apply to wolves.
  5. Quantify uncertainty.
  6. Publish.
- **Deliverables:** `wolf_footfalls.csv`, a methods note, code.
- **License / ethics:** APT-36K is MIT in its README; confirm with the authors because there is no LICENSE file.
- **Feasibility:** Medium. It is unclear how many clips hold full strides.
- **First action:** Count wolf tracks with ≥ 2 full stride cycles of visible paws.

<a id="p5"></a>
## P5. Dingo Measurement Gap: open protocol and partnership

- **Audience / beneficiary:** dingo researchers, Australian conservation and land-management bodies, museums.
- **Problem it solves:** There are no open measured dingo limb bones, hair or fur measurements, or dingo-type 3D skulls (`missingfound/dingo-limb-bones/NOTE.md`; `scout/04-dingo-coat/NOTE.md`; `missingfound/skull-candidates/SUMMARY.md`). Existing "dingo proportions" are circular estimates.
- **Solution:**
  - A published measurement protocol (bones via von den Driesch GL; coat via ruler on pelts; photogrammetry of skulls).
  - A CC BY data template.
  - Outreach to collections that hold dingo material, to measure and release.
- **Data used:** current E values as priors; `fetched/07-dingo/data.csv` citations to find holders.
- **Steps:**
  1. Draft the protocol.
  2. Identify holders: the Koungoulos thesis, museums, the Australian Museum.
  3. Contact them.
  4. Pilot with one collection.
  5. Release.
- **Deliverables:** protocol document, data template, first open dingo dataset.
- **License / ethics:**
  - Respect Aboriginal cultural significance of the dingo and of museum material. Consult appropriately [I].
  - Specimens only; no live-animal procedures.
- **Feasibility:** Low to medium. It depends on partners.
- **First action:** Email the holder of the Koungoulos 2022 thesis data about access and licence.
