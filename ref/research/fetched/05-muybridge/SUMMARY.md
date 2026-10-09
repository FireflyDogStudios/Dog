# 05-muybridge: summary

**Status: fetched.** All 7 plates (704-710) are kept as public-domain images under 2 MB each (8 files, 9 MB in total), with per-frame contact scoring in `data.json`.
- Sources: Wikimedia Commons scans from USC Digital Library and Boston Public Library; Muybridge, *Animals in Motion* (1902, archive.org).
- **Footnote:** the hand-stamped plate numbers 709 and 710 are swapped between the BPL and USC copies, so the data calls the two Maggie sequences A and B.

Regenerated Oct 7 by Atlas from the corrected per-frame `plates` in `data.json` (approval A-002 item 4). Duty factors count only frames that could be scored ("?" frames left out); the ranges are in `data.json`.

| Plate | Dog, gait | Interval | Touchdown order | L/R status | Duty factor: fore (LF, RF); hind (LH, RH) | Feet down ÷ 4 |
|---|---|---|---|---|---|---|
| 704 | Dread, walk (oblique views) | not given | not scored | per-limb not scored | n/a | 0.71-0.77 |
| 705 | Dread, trot (oblique views) | not given | not scored | per-limb not scored | n/a | 0.48-0.62 |
| 706 | Smith, "trot" (really an irregular lateral-sequence walk or amble) | **0.110 s** (1902, Series 39) | LH, LF, RH, RF (lateral sequence) | confirmed | 0.42, 0.64; 0.58, 0.75 | 0.58 |
| 707 | Dread, rotary gallop, one suspension | not given | LH, RH, RF, LF, suspension | confirmed (was mirrored) | 0.43, 0.25; 0.25, 0.25 | 0.28 |
| 708 | Ike, rotary gallop, two suspensions (blurred) | not given | LF, (RF?), suspension, RH, LH, suspension | **50/50** (mirror equally likely) | 0.40, 0-0.3; 0.10, 0.22 | 0.17 |
| Maggie A (709 BPL = 710 USC) | rotary gallop, two suspensions | not given | LH, RH, suspension, RF, LF, suspension | checked on frames 1, 2, 4, 5 (was mirrored) | 0.18, 0.25; 0.27, 0.18 | 0.21 |
| Maggie B (710 BPL = 1902 Series 56) | rotary gallop, two suspensions | **0.049 s**; stride 0.25 s, 2.85 m | RH, LH, suspension, LF, RF, suspension | confirmed (Muybridge 1902 p.158) | 0.20, 0.30; 0.09, 0.09 | 0.15 |

**What the numbers say:**
- Gallop duty factors are about 0.15-0.28, slightly below the 0.25-0.35 estimate in `gait/REPORT.md`.
- Maggie B's contact time is about 1-2 frames, roughly 50-100 ms.
- The mastiff walk's duty factor is about 0.75.

**Blocked:**
- Commons originals and non-standard thumbnail widths returned HTTP 429, so standard thumbnail widths were used.
- No frame interval exists for 704, 705, 707, 708 or Maggie A.
- Left/right identity is confirmed for 706, 707, Maggie A and Maggie B (see `corrections` in `data.json` and `../../missingfound/walk-footfall-and-muybridge/`); 708 stays 50/50; 704 and 705 are not scored per limb.
