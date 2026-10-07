# 04-gait-curves: notes and provenance

Fetched 2026-10-06 by a research sub-agent for item 04 of `docs/claude/DEN-DATA-WISHLIST.md`. Only CC BY 4.0 material is stored here. No images are stored.

## Files
- `curves.csv`: joint angle against % of stride. Columns: `source_id, gait, joint, pct_stride, mean_deg, sd_deg, n_dogs, angle_convention`.
  - 0% is that limb's own touchdown; the next touchdown is 100%.
  - Every angle is converted to the **included angle between the two bones, 180 = straight**. Values above 180 mean hyperextension; this happens at the carpus in stance.
  - The joint names are shoulder, elbow, carpus, hip, stifle and tarsus (tarsus means the hock).
- `duty_phase.csv`: duty factors, touchdown phases relative to left hind (LH = 0, fraction of LH stride), stride frequency, speed and stride length. Some rows are computed by us and some are published; the `note` column says which.
- `joint_extremes.csv`: published standing angles and trot extremes, converted to included angles. Also holds the cushioning-phase range of motion (ROM) values from Miao 2026, and (since Oct 7) Goldner 2018 sound-trot touchdown, lift-off, stance/swing min, max and ROM for six joints.
- `LICENSE.txt`: licence and attribution for each source.

Processing scripts lived in `/tmp/item04/scripts/` and are not in the repo. Raw downloads were deleted after processing.

---

## Source 1: Catavitello, Ivanenko & Lacquaniti 2015 (`catavitello2015_retrievers`)
- **Title:** "Planar Covariation of Hindlimb and Forelimb Elevation Angles during Terrestrial and Aquatic Locomotion of Dogs." PLOS ONE 10(7): e0133936. doi:10.1371/journal.pone.0133936
- **Article:** https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0133936 (PMC4517757)
- **Data:** S1_Dataset.zip, https://journals.plos.org/plosone/article/file?type=supplementary&id=10.1371/journal.pone.0133936.s001 (4.2 MB, MATLAB .mat files; readme.pdf inside)
- **Licence:** CC BY 4.0 (article and supporting information).
- **Dogs:** 6 healthy rescue-trained retrievers (3 Golden, 3 Labrador), 35±4 kg, withers about 0.57 m.
  - Filmed outdoors, at their preferred speed, side view.
  - Markerless 2D tracking (Tracker software) of camera-side landmarks, 60 Hz (one walk trial at 120 fps).
- **What we extracted:**
  - The per-frame segment **elevation angles**: angle to the vertical, positive when the distal end is in front of the proximal end. We checked them against the stored landmark coordinates (P structs); the difference was 0.00°.
  - The stride events (`cp` rows: cycle onset, end of rearward excursion, next onset).
  - The landmark coordinates (P).
  - **We did not use** the paper's own 100-point `gait.*` waveforms. Those are time-stretched to the walking stance proportion, so they are not true % of stride.
- **Our processing:**
  - Each stride was cut from onset to onset and resampled to 0..100% in 1% steps.
  - We averaged per dog, then across dogs. `sd_deg` is the SD **between dog means**.
  - The mean stride-to-stride SD (all strides pooled) is about 8–15° and is listed in SUMMARY.md.
- **Cycle definition:** the cycle starts at the maximum forward position of the limb endpoint relative to the limb's proximal marker. This is close to touchdown. The stance proxy is the rearward excursion.
- **Angle conversions** (e = elevation angle):
  - shoulder = 180 − (e_scapula − e_upperarm)
  - elbow = 180 − (e_lowerarm − e_upperarm)
  - stifle = 180 − (e_thigh − e_shank)
  - tarsus = 180 − (e_foot − e_shank), where the foot segment runs from the ankle to the MTP joint
  - **carpus** = 180 + (e_hand − e_lowerarm). This is NONSTANDARD: the "hand" segment runs from the wrist to the **digit tip**, so stance values (up to about 237°) are inflated by about 20–35° compared with a metacarpal carpus angle.
  - **hip:** unsigned angle at the greater trochanter between the trunk line (towards the scapula top) and the femur (towards the knee). This is NONSTANDARD and is **not** the pelvis–femur angle. Use it for timing and shape, not for absolute values.
- **Counts:**
  - Walk: 6 dogs, 30 strides per limb.
  - Trot: 5 dogs (forelimb) and 6 dogs (hindlimb), 41–45 strides.
- **Duty factor and phases:**
  - Duty factor = (end of rearward excursion − onset) / cycle.
  - Phase = onset time of each tracked limb within the camera-side hind cycle, as a circular mean.
  - The camera-side limbs are relabelled as left. Camera-side fore → LF, contralateral hind → RH, contralateral fore → RF.
- **Not stored:** speed. It comes from video scaled by trunk length, and gave implausible values (walk 2.2 m/s at 1.46 Hz), so the spatial scaling is suspect.

## Source 2: Humphries, Shaheen & Gómez Álvarez 2020 (`humphries2020_*`)
- **Title:** "Biomechanical comparison of standing posture and during trot between German shepherd and Labrador retriever dogs." PLOS ONE 15(10): e0239832. doi:10.1371/journal.pone.0239832 (PMC7531786)
- **Raw data:** OSF project "German shepherd and Labrador retriever dogs biomechanical datasets", https://osf.io/pv4uj/, component "Kinematic raw data" https://osf.io/3skrh/.
  - **Licence: CC BY 4.0** (checked through the OSF API on both the project and the component).
  - The component "Kinetic raw data" (https://osf.io/vusxb/) is also CC BY 4.0. Its files are 17–290 MB each, so we did not download them.
- **Published supplements used:** S3 Table (stride parameters) and S4 Table (standing angles and trot max/min flexion), from https://journals.plos.org/plosone/article/file?type=supplementary&id=10.1371/journal.pone.0239832.s003 and .s004. Article licence CC BY 4.0.
- **Dogs:** 12 Labrador retrievers (LRD) and 12 German shepherds (GSD), sound, trotting over ground at their comfortable speed. Qualisys 3D motion capture at 150 Hz.
- **What we extracted:** 117 trot `.tsv` files (3D marker trajectories, mm; about 16 MB in total) were downloaded to /tmp, processed, then deleted.
- **Joint definitions** follow the paper's marker triplets (Table 1 of the paper):
  - shoulder TS–HH–LEB
  - elbow HH–LEB–LCP
  - carpus LEB–LCP–5MC
  - hip S1–GT–LFC (file label LSF)
  - stifle GT–LFC–LM (file label LHK)
  - hock LFC–LM–5MT
- **Our processing:**
  - Markers are projected onto the sagittal plane: the forward axis is the withers' direction of travel, and z is up.
  - Angles are signed so that the included angle sits on the flexor side. That lets the carpus exceed 180.
  - Touchdown and lift-off were detected by us from the toe (claw) marker: forward speed below 25% of the withers' speed and within 25 mm of the lowest toe height, held for at least 60 ms. Strides were cut touchdown to touchdown (0.2–0.8 s).
  - We averaged per dog, then across dogs. `sd_deg` is the SD between dog means.
- **Only Labradors are in `curves.csv` (10 of the 11 LRDs with files).** The GSD files use a different marker set with no toe marker. Their capture windows held less than one full trot stride, so they gave no complete cycles.
- **Validation** against the paper's S4 Table for LRDs (mean of per-dog extremes, converted to included angles):

  | Joint | Ours (min–max of mean curve) | Paper |
  |---|---|---|
  | hip | 133–159 | 129–163 |
  | stifle | 104–163 | 101–165 |
  | hock | 99–161 | 98–167 |
  | shoulder | 100–134 | 102–142 |
  | elbow | 76–134 | 77–146 |
  | carpus | 88–217 | 82–220 |

  The extremes of a mean curve are always a little narrower than the mean of the per-dog extremes, so this agrees.
- **Duty factor check:** ours is 0.456 fore and 0.417 hind. The paper gives stance 43.2±1.8% of the stride (S3, LRD).
- **`joint_extremes.csv`:** the S4 Table values converted with included = 180 − flexion. The paper's "flexion angle" is 180 minus the included angle of the same marker triplets. Negative carpal flexion means hyperextension.

## Source 3: Fischer, Lehmann & Andrada 2018 (`fischer2018_*`)
- **Title:** "Three-dimensional kinematics of canine hind limbs: in vivo, biplanar, high-frequency fluoroscopic analysis of four breeds during walking and trotting." Scientific Reports 8: 16982. doi:10.1038/s41598-018-34310-0 (PMC6242825)
- **Files:** article Table 1, from the Europe PMC full-text XML: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6242825/fullTextXML. Supplementary PDF: https://static-content.springer.com/esm/art%3A10.1038%2Fs41598-018-34310-0/MediaObjects/41598_2018_34310_MOESM1_ESM.pdf
- **Licence:** CC BY 4.0.
- **Dogs:** Beagle (5; 3 in fluoroscopy), Malinois (5), French bulldog (4) and Whippet (5), on a treadmill.
- **Data type:** published mean ± SD at 8 time points: touchdown (TD), 25/50/75% of stance, toe-off (TO), and 25/50/75% of swing.
- **`pct_stride` mapping:** stance points = duty factor × {0, 25, 50, 75, 100}; swing points = DF·100 + (1 − DF)·{25, 50, 75}. We used the paper's own mean duty factor per breed, gait and session (in `duty_phase.csv`).
- **Stifle (`fischer2018_SR_*`)** comes from **Scientific Rotoscoping (biplanar fluoroscopy)**, article Table 1.
  - The published stifle value equals −(femur − tibia) segment angles to the vertical. We checked this: for example, at Whippet walk TD the table gives −51.8, and 44.0 − (−7.5) = 51.5.
  - So included stifle = 180 + published value, and SD = published SD.
  - Whippet, French bulldog and Beagle only; there is no fluoroscopic tibia for the Malinois.
- **Tarsus (`fischer2018_MC_*`)** comes from **skin-marker motion capture**, supplementary Tables S1–S8.
  - Included tarsus = 180 − (metatarsus − tibia) segment angles. This is the same sign logic as above.
  - The published hock "joint" angle uses a marionette reference pose with a constant offset of about 8°, so we derived the angle from the segments.
  - SD is the published hock joint SD. That SD is identical up to the offset.
  - The authors say marker data are reliable distal to the stifle.
- **Malinois stifle (`fischer2018_MC_malinois`):** from marker data as 180 − (femur − tibia). Lower confidence, because the authors report marker-based femur data deviate from fluoroscopy.
- **Not converted: hip.** The paper's 0° is "the reference pose of the bone's marionette", and the pelvis axis is not defined in a way we could tie to an included angle.
- **Source typos:** three tibia values printed as "--37.4", "--37.8" and "--51.2" in S4, S6 and S8 were read as single minus signs. They are monotone with their neighbours. In S2 (Whippet trot), the pelvis and femur segment values appear to have flipped sign; those values are not used.

## Source 4: Miao, Zhu, Zheng, Qian & Ren 2026 (`miao2026_S1`)
- **Title:** "Comparative kinematic analysis of forelimb and hindlimb cushioning strategies in German Shepherd dogs: implications for injury prevention." Front. Vet. Sci. 13: 1878605. doi:10.3389/fvets.2026.1878605 (PMC13384870)
- **File:** Data Sheet 1 (Supplementary Table S1), https://www.frontiersin.org/api/v4/articles/1878605/file/Data_Sheet_1.PDF/1878605_data-sheet_1/1 (also on frontiersin.figshare.com, doi 10.3389/fvets.2026.1878605.s001).
- **Licence:** CC BY.
- **What we extracted:** joint angular change during the cushioning (impact) phase only, at walk and trot, for 4 police German shepherds. It goes into `joint_extremes.csv`. These are not full-stride curves.

## Source 5: Goldner, Fischer, Nolte & Schilling 2018 (`goldner2018`)
Added 2026-10-07 by a follow-up sub-agent.
- **Title:** "Kinematic adaptions to induced short-term pelvic limb lameness in trotting dogs." BMC Veterinary Research 14: 183. doi:10.1186/s12917-018-1484-2 (PMC5998594)
- **Files:** Additional file 1 (thoracic limbs) and Additional file 2 (pelvic limbs), Word .doc tables:
  - https://static-content.springer.com/esm/art%3A10.1186%2Fs12917-018-1484-2/MediaObjects/12917_2018_1484_MOESM1_ESM.doc
  - https://static-content.springer.com/esm/art%3A10.1186%2Fs12917-018-1484-2/MediaObjects/12917_2018_1484_MOESM2_ESM.doc
  - Full text read from https://www.ebi.ac.uk/europepmc/webservices/rest/PMC5998594/fullTextXML
- **Licence:** article CC BY 4.0; the article states the CC0 1.0 waiver applies to the data made available in it.
- **Dogs:** 8 Beagles (7 m, 1 f), 15.1 ± 1.2 kg, trotting on a four-belt force treadmill at 1.4 m/s. Vicon, 6 infrared cameras, 22 skin markers; angles projected onto the sagittal plane (2D). Touchdown and lift-off from the force plates. 10 consecutive strides per dog.
- **What we extracted:** only the **sound (control) trot** columns, for the six joints (shoulder, elbow, carpal = carpus, hip, knee = stifle, tarsal = tarsus), on both sides:
  - `touchdown`, `liftoff`, `stance_min`, `stance_max`, `stance_rom`, `swing_min`, `swing_max`, `swing_rom`.
  - `sd_deg` is the published SD between dogs. The published mSD (mean within-dog SD over 10 strides) is kept in the `note` column.
  - Side: the paper names limbs relative to the later-lamed right hind ("ipsilateral" = right, "contralateral" = left). In the sound condition these are simply the left (`L`) and right (`R`) limbs.
  - `*_rom` rows hold a range in degrees in the `included_deg` column, not an angle.
  - Not stored: the lame-condition columns, the Diff/P columns, the segment angles (scapula, humerus, antebrachium, manus, pelvis, femur, crus, pes) and the limb angles. They are in the .doc files if ever needed.
- **Angle convention and conversion:**
  - The tables say "for definition of angles, see Fig. 1 in [16]". Ref. 16 is **Goldner B, Fuchs A, Nolte I, Schilling N (2015) "Kinematic adaptations to tripedal locomotion in dogs", Vet J 204: 192–200, doi:10.1016/j.tvjl.2015.03.003**. It is Elsevier and **not open access** (Europe PMC: not OA, no PMC copy), so we could not read Fig. 1.
  - We instead verified the convention from the tables themselves: for shoulder, elbow, carpus, knee and tarsus, the published joint angle equals the **sum of the two adjacent segment angles** at both touchdown and lift-off, on both sides (shoulder = scapula + humerus, elbow = humerus + antebrachium, carpus = antebrachium + manus, knee = femur + crus, tarsus = crus + pes; 19 of 20 checks within 0.1°, carpus LO left 0.7°). Each segment angle is taken against the same reference line from alternate sides, so the sum is the included angle between the bones on the flexor side.
  - The values behave as included angles with 180 = straight: the carpus exceeds 180 in stance (hyperextension, max 208–220°) and drops to 79–87° in swing, matching Humphries 2020 (82–220°). So **no conversion was applied**; `included_deg` = published value and `original_flexion_deg` is blank.
  - **Hip caveat:** the hip joint angle does not equal any simple sum or difference of the published pelvis and femur segment angles (180 − (pelvis − femur) misses by 7–9°), so its pelvic axis cannot be reconstructed without ref. 16. Treat hip values (94–117°) as this lab's own convention, not comparable with Humphries' S1–GT–LFC hip (129–163°).
- **Comparison with the other trot data (sound, included °, min–max over the stride):**

  | Joint | Goldner 2018, Beagle (L/R) | Humphries 2020 LRD (S4) |
  |---|---|---|
  | Shoulder | 91–110 / 94–119 | 102–142 |
  | Elbow | 60–125 / 68–134 | 77–146 |
  | Carpus | 79–208 / 87–220 | 82–220 |
  | Stifle | 93–145 / 96–147 | 101–165 |
  | Tarsus | 109–156 / 109–157 | 98–167 |
  | Hip (own convention) | 95–117 / 95–117 | 129–163 |

- **Left/right asymmetry:** the left forelimb sits about 9–10° more flexed than the right in shoulder and elbow. That is in the published sound data; we did not alter it.

---

## Checked but not stored
| Source | Why not stored |
|---|---|
| Pit Bull 2021, "Kinematics of healthy American Pit Bull Terrier dogs", Vet Med (Praha), PMC11927105 | CC BY-NC. Not stored. |
| Charles et al. 2025, "The biomechanics of working dog locomotion I: Steady-state trotting", J Exp Biol 228, doi:10.1242/jeb.250523 | Crossref licence: CC BY 4.0 (from 2025-09-15). journals.biologists.com returned HTTP 403 three times, and doi.org twice (Oct 6). Retried Oct 7: (1) the Crossref-listed PDF link journals.biologists.com/jeb/article-pdf/doi/10.1242/jeb.250523/3665346/jeb250523.pdf gave 403; (2) Europe PMC has no full text (MED 40843505, "Subscription required", fullTextXML 404). No bioRxiv preprint is linked to it (bioRxiv publisher API for 10.1242, 2025–2026, has no dog-locomotion entry; Crossref has no posted-content match). No data deposit on Zenodo, Dryad or figshare. Not fetched. |
| Charles et al. 2025, "The biomechanics of working dog locomotion II: Loaded trotting", doi:10.1242/jeb.250524 | Licence not given; host blocked (403). |
| Agostinho et al. 2011, "Kinematic analysis of Labrador Retrievers and Rottweilers trotting on a treadmill", Vet Comp Orthop Traumatol | Not open access; no supplement. |
| Hottinger et al. 1996 (AJVR) | Not open access; no PMC copy. |
| Fischer & Lilje, *Dogs in Motion* | Copyrighted book. |
| "Comparative kinematic gait analysis in young and old Beagle dogs", J Vet Sci 2017, PMC5746446 | CC BY-NC. Not stored. |
| Goldner et al. 2015, "Kinematic adaptations to tripedal locomotion in dogs", Vet J 204: 192–200, doi:10.1016/j.tvjl.2015.03.003 | Defines the angles used by Goldner 2018 (its Fig. 1). Elsevier, not open access. Not fetched; the convention was verified from the 2018 tables instead (see Source 5). |
| Humphries 2020 OSF kinetic files | CC BY, but 17–290 MB per file, so not downloaded. |
| pmc.ncbi.nlm.nih.gov article pages | Served a reCAPTCHA page. We used the Europe PMC REST full text instead. |
| journals.biologists.com, www.mdpi.com | HTTP 403 from this environment. |
| Harness pilot (PLOS ONE 2022, PMC8906618), pivot-point study (PMC10360120), cavaletti study (PMC11665453), treadmill habituation (PMC5192580) | Checked. Each was about pace or amble, leg-function data only, data "on request", or p-values only. Nothing extracted. |
