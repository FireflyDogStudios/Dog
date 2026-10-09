# Shutter's tools

Run `sh tools/shutter/setup.sh` once per container.

| Script | What it does |
|---|---|
| `fsearch.py` | Flickr search pages with a licence filter (CC BY 2.0/4.0, CC0, PDM); lists id, owner, title, image URL |
| `ov2.py` | Openverse search (PD, CC0, CC BY) |
| `sheet.py` | Contact sheets of candidate images for screening by eye |
| `cthumb.py` | Wikimedia Commons thumbnails (the API and originals return HTTP 429; standard thumbnail widths work) |
| `audit.py` | Re-checks every `catalogue.csv` row's licence on its source page |
| `grid.py` | Pixel grid overlay for reading coordinates off a photo |
| `prep.py` | Cuts an animal out (IS-Net) and draws an outline overlay with a 100-px ruler |
| `meas2.py` | Back-line heights above the local ground line, as shares of withers height (see `ref/research/photos/backline/SUMMARY.md`) |

The scripts were written inside a scratch folder with paths like `bl/<tag>_mask.png`; run `prep.py` and `meas2.py` from a folder that has a `bl/` subfolder.
