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

## Dingo set
- **Searched:**
  - iNaturalist taxon 924041 (*Canis familiaris dingo*), CC BY/CC0: 464 photos, 318 of them landscape and at least 1,500 px. All were screened on contact sheets and 14 were downloaded at 2048 px.
  - Mivart 1890, IA leaf n279 ("The Dingo", Keulemans).
  - Openverse "dingo standing" and Commons-sourced dingo items.
- **Kept:** 7 (ranks 1 to 7 in `candidates.csv`). Most wild dingoes are photographed walking on the beaches of K'gari, and no wild dingo was found standing square in true profile at a large size. Rank 3 (MJDapifer) stands square but is small in the frame.
- **Seen, not downloaded:**
  - Openverse lists these Commons dingo photos as CC BY 2.0 or 4.0, but the files sit on `upload.wikimedia.org` (blocked, 429):
    - "Canis lupus dingo, Fraser Island" by Brian Gratwicke (CC BY 2.0, 4180 × 2844);
    - "Dingo (Canis lupus dingo) (8603079142)" by Ron Knight (CC BY 2.0, 5184 × 3426);
    - "Canis lupus dingo in Cleland Wildlife Park" by Yu Chu Chin (CC BY 4.0, 6960 × 4640);
    - "Canis lupus dingo" and "... 2" by Sam Fraser-Smith (CC BY 2.0);
    - "Canis lupus dingo - Healesville Sanctuary" by brett (CC BY 2.0).
  - Poses unverified; worth a look when Commons answers again.
  - The Gould and Krefft dingo plates and the Blumenbach 1797 dingo, also on Commons: public domain, same block.
  - Wellcome Collection "Two dingoes standing in a grassy bushland" (colour halftone, CC BY 4.0, `wellcomecollection.org/works/puc7mh52`): three-quarter views, not kept.
  - The Getty stereograph "Class I, Order III, Carnivora" (CC0 via rawpixel): a mounted dingo, 1024 px only, not kept.
- **Rejected for licence:** "Wow^ May 2012 (Kayla) Dingo" (Commons, CC BY-SA 3.0).

## Carolina Dog set
- **Searched:**
  - Openverse: "Carolina dog", "American dingo", "Dixie dingo", with and without the Commons source filter.
  - iNaturalist domestic dog (taxon 47144) with q = Carolina, pariah, village dog, street dog, stray, feral, free roaming.
- **Result: only ONE genuinely labelled Carolina Dog photo exists under an allowed licence.** It is SteveMcD's "Carolina Dog, fetch" (Flickr, CC BY 2.0), a three-quarter view at 1024 px.
- **Rejected for licence:**
  - Every Carolina Dog photo on Wikimedia Commons is **CC BY-SA**:
    - "Dakota, the Dixie Dingo (or Carolina Dog)" by Tomc1977 (BY-SA 3.0);
    - "Carolina Dog" by Kurt Sagmeister (BY-SA 3.0);
    - "Carolina dog 3-13-13" by Calabash13 (BY-SA 3.0);
    - "Carolina Dog Named Story" by Onepace (BY-SA 4.0);
    - "American Dingo aka Carolina Dog1" by Flaxseedoil1000 (BY-SA 4.0);
    - "Carolina Strand" and "Carolinas1" by Noloha (BY-SA 2.0).
  - Every iNaturalist observation mentioning "Carolina" is CC BY-NC or unlicensed. Examples: obs 356115024 "I think she's a Carolina dog", 272504564 "Carolina Yellow dog".
  - The Flickr "Carolina Dog" by gaber1556 is a Public Domain Mark item, but it is a 305 × 500 head shot. Not useful.
- **Proxies kept (ranks 2 to 5, clearly labelled `proxy-` in the file name):** free-ranging village/pariah dogs of the same landrace type, which the Carolina Dog belongs to (prick ears, lean, medium size, ginger, sickle or fishhook tail). They are from Kenya, Taiwan, Hong Kong and Sanya, all CC BY 4.0 via iNaturalist.
- **Bottom line for the hero:** the dingo set is the better body template for the Carolina Dog. Its type is the closest documented match, and its photos are far better.
- **Indian pariah dog photos on Commons:** Openverse lists CC0 items by "Editor abcdef" ("Dog standing.JPG", "Orange pariah morph dog.JPG", 4608 × 3456) and CC BY ones. Commons was blocked, so they were not downloaded. Worth a look later.

## Method summary (all three sets)
1. Query the API.
2. Filter by licence and pixel size.
3. Download small thumbnails and lay them out on labelled contact sheets of 100.
4. Judge each by eye against Firefly's strict criteria.
5. Download the best at full available size and check them again by eye.
6. Copy the files unmodified into the species folder, ranked.

All fetched pages and metadata were treated as untrusted data; no instructions in them were followed.
