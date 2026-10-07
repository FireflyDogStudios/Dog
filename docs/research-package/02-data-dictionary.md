# 3. Data dictionary

[← Master index](README.md)

This page records how each dataset encodes its numbers, and **where the encodings disagree**. Most errors in this collection have come from mixing conventions, so read the conflict notes before combining any two sources.

## 3.1 Units

| Quantity | Unit(s) in use | Where |
|---|---|---|
| Bone length | mm, caliper **greatest length (GL)** | Law (`ref/research/skeleton/`), Samuels (`fetched/06-limb-indices/`), Harcourt dingo estimates |
| Segment length | **joint centre to joint centre**, m in `.osim`, mm in CSVs | Stark (`fetched/03-dog-model/stark_segments.csv`), greyhound |
| Body proportion | fraction of **withers height (WH)** | `species/`, skin offsets, muscle bulges, coat offsets |
| Head proportion | fraction of **condylobasal length (CBL)** | `missingfound/wolf-skull/`, `scout/06-ears/`, `scout/07-head-soft-tissue/` |
| Keypoint proportion | **unit A** or **unit B**: 1 = skull point to tail base | `keypoints/REPORT.md` §3. Never compare across the two units |
| Angle | degrees, **included angle, 180 = straight** (project standard) | `docs/claude/DEN-REFERENCE-GUIDE.md`; `fetched/04-gait-curves/NOTE.md` |
| Time in stride | **% stride, 0 = that limb's own touchdown** (101 points) | `fetched/04-gait-curves/curves.csv` |
| Footfall phase | fraction of the LH cycle, **LH = 0** | `duty_phase.csv`; `missingfound/walk-footfall-and-muybridge/` |
| Force, muscle parameters | N, m, degrees (pennation) | `stark_muscles.csv` |
| Colour | sRGB hex, not white-balanced | `fetched/10-coat-palettes/` |
| Rates | /min, Hz, bouts/h, fraction of 24 h | `ref/research/motion/behaviour_numbers.json`, `fetched/11-ethograms/` |
| Game drawing units | 62 × 38 space, ground y ≈ 35.5, 0.03465 u/mm | `species/build/wolf.skeleton.json`; `docs/claude/DEN-GAME-DOG-ANATOMY.md` |

**Withers height is not one number.** Each source measures it differently:
- Stark WH is 0.617 m to the top of the thoracic spines, or 0.635 m to the top of the scapula (`fetched/03-dog-model/NOTE.md`).
- Ellenberger WH is 1837 px, measured to the plate's withers (`fetched/01-skin-offsets/NOTE.md`).
- The wolf "WH 750 mm" is a field figure (`species/wolf.yaml`).
- Harcourt applied to the Law wolf bones gives 767 mm (`ref/research/factcheck/answers.json` Q13).

**State which WH you mean** whenever you use it.

## 3.2 Coordinate systems

| Dataset | Axes | Origin | Facing / sides |
|---|---|---|---|
| Stark `.osim` and CSVs | X = animal's left, Y = caudal, Z = up; rotations X → Y → Z | model ground | Side view: x = −Y (forward = right), y = −Z (down), origin at the top of the withers, ground at y = +1 WH; **right_* = near side** |
| Stark GLBs | same axes, **mm**, each body in its own frame | body frame; place it with the `bodies.csv` 4×4 | — |
| Greyhound | X = cranial, Y = left, Z = up | hip centre | left hindlimb |
| Wolf skull GLB | x forward, y up, **z = animal's right**; palate horizontal | jaw hinge centre | — |
| Wolf skull 2D / head frame | facing right, y down, CBL units | prosthion | — |
| Ellenberger plates | pixels 3451 × 2850, y down, **dog faces left** | plate corner | Mirror with x′ = 3450 − x; fractions: fx = (x_right − 2320)/1837, fy = (2626 − y)/1837 |
| Pose datasets | image pixels, y down | top-left | Side visibility not normalised |
| `species/build` | `wh` (y down, ground y = 1) or `joints_mm` (y up, ground 0, front MCP at x = 0) | withers or MCP | facing right |
| Measurement sheet | X toward tail, Y up, **facing left** | nose tip | `docs/DEN-CANINE-MEASUREMENT-SHEET.md` (values illustrative) |

**Known side conflict:** `tools/den/outline.py:10` calls the left bones "near-side". `fetched/03-dog-model/NOTE.md` says right_* is near in a right-facing view.

## 3.3 Angle conventions and their conflicts

The project standard is the **included angle between two bones, with 180 = straight**. Values above 180 are hyperextension, normal for the carpus in stance.

| Source | Native convention | Converted? | Caveat |
|---|---|---|---|
| Humphries 2020 | flexion from straight | included = 180 − flexion | GSD standing hip 189° |
| Catavitello 2015 | segment angles | yes | **Carpus uses the digit tip** (+20–35°); **hip is trunk–femur** (`fetched/04-gait-curves/NOTE.md`). Use for timing and shape only |
| Fischer 2018 | stifle relative, tarsus relative | stifle = 180 + v; tarsus = 180 − (mt − tib) | **Hip not converted** (marionette zero) |
| Goldner 2018 | already included | — | Hip uses its own pelvic axis (94–117°) |
| Charles 2025 (JEB) | OpenSim coordinates | **no** | Convention undetermined; only the ROM is comparable, and that is E |
| Stark motion | OpenSim coordinates; **+elbow = extension**, others + = flexion | side-view angles derived | MCP up to 268° may be an artefact |
| MANN | BVH ZXY; segment angle atan2 | derived | Shoulder absolute value off by about 25° |
| Goniometry (joint ranges) | included | none needed | **Hip defined in at least 4 ways** across sources (`missingfound/joint-ranges/NOTE.md`) |
| OpenCat | servo degrees | not anatomical | Do not convert |

**Rule:** do not swap absolute hip or carpus values between sources. Ranges of motion travel better than absolute angles.

## 3.4 Gait definitions

| Term | Definition | Source |
|---|---|---|
| Duty factor (DF) | stance time ÷ stride time, per limb | `fetched/04-gait-curves/duty_phase.csv` |
| Touchdown (Humphries) | toe speed < 25 % of withers speed, within 25 mm of its lowest point, held ≥ 60 ms | same |
| Limb phase (LP, Hildebrand) | LH = 0, LF = LP, RH = 0.5, RF = LP + 0.5. Same as Cartmill diagonality; LP = 1 − Maes pair lag | `missingfound/walk-footfall-and-muybridge/NOTE.md` |
| Froude number | Fr = v² / (g·h), h = hip height | `ref/research/procedural/REPORT.md` |
| Stride length rule | λ ≈ 2.3·h·Fr^0.3 (Alexander & Jayes 1983) | `ik2d.js` `strideFor` |
| Gait transitions | walk → trot Fr ≈ 0.3–0.5; trot → gallop Fr ≈ 2–3 | `ref/research/gait/gait_numbers.json` (B) |
| Scaling with speed (trot) | cycle time ∝ v^−0.39; stride length ∝ v^0.59; DF ∝ v^−0.28 (fore), v^−0.24 (hind) | Charles 2025 supplement via `duty_phase.csv` |

**Measured reference values** (domestic dogs, `duty_phase.csv`):

| Gait | DF fore / hind | Phase LF / RH / RF |
|---|---|---|
| Walk (Catavitello) | 0.594 / 0.576 | 0.135 / 0.491 / 0.63 |
| Trot (Humphries) | 0.456 / 0.417 | 0.443 / 0.488 / 0.936 |

**Superseded values still in use:**
- `species/wolf.yaml` trot hind DF 0.367 comes from a snippet.
- `ref/research/gait/` trot RF 0.02 (hind-first) conflicts with the measured 0.936–0.96 (fore lands first).

## 3.5 Bone and segment names

| Concept | Law | Samuels | Stark body | wolf.yaml / skeleton.json |
|---|---|---|---|---|
| Scapula | scap_L | ScL | `*_scapula` | scapula |
| Humerus | hum_L | HuL | `*_humerus` | humerus |
| Radius / ulna | rad_L, ul_L, ul_OL | RaL, UlL, UlOL | `*_antebrachium` (combined) | radius |
| Metacarpal 3 | MC3L | MC3L | inside `*_carpus` (carpals + metacarpals) | mc3 |
| Digits (fore) | — | — | `*_forepaw` | front_toe |
| Femur | fem_L | FeL | `*_femur` | femur |
| Tibia / fibula | tib_L | TiL | `*_crus` | tibia |
| Metatarsal 3 | MT3L | MT3L | inside `*_calx` (tarsus + metatarsals) | mt3 |
| Trunk | presacral, sacrum, ribs | — | thorax, cervix, caput, abdomen (lumbar), pelvis, cauda | spine, ribs, tail |

**Length definitions differ.** GL (calipers) and joint-centre distances are not the same quantity. This partly explains the crural index (T/F): Stark 1.28 vs Law wolf 1.04, Samuels 1.018 and greyhound 1.07.

**Skull landmarks** follow von den Driesch: prosthion, akrokranion, basion, staphylion, zygion, infradentale (`missingfound/wolf-skull/NOTE.md`).

**Surface landmarks** (17, Ellenberger): withers, scapula_top, point_of_shoulder, sternum_manubrium, brisket, elbow_olecranon, carpus_caudal, carpus_cranial, stifle_patella, hock_caudal, hock_top, croup, ischium, skull_top, occiput, nose, chin.

## 3.6 Muscle names

| Source | Scheme | Count | Examples |
|---|---|---|---|
| Stark | snake_case Latin-ish with a `left_`/`right_` prefix; some German or misspelt (`adductoren`, `abductor_policis_longum`) | 158 (full) / 43 (Beagle fore) | `triceps_caput_longum`, `serratus_1..12`, `gluteus_medius`, `gastrocnemius_lateralis` |
| Ellis greyhound | abbreviations | 29 | GMed, BF1, GasL, TibCran |
| Tafel 2 | snake_case English/Latin + plate letters | 25 polygons | `triceps_long_head`, `semitendinosus` |

There is no crosswalk file yet. Building one is part of [project P1](05-projects.md#p1).

## 3.7 Keypoint schemas and the crosswalk

| Anatomical point | AwA-Pose | StanfordExtra | BADJA | AP-10K / APT-36K |
|---|---|---|---|---|
| Elbow (top of foreleg) | front_*_thai | *_front_top | front_*_thai | **`*_shoulder`** (mislabelled) |
| Carpus | front_*_knee | *_front_middle | front_*_knee | **`*_elbow`** |
| Approx. stifle | back_*_thai | *_rear_top | back_*_thai | **`*_hip`** |
| Hock | back_*_knee | *_rear_middle | back_*_knee | **`*_knee`** |
| Withers | neck_end | `withers` (NaN when present) | neck_lower | neck (approx.) |
| Ear base / tip | *_earbase / *_earend | *_ear_base / *_ear_tip | eartip only | none |
| Tail | tail_base, tail_end | tail_base, tail_end | + tail_mid | root_of_tail |

**Visibility flags differ:**
- AwA and BADJA have no flag.
- StanfordExtra: 1 = visible, 0 = occluded.
- AP-10K: 2 = visible, 1 = occluded, but every stored point is 2.

Sources: `fetched/02-outline-landmarks/NOTE.md`, `fetched/08-wild-keypoints/NOTE.md`, `keypoints/REPORT.md`.

## 3.8 Species list (all datasets)

| Group | Species | Data types |
|---|---|---|
| Grey wolf *Canis lupus* | bones (Law, n = 2; Samuels), 2 CT skulls, 14 photos, AwA 334, AP/APT 1,931, ears 199, coat, colour | **best covered** |
| Dingo *C. familiaris dingo* / *C. dingo* | E bones, SH (bone-reconstructed), CBL, 7 photos, StanfordExtra 108, colour 7, ears 2, 24-h budget (n = 7) | **no measured bones** |
| Carolina Dog | breed standard, 1 genuine photo, colour 5 | almost nothing |
| Domestic dog | Stark Beagle (CT), greyhound, Iron Age dogs, 12,538 StanfordExtra dogs (120 breeds), gait studies, goniometry | strongest for motion |
| Other canids (Law and/or Samuels) | *C. latrans, C. aureus, C. mesomelas, C. adustus, C. simensis, Lycaon pictus, Cuon alpinus, Chrysocyon, Vulpes vulpes, V. lagopus, V. zerda, V. macrotis, Otocyon, Urocyon* (+ *littoralis*), *Speothos, Cerdocyon, Lycalopex, Atelocynus, Nyctereutes* | bones; some keypoints (fox), ears (coyote, jackal) |
| Hyaenids | *Crocuta, Hyaena hyaena, H. brunnea, Proteles* | bones |
| Fossil canids (Samuels) | 13 taxa incl. *C. dirus*, *Hesperocyon* | bones |

## 3.9 Ratios

| Ratio | Formula | Notes |
|---|---|---|
| Brachial index | radius / humerus | Wolf: Law 1.02, Samuels 0.998 |
| Crural index | tibia / femur | Wolf: Law 1.04, Samuels 1.018; Stark 1.28 (joint centres) |
| Intermembral | (H + R) / (F + T) | |
| FL / HL | (hum + rad + MC3) / (fem + tib + MT3) | |
| Rib / HBskel | mean rib / (head + presacral + sacrum) | "chest-depth proxy": canids 0.16–0.23, hyenas 0.27 (`skeleton/REPORT.md`) |
| Chest depth : height (keypoints) | **back_middle → belly_bottom ÷ topline-to-paw**, includes fur | **Not a brisket measure**: the source of the wolf error |
| Skin offset | perpendicular bone-to-outline distance / WH | `fetched/01-skin-offsets` |
| Muscle bulge | max perpendicular bone-line-to-polygon distance / WH | `scout/08-tafel2-muscles` |
| Ear / CBL | notch-to-tip / CBL | wolf ≈ 0.50 (D) |
| Samuels indices | fitted formulas | `fetched/06-limb-indices/NOTE.md`; OLI and URI swapped |

## 3.10 Physics parameters

| Parameter | Value | Source |
|---|---|---|
| Hill muscle volume | V = Fmax · L_opt / σ, σ ≈ 0.3 MPa | `scout/12-body-tools/SUMMARY.md` (proposed) |
| Spindle radius | r(t) = r_max·sin(πt), r_max = √(2V / (π L_b)) | same |
| Stark Fmax range | 1.0–604.4 N (full); **1.0 N = placeholders** for 4 trunk muscles | `stark_muscles.csv` |
| Wrap cylinders | humerus r 0.03 m, antebrachium 0.013 m, carpus 0.01 m | `fetched/03-dog-model/data.json` |
| Springs (tail, ears) | 2nd order: tail f ≈ 2.5 Hz, ζ ≈ 0.35; ears f ≈ 5 Hz, ζ ≈ 0.25 | `ref/research/procedural/ik2d.js` (E) |
| Peak vertical GRF, Beagle walk | 94–100 N ≈ 70–74 % body weight | `fetched/03-dog-model/NOTE.md` |
| Fur depth rule | depth ≈ 0.5 × guard-hair length | `scout/03-wolf-coat/NOTE.md` (D) |
