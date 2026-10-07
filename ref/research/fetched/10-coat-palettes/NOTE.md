# 10-coat-palettes: notes

Fetched 2026-10-06; updated 2026-10-07. Sampled colours only; **no photos are stored in the repo** (thumbnails were kept in `/tmp/item10/`).

## Sources
Wikimedia Commons API (`https://commons.wikimedia.org/w/api.php`, `generator=categorymembers`, `prop=imageinfo`, `iiprop=url|extmetadata|size`) on:
- `Category:Canis lupus lupus`: 161 files, 133 with a permissive licence.
- `Category:Dingoes`: 200 files, 92 permissive.
- `Category:Carolina Dog`: 16 files, only 4 permissive (all public domain). The other 12 are CC BY-SA or CC BY-SA 2.0 de, so they were not used.

The licence was taken from each file's `LicenseShortName` metadata. Accepted: Public domain, CC0, CC BY (any version). Rejected: CC BY-SA, GFDL.

| Species | Photo (Commons page) | Author | Licence |
|---|---|---|---|
| wolf | [Eurasian Wolf (9358589025).jpg](https://commons.wikimedia.org/wiki/File:Eurasian_Wolf_(9358589025).jpg) | Tom Bech, Oslo (Flickr) | CC BY 2.0 |
| wolf | [Loup Brun.jpg](https://commons.wikimedia.org/wiki/File:Loup_Brun.jpg) | Pixel-mixer | CC0 |
| wolf | [Wolf (53435105908).jpg](https://commons.wikimedia.org/wiki/File:Wolf_(53435105908).jpg) | Ralf Hüsges (Flickr) | CC BY 2.0 |
| wolf | [Canis lupus in Alapaevskyi rayon 01.jpg](https://commons.wikimedia.org/wiki/File:Canis_lupus_in_Alapaevskyi_rayon_01.jpg) | Александр Краснов (Aleksandr Krasnov) | CC BY 4.0 |
| dingo | [Alert dingo (25964572552).jpg](https://commons.wikimedia.org/wiki/File:Alert_dingo_(25964572552).jpg) | Sean Riley (Flickr) | CC BY 2.0 |
| dingo | [Canis lupus dingo, Fraser Island.jpg](https://commons.wikimedia.org/wiki/File:Canis_lupus_dingo,_Fraser_Island.jpg) | Brian Gratwicke (Flickr) | CC BY 2.0 |
| dingo | [Dingo (48629423747).jpg](https://commons.wikimedia.org/wiki/File:Dingo_(48629423747).jpg) | Chris Fithall (Flickr) | CC BY 2.0 |
| dingo | [Dingo 1 (16710514939).jpg](https://commons.wikimedia.org/wiki/File:Dingo_1_(16710514939).jpg) | Amaury Laporte (Flickr) | CC BY 2.0 |
| dingo | [Canis lupus dingo 2.jpg](https://commons.wikimedia.org/wiki/File:Canis_lupus_dingo_2.jpg) | Sam Fraser-Smith (Flickr) | CC BY 2.0 |
| Carolina Dog | [Carolina Dog 1.jpg](https://commons.wikimedia.org/wiki/File:Carolina_Dog_1.jpg) | Flaxseedoil | Public domain |
| Carolina Dog | [Carolinadog20020630a.jpg](https://commons.wikimedia.org/wiki/File:Carolinadog20020630a.jpg) | Flaxseedoil | Public domain |
| Carolina Dog | [Carolinadog20020713a.jpg](https://commons.wikimedia.org/wiki/File:Carolinadog20020713a.jpg) (added Oct 7) | Flaxseedoil | Public domain |
| Carolina Dog | [DixieDingo 0019.jpg](https://commons.wikimedia.org/wiki/File:DixieDingo_0019.jpg) (added Oct 7) | Apishion | Public domain |
| Carolina Dog | [Carolina Dog, fetch](https://www.flickr.com/photos/142840521@N06/43486694605) (Flickr, added Oct 7) | SteveMcD | CC BY 2.0 |
| dingo | [Dingo at West Australian Reptile Park.jpg](https://commons.wikimedia.org/wiki/File:Dingo_at_West_Australian_Reptile_Park.jpg) (added Oct 7) | S J Bennett (Flickr) | CC BY 2.0 |
| dingo | [Australian Dingo.jpg](https://commons.wikimedia.org/wiki/File:Australian_Dingo.jpg) (added Oct 7) | Alessandro from Milan (Flickr) | CC BY 2.0 |

The licence URL, original size, view and lighting for each photo are in `data.json`. Attribution for CC BY: credit the author and licence as listed above. The colours themselves are facts measured from the photos.

## Method
1. Downloaded the thumbnail from upload.wikimedia.org: 1280 px wide, or the original when it was smaller (the Carolina photos are 640 × 480).
2. Converted to sRGB from any embedded ICC profile. Two photos were Adobe RGB: Wolf (53435105908) and Canis lupus dingo 2.
3. Looked at each photo (and 2–5× zoomed crops with a pixel grid) and hand-placed one box per region. Boxes avoid specular glints, snowflakes, ear tags and obvious cast shadows where possible. Box = `[x0, y0, x1, y1]` in the sampled thumbnail's pixels, y down.
4. Colour of a box = per-channel median of the pixels whose luma (0.299R + 0.587G + 0.114B) lies between the box's 10th and 90th percentiles. `sd` = mean per-channel standard deviation of all box pixels, a rough measure of texture or noise.
5. Species summary = per-channel median of the per-photo hex values. Some regions were left out of the summary, as listed in each photo's `excluded_from_summary` and `lighting_note` in `data.json`:
   - shaded or green-cast bellies;
   - a shaded chest;
   - all of *Dingo 1 (16710514939)*, which has a strong dusk magenta cast (its grass reads teal).
6. Region meanings:
   - **face_mask**: the cheek or side of the muzzle. It is pale for wolf and dingo, but for the Carolina Dogs it is the **dark muzzle mask**.
   - **muzzle_top**: the bridge of the muzzle.
   - **brow**: the forehead between eye and ear (dingo close-up only).
   - **ear_inside**: the visible inner pinna. In profile views this is often shaded, so it reads dark.
   - **chest**: kept separate from belly where the belly was hidden.

## Per-photo values (hex, sRGB)
| Species | Photo | back | flank | belly | chest | legs | face_mask | muzzle_top | brow | ear_inside | nose | eye |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| wolf | Eurasian Wolf (9358589025).jpg | — | — | — | — | — | #e1e1e1 | #bb997e | — | #605a4f | #1d1b21 | #302420 |
| wolf | Loup Brun.jpg | #918e7a | #a09d87 | #7c7e58 | — | #b8aa7f | #bfcac4 | #cdc9bf | — | #9ea8a7 | #383d40 | #6c7964 |
| wolf | Wolf (53435105908).jpg | #6f5f50 | #ac9174 | #b8a58f | — | #c5ab8f | #c7c1bc | #997b61 | — | #c0bbb6 | #2a262b | #6c5744 |
| wolf | Canis lupus in Alapaevskyi rayon 01.jpg | #a89072 | #9b8e7b | #757474 | — | #cfcabd | #d8d4c6 | — | — | — | #28282e | — |
| dingo | Alert dingo (25964572552).jpg | #f8cc92 | #f9e0b3 | — | #85887f | #f9e3b5 | #b5c1c1 | #8a6f45 | — | #423115 | #181c23 | #120e07 |
| dingo | Canis lupus dingo, Fraser Island.jpg | #6f4f3b | #6c4b32 | #6b543a | — | #866a4e | #897661 | #856646 | — | #3b2f29 | #414247 | #413a38 |
| dingo | Dingo (48629423747).jpg | — | — | — | — | — | — | — | #9a7b59 | #a68e79 | #302e36 | #503826 |
| dingo | Dingo 1 (16710514939).jpg | #9b7f81 | #9b8185 | #a0999f | — | #887274 | #9b9098 | #979cb0 | — | #82615d | #1a325a | #100e0f |
| dingo | Canis lupus dingo 2.jpg | #c07735 | #ad6826 | #a29789 | — | #9e520a | #e5d9bf | #cd8c54 | — | #552802 | #191b1a | #201208 |
| carolina | Carolina Dog 1.jpg | #7d6958 | #81705f | — | — | #7d6855 | #4f4138 | — | — | #493b32 | #303537 | #403c38 |
| carolina | Carolinadog20020630a.jpg | #8b643d | #a98251 | — | #977c55 | #7a562b | #504338 | — | — | #50402d | #1c1e1d | #3e312e |
| dingo | Dingo at West Australian Reptile Park.jpg | #e0c3ba | #d7b9a2 | — | #8c7d74 (x) | #a99e95 | #dfd4cd | #dad1cf | #877a72 | #241813 | #252327 | #664235 |
| dingo | Australian Dingo.jpg | #936e4e | #a16f47 | — | — | — | — | — | — | — | — | — |
| carolina | Carolinadog20020713a.jpg | #846048 | #6b4633 | — | — | #754824 | #584336 | — | — | #4f3222 | #212627 | #3a1d1c |
| carolina | DixieDingo 0019.jpg | #eabb9f | #be9576 | #b3a698 | #dbcec6 | #c9a78a | #867470 | #a89089 | #e5b896 | #9a7c7e | #3c393e | #4a322b |
| carolina | Carolina Dog, fetch (Flickr 43486694605) | #d3bcb9 | #9f857f | #9a8480 (x) | #79717b (x) | #848393 (x) | #aca6b1 | #bdb6c3 | #c3b4b5 | #644650 | #0c0b0d | #1a1618 |

(x) = sampled but excluded from the species summary (shaded).

## Update 2026-10-07 (retry and extra Carolina Dog photos)
- **Retry:** Commons API (`prop=imageinfo`, `iiurlwidth=1200`) with User-Agent `DenDataFetch/1.0 (research; contact via repo)`, one request every 5–20 s.
  - upload.wikimedia.org **originals** still returned HTTP 429 for Carolinadog20020713a.jpg (4 tries) and Dingo at West Australian Reptile Park.jpg (3 tries). Australian Dingo.jpg (800 px original) came through on the 2nd try.
  - The thumbnail host only serves **standard widths**: a non-standard width such as 639 or 1000 px gives HTTP 400 ("Use thumbnail sizes listed on https://w.wiki/GHai"). We used the 1280 px thumbnail of DixieDingo 0019.jpg, the 960 px thumbnail of the reptile-park dingo, and the **500 px** thumbnail of Carolinadog20020713a.jpg (its original is 640 × 480, and 640 is not a standard size). The exact sampled URL is in each photo's `sampled_url` in `data.json`.
- **New permissive Carolina Dog photo:** searched Openverse (`api.openverse.org/v1/images`, `license=cc0,by,pdm`) for "carolina dog", "carolinadog", "american dingo" and "dixie dingo". Most "carolina dog" hits are unrelated (North/South Carolina). Relevant hits:
  - **Used:** "Carolina Dog, fetch" by SteveMcD, Flickr 43486694605, CC BY 2.0 (checked on the Flickr page: licence id 4 = CC BY 2.0). The owner tagged it carolinadog and americandingo. Full side view, 1024 px.
  - Not used: three more SteveMcD photos of the **same dog** ("She's all ears" 39494971195, "Wild dog and Fruit Loops" 26520881918, "Tsuki et fruit loops" 48491118751), all CC BY 2.0, so that one dog does not count several times. "She's all ears" would be a good extra source for a pale ear inside and a frontal face if needed.
  - Not used: "Carolina Dog" by gaber1556, Flickr 45875844865, Public Domain Mark: a 305 × 499 indoor head crop under warm artificial light.
- **The Carolina Dog sample is now 5 photos** (4 public domain, 1 CC BY 2.0). Caveats:
  - Three of them are by Flaxseedoil ("Riverside Rescue", 2002) and may show the same few dogs.
  - The Flickr dog is a pale cream individual, and the DixieDingo 0019 dog is light red-fawn. The two older photos show darker ginger dogs. The per-channel median sits between them, so the summary is a middling ginger-fawn. Use the per-photo values to pick a lighter or darker coat.
  - The Flickr dog's white chest, belly and legs are in shadow and read blue-grey, so they are excluded from the summary.
- **The dingo sample is now 7 photos** (6 contribute to the summary). The reptile-park dingo is pale ginger in bright diffuse light (its shaded chest is excluded). The Australian Dingo is tiny and soft in low warm sun, so only its back and flank were sampled.
- Breed identity of the new Carolina Dog photos is as stated by the uploaders. It is not verified.

## Not done or blocked
- Commons API and upload.wikimedia.org repeatedly returned **HTTP 429** (rate limit, retry-after 20–55 s). Category queries worked after backing off and changing the User-Agent string.
- On Oct 6 these downloads failed after 3 or more spaced retries each: Carolinadog20020713a.jpg, DixieDingo 0019.jpg, Dingo at West Australian Reptile Park.jpg and Australian Dingo.jpg. **All four were fetched on Oct 7** (see the update above; one only as a 500 px thumbnail).
- Not used after viewing:
  - *Dingo at Fogg Dam.jpg* (dog too small, motion);
  - *RWY2198-Edit.jpg* (wolf, small and blue-graded);
  - *Wolf - almost like at home (27310694115).jpg* (heavy colour grading);
  - *Ulv eller gråulv (21779437454).jpg* (pale wolf, frontal, dusk teal grade).
- Lighting is not normalised (no grey card), so palettes carry each photo's white balance. Use them as reference tones, not exact pigment.
- Breed identity of the Carolina Dog photos is as stated by the uploader ("Carolina Dog, Riverside Rescue"). It is not verified.
