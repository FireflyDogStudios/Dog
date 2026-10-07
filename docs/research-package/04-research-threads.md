# 5. Research threads

[← Master index](README.md)

There are 12 threads. Each one can be picked up independently. Difficulty runs from 1 (an afternoon) to 5 (needs new data or collaborators). Hypotheses are **[I]**: my proposals, not findings.

| # | Thread | Difficulty | Main blocker |
|---|---|---|---|
| T1 | Correct the wolf chest depth | 1 | none |
| T2 | Are dingo proportions distinct? | 5 | no measured dingo bones |
| T3 | Predict silhouettes from skeletons | 3 | fur offsets mostly E |
| T4 | Quantify pose-label offsets | 2 | few overlapping images |
| T5 | Wild wolf gait timing from video tracks | 3 | frame rate, occlusion |
| T6 | One hip angle | 3 | 3D pelvis landmarks |
| T7 | Grow-from-bones vs warp-a-template | 3 | P2 not built |
| T8 | Ear allometry and climate | 2 | locality data |
| T9 | Skull shape and the missing dingo | 4 | 51 GB CT, no dingo skull |
| T10 | Free-ranging canid time budgets | 3 | no free-ranging dog budget |
| T11 | Sim-to-robot canid gait priors | 4 | sign-off for long sims |
| T12 | Calibrated coat colour | 2 | no grey card in photos |

<a id="t1"></a>
### T1. Correct the wolf chest depth
- **Question:** What is the true sternum-to-withers depth of a grey wolf, as a fraction of bone withers height?
- **Hypothesis [I]:** About 0.35–0.40 WH (bone), not 0.54.
  - The photo value of 0.44 (with fur, `docs/claude/DEN-OPEN-QUESTIONS.md:24`) converts to about 0.35 bone.
  - Stark "Shepherd" gives 0.346 and Beagle 0.436 (`fetched/03-dog-model/stark_side_view.csv`).
  - Law rib/SH gives ≥ 0.32 (`ref/research/skeleton/REPORT.md` §6).
- **Required data:**
  - wolf photos `scout/01-body-templates/wolf/` 01, 03, 07, 10, 11;
  - Mivart plates 02, 04, 08, 09;
  - skin offsets (brisket 0.021 WH);
  - coat (chest 0.053 WH, E).
- **Method:**
  1. Landmark withers, brisket and ground on each image (as in `species/templates/wolf_01.yaml`).
  2. Subtract skin and fur.
  3. Take the median and IQR.
  4. Replace `ratios.chest_depth_over_height` and re-run `./den skeleton wolf`.
  5. Fix the `tools/den/outline.py:63` vs `skeleton.py` disagreement over whether the ratio includes fur.
- **Tools:** `./den outline --photo`, rembg, numpy.
- **Expected output:** a corrected value with n and IQR, a regenerated skeleton, and a note in `species/wolf.yaml`.
- **Potential impact:** Fixes the most visible error. It is also a worked example of why photo ratios cannot stand in for bone ratios.
- **Difficulty:** 1.
- **Blockers:** none. The fur offset at the chest is E.

<a id="t2"></a>
### T2. Are dingo proportions distinct from village dogs and wolves?
- **Question:** Do dingo limb ratios (brachial, crural, FL/HL) differ from domestic reference dogs?
- **Hypothesis [I]:** Unknown. Current "dingo ratios" are Harcourt's reference-dog ratios by construction (`missingfound/dingo-limb-bones/NOTE.md`), so the question has not been tested in open data.
- **Required data:**
  - measured dingo long bones (Koungoulos 2022 thesis; museum collections);
  - Samuels / Law comparators;
  - StanfordExtra dingo keypoints (n = 108) as a weak external check.
- **Method:**
  1. Museum measurement protocol (GL, von den Driesch).
  2. Compute indices.
  3. Compare against `fetched/06-limb-indices/data.csv` with phylogenetic or size correction.
- **Tools:** R or Python, calipers, museum access.
- **Expected output:** the first open measured dingo limb dataset (CC BY).
- **Potential impact:** High for dingo biology and conservation debates, and for every downstream dingo model.
- **Difficulty:** 5.
- **Blockers:** Data is held by others; needs collaboration.

<a id="t3"></a>
### T3. Can a skin and fur offset field predict real silhouettes from skeletons?
- **Question:** Given a skeleton, how well do 17 skin landmarks plus regional coat offsets reproduce real outlines?
- **Hypothesis [I]:** Good enough at the legs and back. Worst at the chest, flank and neck, where fur and posture dominate.
- **Required data:** `species/build/wolf.curves.json`, `fetched/01-skin-offsets`, `scout/03-wolf-coat`, wolf photos; `fetched/02-outline-landmarks` for dogs (outline + keypoints).
- **Method:**
  1. Fit skeletons to the StanfordExtra keypoints.
  2. Grow outlines with the offset field.
  3. Measure IoU and Hausdorff distance against the real outline per body region.
  4. Fit the offsets that minimise the error per breed.
- **Tools:** shapely, scipy RBF, morphops.
- **Expected output:** an empirically fitted offset field per region with error bars, which replaces the E values.
- **Potential impact:** Turns estimates into measurements. Reusable for any quadruped silhouette work.
- **Difficulty:** 3.
- **Blockers:** StanfordExtra poses are not side-on standing. It needs a near-profile filter (`keypoints/REPORT.md` §3).

<a id="t4"></a>
### T4. Quantify systematic label offsets in animal pose datasets
- **Question:** How far, in body-relative units, is AP-10K's "shoulder" from the true elbow, its "knee" from the hock, and so on?
- **Hypothesis [I]:** Consistent offsets that can be corrected with a per-joint linear map.
- **Required data:** `fetched/08-wild-keypoints/data.json`, `ref/awa-pose/canids.json`, `fetched/02-outline-landmarks/data.json`; the Stark skeleton for anatomical ground truth.
- **Method:**
  1. Normalise each instance to unit B.
  2. Compare joint distributions across datasets for matched species and poses.
  3. Fit an affine correction per joint.
  4. Validate on held-out images.
- **Tools:** numpy, pycocotools.
- **Expected output:** a crosswalk with corrections, plus an audit note.
- **Potential impact:** Anyone training canid pose models gets anatomically honest joints. That matters for veterinary gait analysis and welfare monitoring built on AI pose.
- **Difficulty:** 2.
- **Blockers:** Few images carry labels from two schemes. The comparison is distributional unless images overlap.

<a id="t5"></a>
### T5. Wild wolf gait timing from video tracks
- **Question:** What are wolf duty factors and footfall phases at walk and trot?
- **Hypothesis [I]:** Wolves walk with LP close to long-legged dogs (about 0.14–0.16) and trot at lower duty factors. This is untested, because "no wolf walk timing exists" (`missingfound/walk-footfall-and-muybridge/NOTE.md`).
- **Required data:** APT-36K wolf tracks (80 clips, 1,670 instances, `fetched/08-wild-keypoints/data.json`); frame rates from the APT-36K repo.
- **Method:**
  1. Per track, detect paw contacts from paw-keypoint velocity (as `ref/research/motion/scripts/gaits.py` does for BVH).
  2. Compute DF and phase.
  3. Correct for the label shift (T4).
  4. Compare with `fetched/04-gait-curves/duty_phase.csv`.
- **Tools:** Python; the existing `gaits.py` logic.
- **Expected output:** the first open wolf footfall timing table (n tracks, gait, speed proxy).
- **Potential impact:** Closes a named gap. Useful for wolf biomechanics, robotics and animation.
- **Difficulty:** 3.
- **Blockers:**
  - Frame rate and resolution are unknown per clip.
  - Paws are occluded.
  - Many clips may not contain full strides.

<a id="t6"></a>
### T6. One hip angle
- **Question:** Can the four or more incompatible hip-angle definitions be converted to one?
- **Hypothesis [I]:** Yes, as fixed offsets per definition, computed on the Stark 3D pelvis and femur.
- **Required data:** Stark meshes and `bodies.csv`; definitions from `fetched/04-gait-curves/NOTE.md` and `missingfound/joint-ranges/NOTE.md`.
- **Method:**
  1. Place each definition's landmarks on the 3D pelvis (tuber sacrale, tuber ischiadicum, iliac spine, GT, S1).
  2. Sweep the femur through its range.
  3. Tabulate the conversion functions.
- **Tools:** trimesh, OpenSim.
- **Expected output:** a hip conversion table and function.
- **Potential impact:** Makes canine hip kinematics comparable across studies, which helps veterinary rehabilitation research.
- **Difficulty:** 3.
- **Blockers:** Landmark placement on one Beagle; the conversion is breed-dependent.

<a id="t7"></a>
### T7. Grow-from-bones vs warp-a-template
- **Question:** Which predicts held-out real outlines better?
- **Hypothesis [I]:** Template warp wins on silhouette. Grow-from-bones wins on pose generalisation. A hybrid (bones as prior, template as correction) beats both.
- **Required data:** P1 and P2 outputs; wolf photos as held-out tests.
- **Method:** Build both from identical inputs, then score IoU and Hausdorff distance per region over 5+ photos.
- **Tools:** pipelines P1 and P2.
- **Expected output:** a decision record for the project and a methods note.
- **Potential impact:** Settles the open method split (`ref/research/outline-methods/REPORT.md` vs `scout/12-body-tools/SUMMARY.md`).
- **Difficulty:** 3.
- **Blockers:** P2 is not built.

<a id="t8"></a>
### T8. Ear allometry and climate across *Canis*
- **Question:** Does ear length scale with skull size and latitude (Allen's rule) in wolves, coyotes and jackals?
- **Hypothesis [I]:** Shorter relative ears at higher latitude.
- **Required data:** `scout/06-ears/ear_records.csv` (500 records with GBIF keys); GBIF coordinates by key; skull or body size.
- **Method:** Join records to GBIF localities, then fit ear ~ size + latitude with mixed models by species.
- **Tools:** pygbif, statsmodels.
- **Expected output:** an ear allometry table and figure.
- **Potential impact:** A small but citable ecology result from data already in hand.
- **Difficulty:** 2.
- **Blockers:**
  - Collection bias (381 of 500 records from one museum).
  - CC BY-NC records must stay aggregate-only.

<a id="t9"></a>
### T9. Skull shape, and the missing dingo-type skull
- **Question:** Where do dingo-type skulls sit in canid skull-shape space?
- **Hypothesis [I]:** Between wolves and village dogs. This needs data; none is open (`missingfound/skull-candidates/SUMMARY.md`).
- **Required data:**
  - Meloro & Tamagnini 2021 2D landmarks (CC0);
  - Czeibert 2024 HRCT (CC0, 51.4 GB);
  - MRI PAS wolves;
  - Plazi CC0 singing-dog and village-dog holotypes (`fetched/07-dingo/data.csv`).
- **Method:** Procrustes plus PCA on landmarks, then place the CC0 holotypes.
- **Tools:** morphops, the proposed `./den skulls` (`missingfound/skull-candidates/AUTOMATION.md`).
- **Expected output:** a morphospace plot and landmark set.
- **Potential impact:** Taxonomy and education; it fills the head for every bestiary species.
- **Difficulty:** 4.
- **Blockers:** Download size needs approval; there is no dingo 3D skull.

<a id="t10"></a>
### T10. A generative time-budget model for free-ranging canids
- **Question:** Can ethogram rates and budgets drive a realistic 24-h behaviour model?
- **Hypothesis [I]:** A two-state HMM (wolf P(stay inactive) = 0.87, `fetched/11-ethograms/data.json`) plus event rates reproduces the observed budgets.
- **Required data:** `fetched/11-ethograms/data.json` (dingo budget n = 7, farm dogs, shelter dogs); `ref/research/motion/behaviour_numbers.json` (permissive entries).
- **Method:** Fit a semi-Markov model, then validate against held-out budgets.
- **Tools:** Python (hmmlearn, statsmodels).
- **Expected output:** an open behaviour simulator with parameters and sources.
- **Potential impact:** Welfare baselines (shelter enrichment), animation idle loops, agent-based ecology.
- **Difficulty:** 3.
- **Blockers:** No free-ranging dog budget; small n.

<a id="t11"></a>
### T11. Sim-to-robot canid gait priors
- **Question:** Do measured dog joint trajectories make a better reference gait for a quadruped robot than hand-tuned tables?
- **Hypothesis [I]:** Yes, in smoothness and energy. Transfer is limited by the 2-segment robot legs (`docs/HANDOFF.md`).
- **Required data:** `fetched/04-gait-curves`, Stark models, the dm_control dog, joint ranges, `ref/opencat/`.
- **Method:** Pipeline P4, then compare cost of transport and slip in sim.
- **Tools:** MuJoCo, dm_control, OpenSim.
- **Expected output:** sim-ready reference gaits; robot tables.
- **Potential impact:** Open, biology-grounded gaits for educational and research quadrupeds.
- **Difficulty:** 4.
- **Blockers:** Long sims need sign-off; only one limb has measured 3D kinematics.

<a id="t12"></a>
### T12. Calibrated coat colour from citizen-science photos
- **Question:** Can region colours be white-balanced without a grey card, for example from the sclera, the nose or a sky reference?
- **Hypothesis [I]:** Normalising to the nose leather or to grey-world statistics shrinks the dingo back spread (#f8cc92 to #6f4f3b, `fetched/10-coat-palettes/NOTE.md`).
- **Required data:** `fetched/10-coat-palettes/data.json` (boxes and sources); more CC BY photos.
- **Method:** Apply candidate normalisations, then compare within-species variance.
- **Tools:** colour-science, OpenCV.
- **Expected output:** a calibrated palette per species and region, with uncertainty.
- **Potential impact:** Coat-colour ecology (e.g. dingo colour morphs), better art references.
- **Difficulty:** 2.
- **Blockers:** Unknown camera pipelines; small n.
