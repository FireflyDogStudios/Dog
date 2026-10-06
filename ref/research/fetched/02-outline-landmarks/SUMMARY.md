# 02-outline-landmarks: summary

**Status: partly fetched.** The full StanfordExtra annotations (`StanfordExtra_v12.json`, MIT) are **only available through a Google form**: https://forms.gle/sRtbicgxsWvRtRmUA (the download link arrives by email). GrumpyDingo needs to fill it in. No clean MIT mirror was found: the repo has no copy or release, Hugging Face has no copy, Graviti was unreachable (502), and Ultralytics' copy is AGPL.

| What | Number | Source |
|---|---|---|
| Dogs in the full v12 set (form-gated) | about 12,000, 120 breeds | StanfordExtra README / paper |
| Dogs stored here (MIT sample) | 25 (4 breeds) | `StanfordExtra_sample.json` |
| Keypoints labelled per dog | 20 of 24 (eyes, withers, throat never labelled) | `keypoint_definitions.csv` |
| Outline points stored | 1,734 (about 70 per dog, 1 polygon each) | RLE masks, decoded and simplified here |
| Keypoints inside or within 6 px of the outline | 381 / 383 | check run here |
| Estimated size of the full conversion | about 15 MB | 1.3 KB per dog × 12k |

New here: silhouette outlines for the 25 sample dogs. `convert_stanfordextra.py` is ready to run on the full file once the form is filled in.
