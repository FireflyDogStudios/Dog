# Den Game — Combat Update: Statuses + Weapon Skills (design draft)

Written Oct 2, 2026 by Firefly with GrumpyDingo, from **BoonsDebuffsLootThoughts.txt** (GW2 notes + GrumpyDingo's comments). **Status: draft. Comes after Loot 2.0 is finished.**
Rule from GrumpyDingo: learn from GW2, but **never copy its ideas or names**. Everything here gets our own dingo names and twists.

---

## Goals
- **AFK when you want, lock in when you want.** Idle play still works. Hands-on play is clearly stronger, mostly on bosses.
- **Not an add-on nobody uses.** It has to give an "okay, I'm ready to put in the work" feeling (GrumpyDingo).
- **One shared language for effects** that weapons, affixes, creatures, tomes, brews and bosses all reuse. A new creature is built from it, so it's easy to see how it plays against the pack.

## 1. Status library (buffs and debuffs)
Pieces exist today but are each coded on their own: bleed (blades), burn (Blazing), slow (Frostbite), stun (Stunning), shock, the mega debuffs on the dingo (Weakened, Sluggish, Dazzled), and boss shields, heals and enrage.

One library replaces them:
- Each status has an id, our own name, an icon, a colour, and a rule: **lasts longer when reapplied** or **stacks stronger**.
- Shown as small icons above creatures (and the dingo), with stack numbers and a shrinking ring for time left.
- Start small: **about 5 boons and 7 conditions.** No conversions, corruption or cleanse-order rules (too much for an idle game).
- Draft names (GrumpyDingo may rename):
  - Boons: **Zoomies** (faster attacks), **Hackles Up** (stacking damage), **Thick Coat** (armor)
  - Conditions: **Burrs** (bleeding), **Scorched** (burning), **Muddy Paws** (slowed), **Spooked** (runs away)
- Creatures list which boons they can gain and which conditions they apply, replacing one-off trait code over time. This feeds the future creature generator.
- Loot 2.0 affixes can apply statuses ("Ember: Scorched") once this lands. Until then, affixes use the existing trait code.

## 2. Weapon skills (keys 1–5 + back bar)
- **The bar = your 5 equipped weapons.** Each one gives one skill on keys 1–5 (on-screen buttons on phones). A **back bar** is a second set of 5 you can swap to.
- **The skill comes from the weapon type** (a Disc's sweeping curve, a Tug Rope yanking the whole line, a Staff's chain storm). **Affixes flavor it** (an Ember Disc leaves a fire trail).
- **Combined affix power:** affixes across the bar can add up to a special attack (GrumpyDingo's idea; mechanics to design).
- **Auto-cast** fires skills on cooldown at okay timing, so AFK still works. A hands-on player times combos (yank, then sweep) and reacts to bosses.
- **Bosses are where it matters, even without life bars:** megas already shield, heal, enrage and push. Saving a Breaker skill for the shield or a slow for the enrage clears faster and earns better loot.
- This is the road toward the ESO-style dungeon fights and life bars parked for later (Den Dungeons).

## Open questions
- Final names for the boons and conditions.
- How the back bar is filled (a second loadout of 5 weapons, or skills chosen separately).
- How combined affix specials work.
- Whether manual play gets a direct reward (bonus loot on bosses) or only the natural speed-up.
