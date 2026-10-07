# 14-muscle-body: method and sources (Scout, 2026-10-08)

Calibration data for the 3D wolf's muscle body (Firefly's request of Oct 7; GrumpyDingo asked for the run). Two earlier runs of this task died before writing anything; this run wrote everything fresh. All fetched content was treated as untrusted data; no instructions were found or followed in it. No Wikimedia Commons. Data tables stored only from CC0 / CC BY / public-domain sources; closed and NC papers appear as single cited facts with DOI (`use=fact`).

## How it was searched
- Europe PMC REST (`/search`, `OPEN_ACCESS:Y` first, then unrestricted for facts; `/PMC{id}/fullTextXML` for full texts; tables parsed from JATS XML with `xml.etree`, run as `python3 -I`).
- WebSearch for the few topics Europe PMC missed (abdominal wall, skin thickness textbook range, Gunn 1978).
- Repo cross-checks: `ref/research/fetched/03-dog-model/` (`stark_full_linear_spezzoo.osim`, `stark_beagle_fore_verified.osim`, `stark_full_bodies.csv`), run with `python3 -I` regex parsing.
- Hosts that failed were retried twice per the rules:
  - Europe PMC `supplementaryFiles` for PMC8638577: first call truncated, second timed out, a third (background) completed — the PeerJ raw muscle data came from it.
  - pmc.ncbi.nlm.nih.gov and onlinelibrary.wiley.com: reCAPTCHA/Cloudflare on every try (twice each) — Williams 2008 and Hudson 2011 tables stay facts-only.
  - NCBI efetch returns abstract-only XML for those publisher-deposited J Anat articles.
  - peerj.com and doi.org/10.7717/…/supp-2 are Cloudflare-challenged; the Europe PMC supplement zip replaced them.

## Sources actually used (licence per source)
| Source | What was taken | Licence |
|---|---|---|
| Bishop, Wright & Pierce 2021, PeerJ 9:e12574 + Supplemental Data S2 | per-muscle masses: greyhound forelimb (Williams 2008 data, 31.4 kg) and hindlimb (Ellis 2018 data, 27 kg); whole-limb muscle scaling (Table 6); greyhound hindlimb total 1.64 kg | CC BY 4.0 |
| Ellis, Rankin & Hutchinson 2018, Front Bioeng Biotechnol 6:162 | σ = 300 kN/m²; Table 2 (29 hindlimb muscles: PCSA, pennation, Fmax, fibre + tendon lengths, Williams Fmax column); greyhound body sizes; segment density 1060 kg/m³ | CC BY 4.0 |
| Brown et al. 2020, Front Bioeng Biotechnol 8:150 | σ = 22.5 N/cm²; canine tissue densities (muscle 1.06 g/cm³); Table 2: 33 pelvic-limb muscle volumes (cm³) of a 5.4 kg Dachshund by CT | CC BY 4.0 |
| Stark et al. 2021, Sci Rep 11:11335 (PMC8166944) | muscle-parameter provenance (Shahar & Milgram + Williams, "linearly scaled to the body mass of a Beagle", 13.8 kg CT subject); GS-model is an illustration model (Laustrëer/Andikfar/Fischer) | CC BY 4.0 (paper); model files MIT (already in repo) |
| Kilbourne & Hoffman 2013, PLoS ONE 8:e78392 | wolf n=7 (30.77 kg), coyote n=2 (11.49 kg) and other canids dissected; whole-limb mass/COM/MOI scaling regressions | CC BY |
| Kyrgyz Taigan morphometrics, Vet Med Sci 2025 (10.1002/vms3.70409) | chest depth/width, circumferences, neck circumference, heights, n=77 | CC BY 4.0 |
| Sled-dog BCS validation, Vet Sci 2025 (10.3390/vetsci12080766) | girths; ultrasound subcutaneous fat at chest/flank/lumbar/thigh; plicometry folds; BCS-palpation wording | CC BY 4.0 |
| Soeratanapant et al. 2024, Vet World 17:2635 | TD/TW thoracic-type definition (broad <0.75, deep >1.25, internal CT); VHS by type | Vet World open access (CC BY) |
| Front Vet Sci 2026 hindlimb MCS (10.3389/fvets.2026.1854592) | thigh muscle/total CSA at F25/F50/F75/tibia; ~206–225 mm²/kg scaling | CC BY 4.0 |
| Animals 2025 lumbar-epaxial attenuation (10.3390/ani15101468) | control lumbar epaxial HU | CC BY 4.0 |
| Animals 2025 lumbar ESP block (10.3390/ani15152157) | erector-spinae composition/position; midline layers (cat cadavers; canine ESP refs) | CC BY 4.0 |
| BMC Vet Res 2026 abdominal fat CT (10.1186/s12917-026-05503-x) | SAT/HWR measurement definitions; 205 dogs | CC BY 4.0 |
| Garbin et al. 2022, Animals 12:2674 | TAP spread in cat cadavers (proxy only) | CC BY 4.0 |

## Facts-only sources (closed / NC / unclear)
Shahar & Milgram 2001 (10.2460/ajvr.2001.62.928; one 23-kg mixed-breed hindlimb) and 2005 (10.1002/jmor.10295; four crossbred forelimbs) · Williams et al. 2008 fore/hind greyhound (10.1111/j.1469-7580.2008.00962.x, …00961.x; their per-muscle data reached us legally through the CC BY PeerJ compilation) · Hudson et al. 2011 cheetah vs greyhound (10.1111/j.1469-7580.2010.01310.x, …2011.01344.x) · Pasi & Carrier 2003 (10.1046/j.1420-9101.2003.00512.x) · Gunn 1978 greyhound 57 % muscle (citation chain second-hand — verify) · Yoshida et al. 2024 epaxial CT (10.1111/jvim.17065, CC BY-NC) · VCOT 2022 cervical paraspinal CT (10.1055/s-0042-1748860, CC BY-NC-ND) · Boström et al. 2022 (10.1016/j.rvsc.2022.03.011) · Theerawatanasirikul 2012 epidermis (10.4142/jvs.2012.13.2.163, CC BY-NC) · Sumena et al. 2025 JIVA skin/fat by breed (10.55296/JIVA/23.2.2025.54-65, licence unclear) · Mendez & Keys 1960 muscle density 1.0597 g/cm³ (classic, no DOI).

## Checks run against repo files (not fetched data)
- `stark_full_bodies.csv`: the "Shepherd-sized" full model's body masses sum to exactly **13.81 kg** — the Beagle's mass.
- Both `.osim` files: all 43 shared muscles have **byte-identical Fmax** (ratio 1.000). The full model's Fmax values are Beagle-scaled, not Shepherd-scaled. Sum of Fmax over the 151 non-placeholder muscles: 22.7 kN.
- Hill-volume check at σ = 0.3 MPa, ρ = 1060 kg/m³, Beagle fibre lengths: 43 forelimb muscles → 776 g = 5.6 % of 13.81 kg per forelimb (greyhound measured 7.3 %, and greyhounds are hypermuscled); ~30 hindlimb muscles → ~874 g = 6.3 % per hindlimb (greyhound measured 6.1 %). σ = 0.3 MPa is confirmed.

## Not found / dead ends
- **Dog abdominal-wall layer thicknesses (mm)**: nothing open. All dog TAP/QL-block papers report dye spread only. Cats and rabbits have measurements; dogs do not.
- **Canid epaxial muscle masses from dissection**: none open. Stark's trunk epaxials are placeholders (1 N / 0.01 m — excluded per fetched/03 NOTE). Lead: E. L. Webster's RVC greyhound-spine work (worktribe 1405533), licence unknown — needs a human.
- **Wolf/coyote per-muscle dissections**: none anywhere (Kilbourne has whole-limb inertials only; its per-species supplement not fetched — on PLOS, could be added later).
- **PMC and Wiley full texts** of Williams/Hudson: bot-blocked; facts only.

Date: 2026-10-08 (session of 2026-10-07 UTC). Written by Scout for Firefly.
