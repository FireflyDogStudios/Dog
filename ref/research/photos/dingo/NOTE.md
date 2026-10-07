# Dingo photo references: search notes

Lower-priority species, so this was a quick pass: only the good finds are catalogued (18 images).
The scout's 7 dingo images in `ref/research/scout/01-body-templates/dingo/` are NOT repeated here
(iNat obs 365015776, 224364883, 106731997, 99446517, 7054489 and the Mivart plate were excluded, including
other photos from those same observations, e.g. John Barkla 9054977 and Paul Coddington 397647759).

## What is here
| pose | count | best |
|---|---|---|
| standing | 6 | 01 Robert Nyman (true side-on, square, 1600 px), 02 Chris Fithall (very sharp, on a log) |
| walking | 6 | 01 Caroline Jones (wild, perfect side-on stride, 3654 px), 02 lostandcold / Jarrod Amoore (outback, clean silhouette) |
| head | 5 | 01 Jean Ogden (sharp side profile), 02 Sofia Zvolanek (wild, head+neck profile) |
| lying | 1 | Sam Fraser-Smith, side-on on sand, head turned |
| trotting, sitting | 0 | nothing usable side-on found in this pass |

No dingo is perfectly "stacked". Standing 01 and 02 are the ones to measure from; 03 and 05 have the head
turned to camera; 04 has a keeper's hand on the head; 06 is mid-step with head raised.

## How I searched
- Flickr search scrape (licences BY 2.0, CC0, PDM, BY 4.0 only): 451 hits screened by eye on 16 contact sheets.
  Most of the hits are noise (Dingo boots ads, Daimler Dingo cars, Dingo Beach landscapes, cattle dogs named Dingo,
  a 200-photo Fraser Island travel set by theflyingrob).
- Openverse (Commons + iNaturalist, licences by/cc0/pdm): 185 non-Flickr hits screened. Most Commons dingo files are
  copies of Flickr photos already seen. Many Commons thumbnails returned HTTP 429.
- Shortlisted 36 images, viewed them large, kept 18.
- Licence checked on each source page: Flickr photo page (licence link + licence id), iNaturalist API
  (`photos[].license_code`, observation by user id). Originals came from Flickr `sizes/o` and iNat open-data S3.
- Real-animal check: EXIF camera model where present (listed per file), plus context (zoo or wild observation).
  None look AI-made or composited.

## Licence notes
- **Caroline Jones (walking 01)** carries the Flickr **Public Domain Mark**, which she applied to her own photo. A
  PDM is a statement, not a CC0 waiver. It is kept and flagged in the catalogue; swap it out if a human prefers.
- **Removed in Shutter's compliance review:** TSUinternational 37223135990 (was standing 03; Katy Platt, Tarleton
  State University). It carries a PDM applied by a Texas state institution. State works are not automatically public
  domain and a PDM is not a waiver, so the basis is unclear. Left out under the "when unsure, leave it out" rule.
  It could come back if Tarleton confirms CC0, or with a permission email (GrumpyDingo to send). Standing ranks 04–06
  keep their file names. The gap at 03 is deliberate.
- Everything else is CC BY 2.0 / CC BY 4.0 / CC0 as recorded in catalogue.csv. Attribution is required for BY.

## Looked at but rejected
- Scout's Commons list:
  - Yu Chu Chin "Canis lupus dingo in Cleland Wildlife Park" (CC BY 4.0): dingo asleep on its side, shot from above. Not usable.
  - brett "Canis lupus dingo - Healesville Sanctuary" (CC BY 2.0): dingo hidden under a log shelter, tiny. Not usable.
  - Ron Knight "Dingo (Canis lupus dingo) (8603079142)" (CC BY 2.0; Flickr sussexbirder): dingo walking away from the camera. Not usable.
  - Brian Gratwicke "Canis lupus dingo, Fraser Island": KEPT (walking 04, from the Flickr original).
  - Sam Fraser-Smith "Canis lupus dingo": standing, rear 3/4 view, not kept. "Canis lupus dingo 2": KEPT (lying 01).
- TSUinternational 37223136630 (PDM): good standing pose but the original is only 1152 px (animal ~600 px). Too small.
- Brian Giesen 3556577520 "Dingos at Taronga Zoo" (BY 2.0): standing side-on, but a second dingo overlaps it and it is only 1280 px.
- desertnaturalist iNat 100138767 (BY 4.0): wild dingo walking side-on, but the image is only 830 px.
- sandrokan 2158230082: 3/4 view with a visible watermark.
- theflyingrob 23587940271: trotting dingo on sand, small, with a "© Robert Krön" watermark.
- CazzJj 55133472925: walking toward the camera (front 3/4).
- Will Ellis 139114983, PaulBalfe 34650957965, Rolf Lawrenz iNat 31338838, Mark Bolnik iNat 166193153: 3/4 views,
  head turned, or legs hidden in grass.
- No licence rejects worth a permission request came up. The Flickr search was already filtered to allowed licences.

## Not found
- No trotting side-on dingo of usable size. The only one seen was watermarked and small.
- No sitting side-on dingo.
- No New Guinea singing dog or Carolina Dog side views turned up in the dingo results. The only other primitive
  breed in them was a basenji (fugzu), which does not count.

## Blocked
- Wikimedia upload server rate-limited (429) many Commons thumbnails and originals. Where a Commons file mirrors a
  Flickr photo, I used the Flickr original instead.
- iNaturalist photo pages are behind a Cloudflare challenge. The API worked for licence checks.
