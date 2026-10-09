# 07-dingo: dingo, Carolina Dog and other pariah/village dog measurements

Date fetched: 2026-10-06. Every row in `data.csv` carries its own citation, URL, the source's licence and a confidence grade:
- **A:** measured, clear definition.
- **B:** peer-reviewed but second-hand, reconstructed, or a review statement.
- **C:** popular source or breed standard.
- **EST:** derived here.

**No bulk tables were copied.** The only openly licensed (CC0 / CC BY) numbers are:
- the Plazi CC0 treatments;
- Ballard 2019 and Ballard 2023 (CC BY 4.0).

The rest are single facts quoted with citation from sources that are not permissive:
- Koungoulos 2024 (CC BY-NC-ND);
- Crowther 2014 (Wiley, free to read but no open licence);
- the Australian Museum (copyright);
- breed standards and Wikipedia.

Column `stat` gives mean / range / individual / standard / derived.

## Sources used
1. **Koungoulos LG, Hulme-Beaman A, Fillios M & Willandra Lakes Region World Heritage Aboriginal Advisory Group (2024).** "Phenotypic diversity in early Australian dingoes revealed by traditional and 3D geometric morphometric analysis." *Sci Rep* 14. doi:10.1038/s41598-024-65729-3, PMC11411105. Licence CC BY-NC-ND 4.0, so only facts were taken.
   - Modern dingo shoulder height, reconstructed from limb bones with Harcourt (1974): n = 117, 46.37-61.50 cm, mean 54.22 cm. The printed SD of 29.87 cm is implausible.
   - Estimated body mass: n = 95, mean 14.25 ± 1.69 kg.
   - New Guinean canids: height n = 12; mass n = 20.
   - The supplements (Springer static-content) hold only the equations (as images) and R code. **No individual limb-bone lengths are published.**
2. **Crowther MS, Fillios M, Colman N & Letnic M (2014).** "An updated description of the Australian dingo (*Canis dingo* Meyer, 1793)." *J Zool* 293: 192-203. doi:10.1111/jzo.12134.
   - Wiley "bronze" free-to-read access under Wiley's own terms, with no open licence, so six individual means were quoted and the 12-row Table 2 was not copied.
   - Wiley (onlinelibrary.wiley.com, pdfdirect and full text) returned 403, 3 tries. The text was read from a copy at https://savefraserislanddingoes.com/wp-content/uploads/2014/04/canis-dingo.pdf; the citation points to the publisher DOI.
   - Measurement definitions follow its Table 1 (von den Driesch 1976 / Corbett 1995).
3. **Ballard JWO & Wilson LAB (2019).** "The Australian dingo: untamed or feral?" *Front Zool* 16: 2. doi:10.1186/s12983-019-0300-6, PMC6373076. CC BY 4.0. Gives averages of 55 cm shoulder height, 123 cm length and 15 kg (secondary, citing Smith 2015, Crowther 2014 and Jackson 2017).
4. **Ballard JWO et al. (2023).** "The Australasian dingo archetype..." *GigaScience* 12: giad018. PMC10353722. CC BY 4.0. The Alpine dingo "Cooinda", female: 22 kg, 46 cm at the withers.
5. **Australian Museum, "Dingo" fact sheet** (Sue Burrell, Dr Mark Eldridge; updated 26/05/26), https://australian.museum/learn/animals/mammals/dingo/. © Australian Museum; ranges quoted. Shoulder height 440-620 mm; body length 860-1230 mm; tail 260-380 mm; mass 12-24 kg.
6. **Smith BP (ed.) 2015, *The Dingo Debate*, ch. 1 (CSIRO).** Quoted second-hand via Wikipedia "Dingo" (raw wikitext). Sex-specific wild and captive means; confidence C.
7. **Parnaby HE, Ingleby S & Divljan A (2017).** Type specimens of non-fossil mammals in the Australian Museum. *Rec Aust Mus* 69. Plazi taxonomic treatments on Zenodo, **CC0**: 10.5281/zenodo.7562786 (*Canis hallstromi* holotype, New Guinea singing dog) and 10.5281/zenodo.5238002 (*C. f.* var. *papuensis* holotype, Papuan village dog). Cranial measurements in mm:
   - GL greatest length
   - ConL condylobasal length
   - ZB zygomatic breadth
8. **Carolina Dog Fanciers of America breed standard (2022 edit, AKC Foundation Stock Service).** PDF on the AKC CDN (URL in the CSV). Breed-standard facts, confidence C:
   - height 18-24 in (converted at 25.4 mm/in to 457-610 mm);
   - weight 35-50 lb (× 0.4536 = 15.9-22.7 kg);
   - muzzle ≈ cranium length;
   - pastern 15-20°;
   - alert tail at 45° above horizontal.
   The UKC height (17.75-19.5 in) comes from the Wikipedia infobox; ukcdogs.com was reachable but not parsed.
9. **Derived (EST):** dingo humerus, radius, femur and tibia lengths, found by inverting Harcourt's (1974) shoulder-height equations at the Koungoulos mean height of 542.2 mm.
   - Coefficients recalled from memory: humerus 3.43x - 26.54; radius 3.18x + 19.51; femur 3.14x - 12.96; tibia 2.92x + 21.62 (mm). **Correction (Oct 7):** the tibia intercept is **+9.41**, verified from CC BY papers in `../../missingfound/dingo-limb-bones/NOTE.md` (tibia estimate now 182.5 mm); the +21.62 above was a recall error.
   - Placeholders only. **Verify against Harcourt 1974 before use.**

## Conversions
- cm × 10 = mm; in × 25.4 = mm; lb × 0.4536 = kg.
- The Carolina Dog pastern angle is given as deviation from vertical, so it is about 160-165° included at the carpus in the wolf.yaml convention (180 = straight).

## Searched, nothing usable
- **Dingo limb-bone lengths:** no open source with measured humerus, radius, femur or tibia lengths was found.
  - Searched: Europe PMC; Letnic, Fillios & Crowther 2012 PLOS ONE (PMC3342279), whose supplements list specimens only; Law et al. 2025 data (no dingo); Dryad (35 dingo datasets, all ecology or genetics); Zenodo.
  - Smith et al. 2019 and Jackson et al. 2017 (*Zootaxa*) are restricted.
- **Dingo ear length:** not found in any open source.
- **Carolina Dog:** no skeletal or morphometric study exists in open literature. Brisbin & Risch 1997 (*JAVMA*) is not open and has no measurement table. Breed standards only.
- **Indian pariah dog / INDog:** no open morphometric paper found in Europe PMC.
