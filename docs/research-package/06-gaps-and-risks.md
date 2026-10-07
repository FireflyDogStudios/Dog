# 7. Gaps and risks

[← Master index](README.md)

## Missing data

| Gap | Severity for a public reference | Source of the statement |
|---|---|---|
| Measured dingo and Carolina Dog limb bones | High | `missingfound/dingo-limb-bones/NOTE.md` |
| Any wolf or dingo kinematics or goniometry; all are dog proxies | High | `missingfound/joint-ranges/SUMMARY.md`; `species/wolf.yaml` |
| Intervertebral disc share; spine lengths are centra only | Medium (trunk length) | `ref/research/skeleton/species_numbers.json`. **Requested from Scout**: `docs/claude/DEN-SCOUT-REQUEST-DISCS-2026-10-07.md` |
| Ear rotation angles; jaw angles in behaviour | Medium | `missingfound/face-ear-and-wild-keypoints/NOTE.md` |
| Neck, tail and digit ranges of motion | Medium | `missingfound/joint-ranges/SUMMARY.md` |
| Gallop joint curves; 3D walk curves | Medium | `fetched/04-gait-curves/SUMMARY.md` |
| Wild-canid keypoints beyond wolf and fox (coyote, jackal, dhole, African wild dog, hyena) | Medium | `fetched/08-wild-keypoints/NOTE.md` |
| Fur depth outside "thickly furred areas"; any dingo hair measurement | Medium | `scout/03-wolf-coat/NOTE.md`, `scout/04-dingo-coat/NOTE.md` |
| Face soft-tissue depths from CT or MRI | Low to medium | `scout/07-head-soft-tissue/NOTE.md` |
| Free-ranging dog time budget | Low to medium | `fetched/11-ethograms/NOTE.md` |
| Open full-body 3D canid model | Medium for P2 | `scout/11-body-models/` was never created |
| Muscle-name crosswalk (Stark ↔ Ellis ↔ Tafel 2) | Low | none exists |

<a id="wrong-data"></a>
## Wrong data (known or likely)

| Problem | Evidence | Impact | Fix |
|---|---|---|---|
| **Wolf chest depth 0.54 is too deep.** The AwA keypoint ratio "back_middle → belly_bottom, with fur" was applied to the **bone** withers height | `species/wolf.yaml:56`; `tools/den/species.py:27`; `keypoints/REPORT.md`; `docs/claude/DEN-OPEN-QUESTIONS.md:24` (photo 0.44 vs skeleton 0.59 of surface height). Bone comparators: Stark 0.346 / 0.436 (`stark_side_view.csv`); Law rib/SH ≥ 0.32 | Every wolf outline is wrong in the chest; elbow height and neck carriage are suspect too | [T1](04-research-threads.md#t1). Also fix `tools/den/outline.py:63` and `skeleton.py`, which treat the ratio differently |
| The `species check` self-validates (the value comes from the same source it is checked against) | `species/wolf.yaml` `check:` field | Gives false confidence | Check against an independent source |
| AP-10K / APT-36K joint labels sit one joint lower than their names | `fetched/08-wild-keypoints/NOTE.md` | Pose and gait analyses mislabel joints | [P3](05-projects.md#p3) |
| Catavitello carpus (digit tip) and hip (trunk–femur) are nonstandard | `fetched/04-gait-curves/NOTE.md` | +20–35° carpus error if used as absolute values | Use for timing only |
| Samuels OLI/URI headers swapped; dhole indices inconsistent | `fetched/06-limb-indices/NOTE.md` | Wrong indices | Use `calc_*` |
| Muybridge 707 and Maggie A mirrored; `summary` block and SUMMARY.md still stale | `fetched/05-muybridge/data.json` vs `missingfound/walk-footfall-and-muybridge/` | Wrong footfall order | Regenerate the summary from the corrected `plates` |
| StanfordExtra JSON contains 15,554 `NaN` tokens (invalid strict JSON); its NOTE says missing joints are omitted | `fetched/02-outline-landmarks/data.json` (verified) | `JSON.parse` fails; NaN counted as "occluded" | Clean on load |
| Stark trunk muscles with Fmax = 1.0 N placeholders | `fetched/03-dog-model/stark_muscles.csv` (verified) | Near-zero Hill volumes in P2 | Exclude or substitute |
| Superseded snippet values still in live files: trot hind DF 0.367; trot RF 0.02; "no measured walk DF" | `species/wolf.yaml`, `ref/research/gait/` vs `fetched/04-gait-curves/duty_phase.csv` (0.417–0.43; RF 0.936–0.96) | Gait timing errors | Update `wolf.yaml`; mark `ref/research/gait/` superseded |
| Harcourt tibia intercept +21.62 left in one NOTE (corrected to +9.41 elsewhere) | `fetched/07-dingo/NOTE.md` item 9 | Confusion | Edit the NOTE |
| Near/far side swapped in a code comment | `tools/den/outline.py:10` vs `fetched/03-dog-model/NOTE.md` | Possible mirrored legs | Verify, then fix |
| Stale statements in the inventory: meshes "in Drive"; "22 canids"; "117 measured dingoes" (they were bone-reconstructed) | `docs/claude/DEN-MATERIALS.md` | Misleads new readers | Corrections proposed in `docs/log/APPROVALS.md` |
| Stale docs: Tafel 2 "not measured" (guide §5); AP-10K "unreachable" (`keypoints/REPORT.md`) | as cited | Misleads | Refresh |
| Ellenberger "+31 px" Tafel 1↔3 offset disputed (scale 1.008, rotation −0.63°) | `scout/08-tafel2-muscles/NOTE.md` | Misregistered overlays | Re-register |
| Jaegger 2002 limits recalled "from memory"; values differ by 1° between files | `ref/research/gait/`, `ref/research/procedural/`, `species/wolf.yaml` | Unverified limits | Verify against the paper; only the stifle is verified |
| One fact sheet said the `scout/12-body-tools` CSVs were missing | They exist: `tools.csv` (52), `papers.csv` (30) (verified) | none | Noted, so nobody repeats the claim |

<a id="licensing-problems"></a>
## Licensing problems

| Issue | Where | Risk | Recommended handling |
|---|---|---|---|
| **The repo has no licence** (no LICENSE, COPYING or CREDITS file; `package.json` is `"private": true`) | repo root | Nobody else may legally reuse the repo's own code or derived tables | Choose licences for a release subset (Firefly / GrumpyDingo decision) |
| Law 2025 / 2021 data has no licence ("please cite") | `ref/research/skeleton/DATA-NOTE.txt` | Derived tables may not be redistributable | Ask Chris Law. Until then, ship pointers and Samuels (CC0) instead |
| AGPL taint: unitB CSV built from the Ultralytics mirror | `keypoints/stanfordextra_breeds_unitB.csv`, parts of `proportions.json` | Copyleft obligations | Regenerate from the MIT `fetched/02` data |
| NC / ND / NC-SA sources used as "facts" (Koungoulos, Gallup, Maglieri, Populin, Heptner scan, Scholander scan, Li 2025, Inal 2026) | `fetched/07`, `09`, `11`; `scout/03`, `06`, `07`; `missingfound/*` | Facts are generally not copyrightable, but aggregation needs a legal view [I] | Keep them in the pointer ledger, not in the CC BY table |
| MANN-derived numbers (CC BY-NC), e.g. wag 1.4 Hz, posture transitions | `ref/research/motion/behaviour_numbers.json` | NC contamination | Exclude from the public release |
| APT-36K: no LICENSE file; AP-10K JSON says MIT while the repo says CC BY | `fetched/08-wild-keypoints/NOTE.md` | Ambiguous terms | Follow the stricter licence (CC BY); ask the APT authors |
| Stark `Fulldogmodelcurved` and `scale_beagle` carry no licence | Drive; `docs/claude/DEN-DATA-FETCH-HANDOFF.md` §6 | Not redistributable | Facts only (as now) |
| 19 CC BY photos and CC BY skulls stored in the repo need per-item credit; no research credits in `CREDITS` yet | `scout/01-body-templates/candidates.csv`; `apps/den-ledger/src/js/040-game-bridge.js:141` | Licence breach if shipped uncredited | Generate `CREDITS-RESEARCH.md` from the CSVs |
| Ellenberger co-author Münch's death year not verified | `fetched/01-skin-offsets/NOTE.md` | Low (US PD, pre-1931) | Verify for EU reuse |
| `ref/research/procedural/ik2d.js` "MIT-style" header with no LICENSE file | file header | Ambiguous | Add an explicit licence |

## Ethical concerns
- **Dingo cultural significance.** Dingoes carry deep significance for Aboriginal Australians, and their legal and taxonomic status is debated. Any dingo data project should consult appropriately and avoid implying conclusions about "purity" from estimates [I].
- **Veterinary misuse.** Domestic-dog reference ranges come from small samples (n = 4–10 per study). They must not be presented as clinical normals [I].
- **Credit to citizen scientists.** iNaturalist and Flickr photographers are owed attribution under CC BY.
- **AI pose for welfare.** Mislabelled joints (AP-10K) can produce false "abnormal gait" flags. Publish corrections responsibly and notify the maintainers first.
- **No new animal data collection** is proposed apart from P5, which uses museum specimens.

## Technical debt
- **Provenance and reproducibility:**
  - Processing scripts missing from the repo (gait curves, ear angles).
  - Raw downloads deleted.
  - Docs hand-copied from Drive and only size-checked (`docs/IMPORT-NOTES.md`).
- **Tests:** two pytest tests cover the whole research pipeline (`tools/den/tests/`).
- **Dead code:**
  - `outline_prior.py` failed but remains.
  - `den.py` does not route `--prior`.
  - `tools/bench/*` hard-code stale scratchpad paths.
- **Side effects:** importing `tools/den/den.py` writes `.cache/`.
- **Shared tree:** research and game share one repo and one history, and there is no package boundary.
- **Stale models:** the Stark full model does not initialise (bad `min_control`).

## What would make the whole collection unreliable
1. **Mixing conventions silently,** for example hip definitions, carpus definitions, keypoint labels or WH definitions. This is the root cause of most errors found so far.
2. **Self-referential checks.** A value validated against its own source passes anything.
3. **Letting E values harden into "facts"** by being copied without their grade. Coat offsets are about 80 % E; dingo bones are 100 % E.
4. **Publishing with licence contamination** (AGPL, NC). One tainted file can block an entire release.
5. **Losing provenance.** If the scripts, raw downloads or Drive copies disappear, derived values cannot be re-checked.
6. **Small-n domestic proxies presented as species norms** for wolves or dingoes.
