# Rig points on the wolf pictures (GrumpyDingo, Oct 9, 2026)

Placed by hand in the Gait Tracker's guided mode (44 points: the built-in leg joints, nose, ear base, withers, tail base, and 31 rig points; definitions in `apps/gait-tracker/template.html`, `GUIDE`). Coordinates are in the tracker's 960x640 frame; `images[].s/ox/oy/flip` map them back to each picture's own pixels.

- `01_RobFoster_GrumpyDingo_2026-10-09.json`: wolf 01 (Rob Foster, iNaturalist, CC BY 4.0), GrumpyDingo's cut-out. `01_points.png`: the points drawn on it.

First read (Firefly): withers height 380 px. Standing angles shoulder 110, elbow 141, wrist 168, knee 121, hock 132 (species/wolf.yaml: 115, 140, 160, 142, 140); elbow height 0.51 and chest depth 0.51 of withers height (wolf.yaml 0.53, 0.54). Everything fits the measured wolves except the knee, 21 deg more bent: the knee joint sits on the outline (the knee-front point is behind it), so it is probably placed a little too far forward.
