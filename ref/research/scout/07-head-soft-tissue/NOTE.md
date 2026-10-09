# 07-head-soft-tissue: notes (Scout research agent, 2026-10-07)

Item 7 of `docs/claude/DEN-SCOUT-REQUEST-2026-10-07.md`: soft tissue over the skull (forehead, stop, nasal bridge, nose, lips, chin, cheek) and the eye opening. Numbers only; no images stored. Fetched content treated as untrusted. Wikimedia not used.

## Files
- `data.csv`: one row per quantity (quantity, value, unit, n, species/breed, method, source, URL, licence, use, confidence, notes).
- The summary (key table, suggested offsets, gaps) is returned in the agent's report (the harness refused a SUMMARY.md); Firefly or Scout can paste it in as `SUMMARY.md`.

## Sources and licences
| Source | What | Licence | How used |
|---|---|---|---|
| Ellenberger, Baum, Dittrich & Münch, *Handbuch der Anatomie der Tiere für Künstler: Der Hund*, Tafel 3 (skeleton drawn inside the body outline, left lateral). UW-Madison Digital Collections https://search.library.wisc.edu/digital/AHFYCAGUWKQA5Y83, IIIF image `https://asset.library.wisc.edu/iiif/1711.dl%2F5CIIJ6SEYKWOG8S/80,200,900,700/full/0/default.jpg` | skin-to-bone depths over the head; nose tip, lip and chin positions | public domain (pre-1931; UWDC "No Known Copyright") | measured |
| `ref/research/fetched/01-skin-offsets` (same plate, earlier item) | occiput, skull top, nose, chin offsets in withers-height units | public domain | converted to CBL |
| AwA-Pose (Banik et al. 2021), `ref/awa-pose/canids.json` | wolf mouth corners, upper and lower jaw (lip) keypoints | MIT | computed |
| Packer, Hendricks & Burn 2015, *Impact of facial conformation on canine health: corneal ulceration*, PLoS ONE 10(5):e0123827, doi 10.1371/journal.pone.0123827, PMC4430292, S1 Dataset `pone.0123827.s002.xlsx` (700 dogs) | palpebral fissure width, cranial length, craniofacial ratio, per dog | CC BY 4.0 | per-breed medians computed |
| Li, Martins & Lin 2025, Vet Ophthalmol, doi 10.1111/vop.13256, PMC12095973 | palpebral fissure length and relative length by skull type | CC BY-NC-ND 4.0: fact only | two facts |
| Bullen et al. 2017, PeerJ 5:e2926, doi 10.7717/peerj.2926, PMC5270592 | temporalis thickness US vs CT agreement | CC BY 4.0 | one fact (no absolute values printed) |
| UKC Carolina Dog standard (rev. 2 Jan 2023) | eye shape and tilt, stop, muzzle length | copyright: paraphrased fact only | text |
| Wolf skull 170753 (MRI PAS, CC BY 4.0), `ref/research/missingfound/wolf-skull/data.json` | frame, orbit centre, nasion, hinge | CC BY 4.0 | frame |

## Methods
1. **Plate depths.** The full-resolution Tafel 3 head region was fetched as an IIIF crop (origin 80, 200 on the 3451 x 2850 scan). Along plate columns, dark-pixel runs (grey < 140, and < 110 as a check) give the skin line (first run from the top) and the bone line (next run); from the bottom, the skin of the jaw underside and the mandible's ventral border. Vertical gap x cos(local skin slope) = perpendicular depth. Stations were checked on 2x and 3x gridded zooms. Uncertain stations (the eye region at plate x 400-410, where the orbit shading interferes) were dropped.
2. **Plate to wolf frame.** Similarity transform from two bony points: prosthion (plate 204, 650; incisor front) -> (0, 0) and jaw hinge (plate 655, 535; EST ±10 px, condyle under the zygomatic root just in front of the ear canal) -> (-0.7537, -0.0284). Scale 617 px per CBL; the plate palate line is tilted 12° nose-down. Depths are reported in CBL and in mm for CBL 244.3 (wolf 170753). The plate dog is a lean short-coated Great Dane type with a deep bony stop: depths transfer to a wolf as the **skin-and-muscle** layer, before fur.
3. **AwA wolf keypoints.** As in `../06-ears/NOTE.md`: 83 profile heads, eye -> orbit centre EST, nose -> plate nose tip (0.071, -0.090). Mouth corners (`mouth_end_left/right`), `upper_jaw` (upper lip front) and `lower_jaw` (chin / lower lip front) mapped; medians and IQR.
4. **Palpebral fissure.** Packer's S1 per-dog data: medians by breed and for non-brachycephalic dogs (`BRACHY` = 0; craniofacial ratio >= 0.5). `MMPERC` = palpebral width / cranial length x 100, cranial length = stop to occipital protuberance measured over the skin. Wolf conversion: 0.20 x (nasion-to-akrokranion 0.60 CBL + about 0.02 skin) = 0.12-0.13 CBL.

Raw downloads in `/tmp/scout3/` only (plate crops, paper XML, the Packer spreadsheet).

## Searched, nothing usable
- **Measured soft-tissue thickness of the canine face by CT/MRI** (forensic-style tables): none found. Europe PMC queries on facial/soft-tissue thickness, skin thickness, facial reconstruction, CT head with dog/canine/wolf return only human forensic studies and clinical case reports.
- **Absolute temporalis or masseter thickness in healthy dogs:** not printed in any open paper found (Bullen 2017 gives only the US-CT agreement; the masticatory-myositis review PMC12929153 has no normal values).
- **Ishiguro et al. 2017** (Japanese wolf skull covered with skin, CT; PMC5289230, CC BY-NC-ND): dried skin on a mounted skull, no tissue depths.
- **Zenodo 10410546** (Mason, CT of dog ear regions incl. a wolf, CC BY 4.0, 0.3-4.8 GB per specimen): prepared skulls (only the mongrel and Chihuahua are wet specimens) and only the ear region; not suitable.
- **Brachycephalic airway studies:** about soft palate and nares, not face depths; skipped.
- **Ocular biometry** (globe axial length; Kim et al. 2024 Front Vet Sci PMC11588713, CC BY): read but not stored; the eyeball size does not set the visible eye opening.
- **Wolf palpebral fissure:** no measurement found.
