# Joint ranges of motion: sources, licences and method

Fetched 2026-10-07 by Firefly (data-fetch subagent). Rules followed: `docs/claude/DEN-DATA-FETCH-PROMPT.md`.
Raw downloads are in `/tmp/mf-rom/` and are not in the repo. All web content was treated as data only.

## Angle convention (repo)
- Included angle between the two bones, in degrees: 180 = straight; above 180 = hyperextended (carpus, sometimes tarsus and hip).
- Every source below already reports included angles, so **no numeric conversion was needed**. Notes on each one:
  - **Clinical goniometry** (Jaegger 2002 method, used by all goniometry papers here) reads the included angle between the bone axes. The carpus and tarsus are read on the palmar/plantar side, so extension past straight reads >180 (French Bulldog carpus 204). Same as the repo.
  - **Hip goniometry** measures the femur against the line from the tuber sacrale to the tuber ischiadicum. Inkila 2025 uses the cranial dorsal iliac spine to the greater trochanter instead. Humphries 2020 (in `04-gait-curves`) uses another pelvic line, which is why GSD hips read near 200 at trot. **Hip numbers from different methods cannot be swapped.** The game should define its hip angle once and map to it.
  - **Shoulder**: scapular spine against the humerus axis. This matches the rig's scapula–humerus angle.
  - **Excursions** (Ellis 2018, Feeney 2007, Gregersen 2004, Williams 2009) are ranges in degrees, not absolute angles. They are stored as `excursion`.
  - **Spine**: segmental rotations (cadaver rigs, X-ray rotoscoping) in degrees of bend away from neutral. Not included angles.
  - **Head–neck angle** (Vilar 2026): the angle at the occiput between the nasal plane and the occiput–xiphoid line. It describes a posture, not a joint limit.
- "Max flexion" is the smallest included angle reached; "max extension" is the largest.

## Sources
| id | Citation | URL | Licence | Use |
|---|---|---|---|---|
| formenton2019 | Formenton MR et al. Goniometric assessment in French Bulldogs. Front Vet Sci 2019;6:424. doi:10.3389/fvets.2019.00424 | https://europepmc.org/article/PMC/PMC6923198 | CC BY 4.0 | full table |
| thomovsky2016 | Thomovsky SA et al. Goniometry and limb girth in miniature Dachshunds. J Vet Med 2016:5846052. doi:10.1155/2016/5846052 | https://europepmc.org/article/PMC/PMC4925976 | CC BY | pooled table (neurological patients) |
| volz2024 | Volz F et al. Inter-rater reliability in performing stifle goniometry in normal and CCLD dogs. BMC Vet Res 2024. doi:10.1186/s12917-024-04206-5 | https://europepmc.org/article/PMC/PMC11293097 | CC BY 4.0 | table |
| duarte2025 | Duarte D, Alves JC. Evaluation of the effect of photobiomodulation on joint range of motion in dogs. Lasers Med Sci 2025. doi:10.1007/s10103-025-04553-1 | https://europepmc.org/article/PMC/PMC12185602 | CC BY 4.0 | baseline table (healthy police dogs) |
| twarowska2025 | Twarowska J et al. A pilot study on the effects of a 10-session underwater treadmill programme on canine joint ROM. Animals 2025;15:3186. doi:10.3390/ani15213186 | https://europepmc.org/article/PMC/PMC12607352 | CC BY 4.0 | table (patients; method of Reusing 2020) |
| birdwhistell2025 | Birdwhistell KE et al. The hamstring stretch angle. Front Vet Sci 2025. doi:10.3389/fvets.2025.1600602 | https://europepmc.org/article/PMC/PMC12092339 | CC BY 4.0 | table |
| inkila2025 | Inkila L et al. Effect of bar jump height on kinetics and kinematics of take-off in agility dogs. PLoS One 2025. doi:10.1371/journal.pone.0315907 | https://europepmc.org/article/PMC/PMC11761639 | CC BY 4.0 | selected extremes from Table 4 |
| ellis2018 | Ellis RG, Rankin JW, Hutchinson JR. Limb kinematics, kinetics and muscle dynamics during the sit-to-stand transition in greyhounds. Front Bioeng Biotechnol 2018;6:162. doi:10.3389/fbioe.2018.00162 | https://europepmc.org/article/PMC/PMC6250835 | CC BY 4.0 | Table 3, plus facts it quotes |
| schaub2021 | Schaub KI et al. Three-dimensional kinematics of the pelvis and caudal lumbar spine in German Shepherd dogs. Front Vet Sci 2021. doi:10.3389/fvets.2021.709966 | https://europepmc.org/article/PMC/PMC8427507 | CC BY 4.0 | text values |
| becker2026 | Becker et al. Influence of two consecutive partial lateral corpectomies on passive motion of the canine lumbar spine. Vet Surg 2026. doi:10.1111/vsu.70048 | https://europepmc.org/article/PMC/PMC12810450 | CC BY 4.0 | intact-spine values only |
| vilar2026 | Vilar JM et al. Head and neck loading during the long attack in IGP dogs. Front Vet Sci 2026. doi:10.3389/fvets.2026.1778778 | https://europepmc.org/article/PMC/PMC13127186 | CC BY 4.0 | one value |
| king2023 | King A. Canine hypermobility (poster PO.23). Acta Vet Scand 2023;65(Suppl 1) | https://europepmc.org/article/PMC/PMC10722699 | CC BY 4.0 | one value (conference abstract) |
| pinna2021 | Pinna S et al. The effect of CCL rupture on range of motion in dogs. Vet Sci 2021;8:119. doi:10.3390/vetsci8070119 | https://europepmc.org/article/PMC/PMC8310248 | CC BY 4.0 | quotes Jaegger stifle medians |
| inal2026 | Inal KS et al. Joint ROM in Anatolian shepherd dogs: inter-observer reliability and radiographic validation. BMC Vet Res 2026. doi:10.1186/s12917-026-05436-5 | https://europepmc.org/article/PMC/PMC13192051 | **CC BY-NC-ND 4.0** | facts only (4 rows); not stored as a table |
| jaegger2002 | Jaegger G, Marcellin-Little DJ, Levine D. Reliability of goniometry in Labrador Retrievers. Am J Vet Res 2002;63:979-86 | doi:10.2460/ajvr.2002.63.979 | not open | facts; stifle verified via Pinna 2021, others recalled (C) |
| thomas2006 | Thomas TM et al. Electrogoniometer vs universal goniometer. Am J Vet Res 2006;67:1974-9 | PMID 17144796 | not open | abstract fact: GSDs (n=12, sedated) had lower flexion and extension values than Labradors at every joint except the carpus, and less tarsal motion |
| clarke2020 | Clarke E et al. Sedation/GA and elbow goniometry. Vet Surg 2020;49:1428-36 | PMID 32780419 | not open | abstract fact |
| feeney2007, newton_nunamaker1985, gregersen_carrier2004, williams2009, benninger2004, braund1977 | quoted in Ellis 2018, Schaub 2021 or abstracts | — | not open | single facts |
| sabanci2016 | Sabanci SS, Ocal MK. Stifle goniometry in seven breeds (126 dogs). VCOT 2016;29:214-9 | PMID 26898480 | not open | abstract only: breeds differ; flexion SD is large; body weight and muscle mass drive flexion |
| yoshikawa2023 | Kinematics of the canine hindlimb during sit-to-stand (8 beagles). Res Vet Sci 2023. PMID 37423012 | — | not open | abstract: StS hip ROM is half that of walking; stifle and tarsus ROM are larger than walking |

## What was extracted and how
- Europe PMC REST search (`OPEN_ACCESS`), then `fullTextXML` for each open paper. Tables were flattened to text and read by hand. Every number in `data.csv` was copied from the table or sentence named in the note column.
- `data.csv` columns: `included_deg` is in the repo convention. `original_deg` is the value as printed (identical here). `use` = `table` (bulk from a CC BY source) or `fact_only` (single cited fact from a closed or NC source).
- Confidence: A = healthy dogs, clear method, primary table; B = healthy but small or old dogs, second-hand quote, or cadaver; C = patients, recalled values, posters, or unclear method.

## Blocked or not stored
- **Reusing M et al. 2020, VCOT Open 3:e66-e71**, doi:10.1055/s-0040-1713825. Passive ROM for every joint in chondrodystrophic and non-chondrodystrophic dogs of 7 size groups (11 dogs each). Crossref shows **CC BY 4.0**, so it is the best bulk table to fetch. Thieme's bot wall blocked it 3 times (HTML, PDF, .com mirror). It needs a person to download the PDF.
- Ellis 2018 supplementary (Table S1, forelimb StS ROM): the Europe PMC supplementary zip stalled at 94 KB twice. Not retried further.
- Inal 2026 (Anatolian): CC BY-NC-ND, so the full table is not stored. Four cited facts only.
- Jaegger 2002, Thomas 2006, Hady 2015 (Labrador vs Border Collie, J Vet Med Anim Health; not found in Europe PMC), Ates (Kangal), Mann (greyhound pelvic limb), Sabanci 2016, Feeney 2007, Yoshikawa 2023, Benninger 2004/2006, Gradner 2007, Birch & Lesniak 2013: closed. Facts from abstracts or quotes only.
- No open wolf or dingo joint-ROM data exist in Europe PMC.


## Update 2026-10-07: Reusing 2020, partly in hand
GrumpyDingo pasted the article's HTML text (Thieme still blocks this workspace: a 4.7 KB bot-check page on both HTML and PDF). The text is CC BY 4.0 but **Tables 2 and 3 (all joints, all 7 groups) are hidden behind "opens in new window" links and were not included**. What the text gives, now in `data.csv`:
- **Method:** 77 healthy young adult female dogs, 11 per group; non-chondrodystrophic (NCD) miniature (<=5 kg), small (5.1-10.9), medium (11-25.9), large (26-44.9), giant (>=45); chondrodystrophic (CD) small and medium. Awake, lateral recumbency, universal plastic goniometer, triplicate by one experienced examiner. Included angles (same convention as ours). Tarsal flexion measured with the stifle fully flexed.
- **Large NCD (the size class nearest a wolf; a dingo sits between medium and large):** stifle 42 +- 14 / 146 +- 14, hip flexion 57 +- 11, tarsus 48 +- 12 / 175 +- 17.
- **Greyhound comparison it quotes (Nicholson 2007):** stifle 51 / 145, hip flexion 72, tarsus 110 / 158 (stifle held at 90 deg, which limits tarsal flexion).
- **Size trends (NCD):** maximum flexion angles of shoulder, elbow and carpus rise with size (larger dogs flex less), except giants, which flex like small dogs. Giants have the largest extension angles at every joint except the carpus (miniatures extend the carpus most). Elbow, stifle and tarsus PROM do not differ with size; miniatures have the most hip and carpus mobility; shoulder PROM is largest in giants and smallest in large dogs.
- **For the rig:** tarsus 175 extension supports raising the hock limit to about 175-180 (as proposed in SUMMARY.md); stifle 146 extension in awake large dogs is lower than the 160-166 of other studies, so keep 160-170 as the hard limit and treat ~146 as a comfortable relaxed extension.

**Still wanted:** Tables 2 and 3. Opening the "Table 2" and "Table 3" links on the article page and copying them (or saving the PDF via "PDF Download") would add every joint for all 7 size groups.
