# Grey wolf silhouettes (Canis lupus)

**Kept: 22 files.**
- Rank 1 is the 19th-century Werner plate (Commons, PD/PDM): a true side view, head forward, walking, with classic proportions. It is painted, so threshold it to get an outline.
- Ranks 2-13 are PhyloPic vectors:
  - Pelissier 8621c5e8 (CC0) is the best walking profile.
  - Richard Rich 23ddcc50 (CC0) is walking with a long stride.
  - Standing square, head turned: 5e56c4e5 (CC0), plus two by Palomo-Munoz (CC BY 4.0).
  - Others: walking, snarling, howling-standing, running (Michaud CC0, Chloé Schmidt CC BY 3.0).
- Ranks 14-16 are PSF line drawings (PD).
- Rank 17 is a running wolf on openclipart (CC0).
- Ranks 18-22 are sitting, lying and head-down poses.
- Several PhyloPic wolves are *C. l. italicus* or *monstrabilis* (subspecies nodes). They are still grey wolves; the Italian wolf is a little lighter-built than northern wolves.
- CC BY files need credit: Palomo-Munoz, Michaud (634db116), Schmidt.

## How I searched (shared across all six silhouette folders)
- **PhyloPic API** (build 558): every image under the nodes *Canis lupus* (6c49a885…) and *Canis familiaris* (dbb7e312…), 45 images in total. Each image's licence came from its own API record (CC0 / PDM / CC BY 3.0 / CC BY 4.0; none were NC or SA). Name and autocomplete searches for husky, malamute, sled dog, spitz, laika, singing dog, Carolina dog, *C. hallstromi* found **no** breed nodes except "West Siberian laikas", "greyhounds" and "pugs".
- **Wikimedia Commons**: categories Silhouettes of dogs, Silhouettes of wolves, Silhouettes of Carnivora, SVG dogs, Dog icons, Sled dogs in art, Siberian Huskies in art, Dingoes in art, Canis lupus dingo (illustrations), Illustrations of wolves, Carolina Dog, Siberian Husky, Alaskan Malamute. Searches (files): malamute/husky + PSF/svg/silhouette/drawing, sled dog silhouette, eskimo dog drawing, dingo svg/silhouette/line drawing, wolf silhouette, Carolina dog, singing dog, spitz svg, dog silhouette svg, "Pearson Scott Foresman dog", wolf PSF, gray wolf USFWS, Canis lupus line drawing. I checked the licence of each kept file on its Commons file page (the licence template text, not the site footer).
- **Openverse** (licence = by, cc0, pdm): husky / malamute / sled dog / spitz / dingo / wolf silhouette, "dog silhouette side", husky drawing / clipart, svg searches on Commons. About 300 hits screened by contact sheet; most were photos of backlit dogs (no use) or rawpixel items (see below).
- **Openclipart** (all CC0; I checked the licence in the JSON-LD on each kept item page): searched husky, malamute, sled dog, wolf, wolf silhouette, dog silhouette, dingo, spitz, "dog breeds silhouettes", "dog side". Screened about 190 items.
- **Derived silhouettes (made by me)**: where a clean, licence-OK side view existed, I removed the background (rembg, isnet-general-use model) or filled the line art, then traced it with potrace. Each derived file is marked "derived" in its file name and notes and keeps the licence of its source.
- Every SVG has a PNG render next to it (2000 px wide, made with cairosvg). Files are named `NN_<species>_<source-id>_<author>_silhouette_<L/R>`.

## Rejected or not used (shared)
- **rawpixel.com** items that Openverse indexes as CC0, including "Siberian Husky dog silhouette" 6292881/6292822/6292818, the vintage husky engravings 6261374/6305409/6261350/6260505/6305513, "Sled dog clipart, vintage" 6817537, wolf silhouettes 6266802/6267199, and the breed silhouette set 6266917. The item pages are behind a Cloudflare challenge (403), so I could not check the licence per file, and the high-res download needs a login. Not used. The husky silhouette there looks like the same Karen Arnold figure I did use from openclipart, and engraving 6261374 looks like the PSF husky.
- Commons **Dog_Silhouette_01.svg** (Amada44, marked PD) is a vector copy of **Dog_group_Pariaha.png**, which is CC BY-SA 2.5. The licence chain is unclear, so I left it out. It is a nice pariah-type silhouette; a human could ask the uploader.
- Commons **Wolf_silhouette.png** (CC BY-SA 4.0), **Silhouette_Hund.svg** (CC BY-SA 4.0), **Husky_deja_huellitas_en_el_suelo.png** (CC BY-SA 4.0): BY-SA, rejected.
- Commons **USFWS_-_How_to_recognise_a_gray_wolf_1/2**: tagged PD, but the graphics are by the Salt Lake Tribune and the photos by a tribal biologist and WDFW (a state agency). Not clearly federal, so rejected.
- Commons **Dog_Team_Silhouette_(55308565106).jpg** (NPS, PD): a distant sled team, far too small to use.
- Openclipart **254708 "Wolf Silhouette 2"** (GDJ, CC0) says it came "from Pixabay". The Pixabay licence is not CC0 today, so the chain is unclear and I left it out. There are plenty of PhyloPic wolves anyway.
- Cartoon or front-view items (openclipart 117577, 187790, 189204, 282710 [front view husky engraving], 303984, 315477, 330264, 233324, 265705, and so on) are not side views.
- Not searched on purpose: publicdomainvectors, freepik, vecteezy, pngtree, and other sites with their own licences.
