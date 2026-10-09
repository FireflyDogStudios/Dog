# 06-limb-indices: Samuels, Meachen & Sakai 2013 (Dryad doi:10.5061/dryad.77tm4)

- **Source:** Samuels, J.X., Meachen, J.A. & Sakai, S.A. (2013). Postcranial morphology and the locomotor habits of living and extinct carnivorans. *Journal of Morphology* 274: 121-146, doi:10.1002/jmor.20077.
- **Dataset:** "Data from: Postcranial morphology and the locomotor habits of living and extinct carnivorans", Dryad, doi:10.5061/dryad.77tm4, published 2013-01-07, version 1 (last modified 2020-06-24).
  - Landing page: https://datadryad.org/dataset/doi:10.5061/dryad.77tm4
- **Licence:** **CC0 1.0** (the Dryad API `license` field is `https://spdx.org/licenses/CC0-1.0.html`; see `dryad_metadata.json`). Dryad ships no LICENSE file, so none is stored here.
- **How obtained:** the Dryad API needs a login token and the web download sits behind an anti-bot wall, so on 2026-10-06 GrumpyDingo downloaded the dataset zip by hand in a browser (`dryad.zip`, 52,544 bytes, two files dated 2019-07-02). An agent unzipped it in `/tmp` and made the files below the same day.

## Files
| File | What | Size |
|---|---|---|
| `samuels2013_full.txt` | The whole Dryad data file, byte for byte (tab-separated, CRLF, Latin-1). 150 taxa: 115 living, 35 fossil (family names starting `x`). | 50,409 B |
| `README_dryad.txt` | The Dryad README, byte for byte (Windows-1252: the dashes are byte 0x96). | 1,663 B |
| `data.csv` | All Canidae (20), Hyaenidae (4) and fossil xCanidae (13) rows: 37 rows. The original columns (whitespace trimmed), plus `status` (living/fossil) and the `calc_*` columns computed here. | 16 KB |
| `dryad_metadata.json` | Dryad API metadata (title, authors, abstract, licence, file list). | 4 KB |

## Columns and units
- All measurements are lengths in **mm**, one row per taxon (the taxon mean as given in the file). Empty cells are missing in the source.
- The **README defines only the 37 measurement columns** (ScL ... rph3t; copied verbatim in `README_dryad.txt`). For example: `HuL` greatest length of the humerus, `RaL` greatest length of the radius, `UlOL` ulna olecranon process length, `MC3L` greatest length of the 3rd metacarpal, `FeL` greatest femur length, `TiL` greatest length of the tibia, `MT3L` greatest length of metatarsal 3, `fph3p/m/t` and `rph3p/m/t` the proximal, medial and terminal phalanges of digit 3 of the manus (fore) and pes (hind).
- `Ecology` is the file's own locomotor class (arboreal, cursorial, generalist, ...; blank for fossils). The earlier note guessed that "generalist" was the mvSLOUCH vignette's renaming; it is in fact the file's own label.
- The file names the arctic fox *Alopex lagopus* (now *Vulpes lagopus*).

## Index definitions (corrected; replaces the earlier from-memory list)
The README does **not** define the 16 index columns at the end of the file. The formulas below were recovered by testing every ratio of measurement columns against each index column across all 150 rows. The match rate is the share of rows within 0.2% (or within 1% where marked). They are not exact for every row because the file's indices seem to be averaged per specimen, while the measurements are taxon means.

| Column | Formula (from the data) | Match | Meaning |
|---|---|---|---|
| SMI | HuPCL / HuL | 99% | shoulder moment index |
| BI | RaL / HuL | 84% (93% at 1%) | brachial index |
| HRI | HuMLD / HuL | 98% | humeral robustness |
| HEI | HuEB / HuL | 96% | humeral epicondylar index |
| OLI (label) | UlMLD / (UlL - UlOL) | 99% | **this is ulnar robustness** |
| URI (label) | UlOL / (UlL - UlOL) | 94% | **this is the olecranon length index** |
| MANUS | fph3p / MC3L | 78% (85% at 1%) | manus proportions |
| CLAW | fph3t / rph3t | 79% at 1% | fore vs hind claw (terminal phalanx) length |
| CI | TiL / FeL | 86% (96% at 1%) | crural index |
| FRI | FeAPD / FeL | 99% | femoral robustness |
| GI | FeGTH / FeL | 93% | gluteal index |
| FEI | FeB / FeL | 97% | femoral epicondylar index |
| TRI | TiMLD / TiL | 99% | tibial robustness |
| TSI | TiSL / TiL | 89% | tibial spine index |
| PES | MT3L / FeL | 73% (91% at 3%) | pes length index |
| IM | (HuL + RaL) / (FeL + TiL) | 93% at 1% | intermembral index |

- **The OLI and URI headers look swapped.** By their formulas, the column headed `OLI` holds ulnar robustness and `URI` holds the olecranon length index. The headers are kept as in the file. `data.csv` adds both recomputed under unambiguous names.
- **Cuon alpinus (dhole):** the file's BI (0.860) and IM (0.846) disagree with its own measurement means (RaL/HuL = 0.940, IM = 0.882). The cause is unknown (perhaps a specimen-level issue in the source). Prefer the `calc_*` values for the dhole and flag it.

## Computed columns in data.csv (`calc_*`, rounded to 4 places, from the taxon-mean measurements)
`calc_brachial_RaL_HuL`, `calc_crural_TiL_FeL`, `calc_MC3L_RaL` (metacarpal/radius), `calc_MT3L_TiL` (metatarsal/tibia), `calc_MC3L_HuL`, `calc_MT3L_FeL`, `calc_ScL_HuL` (scapula/humerus), `calc_intermembral_HuRa_FeTi`, `calc_fore_len_HuRaMC3` and `calc_hind_len_FeTiMT3` (mm, sums of three bones), `calc_fore_hind_HuRaMC3_FeTiMT3`, `calc_olecranon_UlOL_over_UlL_minus_UlOL`, `calc_ulnar_robust_UlMLD_over_UlL_minus_UlOL`.

## Checks
- The 5 rows stored earlier (from the mvSLOUCH vignette) match the file exactly in HuL, HuPCL and RaL: *Canis adustus*, *C. latrans*, *C. lupus*, *Alopex lagopus* and *Atelocynus microtis*. The earlier brachial values were RaL/HuL (for example wolf 0.994). The file's own BI column gives 0.998 for the wolf.
- The `calc_*` brachial, crural and intermembral values agree with the file's BI, CI and IM within 2% for every row except the dhole (see above).
