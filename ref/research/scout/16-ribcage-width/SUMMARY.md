# 16-ribcage-width: the verdict (Scout, 2026-10-08)

Numbers with sources: `data.csv`. Searches, tiers and licences: `NOTE.md`. Grades per Reference Guide §0.

## Verdict in one line
**The wolf's bony rib cage at its widest (ribs ~9-11, T8-T11) should be ≈ 0.26 WH full width (band 0.24-0.28, EST from B data; half-width 0.13 WH).** Firefly's 0.45 WH is ~1.7-1.9x too wide. **The Stark source mesh is innocent; the per-bone scaling and an apples-to-oranges comparison made the 2x.**

## The three numbers that were being compared were three different things
| Number | What it actually is |
|---|---|
| Taigan caliper "chest width" 0.19 WH | **skin** width of the **cranial** chest, "just behind the caput humeri" (methods of 10.1002/vms3.70409) — the narrow front station between the shoulder joints, **not** the widest ribs. Scout/14's "at widest ribs" note was wrong; corrected there (and its licence corrected to CC BY-NC-ND, rows relabelled as facts). |
| CT/radiograph TD/TW 0.75-1.25 | **internal** (pleural-cavity) depth **÷** width: TD from xiphoid to ventral vertebral column on the lateral view, TW between the **medial borders of the 8th ribs**. Most dogs are 0.7-1.0, i.e. internally **wider than deep**; only 6/115 dogs in Soeratanapant 2024 were "deep" (>1.25). |
| Firefly's mesh 0.45 WH | **bony external** width at the widest level (~T8-T11) of the scaled wolf. |

## The measured chain (what a real dog's widest level looks like)
Internal TW at the 8th rib, radiographs (Bodh 2016, CC BY, B): Spitz 11.9 kg → 13.2 cm; mongrel 16.3 kg → 16.6 cm; Labrador 27.3 kg → 19.7 cm. German Shepherd (Haryana 2022, closed, C): TW 18.0 cm, TD 17.3-18.5 cm, TD/TW ≈ 1.0.
Bony external = internal − ~5-10% radiographic magnification + 2 rib thicknesses ≈ internal + ~0.5-1.5 cm. For a GSD (WH ~60 cm) that is ~18-19 cm = **0.29-0.31 WH** — and the unscaled Stark full (Shepherd-sized) mesh measures **0.304 WH** (187.5 mm at WH 617 mm). The mesh matches reality (A, own measurement).

## The Beagle comparison: the mesh is fine
Stark Beagle thorax (mesh ×0.8): bony width **150 mm = 0.421 WH** (WH 356 mm). Real check: interpolating Bodh between the 11.9 kg Spitz and 16.3 kg mongrel puts a 13.8 kg dog's internal TW at ~13.5-14.5 cm → bony ~14.7-15.7 cm. 150 mm sits inside that band. **Beagles really are ~0.42 WH wide at the ribs** — broad-chested (TD/TW ~0.8-1.0) *and* short-legged, so the width-per-withers fraction is enormous. That fraction is a property of the Beagle's leg length, not a thorax shape to carry to other dogs.

## Where the 2x came from
Per-bone scaling preserves the Beagle/Shepherd thorax **shape** and its width:rib-length proportion. Scaling the thorax up to wolf rib length (237 mm, Law, B) while the wolf's WH grows even faster from its long legs leaves the width fraction near the Beagle's 0.42 — Firefly landed at 0.45. The wolf should instead land near **0.26 WH**: its thorax is absolutely about GSD-sized (internal TW ~17-20 cm) under a much taller WH (~75 cm), and wolves are, if anything, narrower-chested than GSDs (keel chest, close-set elbows: Mech 1974, scout/09). Depth closure: external depth 0.47 WH → internal TD ≈ 0.6× ≈ 0.28-0.30 WH (GSD chain); internal TD/TW 1.0-1.3 (normal-to-deep) → internal TW 0.22-0.28 WH → bony external **0.24-0.28 WH**. Everything meets at ~0.26.
**Fix:** scale the thorax non-uniformly — depth/length per bone as now, but set the transverse axis so the widest bony width is 0.26 WH (a single lateral squash of ~0.55-0.6 on the current wolf thorax). Skin adds only ~2-4 mm/side there (scout/14 §5): skin-to-skin ≈ 0.27-0.30 WH.

## Width profile along the thorax (bony, from the Stark mesh; A for the mesh, use as the wolf's shape)
Fraction of max width by station (0 = rib 1, 1 = last rib): 0.03→0.17 · 0.13→0.41 · 0.23→0.56 · 0.33→0.74 · 0.43→0.84 · 0.53→0.89 · 0.63→0.95 · **0.73-0.93→1.00 (plateau, ~ribs 9-11)**; depth tapers over the caudal fifth while width holds. No open per-vertebra width table exists for any dog; this one CT-derived skeleton is the only profile (gap noted).

## Gaps
- No measured wolf thoracic width exists open anywhere (CT, radiograph or osteometry); 0.26 WH is EST from B-grade dog data. A human with zoo/wolfdog CT access could turn it into a B.
- Rib arc length (237 mm) cannot pin width: the ventral hoop is costal cartilage of unknown length.
- Flag for Atlas: the Taigan paper is CC BY-NC-ND (PMC), not CC BY as scout/14 first recorded; the nine affected rows in 14's data.csv are now relabelled as cited facts with the corrected licence (details in NOTE.md).
