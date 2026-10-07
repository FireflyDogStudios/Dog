# 8. Roadmap: from game research to public good

[← Master index](README.md)

**Governance.** Firefly is the source of truth. Anything marked **(approval)** goes through `docs/log/APPROVALS.md` first.

## First 30 days: make it correct and releasable
| # | Milestone | Done when |
|---|---|---|
| 1 | **Licence decision (approval).** Proposed: release subset under data CC BY 4.0 and code MIT; the game stays unlicensed / private | Firefly and GrumpyDingo sign off in APPROVALS |
| 2 | **Fix the wolf chest depth** ([T1](04-research-threads.md#t1)) | `species/wolf.yaml` updated with n and IQR; skeleton regenerated; outline/skeleton fur handling reconciled |
| 3 | **Clean the known errors** | StanfordExtra NaN removed on load; unitB CSV regenerated from MIT data; Muybridge summary regenerated; `ref/research/gait/` marked superseded; `wolf.yaml` trot DF updated; NOTE errata applied |
| 4 | **Schema and provenance ledger v0** | `ocr/schema.json` + `values.csv` loaded from `species/wolf.yaml` and 5+ source folders; pydantic validation passes |
| 5 | **Credits file** | `CREDITS-RESEARCH.md` generated from every licence CSV and NOTE |
| 6 | **Disc share received from Scout** | `ref/research/scout/13-disc-share/` exists |
| 7 | **Shared log in use** | Firefly, Scout and Atlas each have entries in `docs/log/LOG.md` |

## By 90 days: release v1 and one flagship
| # | Milestone | Done when |
|---|---|---|
| 1 | **OCR v1 on Zenodo (approval)** | DOI minted; the README cites it |
| 2 | **Pose crosswalk and label audit** ([P3](05-projects.md#p3)) | Released; maintainers notified |
| 3 | **Wolf footfall timing** ([P4](05-projects.md#p4)) | Table with n and uncertainty |
| 4 | **3D body pipeline P2 run once** | Skinned Beagle and wolf-scaled body; side-view SVG compared with photos ([T7](04-research-threads.md#t7)) |
| 5 | **Research split from the game (approval)** | `ref/research/` + `species/` + `tools/den/{species,skeleton,outline}*` moved to a separate public repo (e.g. `canid-reference`); the game consumes it as a dependency |
| 6 | **Outreach** | Emails sent to the dataset authors listed in [08](08-appendices.md#people-and-organisations) |

## By 1 year: a public good
- Atlas web viewer live ([P2](05-projects.md#p2)), reviewed by a veterinary anatomist.
- Data paper submitted, e.g. to *Scientific Data* or *Data in Brief* [I: venue to be confirmed].
- Dingo protocol published, and one partner collection piloted ([P5](05-projects.md#p5)).
- Sim-ready canid model with measured reference gaits (pipeline P4) shared with OpenSim and MuJoCo communities.
- Version 2 adds coyote, jackal and dhole wherever open data allows.

## Do first
1. The licence decision.
2. The chest fix.
3. The error cleanup.
4. Schema and ledger.
5. Credits.

These are cheap, unblock everything else, and stop errors spreading.

## Defer
- Long MuJoCo sims (need sign-off).
- The 51 GB Czeibert CT download.
- The full-body 3D search.
- Gallop work.
- Colour calibration ([T12](04-research-threads.md#t12)).

## Abandon
- **`outline_prior.py` as a generator.** Its own header says it failed (`tools/den/outline_prior.py`).
- **AwA "chest depth" as a bone measurement.** It is mid-back to belly, with fur.
- **`ref/research/gait/` snippet values** wherever `fetched/04-gait-curves` has measured ones.
- **Catavitello carpus and hip as absolute angles.**
- **OpenCat tables as a source of canine motion.** They are fine for robot timing only.
- **NC-derived MANN numbers** in anything public.
- **`docs/claude/DEN-SPECIES-WOLF.md`.** It is already marked superseded; archive it.
