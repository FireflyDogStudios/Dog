# hero3 scored against the 7 measured wolves (Spark, Oct 8 2026)

Request: `docs/team/inbox/2026-10-08-firefly-hero3-new-direction.md`. **Scorer:** `engine/canine/score_hero3.mjs`. It loads `RIG.DEFS.hero3` after `registerHero3` and scores the rest pose, about 2 s per run. **Scored:** the body path plus the near legs. Heights are shares of the measured withers height (24.5 drawing units, the same as hero3's header), on the outer outline, measured the way Shutter measured the photos.

## Verdict
**hero3 fits the wolves.** All seven back-line points are in range (mean error **0.010**, against 0.058 for my 2D builder). Body length and chest floor sit on the medians. Only the **nose** is just outside the range: it is **0.03 too far forward and 0.03 too high**, about 0.7 drawing units.

## Back line vs Shutter's 7 wolves (`ref/research/photos/backline/`)
| Point along the back (s) | 0 | 0.25 | 0.5 | 0.65 | 0.78 croup | 0.9 | 1.0 tail root |
|---|---|---|---|---|---|---|---|
| Wolves, median (range) | 1.00 | 0.97 (0.96–1.00) | 0.98 (0.94–1.00) | 0.99 (0.93–1.00) | 0.97 (0.94–0.98) | 0.93 (0.92–0.96) | 0.90 (0.88–0.94) |
| **hero3** | 1.00 | 0.99 | 0.98 | 0.98 | 0.98 | 0.95 | 0.91 |

## Proportions vs the 7-wolf photo ratios (`ref/research/wolf-photo-proportions/`)
| Measure | hero3 | Median (range) | In range? |
|---|---|---|---|
| Body length (chest front to buttock) over height | **1.15** | 1.15 (1.08–1.48) | yes |
| Chest floor height over height | **0.47** | 0.47 (0.42–0.56) | yes |
| Nose forward of withers over height | 0.57 | 0.54 (0.49–0.54) | **no, +0.03** |
| Nose height over height | 0.88 | 0.85 (0.75–0.86) | **no, +0.02** |

**The nose:** the scorer finds the foremost point of the head outline, at the middle of its front edge, which is the nose leather's bulge at x 51.3. hero3's header aims the nose at (50.6, 14.7), about 0.7 units further back and lower. So the drawing sits about 0.7 units past its own target. Drawing the leather bulge back about 0.7 units (or lowering it about 0.6) would bring both numbers into range. The photo method also took the nose tip, so the two are measured the same way.

## Overlay
`hero3-overlay.png` (992×608) shows hero3 at rest with the far parts dimmed, plus:
- the 7-wolf back line (orange median dots, yellow range bars);
- the median chest floor (blue dashes);
- the median nose point (blue ring).

## Caveats
- **Pose:** this is the rest pose only. The walk frames aren't scored.
- **Scope:** the scores cover the outline, not the look. Ears, tail and paws aren't measured by these yardsticks; Palette's style read covers them.
- **Withers window:** hero3 has no withers bump (its neck rises straight from the drawn withers), so the scorer takes the highest body point in the 6 units behind the drawn withers. That lands on the drawn withers (37.1, 11.0).
- **Reproducible:** `node engine/canine/score_hero3.mjs` gives the same numbers every run (`scores.json`).
