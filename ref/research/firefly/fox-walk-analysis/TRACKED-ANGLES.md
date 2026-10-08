# Fox clip: joint angles from GrumpyDingo's hand-placed points (Oct 8, 2026)

GrumpyDingo placed 920 points across 18 joints on all 64 frames of Fox.mp4 (480×270, 15 fps) in the Gait Tracker. The raw saved docs are in `tracked/` (clips/ = the points, results/ = what the page measured). The angles below come from the points themselves; each point is smoothed with a 3-frame median. Convention: 180 = straight, below = bent the normal way, above = past straight.

## How good are the points
- **Body and head** (nose, ear, withers, tail base, near pelvis top, near knee): the frame-to-frame wobble is about 2–3 px, which is the usual spread when people click joints by hand (DeepLabCut reports ~2.7 px). The bones between these points keep their length to 4–6%. **Good.**
- **Upper legs** (shoulder–elbow, knee–hock): bone lengths hold to 9–13%. **Usable.**
- **Lower legs and paws:** the wobble is 6–8 px, and the short wrist-to-paw bone varies 17–28%. On a 480 px video the lower leg is only ~10 px wide, so this is expected. Part of the paw wobble is real, because paws speed up hard at lift-off and touchdown. **Noisy point by point, but the pattern across frames is clear and repeats over two strides.**
- **Missing:** the near and far hip points and the far shoulder, so the knee (stifle), hip and far elbow angles cannot be measured yet.

## Angles (smoothed range over the clip)
| joint | fox (these points) | our wolf (hero3) | measured dogs walking |
|---|---|---|---|
| near wrist (carpus) | **64–214** (past straight on 23 frames, up to 34°) | 97–214 | Humphries 2020 trot max 219–224; 5MC-based source 88–217 |
| far wrist | 85–199 | | |
| near elbow | 113–156 | 104–152 | 98–153 (Catavitello) |
| near hock (tarsus) | 71–119 | 113–150 | 119–160 (Catavitello) |
| far hock | 69–101 | | |

**The wrist cycle is clear.** While the paw is on the ground (paw height 0–12 px), the wrist sits at 185–205°, which is 5–25° past straight. It folds to about 65° when the paw is lifted 30–40 px. So **the wolf's wrist going past straight is right**: the fox does it by as much (up to ~34°). What the wolf lacks is the swing fold, which reaches only 97° against the fox's ~65°.

**The hock reads 40° more bent than dogs.** Some of that may be the fox's crouched walk. Some may be which spot was clicked: the point of the heel behind the joint, versus the ankle bone on its side. Treat the hock as unconfirmed until it is re-clicked on a few frames using the landmark notes.
