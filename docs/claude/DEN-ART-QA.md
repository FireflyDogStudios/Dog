# Den art QA: the standard test (Firefly, Oct 9 2026)

GrumpyDingo, Oct 9: *"Look at the things you had fixed in the past, the things we are fixing now, list more tools you want to create, and create a standardized way of testing things. The more tools the better."*

**The rule:** nothing goes to GrumpyDingo or onto a bench until `./den qa <rig>` has run on that build, and every FAIL is fixed or written up as a question. Pictures are for the eye; the numbers decide. When GrumpyDingo finds something the run missed, the detector gets taught to see it (step 3 below) before the fix goes in, so the same kind of flaw is never missed twice.

```
./den qa hero5 --notes=ref/research/firefly/wolf-bench-notes      # the whole run, ~3 minutes; art/hero5/qa/REPORT.md
./den qa hero5 --quick                                            # dogcheck, motion, joints, pixi, bench only (~1 minute)
./den qa hero5 --kill                                             # plus the game's kill check (needed when an engine the game loads changed)
```

## 1. What the run does

| step | tool | what it proves |
|---|---|---|
| dogcheck | `tools/dogcheck/dogcheck.mjs` | anatomy and motion against the measured dogs: one piece every frame, slivers at rest, attachment, topline, markings inside their shapes, feet on the ground, footfalls and duty factor, joint ranges and shapes (r ≥ 0.7 with the walking dogs), contrast on the meadow |
| edges | `tools/qa/edges.mjs` + `edges.py` | true vectors at 80 px a unit, standing + 8 walk frames (+ each note's own frame), each on magenta **and** green, plus an id buffer: **bleed** (a pixel inside the body that changes with the background: a hairline seam), **rim** (a marking stops short of the outline so the piece under it shows as a line), **thin** (a colour band under 0.12 units), **corner** (a point sticking out sharper than 100°: spikes, squares, hard cut ends), **seam** (a colour edge that breaks across the head/neck seam while walking, lined up standing). Allowed corners per rig: `tools/qa/allow.json` (with the reason) |
| notes | `tools/qa/notes.mjs` | every Wolf Bench note GrumpyDingo left, replayed at its own frame on this build: is the detector still finding something where his arrow points? A contact sheet, his words over each crop |
| motion | `tools/qa/motion.mjs` | every animated joint: swing, beats per stride, jerk; the tail: does it bend (several joints or skinned) or swing as a plank, does it trail the body, does a wave run down it (each segment later and wider) |
| joints | `tools/bench/probe/joints5.mjs` | every joint, near and far, 25x, standing + 8 frames: the picture GrumpyDingo would make by hand |
| pixi | `tools/bench/probe/pixi5.cjs` | the game's own renderer (RIG.build + Pixi 8) draws it, bench size and game size, no errors |
| bench | `tools/bench/tests/wolf_bench_hero5.cjs` | the Wolf Bench lists it, loads it, draws it, every tab opens, ghosting works, no page errors |
| kill | `npm run check` | the game still gets 6 kills at 5 window sizes (only when an engine the game loads changed) |

## 2. The flaws we have fixed, and which step now catches each

| flaw (when) | cause | caught by |
|---|---|---|
| arm poking over the chest, thigh corner, "disconnected" hind leg (hero3, Oct 8) | draw order; a thigh not skinned to the body | dogcheck topline/attach; joints sheet |
| loop start not smooth, hind kick (hero3) | a track with a corner at the wrap; reach drop ending at lift-off | motion jerk; dogcheck feet |
| joints not moving like a dog's (Oct 9) | free-form tracks | dogcheck pattern (r vs Catavitello 2015) |
| "doesn't have the shape of a wolf" (Oct 9) | drawn, not measured | hero5 overlay on the photo (`tools/den/hero5_overlay.py`, FINAL=1) |
| jagged outline, ear lump, tail notch and spike (hero5 v0) | traced photo edges | edges corner/thin; overlay |
| hairline seams between pieces, neck seam (hero5 v0) | pieces meeting edge to edge | edges bleed |
| ball feet, ball on the back of the leg (hero5, Oct 9) | paw cut where two paws overlap; a round tail tip | joints sheet; edges corner |
| spurs at the joints, hook at the knee, dents at the hock (hero5, Oct 9) | photo cuts with corners, off-centre joint discs | joints sheet; edges corner (walk frames) |
| legs as sticks (Oct 9) | widths trimmed under the photo's | overlay; joints sheet |
| saddle stopping dead at the head seam; hairline at the seam | markings cut per piece | edges seam/bleed |
| the 11 Wolf Bench notes of Oct 9: thin lines round the tail, saddle and ear; seam breaks; a spike; a square; a 90° tail corner; a gap at the croup; a mechanical tail | markings inset 0.03 from the outline; neck markings on a nodding head; a tapered shoulder bar; a straight tip cut; tail drawn over the croup; a one-piece tail | edges rim/corner/seam/thin; motion tail |

## 3. When GrumpyDingo finds something the run missed

1. Save his notes: `ArtifactData query notes where rig == <rig>` with `out_dir`, copy into `ref/research/firefly/wolf-bench-notes/`.
2. `./den qa <rig> --notes=ref/research/firefly/wolf-bench-notes`: the notes sheet shows each note's spot on this build, and whether the detector sees it.
3. For every note marked **NOT caught**, change the detector until it is caught on the *old* build (keep the old frames: the run writes them to `art/<rig>/qa/edges/`). Only then fix the art.
4. Fix, rerun: every note should now show nothing at its spot, and the rest of the report must not get worse.
5. Reply on each note in the bench (`reply`, `fixedIn` = the commit), status fixed.

## 4. Tools still to build (wishlist, most useful first)

1. **Before/after diff** for every run: the same frames from the last committed build and this one, flicker GIF and a red/green difference, so a change shows only where it was meant to.
2. **Note replies from the run**: write each note's caught/fixed state and a crop link back to the bench automatically.
3. **Game-size readability**: render at 120 px tall on the meadow and at half-width windows; measure that the eye, nose, ear, tail tip and each leg stay at least 2 px and separate.
4. **Silhouette fit, every rig**: the overlay on its reference photo as a dogcheck step (hero5 has it as a script).
5. **Motion against video**: the tracked fox and the Catavitello curves already exist; add a tail and head reference (tracked from a walking wolf video) so the tail's lag and swing have a measured target, not only "does it bend".
6. **Draw-order map**: an id render with a legend per frame, showing what is on top of what (today it is a zoom script in the scratchpad).
7. **Edge consistency across frames**: a marking's outline length and area per frame, so a zone that flickers or pops while walking shows as a jump.
8. **One page**: the report and its pictures as a private artifact, so GrumpyDingo can read the run without the terminal.
