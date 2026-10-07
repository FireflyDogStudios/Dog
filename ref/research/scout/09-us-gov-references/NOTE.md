# 09 US government (and other public-domain) references: note

Date: 2026-10-07. Scout research agent for Firefly. Frame conventions as the rest of `ref/research/`: side view facing right, image y down, included angles, proportions in withers height (WH) or condylobasal length (CBL) where stated.

## Files
| File | What | Rights |
|---|---|---|
| `mech1974_canis_lupus_mammalian_species_37.pdf` | Mech 1974, *Canis lupus*, Mammalian Species 37:1-6 (copy supplied by GrumpyDingo, 839,731 bytes, md5 da5501818ee8e027fc1fe81f4f24e29f) | US government work (see below) |
| `mech1974_fig5_skull_views_600dpi.png` | Fig. 5 (dorsal, ventral, lateral skull and mandible), page 4 rendered at 600 dpi, crop from (300, 460) | as above; drawn "after Bee and Hall 1956" |
| `mech1974_fig1_wolf_photo_trotting.jpg` | Fig. 1, embedded 300 dpi JPEG ("photo by the author"); trotting, three-quarter view facing left | as above |
| `mech1974_skull_outlines.json` | digitised outlines and landmarks of Fig. 5, CBL units, same frame as `missingfound/wolf-skull` | derived from PD |
| `mech1974_fig5_vs_3d_skulls_overlay.png` | overlay of the Fig. 5 outline (red) on the 3D skulls 170753 (blue) and 170555 (green) | mixes PD with CC BY 4.0 outlines (MRI PAS): credit as in `missingfound/wolf-skull/LICENSE.txt` |
| `murie1944_fig7a_wolf_portraits_plate_p26.jpg`, `..._fig7b_..._p27.jpg` | O. J. Murie's six wolf portraits (Fig. 7), *The Wolves of Mount McKinley*, pages 26-27, rendered 350 dpi | public domain (NPS Fauna Series, US GPO 1944) |
| `murie1944_fig7b_black_male_side_350dpi.png` | crop: "Black Male", standing, true side view facing right, all four legs visible | as above |
| `mivart1890_plate_*.jpg` (4) | Keulemans colour plates: dingo, common wolf, American wolf (*C. l. occidentalis*), prairie wolf (coyote); archive.org page images at the original scan size | public domain by age (1890) |
| `fws_*.jpg` (4) | USFWS photos: Mexican wolf walking (resized to 2600 px), red wolf standing, gray fox standing, coyote three-quarter | each page says "Usage Rights/License: Public Domain" |
| `data.csv` | every number: source, page, value, unit, n, sex, region, confidence, comparison | facts |
| `sources.csv` | Task B catalogue: PD evidence, URL, contents, verdict | - |

## Rights evidence
- **Mech 1974.** PDF page 1, top right: "This document is a U.S. government work and is not subject to copyright in the United States." Author address (p. 6): Minnesota Field Station, Patuxent Wildlife Research Center, U.S. Bureau of Sport Fisheries and Wildlife. UNL repository page https://digitalcommons.unl.edu/usgsnpwrc/334 , field "Comments": "U.S. government work." Caveat: Fig. 5 is captioned "after Bee and Hall, 1956:169" (Univ. Kansas Mus. Nat. Hist. Misc. Publ. 8); the redrawing appears in a federal work, but the 1956 original's renewal status was not checked.
- **Murie 1944** (*The Wolves of Mount McKinley*, Fauna of the National Parks of the United States, Fauna Series 5, US GPO): written by an NPS biologist; plates by Olaus J. Murie (US Biological Survey / Fish and Wildlife Service biologist). archive.org item `wolvesofmountmck00muri`, metadata "possible-copyright-status: This item is in the public domain." https://archive.org/details/wolvesofmountmck00muri (PDF 24,000,862 bytes; plates are PDF pages 48-49 = book pages 26-27).
- **Mivart 1890**, *Dogs, Jackals, Wolves, and Foxes: a Monograph of the Canidae*, London, 45 colour plates by J. G. Keulemans: public domain by age. https://archive.org/details/dogsjackalswolve00mivauoft ; page images `https://archive.org/download/dogsjackalswolve00mivauoft/page/n{N}.jpg` with N = 279 (dingo), 57 (common wolf), 73 (American wolf), 100 (prairie wolf). Plate numbers in the plate list could not be matched with certainty, so the files are named by animal.
- **USFWS photos**: https://www.fws.gov/media/mexican-wolf (credit Clark, Jim/USFWS), https://www.fws.gov/media/red-wolf (credit Rob Johnson; no "/USFWS" suffix but labelled Public Domain), https://www.fws.gov/media/gray-fox (credit USFWS), https://www.fws.gov/media/coyote-1 (credit Thompson, Steve). Each page: "Usage Rights/License: Public Domain". Credit the photographer anyway.
- **Young & Goldman 1944 is not public domain.** The 1972 renewal record (Project Gutenberg ebook 11845, *U.S. Copyright Renewals, 1972 January-June*): "THE WOLVES OF NORTH AMERICA ... © 26May44; A181884. Nydia A. Young (W) & Luther J. Goldman (C); 22Mar72; R525537."
- **Young & Jackson 1951** (*The Clever Coyote*): title page "Copyright 1951 by the Wildlife Management Institute". Renewal (due 1978-79) not found in a quick search of publicrecords.copyright.gov, whose search is unreliable for old renewals. Unresolved; facts only.
- **Mammalian Species**: the ASM scans on archive.org (`mammalianspecies-NNN`) carry no notice; the notice on the Mech PDF comes from the publisher or JSTOR edition. Status was judged from the author addresses printed at the end of each account (see `sources.csv`).

## Method
1. Mech PDF: `pdftotext -layout` (two-column text interleaves; read against page renders), `pdftoppm -r 100` for every page, `-r 600` for page 4; I looked at every figure.
2. Fig. 5 digitising: grayscale threshold at 160, closing with a 4 px disk, fill holes, the largest regions = skull and mandible (lateral) and skull (dorsal); outer contour traced and simplified at 2.5 px; landmarks placed by eye on gridded 600 dpi crops. Scale: CBL = prosthion (76, 590) to the caudal-most occipital condyle x = 1763 px, i.e. 1687 px; mirrored to face right. The drawing horizontal was kept because its condyle already sits 3.05° above the prosthion level, as in the palate frame of 3D skull 170753 (3.0°). The mandible is drawn apart from the skull, so it has its own frame (origin infradentale). Comparison: rasterised IoU against the `missingfound/wolf-skull` outlines in CBL units.
3. Murie, Mech 1966 and Young & Jackson: OCR text from archive.org (`*_djvu.txt`), grep for measurements, then the page images checked wherever fractions mattered (the OCR mangles ⅛ to ⅞).
4. Task B searching: UNL Digital Commons OAI-PMH (sets usgsnpwrc, icwdm_usdanwrc, usfwspubs, usgsstaffpub, natlpark, usdeptinterior; 8,615 records; 501 canid hits; works with a curl user agent), landing pages for the "Comments" rights field; archive.org advancedsearch and metadata; Project Gutenberg CCE renewal texts (1970-1977); Copyright Office public-records API; USGS Publications Warehouse API; fws.gov media pages.
5. Blocked or not used: UNL PDF downloads (Cloudflare 403, tried twice for each of 5 PDFs); academic.oup.com and JSTOR (Cloudflare); HathiTrust catalog search and the Stanford renewal database (403 / JavaScript); BHL API (needs a key); digitalmedia.fws.gov (now redirects to a JavaScript search app); NPGallery search URL (404). Wikimedia was not used, as instructed.
6. Fetched content was treated as data only.
