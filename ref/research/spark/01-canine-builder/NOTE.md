# NOTE: options, sources, licences, ladder (Spark, Oct 8 2026)

## Options compared
Scores run 1 (poor) to 5 (strong). "Data" means how well our species numbers and research plug in.

| Road | Look | Effort | Reliability | Part swap | Rig / gaits | 2D fit | Licence | Data | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| **A. Current:** skeleton → plate muscles → relief | 2 | 1 (weeks per animal) | 2 (errors compound) | 1 | 3 (skeleton) | 2 | 5 | 5 | **Stop as mesh base**; keep as data and check |
| **B. SDF form builder** (blended masses on joints; this prototype) | 3 now, 4–5 with tuning | 4 | 5 (pure function of params) | 5 | 4 (masses ride bones) | 5 (lit, flat, any view, in-browser) | 5 (our code) | 5 | **Recommended** |
| **C. Base mesh + shape keys + Rigify** (Blender) | 4–5 if a good base mesh exists | 2 | 4 | 3 (needs a mesh per part) | 5 | 3 (render to sprites) | Blender GPL to run, outputs ours; **no CC0 dog base mesh with decent anatomy found** | 3 | **Fallback**: bake B to mesh to get the base mesh |
| **D. SMAL / SMBLD / BARC / BITE** (parametric animal models) | 3 (toy-figurine scans) | 3 | 4 | 2 | 4 | 3 | **Non-commercial research only**; can't ship or train from it | 2 | Reject; ideas only (per-segment scale, breed similarity) |
| **E. Image-to-3D** (TRELLIS, TripoSR) | 3, varies | 3 | 2 (each run differs; not rig-ready) | 1 | 1 | 3 | TRELLIS and TripoSR are MIT. Hunyuan3D-2 bars the EU, UK and South Korea, so avoid it | 1 | Reject as builder. Maybe a reference-shape helper later |
| **F. 2D parts on a skeleton** (SVG/Pixi cut-out, like hero2) | 3, artist-bound | 3 per breed | 4 | 4 | 4 | 5 | 5 | 2 | B *feeds* F: B's flat render and outline are the parts' source |
| **G. Blender skin modifier / metaballs** | 3 | 3 | 4 | 3 | 4 | 3 | GPL tool only | 4 | Same idea as B but locked in Blender. Spore's metaballs webbed between limbs, which B avoids with a blend radius per mass |

## Why the SDF form builder is a proven road
- **Media Molecule's *Dreams* (PS4, 2020):** shipped a whole creation game on blended SDF primitives (Alex Evans, SIGGRAPH 2015 Advances, "Learning from failure"). Verified from search snippets and the Media Molecule blog; I did not open the PDF.
- **Adobe Substance 3D Modeler and Womp:** both are SDF sculptors. Adobe's help says "uses Signed Distance Fields". Verified from search snippets.
- **Spore (2008):** creature skins were "a blobby implicit surface (metaballs)" (Chris Hecker, liner notes; page verified). Spore is the closest proof of a swappable-parts creature builder.
- **ZBrush ZSpheres, then DynaMesh:** the standard animal blockout. Sculptors start from masses on an armature, which is what B automates.
- **Smooth minimum:** a published formula (Inigo Quilez's articles; his snippets are stated to be MIT). Our shader writes it from the math and copies no code.

## Licences (sub-agent check, Oct 8; primary pages unless noted)
- **SMAL:** smal.is.tue.mpg.de/license.html says "Any other use, in particular any use for commercial purposes, is prohibited"; it also bars training and redistribution. BARC and BITE (github runa91) are under the same non-commercial software licence. SMBLD's terms weren't found; assume they are the same as SMAL's.
- **TRELLIS:** MIT, though some submodules carry their own licences. **TripoSR:** MIT for code and weights. **Hunyuan3D-2:** community licence that excludes the EU, UK and South Korea.
- **Base meshes:** Quaternius packs are CC0 but low-poly. OpenGameArt "Wolf Low Poly (Rigged)" is CC0 at 318 vertices, a blockout only. No good-anatomy CC0 dog was found.
- **Rigify:** GPL-2.0+ code, and it ships a wolf metarig. The rigs it generates are content.
- **three.js:** MIT, and its MarchingCubes example is MIT. The `isosurface` npm package (mikolalysenko) is MIT. Both are candidates for the fallback's mesh bake in the browser. scikit-image (BSD) is the Python option.
- **The prototype:** our own code (Spark), with no third-party code inside. It runs on Playwright (Apache-2.0) with Chromium.

## Method (prototype)
- **Joints:** a standing pose solved from the wolf's bone lengths (Law et al. 2025, via `species/wolf.yaml`).
  - Fore leg: humerus at 62° below horizontal, radius plus carpus near-vertical, pastern 18° off vertical.
  - Hind leg: femur at −62°, tibia at −128°, metatarsus near-vertical.
  - Both legs are set on the ground; the far legs are offset for a natural stack.
- **Toplines:** loin and croup take their heights from Scout 17's ratios (0.94 and 0.925 WH, minus the skin).
- **Proportions:** chest width 0.12 WH (half-width, after Scout 16's 0.26 WH bony full width plus muscle). Brisket at elbow height. Body span 1.05 WH.
- **Masses:** 64 masses with a blend radius per mass. Tendons are small radii with small blend radii, so they stay crisp.
- **Coat:** a colour per region, blended through the same smooth union, plus countershading and a saddle driven by the surface normal. Fur is a uniform offset; it should become a field per region.
- **Render:** a WebGL fragment shader sphere-traces the field with soft shadows, ambient occlusion and rim light. The flat mode uses two tones and an outline. SwiftShader takes about 5 s for a 1600×1000 image.
- **Not done:**
  - silhouette scoring against Shutter's outlines;
  - reading `species/*.yaml` directly (the presets copy the wolf's bones and scale the other dogs by withers height);
  - any posing beyond the stand.

## The ladder climb
- **Sonnet sub-agent:** one, for the licences and the proof of track record: 10 items, about 75k tokens, 32 tool calls. Its report is summarised above. Unverified items are marked.
- **Spark (Opus):** the critique, the builder, the renders and this write-up.
- **Teammates:** none asked yet. Palette (look) and Forge (iteration) come next once Firefly and GrumpyDingo pick the road.
- **Not available:** Blender isn't installed in this container, so the fallback was not prototyped here.
