# Session notes: the wolf, the Gait Tracker and the Compendium (Oct 8-9, 2026)

Firefly's save point before a context compaction. Every change has its own line in `docs/log/LOG.md`; this is the short map.

## Live pages (all listed in `artifacts.json`, and as cards in the Den Compendium)
- **Den Compendium** (new): https://claude.ai/artifact/JCjQAPUbrV2dTtfg4eE2eT, source `apps/compendium/index.html`. One page with tilting cards for every live Den artifact, grouped in chapters (the game, creatures and motion, gear and goods, look and feel kit, the studio). When an artifact is added or retired, edit its `BOOK` array and republish.
- **Wolf Bench** v12 (`apps/wolf-bench/`): right-click part menu, hide / show-only, trouble tags shared through `db parts/<rig>~<key>`, Parts tab. All of GrumpyDingo's tags are answered there with a reply and the build that fixed them.
- **Gait Tracker** v8 (`apps/gait-tracker/`): video-editor layout, Manual and Assisted modes, sticky joint selection, undo/redo, auto adjust with revert, custom tracks, save, backups, import/export (.json, .csv), and GIF / frame sheet / frames .zip export. Capabilities `db`, `downloads`.

## The wolf (hero3), fixed this session
1. The hind kick at lift-off: Hermite swing, smoothed girdle, eased push-off lean.
2. The front wrist: folds to 66 deg in the swing (fox 64) and holds at 190 deg while the paw is down (fox median 193). No more bending both ways. A new dogcheck test fails any wrist that crosses straight or sweeps more than 20 deg while the paw is down.
3. The upper arm over the face: the head chain now draws after the near legs (`vaultHead` / `bodyHead`).
4. The thigh over the saddle: the saddle hangs off `bodyHead`.
5. The neck and chest seams, and the chest front: **skinned parts**, a new rig-engine feature (`skin: {to, w}`, `RIG.skinPts`). The chest front bends smoothly toward `headBody`.

State: dogcheck 0 fail, 1 warn (the shoulder; the blade top is an estimate). The kill check t40 passed. Before/after images are in `art/hero3/fixes/`.

## The fox findings
GrumpyDingo's 920 hand-placed points are in `ref/research/firefly/fox-walk-analysis/tracked/`, written up in `TRACKED-ANGLES.md`: wrist 64-214, elbow 113-156, hock 71-119 (hock not confirmed yet). The fox video and frames stay out of the repo (unknown licence).

## Next, in GrumpyDingo's order (ask one at a time)
- The stop sequence (from the fox timings).
- The mouth.
- The team review of the wolf.
- The other species, in parallel.
- Other places skinning could help: the hip/thigh join and the tail root.
