# Den lead handoff: everything Firefly knows (Oct 7, 2026)

Written by Firefly (Claude, lead on The Den Ledger / "Project Dog") at the end of a long session, for the next lead session (Firefly again, in a fresh chat) and for anyone on the team.

**Read this first, then follow the links.** GrumpyDingo is the designer and the judge of every art change. The repo is the single source of truth: if it isn't pushed, it doesn't exist.

- **Branch:** all of this lives on `claude/tender-cerf-o68l6u`.
- **`main` is out of date:** it is 167 commits behind and last moved Oct 4. Merging to `main` waits for GrumpyDingo to ask for a PR.

## 0. How to start a new lead session
1. **Repo and branch:** clone `FireflyDogStudios/Dog`, check out `claude/tender-cerf-o68l6u`, and `git pull`.
2. **Tools:** the session-start hook (`.claude/hooks/session-start.sh`) installs the kit.
   - The npm tools and `tools/lens` + `tools/den` Python requirements install first.
   - In the background (log `/tmp/den-heavy.log`): Blender 4.2 as `bpy`, OpenSim 4.6, MuJoCo, PyVista, VTK, dm-control, plus apt packages (inkscape, gifsicle, the EGL/GL libraries Blender needs).
   - `./den doctor` shows when everything is ready.
3. **Read, in this order:**
   1. `CLAUDE.md`;
   2. this file;
   3. `docs/claude/DEN-TEAM.md` (who does what);
   4. `docs/log/LOG.md` (the running log, newest first);
   5. `docs/log/APPROVALS.md` (decisions A-001 to A-008);
   6. `docs/claude/DEN-OPEN-QUESTIONS.md`;
   7. `docs/claude/DEN-REFERENCE-GUIDE.md` (where every number lives);
   8. `docs/claude/DEN-MATERIALS.md` (every ingredient and what it can and can't do).
4. **Skills:** in `.claude/skills/`.
   - `den-species-creator`: the order of work for any animal.
   - `den-dog-anatomy` and `den-creature-design`.
   - `ask-grumpy`: how to ask GrumpyDingo anything. One question at a time.
5. **Check the other sessions:** `list_sessions`, and `list_events` on each (see DEN-TEAM). Merge any pushed branch work after reviewing it.

## 1. Goals
- **The game:** The Den Ledger is a cozy idle AFK-MMORPG.
  - **Hero:** a dog (the Carolina Dog in the lore; the build may pivot to a Husky, see §3).
  - **Rules:** single player first, no paid servers, desktop, and half-width windows must work.
  - Full rules are in `docs/claude/DEN-GAME-MASTER-LIST.md`, the Constitution and the Vibes doc.
- **Species pipeline (the current main thread):** every animal is built **skeleton-first from sourced data**, "the more accurate the better".
  1. A species file of sourced numbers.
  2. A real skeleton.
  3. Muscles.
  4. Skin.
  5. Fur.
  6. A side view for the game, and gaits.
  - The current two dogs (`hero`, `hero2`) are on hold and may be replaced by models built this way.
- **Style is open** (GrumpyDingo, Oct 7). The flat style came from "stone knives and bear skins"; with the research in hand, "aim to be amazing and go from there". Style tests come once the wolf has anatomy.
- **Team:** GrumpyDingo wants Firefly to lead a team of role sessions, each with its own research agents, reporting back (see `DEN-TEAM.md`).

## 2. State of play (Oct 7, end of day)

### The game (untouched since Oct 5; see `docs/HANDOFF.md`, which is older and pre-src-split, plus the code guide)
- **v0.54 is live** (artifact URL in `artifacts.json`). The source is `apps/den-ledger/src/` (53 JS modules in load order).
  - Build with `node apps/den-ledger/build.mjs`.
  - Check with `npm run check`; the kill checks are `npm run sim:t40` (6 kills × 5 window sizes) and `sim:t45b` (seed trace).
- **hero2** is approved piece by piece on the Gear Bench but is not in the game. Gear refits are pending. Both dogs are now on hold for the species pipeline.
- **Engine drift:** `engine/se.js` and `engine/rig.js` are newer than the inlined copies (see `CLAUDE.md`).

### Species pipeline (all work of Oct 6–7)
| Step | Command | State |
|---|---|---|
| Species file | `species/wolf.yaml`, `./den species check species/wolf.yaml` | **Done for the wolf.** Every number has a source and an A/B/C/EST grade. Fact-check applied (13 values); joint limits; gait phases; disc shares (A-007); head line 26° (default); outline ratios from 7 real wolves |
| 2D skeleton | `./den skeleton wolf` | Done (older, flat). Body length now 1.39 against the photos' 1.29 (discs overshoot, as Scout predicted) |
| 2D outlines (experiments) | `./den outline wolf [--template\|--curves\|--photo]` | Five methods tried. The photo method exposed the skeleton's errors. The consensus "prior" failed (`outline_prior.py`, kept as an experiment) |
| **3D skeleton** | `./den skeleton3d wolf [--head awa\|photos\|neck40]` | **Done and good.** Stark's real Beagle bones (MIT), scaled per bone to the wolf's museum lengths, stood in the sourced angles by OpenSim, rendered by Blender |
| 3D check on a photo | `./den overlay3d wolf` | Done. It showed joints can't be read through fur, so we use outline proportions instead |
| **Muscles M1** (lines) | `./den muscles3d wolf` | **Done.** Stark's 158 muscle lines on the wolf in its stance, with line-up checks |
| Muscles M2a (spindles) | `./den bellies3d wolf` | Superseded: separate bellies read as lumps. Kept for its volume and bulge code |
| **Muscles M2b (plate-shaped body)** | `./den body3d wolf` | **Work in progress, round 2.** First version that reads as a body. Faults in §5 |
| Skin, fur, side view, gait on the new model | — | Not started |

**The 3D wolf now, against the seven real wolves** (shares of withers height, fur surface):

| | 3D wolf | Real wolves |
|---|---|---|
| Body length | 1.17 | 1.15 |
| Chest floor height | 0.46 | 0.47 |
| Nose forward / nose height | 0.67 / 0.91 | 0.54 / 0.85 (photos); 0.69 / 1.0 (plates) |

- **Angles:** every sourced joint angle holds, within about 3°: scapula 60°, shoulder ~117°, elbow ~141°, carpus ~161°, stifle ~138°, hock ~140°, croup ~38°, skull pitch 20°.
- **Withers height:** 673 mm to the scapula top.
- **Neck:** the bony neck stands about 61° (steep, which agrees with resting X-rays of other mammals). It looks odd on bare bones and should read right once the neck muscles are on.

## 3. Key decisions so far (who decided and when)
- **Oct 4:** Claude goes by Firefly. Ask one question at a time. Talk before big moves; research freely, then agree a plan. Single player first. Gear before balance.
- **Oct 5:** git is Firefly's to run: commit small, keep the branch pushed, keep `main` clean, PRs only when asked. The public-facing name is "Project Dog".
- **Oct 6:** the current dogs are on hold. Build new species skeleton-first, the wolf first. Firefly may grab tools freely; enterprise-grade tools and fallbacks were approved.
- **Oct 7:**
  - The bestiary (`docs/DEN-BESTIARY.md`) is the animal list. The old creature docs and emoji monsters are deprecated but kept.
  - Style is open.
  - Male anatomy (the sheath) is a per-species, per-sex detail; whether the game shows it is GrumpyDingo's call.
  - Atlas handles tracking and organisation; Scout does research; Shutter (the Photographer) finds licence-clean photos.
  - The 15-wolf head line is the 3D default.
  - **Hero leaning:** a Husky may become the main hero, because open Carolina Dog data and photos barely exist (Shutter found zero usable side views). The Carolina Dog is deferred; the lore is unchanged until GrumpyDingo says otherwise.
  - A-008: restart Scout item 14 (muscle body calibration, with the back muscles).
- **Approvals A-001 to A-008:** see `docs/log/APPROVALS.md`.
  - A-005 (a public licence for a research subset) is **GrumpyDingo's call**, still open.
  - The 51 GB Czeibert CT download (a measured wolf disc value) also awaits GrumpyDingo; Firefly recommends holding.

## 4. Tools: the kit
### V1 (frozen): `tools/lens/`, tag `kit-v1` (commit `70c9ee0`; the tag couldn't be pushed through the proxy, so the hash is the record)
- The gear-fitting tools: shot, probe, export, piece, compile, place-band, measure, refoverlay, diff1.

### V2: `./den` (`tools/den/den.py`), docs in `docs/claude/DEN-KIT-V2.md`
- **Gear checks:** lint, report, sweep (ID pass), order, xcheck, determinism, flush, legibility, sample, diff, baseline, gif, gait.
- **Species:** `species check`, `skeleton`, `skeleton3d`, `overlay3d`, `muscles3d`, `bellies3d`, `body3d`, `outline` (+ `--template`, `--curves`, `--photo`).
- `doctor` lists what is installed.
- **`bridge.cjs`** drives the Pixi rig headless (anim, joints, ID frames).
- Tests: `tools/den/tests/`.

### Heavy tools (all run headless in the cloud container)
| Tool | Used for | Notes |
|---|---|---|
| Blender 4.2 (`bpy`, GPL: run it, never ship it) | Cycles CPU renders, orthographic side view, dark background `(0.11, 0.14, 0.18)`; render mirrored so the dog faces right | Import OBJ/PLY. Its glTF importer segfaults; trimesh-exported OBJs work |
| OpenSim 4.6 | Loads the Stark models, scales them, poses them, gives muscle paths | Clear forces on the Beagle model; unclamp and unlock coordinates, then `initSystem` again |
| Others | trimesh, scipy (TPS via RBFInterpolator, least squares), shapely, scikit-image, PIL, rembg/IS-Net (cut-outs; its model downloads at first use), MuJoCo/dm-control (installed, not yet used), PyVista/VTK | — |

## 5. The species pipeline in detail (what each step reads, does and writes)
Conventions: side view facing right; x forward, y up, in mm or as shares of withers height (WH); included angles, 180 = straight; the left side is the near side (the OpenSim X axis points left; the camera sits on +X).

1. **`species/<id>.yaml`:** numbers grouped as size, bones, spine, skull, angles, limits, gait, ratios, behaviour. Each has value, unit, source and confidence, with optional `range` and `check:`.
2. **`skeleton3d.py`:**
   - Loads `stark_beagle_fore_verified.osim` (forces cleared).
   - Measures the Beagle's bones: mesh greatest length along body Z for the limbs; joint-centre distances for the spine.
   - **Scale factors:** wolf / Beagle per bone. The spine gets its discs first (Law's lengths are vertebral bodies only; `disc_share_*`). Limbs scale `(cross, cross, length)`, the trunk `(cross, length, cross)`.
   - **The scapula slide coordinates** were never rescaled from the Shepherd-size original in Stark's Beagle file. They get ×0.8 × the thorax factors (fixed Oct 7; that bug cost a day).
   - **Stance solve:** `least_squares` on 13 sagittal coordinates, with residuals for every sourced angle, paws on one ground line, a level trunk, croup 40°, femur 10°, hind paw under the ischium, and the head (the AwA head line 26° plus skull pitch 20°).
   - **Nose and skull-back points** are fixed mesh indices picked at the start pose. Picking per pose let the solver flip the head; fixed Oct 7.
   - **Output:** `species/build/<id>.skel3d.json`, holding body transforms, side-view joints, the fit report, `body_factors` and `coords` (for the muscle step), plus `.png`.
3. **`muscles3d.py` (M1):**
   - Loads Stark's full model (`stark_full_linear_spezzoo.osim`, 158 Millard muscles). It is the Shepherd-size original; the Beagle is it ×0.8 trunk / ×0.6 limbs.
   - Scales it by `body_factors × 0.8/0.6`, sets the stance coords, then rescales L_opt and tendon slack by each path's length change. This is done by hand because `Model.scale` measures paths with the scapula misplaced.
   - **Checks:** the bones match skeleton3d exactly (0.0 mm). Attachments are within ~6 mm (median) of their bone; the outliers are off the bone in Stark's model too (fascia origins). Stance fibre lengths have a median of 0.87 of optimal: 3 outliers are ours (serratus 4, right anconeus), 18 are inherited.
   - **Placeholders:** 8 trunk muscles (iliocostalis, longissimus, quadratus lumborum, sacrocaudalis) are placeholders (1 N, 0.01 m) and are skipped.
4. **`body3d.py` (M2b, the current approach):**
   - **Shapes:** Ellenberger Tafel 2's 25 surface-muscle polygons and its skin outline (public domain; Scout 08), warped onto the 3D skeleton. The warp is a thin-plate spline on the plate's bone landmarks, joint centres and points along each near-leg bone. The plate's far legs are cut away.
   - **Base relief:** the bones' lateral reach, z-buffered from surface samples, plus a trunk and neck filler with elliptic cross-sections (the half-widths are EST).
   - **Muscles:** each is a dome on that base. Volume is the Hill volume, F_max × L_opt / 0.3 MPa, with forces scaled from the model's 13.81 kg to the wolf's 31.8 kg by mass^(2/3) (EST; all 150 real muscles weigh 11.1 kg, 35% of body weight). Thickness is capped at a round cross-section, so deep muscles mostly don't show; the report gives the share that shows. The 6 plate muscles Stark lacks get EST thicknesses.
   - **Topline clamped to the bone:** spine tips' upper envelope + 0.018 (trapezius) + 0.027 (skin) of WH at the withers, tapering to 0.012 at the croup and over the pelvis (Scout's advice, checked against our data).
   - **Neck:** the crest runs from the withers to the back of the skull, bowed 0.03 WH (EST until Scout 15); the underline runs from the point of the shoulder to the throat, 0.20 WH below the occiput (EST).
   - **Edge:** rolls toward the midline.
   - **Output:** `<id>.body3d.json`, `.png` (muscle red) and `_map.png` (each muscle its own colour); 95% of the outline is covered.
   - **Known faults, round 2:**
     - no tuck-up, and a blocky belly edge;
     - the last two ribs show through the flank;
     - thin lower legs;
     - head and tail still from the plate;
     - stiff thigh and rump shapes;
     - the relief is the near side only (2.5D): fine for a side-view game, not a full 3D body.
5. **Next steps planned:**
   - Swap in Scout 14 and 15 numbers where EST stands now.
   - Fix the faults above.
   - Then skin: offset by the 17 Ellenberger skin landmarks, interpolated, with bony landmarks pinned at their measured depths.
   - Then fur: per-region coat thickness by season (Scout 03); fur regions follow muscle groups, like GrumpyDingo's colour-coded wolf sheet.
   - Then the game side view (silhouette and SVG), then gaits on the new model.
   - Then the Husky (and later the Carolina Dog, dingo, others) through the same steps.

## 6. Data and licences
- **Where things live:**
  - `ref/research/`: about 57 MB of research plus 157 MB of Shutter's photos.
  - Scout's deliveries are `ref/research/scout/01–13`; the earlier fetch is `fetched/01–11`; the second search is `missingfound/`; fact-checks are `factcheck/`.
  - Reports also cover prior art, tools, outline methods, ear angles, keypoints, gait, skeleton and motion; the photo proportions are in `wolf-photo-proportions/`.
- **Rules:**
  - Stored: PD, CC0, CC BY, MIT, BSD and Apache only.
  - Facts from NC or ND papers: a few cited numbers with their DOI, never their text or figures.
  - Never stored: SA, AGPL or unclear sources. GPL tools may be run, never shipped.
  - Kept out on purpose: the non-commercial motion curves and the AGPL keypoint file.
  - Outside art GrumpyDingo shares (for example Sarahjane Bernhisel's arctic wolf muscle plate, and an anonymous wolf study sheet: skeleton, muscles, muscle groups, fur, fur groups) is **visual reference only**, never traced or stored.
- **Credits owed** before anything ships: `docs/claude/DEN-REFERENCE-GUIDE.md` §15, plus Shutter's CC BY photos.
- **Data gaps:** muscle masses, the back muscles, body widths, belly wall and skin thickness (Scout 14, restarted); the topline and nuchal crest (Scout 15, running); a measured wolf disc value (CT, on hold); a dingo-type skull; dingo limb bones; Carolina Dog anything.

## 7. The team (details in `docs/claude/DEN-TEAM.md`)
| Session | Role | Branch | State Oct 7 |
|---|---|---|---|
| **TDL - Firefly** (this) | Lead, builder, reviewer, merger | `claude/tender-cerf-o68l6u` | — |
| **Research - Scout** | External research and data | `claude/new-session-l3ubx0` | 01–13 merged; 14 restart requested; 15 (topline) running; its summary says it has muscle calibration data for a 32 kg wolf, not yet pushed |
| **Mapping Research - Atlas** | Tracking, organisation, licences, the log and approvals | `claude/vibrant-ride-ygz0gn` | Merged; its last summary still asks about A-006, which is already approved; tell it so |
| **Photographer - Shutter** | Licence-clean reference photos | `claude/nifty-hypatia-yrgots` | Merged (Husky 24, Malamute 14, dingo 17, silhouettes 40, muscle/front/top 73) |

- **Messaging:** Firefly can list the other sessions and send them messages (claude-code-remote `send_message`). They can't message back; they push to their branch and log a line, and Firefly reads their branches and transcripts.

## 8. Open items, in order
1. **Scout 14 restart:** send the request in `docs/claude/DEN-SCOUT-REQUEST-MUSCLE-BODY-2026-10-07.md`, asking Scout to push what it already has. Merge 14 and 15 when they land.
2. **The `body3d` faults (§5):** one at a time, GrumpyDingo judging each render.
3. **Skin, then fur, then the side view** for the wolf.
4. **Husky:**
   - measure Shutter's 4 best side-on stacks, as was done for the 7 wolves;
   - `species/husky.yaml` (bones from a Husky-sized dog; Law has no Husky, so use domestic data and the keypoint sets);
   - run it through the pipeline.
5. **Shutter's four open decisions** for GrumpyDingo, one at a time:
   - CC BY-SA images for reference only (Firefly recommends keeping them out of the repo and only linking to them);
   - Carolina Dog photos from GrumpyDingo or friends;
   - asking the National Park Service for straight-down aerial photos;
   - a rawpixel login.
6. **Atlas's queue:** stripping NaNs from the StanfordExtra data, a CREDITS-RESEARCH file, a draft question to the Law authors about a data licence (relevant to A-005).
7. **The real wolf skull** in place of the Beagle skull, from the two CC BY scans in `missingfound/wolf-skull/`.
8. **Merge to `main`**, as a PR when GrumpyDingo asks.
9. **Game side, parked:** gear refits, engine wiring, Pixi slices. See `docs/HANDOFF.md` and the Master List.

## 9. Lessons and mistakes not to repeat
- **Scaling:** check every coordinate and offset in the source model, not just bodies and joints. The Beagle file kept Shepherd-size scapula translations, and `Model.scale` measured muscle paths with them.
- **Spine lengths:** museum spine lengths are vertebral bodies only. Add the discs on the species side when comparing with joint-to-joint lengths; the meshes keep their own gaps.
- **Picking points:** don't pick "the most forward point" each solver step; it lets the solver rotate parts. Pick fixed indices once.
- **Photos vs joints:** joints can't be read through fur. Compare outline proportions over several photos, and check how a photo was taken (a three-quarter view shortens the head).
- **The plate:** Ellenberger's dog is a lean domestic dog with a raised head. Clamp it to the bones where data says so (topline, neck crest), and expect the wolf to carry more coat and fat.
- **Stark's model:** its muscle paths are straight lines (the curved ones are unlicensed). Lines cut through bone; trunk sheets must stay outside the ribcage hull.
- **Git:** never commit temp render folders. `species/build/.gitignore` lists them; add new ones before running a new tool. Once this went wrong and had to be fixed with an amended commit and a force-push.
- **Waiting:** never `sleep` to wait. Use background commands with an until-loop.
- **Pronouns:** use "they" for anyone whose pronouns aren't stated.
- **Communication:** say plainly when a result is wrong; show big renders on flat dark backgrounds; one change at a time on art; a picture every round.

## 10. What is not in git, and how to get it back
- **The heavy tools:** reinstalled by the session-start hook.
- **The rembg model:** it downloads at first use.
- **Drive** (`den-ledger-everything/ref`, Restricted; open it only to download):
  - the raw Stark model zips;
  - full-resolution meshes;
  - Mech 1974;
  - the 51 GB CT set (not downloaded).
- **Scout's scratch scripts** (disc measurement, what-if): in Scout's container. Ask Scout to commit any it wants to keep under `tools/scout/`.
- **This session's transcript** (76 MB, at `/root/.claude/projects/...`): not needed. This handoff, the log and the commit messages carry the record. If GrumpyDingo wants it kept, it belongs in Drive, not git.
- **Live artifacts:** on claude.ai, URLs in `artifacts.json`. The repo is their source; publish only when asked.
