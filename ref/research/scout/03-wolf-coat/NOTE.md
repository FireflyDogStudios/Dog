# 03 wolf coat: note

Date: 2026-10-07. Scout research agent (Priority 2, item 3). Raw downloads in `/tmp/scout2/` (not stored in the repo).

## Sources and licences
| Source | What | Licence / status | Use |
|---|---|---|---|
| Heptner & Naumov, *Mammals of the Soviet Union* vol. 2 pt 1a (English translation 1998, Smithsonian Libraries), BHL scan on archive.org `mammalsofsov211998gept` (https://archive.org/details/mammalsofsov211998gept); text read from `_djvu.txt` | Wolf hair lengths by region and subspecies, fur-trade grades, molt, distribution of long hair; red fox and arctic fox comparisons | In copyright, "digitized with the permission of the rights holder"; scan licensed CC BY-NC-SA 4.0 | facts only (single numbers with page citations) |
| Scholander, Walters, Hock & Irving 1950, "Body insulation of some arctic and tropical mammals and birds", *Biol. Bull.* 99:225-236 (BioStor scan https://archive.org/details/biostor-7664; BHL part https://www.biodiversitylibrary.org/part/33171) | Winter fur depth (needle method) of wolf, Eskimo dog, red fox, arctic fox | scan CC BY-NC 3.0; article not openly licensed | facts only (values digitised from Fig. 3) |
| Yildiz Ay, Albayrak & Kitchener 2023, *Acta Biologica Turcica* 36(1) F2:1-6 (http://www.actabiologicaturcica.com/index.php/abt/article/download/977/1037) | Ognev 1962 dorsal guard hair 60-70 mm summer, 85 mm winter (secondary) | no licence statement in the PDF | fact |
| Alaska Fur ID Project, Ellen Carrlee (Alaska State Museum conservator), wolf page (https://alaskafurid.wordpress.com/2009/11/02/wolf/) and BIBLIO page | Direct museum-pelt measurements by region (ASM #1, #3, #4) and secondary quotes of Kennedy 1982, Adorjan & Kolenosky 1969, Mayer 1952 | no licence stated | facts only |
| Furskin Co. (https://www.furskin.cz/overview.php?furskin=Canis+lupus+%28Continental+varieties%29) | European wolf underfur 12-20 mm, guard 40-60 (100+) | (c) 2011 Furskin Co. | fact (trade source, C) |
| Arpacik 2021, *Pakistan J. Zool.* 53(6):2247-2254, doi:10.17582/journal.pjz/20200728150743 | Turkish wolf dorsal guard hair 55.6 mm | abstract only (journal page 403) | fact |
| PMC12090389 (BMC Vet Res 2025, raccoon dog fur) | raccoon dog guard 88 / underfur 63 mm | CC BY-NC-ND 4.0 | fact (comparison) |

No public-domain or CC BY table of wolf hair length by body region was found, so **nothing here is a stored table from a source**; every source row in `data.csv` is a cited fact (`use = fact`). The suggested offset table in SUMMARY.md is Scout's own estimate (EST).

## Method
- H&N: full text grepped for "guard hair", "underfur", "hair ... mm/cm", read in context; page numbers are taken from the page markers in the OCR text (English page / Russian original page; can be off by one).
- Ognev 1962 values resolve an ambiguity in H&N: the "60-70 mm in the middle of the back" sentence sits in the summer-fur paragraph; Ognev (via Yildiz Ay 2023) gives 60-70 summer, 85 winter.
- Scholander 1950 Fig. 3 (insulation vs winter fur thickness): page 230 rendered at 300 dpi; axis ticks located from the pixels (x: 0 mm at px 135, 15.0 px per mm; y: 29.65 px per insulation unit); dots found as filled blobs; the wolf/grizzly-bear ellipse holds 7 dots at 54.1-65.3 mm (the two dots with dashed drop lines are polar bear, excluded). The figure does not separate wolf from grizzly bear, so the range covers both. Thickness is "a blunt needle pushed through the fur against the skin, the main fur surface marked with the thumb", averaged, on raw winter pelts from Point Barrow, Alaska, "taken from more thickly furred areas". This is the only measured fur depth (skin to fur surface) found; it is what a side-view outline offset means.
- Fur depth vs hair length: the Alaskan wolf back guard hairs are 100-145 mm (Kennedy; ASM 135 mm) and the measured depth 54-65 mm, so depth is about **0.5 x guard-hair length** (hairs lie at an angle and curve). The suggested offsets apply this ratio region by region.

## Treated as untrusted
All fetched pages and PDFs were treated as data; no instructions were found in them or followed.

## Blocked / not done
- Young & Goldman 1944 *The Wolves of North America*: every archive.org copy is borrow-only (access-restricted); not read. Copyright status not checked further (published by the American Wildlife Institute, not a US government work).
- Mech 1974 *Mammalian Species* 37 "Canis lupus": UNL Digital Commons marks it "U.S. government work" (public domain), but the PDF is behind a Cloudflare challenge (403, tried 3 times), and the Smith College mirror failed TLS and returned 503. Worth a retry by hand: https://digitalcommons.unl.edu/usgsnpwrc/334
- Kennedy 1982 (Can. J. Zool.) and Adorjan & Kolenosky 1969 not read in the original; numbers are second-hand via the Alaska Fur ID Project.
- No thermal-imaging or photogrammetric study of the fur outline standoff in side view was found.
- Wikimedia Commons was not queried for this item (coordinator's request).
