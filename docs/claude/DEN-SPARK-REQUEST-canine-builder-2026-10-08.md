# Request to Spark: challenge how we build dogs, and find a better way (Oct 8, 2026)

From Firefly (lead), for GrumpyDingo. Their words: "Challenge our line of thinking and see if there are different ways of doing our end goal... We need to be able to generate decent looking canines, inside or outside our data set, using any tool that is available to run (for example a Blender plugin, but not limited to). We have a ton of data and I think it can help, but it feels like we are not moving in the right direction... Maybe reverse engineering a dog isn't the way to go. We just need a reliable way of generating semi-accurate dogs and the ability to swap parts out, like a canine builder."

## The goal (what success looks like)
- **A canine builder.** It generates believable dogs and wild canids (wolf, Husky, dingo, Carolina Dog, later foxes and others) from a few parameters: size, build, leg length, head shape, ears, tail, coat. Parts can be swapped (heads, ears, tails, coats, later gear).
- **"Decent looking":** reads as a real animal at a glance. Semi-accurate is fine: believable proportions and silhouette matter more than per-muscle truth.
- **Reliable and repeatable:** one command or one file per species, not weeks of fixing per animal.
- **Fits the game:** The Den Ledger is a 2D desktop idle game. Today it uses flat SVG art with a CSS/Pixi walk rig, and half-width windows must work. Style is open (GrumpyDingo, Oct 7: "aim to be amazing"); Palette owns style. Gaits and idle motion are needed later, so a rig matters.

## What GrumpyDingo is comparing us against
They shared a professional anatomy render as a target (visual reference only; not stored, never traced or copied):
- a sculpted 3D dog with realistic muscles: smooth, continuous surfaces;
- muscles with real volume that flow into one another and into tendons;
- correct masses (shoulder, thigh, neck), a tight belly, and lean lower legs with tendons;
- studio lighting, side view.

Our current muscle body looks nothing like it.

## What we do now (read `docs/claude/DEN-LEAD-HANDOFF.md` §2, §4, §5 and the log)
Reverse engineering from anatomy, step by step:
1. **Species file** (`species/wolf.yaml`): every number sourced and graded.
2. **3D skeleton:** Stark's MIT dog model (Beagle bones), scaled per bone to wolf lengths, posed by OpenSim least squares on sourced joint angles, rendered in Blender (`./den skeleton3d wolf`). A real wolf skull scan (CC BY) is now in.
3. **Muscle lines:** Stark's 158 straight-line muscles (`./den muscles3d`).
4. **Muscle body:** Ellenberger's public-domain plate muscles, warped onto the skeleton by a thin-plate spline, given Hill volumes, and turned into a side-view relief (height field) with a trunk filler (`./den body3d`).

Every fix so far was a correction to inherited data:
- Beagle chest width;
- short withers spines;
- a misplaced head joint;
- scapula offsets.

The muscle body is a 2.5D relief, so it can't look like your reference. Forge's review is `docs/team/inbox/2026-10-07-forge-wolf-review.md`. Images are in `docs/team/review/2026-10-07-wolf-body3d/`.

## What we have (use any of it)
- **Data:**
  - `ref/research/` (Scout 01–18, about 60 MB): bone lengths, angles, gaits, muscle masses, widths, skin offsets, toplines, coat thickness;
  - keypoints: AwA-Pose and StanfordExtra (MIT), 120 breeds of proportions;
  - Shutter's photos (300+, PD, CC0 or CC BY), with side-on stacks and measured outlines for wolves and Huskies;
  - two CC BY wolf skull scans;
  - Stark's meshes (MIT);
  - Ellenberger plates (PD).
- **Tools installed and running headless:**
  - Blender 4.2 (`bpy`, Cycles; GPL, so run it, never ship it), OpenSim 4.6, MuJoCo and dm-control, PyVista and VTK, trimesh, scipy, shapely, scikit-image, rembg;
  - Pixi 8, Proton, Playwright with Chromium, sharp, svgo, paper.js, bezier-js, d3-shape;
  - the kit `./den` (`docs/claude/DEN-KIT-V2.md`).
  - Members may install anything else they need (pre-approved).
- **Licences:** stored or shipped work must be PD, CC0, CC BY, MIT, BSD or Apache. GPL tools may be run, never shipped. Research-only or NC models can inform us (as cited facts) but can't be in the shipped game.

## What to do
1. **Challenge the method.** Is "skeleton, then muscles, then skin" the right road to "decent looking, swappable dogs"? Where does it break? What is it still good for (as a check, a rig, data)?
2. **Find proven alternatives with good outcomes, and compare them honestly** on these axes: look, effort, reliability, part-swapping, rigging and gaits, fit with a 2D game, licence, and how well our data plugs in. Possibilities, not limits:
   - parametric morphable animal models (the SMAL family; check licences);
   - a hand- or AI-assisted sculpted base mesh with shape keys and blend shapes driven by our measurements;
   - Blender procedural approaches (geometry nodes, skin modifier, metaballs, add-ons), Rigify quadruped rigs;
   - photo-based shape reconstruction;
   - a 2D parametric builder (SVG or Pixi parts on a skeleton), since the game is 2D.
3. **Recommend one road,** with a fallback, and say what we keep from the current work and what we stop.
4. **Prove it, small, if you can:** a quick prototype or render that shows the look (one dog, side view, big, on a flat dark background).

## How
- **Sub-agents** are authorized: use the ladder. Ask teammates directly:
  - Scout for data or papers;
  - Atlas for licences;
  - Palette for style and how it should look;
  - Forge for building;
  - Shutter for photos;
  - Lever for tools.
  Cc Firefly on anything big.
- **Firefly is pausing the wolf muscle-body fixes** until you report, so there's no rush to patch the old road.

## Deliver
- **Branch:** `claude/team-spark`.
- **Folder:** `ref/research/spark/01-canine-builder/`, holding:
  - `SUMMARY.md`, answer first: the recommendation, why, and what changes;
  - `NOTE.md`: options, sources, licences, the ladder climb;
  - prototype files or renders, each under 5 MB.
- **Note and status:** a note in `docs/team/inbox/` (post it to the board with `mail.py post`), and a status update.
