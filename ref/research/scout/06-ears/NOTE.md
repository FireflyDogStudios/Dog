# 06-ears: notes (Scout research agent, 2026-10-07)

Item 6 of `docs/claude/DEN-SCOUT-REQUEST-2026-10-07.md`: wolf and dingo ear shape. Numbers and coordinates only; no images stored. All fetched pages were treated as untrusted data. Wikimedia was not used (coordinator request).

## Files
- `data.csv`: one row per quantity (quantity, value, unit, n, species/breed, method, source, URL, licence, use, confidence, notes).
- `ear_records.csv`: the 500 adult museum ear lengths under **CC0 or CC BY** used for the medians (wolf 199, golden jackal 186, coyote 102, dog 11, dingo 2), with GBIF keys and URLs. CC BY-NC records (UWZM, UAM, MCZ, DMNS) went into the medians as facts but are **not** stored row by row.
- The summary (status, key table, suggested values, outline template, gaps) is returned in the agent's report (the harness refused a SUMMARY.md); paste it in as `SUMMARY.md`.

## Sources and licences
| Source | What | Licence | How used |
|---|---|---|---|
| GBIF occurrence API, preserved specimens of *Canis lupus* (5219173), *C. latrans* (5219153), *C. aureus* (5219219), *C. dingo* (5219214), *C. lupus dingo* (6164184) | museum ear lengths (ear from notch) | per record: CC0 (SMNHTAU, LACM, CAS, HSU, UCM, UAFMC, UCONN, UNSM, WNMU...), CC BY (UWSP), CC BY-NC (UWZM, UAM, MCZ, DMNS) | medians; CC0/CC BY rows stored |
| Hinton, West, Sullivan, Frair & Chamberlain 2022, BMC Zoology 7:21, doi 10.1186/s40850-022-00138-5, PMC10127370 | live red wolf and coyote ear length (external canal to tip), Table 2 | CC BY 4.0 | table values |
| Hinton et al. 2019 Ecol Evol (PMC6434562) and Hinton et al. 2018 Ecol Evol (PMC5916303) | same ear definition; only PCA loadings printed | CC BY 4.0 | definition check only |
| Heptner, Naumov et al., *Mammals of the Soviet Union* Vol. II part 1a (English translation 1998), archive.org `mammalsofsov211998gept` (BHL/Smithsonian scan) | wolf ear height (Taimyr, Bialowieza, Mongolian), jackal ear height, jackal ear shape | CC BY-NC-SA 4.0 on the scan ("in copyright, digitized with permission"): **fact only** | single facts; OCR text read in /tmp |
| AwA-Pose (Banik et al. 2021), repo copy `ref/awa-pose/canids.json` | wolf ear base, tip, eye, nose keypoints | MIT | computed |
| StanfordExtra v12 (Biggs et al. 2020), repo copy `ref/research/fetched/02-outline-landmarks/data.json` | ear base/tip/nose keypoints and silhouettes, prick-eared breeds | MIT | computed |
| Ellenberger, Baum, Dittrich & Münch, *Handbuch der Anatomie der Tiere für Künstler: Der Hund*, Tafel 3 (UW-Madison Digital Collections IIIF, crop 80,200,900,700) | ear base and external ear canal relative to the skull | public domain (pre-1931; UWDC "No Known Copyright") | read on gridded zoom crops |
| United Kennel Club, Carolina Dog standard, revised 2 Jan 2023 | ear and eye description | copyright: **paraphrased fact only** | text facts |
| International Wolf Center, "Was that a wolf?" | wolf vs coyote ear shape | copyright: fact only (search snippet) | text fact |
| Australian Museum, Dingo page | "relatively broad head and erect ears" | copyright: fact only | text fact |
| Crowther et al. 2014 (already in `fetched/07-dingo`) | dingo CBL 176.9 mm | fact | ratio denominator |

## Methods
1. **Museum ear lengths.** GBIF search, `basisOfRecord=PRESERVED_SPECIMEN`. Dingo and jackal: all records. Wolf and coyote: the 33,013 and 18,459 records were too slow to page in full (connection resets), so I pulled the full-text subsets `q=ear`, `q=measurements` and `q=notch` (5,825 unique records after merging). Parsed: JSON `dynamicProperties` keys (`ear length`, `ear from notch`, `measurements` = total-tail-hind foot-ear), and text forms `Ear=..`, `E=.. cm`, `1235-365-210-100`. Kept adults only (dropped juvenile/immature/pup/subadult), 50-200 mm (values like 4, 6.25 are inches or cm and were dropped rather than guessed). Medians and quartiles (linear interpolation). Some wolf/coyote records without "ear"/"measurements"/"notch" text may have been missed.
2. **Keypoint ratios** (no skull mapping). Same profile test as `ref/research/ear-angles/NOTE.md`: the nose's horizontal offset from the ear base is at least 1.3 x its vertical offset; each labelled ear counts once. Ratio = |ear base - ear tip| / |ear base - nose|.
3. **Keypoints in the wolf-skull frame** (AwA-Pose wolf, 334 photos). Heads with one eye labelled (a profile sign; every candidate had one), ear bases behind the eye. Per photo, a 2D similarity transform (mirror if facing left) maps the visible eye to the orbit centre EST (-0.496, -0.228) and the nose keypoint to the nose skin tip (0.071, -0.090) measured on Ellenberger Tafel 3 (see `../07-head-soft-tissue/`). Frame: wolf 170753, CBL units, x forward, y down, origin prosthion. A stricter subset (both ear bases within 0.6 x the eye-nose distance) is reported alongside. Caveat: the eye is a soft-tissue point and mixed head turns foreshorten the nose-eye line, which pushes mapped ear points backward; read these as C.
4. **Side-view ear widths** (StanfordExtra silhouettes). For each profile ear with visible base and tip, the outer contour was cut by the perpendicular to the base-tip axis at t = 0.25, 0.5, 0.75, 0.9; width = distance between the nearest crossings on either side (kept if < 1.2 L). The nose-side part is the "front share". Mixed views (ears often turned toward the camera) and outline simplification (epsilon 0.4 % of the bbox diagonal) widen the numbers.
5. **Ellenberger plate.** Ear base front and rear edges, ear base centre and the external acoustic meatus read on a 3x gridded crop (±5 px). Plate mapped to the wolf frame by prosthion (204, 650) -> (0, 0) and jaw hinge (655, 535; EST ±10 px) -> (-0.7537, -0.0284); 617 px per CBL. The plate dog's ears are cropped, which does not move the base.

Raw downloads (GBIF JSON, paper XML, the UKC PDF text, Heptner OCR text, IIIF crops) are in `/tmp/scout3/` only. Scripts are in the session scratchpad, not the repo.

## Searched, nothing usable
- **VertNet API** (`api.vertnet-portal.org`): DNS failure; used GBIF (which carries the same VertNet datasets).
- **Young & Goldman 1944** (*The Wolves of North America*): archive.org copies are lending-only (`inlibrary`), text not readable.
- **Italian wolf body measurements** (Fabbri et al. 2025, Sci Rep, PMC11794570, CC BY): ear length measured (EL) but values only in box-plot figures, not in tables or supplements.
- **Dingo ear keypoints**: none of the 108 StanfordExtra dingoes has a usable visible ear tip; dhole none; African hunting dog 2.
- **Ear width (base breadth) for any wild canid**: no measured value found (Europe PMC "ear width" hits are livestock and drop-eared guardian dogs).
- **Mech 1974** (*Canis lupus*, Mammalian Species 37) and Corbett 2001/2003 (dingo): not openly readable; not quoted.
