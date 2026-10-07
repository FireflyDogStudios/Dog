# Face, ear and wild-canid keypoints: summary (2026-10-07)

| Gap | Status | In short |
|---|---|---|
| A. Ear motion (angles, durations) | **Partly** | No measured ear angle exists for any canid. Got a cat proxy for pinna turn and twitch timing, and ear direction by mood in dogs (ordinal and event data). |
| B. Jaw during bark, howl, yawn, pant, play face, snarl | **Partly** | No jaw angle in any behaviour (one 2024 preprint says this is undescribed). Got call timings (bark rhythm, howl length), the play-face muscle set and opening grades, and the DogFACS stages for mouth poses. |
| C. Wild-canid keypoints with a permissive licence | **Not found** | Nothing usable. DogFLW is CC BY-NC. Animal3D's licence is conflicting (and it only adds arctic fox and wolf). Quadruped-80K is non-commercial. AnimalWeb has no licence. Roboflow was blocked. No keypoint file was written. |

## Key numbers (all in `numbers.json`)
| Quantity | Value | n | Source (licence) | Conf. |
|---|---|---|---|---|
| Pinna turn toward an 18–23° target | ~10° (up to ~20°) | 5 cats | Populin & Yin 1998 (CC BY-NC-SA, fact only) | C (cat proxy) |
| Pinna short-latency twitch | ~25 ms after sound onset; near ear moves more | 5 cats, 249 trials | same | C |
| Ears back under fear (ear-base score 1–5) | Cohen's d = 0.68; strongest fear sign | 36 dogs | Gähwiler 2020 (CC BY) | B |
| Ear direction by mood | ears up and together (EAD102) = positive; flattened back (EAD103) = frustration | 29 dogs | Bremhorst 2019 (CC BY) | B |
| Blink vs eye closure | < 0.5 s vs ≥ 0.5 s | definition | DogFACS via Bremhorst 2019 | C |
| Dog vocal rhythm (bark, growl, howl, snarl, whine) | 2.0 ± 1.1 per s | 143 sequences, 30 dogs | Déaux 2024 (CC BY) | A |
| Wolf howl duration | 5.21 ± 2.49 s; whine 1.2 s; squeak 3.5 s | 238 howls | Sadhukhan 2019 (CC BY) | A |
| Howl mouth | tongue flat at onset, then tip arched up and held | 31 howls | Ekström 2024 preprint (CC BY) | C |
| Wolf play face (ROM) | AU101 + 109 + 112 + 116 + 25 + 27 (brow up, lip corners back, lower lip down, mouth stretched) | 30 breeds + wild wolves | Maglieri 2025 preprint (CC BY) | B |
| ROM opening grades; mimicry delay | slightly open (lower front teeth tips show) to wide open; copied within 1 s | 49 dogs | Palagi 2015 (CC BY) | B |
| Yawn definition | mouth wide open ≥ 1 s | definition | Gähwiler 2020 (CC BY) | C |

The numbers already known from `fetched/09-face-and-ear` still hold and are not repeated: max gape 44° (dog) and 65° (dingo model), yawn 2.04 s, panting up to 374 per min, chewing at 2.59 Hz.

## Still needs our own reference clips (public-domain or own footage, measured frame by frame)
1. **Ear angles:** pinna angle against the skull line for neutral, alert/prick, flattened, rotated and drooped ears in a prick-eared dog (Carolina Dog, dingo, Shiba or husky). Also the time for one flick and one flatten. Side view and three-quarter view, 50–60 fps.
2. **Jaw angle per behaviour:** the mandible–skull angle at peak for a bark, a howl, a yawn, panting (resting and after a run), a small and a wide play face, and a snarl (lip lift height, lip-corner pull-back). Also open and close times inside one bark cycle (the cycle is about 0.5 s).
3. **Wild canid proportions and poses** (coyote, jackal, dhole, African wild dog, hyena, raccoon dog, dingo): no licensed keypoints exist, so mark our own on public-domain or CC0/CC BY photos (e.g. Wikimedia Commons, USFWS/NPS public-domain images), using the AwA-Pose 39-point scheme.

## Blocked or not stored
- Roboflow Universe: Cloudflare 403 on three tries; the API needs a key.
- DogFLW: CC BY-NC 4.0. Quadruped-80K: academic only. Animal3D: "All Right Reserved" inside the annotation files, against an MIT repo licence, plus ImageNet and SMAL terms. AnimalWeb, Columbia Dogs and Animal Pose: no licence stated.
- Martvel & Riemer 2025 landmark data: "on request" only.
- Animal Kingdom: not touched (non-commercial).
