# 2. Master inventory

[← Master index](README.md)

## Conventions

- **Paths.** Relative to branch `claude/new-session-l3ubx0`; shorthand is defined in the master index.
- **Labels.** M = measured, D = derived, E = estimate.
- **Grades.** A, B, C and EST follow `docs/claude/DEN-REFERENCE-GUIDE.md` §0.
- **Licences.** These are as stated in each folder's NOTE or LICENSE file; see [06 Licensing](06-gaps-and-risks.md#licensing-problems) for the risks.

**Correction to the master inventory.** `docs/claude/DEN-MATERIALS.md` §1 and §8 say the Stark 3D meshes are "still in Drive zips". That is out of date: 24 decimated GLB bodies are in `scout/10-stark-meshes/meshes/` (`scout/10-stark-meshes/NOTE.md`). Its "70 bone meshes" is also misleading, because only 31 of the OBJs are used and they cover 24 bodies (same NOTE).

---

## 2.1 Bones and skeletons

| Name | Format | Path | Licence / provenance | Coverage | Accuracy / confidence | Known gaps | How to use |
|---|---|---|---|---|---|---|---|
| Law canid skeleton tables | JSON, CSV, MD | `ref/research/skeleton/species_numbers.json`, `derived_skeleton_ratios.csv`, `REPORT.md`, `DATA-NOTE.txt` | Law et al. 2025 *Integr Org Biol* 7:obaf001; Law 2021 *Am Nat* doi:10.1086/715588. **No licence file, "please cite"** (`DATA-NOTE.txt`). Only means are stored | 18 species with bone means (16 canids + 2 hyenas); 24 keys in the JSON. n = 1–3 males per species; wolf n = 2 | Bone means M (species means computed by Firefly), B. Spine segment lengths and head length are D, "low" | No dingo, Carolina Dog or domestic bones. REPORT says "22 species", which is wrong (18 with bones) | Bone ratios per species. Check the licence before shipping derived tables (`DEN-REFERENCE-GUIDE.md` §15) |
| Samuels 2013 limb dataset | TSV, CSV | `fetched/06-limb-indices/samuels2013_full.txt`, `data.csv` | **CC0 1.0** (Dryad API), doi:10.5061/dryad.77tm4; *J Morphol* 274:121 | 150 taxa (115 living, 35 fossil). Canid subset: 37 rows (20 living canids, 4 hyaenids, 13 fossil canids) | M taxon means; per-taxon n not stated | **OLI/URI headers appear swapped**; dhole indices inconsistent, so use `calc_*` (`NOTE.md`). No dingo | The safest bone-ratio source to redistribute |
| Dingo bone estimates | CSV | `missingfound/dingo-limb-bones/data.csv` (82 rows); `fetched/07-dingo/data.csv` (37 rows) | Harcourt equations verified from CC BY papers; shoulder heights from Koungoulos 2024 (**CC BY-NC-ND, facts only**); CBL from Crowther 2014 (no open licence) | Dingo SH 542.2 mm (n = 117); humerus 166, radius 164, femur 177, tibia 182.5 mm | **E, ±5 %**. The SH values are themselves reconstructed from bones (`fetched/07-dingo/NOTE.md`) | Circular: ratios are "Harcourt reference-dog proportions" (`missingfound/dingo-limb-bones/NOTE.md`). No MC3 or MT3 | Placeholder sizes only; never cite them as dingo proportions |
| Stark dog model (2D extraction) | `.osim`, CSV, JSON | `fetched/03-dog-model/stark_*` | **MIT**, © 2021 FSU Jena, H. Stark (`LICENSE-stark.txt`); *Sci Rep* 11:11335, doi:10.1038/s41598-021-90058-0 | One Beagle ("Simon", 13.81 kg, CT). A "Shepherd" full model = the Beagle stretched ×1.66 in the limbs and ×1.25 in the trunk | Geometry M (CT); joint centres D by FK at the default pose; landmarks E | Default pose is not a stance (carpus 217°). The full model "does not initialise" (bad `min_control`, `DEN-REFERENCE-GUIDE.md` §13) | Bone shapes in side view, segment lengths, landmark positions |
| Stark 3D bone meshes | GLB (mm), CSV | `scout/10-stark-meshes/meshes/*.glb` (24), `bodies.csv`, two `*_preview.glb` | MIT (same licence file, checked with diff) | 24 bodies: trunk, 2 forelimbs, 2 hindlimbs, tail. 680k faces (decimated from 2.05M) | M (CT), decimated | Neck, head, ears and tail are thin. Same stretched-Beagle caveat | 3D skeleton assembly via the `bodies.csv` 4×4 transforms |
| Greyhound hindlimb model | `.osim`, CSV | `fetched/03-dog-model/greyhound_*` | **CC BY 4.0**, Ellis, Rankin & Hutchinson 2018, doi:10.6084/m9.figshare.7240538.v2 | One greyhound left hindlimb; 29 Millard muscles; 19.36 kg | M (CT); metatarsus and toes E | No forelimb; ranges are clamps | Hind-leg muscle and joint checks |
| MuJoCo dog | in the `dm_control` package (installed) | not in the repo | Apache-2.0 (`tools/den/requirements-heavy.txt`) | 62 bodies, 74 joints, 38 actuators (`ref/research/tools/REPORT.md`) | Pharaoh Dog proportions, simplified (`DEN-REFERENCE-GUIDE.md` §13) | Not real proportions | Physics sanity checks |
| Two wolf skulls (3D) | GLB (mm), JSON | `missingfound/wolf-skull/wolf_170753_*`, `wolf_170555_*`, `data.json` | **CC BY 4.0, citation required**: MRI PAS Open Forest Data, doi:10.48370/OFD/LVT9AC and doi:10.48370/OFD/LNRMXW | Wild male, CBL 244.3 mm; reserve female, CBL 226.2 mm. Skull + mandible each | Mesh M; landmarks B (mesh extremes) or E (by eye, ±2–3 mm); gape is a model | Female's closed pose is fitted; lower canines broken | Head shape, jaw hinge, gape limits |
| Skull candidates | CSV, MD | `missingfound/skull-candidates/candidates.csv` (408 rows: 190 usable), `collections.csv`, `AUTOMATION.md` | Metadata only; licence rule PD, CC0 or CC BY | Pointers, e.g. Czeibert 2024 HRCT (CC0, 51.4 GB; 399 dogs, 3 wolves); Meloro & Tamagnini 2021 (CC0, 188 Carnivora) | n/a | **Nothing downloaded.** No usable dingo-type skull | Queue for the skull-shape threads |
| Built wolf skeleton | YAML → JSON, SVG, PNG | `species/wolf.yaml`; `species/build/wolf.skeleton.*` | Repo's own work (unlicensed); inputs as cited | One wolf: bone withers height 707.2 mm vs 750 mm wanted | Draft; 23 A, 56 B, 13 C, 2 EST | **Chest depth too deep** (0.54, a misapplied photo ratio); body about 8 % short of the photos (`DEN-REFERENCE-GUIDE.md`) | The reference build; fix before reuse |
| Fact-check answers | JSON, MD | `ref/research/factcheck/answers.json`, `REPORT.md` | Notes; "every literature value from search snippets" | 13 open questions (layback, standing angles, croup, gape, tail…) | C mostly | Unverified against full texts | Starting values; re-verify |

## 2.2 Muscles and skin

| Name | Format | Path | Licence / provenance | Coverage | Accuracy / confidence | Known gaps | How to use |
|---|---|---|---|---|---|---|---|
| Stark muscle lines | CSV (472 path-point rows) | `fetched/03-dog-model/stark_muscles.csv` | MIT (Stark) | 158 muscles (79 per side, full model) + 43 (Beagle left forelimb); Fmax, L_opt, tendon slack, pennation | Published parameters; global coordinates D | **Lines, not volumes**. Wrapping not computed. Paper says 134 muscles, file has 158. **Four trunk muscles have Fmax = 1.0 N placeholders** (iliocostalis, longissimus, quadratus lumborum, sacrocaudalis; found by my subagent, undocumented) | Bulge placement; Hill-volume estimates (excluding the placeholders) |
| Tafel 2 surface muscles | JPG, JSON, PNG | `scout/08-tafel2-muscles/` | Ellenberger et al., ca. 1911–25, UWDC "No known copyright" (PD) | 25 muscle polygons on one lean Great Dane-type dog; bulge per muscle as a fraction of WH | B. Clear ±3 px, inferred ±10–20 px; 5 clear, 9 mixed, 11 inferred | The plate key is Scout's reading; "h" is ambiguous | Silhouette lobes and bulge sizes |
| Skin-over-bone offsets | JSON | `fetched/01-skin-offsets/data.json` | Same atlas (Tafel 3), PD. Münch's death year not verified | 17 landmarks, offset as a fraction of WH | **M** on one drawing; ±0.002–0.005 WH | One short-coated dog; nothing between landmarks | Skin field anchors |
| Atlas plates 1 and 3 | JPG 3451×2850 | `missingfound/atlas-plates/` | PD (UWDC NKC) | Exterior view, and skeleton inside skin, same dog | Original scans | A Great Dane type, not a wolf. "+31 px" registration is disputed by scout 08 (scale 1.008, rotation −0.63°) | Registered skin-and-bone template |
| Head soft tissue | CSV | `scout/07-head-soft-tissue/data.csv` | Tafel 3 (PD) + AwA (MIT) + Packer 2015 (CC BY) + facts only from Li 2025 (CC BY-NC-ND) | Skin depths at 7 head stations, as a fraction of CBL; eye opening; lip commissure | Plate depths M (B); eye E for wolf | No CT or MRI face depths for any canid | Head outline over the wolf skull |

## 2.3 Fur, colour and surface

| Name | Format | Path | Licence / provenance | Coverage | Accuracy / confidence | Known gaps | How to use |
|---|---|---|---|---|---|---|---|
| Wolf coat thickness | CSV (45 rows) | `scout/03-wolf-coat/data.csv` | Facts only: Scholander 1950 (scan CC BY-NC), Heptner & Naumov (in copyright) | Hair lengths by region and season; fur depth 54–65 mm on winter pelts | Only the depth anchor is M; **about 10 of 12 offset rows are E** | No summer depth. Mech 1974 was blocked, but **it is now in Drive** (see Missing / Blocked) | Coat standoff field, winter and summer |
| Dingo / Carolina Dog coat | CSV (12 rows) | `scout/04-dingo-coat/data.csv` | UKC standard ©; PMC12491747 (CC BY) | Qualitative plus offsets | **All E** | No measured dingo hair anywhere online | Placeholder only |
| Tail | CSV | `scout/05-tail/data.csv`, `data_caudal_stark.csv` | Stark mesh (MIT); NPS photo (PD); Giesen photo (CC BY 2.0) | 18–19 caudal vertebra sizes; brush width profile for wolf and dingo; carriage | Vertebrae M (one dog, B); brush E (one photo each) | Brush base not measurable; no wild caudal data | Tail shape and carriage |
| Coat colour palettes | JSON | `fetched/10-coat-palettes/data.json` | Colours as facts from 16 photos (CC BY 2.0/4.0, PD, CC0); photos not stored | Wolf 4, dingo 7, Carolina Dog 5; 11 body regions | M colour, D summary | **No white balance**; dingo backs span #f8cc92 to #6f4f3b | Pick one photo per coat, not the median (`DEN-REFERENCE-GUIDE.md` §11) |
| Body-building tools survey | CSV | `scout/12-body-tools/tools.csv` (52), `papers.csv` (30), `SUMMARY.md` | Survey; nothing run | Tools, licences and a proposed SDF-based pipeline | Unverified "headless: likely". Three DOIs are from memory | bpy not installed when surveyed | Blueprint for [pipeline 2](03-pipelines.md#p2) |

## 2.4 Real animals (photos, outlines, poses)

| Name | Format | Path | Licence / provenance | Coverage | Accuracy / confidence | Known gaps | How to use |
|---|---|---|---|---|---|---|---|
| Body-template photos and plates | 26 JPGs + CSV | `scout/01-body-templates/{wolf,dingo,carolina-dog}/`, `candidates.csv` | 16 CC BY 4.0 (iNat), 3 CC BY 2.0, 1 PD Mark, 1 CC0, 5 PD plates (Mivart 1890). **Per-photo credit required** | Wolf 14, dingo 7, Carolina Dog 1 genuine + 4 proxy village dogs | Images only; landmarks skipped | Only 6 meet the 1,500 px rule. No licensed true-profile Carolina Dog | Cut-out, warp and check templates |
| Wolf photo template | YAML | `species/templates/wolf_01.yaml` | From Rob Foster's CC BY 4.0 photo | Pixel landmarks with skin and fur offsets | ±10 px by eye | One wolf | Source of the 0.44 chest-depth check |
| StanfordExtra outlines and keypoints | JSON (14.5 MB) | `fetched/02-outline-landmarks/data.json` | **MIT** (relicensed 2 Nov 2024); images not covered or stored | 12,538 dogs, 120 breeds, 24 keypoints, about 63 outline points each; dingo 108, dhole 102, African wild dog 84 | Keypoints M; outlines D (IoU median 0.956) | **15,554 `NaN` tokens** (invalid strict JSON; verified). Dingo and dhole are all in the val split | Silhouette statistics, keypoint ratios |
| AP-10K + APT-36K poses | JSON (3.3 MB) | `fetched/08-wild-keypoints/data.json` | AP-10K CC BY 4.0; APT-36K "MIT" in the README only, no LICENSE file | 7,078 instances: dog 3,404, wolf 1,931, fox 1,743. APT-36K includes **240 tracked video clips** | M | **Labels shifted**: "shoulder" ≈ elbow, "elbow" ≈ carpus, "hip" ≈ stifle, "knee" ≈ hock (`NOTE.md`). No ears, withers or tail tip | Pose ranges; **wild wolf gait timing from the tracks** ([thread T5](04-research-threads.md#t5)) |
| AwA-Pose canids | JSON (1.6 MB) | `ref/awa-pose/canids.json` | MIT © 2021 P. Banik | 2,305 images: wolf 334, GSD 336, collie, dalmatian, chihuahua, fox, raccoon; 35 keypoint names | M | **No brisket point**: its "chest depth" is mid-back to belly, with fur | Body ratios as medians; never trace |
| Keypoint-derived proportions | JSON, CSV | `keypoints/proportions.json`, `stanfordextra_breeds_unitB.csv`, `badja_dogs.json` | MIT in principle, but the **unitB CSV and the StanfordExtra parts were computed from the AGPL-labelled Ultralytics mirror** (`keypoints/NOTE.md`) | 113 breeds; BADJA 218 frames | D | Copyleft taint; no dingo | Regenerate from `fetched/02` before release |
| Muybridge dog plates | 8 JPGs, JSON | `fetched/05-muybridge/`; corrections in `missingfound/walk-footfall-and-muybridge/` | PD (1887) | Walk, trot and gallop; 4 dogs; frame interval known for 2 sequences | Footfalls M by eye; left/right partly assumed | **707 and Maggie A were mirrored**; `summary` and SUMMARY.md are still stale. 704, 705 and 708 unconfirmed | Footfall order and duty factor checks |
| Museum ear records | CSV (500 rows) | `scout/06-ears/ear_records.csv`, `data.csv` | 495 CC0 + 5 CC BY rows; the medians include CC BY-NC records as facts | Wolf 199, golden jackal 186, coyote 102, dog 11, dingo 2 | M (ear notch to tip) | Base width and outline not measured for any wild canid | Ear size; allometry ([T8](04-research-threads.md#t8)) |
| Face and ear behaviour | JSON | `fetched/09-face-and-ear/data.json` | Mostly CC BY; Gallup 2020 yawn CC BY-NC (fact) | Jaw timings, head tilt, gape | A–C | **No ear-rotation or behavioural jaw angles exist** | Animation timing |

## 2.5 Motion and behaviour

| Name | Format | Path | Licence / provenance | Coverage | Accuracy / confidence | Known gaps | How to use |
|---|---|---|---|---|---|---|---|
| Gait curves | CSV (1,946 + 75 + 194 rows) | `fetched/04-gait-curves/curves.csv`, `duty_phase.csv`, `joint_extremes.csv` | CC BY 4.0 (Catavitello 2015, Humphries 2020, Fischer 2018, Miao 2026) + CC0 (Goldner 2018) | Retrievers (walk, trot), 10 Labradors (trot, 3D), Beagle, French Bulldog, Whippet, Malinois; 6 joints, 101 points per stride | M then D; Humphries validated against its S4 Table | **Catavitello carpus and hip are nonstandard**. No gallop; no 3D walk. Processing scripts not in the repo | Reference curves (included angle, % stride) |
| Beagle forelimb walk (3D) | CSV | `fetched/03-dog-model/stark_fore_motion*.csv` | MIT | One Beagle, left forelimb, 10 trials (8 in the mean) | M (IK) | `time_s` is normalised, not real time. MCP about 268° may be an artefact | The only permissive 3D joint-angle data |
| Joint ranges | CSV (145 rows) | `missingfound/joint-ranges/data.csv`, `SUMMARY.md` | 25 sources, mostly CC BY; Inal 2026 NC-ND (facts) | 6 limb joints + MCP, spine, jaw, head-neck; proposed hard and comfortable limits | A–C. **Hip methods are not interchangeable** | No neck, tail or digit goniometry; no wolf or dingo | Rig limits; the `./den gait` check |
| Walk limb phase | JSON | `missingfound/walk-footfall-and-muybridge/data.json` | Hildebrand © (facts, digitised); Catavitello, Wilshin, Usherwood CC BY | LF phase 0.135–0.16 (long-legged dogs) | B− | "No wolf walk timing exists" | wolf.yaml LF 0.16 |
| MANN mocap analysis | JSON, MD, Python | `ref/research/motion/behaviour_numbers.json`, `REPORT.md`, `scripts/` | **MANN data CC BY-NC 4.0**: curves held out of the repo; some numbers in the JSON are NC-derived (e.g. wag 1.4 Hz) | One dog, about 30 min; walk, pace, trot, gallop; posture transitions | D; shoulder absolute angle off | NC; one dog | Research notes; **exclude NC-derived numbers from a public release** |
| Ethograms and time budgets | JSON | `fetched/11-ethograms/data.json` | CC BY / CC0; Maglieri 2023 CC BY-NC (fact) | 59 behaviours, 46 rates, dingo 24-h budget (n = 7), shake transitions | A–C | No free-ranging dog budget; no circling or scratching rates | Idle and behaviour models |
| Older gait synthesis | JSON, MD | `ref/research/gait/` | Notes from search snippets | Phases, duty factors, speed rules | C mostly | **Superseded** by `fetched/04`; e.g. trot hind duty 0.367 vs measured 0.417–0.43 | Historical only |
| 2D IK and gait prototype | JS | `ref/research/procedural/ik2d.js`, `ik2d.test.js`, `frames.js` | "MIT-style" header, no LICENSE file | Walk, trot, canter, gallop; analytic 2- and 3-bone IK; springs | Tests pass 8/8; gait numbers "ballpark" | Hock over-folds in swing; no spine flex | Rig and robot gait prior |
| OpenCat gait tables | C header | `ref/opencat/InstinctBittle.h` | MIT © 2022 Rongzhong Li | 56 skills for a 12-servo robot | Servo degrees, not anatomy | "timing only" (`docs/HANDOFF.md`) | Robot reference only |
| Ear angles (StanfordExtra) | MD | `ref/research/ear-angles/NOTE.md` | Derived from MIT data | Prick-ear medians, e.g. basenji 136°, GSD 148° | D; dingo n = 7 too small | Script not stored | Ear set |

## 2.6 Tools

| Name | Format | Path | Licence | What it does | Tests | Gaps |
|---|---|---|---|---|---|---|
| `./den` kit V2 | Python + Node | `den`, `tools/den/` | Repo (unlicensed) | `species check`, `skeleton`, `outline` (`--template`, `--curves`, `--photo`), `gait`, `gif`, `doctor`, plus gear checks | 2 pytest tests (`tools/den/tests/`) | `outline_prior.py` failed as a generator; importing `den.py` writes `.cache/` |
| `tools/lens` kit V1 | Node, Python | `tools/lens/` | Repo | Render, probe, lint, overlay | none | Game gear only |
| Heavy tools | installed | `tools/den/requirements-heavy.txt` | bpy and Blender (GPL, run only), OpenSim 4.6 (Apache), MuJoCo and dm_control (Apache), PyVista, VTK, trimesh | 3D load, render, physics | n/a | bpy smoke test not done (`scout/12` NOTE) |
| 2D shape and image libraries | installed | `./den doctor` list (`tools/den/den.py:358–406`) | Permissive, plus rembg IS-Net (Apache) | Booleans, curve fit, Procrustes, cut-outs, SSIM | n/a | — |

Non-research parts of the repo are out of scope: `apps/`, `sim/` (a game pacing harness, not physics), `engine/`, `archive/`, `art/` and the game design docs.

---

## 2.7 Missing / Blocked

| Item | Status | Where noted |
|---|---|---|
| Stark raw OpenSim zips (Full, Fore, Hind; curved, simplified, verified; Lowgeometries; `Full linear.zip`) | **In Drive** `den-ledger-everything/ref`. Listed by me, not downloaded. `Fulldogmodelcurved` and `scale_beagle` carry no licence | Drive listing; `docs/claude/DEN-DATA-FETCH-HANDOFF.md` §6 |
| `stanfordextra_v12.zip`, Dryad `doi_10_5061_dryad_77tm4` zip | In Drive; converted copies are in the repo | Drive listing |
| **Mech 1974, *Mammalian Species* 37, *Canis lupus*** (US government work, no copyright) | **In Drive** (`Canis lupus..pdf`, added Oct 7). Not yet mined; `scout/03-wolf-coat` lists it as blocked | Drive; `scout/03-wolf-coat/NOTE.md` |
| JEB 2025 (Charles et al., doi:10.1242/jeb.250523) main text | Only the supplement is in Drive (`jeb250523supp.pdf`); the main text returns 403 | `fetched/04-gait-curves/NOTE.md` |
| Full-body open 3D wolf, dingo or dog (`scout/11-body-models/`) | **Folder does not exist**; not searched | `docs/claude/DEN-SCOUT-REQUEST-3D-2026-10-07.md` |
| Measured dingo or Carolina Dog limb bones | None open; likely in the Koungoulos 2022 PhD thesis (Cloudflare-blocked) | `missingfound/dingo-limb-bones/NOTE.md` |
| Reusing 2020 joint-range Tables 2–3 (CC BY) | Blocked | `missingfound/joint-ranges/NOTE.md` |
| Brunner & Coman 1974, Corbett 1995 (dingo hair) | Copyright, not open | `scout/04-dingo-coat/NOTE.md` |
| MANN BVH and NC motion curves | Held out of the repo, in a previous session's scratchpad. **Not accessible to me** | `ref/research/motion/REPORT.md` |
| Gait-curve processing scripts (`/tmp/item04/scripts/`) | Not in the repo | `fetched/04-gait-curves/LICENSE.txt` |
| Ear-angle script | "Re-run the code in Firefly's Oct 7 session log": not stored | `ref/research/ear-angles/NOTE.md` |
| Carolina Dog photos, `ref/dog/*_flipped.png`, `silhouette_trot*.png` | Listed in the Drive manifest but not present | `docs/IMPORT-NOTES.md` |
| Animal Kingdom dataset | Not usable (NC, no redistribution) | `fetched/08-wild-keypoints/NOTE.md` |
| "Attached uploads" | None were attached to this session | — |
