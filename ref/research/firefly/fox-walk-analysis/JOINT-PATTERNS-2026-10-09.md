# Do the wolf's joints move like real ones? (Oct 9, 2026)

GrumpyDingo asked: are hero3's joints (A) working like real animals' joints, (B) following the fox we tracked, and (C) how to get there if not.
Measured with `tools/bench/probe/fox_vs_wolf.mjs` (numbers) and `fox_vs_wolf_chart.mjs` (chart: `art/hero3/fixes/2026-10-09-joints-vs-dogs-fox.png`).
Every curve runs over one stride from that paw's touchdown. Dogs: Catavitello 2015, 5 retrievers walking (mean, SD). Fox: GrumpyDingo's points, one stride (near fore f14-35; near hind f29-50, while the fox slows).
r = how alike the shapes are (1 = same pattern, 0 = unrelated, negative = opposite).

| joint | wolf range | dogs | r vs dogs | fox | r vs fox | what is wrong |
|---|---|---|---|---|---|---|
| wrist | 66-190 | 102-231* | **0.90** | 68-213 | **0.90** | right pattern; the paw-down wrist is held flat at 190 where the fox and dogs keep opening toward lift-off (fox 175 → 213) |
| elbow | 110-152 | 98-153 | -0.53 | 110-158 | 0.37 | swing timing late: it locks open (152, its limit) at 65-85% where dogs are already folding (lowest 98 at 80%) |
| shoulder | 90-125 | 121-153 | -0.43 | 137-196** | 0.53 | 30° too closed all stride; in late swing it closes where dogs open to reach |
| knee | 101-148 | 110-144 | -0.25 | not tracked | | dogs hold the knee near 140 while the paw is down; the wolf lands at 108 and opens to 146 by lift-off, then folds late (lowest at 85% vs 75%) |
| hock | 120-158 | 119-160 | -0.01 | 79-117** | -0.58 | opposite while the paw is down: dogs and the fox give a little at touchdown, then open for the push-off (dogs 136 → 159); the wolf closes steadily (157 → 126) |

\* the dogs' wrist is measured to the toe tip, which reads 20-35° high while the paw is down.
\** the fox shoulder and hock sit 40-60° away from both dogs and wolf but follow the dogs' pattern: most likely where the points were clicked (withers vs blade top; heel point vs ankle). Re-click a few frames to confirm.

**Why:** the wolf's legs are posed by placing each paw on a path and letting two-bone IK choose the knee and elbow. IK gives the angles that reach the paw, not the angles a dog uses. Only the wrist, which has its own hold rule and fold curve, follows the real pattern. The hinges themselves are fine: no joint bends the wrong way, and the ranges sit inside the measured ones (shoulder aside).

**Fix (proposed, not started):** drive each joint from the measured curves (retimed to our paw-down share), and keep one joint per leg free to keep the planted paw still: the hip (femur) for the hind leg, the shoulder blade for the fore, as in real animals. Score it with a new dogcheck test (shape r ≥ 0.7 and inside the dog band most of the stride).
