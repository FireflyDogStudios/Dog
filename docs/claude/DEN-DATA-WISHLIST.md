# Data still needed for the species creator (wishlist)

Kept by Firefly, Oct 6, 2026. In priority order for the next steps (silhouette over the skeleton, then the gait engine, then the Carolina Dog). Almost all of it sits on hosts this session cannot reach (archive.org, simtk.org, Wikimedia Commons, nature.com, Dryad, Zenodo, Google Drive, PubMed Central, arXiv all refused on Oct 6). **A fresh session in an environment with all domains allowed can fetch the lot**: GrumpyDingo set "all domains" on Oct 6, but network settings only apply to sessions started after the change.

| # | What | Why we need it | Where | Licence |
|---|---|---|---|---|
| 1 | **Skin-over-bone offsets**: how far the body outline sits from each bone landmark (withers, chest, elbow, stifle, hock, skull) | To draw the silhouette over the skeleton (the next step) | Ellenberger, Baum & Dittrich, *An Atlas of Animal Anatomy for Artists* (1901 German original, matching side views of skeleton, muscle and exterior): archive.org/details/atlasofanimalana0000well | 1901 original probably public domain; check the scan's edition |
| 2 | **Outline landmarks of real wolves and dogs** (the measurement sheet's 32 points) | Silhouette proportions with sources, not by eye | StanfordExtra silhouettes and keypoints (MIT; the full file is behind a Google form) | MIT annotations |
| 3 | **Joint centres and joint ranges** of a real dog | Joint limits and the shoulder-blade slide with real numbers | Stark, Fischer et al. 2021 OpenSim dog model: nature.com/articles/s41598-021-90058-0 and simtk.org/projects/dogmodel | CC BY 4.0 (article and data) |
| 4 | **Joint angle curves through the stride** (angle against % of stride) | The gait engine's targets and the checks | PLOS ONE and Frontiers supplements of the papers in `ref/research/gait/REPORT.md` (Hottinger 1996, Fischer & Lilje, Pit Bull 2021, Catavitello 2015) | CC BY for the open-access ones |
| 5 | **Muybridge dog plates** (705–707 mastiffs, 709–710 greyhound) | Footfall order and body motion checked frame by frame | Wikimedia Commons, Smithsonian, NGA scans | Public domain |
| 6 | **Limb indices for more canids** (coyote, foxes, dhole, African wild dog) | Bone ratios for the next species without guessing | Samuels, Meachen & Sakai 2013 on Dryad (doi 10.5061/dryad.77tm4) | Dryad data is normally CC0; confirm |
| 7 | **Dingo and Carolina Dog bones** | The player's own species file | Dingo skeletal papers (PMC11411105 and others); pariah-dog studies | Check each |
| 8 | **Wild canid keypoint photos** (coyote, jackal, dhole, African wild dog, hyena) | Body ratios and standing angles per species | AP-10K (CC BY 4.0, Google Drive); APT-36K (MIT, OneDrive); Animal Kingdom (licence unstated, ask the authors) | as listed |
| 9 | **Jaw, ear and toe motion**, and **head-tilt angles** | The jaw prototype and idle behaviour | No permissive source found yet; video measurement of our own reference clips is the fallback | ours |
| 10 | **Coat colours** (wolf, Carolina Dog, others) as sampled palettes | Species palettes | Public-domain or CC photos (Wikimedia Commons) | per photo |

**What this session can still do without them:** the silhouette from the skeleton plus the illustrative skin offsets of the measurement sheet (marked as estimates), and the gait engine prototype, both to be checked against the sources above once a fresh session fetches them.
