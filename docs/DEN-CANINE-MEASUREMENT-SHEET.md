# 2D side-view canine measurement sheet (concept template)

Shared by GrumpyDingo on Oct 6, 2026, as a guide to **what kinds of measurements we need**. His note: don't trust the numbers, but the concepts are good. Every number below is illustrative and unsourced; real values come from `ref/research/` and `./den species`. This is the vocabulary that a species sheet and the species creator should use.

## 1. Coordinate system (2D side view)
- Origin (0, 0) at the tip of the nose. X horizontal, positive toward the tail; Y vertical, positive up.
- Scale: withers height = 1.0, or head length = 1.0.
- Pick one facing direction and keep it. (The Den's rigs face right and use y down; convert when comparing.)

## 2. Silhouette outline points, clockwise from the nose
| # | Landmark | Description |
|---|---|---|
| 1 | Nose tip | Rostral-most point |
| 2 | Nose bridge | Top of muzzle |
| 3 | Stop | Dip between muzzle and forehead |
| 4 | Forehead | Top of skull curve |
| 5 | Occiput | Back of skull |
| 6 | Ear base | Where ear attaches |
| 7 | Ear tip | Top of ear |
| 8 | Ear back | Rear edge of ear |
| 9 | Neck top | Dorsal neck line |
| 10 | Withers | Highest back point |
| 11 | Back | Mid-spine |
| 12 | Loin | Lower back |
| 13 | Croup | Pelvis top |
| 14 | Tail set | Base of tail |
| 15 | Tail tip | End of tail |
| 16 | Tail underside | Bottom curve of tail |
| 17 | Rear pastern | Back of hind leg |
| 18 | Rear paw | Ground contact, hind |
| 19 | Hind hock | Heel joint |
| 20 | Stifle front | Front of knee |
| 21 | Belly line | Bottom of abdomen |
| 22 | Flank | Where belly meets hind leg |
| 23 | Front paw | Ground contact, front |
| 24 | Front pastern | Front of foreleg |
| 25 | Carpus | Wrist joint |
| 26 | Elbow | Back of foreleg |
| 27 | Chest front | Prosternum |
| 28 | Chest bottom | Deepest ribcage point |
| 29 | Throat | Under jaw |
| 30 | Jaw line | Bottom of mandible |
| 31 | Chin | Front-bottom of jaw |
| 32 | Upper lip | Muzzle bottom |

Connecting these gives the full side silhouette.

## 3. Key landmarks, normalised (illustrative mesocephalic, square dog)
Head length (nose tip to occiput) = 1.0, facing left, origin at the nose tip.

| Landmark | X | Y | | Landmark | X | Y |
|---|---|---|---|---|---|---|
| Nose tip | 0.00 | 0.00 | | Chest front | 1.00 | −0.10 |
| Stop | 0.45 | +0.10 | | Chest bottom | 1.60 | −0.45 |
| Eye centre | 0.35 | +0.15 | | Belly | 2.20 | −0.40 |
| Occiput | 1.00 | +0.20 | | Elbow | 1.70 | −0.45 |
| Ear base | 0.65 | +0.25 | | Carpus | 1.70 | −0.90 |
| Ear tip | 0.60 | +0.55 | | Front paw | 1.75 | −1.30 |
| Throat | 0.55 | −0.15 | | Stifle | 2.60 | −0.55 |
| Withers | 1.80 | +0.15 | | Hock | 2.75 | −0.95 |
| Back | 2.30 | +0.12 | | Rear paw | 2.80 | −1.30 |
| Croup | 2.70 | +0.10 | | Tail set | 2.80 | +0.05 |
| Tail tip | 3.60 | +0.10 | | | | |

## 4. Vertical reference (plumb) lines
Nose 0.00 · eye 0.35 · occiput 1.00 · shoulder joint 1.50 · rib (deepest chest) 1.60 · withers 1.80 · hip joint 2.55 · tail set 2.80 · ground (horizontal) −1.30.

## 5. Angles (posture and breed type)
| Angle | Between | Typical (illustrative) |
|---|---|---|
| Head | Muzzle axis vs skull axis | 10–30° |
| Neck | Neck line vs back line | 30–50° |
| Shoulder | Scapula vs humerus | 90–110° |
| Elbow | Humerus vs radius | 130–150° |
| Front pastern | Radius vs pastern | 160–180° |
| Hip | Pelvis vs femur | 90–100° |
| Stifle | Femur vs tibia | 110–130° |
| Hock | Tibia vs metatarsus | 130–150° |
| Tail carriage | Tail vs topline | 0–90°+ |
| Ear carriage | Ear vs skull | 0–90° |

## 6. Proportions to lock down
| Ratio | Formula | Meaning (illustrative) |
|---|---|---|
| Body length : height | (prosternum → ischium) / withers height | square = 1.0 |
| Head length : height | head length / withers height | ~0.4 |
| Muzzle : skull | muzzle length / skull length | 1:1 mesocephalic |
| Chest depth : height | chest depth / withers height | ~0.5 |
| Leg length : height | elbow height / withers height | ~0.5 |
| Tail length : height | tail length / withers height | 0.5–0.7 |
| Neck length : head | neck length / head length | 0.7–1.0 |

## 7. What 2D loses and must fake
Width (chest, skull, muzzle: shown by outline curvature) · only one eye (the far eye may peek) · the far ear behind · near and far legs offset in x · tail volume as outline width · fur as silhouette bumps (ruff, feathering).

## 8. Workflow
Grid (head length = 1 unit) → plot landmarks → connect with splines → far side offset ~5–10% in x and shaded → check ratios → fur silhouette outward from the skeletal points → verify against the plumb lines.

## 9. Thickness (depth) data, for a future 3D or shading pass
The side profile plus a stack of cross-sections (half-width at set X positions) reconstructs a full form by lofting, displacement or an ellipse stack. Minimum believable set: 32 outline points, about 15 body and 10 head cross-sections, 7 diameters per limb, 3 for the tail (about 75 numbers).

Illustrative width-to-height ratios: muzzle 0.6, skull 1.0, neck 0.7, chest 0.9, loin 0.6, hip 0.8, upper foreleg 0.7, forearm 0.6, pastern 0.5, thigh 0.9, shank 0.5, tail base 0.5.

Breed modifiers on width (head, chest, limb, tail): brachycephalic ×1.4, 1.3, 1.2, 1.0; mesocephalic ×1; dolichocephalic ×0.8, 0.9, 0.7, 0.8; scent hound ×1.2, 1.1, 1.1, 1.0; spitz ×1.1, 1.1, 1.1, 1.5.

Tips: thickness is not silhouette (a bulldog is thin in profile but wide); measure at joints, the widest points on limbs; the head needs 8–10 slices; the tail tapers fast; ears have their own base and tip widths; fur adds 5–15% to widths; real dogs are not perfectly symmetric.

## For the Den (Firefly's notes)
- Sections 2–6 are the schema a species sheet should fill: the 32 outline points, the joint landmarks, the plumb lines, the ten angles and the seven ratios, each with a real source.
- Section 9 is not needed for the flat 2D rig today, but it is the route to shading, a turnaround or a later 3D pass.
