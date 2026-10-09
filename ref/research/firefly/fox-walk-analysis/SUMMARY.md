# Fox walk, stop and stand: measured from GrumpyDingo's clip (Oct 8, 2026)

**Source:** `Fox.mp4` in GrumpyDingo's Drive. A red fox walks right on clean white snow, slows, stops and raises its head. The camera tracks it. 480×270, 15 fps, 65 frames, 4.3 s. Its licence is unknown, so **no frames are stored here**: only the derived numbers (`body.json`, `stances.json`) and the charts (`fox_charts.png`).

**Tools:** `tools/videokit/`.
- `analyze.py`: segmentation and tracking.
- `track.py`: planted-paw chains.
- `body.py`: heights.
- `overlay.mjs`: hero3 drawn over the clip.
- `compose.py`: the overlay GIF.
- `charts.py`: the charts.

## Method
- **Fox and paws:**
  - The fox is cut out of the snow with a smooth background model (it separates cleanly; small holes are filled so the white chest stays in).
  - The black lower legs are tracked as paws.
  - The camera follows the fox, so a **planted paw slides backward in the picture at the walking speed**. Paws are linked frame to frame on that rule, which gives each paw's landing and lift-off.
- **Scale:** heights are given as shares of the fox's **standing back height (159 px)**, measured over the flat stretch of the back, not over the shoulders, because a raised neck fools that.
- **Limits:**
  - The tail and part of the hind legs leave the left edge of the frame for most of the clip, so the hind numbers are weaker and the two hind paws aren't told apart.
  - "Near" and "far" front paws are separated by where they land (the near one lands closer to the nose).
  - The timing assumes the clip plays at real speed.

## What the fox does

| | Fox (measured) | hero3 now |
|---|---|---|
| Stride (one full cycle) | about **21 frames, 1.4 s** at 15 fps | 1 s (game-tied) |
| Ground covered per stride | **≈1.4 standing heights** (10.5 px/frame × 21 = 220 px) | **0.51** |
| How far a planted front paw travels back | **0.55–0.9 heights** | 0.31 |
| Where the front paw lands | **0.06–0.29 heights behind the nose tip**: almost under the nose | well behind the head |
| Where the front paw lifts | 0.85–0.95 heights behind the nose | n/a |
| Front paw down (duty) | about 0.6 (9-14 of 21 frames) | 0.62 |
| Footfall rhythm | even hind-front-hind-front; the fore lands ≈0.36 of a stride after a hind (a brisk, trot-ward walk) | fore 0.16 after its hind (slow dog walk) |
| **Back while walking** | **0.83-0.96 of standing, about 0.9**, bobbing ~±0.03 twice a stride | ≈1.0 (barely dips) |
| **Nose while walking** | **0.53-0.77 of standing back height**, carried **0.18-0.34 below the back** | ≈0.88, above the back |
| Ear tips while walking | 1.0-1.2 | ≈1.27 |
| Standing alert | nose 0.96-0.97 (level with the back), ears 1.37, back 1.0 | nose 0.88, ears 1.27 |

## The stop, step by step (frame / seconds)
1. **f0-28 (0-1.9 s): steady walk** at about 10.5 px/frame. The nose drifts up slowly from 0.53 to 0.75 (it is looking up as it walks).
2. **f29 (1.93 s): slowing begins.** Speed falls to about 6.5 px/frame within 3 frames and holds there through the last steps.
3. **f37 (2.47 s): the last front paw plants**, near the nose, and stays planted to the end.
4. **f41-47 (2.73-3.13 s): the head comes up.**
   - The nose rises from 0.77 to 0.94 of the back height and the ears from 1.23 to 1.36, in **6 frames (0.4 s)**.
   - This happens **during the last hind steps, before the body has stopped**.
5. **f47-53 (3.13-3.53 s): the hind legs close up and the back rises** to its full standing height (0.96 to 1.0).
6. **f53 on (3.53 s): standing still.** All four paws stay planted (the leftover 2.2 px/frame is the camera still panning).

**For the game:**
- Ease into a stop over about **1.6 s** (from the first slowing to standing still).
- Lift the head over **0.4 s**, starting about **0.8 s** after the slowing begins and finishing **0.4 s** before the body settles.
- The back rises last.

## What it means for hero3 (ranked)
1. **Stride:** about 2.7× longer steps. The front paw reaches out to land nearly under the nose. This is the shuffle.
2. **Head while moving:** a head joint is needed so the nose can ride 0.2-0.35 heights below the back while walking, and come up to back level when standing alert. The standing photo pose is the alert pose, not the walking one.
3. **Back while walking:** about 10% lower than standing (the legs work more flexed), with a visible bob.
4. **The stop:** a scripted sequence (slow, last steps, head up, back up), using the timings above.
5. **Rhythm:** the fox's brisker walk sits nearer a trot (fore 0.36 after hind). Our 0.16 is a slow dog walk. Pick per speed: slow walk 0.16-0.25, brisk walk 0.3-0.4.

A fox isn't a wolf (it's lighter and runs proportionally a little longer in the leg), so these numbers are a template for *how a canid moves*, checked against the dog and wolf data before they are copied.
