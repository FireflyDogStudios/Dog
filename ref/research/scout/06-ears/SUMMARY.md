# 06-ears: summary (2026-10-07)

**Status: length, position and shape guidance are done. Base width and the outline are partly measured: one plate, plus keypoint silhouettes from photos in mixed views. There is no dingo outline data.** Details in `NOTE.md`, `data.csv` and `ear_records.csv` (500 adult museum ear lengths, CC0/CC BY only, with GBIF keys).

**Frame:** wolf skull 170753 (`../../missingfound/wolf-skull/`), CBL units, facing right, x forward, y down, origin at the prosthion. Reference points: jaw hinge (-0.754, -0.028); orbit centre, estimated (-0.496, -0.228); nasion, estimated (-0.438, -0.247); akrokranion (-1.034, -0.293).

## Key numbers
| Quantity | Wolf | Dingo / Carolina Dog | Comparison | Source (licence), confidence |
|---|---|---|---|---|
| Ear length, notch to tip (museum) | **117 mm** median, IQR 110-124 (North America, n 45); **112 mm** (Israel, n 196) | **95 mm** (90 and 100; 2 wild Queensland males) | coyote 110 mm (n 141); golden jackal 79 mm (n 185); red wolf, live, 110 mm (n 445) | GBIF museum records (CC0/CC BY stored; CC BY-NC aggregated only); Hinton 2022 (CC BY). A |
| Ear height (Heptner & Naumov) | Taimyr males: mean 12.7 cm, with mean CBL 247.6 mm. Females: 12.0 cm, with CBL 232.3 mm | — | Mongolian wolf 10-14.5 cm | fact only. A |
| **Ear length / CBL** | **0.47-0.53; use 0.50** | **about 0.53** (95 / 176.9 mm; estimate) | — | derived. B / EST |
| Ear / hind foot (Allen's rule check) | 0.46 (North America), 0.50 (Israel) | 0.46-0.48 | coyote **0.60**, jackal 0.48 | GBIF. A |
| Visible ear / (ear base to nose), 2D photos | 0.356 (n 55) | basenji 0.319, elkhound 0.29, malamute 0.31, husky 0.31 | German shepherd 0.45-0.50, red fox 0.48 | AwA-Pose, StanfordExtra (MIT). B |
| Ear base keypoint (where the ear meets the head outline) | **(-0.95, -0.36)** median, n 150; strict-profile subset (-0.92, -0.43) | no data; use the wolf | — | AwA-Pose mapped into the frame (MIT). C |
| Ear base on the anatomical plate | centre (-0.89, -0.31), front (-0.80, -0.34), rear (-0.98, -0.29); straight above the ear canal at (-0.84, -0.02) | — | — | Ellenberger Tafel 3 (PD). B |
| Ear base width, side view | **0.195 CBL** (48 mm at CBL 244) | — | — | Ellenberger Tafel 3 (PD), one dog. B |
| Width along the ear (width / visible length) | — | t 0.25: 0.94; t 0.5: 0.71; t 0.75: 0.51; t 0.9: 0.37 (prick-eared breeds pooled) | basenji 0.81 / 0.68 / 0.51 / 0.38 | StanfordExtra silhouettes (MIT). C |
| Tip | **Rounded**; ears shorter relative to the head than a coyote's | Carolina Dog: **slightly rounded tip**, triangular, **wide base**, tapering, leaning slightly forward and outward. Dingo: "erect" | coyote pointed; jackal blunter than a fox | International Wolf Center; UKC standard; Australian Museum; Heptner (fact only). B |

Wolf ear base centre, about (-0.92, -0.36), relative to the skull: 0.17-0.19 CBL behind the jaw hinge and 0.33-0.40 above it (straight above the ear canal); 0.42-0.45 CBL behind the orbit centre and 0.13-0.20 above it; 0.09-0.12 CBL in front of the akrokranion, just above the skull-top line. The keypoint sits on the skin or fur outline, not on bone.

## Suggested values
**Wolf**
- **Length:** ear length (notch to tip) 0.50 CBL; **the part visible above the head outline is about 0.36 CBL** (keypoints give 0.33, IQR 0.25-0.39).
- **Base:** centre at (-0.92, -0.36); width 0.20 CBL along the head outline.
- **Resting angle:** keep `ear_set` at 130° from the forward skull line, about 115° from +x in this frame. The AwA mapping gives 109° (IQR 93-134), which agrees once the 15° tilt of the base-to-nose line is added.
- **Shape:** broad triangle with a **rounded tip** (corner radius about 0.05 CBL, EST). Front edge nearly straight, rear edge convex.

**Dingo / Carolina Dog (hero)**
- **Length:** about 0.53 CBL for the dingo. The Carolina Dog standard asks for medium-large upright ears: **use 0.38-0.40 CBL visible** (EST: the short coat shows more ear than the wolf's ruff).
- **Base:** same position and width as the wolf (no dingo data).
- **Angle:** about 112° from +x, slightly more upright and leaning forward.
- **Tip:** slightly rounded, smaller radius than the wolf's (about 0.03 CBL, EST).

**Side-view outline template (EST).** t runs along the base-to-tip axis from 0 to 1; widths are fractions of the base width W = 0.20 CBL; "front" is the nose side. Base width from the plate; taper from StanfordExtra silhouettes, rescaled so t = 0.25 matches the plate.

| t | Total width / W | Front / W | Rear / W |
|---|---|---|---|
| 0 | 1.00 | 0.45 | 0.55 |
| 0.25 | 0.95 | 0.43 | 0.52 |
| 0.5 | 0.73 | 0.32 | 0.41 |
| 0.75 | 0.52 | 0.26 | 0.26 |
| 0.9 | 0.38 | 0.21 | 0.17 |
| 1 | rounded tip | | |

**Example in the wolf frame** (base (-0.92, -0.36), axis 115°, visible length 0.36), front edge from base to tip, tip, then rear edge from tip back to base:
- Front edge: (-0.838, -0.398), (-0.881, -0.478), (-0.938, -0.550), (-0.987, -0.626), (-1.020, -0.671)
- Tip: (-1.072, -0.686)
- Rear edge: (-1.089, -0.639), (-1.081, -0.583), (-1.070, -0.489), (-1.053, -0.397), (-1.020, -0.314)

## Gaps
- **No measured base width or ear outline exists for any wild canid.** The base width comes from one artist's plate of a cropped-ear Great Dane type; the taper from domestic prick-eared dogs photographed in mixed views.
- **Dingo:** no usable ear tips in StanfordExtra, and only 2 museum ear lengths (LACM, CC0).
- **Not read:** Young & Goldman (borrow-only). Mech 1974 is now in `../09-us-gov-references/`. The Italian wolf ear lengths (Fabbri et al. 2025) exist only in figures.
- **AwA mapping is grade C:** anchored on the eye; photos mix poses and head turns.
- GBIF paging for wolf and coyote kept resetting, so only records whose text matched "ear", "measurements" or "notch" were used; a few may be missed. VertNet's API host did not resolve (GBIF carries the same records).

## What needs our own photos or clips
- **Profiles:** true-profile photos of standing dingoes and Carolina Dogs with a scale or a known skull length; mark the ear base, ear tip, front and rear edges at t = 0.25 / 0.5 / 0.75, and the eye. About 20 animals would do.
- **Head-on photos:** for ear width and the forward-and-outward lean.
- **Clips:** short clips of ears turning toward a sound.
