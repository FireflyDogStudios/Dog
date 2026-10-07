# Wolf muscle body round 3: Forge's read (reading only, nothing run)
From: forge · 2026-10-07
Needs from Firefly: nothing (FYI). Causes below are hypotheses from reading `body3d.py` and `skeleton3d.py`; I did not run them (no OpenSim or Blender here).

**What I see in the images**
- Round 3 barely differs from round 2. The topline and neck chord changed; the trunk did not, so most of the faults sit in the trunk and skeleton, not the skin offsets.
- The ribcage is probably too wide because of `skeleton3d.py`, not `body3d.py`. The thorax is scaled across (X) and up (Z) by `cross`, the mean of the four limb length ratios. A wolf's legs are long against a Beagle's, so the chest gets widened by leg length. Then `hw = ribw * 0.98` copies that width into the filler. Fix: scale thorax width from a sourced chest width (the Scout 14 tape figures, chest width 0.19-0.26 of withers height) and keep depth separate.
- The rib stripes come from `boneZ`, which is only closed with `size=5` (10 mm), smaller than the rib pitch. The ribs then show through `base = max(boneZ, fill)`. A blur wider than the rib pitch (about 30 mm), or using only the bone envelope under the muscles, should hide them.
- The back hump is probably in the bones. The topline is built from `env`, the spine-tip envelope. If the scaled thorax and abdomen meshes tilt up toward the loin, no skin offset can fix it. Plot `env` against a sloping target; if it is the bones, fix the lumbar angle in the stance solve.
- The belly can't tuck up with this method. Everything is one height field z(x,y) from the side, and the lower line is the plate's outline, so the belly stays blocky. The "first gap" rule for the trunk's lower edge also breaks wherever a leg overlaps the belly.
- Thin lower legs: below the elbow and stifle the surface is bare bone Z plus a few Hill-volume domes. A tube swept along the bone axis, with a radius profile from skin offsets, would give them body.

**For the Husky (what carries over and what breaks)**
- Carries over: the plate's TPS warp and its bone landmarks, the Stark meshes (a Husky is closer to the Beagle-scaled model than a wolf is, so `cross` is less extreme), the Hill volumes and the edge roll-off.
- Breaks or is hard-coded to the wolf:
  - the abdomen half-widths `0.16`/`0.21` of withers height, `NECK_HALF`, `THROAT`, the occiput and nose pixel pairs, and `THICK_EST`;
  - the Scout 15 offsets, which are bare skin on a plate dog or a wolf photo, while a Husky's double coat adds a lot;
  - the tail, which is rigid, one `cauda` body, and a Husky's tail curls over the back;
  - the ears, which are erect and not in the head mesh.
- Suggest: keep the coat as its own layer on top of the muscle body, so the muscles stay honest and the coat can be tuned alone.

**Simpler or sturdier to try**
- Loft the trunk as elliptical cross-sections along the spine line, not a height field. Each section's width comes from the ribcage and pelvis bones and its depth from the skin line. That gives a real tuck-up, and a width that is set directly rather than inherited from a scale factor. Domes for the muscles can still sit on top.
- Turn the printed checks into pass/fail against the species file (girths, chest width, topline ratios). Today they print and a wrong value still renders. Add an outline-overlap score against the plate or a photo, so each round shows a number.
- If the end use is the flat 2D side view, the height field may be enough once the width and rib faults are fixed. The loft is worth it only if we want a front or three-quarter view.

- where: this note; status in `docs/team/status/forge.md`
