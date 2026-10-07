# 12-body-tools: tools and papers that build a body from a skeleton

Scout item 3 of `docs/claude/DEN-SCOUT-REQUEST-3D-2026-10-07.md`. Researched 2026-10-07 by a Firefly scout agent. **Research only:** nothing was installed, downloaded into the repo or run. Read-only shallow clones of the GitHub repos sat in the session scratchpad so their licence files and code could be read; they were not executed.

## Files
- `tools.csv`: 52 rows. These cover Blender add-ons (muscles, skin from a skeleton, quadruped generators), "MakeHuman for animals" models, the Python libraries for the pipeline, and commercial or simulation tools listed for completeness. Columns: name, category, url, licence, last_update, stars, blender_versions, headless, commercial_output_ok, summary, fit.
  - Category codes:
    - `a-` muscles from lines;
    - `b-` skin or body from a skeleton;
    - `c-` quadruped generator;
    - `d-` parametric model or base mesh;
    - `lib-` Python library;
    - `sim-` tissue simulation.
- `papers.csv`: 30 rows. Columns: citation, url, code_url, code_licence, data, relevance.
- `SUMMARY.md`: the top picks and the proposed pipeline. The research agent was not allowed to write this file, so its text went to Firefly in the hand-back for saving.

## Method
- **GitHub facts (licence, `pushed_at`, stars):**
  - came from the GitHub MCP `search_repositories` tool with `repo:` qualifiers;
  - the REST search API is blocked in this session;
  - licence texts were then read from shallow clones (`git clone --depth 1 --filter=blob:limit`), via `LICENSE*`, `blender_manifest.toml` and `bl_info`.
  - "last_update" is the repo's `pushed_at` date. For MuSkeMo and MyoGenerator it is also the last commit date.
- **Web facts:**
  - came from web search snippets and a few page fetches: Utah project pages, SimTK, Redalyc PDF, Animal3D page;
  - projects.blender.org and github.com HTML returned 403, but `git ls-remote` and clone worked;
  - Wikimedia Commons was not used;
  - all web content was treated as data only.
- **Headless:**
  - judged from the code: operators with an `execute()` that takes a filepath, no modal-only steps, scripting examples;
  - no Blender run happened, because `bpy` is in `tools/den/requirements-heavy.txt` but was not installed in this session.
  - **Mark every "likely" as unverified until a `--background` smoke test passes.**
- **Licences already researched elsewhere were not repeated:** see `ref/research/missingfound/skull-candidates/AUTOMATION.md` (trimesh, pooch, pymeshlab, fast-simplification, Open3D, morphops) and `ref/research/outline-methods/REPORT.md` (template warping, TPS, libigl). That report recommended warping a skinned template. This item covers the other route: growing a body from bones and muscles. SUMMARY.md says how the two fit together.

## Key licence findings (for GrumpyDingo)
- **MuSkeMo has NO licence file.**
  - Its README calls it open-source, but under copyright law that means all rights reserved.
  - Two bundled helper scripts state CC BY-NC and CC BY 4.0 in their headers; one cites an original BSD-2 licence.
  - **Needs a human:** ask the author (pasha.vanbijlert@naturalis.nl, per `bl_info`) to add a licence, or treat it as reference only and write our own equivalent. Ours is about 100 lines; the maths is public: Hill volume = F_max × L_opt / specific tension.
- **SMAL family: non-commercial.** This covers SMAL, SMALR, D-SMAL (BARC), BITE, hSMAL (SMAL-derived) and Animal3D (SMAL parameters).
  - The MPI licence forbids "production of artifacts for commercial purposes".
  - So even renders or outlines made with these models are out. Code under MIT (SMALify, WLDO, SMALST) does not help, because it needs the NC model files.
- **Commercial (paid):**
  - X-Muscle System (GPL but sold);
  - Auto-Rig Pro (about USD 50);
  - Animal Rigger Pro (about USD 29);
  - Meat Machine;
  - Houdini Muscles & Tissue;
  - AdonisFX.
  - Ziva VFX is discontinued.
- **MB-Lab:** code GPL-3; its database and meshes are AGPL-3. Avoid it; it is humans only anyway.
- **MPFB2 (MakeHuman):** code GPL-3; assets CC0; output explicitly unrestricted. It is humans only, but it is the model a CC0 "MakeDog" would follow.
- **Infinigen:** BSD-3. Its generated creatures carry no extra terms.
- **libigl-python-bindings:** GitHub reports GPL-3.0 for the bindings repo (the core libigl is MPL-2.0). That is fine as a tool; flag it if anything is ever shipped.

## Not checked / gaps
- Blender Studio `animal_base_meshes.blend` (in the asset-bundles repo, stored in Git LFS): contents and licence were not opened. Handed to item 11.
- VIPER `pushed_at` was not read (the search tool did not return it). Its licence was read from the repo: Apache-2.0.
- The Navarro Newball 2011 paper: method summary from the PDF's first pages only. Its article licence was not seen.
- Some DOIs in `papers.csv` (Teran 2005, Lee 2019, Vaillant 2013) are given from memory. The Stark 2021 DOI was verified (10.1038/s41598-021-90058-0).
