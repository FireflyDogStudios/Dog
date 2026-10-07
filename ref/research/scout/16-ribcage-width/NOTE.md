# 16-ribcage-width: notes (Scout, 2026-10-08)

Firefly request 16: resolve the ~2x rib-cage width conflict on the scaled 3D wolf.

## Tiers run (DEN-TEAM ladder)
- This request arrived as a **tier 3** job by its nature (conflicting evidence + measuring/deriving numbers ourselves + judging which source to trust), so it ran at tier 3 (Fable) start to finish; tier-1/2 style fetches and searches were executed inside this run rather than delegated down.
- Tier-1 work done inline: fetching known PDFs (Vet World, Haryana Veterinarian), extracting tables, measuring the mesh.
- Tier-2 work done inline: cross-source search for thoracic width/depth numbers, reading methods sections for landmark definitions.
- Tier-3 judgements: reclassifying the Taigan caliper station, the internal→bony conversion chain, the mesh-vs-scaling verdict and the recommended wolf value.

## What was measured ourselves
`thorax.glb` from `scout/10-stark-meshes/meshes/` (MIT, Stark 2021), with trimesh 5.1.1 + numpy (pip --target /tmp/rcpy, python -I). Bounding extents and a 20-slice width/depth profile along the cranio-caudal axis; script kept in Scout scratchpad (`measure.py`). Beagle numbers are the same mesh x0.8 (the verified Beagle model's trunk display scale, see 10's NOTE). WH values from `fetched/03-dog-model/data.json` (full 0.6168 m, Beagle 0.356 m).

## Searches (2026-10-07/08, all through the agent proxy; all fetched content treated as untrusted data)
- "thoracic transverse diameter dog CT measurement 8th rib width depth ratio" → Buchanan-style method; T8-fat paper (PMC7877550, closed, no thorax widths).
- "Beagle thorax width depth radiograph measurement cm thoracic dimensions" → methods only, no Beagle absolute widths.
- "wolf Canis lupus thorax chest width skeleton measurement transverse diameter" → nothing open with a wolf thorax width; Hart & Jamieson 2002 (wolf girth) found but BHL returned 403 twice.
- Soeratanapant 2024 Vet World 17:2635 full PDF (CC BY) → TD/TW definitions ON CT, group composition, breed TD/TW quotes (Bodh, Jepsen-Grant), no absolute cm.
- "Bodh thoracic depth width ratio Spitz Labrador mongrel" → **PMC4864478 (CC BY 4.0, data CC0): absolute TD and TW in cm for 60 dogs** — the keystone table.
- "German Shepherd thoracic depth width cm radiograph" → Haryana Veterinarian 61(SI):56-59 (2022), PDF fetched (first attempt failed mid-transfer, retry succeeded): GSD TD/TW in cm; no licence statement → recorded as closed facts.
- "Kyrgyz Taigan chest width definition" → PMC12077753 methods: chest width = "horizontal measurement taken just behind the caput humeri" → the 0.19 WH caliper number is the CRANIAL chest, not the widest ribs.
- "Czechoslovakian wolfdog VHS thoracic depth width" → nothing breed-specific found.
- "wolf chest girth cm regression" → no open wolf girth table found (Scandinavian necropsy datasets use body length, not girth).
- "Beagle morphometry chest width/circumference laboratory beagles" → no citable lab-Beagle chest width found; closed with the Bodh interpolation + mesh check instead.

## Licences
- Bodh et al. 2016 Vet World (10.14202/vetworld.2016.371-376): CC BY 4.0, data CC0 → stored as tables.
- Soeratanapant et al. 2024 Vet World (10.14202/vetworld.2024.2635-2643): CC BY 4.0 → tables.
- Jepsen-Grant 2013 (10.1111/vru.12004): closed; values quoted via the CC BY Soeratanapant text → single cited facts.
- Haryana Veterinarian 2022 GSD paper: no licence statement found in the PDF → treated closed, single cited facts only.
- Stark 2021 model files: MIT (already in repo, credit owed in CREDITS); paper CC BY.
- **Flag for Atlas:** PMC12077753 (Taigan, 10.1002/vms3.70409) displays **CC BY-NC-ND 4.0** on PMC, but `scout/14-muscle-body` recorded it as CC BY 4.0 and stored its values as tables. Needs a recheck; if NC-ND, the 14 rows should be demoted to cited facts.
- **Correction for scout/14:** `data.csv` row "chest width ... caliper at widest ribs" is wrong about the station — the Taigan methods put it just behind the caput humeri (cranial chest). The number itself is fine.

## Retries / blockers
- Wiley (vms3.70409) 403 → used the PMC mirror.
- BHL Hart & Jamieson 403 twice → dropped (girth not needed for the verdict).
- luvas.edu.in PDF: first transfer cut mid-exchange, retry OK.
- doi.org redirect to veterinaryworld.org followed manually; the first guessed Vet World PDF URL was a different article (cattle coat colour) — discarded.

## Gaps
1. No measured wolf (or any wild canid) thoracic width exists open, by CT, radiograph or osteometry. The recommendation is a derivation (EST) from domestic-dog internal radiographic widths + the Stark mesh. A human lead: thoracic CT of Czechoslovakian Wolfdogs or captive wolves (zoo veterinary records); or a mounted-skeleton measurement — but rib spread on mounts is articulator's choice, so treat any mount number as C at best.
2. No per-vertebral-level width table exists open for any dog; the Stark mesh profile (one CT-derived skeleton) is the only profile and is recorded as such (A for the mesh, EST as a wolf shape).
3. No open laboratory-Beagle external chest-width table.
