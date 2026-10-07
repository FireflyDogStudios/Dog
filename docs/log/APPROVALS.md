# Approvals (Firefly is the source of truth)

Add requests at the top. Firefly or GrumpyDingo marks each one **Approved**, **Declined** or **Changed** with a date. Do not act on a request until it is marked.

---

## A-006 · Regenerate the rest of the AGPL-derived keypoint numbers · from Atlas · 2026-10-07 · **Waiting**
- **Ask:** regenerate the `se_unitB` block of `ref/research/keypoints/proportions.json` and the StanfordExtra figures quoted in `ref/research/keypoints/REPORT.md` (Table C footnote, Table D last column, the breed list under Table D) from the MIT data, with the same method as `tools/atlas/regen_unitB.py`.
- **Why:** they were computed from the AGPL-labelled Ultralytics mirror, like the CSV fixed under A-002 item 3. A-002 named only the CSV. `tools/den/species_check.py` reads only `awa_unitB`, so no tool output changes.
- **Expect:** small shifts (the CSV moved by a median of 0.01 per breed; all-domestic medians unchanged), more dogs (1,701 vs 1,283 profile dogs), and new dingo and dhole entries.
- **Decision:** **Approved** (Firefly, 2026-10-07): regenerate `se_unitB` and the StanfordExtra figures in `keypoints/REPORT.md` from the MIT data with `tools/atlas/regen_unitB.py`, and keep its `--validate` check.

## A-005 · Licence for a public research subset · from Atlas · 2026-10-07 · **Decided**
- **Ask:** decide whether a research subset may be released publicly, and under what licence.
- **Proposed licences:**
  - data CC BY 4.0;
  - code MIT;
  - the game stays private and unlicensed.
- **Release includes only:** CC0, CC BY, MIT and PD sources.
- **Release keeps out:**
  - Law 2025 (no licence);
  - non-commercial or no-derivatives facts;
  - MANN-derived numbers;
  - the AGPL-tainted CSV.
- **Why:** the repo has no LICENSE file at all. Without one, nobody else can legally reuse the research tables. Details: `docs/research-package/06-gaps-and-risks.md#licensing-problems`.
- **Decision:** **Changed: GrumpyDingo's call, not Firefly's** (Firefly, 2026-10-07). Firefly's recommendation: yes in principle, as a separate public repo the game uses; data CC BY 4.0 and code MIT look right. But Law 2025, which has no licence, is the core of the bone lengths, so decide after the cleanup (A-002) and after asking the Law authors whether the data can carry a licence. Nothing goes public until GrumpyDingo says so.

## A-004 · Scout request: intervertebral disc share · from Atlas (asked for by GrumpyDingo) · 2026-10-07 · **Decided**
- **Ask:** let Scout run `docs/claude/DEN-SCOUT-REQUEST-DISCS-2026-10-07.md`.
- **Also:** the fallback there (measuring on the 51 GB Czeibert CT set) needs its own yes.
- **Decision:** **Approved** (Firefly, 2026-10-07): Scout may run the disc request. The 51 GB CT fallback is **not** approved yet: it needs GrumpyDingo's yes (size, time).

## A-003 · Corrections to `docs/claude/DEN-MATERIALS.md` · from Atlas · 2026-10-07 · **Decided**
Atlas has not edited the file; it is Firefly's. Proposed edits:
1. **§1 "Stark dog model, 3D", and §8:** the meshes are now in `ref/research/scout/10-stark-meshes/` (24 GLB bodies, mm, decimated). Only the raw zips and full-resolution meshes stay in Drive. "70 bone meshes" → "24 bodies (31 of the 70 OBJs used)".
2. **§1 "Museum bone lengths":** "22 canids" → "18 species with bone means (16 canids + 2 hyenas)" (`ref/research/skeleton/species_numbers.json`).
3. **§1 "Dingo bone estimates":** "117 measured dingoes" → "117 dingoes whose shoulder heights were reconstructed from bones" (`ref/research/fetched/07-dingo/NOTE.md`).
4. **§3 "Wolf coat":** add that Mech 1974 (*Mammalian Species* 37, US government work) is now in Drive.
5. **§8:** add "intervertebral disc share (spine lengths are centra only)" and "a muscle-name crosswalk".
- **Decision:** **Approved** (Firefly, 2026-10-07). Firefly applies these, since the file is Firefly's.

## A-002 · Fix the known data errors · from Atlas · 2026-10-07 · **Decided**
These change numbers or generated files, so they need a yes. Each is listed in `docs/research-package/06-gaps-and-risks.md#wrong-data`.
1. **Wolf chest depth.** Re-measure on 5+ wolf photos and plates. Replace `ratios.chest_depth_over_height` in `species/wolf.yaml`. Reconcile `tools/den/outline.py:63` and `skeleton.py`.
2. **Trot hind duty factor** in `species/wolf.yaml`: 0.367 → measured 0.417–0.43 (`fetched/04-gait-curves/duty_phase.csv`).
3. **Regenerate** `keypoints/stanfordextra_breeds_unitB.csv` from the MIT `fetched/02` data (it currently comes from the AGPL mirror).
4. **Regenerate** the stale `summary` block and SUMMARY.md in `fetched/05-muybridge/` from the corrected `plates`.
5. **Mark** `ref/research/gait/` as superseded where `fetched/04` has measured values.
6. **Correct the stale notes:**
   - `fetched/07-dingo/NOTE.md` Harcourt tibia intercept;
   - `DEN-REFERENCE-GUIDE.md` §5 "Tafel 2 not measured";
   - `keypoints/REPORT.md` "AP-10K unreachable".
- **Decision:** **Approved, with one change** (Firefly, 2026-10-07).
  - Item 1, chest depth: approved as re-measure-and-relabel. The 3D skeleton (`./den skeleton3d`) now takes chest depth from the real ribcage, and it matches the wolf photo (0.58 vs 0.56 of height). So the 0.54 ratio should be relabelled as an outer surface measure, fur included, and never applied to bone in the 2D tools. Firefly does the `wolf.yaml` part.
  - Item 2: Firefly applies it.
  - Items 3–6: Atlas may do them.
  - **Done by Atlas (2026-10-07): items 3, 4, 5, 6 and 7.** See the log line of that date.
  - Added item 7: the four Stark trunk muscles with a placeholder force of 1.0 N (iliocostalis, longissimus, quadratus lumborum, sacrocaudalis, both sides). Flag them in `fetched/03-dog-model` and in the reference guide; the 3D muscle step must exclude them or source real values.

## A-001 · Add one pointer line to `CLAUDE.md` · from Atlas · 2026-10-07 · **Decided**
- **Ask:** add under "Read first":

  > Directory map: `docs/README.md`. Running log: `docs/log/LOG.md` (add a line when you finish something). Approvals: `docs/log/APPROVALS.md`.

- **Why:** new sessions read `CLAUDE.md` first. Without this line they won't find the log.
- **Decision:** **Approved** (Firefly, 2026-10-07); Firefly adds the line.
