# SUMMARY: 18 spinous-process lean per vertebra (Scout, 2026-10-08)

**Status: done.** Lean angles T1–T13 and L1–L7 measured on Ellenberger Tafel 3 (PD, grade B; T1–T3 grade C, bases behind the scapula), cross-checked against Sisson 1914 (PD, matches exactly), and the same angles measured on the Stark mesh as it stands, giving a per-vertebra correction. Numbers: `data.csv`. Method, tiers, licences: `NOTE.md`.

## The lean table (plate; sign: + = leans caudally)
Two angles per vertebra: vs vertical in the plate's standing pose, and **relative to the column line (use this one for the mesh correction — pose-independent)**.
- T1 +33/+37, T2 +31/+35 (C), T3 +17/+21 (C), T4 +20/+25, T5–T7 +18/+23, T8 +13/+19, T9 +13/+18, T10 +8/+13 (B)
- **T11 −2/+3: the anticlinal vertebra, essentially vertical** (B; Sisson: "The eleventh is practically vertical")
- T12 −13/−8, T13 −21/−15 (B)
- L1–L6 −22…−25 vs vertical, −16…−19 relative (B); **L7 ≈ 0** (EST; Sisson confirms L7 is the exception)

Tip horizontal offsets (base midpoint → tip, in units of base-to-base vertebral spacing, + caudal): +0.79 (T1, EST) easing to +0.44 (T5–T7), +0.14 (T10), −0.04 (T11), then −0.15 to −0.34 through T12–L6, 0 at L7.

## Mesh correction (correction = plate_rel − mesh_rel, degrees to rotate each tip, + = caudally)
- T1 +6, T2 +9, T3 −6, T4 −1, T5 −5, T6 −6, T7 −12, T8 −16, T9 −9 (mesh A, correction B/C)
- T10 +3, T11 −19, T12 −31 (C: decimation ambiguity), T13 unmeasurable on the mesh — EST ≈ −30
- L1 −27, L2 −19, L3 −9, L4 −6, L5 −8, L6 +1, L7 +24 (but the plate L7 is EST 0)

**Headline: the Stark mesh has NO anticlinal transition.** Its cranial spines are roughly right, but T11–T12 still lean ~+22° caudally and L1–L2 stand near vertical; the forward swing only appears by L3–L6. The fix concentrates at the thoracolumbar junction: **rotate the T11–L2 tips cranially by ~20–30°.** Separately, the mesh's withers processes are short in free length (45–57 mm at T1–T6 falling to ~11–22 mm caudally) against the plate's relatively much longer ones — lengths per vertebra are in `data.csv` (this is the same shortness 17 scaled for).

## T1 tip vs scapula top
- **Plate:** T1 tip (1122, 842) sits only ~28 px cranial of the scapula top (1150, 857) = **1.5% of WH ≈ 1 cm**, poking ~15 px above it. NOT ~10 cm: on the standing plate the withers peak is right over the scapular cartilage, T1 immediately cranial.
- **Mesh (default pose):** T1 tip 43.6 mm cranial of the scapula top, but the scapula top rides 74 mm HIGHER than T1's tip and sits over T3 — the default pose carries the scapula unnaturally high and caudal (a known fake pose). Treat the mesh's scapula offset as pose, not anatomy.

## ⚠ Numbering correction vs scout/17 (needs reconciling)
This measurement found **13 distinct thoracic tips cranial of the plate's printed "1.L." anchor** (x ≈ 1122…1757), so the first visible nub at x≈1122 is **T1, not T2** — only T1's tip clears the scapula, and the "12.R." leader lands on T12's spine; the old "first visible = T2" anchoring (scout/17, and inherited by 15's thoracic station names) would give 14 thoracics. The anticlinal then falls at T11, matching Sisson. **Consequence for Firefly: scout/17's thoracic row labels (and its T1→T5 scale table) are likely shifted one vertebra caudal** — the heights and factors stand, but the factor listed for "T1" belongs to T1 (first visible tip), "T2"→T2, etc. under the new count; in practice the applied raise targeted the right tips, only the names drift. 15's lumbar labels were anchored on 1.L./7.L. directly and were already fixed. Flagged for Atlas/Firefly in `NOTE.md`; 17's own files not edited (other folder).

## Gaps
- No wolf-specific spinous-process inclination data exists open (Europe PMC, 142 hits scanned); wolf assumed to follow the general canid pattern (13T/7L, anticlinal ~T11), EST.
- Mesh T13 and the exact T10–T12 tips are limited by decimation (C/EST).
- The only published per-vertebra lumbar spinous angle study (Tremolada 2025, doi:10.1016/j.ocarto.2024.100557) is CC BY-NC-ND with its table published as an image — cited as fact only, no values stored.
- Thorax and abdomen are each ONE merged Stark mesh (not separate per-vertebra bodies); processes were segmented from a midline slab, uncertainty column in `data.csv`.
