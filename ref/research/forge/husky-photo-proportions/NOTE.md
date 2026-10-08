# Husky outline proportions from Shutter's standing stacks (Forge, Oct 8, 2026)

**What:** the same points and the same method as `ref/research/wolf-photo-proportions/`, on Shutter's five best standing Huskies (`ref/research/photos/siberian-husky/standing/` 01-05; licences in `catalogue.csv`: CC BY 4.0 and CC BY 2.0). Points were read by eye from 1100 px gridded previews (the 5 files are 1,104-1,920 px originals); nothing was traced or copied, only coordinates are stored. Points: withers top (fur surface above the front legs), ground (local paw line), chest front (point of shoulder), buttock (rear of the rump; for 05 this includes the tail brush), chest floor (lowest chest line behind the elbow), nose tip. All ratios are shares of the withers-to-ground height, outer surface with fur, so they compare with the wolf table and with the 3D/2D outline points (bone + skin + fur).

**Reading error:** about +-10 px on 500-600 px of height, so +-0.02 on each ratio. Camera height and a sloping ground shift a ratio by a few percent (03 and 04 slope; local ground is used).

**Left out (06-10):** 06 is small, 07 and 10 are low resolution, 08 is tightly cropped, 09 has the head turned (see the standing note in `catalogue.csv`).

| Ratio (share of withers height) | 01 | 02 | 03 | 04 | 05 | median | range | wolf median (7) |
|---|---|---|---|---|---|---|---|---|
| Body length, chest front to buttock | 1.42 | 1.47 | 1.34 | 1.27 | 1.49 | **1.42** | 1.27-1.49 | 1.15 |
| Chest floor height above ground | 0.52 | 0.49 | 0.49 | 0.45 | 0.52 | **0.49** | 0.45-0.52 | 0.47 |
| Nose forward of withers | 0.64 | 0.74 | 0.51 | 0.65 | 0.70 | **0.65** | 0.51-0.74 | 0.54 |
| Nose height above ground | 1.29 | 1.04 | 0.92 | 1.11 | 1.15 | **1.11** | 0.92-1.29 | 0.85 |

**Back line** (Shutter, `ref/research/photos/backline/`, 4 Husky stacks, fur outline, share of withers height): mid-back 0.97 (0.96-0.98), croup over the hips 0.94 (0.92-0.97), tail root at 45 degrees 0.90 (0.87-0.96). Read from `SUMMARY.md`; not re-measured here.

## Reading the numbers (what to trust)
- **Body length 1.42 is outer surface and too long to use as a skeleton figure.** It includes the chest ruff in front and, in 05, the tail brush behind; the breed standards describe a body only slightly longer than tall. For a 2D outline it is right as measured; for bones, scale from height, not from this.
- **Nose height 1.11 is a show-stack head**, held up by the handler (01, 04, 05). A relaxed standing Husky carries the head lower: 03 (head lowered, 0.92) is the only relaxed one. Use 0.92-1.0 for an idle pose, 1.1 for an alert stack.
- **Chest floor 0.49** matches the wolf (0.47) within the reading error; the Husky's underline looks higher behind the elbow only in 04, which is a young dog.
- n is 5, graded **C** (small sample, hand-read, fur included), the wolf table was n=7 and read the same way.

## Cross-check with the StanfordExtra Siberian husky row (n=12 profile, 5 standing; `ref/research/keypoints/stanfordextra_breeds_unitB.csv`, MIT)
Unit B: 1 unit = ear-base midpoint to tail base. Different unit from the photo table, so only shapes compare.
| Feature | StanfordExtra husky | Photos / yaml | Agree? |
|---|---|---|---|
| Head | 0.46 (middle half 0.34-0.65) | not measured in photos | n/a |
| Front leg | 0.60 | no photo figure | n/a |
| Hind leg | 0.51 (hind "top" is placed differently in each set, least comparable) | n/a | n/a |
| Ear | 0.13 | ear / (ear base to nose) 0.309 (Scout 6, same StanfordExtra source) | same data |
| Tail | 0.35 (middle half 0.13-0.55) | curled over the back in most stacks, so the straight length is not read | disagree on purpose: curled tail foreshortens |
| Topline to paw | 0.93 | withers height stand-in | n/a |
| Tail carriage (standing, n=4) | +100 deg (over the back) | wolf -75 (hangs); Husky tail curls up in some stacks, and hangs or trails in 01, 02 and 05 (07 and 08 curled, per the catalogue) | disagree: carriage varies by pose; both are real Husky carriages |
| Carpus angle (standing, n=5) | 148 | wolf 160 | Husky reads 12 deg more flexed |
| Hock angle (standing, n=4) | 143 | wolf 140 | agree |
| Ear carriage vs skull (standing, n=4) | 33 | wolf 19 | within the middle half of both |
| Ear set (ear-angles NOTE, n=7) | 140 (119-162) | wolf 130 | agree |

## Where the photos, the keypoints and the yaml disagree
1. `./den species check` cannot use the StanfordExtra Husky row: its `keypoints:` tags read only the AwA unit-B table (`awa_unitB`), which has no Siberian husky. So `species/husky.yaml` carries no `keypoints:` or `skeleton:` tags, and the check only validates shape and units. The table above is the manual cross-check.
2. The skeleton table (`derived_skeleton_ratios.csv`) has no domestic dog row either, so bones cannot be tag-checked.
3. The Husky tail: the keypoints (0.35 of ear-to-tail-base) and the photos (curled) disagree with any hanging-tail number; the yaml gives both carriages.
