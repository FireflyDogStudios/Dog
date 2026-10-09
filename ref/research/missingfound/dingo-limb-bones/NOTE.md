# dingo-limb-bones: note

Date: 2026-10-07. Gap hunted: measured limb-bone lengths (scapula, humerus, radius, ulna, MC3, femur, tibia, MT3; greatest length GL after von den Driesch 1976) for the dingo, Carolina Dog or any pariah / village / aboriginal-type dog. Also: verify the Harcourt (1974) withers-height formulas that `07-dingo` recalled from memory.

Every row of `data.csv` has its value, unit, n, sex, specimen/context, citation, URL, the source's licence and a confidence grade:
- **A:** measured, clear definition, read from the source.
- **B:** measured but second-hand or with an unexplained detail.
- **EST:** derived here.

Raw downloads stayed in `/tmp/mf-bones/` and none were copied into the repo.

## Sources used
1. **Baranowski P (2025).** "Morphological and Metric Analysis of Medieval Dog Remains from Wolin, Poland." *Animals* 15: 2171. doi:10.3390/ani15152171, PMC12345418. **CC BY 4.0.**
   - Its Table 8 prints Harcourt's (1974) five equations (tl = GL, mm):
     - humerus: SH = 3.43 GL − 26.54
     - radius: SH = 3.18 GL + 19.51
     - ulna: SH = 2.78 GL + 6.21
     - femur: SH = 3.14 GL − 12.96
     - tibia: SH = 2.92 GL + 9.41
   - It also prints the Koudelka factors (via Lasota-Moskalewska): scapula 4.06, humerus 3.37, radius 3.22, ulna 2.67, femur 3.01, tibia 2.92.
2. **Onar V, Siddiq AB, Pazvant G et al. (2021).** "The Iron Age Dogs from Alaybeyi Höyük, Eastern Anatolia." *Animals* 11: 1163. PMC8073760. **CC BY 4.0.**
   - Tables 4 and 5: individual GLs and SH "using the multipliers of Harcourt (1974)".
   - It also gives two single skeletons from Van-Yoncatepe (graves M5, M6) and the mean of 18 modern breeds (Table 6).
   - These are the only openly licensed **complete limb sets from single individuals** found for any unimproved, landrace-type dog.
3. **Koungoulos LG et al. (2024).** *Sci Rep* 14 (PMC11411105), CC BY-NC-ND.
   - Fact only: 117 modern dingoes, SH reconstructed from limb bones with Harcourt, 463.7-615.0 mm, mean 542.2 mm.
   - Ancient Willandra dingoes were about 400-475 mm; 12 New Guinea canids were 332-418 mm.
4. **Koungoulos L, Fillios M et al. (2023).** "Dingoes, companions in life and death..." *PLOS ONE* 18: e0286576. PMC10588905. **CC BY 4.0.**
   - Curracurrang burial 1CU5/16 (about 2000 BP): SH 49.89 cm by Harcourt from long bones.
   - Sydney-region modern dingoes: SH 47.39-59.51 cm, mean 53.66 ± 3.56 cm. This cites Koungoulos's 2022 PhD thesis.
   - **No individual bone GLs are printed.**
5. **LACM Vertebrates via GBIF.** Occurrences 1065354700 and 1065381998. **CC0.**
   - Two wild male dingoes, 319 km WSW of Cunnamulla, Queensland.
   - Field measurements (total-tail-hind foot-ear): 1235-365-210-100 and 1215-340-195-90 mm; 17.2 and 16.3 kg.
   - These are not bones, but they fill the dingo ear-length gap left in `07-dingo`.

## Method
- **Harcourt verification.**
  - Wolin prints the coefficients.
  - Independent check: recompute Alaybeyi's printed SH from its printed GLs.
    - ALB No.1, mean of H, R, Fe and Ti: 609.0 mm vs printed 60.90 cm.
    - ALB No.2 humerus: 574.6 vs 57.46.
    - ALB No.4 humerus: 594.6 vs 59.46.
    - ALB No.5 radius: 604.3 vs 60.43.
    - ALB No.7, mean of five bones: 644.0 vs printed 64.23. This is close; the authors probably averaged slightly differently.
  - **The old tibia intercept (+21.62) in `07-dingo` was wrong.** The correct value is +9.41. With +21.62, ALB No.1 would come out at 611.9 mm and no longer match.
  - The other three recalled coefficients (humerus, radius, femur) were right.
- **Inversion.** GL = (SH − b) / a for each Harcourt bone, at the Koungoulos mean (542.2 mm), min (463.7) and max (615.0). The same is done for the Curracurrang dingo (498.9), the wild means (M 590, F 560) and the New Guinea mean (375).
  - Because Koungoulos's SH values were themselves made from limb GLs with these same linear equations, inverting the mean gives the sample's bone-length level (exactly, if every dingo contributed the same bone). The regression's own error does not apply to this step.
  - What it cannot recover is **dingo proportions**. Inverting all five equations at one height returns the proportions of Harcourt's British reference dogs. So R/H, T/F and similar ratios from the EST rows are circular and are not dingo data.
- **Error band.**
  - Harcourt's own standard errors were **not found** in any open source; the 1974 paper is closed (Elsevier, OpenAlex "closed").
  - Two proxies are given instead:
    1. **Method spread.** The Koudelka factors give a humerus about 5 mm shorter and a radius, ulna, femur and tibia about 3-10 mm longer than Harcourt at the same SH.
    2. **Bone-to-bone disagreement inside one dog.** Alaybeyi ALB No.7 spans 632-659 mm across its five bones, a ±2% spread.
  - Together: ±25 mm of SH moves each bone by ±7-9 mm.
- **Ratios** (radius/humerus, tibia/femur, femur/humerus, ulna/radius, (H+R)/(F+T)) were computed only for single individuals with complete limb sets (Alaybeyi ALB 1 and 7, Yoncatepe M5 and M6).

## Searched, nothing usable (or blocked)
- **Europe PMC** (several queries: dingo + humerus/femur, Carolina dog, pariah/village/free-ranging dog + humerus, non-descript/indigenous dog osteometry, pre-Columbian and Pacific dogs, "greatest length" + dog). No paper prints measured dingo, Carolina Dog, pariah or village dog limb-bone GLs.
  - Cis-Baikal (PMC3656967, CC BY) has its long-bone tables only as images, of large northern dogs and wolves.
  - The Roman dogs paper (PMC10575936) gives only SH per bone.
- **Koungoulos 2022 PhD thesis** ("The natural and cultural history of the dingo: a 3D geometric morphometric investigation", University of Sydney). This is the most likely source of the 117 dingo GLs. ses.library.usyd.edu.au returned a Cloudflare challenge, and its DSpace API returned 403 (3 tries). **Needs a human browser.**
- **Open Context:** Anubis bot wall (3 tries, including WebFetch). **tDAR:** needs a login for data; not tried.
- **Zenodo:**
  - No dog or dingo limb dataset. Hits were genetics, Plazi figures and Dwyer et al. 2021 (New Ireland dog, CC BY, cranial only).
  - The CC0 Plazi treatments for *C. hallstromi* and *C. f. papuensis* were already used in `07-dingo`.
- **Dryad:**
  - Carnivoran limb datasets were found: Martín-Serra 2014 (m8440, 8h6nf), Law "mosaic" (c2fqz61gf), Law "long-fuse" (z8w9ghxrz).
  - File downloads return 401 without a login. They probably hold no dingo anyway; Law's GitHub rawdata was checked and has no dingo or *C. familiaris*.
- **MorphoSource:** 19 dingo media, all teeth or turbinals. No limb scans.
- **GBIF / ALA:** about 4,100 dingo/dog preserved specimens (ANWC, Australian Museum, WAM, QM, SAM...). No bone measurements in the records; only LACM has external measurements. GBIF connections were intermittently reset.
- **Museums Victoria API:** Cloudflare 403 (3 tries).
- **Valsgärde dogs paper** (DiVA, JAS Reports 2021) and **Edinburgh ERA:** DiVA returned connection reset and 503 (3 tries). The ERA thesis (Gunn 1975) is about muscle and has no pariah dogs.
- **Carolina Dog:** still no skeletal data anywhere.
- **Indian pariah / INDog, Basenji, Canaan dog, NGSD:** no open limb-bone measurements. Alaybeyi's breed list includes one Canaan dog, but only pooled.
