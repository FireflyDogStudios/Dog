# 06-limb-indices: Samuels, Meachen & Sakai 2013 (Dryad doi:10.5061/dryad.77tm4)

- **Source:** Samuels, J.X., Meachen, J.A. & Sakai, S.A. (2013). Postcranial morphology and the locomotor habits of living and extinct carnivorans. *Journal of Morphology* 274: 121-146, doi:10.1002/jmor.20077.
- **Dataset:** "Data from: Postcranial morphology and the locomotor habits of living and extinct carnivorans", Dryad, doi:10.5061/dryad.77tm4, published 2013-01-07, version 1 (last modified 2020-06-24).
  - Landing page: https://datadryad.org/dataset/doi:10.5061/dryad.77tm4
  - API: https://datadryad.org/api/v2/datasets/doi%3A10.5061%2Fdryad.77tm4 and https://datadryad.org/api/v2/versions/13767/files
- **Licence:** **CC0 1.0** (confirmed: the API `license` field is `https://spdx.org/licenses/CC0-1.0.html`). Dryad ships no LICENSE file, so none is stored here.
- **Date fetched:** 2026-10-06.

## What happened (blocked)
The dataset has two files:
- `Carnivore Postcranial Morphology Data Samuels et al. 2013.txt` (50,409 bytes, tab-separated, one row per taxon: about 100+ living species plus fossils)
- `README_for_Carnivore Postcranial Morphology Data Samuels et al. 2013.txt` (1,663 bytes)

Neither could be downloaded:
- `https://datadryad.org/api/v2/files/51902/download`, `.../51903/download` and `.../datasets/.../download` return **401** "Unauthorized, must have current bearer token". Dryad's API now needs an API token, and getting one means logging into a Dryad account.
- The web links `https://datadryad.org/downloads/file_stream/51902` (and `/stash/downloads/...`) return **403** to plain requests. With browser headers they return an "Anubis" proof-of-work bot challenge page. That is a deliberate anti-bot wall, so it was not bypassed. Each was tried 3 times.
- Mirrors checked:
  - Wayback Machine: connection reset or 429, 3 tries.
  - DataONE: metadata only, no data.
  - GitHub code search: no copy of the file.
  - Europe PMC: no open paper republishing it.
  - The CRAN package mvSLOUCH (GPL): its vignette downloads the file at build time, and its shipped `.RData` holds fitted models only, not the data.

## What was extracted
- `dryad_metadata.json`: the dataset's metadata from the Dryad API (CC0): title, authors, abstract, licence, file list with sizes and API links.
- `data.csv`: the **only rows reachable**, 5 canids. They come from the Samuels data (CC0) as printed by `head(dat)` in the built mvSLOUCH vignette, https://cran.r-project.org/web/packages/mvSLOUCH/vignettes/mvSLOUCH_Carnivorans.html (the code that made it is in the vignette source). Only the CC0 numbers were copied, not the GPL package's code or text.
  - **Columns and units** (as the vignette defines them): `HuL` humerus length, `HuPCL` deltopectoral crest length (humerus proximal to the distal end of the deltopectoral crest), `RaL` radius length, all in **mm**. Values are taxon means as given in the data file.
  - `ecology`: the vignette's locomotor category. The vignette renamed species to Wilson & Reeder 2005 (Alopex lagopus -> Vulpes lagopus). Its "generalist" seems to stand for the paper's "terrestrial" class: inferred, not verified.
  - `brachial_index_RaL_over_HuL` was computed here as RaL / HuL, rounded to 3 decimals.
- **Hyena rows: not obtained.**

## Index definitions (for when the file is obtained)
From the paper's abstract: 20 postcranial measurements and 16 functional indices.
- The vignette confirms the column names HuL, HuPCL and RaL; column 2 is the species name and `Ecology` is the locomotor class.
- From memory of the paper, *not verified against the README*, the indices include:
  - shoulder moment index (SMI)
  - brachial index (BI = RaL/HuL)
  - humeral robustness (HRI)
  - humeral epicondylar index (HEB)
  - olecranon length index (OLI)
  - ulnar robustness (URI)
  - manus proportions (MANUS)
  - crural index (CI = tibia/femur)
  - femoral robustness (FRI)
  - gluteal index (GI)
  - femoral epicondylar index (FEB)
  - tibial robustness (TRI)
  - tibial spine index (TSI)
  - pes length index (PES)
- Check these against the README once it is downloaded.

## To finish this item (needs a human)
Download the two files from https://datadryad.org/dataset/doi:10.5061/dryad.77tm4 in a browser (CC0, about 52 KB total) and put them in `/tmp`. An agent can then save the canid and hyena rows here.
