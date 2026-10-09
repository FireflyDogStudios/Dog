# Fact-check of the open questions 1–13

Research pass by a Firefly research agent, Oct 6, 2026; saved here by Firefly from its hand-back. Companion file: `answers.json`. The questions are in `docs/claude/DEN-OPEN-QUESTIONS.md`.

**How reliable this is.** WebFetch was blocked on every publisher host tried (PMC, PubMed, PLOS, Frontiers, AVMA, Springer, IntechOpen, ResearchGate, showsight, siriusdog and others). All literature numbers come from **search-result snippets**, not full texts. Raw-data numbers were computed by the agent from Law et al. 2025 (GitHub) and the AwA-Pose keypoints already in the repo.

Convention: included angle between the two bones, 180 = straight; elevation is degrees above horizontal.

## Main findings
- **The scapula problem comes from the Anatolian elbow, not the scapula sources.** Every scapula and shoulder source agrees: scapula about 60°, shoulder 108–120°. That only works with an elbow of about 140–150° when the radius is vertical. The one Anatolian elbow value of 125° is what pushes the scapula to 81–85°.
- **The Anatolian goniometry reads low against radiographs** on every joint:

  | Joint | Anatolian | Radiographs |
  |---|---|---|
  | Elbow | 125 | 137–145 |
  | Stifle | 128 | 143–145 |
  | Tarsus | 126 | 133 |
  | Hip | 94 | about 122 |

- **The croup is about 43°, not 30°** (radiographs of standing dogs).
- **The hip joint sits about 60% back from the iliac crest, not 45%.** The ilium is about 1.5 times the ischium.
- **Pelvis length 0.80 × femur is confirmed** (wolf 0.82, from Law's raw data).
- **The ear setting in `skeleton.py` is wrong-signed.** `ear_set` 70 makes the ear lean 32° forward of vertical. Wolf photos show it leaning about 23° back, which is about 130° from the forward skull axis.
- **The bones predict a live withers height of about 767 mm** (Harcourt 1974 regressions on the wolf bones). So the 695 mm shortfall is mostly posture. Fixing the elbow and scapula adds about 35–40 mm.

## Answers

| Q | Topic | Sources (key values) | Agree? | Confidence | Recommended |
|---|---|---|---|---|---|
| 1 | Scapula layback | Elliott cineradiography, Harvard MCZ: 30° off vertical (60° elevation), shoulder 108–115°. Fischer & Lilje *Dogs in Motion*: about 30°. Elliott and Brown via ShowSight: shoulder ~120° (retrievers, herding), ~130° (sighthounds). Anatolian goniometry (BMC Vet Res 2026): shoulder 119.8, poor reliability. Humphries 2020 (PLOS ONE): ~107–120 if flexion = 180 − included | partly; the conflict is the elbow | B | scapula elevation **60°** as a firm target; let the shoulder come out at about 110–120° |
| 2 | Standing elbow | Weight-bearing radiographs (Anat Rec 2022, doi 10.1002/ar.24937): **137 ± 13**. Rohwedder (IntechOpen): modelled at 145, standing range 110–159. Anatolian goniometry: 124.8 (the outlier). Derived from Elliott's scapula and shoulder: 138–150 | partly | B | **140°** |
| 3 | Standing hip | Anatolian: 94 (landmark lines). AJVR 2026 standing radiographs, 17 dogs: about **122** (derived). Others use other conventions | no | C | leave as an outcome, expected 95–120; the current 106 is fine. In standing dogs the femur is only about 10° off vertical |
| 4 | Standing stifle | Giansetto 2022 (Vet Sci 9:644): **145**. AJVR 2026: **142.9** (derived). Anatolian: 128. PLOS 2020: ~136–146 | partly; the radiographic sources agree | B | **142°** |
| 5 | Hock and metatarsus | AJVR 2026: hock **132.5** (derived), metatarsus about 21° off vertical, paw ahead. Anatolian: 126. AwA wolf photos: hock 150–156, metatarsus tilt median −13° (n = 15). PLOS 2020: ~122–154 | no | C | hock about **140**, metatarsus tilt **0 to +10°** (paw slightly ahead). A vertical metatarsus is a show-stance convention |
| 6 | Croup, pelvis, hip joint | AJVR 2026: ilio-ischial axis **43.2 ± 4.3°**. Conformation texts: croup 30–40 (palpated). Law 2025 raw data: pelvis/femur **0.82**, sacrum **0.060** × presacral. Pelvic radiograph studies (Riser 1975): ilium:ischium about 3:2, so the hip joint at **0.59–0.62** from the crest | partly | B | `croup_angle` **40** (no wolf value), `pelvis_length` **0.80** (keep), `acetabulum_at` **0.60**, `sacrum_length` **0.06**. The hip joint lies *below* the crest–ischium line, by about 0.15 × pelvis length (the agent's estimate) |
| 7 | Paw | WikiVet and Vet Pathol 1995: phalanx ratios only. Derived from the field hind foot (200 mm) − MT3 (112) − heel (35–40): toes about 0.45–0.55 × MT3 | partly | C | keep `digit_height` 0.22 and `digit_length` 0.55; no canid toe-joint height found |
| 8 | Withers gap | Miller's Anatomy (via secondary sites): the dorsal scapula lies just below the tip of the T1 spine; T2–T3 are the tallest. Law raw data: wolf T1 spine 70–72 mm | yes, qualitatively; no number exists | C | **0.025** × withers (about 19 mm). The 0.10 neck-root drop is supported by T1 height (0.11–0.12 × withers) |
| 9 | Neck and head | AwA wolf standing photos: withers-to-skull line **26°** above the ground (IQR 17–42, n = 15); skull axis about **−19°**. X-ray studies of resting cats, rabbits and rodents (Vidal 1986; Graf 1995): the bony neck is near vertical and S-shaped. Taylor, Wedel & Naish 2009: living animals hold the neck raised. Semicircular-canal studies: the head is pitched 20–30° nose-up at rest | partly | C | `neck_elevation` **40** (keep, or derive it from the photo neck line); `skull_pitch` **20** (from 12) |
| 10 | Skull, jaw, gape | Law raw data, 22 canids: jaw joint to canine / CBL = **0.708** (wolf), so the jaw joint sits about 0.22–0.25 × CBL ahead of the condyles. Slovak and Eurasian wolf craniometry: mandible/CBL about **0.77–0.80**. Thomson 2021: dogs **44 ± 4°**. Front Vet Sci 2016: dogs over 25 kg open 134 ± 19 mm (about 41–57° for a wolf jaw). Dingo model (PLOS ONE 2008): 65° maximum; fox cadavers 80–84° | partly | B | `mandible` **0.78**; jaw joint about 0.23 × CBL ahead of the condyles (check the rig's "occiput" point, which uses 0.29); natural gape **50°**, hard limit **65°**. No wolf gape measurement exists |
| 11 | Ear set | AwA wolf photos: ear line 113° from the forward horizontal (about 23° back of vertical). The keypoint report's 19–27° was measured from the ear-base-to-nose line pointing back, not the skull axis | partly | C | **about 130°** from the forward skull axis relaxed, about 105° alert. `ear_set` 70 currently draws the ear leaning forward |
| 12 | Tail | Wolf vertebral formula: about **20** caudals (often incomplete in specimens). Miller's: dog average 20 (6–23). *Canids of the World*: 14–23. wolf.org ethogram: relaxed tail hangs near vertical, brushing the hocks. AwA wolf photos: −75° | yes | B | caudal **20**, carriage **−75°** |
| 13 | Field height vs skeleton | Harcourt 1974 regressions on the Law wolf bones: **767 mm** mean. Fact sheets: 660–840. Shoulder guard hairs 90 mm, up to 130 (Heptner & Naumov) | partly | B | expect about **735 mm** from the bones after the Q1/Q2/Q4 fixes, plus about 25 mm of pads and skin. The gap is mainly posture. The coat adds 60–90 mm visually, but not on a measuring stick |

**How Q13's gap splits:**
- humerus 232 × (sin 55° − sin 35°) = +57 mm;
- scapula 175.5 × (sin 60° − sin 81°) = −21 mm.

## Suggested changes

| Setting | Current | Suggested |
|---|---|---|
| `scapula_elevation` | 60, weak target | 60, firm target |
| `elbow_standing` | 125 | 140 |
| `stifle_target` | 136 | 142 |
| `hock_standing` | 150 | about 140, with metatarsus tilt 0 to +10 |
| `croup_angle` | 30 | 40 |
| `acetabulum_at` | 0.45 | 0.60 |
| `sacrum_length` | 0.07 | 0.06 |
| `withers_gap` | 0.035 | 0.025 |
| `skull_pitch` | 12 | 20 |
| `mandible` | 0.80 | 0.78 |
| `ear_set` | 70 | about 130 |
| `caudal` | 21 | 20 |
| `max_gape` | 44 | 50 (hard limit 65) |

Keep as they are: `pelvis_length` 0.80, `neck_elevation` 40, the 0.10 neck-root drop and the toe ratios. Leave the hip angle as an outcome.

## Main sources
- Elliott cineradiography (Harvard MCZ), via breedingbetterdogs.com/article/more-meets-eye
- Fischer & Lilje, *Dogs in Motion*: vdh.de/en/dogs-in-motion
- Anatolian goniometry, BMC Vet Res 2026: link.springer.com/article/10.1186/s12917-026-05436-5
- Humphries et al. 2020, PLOS ONE e0239832
- Weight-bearing radiographs, Anat Rec 2022: doi 10.1002/ar.24937
- Rohwedder, "Biomechanics of the Canine Elbow Joint", IntechOpen
- AJVR 2026 standing radiographs (ajvr.26.04.0154)
- Giansetto et al. 2022, Vet Sci 9:644
- Riser 1975 pelvic radiographs; CTVR 2017 pelvic genetics
- Law et al. 2025 IOB raw data, github chrisjlaw
- Harcourt 1974 limb-to-height regressions
- Thomson et al. 2021 J Vet Dent; Front Vet Sci 2016 mandibular range of motion; Wroe et al. 2008 PLOS ONE (dingo)
- Vidal, Graf & Berthoz 1986, Exp Brain Res 61:549; Graf et al. 1995, J Anat 186:55; Taylor, Wedel & Naish 2009, Acta Palaeontol Pol 54:213
- Miller's Anatomy of the Dog (via secondary sites); *Canids of the World* (Princeton UP); wolf.org ethogram
