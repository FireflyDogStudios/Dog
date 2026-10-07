# 9. Appendices

[← Master index](README.md)

## A. Glossary
| Term | Meaning |
|---|---|
| **WH** | Withers height: ground to the top of the shoulders. Several definitions are in use; see [02 §3.1](02-data-dictionary.md) |
| **CBL** | Condylobasal length of the skull: front of the premaxilla (prosthion) to the back of the occipital condyles |
| **GL** | Greatest length of a bone, measured with calipers (von den Driesch) |
| **Included angle** | Angle between two adjoining bones; 180° = straight |
| **Hyperextension** | Included angle above 180°; normal at the carpus in stance |
| **Duty factor (DF)** | Fraction of a stride a foot is on the ground |
| **Limb phase (LP)** | Hildebrand's timing of the left fore relative to the left hind; 0.25 = even walk, 0.5 = trot |
| **Froude number (Fr)** | v² / (g·h); dimensionless speed used to compare animals of different size |
| **Brachial / crural index** | Radius ÷ humerus; tibia ÷ femur |
| **Carpus, MCP, hock (tarsus), stifle** | Wrist; knuckle of the forepaw; ankle; knee |
| **Brisket / sternum** | Lowest point of the chest; the breastbone |
| **Withers / croup** | Top of the shoulders; top of the pelvis |
| **OpenSim** | Open musculoskeletal modelling software; `.osim` model files |
| **MuJoCo / dm_control** | Physics engine, and DeepMind's control suite, which includes a dog model |
| **Hill muscle** | Muscle model using Fmax (max isometric force), L_opt (optimal fibre length), tendon slack and pennation |
| **SDF** | Signed distance field: a 3D shape stored as distance to its surface, which allows smooth blending of muscles |
| **TPS** | Thin-plate spline: a smooth 2D warp from landmark pairs |
| **Procrustes** | Aligning shapes by translation, rotation and scale before comparing them |
| **IoU / Hausdorff** | Overlap of two shapes; worst-case distance between two outlines |
| **Keypoint** | A labelled 2D image point (nose, paw…) in a pose dataset |
| **Unit A / unit B** | Body-length units in `keypoints/REPORT.md` (skull point to tail base) |
| **IS-Net / rembg** | Background-removal model and its wrapper, used for photo cut-outs |
| **Grades A / B / C / EST** | Measured; second-hand or dog proxy; weak; estimate (`docs/claude/DEN-REFERENCE-GUIDE.md` §0) |
| **M / D / E / I** | This dossier's tags: measured / derived / estimate / Atlas's inference |
| **NC / ND / SA** | Non-commercial / no derivatives / share-alike licence terms |
| **Ellenberger plates (Tafel 1–3)** | Public-domain dog anatomy atlas (ca. 1911–25): exterior, muscles, skeleton |
| **Firefly / Scout / Atlas / GrumpyDingo** | The project's lead Claude session; the data-fetching session; this mapping session; the human designer |

## B. Full file index
The generated index is [file-index.md](file-index.md): 654 files under `ref/`, `species/`, `docs/claude/`, the new docs and `tools/`. Regenerate it with `python3 tools/atlas/file_index.py`. The repo-wide directory map is [`docs/README.md`](../README.md).

## C. Open questions
**For Firefly / GrumpyDingo (decisions):**
1. Which licence, if any, for a public research subset? Proposed: data CC BY 4.0, code MIT.
2. Split the research out of the game repo into a public `canid-reference` repo?
3. Which audience or project first? Atlas recommends P1, the Open Canid Reference.
4. Approve the Scout disc-share request and any large downloads (Czeibert 51 GB, Drive zips)?
5. May Atlas apply the proposed corrections to `docs/claude/DEN-MATERIALS.md`, or should Firefly?

Carried over from `docs/claude/DEN-OPEN-QUESTIONS.md` (still open):
- Carolina Dog species file.
- Hero and companion model choice.
- Licence hold on NC and copyleft data.
- Realistic vs stylised look.
- Sex-specific anatomy.

**Research questions without data:**
- True wolf chest depth (T1).
- Dingo bone proportions (T2).
- Disc share (Scout request).
- Ear rotation and behavioural jaw angles.
- Neck, tail and digit range of motion.
- Wolf footfall timing (T5).
- Hip angle unification (T6).

**For external authors:**
- **Chris Law:** may derived means from Law 2025 be redistributed?
- **Heiko Stark / FSU Jena:** does the MIT licence cover redistributing the decimated meshes? What is the `min_control` fix?
- **APT-36K authors:** confirm the licence, since the repo has no LICENSE file.
- **AP-10K authors:** the JSON says MIT while the repo says CC BY.
- **Koungoulos:** access to measured dingo limb bones.

## D. People or organisations who should see this
These are suggestions only. **Nobody has been contacted**, and all outreach needs Firefly's approval.

| Who | Why | Link to this work |
|---|---|---|
| Heiko Stark, Emanuel Andrada, Martin S. Fischer (FSU Jena) | Authors of the Stark dog model | Licence for meshes; model fix |
| John R. Hutchinson's group (Royal Veterinary College) | Greyhound model (Ellis 2018); comparative biomechanics | Pipelines P2 and P4; review |
| Chris J. Law | Canid skeletal datasets | Licence; OCR inclusion |
| Samuels, Meachen & Sakai | CC0 limb dataset | Errata (OLI/URI swap) |
| Benjamin Biggs (StanfordExtra, BADJA) | Keypoint datasets | NaN report; crosswalk |
| AP-10K and APT-36K teams | Animal pose datasets | Label-shift audit; licence |
| AwA-Pose (Prianka Banik) | Canid keypoints | Chest-depth caveat |
| Loukas Koungoulos | Dingo morphometrics | Dingo bone data (P5) |
| Mammal Research Institute PAS (Open Forest Data) | Wolf skull scans | Credit; more specimens |
| University of Wisconsin Digital Collections | Ellenberger scans | Atlas (P2) |
| Pasha van Bijlert (Naturalis, MuSkeMo) | Musculoskeletal modelling tools | P2 method; licence question |
| OpenSim / SimTK and MuJoCo communities | Model hosting | Sim-ready canid (P4) |
| Veterinary anatomy educators (any open-courseware vet school) | Primary users of the atlas | Review of Tafel 2 identities |
| Dingo research and conservation bodies; Aboriginal community organisations | Dingo data and cultural context | P5 consultation |
| Petoi / OpenCat community | Educational robot dogs | Gait priors (T11) |
| iNaturalist and Flickr photographers credited in `scout/01-body-templates/candidates.csv` | Attribution | Credits file |
