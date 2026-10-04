# Den Game — Status Baseline (ESO + GW2 catalogued, Den compared)

Research pass Oct 3, 2026 by Firefly at GrumpyDingo's ask: "see how many of these things the other games have, in what context, and get a baseline before the next push." Counts come from the wikis and guide sites listed at the end; read on the day, so treat the numbers as "about right" rather than gospel. Nothing here is wired; it's the map.

## 1. Guild Wars 2 (by kind, then by what it touches)

GW2 keeps **three strictly separate kinds**, each with its own rules and its own removal:

**Boons: 12.** One list for the whole game; every profession hands out the same twelve.
| What it touches | Boon | Stacks |
|---|---|---|
| Damage out | Might (+damage per stack) | intensity, cap 25 |
| Crit | Fury (+crit chance) | duration, cap 30 s |
| Speed of actions | Quickness | duration |
| Cooldowns | Alacrity | duration |
| Move speed | Swiftness (+33%) | duration, cap 60 s |
| Damage in | Protection (−33%) | duration |
| Condition damage in | Resolution (−33%) | duration |
| Condition immunity | Resistance (non-damaging conditions do nothing) | duration |
| Control immunity | Stability (per stack: eats one hard CC) | intensity, cap 25 |
| Block | Aegis (block next hit) | duration |
| Healing | Regeneration (hp per second) | duration |
| Dodge resource | Vigor (+50% endurance regen) | duration |
Two of twelve stack in intensity (Might, Stability); the rest stack in duration. Boons can be stripped, stolen, or corrupted into conditions.

**Conditions: 14.** Also one list for everyone.
| Group | Condition | Stacks |
|---|---|---|
| Damage over time (5) | Bleeding, Burning, Poisoned (also −33% healing), Torment (more if still), Confusion (damage when you act) | intensity, each stack its own timer |
| Damage taken (1) | Vulnerability (+1% damage and condition damage taken per stack) | intensity, cap 25 |
| Soft control (6) | Blinded (next attack misses), Chilled (−66% move, −66% recharge), Crippled (−50% move), Immobilized, Slow (actions −50%), Weakness (half your hits glance, endurance regen −50%) | duration, cap 10 s |
| Hard control that is also a condition (2) | Fear (flee, can't act), Taunt (forced to attack) | duration |
Removal: a cleanse removes whole conditions, newest first, regardless of stacks. Resistance negates the non-damaging ones while it lasts.

**Control effects: 16** (10 hard: daze, stun, knockdown, knockback, launch, pull, float, sink, fear, taunt; 6 soft = the soft-control conditions above). Hard CC is blocked by Stability, ended by a stun break, and on bosses goes into a defiance (break) bar instead of landing. That's the trial mechanic: bosses don't get stunned, they get a bar you break together.

**Everything else is an "effect":** Superspeed, Stealth, Revealed, Invulnerability, Barrier, Agony (fractals, resisted by a stat, never cleansed), and the per-encounter special-action debuffs. Effects have no shared rules; each says its own.

**Shape of it:** 12 + 14 + 16 named things, shared by every class, each kind with one removal story. Tooltips always read: what, how it stacks, how long.

## 2. Elder Scrolls Online (by kind, then by what it touches)

ESO's named list is bigger and shallower: **61 named buffs and debuffs**, every one a Major or a Minor, plus 8 status effects and 11 crowd-control types.

**Major/Minor buffs and debuffs: 61** (27 Major, 34 Minor; buffs on you and debuffs on the enemy share the list). The rule: a Major never stacks with another Major of the same name; Major and Minor of the same name stack; Major is twice Minor.
| What it touches | Named pairs (Major / Minor) |
|---|---|
| Damage out | Brutality (+20/+10% weapon dmg), Sorcery (+20/+10% spell dmg), Berserk (+10/+5% all damage), Courage (flat +430/+215), and the debuff side: Cowardice (−430/−215 on the enemy), Maim (enemy −10/−5% damage) |
| Crit | Savagery, Prophecy (crit chance), Force (+20/+10% crit damage); debuff Brittle (crit damage taken) |
| Armor and penetration | Resolve (+armor), Breach (−enemy armor), Vulnerability (+10/+5% damage taken) |
| Damage in | Protection (−10/−5% taken), Evasion (−AoE taken), Aegis / Slayer (vs dungeon and trial monsters only) |
| Healing | Mending (healing done), Vitality (healing taken), Defile (healing taken −), Lifesteal |
| Resources | Endurance / Fortitude / Intellect (recovery of stamina / health / magicka), Magickasteal, Enervation, Mangle |
| Speed | Expedition (+30/+15% move) |
| Ultimate | Heroism |
| Oddities | Timidity, Uncertainty, Toughness, "Major/Minor Buff" and "Debuff" placeholders |
Most of the 61 are **armor and resource plumbing** that only exists because ESO has three resource bars, two damage schools and a penetration stat. Strip those and the list that matters to a game like ours is about 12 pairs.

**Status effects: 8**, one per damage type, proc'd by chance (10% on a direct hit, 20% from an enchant, 1–3% from DoTs): Burning (flame DoT, 4 s), Poisoned (poison DoT, execute bonus), Hemorrhaging (bleed DoT, the only one that stacks: 3), Chilled (frost: hit + Minor Maim + Brittle), Concussion (shock: hit + Minor Vulnerability), Diseased (disease: Minor Defile), Overcharged (magic: resource), Sundered (physical: +damage). None last past 4 s; they're mostly a way to hand out a Minor debuff with flavour.

**Crowd control: 11** (5 soft: snare, immobilize, silence, and friends; 6 hard: stun, knockback/knockdown, off-balance, disorient, fear, pull). Hard CC is ended by Break Free (costs stamina) and followed by a short immunity; soft CC by dodge rolling or purge. Bosses in dungeons and trials are immune to hard CC; instead off-balance windows and mechanics.

**Shape of it:** one tier rule covering everything (Major/Minor), a thin status layer per damage type, control handled by action rather than cleanse. Tooltips name the Major/Minor so you know what won't stack.

## 3. Side by side, in the words that matter to the Den

| | GW2 | ESO | Den today |
|---|---|---|---|
| Buffs | 12 boons, two stack up, ten stack long | 61 Major/Minor pairs, none stack with themselves | 8 boons + 4 brews + 4 treats = 16 named, all multiply (no tier rule yet; Lesser/base/Greater engine is in) |
| Damage over time | 5, all stack up with own timers | 3 (Burning, Poisoned, Hemorrhaging), only bleed stacks | 2 (Burrs, Scorched), both stack up with own timers ✅ |
| Damage taken | Vulnerability ×25 | Vulnerability Major/Minor, Breach, Brittle | Shocked ×10 (−3% armor a stack) ✅, Thick Coat (armor +) |
| Soft control | 6, stack long, cap 10 s | 5 | Frostbit, Sluggish, Weakened, Dazzled, Spooked, Muddy Paws (stack long or up, capped) ✅ |
| Hard control | 10, stun break, bosses get a bar | 6, Break Free, bosses immune | Stunned, Dazed (refresh); nothing for bosses yet |
| Immunity | Resistance, Stability | CC immunity after Break Free | `resist` flag exists, nothing grants it |
| Cleanse | skill effect "remove N", newest first | purge "remove N negative", rare | `SE.cleanse` exists, nothing calls it |
| Traits on creatures | n/a (mobs use the same boons) | n/a | Armored, Shielded, Flying, Quick, Healer, Phasing, Enraged (7 "part of what it is") |
| Named total | ~42 (+ effects) | ~80 | 34 defined (16 boons, 11 conditions, 7 traits) |

## 4. What the baseline says we should do (proposal, not done)

1. **Keep the GW2 shape, the ESO count.** Three kinds with one rule each (boons: Lesser / itself / Greater; conditions: stack up or stack long; control: refresh + break), and a named list in the 12-to-15 range per kind, not 60. Every one of ours already sorts into a GW2 group, which is a good sign the engine is right.
2. **Boons we have and should keep (8 + consumables):** Hackles Up (our Might), Zoomies (Quickness + Swiftness in one), Thick Coat (Protection), Sharp Nose (Fury), Second Wind (Regeneration), Rally Howl (damage + speed), Feast Frenzy (loot: ours, no analogue), Windy (weather). **Missing and worth adding:** a Stability-like one for the dingo ("Planted": can't be shoved or spooked, for Bramble and the boss), a Resist one (ride conditions out), a Lucky one for loot ("Nose for It") so luck isn't only brews.
3. **Conditions: 11 is the right count already.** Dingo: Weakened, Sluggish, Dazzled, Muddy Paws, Spooked, Dazed. Creature: Burrs, Scorched, Frostbit, Stunned, Shocked. Maybe one more DoT with a twist later (GW2's Torment "more if it's still", for the ranged weapons' kiting), and Poison for the bone caves. Not now.
4. **Control: two rules we don't have yet.** A break for the dingo (the Shake: ends a hard control, short immunity, a dog thing) and a break bar for bosses (GW2 defiance: hard control doesn't land on a boss, it fills a bar; full bar = stagger window). Both are "trial" tools.
5. **Cleanse: numbers from GW2, rarity from ESO.** Lesser cleanse potion removes 2, Greater removes all; Second Wind removes 1 when it lands; a companion heal removes 1. Trial debuffs are exempt by kind.
6. **Tiering the 16 boons** is the balance talk. First guess, to argue with: Brew I Lesser, II itself, III Greater; treats Lesser; Hackles stacks up (it's our Might, exempt from tiers); Zoomies/Rally/Feast "itself"; Greater only from Brew III, set bonuses and the companion.
7. **Armor-related statuses:** ESO has nine of them because ESO has armor stats. We have one stat (armor as "damage taken") and three statuses that touch it (Thick Coat, Armored, Shocked). That's enough; gear should change the base stat, not add statuses.

## Sources
- GW2 wiki: [Boon](https://wiki.guildwars2.com/wiki/Boon), [Condition](https://wiki.guildwars2.com/wiki/Condition), [Control effect](https://wiki.guildwars2.com/wiki/Control_effect)
- ESO: [ESO Decoded buff list (61)](https://esodecoded.com/buffs), [ESO Hub status effects](https://eso-hub.com/en/status-effects), [ESO Academy crowd control](https://esoacademy.com/crowd-control-cc/), [ESO forums full list](https://forums.elderscrollsonline.com/en/discussion/284053/buffs-and-debuffs-a-full-list)
