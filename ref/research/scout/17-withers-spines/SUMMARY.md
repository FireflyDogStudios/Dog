# SUMMARY: 17 withers spines and croup vs withers (2026-10-08)

**Status: done.** Per-vertebra bone-tip heights T2-L7 + iliac crest + sacrum measured on the PD Ellenberger Tafel 3 plate (grade B), the Stark mesh envelope measured per vertebra (EST), the wolf croup/withers ratio computed from AwA keypoints (n=67, C), and the thoracic/lumbar spine-length patterns confirmed from Sisson 1914 (PD, B). Numbers: `data.csv`.

## (a) Verdict: why the mesh's back line rises
**Both, but mostly mesh geometry — and partly a misread of what "normal" is.**
1. **A gently rising bone-tip line toward the loin is NORMAL for a level-backed dog.** On the plate (level show stance) the lumbar maximum (L5, 0.989 × WH) stands **0.015 × WH ABOVE the withers tip** (T2, 0.974), and the iliac crest (0.990) is the highest trunk bone of all. The skin topline still falls, because the withers carries 0.026 of offset and the loin only 0.008.
2. **The Stark trunk exaggerates it ~3×.** Mesh tips rise from T1 583 mm to lumbar 637 mm above the paw plane — the cranial thoracic tips are relatively far too short. The default-pose thorax pitch (3°, worth at most 17 mm at T1) cannot explain a 54 mm rise, so it is geometry, not only pose. Whether it is a true Beagle trait is unproven: the only breed data found is vertebral BODY shape (Beagle T4 L/H lowest of five small breeds, CC BY 10.3390/vetsci10020168), and no per-breed spinous-process table exists (gap). The one wolf-vs-dog measurement found (Girgin 1988: C3 spine 10 mm in wolf vs 1-2 mm in dog, C) says the wolf's withers-region spines are, if anything, LONGER than any dog's — so correcting toward the plate is a floor, not an overshoot.
3. **The wolf's visible slope is mostly carriage, not short lumbar spines.** Wolf skin topline: withers 1.00, mid-back 0.97, croup 0.92-0.93 (one photo 0.92, C; AwA standing wolves n=67: back_middle 0.976, back_end 0.928 median — the GSD for contrast is 0.846, the level LGDs 1.00 (Akbash 0.996 n=96, Kangal 1.001 n=30, cited facts)). No field morphometry of wolf croup height exists (gap: Suvorov, Silva Balcanica, Trbojevic all stop at withers height). **Pose the pelvis and hindquarters to make the slope; scale only the T1-T8 spines to fix the withers.**

## (b) Targets (standing, fractions, grades)
- **Dog bone profile above ground, × WH (plate, B):** T2 0.974 > falls to T8-T10 0.952 > rises to L5 0.989; iliac crest 0.990; sacral crest 0.973; Ca1 0.954. Full per-vertebra table in `data.csv`. T1 hidden behind the scapula (EST ~0.976).
- **Wolf bone topline as fraction of the withers-TIP height (derived, C):** T2 1.000, T4 0.988, T6 0.975, T8 0.963, T10-T12 ~0.958-0.959, T13 0.962, L1-L5 ~0.960-0.965 (flat loin), L7 0.945, **iliac crest 0.946, sacral crest 0.925, Ca1 0.892**. For the wolf the withers tips are the bone apex of the whole trunk by ~0.04; skin croup/withers 0.92-0.93 (C).
- **Scapula (B):** standing, the T1-T2 tips sit 0.009 × WH ABOVE the scapular cartilage top; "level" = cartilage 0.00-0.01 × WH below the tip line. The mesh's scapula is NOT riding high — its tips are short. After the T1-T4 scaling below, mesh tips reach ~630-640 mm against the 634 mm scapula top and the relation comes right by itself. Do not drop the scapula down the ribcage.

## (c) The T1-T8 scale table (and its basis)
Basis: tip heights above ground, each normalized to its own lumbar maximum (the CT lumbar tips taken as right), plate target / mesh current. Factors fold in the mesh's ~3° default pitch (up to 0.027 at T1), so **apply in the posed standing skeleton**: pose the trunk, measure each tip height, then scale each spinous process about its base by whatever reaches `target_k × (posed lumbar max / 0.9891 WH-equivalent)` — the factors below are what that gives at the default pose and are the expected magnitude.

| vertebra | factor | approx tip raise at full-model scale |
|---|---|---|
| T1 | 1.08 | +45 mm |
| T2 | 1.06 | +36 mm |
| T3 | 1.04 | +22 mm |
| T4 | 1.02 | +14 mm |
| T5 | 1.01 | +4 mm |
| T6-T8 | 0.99 | leave (within noise) |

T9-T13 and the lumbar spines: leave at mesh values; make the wolf's croup drop with pelvis/hindquarter pose using the wolf column in `data.csv` (iliac crest 0.946 of withers-tip height).

Supporting patterns (PD, B): Sisson 1914 — dog thoracic spines "first three or four about equal, gradually shorter to the tenth, then equal; T11 anticlinal"; lumbar "height diminishes behind the fourth" (peak L4-L5, matching Wadowska and the plate).

## Found in passing
**scout/15 `topline_profile.csv` lumbar station labels are one vertebra off** against the plate's printed 1.L./7.L. labels (its "L5" station is L6, etc.). The offsets and stations themselves are unaffected; only the vertebra names in the `bone_under_skin` column drift caudal of T13. Needs a one-line fix by Atlas/Firefly.

## Gaps
- No open per-vertebra spinous-process length table for any dog breed, and none at all for the wolf (both tiers exhausted). The plate (one lean mastiff-type, B) is the de-facto standard; the wolf correction rides on the photo/AwA skin slope (C).
- No wolf field measurement of croup/sacral height exists in the open literature; the 0.92-0.93 is photographic (fur, stance included). The level-backed LGD field data shows how much of the wolf's slope is carriage rather than skeleton.
- Whether the short withers spines are Beagle-specific or a CT-segmentation artefact cannot be settled without another dog CT (none open found).
