# dingo-limb-bones: summary (2026-10-07)

**Status: partly found.**
- **Not found:** measured dingo or Carolina Dog limb-bone lengths. No open source prints individual or mean dingo GLs.
- **Found:**
  1. Harcourt's (1974) equations, **verified** from two CC BY papers. One correction is needed in `07-dingo`: the **tibia** intercept is **+9.41**, not +21.62.
  2. Corrected EST dingo bone lengths, with ranges and an error proxy.
  3. The only openly licensed complete single-dog limb sets for landrace / village-type dogs (Iron Age Anatolia, CC BY), with ratios.
  4. A CC0 dingo ear length and hind-foot length (LACM). This fills a `07-dingo` gap.

## Harcourt 1974 (SH and GL in mm), confirmed
| Bone | Equation | Check |
|---|---|---|
| Humerus | SH = 3.43 GL − 26.54 | Alaybeyi ALB 2 and ALB 4 recompute exactly |
| Radius | SH = 3.18 GL + 19.51 | ALB 5 recomputes exactly |
| Ulna | SH = 2.78 GL + 6.21 | ALB 7 consistent |
| Femur | SH = 3.14 GL − 12.96 | ALB 1 mean recomputes exactly (609.0) |
| Tibia | SH = 2.92 GL **+ 9.41** | ALB 1 matches only with +9.41 |

Source: Baranowski 2025 *Animals* (PMC12345418, CC BY), cross-checked against Onar et al. 2021 *Animals* (PMC8073760, CC BY). Harcourt's own error statistics were not found in any open source.

## Dingo bone lengths, EST (inverted Harcourt at Koungoulos 2024 SH; mm)
| Bone | Mean dingo (SH 542.2) | Range (SH 463.7-615.0) | Wild ♂ 590 / ♀ 560 | Koudelka alternative | Old 07 value |
|---|---|---|---|---|---|
| Humerus | **165.8** | 142.9-187.0 | 179.7 / 171.0 | 160.9 | 165.8 ✓ |
| Radius | **164.4** | 139.7-187.3 | 179.4 / 170.0 | 168.4 | 164.4 ✓ |
| Ulna | **192.8** | 164.6-219.0 | 210.0 / 199.2 | 203.1 | (none) |
| Femur | **176.8** | 151.8-200.0 | 192.0 / 182.5 | 180.1 | 176.8 ✓ |
| Tibia | **182.5** | 155.6-207.4 | 198.8 / 188.6 | 185.7 | 178.3 ✗ (wrong intercept) |
| Scapula height | 133.5 (Koudelka 4.06) | 114.2-151.5 | | | |

- **Error.** ±25 mm of SH gives ±7-9 mm per bone. Between methods, bones differ by 3-10 mm. Treat these as **±5%**.
- **No MC3 or MT3 estimate exists.**
- **The ratios from these EST rows are Harcourt's reference-dog proportions, not dingo proportions:** R/H 0.99, T/F 1.03, F/H 1.07.

## Real single-dog limb sets (CC BY) vs wolf and coyote
| Animal | H | R | F | T | R/H | T/F | F/H | (H+R)/(F+T) |
|---|---|---|---|---|---|---|---|---|
| Alaybeyi ALB 1 ♀ (SH 609) | 184.8 | 183.7 | 201.2 | 204.4 | 0.994 | 1.016 | 1.089 | 0.908 |
| Alaybeyi ALB 7 ♂ (SH 642) | 195.0 | 192.7 | 214.1 | 219.3 | 0.988 | 1.024 | 1.098 | 0.894 |
| Yoncatepe M5 | 166.9 | 168.4 | 181.6 | 180.2 | 1.009 | 0.992 | 1.088 | 0.927 |
| Yoncatepe M6 | 180.5 | 180.7 | 192.9 | 197.5 | 1.001 | 1.024 | 1.069 | 0.925 |
| Wolf, Law 2025 (wolf.yaml) | 232.0 | 236.5 | 247.5 | 258.0 | 1.019 | 1.042 | 1.067 | 0.927 |
| Wolf, Samuels 2013 (06) | 212.1 | 210.9 | 229.5 | 233.7 | 0.994 | 1.018 | 1.082 | 0.913 |
| Coyote, Samuels 2013 (06) | 160.1 | 168.3 | 179.7 | 187.9 | 1.051 | 1.046 | 1.122 | 0.893 |

Ulna/radius: 1.18 in ALB 7, 1.10 and 1.14 in Yoncatepe.

Landrace dogs sit with the wolf: R/H about 0.99-1.01 and T/F about 0.99-1.02. Their forearm is relatively a little shorter than the coyote's (coyote R/H 1.05).

**Dingo external measurements (CC0, LACM, 2 wild Queensland ♂):** ear 100 and 90 mm; hind foot 210 and 195 mm; tail 365 and 340 mm; total length 1235 and 1215 mm.

## Can the hero use dingo numbers now?
- **Partly.** For **absolute size**, use the dingo EST lengths at ±5%: humerus about 166 mm, radius about 164 mm, femur about 177 mm, tibia about 183 mm. They are tied to a measured n = 117 dingo SH and are close to the coyote's absolute lengths (coyote humerus 160, femur 180).
- **For proportions, keep the wolf/coyote proxies.** Dingo proportions remain unmeasured; the EST ratios are circular. The real landrace-dog individuals say the wolf ratios (R/H ≈ 1.0, T/F ≈ 1.02-1.04) fit a village-type dog better than the coyote's longer forearm.
- **MC3, MT3 and scapula** stay on the wolf ratios (MC3/R about 0.42, MT3/T about 0.42-0.43).

## Blockers (need a human)
- **Koungoulos 2022 PhD thesis**, University of Sydney eScholarship. It is the likely holder of 117 dingo limb GLs, but it sits behind a Cloudflare challenge. Its licence is unknown; check it before storing anything.
- **Open Context:** Anubis bot wall.
- **Dryad file downloads:** need a login.
- **Museums Victoria API:** Cloudflare.
- **Valsgärde paper on DiVA:** reset or 503.
