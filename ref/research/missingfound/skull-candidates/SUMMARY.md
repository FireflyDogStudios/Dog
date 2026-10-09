# Skull scan candidates: summary (2026-10-07)

Links only. No meshes were downloaded. The full lists are in `candidates.csv` (408 rows, one per model) and `collections.csv` (25 bulk sources). The method is in `NOTE.md`. The proposed automation is in `AUTOMATION.md`.

"Usable" means the stated licence is PD, CC0 or CC BY (Sketchfab slug `by` or `cc0`). Everything else is listed as rejected, with the reason. Artist-made or AI models are flagged in the `scan_type` column and are left out of the "best" picks below.

## Counts per taxon group (usable / rejected rows)

| group | usable | rejected | real-specimen usable | notes |
|---|---|---|---|---|
| wolf type (lupus, latrans, aureus) | 60 | 56 | ~50 (8 lupus + 1 coyote are artist/AI) | no *C. lupaster* anywhere |
| side-striped / black-backed jackal | 2 | 2 | 2 (both black-backed) | **no side-striped 3D** |
| African wild dog | 1 | 10 | 1 (FE model) | Sketchfab/MorphoSource Lycaon all unlicensed or NC |
| dingo type | 0 | 20 | 0 | **no usable 3D dingo, NGSD, Carolina Dog or village dog** |
| domestic dog | 37 | 47 | 36 + Czeibert bulk (399 skulls) | |
| true foxes | 43 | 34 | 43 | red, arctic, kit, swift, fennec (CT only) |
| gray fox + island fox | 17 | 9 | 17 | |
| raccoon dog | 3 | 8 | 3 | all MRI PAS |
| hyenas | 13 | 32 | 12 (1 cave hyena is AI) | spotted, brown, aardwolf; **no striped hyena 3D** |
| canid indet. (archaeological "Canidae") | 13 | 0 | 13 | Vore Buffalo Jump crania etc. |

## Best candidates per group

**Wolf type**
1. Gray wolf, MRI PAS 170753 (male adult; skull, jaw and skull+jaw STL; CC BY 4.0; no login): https://doi.org/10.48370/OFD/LVT9AC. Already processed in `../wolf-skull/` with 170555. Five more MRI PAS wolves are listed (KCGNGN, LFKW1Z, XBDZMU, 2FZETH, PV7HBD).
2. Golden jackal, MRI PAS 170857 (male; skull + jaw; CC BY 4.0): https://doi.org/10.48370/OFD/OJBJY9. A second one is https://doi.org/10.48370/OFD/KS0JAA.
3. Coyote: UWYMV:Mamm:2860 skull, crania and mandible (CC BY, Sketchfab): https://sketchfab.com/3d-models/0a89617e6e434db48d231484e51b0aad. Also Illinois State Museum #614261: https://sketchfab.com/3d-models/0d280820feb2471d8e6860c9741e2915. Also gomeasure3d (HDI scanner, CC BY, with a login-free Zenodo mirror): https://zenodo.org/records/10352787

**Jackals (Lupulella)**
1. Black-backed jackal, DUNUC 2129 (Artec Spider scan, CC BY): https://sketchfab.com/3d-models/df24233a66364068b74fbe836057380c
2. Black-backed jackal cranial FE model (CC0): https://doi.org/10.5061/dryad.1b52s
3. Side-striped jackal: none in 3D. There are 2D landmarks only (3 skulls) in Meloro & Tamagnini (CC0): https://doi.org/10.5061/dryad.2rbnzs7jx

**African wild dog**
1. Lycaon cranial FE model, CT-derived (CC0; Strand7-type format, needs conversion): https://doi.org/10.5061/dryad.1b52s
2. Shape fallback: 2D landmarks for 7 skulls in https://doi.org/10.5061/dryad.2rbnzs7jx

**Dingo type**
- No 3D mesh with a usable licence. The best open data is one CC0 3D landmark set (45 landmarks, Koungoulos 2020 scheme) of the Alpine dingo "Cooinda": https://doi.org/10.6084/m9.figshare.20523804
- Proxies with usable licences: Basenji cranium + mandible (CC BY): https://sketchfab.com/3d-models/8956d301a50c45f1a1c348462e0d1fd7 and https://sketchfab.com/3d-models/e9a47849d3af4e2e8e7a6bbedd043d4d; Czeibert CT (CC0), which includes a Basenji and a Peruvian Hairless Dog.

**Domestic dogs**
1. Czeibert et al. 2024: 399 dog skulls from 152 breeds, medical CT, CC0, one 51 GB zip: https://doi.org/10.6084/m9.figshare.c.7296568
2. MRI PAS dog 149614 (skull + jaw STL, CC BY): https://doi.org/10.48370/OFD/KEKBAQ
3. Yale Peabody Pekinese YPM MAM.004945 (CC BY): https://sketchfab.com/3d-models/28b4f8864e804455a3825a08a6a5aa6b. There are also RISD Nature Lab dogs and bulldogs (Artec, CC BY).

**True foxes**
1. Red fox: MRI PAS 170974 (female; skull, jaw and skull+jaw, CC BY): https://doi.org/10.48370/OFD/Y8TNUO. Three more are listed (Z8E5OY, DYSLAS, ZCMYV1).
2. Swift fox and kit fox, Univ. Wyoming (skull, crania and mandible, CC BY): swift https://sketchfab.com/3d-models/27320c7b3ec84330882b6bd482373fd0 ; kit https://sketchfab.com/3d-models/4b6497b769184188a285da4c6454dbe6
3. Arctic fox (Fire & Bone, CC BY; their own scan of a real specimen): https://sketchfab.com/3d-models/7c63f69530fa45c196c56f457eff5e49. The fennec fox exists only as CT in the Czeibert bulk set.

**Gray fox + island fox**
1. Gray fox, YPM MAM.002626 (male; cranium + mandible halves, CC BY): https://sketchfab.com/3d-models/bda21f9542cf4ccea44bf49c6ddfa728
2. Island fox, YPM MAM.014389 (CC BY): https://sketchfab.com/3d-models/66cdeb1dd7af4ef4bde73d34dcb46dc4
3. Gray fox, UWYMV:Mamm:6720 (skull, crania and mandible): https://sketchfab.com/3d-models/e7619e09f27b4b068868e7b8040755de

**Raccoon dog**
1. MRI PAS 171215 (male): https://doi.org/10.48370/OFD/ZSCTI5
2. MRI PAS 169479 (female): https://doi.org/10.48370/OFD/A6CDIL
3. Sketchfab mirror (CC BY): https://sketchfab.com/3d-models/1631af4e14544311a11e55032b010880

**Hyenas**
1. Spotted hyena, UWYMV:Mamm:5840 (skull, crania and mandible, CC BY): https://sketchfab.com/3d-models/c4004ef20f2a4f4da80feb55ff9a44f5. Another is MZB 2002-0873 (5.5M faces, CC BY): https://sketchfab.com/3d-models/9ced915418dc4138b50e9b6a629d2eec
2. Brown hyena, DUNUC 3204 (Artec scan, CC BY; the jaw is sectioned to show roots): https://sketchfab.com/3d-models/db5a9af4646344c3b69fb6cad5a7a2b2. There is also a CC0 FE model in dryad.1b52s.
3. Aardwolf, CT DICOM (CC0, 68 MB, needs segmenting): https://doi.org/10.5061/dryad.r2b1h
- Striped hyena: none in 3D. There are 2D landmarks only (5 skulls) in dryad.2rbnzs7jx.

## Groups with no usable 3D
*Canis lupaster*; side-striped jackal; dingo, New Guinea singing dog, Carolina Dog and pariah/village dogs; striped hyena; corsac and Rüppell's fox. All of these except *C. lupaster* and the dingo-type dogs have CC0 2D landmark shape data in Meloro & Tamagnini (2021).

## Bulk collections

| collection | licence | target holdings | download | verdict |
|---|---|---|---|---|
| **MRI PAS on Open Forest Data** | CC BY 4.0 on all 34 Canidae datasets (checked each); 0 Hyaenidae | 3D: wolf 7, golden jackal 2, dog 1, red fox 4, raccoon dog 2. Card-scan JPG only: 18 more | Dataverse API, no login | **usable** |
| **Czeibert et al. 2024 HRCT** (figshare c.7296568) | CC0 | dogs 399 (152 breeds), wolf 3, golden jackal 4, coyote 1, red fox 2, fennec 1 (+ bat-eared fox, maned wolf, bush dog) | one 51.4 GB zip, no login | **usable (bulk)** |
| **Meloro & Tamagnini 2021, 188 Carnivora** (dryad.2rbnzs7jx) | CC0 | 2D landmarks, 30 per cranium (species means) + mandible, for **every** target wild species incl. side-striped jackal 3, Lycaon 7, striped hyena 5, aardwolf 3, brown hyena 2, corsac, Rüppell's, fennec | tiny files | **usable: best multi-species shape set** |
| Fennoscandian wolves (dryad.nk98sf825) | CC0 | 84 wolf crania, 3D landmarks + mean mesh PLY | Dryad (browser) | usable |
| Tseng FE models (dryad.1b52s, dryad.r2b1h) | CC0 | wolf, black-backed jackal, Lycaon, spotted + brown hyena; aardwolf CT; 13 hyaenid/canid FE models | Dryad/Zenodo | usable (format conversion) |
| Other CC0/CC BY morphometrics | CC0 / CC BY | Law carnivoran cranium/mandible (Zenodo 6783373); Machado Canidae (dryad.m63xsj3z9, dryad.142jn5t); Porto Canidae shapes (Zenodo 8170131); urban red fox (dryad.bnzs7h47c); coyote mandibles (dryad.vn413); arctic fox (figshare 9821762); golden jackal measurements (Zenodo 3712570); Cooinda dingo landmarks (figshare 20523804) | small files | usable (verify contents: for Machado, Law and Porto only titles and file lists were seen) |
| Sketchfab museum accounts | CC BY per model | uwlibraries (wolf, coyote, spotted hyena, gray fox, red, swift and kit fox: about 21 models), RISDNaturelab (~16), yalepeabodymuseum (4), OSU.Multimedia (5), MammalResearchInstitutePAS (6). **Mixed licences:** uod_museums, laboratorinatura | free account needed | usable per model |
| Zenodo community 3DBigDataSpace (Objaverse/Sketchfab mirror) | per item | 7 target models found mirrored (coyote, 4 dogs, 2 hyena jaws) + Malopolska wolf | no login | usable per item; Scan-the-World items there are NC-SA |
| MorphoSource (incl. oVert/oUTCT) | per media | 122 target media | login; many by request | **rejected: every one is CommercialUseNotPermitted** |
| Smithsonian 3D | CC0 | no extant target taxa (only dire wolf) | open | empty for us |
| NHM London data portal | per dataset | no canid/hyena 3D | open | none |
| Phenome10K | unclear (Cloudflare blocked; "academic and educational") | not checked | login | rejected (unclear) |

## Rejected, by reason (rows in candidates.csv)
- **Commercial use not permitted** (MorphoSource rights statements InC / InC-NC / InC-EDU / UND): 102. This covers all dingo, Lycaon, black-backed jackal, striped and brown hyena and coyote CT on MorphoSource.
- **No licence (Sketchfab, not downloadable = all rights reserved)**: 72. Among them: Ozboneviz dingo cranium, arevans dingo, UQ dingo mandible, WAM dingo jaw; arevans aardwolf; laboratorinatura Lycaon, striped hyena and wolf; CMNH wolf and spotted hyena; FloridaMuseum coyote, gray fox and red fox; LakeheadAnthropology wolf, coyote, dog and red fox; tony-eight African wild dog.
- **No 3D files** (MRI PAS datasets with only a specimen-card JPG): 18
- **Sketchfab Standard / Free Standard / Editorial (store licences)**: 11
- **NC, NC-ND, NC-SA, SA**: 15. Examples: Charleston Museum coyote (NC); Virtual Curation Lab red fox (NC-ND); alienor.org spotted hyena (NC-ND); Scan-the-World dogs and fox mandibles (NC-SA); nzfauna dog skull (SA).

## Needs a Sketchfab login (all usable Sketchfab models do)
Login-free copies exist only for the MRI PAS mirrors (use the OFD DOIs above) and these on Zenodo: coyote https://zenodo.org/records/10352787 ; Roman dog https://zenodo.org/records/10233761 ; dog (agancz) https://zenodo.org/records/10327538 ; Great Dane https://zenodo.org/records/10335634 ; CC0 "Poodle" https://zenodo.org/records/10288701 ; hyena hemimandible https://zenodo.org/records/10362780 ; hyaena jaw fragment https://zenodo.org/records/10290673 ; Malopolska wolf https://zenodo.org/records/21492563

Priority login downloads:
- https://sketchfab.com/3d-models/df24233a66364068b74fbe836057380c (black-backed jackal)
- https://sketchfab.com/3d-models/db5a9af4646344c3b69fb6cad5a7a2b2 (brown hyena)
- https://sketchfab.com/3d-models/c4004ef20f2a4f4da80feb55ff9a44f5 (spotted hyena)
- https://sketchfab.com/3d-models/a0af673b673140f3a374857ca7f78e55 (gray wolf UWYMV 6546)
- https://sketchfab.com/3d-models/0a89617e6e434db48d231484e51b0aad (coyote)
- https://sketchfab.com/3d-models/bda21f9542cf4ccea44bf49c6ddfa728 (gray fox)
- https://sketchfab.com/3d-models/66cdeb1dd7af4ef4bde73d34dcb46dc4 (island fox)
- https://sketchfab.com/3d-models/27320c7b3ec84330882b6bd482373fd0 (swift fox)
- https://sketchfab.com/3d-models/4b6497b769184188a285da4c6454dbe6 (kit fox)
- https://sketchfab.com/3d-models/7c63f69530fa45c196c56f457eff5e49 (arctic fox)
- https://sketchfab.com/3d-models/8956d301a50c45f1a1c348462e0d1fd7 (Basenji)
- https://sketchfab.com/3d-models/28b4f8864e804455a3825a08a6a5aa6b (Pekinese)

Dryad files download in a browser; scripted download was refused (401 API, 403 web route).
