# 09-face-and-ear: notes

Fetched 2026-10-06. All numbers are in `data.json` with value, unit, n, context, citation, URL, licence and confidence (A/B/C).

## How the search was done
- Europe PMC REST search (`https://www.ebi.ac.uk/europepmc/webservices/rest/search`, `OPEN_ACCESS:y`, `resultType=core` to read the licence), queries on head tilt, DogFACS, ear position/rotation/pinna, gape, mouth opening, yawning duration, panting rate, lapping, barking/howling jaw motion.
- Full texts read as `fullTextXML` from Europe PMC. Figures for Buckley et al. 2025 came from the Europe PMC `supplementaryFiles` package (mdpi.com and pmc.ncbi.nlm.nih.gov figure URLs returned 403).
- Raw downloads kept in `/tmp/item09/` only. Nothing but numbers stored here.

## Sources used (stored as facts)
| Source | Year | URL | Licence | Extracted |
|---|---|---|---|---|
| Goldschmidt, Chew, Guy, Fok. Characterizing masticatory motion of dogs using optical and electromagnetic motion tracking. Front Vet Sci 12:1625335 | 2025 | https://europepmc.org/article/PMC/PMC12268705 (doi 10.3389/fvets.2025.1625335) | CC BY 4.0 | chewing canine-gap opening 2.51 ± 0.33 cm, chewing 2.59 Hz (2.37–2.93 by food), hinge-only motion |
| Buckley, Sexton, Martvel, Hecht, Bradley, Zamansky, Subiaul. What does that head tilt mean? Animals 15(21):3179 | 2025 | https://europepmc.org/article/PMC/PMC12609352 (doi 10.3390/ani15213179) | CC BY 4.0 | tilt amplitude distribution (digitised from Fig. 3), example time course (Fig. 2), tilt rate per condition (Table 1), side bias |
| Sommese, Miklósi, Pogány, Temesi, Dror, Fugazza. An exploratory analysis of head-tilting in dogs. Anim Cogn 25(3):701–705 | 2022 | https://europepmc.org/article/PMC/PMC9107419 (doi 10.1007/s10071-021-01571-8) | CC BY 4.0 | 43% vs 2% of trials; side stable. **No angle or duration in this paper.** |
| Gallup, Moscatello, Massen. Brain weight predicts yawn duration across domesticated dog breeds. Curr Zool 66(4):401–405 | 2020 | https://europepmc.org/article/PMC/PMC7319467 (doi 10.1093/cz/zoz060) | **CC BY-NC 4.0**: summary fact only; per-breed Table 1 not copied | yawn 2.04 ± 0.59 s, breed means 1.43–2.83 s |
| Romero, Ito, Saito, Hasegawa. Social modulation of contagious yawning in wolves. PLoS ONE 9(8):e105963 | 2014 | https://europepmc.org/article/PMC/PMC4146576 | CC BY 4.0 | contagious-yawn latency 9.0 ± 4.3 s (no yawn duration given) |
| do Nascimento et al. Cool and safe walks. Int J Biometeorol | 2026 | https://europepmc.org/article/PMC/PMC13260287 (doi 10.1007/s00484-026-03236-y) | CC BY 4.0 | panting rate 47 → 374 breaths/min; plateau 287/min (4.78 Hz) |
| Bourke, Wroe et al. Dingo gape FE model. PLoS ONE 3(5):e2200 | 2008 | https://europepmc.org/article/PMC/PMC2376057 | CC BY 4.0 | 65° (already known; not redone) |

## Head-tilt digitising method (Buckley et al. 2025, Fig. 3, left panel)
- Image `animals-15-03179-g003.jpg` (760 × 357 px) from the Europe PMC supplementary package.
- Light-grey gridlines found at pixel rows ≈ 306 (0°), 244 (20°), 180 (40°), 118 (60°), 57 (80°): 3.11 px per degree.
- Blue markers found by colour threshold (B > 180, R < 180, B − R > 60) with a 1-pixel closing, connected components, centroid y → degrees. Merged blobs were counted as round(size / median size) dots. Result: 118 dots without merge handling, 132 with; both give median 15–17°, IQR 8–29°, range 2–90°. The paper's Table 1 implies about 134 tilts in Conditions 3 and 4, so the count fits.
- The amplitude is the change in the roll angle of the outer-eye-corner line in 2-D video between tilt start and peak frame (paper's method). It is not corrected for camera angle.
- Fig. 2 example trace read by eye: 0.08 → 0.60 rad in about 0.7 s, slow sag to about 0.27 rad by 10 s, drop at 12 s, second small tilt peaking at about 14 s.

## Checked and not stored
- **OSF data for Buckley et al. 2025** (https://osf.io/ypsw2/, files "Head Tilt Data - CleanCSV.csv", "...Categoricals.csv"): no licence set on the OSF node, so not stored. They hold tilt counts only, no amplitudes, so nothing was lost.
- **Gart, Socha, Vlachos, Jung 2015**, Dogs lap using acceleration-driven open pumping, PNAS 112(52):15798–15802, PMC4703018: not in the Europe PMC OA subset (fullTextXML HTTP 500, 3 tries); pnas.org 403. Lapping frequency and tongue numbers not recorded.
- **Crompton & Musinsky 2011**, How dogs lap, Biol Lett 7(6):882–884, PMC3210653: same failure; abstract fact only (≥ 3 lap cycles per swallow).
- **Gallup et al. 2021** Commun Biol (PMC8102614, CC BY), yawn durations across 101 species: dogs were excluded from the analysis; the per-yawn data are on DataverseNL (doi 10.34894/ROFNL1, 10.34894/9HENTF). The DataverseNL API returned HTTP 504 three times, so the licence and any wolf/fox rows could not be checked.
- **Fitch 2000**, Phonetica, doi 10.1159/000028474 (X-ray video of barking dogs): not open; abstract mentions larynx lowering only.
- **Ekström et al. 2024** wolf howling tongue gestures (Research Square preprint, CC BY, doi 10.21203/rs.3.rs-5354163/v1): no jaw numbers in the abstract; the full-text page is a JavaScript app.
- **Martvel et al. 2025**, BMC Vet Res (PMC12102829): CC BY-NC-ND; no ear angles anyway.

## Conversions
- None applied to stored values except breaths/min → Hz (÷ 60) and the figure digitising above.
