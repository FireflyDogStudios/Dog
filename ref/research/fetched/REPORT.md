# Fetched research data: report

Fetched on Oct 6, 2026 by a data-gathering session (branch `claude/new-session-l3ubx0`, on top of `claude/tender-cerf-o68l6u`), following `docs/claude/DEN-DATA-FETCH-PROMPT.md`. Each item folder holds the data, a `NOTE.md` (sources, licences, method, conventions) and the `SUMMARY.md` reproduced below. Only public domain, CC0, CC BY, MIT, BSD or Apache material is stored; everything else is listed as not stored.

## Status at a glance

| # | Item | Status | Main gap |
|---|---|---|---|
| 01 | Skin-over-bone offsets | fetched | one artist's lean short-coated dog (confidence B); plates not stored, URLs in NOTE |
| 02 | Outline landmarks (StanfordExtra) | fetched | full file obtained by GrumpyDingo via the form; 12,538 dogs, no wolf/coyote/Carolina Dog |
| 03 | Dog model (OpenSim) | fetched | Stark files obtained by GrumpyDingo via SimTK; model joint limits are not anatomical (use the walking data) |
| 04 | Gait curves | partly fetched | walk curves only from 2D video (plus the Stark Beagle forelimb walk, item 03); JEB 2025 supplement added (trot only) |
| 05 | Muybridge plates | fetched | left/right paw assignment is a best guess; frame interval known for 2 sequences only |
| 06 | Limb indices (Samuels 2013) | fetched | full CC0 file obtained by GrumpyDingo; two index columns look swapped (flagged) |
| 07 | Dingo and Carolina Dog | partly fetched | no open limb-bone lengths or ear lengths; cited single facts only |
| 08 | Wild canid keypoints | partly fetched | AP-10K / APT-36K have only dog, wolf, fox; Animal Kingdom's terms forbid commercial use (not usable) |
| 09 | Face and ear | partly fetched | no open ear-rotation or vocal/yawn gape-angle data |
| 10 | Coat palettes | fetched | Carolina Dog from 5 photos (coats range ginger to cream; pick one photo for a specific coat) |
| 11 | Ethograms and time budgets | fetched, with gaps | no numbers for circling, scratching or stretching; no village-dog budget |

## Needs a human

Done by GrumpyDingo on Oct 6 (files handed over via Google Drive, raw zips kept in Drive, not in the repo): the StanfordExtra form (item 02), the SimTK login for the Stark model (item 03) and the Dryad download (item 06). `Full dog model (curved)` and `scale_beagle` carry no licence: only cited facts from them are recorded.

Still open: optionally, the **JEB 2025 main article** (Charles et al., doi 10.1242/jeb.250523, CC BY 4.0); its supplement is in item 04, but the main text is needed to convert its joint extremes to included angles. Nothing else needs a human. **Animal Kingdom** (item 08) was checked on Oct 7: its terms allow non-commercial research only and forbid sharing any part, so it is not usable for the game (details in `08-wild-keypoints/NOTE.md`).

## Item summaries

### 01 skin-offsets: fetched
Source: the dog volume of Ellenberger, Baum, Dittrich & Münch, *Handbuch der Anatomie der Tiere für Künstler* (*Anatomie des Hundes*, 1st edition, Leipzig, ca. 1911–25). Used Tafel 1 (exterior) and Tafel 3 (skeleton drawn inside the body outline). The scans come from UW–Madison Digital Collections, are public domain ("No known copyright"; PD tags on Commons) (not stored here; the plate URLs are in NOTE.md). Measured on Tafel 3 (skeleton and outline on the same plate). Withers height is 1837 px, ground to the skin top of the withers.

| Landmark (bone → skin) | Offset / withers height | Direction |
|---|---|---|
| Withers spine tips | 0.027 | up |
| Scapula top | 0.035 | up |
| Point of shoulder (greater tubercle) | 0.032 | forward |
| Brisket (lowest sternum) | 0.021 | down |
| Olecranon | 0.010 | back |
| Carpus (accessory carpal / front) | 0.007 / 0.009 | back / forward |
| Patella (stifle) | 0.009 | forward |
| Hock (tuber calcanei) | 0.007 / 0.016 | back / up |
| Croup (iliac crest) | 0.012 | up |
| Ischium | 0.030 | back |
| Skull top / occiput | 0.017 / 0.008 | up / back |
| Nose (bone tip → nose) / chin | 0.030 / 0.012 | forward / down |

Precision: ±0.002–0.005 of withers height per landmark. This is one lean, short-coated, cropped-eared dog, so treat the numbers as confidence B. Also includes the 1900 *Textband* standing joint angles (OCR, PD).

Blocked: archive.org `atlasofanimalana0000well` is the 1949 Dover edition, borrow-only (lending library), so it was not used. The 1956 Dover copy on archive.org is an unauthorised upload, also not used. archive.org has no dog plate volume of the German original.

Folder: `01-skin-offsets/`

### 02-outline-landmarks: summary

**Status: fetched.** GrumpyDingo got the full StanfordExtra v12 annotations through the authors' Google form on 2026-10-06.
- **Licence:** MIT; the README says "As of 02-NOV-2024, this dataset is now MIT licensed". The zip carries no other terms.
- **Stored:** `data.json` (14.5 MB): all 12,538 dogs in 120 breeds, with keypoints, the silhouette outline (simplified polygons) and the train/val/test split. No images.
- **Converter:** `convert_stanfordextra.py` re-runs the conversion and the checks.

| What | Number |
|---|---|
| Dogs / breeds | 12,538 / 120 (66-183 per breed) |
| Split (from the .npy files, disjoint, covers all) | train 6,773, val 4,062, test 1,703 |
| Keypoints labelled per dog | up to 20 of 24 (median 13); eyes, withers, throat never labelled |
| Outline points | 790,725 (about 63 per dog); 60 dogs have no outline, 419 have more than one polygon |
| Visible keypoints inside or within 6 px of the outline | 99.25% (161,482 / 162,696) |
| Outline extent vs bbox | median IoU 0.956; bboxes are sometimes loose or wrong, so trust the outline |

## Breeds relevant to us
Keypoints per dog and outline points per dog are averages.

| Breed | Dogs | Train | Val | Test | Keypoints/dog | Outline pts/dog |
|---|---|---|---|---|---|---|
| dingo | 108 | 0 | 108 | 0 | 14.0 | 65 |
| dhole | 102 | 0 | 102 | 0 | 13.2 | 67 |
| African_hunting_dog | 84 | 1 | 83 | 0 | 13.8 | 72 |
| basenji | 157 | 107 | 25 | 25 | 15.3 | 70 |
| kelpie | 87 | 55 | 15 | 17 | 13.8 | 64 |
| Mexican_hairless | 104 | 0 | 104 | 0 | 14.2 | 75 |
| Ibizan_hound | 142 | 96 | 19 | 27 | 16.0 | 71 |
| Siberian_husky | 127 | 77 | 30 | 20 | 14.2 | 62 |
| malamute | 121 | 77 | 23 | 21 | 14.6 | 63 |
| Eskimo_dog | 67 | 46 | 9 | 12 | 14.9 | 66 |
| German_shepherd | 98 | 58 | 24 | 16 | 14.7 | 64 |
| malinois | 100 | 64 | 19 | 17 | 15.0 | 63 |
| Norwegian_elkhound | 143 | 92 | 29 | 22 | 15.5 | 64 |
| Saluki | 139 | 96 | 20 | 23 | 14.9 | 79 |
| whippet | 138 | 91 | 26 | 21 | 14.9 | 76 |
| Irish_wolfhound | 144 | 93 | 21 | 30 | 14.1 | 65 |
| Samoyed | 161 | 47 | 104 | 10 | 12.6 | 61 |
| chow | 93 | 29 | 61 | 3 | 12.4 | 54 |
| keeshond | 75 | 9 | 66 | 0 | 10.9 | 60 |

- There is no wolf, coyote, jackal or Carolina Dog: Stanford Dogs has only domestic breeds plus dingo, dhole and African hunting dog.
- The dingo is the closest match to our hero. Basenji, kelpie, Ibizan hound and Mexican hairless are the nearest pariah or primitive types.

## All breeds (dogs)
Afghan_hound 170, African_hunting_dog 84, Airedale 131, American_Staffordshire_terrier 95, Appenzeller 92, Australian_terrier 119, Bedlington_terrier 131, Bernese_mountain_dog 129, Blenheim_spaniel 138, Border_collie 79, Border_terrier 96, Boston_bull 92, Bouvier_des_Flandres 109, Brabancon_griffon 90, Brittany_spaniel 91, Cardigan 98, Chesapeake_Bay_retriever 97, Chihuahua 119, Dandie_Dinmont 118, Doberman 95, English_foxhound 122, English_setter 75, English_springer 75, EntleBucher 149, Eskimo_dog 67, French_bulldog 95, German_shepherd 98, German_short-haired_pointer 74, Gordon_setter 67, Great_Dane 110, Great_Pyrenees 136, Greater_Swiss_Mountain_dog 104, Ibizan_hound 142, Irish_setter 71, Irish_terrier 87, Irish_water_spaniel 80, Irish_wolfhound 144, Italian_greyhound 122, Japanese_spaniel 145, Kerry_blue_terrier 130, Labrador_retriever 83, Lakeland_terrier 115, Leonberg 162, Lhasa 66, Maltese_dog 183, Mexican_hairless 104, Newfoundland 87, Norfolk_terrier 95, Norwegian_elkhound 143, Norwich_terrier 119, Old_English_sheepdog 84, Pekinese 104, Pembroke 98, Pomeranian 98, Rhodesian_ridgeback 134, Rottweiler 76, Saint_Bernard 88, Saluki 139, Samoyed 161, Scotch_terrier 67, Scottish_deerhound 131, Sealyham_terrier 151, Shetland_sheepdog 75, Shih-Tzu 160, Siberian_husky 127, Staffordshire_bullterrier 99, Sussex_spaniel 108, Tibetan_mastiff 98, Tibetan_terrier 117, Walker_hound 103, Weimaraner 79, Welsh_springer_spaniel 101, West_Highland_white_terrier 80, Yorkshire_terrier 89, affenpinscher 78, basenji 157, basset 126, beagle 129, black-and-tan_coonhound 94, bloodhound 102, bluetick 110, borzoi 113, boxer 77, briard 93, bull_mastiff 83, cairn 120, chow 93, clumber 78, cocker_spaniel 80, collie 84, curly-coated_retriever 96, dhole 102, dingo 108, flat-coated_retriever 76, giant_schnauzer 83, golden_retriever 75, groenendael 83, keeshond 75, kelpie 87, komondor 89, kuvasz 89, malamute 121, malinois 100, miniature_pinscher 111, miniature_poodle 102, miniature_schnauzer 77, otterhound 113, papillon 154, pug 108, redbone 83, schipperke 86, silky_terrier 109, soft-coated_wheaten_terrier 79, standard_poodle 86, standard_schnauzer 88, toy_poodle 81, toy_terrier 139, vizsla 88, whippet 138, wire-haired_fox_terrier 105.

Folder: `02-outline-landmarks/`

### 03-dog-model: summary

**Status: fetched.**
- **Stark et al. 2021 dog model (SimTK `dogmodel`, MIT):** **fetched**.
  - GrumpyDingo downloaded the packages by hand from SimTK, which needs a login, on 2026-10-06 and handed them over on Google Drive.
  - Extracted for the Shepherd-sized full model (`full_linear`) and the Beagle forelimb paper model (`forelimb_verified`): all bodies, joints, axes and coordinates, default-pose joint centres, side-view landmarks, segment lengths, muscle path points, side-view bone outlines, and the Beagle's walking forelimb kinematics.
  - Both raw `.osim` files are kept (MIT).
  - `full_curved` and `scale_beagle` show no licence, so only facts from them are recorded.
- **Greyhound hindlimb model** (Ellis, Rankin & Hutchinson 2018; figshare; CC BY 4.0): **fetched earlier, unchanged**.

## Stark model: key numbers
WH = withers height: ground (lowest paw-mesh point) to the top of the first thoracic spinous processes, at the model's default pose. Lengths are 3D distances between joint centres (right side).

| Quantity | Full model (Shepherd size) | Beagle (verified) | WH fraction (Shepherd / Beagle) |
|---|---|---|---|
| Withers height | 0.617 m (0.635 m to the scapula top) | 0.356 m (0.388 m to the scapula top) | 1 |
| Scapula (top of blade → shoulder) | 0.213 m | 0.128 m | 0.345 / 0.358 |
| Humerus (shoulder → elbow) | 0.146 m | 0.088 m | 0.237 / 0.246 |
| Antebrachium (elbow → carpus) | 0.193 m | 0.116 m | 0.313 / 0.325 |
| Carpus + metacarpus (carpus → MCP) | 0.100 m | 0.060 m | 0.163 / 0.169 |
| Fore digits (MCP → claw tip, EST) | 0.073 m | 0.044 m | 0.118 / 0.122 |
| Femur (hip → stifle) | 0.170 m | 0.102 m | 0.276 / 0.287 |
| Tibia (stifle → hock) | 0.219 m (tibia/femur 1.28) | 0.131 m | 0.354 / 0.368 |
| Tarsus + metatarsus (hock → MTP) | 0.134 m | 0.081 m | 0.218 / 0.226 |
| Hind digits (MTP → claw tip, EST) | 0.073 m | 0.044 m | 0.118 / 0.122 |
| Thoracic + lumbar spine (joint centres) | 0.277 + 0.206 m | 0.222 + 0.165 m | |
| Neck; head (atlanto-occipital → nose) | 0.182; 0.211 m | 0.146; 0.169 m | |
| Tail (straight, lumbosacral → tip) | 0.411 m | 0.328 m | |

Notes on the table:
- **Scaling:** the Beagle file is the full model scaled ×0.6 (limbs and pelvis) and ×0.8 (trunk), from `scale_beagle`; that file's licence is unstated, so only its facts are used. Ratios within a limb are therefore identical in both models.
- **Default-pose side angles:** shoulder 126°, elbow 130°, carpus 217° on the palmar side (overextended; the default, not a measured stance), hip 135°, stifle 146°, hock 120°.

## Joint ranges
- **The model's coordinate ranges are not anatomical.** Every sagittal coordinate is clamped to ±180° and every other rotation to ±90°.
- **The measured ranges are the Beagle walk** (left forelimb, trials 03-10, mean curve; `stark_fore_motion_mean.csv`):

| Joint (side-view angle) | Mean min…max | At touchdown | All trials min…max |
|---|---|---|---|
| Shoulder (cranial side) | 92…126° | 125° | 87…131° |
| Elbow (caudal side) | 97…138° | 121° | 94…145° |
| Carpus (palmar side; >180 = overextended) | 75…193° | 176° | 68…196° |
| MCP (palmar side) | 138…268° (swing value doubtful) | 139° | 129…278° |
| Scapula inclination from vertical | 14…43° | 41° | 11…44° |

- **Stance timing:** forepaw stance lasts 0 → 62-65 % of the stride, a walk with a duty factor of about 0.64. Peak vertical GRF is about 97 N, about 72 % of body weight.

## Greyhound hindlimb model (unchanged)
| Quantity | Value | Source |
|---|---|---|
| Femur, hip → stifle centre | 0.186 m | Ellis 2018 .osim |
| Tibia, stifle → hock centre | 0.199 m (tibia/femur 1.07) | same |
| Metatarsus; toes | ~0.106 m; ~0.052 m (EST) | bone-mesh bounds |
| Hip / stifle / hock clamps | −120…+35° / included 180…45° / included 45…165° | .osim |

## Not stored
- The `.obj` meshes (about 145 MB per package).
- `full_curved` and `scale_beagle.xml` (no licence shown).
- The duplicate `fore_low.osim`, the working-version `.osim`/`.jnt`/`.msl` files, the raw `.mot`/`.sto`/`.xml` files (their kinematics are extracted), and the static-optimisation and inverse-dynamics results.
- Details and doubts are in `NOTE.md`.

Folder: `03-dog-model/`

### 04-gait-curves: summary

**Status: partly fetched.**
- **Full curves:** angle-vs-%-stride curves for all six joints at walk and trot, from Catavitello 2015 (6 retrievers, 2D video). Trot curves for all six joints from Humphries 2020 raw 3D markers (10 Labradors).
- **Partial curves:** Fischer 2018 gives 8-point stifle curves (fluoroscopy) and hock curves (markers) for 4 breeds at walk and trot.
- **Event angles (added Oct 7):** Goldner 2018 (8 Beagles, sound trot, 1.4 m/s treadmill; CC BY, data CC0) gives touchdown, lift-off, stance and swing min/max/ROM for all six joints, both sides: 96 rows in `joint_extremes.csv` (`source_id` goldner2018). Already included angles (180 = straight), checked against the segment angles; the hip uses a pelvic axis defined in a paper that is not open (Goldner 2015).
- **JEB 2025 supplement (added Oct 7, `jeb2025`):** Charles et al., "The biomechanics of working dog locomotion I: Steady-state trotting" (J Exp Biol 228: jeb250523, CC BY 4.0). Only the supplement was obtained (GrumpyDingo downloaded it by hand; the main article is still blocked). It has **no curves and no walk data**: 27 dogs (10 Labradors, 7 Shepherds, 10 Spaniels), 3D markers into breed-specific OpenSim models, trot only. We stored 10 speed-scaling exponents in `duty_phase.csv` and 18 trot joint-extreme rows in `joint_extremes.csv` (model-coordinate magnitudes back-transformed from a log-log regression at Froude 1; **not included angles**, convention undetermined; only the derived ROM is comparable). Nothing added to `curves.csv`.
- **Units:** all angles are included angles, 180 = straight (except the `jeb2025` coordinate rows, flagged).
- **Missing:** still no open walk curves from 3D marker data (the JEB supplement did not change this: walk curves come only from Catavitello's 2D video, plus Fischer's 8-point stifle and hock walk points); the hip is non-standard in one source.

| Trot (included °, min–max of mean curve) | Humphries 2020, Labrador, 3D | Catavitello 2015, retrievers, 2D |
|---|---|---|
| Shoulder | 100–134 | 120–156 |
| Elbow | 76–134 | 105–155 |
| Carpus (>180 hyperext.) | 88–217 | 97–237 (toe-tip segment, inflated) |
| Hip | 133–159 (S1–GT–LFC) | 57–96 (trunk–thigh, not anatomical) |
| Stifle | 104–163 | 100–149 |
| Tarsus | 99–161 | 107–160 |

| Goldner 2018 Beagle sound trot, left limb (included °) | Touchdown | Lift-off | Stance min–max | Swing min–max |
|---|---|---|---|---|
| Shoulder | 106 | 93 | 93–106 | 91–110 |
| Elbow | 103 | 113 | 97–125 | 60–111 |
| Carpus | 195 | 120 | 120–208 | 79–194 |
| Hip (own axis) | 98 | 117 | 98–117 | 95–117 |
| Stifle | 139 | 123 | 121–139 | 93–145 |
| Tarsus | 135 | 156 | 116–156 | 109–156 |

| Gait numbers | Walk | Trot |
|---|---|---|
| Duty factor fore / hind | 0.59 / 0.58 (Catavitello) | 0.46 / 0.42 (Humphries raw); 0.455 / 0.425 (Catavitello) |
| Hind duty factor, 4 breeds (Fischer 2018) | 0.56–0.64 | 0.39–0.47 |
| Touchdown phase LF / RH / RF (LH = 0) | 0.135 / 0.49 / 0.63 (Catavitello) | 0.44–0.45 / 0.49–0.51 / 0.94–0.96 |
| Stride frequency | 1.46 Hz | 2.0 Hz |

| Trot speed scaling (Charles 2025, 27 dogs; log-log slopes vs velocity) | Exponent (95% CI) |
|---|---|
| Cycle time | −0.39 (−0.44 to −0.33) |
| Stride length fore / hind | 0.59 / 0.59 |
| Duty factor fore / hind | −0.28 (−0.41 to −0.15) / −0.24 (−0.36 to −0.12) |

So within the trot, going faster mostly lengthens the stride (v^0.59) and shortens the cycle a little less (v^−0.39); duty factor drops slowly. Joint extremes hardly change with speed (only maximum stifle extension has a significant slope).

| Trot ROM, degrees | Charles 2025 (OpenSim, EST) | Humphries 2020 LRD | Goldner 2018 Beagle L |
|---|---|---|---|
| Shoulder | 60 | 40 | 19 |
| Elbow | 65 | 69 | 65 |
| Carpus | 123 | 138 | 129 |
| Hip | 61 | 34 | 22 |
| Stifle | 63 | 64 | 52 |
| Tarsus | 73 | 69 | 47 |

**Blocked or not stored:**
- JEB 2025 "Working dog locomotion I": the **main article** is still blocked (host 403 on Oct 6 and 7, no Europe PMC full text, no preprint or data deposit); its supplement is in hand and used. Its mean joint curves (if any) and spatiotemporal means are in the main text only.
- Goldner 2015 (Vet J), which defines Goldner 2018's angles: not open access.
- Pit Bull 2021 and Beagle young/old 2017: CC BY-NC.
- Agostinho 2011, Hottinger 1996 and Fischer & Lilje's book: not open access.
- PMC pages: CAPTCHA (we used Europe PMC instead).
- Humphries' German shepherd raw trials were too short for full strides.
- Humphries' kinetic files: too large to download.
- See NOTE.md for details and conversions.

Folder: `04-gait-curves/`

### 05-muybridge: summary

**Status: fetched.** All 7 plates (704-710) are kept as public-domain images under 2 MB each (8 files, 9 MB in total), with per-frame contact scoring in `data.json`.
- Sources: Wikimedia Commons scans from USC Digital Library and Boston Public Library; Muybridge, *Animals in Motion* (1902, archive.org).
- **Footnote:** the hand-stamped plate numbers 709 and 710 are swapped between the BPL and USC copies, so the data calls the two Maggie sequences A and B.

| Plate | Dog, gait | Interval | Touchdown order (L/R assumed) | Duty factor: fore, hind (frames in stance) | Feet down ÷ 4 |
|---|---|---|---|---|---|
| 704 | Dread, walk (oblique views) | not given | not scored | n/a | 0.71-0.77 |
| 705 | Dread, trot (oblique views) | not given | not scored | n/a | 0.48-0.62 |
| 706 | Smith, "trot" (really an irregular lateral-sequence walk or amble) | **0.110 s** (1902, Series 39) | LH, LF, RH, RF | LF 0.45, RF 0.64; LH 0.78, RH 0.82 | 0.58 |
| 707 | Dread, rotary gallop, one suspension | not given | RH, LH, LF, RF, suspension | 0.25-0.43; 0.25 | 0.28 |
| 708 | Ike, rotary gallop, two suspensions (blurred) | not given | LF, (RF?), suspension, RH, LH, suspension | 0-0.4; 0.1-0.3 | 0.17 |
| Maggie A (709 BPL = 710 USC) | rotary gallop, two suspensions | not given | RH, LH, suspension, LF, RF, suspension | about 0.2-0.25; 0.2-0.3 | 0.21 |
| Maggie B (710 BPL = 1902 Series 56) | rotary gallop, two suspensions | **0.049 s**; stride 0.25 s, 2.85 m | LF, RF, suspension, RH, LH, suspension | 0.2-0.3; about 0.1 | 0.15 |

**What the numbers say:**
- Gallop duty factors are about 0.15-0.28, slightly below the 0.25-0.35 estimate in `gait/REPORT.md`.
- Maggie B's contact time is about 1-2 frames, roughly 50-100 ms.
- The mastiff walk's duty factor is about 0.75.

**Blocked:**
- Commons originals and non-standard thumbnail widths returned HTTP 429, so standard thumbnail widths were used.
- No frame interval exists for 704, 705, 707, 708 or Maggie A.
- Left/right limb identity is an assumption; the fore/hind order is observed.

Folder: `05-muybridge/`

### 06-limb-indices: summary

**Status: fetched.** GrumpyDingo downloaded the dataset by hand (Dryad, CC0 1.0) on 2026-10-06.
- `samuels2013_full.txt`: the full data file, 150 taxa.
- `README_dryad.txt`: the README, verbatim.
- `data.csv`: 20 living canids, 4 hyenas and 13 fossil canids, with every original column plus computed ratios.

The index formulas are now confirmed from the data (see NOTE.md). Two things to know:
- The file's `OLI` and `URI` headers look swapped.
- The dhole's own BI/IM values disagree with its measurements.

## Living canids and hyenas (lengths in mm; BI, CI, IM from the file; MC3/Ra and MT3/Ti computed here)
| Species | Ecology | HuL | RaL | MC3L | FeL | TiL | MT3L | BI Ra/Hu | CI Ti/Fe | MC3/Ra | MT3/Ti | IM |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Canis lupus (wolf) | cursorial | 212.1 | 210.9 | 89.3 | 229.5 | 233.7 | 98.6 | 0.998 | 1.018 | 0.423 | 0.422 | 0.913 |
| Canis latrans (coyote) | cursorial | 160.1 | 168.3 | 68.3 | 179.7 | 187.9 | 77.7 | 1.052 | 1.046 | 0.406 | 0.413 | 0.893 |
| Canis mesomelas | cursorial | 139.0 | 142.7 | 58.5 | 147.8 | 156.4 | 65.0 | 1.027 | 1.058 | 0.410 | 0.416 | 0.926 |
| Canis adustus | cursorial | 127.8 | 135.9 | 57.4 | 138.6 | 146.7 | 63.5 | 1.063 | 1.058 | 0.423 | 0.433 | 0.924 |
| Lycaon pictus (African wild dog) | cursorial | 189.8 | 199.1 | 79.0 | 209.7 | 215.1 | 88.7 | 1.050 | 1.025 | 0.397 | 0.413 | 0.915 |
| Cuon alpinus (dhole) | cursorial | 150.5 | 141.4 | 71.5 | 168.6 | 162.4 | 82.1 | 0.860* | 0.963 | 0.505 | 0.506 | 0.846* |
| Chrysocyon brachyurus | generalist | 253.7 | 264.9 | 112.1 | 270.4 | 295.2 | 128.7 | 1.045 | 1.092 | 0.423 | 0.436 | 0.917 |
| Vulpes vulpes | cursorial | 126.9 | 123.7 | 52.1 | 134.2 | 147.6 | 67.7 | 0.975 | 1.100 | 0.421 | 0.459 | 0.890 |
| Alopex (Vulpes) lagopus | generalist | 106.5 | 101.9 | 42.3 | 106.9 | 123.3 | 52.8 | 0.957 | 1.154 | 0.415 | 0.428 | 0.906 |
| Vulpes macrotis | cursorial | 90.3 | 87.0 | 35.5 | 94.7 | 107.5 | 48.7 | 0.948 | 1.136 | 0.408 | 0.453 | 0.884 |
| Vulpes zerda | cursorial | 70.7 | 65.9 | 25.2 | 73.3 | 89.0 | 37.8 | 0.932 | 1.214 | 0.383 | 0.425 | 0.842 |
| Otocyon megalotis | cursorial | 103.6 | 106.8 | 43.7 | 115.4 | 123.9 | 55.4 | 1.023 | 1.073 | 0.409 | 0.447 | 0.881 |
| Lycalopex gymnocerus | cursorial | 107.6 | 101.1 | 39.6 | 116.6 | 124.6 | 52.6 | 0.940 | 1.067 | 0.391 | 0.422 | 0.865 |
| Lycalopex sp. | cursorial | 94.3 | 90.1 | 37.9 | 106.2 | 114.4 | 45.8 | 0.955 | 1.076 | 0.421 | 0.400 | 0.836 |
| Cerdocyon thous | generalist | 105.3 | 98.5 | 45.1 | 120.0 | 120.3 | 53.3 | 0.936 | 1.004 | 0.458 | 0.443 | 0.850 |
| Atelocynus microtis | generalist | 116.0 | 107.8 | 46.9 | 139.5 | 125.8 | 55.2 | 0.929 | 0.902 | 0.435 | 0.439 | 0.844 |
| Speothos venaticus | generalist | 100.4 | 79.8 | 35.9 | 105.3 | 95.3 | 39.1 | 0.794 | 0.906 | 0.450 | 0.410 | 0.898 |
| Nyctereutes procyonoides | generalist | 83.9 | 73.3 | 35.8 | 92.8 | 95.3 | 41.9 | 0.874 | 1.026 | 0.488 | 0.440 | 0.836 |
| Urocyon cinereoargenteus | generalist | 99.0 | 87.1 | 33.0 | 108.6 | 114.5 | 50.8 | 0.880 | 1.054 | 0.380 | 0.444 | 0.834 |
| Urocyon littoralis | generalist | 75.9 | 66.2 | 29.3 | 84.0 | 88.6 | 39.1 | 0.874 | 1.054 | 0.442 | 0.441 | 0.823 |
| Crocuta crocuta (spotted hyena) | cursorial | 214.8 | 228.1 | 67.5 | 237.8 | 199.3 | 88.0 | 1.063 | 0.841 | 0.296 | 0.442 | 1.014 |
| Hyaena brunnea (brown hyena) | cursorial | 198.3 | 218.6 | 82.2 | 221.7 | 181.2 | 81.1 | 1.102 | 0.818 | 0.376 | 0.447 | 1.035 |
| Hyaena hyaena (striped hyena) | cursorial | 198.7 | 222.7 | 78.9 | 211.4 | 187.4 | 84.7 | 1.121 | 0.887 | 0.354 | 0.452 | 1.057 |
| Proteles cristatus (aardwolf) | generalist | 120.5 | 129.9 | 59.6 | 126.6 | 128.8 | 57.4 | 1.079 | 1.018 | 0.459 | 0.445 | 0.981 |

\* Dhole: from its own means, RaL/HuL = 0.940 and IM = 0.882; the file's BI and IM disagree (see NOTE.md).

**For the game.** In wolf-like canids the radius is about as long as the humerus (BI about 1.0) and the tibia about as long as the femur (CI about 1.02-1.06). The metapodials are about 0.41-0.42 of the radius or tibia. Hyenas differ: fore longer than hind (IM > 1), a short tibia (CI about 0.82-0.89) and a short metacarpal (MC3/Ra about 0.30-0.38). The earlier wolf brachial index (0.994) holds; the file gives 0.998. Law et al. 2025 give 1.02 (`ref/research/skeleton`).

Folder: `06-limb-indices/`

### 07-dingo: summary

**Status: partly fetched.**
- Found: dingo shoulder height, body length, tail, weight and skull numbers from cited sources, plus a few Carolina Dog breed-standard facts and New Guinea dog skulls.
- **Not found:**
  - measured dingo limb-bone lengths (only EST back-calculated from height);
  - dingo or Carolina Dog ear length;
  - any Carolina Dog skeletal data.

| Measure | Value | Source (conf.) |
|---|---|---|
| Dingo shoulder height | 542 mm mean (464-615), n=117 | Koungoulos 2024 Sci Rep, PMC11411105 (B) |
| Dingo shoulder height | 440-620 mm; wild M 590 / F 560 | Australian Museum; Smith 2015 via Wikipedia (C) |
| Dingo body length / tail | 860-1230 / 260-380 mm | Australian Museum (C) |
| Dingo weight | 15 kg avg (12-24) | Ballard & Wilson 2019, CC BY (B) |
| Dingo condylobasal length | 176.9 mm (147-200), n=63 | Crowther 2014 J Zool (A) |
| Dingo skull length (inion-prosthion) | 189.0 mm | Crowther 2014 (A) |
| Dingo viscerocranium / palate width | 90.8 / 59.0 mm | Crowther 2014 (A) |
| Carolina Dog height / weight | 457-610 mm / 15.9-22.7 kg | CDFA/AKC standard (C) |
| Dingo femur / humerus (EST) | ~177 / ~166 mm | inverted Harcourt 1974 (EST, verify) |

**Blocked:**
- Wiley returned 403, so Crowther 2014 was read from a third-party copy; numbers only.
- Smith et al. 2019 and Jackson et al. 2017 Zootaxa are restricted.
- No bulk tables were stored. The only openly licensed (CC BY / CC0) sources are Ballard 2019/2023 and the Plazi treatments.

Folder: `07-dingo/`

### 08-wild-keypoints: summary

**Status: partly fetched.** AP-10K (CC BY 4.0) and APT-36K (MIT) annotations downloaded (annotation JSON only, no images) and the canid entries converted to `data.json`. But these two sets only contain **dog, wolf and (red) fox**: no coyote, jackal, dhole, African wild dog, dingo, arctic/fennec/grey fox, hyena or raccoon dog. AP-10K lists "arctic fox" as a category but it has 0 labelled instances.

| species | AP-10K instances (images) | APT-36K instances (frames, clips) |
|---|---|---|
| dog | 1129 (1000) | 2275 (1193, 80) |
| wolf | 261 (200) | 1670 (1195, 80) |
| fox | 222 (200) | 1521 (1200, 80) |
| arctic fox | 0 | – |
| hyenas, jackal, coyote, dhole, African wild dog, dingo, raccoon dog | – | – |

17 keypoints (eyes, nose, neck, tail root, 3 per leg), y down, `[x,y,v]`. Total 7,078 instances, 3.3 MB.

Blocked / not stored: **Animal Kingdom** (no dataset licence, Google Form download): the only source found with hyena, jackal, coyote, dingo and African wild dog; needs the authors' permission. APT-36K ships no LICENSE file (MIT stated in its README only). No host failures.

Folder: `08-wild-keypoints/`

### 09-face-and-ear: summary

**Status: partly fetched.** Jaw timing and head tilt have open numbers. Ear rotation angles and durations: **not found** in any open source (DogFACS codes ear actions only as events). Jaw angle during panting, barking, howling or yawning: **not found**.

| Quantity | Value | n | Source (licence) | Conf. |
|---|---|---|---|---|
| Chewing mouth opening (canine gap) | 2.51 ± 0.33 cm (1.93–2.95) | 6 beagles | Goldschmidt 2025, PMC12268705 (CC BY) | A |
| Chewing frequency | 2.59 Hz (2.37–2.93 by food) | 6 beagles | Goldschmidt 2025 (CC BY) | A |
| Yawn duration | 2.04 ± 0.59 s (breeds 1.43–2.83) | 272 yawns, 198 dogs | Gallup 2020, PMC7319467 (CC BY-NC, fact only) | A |
| Panting rate | rest ~47 → plateau 287 → max 374 /min (4.8–6.2 Hz) | 5 dogs | do Nascimento 2026, PMC13260287 (CC BY) | B |
| Head-tilt amplitude | median 16°, IQR 8.5–29°, range 2–90° | ~132 tilts, 41 dogs | Buckley 2025 Fig. 3, digitised, PMC12609352 (CC BY) | C |
| Head-tilt time course (one example) | rise ~0.7 s to +30°, slow return over ~10 s | 1 | Buckley 2025 Fig. 2 (CC BY) | C |
| Head-tilt rate, familiar words | 1.1 ± 2.0 per 30 s (0–10) | 103 dogs | Buckley 2025 Table 1 (CC BY) | A |
| Max gape (known, not redone) | 44 ± 4° dogs; 65° dingo model | — | Thomson 2021; Bourke 2008 (CC BY) | B |

**Blocked:** PNAS lapping paper (Gart 2015) and Biol Lett lapping paper (Crompton 2011) are not in the OA subset, and pnas.org returned 403. DataverseNL (cross-species yawn data) returned 504 ×3. The OSF head-tilt data has no licence, so it was not stored (it has counts only). MDPI/PMC figure URLs returned 403; the figures came via the Europe PMC supplementary package.

Folder: `09-face-and-ear/`

### 10-coat-palettes: summary

**Status: fetched** (updated 2026-10-07).
- Wolf: 4 photos. Dingo: 7 photos (6 contribute to the summary). Carolina Dog: **5 photos** (4 public domain, 1 CC BY 2.0).
- The 4 photos that Wikimedia rate limits blocked on Oct 6 were all fetched on Oct 7.
- Colours are sRGB hex: the per-channel median across photos of trimmed-median patches. The number of contributing photos is in brackets.
- Per-photo values and box coordinates are in `data.json`; sources, authors and caveats are in `NOTE.md`.

| Region | Gray wolf | Dingo | Carolina Dog |
|---|---|---|---|
| back | #918e72 (3) | #c0774e (5) | #8b6958 (5) |
| flank | #a0917b (3) | #ad6f47 (5) | #9f825f (5) |
| belly | #b8a58f (1) | #867662 (2) | #b3a698 (1) |
| chest | — | — | #dbcec6 (1) |
| legs | #c5ab8f (3) | #a48472 (4) | #7c5f40 (4) |
| face mask (cheek/muzzle side) | #d0cfc5 (4) | #cacac0 (4) | #584338 (5) |
| muzzle top | #bb997e (3) | #ac7e4d (4) | #b2a3a6 (2) |
| brow | — | #907a66 (2) | #d4b6a6 (2) |
| ear inside | #9ea8a7 (3) | #422f15 (5) | #504032 (5) |
| nose | #29272c (4) | #252327 (5) | #212627 (5) |
| eye | #6c5744 (3) | #413826 (5) | #3e312b (5) |

**Notes:**
- **Face mask:** pale for wolf and dingo. For the Carolina Dog it is the **dark muzzle mask** in 4 of 5 dogs (#4f4138 to #867470); only the pale Flickr dog has a pale mask (#aca6b1). The median, #584338, follows the dark-mask majority.
- **Carolina Dog coat** ranges from darker ginger (back #7d6958 to #8b643d in the 2002 photos) through light red-fawn (back #eabb9f, DixieDingo 0019) to pale cream (back #d3bcb9, Flickr). Pick per-photo values for a specific coat.
- Regions with only one or two photos (the Carolina Dog's belly, chest, muzzle top and brow; the wolf's belly) are weak.
- Lighting is not normalised. Dingo backs run from sunlit #f8cc92 to overcast #6f4f3b.

**Sources:** 16 photos. 15 are from Wikimedia Commons (9 CC BY 2.0, 4 public domain, 1 CC0, 1 CC BY 4.0) and 1 is from Flickr via Openverse (CC BY 2.0). All other Carolina Dog files on Commons are CC BY-SA, so they were not used.

**Blocked or limited:**
- Wikimedia originals were still rate-limited (HTTP 429) on Oct 7, so we used standard thumbnails instead. Carolinadog20020713a.jpg was only available at 500 px.
- Three more CC BY photos of the same Flickr dog were not used, because it is the same individual.

Folder: `10-coat-palettes/`

### 11-ethograms: summary

**Status: fetched, with gaps.** `data.json` holds 59 behaviour definitions (paraphrased, in the 14 Animal Kingdom groups), 46 sourced numbers and 2 bulk tables (CC BY/CC0). The NC3RS PDF has no canids and is © for personal use only, so it is not stored. Rose & Riley 2021 (CC BY) gives the method: states go in a time budget, events are counted as rates.

| Quantity | Value | n | Source (licence) | Conf. |
|---|---|---|---|---|
| Wild dingo, time stationary | 91% of 24 h in summer, 46% in winter; crepuscular | 7 | Tatler 2021 (CC BY/CC0) | A |
| Farm dog, sleep / rest / active | 11.1 / 5.7 / 7.2 h per day | 8 | Wang 2026 (CC BY) | A |
| Pet dog, daytime | 745 min sedentary (598 of them sleep-like), 185 light, 24 vigorous | 15 | Smedberg 2026 (CC BY) | A |
| Sleep-like bout, pet dog | ~17 min by day, ~20 min at night | 15 | Smedberg 2026 | A |
| Night sleep, kennel | 9.7 h in 16 bouts (~36 min each, derived) | 13 | Schork 2024 (CC BY) | A/C |
| Night 00–04 h, pet dog | 6% active; 6.7 inactive bouts over 15 min per 4 h | 21 | van der Laan 2023 (CC BY) | A |
| Awake 10 min, shelter dog | look around 38%, lie 25%, walk 20%, sniff 5.5%, drink 1.3% | 16 | Buso 2026 (CC BY) | A |
| Shake-off at a behaviour switch | 89% of shakes (107/120) | 96 dogs | Bryce 2024 (CC BY) | A |
| Wolf scent roll | ~70 s per day per female; ~47 s per response | 2 | Boić 2024 (CC BY) | B/C |
| Play bow | ~0.64 per play session | 24 | Maglieri 2023 (CC BY-NC, fact only) | B |

The shelter-dog shares are computed from Buso's dataset and cover the 10 minutes right after an enrichment session, so they run livelier than baseline.

**Suggested idle loop for the hero (game time compressed):**
- **States:** sleep, curled (real bouts 17–36 min); lie with head up; sit or stand and look around (the most common awake state); potter about; sniff the ground.
- **Events between states:** shake-off at each state change; stretch and yawn (~2 s) on getting up; occasional scratch; rare scent roll (~45–70 s) when a new smell appears; play bow (~2 s) only to start play.
- **Weighting by day:** about 60% sleep-like, 15% resting awake, 20% light activity, 3% vigorous. Bias activity toward dawn and dusk, as dingoes do.

**Gaps and blocks:**
- No sourced number for circling before lying down, scratching, or stretching.
- No free-ranging Indian dog budget: Banerjee & Bhadra 2021 is paywalled; Sen Majumder 2014 is not in Europe PMC.
- bioRxiv returned 429 three times (Biswas 2026 resting-group preprint skipped).
- MDPI returned 403; Rose & Riley came from the figshare mirror.

Folder: `11-ethograms/`
