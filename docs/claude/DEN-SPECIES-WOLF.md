# Wolf: species sheet (the prototype of the species creator)

Drafted Oct 6, 2026 by Firefly from measured keypoints; **not approved yet**. Numbers come from `./den species --sheet wolf` (AwA-Pose keypoints in `ref/awa-pose`, MIT, about 44 profile photos of wolves against about 160 of medium domestic dogs). Re-run that command to reproduce them.

## The method: style-preserving
Our dogs are drawn in a style (head and ears bigger than life), so a wolf is not its raw photo numbers. A wolf is **the new hero's drawing times (wolf ÷ medium domestic dogs)**, measured feature by feature. The photo set has no Carolina Dog or dingo, so German shepherd, collie and dalmatian stand in for "a medium dog". The method keeps our style and changes only what makes a wolf a wolf.

All lengths are fractions of the skull-to-tail-base length; in drawing units the new hero's is 23.2.

| Feature | What it is | Wolf ÷ dog | hero2 now | Wolf target |
|---|---|---|---|---|
| Ear | base to tip | **0.73** | 0.30 | 0.22 (5.1 units, from 7.0) |
| Gape | mouth corner to front of lip | **0.76** | 0.24 | 0.18 (4.2 units) |
| Muzzle | eye to nose | 0.92 | 0.32 | 0.29 (6.8 units) |
| Head | ear base to nose | 0.94 | 0.40 | 0.38 (8.7 units) |
| Chest depth | back to belly, mid-body | **1.10** | 0.44 | 0.49 (11.4 units) |
| Hind leg | stifle, hock, paw | **1.11** | 0.47 | 0.52 (12.1 units) |
| Tail | base to tip | **1.11** | 0.55 | 0.61 (14.2 units) |
| Front leg | elbow, wrist, paw | 1.00 | 0.55 | the same |
| Height | withers to ground | 1.00 | 1.00 | the same |
| Neck | skull to withers | 1.01 | 0.32 | the same |

The bold rows are the real differences: about a quarter smaller ears, a shorter-looking mouth line, a deeper chest, about a tenth longer hind legs and tail. These held within a few percent at three strictness levels of the "profile photo" filter. The muzzle and head differences are small (under 10%), so treat them as nudges.

## Traits the keypoints cannot measure (from general knowledge; for GrumpyDingo to judge)
- **Tail carriage:** hangs low and straight, bushy. The new hero carries a curled hook, so this is the biggest change in silhouette.
- **Coat:** grey agouti with a cream underside and legs, a darker saddle along the back, a pale face mask. Coat colours are a palette, not a shape change.
- **Ruff:** a thicker mane of fur at the neck and shoulders, which makes the neck read heavier.
- **Ears:** rounded tips, set wide; smaller relative to the head than a dingo's.
- **Feet:** large.

## The jaw (in this prototype)
- The lower jaw becomes its own rig joint, hinged near the mouth corner below the eye, so it can open for a pant, a yawn, a bark or a bite. A tongue part sits inside, seen only when the mouth is open.
- The wolf's gape (mouth corner to lip) is the measured 0.18, so the hinge sits a little further forward than the new hero's mouth corner.
- The hood already stops above the lip, so gear does not block the jaw. The collar sits on the neck and is not affected.
- Built once in the base head, so every later species inherits a jaw.

## How it gets built (after approval)
1. A species creator in the rig: hero2's parts scaled per feature by the ratios above (ears, gape, chest, hind leg, tail), plus the tail carriage and the coat palette.
2. The jaw joint, then its pant and yawn motions.
3. A `wolf` row in `GEAR.MOUNTS`, then `compile_mounts.py`: all twelve armor pieces refit through the normal pipeline.
4. `./den lint` and the gait sweep on the wolf, then a Species tab on the bench.
