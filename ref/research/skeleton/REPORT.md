# Canid skeleton and skull numbers for the species creator

Research pass by a Firefly research agent, Oct 6, 2026. Saved here by Firefly from the agent's hand-back, because the agent could not write `.md` files itself.

Files:
- `species_numbers.json`: 22 species, each measurement with {value, unit, source, confidence, note}.
- `derived_skeleton_ratios.csv`: per-species bone means and rig ratios.
- `DATA-NOTE.txt`: provenance and licences.

**How this was gathered.** The network only reached GitHub, PyPI and npm. PMC, Wikipedia, ADW, Dryad, journals and museums were blocked. That gives two kinds of number:
1. **Measured skeletons (best):** Chris Law's public GitHub data (Law et al. 2025 IOB; Law 2021 Am Nat). These are caliper measurements of 1–3 adult males per species. The repos have no licence file, so only the agent's own averages and ratios are kept, with citation.
2. **Field-guide ranges (secondary):** search snippets of ADW, Mammalian Species, Mammals of Texas, the Australian Museum, breed standards and Wikipedia. The pages themselves were never opened.

**Confidence:** high = primary data; medium = a reputable secondary range; low = a single snippet, a popular site, or a derived proxy.

## 1. Field body measurements (mm, kg)

PanTHERIA HB = PanTHERIA species-mean head-body length.

| Species | Head-body | PanTHERIA HB | Tail | Shoulder ht | Ear | Hind foot | Weight | Src |
|---|---|---|---|---|---|---|---|---|
| Gray wolf | 1000-1600 | 1055 | 350-560 | 660-840 | 100-145 (Mongolian ssp.) | 160-240 (Mongolian) | M41 F31 | W1 W2 |
| Coyote | 750-1000 | 872 | 300-400 | 580-660 | 90-120 | 165-220 | 6.8-20.9 | C1 C2 |
| Golden jackal | 700-850 | 828 | 250-300 | 400-500 (low) | 69-80 (pop. means) | 146-163 (pop. means) | 8-16 | J1 J2 |
| African wild dog | 760-1120 | 924 | 300-410 | 610-780 | gap | gap | 17-36 | L1 |
| Red fox | 455-900 | 627 | 300-550 | 350-400 (low) | 77-125 | 120-185 | UK M6.5 F5.5 | F1 F2 |
| Dingo | 860-1230 ("body length") | – | 260-380 | 440-620 | gap | gap | 12-24 | D1 |
| Carolina Dog | – | – | – | 457-610 (AKC 451-495) | erect equilateral triangle | – | 16-23 | CD1 AKC |
| Spotted hyena | 950-1650 | 1300 | 250-360 | 700-920 | gap | 257 (2 females) | F55-86 M45-60 | H1 |
| Striped hyena | 850-1300 | 1105 | 250-400 | 600-800 | gap | gap | 22-55 | H2 |
| Raccoon dog | 450-705 | 447 | 130-250 | 380-510 (suspect) | 35-60 (adult male mean 51.3) | 75-120 (mean 112.5) | 4-10 seasonal | R1 R2 |

PanTHERIA mean body mass (kg): wolf 31.8, coyote 12.0, golden jackal 9.7, wild dog 22.0, red fox 4.8, spotted hyena 63.4, striped hyena 35.1, raccoon dog 4.2.

Field ratios from range midpoints (low confidence):

| Species | Shoulder / HB | Tail / HB | Ear / HB | Hind foot / HB |
|---|---|---|---|---|
| Wolf | 0.58 (0.71 with PanTHERIA HB) | 0.35-0.43 | 0.09-0.12 | 0.15-0.19 |
| Coyote | 0.71 | 0.40 | 0.12 | 0.22 |
| Golden jackal | 0.54-0.58 | 0.33-0.36 | ~0.10 | ~0.20 |
| African wild dog | 0.74 | 0.38 | gap | gap |
| Red fox | 0.55-0.60 | 0.63-0.68 | 0.15 | 0.23 |
| Dingo | 0.51 | 0.31 | gap | gap |
| Spotted hyena | 0.62 | 0.24 | gap | 0.20 |
| Striped hyena | 0.63-0.65 | 0.30 | gap | gap |
| Raccoon dog | do not use (impossible range) | 0.33-0.43 | 0.09 | 0.20 |

## 2. Measured limb skeleton (Law et al. 2025; species means in mm)

- FL = humerus + radius + MC3; HL = femur + tibia + MT3.
- HBskel = head + presacral spine + sacrum, from Law 2021. It checks out: wolf HBskel is 1083 mm vs the 1055 mm field mean.

| Species | n | Scap | Hum | Rad | MC3 | Fem | Tib | MT3 | R/H | T/F | MT3/F | FL/HL | FL/HBskel | HL/HBskel |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Gray wolf | 2 | 175.5 | 232.0 | 236.5 | 102.8 | 247.5 | 258.0 | 112.0 | 1.02 | 1.04 | 0.45 | 0.93 | 0.53 | 0.57 |
| Coyote | 3 | 114.0 | 166.3 | 170.7 | 67.8 | 175.0 | 188.7 | 78.1 | 1.03 | 1.08 | 0.45 | 0.92 | 0.51 | 0.55 |
| Golden jackal | 1 | 101.7 | 126.3 | 123.5 | 53.9 | 135.2 | 140.9 | 62.2 | 0.98 | 1.04 | 0.46 | 0.90 | 0.45 | 0.50 |
| Black-backed jackal | 1 | 90.8 | 130.3 | 136.5 | 57.3 | 138.8 | 152.8 | 63.1 | 1.05 | 1.10 | 0.46 | 0.91 | 0.48 | 0.53 |
| Ethiopian wolf | 1 | 122.2 | 175.5 | 175.2 | 69.8 | 185.2 | 191.8 | 83.7 | 1.00 | 1.04 | 0.45 | 0.91 | 0.49 | 0.53 |
| African wild dog | 3 | 146.2 | 173.3 | 188.7 | 80.2 | 196.6 | 205.9 | 89.0 | 1.09 | 1.05 | 0.45 | 0.90 | 0.47 | 0.53 |
| Dhole | 1 | 120.0 | 151.6 | 139.0 | 64.1 | 172.6 | 170.7 | 75.8 | 0.92 | 0.99 | 0.44 | 0.85 | 0.41 | 0.49 |
| Maned wolf | 1 | 153.0 | 253.0 | 271.0 | 117.1 | 271.0 | 305.0 | 135.8 | 1.07 | 1.13 | 0.50 | 0.90 | 0.65 | 0.72 |
| Red fox | 3 | 73.7 | 112.8 | 109.1 | 46.0 | 117.1 | 134.4 | 64.0 | 0.97 | 1.15 | 0.55 | 0.85 | 0.45 | 0.53 |
| Arctic fox | 3 | 73.2 | 107.8 | 103.0 | 41.7 | 109.1 | 126.2 | 54.8 | 0.96 | 1.16 | 0.50 | 0.87 | 0.49 | 0.56 |
| Fennec | 1 | 43.2 | 71.2 | 64.9 | 25.3 | 70.6 | 84.5 | 36.6 | 0.91 | 1.20 | 0.52 | 0.84 | 0.45 | 0.53 |
| Gray fox | 3 | 64.6 | 95.9 | 83.0 | 37.2 | 101.2 | 110.8 | 50.0 | 0.87 | 1.10 | 0.49 | 0.83 | 0.38 | 0.46 |
| Bat-eared fox | 2 | 67.9 | 96.3 | 105.8 | 41.5 | 108.2 | 117.0 | 54.1 | 1.10 | 1.08 | 0.50 | 0.87 | 0.50 | 0.58 |
| Bush dog | 1 | 77.9 | 99.5 | 82.4 | 38.2 | 103.5 | 94.5 | 42.3 | 0.83 | 0.91 | 0.41 | 0.92 | 0.38 | 0.42 |
| Spotted hyena | 2 | 185.9 | 196.8 | 205.7 | 91.7 | 226.0 | 181.6 | 85.4 | 1.05 | 0.80 | 0.38 | 1.00 | 0.42 | 0.42 |
| Striped hyena | 1 | 164.0 | 183.0 | 214.0 | 76.6 | 202.0 | 183.0 | 84.9 | 1.17 | 0.91 | 0.42 | 1.01 | 0.49 | 0.49 |

Medium confidence where n ≥ 2, low where n = 1.

Cross-checks and extra ratios:
- **Published values agree:** spotted hyena R/H 1.08 and T/F 0.82; striped hyena 1.07 and 0.88 (HYIDX).
- **Scapula / humerus:** wolf 0.76, coyote 0.69, wild dog 0.84, red fox 0.65, fennec 0.61, maned wolf 0.60, spotted hyena 0.94, striped hyena 0.90.
- **Olecranon / ulna:** 0.07–0.12 (bush dog 0.16).

Species not in this dataset:
- **Domestic dog:**
  - Limb ratios match wild canids of the same size (Wayne 1986).
  - Beagle scapula = 28.1% of forelimb length; upper arm = 24.8% (BEAGLE).
  - Greyhound bone shafts are 1.48× the length of a pit bull's (KEMP).
- **Dingo:** femur longer than tibia, humerus longer than radius (DINGO-PMC).
- **Raccoon dog:** no limb lengths reached the agent.

OsteoID min–max lengths for scale checks (mm):

| Species | Humerus | Radius | Femur | Tibia | Scapula |
|---|---|---|---|---|---|
| Wolf | 156-268 | 172-246 | 178-275 | 182-288 | 127-193 |
| Coyote | 134-182 | 139-190 | 150-201 | 157-213 | 79-190 |
| Red fox | 97-146 | 90-135 | 111-151 | – | 67-96 |

## 3. Spine

Vertebral formula (cervical-thoracic-lumbar-sacral):

| Species | Formula | Source |
|---|---|---|
| All canids | 7-13-7-3 | LAW25 |
| Spotted hyena | 7-15-5-4 | LAW25 |
| Striped hyena | 7-14-5-3 | LAW25 |
| Raccoon dog | 7-13-7 | RD-VERT |
| Dog | plus 20–23 caudal | IMAIOS |

Caudal counts for wild species: gap.

Segment shares: each is (vertebra count × mean centrum length) / presacral total, centra only.

| Species | Neck % | Thorax % | Lumbar % | Presacral (mm) | Mean rib (mm) | Head (derived, mm) |
|---|---|---|---|---|---|---|
| Wolf | 27.5 | 43.3 | 29.2 | 809 | 237 | 226 |
| Coyote | 29.6 | 41.6 | 28.8 | 583 | 165 | 183 |
| Golden jackal | 29.5 | 41.0 | 29.5 | 496 | 135 | 147 |
| African wild dog | 27.8 | 43.1 | 29.1 | 702 | 217 | 186 |
| Red fox | 28.2 | 41.5 | 30.4 | 442 | 111 | 133 |
| Maned wolf | 32.2 | 40.3 | 27.5 | 742 | 196 | 213 |
| Spotted hyena | 29.9 | 50.9 | 19.2 | 843 | 319 | 245 |
| Striped hyena | 32.1 | 48.2 | 19.7 | 690 | 258 | 218 |
| Raccoon dog | – | – | – | 357 | 95 | 99 |

Rib / HBskel (a chest-depth proxy): canids 0.16–0.23, hyenas 0.27.

## 4. Skull (LAW25)

| Species | CBL (mm) | ZB (mm) | ZB/CBL | BCL/CBL* | COL/CBL* |
|---|---|---|---|---|---|
| Wolf | 253.5 | 142.5 | 0.56 | 0.42 | 0.71 |
| Coyote | 196.0 | 102.4 | 0.52 | 0.42 | 0.69 |
| Golden jackal | 147.1 | 92.3 | 0.63 | 0.45 | 0.71 |
| Ethiopian wolf | 198.4 | 98.9 | 0.50 | 0.41 | 0.74 |
| African wild dog | 190.5 | 131.8 | 0.69 | 0.42 | 0.72 |
| Red fox | 130.3 | 73.6 | 0.57 | 0.46 | 0.71 |
| Fennec | 85.2 | 46.5 | 0.55 | 0.46 | 0.66 |
| Spotted hyena | 232.2 | 163.4 | 0.70 | 0.44 | 0.71 |
| Striped hyena | 220.6 | 160.2 | 0.73 | 0.45 | 0.69 |

\*BCL (braincase length) and COL (jaw-joint-to-canine distance) are the agent's reading of Law's column codes. They have not been checked against the paper's methods; low confidence.

Other skull numbers:
- **Dingo:** pre-1900 CBL 176.9 mm (DINGO-PMC).
- **Raccoon dog:** greatest skull length ~133 mm (snippet).
- **Dog cephalic index** (100 × width / length): dolichocephalic <75, mesaticephalic 75–80, brachycephalic >80. Another scheme uses 51 / 59; there is no single standard (CEPH).
- **Gape:** dingo modelled up to 65°, best bite at 25–35° (GAPE-D). Red fox ~81–84° (low). Wolf, dog and hyena maximum gape: gap.
- **Jaw-joint and ear position:** not sourced.
- **Ear length / head length** (mixes field ear with skull-derived head; low): wolf ~0.5, coyote 0.55, jackal 0.5, red fox 0.75, raccoon dog 0.5.

## 5. Key distinguishing ratios
- **Wolf vs dog:** the same limb ratios at the same size, so the difference is in the head and build. The dingo has shorter lower legs.
- **Fox vs wolf:**
  - shin: tibia/femur 1.15–1.20 vs 1.04
  - foot: MT3/femur 0.50–0.55 vs 0.45
  - forelimb vs hindlimb (FL/HL) 0.84–0.87 vs 0.93
  - scapula/humerus 0.61–0.65 vs 0.76
  - tail 0.63–0.68 of HB vs 0.35–0.43
  - ear ~0.15 of HB vs ~0.1
- **Wild dog:** radius/humerus 1.09; skull width/length 0.69; shoulder 0.74 of HB.
- **Hyena:**
  - forelimb = hindlimb (FL/HL 1.00)
  - tibia/femur 0.80–0.91; MT3/femur 0.38–0.42
  - scapula 0.9 of humerus
  - 15 thoracic + 5 lumbar vertebrae, long thorax
  - rib (chest depth proxy) 0.27 of HB
  - skull width/length 0.70–0.73
  - tail 0.24–0.30 of HB
- **Maned wolf:** the stilt-leg extreme: forelimb 0.65 and hindlimb 0.72 of HBskel, vs wolf 0.53 / 0.57.

## 6. Mapping onto DEN-CANINE-MEASUREMENT-SHEET.md

### Section 5 angles (domestic dog only)

| Angle | Value | Source / confidence |
|---|---|---|
| Shoulder | 119.8° ± 1.2, standing | Anatolian shepherds, ROM-AS; medium |
| Elbow | 124.8° ± 6.3, standing | ROM-AS; medium |
| Stifle | 145° mid-stance (old surgical standard 135°) | STIFLE; high |
| Hip | ~125° "ideal" | SIRIUS; low, breeder lore |
| Front pastern | standing angle not sourced; walking range of the carpus 20–170° | ROM |

Walking ranges for the other joints: elbow 34–145°, shoulder 88–144°.

**Not sourced:** hock, head, neck, tail carriage and ear carriage angles for any species, plus every wild-species angle. Only qualitative notes exist: Carolina Dog ears erect and forward; its tail carriage is not documented (the sheet's fish-hook detail has no source); hyena tail hangs.

### Section 6 proportions
These are proxies (low confidence). They mix field midpoints with skeletal means from different animals.

| Species | Body : height\* | Head : ht (CBL/SH) | Muzzle : skull | Chest : ht (≥) | Elbow : ht (+0.05-0.08) | Tail : ht | Neck : head |
|---|---|---|---|---|---|---|---|
| Wolf | 1.73 | 0.34 | 1.40 | 0.32 | 0.45 | 0.61 | 0.86 |
| Coyote | 1.41 | 0.32 | 1.38 | 0.27 | 0.39 | 0.56 | 0.87 |
| Golden jackal | 1.72 | 0.33 | 1.24 | 0.30 | 0.39 | 0.61 | 1.00 |
| African wild dog | 1.35 | 0.27 | 1.38 | 0.31 | 0.39 | 0.51 | 0.98 |
| Red fox | 1.81 | 0.35 | 1.20 | 0.30 | 0.41 | 1.13 | 0.88 |
| Dingo | 1.97 | – | – | – | – | 0.60 | – |
| Carolina Dog | 1.0 to slightly more (true sheet definition) | – | – | ~0.5 (brisket to elbow) | 0.5 | – | – |
| Spotted hyena | 1.60 | 0.29 | 1.28 | 0.39 | 0.37 | 0.38 | 0.91 |
| Striped hyena | 1.54 | 0.32 | 1.24 | 0.37 | 0.42 | 0.46 | 0.91 |
| Raccoon dog | gap | gap | gap | gap | gap | gap | gap |

How each column is computed:
- **\*Body : height** = head-body length / shoulder height. It includes the head and neck, so the true prosternum-to-ischium ratio is probably ~1.0–1.2.
- **Muzzle : skull** = (CBL − BCL) / BCL.
- **Chest : ht** = rib length / shoulder height, so it is a lower bound.
- **Elbow : ht** = (radius + MC3) / shoulder height. It leaves out carpus, digits and pads, so add ~0.05–0.08.
- **Head : ht** uses bony CBL; add 5–10% for the nose.
- **Neck : head** = cervical centra / CBL.

**Not sourced from the sheet:**
- sections 2–4 (outline points, landmarks, plumb lines)
- the true prosternum–ischium length, chest depth and elbow height for wild species
- nearly everything for the raccoon dog
- section 9 widths, apart from skull width/length

## 7. Gaps
- raccoon dog limbs and shoulder height
- domestic breed bone lengths
- dingo bones (qualitative only)
- caudal counts for wild species
- ear length for the wild dog and hyenas
- maximum gape for wolf, dog and hyena
- jaw-joint and ear landmark positions
- standing angles for wild species

Caveats:
- n = 1–3 males per species.
- Field values came via snippets, not the pages.
- Wide ranges mix populations; that is why the wolf's shoulder/HB swings from 0.58 to 0.71.

## 8. Datasets and licences
**Used but not saved:**
- **Law repositories:** no licence file, so only derived means are kept.
- **PanTHERIA** (via the github.com/FRBCesab/datatoolboxexos mirror): no explicit open licence, so only species means are quoted.
- **akcdata:** the repo is MIT, but its README says the information belongs to the AKC; quoted only.

**Blocked, worth downloading later:**
- Dryad doi:10.5061/dryad.77tm4 (Samuels, Meachen & Sakai 2013 carnivoran limb indices; probably CC0).
- SimTK dog musculoskeletal model (beagle scaling data).
- Sci Data 2024 HRCT scans of 413 canid skulls (figshare).

No permissive file could be downloaded this session.

## Sources
- **LAW25** Law et al. 2025 IOB 7:obaf001. https://academic.oup.com/iob/article/7/1/obaf001/7951992 Data: https://github.com/chrisjlaw/published_data-Law_etal_2025_IOB
- **LAW21** Law 2021 Am Nat. https://doi.org/10.1086/715588 Data: https://github.com/chrisjlaw/published_data-Law_2021_AmNat
- **PAN** Jones et al. 2009 Ecology 90:2648. Mirror: https://github.com/FRBCesab/datatoolboxexos
- **W1** https://westernwildlife.org/gray-wolf-canis-lupus/library-2/ and https://ielc.libguides.com/sdzg/factsheets/graywolf/characteristics-page
- **W2** https://en.wikipedia.org/wiki/Mongolian_wolf
- **C1** https://www.depts.ttu.edu/nsrl/mammals-of-texas-online-edition/Accounts_Carnivora/Canis_latrans.php
- **C2** https://www.dimensions.com/element/coyote
- **J1** https://animaldiversity.org/accounts/Canis_aureus/ and https://www.kora.ch/en/species/golden-jackal/profile
- **J2** https://academic.oup.com/mspecies/article/50/957/14/4972817
- **L1** https://animaldiversity.org/accounts/Lycaon_pictus/ and https://academic.oup.com/mspecies/article/54/1017/seac002/6565923
- **F1** https://animaldiversity.org/accounts/Vulpes_vulpes/ and https://www.wildlifeonline.me.uk/animals/article/red-fox-size
- **F2** Wikipedia "Red fox" (via snippet)
- **D1** https://australian.museum/learn/animals/mammals/dingo/
- **DINGO-PMC** https://pmc.ncbi.nlm.nih.gov/articles/PMC11411105
- **CD1** https://www.ukcdogs.com/carolina-dog and https://ckcusa.com/breeds/carolina-dog/
- **AKC** https://github.com/tmfilho/akcdata
- **H1** https://animaldiversity.org/accounts/Crocuta_crocuta/ and https://academic.oup.com/mspecies/article/53/1000/1/6231977
- **H2** https://en.wikipedia.org/wiki/Striped_hyena
- **HYIDX** Pachycrocuta comparison (via snippet); also https://peerj.com/articles/17405/
- **R1** https://animaldiversity.org/accounts/Nyctereutes_procyonoides/
- **R2** https://link.springer.com/article/10.1186/s40850-026-00260-8
- **RD-VERT** https://pmc.ncbi.nlm.nih.gov/articles/PMC8318798/
- **RD-CT** https://doi.org/10.3390/ani14192827
- **WAYNE** https://pubmed.ncbi.nlm.nih.gov/3754586
- **BEAGLE** https://bmcvetres.biomedcentral.com/articles/10.1186/1746-6148-9-203
- **KEMP** https://dx.doi.org/10.1242/jeb.01814
- **OsteoID** https://boneidentification.com/
- **IMAIOS** https://www.imaios.com/en/vet-anatomy/anatomical-structures/caudal-vertebrae-coccygeal-11073892440
- **CEPH** https://en.wikipedia.org/wiki/Cephalic_index_in_cats_and_dogs
- **GAPE-D** https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0002200
- **ROM-AS** https://pmc.ncbi.nlm.nih.gov/articles/PMC13192051
- **STIFLE** https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9697634/
- **SIRIUS** http://siriusdog.com/angulation-dog/
