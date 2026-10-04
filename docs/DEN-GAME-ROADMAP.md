# Den Game — Roadmap

Started Oct 1, 2026 from the user's wish list. Updated Oct 2, 2026 (game v0.16; Phase 7 replanned as Loot 2.0). Game: https://claude.ai/artifact/APeiXGfpJhnYRfjs7NorsT. See DEN-GAME-FORK-PLAN.md for v1–v2.

**Team:** GrumpyDingo (the user, design) and Firefly (Claude, programming and art). Credits line in the game: "Made with love by GrumpyDingo (design) and Firefly (programming)". Custom art is credited "Art by Firefly".

**Spirit of the game:** cozy vibes, tons of love, email-heavy so players learn one system at a time, little gifts from the dev team along the way. Nothing shoved in the player's face (except the very first welcome letter, on purpose). Wording is always kind: pups are **rescued** (not hatched) and **settle into the Sanctuary**, a happy home where their joy fills the air with spirit (never "released"/sacrificed).

**Standing rule — What's new log:** `DEVLOG` is a list of **version blocks** `{v, d, notes:[...]}`. For every publish, APPEND a new block with the next version, the date, and one short sentence per change. Never edit or remove old blocks. The last block has no trailing comma, so add one before appending. Current: **0.16**.

**Standing rule — art:** push hard on custom-drawn art wherever it beats emoji (GrumpyDingo, Oct 1). Creature emoji are placeholders; creatures will get their own generator later, like the Smithy (Oct 2).

**Layout rule:** each tab's own sub-menu sits in `#subnav`, **below the Head home button** and above the tab's content.

**Code gotchas learned:**
- `layoutTabs` only keeps elements with `aria-labelledby` equal to the LAYOUT id. A LAZY section must return ONE wrapper carrying that id.
- When cutting a top-level function out with Python, end the cut at the next **column-0 line** (`\n[A-Za-z_$(/]`), not the next `\nfunction`.
- **Forms:** any `<form>` must be handled in the document-level `submit` listener (it always `preventDefault()`s). A real browser submit navigates the page away from the Claude bridge and starts a fresh device-only game. Device-backup restore only wins if it has at least as much progress as the cloud save.
- **Restoring a player save:** read `data/users/me/save` with ArtifactData, keep a copy, `set` it back with `if_version` and a `savedAt` slightly in the future so an open game accepts it.

**Workspace (Oct 2):** sim harness source is in **DEN-SIM-HARNESS.md**, Smithy source in **DEN-SMITHY-SOURCE.md**. Restore both into the scratchpad at the start of a new session.

---

## 📌 Pinned bugs (not part of the current upgrade path)
- **Scrolls vs Compendiums:** Research grants each scroll once, so there's no way to get a second copy for crafting a Compendium. Idea: a way to **copy a scroll you already have**, plus a **warning when crafting a Compendium would use your last copy**.
- `makeWeapon(hp, "titan")` without an icon crashes (`W_PREFIX` has no titan entry). Harmless today because titan weapons always pass an icon.

---

## Phases 1–4 ✅ (game v0.3–0.9)
Foundations (settings, What's new, letters, welcome, menus, bandana), early-game unlocks, Library + Tome of Gathering, per-map trials + Meta mode. ⏸️ Meatless mode and renames on hold.

## Phase 5 — Polish ✅ (game v0.10–0.15)
- Meat → coin trade in the Armory; care packages (`l-help-1…5`); Self Care tab; Halloween leftovers + seasonal sky removed; decor hidden; milestone gift letters; form/reload bug + backup guard; reserve default 0.
- **v0.14 Stats & timeline** (Settings → 📈): `state.tele = {play, ev, snap, last}`, saved with the player's cloud save.
  - `play`: seconds while the game is visible.
  - `ev` (max 500): `[playSeconds, type, detail]` for level, unlock, letter, roll, tome, trial/meta end, mega, god, zone change, map ready/overpowered.
  - `snap` (every 60s of play, max 600, older half thinned): `[t, lvl, xp, dps, enemyHp, ttk, kills, meats, coins, bones, weapons, pups, zone, tp, overpower]`.
  - "Copy report for Claude" button exports JSON.
- **v0.15** Team credits (GrumpyDingo + Firefly).

## Phase 6 — Den Smithy ✅ (game v0.16, Oct 2)
- Every weapon is hand-drawn from parts: 13 types (Sword, Dagger, Polearm, Stick, Ball, Disc, Tug Rope, Slingshot, Bone Club, Claws, Staff, Bow, Shovel), with materials, infusions, rarity glow and variants. Each weapon is saved as a 13-character code.
- Old weapons got a matching look with the same name and stats. Forging keeps the look and raises the rarity.
- Full details: **DEN-GAME-SMITHY.md**. Showroom: https://claude.ai/artifact/AX1AckrJ39AdzZ16Vt4XSs

---

## Phase 7 — Loot 2.0 + balance pass (next)
**Full design: DEN-GAME-LOOT-2.md** (Oct 2). Weapons come from the wild instead of rolls: one material and a few types per area, creatures drop their counters, rarity = affixes, ESO-style weapon sets + GW2-style Wardrobe, relics, Diablo/PoE-style drop beams and cards, gem sockets, the Smithy as a tinkering bench, and Meadow bone caves found by walking, listed in a new Cartography tab. The Roll button is hidden and deprecated. GrumpyDingo starts a fresh save after build steps 1–2.

Build order: 1) drops from kills · 2) rarity = affixes · 3) drop moments + cards · 4) relics · 5) Smithy bench + gem sockets · then caves + Cartography. Sim after each step.

### Still approved from the Oct 1 balance list
- **Downscaling to the zone (GW2 style).** Zones other than the Meadow get a level band; above it your damage is capped there, with a small banner. Old zones still pay out (loot at your level, like GW2). **The Meadow keeps scaling with the player.**
- **Gods and megas are never scaled down.**
- **Bosses unlock new things to the drop pool (Terraria style),** plus one signature relic per god.
- **Guaranteed tomes** at about 25, 50 and 75 minutes of play (gift letters), then RNG with quiet pity.
- **Recommended level before a trial starts.**

### Superseded by Loot 2.0
- **Meat price climbs.** Its job was to break the meat → coins → mass-roll loop. With rolling hidden, that loop is gone. Revisit only if the sims still show a runaway.
- **Fixed weapon power at roll time** (was on hold).

### On hold
- Grouping the ~17 damage multipliers into additive buckets, toning down the forge floor, and doubling early damage. Rerun the sims after Loot 2.0 first.

### Rejected
- **Rebirth / prestige resets.** GrumpyDingo really dislikes them.

### Open choice: long-term progression without resets
Firefly offered four options and recommends 1 + 2, then 4:
1. **Zone stars (★1–★5):** mastering a zone unlocks harder star tiers with better loot and new creatures (like Diablo 4 World Tiers).
2. **Collection rewards:** completing Bestiary pages, weapon types and pup breeds gives small permanent bonuses (like Melvor mastery and the RuneScape collection log). The Loot 2.0 Wardrobe and set pages fit here.
3. **The Den grows:** milestones add rooms and pack members moving in (like Terraria NPCs).
4. **Expeditions:** send pups out for an hour or overnight. This gives casual players their own clock.
Still to pick: which ones, and a cozy name for the star tiers ("Deeper Woods"? "Trails"?).

### Curve targets (check with the sim harness after every balance change)
| Target | When |
|---|---|
| Level 5 | ≤ 15 min |
| Level 10 | ~45–60 min (power player), ~75 min (casual) |
| Time per creature | Never under 1 s before 2 h |
| DPS growth | ≤ ×10 per 15 min |
| Unlock letters | ≥ 8 min apart |

---

## Progression curve — goals (user, Oct 1)
- Level-ups start **fast** and **taper off around the 1-hour mark**, after which continuing takes some effort.
- **Shower** players with rewards early, but don't make them overpowered right away.
- **Unlocks come a bit later** and more spaced out than they are now.
- Use feel-good mechanics honestly (front-loaded rewards, variable rewards/"dopamine", reasons to come back), in kind versions: no punishing absence, missed daily gifts stay claimable, events that return.
- References: RACCOIN (be generous and juicy, but not compulsive), Miner's Haven (progression structure, minus the rebirths), and the rest in DEN-GAME-VIBES.md. Oct 2: Elder Scrolls Online for the weapon feel, PoE and Diablo for loot presentation, GW2 for drops.
- What the sims showed at v0.15: slow early (12–30 s per creature for the first hour for a casual player), then a runaway around 45–60 min (power player) or 1h50 (casual). It's the inverse of the goal.

---

## Parked ideas
- **Den Dungeons (later):** health for the dingo and companions, with ESO-style dungeon battles. Wanted, but not yet (GrumpyDingo, Oct 2).
- **Themed caves per zone** (soon after the Meadow bone caves).
- **Creature generator:** build creatures from parts like the Smithy does for weapons; emoji are placeholders until then.
- **Seeded modular pets:** the same RNG-built pets for every player in each zone, so adding a themed pet to a zone is a one-line update. Do this after the weapons settle.
- **Dingo gear system:** the spiked Collar from the Smithy prototype (`COLLAR_GEAR`), worn rather than thrown.
- **Per-type battle feel:** balls, discs and similar types fly out and return, bows and slingshots fire shots, claws hit several times. (Tug Rope yanks creatures toward you; Staff zaps a group.)
- **Starter Stick** for new players, Terraria wooden-sword style.
- **Fetch bonus:** thrown weapons bring back a little extra loot.
- Held from earlier: meatless mode, renames (breeds, Huge → Big), more bandana colour sources.
