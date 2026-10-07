# 08 Ellenberger-Baum Tafel 2 (superficial muscles, left lateral)

Fetched and measured 2026-10-07 by Scout (Priority 4, item 8 of `docs/claude/DEN-SCOUT-REQUEST-2026-10-07.md`).

## Source and rights
- **Work:** Ellenberger, Baum, Dittrich & Münch, *Handbuch der Anatomie der Tiere für Künstler*, dog volume (*Anatomie des Hundes*, 1. Auflage, Leipzig, ca. 1911-25). This is Tafel 2 (Fig. 2): the superficial muscles of the dog's left side, with the dog facing left. It is the same dog and pose as Tafel 1 and Tafel 3.
- **Page:** https://search.library.wisc.edu/digital/AK5A3XN25SYOAV8V (UW-Madison Digital Collections, title "Tafel 2").
- **Image:** `https://asset.library.wisc.edu/iiif/1711.dl%2FBIRFFJXL47ZDE8J/full/full/0/default.jpg`. It downloaded on the first try (HTTP 200, 1,192,628 bytes).
- **Rights:** the library page states **"No known copyright"** (rightsstatements.org/vocab/NKC/1.0/), checked 2026-10-07. The plate was published before 1931, so it is public domain in the US. No credit is legally required.
- **File:** `tafel2_muscles_left-lateral.jpg` is the unmodified full-resolution download: 3451 × 2850, greyscale, 1.19 MB. Its md5 is in `data.json`. The UW perforation stamp sits over the hind paws.
- The download was treated as untrusted data. It is only an image, with no embedded text.

## Frame
- All registered coordinates use the **Tafel 3 plate frame**, the same frame as `ref/research/fetched/01-skin-offsets/data.json`: 3451 × 2850, y down, dog facing left.
- Mirrored (facing right): x' = 3450 − x.
- Fractions:
  - fx = (x_right − 2320) / 1837, where 2320 is the withers column, and positive values point toward the head.
  - fy = (2626 − y) / 1837, the height above ground.
- Withers height is 1837 px and ground is y = 2626 (both from 01).

## Method
1. **Registration**
   - Contour points were taken on both plates with a dark-pixel scan on a median-filtered image (grey < 150): back line, belly, cranial edges of the far fore- and hindleg, and the pad bottoms of all four paws.
   - These points were aligned with ICP (nearest neighbour, 25 px gate) using translation, similarity and affine models. The belly was left out because the muscle plate draws it differently.
   - **Result (similarity):** scale 1.0112 and rotation −0.78°. The effective shift is about (−53, +1) px at the withers, (−28, +21) at the forepaws and (−9, −3) at the near hind paw. A translation-only fit (−30, −7) leaves the forepaws ~30 px off, so it was rejected.
   - **Residuals (median / 90th percentile):** paws 1.6-4 / 4-14 px, leg fronts 2-5 / 7-14 px, back 6 / 18 px. The back is drawn with fascia folds. The belly (19 px) was not fitted.
   - **Head:** registered separately with a chamfer fit to the Tafel 3 lines. Its extra rotation is +1.3°, with residuals 0.9 px median and 4.2 px at the 90th percentile. This transform is used only for temporalis and masseter.
   - The overlays were checked by eye: the registered Tafel 2 silhouette sits on the Tafel 3 outline everywhere except the belly and the tail.
2. **Outline**
   - Silhouette mask: threshold, close, fill holes and keep the largest component.
   - Removed by hand: label glyphs outside the skin and the paw shadows.
   - Restored by hand: the thin ventral-neck skin line, traced on 15 anchors snapped to the darkest pixel, and the withers skin fold.
   - The contour was then simplified with Douglas-Peucker at 1.5 px.
3. **Muscles**
   - Each muscle was identified by eye on gridded zooms (25-50 px grids), using the plate's letters.
   - Borders were placed by hand on the drawn muscle borders, densified to 3 px spacing and snapped to the strongest edge within ±6 px along the normal (Gaussian gradient, σ = 3, smoothed).
   - They were then simplified (Douglas-Peucker, 1.5 px) and transformed into the Tafel 3 frame.
   - Each polygon carries a confidence grade:
     - **clear:** the drawn border was followed along its whole length.
     - **mixed:** part follows a drawn border and part is inferred.
     - **inferred:** the border is mostly inferred from fibre direction and shading.
4. **Bulges**
   - Bone lines were traced on Tafel 3 by eye (±5-10 px): the humerus cranial and caudal borders, radius, ulna, sternum, thoracic spine tips, cervical dorsal and ventral lines, pelvis line, femur, tibia, skull top and mandible.
   - Bulge = the maximum signed perpendicular distance from the bone line to the muscle polygon on the outward side, within the bone line's extent, divided by 1837.
5. **Check:** `check_overlay.png` (0.96 MB, reduced to 1600 px wide) shows the registered Tafel 2 blended with Tafel 3. It marks the outline (dark blue), the bone lines (blue), the muscle polygons (colour; thin = inferred) and the bulge measurements (red).

## Precision
- Registration: about 3-6 px over the legs and back after the similarity fit (≈ 0.002-0.003 of withers height).
- Clear borders: ±3 px after snapping. Inferred borders: ±10-20 px.
- Bone lines: ±5-10 px.
- Bulges are therefore good to roughly ±0.005-0.01 of withers height for clear and mixed muscles, and worse for inferred ones.
- The plate has **no printed key**; only letters and numbers appear on it. The identities in `plate_key_transcription` are Scout's reading. One letter, **h**, is printed twice, on the trunk sheet and on the ventral chest band, so one of those two identities is uncertain.
- The animal is one lean, short-coated, mastiff/Great Dane-type dog drawn by an artist. The plate is illustrative (confidence B), not population data.

## Side finding
The same ICP fit of Tafel 1 to Tafel 3 gives scale 1.008 and rotation −0.63°. The implied Tafel 1 − Tafel 3 x offset is +22 at the withers, +7 at the forearm and −9 at the hind paw. The "+31 px" in 01 is therefore only roughly true along the back. This folder does not depend on it.
