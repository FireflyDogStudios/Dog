# 08-wild-keypoints: canid keypoints from AP-10K and APT-36K

Fetched 2026-10-06. Coordinates only, no images. Use for ratios and pose ranges, never for tracing. Credit both datasets in `CREDITS` if anything built from them ships.

## Sources

| | AP-10K | APT-36K |
|---|---|---|
| Title | AP-10K: A Benchmark for Animal Pose Estimation in the Wild (NeurIPS 2021 Datasets and Benchmarks) | APT-36K: A Large-scale Benchmark for Animal Pose Estimation and Tracking (NeurIPS 2022 Datasets and Benchmarks) |
| Authors | Hang Yu, Yufei Xu, Jing Zhang, Wei Zhao, Ziyu Guan, Dacheng Tao | Yuxiang Yang, Junjie Yang, Yufei Xu, Jing Zhang, Long Lan, Dacheng Tao |
| Year | 2021 (arXiv 2108.12617) | 2022 (arXiv 2206.05683) |
| Repo | https://github.com/AlexTheBad/AP-10K (commit 181b1a04755e4dc6fe5616ef7a88496f47bfe228) | https://github.com/pandorgan/APT-36K (commit 366ba0109bb9586cac793d1b150d5f4261b77cfa) |
| File fetched | `ap-10k.zip` (3.40 GB) from https://drive.google.com/file/d/1-FNNGcdtAQRehYYkGY1y4wzFNg4iWNad/view (downloaded via https://drive.usercontent.google.com/download?id=1-FNNGcdtAQRehYYkGY1y4wzFNg4iWNad&export=download&confirm=t). Only `ap-10k/annotations/ap10k-{train,val,test}-split1.json` were read, with HTTP range requests on the zip's central directory (no images downloaded). | `apt36k_annotations.json` (47.2 MB, annotations only) from the README's "individual annotation files" link https://1drv.ms/u/s!AimBgYV7JjTlgTuYdjjtYON3sxEZ?e=5deTDn (OneDrive anonymous share; fetched via the OneDrive shares API). The 23.2 GB `APT-36k.zip` (https://1drv.ms/u/s!AimBgYV7JjTlgcZ9zLyl5KnM3dKMgg?e=uaaLz5) was not downloaded. |
| sha256 of raw file | train-split1 d4d7e0f0d2db63bc175568faa434b5108b3e160e300020a72ce0108cd7faef96; val-split1 54fd15a6ebbda9d6cfa3a53310d52e66352753c46ea2a87a8d601afb8021d967; test-split1 9924a43095f91296c04d5c5c81fa487af3ae94db17631479e1520d2d16e20ad4 | 39df79fc6131c27acc87089ac98210ffaa61b4cf3aa915eded63abc91f0582e1 |
| Licence | **CC BY 4.0**: README "The dataset follows CC-BY-4.0 license" and repo `LICENSE` = CC BY 4.0 legal code (copied as `LICENSE-AP10K.txt`). Note: the annotation JSON's own `licenses` field says "The MIT License"; both are permissive, CC BY 4.0 (attribution) is the stricter and is followed. | **MIT**: README "This project is under MIT licence." The repo ships **no LICENSE file**, so there is no `LICENSE-APT36K.txt`; the statement is from README.md at the commit above. The JSON has no licence field. |

## What was extracted and how
- AP-10K: split1 train + val + test is a full partition of the 10,015 labelled images (checked: union = 10,015 image ids); splits 2 and 3 are re-partitions of the same images and were not needed. Kept every annotation whose category is in family Canidae: `dog`, `fox`, `wolf`. Category `arctic fox` exists in the category list but has **0 labelled instances** (its images are only in the unlabelled extension). AP-10K has no hyena, jackal, coyote, dhole, African wild dog, dingo or raccoon dog. `fox` is not split by species (photos are mostly red fox).
- APT-36K: 30 categories; kept `dog` (id 2), `fox` (26), `wolf` (29). No other canids, no hyenas. Image paths were stripped of the authors' Windows drive prefix (`D:\Animal_pose\AP-36k-patrN\`), leaving e.g. `29wolf/v3c2/frame7.jpg`. Video frames: 15 frames per clip, 80 clips per species, `video` and `track` ids kept so poses can be followed through a clip.
- Converted with a Python script (json only); float coordinates rounded to 0.1 px.

## Format of `data.json` (compact JSON, ~3.3 MB)
`{"_meta": {...}, "<species>": [ {src, img, bbox, kp, ...}, ... ] }`, species keys `dog`, `fox`, `wolf`.
- `src`: `ap10k` or `apt36k`. `img`: the dataset's image file name (no image stored).
- AP-10K entries also carry `split1` (train/val/test) and `family`. APT-36K entries carry `video`, `track`.
- `bbox`: `[x, y, w, h]` in pixels.
- `kp`: `{name: [x, y, v]}` in pixels, origin top-left, **y down** (image coordinates). `v` = 2 visible, 1 labelled but occluded; unlabelled points (v = 0) are omitted.
- Keypoint order (both datasets, identical 17-point skeleton): left_eye, right_eye, nose, neck, root_of_tail, left_shoulder, left_elbow, left_front_paw, right_shoulder, right_elbow, right_front_paw, left_hip, left_knee, left_back_paw, right_hip, right_knee, right_back_paw.
- Skeleton (1-based, from the dataset): [1,2] [1,3] [2,3] [3,4] [4,5] [4,6] [6,7] [7,8] [4,9] [9,10] [10,11] [5,12] [12,13] [13,14] [5,15] [15,16] [16,17].
- Anatomy caution: the names are the datasets' own. In practice "shoulder" is marked at the top of the foreleg (around the elbow / point of shoulder), "elbow" near the carpus, "hip" at the top of the hind leg (around the stifle), "knee" near the hock. No ears, no tail tip, no withers. Treat as AwA-style top / middle / paw, as `ref/research/keypoints/REPORT.md` did for StanfordExtra.

## Not stored
- **Animal Kingdom** (https://github.com/sutdcv/Animal-Kingdom, commit 23320fb38a9e4b81adc7dd3f4b19fa32ca69d683): no licence for the dataset anywhere in the repo (only the bundled SlowFast code has its own Apache LICENSE); the README sends downloads through a Google Form (https://forms.gle/NipvmReDKaD5zUEw6). Licence unclear and form-gated, so nothing stored. It remains the only found source with hyena, jackal, coyote, dingo, African wild dog and desert fox keypoints; ask the authors.
