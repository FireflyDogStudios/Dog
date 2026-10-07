# Joint ranges of motion: summary

**Status: partly fetched (2026-10-07).**
- **Limbs:** passive goniometry for all six limb joints, from open CC BY tables (French Bulldog, Dachshund, police dogs, mixed healthy and patient dogs), plus loaded and non-gait ranges (agility jump take-off, greyhound sit-to-stand).
- **Spine:** thin data (cadaver, plus in-vivo lumbosacral).
- **Neck, tail and digit goniometry:** not found.
- **Wolf or dingo goniometry:** none exists.
- **Breed data:** Reusing 2020 (CC BY): the text is in hand (large dogs: stifle 42/146, hip flexion 57, tarsus 48/175; size trends), but its Tables 2-3 with all joints for 7 size groups are still missing (bot wall).

Convention: included angle, 180 = straight, >180 = hyperextended. Data in `data.csv`; sources and licences in `NOTE.md`.

## Key passive values (included °, mean)
| Joint | Max flexion | Max extension | Main sources |
|---|---|---|---|
| Shoulder | 48–57 (patients 40; French Bulldog 51) | 160–165 | French Bulldog; Anatolian radiographs 50/163 (facts); Jaegger 57/165 (C) |
| Elbow | 30–36 (French Bulldog 50; patients 24) | 155–165 (French Bulldog 175) | Police dogs 33/160; Anatolian radiographs 31/161; Jaegger 36/165 |
| Carpus | 30–33 | 189–204 unloaded (Anatolian 176 is an outlier) | French Bulldog 32/204; patients 24/189; Jaegger 32/196 |
| Hip | 45–60 (method-dependent) | 147–181 | French Bulldog 58/180; Dachshund 52/155; Anatolian radiographs 60/147 |
| Stifle | 38–43 (large breeds); 50–59 (short, heavy-legged) | 152 (awake, comfortable) to 166; 173 French Bulldog | Volz 39/152; police 41/160; Jaegger 41/162 (B) |
| Tarsus | 33–43 | 153–188 | Police 36/159; Dachshund 39/169; French Bulldog 40/188; Jaegger 39/164 |

**What else the data say:**
- **Loading:** a loaded carpus goes far past its passive limit. At jump take-off it reaches **238°**; at trot, 224° (GSD, 04-gait-curves). Passive goniometry stops at 189–204°.
- **Two-joint coupling:** with the hip fully flexed, the stifle extends only to **147° ± 2–3°** (hamstring stretch angle; GSDs and retrievers). That is about 15° less than its free limit.
- **Sedation:** it changed nothing in healthy Labradors (Jaegger 2002). In arthritic elbows it adds about 5° at each end (Clarke 2020).
- **Breed:** GSDs read lower than Labradors at every joint except the carpus, with less tarsal motion (Thomas 2006). Heavy-muscled or short-legged breeds flex less (French Bulldog, Dachshund).

## Non-gait movements
| Movement | Finding | Source |
|---|---|---|
| Jump take-off (Border Collie, bar at 120% of withers) | Shoulder 114–142°; elbow 119–163°; carpus 184–238°; hip 127–172°; stifle 130–161°; tarsus 103–177° (ROM 72°) | Inkila 2025 (CC BY) |
| Sit-to-stand (greyhound) | Hip excursion 53°, stifle 79°, hock 89° (about 2× trot). The joints extend in order: hip, then stifle, then hock. Takes 1.14 s. | Ellis 2018 (CC BY) |
| Sit-to-stand (Labrador) | Shoulder 27°, elbow 37°, carpus 70°, hip 35°, stifle 62°, tarsus 66° | Feeney 2007 (quoted) |
| Jump, stifle | About 120° of extension ROM | Gregersen & Carrier 2004 (quoted) |
| Gallop acceleration (greyhound) | Hip 35°, knee 35°, ankle 70° ROM | Williams 2009 (quoted) |
| Bite impact (Malinois) | Head–neck angle 162 ± 13° | Vilar 2026 |

**Derived, estimate:** sitting stifle ≈ 145 − 79 ≈ **65°** and sitting hock ≈ 140 − 89 ≈ **50–55°**. Sitting therefore runs close to, but not at, the passive flexion limits (about 40°).

## Proposed limits for the game (included °)
"Hard" is the rig clamp, set at the passive anatomical limit. "Comfortable" is the band for gait and idle motion. Only sit, lie, jump, stretch and play poses should go past it.

| Joint | Hard min (flexion) | Hard max (extension) | Comfortable | Trot/walk extremes (04-gait-curves) | Reasoning | Conf. |
|---|---|---|---|---|---|---|
| Shoulder | 45 | 165 | 85–145 | 90.7–144.0 | Goniometry flexion is 48–57 (patients 40) and extension 160–165. Gait uses the middle. The jump stays inside 114–142. | B |
| Elbow | 30 | 165 | 60–155 | 59.5–147.8 | Flexion is 30–36 and extension 155–165 in long-legged dogs. The 175 French Bulldog value is breed-specific. | A/B |
| Carpus | 30 | 200 when unloaded; 240 under load | 75–225 | 79.2–224.4 | Passive extension is 189–204. Weight-bearing hyperextension reaches 224 (trot) and 238 (jump). Allow beyond 200 only while the paw bears weight. | A |
| Hip | 50 | 175 | 90–170 | 94.5–172 (Humphries reads up to 200 on another pelvic line) | Flexion 45–60, extension 147–181, depending on the pelvic line. Fix the rig's pelvis line first. | B (method) |
| Stifle | 40 | 170 | 85–163 | 90.9–167.6 | Passive flexion is 38–43. Extension is 160–166 passive, and the trot reaches 167.6. Coupling: clamp the stifle to 150 or below when the hip is under about 70. | A |
| Tarsus | 38 | 180 | 80–175 | 82.8–168.4 | Flexion 33–43. Extension 159–188 (median about 165–170). The jump reaches 177. | A/B |
| MCP / MTP (digits) | 130 (EST) | 270 (EST) | 140–250 | Stark beagle walk 129–278 (swing doubtful) | No goniometry found. Uses the only measured dog data. | C/EST |
| Lumbar + lumbosacral (sum, sagittal bend from neutral) | −25 (extension / sway, EST) | +40 (flexion / roach, EST) | ±8 in gait | In vivo: L7–S1 5°, pelvis 7–8° per stride | Cadaver: L1–L5 at 2 Nm 7.7 flexion / 5.0 extension (lower bound). The lumbosacral joint moves up to 39° and is about 3× any other level. Put most of the bend at L7–S1. | C |
| Lumbar lateral bend (sum) | ±30 (EST) | — | ±10 | — | Cadaver L1–L5: 25.8 total at 2 Nm | C |
| Jaw gape | 0 | 65 | 0–44 | — | Thomson 2021: 44 ± 4. Dingo skull model: 65 (already in wolf.yaml). | B |
| Neck, tail | — | — | — | — | Gap: no measured ROM found | — |

How to use it:
- Clamp at **Hard**. Have the gait and idle generators stay inside **Comfortable**.
- Poses (sit, down, play bow, stretch, jump) may use the band between Comfortable and Hard.
- The carpus band above 200 is reserved for weight-bearing frames.

## Compared with `species/wolf.yaml` limits
The current values mostly agree: elbow 36/165; carpus 32/196; stifle 42/162; hock 39/164.

Changes to consider:
- Raise the hock extension limit to about 175–180. The jump and the French Bulldog data both exceed 164.
- Split the carpus extension limit into unloaded (200) and loaded (240).
- Mark the Jaegger stifle numbers as verified (41/162, via Pinna 2021). The other Jaegger numbers stay unverified.

## Gaps
- **Reusing 2020 Tables 2-3 (VCOT Open 3:e66, doi:10.1055/s-0040-1713825, CC BY 4.0).** The text is in; the two tables (all joints, 7 size groups) need a person to copy them or save the PDF.
- **Neck flexion and extension, tail ROM, digit goniometry:** none found in open literature.
- **Wolf and dingo:** no goniometry exists. These values are dog proxies.
- **Lying, play bow and stretch:** no kinematics found.
- **Absolute angles during sit-to-stand:** only excursions are given. Ellis 2018 Table S1 (forelimb) did not download.
- **Gallop extremes** (greyhound): only quoted ROMs, no absolute angles.
