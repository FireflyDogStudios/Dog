# 06-limb-indices: summary

**Status: partly fetched (blocked).**
- Licence confirmed **CC0 1.0** (Dryad API). Metadata saved in `dryad_metadata.json`.
- The data file (50 KB) and README (1.6 KB) could not be downloaded:
  - the Dryad API now needs a login token (401);
  - the web download sits behind an anti-bot proof-of-work wall (403), which was not bypassed;
  - no mirrors were reachable.
- Saved: 5 canid rows (humerus, deltopectoral crest, radius in mm) that the CRAN mvSLOUCH vignette prints from the same CC0 file. **Hyena rows not obtained.**

| Species | HuL mm | RaL mm | Brachial (RaL/HuL) | Source |
|---|---|---|---|---|
| Canis lupus | 212.12 | 210.94 | 0.994 | Samuels et al. 2013 (CC0), via mvSLOUCH vignette |
| Canis latrans | 160.06 | 168.32 | 1.052 | same |
| Canis adustus | 127.84 | 135.86 | 1.063 | same |
| Vulpes lagopus | 106.47 | 101.89 | 0.957 | same |
| Atelocynus microtis | 116.01 | 107.78 | 0.929 | same |

The wolf brachial index of 0.99 agrees with Law et al. 2025 (1.02, in `ref/research/skeleton`). **Needs a human:** download the two files from the Dryad landing page in a browser (CC0). The crural index and other indices need the full file.
