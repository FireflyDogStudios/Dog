# 08-wild-keypoints: summary

**Status: partly fetched.** AP-10K (CC BY 4.0) and APT-36K (MIT) annotations downloaded (annotation JSON only, no images) and the canid entries converted to `data.json`. But these two sets only contain **dog, wolf and (red) fox**: no coyote, jackal, dhole, African wild dog, dingo, arctic/fennec/grey fox, hyena or raccoon dog. AP-10K lists "arctic fox" as a category but it has 0 labelled instances.

| species | AP-10K instances (images) | APT-36K instances (frames, clips) |
|---|---|---|
| dog | 1129 (1000) | 2275 (1193, 80) |
| wolf | 261 (200) | 1670 (1195, 80) |
| fox | 222 (200) | 1521 (1200, 80) |
| arctic fox | 0 | – |
| hyenas, jackal, coyote, dhole, African wild dog, dingo, raccoon dog | – | – |

17 keypoints (eyes, nose, neck, tail root, 3 per leg), y down, `[x,y,v]`. Total 7,078 instances, 3.3 MB.

Blocked / not stored: **Animal Kingdom** (no dataset licence, Google Form download): the only source found with hyena, jackal, coyote, dingo and African wild dog; needs the authors' permission. APT-36K ships no LICENSE file (MIT stated in its README only). No host failures.
