# Wolf skull: summary

Two real grey-wolf skulls (MRI PAS, Białowieża, CC BY 4.0) were measured from 3D scans. Both come with decimated meshes in the closed-jaw pose. Sources, frames and the method are in `NOTE.md`; all the numbers are in `data.json`.

## Key numbers against wolf.yaml
| Measure (mm) | 170753 male | 170555 female | wolf.yaml |
|---|---|---|---|
| Condylobasal length (CBL) | **244.3** | **226.2** | 253.5 (Law 2025) |
| Total length (akrokranion–prosthion) | 252.7 | 236.6 | |
| Zygomatic breadth | **142.6** | **139.5** | 142.5 |
| ZB / CBL | 0.58 | 0.62 | 0.56 |
| Skull height above the palate plane | 80.0 | 75.7 | |
| Skull height including the upper canines | 110.0 | 99.1 | |
| Palate length (staphylion–prosthion) | 128.6 (0.53 CBL) | 115.9 (0.51) | |
| Snout length, rostral orbit to prosthion (EST) | 106.1 (0.43 CBL) | 100.4 (0.44) | |
| Neurocranium length, basion–nasion (EST) | 135.3 (0.55 CBL) | 128.7 (0.57) | braincase 0.42 (C, "unconfirmed") |
| Orbit in side view, width × height (EST) | 30 × 31 | 27 × 29 | |
| Mandible length, condyle–infradentale | 188.4 (0.77 CBL) | 177.6 (0.79) | |
| Ramus height, gonion ventrale–coronion | 79.5 | 68.2 | |
| Upper canine tip below the palate | 29.4 | 22.9 (worn?) | |
| Jaw joint (hinge centre): behind prosthion / height vs palate | 184.1 / −1.3 | 173.5 / −1.5 | |

Notes on the table:
- **170753 matches wolf.yaml well.** Its zygomatic breadth is the same and its CBL is 4 % shorter, so it can stand as a reference wolf.
- **170555 is smaller and broader-faced,** and may be an enclosure wolf (it came from the European bison Show Reserve; see `NOTE.md`).
- **wolf.yaml's braincase 0.42 is not basion–nasion.** Basion–nasion is 0.55-0.57 CBL. The yaml column is more likely a braincase length measured to the frontoparietal region, so keep it at confidence C.
- **The jaw joint sits on the palate plane:** the hinge is level with the upper tooth row (within 1.5 mm), at 0.75-0.77 CBL behind the nose tip.

## Gape (EST)
- **Bone does not stop the jaw.** In a pure hinge about the condyles, the first bony contact comes at **99°** (170753) and **114°** (170555): the back of the ramus meets the ear and retroarticular region. The coronoid never touches the zygomatic arch; it swings forward inside it.
- **Muscle stretch is the real limit.** The temporalis line (sagittal crest to coronoid tip) reaches 1.5 × its closed length at 40-54° (means 46° and 50°) and 1.7 × at 56-79° (means 64° and 73°). The 1.5× / 1.7× thresholds are recalled from Herring & Herring 1974, not checked.
- **Estimate: natural maximum about 46-50°, hard maximum about 64-73°.** This agrees with live dogs (44 ± 4°, Thomson 2021) and the dingo FE model maximum (65°, Bourke 2008), and supports wolf.yaml's `max_gape` of 50 natural and 65 hard; keep the confidence at B/EST. There is still no measured wolf gape.

## How Firefly should use this
- **Head shape:** `outlines.head_closed_side.cbl` (or the separate `skull_side` and `mandible_side`) is the side silhouette of the bones, facing right, y down, with the origin at the nose tip (prosthion). Scale it by the hero's skull length; for the wolf, CBL = 1. Skin and fur sit outside it: the head offsets in `ref/research/fetched/01-skin-offsets` (skull top 0.017, nose 0.030, chin 0.012 of withers height) are a starting point.
- **Jaw rig:** pivot the lower jaw at `landmarks_side_2d.tmj_hinge_centre`: about (−0.75 CBL, 0.03-0.04 CBL below the nose-tip line), level with the tooth row, not low on the cheek. Draw `mandible_side` with its own outline, then rotate it about that point. Use 0-25° for barks and pants, 44-50° as the natural maximum (yawn), and 65° only as a hard cap.
- **Teeth (170753; 170555 has broken lower canines):** upper canine tip about (−0.11, +0.08) CBL; lower canine tip about (−0.08, −0.05); upper carnassial (P4) tip about (−0.40, +0.06); lower m1 about (−0.43, −0.02).
- **Face landmarks (EST):** orbit centre about (−0.50, −0.23) CBL and nasion about (−0.44, −0.25): place the eye there. Coronoid tip about (−0.66, −0.22): the top of the jaw-muscle bulge under the zygomatic arch.
- **Top view:** `skull_dorsal` (zygomatic flare at about 0.7 CBL behind the nose) for overhead or three-quarter work.
- **3D:** the GLBs (units mm, not glTF's usual metres; x forward, y up, z = the animal's right, origin at the jaw hinge) open in three.js or Blender. Rotate the mandible GLB about the z axis through the origin to open the jaw. They are CC BY: credit the MRI PAS citations in `LICENSE.txt` and in CREDITS if anything derived ships.
- **More specimens:** two more CC BY wolf skulls need a Sketchfab login: Oregon State FW2415, and tylercwilson's from British Columbia. GrumpyDingo could download them to add a North American wolf.

## Doubts
- 170555's closed pose is reconstructed (its scan has the jaw dropped 15-20 mm; fitted onto 170753's joint positions); its tooth numbers are weaker.
- 170753's articulated scan was over-closed (incisors overlapping 2.6 mm); opened 2° to clear them.
- Orbit rim, nasion, basion and staphylion were read by eye (±2-3 mm).
- Whether the scans are mirrored could not be confirmed; left/right labels assume not.
- Frame note: z = the animal's right (x forward, y up, z left would be a mirror image).
