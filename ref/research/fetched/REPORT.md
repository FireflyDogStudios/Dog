# Fetched research data: report

Fetched on Oct 6, 2026 by a data-gathering session (branch `claude/new-session-l3ubx0`, on top of `claude/tender-cerf-o68l6u`), following `docs/claude/DEN-DATA-FETCH-PROMPT.md`. Each item folder holds the data, a `NOTE.md` (sources, licences, method, conventions) and the `SUMMARY.md` reproduced below. Only public domain, CC0, CC BY, MIT, BSD or Apache material is stored; everything else is listed as not stored.

## Status at a glance

| # | Item | Status | Main gap |
|---|---|---|---|
| 01 | Skin-over-bone offsets | fetched | one artist's lean short-coated dog (confidence B); plates not stored, URLs in NOTE |
| 02 | Outline landmarks (StanfordExtra) | partly fetched | full file behind a Google form; outlines for the 25 MIT sample dogs only |
| 03 | Dog model (OpenSim) | partly fetched | Stark 2021 model files need a SimTK login; greyhound hindlimb model fully extracted |
| 04 | Gait curves | partly fetched | walk curves only from 2D video; JEB 2025 unreachable |
| 05 | Muybridge plates | fetched | left/right paw assignment is a best guess; frame interval known for 2 sequences only |
| 06 | Limb indices (Samuels 2013) | partly fetched | Dryad download needs login / anti-bot wall; 5 canid rows only, no hyenas |
| 07 | Dingo and Carolina Dog | partly fetched | no open limb-bone lengths or ear lengths; cited single facts only |
| 08 | Wild canid keypoints | partly fetched | AP-10K / APT-36K have only dog, wolf, fox; Animal Kingdom has no licence |
| 09 | Face and ear | partly fetched | no open ear-rotation or vocal/yawn gape-angle data |
| 10 | Coat palettes | fetched (Carolina Dog partly) | Carolina Dog from 2 photos (Wikimedia rate limits, most photos CC BY-SA) |

## Needs a human

1. **StanfordExtra full annotations** (item 02): fill in the form at https://forms.gle/sRtbicgxsWvRtRmUA; the link arrives by email. `02-outline-landmarks/convert_stanfordextra.py` converts the file once it's available.
2. **Stark 2021 OpenSim dog model** (item 03): log in to SimTK at https://simtk.org/frs/?group_id=2032 and download `Full linear.zip` (MIT) and `scale_beagle.zip` (licence unstated; check before storing).
3. **Samuels et al. 2013 data** (item 06): download the data file and README (CC0, about 52 KB) in a browser from https://datadryad.org/dataset/doi:10.5061/dryad.77tm4.
4. **Animal Kingdom** (item 08): no licence stated and downloads go through a Google form (forms.gle/NipvmReDKaD5zUEw6). Ask the authors for a licence; it is the only source found with hyena, jackal, coyote, dingo and African wild dog keypoints.

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

**Status: partly fetched.** The full StanfordExtra annotations (`StanfordExtra_v12.json`, MIT) are **only available through a Google form**: https://forms.gle/sRtbicgxsWvRtRmUA (the download link arrives by email). GrumpyDingo needs to fill it in. No clean MIT mirror was found: the repo has no copy or release, Hugging Face has no copy, Graviti was unreachable (502), and Ultralytics' copy is AGPL.

| What | Number | Source |
|---|---|---|
| Dogs in the full v12 set (form-gated) | about 12,000, 120 breeds | StanfordExtra README / paper |
| Dogs stored here (MIT sample) | 25 (4 breeds) | `StanfordExtra_sample.json` |
| Keypoints labelled per dog | 20 of 24 (eyes, withers, throat never labelled) | `keypoint_definitions.csv` |
| Outline points stored | 1,734 (about 70 per dog, 1 polygon each) | RLE masks, decoded and simplified here |
| Keypoints inside or within 6 px of the outline | 381 / 383 | check run here |
| Estimated size of the full conversion | about 15 MB | 1.3 KB per dog × 12k |

New here: silhouette outlines for the 25 sample dogs. `convert_stanfordextra.py` is ready to run on the full file once the form is filled in.

Folder: `02-outline-landmarks/`

### 03-dog-model: summary

**Status: partly fetched.**
- **Stark et al. 2021 dog model:** the `.osim` files are behind a SimTK login (the packages are MIT, but there is no public mirror), so they are **not fetched**. The article numbers (CC BY) are recorded instead.
- **Greyhound hindlimb model** (Ellis, Rankin & Hutchinson 2018; figshare; CC BY 4.0): **fetched**. All bodies, joints, axes, ranges and default-pose joint centres are extracted, and the raw `.osim` is kept.

| Quantity | Value | Source |
|---|---|---|
| Greyhound femur, hip→stifle centre | 0.186 m | Ellis 2018 .osim (Knee location_in_parent), scaled subject |
| Greyhound tibia, stifle→hock centre | 0.199 m (tibia/femur 1.07) | same (Ankle location_in_parent) |
| Greyhound metatarsus, hock→MTP; toes | ~0.106 m; ~0.052 m (EST) | bone-mesh bounds, Foot frame |
| Hip ROM (model clamps) flex/ext; abd/add; rot | −120…+35°; −15…+45°; −30…+40° | .osim Hip_Ry / Hip_Rx / Hip_Rz |
| Stifle ROM (Knee_Ry) | 0…135° flexion → included 180…45° | .osim |
| Hock ROM (Ankle_Ry) | −135…−15° → included 45…165° | .osim |
| Default pose | hip −30°, stifle included 130°, hock included 136° | .osim defaults |
| Segment masses | thigh 2.25, shank 0.39, foot 0.15 kg (hindlimb 8.4% BM) | .osim; Ellis 2018 |
| Dog model (Beagle) | 13.8 kg; 84 DOF; 134 muscles; forelimb DOF: scapula 5 (incl. 2 translations), shoulder 3, elbow 2, carpus 2, paw 3 | Stark 2021, text and Table 1 |
| Dog model scaling | Beagle bones ×1.66 (limbs), ×1.25 (spine/neck/head) to fit a German Shepherd muscle model | Stark 2021, Methods |

**Blocked:** SimTK downloads for `dogmodel` need a SimTK login (tried 3×). `web.archive.org` is blocked by egress policy. **Human step:** download `Full linear.zip` (MIT) and `scale_beagle.zip` from https://simtk.org/frs/?group_id=2032 while logged in, then re-run the extraction. The SimTK `greyhoundleg` project has no downloads; figshare has the model.

Folder: `03-dog-model/`

### 04-gait-curves: summary

**Status: partly fetched.**
- **Full curves:** angle-vs-%-stride curves for all six joints at walk and trot, from Catavitello 2015 (6 retrievers, 2D video). Trot curves for all six joints from Humphries 2020 raw 3D markers (10 Labradors).
- **Partial curves:** Fischer 2018 gives 8-point stifle curves (fluoroscopy) and hock curves (markers) for 4 breeds at walk and trot.
- **Units:** all angles are included angles, 180 = straight.
- **Missing:** no open walk curves from 3D marker data; the hip is non-standard in one source.

| Trot (included °, min–max of mean curve) | Humphries 2020, Labrador, 3D | Catavitello 2015, retrievers, 2D |
|---|---|---|
| Shoulder | 100–134 | 120–156 |
| Elbow | 76–134 | 105–155 |
| Carpus (>180 hyperext.) | 88–217 | 97–237 (toe-tip segment, inflated) |
| Hip | 133–159 (S1–GT–LFC) | 57–96 (trunk–thigh, not anatomical) |
| Stifle | 104–163 | 100–149 |
| Tarsus | 99–161 | 107–160 |

| Gait numbers | Walk | Trot |
|---|---|---|
| Duty factor fore / hind | 0.59 / 0.58 (Catavitello) | 0.46 / 0.42 (Humphries raw); 0.455 / 0.425 (Catavitello) |
| Hind duty factor, 4 breeds (Fischer 2018) | 0.56–0.64 | 0.39–0.47 |
| Touchdown phase LF / RH / RF (LH = 0) | 0.135 / 0.49 / 0.63 (Catavitello) | 0.44–0.45 / 0.49–0.51 / 0.94–0.96 |
| Stride frequency | 1.46 Hz | 2.0 Hz |

**Blocked or not stored:**
- JEB 2025 "Working dog locomotion I": CC BY, but the host returned 403 and no data deposit was found.
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

**Status: partly fetched (blocked).**
- Licence confirmed **CC0 1.0** (Dryad API). Metadata saved in `dryad_metadata.json`.
- The data file (50 KB) and README (1.6 KB) could not be downloaded:
  - the Dryad API now needs a login token (401);
  - the web download sits behind an anti-bot proof-of-work wall (403), which was not bypassed;
  - no mirrors were reachable.
- Saved: 5 canid rows (humerus, deltopectoral crest, radius in mm) that the CRAN mvSLOUCH vignette prints from the same CC0 file. **Hyena rows not obtained.**

| Species | HuL mm | RaL mm | Brachial (RaL/HuL) | Source |
|---|---|---|---|---|
| Canis lupus | 212.12 | 210.94 | 0.994 | Samuels et al. 2013 (CC0), via mvSLOUCH vignette |
| Canis latrans | 160.06 | 168.32 | 1.052 | same |
| Canis adustus | 127.84 | 135.86 | 1.063 | same |
| Vulpes lagopus | 106.47 | 101.89 | 0.957 | same |
| Atelocynus microtis | 116.01 | 107.78 | 0.929 | same |

The wolf brachial index of 0.99 agrees with Law et al. 2025 (1.02, in `ref/research/skeleton`). **Needs a human:** download the two files from the Dryad landing page in a browser (CC0). The crural index and other indices need the full file.

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

**Status: fetched.** The wolf and dingo palettes are each built from 4 photos. The Carolina Dog palette is **partly fetched**: only 2 of its 4 permissive photos could be downloaded (HTTP 429). Colours are sRGB hex, the median across photos of trimmed-median patches. Per-photo values and box coordinates are in `data.json`, and sources and authors are in `NOTE.md`.

| Region | Gray wolf | Dingo | Carolina Dog |
|---|---|---|---|
| back | #918e72 | #c0773b | #84664a |
| flank | #a0917b | #ad6832 | #957958 |
| belly | #b8a58f (1 photo) | #867662 | — (not visible) |
| legs | #c5ab8f | #9e6a4e | #7c5f40 |
| face mask (cheek/muzzle side) | #d0cfc5 (pale) | #b5c1bf (pale; one shaded input) | #504238 (dark muzzle mask) |
| muzzle top | #bb997e | #8a6f46 | — |
| ear inside | #9ea8a7 | #4c301f (shaded in profile) | #4c3e30 |
| nose | #29272c | #24252c | #262a2a |
| eye | #6c5744 | #302517 | #3f3633 |

**Sources:** 11 Wikimedia Commons photos (1 CC0, 1 CC BY 4.0, 7 CC BY 2.0, 2 public domain), all listed with authors in NOTE.md. All 12 other Carolina Dog files on Commons are CC BY-SA, so they were not used.

**Blocked:** Wikimedia rate limits (HTTP 429). Not downloaded: Carolinadog20020713a.jpg, DixieDingo 0019.jpg and 2 extra dingo photos. Lighting is not normalised, so the dingo values range from sunlit (#f8cc92) to overcast (#6c4b32).

Folder: `10-coat-palettes/`
