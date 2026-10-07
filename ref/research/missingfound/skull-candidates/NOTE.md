# Skull candidate harvest: method note

Date: **2026-10-07**. Collected by Firefly, metadata only.
No mesh or volume was downloaded. The only file contents read were tiny metadata files, kept in the scratchpad and not stored in the repo:
- the Czeibert specimen list xlsx (39 KB)
- the Meloro specimen list xlsx (54 KB) and the NTS header

All web content was treated as untrusted data.

## Sources and queries

1. **Open Forest Data (Dataverse)**: `https://dataverse.openforestdata.pl/api`
   - Searches: `/search?q=<term>&type=dataset&per_page=100`, with these terms: Canis, Vulpes, Urocyon, Nyctereutes, Lycaon, Crocuta, Hyaena, Parahyaena, Proteles, Lupulella, Canidae, Hyaenidae, Alopex, dingo, jackal, fox, wolf. Also `q=dwcFamily:Canidae` (34 hits) and `q=Carnivora` (161; no Hyaenidae).
   - Subtree listing: `/search?q=*&subtree={3D,skull,ct}&type=dataset`. The `zoo` subtree listing at per_page=1000 timed out, so the family search was used to cover it.
   - Per dataset: `/datasets/:persistentId/?persistentId=doi:...`. This gave termsOfUse, the dwc* metadata (catalogue number, sex, life stage, locality, date) and the files (name, size, id, restricted).
2. **Sketchfab API v3**
   - `GET /v3/search?type=models&q=<q>[&license=by|cc0]&count=24`. The first pass covered 47 queries, with and without filters. The second pass covered 38 queries, up to 4 pages each with `license=by` and `license=cc0`. In all, 1245 models were seen.
   - Every candidate whose name looked like a skull of a target taxon was confirmed with `GET /v3/models/{uid}`, which gives `license.slug`, `isDownloadable`, `faceCount` and the description: 291 models.
   - MRI PAS account: `GET /v3/models?user=MammalResearchInstitutePAS` (135 models, 6 canids).
3. **MorphoSource**: `https://www.morphosource.org/api/media?q=<term>&per_page=100&page=N` for Canis, Vulpes, Urocyon, Nyctereutes, Lycaon, Crocuta, Hyaena, Parahyaena, Proteles, Lupulella, Alopex, Canidae, Hyaenidae and dingo. Results were filtered on `physical_object_taxonomy_gbif`, leaving 122 target media.
   - Fields read: `copyright_statement`, `license`, `permits_commercial_use`, `visibility`.
   - Site-wide facets (no filter) show 428 CC BY + 11 CC0 + 509 PDM out of 209,389 media.
4. **Smithsonian**
   - `https://3d-api.si.edu/api/v1.0/content/file/search?q=<term>` for Canis, wolf, fox, hyena, coyote, dog and skull.
   - `api.si.edu/openaccess` with DEMO_KEY returned OVER_RATE_LIMIT and then a connection reset (2 retries), so it was recorded as failed.
5. **Zenodo**: `https://zenodo.org/api/records?size=25&q=<q>`. It gave 403s and a TLS EOF at first, then worked when slowed down to one request every 5 s.
   - Community search: `/api/communities/3dbigdataspace/records?size=25&q=<q>`. size=100 gives 400.
   - Searching by Sketchfab uid matches nothing. Mirrors were found instead by matching GLB filenames, which are the uid.
6. **Dryad**: `https://datadryad.org/api/v2/search?q=<q>&per_page=30` (15 queries), then `/datasets/{doi}` and `/versions/{id}/files`.
   - All Dryad data is CC0 (`license` = spdx CC0-1.0).
   - Downloading files through the API returned 401 (it needs a token). The web route `/downloads/file_stream/{id}` returned 403 to scripts. Treat Dryad as a browser download.
7. **figshare**: `POST https://api.figshare.com/v2/articles/search` and `/collections/search`, then `GET /v2/articles/{id}` (license.name, files).
8. **NHM data portal**: `https://data.nhm.ac.uk/api/3/action/package_search?q=...`. Nothing relevant was found.
9. **Phenome10K**: blocked by a Cloudflare challenge (curl and WebFetch both got 403, 2 attempts). Its licence could not be verified, so it is listed as rejected (unclear).
10. **Not queried in depth**: DigiMorph, MorphoBank, African Fossils, Naturalis, RBINS, Thingiverse and Printables. Scan-the-World appeared on Zenodo as CC BY-NC-SA.

## How licences were verified

- **Open Forest Data**: each dataset's `termsOfUse` must link creativecommons.org/licenses/by/4.0 and `dwcLicense` must be "CC BY". All 34 Canidae specimen datasets pass both checks. Files are `restricted=false`, so no login is needed.
- **Sketchfab**: only `license.slug` from `/v3/models/{uid}` counts.
  - `by` or `cc0` = usable.
  - `by-nc`, `by-nd`, `by-sa`, `by-nc-sa` and `by-nc-nd` are rejected, and so are `st` / `free-st` (Sketchfab Standard store licences) and `ed` (Editorial).
  - No licence at all means the model is not downloadable, so it counts as all rights reserved and is rejected.
- **MorphoSource**: rejected unless `license` is CC0 or CC BY and `permits_commercial_use` allows it. No target item passed.
- **Dryad, Zenodo and figshare**: the record's license field (`spdx CC0-1.0`, `cc-zero`, `cc-by-4.0`, `CC0`, `CC BY 4.0`). figshare "CQUniversity General 1.0" and "All rights reserved" were treated as unusable.
- **Zenodo mirrors of Sketchfab models**: the Zenodo licence was recorded next to the Sketchfab one. One case disagrees: the Malopolska wolf is CC0 on Zenodo but CC BY on Sketchfab. Credit the author anyway.

## Scan-type flags

These are inferred from description keywords:
- CT
- Artec / HDI / Revopoint = structured light
- Polycam / PhotoScan / RealityScan / Meshroom = photogrammetry
- Blender / sculpt / kitbash / school project = artist
- CSM AI / Tripo = AI

Models under 20k faces are flagged as low poly. "scan (method unstated)" means the description does not say.

## Files

- `candidates.csv`: 408 rows (190 usable, 218 rejected).
- `collections.csv`: 25 bulk sources.
- `SUMMARY.md`: the overview (the harness refused the write; its text is in the hand-off report).

The scratch scripts lived in the session scratchpad and are not stored.
