# SUMMARY: 08 Tafel 2 muscles (2026-10-07)

**Status:** done. Tafel 2 is downloaded and stored (rights: No known copyright) and registered to the Tafel 3 / 01-skin-offsets frame. The folder has a skin outline plus 25 muscle polygons, each in the plate frame, mirrored to face right and in withers-height fractions, with bulges where a profile bulge exists. Details are in `NOTE.md`, the numbers in `data.json`, the check in `check_overlay.png`.

**Registration (Tafel 2 → Tafel 3):** similarity fit, scale 1.0112, rotation −0.78°. The shift is about (−53, +1) px at the withers and (−9, −3) at the hind paw. Residuals are 2-5 px median on the legs and paws and 6 px on the back. The head has its own fit (+1.3° more, 0.9 px median).

## Muscles and bulges (fraction of withers height, measured from Tafel 3 bone lines)
| muscle (plate letter) | conf. | bulge | from |
|---|---|---|---|
| temporalis | clear | 0.007 | above skull top |
| masseter | clear | 0.017 | below mandible (mostly lateral in life) |
| cleidocephalicus (c) | mixed | 0.072 | above cervical arches |
| trapezius cervical (a) | clear | 0.116* | neck top above cervical arches |
| trapezius thoracic (a') | mixed | 0.018 | above thoracic spine tips |
| sternocephalicus (d) | inferred | 0.120* | ventral neck in front of vertebral bodies |
| sternohyoid zone (31/32) | inferred | 0.126* | same |
| triceps long head (f) | mixed | 0.133 max; 0.095 mid-arm; 0.053 above elbow | behind humerus |
| triceps lateral head (f') | mixed | 0.095 max; 0.075 mid; 0.039 above elbow | behind humerus |
| cleidobrachialis (c'') | inferred | 0.047 | in front of humerus |
| pectoralis superficialis (g) | inferred | 0.075 | in front of humerus (forechest) |
| pectoralis profundus (h, lower) | clear | 0.018 | below sternum (brisket) |
| forearm extensors | inferred | 0.033 | in front of radius |
| forearm caudal group | inferred | 0.016 | behind ulna |
| gluteus medius (p) | mixed | 0.044 | above pelvis line |
| gluteus superficialis (o'') | inferred | 0.042 | above pelvis line |
| tensor fasciae latae (o) | inferred | 0.127** | in front of femur |
| biceps femoris (q) | mixed | 0.065 | behind femur |
| semitendinosus (r) | mixed | 0.096 | behind femur (buttock) |
| gastrocnemius | inferred | 0.053 | behind tibia (calf) |
| cranial crus group | inferred | 0.037 | in front of tibia |
| omotransversarius (b), deltoid (e, e'), latissimus (h, upper) | mixed / clear | none | lateral only, no profile bulge |

\* This is the whole neck depth (other tissue included), not one muscle's thickness, and it depends on the neck pose.
\** This is mostly flank and fascia lata, so do not use it as a muscle bulge.

Semimembranosus is not visible on the plate.

## How Firefly should use it
- To grow muscle bulges on the rig, take each `bulge.max_over_withers_height` and place it on the named bone segment: `bone_foot_px_*` is where the bulge sits on the bone, and `at_muscle_px_*` is its peak.
- Use the `polygon_frac_facing_right` shapes as the reference silhouette lobes. They give x from the withers column and y above ground, in withers heights.
- Trust clear and mixed grades first. Treat inferred shapes as guides only.
- For skin-over-bone at the joints, keep using 01. This folder adds the soft lobes between the joints.
- Scale up for a dingo or wolf, which carry more coat and fat than this lean drawn dog (fur offsets in `../03-wolf-coat/` and `../04-dingo-coat/`).

## Doubts
- The plate has no printed key, so every identity is Scout's reading from standard dog anatomy and the Tafel 3 bone numbers.
- "h" is printed twice, on the trunk sheet and on the ventral chest band. Either the latissimus or the pectoralis profundus reading may be wrong.
- The forearm, crus, gastrocnemius, deltoid acromial part, sternocephalicus and gluteus superficialis borders are largely inferred.
- The Tafel 3 bone lines were traced by eye (±5-10 px), so bulges are good to about ±0.005-0.01 of withers height for clear and mixed muscles, worse for inferred ones.
- **Side finding:** Tafel 1 does not sit on Tafel 3 with a constant +31 px offset. Fitting the whole silhouette gives scale 1.008 and rotation −0.63°, with the offset running from +22 px at the withers to −9 px at the hind paw. Anything built on the "+31 px" offset (01-skin-offsets NOTE, Firefly's template warp) should be rechecked.
