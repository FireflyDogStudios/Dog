# Animal keypoint datasets for canids: survey, downloads and proportions

Firefly, Oct 6 2026. Research only: nothing in the game or the tools changed. Method reused (read-only import) from `tools/den/species.py`. Scripts were run from the scratchpad; every number below is in `proportions.json`.

> **Out of date (Oct 7, Atlas; approval A-002 item 6).** AP-10K and APT-36K were fetched on Oct 6 after all (`../fetched/08-wild-keypoints/`, 7,078 dog/wolf/fox instances), and the full MIT StanfordExtra v12 is in `../fetched/02-outline-landmarks/`. `stanfordextra_breeds_unitB.csv` has been regenerated from that MIT data (120 breeds, incl. dingo and dhole; `tools/atlas/regen_unitB.py`). The StanfordExtra numbers quoted below and the `se_unitB` block of `proportions.json` were regenerated from the MIT data the same day (approval A-006).

## 1. Survey

Reachable from here: github.com, raw.githubusercontent.com, GitHub release assets. Blocked: Google Drive, OneDrive (1drv.ms), Zenodo, Hugging Face, arXiv, the dataset websites on github.io. The GitHub REST API (and code search) only works for this session's own repo, so repos were inspected with `git clone --depth 1`.

| Dataset | Canids (and hyena, raccoon dog) | Keypoints | Licence | Where the annotations live | Reachable? | Used |
|---|---|---|---|---|---|---|
| **AwA-Pose** (prinik) | wolf, fox, German shepherd, collie, dalmatian, chihuahua (+ raccoon) | 39 incl. ear base + tip, eye, nose, jaw, neck base, withers, back, belly, tail base + tip, 3 per leg | MIT | in repo (already in `ref/awa-pose/`) | yes | yes (already had it; new ratios and angles below) |
| **StanfordExtra** (benjiebob) | 120 Stanford Dogs breeds incl. **dingo, dhole, African hunting dog** (12k dogs) | 20 used: 3 per leg, tail base + tip, ear bases + tips, nose, chin (eyes, withers, throat defined but unlabelled) | **MIT** since 2 Nov 2024 | full JSON via Google form (Drive); 25-dog sample in repo | sample only | sample stored; full data used via the mirror below |
| Ultralytics **dog-pose** | 8,476 dogs of 112 breeds, a StanfordExtra subset (no dingo or dhole; 1 African hunting dog, 1 miniature poodle) | StanfordExtra's 24 | package labelled **AGPL-3.0** (upstream annotations MIT) | GitHub release asset `ultralytics/assets` `dog-pose.zip` (353 MB with images) | yes | numbers yes; per-dog file kept in scratch, not the repo (see NOTE.md) |
| **BADJA** (benjiebob) | 3 dog videos: `dog`, `dog-agility`, `rs_dog` (+ bear, camel, cows, horses, impala, cat, tiger) | 20 SMAL joints: 3 per leg, neck, 3 tail, jaw, nose, 2 ear tips | MIT | in repo `joint_annotations/*.json` | yes | yes, `badja_dogs.json` |
| **AP-10K** (AlexTheBad) | dog, wolf, fox, arctic fox (+ raccoon); ~10k images, 54 species | 17: eyes, nose, neck, tail root, shoulder/elbow/paw x4 (no ears, no tail tip) | CC-BY-4.0 | Google Drive / Baidu only; repo has 2 test instances (jaguar, antelope) | **no** | no |
| **APT-36K / APTv2** (pandorgan, ViTAE-Transformer) | video frames of 30 species, AP-10K keypoints; canid list not checked (annotations unreachable) | 17 (AP-10K style) | MIT (APT-36K README) | OneDrive only | **no** | no |
| **Animal-Pose** (noahcao) | dog (+ cat, cow, horse, sheep), ~4k instances | 20: eyes, nose, throat, withers, ear bases, tail base, elbows, knees, paws | none stated in repo | Google Drive only | **no** | no |
| **Animal Kingdom** (sutdcv) | wolf 500, hyena 91, dog 78, jackal 22, fox 20, coyote 14, desert fox 11, dingo 9, African wild dog 6 (frames, train+test, protocol 3 mammal) | 23: head top, eyes, mouth (4), shoulder/elbow/wrist, mid back, hip/knee/ankle, 3 tail (no ears, no nose tip, no paws) | **none stated** (data normally behind a form) | **in the GitHub repo** (`Animal_Kingdom/pose_estimation/annotation/`, 250 MB) | yes | **no, licence unclear**: the best wild-canid source found; worth asking the authors |
| TigDog | tigers, horses only | 19 | research | project site | n/a | no (no canids) |
| Horse-10 (DeepLabCut) | horses only | 22 | not permissive for reuse here | DLC site / Zenodo | no | no |
| DeepLabCut SuperAnimal-Quadruped data | pooled AP-10K, AnimalPose, StanfordExtra, etc. | 39 | mixed | Hugging Face / Zenodo | no | no |
| MMPose test data | 2 instances per set, no canids | – | Apache-2.0 | `tests/data/` in mmpose forks | yes | no (nothing canid) |
| GitHub mirrors searched (StanfordExtra fork `peternara/...`, `thomasreynolds4881/Animal-Keypoint-Estimation`, `Dkplucas/model`, `chaneyddtt/ScarceNet`, `Raojiyong/KITPose`, `BST4/AnimalPose`, `ostadabbas/PASyn`) | – | – | – | none carry AP-10K, Animal-Pose or full StanfordExtra annotations | – | no |
| Animal3D | 40 mammals incl. dogs | 26 | not checked (clone hung; data on HF/Drive anyway) | – | no | no |

## 2. What was downloaded (this folder)
- `badja_dogs.json`: 218 frames over 3 dog sequences (MIT). Video, so it gives pose ranges, not population proportions (one dog per sequence).
- `stanfordextra_sample.json`: the 25 MIT sample dogs.
- `proportions.json`, `stanfordextra_breeds_unitB.csv`: the computed tables.
- `NOTE.md`, `LICENSE-BADJA.txt`, `LICENSE-StanfordExtra.txt`.
- Kept outside the repo: the 8,476-dog StanfordExtra conversion from Ultralytics' AGPL-labelled package (path in NOTE.md).

## 3. Method
- Frame and filter exactly as `species.py`: skull point at (0,0), tail base at (-1,0), y down, 1 unit = skull to tail base; near-profile only (nose >= 0.10 ahead of the ear base, front and hind paws >= 0.45 apart, front paw > 0.55 below the topline); near side collapses left/right; medians.
- **Unit A** = species.py (AwA's `neck_base`). StanfordExtra has no neck_base, so **unit B** uses the midpoint of the ear bases as the skull point for both sets. Unit B lengths are shorter (the ear bases sit ahead of AwA's neck_base), so only compare numbers within one unit. My unit A reproduces species.py's photo counts exactly (wolf 44, GSD 60, collie 48, dalmatian 48, chihuahua 26, fox 53, raccoon 31).
- Name mapping: StanfordExtra/BADJA leg "top / middle / paw" mapped to AwA's `thai / knee / paw` (front = elbow / wrist / paw; hind = about stifle / hock / paw). The hind "top" is placed slightly differently in each set, so hind-leg length is the least comparable feature across sets.
- "Topline-to-paw" = mean depth of the front and hind paws below the skull-tail-base line; a withers-height stand-in for StanfordExtra, which has no withers. On AwA it runs 0.01-0.11 below true withers height.
- "Standing" (for angles) = profile photo with elbow-to-paw and hock-to-paw both within 20 degrees of plumb.

## 4. Proportions (fractions of skull-to-tail-base; median (n))

### Table A: AwA-Pose, unit = species.py (neck_base to tail_base)

| species | profile photos | front leg | hind leg | chest depth | neck | head | muzzle | ear | tail | height (withers) | topline-to-paw |
|---|---|---|---|---|---|---|---|---|---|---|---|
| wolf | 44 | 0.60 (44) | 0.60 (43) | 0.48 (40) | 0.12 (44) | 0.35 (44) | 0.19 (44) | 0.13 (44) | 0.62 (39) | 0.91 (44) | 0.87 (44) |
| german_shepherd | 60 | 0.60 (60) | 0.54 (60) | 0.44 (53) | 0.12 (60) | 0.39 (60) | 0.21 (59) | 0.18 (60) | 0.56 (54) | 0.89 (60) | 0.79 (60) |
| collie | 48 | 0.62 (48) | 0.54 (48) | 0.43 (36) | 0.10 (48) | 0.37 (48) | 0.22 (47) | 0.15 (48) | 0.58 (42) | 0.94 (48) | 0.89 (48) |
| dalmatian | 48 | 0.59 (48) | 0.62 (48) | 0.39 (47) | 0.15 (48) | 0.36 (48) | 0.19 (48) | 0.21 (48) | 0.50 (45) | 0.92 (48) | 0.84 (48) |
| chihuahua | 26 | 0.62 (25) | 0.56 (26) | 0.47 (19) | 0.12 (25) | 0.50 (26) | 0.25 (26) | 0.25 (26) | 0.35 (23) | 0.87 (25) | 0.86 (26) |
| fox | 53 | 0.55 (53) | 0.55 (52) | 0.44 (48) | 0.10 (53) | 0.37 (53) | 0.19 (53) | 0.17 (53) | 0.82 (47) | 0.82 (53) | 0.80 (53) |
| raccoon | 31 | 0.53 (31) | 0.52 (31) | 0.53 (11) | 0.09 (30) | 0.42 (31) | 0.21 (31) | 0.13 (31) | 0.65 (24) | 0.77 (30) | 0.66 (31) |

### Table B: same unit for both sets = ear-base midpoint to tail base

| species / breed | source | profile photos | front leg | hind leg | head | ear | tail | topline-to-paw |
|---|---|---|---|---|---|---|---|---|
| wolf | AwA-Pose | 30 | 0.52 (30) | 0.52 (29) | 0.31 (30) | 0.12 (30) | 0.56 (27) | 0.75 (30) |
| german_shepherd | AwA-Pose | 45 | 0.47 (45) | 0.45 (45) | 0.34 (45) | 0.16 (45) | 0.44 (41) | 0.67 (45) |
| collie | AwA-Pose | 41 | 0.57 (41) | 0.51 (41) | 0.34 (41) | 0.12 (41) | 0.52 (36) | 0.81 (41) |
| dalmatian | AwA-Pose | 43 | 0.52 (43) | 0.55 (43) | 0.33 (43) | 0.19 (43) | 0.44 (39) | 0.77 (43) |
| chihuahua | AwA-Pose | 31 | 0.56 (30) | 0.45 (31) | 0.45 (31) | 0.31 (31) | 0.42 (26) | 0.85 (31) |
| fox | AwA-Pose | 43 | 0.49 (43) | 0.49 (41) | 0.31 (43) | 0.14 (43) | 0.74 (39) | 0.66 (43) |
| raccoon | AwA-Pose | 20 | 0.58 (20) | 0.48 (20) | 0.43 (20) | 0.15 (20) | 0.71 (13) | 0.74 (20) |
| all 120 domestic breeds | StanfordExtra | 1701 | 0.49 (1624) | 0.54 (1548) | 0.34 (1701) | 0.20 (1007) | 0.37 (1499) | 0.86 (1701) |
| basenji | StanfordExtra | 30 | 0.43 (29) | 0.52 (30) | 0.33 (30) | 0.10 (26) | 0.13 (29) | 0.85 (30) |
| Norwegian_elkhound | StanfordExtra | 28 | 0.50 (27) | 0.51 (25) | 0.39 (28) | 0.10 (22) | 0.26 (26) | 0.94 (28) |
| Siberian_husky | StanfordExtra | 12 | 0.60 (12) | 0.51 (11) | 0.46 (12) | 0.13 (10) | 0.35 (10) | 0.93 (12) |
| malamute | StanfordExtra | 15 | 0.51 (14) | 0.59 (14) | 0.38 (15) | 0.12 (11) | 0.44 (11) | 0.90 (15) |
| Eskimo_dog | StanfordExtra | 9 | 0.54 (9) | 0.51 (8) | 0.48 (9) | 0.13 (8) | 0.43 (9) | 1.07 (9) |
| Ibizan_hound | StanfordExtra | 24 | 0.53 (24) | 0.58 (24) | 0.26 (24) | 0.12 (22) | 0.46 (23) | 0.79 (24) |
| Saluki | StanfordExtra | 43 | 0.50 (40) | 0.60 (37) | 0.29 (43) | 0.22 (26) | 0.55 (41) | 0.83 (43) |
| whippet | StanfordExtra | 21 | 0.51 (20) | 0.62 (21) | 0.32 (21) | 0.11 (10) | 0.43 (19) | 0.75 (21) |
| English_foxhound | StanfordExtra | 52 | 0.52 (51) | 0.62 (51) | 0.33 (52) | 0.21 (37) | 0.51 (51) | 0.91 (52) |
| beagle | StanfordExtra | 16 | 0.55 (13) | 0.59 (14) | 0.41 (16) | 0.44 (10) | 0.45 (15) | 0.91 (16) |
| Afghan_hound | StanfordExtra | 23 | 0.54 (22) | 0.57 (23) | 0.29 (23) | 0.39 (12) | 0.33 (19) | 0.85 (23) |
| dingo | StanfordExtra | 5 | 0.63 (5) | 0.44 (4) | 0.52 (5) | – | 0.45 (5) | 0.67 (5) |
| dhole | StanfordExtra | 15 | 0.40 (14) | 0.48 (13) | 0.30 (15) | – | 0.49 (14) | 0.70 (15) |

Notes: front leg = elbow-wrist-paw, hind leg = stifle-hock-paw (bent lengths, summed), chest depth = back_middle to belly_bottom (AwA only), neck = neck_base to withers (AwA only), head = ear base to nose, muzzle = eye to nose (AwA only), ear = base to tip, tail = base to tip straight (curled tails read short: basenji 0.14, elkhound 0.25). The full 112-breed table is `stanfordextra_breeds_unitB.csv`; most breeds have 5-50 profile photos.

## 5. Measurement-sheet ratios and angles (`docs/DEN-CANINE-MEASUREMENT-SHEET.md` sections 5 and 6)

Proxies, because no set marks the sheet's exact landmarks: body length = skull to tail base (not prosternum to ischium, so it reads longer than a show-dog "body : height"); height = withers (AwA `neck_end`) to front paw, or topline-to-paw where withers are missing; head = ear base to nose (no occiput); skull = ear base to eye; chest depth = mid back to belly (not the deepest rib point).

### Table C: measurement-sheet section 6 ratios (AwA-Pose, profile photos, unit A frame). median [middle half] (n)

| ratio | wolf | german_shepherd | collie | dalmatian | chihuahua | fox | raccoon |
|---|---|---|---|---|---|---|---|
| body : height | 1.09 [0.78–1.35] (44) | 1.13 [0.86–1.35] (60) | 1.06 [0.84–1.32] (48) | 1.09 [0.92–1.28] (48) | 1.15 [0.78–1.55] (25) | 1.22 [0.96–1.37] (53) | 1.31 [1.13–1.54] (30) |
| body : topline-to-paw | 1.15 [0.82–1.39] (44) | 1.26 [1.04–1.47] (60) | 1.12 [0.95–1.43] (48) | 1.19 [0.95–1.29] (48) | 1.17 [0.89–1.71] (26) | 1.25 [1.00–1.48] (53) | 1.52 [1.02–1.76] (31) |
| head : height | 0.38 [0.34–0.46] (44) | 0.42 [0.35–0.52] (60) | 0.39 [0.34–0.51] (48) | 0.41 [0.35–0.46] (48) | 0.48 [0.38–0.64] (25) | 0.43 [0.38–0.52] (53) | 0.50 [0.45–0.60] (30) |
| head : topline-to-paw | 0.41 [0.36–0.47] (44) | 0.46 [0.40–0.56] (60) | 0.42 [0.37–0.55] (48) | 0.42 [0.36–0.48] (48) | 0.47 [0.39–0.71] (26) | 0.46 [0.41–0.55] (53) | 0.55 [0.48–0.73] (31) |
| muzzle : skull | 1.18 [1.05–1.36] (44) | 1.21 [1.01–1.43] (59) | 1.20 [0.99–1.41] (47) | 1.20 [0.89–1.40] (48) | 0.88 [0.70–1.02] (26) | 1.14 [0.98–1.26] (53) | 1.00 [0.82–1.08] (31) |
| chest depth : height | 0.53 [0.47–0.57] (40) | 0.52 [0.45–0.57] (53) | 0.47 [0.41–0.61] (36) | 0.45 [0.39–0.51] (47) | 0.58 [0.46–0.66] (18) | 0.52 [0.50–0.62] (48) | 0.75 [0.67–0.86] (10) |
| elbow height : height | 0.54 [0.50–0.58] (44) | 0.50 [0.45–0.56] (60) | 0.53 [0.48–0.58] (48) | 0.54 [0.47–0.59] (48) | 0.50 [0.42–0.57] (24) | 0.56 [0.50–0.61] (53) | 0.49 [0.44–0.55] (30) |
| elbow height : topline-to-paw | 0.59 [0.56–0.66] (44) | 0.57 [0.50–0.65] (60) | 0.58 [0.53–0.64] (48) | 0.58 [0.50–0.65] (48) | 0.53 [0.42–0.59] (25) | 0.57 [0.50–0.63] (53) | 0.53 [0.48–0.65] (31) |
| tail : height | 0.64 [0.50–0.71] (39) | 0.63 [0.46–0.75] (54) | 0.61 [0.51–0.75] (42) | 0.58 [0.38–0.71] (45) | 0.38 [0.25–0.53] (22) | 0.96 [0.80–1.12] (47) | 0.84 [0.50–1.03] (23) |
| tail : topline-to-paw | 0.69 [0.54–0.78] (39) | 0.70 [0.53–0.89] (54) | 0.67 [0.57–0.80] (42) | 0.59 [0.41–0.72] (45) | 0.39 [0.30–0.57] (23) | 1.02 [0.85–1.17] (47) | 0.93 [0.60–1.04] (24) |
| neck : head | 0.35 [0.22–0.46] (44) | 0.27 [0.19–0.38] (60) | 0.25 [0.20–0.40] (48) | 0.41 [0.29–0.49] (48) | 0.24 [0.15–0.41] (25) | 0.28 [0.20–0.38] (53) | 0.20 [0.16–0.25] (30) |

StanfordExtra (all domestic, unit B), the ratios its points allow: body : topline-to-paw 1.17 [0.97–1.34] (1701); head : topline-to-paw 0.40 [0.34–0.49] (1701); elbow height : topline-to-paw 0.50 [0.44–0.57] (1652); tail : topline-to-paw 0.41 [0.27–0.59] (1499)

### Table D: section 5 angles, degrees, STANDING profile photos only. median [middle half] (n)

| angle | wolf | german_shepherd | collie | dalmatian | chihuahua | fox | raccoon | StanfordExtra all domestic |
|---|---|---|---|---|---|---|---|---|
| front pastern (carpus) angle | 165 [154–172] (13) | 158 [140–161] (13) | 158 (3) | 138 (3) | 161 [124–172] (4) | 154 [138–167] (13) | 143 (3) | 156 [146–166] (601) |
| hock angle | 156 [136–173] (13) | 145 [137–155] (13) | 178 (3) | 170 (3) | 173 [146–174] (4) | 152 [124–165] (13) | 159 (3) | 148 [136–160] (567) |
| neck vs back line | 13 [-1–28] (13) | 12 [-12–26] (13) | 25 (3) | 18 (3) | 42 [15–83] (4) | 2 [-8–27] (13) | -16 (3) | – |
| head: muzzle vs skull axis | 170 [164–177] (13) | 170 [166–173] (13) | 166 (3) | 168 (3) | 160 [151–168] (4) | 167 [163–175] (13) | 170 (3) | – |
| ear carriage vs skull | 27 [18–41] (13) | 24 [5–46] (13) | -3 (3) | -99 (3) | 9 [-49–41] (4) | 19 [0–46] (13) | 36 (3) | -98 [-118–-39] (380) |
| tail carriage vs topline | -75 [-83–-69] (13) | -44 [-68–41] (13) | -40 (2) | -24 (3) | 120 (2) | -56 [-73–-30] (11) | -42 (2) | 4 [-58–84] (517) |

StanfordExtra breeds, standing (ear carriage / tail carriage / carpus / hock, medians):
- basenji (n=8): 29 (7) / -10 (8) / 140 (8) / 152 (8)
- Norwegian_elkhound (n=10): 48 (8) / 161 (9) / 161 (10) / 139 (10)
- Siberian_husky (n=5): 33 (4) / 100 (4) / 148 (5) / 143 (4)
- malamute (n=4): 48 (4) / 33 (4) / 155 (4) / 162 (3)
- Eskimo_dog (n=4): 56 (3) / 26 (4) / 149 (4) / 139 (4)
- Ibizan_hound (n=13): 80 (11) / -53 (12) / 148 (13) / 149 (13)
- Saluki (n=20): -106 (14) / -68 (18) / 157 (20) / 147 (17)
- whippet (n=12): -42 (8) / -46 (10) / 152 (12) / 131 (12)
- English_foxhound (n=28): -117 (21) / 82 (27) / 158 (28) / 147 (27)
- beagle (n=7): -107 (5) / 66 (6) / 157 (7) / 138 (7)
- dingo (n=2): no ear tips / -16 (2) / 156 (2) / 162 (2) (too few standing profiles to lean on)
- dhole (n=6): no ear tips / -41 (6) / 156 (6) / 155 (6)

*StanfordExtra figures in this section regenerated Oct 7 by Atlas (approval A-006) from the MIT StanfordExtra v12 data in `../fetched/02-outline-landmarks/` with `tools/atlas/regen_unitB.py --proportions`; they were first computed from the AGPL-labelled Ultralytics mirror (8,476 dogs, 112 breeds). The method reproduces the stored AwA numbers exactly (`--validate`, `--validate-block`).*

### Table E: BADJA pose ranges across video frames (degrees; min / median / max, middle half, frames)

| sequence | frames | carpus angle | hock angle | tail carriage vs topline |
|---|---|---|---|---|
| dog | 12 | 138 / 170 / 178 [166–174] (12) | 136 / 170 / 179 [151–174] (10) | -87 / -30 / 17 [-65–-14] (12) |
| rs_dog | 201 | 84 / 150 / 180 [133–165] (192) | 61 / 134 / 170 [116–144] (198) | -101 / -30 / 39 [-54–-12] (171) |
| dog-agility | 5 | 120 / 161 / 176 [137–176] (5) | – | – |

Angle conventions: carpus = elbow-wrist-paw and hock = stifle-hock-paw, 180 = straight. Neck = withers-to-skull line above the tail-base-to-withers line. Head = ear base-eye-nose, 180 = muzzle in line with skull. Ear carriage = ear base-to-tip relative to the skull line pointing back, +90 upright, 0 laid back, about -100 hanging (drop ears). Tail carriage = tail base-to-tip relative to straight back along the topline, +up / -down; values near +-180 mean the tail lies forward over the back (curled: elkhound 167). Medians of tail carriage across mixed tail types are not meaningful for "all domestic". Angles from mixed photos are 2D projections; the n for standing photos is small (13 per AwA species at best).

Pose range (BADJA, one dog per sequence, trotting/agility): carpus bends to 84 and hock to 61 degrees in motion (rs_dog), against standing medians of about 155-165 (carpus) and 145-156 (hock); tail carriage swings between about -100 and +40 degrees.

## 6. Sheet fields this data cannot provide
- Section 2 outline points: none of the silhouette points are marked (nose bridge, stop, forehead, occiput, ear back, croup, loin, rear pastern, stifle front, flank, front pastern, prosternum/chest front, deepest chest point, jaw line, upper lip). Keypoints are joints and a few surface points, not an outline.
- Section 3/4 landmarks: occiput, stop, prosternum, croup, shoulder joint and hip joint (no set here marks scapula or pelvis; AP-10K and Animal Kingdom mark a "shoulder" and "hip" but are not usable), deepest chest point, true ground line (paws only).
- Section 5 angles: head angle at the stop (we only have eye-line), shoulder (scapula vs humerus), true elbow (humerus vs radius: no shoulder point), hip (pelvis vs femur). StanfordExtra also gives no neck or head angle (no eye, no withers).
- Section 6: true body length (prosternum to ischium), true head length (nose to occiput), true muzzle:skull (stop to nose vs stop to occiput), deepest chest depth.
- Sections 7 and 9: no widths, thicknesses or cross-sections; no far-side offsets (both sides are marked but in mixed views).
- Species: no keypoints at all from a permissive source for **coyote, jackal, dhole, African wild dog, dingo, hyena, raccoon dog** or other fox species. Animal Kingdom has coyote, jackal, dingo, African wild dog, hyena, desert fox (no ears or paws); StanfordExtra's full JSON has dingo, dhole and African hunting dog (form-gated).

## 7. Gaps and next steps (for GrumpyDingo to choose)
1. StanfordExtra full JSON via its form (MIT): adds dingo, dhole, African hunting dog and about 4,000 more domestic dogs; replaces the AGPL-packaged copy.
2. Ask the Animal Kingdom authors for a licence: 500 wolf, 91 hyena and small coyote / jackal / dingo / African wild dog samples, already reachable here.
3. AP-10K (CC-BY-4.0) and APT-36K (MIT) need a Drive/OneDrive download done by hand; they add wolf, fox, arctic fox, dog in many poses (no ears or tail tips).
4. Nothing found for raccoon dog in any set.
