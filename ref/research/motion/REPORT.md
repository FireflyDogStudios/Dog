# Dog motion data: research report

Research pass by a Firefly research agent, Oct 6, 2026. Saved here by Firefly from the agent's hand-back, because the agent could not write `.md` files itself.

## Licence hold (Firefly, Oct 6)
The only reachable real dog motion capture, the **MANN dog mocap** (Zhang, Starke, Komura, Saito, SIGGRAPH 2018), is **research and education only, no commercial use** (CC BY-NC 4.0 per AI4AnimationPy). The agent copied no BVH, but it did measure averaged joint curves from it (`curves/`). Because the game may be sold one day, Firefly moved those curves **out of the repo**. They are held in the session scratchpad until GrumpyDingo decides. The tables below summarise what they showed, as research notes. Nothing in the game or engine uses them.

`scripts/` (the agent's own BVH parser and gait analysis, `bvhfk.py`, `gaits.py`, `postures2.py`) and `behaviour_numbers.json` (28 entries with value, unit, source, confidence; a few are MANN-derived and marked so) stay.

## Datasets found

| Dataset | Where | Licence | Contents | Reachable | Stored? |
|---|---|---|---|---|---|
| **MANN dog mocap** | github.com/sebastianstarke/AI4Animation (SIGGRAPH_2018); data starke-consult.de/AI4Animation/SIGGRAPH_2018/MotionCapture.zip | Research/education only, NC (Univ. Edinburgh) | 1 large dog, about 30 min. BVH, Y up, metres. 27 joints (Hips, Spine, Spine1, Neck, Head, L/R Shoulder-Arm-ForeArm-Hand, L/R UpLeg-Leg-Foot, Tail, Tail1). **No jaw, ears or separate toes** | Official: blocked. Copy at github.com/Digital-Humans-23/motion-matching: yes | Derived curves held outside the repo |
| AI4AnimationPy (Meta) | github.com/facebookresearch/ai4animationpy | CC BY-NC 4.0 | Quadruped controller trained on MANN; links to the BVH | yes | no |
| RGBD-Dog (CVPR 2020) | github.com/CAMERA-Bath/RGBD-Dog | Academic, by signed form emailed to Prof. Cosker | 5 dogs: walk, trot, jumps, table step. Markers, BVH skeleton, mesh, video | Data on request only | no |
| Truebones Zoo (hand-keyed) | truebones.gumroad.com/l/skZMC; samples in github.com/mmlab-cv/BlendAnything, github.com/Anytop2025/Anytop | Unclear (Anytop withholds it over licensing) | 70+ animals incl. dog/coyote | Samples only | no |
| pan-motion-retargeting dog | github.com/hlcdyy/pan-motion-retargeting | Appears MANN-derived | 1 clip | yes | no |
| DigiDogs (GTA V synthetic) | cvssp.org/data/DigiDogs/ | Research, game-derived | 118 videos, 3D pose | blocked | no |
| SuperAnimal-Quadruped / Quadruped-80K | zenodo.org/records/14016777; HF mwmathis | Modified MIT, models research-only | Keypoint images, not motion | blocked | no |
| SyDog, InterPet4D (2026) | arxiv.org/pdf/2108.00249, arxiv.org/pdf/2607.10287 | see papers | Synthetic 2D poses; 4D human-pet interaction | blocked | no |
| Horse: VHDC | horse.cs.uni-bonn.de/vhdc-home.html | **CC BY-SA 3.0** | Horse mocap | blocked (403) | no; best permissive-ish option |
| Horse: PFERD | ncbi.nlm.nih.gov/pmc/articles/PMC11096353/ | check paper | 5 horses, 100+ markers, 10 cameras | blocked | no |
| Cat (keyed) | github.com/gearvrf/GearVRf-Demos (gvr-avatar/.../Cat) | Apache-2.0 repo, art provenance unclear | walk, sit, stand-up BVH | yes | no |
| Fischer et al. 2018, Sci Rep | nature.com/articles/s41598-018-34310-0 | CC BY | 3D hindlimb kinematics, 4 breeds, walk/trot | blocked | numbers only |

No dog dataset with a permissive licence and real joint data was reachable.

## How the curves were computed (method, for any future dataset)
1. Own BVH parser plus forward kinematics. Rotations are intrinsic ZXY, as declared.
2. Body forward = horizontal Hips → Neck (the root axes were unreliable); up = world Y. Segments projected onto the side-view plane.
3. Segment angle = atan2(up, fwd), proximal → distal joint: 0 = forward, −90 = straight down.
4. Joint angles, 180 = straight. Smaller = more flexed, except the carpus.
   - shoulder = 180 + (hum − scap)
   - elbow = 180 − (rad − hum)
   - carpus = 180 + (paw − rad); above 180 = hyperextended
   - stifle = 180 + (tib − fem)
   - hock = 180 − (met − tib)
   - hip = cranial trunk axis vs femur (no pelvis bone in the data)
5. Foot contact: toe below its 5th-percentile height + 5 cm and slower than 0.6 m/s horizontally.
6. Strides: from one left-hind touchdown to the next. Kept: 0.2–1.6 s long, faster than 0.3 m/s, turning under 20°, exactly one touchdown per foot.
7. Gait class from footfall phases (circular statistics):
   - trot: RF ≈ 0, LF ≈ 0.5
   - pace: LF ≈ 0, RF ≈ 0.5
   - walk: LF 0.12–0.38, duty ≥ 0.5
   - asymmetric hind pair: canter, or gallop at ≥ 2.6 m/s, split by lead
8. Resampled to 101 points; mean and SD taken.
9. Transitions: time for 5 → 95% of the hip/shoulder height change. Wag bouts: ≥ 7 alternating tail-yaw peaks (≥ 15° prominence), half-periods < 0.6 s.

**Caveats:**
- One dog, breed unknown, hip joint height 0.46 m (close to a Carolina Dog).
- The skeleton is a mocap solve. The shoulder angle in particular is off in absolute terms (about 85–120° vs 110–140° in the literature), so use changes around the mean.
- The walk is slow, the trot has 8 strides, and there is no toe/jaw/ear data.

## What the curves showed
Per-leg own cycle, left side. Min–max of the mean curve in degrees, range of motion in brackets.

| Gait | m/s | Stride s | Lift-off % LF/LH | Shoulder | Elbow | Carpus | Hip* | Stifle | Hock | Hip bob cm |
|---|---|---|---|---|---|---|---|---|---|---|
| walk | 0.64 | 0.91 | 64/66 | 83-108 (25) | 89-129 (39) | 131-206 (75) | 29-71 (42) | 87-116 (29) | 126-143 (18) | 1.1 |
| pace | 0.94 | 0.71 | 61/57 | 85-110 (25) | 87-134 (47) | 118-212 (93) | 28-76 (48) | 83-120 (37) | 125-147 (22) | 1.0 |
| trot | 1.87 | 0.50 | 41/34 | 86-118 (32) | 80-149 (69) | 105-229 (124) | 26-80 (53) | 66-131 (65) | 111-146 (35) | 4.2 |
| gallop | 3.07 | 0.46 | 24/21 | 81-121 (39) | 78-149 (70) | 126-229 (103) | 12-76 (64) | 51-124 (73) | 104-156 (52) | 9.7 |

*Hip = femur vs trunk axis.

These agree with the literature (walk ranges: shoulder 30–33°, elbow 49–53°, carpus 80–91°, hip 33–36°, stifle 34–37°, tarsus 32–34°; trot carpus 110–120°). The carpus hyperextends in stance (about 205–230°). In swing the elbow flexes deeply and the carpus folds. At the trot the stifle and hock show a double hump.

Footfall phase after left-hind touchdown:

| Gait | LF | RH | RF |
|---|---|---|---|
| walk | 0.20 | 0.53 | 0.65 |
| trot | 0.44 | 0.51 | 0.00 |
| pace | 0.03 | 0.49 | 0.53 |
| gallop | 0.14 | 0.83 | 0.37 |

Head and tail:
- Walk: head pitch swings about 10°, head height 1.8 cm, tail sways ±15°.
- Trot: head height 2.8 cm, tail sways ±35°.
- Gallop: head travels 13 cm vertically, neck pitches about 30°.

## Behaviour numbers (from `behaviour_numbers.json`)

| Behaviour | Value | Source | Confidence |
|---|---|---|---|
| Relaxed wag | 1.4 Hz (1.26–1.57), about 96° peak-to-peak, bouts about 5 s | MANN-derived | medium |
| Wag range | 1–4 Hz, max about 5 Hz; a wag counts from 20° peak-to-peak | PMC12344452; PMC9356099; dl.acm.org/doi/fullHtml/10.1145/3702336.3702340 | medium |
| Wag side bias | Swings more to the right for positive stimuli, to the left for negative | Quaranta 2007, cell.com/current-biology/fulltext/S0960-9822(07)00949-9 | high |
| Rest breathing | 15–30/min awake; 6–25/min asleep | vcahospitals.com home-breathing-rate-evaluation; evolutionvet chart | high |
| Panting | 5.33 ± 0.7 Hz (about 320/min), at the chest resonance of 5.28 Hz | Crawford 1962, journals.physiology.org/doi/abs/10.1152/jappl.1962.17.2.249 | high |
| Blink | 11.5 ± 2.4/min; mesocephalic 9.9 | researchgate 251690906 | high |
| Wet-dog shake | Labrador 4.3–4.5 Hz, Chihuahua 6.8 Hz, f ∝ M^−0.22 (hero about 4.8–5 Hz); skin ±90°, spine ±30°; about 4 s sheds 70% of the water | Dickerson, Mills, Hu 2012, pmc PMC3481573 | high/medium |
| Sniffing | about 5 Hz in all sizes; bursts at 0.5–1.5 Hz | Craven 2010, pubmed 20007171 | high |
| Max gape | 44.0 ± 4.1°; incisor gap 107 ± 30 mm (134 mm over 25 kg) | Thomson 2021, J Vet Dent; PMC4923261 | high |
| Yawn | about 2 s | search summaries | low |
| Play bow | mean 2.25 s, min 0.33 s (n = 414) | Byosiere 2016 | high |
| Head tilt | No angle published; each dog keeps one side; word-learner dogs tilt in 43% of trials vs 2%; game estimate 15–35° | Sommese 2021 | estimate |
| Ears (DogFACS) | EAD101 forward, 102 pulled together, 103 flattened, 105 downward; mood poses are estimates | researchgate 353647503; mdpi 2076-3417/13/16/9254 | high / estimate |
| Posture transitions | stand → sit 0.61 s; sit → stand 0.67 s; stand → lie 1.87 s (0.9–4.1); lie → stand 0.64 s; sit ↔ lie about 0.75 s | MANN-derived | medium |

## Gaps
- Licence: no permissive dog mocap was reachable.
- No jaw, ear, toe or spine-flex data.
- The trot is thin (8 strides) and the walk is slow.
- Primary papers are on blocked hosts, so some numbers come from search summaries.
- No published head-tilt angle, ear angles by mood or Carolina Dog tail carriage.
