# 04-gait-curves: summary

**Status: partly fetched.**
- **Full curves:** angle-vs-%-stride curves for all six joints at walk and trot, from Catavitello 2015 (6 retrievers, 2D video). Trot curves for all six joints from Humphries 2020 raw 3D markers (10 Labradors).
- **Partial curves:** Fischer 2018 gives 8-point stifle curves (fluoroscopy) and hock curves (markers) for 4 breeds at walk and trot.
- **Event angles (added Oct 7):** Goldner 2018 (8 Beagles, sound trot, 1.4 m/s treadmill; CC BY, data CC0) gives touchdown, lift-off, stance and swing min/max/ROM for all six joints, both sides: 96 rows in `joint_extremes.csv` (`source_id` goldner2018). Already included angles (180 = straight), checked against the segment angles; the hip uses a pelvic axis defined in a paper that is not open (Goldner 2015).
- **JEB 2025 supplement (added Oct 7, `jeb2025`):** Charles et al., "The biomechanics of working dog locomotion I: Steady-state trotting" (J Exp Biol 228: jeb250523, CC BY 4.0). Only the supplement was obtained (GrumpyDingo downloaded it by hand; the main article is still blocked). It has **no curves and no walk data**: 27 dogs (10 Labradors, 7 Shepherds, 10 Spaniels), 3D markers into breed-specific OpenSim models, trot only. We stored 10 speed-scaling exponents in `duty_phase.csv` and 18 trot joint-extreme rows in `joint_extremes.csv` (model-coordinate magnitudes back-transformed from a log-log regression at Froude 1; **not included angles**, convention undetermined; only the derived ROM is comparable). Nothing added to `curves.csv`.
- **Units:** all angles are included angles, 180 = straight (except the `jeb2025` coordinate rows, flagged).
- **Missing:** still no open walk curves from 3D marker data (the JEB supplement did not change this: walk curves come only from Catavitello's 2D video, plus Fischer's 8-point stifle and hock walk points); the hip is non-standard in one source.

| Trot (included °, min–max of mean curve) | Humphries 2020, Labrador, 3D | Catavitello 2015, retrievers, 2D |
|---|---|---|
| Shoulder | 100–134 | 120–156 |
| Elbow | 76–134 | 105–155 |
| Carpus (>180 hyperext.) | 88–217 | 97–237 (toe-tip segment, inflated) |
| Hip | 133–159 (S1–GT–LFC) | 57–96 (trunk–thigh, not anatomical) |
| Stifle | 104–163 | 100–149 |
| Tarsus | 99–161 | 107–160 |

| Goldner 2018 Beagle sound trot, left limb (included °) | Touchdown | Lift-off | Stance min–max | Swing min–max |
|---|---|---|---|---|
| Shoulder | 106 | 93 | 93–106 | 91–110 |
| Elbow | 103 | 113 | 97–125 | 60–111 |
| Carpus | 195 | 120 | 120–208 | 79–194 |
| Hip (own axis) | 98 | 117 | 98–117 | 95–117 |
| Stifle | 139 | 123 | 121–139 | 93–145 |
| Tarsus | 135 | 156 | 116–156 | 109–156 |

| Gait numbers | Walk | Trot |
|---|---|---|
| Duty factor fore / hind | 0.59 / 0.58 (Catavitello) | 0.46 / 0.42 (Humphries raw); 0.455 / 0.425 (Catavitello) |
| Hind duty factor, 4 breeds (Fischer 2018) | 0.56–0.64 | 0.39–0.47 |
| Touchdown phase LF / RH / RF (LH = 0) | 0.135 / 0.49 / 0.63 (Catavitello) | 0.44–0.45 / 0.49–0.51 / 0.94–0.96 |
| Stride frequency | 1.46 Hz | 2.0 Hz |

| Trot speed scaling (Charles 2025, 27 dogs; log-log slopes vs velocity) | Exponent (95% CI) |
|---|---|
| Cycle time | −0.39 (−0.44 to −0.33) |
| Stride length fore / hind | 0.59 / 0.59 |
| Duty factor fore / hind | −0.28 (−0.41 to −0.15) / −0.24 (−0.36 to −0.12) |

So within the trot, going faster mostly lengthens the stride (v^0.59) and shortens the cycle a little less (v^−0.39); duty factor drops slowly. Joint extremes hardly change with speed (only maximum stifle extension has a significant slope).

| Trot ROM, degrees | Charles 2025 (OpenSim, EST) | Humphries 2020 LRD | Goldner 2018 Beagle L |
|---|---|---|---|
| Shoulder | 60 | 40 | 19 |
| Elbow | 65 | 69 | 65 |
| Carpus | 123 | 138 | 129 |
| Hip | 61 | 34 | 22 |
| Stifle | 63 | 64 | 52 |
| Tarsus | 73 | 69 | 47 |

**Blocked or not stored:**
- JEB 2025 "Working dog locomotion I": the **main article** is still blocked (host 403 on Oct 6 and 7, no Europe PMC full text, no preprint or data deposit); its supplement is in hand and used. Its mean joint curves (if any) and spatiotemporal means are in the main text only.
- Goldner 2015 (Vet J), which defines Goldner 2018's angles: not open access.
- Pit Bull 2021 and Beagle young/old 2017: CC BY-NC.
- Agostinho 2011, Hottinger 1996 and Fischer & Lilje's book: not open access.
- PMC pages: CAPTCHA (we used Europe PMC instead).
- Humphries' German shepherd raw trials were too short for full strides.
- Humphries' kinetic files: too large to download.
- See NOTE.md for details and conversions.
