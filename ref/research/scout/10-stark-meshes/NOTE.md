# 10 Stark dog model: 3D bone meshes

Scout, Oct 7, 2026, for Firefly's 3D route (`docs/claude/DEN-SCOUT-REQUEST-3D-2026-10-07.md`, item 1).

## Source and licence
- Stark, Fischer, Hunt et al. 2021, *A three-dimensional musculoskeletal model of the dog*, Sci Rep 11:11335 (doi 10.1038/s41598-021-90058-0, CC BY 4.0); SimTK project https://simtk.org/projects/dogmodel , downloads https://simtk.org/frs/?group_id=2032 .
- Model files: **MIT, "Copyright (c) 2021, FSU Jena, Heiko Stark"** (`LICENSE-stark.txt`). Downloaded by GrumpyDingo with a SimTK login on Oct 6 and handed over through Drive (`My Drive / den-ledger-everything / ref`): `Full linear.zip` and `Dogforelimbmodelverified-latest.zip`.
- Credit owed in `CREDITS` if anything built from these ships.

## What is here
- `meshes/<body>.glb`: one GLB per OpenSim body (24 bodies), in **millimetres**, in **that body's own frame** (unscaled, exactly as the `.osim` references them). Bodies with several meshes (carpus, calx) hold each as a named node. 680k faces in total, decimated from 2.05M (fast-simplification, quadric). Budget: thorax 120k, skull (caput) 100k, pelvis 40k, scapula 30k each, cervical spine and abdomen 30k, long bones 20k each, tail 20k, paw and metapodial pieces 7-10k.
- `bodies.csv`: one row per body: GLB path, source mesh files, faces before/after, mass (both models), **mesh display scale for each model**, the parent joint (name, type, parent body, location and orientation in parent and in child, for both models; locations in mm, orientations in radians, OpenSim body-fixed X-Y-Z Euler), the joint's transform axes with coordinate defaults and functions, and the **default-pose ground transform** (4×4, row-major, translation in mm) for both models. Multiplying a mesh by `ground_4x4 @ diag(mesh_scale)` places it exactly as OpenSim does at the default pose.
- `skeleton_full_default_pose_preview.glb`, `skeleton_beagle_default_pose_preview.glb`: the whole skeleton assembled at the default pose, decimated a further 85 % (preview only; use the per-body meshes for work). Both were rendered and checked: spine, ribs, skull, tail and all four limbs connect correctly.

## Frames and conventions
- OpenSim frame: **X = the dog's left, Y = backwards (caudal; the head is at −Y), Z = up.** Units converted from metres to mm; nothing else changed.
- For a side view facing right: game x = −Y, game y = −Z (down), as in `fetched/03-dog-model`.
- The default pose is OpenSim's, **not a natural stance** (carpus about 217°); pose the joints from the gait data and the limits in `missingfound/joint-ranges/`.

## The two models: important
- **Both zips contain byte-identical mesh files** (all 70 checked by md5). The "verified Beagle" forelimb model does not have its own bones: it **displays the same meshes at scale 0.6 (limbs, pelvis) and 0.8 (trunk, neck, head, tail)**, with its own joint positions and masses. Both scale sets are in `bodies.csv` (`mesh_scale_full`, `mesh_scale_beagle`).
- So the "full" model is not a separate stretched skeleton of different bones: the meshes are one Shepherd-sized set (built by stretching the Beagle CT bones, per the paper: limbs ×1.66, trunk ×1.25), and the Beagle model shrinks them back. The Beagle's limb proportions are therefore identical to the full model's; only trunk-to-limb proportions differ.
- The verified package's motion data (walking kinematics, ground forces) were extracted earlier into `ref/research/fetched/03-dog-model/` (`stark_fore_motion*.csv`).

## Left out, and why
- 39 of the 70 OBJ files are not referenced by either `.osim`: un-reoriented copies of the same bones (`new-*.obj`; same face counts, different orientation), plus `new_pelvis.obj`, which is at 100× scale (broken), and `box.obj` (the ground). Not converted. The used set is the `new_stretched-*` limb bones and the `new-*` trunk, skull and tail meshes listed in `bodies.csv`.
- Muscle paths, wrapping surfaces and joint data are already in `fetched/03-dog-model/` (`stark_muscles.csv`, `stark_full_joints.csv`), not duplicated here.
- Raw zips and full-resolution meshes stay in Drive.

## How it was made
Python with trimesh (MIT) and fast-simplification (MIT); the `.osim` parser and forward kinematics from the 03 extraction. Scripts kept outside the repo (Scout scratchpad: `osim.py`, `meshes10.py`, `preview10.py`); they can be added if wanted.
