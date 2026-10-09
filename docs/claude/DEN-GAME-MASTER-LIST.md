# Den Game — Master List

The one to-do list for the whole game. Written Oct 2, 2026 (game v0.44) by Firefly, reconciling every older list (ROADMAP, UI, LOOT-2, COMBAT, INVENTORY, SCREEN, SKY-LIGHT, DEV-NOTES, FORK-PLAN) and the v0.44 audit. Updated Oct 3 with the genre shift and the art pass. **New to-dos go here.** The other docs keep the design detail and history.

Legend: ⭐ ready to build · 💬 needs a talk with GrumpyDingo first · 🧹 cleanup · 🅿️ parked on purpose · ✅ done

---

## Standing rules (apply to everything)
- **Libraries first.** Look for an existing library (GitHub and npm) before building anything from scratch. Credit it in Settings → Credits (`CREDITS`).
- **No long sims.** Debug and patch first, and talk before any power-curve work.
- **Desktop game,** and half-width windows must work. Gameplay never reads the screen (Den Stage).
- **Meadow only.** Other areas (and their Trials) stay shelved (`SHELVED`); Meadow Trials are open.
- **Auto-salvage never touches** sets, relics, locked or socketed items.
- **Original only.** Learn from GW2, ESO, Diablo, PoE and the rest, but never copy names or assets.
- **Mechanics must read plainly.** A rule's words are the plain ones a player would guess (Lesser / Greater buffs, not Growl / Howl); flavour lives in descriptions and the dingo's voice.
- **No pop-up boxes for things the world already shows.** Status icons, `fieldCue`, the loot feed, sky banners, Mail.
- **Effects** go through Proton presets (`PFX_PRE` + `pfx()`).
- **DEVLOG** gets a new block on every publish.
- **A game about a dingo, built by therians, with dog values.** Creatures are what the dingo thinks he's seeing. Dog senses are the tells. (DEN-GAME-CREATURES.md)

---

## 0. The genre shift (Oct 2–3) 💬 → the spine of everything below
From goofy idle mechanics to sane MMORPG-style mechanics. Research other games (Skyrim, ESO, GW2, Diablo, PoE) for each system before building. Order, each unlocking the next:
1. ✅ **Hero.** New dingo approved (Den Dingo Workbench): real Carolina Dog proportions, flat two-tone, green collar, same leg rig. **Not yet in the game.**
2. **Creature roster** (superseded Oct 7 by `docs/DEN-BESTIARY.md`; the Meadow creatures are probably being deprecated) (mostly done on the Workbench; 9 approved, 3 slots open: shielded, summoner, boss). **Not yet in the game.** Next: the dog-senses tell on the hero (ears, hackles, scent wisp), then port.
3. ✅ **Status + skill engine** (v0.45–0.48: creatures, dingo, every multiplier, skills; DEN-GAME-STATUS-ENGINE.md). Left: step 5 tells, step 6 weapons supply skills.
4. **Weapons get behaviour.** Ranged weapons rise and fire, melee swings arcs, staffs channel, tug ropes yank. Each type = an attack script + a Proton preset. Weapons stop just orbiting and lashing.
5. **Pets → one companion.** One out at a time, its abilities on the bar. Acquired by taming or rescuing in the world, not baskets. Gems come from creatures and cave ore, cut at the Smithy; the clicky Mine retires.
6. **Potions and consumables.** Few, meaningful, cooldowns, visible effects. Brewed at Alchemy from gathered ingredients.
7. **Audio.** howler.js (MIT) for sprites, panning, fades, a mixer with buses. Thunder rarer, lower, longer. Replace the "bling bloink" sound set with a consistent CC0 palette (wood, cloth, paws, wind). Research pass needed.
8. **World.** Parallax rebuild to fit the new art (painted scrolling layers, tinted by the lighting pass). Bug: the sun moves on zoom (it's in the hero; move it to a fixed sky layer).
9. **Pixi or not** 💬: if creatures become rigged drawings, one WebGL scene (Pixi) buys lighting, shaders and performance, but it's a renderer rewrite. Decide before the creature port.

## 1. Art pass 🎨
- ✅ Den Dingo Workbench (hero + 9 creatures, attachment check, mirrored gait). Open: shielded, summoner, boss (the old oak at the edge, when the wind gets in it); hero senses states.
- ✅ **Den Stillroom** (https://claude.ai/artifact/T5Y5iGAeRTPMQEfFhJJs4M): brews, gems, foods, materials in the Smithy's style. **In the pocket for now;** port when the Alchemy / currency rework lands.
- The `den-creature-design` skill holds the must-rules.

## 2. Now: finish what's half-done ⭐
1. **Library window cleanup.** Alembic and Apothecary move out into **Alchemy** on the Den bar. Library keeps Tomes, Scrolls, Compendiums, Research, Bestiary.
2. **Alchemy window, crafting v1.** Bait crafting moves here; brews live here. (Stillroom art slots in here.)
3. **Hunt window → Cartography / Map.** Area info, time of day, hunt history; retire the old stat cards.
4. **Mine window** restyle to Field Kit (or retire per §0.5).
5. **Pack window** restyle, old stat cards gone.
6. **Inventory leftovers:** gems, tomes, scrolls in bags; split stacks; 250 cap; bags as loot; Deposit materials.
7. **Notifications pass:** inventory chatter → feed or silent; skill shouts → fieldCue.
8. **Proton pass 2:** per-weapon-type effects (ties to §0.4), status particles, seasonal petals and leaves.
9. **Credits:** Twemoji CC BY 4.0 line.

## 3. Next: the big systems 💬
- **Dingo armor (GrumpyDingo, Oct 3).** Same forge, same materials as weapons, one piece at a time, create first and balance after. Slots agreed in thought: collar (over the drawn one), tail rings, tail guard, front paw covers, back paw covers, bracelets (front legs), head piece (ears stay free), chest piece, body cover. Set pieces with 2/4/6 bonuses later. **Collars first: Den Collar Bench done** (https://claude.ai/artifact/YM5BQsk83Kwd1S6pGG3EcL; `engine/gear.js`, `RIG.attach`). Next: tail rings. Not in the game yet (no stats, levels or slots).
- **Levels on weapons and armor** (GW2 / ESO style: a piece has a level, level 1, level 5…; what you can wear and what drops is gated by it). Not designed yet.
- **Damage runaway:** drops can be wildly stronger than the last weapon, back to back; the game runs away. Levels are part of the answer; the rest is the balance pass (§14). Notes only for now.
- **The dingo takes damage** is where combat is heading (armor is why). Held until GrumpyDingo picks it up.
10. **Currency rework.** Meat retired as money (becomes food); Coins main; salvage gives materials (Stillroom materials) and essences; Wallet already in the Inventory.
11. **Loot 2.0 step 4: relics + weapon sets (ESO model).** One set per area, 2/3/5-piece bonuses, Wardrobe.
12. **Loot 2.0 step 5: Smithy bench + gem sockets.** Reroll/lock one affix; sockets paint the gem into the art (Stillroom gems).
13. **Meadow bone caves + Cartography.** Found by walking; badger king mini-boss.
14. **Balance / power curve** (talk first). Pup/trial runaway at 45–60 min; early creatures slow; guaranteed tomes; group the ~17 multipliers. Buff tiers decided Oct 3: **Lesser / Greater** per stat, same tier doesn't stack, different tiers do (DEN-GAME-STATUS-ENGINE.md). Which source is which is the talk to have before wiring.
15. **Long-term progression without resets.** Zone stars + collection rewards, then expeditions.
16. **Town** later; until then the Den bar holds Library, Alchemy, Stash.

## 4. Small fixes and pinned bugs ⭐
17. Scrolls vs Compendiums: a way to copy a scroll + "last copy" warning.
18. `makeWeapon(hp, "titan")` without an icon crashes; add a guard.
19. Den wall hidden while empty; give it a real look with decor.
20. Scene polish: mid-hills parallax layer, static trees/mushrooms should scroll, walk speed by tier.
21. Rename `lungMult`.
22. **The sun moves on zoom** (see §0.8).
23. **Healer stalemate:** a Toadstool Stalker with two Sporelings out-heals early DPS forever (cap healing, or no healing while Burrs'd/Scorched).

## 5. Cleanup: dead code 🧹
Classic UI, old Armory functions and Scrapyard, Vault, rolling and `showRollFx`, merge forge, Upgrades (keep the math), Self Care, sleep hygiene, Halloween (chapters, Pumpkin King, `BAIT_EV`, Hallowstone), Trials (shelved, keep). One careful pass with tests before and after.

## 6. Pop-ups left (v0.44 audit)
First mega win, welcome-back and creature-action toasts: ✅ gone. Welcome letter: keep. Tome found card: only with auto-accept off, keep. Trial end / chapter / roll: unreachable, removed with the cleanup.

## 7. Parked 🅿️
- **Real dog gaits for the hero** (GrumpyDingo, Oct 3, with a reference sheet: walk, amble, pace, trot, canter, gallop/run). Today the rig has one walk cycle (hhip/hshank/hmeta, fsh/ffore/fpast). Idea: a gait is just another set of tracks on the same joints, picked by speed (walk → trot when Zoomies, gallop for Pounce and going home), blended over a stride. Pairs with the IK pass. Notes only; "more movement" is wanted.
- **Icons pass (hand-picked by GrumpyDingo, not critical yet).** Status icons still missing from the game-icons set: wolf-howl, meat, coins, lightning-frequency, paw, spiral. Tome and companion "gear" passive icons in the status bar (ESO set-bonus style; gems/scrolls/upgrades stay silent, `SE.explain` for the tooltip). Generator icons (brews, gems, foods, materials: Stillroom). Option agreed Oct 3: a GitHub/itch icon pack with a clean licence (CC0 / CC BY) is fine if it vibes with the weapon art; candidates to check when we get there: Kenney (CC0), the Flare/OpenGameArt painted item sets (CC BY-SA), game-icons.net (CC BY 3.0, already credited).
Den Dungeons (health bars), themed caves per zone, the creature *generator* (built from approved creatures later), seeded modular pets, dingo gear (Collar), Starter Stick, fetch bonus, region tokens / trophies / Cave Keys, lighting ideas (rim light, wet ground, lanterns), other areas and Trials, bandana picker, meatless mode, renames, seasonal events as their own feature.

## 8. Decided against ❌
Rebirth/prestige; rolling for weapons; auto-equip default; people-things as Meadow creatures (boot, scarecrow, bale, thresher); a parametric generator before hand-drawn approvals.
