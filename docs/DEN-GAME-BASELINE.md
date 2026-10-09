# Den Game — Progression Baseline (v0.15 sims)

Ran by Firefly on 2026-10-01. Simulated players run on a virtual clock; no script errors in either run.
- **Power** ("assume the worst"): acts every 20s, buys everything, forges, binds tomes, brews, runs trials, pushes the hardest zone it can clear in under 5s. Run for 1.5h (it ran away well before that).
- **Casual**: checks in every 5–10 min, keeps reserves, rarely runs trials. Run for 3h.

## Level curve
| Level | Power | Casual |
|---|---|---|
| L3 | 6m | 7m |
| L5 | 18m | 21m |
| L6 | 24m | **54m** (33-min dry spell) |
| L10 | 47m | 1h49 |
| L16 | 1h00 | 2h39 |
| Final | L26 @1h29 | L17 @3h |

Goal was: fast early, taper at ~1h. Actual: **slow early, accelerating late** — the inverse.

## Time per creature (seconds)
- Casual: 30s @15m → 18s @30m → 11–18s for the first ~1h45 → 0.6s @3h.
- Power: 19s @15m → 10s @30m → 7s @45m → 0.7s @1h → 0.3s @1h30.

## Findings
1. **Runaway loop (biggest issue):** meat income scales with zone → meat trades for coins → coins roll weapons → forge → DPS → harder zone → more meat. Power DPS went 1.7k (45m) → 2.9M (60m) → 790M (90m). Casual hit the same cliff at 1h52 (rolled 114 weapons in one visit). Fixed 100k meats/coin ignores meat inflation (power ended with 680 billion meats, 48k coins).
2. **Early game is a slog:** 12–30s per creature for the first hour (casual). L5→L6 gap of 33 minutes.
3. **Content runs out:** only 3 zones; power cleared moon by 55m and farmed moon trials every 2 min after.
4. **Unlocks bunch up for casual:** Library/Tomes/Gather/Scrolls/moon-trial letters all arrived at 1h52 in one burst (first tome drop gated them). Power got Library at 5m — a 1h45 spread between player types.
5. **Events unlock only via level fallback** for casual (53m); meadow mastery stayed 0 because the bot moved on at 27m.
6. **Trial wave-1 loss loop:** power started meadow trials at 27m and lost at wave 1 ten times in a row — no guidance that you're too weak.
7. **Overpower bar** hit 98 (power) / 300-kill moon OP (casual) — late game is way past "not overpowered".

## Proposed fixes (for GrumpyDingo to approve)
- Meat→coin price scales with zone/level (or diminishing returns per hour); cap rolls per visit or make roll cost climb.
- Soften DPS stacking: forge/weapon bonuses additive within a tier, multiplicative only across tiers.
- Boost early damage/meat ~2× for the first 5 levels; smooth XP curve so L6 lands ~30m.
- Guaranteed first tome by ~20–30m (gift letter) so unlocks are spaced, not bursted.
- Trial "power check": warn/disable start if recommended level not met.
- More zones (or zone tiers) so endgame isn't reached in an hour.

Raw logs: den-game-sim-logs-v0.15.txt (sent in chat). Harness lives in scratchpad sim/ (warp.js, bot.js, run.js, analyze.py).
