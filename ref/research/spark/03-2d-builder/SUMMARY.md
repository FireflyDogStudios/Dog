# 2D dog builder, slice 1: one standing wolf, scored (Spark, Oct 8 2026)

Request: `docs/claude/DEN-SPARK-REQUEST-2d-builder-2026-10-08.md`. **Stopping here for GrumpyDingo's judgement.**

## What it is
- **Code:** `engine/canine/`.
  - `canine2d.js` is the core, a pure function that runs in the browser and in node with no `Math.random`.
  - `species.mjs` reads a species.
  - `slice1.mjs` builds, scores and renders: `node engine/canine/slice1.mjs`, about 3 s.
- **The masses:** about 75 named 2D masses (ellipses and tapered capsules), melted together with a smooth union.
  - **Layers:** BODY holds the near legs, trunk, neck, head, near ear and tail. FAR holds the far legs and far ear, drawn darker behind.
  - **Output:** each layer is traced by marching squares, simplified (Ramer-Douglas-Peucker) and fitted with Beziers into **one clean SVG path per layer**. There are no pixels in the art.
- **Inputs, all read from files:**
  - **Joints:** `species/build/wolf.skel3d.json` (`joints_side_mm`, scaled to withers height).
  - **Form numbers** (outer surface, fur included) from `species/wolf.yaml`:
    - chest floor 0.47 of withers height;
    - nose forward 0.54 and nose height 0.85;
    - loin and crest heights over the withers tip (Scout 17);
    - tail length 0.61 and carriage −75°;
    - ear length 120 mm and ear set 130°.
  - **Fur per region:** `wolf.curves.json` estimates.
  - **Trunk:** lofted from that topline and underline. The tuck-up follows Scout 15, but stays fur-masked, as Scout 15 saw on the wolf photo.
- **Names are mount points:** every mass is named (`neck`, `pastern`, `hock`, `thigh` and so on), ready for gear.

## Scores
Units are withers heights; y points down, so a positive bias means the model's line is *lower* than the target's.

| Target | IoU | Topline error (mean / max / bias) | Belly error (mean / max / bias) |
|---|---|---|---|
| **Measured wolf outline** (`wolf.photo.json`: Rob Foster's CC BY photo, warped onto our skeleton) | **0.695** | 0.054 / see `scores.json` / +0.046 | **0.022** / see `scores.json` / −0.012 |
| Our earlier curve model (`wolf.curves.json`), for reference | 0.699 | 0.033 / – / +0.010 | 0.065 / – / +0.052 |

- **Starting point** (before 3 tuning passes, each fixing a fault I could see): photo IoU 0.647, topline 0.070, belly 0.034.
- **What I tuned:** scalloped back, tail bustle, thick neck, chest dewlap, ear. I did **not** fit to the photo's numbers. The species medians stay the inputs.
- **The biggest remaining gap is a pose difference, not a builder fault.** The photo wolf's back stands about 0.05 WH higher (thick coat, back raised), and its head is lower and further forward: its nose is at x 0.66, against the species median of 0.54. Scoring against one photo is a check, not a target. More measured outlines (Shutter's stacks) would give a fairer score.

## Renders (1000 px, side view)
- `wolf-dark.png`, `wolf-mid.png`, `wolf-light.png`: three flat backgrounds.
- `wolf-120px.png`: game size, on all three backgrounds. **It reads as a wolf at 120 px.**
- `wolf-overlay.png`: our outline with the measured wolf outline as an orange dashed line. `wolf-overlay_curves.png` shows our earlier curve model as a blue dashed line.
- `.svg` copies of each, plus `scores.json`.

## Known faults, for GrumpyDingo to rank
1. The ears are small spikes: the near ear mostly sits inside the head line, and the far ear barely shows.
2. The muzzle is a narrow wedge, and the head reads small against the photo wolf (which has winter fur and a ruff).
3. The tail hangs as a stiff club. It needs a bushier taper and a slight curve away from the hocks.
4. The far fore leg hides almost completely behind the near leg.
5. There's a slight kink where the neck meets the chest.

All are single-mass changes. Slice 2 is tuning these one at a time, with GrumpyDingo judging each.
