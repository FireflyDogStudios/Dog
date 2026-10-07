# Walk footfall timing and Muybridge L/R labels: summary

**Status (2026-10-07):**
- **Task 1 (0.135 vs 0.20): settled.** The two values use the same definition; we recommend a value for each animal.
- **Task 2 (Muybridge L/R): mostly settled.**
  - Changed: 707 and Maggie A were fully mirrored.
  - Confirmed: 706 (with two contact fixes) and Maggie B (by Muybridge's own text).
  - Still open: 708 (blur), 704 and 705 (oblique views).

Data: `data.json` (values table, recommendation, corrected plates with a `confirmed` flag per frame). Sources, licences and method: `NOTE.md`.

## Task 1: the walk's front-paw footfall (LF after LH, LH = 0)

**Same definition.** Both numbers are Hildebrand's limb phase: the fraction of the stride by which the fore footfall follows the same-side hind footfall. Cartmill and Lemelin call the same number "diagonality". Maes's "pair lag" is its complement: limb phase = 1 − PL.

Where each number came from:
- **0.135** (Catavitello 2015): measured. Six heavy retrievers in a brisk walk (1.46 Hz), 2D video. The touchdown proxy is the limb's most-forward point.
- **0.20** (wolf.yaml): not a measurement. It is the midpoint of Maes's measured 0.16 and the textbook single-foot walk, 0.25.

| Source | Dogs | Limb phase |
|---|---|---|
| Catavitello 2015 (CC BY) | 6 retrievers, 35 kg | **0.135** ± 0.03 |
| Maes 2008 JEB | 5 Malinois, 28 kg | **0.16** ± 0.05 (PL 84 %); falls ~0.03 per m/s |
| Hildebrand 1968, Fig. 1 digitised | long-legged breeds | **0.14** median (IQR 0.11-0.18) |
| Hildebrand 1968 | short-legged breeds | 0.23 median (IQR 0.19-0.24) |
| Wilshin 2017 (CC BY) | 6 dogs, 22.6 kg, 0.51 m | mostly lateral couplets (< 0.25); 2 dogs ~0.25; duty 0.66 |
| Cartmill 2002, rule D = Sh − 0.5 | dogs in lateral couplets | 0.10-0.16 at hind duty 0.60-0.66 |
| Usherwood 2017 (CC BY), all-mammal fit | carnivorans 0.10-0.21 | 0.185 at duty 0.65 |
| Muybridge plate 706 | mastiff, one stride | ~0.25 (±0.12, coarse) |
| Wolf | none | **no wolf walk timing exists** (searched Europe PMC and the web) |

**How it moves:**
- **Speed:** a faster, lower-duty walk lowers the limb phase slightly (Maes; Hildebrand's trend; Cartmill's rule). A slow, relaxed walk drifts toward single-foot, 0.25 (Hildebrand 1980).
- **Build:** long legs relative to the trunk give lateral couplets (~0.10-0.18). Short legs give ~0.20-0.30.
- **Ground:** rough ground pushes any walk toward trot (Wilshin).

**Recommendation:**

| Animal, relaxed walk | Limb phase (LF) | Range | RF | Duty | Confidence |
|---|---|---|---|---|---|
| Wolf | **0.16** | 0.12-0.20 | 0.66 | 0.64 (0.60-0.68) | B− (from long-legged dogs; no wolf data) |
| Dingo-sized dog | **0.17** | 0.13-0.22 | 0.67 | 0.65 (0.60-0.68) | B−/C |

So neither 0.135 nor 0.20 should be kept as is: 0.135 is a brisk-walk value for heavy retrievers, and 0.20 sits at the slow, short-legged end of the range. Use 0.16 to 0.17 and let it drift within 0.12-0.22 with speed and ground. RH stays at 0.50.

## Task 2: Muybridge left/right labels

**Method:**
- **Which side faces the camera:** every lateral camera sees the dog's right side. The dog moves right and the scale numerals read normally, so the print is not mirrored.
- **Near versus far, frame by frame:** which leg comes out of the near thigh or near shoulder; the darker far limbs (on the mastiff); the rear-view rows (a leg left of the tail is a left leg); for 706, each planted paw tracked against the numbered floor scale; Muybridge's own 1902 text, which names the feet with symbols.

| Plate | Outcome | Corrected footfall order | Duty factor (fore / hind, frames) |
|---|---|---|---|
| 704 Dread walk | unchanged; oblique views only (feet down 0.71-0.77) | not scored | n/a |
| 705 Dread trot | unchanged; oblique views only | not scored | n/a |
| 706 Smith "trot" | **confirmed**, 2 contacts fixed (f9 RH 1→0, f12 LF 1→0), f12 RF 1→?, 6 unknowns resolved | LH, LF, RH, RF (lateral-sequence walk), then diagonal pairs (trot) from frame 7 | LF 0.42, RF 0.64; LH 0.58, RH 0.75 (feet down 0.58) |
| 707 Dread gallop | **changed: all L/R mirrored** | LH, RH, RF, LF, one suspension (rotary; lead hind R, lead fore L) | LF 0.43, RF 0.25; LH 0.25, RH 0.25 (same values, sides swapped) |
| 708 Ike gallop | **uncertain** (blur); treat L/R as 50/50 | as in 05, or its mirror | as in 05 |
| Maggie A (709 BPL = 710 USC) | **changed: all L/R mirrored** (frames 1, 2, 4, 5 checked directly; the second stride assumes the same lead) | LH, RH, extended suspension, RF, LF, gathered suspension (lead hind R, lead fore L) | LF 0.18, RF 0.25; LH 0.27, RH 0.18 |
| Maggie B (710 BPL = Series 56) | **confirmed by Muybridge 1902, p.158** | RH, LH, extended suspension, LF, RF, gathered suspension (lead hind L, lead fore R) | unchanged |

Why 05 went wrong: its notes say the gallop labels were fitted to Muybridge 1893's generic "lands on the right hind first" description. Two of the three gallops that can be checked used the opposite lead.

## Blockers
- **No wolf data:** no measurement of wolf (or dingo) walk footfall timing exists in open sources.
- **Facts only:** Maes 2008, Hildebrand 1968 and 1980, and Cartmill 2002 are copyrighted, so only facts and digitised numbers are recorded.
- **Plate 704 per-limb scoring is still to do.** Single-frame USC scans exist on Commons (`Dog Dread walking (rbm-QP301M8-1887-704a/b~NN).jpg`), but originals are refused with HTTP 429 (only the 960 px thumbnail works, with a descriptive user agent), 4 of 24 frames would not download after retries, and oblique views need a slower pass.
- **Maes 2008 on journals.biologists.com:** plain curl hits a Cloudflare challenge; WebFetch worked.
