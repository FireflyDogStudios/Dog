# 03-dog-model: OpenSim dog model (Stark et al. 2021) and greyhound hindlimb model (Ellis et al. 2018)

Fetched 2026-10-06 by a Firefly data-fetch agent. Everything is in `data.json`; the CSVs repeat the greyhound tables.

## A. Stark et al. 2021 dog model: model files NOT fetched (login wall)
- **Source:** Stark H, Fischer MS, Hunt A, Young F, Quinn R, Andrada E (2021). *A three-dimensional musculoskeletal model of the dog.* Sci Rep 11:11335. doi:10.1038/s41598-021-90058-0
- **URLs:** https://www.nature.com/articles/s41598-021-90058-0 ; https://simtk.org/projects/dogmodel ; downloads https://simtk.org/frs/?group_id=2032 ; supplement https://media.springernature.com/original/springer-static/esm/art%3A10.1038%2Fs41598-021-90058-0/MediaObjects/41598_2021_90058_MOESM1_ESM.pdf
- **Licence:**
  - The article and supplement are CC BY 4.0.
  - The SimTK pages show an **MIT** "Use Agreement" (Copyright (c) 2021 FSU Jena, Heiko Stark) for 7 of the 9 packages.
  - "Full dog model (curved)" and "Scaling data (Beagle)" show no licence.
- **Blocker:** every SimTK download needs a SimTK account.
  - `download_confirm.php` redirects to `/account/login.php`. I tried 3 times with different URLs, and SVN returns 401.
  - There is no copy in the supplement (a 15-page PDF with no joint tables) or on Zenodo or figshare.
  - A web search found no GitHub mirror. (GitHub search itself was not available in this session.)
  - The Wayback Machine has snapshots of the download URLs (2025-03-13), but `web.archive.org` is blocked by this environment's egress policy. They are probably just the login redirect anyway.
- **What a human must do:** log in to SimTK (a free account), download `Full linear.zip` (47 MB, MIT) and `scale_beagle.zip` (2 KB, licence unstated), and put the `.osim` where an agent can read it.
  - Then ask an agent to repeat section B's extraction on it. The extraction script handled OpenSim 3.x and 4.x formats; it was kept outside the repo, per the folder rules.
  - The model files are named in the supplement: `stark(2021)-beagle-fore.osim` and `..._low.osim`.
- **What was recorded instead** (from the CC BY article, in `data.json` → `dog_model_stark_2021`):
  - The Beagle: 13.8 kg, CT-based, 84 DOF, 134 muscles.
  - Table 1: forelimb DOFs (scapula 5, shoulder 3, elbow 2, carpus 2, forepaw 3) and the reserve-actuator limits.
  - The axis convention: rotation about x = flexion/extension, about y = abduction/adduction, about z = axial rotation.
  - The scaling method: Beagle bones scaled ×1.66 for the limbs and ×1.25 for the spine, neck and head to fit a German Shepherd muscle model. One factor per leg works because segment proportions are roughly constant across breeds. PCSA is scaled by log-regression on body mass.
  - Humerus inertia comparisons.

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

## Not done or not stored
- The Stark `.osim` files (login).
- The greyhound meshes (`.vtp`, 14 MB; numbers derived from them only).
- The `.mot` sit-to-stand kinematics. They are CC BY, but they are sit-to-stand, not gait, and so out of scope. They are still available in the figshare zip.
