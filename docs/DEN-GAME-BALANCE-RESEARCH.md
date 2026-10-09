# Den Game — Balance Research (vs. baseline sims)

Firefly, 2026-10-01. Pairs with DEN-GAME-BASELINE.md. Proposals only, nothing shipped. Waiting on GrumpyDingo.

## Root causes found in our code
| Sim symptom | Cause in v0.15 |
|---|---|
| Runaway DPS from 45m (power) / 1h52 (casual) | **Loot = enemyHP × k**, and enemyHP = 300·**1.5^(level−1)**·zone. Meat grows ×1.5 per level, but `MEAT_PER_COIN = 100000` is fixed, so coin income is exponential. `makeWeapon` scales new weapons to the *current* enemyHP (`fair = hp/40`). The result is a closed loop: faster kills → more XP → enemyHP ×1.5 → meat ×1.5 → more coins → rolls → stronger weapons. |
| Forge spikes | `doMerge` floor is max(1.35 × best, 0.6 × sum of 3), so each tier step is roughly ×1.8 and `forgeAll` chains it through 7 tiers. |
| Everything feels multiplicative | `dmgMult()` multiplies about 17 sources together (tomes, scrolls, upgrades, potions, gems, skills, rest, cozy…). |
| Slow first hour | XP needed is `10·lvl` (gentle), but enemyHP ×1.5 per level outpaces early gear: a 12–30s time-to-kill (TTK). |
| Tome burst at 1h52 (casual) | Regular-kill tome chance is 1/1500 with no pity. Library and its letters all wait on the first tome. |
| Content runs out at ~55m (power) | Only 3 zones and no prestige loop. |

## What reference games and research say
1. **Costs outrun production, by design.** Kongregate's "Math of Idle Games" puts costs on an exponential curve (AdCap growth ×1.07 per purchase) and production on a linear one. Exponential beats polynomial, so walls form naturally and milestone multipliers break them in "bumps". Eric Guan's rule of thumb is production ×1.10 per upgrade against cost ×1.15 per level, which makes the slowdown self-tuning. **Ours is inverted:** income (meat from enemyHP ×1.5/level) grows exponentially while roll cost is flat at 1 coin.
2. **Per-zone currency (Pet Sim 99).** Every world has its own coin type, so wealth effectively resets when you advance. The stable cross-world currency is diamonds, which come in slowly from dailies, breakables and daycare. Big sinks: area-unlock costs climb toward 750k, and Shiny takes 125 copies. → Make the meat→coin price scale with zone/level, or make meat per-zone.
3. **Additive first, multiplicative late (Balatro).** Score = Chips × Mult. Early jokers are additive, xMult comes late and is rare. The run is bounded by fixed ante targets (300 → 50k across 8 antes), with super-exponential endless scaling after that. → Group our 17 multipliers into a few **additive buckets**, e.g. (1 + tomes + scrolls + upgrades) × (potions) × (skills), so stacking more of the same thing doesn't compound.
4. **Downscaling and horizontal progression (GW2).** Dynamic level adjustment pulls your base stats down to the zone's level. Old zones stay meaningful, and rewards are scaled so they're still worth it. → An overpowered map can cap your effective DPS at the zone's level and pay **mastery/bonus loot** instead of instant kills. That fits our existing overpower bar.
5. **Boss-gated tiers (Terraria).** Explore → gear up → boss → new materials/NPCs → next tier. You cannot reach tier N+1 ore without tier N's tool. → Gate forge tiers or roll tiers behind zone trials/mastery instead of coin volume.
6. **Fast early levels (The Drift devlog, Melvor/RuneScape curves).** A dev fixed the same "5 min then an hour of nothing" problem by switching to a geometric XP curve: Lv2 went from 4 min → 6 s, the first upgrade from 5 min → 1 min, and the first hour held **14 named unlocks**. Total XP to cap stayed the same. They also added automated pacing tests to the build, which our sim harness can do.
7. **Pity / bad-luck protection.** Hard pity guarantees a drop at N tries, soft pity ramps the odds (Genshin, Hearthstone, WoW). It turns the "unlucky tail" into a known ceiling. RACCOIN reviews call out sluggish, inconsistent openings when early upgrades don't show up. → Add tome pity, and guarantee a first tome via a letter around 20–30 min.
8. **Reengagement clocks (Eric Guan).** Systems should run on different clocks (minutes, hours, days) so casual and active players both feel successful. This explains why our casual player trailed so badly: almost every system runs on the active clock.
9. **Sinks plus negative feedback balanced by milestones (Adrian Crook).** Resource drains (scaling prices, upkeep, consumable boosts) and soft caps, paired with milestone rewards so it still feels generous.
10. **Miner's Haven (Roblox), requested by GrumpyDingo.** This is the closest match to our shape: a build that makes money, a rebirth, and a permanent item collection.
    - **Lives (rebirths):** cash resets to $50, but your **inventory is kept** and every rebirth hands you **one guaranteed Reborn item**, a permanent upgrade. You are showered with rewards, yet each life starts humble, so a single run never inflates forever.
    - **Rebirth cost climbs:** linear for lives 1–40 (the Reincarnation update set +25Qn per life), then exponential. Early lives are quick wins and later ones are long goals.
    - **Life-gated item pools:** stronger Reborn items can only drop after reaching certain life numbers, and Adv. Reborn items arrive after life 500. Power is gated by milestones, not by grinding volume.
    - **Research Points** unlock shop tiers. **Craftsman** fusion/evolution needs blueprints (bought with RP) plus specific items. **Salvage** turns duplicates into **shards** for a daily **Reborn Shop**, which acts as a pity / bad-luck sink.
    - **Skip lives:** paying 1000× the rebirth cost jumps you forward and earns shards. A catch-up option for strong players.
    - **Limited base space** forces choices about what to place.
    - **Sacrifice** (around life 1000) is a big late reset that earns powerful items through challenges. It gives the long tail a goal.
    - → **For us:** a cozy prestige. Pick a cozy name, e.g. *"New Den"* or *"Migration"*:
      - **Resets:** meat, coins, weapons, and zone progress.
      - **Kept:** pups, tomes, scrolls, the bestiary, and some upgrades.
      - **Each one grants:** one guaranteed **Keepsake** (a permanent, life-gated pool) plus shards.
      - **Rebirth target:** scales linearly at first, then exponentially.

      This also answers "content runs out at 55m": the 3 zones become a loop you climb again, stronger, with new keepsakes unlocking at life 3, 5, 10 and so on. Duplicate weapons salvage to shards for a daily shop (pity). Forge tiers 5–7 need blueprints instead of raw coin volume.

## Proposed fix set (ordered by impact)
1. **Break the loop (biggest):**
   - Roll cost scales by zone/level, e.g. coins per roll = 1 × 1.15^(rolls this zone), resetting on a new zone. Or the meat→coin price scales with enemyHP.
   - Weapons keep a fixed power at roll time and never re-scale.
2. **Bucket the multipliers:** additive within a source family, multiplicative only across about 4 families.
3. **Forge floor:** lower it to about 1.25 × best and drop the 0.6 × sum term. Higher tiers need blueprints or zone mastery.
4. **Early game:** double damage and meat for levels 1–5, or soften enemyHP to 1.35^L for the first 6 levels. Target time-to-kill: 3–6 s for the first 30 min, L6 by about 25–30 min for casual.
5. **Unlock spacing:** tome pity (guaranteed by about 300 kills) plus a gift tome letter around 25 min. Spread the Library, Gather and Scrolls letters at least 10 min apart.
6. **Overpowered zones:** soft-cap effective DPS at about 3× zone HP and convert the excess into bonus loot or mastery.
7. **Trials:** show a recommended level and power check before starting. No silent wave-1 loss loops.
8. **Content length:** a Miner's Haven-style prestige ("New Den") with guaranteed keepsakes, salvage → shards → daily shop, plus zone tiers later.
9. **Regression test:** rerun `sim/` power plus casual after every balance change, against these targets:

   | Target | When |
   |---|---|
   | L5 | ≤ 15m |
   | L10 | ~45–60m (power), ~75m (casual) |
   | Time-to-kill | Never under 1 s before 2h |
   | DPS growth | ≤ ×10 per 15 min |
   | Unlock letters | ≥ 8 min apart |
   | First prestige | ~60–90m (power), ~2–3h (casual) |

## Sources
- Kongregate, The Math of Idle Games I & III: https://www.kongregate.com/en/pages/the-math-of-idle-games-part-i , https://www.kongregate.com/en/pages/the-math-of-idle-games-part-iii
- Eric Guan, Idle Game Design Principles: https://ericguan.substack.com/p/idle-game-design-principles
- Adrian Crook, Passive Resource Systems: https://adriancrook.com/passive-resource-systems-in-idle-games/
- Balatro Wiki, Blinds & Antes / Scaling: https://balatrowiki.org/w/Blinds_and_Antes , https://balatrowiki.org/w/Guide:_Scaling
- PS99 economy: https://rowatcher.com/news/pet-simulator-99-economy-explained-gems-enchants-and-the-true-cost-of-progress
- GW2 dynamic level adjustment: https://wiki.guildwars2.com/wiki/Talk:Dynamic_level_adjustment
- Terraria progression: https://terraria.fandom.com/wiki/Guide:Game_progression
- The Drift early-game pacing devlog: https://lmoya2005.itch.io/the-drift-idle/devlog/1620836/v012-early-game-pacing-the-math-agreed-with-you
- Pity systems: https://gamedesign.gg/glossary/pity-system/
- RACCOIN review: https://www.theouterhaven.net/raccoin-review/
- Miner's Haven: https://en.namu.wiki/w/Miner's%20Haven , https://en.namu.wiki/w/Miner's%20Haven/%ED%8C%81 , https://devforum.roblox.com/t/miners-haven-reincarnation-452020-4122020/511714
