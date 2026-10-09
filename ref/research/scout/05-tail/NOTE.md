# 05 tail: note

Date: 2026-10-07. Scout research agent (Priority 2, item 5). Raw downloads and working images in `/tmp/scout2/` (photos not stored here).

## Sources and licences
| Source | What | Licence | Use |
|---|---|---|---|
| Stark et al. 2021 dog model, SimTK "dogmodel", mesh `full_linear/Geometry/new-cauda.obj` (local copy from the earlier fetch, `/tmp/simtk/x/`; md5 1fd868e6ca52a6d8bc4566c31f7fe2f8, same in every package except geometry_low) | per-vertebra length, height, width | MIT, (c) 2021 FSU Jena, Heiko Stark (`ref/research/fetched/03-dog-model/LICENSE-stark.txt`) | table: `data_caudal_stark.csv` |
| "Black and grey wolf (female from Druid pack, 'Half Black') standing in road near Lamar River bridge", Jim Peaco, NPS, 31 Dec 2003, https://www.flickr.com/photos/yellowstonenps/16239820971/ (image https://live.staticflickr.com/7532/16239820971_1538831f4f_b.jpg, 1023 × 665) | tail length / WH, brush width, carriage (winter coat) | Public Domain Mark 1.0 (US National Park Service) | measurements (EST) |
| "Dingos at Taronga Zoo", Brian Giesen, https://www.flickr.com/photos/13658024@N00/3556577520 (image https://live.staticflickr.com/3656/3556577520_cb3cc4da83_b.jpg, 1024 × 768); found via Openverse (source=flickr) | tail length / WH, brush width, carriage | CC BY 2.0 (credit: Brian Giesen) | measurements (EST) |
| Heptner & Naumov 1998 (archive.org `mammalsofsov211998gept`) | wolf tail lengths, tail hair, carriage; jackal carriage | in copyright; scan CC BY-NC-SA 4.0 | facts |
| Alaska Fur ID Project (https://alaskafurid.wordpress.com/2009/11/02/wolf/) | tail hair lengths | not stated | facts |
| UKC Carolina Dog standard 2023 (https://www.ukcdogs.com/docs/breeds/carolina-dog-ukc.pdf) | Carolina Dog tail carriage and brush | (c) UKC | facts |

## Method
**Caudal vertebrae (Stark mesh).** The cauda mesh (sacrum + caudal vertebrae, in the model's default drooping pose) was projected to the side view, rasterised at 0.5 mm, closed (10 px disk) and skeletonised; the longest skeleton path, smoothed, is the tail centreline (447.8 mm from the lumbosacral end to the tip). Every vertex got an arc position s and a perpendicular offset, which "unrolls" the tail. Joints were placed at gaps in vertex density along s and checked by eye on the unrolled image (0.2-0.25 mm per pixel). Per bone: length along s; height = dorsoventral extent perpendicular to the centreline (0.5 mm slices; median over the middle 30 % = centrum, max = with processes); width = left-right extent. Sacrum, Cd1-Cd3 boundaries and the merged tip (Cd18-19) are the least certain (± 2 mm). Scale to a species by the caudal series length (here 399.8 mm; the model's withers height is 616.8 mm, so the caudal series is 0.65 WH).

**Brush width from photos (EST).**
- Wolf (PD photo): the dark distal two-thirds of the tail was segmented as luminance < 80 in the box x 100-215, y 330-540 (opening and closing 3/5 px, largest component), and a dark leg-shadow strip was excluded (x ≥ 176 for y ≥ 445). Because the tail hangs almost vertically, width = horizontal extent per row. Tail root (140, 300) and hair tip (162, 510) were read off an enlarged crop: tail 215 px. Withers height 355 px (back line above the shoulders, y ≈ 212-215, to the bottom of the paws, y ≈ 570). mm = px / 355 × 750. **The tail's front edge lies against the near thigh, so the widths are lower bounds.** The grey upper tail cannot be separated from the thigh.
- Dingo (CC BY photo, front animal): mask = not-green background (R ≥ G + 3, opened 3 px, closed 5 px). Centreline through six hand-picked points (872,315) (900,380) (920,430) (950,475) (980,505) (998,530) = 252 px; widths cast perpendicular to the centreline at 10 % steps. The tail merges with the thigh and hock above about 55 % of its length, so only 60-90 % is usable. Withers height 412 px (back above the shoulders y ≈ 268, near forepaw y ≈ 680). mm = px / 412 × 542. The body is turned slightly away from the camera, and the image is soft.
- Carriage: the angle of the root-to-tip line against the topline (withers to tail root).

All fetched content was treated as untrusted data; no instructions were found or followed. Wikimedia Commons was not used for this item after the coordinator's request (a few Commons thumbnails, including the Fraser Island dingo, were fetched before the request; none is used for any number here).

## Blocked / not found
- No published brush-width or tail-hair-profile numbers for wolf or dingo.
- No open dingo or wolf caudal vertebra measurements (Europe PMC: no hits with numbers); the Stark dog mesh is the only open source, so wolf/dingo values are scaled from a dog.
- Dingo tail length remains the Australian Museum 260-380 mm (C); no open measured series was found.
