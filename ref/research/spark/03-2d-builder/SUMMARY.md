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

## Scores (rescored Oct 8 after GrumpyDingo's "hunchback" catch; the wolf itself is unchanged)
**Primary yardstick: real standing wolves.** Every number is a share of withers height, measured on the outer outline the same way the photos were: withers = the highest point over the shoulder blades; tail root = where the back first falls at 45°. Full numbers: `scores.json` → `primary_7_wolves`.

**Back line vs Shutter's 7 wolves** (`ref/research/photos/backline/`): mean error **0.058**, and only the withers point is in range.

| Point along the back (s) | 0 | 0.25 | 0.5 | 0.65 | 0.78 croup | 0.9 | 1.0 tail root |
|---|---|---|---|---|---|---|---|
| Wolves, median (range) | 1.00 | 0.97 (0.96–1.00) | 0.98 (0.94–1.00) | 0.99 (0.93–1.00) | 0.97 (0.94–0.98) | 0.93 (0.92–0.96) | 0.90 (0.88–0.94) |
| Our wolf | 1.00 | 0.95 | 0.94 | 0.92 | 0.90 | 0.85 | **0.78** |

What it says: **our back slopes down all the way from the shoulders.** The neck ruff and crest masses lift the outline over the shoulder blades about 0.08 above the nominal withers, and the croup and tail root sit too low. Real wolves stay level to over the hips, then fall.

**Proportions vs the 7-wolf photo ratios** (`ref/research/wolf-photo-proportions/`):

| Measure | Ours | Median (range) | In range? |
|---|---|---|---|
| Body length (chest front to buttock) over height | 1.33 | 1.15 (1.08–1.48) | yes, but long |
| Chest floor height over height | 0.41 | 0.47 (0.42–0.56) | **no, a little too deep** |
| Nose forward of withers over height | 0.59 | 0.54 (0.49–0.54) | **no, slightly too far forward** |
| Nose height over height | 0.78 | 0.85 (0.75–0.86) | yes, but low |

**Secondary only:** `wolf.photo.json` has a **mid-back hump**: the photo wolf raised its back, and the warp onto our skeleton made it worse. So its "topline 0.054" was mostly the target's fault. IoU against it: 0.695 (belly 0.022). Against our earlier curve model: 0.699.

## Renders (1000 px, side view)
- `wolf-dark.png`, `wolf-mid.png`, `wolf-light.png`: three flat backgrounds.
- `wolf-120px.png`: game size, on all three backgrounds. **It reads as a wolf at 120 px.**
- `wolf-overlay.png`: our outline with the 7-wolf back line (median dots, range bars). The humped photo outline is drawn faint, as a secondary check. `wolf-overlay_curves.png` shows our earlier curve model as a blue dashed line.
- `.svg` copies of each, plus `scores.json`.

## Known faults, for GrumpyDingo to rank
0. **The back line (new, from the rescore):** it slopes down from a high ruff instead of staying level to the hips, and the croup and tail root are low (0.78 against 0.90).
1. The ears are small spikes: the near ear mostly sits inside the head line, and the far ear barely shows.
2. The muzzle is a narrow wedge, and the head reads small against the photo wolf (which has winter fur and a ruff).
3. The tail hangs as a stiff club. It needs a bushier taper and a slight curve away from the hocks.
4. The far fore leg hides almost completely behind the near leg.
5. There's a slight kink where the neck meets the chest.

All are single-mass changes. Slice 2 is tuning these one at a time, with GrumpyDingo judging each.

## Look target (GrumpyDingo's studio wolf, described in words; the image isn't stored, its licence is unclear)
- **Back:** level, with a slight dip behind the withers; the croup rounds into the tail.
- **Head and neck:** a big head carried at withers height, on a short, deep neck with a ruff.
- **Muzzle:** long and fairly deep.
- **Ears:** large upright triangles, about a third of the head's length.
- **Chest:** deep, down to the elbow.
- **Tail:** a thick brush hanging nearly straight down to about hock height, with daylight between it and the hind legs.
- **Legs and paws:** long legs, visible joints, compact big paws; the far legs clearly offset.

Against this, our wolf's faults 0 to 4 are the gaps. The chest and legs are closest already.
