# Body templates: summary (Scout, 2026-10-07)

**Status:** delivered.
- **Wolf:** 14 candidates, all images in `wolf/`.
- **Dingo:** 7 candidates, in `dingo/`.
- **Carolina Dog:** 5 candidates, in `carolina-dog/`. Only 1 is a genuine Carolina Dog; the other 4 are labelled village-dog proxies (`proxy-` in the file names).
- **Where the details are:** `candidates.csv` ranks every item with author, licence and pose fields; `NOTE.md` has the searches and the rejections.
- **Licences:** public domain, CC0 and CC BY only, about 28 MB in total. The largest file is 3.2 MB. Landmark coordinates were skipped, as allowed by Firefly's revised brief.

## Top picks

### Wolf
1. **`wolf/01_wolf_inat130681789_RobFoster_stand_R.jpg`** (CC BY 4.0, Rob Foster / iNaturalist): wild wolf, true profile, camera level, standing square, head forward, all four paws on plain asphalt. The animal is about 1,700 px long. Best match to every criterion.
2. **`wolf/02_wolf_Mivart1890_n57_CommonWolf_L.jpg`** (public domain, Keulemans 1890): standing square, full ruff and brush drawn, pale background. Faces left, so mirror it.
3. **`wolf/03_wolf_inat174319033_MilaC_stand_R.jpg`** (CC BY 4.0): captive wolf in heavy winter coat, standing square in profile, head turned about 30° to the camera. Shows how the winter coat bulks out the silhouette.

### Dingo
1. **`dingo/01_dingo_inat666395220_RolfLawrenz_walk_R.jpg`** (CC BY 4.0): wild dingo on plain beach sand, true profile, head forward; walking, tail carried high.
2. **`dingo/02_dingo_inat397647759_PaulCoddington_walk_L.jpg`** (CC BY 4.0): the largest and sharpest (about 1,570 px), walking, faces left.
3. **`dingo/03_dingo_inat179361224_MJDapifer_stand_R.jpg`** (CC BY 4.0): standing square on plain red sand, but small (about 750 px).
4. Bonus: the Keulemans dingo plate (public domain, faces left).

### Carolina Dog
1. **`carolina-dog/01_carolina_flickr43486694605_SteveMcD_walk_L_3q.jpg`** (CC BY 2.0): the only allowed-licence photo labelled Carolina Dog. Three-quarter view at 1024 px: colour and tail only.
2. **`carolina-dog/02_proxy-villagedog-Kenya_inat411568558_LindaLotjonen_stand_R_headturned.jpg`** (CC BY 4.0): same landrace type, body in true profile standing square, head turned.
3. **Recommendation:** use the **dingo** set as the hero's body template.

## Credits owed if used (CC BY)
Rob Foster, Mila C., Nigel Voaden, Sean Frey, Claude Kolwelter, Drew Avery, shankar s., Rolf Lawrenz, Paul Coddington, MJDapifer, Bruce Cathie, John Barkla, SteveMcD, Linda Lötjönen, 祐, olmagon, Pavel Smirnov. Exact credit lines and licence URLs are in `candidates.csv`. Credit the public-domain Keulemans plates too, as good practice.

## What needs a human
- **Commons and Flickr were blocked all session (HTTP 429, shared address).** When they answer again: fetch the Flickr originals of wolf ranks 5, 12 and 13 and Carolina rank 1 (landing URLs in the CSV; now 1024 px copies), and check the CC BY dingo photos on Commons listed in `NOTE.md` (Gratwicke, Ron Knight, Yu Chu Chin, Fraser-Smith), which may include a standing true profile.
- **Carolina Dog:** no usable licensed true-profile photo exists online (Commons: all CC BY-SA; iNaturalist: CC BY-NC or unlicensed). Best route: photos GrumpyDingo takes or commissions of a real Carolina Dog, or CC BY permission from an owner or breed club.
- **No skeleton-inside-outline plate exists for a wolf or a dingo** in Ellenberger-Baum, Chauveau, Martin, Cuyer or Gurlt (domestic dog only). Nearest: separate public-domain wolf skeleton drawings on Commons (Lydekker 1893; Buffon 1758 skeleton plus a matching exterior plate; *The New Book of the Dog* 1911; Merriam 1912), not downloaded because of the block.
- **Size rule:** iNaturalist caps photos at 2048 px, so most animals are about 1,100-1,700 px long, not always 1,500+. Flickr originals would be larger.
- **Pose exceptions:** several top dingo picks are walking rather than standing square; some wolves have the head turned. Each is flagged in the CSV notes.
- **Not yet searched:** FWS, NPS NPGallery, BHL, Smithsonian (the US-government search in `../09-us-gov-references/` covers part of this).
