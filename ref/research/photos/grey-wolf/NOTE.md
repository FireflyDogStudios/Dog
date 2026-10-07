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
