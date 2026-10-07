# 4. Cross-link map: pipelines

[← Master index](README.md)

```
              BONES                    SURFACE                       MOTION
  Law/Samuels ratios ─┐      Ellenberger skin offsets ─┐    gait curves ─────┐
  Stark 2D/3D bones ──┼─► SKELETON ─► MUSCLE BULGES ──► SKIN ─► FUR ─► BODY ─► RIG ─► ANIMATION / ROBOT
  wolf skulls ────────┘      Tafel 2 muscles ──────────┘    joint limits ────┤
                             coat tables, palettes ───┘     ethograms ───────┘
  CHECKS at every stage:  photos (scout/01) · StanfordExtra outlines · AwA/AP-10K ratios · Muybridge footfalls
```

---

<a id="p1"></a>
## P1. 2D side-view render (the existing path)

- **Inputs:**
  - `species/wolf.yaml`;
  - `fetched/03-dog-model/stark_bone_outlines.json`, `stark_muscles.csv`;
  - `fetched/01-skin-offsets/data.json`;
  - `scout/08-tafel2-muscles/data.json`;
  - `scout/03-wolf-coat/data.csv`;
  - `missingfound/wolf-skull/data.json`;
  - `species/templates/wolf_01.yaml`.
- **Steps:**
  1. `./den species check species/wolf.yaml`.
  2. `./den skeleton wolf`: least-squares standing skeleton.
  3. `./den outline wolf --curves`: landmark pins, Bézier fit, skull head.
  4. Add the Tafel 2 bulges per segment.
  5. Fur offset field.
  6. `./den outline --photo` overlay against a real wolf, then Procrustes and Hausdorff distance.
- **Tools:** `tools/den/*.py`, shapely, scipy, rembg, Inkscape.
- **Outputs:** `species/build/wolf.{skeleton,curves,photo}.{json,svg,png}`.
- **Blockers:**
  - Chest depth of 0.54 ([06](06-gaps-and-risks.md#wrong-data)).
  - Fur offsets mostly E.
  - Template-warp vs grow-from-bones not decided (`ref/research/outline-methods/REPORT.md` vs `scout/12-body-tools/SUMMARY.md`).
  - Dingo and Carolina Dog have no `species/*.yaml`.

<a id="p2"></a>
## P2. 3D anatomy reconstruction

- **Inputs:**
  - `scout/10-stark-meshes/meshes/*.glb`, `bodies.csv`;
  - `stark_muscles.csv` (Fmax, L_opt);
  - `scout/08-tafel2-muscles` (which muscles are superficial);
  - `fetched/01-skin-offsets` (17 landmarks);
  - `scout/03-wolf-coat` (fur);
  - `missingfound/wolf-skull/*.glb`.
- **Steps** (`scout/12-body-tools/SUMMARY.md`, estimated at 4–6 days):
  1. Assemble the skeleton with trimesh and the 4×4 transforms. Optionally re-pose in OpenSim.
  2. Hill-volume spindle muscle bellies. **Exclude the 1.0 N placeholder muscles.**
  3. Trunk filler: an expanded hull of ribs, sternum, abdomen and pelvis.
  4. SDF smooth-min union on a 1–2 mm grid, then marching cubes and Taubin smoothing.
  5. Skin offset by a thickness field: an RBF from the 17 landmarks.
  6. Fur offset shell, switchable summer/winter.
  7. Orthographic side render to SVG.
  8. Check against Tafels 1 and 3 and the wolf photos.
- **Tools:**
  - Core: trimesh (MIT), fogleman/sdf (MIT), scikit-image (BSD), scipy (BSD).
  - Optional: manifold3d (Apache).
  - Run only: Blender 4.2 (GPL); OpenSim 4.6 (Apache).
- **Outputs:** a skinned 3D Beagle/"Shepherd" body, wolf-scaled variants, side-view SVG.
- **Blockers:**
  - bpy headless not smoke-tested.
  - The Stark skeleton is a stretched Beagle.
  - Head and neck are thin.
  - No open full-body 3D canid found yet (`scout/11-body-models/` does not exist).

<a id="p3"></a>
## P3. Animation and motion

- **Inputs:**
  - `fetched/04-gait-curves/*`;
  - `missingfound/walk-footfall-and-muybridge/data.json`;
  - `missingfound/joint-ranges/SUMMARY.md`;
  - `ref/research/motion/behaviour_numbers.json` (permissive entries only);
  - `fetched/11-ethograms/data.json`;
  - `fetched/09-face-and-ear/data.json`.
- **Steps:**
  1. Pick the gait from the Froude number.
  2. Set phase and DF from measured tables.
  3. 2D IK (`ik2d.js`): plant paws, clamp to joint limits.
  4. Compare the joint angles produced against `curves.csv` (`./den gait`).
  5. Add secondary motion (springs) and an idle state machine from ethogram rates.
  6. Export GIF or MP4 (`./den gif`).
- **Tools:** `ref/research/procedural/ik2d.js`, PixiJS rig (`engine/rig.js`), Playwright, imageio.
- **Outputs:** gait cycles, idle loops, behaviour timing tables.
- **Blockers:**
  - Current game dogs fail `./den gait` (elbows 152–177°, stifles 68–115°; `DEN-REFERENCE-GUIDE.md`).
  - No gallop curves.
  - No measured ear or jaw behaviour angles.
  - The best wag number (1.4 Hz) is NC-derived.

<a id="p4"></a>
## P4. Robotics and control

- **Inputs:**
  - Stark `.osim` models;
  - greyhound `.osim`;
  - MuJoCo dm_control dog;
  - gait curves and duty/phase tables;
  - joint ranges;
  - GRF (Stark Beagle, 70–74 % body weight);
  - `ref/opencat/` (timing reference).
- **Steps:**
  1. Fix the Stark full model's `min_control` so it initialises.
  2. Rescale the MuJoCo dog to Stark or wolf proportions.
  3. Impose the measured joint-angle trajectories as reference motion and track them with a PD controller or imitation learning.
  4. Check duty factor and phase emerge correctly.
  5. Map them to a 12-DoF robot (Petoi-class) as gait priors.
- **Tools:** OpenSim 4.6, MuJoCo, dm_control, ikpy, scipy.
- **Outputs:** sim-ready canid model with measured reference gaits; robot gait tables.
- **Blockers:**
  - Long sims need sign-off ("talk first", `ref/research/tools/REPORT.md`).
  - Only one limb has measured 3D kinematics (Beagle forelimb).
  - Hip conventions conflict.
  - A MuJoCo musculoskeletal dog (arXiv 2506.23768) has an unverified licence.

<a id="p5"></a>
## P5. AI dataset and generation

- **Inputs:**
  - `fetched/02-outline-landmarks/data.json`;
  - `fetched/08-wild-keypoints/data.json`;
  - `ref/awa-pose/canids.json`;
  - `keypoints/badja_dogs.json`;
  - skeleton and skin models (P1, P2) for synthetic renders.
- **Steps:**
  1. Clean: drop NaN entries, harmonise visibility flags.
  2. Build an anatomical keypoint crosswalk ([02 §3.7](02-data-dictionary.md)).
  3. Learn per-dataset offsets (e.g. AP-10K "shoulder" → true elbow) where the sets overlap.
  4. Produce anatomical priors such as bone-length ratios and angle ranges per species, usable as pose-estimation constraints.
  5. Optional: render synthetic labelled silhouettes from the skeleton-to-skin model, with ground-truth joints.
- **Tools:** pycocotools, numpy, morphops, shapely; Blender for renders.
- **Outputs:** unified canid keypoint schema, crosswalk table, label-error report, anatomical prior file, optional synthetic set.
- **Blockers:**
  - No wild-canid keypoints beyond wolf and fox.
  - Images are not redistributable (only coordinates are).
  - The SMAL family is non-commercial.
  - Avoid the AGPL Ultralytics mirror.

<a id="p6"></a>
## P6. Education and atlas

- **Inputs:**
  - Ellenberger Tafels 1–3 (PD);
  - Tafel 2 muscle polygons;
  - skin offsets;
  - Stark 3D meshes (MIT);
  - wolf skulls (CC BY);
  - Muybridge plates (PD);
  - gait curves;
  - photos (CC BY, credited).
- **Steps:**
  1. Register the plates to each other. Fix the disputed +31 px offset using the scout 08 fit.
  2. Label layers: bone, muscle, skin, fur.
  3. Build a web viewer: plate layers + 3D skeleton (three.js or model-viewer, GLB) + a gait animation driven by measured curves.
  4. Add a "how we know" panel per number: source, grade, licence.
  5. Translate the labels: the Latin terms are already present.
- **Tools:** three.js or `<model-viewer>`, SVG, a static site.
- **Outputs:** an open, offline-capable canine anatomy and locomotion atlas.
- **Blockers:**
  - Tafel 2 identities are Scout's reading and need an anatomist's review.
  - One dog type (Great Dane) for the plates.
  - CC BY credits must be shown in the viewer.
