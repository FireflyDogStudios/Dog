# 01 Skin-over-bone offsets (Ellenberger, Baum, Dittrich & Münch, dog plates)

Fetched 2026-10-06.

## Source used
- **Work:** *Handbuch der Anatomie der Tiere für Künstler*, dog volume. The plate footer reads "Ellenberger, Baum, Dittrich & Münch, Anatomie des Hundes, 1. Auflage", published in Leipzig by Dieterich'sche Verlagsbuchhandlung, Theodor Weicher. Hermann Dittrich drew the plates. UWDC dates them ca. 1911–1925.
- **Scans:** University of Wisconsin–Madison Libraries Digital Collections (UWDC), *Veterinary Anatomical Illustrations* collection:
  - Tafel 1, exterior, left lateral: https://search.library.wisc.edu/digital/ATC7FOZKECJ5FE9D
  - Tafel 2, superficial muscles, left lateral: https://search.library.wisc.edu/digital/AK5A3XN25SYOAV8V (not measured, not stored)
  - Tafel 3, skeleton drawn inside the body outline, left lateral: https://search.library.wisc.edu/digital/AHFYCAGUWKQA5Y83
  - Full-resolution images (3451 × 2850, greyscale) came from the UWDC IIIF server: `https://asset.library.wisc.edu/iiif/1711.dl%2F<ID>/full/full/0/default.jpg`. The IDs are TUNHELIQZJOUV8J (Tafel 1), BIRFFJXL47ZDE8J (Tafel 2) and 5CIIJ6SEYKWOG8S (Tafel 3).
- **Licence:** public domain.
  - UWDC labels the plates "No known copyright" (http://rightsstatements.org/vocab/NKC/1.0/).
  - Wikimedia Commons has the same Tafel 3 as `File:Dog anatomy lateral skeleton view (full).jpg`. It is tagged PD-Art / PD-old-auto-expired (deathyear 1946) and carries the CC Public Domain Mark.
  - The plates were published before 1931, so they are PD in the US. Ellenberger died in 1929 and Baum in 1932. Münch's death year was not verified.
- **Not stored:** the plates themselves were left out of the repo (the session brief allows public-domain images only for the Muybridge item). Re-download them at full size from the IIIF URLs above; the dog faces LEFT on all plates.
  - The UW library perforation stamp is visible on Tafel 1 and Tafel 3. No LICENSE file ships with the source.

## Archive.org items checked and not used
- `atlasofanimalana0000well`: *An Atlas of Animal Anatomy for Artists*, Dover, 1949 (the English edition). It is a lending-library item (`access-restricted-item: true`, collections inlibrary/printdisabled), so it is borrow-only. Not used: it is a later edition with new matter, and its copyright status is not clear.
- `an-atlas-of-animal-anatomy-for-artists-dover-anatomy-for-baum-hermann-brown-lewi`: the 1956 Dover 2nd edition, with new plates and a new preface by L. S. Brown. It is a third-party upload of a copyrighted edition (a shadow-library file). Not used.
- `atlas-animal-anatomy-for-artists`: an anonymous 2024 user upload with unknown provenance. Not used.
- `lo10386503_to0325_880_0000000`: *Handbuch … 1: Das Pferd*, Public Domain Mark. It covers the horse only, and no dog plate volume of the German original was found on archive.org.
- `bub_gb_4JFmAAAAMAAJ`: *Handbuch … Textband*, 1900, Public Domain Mark. It is text only, with no dog plates. A few dog standing joint angles from its OCR text are copied into `data.json` as a bonus (`textband_1900_standing_angles_dog`). These are OCR readings and were not checked against the page images.

## What was extracted and how
- **Plate measured:** Tafel 3. The skeleton and the skin outline are drawn on the same plate at the same scale, so no cross-plate registration was needed.
  - The Tafel 3 outline matches the Tafel 1 exterior silhouette once the scan offset is applied (Tafel 1 x = Tafel 3 x + 31 px, y + 0). The back line agrees within 3 px between x = 1300 and 2300, and the ventral chest within 4 px.
  - The head is posed differently on Tafel 1 (raised), so the head numbers come from Tafel 3 only.
- **Method:**
  1. Downloaded the full-resolution plates.
  2. Viewed zoomed crops with 10 px grids to identify each bone landmark by eye, using the plate's own numbers (5 greater tubercle, 8 olecranon, 10 carpus, 11 accessory carpal, 14 sternum, 14' manubrium, 15 os coxae, 20 patella, 24 calcaneus).
  3. Located the exact line positions with a dark-pixel run finder (PIL, grey < 110) along the row or column through each landmark.
- **Offset:** the distance from the bone landmark to the skin outline, measured vertically (up/down) or horizontally (forward/back) as listed per landmark, divided by withers height.
- **Withers height:** ground to the skin top of the withers = 2626 − 789 = 1837 px.
  - Ground (y 2626) is the mean of the lowest pad lines of the near forepaw (2629–2631) and near hindpaw (2622–2623).
  - The far paws sit higher on the plate (2577 and 2545) because of the slightly raised viewpoint, so the near paws were used.
- **Coordinates:** image pixels, y down.
  - `*_px_plate`: as on the plate (the dog faces left).
  - `*_px_facing_right`: mirrored, x' = 3450 − x.
  - `bone_height_over_withers_height` = (ground − y) / withers height.
- **Precision:**
  - Lines are read to ±1–2 px (1 px = 0.00054 of withers height).
  - The error in identifying each landmark is given per landmark, from 3 to 10 px (about 0.002–0.005 of withers height).
  - The nose bone tip (±10 px) and the ischium (±6 px) are the least certain. The hock area is overprinted by the library perforation dots.
- **The animal:** one drawing of one large, short-coated, lean dog with cropped ears (mastiff/Great Dane type). It is an artist's lithograph made from anatomical study, not a measured specimen. Treat the numbers as illustrative and of good quality (confidence B), not as population statistics. Offsets will be larger in a heavier-coated or fatter dog (wolf, dingo) at the back, croup and chest, and roughly the same at the elbow, carpus, hock and stifle, where the skin lies close over the bone.

## Key results (fraction of withers height)
withers spines 0.027 up · scapula top 0.035 up · point of shoulder 0.032 forward · manubrium 0.019 forward · brisket 0.021 down · olecranon 0.010 back · carpus 0.007 back / 0.009 forward · patella 0.009 forward · hock 0.007 back / 0.016 up · croup (iliac crest) 0.012 up · ischium 0.030 back · skull top 0.017 up · occiput 0.008 back · nose 0.030 forward · chin 0.012 down.
