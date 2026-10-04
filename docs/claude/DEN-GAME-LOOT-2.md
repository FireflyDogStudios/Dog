# Den Game — Phase 7 v2: Loot from the Wild (our "Loot 2.0")

Design doc. Written Oct 2, 2026 by Firefly with GrumpyDingo (and ideas from Other Claude). **Status: draft for GrumpyDingo's review (updated Oct 2 with sets, Wardrobe, caves, Cartography; caves decided). Nothing built yet.**
Replaces the weapon parts of Phase 7 in DEN-GAME-ROADMAP.md. The rest of Phase 7 (zone downscaling, gods never scaled, guaranteed tomes, recommended trial level) still stands.

---

## The problem
- **Oatmeal.** Every roll picks from all 13 Smithy types and all their parts, in any zone. The zone only nudges the material (65% of the time). Billions of combos, and they all feel the same.
- **Disposable.** Coins → mass rolls → forge. Bag holds 300. Nothing lives long enough to become *yours*.
- **Runaway balance.** The meat → coins → rolls → forge loop is what the sims showed running away at 45–60 min.

## Decisions (GrumpyDingo, Oct 2)
1. **Rolling is shuttered.** The Roll button is hidden and marked deprecated, code kept, for later evaluation. Weapons come from the wild.
2. **Zones lock the style.** Each zone has its own look so a weapon tells you where it came from.
3. **Creatures drop the weapons that counter them.** The markings that say what a creature is weak to also say what it drops.
4. **Gems:** a gem sitting in a pet that can take it doesn't show up as an option for weapons. One gem, one home.
5. **Drop moments and weapon cards should hit like Diablo:** "wow, holy cow."
6. **We do our own Loot 2.0 before release.** Fewer drops, better drops.

---

## 0. Vibe (GrumpyDingo, Oct 2)
- **Weapons feel like Elder Scrolls Online.** Presentation (drops, beams, cards) looks like **PoE and Diablo**.
- **One material per area.** The Meadow is oak, the Forest is mossjade, caves are bone. Each area drops only a few types.
- **No life bars yet.** ESO-style dungeon battles with health for the dingo and companions are wanted later, not now (parked as "Den Dungeons").

## 1. Zone arsenals (style lock)
Each area gets: **one material**, **3–4 weapon types**, a palette, an infusion lean, a **zone mark** on the card, and **one weapon set**. Creatures pick the type within the area (leaning toward their counter).

| Area | Feel | Types (draft) | Material | Infusion lean |
|---|---|---|---|---|
| 🌼 Meadow | backyard play | Stick, Ball, Tug Rope, Shovel | Oak | Bloom, Ember |
| 🌲 Whispering Forest | woodland hunter | Bow, Polearm, Staff, Slingshot | Mossjade | Bloom, Shadow |
| 🌙 Moonlit Peaks | starlight and frost | Sword, Disc, Claws, Dagger | Moonsilver | Moon, Frost, Storm |
| 🦴 Caves (any zone) | old bones underground | Bone Club, Claws, Dagger | Bone | Shadow |

- A type can appear in two zones only if its parts and materials differ (a Forest staff is gnarled heartwood; a Peaks staff is a crystal moon wand).
- **Later zones get better shapes of the same idea** (Stick → Branch → Heartwood), Diablo 2 style.
- **Gods unlock more entries** in their zone's pool (Terraria style, already approved), plus one signature relic each.
- Weapons you already own keep their look (Article 10).

## 1b. Weapon sets (ESO) + collected looks (GW2 Wardrobe)
- **Each area has one set** (caves can have their own). We equip 5 weapons, which matches ESO's 2 / 3 / 5-piece bonuses. Example: *Mossjade Warden* 2 pc: +15% vs Armored · 3 pc: +10% speed · 5 pc: vines root creatures in place.
- **Not everything is a set.** Set pieces are a small share of drops (uncommon and up only; exact rate tuned in sims).
- **Every piece of a set looks the same, by code.** A set fixes the parts, fittings, wrap and gem for each of its types. It also gets a **set-only trim** (a fitting colour and a small sigil) that normal loot can never roll. Same area material, so it belongs; reserved trim and sigil, so it stands out.
- Set pieces have their own lane on the card (green-named like Diablo 2 set items) and show "Mossjade Warden (2/5)".
- **Wardrobe:** every look you find is collected forever, even after salvaging the weapon. Sets and relics get a sticker-book page.

## 1c. Caves and the Cartography tab
- Each map hides a **fixed number of caves** found by walking (distance hunted in that map). Discovery has gentle pity, so a long walk always pays off.
- On discovery the dingo stops walking and keeps fighting in place. A banner with a **60-second** ring asks "Enter the cave?" Creatures keep coming.
- **A found cave is kept forever** in the new **Cartography** tab, which lists every area found on each map and holds all travel (zap back any time). Saying no, or being away, never loses it (Article 6). Away-time discoveries show in the while-you-were-away haul.
- Travel moves out of its current spot into Cartography.

## 2. Creatures drop their counters
Creatures already carry markings (Armored, Flying, Quick, Shielded, Swarm…), and weapon classes already say what they beat. We tie the drop to it:

| Creature marking | Drops lean toward | Why |
|---|---|---|
| 🛡️ Armored | 🔨 Blunt / ⛏️ Breaker | smashes armor |
| 🔰 Shielded | ⛏️ Breaker | shreds shields |
| 🪽 Flying, 💨 Quick | 🏹 Ranged | never misses, hits flyers harder |
| 🐜 Swarm | 🔱 Piercing / 🪃 Returning | hits several |
| others | the zone's normal pool | |

- About half of a creature's drops lean toward its counter. The rest come from the zone pool.
- Flavor: the drop is made *from* the creature where it fits (a Tusk Boar drops a tusk-headed club). "The Moon Owl drops claws" becomes a reason to hunt something.
- It teaches the game without a menu: you meet a flyer, it drops a bow, the next flyers go easier.
- **Smithy types need weapon classes** (today class comes from the old emoji icon). Draft: Sword/Dagger/Claws = Blade; Stick/Bone Club = Blunt; Bow/Slingshot = Ranged; Ball/Disc = Returning; Polearm = Piercing (pick head = Breaker); Shovel = Scoop. **Open:** Staff and Tug Rope.
- Each zone's type list must cover the counters for its own creatures (checked at build time).

## 3. Rarity means affixes
Rarity is how many affixes a weapon rolls, not a multiplier you forge up. The existing weapon traits are the affix pool, and **the look matches the affix**: Blazing ↔ Ember infusion, Frostbite ↔ Frost, Shocking ↔ Storm, etc. What you see is what it does.

| Rarity | Affixes | Notes |
|---|---|---|
| Common | 0 | plain, zone look only |
| Uncommon | 1 | |
| Rare | 2 | generated name from what it rolled |
| Epic | 3 | |
| Legendary | 3 + a power | powers change behavior (Starfall, Moon Howl, Great Feast, more to come) |
| **Relic** | hand-made | fixed name, fixed look, flavor line, own power, own sockets |

- **Junk no longer drops.** Old junk in saves stays until salvaged.
- Godly / Mythic / Godforged become the god-relic tier. Existing ones map over untouched.
- **Relics:** a few per zone, dropped by specific creatures or elites, so the first one shows up in the first hour (Article 5). One signature relic per god. A **Relic collection page** with silhouettes to fill in.

## 4. Fewer drops, better drops
- Weapons come from kills at a steady, low rate (tuned with the sim harness).
- **Below-tier drops are quietly salvaged into scraps.** No loot filter needed, no 300-slot bag of junk.
- **Pity:** no rare in X kills → the odds climb until one lands (Article 1).
- **While you were away:** an idle haul screen shows what dropped, with the beams replayed for anything good.

## 5. Drop moments and cards ("holy cow")
- **Loot drops on the ground** (GrumpyDingo, Oct 2): the weapon pops out of the creature, lands, and **bobs and hovers** (Minecraft style) with a **light beam in its rarity colour** and a sound sting per tier (relics get their own). The dingo walks over it to pick it up.
  - Idle-safe: anything not picked up is **magneted in automatically after a few seconds**. Loot on the ground is never lost (Article 6).
  - **Boss loot piles:** a boss can burst into a whole pile of items, each with its own beam, that the dingo hoovers up.
  - Rare+ items sit in a little chest on the ground (GW2 style): wooden for Rare, fancier for Epic and up.
- **The card (Diablo tooltip meets Balatro foil):**
  - rarity frame and animated holo foil (epic and up), gentle tilt on hover or touch
  - big name plate in rarity colour, base line ("Moonsilver Crescent Sword · Blade")
  - "Dropped by Night Hawk · Moonlit Peaks · Oct 3" plus the zone mark
  - affix lines with icons, gem sockets shown
  - relics: own frame, flavor line, "NEW" stamp into the collection
- Calm mode and reduced motion get the still version.

## 6. Gems in weapons
- Sockets by rarity: Uncommon 0–1, Rare 1, Epic 1, Legendary 2, Relics fixed.
- Socketing **paints the gem into the weapon art** (the Smithy already draws Ruby, Sapphire, Emerald, Amber, Moonstone).
- **One gem, one home:** a gem in a pet that can take it isn't offered to weapons. Moving it is a deliberate choice.
- Unsocketing is free and safe. Salvaging a weapon returns its gems to the bag. Gems are never destroyed.
- Cracked gems may go in; the crack shows on the art and the flaw comes with it.

## 7. The Smithy's new job
**The merge forge is retired in Step 2** (hidden like the Roll button; existing forged weapons stay). Its replacement is affixes plus gems and sockets. The Smithy becomes the tinkering bench: scraps and coins buy one reroll of one affix, or lock an affix. Small, deliberate tweaks to a drop you love. This gives coins a home now that rolls are gone.

## 8. Save safety
- Every existing weapon keeps its stats, look and rarity. New fields go through `norm()` with safe defaults.
- Rolling code stays (hidden), so nothing that references it breaks.

---

## Build order (one publish per step, sim run after each)
1. **Drops from kills:** zone pools, counter drops, roll button hidden, salvage, pity, weapon classes for Smithy types. Sim.
2. **Rarity = affixes:** affix ↔ look link, junk gone, generated names, **merge forge retired** (hidden). Sim. *(GrumpyDingo's fresh start can begin here.)*
3. **Drop moments + cards:** ground loot that bobs with a beam, pickup + auto-magnet, boss loot piles, chests for Rare+, stings, the new card, while-you-were-away haul.
4. **Relics + weapon sets:** first zone relics, one set per area (fixed parts + set-only trim and sigil, 2/3/5-piece bonuses), Wardrobe / collection page.
5. **Smithy bench + gem sockets.**

## Ideas from the GW2 notes (BoonsDebuffsLootThoughts.txt, to confirm)
- **Rank guarantees:** elites always drop Uncommon+, bosses Rare+.
- **Region tokens:** a zone-only drop (Meadow clover, Forest acorn caps, Peaks stardust) traded for that zone's set pieces.
- **Trophies:** stackable creature drops (~20%) like Boar Tusk or Bat Wing, feeding the Bestiary and the Smithy bench.
- **Cave Keys:** a rare key from a zone's creatures that opens its cave early.
- Not taken: GW1's "early kills drop nothing" (against Article 5).
- Boons, conditions and weapon skills moved to their own design doc: **DEN-GAME-COMBAT.md**.

## Open questions
- Staff and Tug Rope: approved as **Tug Rope = yanks creatures toward you**, **Staff = zaps a group** (names for the classes still to pick).
- **Caves decided (Oct 2):** roll out in the **Meadow first**, **Bone style only** for now. Inside: a short run of themed creatures, the cave's own set, and a mini-boss with a shot at a relic (ESO delves). First mini-boss: a **badger king sitting on a pile of bones**. Themed caves per zone come soon after.
- Creatures are emoji placeholders for now. Later they get their own generator, like the Smithy does for weapons.
- Rank decides rarity (PoE): normal creatures drop rarely, elites more and better, megas and gods drop relics from their own tables.
- A cozy name for this whole update.
- First relic ideas from GrumpyDingo.

---

## Build log
### Step 1 shipped: game v0.17 (Oct 2, 2026)
- `ARSENAL[zone]` = materials, infusion lean and `{t, p1?, cls}` type entries. `COUNTER[trait]` = classes a creature leans toward dropping. `dropWeapon(E, quiet)` / `dropFx(E, res)`; drop roll is in `killEnemy` (not megas, titans, chapters; trials included). `dropChance`: 25% for the first 6 drops, then 7%; elites ×3; bosses always (rarity +1 tier).
- `SMITHY.forWeapon` takes `type`, `p1`, `mats` (list of names, always applied) and `infs` (70% lean). Same change in `proto/sm/src/game_api.js`.
- Weapons carry `cls`; `wClass(w)` prefers it over the old icon map. New classes: `yank` (Tugging, Tug Rope) and `zap` (Arcane, Staff) in `wHit`.
- Arsenal: Meadow = Stick, Ball, Tug Rope, Slingshot, Shovel (Oak / Classic / Cream / Bronze). Forest = Bow, Polearm (Maul, Spear), Staff, Claws (Pine / Mossjade). Peaks = Sword, Disc, Bow, Polearm Pick (Ghostwood / Moonsilver / Purple).
- Rolling hidden: Armory roll buttons, auto-roll and odds removed; `huntState()` forces `autoRoll` off. Action handlers kept (deprecated).
- Auto-salvage (`H.autoSalvage`, default on): Common/Uncommon drops weaker than your weakest equipped weapon become meat. Toggle in Settings and the Armory. Pity `PITY` 120 → 60, counted per drop.
- While-you-were-away: up to 8 drops (2% of away kills), shown on the welcome-back card.
- Letters: l-armory rewritten for drops; l-forge triggers at 3 weapons found; trial gift no longer says "rolls". Armory tab icon 🎲 → 🛡️.
- **Publish gotcha:** the HTML from `Artifact read` includes the served wrapper (an outer doctype/body). Strip it before publishing (`publish.html`), or the page nests another wrapper each time.

### Step 1 sim results (3 h casual, 1 h 45 power)
| | v0.15 | v0.17 |
|---|---|---|
| Casual L5 / L6 / L10 | 21m / 54m / 1h49 | **14m50 / 24m / 1h17** |
| Power L5 / L10 | 18m / 47m | 14m / 43m |
| Casual time per creature, first hour | 11–30 s | 7–15 s |
| Casual runaway starts | 1h52 | ~1h30, softer |
| Power runaway | 45→60 min | 45→60 min (still) |

- **Still to fix (next balance work):** the power runaway now comes from **pups and trial rewards** (pups 27 → 73 and DPS 11k → 15M between 45 and 60 min), not weapons. Early creatures still take ~14 s at 15 min. Power bots still lose trial wave 1 repeatedly (the approved "recommended level" fix will handle that).

### v0.18 patch (Oct 2, 2026): feedback from GrumpyDingo's v0.17 test
- **Loot feed** `feed(icon, text, colour)`: small stacked lines in the sky of the hunt scene (top-left), max 5, fade after ~4 s, repeats merge as ×N. `toast()` sends "dropped / coin / raccoon / boss brew" messages to the feed; other toasts are capped at 3.
- **Level up** is a ribbon over the hunt (`.lvlrib`) plus the badge pop, not a blocking card.
- **Repeat wins** (mega, god, trial) show a banner + feed. First victories, first clears and new bests keep the big card.
- **Trial Zoomies:** during trials creatures approach 1.8× faster and spawn 2× as often; Meta power drains at 35% while nothing is in reach. (Proper boons come with the status library in DEN-GAME-COMBAT.md.)
- **Open issue (GrumpyDingo: leave for later):** power-player runaway from pups and trial rewards, 45–60 min.

### v0.19 patch (Oct 2, 2026)
- `fmtMeat` uses short big-number names (`NUM_SUF`: K, M, B, T, Qa, Qi, Sx, Sp, Oc, No, Dc, Ud … Tg, then aa, ab…). `coinsFmt` uses it from 1M.
- `meatShower` now throws **one meat chunk** per kill (bigger for bosses), plus a coin if one dropped. Step 3's ground loot should keep this: one meat item that stands for the whole drop.
- Loot feed sits above the trial / mega bars (z-index 12).
- Zoomies buff: approach 2.6×, spawns 2.6×, Meta idle drain 20%.

### v0.20 patch (Oct 2, 2026)
- Meta trials: power comes from **kills** (+12, wardens/elders +30), with a 3 s hold after each kill before draining. `trialDamage` is a no-op.
- Firefly Swarm and Meat Meteors world events removed from the picker and forecast (code kept).
- GrumpyDingo's save cleared on request (backup kept in the session scratchpad `savebackup/`).

### Rules from GrumpyDingo for later steps
- **Auto-salvage must never touch set pieces** (players may happily wear a low-tier set piece), relics, locked or socketed weapons. Be careful removing or salvaging anyone's items.
- **Model weapon sets on ESO** when we get to Step 4.

### Step 2 shipped: game v0.21 (Oct 2, 2026)
- `AFFIX` (traits → prefix, suffix, Smithy infusion), `AFFIX_N` (common 0, uncommon 1, rare 2, epic 3, legendary 3 + `sig`), `DROP_W` + `rollDrop()` (no junk; pity 60 for epic+), `rollAffixes(n, zoneLean)`, `affixName(w, base)`. New weapons carry `ax: 2`; `ensureTraits` leaves them alone. Look = first elemental affix (Blazing→Ember, Frostbitten→Frost, Crackling→Storm, Clover→Bloom, Keen→Moon, Merciless→Shadow). `SMITHY.forWeapon` takes `inf`; new `SMITHY.baseOf(code)`.
- Names: `[Sig title] [prefix of affix 1] [base] [suffix of affix 2]`, legendaries drop the suffix.
- Merge forge hidden (`hunt-forge` unlock → false). Bag full → the weakest unlocked, unequipped Common/Uncommon (never set, relic or socketed) becomes meat.
- Trial Wardens drop via `dropWeapon(E, false, rarity)`.
- Same release, feedback fixes: report button "Copy report for the Dev Team"; `state.lettersSent` (id → time) so deleting mail never re-sends letters (help letters use it too); auto-equip off by default; Self Care off by default with a "Self Care (WIP)" setting; no falling leaves in fall; Windy weighted ×3; Creepster font removed from banners.

### Working rule (GrumpyDingo, Oct 2)
- **No long simulations for now.** Debug, patch, add and fix first; talk before any power-curve work. Short smoke tests only.
- Inventory gets its own design doc: **DEN-GAME-INVENTORY.md**.

### v0.22 patch (Oct 2, 2026)
- `isUnlocked("selfcare")` checks `state.selfCareOn` first, so dev mode and old sticky unlocks no longer show the tab.
- Fall look for the Meadow: `applyTod` toggles `.hero.season-fall` (Sep–Nov, home only). Warm sky gradients per time of day and an autumn gradient (`#fallgrad`) on the tree line.

### v0.23 patch (Oct 2, 2026)
- `.trees` z-index 1 so the far parallax mountains (`.plx-far`, z 0) sit behind them.
- `.sos-card` max-height + scroll, `.sos-ov` safe-centers and scrolls, so Settings never runs off screen.
- Meadow `MONSTERS`: 👾 Space Invader → 🦬 Wild Bison (armored), same slot.
- Season looks for the Meadow: `.hero.season-{spring,summer,fall,winter}` with sky gradients and tree gradients (`#springgrad`, `#summergrad`, `#wintergrad`, `#fallgrad`).

### v0.24 patch (Oct 2, 2026)
- Rain/storm: sparse individual `.drop`s (24/34) with a soft tint instead of two full-screen striped layers (GrumpyDingo found them nauseating).
- `.plx-far` lowered (bottom 22px, height 84px) so mountain bases hide behind the tree line in every zone. Parallax refs: far layers lighter, lower contrast, slowest (SLYNYRD Pixelblog 23).

### Step 3 shipped: game v0.26 (Oct 2, 2026)
- Ground loot: `spawnLoot({x, y, html, tier, col, chest, meat, big, dx, onPick})`, `glTick` (items slide left while the dingo walks, i.e. the hero isn't `.halt`), `glCollect` / `glFinish` (pickup sting per tier `GL_STING`, chests open first), `glFly` (meat/coin flies to the counter), `lootPile(x, y, items, col)`. Max 24 on the ground; meat auto-collects after 2.5 s, everything else after 6 s. Calm mode / at home → instant pickup.
- **Rewards are credited at drop time**; the ground item is visual only, so a reload never loses loot.
- `meatShower` = one meat chunk (+ coin) on the ground. `dropFx` puts weapons on the ground; Rare+ in a chest (`glChest`: wooden / iron / gold) with a rarity beam (46 / 70 / 100 px). Feed line on pickup.
- Repeat mega/god wins drop a loot pile of their rewards.
- Item card: `weaponDetail` rebuilt as `.icard` (dark Diablo-style tooltip, rarity name plate, base + class, dps, affixes in blue, power in orange, "Dropped by · zone · date", animated foil for Epic+). "Send to vault" button removed from the card (vault deprecated pending the Inventory design).
- Not yet: the "while you were away" haul still uses the welcome-back card (it already lists the weapons found).

### v0.27 patch (Oct 2, 2026)
- Pickup feel (magnet / vacuum like Vampire Survivors): items hold briefly so the beam is seen (meat 0.35 s, common 0.55 s, rare 0.9 s, epic 1.1 s, legendary 1.4 s), then accelerate into the dingo (`g.v`, +1600 px/s², max 1400).
- `DISABLED = {upgrades:true}` checked first in `isUnlocked`; l-upgrades letter suppressed. Existing upgrade levels still apply.
- Sound chip hidden from the HUD (`.chip.sound`), sound lives in Settings.
- UI overhaul + disabled list + currency rework: **DEN-GAME-UI.md**.
