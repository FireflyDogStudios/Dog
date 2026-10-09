# Tooling: industry-leading picks and fallbacks (Oct 7, 2026)

Research by a Firefly research agent (licences checked on PyPI's JSON API, `npm view`, `apt-cache` and web search), then installed by Firefly with GrumpyDingo's standing approval ("automatically approved to grab such tools"). `./den doctor` lists them all; new sessions install them through the session-start hook (heavy ones in the background).

## Licence traps
- **No commercial use:** DeepLabCut SuperAnimal-Quadruped weights, `pyiqa`, SLEAP (its docs say research only). Not installed.
- **AGPL (avoid entirely):** dssim, gifski, ultralytics YOLO-pose.
- **GPL (tools we run; never shipped in the game):** Blender/bpy, Inkscape, gifsicle, CGAL bindings.
- **Weak copyleft, fine unmodified:** `@resvg/resvg-js` (MPL-2.0), Hypothesis (MPL-2.0).
- **Wrong pip names:** Pinocchio is `pin`; the IK library is `pin-pink`.
- OpenSim: `pip install opensim` gave OpenSim 4.6, licence Apache 2.0.

## Per job: pick, fallback, status
| Job | Pick | Fallback | Status |
|---|---|---|---|
| 3D anatomy and meshes | trimesh + XML parsing of .osim; vtk for .vtp | OpenSim 4.6 (pose the real model), PyVista; Blender 4.2 headless for reference renders | all installed; OpenSim loads the Beagle forelimb (24 bodies, 43 muscles) and greyhound models; the full-body model has a bad `min_control` value in its own file |
| Physics, gait plausibility | MuJoCo + dm_control (ships a dog model: 62 bodies, 74 joints, 38 actuators) | OpenSim/Moco, PyBullet | installed; **later** (talk first: "no long sims") |
| IK | our own analytic 2-/3-bone solver + FABRIK in JS; scipy least_squares offline | ikpy; Pinocchio (`pin`) | ikpy installed; Pinocchio skipped |
| 2D geometry | shapely 2 (GEOS) + Clipper2 (`pyclipr`, clipper2-ts) | skia-pathops (Bézier booleans), pyclipper, polygon-clipping, paper.js, Inkscape CLI | installed; CGAL skipped (GPL, overkill) |
| Curve and outline fitting | fit-curve, scipy splines, bezier; pyefd (elliptic Fourier); morphops (Procrustes / GPA) | lmfit | installed |
| 2D rig formats | **keep our own rig** + Pixi MeshRope for bending sleeves | Spine-like open JSON as an export format later | Rive (paid editor since Oct 2025), Lottie (no bones), DragonBones (abandoned) skipped |
| Image QA | odiff (fast, anti-aliasing aware) + SSIM (scikit-image) | SSIMULACRA2, pixelmatch, Playwright screenshots | installed; LPIPS skipped (needs torch) |
| Rendering | Playwright + Chromium (the real Pixi scene) | resvg; skia-python, cairo | installed (resvg was already in) |
| Data and stats | numpy, scipy, polars, pandas, statsmodels, scikit-learn | lmfit; R geomorph via apt | installed |
| Code quality | ruff, pyright/mypy, Biome (or eslint + prettier), vitest, pytest, fast-check, hypothesis, syrupy | `tsc --checkJs` phased in per module | installed; not yet wired into checks |
| Assets | svgo, sharp (libvips), oxipng, ffmpeg, gifenc | ImageMagick, gifsicle | installed |
| Vision on our own clips | SAM 2 (Apache code and weights) for silhouettes; OpenCV with hand-clicked joints | MMPose with AP-10K models (check each checkpoint's licence); DeepLabCut trained on our own data | **later**, when clips exist (torch is about 2 GB) |

## Sources
pypi.org/project/pyopensim; OpenSim licence (opensimconfluence.atlassian.net); SuperAnimal-Quadruped model card (huggingface.co/mwmathis); SLEAP licence discussion (github talmolab/sleap #756); dssim (licenses.dev); gifski (docs.rs); odiff-bin; rive-wasm and Rive pricing; SAM 3 licence; ViTPose++ (arXiv 2212.04246); AP-10K (arXiv 2108.12617); dm_control (arXiv 2006.12983); MuJoCo musculoskeletal dog 2025 (arXiv 2506.23768; licence not verified); simtk.org/projects/dogmodel; github vaipatel/morphops.
