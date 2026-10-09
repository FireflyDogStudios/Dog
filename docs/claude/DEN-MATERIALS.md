# Den materials: what we have, and what each gives us

Kept by Firefly, started Oct 7, 2026 (corrected the same day from Atlas's audit, A-003) (GrumpyDingo asked for a master list of materials). The numbers themselves are mapped in `docs/claude/DEN-REFERENCE-GUIDE.md`; this list is about **ingredients**: what each thing is, what job it can do, and what it cannot. About 57 MB of research is in `ref/research/`; the raw 3D model zips are in GrumpyDingo's Drive.

## 1. Bones and skeletons
| Material | What it is | Gives us | Can't give us | Where |
|---|---|---|---|---|
| Museum bone lengths | Limb bones, spine and skull: 18 species with bone means (16 canids + 2 hyenas; Law 2025) | Real bone lengths and ratios per species | Shapes, poses | `ref/research/skeleton/` |
| Limb indices, 150 carnivores | Bone measurements (CC0) | Ratios for coyote, foxes, jackals, hyenas | Dingo (none exist) | `fetched/06-limb-indices/` |
| Dingo bone estimates | Back-calculated from 117 dingoes whose shoulder heights were themselves reconstructed from bones (±5%) | Hero-size bones | Measured dingo bones (none exist in open sources) | `missingfound/dingo-limb-bones/` |
| Stark dog model, 2D | Every bone's side-view outline, joint centres, segment lengths (real Beagle + Shepherd-sized version) | Real bone **shapes** in side view | The Shepherd version is a non-uniformly stretched Beagle | `fetched/03-dog-model/` |
| Stark dog model, 3D | 24 body meshes (GLB, mm, decimated; 31 of the 70 OBJs used) and the OpenSim files | Real **3D bones**: `./den skeleton3d` builds the wolf from them | Raw zips and full-resolution meshes stay in Drive; 4 trunk muscles per side have a placeholder force of 1.0 N | `scout/10-stark-meshes/`, `fetched/03-dog-model/*.osim` |
| Greyhound hindlimb model | OpenSim model (CC BY) | Hind-leg joints and muscles | Forelimb | `fetched/03-dog-model/` |
| MuJoCo dog | DeepMind's physics dog (Apache) | A rigged 3D dog for physics checks | Real proportions (it's a Pharaoh Dog, simplified) | installed (`dm_control`) |
| Two real wolf skulls, 3D | CT/3D scans with jaws, measured (CC BY) | The **head**: real skull shape, eye, jaw hinge, teeth, gape limits | Soft tissue | `missingfound/wolf-skull/` |
| Skull shape data | Pointers to CC0 landmark sets for 188 carnivores (Meloro & Tamagnini) and more | Skull shape for every bestiary species | Not downloaded yet (on hold) | `missingfound/skull-candidates/` |
| The wolf skeleton we built | `species/wolf.yaml` → `./den skeleton wolf` | A sourced standing skeleton | Correct chest depth (too deep: the photo check found it) | `species/` |

## 2. Muscles and skin
| Material | Gives us | Can't give us | Where |
|---|---|---|---|
| 158 muscle lines (Stark) | Where each muscle runs and how strong it is (thickness) | Volumes or shapes (lines only) | `fetched/03-dog-model/stark_muscles.csv` |
| 25 surface-muscle shapes (atlas plate 2) | Which muscles bulge under the skin, and how much | Wolf-specific shapes (one lean dog) | `scout/08-tafel2-muscles/` |
| Skin-over-bone offsets, 17 landmarks | How far skin sits from bone at withers, chest, elbow, hock and so on | Between the landmarks | `fetched/01-skin-offsets/` |
| Atlas plates 1 and 3 | One dog drawn as exterior and as skeleton-inside-skin, public domain | A registered skin-and-bone template | A wolf (it's a Great Dane type) | `missingfound/atlas-plates/` |

## 3. Fur, colour and surface
| Material | Gives us | Limits | Where |
|---|---|---|---|
| Wolf coat thickness by region, summer and winter | How far fur stands off the skin (withers and back measured, the rest estimated) | Mostly estimates beyond the back; Mech 1974 (*Mammalian Species* 37, US government work) is in Drive | `scout/03-wolf-coat/` |
| Dingo and Carolina Dog coat | Estimates | All estimates | `scout/04-dingo-coat/` |
| Tail bone vs brush width | Tail shape and carriage | | `scout/05-tail/` |
| Coat colour palettes | Hex colours per body region for wolf, dingo, Carolina Dog | Lighting not corrected | `fetched/10-coat-palettes/` |

## 4. Real animals (photos, outlines, poses)
| Material | Gives us | Limits | Where |
|---|---|---|---|
| 14 wolf profile photos and plates (ranked, licence-checked) | What a wolf **looks like**; templates; checks for the skeleton | CC BY ones need credit | `scout/01-body-templates/wolf/` |
| 12,538 dog outlines with 20 keypoints (StanfordExtra) | Real silhouettes, incl. 108 dingoes, dholes, wild dogs, basenjis | Coarse outlines; no back or chest keypoints | `fetched/02-outline-landmarks/` |
| 7,078 dog, wolf and fox poses (AP-10K, APT-36K) | Keypoints, some tracked through video | "Shoulder" and "elbow" labels sit lower than the names say | `fetched/08-wild-keypoints/` |
| Wolf and dog photo keypoints (AwA) | Body ratios and standing angles | Its chest-depth ratio disagrees with real profiles | `ref/awa-pose/`, `ref/research/keypoints/` |
| Muybridge dog plates (public domain) | Frame-by-frame footfalls: walk, trot, gallop | Three plates' left and right still unconfirmed | `fetched/05-muybridge/` |

## 5. Motion and behaviour
| Material | Gives us | Where |
|---|---|---|
| Joint angle curves through the stride, duty factors, footfall phases, speed rules | How legs move at walk and trot | `fetched/04-gait-curves/`, `ref/research/gait/` |
| Beagle forelimb walk (3D, recorded) | Real forelimb motion | `fetched/03-dog-model/stark_fore_motion*.csv` |
| Joint limits (hard and comfortable) | What the rig may and may not do; sit, jump, stand poses | `missingfound/joint-ranges/`, `species/wolf.yaml` |
| Behaviour rates, ethograms, idle loop | Breathing, blinking, wag, shake, sleep bouts, scent roll | `ref/research/motion/`, `fetched/11-ethograms/` |
| Face and ear data | Jaw timings, ear poses by mood (DogFACS); our measured side-view ear angles | `missingfound/face-ear-and-wild-keypoints/`, `ref/research/ear-angles/` |

## 6. Tools (all run here; `./den doctor` lists them)
- **Our kit (`./den`):** `species check`, `skeleton`, `outline` (`--template`, `--curves`, `--photo`), `gait`, `gif`, plus the gear tools.
- **3D:** Blender 4.2 (headless, renders), OpenSim 4.6 (loads the dog models), MuJoCo (physics), trimesh, VTK, PyVista.
- **2D shape:** shapely, Clipper2, Skia path booleans, curve fitting, Procrustes and Fourier outline tools, Inkscape.
- **Images:** IS-Net cut-outs (rembg), OpenCV, scikit-image, odiff, SSIM.
- **Game side:** PixiJS rig and gear pipeline, Playwright renders.

## 7. What the pieces add up to
- **Where the joints are:** bones, angles and limits. Strong, except the chest depth, which needs correcting from photos.
- **What it looks like:** photos (wolf strong; dingo and Carolina Dog coming from Scout).
- **What's under the skin:** muscle lines, muscle bulges, skin offsets. Good for checks and shading, weak as a generator in 2D.
- **How it moves:** gait, limits, behaviour. Strong.

## 8. Missing, or not yet in hand
- **Intervertebral disc share** (every spine length is vertebral bodies only; request out to Scout), and **a muscle-name crosswalk**.
- **A full-body 3D wolf, dingo or dog** under an open licence (not searched yet).
- **Dingo and Carolina Dog templates** (Scout's next delivery), and a dingo-type skull (none exists openly).
- **Measured:** ear rotation, jaw angles in behaviour, wild-canid keypoints (coyote, jackal, dhole, wild dog, hyena), dingo bones.
