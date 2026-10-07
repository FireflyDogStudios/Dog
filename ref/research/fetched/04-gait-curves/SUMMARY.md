# 04-gait-curves: summary

**Status: partly fetched.**
- **Full curves:** angle-vs-%-stride curves for all six joints at walk and trot, from Catavitello 2015 (6 retrievers, 2D video). Trot curves for all six joints from Humphries 2020 raw 3D markers (10 Labradors).
- **Partial curves:** Fischer 2018 gives 8-point stifle curves (fluoroscopy) and hock curves (markers) for 4 breeds at walk and trot.
- **Event angles (added Oct 7):** Goldner 2018 (8 Beagles, sound trot, 1.4 m/s treadmill; CC BY, data CC0) gives touchdown, lift-off, stance and swing min/max/ROM for all six joints, both sides: 96 rows in `joint_extremes.csv` (`source_id` goldner2018). Already included angles (180 = straight), checked against the segment angles; the hip uses a pelvic axis defined in a paper that is not open (Goldner 2015).
- **Units:** all angles are included angles, 180 = straight.
- **Missing:** no open walk curves from 3D marker data; the hip is non-standard in one source.

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

**Blocked or not stored:**
- JEB 2025 "Working dog locomotion I": CC BY, but the host returned 403 again on Oct 7 (PDF link), Europe PMC has no full text, and no preprint or data deposit exists.
- Goldner 2015 (Vet J), which defines Goldner 2018's angles: not open access.
- Pit Bull 2021 and Beagle young/old 2017: CC BY-NC.
- Agostinho 2011, Hottinger 1996 and Fischer & Lilje's book: not open access.
- PMC pages: CAPTCHA (we used Europe PMC instead).
- Humphries' German shepherd raw trials were too short for full strides.
- Humphries' kinetic files: too large to download.
- See NOTE.md for details and conversions.
