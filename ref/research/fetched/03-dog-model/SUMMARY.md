# 03-dog-model: summary

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
