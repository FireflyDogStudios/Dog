# Back line of standing wolves and Huskies (Shutter, Oct 7, 2026)

**Status: first delivery (3 wolf photos, 4 plates, 4 Husky stacks). More wolf photos are being added; this file will be updated in place.**

## The answer
A standing wolf's back is **level, not rising, from the withers to over the hips, and falls only behind the hips.** All three wolf photos read the same way, and the plates and Husky stacks agree on the shape.

Fur-outline height above the local ground line, as a share of withers height (median, with the range across animals):

| Point along the back | 3 wolf photos | 4 Keulemans plates (drawings) | 4 Husky stacks |
|---|---|---|---|
| withers (s = 0) | 1.00 | 1.00 | 1.00 |
| s = 0.25 | 0.98 (0.96 to 1.00) | 0.98 (0.91 to 0.99) | 0.98 (0.97 to 0.99) |
| **mid-back (s = 0.5)** | **0.97** (0.97 to 1.00) | 0.99 (0.91 to 1.01) | 0.97 (0.96 to 0.98) |
| s = 0.65 | 0.99 (0.97 to 1.00) | 0.98 (0.93 to 1.00) | 0.96 (0.94 to 0.97) |
| **croup, over the hips (s = 0.78)** | **0.97** (0.96 to 0.98) | 0.94 (0.93 to 0.95) | 0.94 (0.92 to 0.97) |
| s = 0.9 | 0.95 (0.92 to 0.95) | 0.91 (0.89 to 0.92) | 0.92 (0.91 to 0.96) |
| **tail root, outline falls 45° (s = 1.0)** | **0.92** (0.89 to 0.94) | 0.86 (0.85 to 0.87) | 0.90 (0.87 to 0.96) |
| tail root, outline falls 60° (s ≈ 1.07) | 0.87 (0.85 to 0.90) | 0.76 (0.72 to 0.79) | 0.81 (0.78 to 0.84) |

(Husky 60° line: the curled-tail photo is left out.)

- **Highest point over the hips:** the highest back point between s = 0.6 and 0.9 is 1.00, 0.99 and 0.97 in the three wolves, found at s ≈ 0.6 to 0.65. None is more than 0.001 above its withers.
- **How this fits Scout 15** (mid-back 0.97, croup 0.92, tail root 0.82): mid-back agrees. The "croup 0.92" matches my s = 0.9 point (0.92 to 0.95), the rear end of the hip. The "tail root 0.82" is lower than both of my tail-root points, because it was read at the base of the tail, further down the curve.
- **What the model needs (fur outline, so about 0.01 to 0.03 above the bone):** a back that stays within 0.03 of the withers height out to the hips, then falls to about 0.95 at the hip's rear end and 0.9 to 0.92 where the tail leaves. Our rise toward the croup (1.05) is the wrong direction by about 0.05 to 0.08.
- **Husky vs wolf:** the Husky stacks fall slightly more (0.94 at the croup, against 0.97 for the wolves), partly because show dogs are stacked with the hind legs set back. Use the Husky column for the Husky build.

## Method
- **Cut-outs:** IS-Net (`isnet-general-use` through `rembg`) on each photo. I checked each outline over the photo.
- **Measure** (`tools/shutter/meas2.py`, a script, not hand-reading):
  - the ground line runs through the lowest pixels of the near front and near hind paws, so a slope is allowed;
  - heights are measured vertically, from that line up to the top of the outline;
  - withers = the highest outline point over the shoulder blades (the window sits about 12% of the body length behind the front leg; set by hand for the stacked Husky because its front leg stands well forward);
  - tail root = where the back outline first falls at 45° (slope 1.0 over 25 px); a second reading at 60° is given because the tail root has no single point;
  - s runs from the withers (0) to the 45° tail-root point (1).
- **Error:** two frames of the same wolf (w01 and w06, different head position) agree within 0.002 at all points. A 1-px reading error is 0.001 to 0.004 of the height. The bigger uncertainty is the camera: a camera above or below the body, and a sloping ground (listed per photo), shift the numbers by a few percent.
- **Fur:** these are outline heights including fur, not skin or bone.

## Photos used
See `data.csv` (author, licence, ground slope, every height, notes).

| Tag | File | Notes |
|---|---|---|
| w01 | Scout wolf 01, Rob Foster, CC BY 4.0 | spring moult, level back, head low, road slopes 2% |
| w05 | Scout wolf 05, Drew Avery, CC BY 2.0 | captive arctic wolf behind a fence, 1,018 px; ground rises away (9%) |
| w13 | Scout wolf 13, NPS Yellowstone | winter coat, head turned (does not change the topline); 1,024 px |
| p02, p04, p08, p09 | Keulemans plates, 1890, public domain | artist's drawings, so treat as shape only |
| h01, h02, h04, h07 | Husky standing 01, 02, 04, 07 | h02's near hind paw is cut off by the image edge (±0.02); h04's ground slopes 12%; h07's camera is above the dog (15% slope) |

## Left out, and why
- **Scout wolf 06:** the same wolf as 01 (second frame). Kept only as a repeat check.
- **Scout wolf 03:** three-quarter view behind chain-link, strong perspective (Firefly had already dropped it).
- **Scout wolf 07:** the feet are hidden in the vegetation, so there is no ground line.
- **Scout wolves 10 to 12 and 14:** walking or three-quarter views.
- **Husky 03:** the dog is angled to the camera (ground slopes 13%), so heights are not trustworthy.
- **Husky 05 and 06:** the handler's arm rests on the dog's withers and back, so the topline is hidden there.
- **Husky 08 to 10:** small, cropped or head down; not needed once four stacks were measured.
