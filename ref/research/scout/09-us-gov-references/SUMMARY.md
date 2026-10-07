# 09 US government references: summary

**Status: done (Task A complete; Task B catalogue with 21 entries, 14 PD files stored).** Date 2026-10-07. Rights and method in `NOTE.md`; every number in `data.csv` (86 rows); every source in `sources.csv`. Mech 1974 was supplied by GrumpyDingo; its page 1 reads "This document is a U.S. government work and is not subject to copyright in the United States."

## Task A: Mech 1974 (Mammalian Species 37, US government work)
**Skull (Fig. 5, *C. l. tundrarum*, Alaska; after Bee & Hall 1956), digitised in `mech1974_skull_outlines.json`** (facing right, y down, prosthion origin, CBL units, same frame as `missingfound/wolf-skull`):

| Measure (× CBL) | Mech Fig. 5 | 3D 170753 | wolf.yaml | |
|---|---|---|---|---|
| total length (inion–prosthion) | 1.049 | 1.034 | | agree |
| condyle rise above prosthion level | 3.05° | 3.0° | | agree (no rotation needed) |
| skull height above prosthion | 0.345 | 0.36 | | drawing ~4 % lower forehead |
| upper canine tip below prosthion | 0.123 | 0.084 | | teeth drawn longer |
| mandible, condyle–infradentale | 0.783 | 0.771 (170555 0.785) | 0.78 | agree |
| ramus height | 0.316 | 0.325 | | agree |
| zygomatic breadth | 0.554 | 0.584 | 0.56 | agree |
| orbit width, side view | 0.125 | 0.123 | | agree |
| side-outline IoU | 0.81 vs 170753, 0.72 vs 170555 | | | good |

A second, independent (North American) wolf skull agrees with 170753. Keep the 3D skull as the head template; the drawing confirms it. The articulated mandible sits about 0.03 CBL forward at the 3D hinge, which is drawing error.

**Other Mech numbers (new unless noted):**
- guard hairs 60–100 mm, mane 120–150 mm (agrees with scout/03; same root source, Adorjan & Kolenosky 1969); dorsal hair longer and darker than ventral; shedding in late spring.
- **precaudal gland: a stiff-haired patch on top of the tail about 70 mm from its base** (place the dark tail spot there).
- chest narrow and keel-like, elbows turned in, paws out; front 5 toes (dewclaw), hind 4; 42 teeth, canines ~26 mm; **orbital angle 40–45° vs 53–60° in dogs** (Fig. 2).
- total length F 1.37–1.52 m, M 1.27–1.64 m (the printed feet do not match the metres: confidence C); weight F 18–55 kg, M 20–80 kg.
- **usual travel rate 8 km/h (2.2 m/s); running 55–70 km/h.** Mech 1966 gives the same travelling trot (~5 mph). **This disagrees with `wolf.yaml` trot_speed 4.0 m/s (13–16 km/h, C).** Suggest a 2.2 m/s travelling trot and keep 4 m/s as a fast trot. Firefly or GrumpyDingo to decide.
- ontogeny: gestation 63 d; litter 6 (1–11); eyes open day 11–15; weaned week 5; adult teeth weeks 16–26; epiphyses fused at ~12 months; pups 27 kg by October; lifespan up to 16 years.
- behaviour: dominant posture (stiff legs, ears erect and forward, mane bristling, **tail vertical**); active submission (ears and lips back, hindquarters lowered, tail between legs); passive submission (on its back); rests on its side, sleeps curled with nose under tail; howl 0.5–11 s, 150–780 Hz; growl 380–450 Hz; bark 320–904 Hz.
- Fig. 1 photo: trotting, three-quarter view, so not a profile template.

## Task B: best PD references found
1. **Murie 1944, *The Wolves of Mount McKinley* (NPS Fauna Series 5).** Six pencil wolf portraits by O. J. Murie, including **"Black Male": a standing wolf in true side view facing right, all four legs visible**, which answers Priority 1, plus a walking ("Grandpa", facing right) and a galloping ("The Dandy") profile. Stored at 350 dpi. Numbers: **pace 25–38 in (stride 1.27–1.93 m) walking/trotting; trot paces 30–34 in**; front track 124–133 × 86–108 mm, hind 117–127 × 76–89 mm; pup shoulder height 368 mm (9 wk), 445 (13 wk), 495 (17 wk), 610 (24 wk), adult female 686 mm; colour notes (a light vertical line behind the shoulder, black tail tip, silver mane, black mantle).
2. **Mivart 1890, Keulemans colour plates (PD by age): the Dingo standing in true side view facing right**, which answers Priority 1.2 (dingo template). Also stored: American wolf (side, facing right), common wolf and prairie wolf (coyote). The book has plates of every canid (jackals, dholes, *Lycaon*, raccoon dog), ready when those species come.
3. **USFWS photos (Public Domain label):** Mexican wolf walking near profile, red wolf standing near profile (head turned), gray fox, coyote. Stored.
4. Mech's USGS papers (PD by federal authorship): adult mass peaks at M 40.8 / F 31.2 kg; Minnesota cline F 26.3–30.0, M 30.6–35.9 kg (n = 1956); pup growth ~8–10 kg at 3 months to 30–32 kg at 10–12 months. These agree with `wolf.yaml` (31.8 kg).
5. Not PD: **Young & Goldman 1944 was renewed in 1972 (R525537)**, so it is in copyright until 2039; use facts only. **Mammalian Species: only No. 37 (Mech) is a clear US government work**; coyote No. 79 and the others are ASM copyright (author addresses checked for 31 canid and hyaenid accounts). No. 22 *Canis rufus* is joint federal and university work, so not PD.

## Suggested next uses
- Warp the body template to **Murie's Black Male** (wolf) and **Mivart's Dingo** (dingo/Carolina Dog), with GrumpyDingo judging. Both are artists' drawings with fur, so landmark the skeleton in from the existing bones; do not read bone lengths off them. Rough EST ratios from the Black Male are in `data.csv` (C).
- Add the tail-gland spot (~70 mm from the base), a black tail tip, a pale shoulder line, the dominant (tail vertical) and submissive poses, and a 2.2 m/s travelling trot (pending a decision).
- Coyote numbers (TL, tail, hind foot, ear, CBL per subspecies) are in Young & Jackson 1951 Part II, as facts only until its rights are settled.
- `mech1974_fig5_vs_3d_skulls_overlay.png` mixes in the CC BY 3D skull outlines: credit MRI PAS if it is ever shown.

## Needs a human
1. **Download the blocked UNL PDFs by hand** (Cloudflare): digitalcommons.unl.edu usgsnpwrc/108 (Mech 2006 body mass by age table), /363 (pup growth), /403 (cline), /351 (Minnesota skull measurements), icwdm_usdanwrc/2209 (intercanine widths, PD notice).
2. **The Clever Coyote (1951) renewal:** search the Copyright Office records for a 1978–79 renewal. If none, the book is PD and its plates and tables can be stored.
3. Bee & Hall 1956 (source of Mech Fig. 5): check its renewal only if the skull drawing itself is ever shipped as art (the digitised numbers are fine).
4. Optional: a BHL API key, which would allow searching North American Fauna (Bailey 1931 New Mexico, 1936 Oregon) for more PD wolf and coyote plates and measurements.
