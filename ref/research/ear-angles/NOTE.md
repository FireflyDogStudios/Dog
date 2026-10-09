# Ear angle in 2D side view, measured from keypoint datasets (Firefly, Oct 7, 2026)

No published canid ear angles exist (fact-check Q11; `missingfound/face-ear-and-wild-keypoints`; a DeepSeek analysis GrumpyDingo shared agrees). But our game is a **2D side view**, and the 2D side-view angle is exactly what photo keypoints give. So we measure it ourselves.

**Method:** StanfordExtra v12 (MIT; `ref/research/fetched/02-outline-landmarks/data.json`). Angle at the ear base, from the forward skull line (ear base to nose) to the ear line (ear base to ear tip), in degrees, positive = rotated up and back. Profile-ish heads only (the nose's horizontal offset from the ear base is at least 1.3 × its vertical offset); left-facing heads mirrored. Each visible ear counts once. Mixed poses and moods, and 3D rotation, widen the spread.

| Breed | n ears | Median | Middle half |
|---|---|---|---|
| basenji | 37 | 136° | 105–161 |
| Alaskan malamute | 27 | 140° | 73–156 |
| Siberian husky | 7 | 140° | 119–162 |
| Eskimo dog | 12 | 126° | 55–143 |
| German shepherd | 18 | 148° | from 121 |
| Norwegian elkhound | 52 | 126° | 100–157 |
| beagle (drop ears, control) | 45 | −63° | −80 to −36 |
| basset (drop ears, control) | 52 | −60° | −81 to −45 |

- Prick-eared breeds sit at **126–148°**, which agrees with the wolf photos (AwA-Pose: about 130°) and the value in `species/wolf.yaml` (`ear_set` 130). The drop-ear controls come out negative, as they should, so the method works.
- **Dingo:** only 7 of 108 dingo photos have ear tips labelled, too few. The basenji (a pariah-type prick-eared dog) is the nearest stand-in.
- Re-run the code in Firefly's Oct 7 session log, or ask Firefly; it is a 20-line script over the JSON.
