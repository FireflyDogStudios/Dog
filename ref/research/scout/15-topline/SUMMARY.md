# SUMMARY: 15 topline (2026-10-07)

**Status: done.** A full dorsal clamp profile (skin minus spine-tip envelope, 15 stations C2 to tail root) plus a ventral underline (9 stations) was measured on the PD Ellenberger Tafel 3 skeleton plate in the established 01-skin-offsets frame, cross-checked against literature skin + fat numbers; the same topline was traced on the top CC BY wolf photo (fur outline) for shape. Literature gave the lumbar spine-tip height pattern, the anticlinal fact, the nuchal-ligament course, and dorsal soft-tissue thickness; no open per-vertebra mm table for dog thoracic spines exists (gap). Numbers: `data.csv`; the clamp table: `topline_profile.csv`; method: `NOTE.md`.

## The clamp table (dorsal; fraction of withers height; grade B, one lean drawn dog)
s = 0 at the withers skin peak, 1 at the tail root (neck negative). offset = skin above the bone envelope (spine tips / iliac crest / scapula, whichever is dorsal-most).

| station | s | offset x WH | note |
|---|---|---|---|
| C2 crest | -0.22 | 0.022 | above the C2 spine top |
| mid-neck | -0.10 | ~0.000 vs the C2-T1 chord | 0.08-0.09 above the C4-C5 arches |
| neck-base dip | -0.04 | 0.047 | the hollow in front of the withers |
| withers peak | 0.00 | 0.026 | above T1-T2 tips |
| T2 / T4 / T6 | 0.04-0.19 | 0.020 / 0.018 / 0.014 | falling |
| T8 | 0.26 | 0.007 | the minimum: skin almost on the tips |
| T11 / T13 / L3 / L5 | 0.40-0.69 | 0.007-0.010 | flat ~0.008 |
| croup (iliac crest) | 0.77 | 0.012 | |
| sacrum / tail root | 0.87-1.00 | 0.015 | |

Sanity: measured skin (0.5-5 mm, dorsal thickest) + lumbar subcutaneous fat (2.9 +/- 1.2 mm, CC BY ultrasound, n=28) gives 0.012-0.017 x WH over the loin of an ideal 17-kg dog — brackets the plate's 0.008-0.015. Wolf/dingo carry coat on top: add fur offsets from `scout/03-wolf-coat` (winter withers 0.080, mid back 0.067, croup 0.060; summer about half) — these are in `topline_profile.csv` per station.

**Ventral:** brisket 0.552 x WH above ground (sternum bone 0.021 above the skin), underline rising smoothly to 0.689 at the groin: tuck-up rise **0.137 x WH** on a lean dog. On the wolf photo the belly fur makes the underline nearly level (~0.56) with the tuck masked.

**Wolf topline shape (1 photo, fur, C):** withers 1.00, mid-back 0.97, croup 0.92, tail base 0.82 — a wolf's back SLOPES DOWN caudally; the plate dog's show stance is level (croup skin = withers height). Don't copy the plate's level croup for the wolf.

## The nuchal-ligament neck rule
The funicular nuchal ligament runs **from the C2 (axis) spine top to the T1 spine tips** and continues as the supraspinous ligament along every spine tip to the tail (textbook, B). Measured on the plate (raised neck ~60 deg): **the neck topline is the straight chord from the C2 spine top to the T1 spine tip, +/-0.014 x WH** (slightly convex near the head, slightly hollow just before the withers), and the cervical vertebrae hang BELOW that chord: perpendicular crest-to-arch distance grows **C2 0.018, C3 0.046, C4 0.079, C5 0.092, C6 0.105, C7 0.112 x WH** (matches scout/08's 0.116 neck-top bulge). So: never loft the neck from the cervical centra — loft it from the C2-T1 chord and hang the vertebrae ~0.09-0.11 below it at the neck base.

## Scapula vs spine tips at the withers
On the plate (standing): the T1-T2 spine tips are the dorsal-most bone, **0.009 x WH above the scapular cartilage top**; in the Stark model's default pose the scapula sits ~17 mm above the cranial tips (pose-dependent, EST). The honest answer: **they are within ~0.01-0.03 x WH of each other; withers contour = max(spine tips, scapula top + its cartilage) + 0.026 skin.** No stance radiograph measurement exists (thorax films are shot recumbent).

## How Firefly should clamp the hull
At each station x along the trunk (side view):
`hull_top(x) = max(spine_tip_envelope(x), scapula_top(x), ...) + offset(s) * WH` (+ fur for coated species), with `offset(s)` interpolated from `topline_profile.csv`. The spine-tip envelope comes free from the posed Stark meshes (max z of thorax/abdomen/sacrum, as `skeleton3d.py` already does for the withers point). Key cures for the "hunchback":
- the back offset is TINY: 0.007-0.010 x WH from mid-thorax to the loin (epaxial muscle does not rise above the tips in side view; scout/08 trapezius-thoracic 0.018 is the loose upper bound at the withers slope);
- the neck mass must NOT sweep over the withers: the crest follows the C2-T1 chord into the T1 tips, and the dip just in front of the withers (offset 0.047 at s = -0.04) is a hollow, not a bulge;
- the withers peak is bone + 0.026, nothing more;
- ventral: hang the chest floor at 0.552 x WH (bone sternum + 0.021) and rise 0.137 x WH to the groin (lean); flatten the rise to near level for the furred wolf.
- lumbar bone detail if wanted: lumbar tip heights follow Wadowska's arc (peak L4-L5, L7 ~25% shorter), and the tips lean caudally T1-T10, vertical at T11 (anticlinal, 85% of dogs), cranially L1-L7.

## Gaps
- No open per-vertebra spinous-process length/angle table for dog thoracic vertebrae (and none at all for wolf): the Stark meshes are the de-facto source, but their decimated merged trunk did not yield clean per-vertebra numbers (NOTE.md).
- No published neck-crest-above-vertebrae radiograph measurement; the C2-C7 table is one drawn dog (B) and pose-dependent (raised neck).
- The wolf topline slope rests on one photo; the AwA standing set (n=15, factcheck Q9) could firm it to B.
- Everything dorsal is from ONE lean drawn dog + literature soft tissue; a body-condition CT station table would upgrade it (none found open).
