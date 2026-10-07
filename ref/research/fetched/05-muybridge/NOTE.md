# 05-muybridge: Muybridge dog plates 704-710, footfalls frame by frame

Fetched 2026-10-06 by a data-fetch agent.

## Source
- **Work:** Eadweard Muybridge, *Animal Locomotion: an electro-photographic investigation of consecutive phases of animal movements, 1872-1885*. Vol. X, Domestic Animals, plates 704-710. Philadelphia: University of Pennsylvania, 1887.
- **Licence:** public domain. Published 1887; Muybridge died 1904. Wikimedia Commons tags every file used here "Public domain" (USC files: "Copyrighted: False"). No LICENSE.txt is needed.
- **Plate descriptions:** the 1887 *Prospectus and catalogue of plates*, as quoted in the Boston Public Library records:
  - 704: walking, mastiff Dread
  - 705: trotting, interrupted, Dread
  - 706: trotting, interrupted, mastiff Smith
  - 707: galloping, interrupted, Dread
  - 708: galloping, brown racing hound Ike
  - 709 and 710: galloping, white racing hound Maggie
- **Frame intervals:** from Muybridge, *Animals in Motion* (London: Chapman & Hall, 1902), which is public domain. Scan: https://archive.org/details/animalsmotion00muyb (Getty Research Institute copy).
  - Page 131, Series 39: the same 12 frames as plate 706. Interval **0.110 s**; stride 52 in (1.30 m); "completed movement" 1.21 s.
  - Page 189, Series 56: the same frames as the BPL copy of plate 710 (Maggie, sequence B). Interval **0.049 s**; stride 114 in (2.85 m); stride time about 0.25 s; shoulder height 16 in (0.40 m).
  - Series 14 (plate 704) and Series 57 (plate 707) are reprinted with **no interval**.
  - No interval was found for 705, 708 or Maggie sequence A. The 1887 catalogue (archive.org `animallocomotion00muyb`, `cu31924024580353`) gives no intervals.
- **Muybridge's own description of the dog gallop:** *Descriptive Zoopraxography* (1893), p. 41-42, archive.org `descriptivezoopr00muyb_1`. "Lands upon the left fore foot, the right fore will next touch the ground; from this he will again spring into the air ... land upon the right hind foot ... The left hind now descends, another flight is effected". This is a rotary gallop with two suspensions.

## Files

All images are under 2 MB. Commons thumbnails at standard widths: 1920 px for BPL and 3840 px for USC.

| File | Plate | Source page | Holder |
|---|---|---|---|
| plate704_dread_walk_BPL.jpg | 704 | https://commons.wikimedia.org/wiki/File:Animal_locomotion._Plate_704_(Boston_Public_Library).jpg | BPL 08_11_000672 |
| plate705_dread_trot_BPL.jpg | 705 | https://commons.wikimedia.org/wiki/File:Animal_locomotion._Plate_705_(Boston_Public_Library).jpg | BPL 08_11_000673 |
| plate706_smith_trot_USC.jpg | 706 | https://commons.wikimedia.org/wiki/File:Dog_Smith_trotting_(rbm-QP301M8-1887-706).jpg | USC Digital Library p15799coll58/id/5252 |
| plate707_dread_gallop_USC.jpg | 707 | https://commons.wikimedia.org/wiki/File:Dog_Dread_galloping_(rbm-QP301M8-1887-707).jpg | USC id/5272 |
| plate708_ike_gallop_USC.jpg | 708 | https://commons.wikimedia.org/wiki/File:Dog_Ike_galloping_(rbm-QP301M8-1887-708).jpg | USC id/5296 |
| plate709or710_maggie_gallop_seqA_USC.jpg | 709 in the BPL copy, 710 in the USC copy | https://commons.wikimedia.org/wiki/File:Dog_Maggie_galloping_(rbm-QP301M8-1887-710).jpg | USC id/5367 (BPL 08_11_000677 is the same sequence) |
| plate710_maggie_gallop_seqB_BPL.jpg | 710 in the BPL copy (only a 1500 px original exists; 1280 px thumbnail kept) | https://commons.wikimedia.org/wiki/File:Animal_locomotion._Plate_710_(Boston_Public_Library).jpg | BPL 08_11_000678 |
| animals_in_motion_1902_p189_series56_maggie_seqB.jpg | the same sequence as the line above, reprinted in 1902 (sharper; used for scoring) | https://archive.org/download/animalsmotion00muyb/page/n208.jpg | Internet Archive |

**Plate-number conflict.** The plate numbers are hand-stamped. The BPL copy and the USC copy stamp the same Maggie sequence differently: BPL stamps it 709, USC stamps it 710. The frames, the rear row and the scratches match one for one. The BPL "710" is a different Maggie sequence, Series 56 of the 1902 book. I could not decide which copy is "right", so `data.json` calls them sequence A and sequence B.

## Method
1. Downloaded the Commons thumbnails to `/tmp/item05` and cropped each lateral frame with PIL, enlarging 1.4-2.1x. Every frame was inspected by eye.
2. Marked each paw 1 if it touches the ground line or its shadow, 0 if it is clearly off the ground, and `?` if blur or occlusion makes it unclear.
3. Assigned identities to the paws:
   - The lateral cameras show the dog moving right, so its right side faces the camera.
   - The brighter, unoccluded near limbs are scored as RF/RH; the far limbs as LF/LH.
   - Limbs were followed from frame to frame by continuity: a planted paw slides backward in the frame by a roughly constant step.
   - For the gallops, the L/R labels also follow Muybridge's 1893 sequence. **L/R identity is an assumption; fore/hind order and the contact pattern are observed.**
4. Plates 704 and 705 have only front-oblique and rear-oblique views. For these, only the number of feet on the ground was counted (a min-max range); the per-limb columns are `?`.
5. Derived values:
   - duty factor per limb = frames in stance ÷ frames on the plate, given as known-only, min and max;
   - touchdown sequence = frames where a limb goes from 0 to 1;
   - an identity-free check: mean feet down ÷ 4.
   - With only 8-12 frames per plate (1-2 strides), treat each duty factor as ±0.1 at best.
6. The frame layout of each plate is recorded in `data.json` under `grid`.

## Conventions
- **Contacts:** 1 = stance, 0 = swing, `?` = unclear.
- **Frame index:** Muybridge's printed frame number.
- **Facing and axes:** facing right; image y points down.
- **Footfall names:** LF, RF, LH, RH, as in `ref/research/gait/REPORT.md`.

## Caveats
- Plate 706 is catalogued as "trotting", but its contacts show lateral-pair support (RF and RH down together in frames 1-3) and a lateral-sequence order. That is an amble or slow walk, not a diagonal trot. Muybridge (1902) calls it "an irregular stride".
- Plate 708 is badly motion-blurred, and RF stance was never seen clearly.
- Mastiff gallop (707): one suspension per stride, after the fores, which matches Muybridge's 1902 remark. The hounds (708, 709/710) show two suspensions, one gathered and one extended.

## Blocked or failed
- Commons `upload.wikimedia.org` refused full-size originals and non-standard thumbnail widths with HTTP 429 ("use thumbnail sizes listed on w.wiki/GHai"). Standard widths (1280, 1920, 3840) worked.
- The Commons API rate-limited heavily (429), probably because the egress IP is shared with parallel agents. Backoff and retry got through.
- No higher-resolution scan of the BPL "710" (Maggie sequence B) plate was found on Commons. The 1902 reprint page was used instead.
- Smithsonian, NGA, the Library of Congress site and DPLA were not needed: the USC and BPL scans on Commons were enough. The DPLA copies on Commons are the BPL scans at about 1000 px. A loc.gov search for these plates returned nothing relevant.

## Correction (Oct 7, 2026, Firefly)
The `plates` list in `data.json` was replaced with the corrected copy from `ref/research/missingfound/walk-footfall-and-muybridge/data.json`: plate 707 and Maggie A had every left/right label mirrored, plate 706 had two contact fixes, and every frame now carries a `confirmed` flag. Plates 708 (blur), 704 and 705 (oblique views) are still unconfirmed. The SUMMARY table above predates this fix for 706, 707 and Maggie A.
