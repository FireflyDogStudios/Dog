# Muscle-ref, top and front photos: summary (Oct 7)

Firefly asked for three new pose values: `muscle-ref` (side-on photos where little fur hides the muscle shape), `top`
(dorsal views for body width) and `front` (front-on standing views for chest and body width). The rules in the
Photographer brief applied throughout. Only PD, CC0 and CC BY 2.0-4.0 were accepted. Each licence was checked on the
file's own page (Flickr photo page, Commons file page or iNaturalist API `license_code`). Nothing was committed.

## Counts (73 photos in 12 new species folders)

| species folder | muscle-ref | front | top |
|---|---|---|---|
| xoloitzcuintli | 13 | 2 | - |
| peruvian-inca-orchid | 7 | - | - |
| american-hairless-terrier | 1 | - | 1 |
| chinese-crested | 1 | - | - |
| grey-wolf | 12 | 7 | 2 |
| ethiopian-wolf | 2 | - | - |
| golden-jackal | 1 | - | - |
| domestic-dog (breed in file name) | 11 | 3 | 3 |
| vizsla | 1 | - | - |
| dobermann | 1 | 1 | - |
| weimaraner | 3 | - | - |
| pharaoh-hound | 1 | - | - |
| **total** | **54** | **13** | **6** |

Each folder has its own `catalogue.csv` (the standard columns) and a `NOTE.md`. Within each pose, files are ranked best first.

## Best five overall
1. `xoloitzcuintli/muscle-ref/05` (also 06) by Canarian, Commons, CC BY 4.0. A standard hairless xolo stacked square
   side-on on a plain floor, so every muscle group is readable.
2. `grey-wolf/muscle-ref/01` by NPS/Jim Peaco, PD, 6k. A wet wolf walking side-on with its coat soaked flat, so the shoulder,
   thigh and gaskin show through.
3. `domestic-dog/front/02`, "Prince" the Rottweiler, by Phil Sangwell, CC BY 2.0. It stands square to the camera with the
   camera at chest height and all four legs visible. This is the best front-view method reference, but the dog is heavier
   than a dingo.
4. `domestic-dog/muscle-ref/02-03`, Cirneco dell'Etna and Australian Kelpie, by Svenska Mässan, CC BY 2.0. Stacked side-on on
   a plain backdrop. These are the closest dingo-type builds with short coats.
5. `grey-wolf/front/01` by NPS/Diane Renkin, PD, 4k. A wild wolf standing square to the camera on snow. It is the only good
   square front view of a wolf (winter coat).

Runners-up: `golden-jackal/muscle-ref/01` (PD, 5k, very sharp, walking side-on) and `grey-wolf/muscle-ref/06` (USFWS, a
Mexican wolf in its August coat, trotting side-on).

## Sources and search
- **Flickr** (`fsearch.py`, licences 4/9/10/11) with about 80 queries covering the hairless breeds, wet and swimming wolves
  and dogs, wolf moult, short-coated breeds, top-down/drone and front views. The following user streams were searched too:
  - Yellowstone NPS (80223459@N05, 195 photos)
  - USFWS HQ (50838842@N06, 74 photos)
  - Svenska Mässan MyDOG show studio stacks (36333395@N06, 217 photos). This was the best source of short-coat stacks.
  - Pets Adviser/Petful (88954214@N04, 24 photos)
- **Openverse**: hairless-breed queries (184 results).
- **Commons**:
  - Categories crawled: Xoloitzquintle, Peruvian Hairless Dog, American Hairless Terrier, Hairless dog breeds, Chinese
    Crested Dog, Top views of dogs, Front views of dogs, Wet dogs, Swimming dogs.
  - Searched but empty or missing: Canis lupus from above, Canis lupus swimming, Aerial photographs of wolves.
- **iNaturalist**: Canis lupus, cc-by/cc0, June-August (907 photos, 320 screened by eye).
- About 2,000 thumbnails were screened on contact sheets.

## Technical notes
- Downloads of Flickr originals (`_o`) and Commons originals mostly returned HTTP 429. The largest size that worked was used,
  and each catalogue row says which size that is.
- Python `requests` was rate-limited on `live.staticflickr.com` while `curl` was not, so downloads went through curl.
- Two Commons files (Isomeksikonkarvaton1/2, Georgio Armani 09) only came as 1,920 px thumbnails that were larger than the
  originals. They were resampled back down to the original pixel size.
- Svenska Mässan photos are capped at 1,600 px (h size).

## Licence rejects worth a permission request
Ranked by value:
1. **Canarian** (Wikimedia Commons user). Their CC BY-SA 4.0 show-ring stacks are the best hairless references on Commons
   (the CC BY 4.0 Canarian files are already used here):
   - About 12 American Hairless Terrier files: Aht-blue1/2, Aht-isabella, Aht-sable&white1/3, Americanhairlessaht1-3,
     Amerikankarvaton1-4.
   - Peruvian Inca Orchid: PeruvianHairlessGrande-blackwhite1, PeruvianHairlessMedio-grey, Small_Peruvian_Hairless_brown_1-3.
   - Xoloitzcuintli: XoloLarge1-3, MexicanHairlessMedio-black.

   Either ask Canarian for CC BY, or GrumpyDingo could decide to accept BY-SA for reference-only use.
2. Other CC BY-SA files:
   - Peruvian hairless dog: Peruvian_hairless_large.JPG (Jablct), Perro-sin-pelo-del-peru.JPG (Paradais Sphynx),
     Peruvian_Hairless_Dog_Middle.JPG (Томасина), 11-Peruvian_Hairless_Dog-nX-* (PsamatheM).
   - Xoloitzcuintli: XoloitzquintlePérou_(1)_02.jpg (BluesyPete, 4,896 px).
3. Front and top views (CC BY-SA on Commons):
   - Front: Malis.JPG (two Malinois standing front-on), Dog_niemiecki_pregowany_001_U.jpg (Great Dane, square front),
     13_months_old_Male_Bully_Kutta.jpg.
   - Top: Pinschernain.JPG and DogInKitchen*.JPG (true top-down views of standing dogs).
4. A Flickr account that mirrors Commons files: ancientartpodcast.org (35150094@N04) re-uploads Commons CC BY-SA photos under
   CC BY 2.0. These were not used; the original licence applies.

## Gaps
- **Top**: no true dorsal photo of a standing wolf or short-coated medium dog was found.
  - The closest wolf images are the oblique NPS aerial-survey shots, with each wolf about 200-400 px.
  - The dog images are a drone shot, a dog sitting seen from above and a spaniel seen from above.
  - Best leads: NPS/Yellowstone Wolf Project or Isle Royale survey photo archives (vertical frames, needs a request), and
    the BY-SA Commons top views above.
- **Front**: only one square front view of a wolf at good size (in winter coat), and none in summer coat.
- **American Hairless Terrier**: only 1 licence-clean side view, against a target of 5+. **PIO**: no clean show stack.
- **Wet**: one good wet wolf and one wet Boxer. Commons "Wet dogs" and "Swimming dogs" were crawled (293 files) but not yet
  screened by eye.
- **Whippet, Greyhound and Ibizan Hound** stacks: none passed. **Pharaoh Hound**: one weak photo; Cloudforest 7663544330 could
  not be downloaded (429).
- **Re-fetch originals** when Flickr and Commons stop rate-limiting: Renee V's Weimaraners (800 px only), Xolomedio (960 px),
  and the Svenska Mässan originals.
