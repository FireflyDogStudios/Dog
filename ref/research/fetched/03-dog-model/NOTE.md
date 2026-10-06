# 03-dog-model: OpenSim dog model (Stark et al. 2021) and greyhound hindlimb model (Ellis et al. 2018)

Fetched 2026-10-06 by Firefly data-fetch agents. The greyhound part (section B) came first; the Stark model files (section A) were added later the same day, after GrumpyDingo downloaded them by hand. Everything is summarised in `data.json`; the CSVs and JSON hold the full tables.

## A. Stark et al. 2021 dog model: fetched (by hand)

### Source
- **Paper:** Stark H, Fischer MS, Hunt A, Young F, Quinn R, Andrada E (2021). *A three-dimensional musculoskeletal model of the dog.* Sci Rep 11:11335. doi:10.1038/s41598-021-90058-0 (CC BY 4.0). Preprint cited inside the model file: bioRxiv 10.1101/2020.07.16.205856.
- **Model files:** SimTK project https://simtk.org/projects/dogmodel , downloads https://simtk.org/frs/?group_id=2032 .
- **How obtained:** SimTK needs a login, so an agent could not download them (see "Earlier blocker" below). GrumpyDingo logged in to SimTK, downloaded the packages by hand on 2026-10-06, and handed them over on Google Drive. They were unzipped in `/tmp/simtk/x/` (not in the repo).
- **Packages received:** Full dog model (simplified) = `Full linear.zip`; Dog forelimb model (verified) = `Forelimb model.zip`; Forelimb/Hindlimb linear and curved; Full dog model (curved); Low geometries; Scaling data (Beagle).

### Licence
- **MIT**, "Copyright (c) 2021, FSU Jena, Heiko Stark", as shown by SimTK's "View License" for: Full dog model (simplified), Dog forelimb model (verified), the four limb working versions, and Low geometries. GrumpyDingo confirmed this on SimTK. The text is in `LICENSE-stark.txt`; it covers every `stark_*` file here.
- **No licence shown** for "Full dog model (curved)" and "Scaling data (Beagle)". Nothing derived wholesale from them is stored: only facts (a path-point count comparison, and the scale factors), marked as such in `data.json`.
- **Inside the zips:** no LICENSE, README or copyright file in any package. The verified `.osim` has a `<credits>` line (Stark, Fischer, Hunt, Young, Quinn, Andrada) and the preprint citation. All files were treated as untrusted data; no instructions were found in them.

### What the files are
- **Full linear** (`stark(2016)spezzoo.osim`, OpenSim 1.9 format): the whole dog at **German Shepherd size**. The Beagle CT bones were stretched x1.66 (limbs) and x1.25 (trunk) to fit a Shepherd muscle model. It has 25 bodies, 24 CustomJoints, 84 coordinates, 158 muscles (2-4 path points each) and 12 wrap cylinders. Also included: SIMM `.jnt`/`.msl` copies, a screenshot, and 70 `.obj` meshes.
- **Forelimb verified** (`stark(2021) - beagle - fore.osim`, OpenSim 3.0 format): the paper version. It is the same skeleton scaled back to the **Beagle** "Simon" (13.81 kg; trunk x0.8, limbs and pelvis x0.6), with the 43 left-forelimb muscles. Only the forelimb chains and the thorax translations are unlocked. `..._fore_low.osim` is identical except that it points to low-res trunk meshes. The package also holds the gait data (see "Motion files").
- **Working versions:** `forelimb_linear` and `hindlimb_linear` have the same bodies, joints, coordinate defaults and masses as full_linear. Their muscles are subsets of it (86 forelimb+trunk, 66 hindlimb) with identical parameters; the other limb's coordinates are locked. Only full_linear has iliocostalis, longissimus and quadratus lumborum. The curved versions have the same muscles with many more via points.
- **Full curved** (no licence; facts only): it is identical to full_linear in bodies, joints, coordinates, masses, muscle names and parameters. Only the muscle paths differ: 1652 path points (2-47 per muscle, median 9) against 374 (2-4, median 2).
- **Scale beagle** (no licence; facts only): an OpenSim ScaleTool (manualScale, mass 13.81 kg, preserve mass distribution). Factors: thorax, cervix, caput, abdomen and cauda 0.8; pelvis and every limb segment 0.6.
- **Geometry low:** decimated trunk, scapula and pelvis meshes (about 10x fewer triangles); the limb meshes are the same files. The low thorax lacks about 14 mm at its cranial tip, so the outlines used the full-resolution meshes from `full_linear/Geometry` (byte-identical to the verified package's meshes).

### What was extracted and how
- **Parsing.** `xml.etree` (run with `python3 -I`) on both `.osim` files. A raw `&` in the verified file's `<publications>` line was escaped before parsing. Extracted:
  - every body: mass, COM, inertia, meshes and display scale;
  - every joint: type, parent, child, location/orientation in parent and child frames, and each SpatialTransform axis with its coordinate and function (Linear, Constant, or Multiplier wrapping Constant);
  - every coordinate: rotational/translational, axis, default, range in rad and deg, clamped and locked flags;
  - every muscle: path points with their bodies, Fmax, optimal fibre length, tendon slack length, pennation, and the wrap cylinders.
  - Output: `stark_full_*.csv` and `stark_fore_verified_*.csv` (bodies, joints, coordinates).
- **Forward kinematics at the default pose.** X_child = X_parent · T(location_in_parent)·R_xyz(orientation_in_parent) · [R1(q1)·R2(q2)·R3(q3), p] · [T(location)·R(orientation)]⁻¹.
  - The rotations are successive body-fixed rotations about the transform axes. p is the sum of the translation axes times their function values, in the parent joint frame.
  - All orientation offsets and child locations are zero in these files, so every body frame sits on its proximal joint centre. The joint centre is the joint frame origin after translation.
  - Rotations are not trivial here: the root is pitched 3° and several defaults are 30-60°, so the full chain is used.
- **Landmarks** come from mesh vertices at the default pose. Each landmark is one vertex, and each row of `stark_side_view.csv` says how it was chosen:
  - scapula top = the dorsal-most vertex of the scapula mesh;
  - toe tips = the digit-mesh vertex farthest from the MCP or MTP centre (claw tip);
  - olecranon, point of shoulder, tuber calcanei, tuber ischiadicum, iliac crest, nose tip, skull top, chin, sternum and tail tip.
  - These come from simple extreme-point heuristics, so treat them as EST confidence. The MCP and MTP are the `carpus_forepaw` and `calx_hindpaw` joints.
- **Withers height (WH).**
  - Ground = the lowest vertex of any digit mesh at the default pose.
  - Withers = the highest thorax-mesh vertex within the scapula's x-range: the tips of the first thoracic spinous processes, which move rigidly with the trunk.
  - WH = 0.617 m (full_linear) and 0.356 m (Beagle).
  - The scapula top was not used because its height depends on a free translation coordinate. In the Beagle file those translations were not rescaled, so the blade sits 3.2 cm above the spines. Heights to the scapula top are also given: 0.635 m and 0.388 m.
- **Side view (game).** side_x = −model Y (forward = right) and side_y = −model Z (down), in metres. The origin is the withers point, so ground is at y = +1 WH.
  - Also given in WH fractions.
  - A right-facing dog shows its right side, so `right_*` bones are the near side.
- **Segment lengths** (`stark_segments.csv`) are measured between consecutive joint centres and landmarks, in 3D and projected to the side view.
  - Chains: thoracic and lumbar spine, neck, head, tail, lumbosacral→hip, forelimb (scapula top–shoulder–elbow–carpus–MCP–claw tip) and hindlimb (hip–stifle–hock–MTP–claw tip).
  - Within each limb, the ratios are identical in the two models.
- **Muscles** (`stark_muscles.csv`): long format, one row per path point. It gives the local position in the body frame, the global position at the default pose, and the side-view position in m and WH.
  - These are **lines**, not volumes. Paths also wrap over the cylinders listed in `data.json`; the wrapping is not computed here.
- **Bone outlines** (`stark_bone_outlines.json`):
  - Each body's mesh triangles were projected to the side view, rasterised at 0.5 mm, closed by about 1 mm and hole-filled.
  - The outer contour was traced with marching squares (scikit-image `find_contours`) and simplified (Douglas-Peucker, 1 mm tolerance).
  - Outlines are given in metres and in WH, for both models, plus a whole-skeleton silhouette (the union of all bone masks).
  - A check render (`/tmp/simtk/check_side.png`, not stored) showed the dog upright, facing right, with every joint centre on its bones and the muscle lines on the bones.
- **Motion files** (`stark_fore_motion.csv`, `stark_fore_motion_mean.csv`): see the next section.

### Motion files in the verified package
- **`KIN01..10_FL_Simon_3.mot`:** IK joint kinematics of the Beagle's **left forelimb while walking**, in degrees.
  - Columns: scapula (3 rotations and 3 translations in m), shoulder, elbow, carpus and MCP (3 rotations each), and thorax translations.
  - Every file has 101 rows over 0..0.58 s in equal steps, so these are **time-normalised strides**. The CSV uses `pct_stride` = 0..100, with 0 = forepaw touchdown. Real stride times are not in the files.
- **`GRF01..11_FL_Simon_3.mot`:** the left forepaw's ground reaction force.
  - GRF01 and GRF02 are all zero.
  - In trials 03-11, stance runs from 1 % to 62-65 % of the stride (a walk; duty factor about 0.64).
  - Peak vertical force is 94-100 N, about 70-74 % of body weight.
- **`GRFnn_middle.xml`:** ExternalLoads setups that pair GRFnn with KINnn.
- **`inverse_dynamics*.sto`:** joint moments and forces.
- **`*_StaticOptimization_activation/force.sto` and `_controls.xml` (03-10):** muscle activations and forces from static optimisation.
- The `.sto` and `.xml` files are results or setups, so they were not extracted.
- **Angles.**
  - For each frame, the frame's coordinates were set in the verified model, forward kinematics was run, and the joint centres were projected to the side view.
  - Each angle is named for its open side: shoulder (cranial side: scapula top–shoulder–elbow), elbow (caudal side), carpus (palmar side) and MCP (palmar side: metacarpus vs the MCP→claw tip line). Scapula inclination from vertical is also given.
  - For the shoulder and elbow, this is the ordinary included angle (180 = straight). For the carpus and MCP, values above 180 mean the joint has passed straight (overextension).
  - The model coordinates are kept too. Measured signs: + shoulder coordinate = flexion; + elbow coordinate = extension; + carpus = flexion; + MCP = flexion; + scapula sagittal = scapula more upright.
- **Trials 01 and 02** are kept but flagged `used_in_mean = 0`. They have no GRF, and trial 02's shoulder coordinate is offset by about −100° (an IK branch flip). `stark_fore_motion_mean.csv` is the mean and SD over trials 03-10.

### Conventions
- **Units:** metres, kg, N; radians in the `.osim` files; degrees in the `.mot` files and the CSVs where marked.
- **Model axes:** X = the animal's left, Y = caudal (the head is at −Y), Z = up (gravity −Z). Every joint rotates about X (sagittal: flexion/extension), then Y (frontal: ab/adduction), then Z (horizontal: axial rotation).
- **Coordinate ranges are not anatomical.** They are generic clamps (sagittal ±180°, others ±90°). The real ranges of motion here are the measured walking ones.

### Not stored, and why
- **Meshes (`.obj`):** about 145 MB per package. Only numbers derived from them are stored, per the folder rules.
- **`full_curved` and `scale_beagle.xml`:** no licence shown. Only facts are stored.
- **`fore_low.osim`:** a duplicate of `fore.osim` that differs only in mesh names.
- **The 4 working-version `.osim` files, `.jnt`/`.msl`, screenshots:** these are subsets or other formats of the stored full_linear model.
- **`.mot`, `.sto` and setup `.xml` raw files:** the useful content (kinematics and stance timing) is extracted into the CSVs. The inverse-dynamics and static-optimisation results are described only.
- **Raw `.osim`:** both stored files are well under 3 MB (319 KB and 538 KB), so they are kept raw and unmodified, only renamed (`stark_full_linear_spezzoo.osim`, `stark_beagle_fore_verified.osim`).

### Doubts
- **The default pose is the model's default, not a measured stance.** In it the carpus is overextended by 37° (palmar angle 217°), while the walking data peak at about 193° in stance. Use segment lengths freely, but take standing angles from gait data.
- **The Shepherd-sized model is a stretched Beagle**, not a measured Shepherd. Its proportions within each limb are the Beagle's; between trunk and limbs they follow the 1.25/1.66 factors.
- **MCP angle swings to about 268° in swing.** The MCP coordinate goes to −87° (strong digit extension) in swing in every trial. This may be an IK artefact (paw markers); the stance values look plausible.
- **Some muscle origins sit on unexpected bodies** (for example, `brachialis` originates on the scapula body in the file). The paths are kept as published.
- **Landmarks are single extreme vertices**, so they are only approximate.

### Earlier blocker (kept for the record)
The first agent could not download from SimTK. `download_confirm.php` redirects to the login page (tried 3 times), SVN returns 401, there is no copy in the supplement, Zenodo, figshare or a GitHub mirror, and `web.archive.org` is blocked by the egress policy. The CC BY article numbers it recorded are still in `data.json`.

## B. Greyhound hindlimb model (Ellis, Rankin & Hutchinson 2018): fetched
- **Source:** "Opensim model and simulation data: greyhound sit-to-stand", figshare 2018, uploaded by John R. Hutchinson.
  - DOI 10.6084/m9.figshare.7240538.v2
  - https://figshare.com/articles/dataset/Opensim_model_and_simulation_data_greyhound_sit-to-stand/7240538
  - File: https://ndownloader.figshare.com/files/13368230 (3.0 MB zip)
- **Paper:** Ellis RG, Rankin JW, Hutchinson JR (2018) *Limb kinematics, kinetics and muscle dynamics during the sit-to-stand transition in greyhounds.* Front Bioeng Biotechnol 6:162. doi:10.3389/fbioe.2018.00162 (PMC6250835; I read its full text through the Europe PMC API).
- **Licence:** CC BY 4.0 (figshare record). The SimTK project https://simtk.org/projects/greyhoundleg has **no downloads** ("This project has no downloads"), so figshare is the real source.
- **Stored:** `greyhound_hindlimb_nominal.osim`. It is the unmodified `2018_Greyhound_Hindlimb_Model_Nominal.osim` (147 KB, CC BY 4.0), renamed.
  - Meshes (`.vtp`, 14 MB) and `.mot` files are not stored.
  - Other variants: UnconstrainedJoints (knee/ankle Rx and Rz unlocked) and ±10% tendon slack.

### How the data were extracted
- **Parsing.** `xml.etree` (run with `python3 -I`) on the Nominal `.osim` (OpenSim 3.0 format, `Version="30000"`). From each body it takes the mass, CoM and inertia. From each joint (Joint nested in the child Body) it takes:
  - `location_in_parent` and `orientation_in_parent` (parent frame);
  - `location` and `orientation` (child frame);
  - the CustomJoint `SpatialTransform` axes and functions;
  - each Coordinate's default value, range, clamped flag and locked flag.
- **Angle units.** Radians are converted to degrees, and both are kept.
- **Joint centres in global coordinates.** These come from forward kinematics:
  - X_child = X_parent · T(location_in_parent) · R_xyz(orientation_in_parent) · SpatialTransform(q) · [T(location)·R(orientation)]⁻¹.
  - Rotations are successive body-fixed rotations about the listed axes; translations are along parent-frame axes.
  - There are no orientation offsets in this model, and each joint has only one non-zero default rotation, so the rotation order does not matter here.
  - Two poses are given: `default_pose` (the file's defaults: Hip_Ry −30°, Knee_Ry +50°, Ankle_Ry −45°, root raised to Z = 0.675 m) and `zero_pose` (all 0, limb straight and vertical).
- **MTP and toe tip (estimates, not joints).** The model has no toe joint. Both points are estimated from the bone-mesh bounds in the Foot frame, after the file's 0.78 display scale:
  - `Tarsals.vtp` (tarsals + metatarsals) ends at z = −0.113 m;
  - `Toes.vtp` (phalanges) spans z = −0.097 to −0.157 m;
  - MTP = the midpoint of the overlap (−0.105 m); toe tip = −0.157 m.
  - Confidence: EST.

### Units, axes and angle conventions
- **Units:** metres, kg, N (file `length_units` = meters, `force_units` = N); angles in radians in the file.
- **Axes:**
  - Model axes: X = cranial (forward), Y = the animal's left (lateral for this left hindlimb), Z = up. Gravity is (0, 0, −9.80665).
  - Rotations: Rx = ab/adduction, Ry = flexion/extension, Rz = internal/external rotation.
  - Sagittal signs (checked by forward kinematics): Hip_Ry < 0 = hip flexion (femur swings cranially); Knee_Ry > 0 = stifle flexion; Ankle_Ry < 0 = hock flexion (metatarsus swings cranially).
- **Included angles:** the stifle included angle is 180 − Knee_Ry and the hock included angle is 180 − |Ankle_Ry| (180 = straight). Both are computed from the projected points in `poses.*.sagittal_included_angles_deg`.
- **Ranges:** the coordinate ranges are the model's clamps, not measured ROM. The measured sit-to-stand ROM from the paper's Table 3 is in `scaling_notes`.
- **Game side view** (`greyhound_side_view.csv`): x_forward = model X (right), y_down = −model Z, in metres, with the origin at the hip joint centre. The view drops Y (mediolateral).

### Scaling notes (from the paper)
- **Where the model comes from:** CT of one adult greyhound's left hindlimb (a formalin cadaver). Joint centres come from spheres and cylinders fitted in 3DS Max.
- **Masses:**
  - The thigh, shank and foot masses come from ray-projection volumes at 1060 kg/m³.
  - The body and head masses come from regressions of leg length against the mass and length of the 8 experimental greyhounds (27 ± 5 kg, shoulder height 60.5 ± 8 cm, hip height 61.6 ± 3.9 cm), then from the Amit 2009 regressions.
- **Scaling to the subject:** the file is already scaled to the representative trial's subject with OpenSim's Scale tool, using marker-based segment lengths. The display scales are Body 0.81, Thigh 0.89, Shank 0.76 and Foot 0.78; the pelvis factor (0.81) is the mean of the three limb factors.
- **Masses in the file:** the total is 19.36 kg. "Body" (16.57 kg) lumps the torso, head and the other limbs.

## Not done or not stored (greyhound)
- The greyhound meshes (`.vtp`, 14 MB); only numbers derived from them are stored.
- The `.mot` sit-to-stand kinematics. They are CC BY, but they are sit-to-stand, not gait, and so out of scope. They are still available in the figshare zip.
- For what was not stored from the Stark packages, see section A.
