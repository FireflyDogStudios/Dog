# Grey wolf (Canis lupus) - muscle-ref / top / front

Part of Firefly's Oct 7 request for new pose values `muscle-ref`, `top` and `front`
(see `../MUSCLE-TOP-FRONT-NOTE.md` for the overall search, rejects and gaps).
Pose meanings: `muscle-ref` = side-on (or near side-on) photo where little fur hides muscle shape;
`top` = dorsal / high-angle view for body width; `front` = front-on standing view for chest/body width.
Every licence was checked on the individual Flickr photo page (embedded `license` code of the main photo model),
Commons file page (licence template) or iNaturalist API `license_code`. Sizes: Flickr originals and Commons
originals mostly returned HTTP 429, so the largest size that downloaded is used; each catalogue row says which.

Scout's wolf files in `ref/research/scout/01-body-templates/wolf/` were excluded by photo id (iNat 130681789, 174319033, 130681802,
2819964, 39974083, 744349859; Flickr 3520737474, 8455338582, 38401270711). Different frames from the same observations are used
only where noted (iNat obs 405270032 vs Scout's 405270031; Flickr 5039516054 is a different Jim Clark/USFWS Mexican wolf frame from Scout's).

## What is here
- `muscle-ref/` 12: 01 WET wolf at Biscuit Basin (NPS, PD, 6k) is the standout; 06 Mexican wolf in August coat trotting side-on (USFWS);
  07 Indian wolf (short-coated subspecies) standing side-on (5k); 02-05 wild wolves in June-August coats from iNaturalist;
  11 wet zoo wolf wading.
- `front/` 7: 01 NPS Canyon-pack wolf standing square to camera on snow (4k) is the only true square front view of a wolf at size;
  07 NPS wolf at Sedge Bay is square but small; the rest are three-quarter or walking toward camera.
- `top/` 2: Yellowstone aerial survey photos (NPS, PD) of the Junction Butte pack from a fixed-wing plane: oblique, wolves small.

## How I searched
- Yellowstone NPS Flickr (80223459@N05, all Public Domain Mark): "wolf", "wolves", "aerial", "wolf river", "wolf summer" (195 photos).
- USFWS Headquarters Flickr (50838842@N06): "wolf", "gray wolf", "red wolf", "mexican wolf" (74).
- Flickr general: "wet wolf", "wolf swimming", "wolf crossing river", "wolf in water", "wolf rain", "wolf shedding", "wolf summer coat",
  "mexican wolf", "red wolf", "arabian wolf", "indian wolf", "wolf front view", "wolf standing front", "wolf head on", "wolf aerial",
  "wolves from helicopter", "wolf pack from plane", "drone wolves" (~600 hits total).
- iNaturalist: taxon 42048, licence cc-by/cc0, months 6-8, ordered by votes (400 observations, 907 photos; 689 wolf photos >=1400 px;
  320 screened by eye).

## Rejected / not used
- Most YNP wolf photos are winter, distant or through glass; YNP summer river crossings (16241374725 Alum Creek, 7437558526) are
  wolves too small/back-on; 51785732273 winter road wolf (not summer/wet).
- iNat photos under CC BY-NC (the majority) were filtered out by the API query and not considered.
- No CC BY-SA or NC files used. No licence-reject worth a request among wolves (the good wolf photos that exist are mostly NC on iNat).

## Gaps
- True top-down (dorsal) wolf photo: none found. The NPS aerial survey shots are the closest. A request to Yellowstone Wolf Project
  or NPS for vertical aerial frames (they fly regular surveys) would fill this; Isle Royale (NPS) survey photos are another lead.
- Wet wolves: only one at good size (01). Swimming-wolf photos found were head-only in water.
- Square front view of a summer-coat wolf: none.

## Standing side-on for back-line measurement (Shutter helper)
Request: MORE grey wolves (Canis lupus, any subspecies; no dogs, no coyotes, no red wolf) standing still, true side-on, for measuring heights of
withers, mid-back, croup and tail root above the ground. Strict: standing (no walk, no raised paw), level camera, body square, four paws on the ground,
topline withers to tail root unobstructed, sharp, adult, wolf >= 900 px nose to tail root. Folder: `standing/` (10 photos, rows appended to
`catalogue.csv`, pose = standing, ranked 1-10 best first). Excluded by source id: everything already in Scout's `scout/01-body-templates/wolf/` and in
this folder's muscle-ref / front / top.

What is here (ranked): 01 NPS "Half Black" on a level road (wild, winter, PD); 02 NPS Canyon alpha male (wild, PD, very large); 03 Seoul Zoo (CC0,
patchy coat shows the topline); 04 Jennifer C. captive in low plants; 05 Eekholt sand yard (CC BY 3.0); 06 Kristi Herbert (March, winter coat, a bit
three-quarter); 07 white wolf, topline only (hind legs hidden by flowers); 08 Mexican wolf at Mesker Park Zoo (sloped ground); 09 and 10 wild iNat
wolves that are slightly under 900 px (865 and 870) and are kept only because they are clean and wild. Ground level / slope, facing and
captive-or-wild are in each row's notes. Wolf lengths are bounding-box widths of the stored file (hanging tails, so nose to tail root is within ~5 %).

How I searched (several thousand candidate thumbnails screened by contact sheet, then about 60 looked at large):
- iNaturalist taxon 42048, licence cc-by and cc0, ordered by votes, all pages: 2,918 photos. 1,456 were >= 1500 px wide and landscape; a small
  object detector (YOLOv8n, ONNX) boxed the animal so only frames with a wolf >= 650 px and a body-like aspect ratio went to a human-eye sheet (about 210);
  120 more of 1200-1499 px width were also checked. Most iNat wolves are walking, in grass, or camera-trap frames.
- Flickr (fsearch.py, licences BY 2.0, CC0, PDM, BY 4.0): wolf standing, gray wolf profile, timber wolf, arctic wolf, mexican wolf, yellowstone wolf,
  wolf side view, wolf sanctuary, grey wolf, canis lupus, denali wolf, isle royale wolf, usfws gray wolf, gray wolf captive, grey wolf zoo, wolf standing
  profile, wolf in profile, canis lupus standing, Wolf Park Indiana, wolf conservation center: ~860 hits, ~800 screened. Licence read per photo page.
- Wikimedia Commons: categories Canis lupus (+ captive / male / female / melanism / by subspecies / in zoos / Yellowstone / Quality images): 2,356 files,
  about 1,440 at >= 1400 px screened by sheet; licence read per file page. Commons originals returned HTTP 429, so stored files are the largest standard
  thumbnail that worked (1920 or 3840 px).
- US federal: Yellowstone NPS Flickr and Commons NPS uploads (all PD); no usable Denali or USFWS side-on stand found (Denali frames are bus-window
  snapshots with a window frame in view; USFWS wolves are walking or lying).

Rejected (reasons):
- CC BY-SA / GFDL-only / other licences (not allowed): Hellabrunn wolves by Rufus46 (CC BY-SA 3.0; several look like good side-on stands), Wolf-Standing Tall
  41830604430 by Arwen_7 (CC BY-SA 2.0), Loup du Canada DSCF5785/6587 by Musicaline (CC BY-SA 4.0), Canis lupus arctos qtl1/qtl2 by Quartl (CC BY-SA 3.0),
  Canis lupus Ernstbrunn by Mariofan13 (CC BY-SA 3.0), Gahnender Wolf Worms by 4028mdk09 (BY-SA 3.0), Olderdissen wolves by WwwFrank (BY-SA 4.0),
  Wolf Zoo Berlin by Aconcagua (BY-SA/GFDL), Gray Wolf 51545668593 by Gregory Smith (BY-SA 2.0), Arctic wolf IMG_91xx by Rama (licence text not parsed; Rama's uploads are normally CC BY-SA, so skipped), Le Pal wolves by
  Chabe01 (BY-SA 4.0), Casteil wolves by Andre Labetaa (BY-SA 2.0), Un Lobo Mexicano by anaroza (BY-SA 2.0), Wolf on Point Duty 7263462724 by Mark Kent
  (BY-SA 2.0). Canis lupus Gramat (V. Mourre: GFDL / BY-SA 3.0 / BY 2.5 triple licence; body is three-quarter anyway).
- Stock-site licence, not CC0 in the sense of the brief: Loup Brun.jpg (Commons, uploaded from Pixabay "Pixel-mixer", Pixabay licence stated as CC0). A
  good side-on wolf in a forest edge but grass hides the paws; left out per rule 1 (stock-site licences).
- Licence fine but photo not strict enough: Amaury Laporte 49193456257 / 49193457342 / 49193455177 / 7227834102 (three-quarter or head-on);
  Michelle Callahan 9010000755 and 9010005383 (BY 2.0; log and flowers hide hind legs, camera high); Fool4myCanon 8756152762 (BY 2.0; tree stump hides tail,
  stepping pose); LEGADEMA Wolf 35805812013 (BY 2.0; clean side-on stand, but the tail and hind feet are at the frame edge and there is a society logo
  watermark); Marie Hale 4964499030 (BY 2.0; three-quarter on a platform); Wolves of Brookfield 08/10/11 (BY 2.0; three-quarter or on a rock); Tony
  Hisgett Mexican wolves 14910052563 / 15344102138 (already in muscle-ref; walking); Kandukuru Nagarjun 52713777097 (already in muscle-ref); iNat
  269935080 (heather hides legs, head away), 625531154 (fence in front, on a stump), 592378640 (walking), Indian wolf series 6259123xx-6259135xx (jackal-sized in
  dry grass, walking or grass over legs), 547757232 (standing on shore rocks, rocks hide hind legs).
- Already in the other folders (not duplicated): Scout set and muscle-ref / front / top (see the lists above).

Could not find / limits:
- Almost no wolf photo meets all strict criteria at >= 900 px: wild wolves are rarely photographed square and level, and zoo wolves are often shot
  from above or through wire. Of the 10, only 01 and 02 are fully strict (and 01 is just over 1000 px long).
- Wolf length is under the 900 px target for 09 and 10 (865, 870).
- No summer-coat wild wolf standing square on level ground at >= 1,200 px was found with an allowed licence.
- Worth a permission request if more are wanted: the Hellabrunn wolf stands by Rufus46 (CC BY-SA 3.0 on Commons; share-alike would apply to derivative
  images, so ask first).
