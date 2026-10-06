# 05-muybridge: summary

**Status: fetched.** All 7 plates (704-710) are kept as public-domain images under 2 MB each (8 files, 9 MB in total), with per-frame contact scoring in `data.json`.
- Sources: Wikimedia Commons scans from USC Digital Library and Boston Public Library; Muybridge, *Animals in Motion* (1902, archive.org).
- **Footnote:** the hand-stamped plate numbers 709 and 710 are swapped between the BPL and USC copies, so the data calls the two Maggie sequences A and B.

| Plate | Dog, gait | Interval | Touchdown order (L/R assumed) | Duty factor: fore, hind (frames in stance) | Feet down ÷ 4 |
|---|---|---|---|---|---|
| 704 | Dread, walk (oblique views) | not given | not scored | n/a | 0.71-0.77 |
| 705 | Dread, trot (oblique views) | not given | not scored | n/a | 0.48-0.62 |
| 706 | Smith, "trot" (really an irregular lateral-sequence walk or amble) | **0.110 s** (1902, Series 39) | LH, LF, RH, RF | LF 0.45, RF 0.64; LH 0.78, RH 0.82 | 0.58 |
| 707 | Dread, rotary gallop, one suspension | not given | RH, LH, LF, RF, suspension | 0.25-0.43; 0.25 | 0.28 |
| 708 | Ike, rotary gallop, two suspensions (blurred) | not given | LF, (RF?), suspension, RH, LH, suspension | 0-0.4; 0.1-0.3 | 0.17 |
| Maggie A (709 BPL = 710 USC) | rotary gallop, two suspensions | not given | RH, LH, suspension, LF, RF, suspension | about 0.2-0.25; 0.2-0.3 | 0.21 |
| Maggie B (710 BPL = 1902 Series 56) | rotary gallop, two suspensions | **0.049 s**; stride 0.25 s, 2.85 m | LF, RF, suspension, RH, LH, suspension | 0.2-0.3; about 0.1 | 0.15 |

**What the numbers say:**
- Gallop duty factors are about 0.15-0.28, slightly below the 0.25-0.35 estimate in `gait/REPORT.md`.
- Maggie B's contact time is about 1-2 frames, roughly 50-100 ms.
- The mastiff walk's duty factor is about 0.75.

**Blocked:**
- Commons originals and non-standard thumbnail widths returned HTTP 429, so standard thumbnail widths were used.
- No frame interval exists for 704, 705, 707, 708 or Maggie A.
- Left/right limb identity is an assumption; the fore/hind order is observed.
