# Disc share of the canine spine: summary

Scout, 2026-10-07. Request: `docs/claude/DEN-SCOUT-REQUEST-DISCS-2026-10-07.md` (A-004, approved by Firefly; the CT download is not approved and was not done). Data: `data.csv` (86 rows). Method and searches: `NOTE.md`.

## Status
- **Answered, with gaps.** The **cervical** and **lumbar** regions have peer-reviewed numbers for non-chondrodystrophic medium to large dogs (grade B). The **thoracic** region has no published number: it rests on one model mesh (C) and a transfer (EST).
- **No wild canid disc value exists** in anything open: not for the wolf, the coyote or the dingo.
- **The Stark Beagle mesh was measurable** by level. Its gaps read about half the CT/MRI values, so treat them as a lower bound.

## The disc share of each region
Share = disc thickness ÷ (bodies + discs). The multiplier for a centra-only length is 1 ÷ (1 − share).

| Region | Best measured (dog) | Grade | Wolf estimate (dog discs on Law wolf centra) | Stark Beagle mesh (lower bound) | Suggested for the wolf |
|---|---|---|---|---|---|
| Cervical (C2-C3..C7-T1) | **0.18** (Labrador MRI, ratio 0.216, n = 10); Great Dane 0.19 (n = 9); by level 0.17 (C2-C3) to 0.23 (C6-C7), all breeds | B | 0.15 (5.65 mm Doberman/Foxhound disc on a 31.0 mm centrum) | 0.15 (C3-C7); gap/body 0.18 | **0.15-0.18 → ×1.18** |
| Thoracic (T1-T2..T13-L1) | none found | n/a | 0.17 (EST: 5.25 mm, scaled from the lumbar disc by the mesh's thoracic/lumbar gap ratio) | 0.13; gaps 2.4-2.9 mm, T12-T13 3.9 mm | **0.13-0.17 → ×1.18 (EST)** |
| Lumbar (L1-L2..L7-S1) | **0.23** (Labrador/Golden CT, disc 7.1 mm, bodies 23.1/25.3 mm, n = 20) | B | 0.18 (7.1 mm on a 32.9 mm wolf centrum) | 0.12; gaps 3.2-4.1 mm | **0.18-0.23 → ×1.22** |

Sources: Düver et al. 2018, Front Vet Sci, doi 10.3389/fvets.2018.00248 (CC BY 4.0, MRI, disc length at mid-height); De Decker et al. 2012, BMC Vet Res, doi 10.1186/1746-6148-8-126 (CC BY 2.0, MRI, disc width at the widest point: upper values); Gavira et al. 2025, OA Cartilage Open, doi 10.1016/j.ocarto.2024.100557 (**CC BY-NC-ND: four cited facts only**, lumbar CT); Stark mesh (MIT, Scout's measurement on midsagittal sections; C7-T1 and T13-L1 default-pose gaps are artefacts, marked "do not use"); Law 2021/2025 (centrum lengths only, no discs).

- **Radiographic "disc space":** no paper with normal values in numbers was found. Every value above is CT, MRI or mesh.
- **What the gaps include:** CT and mesh gaps run bone to bone, so they include the cartilage endplates: the right quantity to add to dry-bone centrum lengths.
- **Why the mesh reads low:** probably smoothing and decimation of the CT surface, a Beagle (often counted as chondrodystrophic), and one animal. Use the mesh for the 3D route's own gaps, not as the species number.

## Recommendation for `tools/den/skeleton.py`
- **Add discs per region:** keep the measured centra-only lengths; multiply each by its region's factor (`neck *= 1.18; thor *= 1.18; lumb *= 1.22`, or in general `L_region / (1 - disc_share_region)`); put the shares in `species/wolf.yaml` under `spine` (e.g. `disc_share: {neck: 0.15, thorax: 0.15, lumbar: 0.18}`, grades B/EST/B, sources from `data.csv`) so the builder stays data-driven.
- **Keep the sacrum fixed:** it is fused bone with no discs; keep `sacrum_length` (currently 0.06 × presacral) tied to the **centra-only** presacral length.
- **Regional shares hardly change** (the factors are similar); the main effect is the absolute presacral length: 809 mm becomes about **940-980 mm**.
- **3D route (`skeleton3d`, Stark meshes):** the meshes already carry their own gaps (per level in `data.csv`); do not add discs on top. Do not trust the default-pose junctions: C7-T1 overlaps, and T13-L1 opens to 14 mm.

## Do discs explain the wolf being ~8% short?
**Yes, and they more than explain it.** A what-if with the real builder, run read-only on an in-memory copy of `wolf.yaml`; photo target body length ÷ withers 1.29 (C, IQR 0.96-1.43):

| Spine used | Presacral (mm) | Body length ÷ withers |
|---|---|---|
| Centra only (now) | 809 | 1.189 (−8%) |
| Uniform ×1.09 (a disc share of only ~8%) | 882 | 1.285 (matches) |
| Stark mesh shares (lowest) | 933 | 1.351 |
| Dog discs on wolf centra (B/EST/B) | 970 | 1.403 |
| Literature ratios (cervical, lumbar) + mesh thoracic | 980 | 1.414 |

Any measured disc share (≥ 0.10) closes the 8% gap; the likely shares (0.15-0.20) overshoot the photo mean by 5-10% but stay inside the photo spread. So the missing discs are a real error and should be fixed; the remaining mismatch is a separate question. Check next: the C-grade photo ratio (posture, fur at the occiput and tail base), the straight-chord trunk (`L = (thor + lumb) * 0.985`), the 40° neck elevation, and the derived withers height (707 mm against a field value of 750 mm). Do not drop the discs to hit 1.29. (Firefly's 3D build reports the trunk ~12% short: discs are the first suspect there too, unless the Stark meshes' own gaps are kept.)

## Gaps
- **Thoracic discs:** no measurement in any dog of a known breed.
- **Wild canids:** no disc value for any of them.
- **Whole column:** no paper gives total disc length as a fraction of the dog's whole presacral column.
- **Size scaling:** unclear whether disc thickness scales with body size or with centrum length (wolf lumbar centra 33 mm vs Labrador 24 mm); the two assumptions give lumbar 0.18 and 0.23.
- **Region boundaries:** no source measures C7-T1 or T13-L1 directly; assumed equal to the neighbouring level.

## What needs a human
1. **GrumpyDingo: the CT download.** Approving the Czeibert 2024 HRCT set (CC0, 51.4 GB) is the only open route to a measured **wolf** value (3 wolves) and to thoracic discs. Measuring one wolf and two or three medium dogs would turn the thoracic EST and the wolf transfer into A/B grades.
2. **Firefly: adopt the shares?** If yes, add `disc_share` to `species/wolf.yaml` and the two-line change to `skeleton.py` (sacrum stays centra-only), then rebuild and recheck the body-length target.
3. **Firefly: the NC-ND facts.** Confirm the four Gavira numbers (CC BY-NC-ND, stored as cited facts) are acceptable; if not, the lumbar conclusion stands at grade C on the MIT mesh alone.
