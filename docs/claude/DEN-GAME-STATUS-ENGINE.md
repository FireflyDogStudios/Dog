# Den Game — Status & Skill Engine (SE)

Built Oct 3, 2026 by Firefly, agreed with GrumpyDingo: "everything that can be an engine should be; a single source of truth instead of madness." Built **before** the Pixi port so the port has real statuses to show. Source: scratchpad `engine/se.js` (engine), `engine/se_den.js` (the Den's statuses and skills as data), `engine/se_test.js` (48 tests, all passing). Pure logic: no DOM, no game globals, runs in node. In the game it sits above `const SMITHY` as `const SE`, with `registerDen(SE)` and the clock set to `performance.now`.

## What it replaces
Every effect used to be its own code: `E.bleed/E.burn/E.slow/E.stun` on creatures, `B.mdebuff` for mega debuffs, `H.buffs`, `state.boosts.active` for brews, `H.treatOn` for treats, `SK.howlUntil/feastUntil` for skills, and ~17 multiplier sources chained by hand inside `dmgMult / spdMult / lootMult / luckMult / coinChanceMult`. Items say they do things and nothing shows it; creatures debuff the dingo through one special case.

## The model
- **Status definition** (`SE.define`): `{id, name, icon, cls:boon|cond, stack:refresh|extend|stacks|unique, max, dur, mods:[{stat, mul|add, perStack}], tick:{stat:hp|heal, every, perStack}, flags:[noact|flee|flying|phasing|healer], tell, desc}`. Data, not code.
- **Instance** on any target (dingo, creature, pup, later a companion): `{id, stacks, until, per, src, data, mods}`. Plain data, so it saves and loads. Instance `mods` override the def's (a brew's tier, an elite's armor).
- **One stat function:** `SE.mult(target, stat)` for `dmg spd loot luck coin move heal` = product of every active status mod (per-stack where the def says) × every registered **passive**. Chance stats (`crit dodge armor`) are additive: `SE.sum(target, stat)` is the chance. `SE.explain(target, stat)` lists every source, for a tooltip.
- **Passives** (`SE.passive(name, fn)`): things that aren't statuses but change stats: gems, scrolls, tomes, time of day, season, companions. `fn(target, stat, ctx)` returns a multiplier or `{mul, add}`. They register once; `dmgMult()` is `SE.mult(DINGO, "dmg")`.
- **Time:** `SE.tick(target, dt, ctx)` expires instances and fires DoTs through `ctx.damage/heal`, returning events for cues.
- **Skills** (`SE.defineSkill`): `{id, name, icon, lvl, cd, auto, steps:[status|hit|call], shout}`. `SE.cast(id, ctx)`, `SE.ready`, `SE.cooldown`, `SE.autoCast(bar, ctx)` (policy is data: bar order + `auto` flag). Later, weapon types supply the skills.
- **Tells:** each status names the dingo's reaction (`hackles`, `ears-back`, `head-low`, `paw-shake`, `howl`); the hero animation reads that, not the status bar.

## The Den's data so far (se_den.js)
- Dingo boons: Hackles Up (stacks ×5), Zoomies, Thick Coat, Sharp Nose, Second Wind, Rally Howl, Feast Frenzy, Windy; brews (`brew-str/swift/luck/treasure`) and treats (`treat-kibble/broth/apple/jerky`) as statuses.
- Dingo conditions: Weakened, Sluggish, Dazzled (the mega debuffs), Muddy Paws (stacks ×3), Spooked (flee), Dazed (noact).
- Creature conditions: Burrs (bleed, stacks ×5, ticks every ½ s like the old bleed), Scorched (every ½ s), Frostbit, Stunned, Shocked.
- Creature boons from traits: Armored, Shielded, Flying, Quick, Healer, Phasing, Enraged.
- Skills: Pounce, Zoomies Whirl, Rally Howl, Shadow Pack, Feast Frenzy (same numbers as today).

## Wiring log
- **v0.45 (Oct 3): steps 1 + 2 shipped.** `SE` is in the game. `applyArchetype` applies trait statuses (display + flags; `armored` and `quick` mods are emptied until step 3 moves `E.armor`/`E.dodge` into `SE.mult`). `wHit` applies Burrs / Stunned / Scorched / Frostbit through `SE.apply` (blade, blunt, stone, Blazing, Frost; the Embers scroll and Tempest companion too). The frame loop uses `SE.flag(E,"noact")` for stun, `SE.mult(E,"move")` for Frostbit, toggles the `chilled` class from `SE.has`, and `SE.tick` runs the DoTs with sparks. The target frame builds its chips from `SE.active(E)`; `stOf` falls back to `SE.DEFS` for ids the old `STATUS` table lacks. `E.bleed/burn/slow/stun` are gone.
  - **Behaviour check:** fixed-seed 60 s runs give the same kills at all five screen sizes; across three seeds over 180 s the engine version wins one, loses one, matches one. Divergence is chaos (one creature living a frame longer changes what it summons), not a stat change.
  - **Found while testing (pre-existing balance bug, both versions):** a Toadstool Stalker that gets to summon two Sporelings (all Healers at 3 %/s each) out-heals early DPS forever. Added to the master list.
- Same publish: **Meadow Trials reopened** (`SHELVED.trials = false`, Events window back, `trialSection` lists only unshelved zones). `DISABLED.events` became `DISABLED.seasonal`, which only gates seasonal bait names.

- **v0.46 (Oct 3): step 3, first half.** The dingo is a target (`DINGO`, whose `st` lives in `huntState().st`, so statuses persist through save and cloud). Brews (`brew-*`, defs generated from `POT_TYPES`, tier and strength on the instance via `data` + `mods`), treats (`treat-*` from `TREATS`), Sharp Nose (`BUFF_ST`), the mega debuffs (`MD_ST` → Weakened/Sluggish/Dazzled) and Rally/Feast are all `SE.apply` on the dingo. The player status bar is built from `SE.active(DINGO)`; `SE.tick(DINGO, dt)` runs in the battle frame. `migrateBoosts()` (flag `H.stMig`) carries running brews, treats and buffs from old saves over once. `state.boosts.active` and `H.treatOn` are gone.
- **v0.47 (Oct 3): step 3, second half.** Every multiplier is one engine call: `dmgMult/spdMult/luckMult/coinChanceMult/lootMult` are `SE.mult(DINGO, stat)` and `critChance(w)` is `SE.sum(DINGO, "crit", {w})`. Non-status sources registered as passives on the dingo: `dev`, `cozy`, `gems`, `companions`, `scrolls`, `tomes` (`TOME_STAT`), `upgrades` (`UPG_STAT`, event upgrades), `season`, `time of day` (`TOD_STAT`), `day of week` (`DAY_STAT`), `weather`, `lungs`, `sleepy`, `rest`, `pack`, `weapon` (base crit .1 + Keen). Status terms (`treatActive / potVal / megaDebuff / skillMult / buffOn`) left the chains — their statuses carry the mods. Crit treats carry an `add` (`treatMods`); Meat Magnet's stat is `loot` (was a dead `meat` stat); `H.stMig2` fixes persisted instance mods once. Creatures: `E.armor`/`E.dodge` are gone — Armored (.5) and Quick (dodge .2) are def mods, Ironhide and Swift elites apply the same statuses with instance mods (.65 / .3), `wHit` reads `SE.sum(E, "armor"/"dodge")`, so Shocked (−.25 armor) now lands. Quick's move speed still rides `E.speed` until creatures move through the engine.
  - **Behaviour check:** 6 kills at all five sizes; the 180 s seed-12345 trace is identical to v0.46 kill for kill; `t38`, `t42` clean; in-game `explain` shows exactly the old sources (e.g. loot = Fall ×1.1 × Friday ×1.5).

- **v0.48 (Oct 3): step 4, skills.** `SE.SKILLS` (from `registerDen`) is the skill data; the game keeps `SKILL_BAR` (order), `SKILL_WORDS` (emoji + text, merged onto the defs) and `SKILL_FX` (animation, rings, sounds, toasts, keyed by id). `castSkill(id)` = `SE.cast(id, skillCtx())` + fx; `skillCtx()` supplies level, `DINGO`, the front creature and everything within 260 px, `cdMult` (Echoes tome .75), `hit` (keeps Pounce's 300 ms leap and Whirl's staggered hits), `call("ghosts")` (Shadow Pack). Auto-cast is `SE.autoCast(SKILL_BAR, ctx)` once a second: policy is bar order + each skill's `auto` flag. The bar reads `SE.cooldown`. `SK.cd/howlUntil/feastUntil` are gone. Engine additions: `needs:"target"|"targets"` on a skill (cast refuses, no cooldown burnt); `ctx.cdMult` multiplies the cooldown. 26 engine tests.
  - **Behaviour check:** 6 kills at five sizes, seed-12345 trace identical, all five skills cast with the old numbers.

- **v0.49 (Oct 3): step 5, tells (engine side).** `syncTells(el, target, prefix, byTell)` turns a target's active statuses into classes on its drawing, only touching the DOM when the set changes. Creatures get `st-<id>` (`st-frostbit` took over the old `chilled` rule); the dingo gets `tell-<tell>` from each status's `tell` (hackles, ears-up, fluff, howl, head-low, shake, paw-shake, ears-back). The old hero draws none of them; the new hero's rig (Workbench) gets CSS for each tell when he's ported. Trace identical.

## Wiring plan (remaining)
3. **Done (v0.46–0.47).** Leftovers: `megaDebuff("blind")` miss roll (Dazzled's dodge mod could carry it), `SK.howlUntil/feastUntil` still set for the old visuals, creature speed from Quick/Swift/Frenzied still on `E.speed`, `potVal/treatActive/buffOn` kept only for UI text.
4. **Done (v0.48).** Cooldowns live in the engine's `CD` map (not saved, as before).
5. **Done (v0.49), engine side.** The drawings catch up at the hero/creature port: CSS per `tell-*` on the new rig, per `st-*` on creatures.
6. Then weapons supply skills (COMBAT doc), and the Pixi scene draws from `SE.active()`.

## Buff tiers: Lesser and Greater (decided Oct 3, not wired yet)
GrumpyDingo's call: the ESO-style idea stays, the words are **Lesser** and **Greater** because a mechanic has to be understandable the moment you read it (Growl/Howl was cuter and lost that). The rule, for every stat:
- Every buff to a stat is one of three sizes: Lesser Zoomies, Zoomies, Greater Zoomies. The sizes are defined once for the whole game, not per source.
- Two of the same size never add (best one counts). The three sizes do: Lesser × itself × Greater is the ceiling for a stat.
- **One table says what the tiers mean** (GrumpyDingo, Oct 3: "one code that says this is what lesser and greater means"; and "that implies a baseline: Lesser Zoomies, Zoomies, Greater Zoomies"). Three tiers: `SE.TIERS = {lesser:{mul:1.10}, base:{mul:1.20}, greater:{mul:1.35}}` (placeholder numbers until the balance talk), with an optional per-stat override (`TIERS.greater.dmg = 1.3`). A status mod just names its tier: `{stat:"spd", tier:"greater"}` is a Greater Zoomies; no numbers on the status. The tier wraps the thing: a stat can carry at most one Lesser, one of the thing itself and one Greater (three stacks), and a second source of the same tier changes nothing. `SE.mult` folds the best of each tier (`tiered()`); untiered mods keep multiplying as before, so nothing moved yet. `explain()` lists every tiered source and marks the ones that count. Engine + 6 tests in; the game's statuses are still untiered until the talk below.
- Chip text reads "Greater Strength · 12 s" so the player sees the tier. Tooltip explains the rule in one line.
- Which sources are Lesser and which Greater is a balance talk (brews, treats, Rally Howl, Zoomies, Thick Coat…) before wiring, since it changes the numbers; the kill checks will move and that's expected.

## Conditions: stack up or stack long (GW2 shape, decided and shipped Oct 3, v0.53)
GrumpyDingo: "can we add all of that?" Every condition says once which of two shapes it has, and `SE.rule(def)` turns that into the last line of its tooltip.
- **Stacks up** (`stack:"stacks"`): every application is its own stack with its own timer and its own strength (`s.q = [{u, per}]`); the oldest falls off first; a DoT ticks the sum of its live stacks. Burrs (max 5), Scorched (max 5, was refresh), Shocked (max 10, −3% armor a stack: the Vulnerability one; lightning from storms / Storms tome / Tempest applies it), Muddy Paws on the dingo (max 3).
- **Stacks long, not stronger** (`stack:"extend"`, `maxDur` cap): Frostbit (3 s a hit, cap 6), Weakened / Sluggish / Dazzled (7, cap 14), Spooked (4, cap 8).
- **Refresh** stays for control: Stunned, Dazed (a chain of blunt hits must not freeze a creature forever).
- `SE.cleanse(target, n, cls)` removes the n newest conditions (potions, Second Wind later). A boon with flag `resist` makes new conditions bounce off (nothing has it yet).
- Save/load carries the per-stack timers. Kill check: still 6 at five sizes, seed trace identical (the baseline run has no blades, blazing or storms, so nothing changed for it; the engine tests cover the new paths, 48 passing).
- Tooltip order, every status: what it does, how it stacks, how long. Permanent traits end "Part of what it is."

## Rules
- A new effect is a `define()` line, never new code in the fight loop.
- Nothing reads a status field directly; always `SE.has / stacks / flag / mult`.
- Stats are only ever combined by `SE.mult` / `SE.sum`. If a number isn't in `explain()`, it doesn't exist. A new bonus source is one `SE.passive` line; a new effect is one `define()`.
- **Mechanics must read plainly.** Names of rules and tiers are the plain words a player would guess (Lesser/Greater), flavour goes in descriptions and the dingo's voice, never in the rule itself.
- Behaviour-preserving steps are checked with the fixed-seed runs (`sim/t40.js`, `sim/t45b.js`) before and after.
