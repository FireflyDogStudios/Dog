# 07-head-soft-tissue: summary (2026-10-07)

**Status: partial.** No open CT/MRI study gives soft-tissue depths for the dog or wolf face, and no open source gives absolute temporalis or masseter thickness. The depths here are Scout's measurement of **Ellenberger Tafel 3** (public domain), which draws the skeleton inside the skin outline of a lean, short-coated Great Dane type dog. Details in `NOTE.md` and `data.csv`.
- **Mapping:** the plate is mapped into the wolf-skull frame using the prosthion and the jaw hinge (617 px per CBL).
- **Lips and chin:** from 83 AwA-Pose wolf profile heads (MIT).
- **Eye opening:** from Packer 2015's per-dog data (CC BY, 700 dogs).
- **What the depths include:** skin and muscle only, not fur. Same frame as `../06-ears`: wolf skull 170753, CBL units, x forward, y down, origin at the prosthion; mm values are for CBL 244.3.

## Suggested head offset table (add fur separately)
| Station | Measured on the plate (dog) | Suggested for the wolf | Suggested for the dingo / Carolina Dog | Basis |
|---|---|---|---|---|
| Nasal bridge (x -0.10 to -0.33) | 0.020-0.022 CBL perpendicular (5 mm) | 0.02 | 0.02 | measured, B |
| Stop (nasion, x -0.41 to -0.44) | 0.048-0.061 (12-15 mm); the plate dog has a deep bony stop | **0.03-0.04** (shallow wolf stop) | 0.035-0.045 (standard: "slight but distinct" stop) | measured B / EST |
| Forehead over the frontal (x -0.49 to -0.56) | 0.026-0.028 (6-7 mm) | 0.027 | 0.027 | measured, B |
| Cranium, temporalis region (x -0.64 to -0.72) | 0.042-0.054 (10-13 mm) | 0.05 | 0.045 (lean, "refined" skull) | measured B / EST |
| Occiput (back) | 0.023 (5.5 mm) | 0.023 | 0.023 | measured, B |
| Nose tip (rhinarium) | skin tip at **(0.071, -0.090)**, 0.088 CBL ahead of the incisor front (21 mm) | (0.07, -0.09) | (0.07, -0.08) | measured, B |
| Upper lip, front edge | (0.038, 0.067) on the plate, a loose-lipped dog | **(0.02, 0.03)**: AwA wolf keypoint median (0.020, 0.026), n 83 | (0.02, 0.03): tight black lips | B / C |
| Lip commissure (mouth corner) | — | **(-0.355, 0.129)**, IQR x -0.42 to -0.32 (n 83): above the upper P3/P4 gap, level with the lower tooth row | (-0.36, 0.12), EST | C |
| Chin | 0.035 down (8.5 mm); skin point (-0.10, 0.19) | 0.035; AwA chin/lower-lip keypoint (-0.047, 0.160), strict subset (-0.03, 0.134) | 0.03 | B / C |
| Underside of the jaw (x -0.13 to -0.45) | 0.031-0.044 (8-11 mm) | 0.035 | 0.03 | measured, B |
| Cheek bulge (masseter under the arch, temporalis above it) | no open measurement | side view: fill from the zygomatic arch down to the mouth-corner line and back to the jaw angle. Top view: 0.02-0.03 CBL beyond the zygion (EST) | same | EST |
| Eye opening length | dogs: German shepherd 32 mm (n 36), non-brachycephalic 29 mm (n 464). **Relative: 20% of cranial length** (stop to occiput, over the skin) | **0.12-0.13 CBL** (about 30 mm); **draw 0.10-0.12** in a pure side view (foreshortening) | same ratio: about 0.12 × the hero's CBL | Packer A; wolf value EST |
| Eye opening height | no data | 0.4-0.5 × the length (almond shape) | same | EST |
| Eye centre | orbit centre (-0.496, -0.228); orbit 0.12 × 0.13 CBL | at the orbit centre; the opening spans roughly the orbit width | same; outer corner higher than inner (UKC), tilt 10-15° | EST |

Supporting facts: mesocephalic dogs' palpebral fissure 19.3 ± 3.3 mm, relative fissure 17.4 ± 1.6% (Li 2025, fact only); Labrador 30 mm (19.0%), Border collie 28 mm (20.6%) (Packer 2015); temporalis thickness by ultrasound agrees with CT (mean difference 0.007 cm, n 17; Bullen 2017), no absolute thickness given.

## Gaps
- **No measured face soft-tissue depths for any dog or wolf.** The table rests on one artist's plate of a large domestic dog. Wolf skin is likely similar; muzzle and stop shape differ.
- **No absolute temporalis or masseter thickness**, so the cheek bulge is an estimate.
- **No wolf or dingo palpebral fissure**; dog ratios are used.
- **AwA keypoints:** mixed poses, some mouths open; anchored on the eye, so grade C.

## What needs our own photos or clips
- **Profiles with the mouth closed:** true-profile head photos of dingoes, Carolina Dogs and wolves, with a scale or known skull length; mark the nose tip, stop, mouth corner, eye corners and chin.
- **Top-down or head-on photos:** for the cheek width relative to the skull's zygomatic breadth.
- **A CT of a wet (unskinned) dog or wolf head** under CC BY would give true depths. None was found (Zenodo 10410546, CC BY, is prepared skulls and ear regions only).
