# Canine gait kinematics: numbers for the Den rig

> **Partly superseded (Oct 7, Atlas; approval A-002 item 5).** Measured values now exist in `../fetched/04-gait-curves/` (curves, duty factors, phases, joint extremes) and `../missingfound/walk-footfall-and-muybridge/` (walk limb phase). Prefer those wherever they overlap. Known conflicts: trot hind duty factor here 0.367 vs measured 0.417-0.43; trot RF phase here 0.02 (hind first) vs measured 0.936-0.96 (fore lands just before LH); walk duty "no measured value" here vs 0.58-0.64 measured; the Jaegger 2002 limits here were recalled, not verified (only the stifle is verified). Kept for its sources and gallop estimates, which have no measured replacement yet.

Research pass by a Firefly research agent, Oct 6, 2026. Companion file: `gait_numbers.json` (every number with a source and a confidence grade). Saved here by Firefly from the agent's hand-back, because the agent could not write `.md` files itself.

## Trust and conventions
- **Nearly every publisher site was blocked** (JEB, PubMed/PMC, PLOS, Frontiers, MDPI, Nature, ResearchGate, arXiv). Almost every number comes from search-result snippets of the cited papers, not full texts. Treat them as good concepts and reasonable starting values, not gospel.
- **Confidence:** A = abstract-level number with a clear definition. B = peer-reviewed, but the definition is unclear or second-hand. C = popular source or garbled snippet. EST = the agent's synthesis, not a measurement.
- **Angles:** sagittal included angle between segments, 180° = straight. The carpus goes past 180° (hyperextension) in stance. Some papers use "flexion from straight" instead: included angle = 180 − value.
- **Pair lag (Abourachid / Maes):** PL = lag from the first forefoot touchdown to the same-side hind, as % of the fore cycle, so LH→LF = 1 − PL. Hildebrand diagonality = % of stride by which LH precedes LF (25 = evenly spaced walk, 50 = trot, 0 = pace).

## 1. Phases (relative to LH = 0)

| Gait | LH | LF | RH | RF | Basis |
|---|---|---|---|---|---|
| Walk (lateral sequence) | 0 | 0.16–0.25 (use 0.20) | 0.5 | 0.66–0.75 | Maes 2008: canonical PL 75; measured PL 84±5% (A/B) |
| Trot | 0 | 0.5 | 0.5 | 0–0.03 | FL = HL = PL = 50 (A); small hind-first lag is EST |
| Pace | 0 | 0 | 0.5 | 0.5 | definition (A) |
| Transverse gallop | 0 | 0.26 | ~0.10 | ~0.38 | PL 73.9±6.8% (A); pair lags EST |
| Rotary gallop | 0.10 | 0.40 | 0 | 0.52 | PL 70.3±8.3% (A); pair lags EST; double suspension |

- **Footfall order:** the transverse gallop goes LH trail, RH lead, LF trail, RF lead. The rotary gallop goes RH trail, LH lead, LF trail, RF lead.
- **Our current walk phases (0.25 / 0.75) are within the measured range.**
- **Rotary gallop sequence:** trailing fore, lead fore, flight, trailing hind, lead hind, with the hind lead on the opposite side (Walter & Carrier 2007).
- **Transverse gallop sequence:** the hind pair, then the contralateral fore, then the ipsilateral fore (Ding 2025).
- **Body build:** long-legged dogs tend to lateral-couplet walks and occasional pacing; short-legged dogs walk single-foot (Hildebrand 1968).
- **Rough ground:** the walk shifts toward trot-like phasing (Wilshin 2017).
- **Sled dogs** switch between rotary and transverse gallop every few strides.

## 2. Duty factor
- **General rule:** walk > 0.5; trot and gallop < 0.5; fore > hind (Maes 2008).
- **Labrador trot:** stance 43.5% fore, 36.7% hind (A). It falls as trot speed rises from 2 to 5 m/s.
- **Walk:** no measured number retrieved; estimate 0.60–0.70.
- **Gallop contact times:**
  - Walter & Carrier 2007, rotary at 9.2 m/s: about 71–75 ms per foot.
  - Hudson 2012, greyhound: fore 131 ms at 9 m/s and 77 ms at 17 m/s; hind 143 and 94 ms.
  - The two studies disagree at about 9 m/s. Estimated gallop duty factor 0.25–0.35.

## 3. Speed, stride frequency, stride length
- **Dog gaits span 0.4–10 m/s.** Walk or pace around 1.5, pace or trot around 3, gallop above about 4 m/s (Maes 2008).
- **Treadmill speeds:** walk 1.32, trot 2.43, gallop 4.43 m/s (Deban 2012).
- **Walk speed:** 1.06±0.21 m/s (Holler 2010).
- **Gait changes by Froude number:** walk→trot at 0.3–0.5, trot→gallop at 2–3 (B).
- **Scaling:** stride frequency ∝ M^−0.15; gait speeds ∝ about M^0.2 (Heglund & Taylor 1988). Stride length rises linearly with speed. A faster trot comes mainly from longer strides, with bigger elbow and hip range of motion.
- **Wolf-like breeds** are the most economical movers: cost of transport 3.0 vs 4.2 J/kg/m (Bryce & Williams 2017).
- **Greyhounds** stride at about 3.5 Hz; sled dogs at 2.7–2.8 Hz.
- **Wolf** (popular sources, C): trots at 13–16 km/h, sprints at 50–70 km/h.
- **Tracking strides** (NPS guide): red fox walk 55–67 cm, trot 79–101 cm; coyote trot 117–214 cm.

## 4. Joint angles

**Walk range of motion** (treadmill reliability study, A):

| Shoulder | Elbow | Carpus | Hip | Stifle | Tarsus |
|---|---|---|---|---|---|
| 30–33° | 49–53° | probably ~77–88° (garbled snippet) | 33–36° | 34–37° | 32–34° |

**Elbow:**
- Walk: about 82–87° to 136–140°.
- Trot: 82° to 145°.
- Gait range across studies: 48–70°.

**Carpus at the trot** (GSD, Frontiers 2026, A):
- Range 89° in swing, 29° in stance.
- Hyperextended past 180° from just before touchdown through stance.

**Tarsus at the trot:** 56° in swing, 43° in stance.

**Stifle:** about 135° at mid-stance, at both walk and trot.

**Curve timing:**
- **Shoulder:** most extended at touchdown, flexes slowly through stance, then flexes fast to peak mid-swing.
- **Elbow:** extends through stance to a maximum at toe-off; peak flexion mid-swing. It moves opposite to the shoulder and carpus, which move together.
- **Carpus:** hyperextends early in stance and holds; most bent mid-swing.
- **Tarsus:** yields after touchdown, extends to push off, flexes again in swing.
- **Hip:** close to a sine curve.
- **Walk curves as Fourier series** (Hottinger 1996): 3 terms for the hip, 5 for the stifle, shoulder, elbow and carpus, and 6 for the tarsus.
- **Scapula:** its rotation on the ribcage gives at least 65% of stride length.

**Passive limits:**
- Elbow: flexion 25–49°, extension 155–175°.
- Stifle: about 40° to 160–166°.
- Labrador goniometry (Jaegger 2002), recalled and not verified this session: shoulder 57–165°, elbow 36–165°, carpus 32–196°, hip 50–162°, stifle 42–162°, tarsus 39–164°.

**Rig starting envelopes (EST, included angle):**

| Joint | Walk | Trot |
|---|---|---|
| Shoulder | 105–137° | 100–140° |
| Elbow | 85–140° | 82–145° |
| Carpus | 100–190° | 95–195° |
| Hip | 100–135° | 95–140° |
| Stifle | 105–145° | 100–150° |
| Tarsus | 115–150° | 100–160° |

## 5. Body, spine, head, tail
- **Spine at the trot:** two flexion-extension cycles per stride, and one lateral-bend and one axial-rotation cycle. Lumbar joints move about 2–5° each.
- **Pelvis:** mainly roll at the walk, mainly yaw at the trot.
- **Spine at the gallop:** biggest bending in the lumbar region, with flexion about twice extension.
- **Tail:** swings in time with the stride at walk and trot; held stable at the gallop (Wada 1993).
- **Upper neck:** about 20–30° of range at the atlas joints.
- **Head and withers bob:** no amplitude found, only lameness indices of a few mm. The bob grows with trot speed.
- **Limb roles:** forelimbs are stiffer; the carpus absorbs impact passively, while the tarsus is under active muscular control.

## 6. Species and body types
- **Wolf-like breeds** are the most economical movers, so they are the best model for the Carolina Dog.
- **Labrador vs Greyhound:** dynamically similar, with greyhounds on straighter limbs.
- **GSD vs Labrador:** GSDs stand with a more flexed stifle and hock and a more extended hip.
- **Phase lag and build:** the fore–hind phase lag correlates with limb-to-trunk aspect ratio (Wilshin 2017).
- **Fox and coyote** use the direct-register trot and the side trot.
- **No kinematics found** for wolf, dingo, African wild dog, jackal, hyena or raccoon dog.

## 7. Gaps
1. No numeric angle-vs-%-stride curves. They are in sources that were blocked here: Fischer & Lilje *Dogs in Motion*, JEB 2025 *Working dog locomotion I*, and the Agostinho 2011, Pit Bull 2021 and Catavitello 2015 tables.
2. No measured walk duty factor.
3. Gallop within-pair lags and flight times are estimates.
4. No head or withers bob amplitude.
5. Shoulder, hip, stifle and tarsus trot min/max pairs are mostly missing (ranges only).
6. No wild canid joint data.

## 8. Data files
- **AI4Animation dog mocap** (github.com/sebastianstarke/AI4Animation): CC BY-NC 4.0, so skipped. Timing reference only.
- **Beagle_dog_dataset** (github.com/anl13/Beagle_dog_dataset): MIT, but the data is on Google Drive and Baidu, which were blocked.
- **PLOS ONE and Frontiers supplements:** CC-BY, but unreachable here. Fetching them from an unrestricted network would fill most of the gaps.
