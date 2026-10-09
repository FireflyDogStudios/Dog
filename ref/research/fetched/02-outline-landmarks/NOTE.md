# 02-outline-landmarks: StanfordExtra (keypoints and silhouette outlines)

- **Source:** StanfordExtra. Biggs, Boyne, Charles, Fitzgibbon & Cipolla, "Who Left the Dogs Out? 3D Animal Reconstruction with Expectation Maximization in the Loop", ECCV 2020. Repo: https://github.com/benjiebob/StanfordExtra
- **File:** `StanfordExtra_v12.json` (20,523,623 bytes, dated 2021-01-27), plus the split index files `train/val/test_stanford_StanfordExtra_v12.npy` (dated 2021-02-01).
  - These came in `stanfordextra_v12.zip` (7,964,832 bytes). It holds only those 4 files: no licence, terms or readme text, and no zip comment.
- **How obtained:** the full annotations are only given out through the authors' Google form (https://forms.gle/sRtbicgxsWvRtRmUA), which emails a download link. GrumpyDingo filled in the form and downloaded the zip by hand on **2026-10-06**. An agent unzipped it in `/tmp` and converted it the same day. Nothing from the zip is stored here except the converted numbers below.

## Licence
**MIT.** Re-checked on 2026-10-06 against the live repo.
- README, "Licensing" section, verbatim:
  > (c) Benjamin Biggs, Oliver Boyne, James Charles, Andrew Fitzgibbon and Roberto Cipolla. Department of Engineering, University of Cambridge 2020
  >
  > As of 02-NOV-2024, this dataset is now MIT licensed. Enjoy!

  The standard MIT permission and warranty text follows it.
- `LICENSE` (https://raw.githubusercontent.com/benjiebob/StanfordExtra/master/LICENSE) is the standard MIT License text, "Copyright (c) 2024 Benjamin Biggs, Oliver Boyne, James Charles, Andrew Fitzgibbon and Roberto Cipolla. Department of Engineering, University of Cambridge 2020". It is byte-identical to `LICENSE.txt` here.
- The zip itself carries no licence or terms text, and the form-gated file is the same dataset the README relicensed. The images are Stanford Dogs/ImageNet photos and are **not** covered by the licence. No images are stored; `img` is only the Stanford Dogs file id.

## Format of data.json
`{breed: [{img, size:[w,h], bbox:[x,y,w,h], multi, split, kp:{name:[x,y,visible]}, outline:[[[x,y],...], ...]}]}`
- Coordinates are image pixels. The origin is top-left and **y points down**.
  - Keypoints are rounded to 0.1 px.
  - bbox and outline points are integers.
- `kp` uses StanfordExtra's own order and names (from its `keypoint_definitions.csv`): `left/right_front/rear_paw|middle|top`, `tail_base`, `tail_end`, `left/right_ear_base`, `nose`, `chin`, `left/right_ear_tip`.
  - Front leg: top = elbow, middle = carpus, paw.
  - Rear leg: top = about the stifle, middle = hock, paw.
  - Joints with [0,0,0] are left out. The eyes, withers and throat are never labelled in v12.
  - **Cleaned Oct 7 (Atlas, `tools/atlas/clean_stanfordextra.py`).** The file as first stored did not follow the line above: 696 dogs in 110 breeds carried 7,777 placeholder entries `[NaN, NaN, 0]` (15,554 `NaN` tokens), which is not valid JSON (JavaScript's `JSON.parse` fails) and made the occluded count look like 10,229. They are removed now; no other value changed (checked entry by entry), and the file parses as strict JSON. After the clean-up: 165,902 keypoints, 163,450 visible and 2,452 occluded; median 13 per dog, maximum 20. Likely cause: `convert_stanfordextra.py` keeps a joint when `v > 0 or x or y`, and a NaN coordinate counts as true in Python, so a joint stored as NaN with v = 0 passes the filter (I read the code; I did not rerun it on the original zip, which is not in the repo). A fix would be to also skip a joint whose x or y is NaN. The script is left as stored, for Firefly or Scout to change.
  - visible: 1 = visible, 0 = labelled but occluded.
- `outline` is a list of polygons, largest first. Each is an external contour of the segmentation mask.
  - The mask is a COCO compressed RLE string, decoded in pure Python (a port of pycocotools `rleFrString`, column-major).
  - Contours come from OpenCV `findContours` (RETR_EXTERNAL) and are simplified with `approxPolyDP`, epsilon = max(1 px, 0.4% of the bbox diagonal).
  - Parts under 2% of the largest polygon's area are dropped.
- `multi` = StanfordExtra's `is_multiple_dogs`. It is true for only 1 of the 12,538 dogs.
- `split` = train / val / test, from the `.npy` files. Each holds integer indices into the JSON list. They are disjoint and together cover 0..12537 exactly: train 6,773, val 4,062, test 1,703.
  - Note that some breeds are entirely in val, including dingo, dhole, Mexican hairless, Pembroke and Cardigan, and African hunting dog except for 1. The split is by image, not a clean breed hold-out.

## Method
`convert_stanfordextra.py` (in this folder; updated: it adds the split, integer bboxes, built-in checks and options `--eps`, `--kpdec`, `--parts`). It was run as:
```
PYTHONPATH=/tmp/item02/pylib python3 -P convert_stanfordextra.py StanfordExtra_v12.json data.json <dir with the .npy files>
```
OpenCV 5.0.0 (opencv-python-headless) and numpy 2.5.3 were pip-installed to `/tmp/item02/pylib`, outside the repo. `-P` is used instead of `-I` because `-I` ignores PYTHONPATH. It takes about 15 s. The defaults (eps 0.004, keypoints at 0.1 px) gave **14,486,768 bytes** in one file, under the 15 MB target, so no split into parts was needed.

## Checks (all 12,538 dogs)
- **Counts:** 12,538 dogs in 120 breeds, 66 to 183 per breed (table in SUMMARY.md). 790,725 outline points, about 63 per dog.
- **Missing outlines:** 60 dogs have an empty outline (their mask decodes to nothing usable). 419 dogs have more than one polygon (for example a tail or leg cut off by an occluder).
- **Outline vs bbox:**
  - The largest side error is a median of 5 px; 73.7% of dogs are within 8 px. The 95th percentile is 98 px.
  - The IoU of the outline's extent with the bbox is a median of 0.956; 92.6% of dogs are at or above 0.8, and 131 are below 0.3.
  - Where they disagree, the bbox is the odd one out. Visible keypoints fall inside the outline's extent 99.8% of the time, but inside the bbox 98.3%. In 193 dogs the bbox misses most keypoints; the first entry, a Japanese spaniel, is one. Trust the outline and keypoints over `bbox`.
- **Keypoints vs outline:** 161,482 of 162,696 visible keypoints (99.25%) lie inside or within 6 px of the outline.
- **Sample:** the 25 sample dogs stored earlier reappear unchanged. For example, Rhodesian ridgeback n02087394_10591 has the same bbox, keypoints and outline; it is in the test split.
