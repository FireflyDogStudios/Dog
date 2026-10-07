# 14-muscle-body: calibration data for the 3D wolf's muscle body (Scout, 2026-10-08)

Details and licences: `NOTE.md`; every number with its source: `data.csv` (138 rows). Grades follow the Reference Guide §0 (A/B/C/EST).

**Status per topic:** 1 muscle masses **good** (greyhound fore+hind per muscle, CC BY; neck/trunk gap) · 2 σ and scaling **answered** (A) · 3 abdominal wall **gap** (no dog data exists open) · 4 body widths **good** (caliper, not CT; B) · 5 skin+fat **good** (B) · 6 epaxials **partial** (sizes B/C, spinous-tip question answered, dissection mass gap).

## 1. Muscle masses (measured, dissection)
Per-muscle table: `data.csv` topic `muscle_mass` — 29 forelimb muscles (Williams 2008 greyhound data, 31.4 kg, n=7, via the CC BY PeerJ 12574 supplement) and 29 hindlimb muscles (Ellis 2018 greyhound, 27 kg), plus 33 CT muscle volumes of a 5.4 kg Dachshund (Brown 2020).

**Totals per region (grade B, greyhound — a hypermuscled breed):**
| Region | Muscle mass | % of body mass (one limb) |
|---|---|---|
| Forelimb incl. extrinsic (latissimus, pectorals, etc.) | 2301 g @ 31.4 kg | **7.3 %** (proximal 6.7, distal 0.6) |
| Hindlimb | 1642 g @ 27 kg | **6.1 %** (proximal 5.3, distal 0.8) |
| All four limbs | | ~26.8 % |
| Whole body, greyhound | | 57 % (Gunn 1978, C) |
| Whole body, ordinary dogs | | ~40–44 % (same chain, C) |
| Neck + trunk + head muscle | | by subtraction ~17–20 % of BM (EST) |

**Major superficial muscles, % of body mass (greyhound, B)** — the bulges the skin shows:
fore: latissimus dorsi 1.04 · pectoralis profundus 1.27 · triceps long head 1.09 · triceps lateral 0.41 · supraspinatus 0.48 · infraspinatus 0.36 · deltoids 0.25;
hind: biceps femoris 0.98 · adductor magnus 0.69 · semimembranosus 0.64 · vasti 0.62 · gluteus medius 0.40 · semitendinosus 0.39 · gracilis 0.37 · gastrocnemii 0.27.
Wild-canid caveat: wolves are not greyhounds — Hudson 2011 (fact) found the accelerating cheetah carries *less* hip extensor and more back muscle; scale the hamstring/gluteal bulge down ~15 % from greyhound and put the difference in the epaxials.
No wolf or coyote per-muscle dissection exists; Kilbourne 2013 (CC BY) gives whole-limb masses (bone included) for wolf n=7 (30.8 kg) and coyote n=2 via regressions.

## 2. σ and the Stark scaling mass (the two model questions)
- **σ verdict: keep 0.3 MPa.** Williams 2008 and Ellis 2018 both use 300 kN/m² for dog muscle (A); Brown 2020 used 22.5 N/cm² with CT volumes (B). Cross-check: Hill volumes (V = F·L_opt/σ, ρ = 1060 kg/m³) over the Stark Beagle muscles give 5.6 % BM per forelimb and 6.3 % per hindlimb — right on the measured 6–7 %.
- **Stark forces are scaled to the Beagle, 13.81 kg — not to a Shepherd.** The paper: parameters from Shahar & Milgram + Williams, "linearly scaled to the body mass of a Beagle". Verified in our files: Fmax identical in both `.osim`s, and the full model's body masses sum to exactly 13.81 kg. ΣFmax (151 real muscles) = 22.7 kN.
- **Consequence for `muscles3d.py` / the belly step:** building a wolf by geometric scaling keeps Beagle Fmax, so Hill volumes come out at Beagle muscularity × length scale — under a 30–35 kg wolf's mass by roughly (M/13.81)^(1/3). Fix: after geometric scaling, multiply every Fmax by one factor k chosen so each region's Hill mass hits its target % of the wolf's mass (k ≈ (M_wolf/13.81)^(2/3) ≈ 1.75 for 32 kg under geometric similarity). The 8 placeholder trunk muscles (Fmax 1 N) stay excluded.
- Muscle density 1.06 g/cm³ (canine, Brown 2020, A; classic 1.0597, Mendez & Keys 1960).

## 3. Abdominal wall — gap
No open measurement of external oblique / internal oblique / transversus / rectus thickness in dogs exists (TAP-block papers measure dye spread only; cats and rabbits have numbers, dogs do not). For the build this matters little: the trunk filler hull plus the measured belly-line offsets (fetched/01) set the silhouette. If a number is ever needed, EST the whole 4-layer wall + fascia at 8–15 mm for a 30 kg dog from the cat/rabbit proxies — **marked EST, do not treat as data**.

## 4. Body widths (fractions of withers height, WH)
Best open set: 77 Kyrgyz Taigans (sighthound, 20.9 kg, WH 64.8 cm; caliper, CC BY, B) + 27 sled dogs (22 kg, husky type, CC BY, B):
| Site | Value | /WH | Grade |
|---|---|---|---|
| Chest depth (withers→sternum) | 30.7 cm | **0.47** | B (matches repo chest-floor 0.47) |
| Chest width (widest ribs) | 12.5 cm | **0.19** | B (sighthound; wolf EST 0.19–0.22) |
| Chest circumference | 69.3 cm | 1.07 (sled dogs 1.17–1.20) | B |
| Waist circumference (behind last rib) | 49.9 cm | 0.77 → width ≈ 0.75–0.85 × chest width (EST from circumference) | B/EST |
| Neck circumference (mid-neck) | 34.2 cm | 0.53 → equivalent diameter **0.17 WH**; neck is deeper than wide, dorsal muscle ≈ 4× ventral (C1–C2 CT, B) | B |
| Head length | 25.3 cm | 0.39 | B (matches repo) |
| Thoracic depth/width (internal, CT) | broad <0.75, normal 0.75–1.25, deep >1.25 | wolf: use 1.0–1.25 | B |
| Thigh at mid-femur (CT, 8 kg dogs) | muscle CSA 3342 mm², total 4517 mm² (muscle 78 %) → equiv. width 76 mm; +206 mm²/kg | scale with care, small-dog sample | B/C |
No open CT width table for medium-large breeds was found: the caliper sets above are the calibration.

## 5. Skin + subcutaneous fat (add coat separately)
- Skin total thickness **0.5–5 mm**; by breed 0.97 (Beagle) – 3.10 mm (Doberman); thickest forehead/dorsal neck/dorsal thorax/rump/tail base, thinnest pinnae/axilla/inguinal/ventral abdomen; thicker dorsal than ventral, proximal than distal (B, facts).
- Subcutaneous fat by breed 0.4–7.5 mm (B, fact). Lean athletic 22-kg dogs by ultrasound (CC BY, B): chest 2.2–3.5 · flank 2.7–4.5 · lumbar 4.1–8.2 · medial thigh 2.1–2.6 mm; skinfolds (double) 4–13 mm.
- **Lean wolf shell (skin+fat, EST from the above): dorsal trunk 4–7 mm, flank 4–6, ventral abdomen 2–4, limbs distal 2–3, over bony landmarks pinned by the fetched/01 offsets.**

## 6. Epaxial (back) muscles — for the hunchback fix
- **Spinous-tip question: CONFIRMED — the epaxials do NOT rise above the spinous process tips.** Dorsal midline carries only skin, subcutaneous fat and thoracolumbar fascia (ESP dissections, CC BY), and BCS palpation standards expect the lumbar spinous processes palpable in normal dogs (CC BY). The epaxial dorsal surface starts just below the tips and slopes laterally; only fur may stand above the tips.
- **Lateral extent:** longissimus+iliocostalis merge into one thick mass filling from the spinous processes out to the **transverse-process tips** (lumbar) / rib angles (thoracic), dorsal to the transverse processes (B).
- **Size anchors:** healthy epaxial CSA at mid-L3 ≈ **66.7 × L4-length mm² per side** (median, 66 small dogs ~7 kg, CT; B fact — a small-dog anchor, not scale-free). Cervical: dorsal muscle CSA ≈ 143–258 × C2-height mm²/mm, dorsal:ventral ≈ 3.5–4.2 (small dogs, B facts). Control lumbar epaxial attenuation 52–54 HU (B).
- **Mass gap:** no open canid epaxial dissection mass; Stark's epaxials are placeholders (excluded). Size them from CSA sweeps: lumbar cross-section ≈ a half-ellipse per side, height ≈ spinous-process height above transverse process, width ≈ TP half-span.

## Suggested values for a lean 30–35 kg wolf (M = mass used below: 32 kg, WH ≈ 0.75 m)
| Quantity | Value | Basis |
|---|---|---|
| Total muscle | ~44 % BM ≈ 14 kg | measured-chain C (ordinary dog, not greyhound) |
| Each forelimb muscle (incl. extrinsic) | 6.5 % ≈ 2.1 kg | measured B (between generic and greyhound) |
| Each hindlimb muscle | 6.0 % ≈ 1.9 kg | measured B |
| Neck+trunk+head muscle | ~19 % ≈ 6.1 kg, of which epaxials ~4–5 % BM | EST (subtraction; epaxial share EST) |
| σ, density | 0.3 MPa, 1060 kg/m³ | measured A |
| Fmax rescale for the wolf model | ×(32/13.81)^(2/3) ≈ 1.75 after geometric scaling, then trim per region | derived from measured A |
| Chest width / depth | 0.20 WH / 0.47 WH | measured B / B |
| Abdomen width at last rib; mid-lumbar | 0.16–0.17 WH; 0.14–0.16 WH | EST from waist girth |
| Neck diameter at C3–C5 | 0.16–0.18 WH, depth > width, bulk dorsal | measured B + EST |
| Thigh width (soft tissue) | ~0.17–0.19 WH | EST from CT CSA scaling |
| Skin+fat shell | 2–7 mm by region (see §5) | measured B / EST |
| Epaxial height | up to, never above, spinous-process tips | measured B |

## Gaps / needs a human
1. Dog abdominal-wall layer thicknesses: none open anywhere.
2. Canid epaxial masses: none open. Lead for a human: E. L. Webster's RVC greyhound spine work (worktribe 1405533, licence unknown); Williams/Hudson full tables sit behind PMC/Wiley bot-walls (a human with a browser can read them free).
3. Gunn 1978 (57 % / 44 %) is cited second-hand: verify the original before anything ships with it.
4. Kilbourne 2013 per-species limb-mass supplement (PLOS, CC BY) not yet fetched — easy future add.
5. No CT body-width table for medium-large breeds; our widths are caliper-based (fine for the silhouette).
