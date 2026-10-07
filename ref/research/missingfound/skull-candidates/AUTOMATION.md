# Skull pipeline: automating fetch, licence, orientation, landmarks and outlines

Written by Firefly on Oct 7, 2026 for GrumpyDingo. **Research only:** nothing below is installed or built yet. It needs GrumpyDingo's OK first, one phase at a time.

**The aim:** go from "a list of ~25 canid and hyena species" to a checked folder per skull, with:
- licence, measurements, landmarks, jaw-joint geometry, side and top outlines, a small mesh and a NOTE;
- far fewer hand steps than the two wolves done by hand;
- every number traceable to a file, a checksum and a licence.

Web claims were checked on Oct 7, 2026 (live API probes where possible). Sources are listed at the end, numbered [n].

---

## 0. The short answer

1. **One Python CLI, `./den skulls <step>`.** It joins the existing kit (`tools/den/`). Each step is idempotent and cached, and writes one `manifest.json` per specimen, validated by a pydantic model the kit already allows.
2. **Discovery and licences come from the APIs, not from web pages:**
   - Open Forest Data: Dataverse 4.20 search and native API, no key needed;
   - Sketchfab Data API v3: search is public; download needs a token;
   - MorphoSource API: needs a key;
   - Smithsonian Open Access: needs an api.data.gov key.
   
   Anything that is not CC0, CC BY or PD becomes `needs-human`, never "probably fine".
3. **Downloads are pinned by checksum.** pooch handles this; Dataverse gives an MD5 per file. Raw files go to a cache outside git, with Drive as the long-term home.
4. **Orientation, scale and landmarks come from one move:** register each skull to a landmarked template, using:
   - a rigid or similarity fit: FPFH features, then RANSAC, then ICP;
   - a non-rigid fit with coherent point drift (CPD);
   - landmark transfer.
   
   This is the ALPACA method from SlicerMorph. It runs in plain Python with the same libraries ALPACA itself uses now (itk, itk-fpfh, itk-ransac, cpdalp), or with Open3D and pycpd. Published errors are about 0.2–0.3 mm on mouse skulls, against 0.16 mm between two manual sessions [1].
5. **Most measurements are "greatest" distances.** These come straight from the oriented mesh's extents: zygomatic breadth, greatest neurocranium breadth, mandible height. They need no landmark, so they are robust. Landmark-based lengths use the transferred points.
6. **The 2D outlines are rasterised projections:**
   - contour with scikit-image;
   - simplify with shapely;
   - write SVG facing right with y down, in mm.
7. **A human sees every skull, but only for about 3–5 minutes.** They look at:
   - a contact-sheet PNG with three views, the landmarks, the outlines and a measurement table with checks (green/amber/red);
   - the `needs-human` flags.
   
   Licence edge cases and red checks always go to GrumpyDingo.
8. **Estimated time per skull:** about 10 minutes of wall time with ~4 minutes of human review, against roughly 1.5–3 hours by hand (section 9). There is a one-off cost of about a day to build the template from the two hand-done wolves.

---

## 1. Folder layout

```
ref/research/skulls/                         # in git: small, derived, licensed files only
  README.md                                  # index table: species, specimen, licence, status, CBL, flags
  datapackage.json                           # Frictionless descriptor of the whole set (optional, phase 4)
  _templates/
    canis-lupus-170753/                      # the reference template (one of the hand-done wolves)
      template.ply                           # decimated, oriented template mesh (< 3 MB)
      landmarks.json                         # hand-placed landmarks, checked by GrumpyDingo
      LANDMARKS.md                           # definitions + pictures of each landmark (von den Driesch names)
  <species>/<specimen>/                      # e.g. canis-lupus/ofd-170753, crocuta-crocuta/sf-a0af673b
    manifest.json                            # provenance + every step's status, versions, checksums (schema: section 3)
    measurements.json                        # von den Driesch measurements, mm, with method + QA status
    landmarks.json                           # landmarks in the skull frame (mm) + per-landmark spread across templates
    jaw.json                                 # jaw-joint axis, condyle centres, bony max-gape estimate
    outline-side.svg / outline-top.svg       # facing right, y down, mm units, viewBox in mm
    outlines.json                            # same polygons as point lists (mm, and normalised by CBL)
    skull.glb (or .ply)                      # decimated, oriented mesh < 3 MB (mandible separate node if present)
    contact.png                              # QA sheet (about 1600 px wide), small
    NOTE.md                                  # citation, licence, what was changed (CC BY "indicate changes")
    LICENSE.txt                              # only when the source ships one

tools/den/skulls/                            # the code (phase 1 onward), tests in tools/den/tests/skulls/
  cli.py  discover.py  licence.py  fetch.py  normalise.py  register.py  measure.py  outline.py  qa.py  schema.py
  tests/golden/                              # the two hand-done wolves as golden files

Raw files (never in git):
  $DEN_SKULL_CACHE   default ~/.cache/den/skulls/<source>/<id>/   # pooch cache, keyed by checksum
  Drive: My Drive / den-ledger-everything / ref / skulls-raw/       # long-term copy (as in HANDOFF section 6)
```

- **Identifiers:** a specimen id is `<source>-<id>`:
  - `ofd-170753` for the museum catalogue number;
  - `sf-<uid>` for Sketchfab;
  - `ms-<media id>` for MorphoSource;
  - `si-<record id>` for the Smithsonian.
- **Species slugs** use the binomial in kebab case.
- **Size budget:** a 3 MB mesh plus about 50 KB of the rest gives about 3 MB per specimen. At ~25 species × 2–3 specimens that is about 150–250 MB.
  - That is too big for plain git over time.
  - **Recommendation:** keep `skull.glb` under about 1 MB using meshopt compression (section 7); 300 k triangles compress to about 1 MB.
  - Or keep meshes out of git: Drive plus a checksum in the manifest.
  - git-lfs or DVC are options if GrumpyDingo wants meshes versioned (section 8).
- **Repo rule check:**
  - "raw downloads go in /tmp, never in the repo": the cache sits outside the repo; `/tmp` also works, but it is wiped between sessions, which makes reruns slow.
  - "never store anything over 20 MB": the `qa` step enforces this.

---

## 2. The pipeline, step by step

Each step:
- reads the manifest;
- skips itself if its inputs' hashes and the code version are unchanged;
- writes its outputs, its own status block (`ok` / `warn` / `needs-human` / `fail`) and the versions of the tools it used.

`./den skulls run <specimen>` runs every step; `./den skulls status` prints the table.

### Step 1: `discover` (APIs → candidate list)
**Input:** `species.yaml` (a list of binomials plus synonyms; for example *Lycaon pictus*; *Canis aureus* versus *C. anthus* or *Lupulella*; *Hyaena hyaena*).

**Output:** `candidates.csv` with one row per hit: source, id, title, file list with sizes and checksums, licence fields as found, and the URL.

| Source | How (verified Oct 7) | Key? | Licence field |
|---|---|---|---|
| **Open Forest Data** (Dataverse 4.20 at `https://dataverse.openforestdata.pl`) | `GET /api/search?q=Canis lupus&type=dataset`, then `GET /api/datasets/:persistentId/?persistentId=doi:10.48370/OFD/...`: file names, sizes, **MD5** and file ids. Download with `GET /api/access/datafile/<id>`. Example: `doi:10.48370/OFD/LVT9AC` (wolf 170753) holds `..._skull_scan3D_small.stl` (106 MB), `..._jaw_scan3D.stl` (23 MB) and `..._jaw_skull_scan3D.stl` (49 MB, **articulated**). Some datasets ship `.rar`. | No (public) [2] | **`latestVersion.license` is `"NONE"`; the CC BY 4.0 statement sits in the `termsOfUse` HTML.** The DOI's DataCite record has an empty `rightsList`, so DataCite cannot confirm it. The parser must find the exact `creativecommons.org/licenses/by/4.0` URL in `termsOfUse`. |
| **Sketchfab** Data API v3 | `GET https://api.sketchfab.com/v3/search?type=models&q=<binomial> skull&license=by&downloadable=true` works **without a token**. Each hit carries `license.label`, `isDownloadable` and the user. Licence slugs from `/v3/licenses`: `by`, `by-sa`, `by-nd`, `by-nc`, `by-nc-sa`, `by-nc-nd`, `cc0`, `free-st`, `st`, `ed`. Download: `GET /v3/models/{uid}/download` with header `Authorization: Token $SKETCHFAB_API_TOKEN`. It returns short-lived signed URLs for glTF, GLB or USDZ (source formats such as OBJ or STL are not offered through the API [3]). | **Token for download** [3][4] | `license.slug`: accept only `by` and `cc0`. Also read `tags`: skip any model tagged `noai` (the terms forbid NoAI content as input to generative AI; this pipeline is not generative AI, but the skip is cheap and safe) [5]. |
| **MorphoSource** | `GET https://www.morphosource.org/api/media?q=...&f[visibility][]=OPEN`. Hits carry `license`, `copyright_statement` (a rightsstatements.org URI), `visibility`, `media_type`, `physical_object_title` (catalogue number) and `file_size_all`. Downloads need an API key, a use statement and use categories (the `morphosource` package on PyPI, MIT) [6][7]. | **Key for download** | `license` is often empty, and `copyright_statement` can be `InC-NC` (in copyright, non-commercial: **reject**). MorphoSource also has a separate download use agreement [7]. |
| **Smithsonian Open Access** | `GET https://api.si.edu/openaccess/api/v1.0/search?q=...&api_key=$SI_API_KEY`. Records give `metadata_usage` (CC0 or not) and `online_media`. The 3D files are on 3d.si.edu. | **api.data.gov key** (free). DEMO_KEY allows 30 requests per hour and 50 per day; a real key allows 1,000 per hour [8]. | `metadata_usage.access == "CC0"` |
| **iDigBio** media search | `https://search.idigbio.org/v2/search/media/?mq={...}`. 3D media records exist (`dcterms:type: "3D model"`), but few, and they mostly point back to MorphoSource or Sketchfab. Use it as a cross-check for catalogue numbers, not as a file source. `idigbio` package, MIT. | No | per record (`dcterms:rights`) |
| **GBIF** | Occurrence media types are still images, video and sound only; there is no 3D. Use it only to resolve catalogue numbers, sex and locality (`pygbif`, MIT). | No | n/a |

**Rule:**
- `discover` never downloads a mesh.
- It ranks hits per species. The order:
  1. articulated skull plus mandible scans;
  2. adult;
  3. known sex;
  4. a museum catalogue number;
  5. structured-light or CT over photogrammetry.
- It writes the shortlist for a human to tick (section 6).

### Step 2: `licence` (machine check, human sign-off on edge cases)
Normalise every licence to an SPDX-like id: `CC0-1.0`, `CC-BY-4.0`, `CC-BY-3.0`, `PDM`. Then decide:
- **auto-accept:** `CC0-1.0`, `PDM`, or `CC-BY-*` where the licence URL is exact and comes from an API field.
- **needs-human:**
  - the licence is found only in free text;
  - the record and file licences disagree;
  - a MorphoSource "additional usage agreement" exists;
  - Sketchfab `free-st` or `st` (those are Sketchfab's own licences, not CC);
  - any `-SA` (CC BY-SA is not in the allowed set per the fetch rules);
  - a model whose description names a different rights holder.
- **reject:** `NC`, `ND`, InC-NC, Editorial, no licence, or a restricted download.

Store `licence.evidence`: the exact field path and raw value, plus the API response saved as `api-<source>.json` beside the raw file (in the cache), with its SHA-256 in the manifest. That is the audit trail if a licence later changes.

### Step 3: `fetch`
- **Library:** `pooch.retrieve(url, known_hash="md5:<dataverse md5>", path=$DEN_SKULL_CACHE/...)`. pooch skips files already cached and verifies the hash.
  - Sketchfab and the Smithsonian give no checksum. For them, record SHA-256 at first download (trust on first use) and pin it from then on.
- **Archives:**
  - `.rar` (OFD): `libarchive-c` (CC0 binding; libarchive itself is BSD) or `rarfile` (ISC; needs an `unrar` or `bsdtar` binary);
  - `.zip`: the standard library;
  - Sketchfab glTF: zip.
- **Politeness:** one download at a time per host, at most 3 hosts in parallel. Each host gets a token bucket (`aiolimiter`, MIT) and retries with backoff on 429 or 5xx (`tenacity`, Apache-2.0). Honour `Retry-After`. Send a descriptive User-Agent with a contact address. (HANDOFF section 10: Wikimedia returned HTTP 429 to parallel sessions; bioRxiv returned 429 during this research too.)
- **Large files:** 50–200 MB each. Stream to disk, never into memory or the conversation.

### Step 4: `normalise` (load, units, clean, coarse orientation)
- **Load:** `trimesh.load(..., force="mesh")` reads STL, OBJ, PLY and GLB; meshio covers odd formats.
  - Record the vertex and face counts, watertightness, the number of components and the bounding box.
- **Clean:**
  - merge duplicate vertices;
  - drop degenerate faces;
  - keep components above 1 % of the area;
  - split skull and mandible if both are in one file (connected components; if they touch, `needs-human`).
- **Units check:** the longest bounding-box axis should fall in the species' expected range of total skull length (a prior table in `species.yaml`).
  - Try the candidates ×1, ×10, ×1000 and ×25.4 and pick the one that fits.
  - **Sketchfab glTF is often rescaled by the uploader.** If the model page or description gives no scale, or the fit is ambiguous, set `scale.status = needs-human` with the reason "unit inferred".
  - OFD scans (ATOS structured light) are expected in mm.
- **Working copy:** decimate a copy to about 200 k faces for processing:
  - `fast-simplification` (MIT; it is the pyvista binding of Fast-Quadric-Mesh-Simplification);
  - or `pyfqmr` (MIT);
  - or `pymeshlab` quadric edge collapse (**GPL-3.0**: fine as a local tool, never shipped).
- **Coarse orientation:** PCA. The first axis is rostro-caudal for every canid and hyena skull.
  - Fix the sign with the mass asymmetry: the snout end has the smaller cross-sections.
  - Fix dorsal versus ventral with the tooth-row side: the ventral half has the higher surface roughness (tooth cusps).
  - This only needs to be good enough to seed step 5.

### Step 5: `register` (template → specimen: frame, landmarks)
This is ALPACA's recipe [1][9]. It runs in plain Python, outside Slicer.
1. **Similarity registration:**
   - downsample both clouds to about 3–5 k points (voxel grid);
   - compute FPFH features;
   - run RANSAC on feature matches;
   - refine with point-to-plane ICP.
   
   Do this with Open3D (MIT) or with ALPACA's own stack, `itk` + `itk-fpfh` + `itk-ransac` (all Apache-2.0). Allow scale (similarity) so a fox can be matched to the wolf template.
2. **Non-rigid registration:** deform the template cloud onto the specimen with coherent point drift (deformable CPD):
   - `cpdalp` (MIT, the CPD build ALPACA uses);
   - or `pycpd` (MIT);
   - or `probreg` (MIT; CPD plus FilterReg and others).
3. **Landmark transfer:** move each template landmark with the deformation, then snap it to the nearest specimen surface point.
4. **Multiple templates (MALPACA [1]):** run 2–4 templates and take the per-coordinate **median**:
   - start with the two hand-done wolves;
   - add a reviewed fox and a reviewed hyena as they pass review.
   
   The **spread across templates** is our per-landmark confidence. A spread above 2 % of CBL flags `needs-human`.
5. **Anatomical frame** (from landmarks, so it is reproducible):
   - **Midsagittal plane:** mirror the skull, ICP the mirror onto the original, and take the plane of symmetry. This is the standard bilateral method and needs no landmarks.
   - **x (rostral):** from the midpoint of the occipital condyles toward prosthion, projected into the midsagittal plane.
   - **y (dorsal):** in the midsagittal plane, perpendicular to x.
   - **z:** left-handed or right-handed, recorded; recommendation: z = specimen's left.
   - **Origin:** the midpoint of the two mandibular condyle centres (the jaw pivot, the point a rig needs). Also store prosthion so CBL-normalised coordinates are easy.
   - **Alternative "horizontal":** the palate plane (fit a plane to the hard-palate points). It is recorded as an angle so drawings can use either.
6. **Why this and not the alternatives:**
   - **SlicerMorph ALPACA or MALPACA itself** (BSD-2-Clause [9]) runs headless: `Slicer --no-main-window --python-script`, calling `ALPACALogic().runLandmarkMultiprocess()` [10]. But it drags in a 1 GB Slicer install. Keep it as a **cross-check** on the two golden wolves, not as the engine.
   - **auto3dgm** (Boyer et al. 2015 [11]) places pseudo-landmarks for whole-sample alignment, not named anatomical landmarks. It is not needed.
   - **MeshMonk** (Apache-2.0 per its repo licence file; C++ with MATLAB bindings): the authors report a 1.26 mm average error across 19 facial landmarks [12]. It is good, but MATLAB-first.
   - **Deformetrica** (INRIA licence, check before use): built for statistical atlases; overkill here.
   - **R geomorph / Morpho** (both GPL): excellent for Procrustes and statistics, but we do not need statistics. `morphops` (Python, MIT) gives Procrustes and thin-plate splines if needed.

### Step 6: `measure`
All in mm, in the skull frame. Each value records its **method** (`extent`, `landmark`, `fit`) and its inputs.

| Measurement (von den Driesch 1976 numbering for the dog skull) | Method |
|---|---|
| Total length: akrokranion to prosthion | landmarks |
| **Condylobasal length**: aboral borders of the occipital condyles to prosthion | the x extent between the condyle back plane and prosthion (landmark plus extent) |
| Basal length: basion to prosthion | landmarks |
| **Zygomatic breadth**: zygion to zygion | **extent**: max z minus min z over the arches |
| Greatest neurocranium breadth: euryon to euryon | extent over the braincase x range |
| Facial or snout length: nasion to prosthion | landmarks |
| Upper carnassial P4 length and lower M1 length | landmarks at the crown ends (amber by default; review) |
| Mandible length: infradentale to condyle | landmarks on the mandible |
| Mandible height: coronion to the ventral border | extent |
| Canine tip span; canine crown height | landmarks |
| Skull height: basion to the top of the sagittal crest | extent |

**Jaw geometry (`jaw.json`):**
- **Condyle centres:** fit a cylinder to each mandibular condyle's articular surface (least squares, scipy). The joint axis is the line through both centres.
- **Glenoid fit:** the matching fossa centres on the cranium; the gap between condyle and fossa is a check (it should be under ~2 mm when articulated).
- **Moment arms:** the coronoid tip and the angular process relative to the axis (useful later for the bite rig).
- **Bony maximum gape:** rotate the mandible about the axis in 0.5° steps until the first collision. Use `trimesh.collision` (needs `python-fcl`, BSD) or a manifold3d boolean (Apache-2.0); the usual blockers are the coronoid against the zygomatic arch or the postglenoid process.
  - Report the angle between the upper and lower **canine-tip lines** and between the occlusal planes.
  - **This is a bony upper bound, not the behavioural gape.** Soft tissue stops a dog at about 44° natural and 65° hard (HANDOFF section 3, item 5). Label it `bony_limit`, never `max_gape`.
- **When the mandible must be placed:** if the scan has no articulated jaw-and-skull file (OFD often ships `jaw_skull` as well):
  - articulate by seating each condyle in its fossa, with the incisors in occlusion;
  - mark `needs-human`.

### Step 7: `outline` (2D)
1. Orthographic projection along z (side view) and along y (top view) in the skull frame.
2. **Rasterise:** draw every projected triangle into a boolean mask at 0.1–0.2 mm per pixel (`skimage.draw.polygon`, vectorised in batches, or one z-buffer pass in numpy).
   - This is robust and fast for 200 k faces.
   - Avoid a shapely `unary_union` of 200 k triangles: it is correct but slow.
3. **Contour:** `skimage.measure.find_contours` at 0.5.
   - The outer contour is the silhouette.
   - Keep the inner holes in `outlines.json` (orbit and temporal fossa in the top view; useful for drawing).
4. **Simplify:** shapely `simplify(tol=0.2 mm, preserve_topology=True)`, then check that the Hausdorff distance to the raw contour is ≤ 0.5 mm.
   - Store both the full and the simplified polygons.
5. **Repo conventions** (HANDOFF "Conventions used everywhere"):
   - **facing right:** rostral = +x on screen;
   - **y down:** screen y = −dorsal;
   - units in mm, with a `viewBox` in mm;
   - origin at the jaw pivot.
   
   Also write `outlines.json` with the coordinates divided by CBL.
   - Side view: skull and mandible as separate polygons, so a rig can rotate the jaw about the pivot.
6. **SVG output:** write it directly (a few lines), or with `svgwrite` (MIT). Run it through `svgo` (already in npm) if size matters.
   - The benches can fit Béziers with `fit-curve` (MIT, already recommended in HANDOFF section 8) or `paper` (already installed).

### Step 8: `export` (small mesh plus NOTE)
- **Mesh:** decimate the oriented mesh to ≤ 3 MB.
  - About 100–150 k faces as binary PLY; or GLB with meshopt compression via `@gltf-transform/cli` (MIT), giving about 0.5–1 MB at 300 k faces.
  - Check the decimation error: the Hausdorff distance between the decimated and full mesh should stay ≤ 0.3 mm (sample points; trimesh `proximity`).
- **`NOTE.md`** is generated from the manifest:
  - title, creator, institution, catalogue number, DOI or URL, licence with its URL, date fetched;
  - **"Changes made"**: re-oriented to the skull frame, scaled ×k, cleaned (n components removed), decimated from N to M faces, mandible separated or articulated, landmarks and measurements derived.
  
  CC BY 4.0 requires indicating changes, so this list is mandatory.
- **Credits:** append the credit line to a `CREDITS` candidate list in `ref/research/skulls/README.md`. HANDOFF section 5 says credits are owed once anything ships.

### Step 9: `qa` (machine checks → contact sheet → human)
Section 5 lists the checks. They produce `contact.png` plus the `qa` status in the manifest.

---

## 3. Manifest schema (`manifest.json`, one per specimen)

The source of truth is a pydantic v2 model in `tools/den/skulls/schema.py`. `model_json_schema()` exports `manifest.schema.json` so the JS benches can validate it with `ajv` (already in npm).

```jsonc
{
  "schema_version": "1.0",
  "specimen_id": "ofd-170753",
  "species": {"binomial": "Canis lupus", "slug": "canis-lupus", "taxon_note": null},
  "specimen": {
    "institution": "Mammal Research Institute, Polish Academy of Sciences",
    "catalogue_no": "MRIPAS 170753", "sex": "M", "age_class": "adult|subadult|juvenile|unknown",
    "collected": "2015-10-31", "locality": "Białowieża Forest, Poland", "wild": true
  },
  "source": {
    "repository": "openforestdata|sketchfab|morphosource|smithsonian|other",
    "record_url": "https://dataverse.openforestdata.pl/dataset.xhtml?persistentId=doi:10.48370/OFD/LVT9AC",
    "doi": "10.48370/OFD/LVT9AC", "version": "3", "creator": "...", "uploader": "...",
    "citation": "Mammal Research Institute PAS (2020). Canis lupus - 170753 ... https://doi.org/10.48370/OFD/LVT9AC",
    "api_response_sha256": "…",            // saved raw API JSON, in the cache
    "fetched_at": "2026-10-07T12:00:00Z"
  },
  "licence": {
    "id": "CC-BY-4.0", "url": "http://creativecommons.org/licenses/by/4.0/",
    "evidence": {"field": "latestVersion.termsOfUse", "raw": "<a href=…by/4.0…>"},
    "decision": "accept|needs-human|reject", "decided_by": "auto|GrumpyDingo", "decided_at": "…",
    "attribution": "…exact credit line…", "noai_tag": false
  },
  "files": [
    {"role": "skull|mandible|articulated|archive|other", "name": "…_skull_scan3D_small.stl",
     "url": "…/api/access/datafile/292", "bytes": 105585862,
     "md5": "2a554229b48b3ef0ce133f79dc3e553d", "sha256": "…", "cache_path": "~/.cache/den/skulls/ofd/292/…",
     "drive_id": null}
  ],
  "mesh": {
    "units_in": "mm", "scale_factor": 1.0, "scale_status": "ok|inferred|needs-human",
    "faces_in": 2100000, "components_removed": 3, "watertight": false,
    "frame": {"origin": "jaw_pivot", "x": "rostral", "y": "dorsal", "z": "left",
              "transform_4x4": [[…]], "palate_angle_deg": 4.2, "symmetry_rms_mm": 0.6}
  },
  "registration": {
    "templates": ["canis-lupus-170753", "canis-lupus-XXXX"],
    "rigid_rmse_mm": 0.8, "cpd_params": {"beta": 2.0, "lambda": 2.0, "points": 4000},
    "landmark_spread_max_mm": 1.4
  },
  "outputs": {"measurements": "measurements.json", "landmarks": "landmarks.json", "jaw": "jaw.json",
              "outline_side": "outline-side.svg", "outline_top": "outline-top.svg",
              "mesh": "skull.glb", "mesh_bytes": 912345, "decimation_hausdorff_mm": 0.21,
              "contact_sheet": "contact.png"},
  "steps": {                                   // one block per step, so reruns are idempotent
    "discover": {"status": "ok", "at": "…", "code": "git:abc123", "inputs_sha256": "…"},
    "licence":  {"status": "ok"}, "fetch": {"status": "ok"}, "normalise": {"status": "warn", "msg": "unit inferred"},
    "register": {"status": "ok"}, "measure": {"status": "ok"}, "outline": {"status": "ok"},
    "export": {"status": "ok"}, "qa": {"status": "needs-human", "flags": ["P4 length amber"]}
  },
  "tools": {"python": "3.12", "trimesh": "4.x", "open3d": "0.19", "cpdalp": "1.2.0", "…": "…"},
  "review": {"by": null, "at": null, "verdict": null, "notes": null}
}
```

- **`measurements.json` rows:** `{name, vdd_no, value_mm, method, inputs:[landmark names], qa: green|amber|red, check_against: {source, value, n} }`.
- **`landmarks.json`:** `{name, xyz_mm, spread_mm, snapped: true, definition_ref}`, following the style of `ref/awa-pose` (names, not indices).
- **Optional packaging:**
  - A **Frictionless** `datapackage.json` (validator: `frictionless`, MIT) at the `skulls/` root lists every CSV and JSON with its schema and licence. It is handy for `./den species check`.
  - **RO-Crate** (`rocrate`, Apache-2.0) is the richer research-object standard. It is only worth it if the set is ever published.
  - DataCite metadata is read from DOIs, not written.

---

## 4. Landmarks (the minimal set)

Twelve per side or midline, all classic Type I or II points. They are named with von den Driesch and Evans (*Miller's Anatomy of the Dog*) terms; GrumpyDingo reviews their definitions once in `LANDMARKS.md`.

- **Midline:** prosthion, nasion, inion (or akrokranion), basion, staphylion (back of the hard palate) and infradentale (mandible).
- **Paired, left and right:**
  - occipital condyle (aboral point);
  - mandibular condyle centre;
  - coronoid tip;
  - upper canine tip;
  - lower canine tip;
  - P4 paracone or metastyle ends (upper carnassial);
  - M1 ends (lower carnassial);
  - zygion;
  - euryon;
  - glenoid fossa centre.

The paired points give the bilateral symmetry check for free.

---

## 5. QA checks (automatic) and the contact sheet

| Check | Green | Amber → review | Red → `needs-human`, no merge |
|---|---|---|---|
| Licence | auto-accept rule met | any edge case in step 2 | NC, ND, InC, missing |
| Checksum | matches the source MD5 or the pinned SHA-256 | first download (trust on first use) | mismatch |
| Units | the longest axis is inside the species prior, with a unique scale candidate | inferred unit | outside every candidate |
| Mesh sanity | ≥ 1 large component, < 5 % of the area dropped | holes or non-manifold in the tooth rows | skull fragmentary (the largest component is < 70 % of the area) |
| Symmetry | mirror-ICP RMS < 1 % of CBL | 1–2 % | > 2 % (deformed or broken skull) |
| Bilateral landmarks | left/right pairs mirror within 2 mm | 2–4 mm | > 4 mm |
| Template spread | every landmark spread < 1 % of CBL | 1–2 % | > 2 % |
| **CBL against literature** | within ±10 % of the species' published mean (from `species/*.yaml` or `ref/research/skeleton/species_numbers.json`) | 10–20 % | > 20 % (wrong species, wrong unit or a juvenile) |
| Ratios | ZB/CBL inside the species range (wolf 0.56 in `wolf.yaml`) | slightly outside | far outside |
| Jaw | condyle-to-fossa gap < 2 mm; the bony gape is a number in 40–100° | articulation inferred | collision at 0° (bad articulation) |
| Outline | simplified-to-raw Hausdorff ≤ 0.5 mm; one outer ring | small islands | no closed outline |
| Decimation | Hausdorff ≤ 0.3 mm; file < 3 MB | 0.3–0.6 mm | larger |
| Size rule | every repo file < 20 MB | | over |

**Contact sheet (`contact.png`):** one page per specimen, rendered big on a flat light background, per GrumpyDingo's review style.
- Lateral, dorsal and ventral views, plus the mandible.
- Landmarks as labelled dots, with a halo whose radius is the template spread.
- The outline overlaid in a contrasting colour.
- A measurement table with the green, amber and red cells.
- The licence line.

**Rendering:** matplotlib on the projected, shaded depth map. This is pure numpy with no OpenGL, so it works headless in a cloud session. Optional extra: a three.js page through the existing Playwright, for a true 3D render (section 7).

**Batch sheet:** `./den skulls sheet --all` tiles every specimen's side outline at the same CBL scale on one page. Wrong species and wrong scale show up instantly.

**Golden tests (pytest):** the two hand-done wolves are the reference.
- **Their measurements:** the automated values must match the hand values within 1 mm, or 0.5 % of CBL.
- **Their landmarks:** within 2 mm.
- **Their outlines:** within a Hausdorff distance of 1 mm.
- **Other tests:**
  - a unit test per licence string (including the OFD `termsOfUse` HTML and the Sketchfab slugs);
  - a synthetic test: a known mesh, rotated, scaled and mirrored, must come back to the same frame.
- **Where they run:** `tools/den/tests/skulls/`, alongside the kit's existing hypothesis and pytest tests. They run on small decimated fixtures (< 1 MB), never on raw files.

---

## 6. What stays human (the "needs-human" queue)

1. **Shortlist approval:** which specimens per species. This takes about 2 minutes per species, from a table with thumbnails and licences.
2. **Licence sign-off** on every amber licence:
   - Sketchfab models whose uploader is not the institution;
   - MorphoSource agreements;
   - BY-SA;
   - free-text-only licences.
3. **Template landmarks, once:** GrumpyDingo or Firefly places them on the template wolves, and GrumpyDingo checks the pictures. Repeat for each new template (fox, hyena).
4. **Contact-sheet review for every specimen:** about 3–5 minutes. Accept, fix one landmark (by editing `landmarks.json` and rerunning `measure`, `outline` and `qa`), or reject.
5. **Articulation, when inferred:** the mandible was placed by the tool.
6. **Anything red.**

`./den skulls queue` lists only these items, one at a time. This fits the ask-one-question-at-a-time rule.

---

## 7. npm side (benches, viewing, GLB optimisation)

| Package | Licence | Use |
|---|---|---|
| `three` (0.18x) | MIT | `STLLoader`, `OBJLoader`, `PLYLoader`, `GLTFLoader` and `MeshoptDecoder` in a small "skull bench": orbit, toggle landmarks, overlay the SVG outline in the side camera. With the existing Playwright, it can also render true-3D contact-sheet panels. |
| `@gltf-transform/core`, `@gltf-transform/functions`, `@gltf-transform/cli` (4.5) | MIT | `gltf-transform optimize in.glb out.glb --compress meshopt`: weld, simplify and meshopt-compress the export. A scriptable API, so it fits `./den`. |
| `meshoptimizer` (1.x) | MIT | the decoder and encoder used above; also standalone simplification |
| `gltfpack` | MIT | a one-shot CLI alternative to gltf-transform |
| `draco3d` / `draco3dgltf` | Apache-2.0 | only if Draco is ever preferred; meshopt is simpler and decodes faster in three.js |
| `fit-curve` | MIT | Bézier fit of the outline polygons (already suggested in HANDOFF section 8) |
| `@kitware/vtk.js` | BSD-3-Clause | not needed; three.js is enough |

The 2D tools already installed (`clipper2-ts`, `simplify-js`, `paper`, `svgpath`, `svgo`) cover outline offsets and cleanup.

---

## 8. Packages to add

### Python (`tools/den/requirements.txt`, tools only, never shipped)
The kit already has: numpy, scipy, scikit-image, shapely, opencv-python-headless, matplotlib, pillow (via `tools/lens`), and pydantic, jsonschema, pyyaml, pandas, rich, pytest, hypothesis and scikit-learn (via `tools/den`).

| Package (version checked Oct 7) | Licence | Why |
|---|---|---|
| `trimesh` 4.x | MIT | load, clean, split, proximity, export; the core |
| `fast-simplification` 0.2 | MIT | quadric decimation (pyvista project) |
| `open3d` 0.19 (PyPI 0.20 listed) | MIT | FPFH, RANSAC, ICP, voxel downsample, normals |
| `cpdalp` 1.2 | MIT | deformable CPD as used by ALPACA |
| `pycpd` 2.0 | MIT | alternative or cross-check CPD |
| `pooch` 1.9 | BSD-3-Clause | cached, hash-checked downloads |
| `httpx` 0.28 | BSD-3-Clause | API calls (sync or async) |
| `tenacity` 9 | Apache-2.0 | retries and backoff |
| `aiolimiter` 1.3 | MIT | per-host rate limiting |
| `typer` 0.x | MIT | the `./den skulls` subcommands (or keep argparse, as `den.py` does) |
| `libarchive-c` 5 | CC0 (binding); libarchive is BSD | read OFD `.rar` and zip archives (needs the system `libarchive`) |
| `python-fcl` | BSD | collision for the gape sweep (or use `manifold3d`) |
| `manifold3d` 3.x | Apache-2.0 | robust booleans and intersection volume (alternative to fcl) |
| `svgwrite` 1.4 | MIT | SVG output (optional) |

**Optional, add only if used:**
- `pyfqmr` (MIT, decimation);
- `probreg` (MIT, more registration methods);
- `itk`, `itk-fpfh`, `itk-ransac` (Apache-2.0, ALPACA's exact stack);
- `morphosource` (MIT, MorphoSource API client);
- `pyDataverse` (MIT): plain httpx is simpler against OFD's old 4.20 API;
- `idigbio`, `pygbif` (MIT);
- `frictionless` (MIT);
- `rocrate` (Apache-2.0);
- `meshio` (MIT);
- `numpy-stl` (BSD-3-Clause);
- `pyvista` / `vtk` (MIT / BSD; needs an offscreen GL for renders);
- `morphops` (MIT).

**GPL or other, local tool only, never shipped or vendored:**
- `pymeshlab` (GPL-3.0);
- 3D Slicer with SlicerMorph (BSD-style Slicer licence, BSD-2-Clause SlicerMorph; fine, but heavy);
- R `geomorph` and `Morpho` (GPL);
- Deformetrica (INRIA licence; read it first);
- `rarfile` needs `unrar` (freeware, not open source). Prefer libarchive.

### npm (devDependencies)
`three` (MIT), `@gltf-transform/core`, `@gltf-transform/functions`, `@gltf-transform/cli` (MIT), `meshoptimizer` (MIT); `fit-curve` (MIT) if not added yet.

**Data versioning (optional):**
- `git-lfs`: free on GitHub with storage quotas; only the pointer is in git.
- `dvc` (Apache-2.0): can use Google Drive as a remote, which matches the existing Drive folder; it adds a tool to learn.

**Recommendation:** start with Drive plus checksums in the manifest. Revisit only if meshes must be versioned.

---

## 9. Time per skull (estimates)

| Stage | By hand (the two wolves) | Automated |
|---|---|---|
| Find, check the licence, record provenance | 20–40 min | ~0 (batch), plus 1 min of review for an amber licence |
| Download, unpack, checksum | 5–15 min | 1–3 min unattended (100 MB) |
| Units, clean, orient | 20–40 min | ~1 min |
| Landmarks (24 points) | 30–60 min | 1–4 min unattended (3 templates; ALPACA reports 69–240 s per specimen per template in Slicer [1]; the plain-Python version on 4 k points is similar or faster) |
| Measurements and jaw | 15–30 min | < 1 min |
| Outlines, SVG, decimate, NOTE | 20–40 min | < 1 min |
| **Total** | **~1.5–3 h of agent time, with transcription risk** | **~5–10 min wall, of which ~3–5 min is human review** |

- **One-off costs:**
  - building the template and landmark definitions from the two hand-done wolves: about half a day to a day;
  - each extra template (fox, hyena): about 1 hour, plus GrumpyDingo's review;
  - writing the code: phases 1–4 (section 11).
- **Batch total:** for ~60 specimens, that is about 1 working day of unattended runs plus about 4–5 hours of contact-sheet review, spread out.

---

## 10. Risks and how to handle them

- **Tokens and keys:** read only from environment variables: `SKETCHFAB_API_TOKEN`, `MORPHOSOURCE_API_KEY`, `SI_API_KEY`.
  - **Never** write them in the repo, the manifest, logs or NOTE files. The fetch step must redact the `Authorization` header in any saved request.
  - **Local:** a git-ignored `.env` (`python-dotenv`, BSD-3-Clause), or the OS keyring (`keyring`, MIT).
  - **Cloud sessions:** the environment's secrets settings.
  - **Where to get them:**
    - The Sketchfab personal API token is on the account settings page ("Password & API" when checked; confirm in the browser).
    - The MorphoSource key is under Dashboard → Profile → View API Key [6].
    - The api.data.gov key comes from a signup form [8].
  - **Rotate:** if a token ever leaks into a transcript, rotate it.
- **Sketchfab terms:**
  - Downloads must be authenticated [3][5].
  - Sketchfab asks that apps credit the creator and Sketchfab [4].
  - The terms forbid scraping content "for the purposes of publishing, selling, distributing or otherwise making the content available to others" and any use that places "a disproportionate load" on the service [5].
  - Its own guidelines say apps downloading without end-user authentication should contact Sketchfab [4].
  - **Our use:** a single user's token, a few dozen models, derived measurements and outlines, with the CC BY credit. That is ordinary use, but:
    - keep it slow, at about 1 download per 10–20 s;
    - store only derived data plus small decimated meshes;
    - never re-host the original.
  - No public rate-limit numbers were found (no rate-limit headers on the search API). Back off on 429.
- **Licence ambiguity:**
  - OFD's licence lives in free-text `termsOfUse`, not in the licence field (verified). A future site change could break the parser, so test against saved responses.
  - Sketchfab CC BY models uploaded by third parties may be museum specimens the uploader does not own the rights to. Send them to `needs-human` when the uploader is not the institution.
  - MorphoSource mixes `license` and `copyright_statement`; many skulls there are InC-NC.
- **Scale errors:** Sketchfab and photogrammetry meshes may be arbitrarily scaled.
  - The CBL check against literature catches about ×10 errors, but not 5 % errors.
  - Prefer OFD and CT sources for numbers; use Sketchfab meshes for shape (outlines normalised by CBL) unless the scale is documented.
- **Registration failure modes:**
  - large shape gaps (fennec against a wolf template; hyenas);
  - broken or missing teeth;
  - mandible fused into the skull mesh.
  
  Mitigations: multiple templates, a spread flag, and a per-clade template once reviewed.
- **Rate limits:** HANDOFF section 10 records HTTP 429 from Wikimedia and bioRxiv, and bioRxiv returned 429 again during this research. The DEMO_KEY for the Smithsonian allows 50 requests per day.
  - Use one connection per host, `Retry-After`, a cache for every API response (`requests-cache` or plain files), and no rapid reruns.
- **Disk and network:** about 60 specimens × ~150 MB is about 9 GB raw. Cloud sessions may be short of disk.
  - Process and delete per specimen, keeping only the cache key and the Drive copy.
- **Bony gape misread as behaviour:** label it `bony_limit` everywhere.
- **Test drift:** the golden files are the hand-done wolves. If those hand values have errors, the tests encode them.
  - Have GrumpyDingo spot-check the two wolf contact sheets before freezing them as golden.

---

## 11. Phased plan (each phase ends with GrumpyDingo's OK)

**Phase 1: discovery and licence manifest (no downloads).**
- `./den skulls discover` and `licence` for OFD (Dataverse), Sketchfab (search without a token), MorphoSource (search) and the Smithsonian (with a key).
- **Output:** `candidates.csv`, a draft manifest per shortlisted specimen, and the needs-human licence list.
- **Tests:** licence parsing on saved API responses.
- **Effort:** about 1 session.

**Phase 2: download and normalise.**
- `fetch` (pooch, checksums, archives, rate limits) and `normalise` (units, clean, split, PCA seed), plus the mesh sanity, units and symmetry QA.
- **Output:** cleaned working meshes in the cache, and manifest updates.
- **Test:** rerun on the two wolves and compare their bounding boxes and frames with the hand work.
- **Effort:** about 1 session.

**Phase 3: landmarks by template registration.**
1. Build the template folder from the hand-done wolves; GrumpyDingo checks the landmark pictures.
2. Build `register` (similarity plus CPD, multi-template median, spread), the skull frame, `measure` and `jaw`.
3. Run the golden tests against the hand values.
4. Cross-check once with SlicerMorph ALPACA headless, optional.

**Effort:** about 1–2 sessions.

**Phase 4: 2D outputs and the QA sheet.**
- `outline` (side and top SVG plus JSON, facing right, y down, mm and CBL-normalised), `export` (decimated GLB or PLY plus `NOTE.md` with the changes made), `qa` and the contact sheets, and the `queue` command.
- Then run the full batch species by species, with review in between.
- **Optional:** a three.js skull bench for viewing.
- **Effort:** about 1–2 sessions, plus the review time.

---

## Sources
1. Zhang, Porto, Rolfe, Kocatulum & Maga 2022, "Automated landmarking via multiple templates", PLOS ONE (CC BY). Mouse skulls, 51 landmarks: manual intraobserver error 0.163 mm, ALPACA 0.294 mm, MALPACA 0.2 mm; 69 s per specimen (mouse) and 240 s (ape) per template. https://pmc.ncbi.nlm.nih.gov/articles/PMC9714854/ . ALPACA itself: Porto, Rolfe & Maga 2021, Methods Ecol Evol, doi:10.1111/2041-210X.13689; preprint https://www.biorxiv.org/content/10.1101/2020.09.18.303891 .
2. Dataverse Search API guide: https://guides.dataverse.org/en/latest/api/search.html . OFD Dataverse (version 4.20, probed live): https://dataverse.openforestdata.pl/api/info/version , and the example dataset https://doi.org/10.48370/OFD/LVT9AC .
3. Sketchfab Download API: https://sketchfab.com/developers/download-api (glTF, GLB and USDZ only; authentication required). Data API v3: https://sketchfab.com/developers/data-api/v3 . Licence list (probed live): https://api.sketchfab.com/v3/licenses .
4. Sketchfab Download API integration guidelines (credit the author and Sketchfab; contact Sketchfab for downloads without user authentication): https://sketchfab.com/developers/download-api/guidelines .
5. Sketchfab Terms of Use (section 4.2.4 download API; section 5 scraping and load; section 15 NoAI): https://sketchfab.com/terms ; NoAI tag news: https://www.cgchannel.com/2023/02/sketchfab-introduces-noai-and-createdwithai-tags/ .
6. pyMorphoSource (MIT; an API key, a use statement and use categories are needed for downloads): https://pypi.org/project/morphosource/ , https://github.com/Imageomics/pyMorphoSource . API: https://morphosource.stoplight.io/ .
7. MorphoSource rights, licences and usage settings: https://duke.atlassian.net/wiki/spaces/MD/pages/35422314 .
8. api.data.gov rate limits (a key gives 1,000 requests per hour; DEMO_KEY gives 30 per hour and 50 per day): https://api.data.gov/docs/developer-manual/ . Smithsonian Open Access: https://www.si.edu/openaccess .
9. SlicerMorph (BSD-2-Clause; ALPACA and MALPACA modules): https://github.com/SlicerMorph/SlicerMorph . ALPACA's current Python requirements (itk, itk-fpfh, itk-ransac, cpdalp) were read from `ALPACA/ALPACA.py` in that repository.
10. Running ALPACA from Python and headless Slicer: https://discourse.slicer.org/t/running-alpaca-from-python-console/35538 , https://discourse.slicer.org/t/using-slicer-and-slicer-modules-from-command-line/8162 .
11. auto3dgm: Boyer et al. 2015, Anat Rec; preprint https://www.biorxiv.org/content/10.1101/086280 .
12. MeshMonk: White et al. 2019, Sci Rep, an average error of 1.26 mm over 19 facial landmarks against manual placement: https://pmc.ncbi.nlm.nih.gov/articles/PMC6465282 . Apache-2.0 licence file: https://github.com/TheWebMonks/meshmonk .
13. Package licences and versions were read from the PyPI JSON API (`https://pypi.org/pypi/<name>/json`) and the npm registry (`https://registry.npmjs.org/<name>/latest`) on Oct 7, 2026. The pycpd and probreg MIT licence files are in their GitHub repositories (siavashk/pycpd, neka-nat/probreg).
14. von den Driesch, A. 1976, *A Guide to the Measurement of Animal Bones from Archaeological Sites*, Peabody Museum Bulletin 1: the measurement definitions (dog skull section).
