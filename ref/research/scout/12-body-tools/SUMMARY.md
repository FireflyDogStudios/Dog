# Body from skeleton: the short answer (Scout item 12, 2026-10-07)

Details: `tools.csv` (52 tools), `papers.csv` (30 papers), `NOTE.md` (method, sources, licence findings). Nothing was installed or run; repos were only read.

## The finding in one line
No open tool builds a dog body from bones. But the method has been standard since **Wilhelms and Van Gelder (1997)**: bones as meshes → muscles as bellies between origin and insertion → voxelise everything → extract an isosurface as the skin → relax it. Every step exists as a permissive Python library or a built-in Blender feature. **We can build it ourselves in about 4 to 6 days, headless, with no new licence risk.**

## Top tools
1. **Our own Python SDF builder (recommended core):** fogleman/sdf (MIT; capsules, rounded cones, smooth union, offset), scikit-image `marching_cubes` (BSD-3), trimesh (MIT), fast-simplification (MIT). No Blender needed until fur and render.
2. **MuSkeMo** (github.com/PashavanBijlert/MuSkeMo; Blender 4.1-5.2; pushed Oct 5 2026): imports an `.osim` with bone geometry and muscle paths, turns every muscle into a **volumetric belly sized by the Hill volume F_max × L_opt / specific tension**, and has convex-hull segment volumes. Closest thing to "our pipeline, already built". **Blocker: the repo has no licence file** (bundled scripts carry mixed CC BY-NC and CC BY headers). Reference and cross-check only until the author (pasha.vanbijlert@naturalis.nl) adds a licence: needs a human.
3. **Built-in Blender** (GPL; we run it, never ship it), all usable in `--background`: Skin modifier (vertex graph with radii → tubes for legs, neck, tail); Geometry Nodes Points/Mesh to Volume → Volume to Mesh; voxel Remesh; Shrinkwrap with offset; Corrective Smooth; hair curves; Cycles CPU render; Rigify **Wolf** metarig for posing.
4. **Infinigen** (BSD-3, bpy 4.2, headless by design, github.com/princeton-vl/infinigen): the only open procedural carnivore generator; wolf NURBS body and head templates and Blender hair-groom code. Not anatomy-driven: mine it for **fur groom code** and as a possible topology donor, not as the body source.
5. **MyoGenerator** (GPL-3, github.com/evaherbst/MyoGenerator): palaeontology muscle bellies from attachment areas plus a path. Right idea, but Blender 2.9x only and interactive: method reference only.

**Not usable:** SMAL, SMALR, D-SMAL/BARC, BITE, hSMAL, Animal3D (MPI non-commercial licence; even outputs barred; the MIT fitting code still needs those model files). Paid: X-Muscle System, Auto-Rig Pro, Animal Rigger Pro, Meat Machine, Houdini Muscles & Tissue, AdonisFX; Ziva is discontinued. MB-Lab meshes are AGPL and humans only. **No open "MakeHuman for dogs" exists**; MPFB2 (code GPL-3, assets CC0, output unrestricted) is the licensing model to copy if we ever make one.

**Papers:** Wilhelms & Van Gelder 1997/98 and Navarro Newball 2011 ("Anatomy guided bottom up creature skinning": bones, muscles and organs → implicit skin, then fur offsets) match our plan most closely. Anatomy Transfer, Computational Bodybuilding and Kadleček 2016 released no code and work from the skin inward. VIPER (Apache-2.0) and MASS (Apache-2.0) are open but overkill. Three DOIs in `papers.csv` are from memory (Teran 2005, Lee 2019, Vaillant 2013): verify before citing.

## Proposed pipeline (headless, Python first, Blender only at the end)
Inputs we already have: `scout/10-stark-meshes/` (bone GLBs in mm, `bodies.csv` with default-pose 4×4s); `fetched/03-dog-model/stark_muscles.csv` (path points, F_max, L_opt, tendon slack, wrap objects); `fetched/01-skin-offsets` (17 landmarks); `scout/08-tafel2-muscles` (which muscles show); `scout/03-wolf-coat` and `04-dingo-coat` (coat thickness by region).

1. **Assemble the skeleton** (trimesh): apply each body's default-pose 4×4 from `bodies.csv`. Optionally re-pose with OpenSim 4.6 (Apache-2.0) to a standing pose and take wrapped muscle path points for that pose.
2. **Muscle bellies:** superficial muscles only (the Tafel 2 list). Hill volume V = F_max × L_opt / σ, σ ≈ 0.3 MPa. Belly length L_b = L_opt along the path, centred between the tendons (tendon slack). Spindle radius r(t) = r_max·sin(πt), r_max = √(2V / (π L_b)). Follow the via points; sheet muscles (trapezius, latissimus, pectorals) become several parallel capsules.
3. **Trunk filler:** the model has no abdominal wall or viscera. Convex hull of ribs, sternum, abdomen and pelvis, expanded (as MuSkeMo does); shape the belly line to the measured chest and belly offsets.
4. **Implicit union:** SDF of bones + muscle capsules + trunk hull; smooth-min with blend radius k on a 1-2 mm voxel grid (a ~750 mm dog needs about 450×250×600 voxels: fine on CPU); marching cubes; Taubin smoothing.
5. **Skin (fascia, fat, skin):** offset the shell outward by a thickness field interpolated (scipy RBFInterpolator) from the 17 Ellenberger skin-over-bone landmarks, and **clamp** so every bony landmark (withers, olecranon, tuber coxae, ischium, calcaneus …) sits at its measured depth: the "bones pin the line only at landmarks" rule from `outline-methods/REPORT.md`.
6. **Fur:** for the outline, a second offset shell by coat thickness per region (summer/winter switch); for shading, Blender hair curves on the skin (Geometry Nodes or Infinigen's groom code), length from the same field.
7. **Side view:** (a) silhouette without rendering: project skin and fur shells orthographically onto the sagittal plane (trimesh), shapely union and simplify, SVG in mm facing right, for the game outline; (b) picture: orthographic **Cycles CPU** render. Eevee may need a GPU/GL context a headless container lacks: don't rely on it.
8. **Checks:** overlay on Ellenberger Tafel 1 and 3 and the wolf template photos (`scout/01-body-templates`); every bony landmark inside the skin at its offset; Hausdorff distance to a donor body (`scout/11`) after Procrustes; per-region offsets reported. Where it disagrees, **warp toward the template**: the grown body is the anatomical prior, the template or photo is the correction.

**Packages and licences:** core numpy and scipy (BSD), scikit-image (BSD-3), trimesh (MIT), fogleman/sdf (MIT), fast-simplification (MIT), shapely (BSD-3); optional mesh_to_sdf (MIT), manifold3d (Apache-2.0), pyvista (MIT), PyMeshLab (GPL-3, tool only), libigl bindings (GPL-3, tool only), OpenSim 4.6 (Apache-2.0); render Blender/bpy 4.2 (GPL, tool only). All output is ours; the only third-party data is the Stark model (MIT), Ellenberger (PD) and the coat sources (facts).

**Effort (rough):** skeleton assembly 0.5 day (mostly done in item 10); muscle capsules 1 day; trunk hull + union + marching cubes 1 day; thickness field 0.5-1 day; fur shell + silhouette SVG 0.5 day; Blender hair + Cycles side render 1-2 days; checks 0.5 day. **About 4-6 days**, in slices GrumpyDingo can judge one at a time.

## Blockers and what needs a human
- **MuSkeMo licence:** ask the author, or stay reference-only.
- **bpy is not installed in this session**, so no headless claim was smoke-tested. First slice: a 10-line `--background` test (import the skeleton, Remesh, Shrinkwrap, Cycles render). (Firefly's kit lists Blender 4.2 headless as installed at session start.)
- **Muscle lines are lines of action, not bellies:** the Hill volume gives the right amount of muscle, not its shape. Expect to tune σ and k against the Ellenberger plates.
- **Neck, head soft tissue, ears and tail** are thin in the Stark muscle set: use `scout/05`, `06`, `07`.
- **The Stark meshes are one stretched-Beagle bone set** (see `scout/10-stark-meshes/NOTE.md`), not a dingo: the grown body inherits those proportions until scaled per segment from dingo data.
