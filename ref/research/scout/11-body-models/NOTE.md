# 11: full-body canid 3D models, method note

Date: **2026-10-07**. Collected by Scout (for Firefly), scout request item 2 (`docs/claude/DEN-SCOUT-REQUEST-3D-2026-10-07.md`).
Everything fetched was treated as untrusted data. Raw downloads and scratch scripts stayed in `/tmp/scout11/` and are not stored here.

## What is in this folder
- `candidates.csv`: 40 usable candidates, ranked by anatomical realism (scan of a real animal or taxidermy > artist sculpt > stylised), then by usefulness as a standing body. Columns as requested. `login_needed = no` rows give the exact mirror URL.
- `01-golden-retriever-ella-scan/`: scan of a live golden retriever, sitting (19.2 MB GLB, CC BY 4.0).
- `02-aussie-shepherd-diego-scan/`: scan of a live Australian Shepherd, asleep, curled (18.5 MB GLB, CC BY 4.0).
- `03-italian-white-wolf/`: artist-modelled grey wolf, standing neutral (2.7 MB GLB, CC BY 4.0).
- Each folder has `LICENSE.txt` (title, author, source URL, licence and how it was verified, md5, mirror URL, attribution line).
- None of the three files was modified or decimated (all under 20 MB as published).

## Sources and searches

1. **Sketchfab API v3** (no login for search or metadata).
   - Pass 1, 29 queries: wolf, grey wolf, gray wolf, canis lupus, dingo, dog, dog scan, dog photogrammetry, taxidermy wolf/dog/fox, coyote, jackal, fox, red fox, vulpes, canis, canine, dog anatomy, dog skeleton, wolf skeleton, wolf taxidermy, stuffed wolf, dog statue scan, husky, german shepherd, museum wolf, museum fox, canidae.
   - Pass 2, 33 queries: wolf/fox/coyote scan and photogrammetry, taxidermy, taxidermy mount, stuffed animal museum, natural history museum mammal, dog 3d scan full body, dog standing scan, wolf realistic, realistic dog, dog/wolf/canine base mesh, dog rig, wolf rig, dingo realistic, australian dog, carolina dog, shiba realistic, arctic fox, fennec, dhole, african wild dog, lycaon, ethiopian wolf, maned wolf, raccoon dog, grey fox, kit fox, swift fox, zoological museum.
   - Each query: `GET /v3/search?type=models&q=<q>&license=by|cc0&downloadable=true&count=24`, up to 3 pages. 2,067 unique models seen.
   - Names matching canid words (minus bones, skulls, statues, merch, etc.) were checked one by one with `GET /v3/models/{uid}` (1,084 models): `license.slug`, `isDownloadable`, `faceCount`, `animationCount`, tags, description, created date. Thumbnails of about 360 of them were put on contact sheets and looked at.
   - Museum accounts listed with `GET /v3/models?user=<name>`: nhmdenmark, MammalResearchInstitutePAS, Biodiversity (MSB), wildco (UBC Beaty), zmmu, uod_museums, DigitalLife3D, NHM_Imaging. **Every canid on these accounts is a skull or bone**, none is a body (NHMD "Greenlandic sled dog" and "Wolf" are skulls; Beaty "874 Gray Wolf" and "6906 Coyote" are skulls). Account names tried that do not exist on Sketchfab: naturalis, NaturalSciences, RBINS, digitallife3d, africanfossils, AfricanFossils, UMZC, oumnh, museumfurnaturkunde, NMNHS, KUNHM.
2. **Objaverse 1.0** (Hugging Face `allenai/objaverse`, no login). This is the login-free route to Sketchfab CC BY models made before about early 2023.
   - `object-paths.json.gz` maps a Sketchfab uid to `glbs/<shard>/<uid>.glb`; 448 of the checked models are in it. Files: `https://huggingface.co/datasets/allenai/objaverse/resolve/main/<path>`.
   - `lvis-annotations.json.gz` categories bulldog, dalmatian, dog, pug-dog, puppy, shepherd_dog, wolf: 389 extra uids, re-checked on the Sketchfab API (342 answered: 290 by, 26 by-nc, 16 by-nc-sa, 7 by-sa, 1 st, 2 no licence). Nothing better than the picks turned up, apart from the Ella scan, which came from here.
   - Dataset licence: ODC-By 1.0 for the collection; each object keeps its own licence (README checked). The licence used here is the one the Sketchfab API reports **today**, and all chosen items are `by`.
3. **Zenodo** `communities/3dbigdataspace/records` (the Objaverse/Sketchfab mirror), queries dog, wolf, fox, coyote, canine, jackal, hound, puppy, up to 11 pages each (416 records), plus general `api/records` searches. One TLS EOF on "coyote" page 1, retried and passed. CC BY/CC0 canid records are all statues, figurines, toys, fountains or bones. The only animal-like ones ("WOLF" 10354977 is a fountain; "FS2176 Coyote" 10303245 is a 2-inch plastic toy) were rejected. Searching Zenodo by uid or by GLB filename returns nothing (tested with a known record), so mirrors were matched locally by filename.
4. **Smithsonian 3D** `3d-api.si.edu/api/v1.0/content/file/search?q=` for Canis, wolf, dog, fox, coyote, dingo, Canis lupus, Canis familiaris: the only canid is **Canis dirus Leidy** (dire wolf mounted skeleton, CC0), listed as a bones check.
5. **figshare** `POST /v2/articles/search` (7 queries: dog 3D surface scan, wolf 3D model, Canis lupus familiaris 3D mesh, dog body shape 3D, dingo, canine photogrammetry, fox 3D scan): no body meshes.
6. **Poly Haven** `api.polyhaven.com/assets?t=models`: 521 models, no canids.
7. **Quaternius**: Ultimate Animated Animal Pack is CC0 (page + /license.html), downloads from a Google Drive folder. The page does not list its 12 animals; it is believed to include a wolf, fox, husky and shiba (not verified). Stylised.
8. **Kenney / ambientCG**: no realistic animal bodies (Kenney animals are toy-like; ambientCG is materials). Not searched further.
9. **OpenGameArt** wolf search (art type 3D): licences read from each page. CC0: 3d-wolf, wolf-1, wolf-2, wolf-low-poly-rigged; CC BY 4.0: low-poly-wolf-0, animated-wolf; CC BY 3.0: low-poly-wolf, wolf, wolf-3d-model. All low-poly game art. Rejected: open-wolf (LGPL), 3d-wolf-animation-for-game (page shows CC0, GPL and an old licence; mixed), winter-wolf-normal-wolf and wolf-0 (CC BY with no version shown).
10. **Blend Swap**: curl got a Cloudflare 301 challenge (2 attempts). WebFetch of `/search?keywords=wolf` returned the popular list, not search results, and `/blends/search` returned 404. A web search with site:blendswap.com found nothing. **Not covered**; needs a browser.
11. **Blender Studio**: Alpha (Spring, CC BY, 496.5 MB, free download, stylised film creature) and Dog (Wing It!, CC BY, login needed, cartoon). Both listed, neither fits.
12. **Thingiverse / Printables**: web search only. Found skull remixes and flexi toys, no CC BY full-body scans. Thingiverse API needs a token, so it was not queried.
13. **Datasets checked and rejected**: 3DDogs / RGBD-Dog (cvssp.org: "non-commercial research purposes only", no redistribution, and no meshes); SMAL / SMBLD parametric dog models (non-commercial research licences, from memory of their sites; not re-fetched); The Visible Dog (LMU / VOXEL-MAN), no open licence found.
14. **Not reached**: Naturalis, RBINS, Digital Life and African Fossils have no Sketchfab accounts under the names tried; their own portals were not searched. Wikimedia Commons was excluded by instruction.

## How licences were verified
- Sketchfab: only `license.slug` from `GET /v3/models/{uid}` today counts. `by` and `cc0` pass. Rejected: by-sa, by-nc, by-nd, by-nc-sa, by-nc-nd, st/free-st (Standard), ed (Editorial), and no licence.
- A model whose description contradicts its licence is rejected. Example: **AnimalMesh3D "Animated Red Fox"** (eab32d36...) is tagged CC BY, but the description says "personal use only, commercial use only for versions purchased on Fab or Patreon".
- OpenGameArt: the licence field on the page. Quaternius: the site licence page. Smithsonian: Open Access CC0. Blender Studio: the licence text on each character page.

## Downloads and checks
- Downloaded from the Objaverse mirror: 16 GLBs. All were rendered in /tmp as three orthographic views (matplotlib, flat shaded), and the textured ones also as coloured point clouds. Each render was looked at.
  - **Ella**: a real golden retriever, sitting, real coat texture. Plausible anatomy, some holes under the belly.
  - **Diego**: a real dog, curled asleep. Recognisable head, legs and tail; the underside is flat and open.
  - **Italian White Wolf**: standing, sensible wolf proportions (long legs, deep chest, digitigrade paws), no rig.
  - **Fully Rigged IK/FK Wolf** (e96cb4ad): standing, good proportions, 76-joint skin, 0.9 MB. Left out only by the top-3 cap; it is the best rig/topology donor and is one curl away (see candidates.csv).
  - **Canine Skin (MRI)**: head and upper neck only.
  - **Dead Coyote**: the body barely separates from the leaf litter.
  - **Silver Fox** (ee668a20): good standing silhouette. A decimation test brought it from 1M to 400k faces and 9.9 MB, with UVs kept by nearest-vertex transfer and the texture checked. The texture shows a silver figurine, and the photos came from someone's YouTube video, so it was not kept.
  - Others rendered: sleeping dog (flat back), Grey Wolf rhcreations (tube body), HiagoTadeu wolf (rest pose on its back), salarchana55 wolf (scene with text), VR Dingo (good silhouette, low poly), two dog base meshes (cartoon).

## Rejections, with reasons
- **AI-generated** (84 checked models carry AI tags or Meshy/Tripo/CSM text): rejected as anatomy references and for provenance. This covers all raven-woods animals, Ottercat_ wild dogs, Sam.Mestach "Regal Canine", 3dUVpro "Graceful Canine", Amaterasu_8 "Lycaon", marvelvsdc "Running Male Wolfdog" and klrxyz items. Also treated as AI-suspect: s8819296/Pigcraft (prompt-style descriptions, e.g. "Black Wolf", "Red Fox Standing Pose Realistic") and rt699448 (several uploads tagged AI, e.g. "Husky dog"; "Ethiopian wolf" is untagged but from the same account). adrianmarin021 "African Wild Dog" is MakerWorld image-to-3D.
- **Game rips / fan copies**: PuppyClub "COD: Ghost's Wolf (+Puppy)" and "[Fan-made] COD: Ghost's Wolf Pup" (Call of Duty asset).
- **Wrong licence**: Zenodo hound and dog statue scans (CC BY-NC-SA), "Wolf Rokoko Table" (CC BY-NC), "Inari Shrine Fox" (CC BY-NC), the 26 by-nc and 16 by-nc-sa Objaverse LVIS dogs, 7 by-sa, 1 st.
- **Not a body**: all museum skulls and bones (NHMD, MRI PAS, MSB, UBC Beaty, ZMMU, UoD, wesUdigital coyote bones, DigitalZooarch basenji bones), organ and heart models (pixelbeaker, VisibleHeartLabs, 3DVet_Printing), MRI head (Canine Skin), pelts, footprints.
- **Statues, figurines, toys** (scans of sculptures, not animals): Hound of Alcibiades, Jennings Dog, Colima dog, Xolo effigy, wolf statues and netsuke, Japanese guardian wolves, fox shrine statues, plush toys, "Dog Artec" (puppy figurine), "Silver Fox"/"Silver Wolfhead" (silver figurines from YouTube frames), "Wolf scarecrow".
- **Unclear provenance, kept but flagged**: restore50 "Snowy Gray Wolf" and "Lone Coyote" (photoreal, no making-of, 2026 uploads), and the Italian White Wolf duplicate (see its LICENSE.txt).
