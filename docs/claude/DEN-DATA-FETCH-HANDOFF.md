# Data fetch: handoff for Firefly

Written Oct 7, 2026 by the data-fetch session (GrumpyDingo's request), for Firefly. It covers what was fetched for `docs/claude/DEN-DATA-WISHLIST.md`, where everything lives (repo and Drive), the licences and credits, the caveats, and what to do next. Per-item detail is in `ref/research/fetched/REPORT.md` and each item's `NOTE.md`.

## 1. The branch
- **Branch:** `claude/new-session-l3ubx0`, started from your `claude/tender-cerf-o68l6u` (so it carries your unmerged commits too). One commit per item, all pushed. No PR opened.
- **Scope:** only `ref/research/fetched/` and this file were added. No game, engine, bench or tool code was touched.
- **Size:** about 30 MB in total; the largest file is `02-outline-landmarks/data.json` (14.5 MB). Nothing over 20 MB.
- **To merge:** merge it into your branch (or main when you're ready). It shouldn't conflict: every file is new.

## 2. What is in `ref/research/fetched/`

| # | Folder | Status | What you get | Licence |
|---|---|---|---|---|
| 01 | `01-skin-offsets` | fetched | Bone and skin-outline landmark pairs, offsets in withers-height fractions (17 landmarks) | Public domain (Ellenberger-Baum *Anatomie des Hundes*, pre-1931) |
| 02 | `02-outline-landmarks` | fetched | StanfordExtra v12: 12,538 dogs, 120 breeds, 20 keypoints + body outline polygon each; `convert_stanfordextra.py` | MIT |
| 03 | `03-dog-model` | fetched | Stark 2021 dog model: joints, segment lengths, 158 muscle lines, per-bone side-view outlines, Beagle forelimb walking data; Ellis 2018 greyhound hindlimb model | MIT (Stark files), CC BY 4.0 (paper, greyhound) |
| 04 | `04-gait-curves` | fetched (walk curves 2D only, plus the Stark Beagle forelimb walk in 03) | Joint angle vs % stride (walk, trot), touchdown/lift-off/ranges, duty factors, footfall phases | CC BY 4.0 (CC0 data for Goldner) |
| 05 | `05-muybridge` | fetched | Muybridge plates 704-710 (images kept, under 2 MB each) with per-frame paw contacts and duty factors | Public domain |
| 06 | `06-limb-indices` | fetched | Samuels et al. 2013, full file: 150 carnivoran taxa; canid and hyena rows with 13 computed indices | CC0 |
| 07 | `07-dingo` | partly | 37 cited numbers: dingo height, skull, weight; Carolina Dog standard; no measured limb bones | facts only (sources mostly not open) |
| 08 | `08-wild-keypoints` | partly | AP-10K + APT-36K: 7,078 dog, wolf and fox poses (17 keypoints, APT-36K tracked through video) | CC BY 4.0 (AP-10K), MIT (APT-36K) |
| 09 | `09-face-and-ear` | partly | Chewing gape and rate, yawn duration, panting rate, head-tilt angle and timing | CC BY 4.0 (one CC BY-NC fact) |
| 10 | `10-coat-palettes` | fetched | Hex colours per body region for gray wolf (4 photos), dingo (7), Carolina Dog (5) | per photo: PD, CC0, CC BY |
| 11 | `11-ethograms` | fetched, gaps | 59 behaviours, 46 numbers (sleep bouts, daily budgets, shake-off, scent roll), suggested idle loop | CC BY / CC0 |

### Conventions used everywhere
- **Angles:** included angle between the two bones, **180 = straight**; above 180 = hyperextended (the carpus in stance goes to about 190-217).
- **Side view:** facing **right**, **y down** (image coordinates). Left-facing sources were mirrored and say so.
- **Withers height** is the unit for proportions. Each item states how it measured it (01: ground to skin over the withers on the plate; 03: lowest paw mesh point to the top of the T1-T3 spines).
- **Confidence:** A / B / C / EST, as in `species/wolf.yaml`.

## 3. The numbers most worth your time first
Matched to your plan (silhouette over the skeleton, then the gait engine, then the Carolina Dog):

1. **Silhouette:**
   - `01-skin-offsets/data.json`: offsets skin minus bone. Examples: withers +0.027 up, brisket +0.021 down, ischium +0.030 back, elbow 0.010, stifle 0.009, hock 0.007 (fractions of withers height). One lean short-coated dog: add coat thickness for wolf or dingo over the back, croup and chest.
   - `03-dog-model/stark_bone_outlines.json` gives every bone's side outline; `stark_muscles.csv` gives the muscle lines (origin, via points, insertion). These are lines, not volumes: use them to place bulges.
   - `02-outline-landmarks/data.json` has real outlines for dingo (108 dogs), dhole (102), African hunting dog (84), basenji (157), kelpie (87).
2. **Gait engine:**
   - `04-gait-curves/curves.csv`: angle vs % stride. Trot: Humphries 2020 (3D, 10 Labradors). Walk: Catavitello 2015 (2D) and the Beagle forelimb walking data in `03-dog-model/stark_fore_motion_mean.csv` (3D, shoulder 92-126, elbow 97-138).
   - Duty factors: walk about 0.58-0.64, trot about 0.42-0.46. Within the trot, duty factor scales as speed^-0.28 (fore) / ^-0.24 (hind), stride length as speed^0.59, cycle time as speed^-0.39 (Charles 2025, 27 working dogs): ready-made rules for speeding the gait up. Walk footfall phases (LH = 0): LF 0.135, RH 0.49, RF 0.63. Trot: the diagonal fore lands about 4-6 % of the stride before its hind.
   - Muybridge gallop duty factors 0.15-0.28 (a bit below the 0.25-0.35 estimate in `gait/REPORT.md`); Maggie's gallop stride 0.25 s, 2.85 m.
3. **Carolina Dog file:**
   - Dingo shoulder height 542 mm (n = 117), condylobasal length 176.9 mm (n = 63), weight about 15 kg. Carolina Dog standard 457-610 mm, 15.9-22.7 kg.
   - Bone ratios: no dingo limb bones exist in open sources. Use wolf / coyote ratios (`06-limb-indices`) or segment ratios from the Stark model, marked as proxies.
   - Palette: `10-coat-palettes`; Carolina coats run ginger to cream, 4 of 5 with a dark muzzle mask. Pick one photo for a coherent coat rather than the median.
4. **Idle behaviour:** `11-ethograms/SUMMARY.md` has a sourced idle loop (sleep bouts 17-36 min real time, shake-off at state changes, scent roll 45-70 s, look-around as the main awake state, activity at dawn and dusk).

## 4. Caveats you should know before using any of it
- **01:** one artist's drawing of one dog (confidence B). The archive.org book in the wishlist is the 1949 Dover edition (borrow-only), not used. The plates were not stored (GrumpyDingo's rule this round: images only for Muybridge); their full-size URLs are in `NOTE.md`.
- **03:**
  - The model's coordinate ranges are **not anatomical** (every flexion axis is clamped to ±180°). Take ranges from the gait data.
  - Its default pose is not a natural stance (carpus 217°).
  - The "Shepherd" full model is the Beagle scaled ×1.66 for the limbs and ×1.25 for the trunk, not a measured Shepherd.
  - The paper says 134 muscles; the file has 158 (the serratus is split into slips).
- **04:**
  - Catavitello's carpus and hip use non-standard segments (flagged in the convention column).
  - Goldner's hip uses the lab's own convention.
  - Goldner's right shoulder and elbow are 9-10° more open than the left in the published sound-dog data; that is in the source.
- **05:** left/right paw assignment is a best guess (fore/hind and timing are certain). Plate 706 is labelled "trotting" but is an irregular walk. Plate numbers 709/710 differ between library copies, so the data says Maggie sequences A and B.
- **06:** the file's `OLI` and `URI` headers look swapped; the dhole's published BI/IM disagree with its own measurements. Use the `calc_*` columns.
- **07:** the dingo femur and humerus (about 177 / 166 mm) are back-calculated with formulas recalled from memory: **verify before use**.
- **08:** AP-10K and APT-36K have only dog, wolf and red fox (no coyote, jackal, dhole, wild dog, hyena, raccoon dog). Their keypoint names are "shoulder / elbow / paw", but on a dog the "shoulder" sits at about the elbow and the "elbow" at about the carpus: read the warning in its `NOTE.md`.
- **10:** colours carry each photo's lighting (no white balance correction).

## 5. Credits to add (`CREDITS`) when anything ships
These licences require attribution (CC BY / MIT keep the notice):
- StanfordExtra (Biggs et al. 2020, MIT; notice in `02-outline-landmarks/LICENSE.txt`).
- Stark, Fischer, Hunt et al. 2021, Sci Rep 11:11335 and the SimTK dog model (MIT, © 2021 FSU Jena, Heiko Stark; `03-dog-model/LICENSE-stark.txt`).
- Ellis, Rankin & Hutchinson 2018 greyhound hindlimb model (CC BY 4.0).
- Gait papers in `04-gait-curves/LICENSE.txt` (Catavitello 2015, Humphries 2020, Fischer 2018, Goldner 2018, JEB 2025).
- AP-10K (CC BY 4.0) and APT-36K (MIT).
- Each CC BY photo in `10-coat-palettes/NOTE.md` (author + licence), and the CC BY papers in `09` and `11`.
- Public domain sources (Ellenberger-Baum, Muybridge) need no credit, but a thank-you line is nice.

## 6. The Drive folder: `My Drive / den-ledger-everything / ref`
Owned by GrumpyDingo's account. The **raw downloads live here, not in the repo**. Keep its sharing at Restricted; open "Anyone with the link: Viewer" only for the minutes a session needs to download (the Drive connector returns files as base64 into the conversation, which only works for tiny files; `curl https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t` works while the folder is shared).

| File | Size | What | Licence | Extracted to |
|---|---|---|---|---|
| `Full linear.zip` | 49 MB | Stark full dog model, linear muscles (`stark(2016)spezzoo.osim`, .msl, .jnt, 70 meshes) | MIT | 03 |
| `Dogforelimbmodelverified-latest.zip` | 51 MB | Stark Beagle forelimb, paper version: `fore.osim`, walking kinematics (KIN), ground forces (GRF), inverse dynamics, static optimisation | MIT | 03 (kinematics + GRF timing extracted; moments and muscle forces not yet) |
| `Forelimbdogmodelsimplified-latest.zip`, `Hindlimbdogmodelsimplified-latest.zip` | 49 MB each | working versions: subsets of the full model, other limb locked | MIT | not needed (same joints as full) |
| `Forelimbdogmodelcurved-latest.zip`, `Hindlimbdogmodelcurved-latest.zip` | 49 MB each | curved muscle paths | MIT | not extracted |
| `Fulldogmodelcurved-latest.zip` | 49 MB | full model, curved muscle paths (1652 path points vs 374) | **no licence**: facts only | not stored |
| `Lowgeometries-latest.zip` | 22 MB | low-res bone meshes | MIT | not used (missing 14 mm of the ribcage front); outlines came from the full-res meshes |
| `scale_beagle.zip` | 2 KB | Beagle → Shepherd scale factors | **no licence**: facts only | factors recorded as facts in 03 |
| `stanfordextra_v12.zip` | 8 MB | `StanfordExtra_v12.json` + split files (from the authors' form) | MIT | 02 |
| `doi_10_5061_dryad_77tm4__v20130107.zip` | 52 KB | Samuels 2013 data + README | CC0 | 06 |
| `jeb250523supp.pdf` | 1.6 MB | supplement of "Working dog locomotion I", JEB 2025 (main text not obtained) | CC BY 4.0 | 04: speed-scaling exponents, trot joint ranges, body proportions; no curves, no walk (27 working dogs, trot only) |
| folders `svg-character-animator-references`, `opencat`, `svg-design-skill` | | older references from Oct 4 | not examined in this session | |

**Not usable:** Animal Kingdom (Ng et al. 2022). GrumpyDingo got its terms via the form: non-commercial research only, no sharing in part, no derived datasets. Nothing downloaded; the private links are deliberately not recorded anywhere. Its paper's public notes (23-keypoint scheme with 3 tail and 4 mouth points, 140-action behaviour list) are in `08-wild-keypoints/NOTE.md`.

## 7. Still open, and worth exploring
- **JEB 2025 main text** (Charles et al. 2025, "The biomechanics of working dog locomotion I: Steady-state trotting", doi 10.1242/jeb.250523, CC BY): only the supplement is in hand. The main text would give the Froude definition, the speed range and the zero-pose angles needed to turn its joint extremes into included angles (now flagged as undetermined). Trot only, so it will not fill the walk gap.
- **Stark forelimb extras not yet extracted:** joint moments (`inverse_dynamics*.sto`) and muscle activations and forces (`StaticOptimization`). Useful if you ever want "effort" to drive secondary motion (for example, which muscles bulge in stance).
- **Ellenberger Tafel 2 (muscles)** was found but not measured: a public-domain side view of the superficial muscles, the best source for where bulges show under the skin. URL in `01-skin-offsets/NOTE.md`.
- **Free-ranging village dog time budget** (the closest thing to a Carolina Dog's day): only paywalled papers found (Banerjee & Bhadra 2021).
- **No open data at all** for: ear rotation angles, jaw angle while barking or yawning, circling before lying down, scratching or stretching rates, dingo limb bones, dingo or Carolina Dog ear length. These need our own reference-clip measurements (the wishlist's fallback).
- **Keypoints for coyote, jackal, dhole, wild dog and hyena**: no permissive source exists. StanfordExtra's dingo, dhole and African hunting dog outlines are the best substitute.

## 8. Libraries that could help
Per the libraries-first rule, check each licence before adding. All below are permissive (MIT / ISC / BSD / Apache).

**npm (the repo already has paper, bezier-js, d3-shape, clipper2-ts, polygon-clipping, simplify-js, culori, svgpath, svgo, resvg, pixelmatch):**
- `fast-xml-parser` (MIT): read `.osim` files in JS if the rig ever loads the model directly.
- `d3-dsv` (ISC): read the CSVs in the benches.
- `fit-curve` (MIT): fit smooth Bézier curves to the outline point lists (StanfordExtra, bone outlines) for clean SVG paths.
- `concaveman` (ISC): concave hulls, for wrapping skin around bone and muscle points.
- `curve-interpolator` (MIT): Catmull-Rom / centripetal splines through landmarks (a smooth skin line through offset points).
- `simple-statistics` (ISC): medians, quantiles and SDs when turning 12k StanfordExtra dogs into per-breed proportions.
- `fft.js` (MIT): turn each gait curve into a few Fourier terms, which is a compact, smooth, loopable way to drive joints procedurally at any speed.
- `js-yaml` (MIT): if a JS tool needs to read `species/*.yaml` (the Python kit already uses pyyaml).

**Python (for the research and check tools only; `tools/den/requirements.txt` already has pandas, pyyaml, sympy, svgelements, bezier, scikit-learn, pyclipper):**
- `numpy`, `scipy`: splines, resampling curves to % stride, Procrustes alignment of outlines, signal filtering.
- `shapely` (BSD): polygon offsetting (skin = bone outline grown by the measured offsets) and unions.
- `scikit-image` (BSD): contour tracing and polygon simplification from masks.
- `trimesh` (MIT): load the Stark `.obj` meshes and project bones to the side view.
- `opencv-python-headless` (Apache 2.0) and `pycocotools` (BSD): RLE masks and contours (StanfordExtra used them).
- `pdfplumber` (MIT): tables out of PDFs (supplements).
- `matplotlib`: quick check renders (render big, flat background, as GrumpyDingo likes).
- OpenSim itself is not needed: the `.osim` files are plain XML.

## 9. Recommendations
1. **Merge first, then build one species file:** a `species/carolina.yaml` draft using dingo numbers (07) and Stark or wolf ratios as proxies, each with its confidence, so `./den species check` can compare it with the new tables.
2. **Silhouette:** grow the Stark bone outlines (03) by the Ellenberger offsets (01) with shapely, then compare the result with the StanfordExtra dingo and basenji outlines (02) scaled to withers height. Show GrumpyDingo big renders on flat backgrounds, one change at a time.
3. **Gait engine targets:** use Humphries (3D trot) and the Stark Beagle walk as targets, Goldner and Fischer as checks, Muybridge for footfall timing. Fit each curve with a few Fourier terms.
4. **Add a fetched-data check to `./den`**, for example `./den species check` reading `ref/research/fetched/*/data.*`, so every number keeps its source.
5. **Keep the licence discipline:** only permissive data in the repo, raw zips in Drive, CC BY credits collected in one place before anything ships.

## 10. Lessons from this session (for the next fetch)
- **Wikimedia rate-limits (HTTP 429)** parallel sessions hard; use a descriptive User-Agent, one request every few seconds, and the standard thumbnail widths only.
- **Blocked here:** journals.biologists.com, MDPI, Wiley, bioRxiv (429), web.archive.org (network policy), SimTK and Dryad downloads (login / anti-bot). GrumpyDingo can fetch these in a browser and drop them in the Drive folder.
- **Facts vs data:** single facts with citation are fine from any paper; bulk tables only from CC0 / CC BY / MIT / PD. A dataset's terms of use are a contract and can forbid use even of "facts" (Animal Kingdom).
