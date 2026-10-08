# Generator trials, part 1: Infinigen (Spark, Oct 8 2026). INTERIM: read, not yet run

Request: `docs/claude/DEN-REQUEST-dog-generators-2026-10-08.md`.

## Status
- **Installed:** Infinigen is cloned at `/home/user/infinigen` (commit 3f58bb8, Aug 27 2026, BSD-3), in a Python 3.11 venv with `bpy` 4.2 and the v1 creature dependencies.
- **Blocked:** running it was refused by this session's auto-mode safety check ("code from external"). I did not work around that.
- **What I need:** GrumpyDingo's OK to run Infinigen's code in this container. A permission rule allowing `/home/user/infinigen/.venv/bin/python` would do. The render script is ready: `tools/spark/infinigen/gen_carnivore.py` (side view, flat dark background, clay or native material, an option to force the wolf template). It needs no network, account or purchase.
- **Not started:** Scout's shortlist hasn't arrived, so there are no trials of other generators yet.

## What reading the source shows (`src/infinigen/assets/objects/creatures/carnivore.py`)
- **It's a tiger generator with a wolf in its mix.** The only genome is `tiger_genome()`.
  - The body is a random convex blend of five NURBS templates: cheetah, housecat, tiger, tiger_2 and **wolf** (`body_feline_wolf.npy`). Half the time the head is a blend that includes `head_carnivore_wolf.npy`.
  - The **ears are always `CatEar`**, the **nose is always `CatNose`**, and the hair parameters are the tiger's.
  - So it makes "felid-ish carnivores". A dog needs code changes: force the wolf templates and write a canine ear and nose.
- **No breed controls.** The variation is random noise on lengths, radii and profiles (`var`, `temperature`). There is no "Husky" or "drop ear" setting.
- **There is a rig.** `join_and_rig_parts` builds an armature with IK targets. But there is **one generic run cycle**: two foot pairs on a sine path, stride drawn at random. There is no walk, trot or gallop, and no sit or lie. Idle is just snapping the feet to the floor plus noise.
- **Gear:** parts are addressed by (length, yaw, rad) on each part's skeleton curve. That would give stable attachment points if we drove it.
- **Purpose:** it makes synthetic training images for computer vision. It is not a game-asset tool. It is heavy too: Blender 4.2 plus about 40 packages, and every creature is a full Blender build.

## Against the six game needs (preliminary, from code)
| Need | Infinigen carnivore |
|---|---|
| 1 Side-view dog, flat restyle | Possible via a Blender render, but the base is feline |
| 2 Many breeds and species | No: one tiger genome. Canids need new parts and a genome |
| 3 Walk, trot, gallop, idle, sit, lie | One generic run cycle. We'd drive it ourselves |
| 4 Gear points | Yes in principle (surface coordinates per part) |
| 5 Licence | **BSD-3: fine to ship** with the copyright notice |
| 6 Original look | Yes: procedural, restyled by us |

## Preliminary verdict
**Not a drop-in dog generator.** Its useful parts are ideas, plus one BSD asset:
- a genome of parts attached at surface coordinates (the same idea as the SDF builder's modules);
- the BSD `body_feline_wolf` and `head_carnivore_wolf` NURBS templates, which could serve as shape references for our masses.

The recommendation (use, build or combine) waits on the render and on Scout's shortlist. Leaning: **combine**. That means our builder, with any clean generator or asset as a shape reference, and our numbers for the proportions.
