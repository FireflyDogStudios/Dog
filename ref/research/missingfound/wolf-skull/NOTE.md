# Wolf skull scans: sources, method and changes

Fetched and processed 2026-10-07 by Firefly (Claude) for Project Dog.

## Sources
Both are from the zoological collection of the Mammal Research Institute, Polish Academy of Sciences (MRI PAS), Białowieża, published on Open Forest Data (Dataverse).

| Wolf | Citation | Sex, collected | Dataverse file ids used |
|---|---|---|---|
| 170753 | Mammal Research Institute, Polish Academy of Sciences (2020). Canis lupus - 170753, Zoological collection of the Mammal Research Institute, PAS. Open Forest Data. doi:10.48370/OFD/LVT9AC | male; 2015-10-31, Białowieża Forest, Poland | 23962 skull+jaw (used), 292 skull and 13322 jaw (downloaded; the same meshes as in 23962) |
| 170555 | Mammal Research Institute, Polish Academy of Sciences (2022). Canis lupus - 170555, Zoological collection of the Mammal Research Institute, PAS. Open Forest Data. doi:10.48370/OFD/LNRMXW | female, adult; 2013-10-07, Białowieża National Park (European bison Show Reserve), Poland | 42560 skull+jaw (used), 42556 skull and 42557 jaw (downloaded; the same meshes) |

- Download: `https://dataverse.openforestdata.pl/api/access/datafile/<id>`. The raw STLs (23-106 MB) were kept in `/tmp` only and deleted afterwards.
- **Licence:** CC BY 4.0. Dataverse terms, same for both: "These data and documents are licensed under a Creative Commons Attribution 4.0 International license. You may copy, distribute and transmit the data as long as you acknowledge the source through proper data citation." The licence was checked on 2026-10-07 (by the caller; the dataset JSON was re-read here).
- **Sketchfab mirrors (also CC BY 4.0):**
  - 170753: https://sketchfab.com/3d-models/canis-lupus-gray-wolf-wilk-szary-6e525a6837c54e299ae5e86fcdc7f05b (the link is in the dataset description).
  - 170555: the caller reports a matching CC BY 4.0 Sketchfab page, but its URL is not in the dataset metadata and was not recorded here.
- **Other CC BY 4.0 wolf skulls, download needs a Sketchfab login (not fetched):**
  - "Wolf Skull - FW2415" (Oregon State), uid 1566e56e6a7e47f890b9b389457346a8, 466k faces.
  - "Wolf Skull" by tylercwilson, uid a2bc88557be8455fa0a46f8cd20d11cd, 1.5M faces, interior British Columbia.
  - Both are available with a login. They would give a third and fourth wolf, including a North American one.

## What changed (CC BY requires saying so)
1. **Reoriented** into the anatomical frame below. This is a rotation and translation only, with no scaling and no mirroring.
2. **Mandible repositioned:**
   - **170753:** the authors' articulated pose, hinged 2.0° open about the condyle axis because the lower and upper incisors overlapped by up to 2.6 mm.
   - **170555:** the scan has the mandible dropped by about 15-20 mm, so it was **fitted into occlusion** (see the method).
3. **Decimated** with quadric edge collapse (`fast-simplification` 0.2.0):
   - 170753: skull 509k → 140k faces; mandible 464k → 90k.
   - 170555: skull 967k → 140k; mandible 410k → 90k.
   - Saved as GLB. A few loose fragments (3 small teeth pieces in 170753 and about 40 debris pieces in 170555) were merged into the nearer bone.
4. **Derived** the measurements, landmarks, gape estimate and outlines in `data.json`.

## Files
| File | Size | What |
|---|---|---|
| `data.json` | 131 KB | Measurements, 3D and 2D landmarks, gape estimate, side and dorsal outlines, muscle lines, per wolf |
| `wolf_170753_skull.glb` | 2.53 MB | Decimated skull, closed-jaw frame |
| `wolf_170753_mandible.glb` | 1.62 MB | Decimated mandible, in its closed pose |
| `wolf_170555_skull.glb` | 2.55 MB | as above |
| `wolf_170555_mandible.glb` | 1.62 MB | as above (fitted pose) |

## Frames and conventions
- **Units:** mm everywhere, including the GLBs. GLB normally assumes metres, so scale by 0.001 if your loader expects metres. Scale check: the condylobasal lengths are 244.3 and 226.2 mm, inside the expected 230-260 band (the female is slightly below it).
- **3D frame:** right-handed.
  - x = forward (rostral), y = up (dorsal), z = the animal's **right**.
  - A "z = left" frame with x forward and y up would be left-handed, a mirror image. So z points right; negate z for z-left.
  - Origin = the **hinge centre**: the midpoint of the left and right mandibular condyle centres at closed jaw. The GLBs and `landmarks_3d_mm` use it.
  - `muscle_lines_3d_palate_frame` uses the same axes, with the origin at the palate plane (the hinge sits about 1.3-1.5 mm below it, 184/173 mm behind prosthion).
- **How the axes were set:**
  1. Principal axes of 60k surface samples of the skull.
  2. The midsagittal plane was chosen as the principal plane with the lowest mirror error, then refined by iterated mirror matching. The mean residual is 0.75-0.8 mm.
  3. Up is away from the mandible. Forward is toward the mandible's centroid along the long axis. Both were confirmed on renders: upright, facing right.
  4. **Pitch:** the **midline oral surface of the hard palate** is horizontal. It is a line fitted to the lowest midline (|z| < 1.5 mm) skull points in 2 mm bins between the choanae and the incisive region: x = 15-98 mm (170753) and 14-92 mm (170555). Residual SD is 0.5-0.7 mm. It turned both skulls about 8.3° snout-down from their principal axis.
- **2D side view:** drawn facing right with image y **down**. X = x − x_prosthion and Y = −(y − y_prosthion), so the origin is prosthion. `cbl` = mm / CBL.
- **2D dorsal view:** X as above; Y = z, so the animal's right side is down in the image.
- **Angles:** gape is the included angle between the upper and lower jaws, 0 = closed (occlusion).

## Method details
- **Tools:** `trimesh` 5.1, numpy, scipy, scikit-image, shapely and fast-simplification, run with `python3 -I`. The STLs were treated as untrusted data.
- **Condyle centres:**
  1. For each side, the caudal 16 mm of the hemimandible was projected to the side view and rasterised.
  2. A circle was fitted to the caudodorsal arc of the condylar head.
  3. The z centre is the middle of the head's 1st-99th percentile z range.
  4. Radius: 6.9-7.1 mm (170753) and 5.4-6.2 mm (170555).
  5. The hinge axis is the line through the two condyle centres.
- **Closed pose:**
  - **170753:** the articulated file shows the condyles seated in the fossae, with about 1-2 mm gaps against the retroarticular process and the fossa roof. A hinge scan of tooth overlap (nearest skull vertex, signed by its normal) showed incisor overlap at 0°, which cleared at about −2°, so −2.0° was used.
  - **170555:**
    1. A similarity ICP of its skull and mandible onto 170753's (scales 1.044 and 1.003) placed the mandible approximately.
    2. 170753's seated condyle centres were mapped into the 170555 skull, giving the glenoid estimate.
    3. The 170555 condyle centres and axis were moved onto them (5.3 mm shift, 1.2° turn).
    4. The mandible was lowered 0.6 mm until the condyles no longer overlapped the fossae.
    5. It was then hinged to the last angle with no more than 30 points overlapping by more than 0.3 mm (−0.25°).
    - Its **lower canines are broken**, so closure is set by incisor and cheek-tooth contact. Treat this pose as FITTED.
- **Landmarks:** automatic, as mesh extremes within stated regions, except those marked EST. Every name in `data.json` says what it is. The rules:
  - **Prosthion:** most rostral point within |z| < 0.75 mm.
  - **Akrokranion:** most caudal midline point above y = 20.
  - **Occipital condyle (caudal point), each side:** most caudal point with 5 < |z| < 22 and −20 < y < 12.
  - **Basion (approx):** most caudal midline point below y = 8.
  - **Staphylion (approx):** first midline bin, going rostrally, whose lowest point is within 2 mm of the palate plane.
  - **Zygion:** the extreme z points.
  - **Upper canine tip:** lowest point at x 95-125.
  - **Upper P4 tip:** lowest point at x 36-54 (the paracone of the carnassial). Checked against the tooth-row profile: M1 lies at x about 14-30 and P3 at about 64-86.
  - **Lower m1 tip:** highest point at x 28-46, below the coronoid.
  - **Lower canine tip:** highest point at x > 105 with |z| > 8. In 170555 this is a broken stump, possibly I3.
  - **Coronoid tip:** highest mandible point.
  - **Angular process:** most caudal point lying more than 12 mm below the condyle centre.
  - **Gonion ventrale:** lowest mandible point caudal of x = −35 (palate frame).
  - **Infradentale:** most rostral point within |z| < 0.75 mm.
- **EST landmarks (read by eye from 0.1 mm/px labelled renders, ±2-3 mm):**
  - Orbit rim in lateral projection: caudal (postorbital processes and ligament line), rostral (lacrimal rim), dorsal (frontal rim) and ventral (top of the zygomatic arch).
  - **Nasion:** the frontonasal suture is not visible on the scans. It was taken on the dorsal midline above the rostral orbital margin.
- **Gape:**
  - **Bony limit:** the mandible was rotated about the hinge axis (pure rotation) in 1° steps. A step counts as contact when mandible vertices overlap the skull by ≥ 0.3 mm. The region within 12 mm of the condyle centres was excluded, because it showed constant sub-millimetre noise.
  - **Muscle-line check:** the angle at which straight muscle lines reach 1.3, 1.5 and 1.7 times their closed length. Lines used: temporalis (sagittal crest at x = −50 to the coronoid tip; and akrokranion to the coronoid tip) and superficial masseter (rostral ventral zygomatic arch to the angular process).
  - The "condyle leaves the glenoid" criterion cannot trigger in a pure hinge. The coronoid never meets the zygomatic arch: it swings forward inside it.
- **Outlines:** as in `03-dog-model`, but finer.
  1. Projected triangles of a 300k/200k-face copy were rasterised at 0.25 mm.
  2. The raster was closed by about 1 mm and holes were filled.
  3. The outer contour was traced with marching squares.
  4. The contour was simplified with Douglas-Peucker at 0.5 mm.
  - Five outlines per wolf: skull side, mandible side, head (skull + mandible, closed) side, skull dorsal and mandible dorsal. A check plot showed all of them facing right, with every landmark on its bone.

## Doubts
- **One specimen per sex.** These are measurements of individuals, not population means.
- **Zoo origin?** 170555 was collected in the European bison **Show Reserve** of Białowieża NP, an enclosure area. It may have been a captive or enclosure wolf. Captive wolves' skulls can differ: shorter snouts, broader skulls. Its ZB/CBL of 0.62 is higher than 170753's 0.58 and wolf.yaml's 0.56.
- **170555's closed pose is reconstructed**, and its lower canines are broken. Its upper canines also look shorter (tips 23 mm below the palate, against 29 mm in 170753) and may be worn.
- **Landmark noise:** the nearest-vertex signed distance used for contact is approximate near thin bone; 0.3 mm is about the mesh spacing.
- **The gape estimate is a model,** not a measurement. The 1.5x and 1.7x muscle-stretch thresholds are recalled from the jaw-gape literature (Herring & Herring 1974), not verified here. Whole-muscle lines include tendon, so fibre stretch is larger than line stretch, and the estimates may run a little high. The pure hinge also ignores the forward slide of the condyle.
