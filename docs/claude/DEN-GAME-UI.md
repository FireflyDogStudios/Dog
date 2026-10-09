# Den Game — UI Overhaul (design draft)

Started Oct 2, 2026 from GrumpyDingo's feedback. **Status: draft for discussion. Nothing built yet.**

## The problem (GrumpyDingo)
- The game has become an **AFK MMORPG**, but the UI is still the old budget-app layout: one endless page of menus, tight and cluttered.
- Buttons where buttons shouldn't be (the sound button next to the currencies).
- It feels **too Roblox / cartoony**. The vibe is off.
- The opposite trap to avoid: Stellaris mobile's menu-inside-menu-inside-menu.

## Why it feels "Roblox" (Firefly's read)
- **Chunky "pressable" buttons** everywhere: thick borders, a solid drop shadow under every button and card, big rounded corners.
- **One bubbly display font** (Lilita One) for almost everything.
- **Bright, saturated, flat colours** on every panel at once, so nothing recedes.
- **Everything at the same volume:** currencies, tabs, panels and the game scene all compete. Nothing is clearly "the world" and nothing is clearly "a window".

## What GW2 does (to learn from, not copy)
- **The world is the screen.** UI sits at the edges and the game scene stays full-size.
- **A small icon menu bar** (top-left) opens windows: hero, inventory, wallet, achievements, mail, map, etc. Each has a hotkey.
- **Windows float over the world**, can be closed, and only show one system at a time. No endless scroll.
- **Bottom-centre action bar** (skills, health), **minimap bottom-right**, **event/quest tracker on the right**, **chat/log bottom-left**.
- **Currencies live in a Wallet window**, not all on the HUD. The HUD shows only the one or two that matter right now.
- **Muted, translucent dark panels with thin borders** and a refined font. The art pops because the UI is quiet.

## A first sketch for the Den (to discuss)
- **Full-screen hunt scene** as the home view (the "world").
- **Corner HUD, minimal:** level + XP top-left, zone/time/weather top-right, loot feed (already in the sky), and only meat + one context currency.
- **Icon dock** (bottom on phones, top-left on desktop): Inventory, Pack, Library, Map (Cartography), Mail, Wallet, Settings. Each opens a **window** over the scene.
- **Windows:** dark translucent panels, thin rarity-style borders, one system per window, sub-tabs inside the window header. Close with ✕ or Esc.
- **Weapon bar** bottom-centre: the 5 equipped weapons (later the skill bar from DEN-GAME-COMBAT.md).
- **Tracker** on the right: active trial, boss timer, event, daily goals.
- **Visual direction:** cozy fantasy instead of toy: fewer drop-shadows, slimmer borders, a quieter palette per zone, a calmer body font, and the display font only for big moments.
- **Phone first:** windows become bottom sheets; the dock is a bottom bar.

## Disabled for now (code kept)
- Upgrades tab (too strong, off-theme) — v0.27
- Self Care tab (WIP, Settings toggle) — v0.21
- Merge Forge — v0.21
- Rolling for weapons — v0.17
- Vault (becomes a stash location later)
- Firefly Swarm and Meat Meteors world events — v0.20
- Falling leaves in fall — v0.21

## Later list
- **Currency rework** (what each currency is for, fewer of them, Wallet window).
- Mid-hills parallax layer.

## Decisions
- **Desktop game** (GrumpyDingo, Oct 2). Must still work in a half-width browser window; phone support isn't required.

## Mock-ups
- **Den Look Studio** (https://claude.ai/artifact/3hynkNvYbjrdsSDy4Mw2Jw): the same full-scene screen in three looks: A Dark Glass (GW2/ESO), B Storybook, C Cozy Modern. Inventory window, dock, weapon bar, tracker, loot feed. Not wired to the game.

## Direction proposal: D · Field Kit (Oct 2)
GrumpyDingo likes GW2, SkyUI (Skyrim), and GW2's one-item-per-slot inventory over PoE/Diablo item sizes. Firefly's proposal from that and the research (DEN-GAME-UI-RESEARCH.md):
- **Pillars: Wild · Cozy · Earned.**
- Dark forest-ink panels that fade at the edges (SkyUI), thin gold top rules, almost square corners. No chunky shadows.
- Type: an engraved small-caps serif for titles (Spectral SC), a clean body face (Barlow), a condensed face for labels, tabs and numbers (Barlow Condensed).
- Inventory: **Slots** view = GW2 named bags, one item per slot (Den Satchel, Keepsake Bag safe from salvage). **List** view = SkyUI category icons + sortable columns (Name, Type, DPS, Value). Item card on the right in both.
- Diamond level badge, gold accents only for focus and selection; rarity colours carry the loot.

## Open questions
- Does D feel right, or which parts of A/B/C should mix in?
- Which windows must exist on day one?
- Font and palette direction (Firefly can mock up 2–3 looks to compare).

## Staying original (legal hygiene, Oct 2)
- Layout ideas and conventions (icon dock, bag grid, list view with columns, item cards, dark panels) are common across games and fine to use.
- Never copy another game's actual assets: art, icons, textures, ornaments, sounds, logos, names or exact screens. Everything in Field Kit is drawn in code by Firefly.
- Fonts: Spectral SC, Barlow and Barlow Condensed are Google Fonts under the SIL Open Font License (free for commercial use).
- Don't name features after other games ("SkyUI", "Guild Wars") in player-facing text. Before any paid or commercial release, get a quick check from an IP lawyer.

## UI icons (Oct 2)
- Replace emoji in the **UI chrome** (dock, HUD, tabs, tracker, currencies, categories) with **game-icons.net** (4,100+ fantasy/RPG silhouette icons, GitHub `game-icons/icons`, **CC BY 3.0**: credit line required, e.g. "UI icons: game-icons.net by Lorc, Delapouite and contributors, CC BY 3.0").
- Get them with `npm pack @iconify-json/game-icons` (GitHub raw is blocked in the sandbox; npm works). Each icon is an SVG body; render inline with `fill: currentColor` so they tint to the theme (gold accents, ink text).
- They stay one-colour silhouettes, so they never clash with the full-colour Smithy weapons: chrome is quiet, loot is colourful. Creatures stay emoji placeholders until the creature generator.
- Mapping used in the mock-up: Inventory `knapsack`, Pack `sitting-dog`, Library `spell-book`, Map `treasure-map`, Mail `mailbox`, Wallet `coins`, Settings `cog`, meat `ham-shank`, zone `pine-tree`, day `sun`, windy `wind-slap`, trial `trophy`, boss `skull-crossed-bones`, weekly `calendar`, categories `crossed-swords` / `gem-pendant` / `book-cover` / `quill-ink` / `crystal-ball`.

## Field Kit UI kit, draft 1 (Oct 2)
- **Den Field Kit** (https://claude.ai/artifact/1vXfDMziP9Va4AjkpKLEUd): colours, type scale, buttons, icon dock, tabs, switches, HUD (level, feed, ribbon, toast), boss and trial bars, loot slots, tooltip cards for every rarity incl. **set pieces (green)** and **relics (rose)**, Mail and Wallet windows. Source: `kit_src.html` + game-icons JSON (built into `den-field-kit.html`).
- Colour roles: forest ink ground, parchment text, lichen secondary, ember gold for focus only, moss for good news, rosehip for danger. Rarity colours only on loot.

## Where things live (proposal, Oct 2)
GrumpyDingo: the Library feels odd inside your inventory; some systems need new homes.
- **Windows (open anywhere):** Inventory (weapons, gems, tomes, brews, bait, materials), Pack (companions + their sockets), Map (zones, caves, travel, trial grounds), Journal (bestiary, trophies, wardrobe, relics), Mail, Wallet, Settings.
- **The Den (home):** Library (study, research, scrolls, compendiums), brewing nook (alembic + apothecary), Stash (old vault), trophy wall + decor, Sanctuary.
- **Town:** Smithy (affix bench, sockets, salvage), Rescue Shelter (rescue pups), Meat Market later, Post Office.
- **Out in the world:** Mine and caves, trial grounds (on the Map), events (tracker).
- **Decided (GrumpyDingo, Oct 2): visiting the Den or Town pauses the hunt.** Keeps it grounded; a short visit costs nothing.

## Statuses in the HUD (Oct 2, kit draft 2)
- **Target frame top-centre:** the creature you're hitting (nearest, or the one you click), with name, tags (Elite · Armored), health bar and its boons/conditions.
- **Your statuses** sit just above the weapon bar, GW2 style.
- Status chip: icon (game-icons), moss edge = boon, rosehip edge = condition, stack number bottom-right, thin time-left line along the bottom.
- Draft list (see DEN-GAME-COMBAT.md): boons Zoomies `sprint`, Hackles Up `wolf-head`, Thick Coat `bordered-shield`, Sharp Nose `sniffing-dog`, Second Wind `regeneration`; conditions Burrs `thorny-vine`, Scorched `flame`, Frostbit `snowflake-1`, Muddy Paws `footprint`, Spooked `ghost`, Dazed `sleepy`. Creature-only: Enraged `fangs`.
- Foil shimmer now fades in and out (fixed in the kit and in game v0.28).

## Build log
### v0.29 (Oct 2, 2026): Field Kit preview shell in the game
- `body.fk` class (default ON; `localStorage dengame-ui = "classic"` to opt out; Settings → "New look (preview)"). `fkSetup()` moves `#subnav` + `#rest` into the `#fkwin` window and back.
- Classic tokens (`--bg --panel --ink --line --btn…`) are re-mapped to Field Kit values under `body.fk`, so old screens restyle for free; chunky shadows/radii flattened.
- Hero is fixed full-screen above a 92px dark action strip (`body.fk::before`). HUD: `#fk-tl` (level diamond + title + XP), `#fk-tr` (zone, time, weather, meat), `#fk-dock` (H hunt, I inventory/bag, P pack, L library, M mine, E events, N mail, O settings; Esc closes), `#fk-target` (nearest creature: name, tags, hp + shield, statuses mapped from traits/bleed/burn/slow/stun), `#fk-pst` (player: trial Zoomies, active brews, Windy, mega debuffs), `#fk-eq` (equipped weapons → item card). Skill bar `#skills` sits in the strip.
- Icons: `FKI` (game-icons subset, ~40 KB), credit line bottom-left.
- Next: redesign windows one by one (Inventory first), move Library/brewing/stash to the Den, Smithy/Rescue Shelter to Town, Map window.

### v0.30 (Oct 2, 2026): windows, mail, statuses, interface size
- **Windows:** `FKW.wins` (one `.fkw` per open system; several at once). `fkOpen(t)` creates/raises/toggles, `fkCloseWin(w)` removes (position resets next time), drag by `.fkw-h` with pointer events, click raises (`.front`), CSS `resize: both`. `fkRenderWin(w)` builds that tab's LAZY sections with `tab` temporarily set to the window's tab; `.subtabs` move into `.fkw-sub`. `render()` in the new look calls `fkRenderAll()` + skill bar + `afterRender()` instead of `layoutTabs`. `#subnav`/`#rest` hidden.
- **Mail window** (`@mail`): `fkMailHtml()`, letters fold open on click (`FKW.mailOpen`), marks read, Accept / Take me there / Delete. `openMail()` and `goMail()` route to windows in the new look.
- **Statuses:** keyed `fkStatusRow()` updates chips in place (150 ms tick, smooth time bar), custom tooltip `#fktip` (name, description, boon/condition, stacks, time left).
- **Health bars tween** (`#battle .ehp i` and target frame), plus a light damage trail in the target frame.
- **Mega bosses and gods** show in the target frame (bigger, with timer and Enraged); old `#megabar` hidden in the new look; `#trialbar` sits under the target frame.
- **Interface size:** `--fkz` (70–130%, default 90% on screens under 1400×820), Settings slider or − / = keys.
- Noted for the skill/action bar redesign (GrumpyDingo): skill messages like "Awooo! The pack is fired up" pop up in odd places.

### v0.31 (Oct 2, 2026): Field Kit is the only look
- GrumpyDingo: "just make the switch". `fkOn = true` always; Settings toggle removed. Classic CSS/paths still in the file but unused (clean up later).
- **Notifications:** toasts (`#toasts`) and the new-mail notice (`.mailnote`, now with the mailbox icon) stack **top-right under the area bar**; `fkNoteShift()` keeps the mail notice below toasts. Banners (`.moonbanner`) are slimmer. `floatText` (skill shouts) pops above the dingo.
- **Head home** moved to the dock above Settings (key D, `@home`); turns into "Walk out to the Meadow" at home. Removed from the skill bar.
- **Action strip** is 124px (scaled): your statuses sit inside it above the skills, no longer on the ground.
- **Windows:** sub-tabs are one compact scrolling row; top-level sections lose their nested card frame inside windows; headings gold. Forge kept hidden even in dev (`DISABLED["hunt-forge"]`).
- Meat chunks fly to the meat counter in the top-right bar (`#fk-meat`).
