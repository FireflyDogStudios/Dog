# Species files

One YAML file per animal, holding every number the species creator needs, each with its unit, source and confidence. Check one with `./den species check species/<id>.yaml`; the format is described at the top of `tools/den/species_check.py`.

**Direction (GrumpyDingo, Oct 6):** new models are built **skeleton-first** from these files, as accurately as the research allows. The two current dogs (`hero`, `hero2` in `engine/rig_den.js`) are on hold, and one of the new models may become the hero and companion, which would deprecate them. Gear still fits any new model through the mount-and-compile pipeline.

- **Groups:** `size` (field guides), `bones` (museum skeletons), `spine`, `skull`, `ratios` (photo keypoints), `angles` (standing), `limits` (passive joint ranges), `gait`, `behaviour`, plus `traits` for what numbers cannot say.
- **Confidence:** A = measured, clear definition; B = peer-reviewed but second-hand, or a domestic-dog proxy; C = popular source, small sample or search snippet; EST = estimate.
- **Cross-checks:** a number with `check:` is compared with `ref/research/` (skeleton within 15%; keypoints inside the middle half or within 15% of the median); a deliberate difference needs `override: "<why>"`.

| File | Status |
|---|---|
| `wolf.yaml` | draft: the prototype; all 22 cross-checked numbers agree with the research |
