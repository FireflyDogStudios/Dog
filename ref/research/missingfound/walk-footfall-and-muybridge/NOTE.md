# Walk footfall timing and Muybridge L/R labels: sources and method

Date: 2026-10-07. Research sub-agent for Firefly. Numbers and labels only; no images stored (working crops lived in `/tmp/mf-gait/`).

## Conventions
- **Limb phase (LP):** Hildebrand's "percent of stride interval that footfall of forefoot follows hind on same side" (his Fig. 1 axis label), as a fraction. LH touchdown = 0, so LF touchdown = LP, RH = 0.5, RF = LP + 0.5. Cartmill et al. 2002 call the same number "diagonality" (D).
- **Maes pair lag (PL):** time from the f1 footfall to the ipsilateral h1 footfall, as a fraction of the f1 cycle. Converted with **LP = 1 − PL**. Check: Maes give trot PL 50 (LP 0.50) and pace PL 96 (LP 0.04), which fits this conversion.
- **Muybridge contacts:** 1 = stance, 0 = swing, `?` = unclear; dog faces right; near side = the dog's right (see below).

## Task 1 sources

| Source | URL | Licence / use | What we took |
|---|---|---|---|
| Maes, Herbin, Hackert, Bels & Abourachid 2008, "Steady locomotion in dogs: temporal and associated spatial coordination patterns and the effect of speed", J Exp Biol 211:138-149 | https://journals.biologists.com/jeb/article/211/1/138/17472/ | © Company of Biologists; free to read. Facts only. | PL definition; lateral-walk PL 84±5 %, trot 50±4, pace 96±3; Appendix 1: lateral walk (N=189) PL = 0.807(±0.011) + 0.030(±0.009)·u, r² 0.062; Results: PL rises significantly with speed in the lateral walk (P<0.05). Dogs: 5 Malinois, 28.0±2.4 kg, withers 0.61 m; walk used ~0.4 to 2.0 m/s. Read through WebFetch: plain curl got a Cloudflare challenge. |
| Hildebrand 1968, "Symmetrical gaits of dogs in relation to body build", J Morphol 124:353-360 | https://www.originalwisdom.com/wp-content/uploads/bsk-pdf-manager/2019/04/Hildebrand_1968_Symmetrical-Gaits-of-Dogs-in-Relation-to-Body-Build.pdf (third-party copy) | © Wiley. Facts only; numbers digitised by us. | Fig. 1 digitised (method below); Fig. 3 gait formulas (hind duty %, LP %): Golden Retriever 61-7, St Bernard 66-13, Irish Wolfhound 60-20, Basset 69-25, Chihuahua 59-32, English Bulldog 64-39, French Bulldog 58-46, Afghan 51-56, GSD 45-1 (pace), Bloodhound 34-9, Great Dane 53-9 and 46-45, Boxer 42-50. Text: long-legged dogs use lateral couplets at the moderate walk, short-legged dogs single-foot; the difference is least at slow speeds; 21 formulas of other Canis (C. aureus, C. dingo, C. latrans, C. macrotis) fall in the dog area, except a very slow coyote and two of a semi-tame dingo "straining at its leash and probably atypical". Fore contact = 86-109 % of hind contact at the walk. |
| Hildebrand 1980, "The adaptive significance of tetrapod gait selection", Amer Zool 20:255-267 | https://www.originalwisdom.com/wp-content/uploads/bsk-pdf-manager/2019/03/Hildebrand_1980_The-Adaptive-Significance-of-Tetrapod-Gait-Selection.pdf | © (Oxford). Facts only. | "At the slow walk tetrapods avoid lateral couplets gaits to minimize support by ipsilateral bipods." |
| Cartmill, Lemelin & Schmitt 2002, "Support polygons and symmetrical gaits in mammals", Zool J Linn Soc 136:401-420 | https://www.originalwisdom.com/wp-content/uploads/bsk-pdf-manager/2019/10/Cartmill-et-al_2002_Support-polygons-and-symmetrical-gaits-in-mammals.pdf | © Linnean Society. Facts only. | D definition; bands (L-S L-C 0<D<25, L-S D-C 25<D<50); Rule 3 (L-S L-C walk) D = Sh − 50; Rule 2 (L-S D-C) D = 100 − Sf; one Great Pyrenees (41 cycles) used both rules. |
| Wilshin, Reeve, Haynes, Revzen, Koditschek & Spence 2017, "Longitudinal quasi-static stability predicts changes in dog gait on rough terrain", J Exp Biol 220:1864 | PMC5450805; full text via https://www.ebi.ac.uk/europepmc/webservices/rest/PMC5450805/fullTextXML | CC BY 3.0 | 6 dogs, 22.6±4.5 kg, withers 507.5±66.3 mm; 371 walking strides; flat-ground walks mostly lateral couplets, two dogs single-foot; duty 0.66±0.02 (median±IQR); rough terrain shifts toward trot (0.53 rad paired, 0.550±0.088 rad mixed model); speed effect not significant (0.132±0.133 rad s/m). Our LP conversion of 0.53 rad (λ: −π/2 = single-foot, 0 = trot, so π/2 rad ≈ 0.25 of LP) is rough: ≈ +0.08. |
| Usherwood & Self Davies 2017, "Work minimization accounts for footfall phasing in slow quadrupedal gaits", eLife 6:e29495 | PMC5599235 (Europe PMC full text) | CC BY 4.0 | Table 1 carnivoran medians (duty, phase %) and the cross-species regression phase % = 130·DF − 66. No canid in their table. |
| Catavitello, Ivanenko & Lacquaniti 2015, PLOS ONE 10:e0133936 | PMC4517757 | CC BY 4.0 | Checked the paper's PL definition (onset of each limb relative to the camera-side hind, % of hind cycle). The 0.135 value itself is from `ref/research/fetched/04-gait-curves/duty_phase.csv` (not recomputed). |
| Stark et al. 2021 Beagle forelimb walk | `ref/research/fetched/03-dog-model/NOTE.md` | MIT (model) | Forelimb stance 0 → 62-65 % of stride (duty ~0.64). No hind or contralateral timing, so no LP. |
| Charles et al. 2025, JEB 228:jeb250523 (supplement) | `ref/research/fetched/04-gait-curves/` | CC BY 4.0 | Trot only; nothing for the walk. |
| Europe PMC REST search | https://www.ebi.ac.uk/europepmc/webservices/rest/search | — | Queries: dog/canine walk with limb phase/footfall/diagonality/phase lag (open access, 114 hits); wolf/Canis lupus with gait/footfall/locomotion/trackway; "lateral sequence" with dog/canid; dingo with gait/locomotion. No wolf or dingo footfall-timing study found. Two web searches (wolf gait kinematics; Hildebrand wolf gait formula) found none either. |

### How Hildebrand Fig. 1 was digitised
- Rendered page 354 of the PDF at 200 dpi; located the grid lines (x: 100 % at px 280.5, 0 % at 1091.5; y: 0 % at 715.5, 100 % at 1533.5).
- Erased grid lines, filled and labelled dark blobs (scipy `ndimage`), classified solid (ink fill ≥ 0.95, long-legged) vs open circles (short-legged), and counted merged clusters as area/40 px points.
- Kept points with hind duty ≥ 55 % and LP < 42 % (walking gaits). Result: long-legged n ≈ 55 (of 89 walking/pacing formulas; some overlap), median LP 14.4 %, IQR 11-18 %; short-legged n ≈ 37 (of 38), median 23 %, IQR 19-24 %.
- Linear fit of LP on hind duty (long-legged): LP % ≈ 0.49·Sh % − 16.9 (0.13 at Sh 0.60, 0.15 at 0.65, 0.18 at 0.70). Treat it as EST (±2 % on each point, overlapping dots).

## Task 2 sources (all public domain)
- **Plates already in `ref/research/fetched/05-muybridge/`:** 704 (BPL), 706, 707, 708 and Maggie A (USC 3840 px), Maggie B (1902 reprint page). Re-inspected by cropping and enlarging with PIL.
- **Muybridge, *Animals in Motion* (1902):** OCR text `https://archive.org/download/animalsmotion00muyb/animalsmotion00muyb_djvu.txt` and page image leaf n177 (p.158), `https://archive.org/download/animalsmotion00muyb/page/n177.jpg`.
  - The foot-symbol legend (introduction, before the walk chapter): left fore = open triangle, right fore = filled triangle, left hind = open circle, right hind = filled circle.
  - p.158, Series 56 (= Maggie B): "phase 6, which exhibits the hound on ▲ [RF] ... in 7, with all the legs flexed under the body ... ● [RH], on which he presently alights, and quickly follows with ○ [LH], from which he takes another spring, and in 9 ... After a flight with outstretched legs, the landing takes place on △ [LF]. In 11 the support is transferred to ▲ [RF]". The OCR loses filled vs open triangles, so the page image was read.
  - Series 57 (plate 707) and Series 14 (704) and 39 (706) carry no foot names.
- **Single-frame USC scans of plate 704** on Wikimedia Commons, `File:Dog Dread walking (rbm-QP301M8-1887-704a~01..12).jpg` (front-oblique) and `...704b~01..12` (rear-oblique), about 770 px per frame (2.7× the BPL plate). Public domain. Fetched at the standard 960 px thumbnail width into `/tmp` (20 of 24; a10-a12 and b07 kept returning 429). Not stored.
- Not used: LoC, NGA, Smithsonian, BPL high-res. The 704 single frames were the only higher-resolution find that mattered.

### Method for the L/R labels
1. **Which side faces the camera.** In every lateral view the dog moves right and the numbered background and floor scales read normally, so the print is not mirrored; the camera therefore sees the dog's right side. The rear-oblique rows (707, Maggie A) show the dog going away and to the right, which also exposes the right flank. So near = R, as 05 assumed.
2. **Near vs far, per frame:**
   - which leg comes out of the near thigh or near shoulder (the far limb's upper part is hidden behind the near thigh, elbow or chest);
   - far limbs are darker (shaded) on the 706 mastiff;
   - for the rear rows, a leg on the image left of the tail is the left leg;
   - for 706, every visible paw was located on the numbered floor scale (read per frame from the scale strip). A planted paw keeps its scale value from frame to frame; a paw whose value jumps is in the air.
3. **Contacts** were re-scored only where a cue changed them; otherwise the 05 values were kept.
4. **Derived values** (duty factor, touchdown order, feet down) were recomputed with the 05 rules for the plates that changed (706, 707, Maggie A). The 704, 705 and 708 derived blocks are copied unchanged.

## What changed and why
- **706 (Smith):** L/R confirmed. RH frame 9 flipped 1→0: the paw is toe-down in the air at ~30.5 and lands at ~32.5 in frame 10. LF frame 12 flipped 1→0: the paw is flexed and off the ground. RF frame 12 went 1→?. Six unknowns resolved. The sequence is a lateral-sequence walk (LH 3, LF 4, RH 5, RF 7) that turns into a trot (diagonal pairs together at 7 and 10).
- **707 (Dread gallop):** fully mirrored in 05. Evidence:
  - frame 3: the planted hind's upper leg is hidden behind the near thigh, and in the rear row it is the leg left of the tail;
  - frame 4: both hinds are planted (rear row too);
  - frames 5-6: the first fore down is continuous with the near shoulder;
  - frame 7: the planted lead fore passes behind the raised near fore.
  The 05 note says the gallop L/R were made to follow Muybridge 1893's generic "right hind first" description; that is the likely cause.
- **Maggie A:** fully mirrored in 05. Evidence: the near-thigh test in frames 1-2 and the rear row (frame 1: planted hind left of the tail; frame 2: right hind planted); the near-shoulder test in frame 4.
- **Maggie B:** Muybridge's own text confirms the 05 labels.
- **Ike (708):** blur prevents a test; L/R unconfirmed (50/50).
- **704, 705:** still feet-down only.

## Caveats
- The 706 stride is about 5 intervals (0.55 s), so a limb phase read from it is ±0.12 at best. The mastiff was also changing gait.
- The "same lead in the second stride" assumption for Maggie A frames 6-8 and 11-12 is usual for a steady gallop, but leads can switch.
- The 04 Catavitello value uses limb max-protraction as its event, not paw contact.
