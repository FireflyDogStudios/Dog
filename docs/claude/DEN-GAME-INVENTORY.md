# Den Game — Inventory Update (design draft)

Started Oct 2, 2026 from GrumpyDingo's feedback on v0.20. **Status: draft for discussion. Nothing built yet.**
Why: with weapons dropping from the wild, items matter a lot more. The Bag needs to become a real **Inventory** where you store, equip and rearrange things in slots. Guild Wars 2 is the main reference (learn from it, never copy names).

## Decisions so far (GrumpyDingo)
- **Bag → Inventory.** It's where you store, equip and rearrange items in slots.
- **Auto-equip is a poor fit** now. (v0.21: off by default for new players; the toggle still exists.)
- **The Vault is deprecated for now.** It becomes a place you visit, like a Diablo stash or a GW2 bank, not part of the Inventory. Keep its code.

## What GW2 does that we can learn from (to discuss)
- **Bags inside the inventory.** You equip bags into a few bag slots; each bag adds a row of slots. Bigger bags come from crafting and drops, so inventory space is itself loot.
- **Special bags:** some bags keep their items out of sorting and selling, so favourites are safe.
- **Drag and drop** to rearrange, plus a **compact / sort** button that tidies everything in one click.
- **Stacking:** materials and consumables stack (up to 250 in GW2).
- **Material storage:** crafting materials can be deposited to a separate store in one click, so they never clutter the bags.
- **Bank** at fixed places in the world, shared across characters (our future stash location).
- **Equipment panel** beside the bags: what you wear and wield, with weapon swap sets.

## A first sketch for the Den (to discuss)
- **Inventory tab** = equipment panel (5 weapon slots, later a back bar of 5, gear like the Collar later) + a grid of slots grouped into **bags**.
- Start with one small **Den Satchel**; bigger bags drop from bosses, caves and sets. A **Keepsake Bag** keeps its items safe from sorting, selling and auto-salvage.
- **Drag to equip**, drag to rearrange, tap for the item card (the Diablo-style card from Loot 2.0 Step 3).
- **Sort** button: by type, rarity or zone. **Deposit materials** button for essences, trophies, region tokens.
- Bag full → the loot feed says so and new drops go to an overflow "Lost & Found" (never lost, Article 6).
- **Stash** (old Vault) is a place: the Den, later the Town.

## Open questions
- Grid size, and how many bag slots.
- Which item kinds live in the grid (weapons, gems, tomes, brews, treats) and which in their own tabs.
- How pups' gear and gems interact with the Inventory.
- Phone layout: drag and drop vs tap-to-move.

## Proposal v2 (Oct 2, after v0.34 feedback)
GrumpyDingo: the Armory is what the Inventory should look like; the Inventory is a mess; "guild wars it up" so it's all cohesive. Essences are a currency. Scrapping should live on the items / in the Inventory; don't move the bulky Scrapyard over. Hunt-tab info belongs in a Cartography system. Bait needs proper crafting, maybe crafting stations you go to. Resizing the browser window changes how far monsters walk.

Proposed reshuffle (not built yet):
- **Inventory (I)** = GW2 hero panel + bags. Left: equipment (5 weapon slots, later a back bar, a cosmetic Bandana slot). Right: one slot grid split into bags. Hover/click shows the item card with Equip / Lock / Salvage. A **Salvage junk** button uses the auto-salvage rules; those rules become a small settings panel (the Scrapyard tab goes away).
- **Wallet** at the bottom of the Inventory: coins, bones, essences, tokens (currencies stay out of the slot grid).
- **Armory tab goes away** (it becomes the Inventory). The Trophy wall moves to the Den.
- **Hunt window → Cartography / Map**: the map, area info, time of day, hunt history. Meats/DPS/coins stat cards move to the HUD or the hero panel.
- **Crafting stations** (Den/Town): a Workbench for bait first; Smithy and others later. Needs its own design pass. Bait stays where it is until then.
- **Window resize:** proposal: creatures always take the same time to reach the dingo whatever the window width (or a fixed-width fight lane).

## Decisions (Oct 2, GrumpyDingo, after the v2 proposal)
- **Bandana menu hidden** (v0.35). The dingo still wears it; the picker comes back later if it ever fits the design.
- **Daily gifts arrive in the Mail** (v0.35): one letter a day with today's gift, plus any unopened earlier days this month. The calendar under Trials is gone.
- **A right-hand bar in the Den** (until the Town exists), mirroring the left dock:
  - **Library**: Tomes, Scrolls, Compendiums, Research, Bestiary.
  - **Alchemy**: the Alembic moves here as its own button. Alchemy is where crafting (bait first) lives for now.
- **Currencies tab** in the Inventory; the common ones (meats, coins, bones) show at the bottom of the Inventory. Essences live only in the Currencies tab.
- **New-item marker** until the item is hovered.
- **Free rearranging**: drag items anywhere in the bags.
- Take concepts straight from the Guild Wars 2 inventory (concepts only, no names or art).

## Guild Wars 2 inventory concepts we're taking
| GW2 concept | Den version |
|---|---|
| Bag slots across the top; each bag adds its own block of slots | Bag strip on top. Start: Den Satchel (20). More bags from bosses, caves, sets. |
| Bag headers (optional), each bag its own section | Each bag is a labelled block; headers can be hidden in the inventory cog. |
| Invisible/safe bags (kept out of sorting and selling) | **Keepsake Bag**: never sorted, never salvaged. |
| Drag anywhere, drag onto gear to equip, double-click to use/equip | Same. Phone later: tap, then tap a slot. |
| Right-click menu: Use / Equip / Salvage / Sell / Split / Destroy | Right-click menu: Equip, Lock, Salvage, Split stack, Move to Keepsake. |
| New items glow until you look at them | Gold corner pip + soft glow until hovered. |
| Hover tooltip, compare with what's equipped | The Loot 2.0 item card, with a "vs equipped" line. |
| Compact button (sort + stack) | **Tidy** button (sorts by type, rarity, then zone; stacks). |
| Search box filters and dims everything else | Same. |
| Deposit all materials to material storage | **Deposit materials** to the Den stash (later). |
| Salvage-all for junk / low rarity | **Salvage junk** button, using the auto-salvage rules (never sets, relics, locked or socketed). |
| Coins along the bottom; full Wallet with every currency | Bottom strip: meats, coins, bones. **Currencies** tab: everything incl. essences. |
| Stacks up to 250 | Stackables (treats, brews, bait, gems) stack to 250. |
| Hero panel with equipment | **Loadout** column in the Inventory: 5 weapon slots now, back bar later. |

## Mock-up v1 (Oct 2)
Artifact "Den Inventory Mock-up" (https://claude.ai/artifact/9bxWvmV1DkVnA2Z4BnDRAt). Shows: Loadout (5 + locked back bar), bag strip (Den Satchel 20, Keepsake Bag 8, 2 empty bag slots), bag blocks with collapsible headers, New markers + dock badge, drag anywhere / onto Loadout, double-click equip/use, right-click menu, Tidy, Salvage junk, search, cog (bag headers, empty slots), wallet strip, Currencies tab, Den bar (Library: Tomes/Scrolls/Compendiums/Research/Bestiary; Alchemy: Alembic/Bait/Brews) that hides when out hunting. Awaiting GrumpyDingo's notes before building it into the game.

## Feedback on mock-up v1 (Oct 2, GrumpyDingo)
- "Perfect." The Loadout stays inside the Inventory.
- Meat as a currency is on its way out; needs a plan later (currency rework).
- Salvage can't just turn everything into meat/essences long term; placeholder is fine for now.
- **Overflow pouch** (GrumpyDingo's idea, like the Stardew grab menu): when the bags are full, picked-up items go into a small pop-up bag beside the Inventory. You pull items from it into your bags; it disappears once it's empty. Knowing and owning what you carry matters.

### Firefly's proposal for the overflow pouch (to confirm)
- The pouch opens next to the Inventory with a "Bags full" note on the HUD.
- It's for the AFK problem too: so it can't become a second endless bag, when the bags are full common and uncommon weapons auto-salvage into materials (never sets, relics, locked or socketed), and only rare-and-up go into the pouch.
- Pouch actions: drag into bags, Salvage, Salvage all common, and "Send to Stash" once the Stash exists.
- Ideas for later: salvage into zone materials (e.g. Oak scraps, Bronze bits) plus essences from affixes; meat becomes food (feeds the pack, cooking) rather than money, and Coins become the main currency.
- **Decided (GrumpyDingo):** the overflow bag waits quietly behind a HUD badge by default and opens when you open your Inventory. A Settings toggle ("Open the overflow bag as soon as it fills") lets picky players have it pop open right away.

## Build log
### v0.36 (Oct 2) — Inventory step 1 + overflow bag + Stash
- GrumpyDingo: 3× 20-slot bags + Keepsake box; 6 usable bag slots, 10 drawn (4 reserved/locked); Stash 200 on its own Den button, deposit from anywhere, drag both ways; one-time save reset OK (pre-release, "can't make a habit of this").
- Built: `invState/invSync/invSection/stashSection` (keys only: `w:id`, `t:treat`, `p:brew+tier`, `a:bait`; counts stay in each system's store). Loadout = `huntState().equipped`. Overflow bag section at the top of the Inventory; junk-grade drops auto-salvage when bags are full (`invJunk`), rare+ wait. Stash keeps weapons in `stashW` and stack counts in `stashC`, so nothing else sees them. Withdraw only at home.
- Den bar (`DEN_DOCK`, `#fk-den`): Library (L) + Stash (B), only at home; den windows close when you leave.
- Hunt window keeps Hunt + Bait only. Armory and Scrapyard are gone (the Inventory replaces them). Letters l-armory / l-forge rewritten for the Inventory.
- Settings + Inventory cog: "Overflow bag: Wait / Pop open" (default Wait).
- Save reset: `SAVE_EPOCH = 2` in `blank()/norm()`. Bump it only with GrumpyDingo's OK.
- Not yet: gems, tomes and scrolls in bags (gems stay in the Mine, tomes/scrolls in the Library); split stacks; 250 stack cap; bag items that drop; Alchemy window (step 3); Cartography (step 4).
### v0.37 (Oct 2) — per-bag tools, compare, bigger icons
- GrumpyDingo: Tidy pulling items across bags broke his organised bag → Tidy and Salvage junk are now per bag (bag header buttons + right-click on a bag). Bags can be renamed, reordered (drag in the strip) and stowed in the Stash with contents intact (`bag.w` / `bag.cnt` hold them while stowed; put back on at home).
- Data: `I.B[bagId] = {id, type, name, slots}`, `I.eqB` = equipped order; slot address "bagId:index". v0.36 saves migrate automatically.
- Compare: hovering an unequipped weapon shows the equipped weapon it would replace beside it (same kind first, else weakest; same rule as double-click), with ▲/▼ deltas and new traits marked.
- Slots 54px with 46px art; hover card has a 64px picture.
### v0.38 (Oct 2) — bag preferences + master settings + undo
- GrumpyDingo: a settings cog per bag (item preferences, e.g. one bag for consumables, several for weapons), rarity bags ("this is a bag of common"), a master sort, and "all of your stuff should be implemented".
- Per bag (`b.cfg = {pull, rar, sort, prot, lock, col}`): Pulls in (Anything / Weapons / Consumables / Bait / Materials-soon / Nothing = manual only), weapon rarities, own sort, Protect from salvage, Lock layout, colour tag, Gather matching items. Keepsake Box defaults to manual only + protected + locked.
- Routing (`invPlaceFor`): first bag that names the kind (and rarity) → then "Anything" bags → overflow. Manual moves can go into any non-manual bag.
- Master (`I.opt`): default sort + Tidy all (skips locked), auto-salvage level (`huntState().salvLvl` 0–3, kept in step with `autoSalvage`) with a plain-words preview, ask before salvaging Rare+, compare cards Always / Shift / Off, New markers on/off + Mark all as seen, show empty slots, show bag headers, overflow pop.
- Recently salvaged tab: last 20 (`I.recent`), Undo gives the weapon back and takes the meats back (needs enough meats).
