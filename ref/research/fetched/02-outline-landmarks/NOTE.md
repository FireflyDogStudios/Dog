# 02-outline-landmarks: StanfordExtra (keypoints and silhouette outlines)

- **Source:** StanfordExtra. Biggs, Boyne, Charles, Fitzgibbon & Cipolla, "Who Left the Dogs Out? 3D Animal Reconstruction with Expectation Maximization in the Loop", ECCV 2020. Repo: https://github.com/benjiebob/StanfordExtra
- **Licence:** MIT since 2 Nov 2024 (README "Licensing" section and the repo's `LICENSE`, copied here as `LICENSE.txt`). The images are Stanford Dogs/ImageNet photos and are not covered. None are stored here.
- **Date fetched:** 2026-10-06.

## Status: only the in-repo sample can be fetched. The full file needs the Google form.
The README says: "Annotations are available by filling in the [Google form](https://forms.gle/sRtbicgxsWvRtRmUA). On completion, you will receive an email with the download link." The current version is `StanfordExtra_v12.json` (1 Feb 2021, about 12k dogs, 120 breeds, including dingo, dhole and African hunting dog).

Mirrors checked on 2026-10-06. None of them is a clean MIT copy:
- Repo raw files: `StanfordExtra_v12.json` is not in the repo (raw URLs return 404). The repo has no releases. Only `StanfordExtra_sample.json` (25 dogs) is in the repo.
- GitHub code search for `StanfordExtra_v12.json` found nothing. A search on the JSON's field names found only the sample and WLDO's Animal-Pose file. Code search does not index large files, so this check is not complete.
- Hugging Face dataset search ("StanfordExtra", "stanford_extra", "wldo", "dog pose", "dog keypoint", "animal pose") found no StanfordExtra copy. `stockeh/dog-pose-cv` is a different dataset (Apache, pose class labels only). `chenhaonan143/dog_poses` (MIT) has a blank card and no stated source, so it was not used.
- Graviti Open Datasets (gas.graviti.com/dataset/graviti/StanfordExtra) failed 3 times with a proxy 502. It needed a login anyway.
- Keras' keypoint example says the authors asked people not to share the JSON. That was before the MIT relicence.
- Ultralytics `dog-pose.zip` is AGPL-labelled. ref/research/keypoints/NOTE.md already covers it, and it was not stored.

## What is stored
`data.json` holds the 25 MIT sample dogs from `StanfordExtra_sample.json` (raw.githubusercontent.com/benjiebob/StanfordExtra/master/StanfordExtra_sample.json). The breeds are Rhodesian ridgeback 6, Weimaraner 6, Border terrier 6 and golden retriever 7. The **new** part is the silhouette outline. The keypoints already exist in `ref/research/keypoints/stanfordextra_sample.json`, which uses AwA-style names and has no outlines.

Format: `{breed: [{img, size:[w,h], bbox:[x,y,w,h], multi, kp:{name:[x,y,visible]}, outline:[[[x,y],...], ...]}]}`
- Coordinates are image pixels. The origin is top-left and **y points down**. Keypoints are rounded to 0.1 px and outline points are integers.
- `kp` uses StanfordExtra's own order and names (from `keypoint_definitions.csv`): `left/right_front/rear_paw|middle|top`, `tail_base`, `tail_end`, `left/right_ear_base`, `nose`, `chin`, `left/right_ear_tip`. Front leg: top = elbow, middle = carpus, paw. Rear leg: top = about the stifle, middle = hock, paw. Joints with [0,0,0] (eyes, withers and throat are never labelled) are left out. visible: 1 = visible, 0 = labelled but occluded.
- `outline` is a list of polygons, largest first. Each one is an external contour of the segmentation mask, and parts under 2% of the largest are dropped. The mask is a COCO compressed RLE string, decoded in pure Python (a port of pycocotools `rleFrString`, column-major). Contours come from `cv2.findContours` with RETR_EXTERNAL and are simplified with `cv2.approxPolyDP`, epsilon = max(1 px, 0.4% of the bbox diagonal). All 25 dogs come out as one polygon (about 70 points each, 1,734 in total). Checks: the outline's extent matches the annotated bbox within about 8 px, and 381 of 383 visible keypoints lie inside or within 6 px of the outline.
- `multi` = StanfordExtra's `is_multiple_dogs`.

## When the full file arrives
Run `PYTHONPATH=<dir with opencv-python-headless> python3 -I convert_stanfordextra.py StanfordExtra_v12.json data.json` (it is in this folder). It reads the sample and v12 formats the same way. At about 1.3 KB per dog, 12k dogs come to about 15 MB. That is under the 20 MB limit. Raise the epsilon if more room is needed.
