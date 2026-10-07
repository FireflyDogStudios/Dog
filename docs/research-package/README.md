# Open Canid Reference: research package dossier (master index)

Compiled by **Atlas** (Claude) for GrumpyDingo and Firefly, Oct 7, 2026.

**Status:** draft, version 0.1. Nothing in the source data was changed to write this.

## Where the data lives

- **Source branch.** Every path cited in this dossier is relative to the repo root of `FireflyDogStudios/Dog`. The data came from branch **`claude/new-session-l3ubx0`**, which holds the master inventory `docs/claude/DEN-MATERIALS.md` and the roughly 86 MB of research it points to. That branch is merged into `claude/vibrant-ride-ygz0gn`, where this dossier lives, so the paths resolve on both. `python3 tools/atlas/check_links.py` verifies them.
- **Drive.** Drive items are in `My Drive / den-ledger-everything / ref` (owner rustypinesthedog@gmail.com). I listed them; I did not download them.

**Path shorthand used throughout:**

| Shorthand | Full path |
|---|---|
| `fetched/` | `ref/research/fetched/` |
| `missingfound/` | `ref/research/missingfound/` |
| `scout/` | `ref/research/scout/` |
| `keypoints/` | `ref/research/keypoints/` |

## How to read it

- **Labels.** Every claim is tagged **[M]** measured, **[D]** derived from measured data, **[E]** estimate, or **[I]** my inference.
- **Grades.** Confidence uses the project's own scale (`docs/claude/DEN-REFERENCE-GUIDE.md` §0): A measured; B second-hand, or a domestic-dog proxy; C weak; EST estimate.

| # | Document | What's in it |
|---|---|---|
| 1 | **This page** | Executive summary, audiences, elevator pitch, first three actions |
| 2 | [01-inventory.md](01-inventory.md) | Master inventory table (every asset), Missing / Blocked |
| 3 | [02-data-dictionary.md](02-data-dictionary.md) | Units, frames, angle and phase conventions, bone, muscle and keypoint names, species, ratios, physics |
| 4 | [03-pipelines.md](03-pipelines.md) | Cross-link map: six pipelines with inputs, steps, tools, outputs, blockers |
| 5 | [04-research-threads.md](04-research-threads.md) | Twelve research threads |
| 6 | [05-projects.md](05-projects.md) | Five high-impact project proposals |
| 7 | [06-gaps-and-risks.md](06-gaps-and-risks.md) | Missing data, wrong data, licensing, ethics, technical debt |
| 8 | [07-roadmap.md](07-roadmap.md) | 30-day, 90-day and 1-year milestones; do, defer, abandon |
| 9 | [08-appendices.md](08-appendices.md) | Glossary, full file index, open questions, people and organisations |

---

## 1. Executive summary

### What this collection actually is
- **Origin.** It is a **sourced, graded reference for canid body shape and movement**, gathered over Oct 4–7, 2026 to build a side-view dog for The Den Game (`CLAUDE.md`; `docs/claude/DEN-MATERIALS.md`).
- **Contents.** About 86 MB under `ref/research/`, plus a species pipeline in `species/` and `tools/den/`, covering:
  - bone lengths for 18 species (Law 2025) and 150 carnivores (Samuels 2013, CC0) [M];
  - a CT-based dog musculoskeletal model with 24 bone meshes and 158 muscle lines (Stark 2021, MIT) [M/D];
  - two CT wolf skulls (MRI PAS, CC BY) [M];
  - a public-domain anatomy atlas with skin offsets and surface muscles measured on it (Ellenberger) [M, one dog];
  - about 20,000 annotated dog, wolf and fox poses and outlines (StanfordExtra, AP-10K, APT-36K, AwA, BADJA) [M];
  - joint-angle gait curves from 3 open studies, joint ranges from 25 sources, and 59 ethogram behaviours [M/D];
  - coat, ear, tail and head soft-tissue tables, mostly **[E]** beyond a few anchors.
- **What sets it apart [I].** The value is less in any single dataset than in the **provenance and licence audit on every number**, and in the **errors already caught**. Examples: the wolf chest is too deep; the AP-10K joint labels are shifted; two Muybridge plates are mirrored; the Samuels OLI/URI headers are swapped. Each is documented in its folder's `NOTE.md`.

### What it can realistically do today
| Can do now | Evidence |
|---|---|
| Generate a sourced standing wolf skeleton and side-view outlines | `./den skeleton wolf`, `./den outline` → `species/build/wolf.*` |
| Drive a 2D walk, trot, canter and gallop IK rig that passes joint-limit and no-slide tests | `ref/research/procedural/ik2d.js`, 8/8 tests pass (verified by my subagent) |
| Give measured trot and walk joint-angle curves, duty factors and phases for domestic dogs | `fetched/04-gait-curves/` |
| Assemble a 3D Beagle skeleton (24 bodies, mm, default pose) | `scout/10-stark-meshes/bodies.csv` + `scout/10-stark-meshes/meshes/*.glb` |
| Answer "how big, how bent, how fast" for a wolf, with grades | `species/wolf.yaml`: 23 A, 56 B, 13 C, 2 EST |

| Cannot do yet | Why |
|---|---|
| Show a correct wolf silhouette | The chest depth of 0.54 is a mis-applied photo ratio (see [06](06-gaps-and-risks.md#wrong-data)) |
| Say anything measured about dingo or Carolina Dog bones | None exist in open sources (`missingfound/dingo-limb-bones/NOTE.md`) |
| Give a 3D body with muscles and skin | The pipeline is designed but not run (`scout/12-body-tools/SUMMARY.md`) |
| Give wild-canid kinematics | No wolf or dingo gait or goniometry exists; all values are dog proxies (`missingfound/joint-ranges/SUMMARY.md`) |
| Be released publicly as-is | No repo licence; some sources are non-commercial or unlicensed (`fetched/` REPORT; licence table in [06](06-gaps-and-risks.md#licensing-problems)) |

### Who it could help most
Three candidate audiences, scored for impact-to-effort [I]:

| Audience | What they'd get | Impact | Effort to serve | Ratio |
|---|---|---|---|---|
| **A. Comparative-anatomy, biomechanics and veterinary educators and researchers** | One harmonised, licence-clean canid reference with conversions between conventions | High: removes weeks of source-hunting and convention-mismatch errors | **Low to medium**: data is gathered; it needs cleaning, a schema and release | **Best** |
| B. Animators, game devs and roboticists | Skeleton-to-silhouette spec, gait tables, 3D skeleton, IK rig | Medium to high | Medium: needs the chest fix, a 3D body and packaging | Good |
| C. Animal-pose AI developers and wildlife-monitoring groups | Keypoint crosswalk, label-error audit, anatomical priors | Medium | Low for the crosswalk; high for anything trained | Good, narrow |

**Pick: Audience A.** It is the cheapest to serve well, and B and C are downstream consumers of the same harmonised core.

### The single strongest contribution
**"Open Canid Reference" (OCR) v1: a harmonised, provenance-graded, licence-clean dataset and data dictionary of canid skeleton, surface and motion parameters.**
- Every value carries its source, licence, grade and conversion recipe. It is published as CSV + JSON Schema + a data paper on Zenodo, CC BY 4.0 for data and MIT for code.
- Nothing like it is in the collection's own prior-art search (`ref/research/prior-art/REPORT.md`) [I: not a full literature search].

**Fallbacks:**
- **If licensing blocks a full release** (Law 2025 has no licence; NC-derived facts): release the **permissive-only subset** (CC0, CC BY, MIT, PD) plus a *pointer ledger* for the rest. See [05 §P1](05-projects.md#p1).
- **If even that stalls:** publish the **keypoint crosswalk and label-error audit** as a short standalone note and dataset ([05 §P3](05-projects.md#p3)). It needs only MIT and CC BY sources.

---

## Elevator pitch
Anyone who has tried to build, teach, animate or simulate a dog has hit the same wall. The numbers are scattered across a 1911 art atlas, OpenSim models, museum calipers, pose datasets and gait papers. Each uses its own angle zero, its own joint names and its own licence. Some are quietly wrong.

This collection has already found, graded and licence-checked most of those numbers for wolves and domestic dogs. It has caught several errors on the way: a too-deep wolf chest, mislabelled AI keypoints, mirrored Muybridge plates and swapped spreadsheet headers.

The **Open Canid Reference** would turn that work into one harmonised, citable, openly licensed dataset. The same skeleton, surface and gait numbers, in one convention, with a provenance trail, would serve veterinary educators, biomechanists, animators, roboticists and pose-AI developers. It also states plainly what nobody has measured yet, starting with the dingo.

## First three actions
1. **Decide the licence and fix the known errors.** Choose data CC BY 4.0 + code MIT for the release subset. Correct the wolf chest depth from photo and bone evidence. Regenerate the AGPL-tainted `keypoints/stanfordextra_breeds_unitB.csv` from the MIT `fetched/02-outline-landmarks/data.json`. Replace the 15,554 `NaN` tokens there with omissions. Refresh the stale Muybridge summary. ([07 §30-day](07-roadmap.md))
2. **Freeze a schema and build the provenance ledger.** One long-format table: `quantity, species, value, unit, convention, n, grade, source, doi, licence, path, status M/D/E`. Load every number from `species/wolf.yaml` and the `fetched/`, `missingfound/` and `scout/` data files into it. ([02](02-data-dictionary.md), [05 §P1](05-projects.md#p1))
3. **Send two emails.** One to the Koungoulos lab or thesis holder about measured dingo limb bones. One to Heiko Stark / Emanuel Andrada (FSU Jena) to confirm the MIT terms cover redistributed derived meshes, and to ask about the uninitialisable full model. ([08 §People](08-appendices.md#people-and-organisations))

---

**Which audience or project do you want to pursue first?**
