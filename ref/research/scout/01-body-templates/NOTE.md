# Body templates: side-view images of the wolf, dingo and Carolina Dog

Scout, 2026-10-07. This answers Priority 1 of `docs/claude/DEN-SCOUT-REQUEST-2026-10-07.md`, as changed by Firefly's urgent note. Images are wanted, CC BY photos included, so that Firefly can cut each animal out (IS-Net), warp it onto the skeleton and fit curves.

- **Layout:** `wolf/`, `dingo/` and `carolina-dog/` hold the images. The ranked list for all three is `candidates.csv`.
- **File names:** `NN_<species>_<source+id>_<author>_<stance>_<facing L/R>.jpg`, where NN is the rank.
- **Facing:** the direction the animal faces in the image, not mirrored.
- **Image changes:** none. Every image is the file exactly as downloaded. Mivart plates are whole book pages.
- **Licences accepted:** public domain, CC0, CC BY. Rejected: CC BY-SA, NC, ND and anything unclear.
- **Credit owed** (CC BY): the author name and licence given in `candidates.csv`, for example "(c) Rob Foster, CC BY 4.0, via iNaturalist". Add these to the game's `CREDITS` if a template ships in any form.

## How I searched
- **Wikimedia Commons API**
  - Searches (namespace 6): wolf skeleton, Mivart/Keulemans wolf, Brehm wolf, dingo illustration, dingo Lydekker/Brehm, Carolina dog, wolf anatomy plate.
  - Within minutes, both `commons.wikimedia.org` and `upload.wikimedia.org` returned **HTTP 429** with `retry-after` up to 600 s. The cause is a shared egress IP, not our request rate. The block continued for the rest of the session, so no Commons file could be downloaded. Commons candidates are listed below under "Seen, not downloaded".
- **Openverse API** (`api.openverse.org/v1/images`, `license=by,cc0,pdm`, anonymous with 20 per page)
  - Queries: gray wolf, wolf standing, wolf side view, timber wolf, Canis lupus, arctic wolf, wolf yellowstone, Mexican wolf. That gave 233 hits after removing non-animal results.
  - I screened them on labelled contact sheets. Flickr's 1024 px "large" files could be fetched at first. The original sizes (`_o`) then hit **HTTP 429** on `live.staticflickr.com` and never recovered. So the Flickr items in this set are the 1024 px versions, marked LOW RES.
- **iNaturalist API**
  - Query: `observations?taxon_id=42048&photo_license=cc-by,cc0&order_by=votes`, 4 pages. That returned 1,799 CC BY/CC0 photos; I kept the 898 that were landscape and at least 1,800 px wide.
  - I screened those 898 on contact sheets. The best were downloaded at the largest size the open-data bucket serves (`inaturalist-open-data.s3.amazonaws.com`, 2048 px on the long side).
  - The licence is checked per photo, from the `license_code` of the photo, not of the observation. Captive status comes from the observation.
- **Internet Archive**
  - Mivart 1890, *Dogs, Jackals, Wolves, and Foxes: a monograph of the Canidae*, 45 hand-coloured plates by J. G. Keulemans (`dogsjackalswolve00mivauoft`; IA status NOT_IN_COPYRIGHT).
  - Plates were found from short-text pages in the DjVu XML and then from page thumbnails. Full pages were fetched as `https://archive.org/download/dogsjackalswolve00mivauoft/page/n<leaf>.jpg`.
  - Leaves: 57 Common Wolf, 63 Black Wolf, 69 Indian Wolf, 73 American Wolf, 279 Dingo. Leaf 77 is an uncoloured woodcut of the Japanese wolf, not used.
- **Rijksmuseum linked-data API** (`data.rijksmuseum.nl/search/collection`, CC0 images on `iiif.micr.io`)
  - Marcus de Bye's wolf etchings (after Paulus Potter). The one titled "en profil" is really a three-quarter view (rank 14). The rawpixel copies of the same prints are CC0 but low-resolution; the Rijksmuseum originals are better.
- **Not reached in time:** FWS National Digital Library, NPS NPGallery, BHL API (it needs a key), Smithsonian Open Access. Commons and Flickr originals are blocked (see above).

## Strictness and honesty notes
- **Size:** the "animal at least 1,500 px long" rule is met only by wolf ranks 1, 2, 4, 9, 10 and 14 (rank 8 is close, about 1,470 px).
  - iNaturalist serves 2048 px at most, so animals in those photos come out at about 1,100 to 1,700 px.
  - The three Flickr items are 1024 px copies. Their originals are bigger and can be fetched by hand from the landing URL once Flickr lifts the 429.
- **Head turned:** ranks 3, 6 and 13 have the head turned toward the camera. They are listed for the body only.
- **Plates are artists' renderings:** Keulemans drew the wolves somewhat lean and jackal-like, from live animals, zoo animals and skins. They show the coat (ruff, mane, brush) very clearly, but body proportions should be checked against the photos.
- **Skeleton-in-outline plate for a wolf or dingo (bonus):** **none found.**
  - Ellenberger-Baum, Chauveau, Martin, Cuyer and Gurlt draw the domestic dog (or horse) only, and no wolf or dingo version exists in any of them.
  - The nearest public-domain material is wolf skeleton drawings without the body outline:
    - Lydekker 1893 (*Royal Natural History* vol. 1), Commons `File:WolfSkelLyd1.png`;
    - Buffon/Daubenton 1758 (*Histoire naturelle* vol. 7) "Le Loup, Squelette", Commons `File:Le Loup, Squelette - Wolf, Skeleton - Gallica - ark 12148-btv1b2300254t-f5.png`, with a matching exterior plate in the same volume (`...-f3.png`), drawn at a similar scale but on separate pages;
    - *The New Book of the Dog* 1911, retriever vs North American grey wolf skeletons;
    - Merriam 1912, *Fauna of Rancho La Brea*, wolf skeleton panel in `File:Canis dirus, lupus & latrans skeletons.png`.
  - These could not be downloaded (Commons 429). All are PD, all small (under 700 KB).

## Wolf set: rejected for licence or quality
- **Commons, `File:Canis lupus italicus skeleton (white background).jpg`:** CC BY-SA 3.0, rejected (share-alike).
- **Openverse/Flickr profile shots, low resolution:**
  - "Arctic wolf (male)" by Drew Avery (Flickr 3519936915, CC BY 2.0): walking, head down.
  - "Walking Wolf" by OnyxDog86 (7322950338, CC BY 2.0): front three-quarter.
  - "Fuzzy Wolf" / "Wolf" by Michelleyyy (9010005383, 9010000755, CC BY 2.0): three-quarter.
  - "Mexican Wolf" by ahisgett (15344102138, 14910052563, CC BY 2.0): walking, head to camera.
  - Denali wolves by Matt-Zimmerman (6068119210, 6068124462, 6068120854, CC BY 2.0): walking, head down, partly behind brush.
  - Any of these could be revisited if Flickr originals become reachable.
- **rawpixel "Free arctic wolf standing log"** (CC0, uploader not identified): three-quarter, standing on a log. rawpixel serves only 1024 px without a login. Not kept.
- **USFWS Headquarters "Gray wolf" items:** Public Domain Mark, but only 190 px thumbnails were listed, and the larger 1024 px ones are close-ups or pups. Not kept.
- **Excluded on sight:** iNaturalist photos that are camera-trap frames, show scat or tracks, or show a distant animal.

## Dingo and Carolina Dog
See the sections below (added after the wolf set).
