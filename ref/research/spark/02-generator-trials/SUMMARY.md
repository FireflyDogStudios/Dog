# Is there a dog generator we can use? Recommendation (Spark, Oct 8 2026)

Inputs: Scout 19 (45 candidates, `ref/research/scout/19-dog-generators/`), Atlas's licence table (`docs/team/atlas/2026-10-08-generator-licences.md`), my Infinigen source read (below), and my SDF prototype (`../01-canine-builder/`).

## Recommendation: build our own. Cost $0.
No source produces what we ship: a flat side-view dog that we restyle, with our gaits and gear points. Every candidate is a 3D base that would still need our render-and-restyle stage, or a rig tool that still needs our art. Scout found the shipped games (Sims pets, Wobbledogs) all use one skeleton plus breed-as-data. That is what our species files, rig and builder already are. So the generator is ours to finish, not to buy.

## Why not the three nearest options
- **Daz Dog 8 + Phenotypes** (~$46; one licence per person) is the best breed system on the market. 2D renders are covered by the standard terms. But:
  - **Daz Studio is a desktop app.** Our cloud sessions can't run it, so GrumpyDingo would have to render every breed, pose and change on their own computer. That puts a person on every iteration loop.
  - **Open questions:** Atlas found the text doesn't settle "redrawn as flat vector art", or selling cosmetic dogs in-game. The EULA also bans feeding Daz content to AI tools, which covers us.
  - **Fair use for it:** an *optional* look-reference, a few side views GrumpyDingo renders once, never traced. It's not needed on the critical path.
- **Spine Professional ($379 per person, plus an Enterprise tier above $500k revenue or funding).** Our rig engine already animates from joint data, with paw IK, gait tables and seeded springs (`ref/research/procedural/`, 8/8 checks). Spine would add a hand-keying editor and mesh deformation. We don't need either for procedural gaits, and it ties every developer to a seat. Revisit only if we decide to hand-animate.
- **Tripo, Meshy and the Fab pack.**
  - Tripo and Meshy are paid-only for usable outputs, with contradictory terms.
  - Fab's EULA is unread (its pages block fetches).
  - All three give 3D meshes we'd still have to restyle, so they're no better than our builder's output.

## Infinigen, and what its wolf shapes are worth
- **What the source shows:** it is a tiger generator. Its body is a random blend of cheetah, housecat, tiger and wolf shapes, the ears and nose are always cat parts, it has no breed controls and one generic run cycle. It is BSD-3. I didn't run it; Firefly agreed the source read settles it.
- **The wolf shapes:** `body_feline_wolf.npy` and `head_carnivore_wolf.npy` are a NURBS control net, BSD-3. They are an artist's wolf profile: cross-sections along the body, and the head and muzzle shape. To the builder they're worth a **second opinion on mass placement** (girth along the trunk, neck taper, head profile), checked next to Shutter's measured outlines.
  - **Effort:** about an hour. Loading the `.npy` is plain data with `allow_pickle=False`, not their code.
  - **Limit:** they aren't measured anatomy, so they rank below our graded numbers and below Shutter's outlines.

## First three steps
1. **Builder reads the species files (Spark).** Move `tools/spark/canine-sdf/` to `engine/canine/`, read `species/*.yaml` directly, and give each mass a name that doubles as a gear mount point (collar = neck ring, socks = pastern and hock).
2. **Score the silhouettes, then tune (Spark with Forge, Palette judges).** Score each preset against Shutter's measured outlines for wolf and Husky: intersection over union, plus topline and belly-line error. Tune the masses one change at a time, with GrumpyDingo judging every change. Use the Infinigen wolf net as a side check.
3. **Pose and stride frames (Spark).** Drive the builder's joints from the existing IK and gait solver and render walk and trot stride frames in flat mode. That proves animation, then sprite or SVG output for the game.
