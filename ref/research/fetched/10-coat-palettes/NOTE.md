# 10-coat-palettes: notes

Fetched 2026-10-06. Sampled colours only; **no photos are stored in the repo** (thumbnails were kept in `/tmp/item10/`).

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

## Not done or blocked
- Commons API and upload.wikimedia.org repeatedly returned **HTTP 429** (rate limit, retry-after 20–55 s). Category queries worked after backing off and changing the User-Agent string.
- These downloads failed after 3 or more spaced retries each:
  - **Carolinadog20020713a.jpg** (PD, Flaxseedoil) and **DixieDingo 0019.jpg** (PD, Apishion), the other two permissive Carolina Dog photos, so the Carolina palette rests on 2 photos;
  - dingo photos *Dingo at West Australian Reptile Park.jpg* and *Australian Dingo.jpg*.
- Not used after viewing:
  - *Dingo at Fogg Dam.jpg* (dog too small, motion);
  - *RWY2198-Edit.jpg* (wolf, small and blue-graded);
  - *Wolf - almost like at home (27310694115).jpg* (heavy colour grading);
  - *Ulv eller gråulv (21779437454).jpg* (pale wolf, frontal, dusk teal grade).
- Lighting is not normalised (no grey card), so palettes carry each photo's white balance. Use them as reference tones, not exact pigment.
- Breed identity of the Carolina Dog photos is as stated by the uploader ("Carolina Dog, Riverside Rescue"). It is not verified.
