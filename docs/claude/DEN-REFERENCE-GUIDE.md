# Den reference guide: where to find every number

Kept by Firefly, started Oct 7, 2026 at GrumpyDingo's request. **A map, not a merged dataset.** Each entry gives the headline numbers, the file that holds the detail, and the catch. The source files stay the single source of truth; if a number here and a file disagree, the file wins and this guide needs fixing.

**Update this guide** whenever research lands, a number is corrected, or a species file changes (add the line in the same commit).

## 0. Read these rules first
- **Angle convention everywhere:** included angle between the two bones, **180 = straight**, above 180 = hyperextended (the carpus under load). Elevations are degrees above horizontal.
- **Views:** side view facing **right**; image coordinates are **y down**. Mirrored sources say so.
- **Proportions** are in fractions of withers height unless a file says otherwise (the keypoint files use skull-to-tail-base or ear-base-to-tail-base: check the unit line).
- **Confidence:** A measured, clear definition · B peer-reviewed but second-hand, or a domestic-dog proxy · C weak, small sample, search snippet · EST estimate.
- **Licences:** only permissive data is stored as tables. Closed or non-commercial papers appear as single cited facts. The non-commercial motion curves and the copyleft keypoint file are **held out of the repo** (in Firefly's scratchpad only). Credits owed before shipping: section 15.
- **Species files** (`species/*.yaml`) are the only place numbers feed the rig. Check one with `./den species check species/<id>.yaml`; build its skeleton with `./den skeleton <id>`.

## 1. Pending corrections (written, not applied yet)
From `ref/research/missingfound/README.md` and `docs/claude/DEN-DATA-FETCH-HANDOFF.md` §3a; waiting on GrumpyDingo's OK.
| What | Now | Corrected | Where |
|---|---|---|---|
| Dingo tibia | 178.3 mm | **182.5 mm** (Harcourt tibia intercept +9.41, not +21.62) | `fetched/07-dingo/data.csv` |
| Walk front-paw phase (LF after LH) | 0.20 (wolf file); 0.135 (fetched) | **0.16 wolf, 0.17 dingo-sized dog** | `species/wolf.yaml`; `missingfound/walk-footfall-and-muybridge/` |
| Hock extension limit | 164 | about 175–180 | `species/wolf.yaml` |
| Carpus extension | 196 | 200 resting, **240 loaded** | `species/wolf.yaml` |
| Muybridge 707 and Maggie A | L/R as in `05-muybridge` | **mirrored**; plus two contact fixes on 706 | `missingfound/walk-footfall-and-muybridge/data.json` |
| Rig joint clamps | ±180 in the Stark model | the table in `missingfound/joint-ranges/SUMMARY.md` | — |

## 2. Body size and bones
| I need | Headline | File | Catch |
|---|---|---|---|
| Wolf limb bones (mm) | scapula 175.5, humerus 232, radius 236.5, MC3 102.8, femur 247.5, tibia 258, MT3 112 | `species/wolf.yaml` (`bones`); `ref/research/skeleton/REPORT.md` §2 | Law 2025, n = 2 adult males (B) |
| Limb ratios for 22 canids | brachial, crural, MT3/femur, FL/HL, skull ratios | `ref/research/skeleton/derived_skeleton_ratios.csv` | species means |
| Limb bones for 150 carnivorans (coyote, foxes, jackals, hyenas) | 13 indices per species | `fetched/06-limb-indices/data.csv` | `OLI`/`URI` headers look swapped; use the `calc_*` columns (CC0) |
| Field sizes (head-body, height, tail, weight) | wolf 660–840 mm at the shoulder | `ref/research/skeleton/species_numbers.json`; `REPORT.md` §1 | fact sheets, C |
| Live height from bones | wolf bones predict 767 mm (Harcourt 1974) | `ref/research/factcheck/REPORT.md` Q13 | posture explains most of the gap |
| Dingo sizes | shoulder 542 mm (n = 117), CBL 176.9 mm (n = 63), about 15 kg; ear and hind foot (CC0, LACM) | `fetched/07-dingo/`; `missingfound/dingo-limb-bones/` | **no measured dingo limb bones exist**; estimates ±5% |
| Carolina Dog standard | 457–610 mm, 15.9–22.7 kg | `fetched/07-dingo/` | breed standard |
| Village-dog skeletons | four complete Iron Age Anatolian limb sets (CC BY) | `missingfound/dingo-limb-bones/` | they sit with the **wolf**, not the coyote: use wolf ratios for the Carolina Dog |
| Beagle and "Shepherd" segment lengths | every segment in m and withers units | `fetched/03-dog-model/stark_segments.csv` | the Shepherd is the Beagle scaled ×1.66 limbs, ×1.25 trunk, not measured |
| Spine | 7-13-7-3 + 20 caudal; neck 27.5%, thorax 43.3%, lumbar 29.2% of presacral | `species/wolf.yaml` (`spine`); `skeleton/REPORT.md` §3 | B |

## 3. Standing skeleton layout
| I need | Headline | File | Catch |
|---|---|---|---|
| Standing joint angles | scapula 60° elevation (firm), shoulder ~110–115, elbow 140, carpus 160, stifle 142, hock 140, metatarsus tilted ~5° paw-forward | `species/wolf.yaml` (`angles`); `ref/research/factcheck/REPORT.md` Q1–Q5 | radiographs beat the Anatolian goniometry, which reads low on every joint |
| Pelvis | crest–ischium axis 40° below horizontal (radiographs 43), length 0.80 × femur, hip joint 60% along and below the line | `factcheck/REPORT.md` Q6; `ASSUME` in `tools/den/skeleton.py` | drop below the line is an estimate |
| Withers, neck root, paw | withers 0.025 × height above the scapula; neck root 0.10 down; toe joint 0.22 × MC3/MT3 up, toes 0.55 × | `ASSUME` in `tools/den/skeleton.py`; `factcheck` Q7–Q8 | C / EST |
| Every assumption in the builder | name, value, why | `ASSUME` in `tools/den/skeleton.py`; `species/build/<id>.skeleton.json` | edit there |
| The current wolf skeleton | targets vs achieved | `species/build/wolf.skeleton.png` and `.json` | body length ~8% short of photos |

## 4. Joint limits and non-walk poses
| I need | Headline | File | Catch |
|---|---|---|---|
| Passive limits, all six limb joints | shoulder 48–57 / 160–165; elbow 30–36 / 155–165; carpus 30–33 / 189–204; hip 45–60 / 147–181; stifle 38–43 / 152–166; tarsus 33–43 / 153–188 | `missingfound/joint-ranges/SUMMARY.md` and `data.csv` | dog breeds only; no wolf or dingo goniometry exists |
| Loaded limits | carpus 224 at a trot, **238** at jump take-off | same | passive goniometry stops at ~200 |
| Two-joint coupling | stifle only extends to ~147 when the hip is fully flexed | same | — |
| Jump, sit-to-stand, gallop | jump take-off ranges per joint; greyhound sit-to-stand hip 53°, stifle 79°, hock 89° excursion, in that order, 1.14 s | same (“Non-gait movements”) | sitting stifle ~65°, hock ~50–55° (derived, EST) |
| Older limit set | Jaegger 2002 Labrador | `ref/research/gait/gait_numbers.json` | recalled, unverified (C) |
| Model's own limits | **fake** (±180) | `fetched/03-dog-model/` | do not use |

## 5. Skin, silhouette and muscles
| I need | Headline | File | Catch |
|---|---|---|---|
| Skin over bone, 17 landmarks | withers +0.027 up, brisket +0.021 down, ischium +0.030 back, elbow 0.010, stifle 0.009, hock 0.007 (× withers height) | `fetched/01-skin-offsets/data.json` | one lean short-coated dog in a 1900 atlas (B); add coat for wolf and dingo |
| Bone side-view outlines | every bone of the Beagle as a polygon | `fetched/03-dog-model/stark_bone_outlines.json` | Beagle proportions |
| Muscles | 158 muscle lines: origin, via points, insertion | `fetched/03-dog-model/stark_muscles.csv` | lines, not volumes; use them to place bulges |
| Real dog outlines | 12,538 dogs, 120 breeds, outline polygons + 20 keypoints; dingo 108, dhole 102, African wild dog 84, basenji 157, kelpie 87 | `fetched/02-outline-landmarks/data.json` (MIT) | mixed poses and views; filter for profiles |
| Body ratios from photos | wolf head 0.39, chest 0.54, elbow 0.53 of height, etc. | `ref/research/keypoints/proportions.json`; `keypoints/REPORT.md` tables A–E | photos include fur |
| Muscle plate (where bulges show) | Ellenberger Tafel 2, public domain | URL in `fetched/01-skin-offsets/NOTE.md` | **found, not measured yet** |

## 6. Head, skull and jaw
| I need | Headline | File | Catch |
|---|---|---|---|
| Wolf skull | CBL 253.5 mm, zygomatic 142.5, ratio 0.56; mandible 0.78 × CBL; jaw joint ~0.23 × CBL ahead of the condyles | `species/wolf.yaml` (`skull`); `factcheck` Q10 | — |
| Gape | domestic dog 44 ± 4° (clinical); **wolf natural ~50°, hard limit 65°**; fox skulls 80–84° | `factcheck` Q10; `species/wolf.yaml` `max_gape` | 44 is not the wolf maximum |
| Jaw in behaviour (bark, howl, yawn, pant, play face) | no angles exist; timings and opening grades instead | `missingfound/face-ear-and-wild-keypoints/` | measure our own clips |
| Chewing, yawning, panting timing | gape and rate, yawn duration, panting 5.33 Hz | `fetched/09-face-and-ear/`; `ref/research/motion/behaviour_numbers.json` | — |
| Head pitch | skull axis ~20° below horizontal standing | `factcheck` Q9 | C |

## 7. Ears
| I need | Headline | File | Catch |
|---|---|---|---|
| Resting ear angle, side view | **prick ears 126–148° from the forward skull line** (basenji 136, malamute 140, German shepherd 148); wolf ~130; drop-ear controls −60 | `ref/research/ear-angles/NOTE.md`; `species/wolf.yaml` `ear_set` | measured by Firefly from StanfordExtra; only 7 dingo ears labelled, so the basenji stands in |
| Ear poses by mood | DogFACS ear actions: forward, adductor, flattener, rotator, downward; ears back is the strongest fear sign (d = 0.68) | `missingfound/face-ear-and-wild-keypoints/` | categories, not angles |
| Ear movement speed | cat proxy: ~10–20° turns, twitch ~25 ms after a sound | same | cat (C) |
| Ear length | wolf 100–145 mm; dingo (CC0, LACM) | `species/wolf.yaml`; `missingfound/dingo-limb-bones/` | wolf value is one subspecies |
| Claims checked and rejected | "jackal ears rotate 180°" and others | `missingfound/face-ear-and-wild-keypoints/COMPARISONS.md` | — |

## 8. Tail
| I need | Headline | File | Catch |
|---|---|---|---|
| Wolf tail | 20 caudal vertebrae; hangs ~75° below the topline relaxed; 350–560 mm | `species/wolf.yaml`; `factcheck` Q12 | — |
| Wag | 1–4 Hz, 1.4 Hz relaxed | `ref/research/motion/behaviour_numbers.json` | the 1.4 measurement came from held non-commercial data (number only) |

## 9. Gait
| I need | Headline | File | Catch |
|---|---|---|---|
| Walk footfall order and phase | LH 0, LF **0.16** (wolf), RH 0.50, RF ~0.66–0.70 | `missingfound/walk-footfall-and-muybridge/`; `gait/REPORT.md` §1 | see section 1 (pending) |
| Duty factor | walk ~0.58–0.65; trot 0.42–0.46; gallop 0.15–0.28 (Muybridge) | `fetched/04-gait-curves/duty_phase.csv`; `fetched/05-muybridge/` | — |
| Joint angle through the stride | trot: Humphries 2020 (3D, 10 Labradors); walk: Catavitello 2015 (2D) and the Stark Beagle forelimb walk (3D: shoulder 92–126, elbow 97–138) | `fetched/04-gait-curves/curves.csv`; `fetched/03-dog-model/stark_fore_motion_mean.csv` | Catavitello's carpus and hip use non-standard segments |
| Speeding up a trot | stride length ∝ speed^0.59; cycle time ∝ speed^−0.39; duty ∝ speed^−0.28 fore, ^−0.24 hind | `fetched/04-gait-curves/` (JEB 2025 supplement) | trot only |
| Joint range of motion at walk and trot | walk: shoulder 31, elbow 51, hip 34, stifle 35, hock 33 | `species/wolf.yaml` (`gait`); `gait/REPORT.md` §4 | dog data |
| Speeds | walk ~1.06 m/s; wolf travelling trot 3.6–4.4 m/s | `species/wolf.yaml` | C for the wolf trot |
| Footfall checks against photos | Muybridge plates 704–710, per-frame paw contacts; Maggie's gallop stride 0.25 s, 2.85 m | `fetched/05-muybridge/` (images kept, public domain) | L/R fixes pending (section 1) |
| Our rig against the limits | `./den gait` | `tools/den/den.py` | current dogs fail: elbows 152–177° |
| How to build the gait engine | paw goals in leg-length units, two girdles + flexible spine, IK | `ref/research/procedural/REPORT.md`; `ref/research/prior-art/REPORT.md` lessons | — |

## 10. Behaviour and idle
| I need | Headline | File | Catch |
|---|---|---|---|
| Rates | breathing 15–30/min, panting 5.33 Hz, blink 11.5/min, sniff 5 Hz, shake 4.4 Hz, play bow 2.25 s | `species/wolf.yaml` (`behaviour`); `ref/research/motion/behaviour_numbers.json` | domestic dogs |
| Idle loop | sleep bouts 17–36 min, shake-off at state changes, scent roll 45–70 s, look-around as the main awake state, dawn and dusk activity; 59 behaviours, 46 numbers | `fetched/11-ethograms/SUMMARY.md` | village-dog day budget only in paywalled papers |
| Barks and howls | rhythm and length | `missingfound/face-ear-and-wild-keypoints/` | — |

## 11. Coat colours
| I need | Headline | File | Catch |
|---|---|---|---|
| Wolf, dingo, Carolina Dog | hex per body region (back, flank, belly, legs, mask, inner ear, nose, eye); Carolina ginger to cream, 4 of 5 with a dark mask | `fetched/10-coat-palettes/` | photo lighting not corrected; pick one photo per coat, not the median |

## 12. Keypoint datasets (for new measurements)
| Set | What | Licence | File |
|---|---|---|---|
| StanfordExtra v12 | 12,538 dogs, 20 keypoints (no shoulder, hip or withers), outlines | MIT | `fetched/02-outline-landmarks/data.json` |
| AP-10K + APT-36K | 7,078 dog, wolf and red fox poses, 17 keypoints | CC BY 4.0 / MIT | `fetched/08-wild-keypoints/data.json` (their "shoulder" is at the elbow and "elbow" at the carpus: read its NOTE) |
| AwA-Pose canids | wolf and dog photos | MIT | `ref/awa-pose/canids.json` |
| BADJA, StanfordExtra sample | video frames, 25 sample dogs | as noted | `ref/research/keypoints/` |
| None usable | coyote, jackal, dhole, wild dog, hyena keypoints (SMAL, BITE, DogFLW, Animal Kingdom, Animal3D: all non-commercial or unclear) | — | own clips needed |

## 13. Models you can load and pose
| Model | What | How | Catch |
|---|---|---|---|
| Stark Beagle forelimb | 24 bodies, 43 muscles, 84 coordinates, recorded walk | `python3 -c "import opensim"` + `fetched/03-dog-model/stark_beagle_fore_verified.osim` (clamp negative `min_control` in memory first) | MIT |
| Ellis greyhound hindlimb | 4 bodies, 29 muscles | same, `greyhound_hindlimb_nominal.osim` | CC BY 4.0 |
| Stark full dog | all joints, 158 muscles | `stark_full_linear_spezzoo.osim` | does not initialise yet (bad `min_control`) |
| MuJoCo dog (dm_control) | 62 bodies, 74 joints, 38 actuators | `from dm_control.suite import dog` | Pharaoh Dog proportions; long sims need GrumpyDingo's OK |
| Bone meshes | 70 meshes, raw zips | GrumpyDingo's Drive `den-ledger-everything/ref` (keep it Restricted) | not in the repo |

## 14. Where each topic is explained in depth
- Skeleton and skull sources: `ref/research/skeleton/REPORT.md` · Keypoints: `ref/research/keypoints/REPORT.md` · Gait: `ref/research/gait/REPORT.md` · Motion and behaviour: `ref/research/motion/REPORT.md` · Procedural animation: `ref/research/procedural/REPORT.md`
- Fact-check of the standing anatomy: `ref/research/factcheck/REPORT.md` · Prior art (Spore, WolfQuest, Coros 2011…): `ref/research/prior-art/REPORT.md` · Tools and licence traps: `ref/research/tools/REPORT.md`
- Fetched data: `ref/research/fetched/REPORT.md` (per item: `NOTE.md`, `SUMMARY.md`) · Second search: `ref/research/missingfound/README.md` · Handoff: `docs/claude/DEN-DATA-FETCH-HANDOFF.md`
- Questions and decisions: `docs/claude/DEN-OPEN-QUESTIONS.md` · Still missing: `docs/claude/DEN-DATA-WISHLIST.md` · Measurement sheet: `docs/DEN-CANINE-MEASUREMENT-SHEET.md` · Dog drawing rules: the `den-dog-anatomy` skill

## 15. Credits owed before anything ships (add to `CREDITS`)
StanfordExtra (Biggs et al. 2020, MIT) · Stark, Fischer, Hunt et al. 2021 and the SimTK dog model (MIT, © FSU Jena) · Ellis, Rankin & Hutchinson 2018 greyhound model (CC BY 4.0) · gait papers in `fetched/04-gait-curves/LICENSE.txt` · AP-10K (CC BY 4.0), APT-36K (MIT) · AwA-Pose (MIT) · each CC BY photo in `fetched/10-coat-palettes/NOTE.md` · CC BY papers in `fetched/09`, `fetched/11` and `missingfound/` · Law et al. 2025 data (check licence before shipping derived tables). Public domain (Ellenberger-Baum, Muybridge): a thank-you line.

## 16. Known gaps (no open data anywhere)
Measured dingo or Carolina Dog limb bones · ear rotation angles · jaw angles in behaviour · neck, tail and digit joint ranges · wolf or dingo goniometry · coyote, jackal, dhole, wild dog and hyena keypoints · village-dog daily time budget (paywalled) · walk joint curves in 3D for the hind limb. Optional leads: Koungoulos 2022 dingo thesis (licence unknown), Reusing 2020 Tables 2–3, JEB 2025 main text, our own reference clips.
