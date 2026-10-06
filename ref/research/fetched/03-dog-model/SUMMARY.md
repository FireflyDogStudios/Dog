# 03-dog-model: summary

**Status: partly fetched.**
- **Stark et al. 2021 dog model:** the `.osim` files are behind a SimTK login (the packages are MIT, but there is no public mirror), so they are **not fetched**. The article numbers (CC BY) are recorded instead.
- **Greyhound hindlimb model** (Ellis, Rankin & Hutchinson 2018; figshare; CC BY 4.0): **fetched**. All bodies, joints, axes, ranges and default-pose joint centres are extracted, and the raw `.osim` is kept.

| Quantity | Value | Source |
|---|---|---|
| Greyhound femur, hip→stifle centre | 0.186 m | Ellis 2018 .osim (Knee location_in_parent), scaled subject |
| Greyhound tibia, stifle→hock centre | 0.199 m (tibia/femur 1.07) | same (Ankle location_in_parent) |
| Greyhound metatarsus, hock→MTP; toes | ~0.106 m; ~0.052 m (EST) | bone-mesh bounds, Foot frame |
| Hip ROM (model clamps) flex/ext; abd/add; rot | −120…+35°; −15…+45°; −30…+40° | .osim Hip_Ry / Hip_Rx / Hip_Rz |
| Stifle ROM (Knee_Ry) | 0…135° flexion → included 180…45° | .osim |
| Hock ROM (Ankle_Ry) | −135…−15° → included 45…165° | .osim |
| Default pose | hip −30°, stifle included 130°, hock included 136° | .osim defaults |
| Segment masses | thigh 2.25, shank 0.39, foot 0.15 kg (hindlimb 8.4% BM) | .osim; Ellis 2018 |
| Dog model (Beagle) | 13.8 kg; 84 DOF; 134 muscles; forelimb DOF: scapula 5 (incl. 2 translations), shoulder 3, elbow 2, carpus 2, paw 3 | Stark 2021, text and Table 1 |
| Dog model scaling | Beagle bones ×1.66 (limbs), ×1.25 (spine/neck/head) to fit a German Shepherd muscle model | Stark 2021, Methods |

**Blocked:** SimTK downloads for `dogmodel` need a SimTK login (tried 3×). `web.archive.org` is blocked by egress policy. **Human step:** download `Full linear.zip` (MIT) and `scale_beagle.zip` from https://simtk.org/frs/?group_id=2032 while logged in, then re-run the extraction. The SimTK `greyhoundleg` project has no downloads; figshare has the model.
