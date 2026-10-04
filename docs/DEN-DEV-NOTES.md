# Den Ledger: Developer Index (for Claude)

Read this first in a new chat instead of searching the whole app. Keep it updated.

## Where things live
- **Live app:** https://claude.ai/artifact/NUJoMc4k9TXFYGMdPwgu3F (single HTML file, ~6.5 MB since the art mix).
- **Get the code:** `Artifact` action `read` on the URL, then work on the saved HTML copy. Publish back with `url` set.
- **Most of the file size is emoji art** (CSS classes `.e123` + `EMO_IDX` map, plus `.xn123/.xb123/.xt123` alt art and `.ik-<essence>` ink masks in `<style id="artmix-css">`). Never print or view those parts. Use `grep -n ... | cut -c1-200`.
- **Main script is one IIFE** (`(function(){ "use strict"; ...`), so functions aren't on `window`. For Playwright tests, make a test copy that adds e.g. `window.__T={spawnEnemy:(k)=>spawnEnemy(k),B:()=>B,P:()=>dingoPos()};` right before `function battleFrame`. The page runs offline with a fresh save, so battles can be tested.
- **Saved data:** artifact db doc `den/state` (whole save). **Never write to den/state while the app is open** (it can be overwritten). Use the inbox instead.
- **Inbox:** db doc `den/inbox` → `{ops:[...]}`. Each op needs a NEW unique `id` (ops already applied are skipped forever). Supported fields: `balances{checking,savings}`, `log[]` (entries with ids), `logEdit[{id,...}]`, `billsPaid[{name,amount}]`, `mail{id,from,subject,date,body,items[]}`, `note`. Mail items: `meats, coins, candy, bones, spirit, ess{key:n}, tome:"fangs2", treat:"pupcake"+n, brew:"str1", weapon{...}, pup{...}`.

## Cheap workflow
1. `grep -n 'function name'` → `sed -n 'a,bp' | cut -c1-250` only around the spot.
2. Patch with a small Python `replace(old, new, 1)` + `assert old in h`.
3. Syntax check: extract first `<script>` and `node --check`.
4. Test with Playwright only when needed; prefer text checks over screenshots.
5. When changing how an icon type renders, grep ALL its render paths (e.g. essences render in `aspChip`, Scriptorium, runes, and the Bag via `x.art`).
6. Emoji art sources (all downloadable via `npm pack` here; GitHub raw/jsdelivr/gstatic are blocked): `fluentui-emoji` (icons/modern|flat|high-contrast by name), `@svgmoji/noto@3.2.0` (sprites/all.svg, ids like `1F43A`), `@svgmoji/blob@2.0.0` (svg/1F43A.svg), `@twemoji/svg` (1f43a.svg). Minify with `svgo` (npm i -g svgo).

## Art Mix (v106–108, Sep 30, 2026) — permanent, no toggle
- Idea (theirs): use several emoji sets as "more sheets" so each thing has variants (species, raw/cooked, enchanted, etc.).
- **Approved sets:** Fluent (main), Google Noto, Blob (NOT the blob spider), Twemoji (they especially like the Twemoji scorpion). **Rejected:** OpenMoji, Fluent Flat. **Ink** (Fluent high-contrast line art) = essences now; crafting later. No ink candy.
- **Their rules:** in a given zone, a creature type keeps ONE style (seed = `zoneId() + "|" + icon`). Kids that burst out / get summoned / tossed (`sub` kinds) roll random styles. `ALWAYS_MIX` (👻 ghosts, candies) roll random every time. Candy catchables random. Weapons keep their look (seed `w.id`). Megas/titans/king/chapter bosses stay Fluent.
- Code: `ALT_ART{n:"nbt"}`, `artPick(ch, seed, battle)`, `emoImg(ch, seed, battle)` (no seed = Fluent as before). `artMix` is a const `true` (the 🎨 test toggle was removed in v108 at their request).
- **Essences = Ink** via CSS mask tinted with the essence color: `essImg(k)`, `.emo.ink.ik-<key>`, `INK_ESS`. Used in `aspChip`, Scriptorium buttons, rune slots, and the Bag.
- Facing: `ALT_RIGHT{set:[n]}` marks right-facing alts so they get `eflip`; `ALT_NOBATTLE` = creatures whose alt facing was unclear (stay Fluent in battle). Noto lizard (191) dropped (renders broken). If a creature faces backwards, add/remove its number in `ALT_RIGHT`.
- Licenses: Noto & Blob Apache 2.0, Twemoji CC BY 4.0 (needs a credit line, TODO), Fluent MIT.

## Battle movement + abilities (v107)
- **Lanes:** flyers (`E.flying`, not bosses) queue only behind other flyers (`prevA`); ground uses `prevG`. Flyers draw higher (top offset 50).
- **Passing + wrap:** `E.passing` creatures ignore the queue, can't be targeted (excluded from `inRange` and attacker `F`), walk left, and at `x < -60` wrap to `P.w + 30`. Non-big creatures that end up behind the dingo become passing. Big ones (boss/king/chapter/mega/titan) still get removed.
- **New traits** (`CTRAITS` + `EXTRA_TRAITS`): `phasing` (👻: drifts through if not hit for 1.2s, `.phasing` look), `shover` (🦏🐗🦣🐻🦖: dingo `pushed` animation + `B.dazedUntil` 900ms + knocks other foes back; the dingo does NOT actually move position — asked them whether it should), `thrower` (🕸️→🕷️, 🦅→🐍, 🌳→🐿️, 🎃→🦇: `E.toss` arc lands behind the dingo), `summoner` (🪦→💀, 🕯️→👻, 🍄→🍄: 2 kids rise behind the dingo). Kids map: `ABILITY_KIDS`. Abilities only on normal spawns (not kids, not bosses) to avoid chains. Code: `abilityFire()`, `kidSpawn()`; `hitEnemy` stamps `E.hitAt`.
- Rollback: version 106 = art mix only, 105 = before art mix (artifact history).

## Key systems (function names)
- Render: `render()`, `layoutTabs()`, `LAYOUT{tab:{full,cols}}`, `LAZY{"section-h": fn}` (only visible sections build). Tabs: `TABS`.
- Save: `save(msg, quiet)`; host lock `isHost()/claimHost()`; external snapshot merge `extSnap`.
- Budget: `freeMoney()`, `daysLeft()`, `state.balances`, `state.log`, `state.bills`, funds `treats/outfund/glowfund/jar`.
- Battle: `battleFrame()`, `spawnEnemy(kind)` (kinds: boss/king/thief/rush/chapter/mega/titan/`swarm:i:n`/`baby:`/`add:`/`tpart:`), `hitEnemy()`, `killEnemy()`, `wHit()` (weapon classes/traits), `applyArchetype()` (creature traits/elites), `FACE_RIGHT` (icons to flip).
- Multipliers: `dmgMult() spdMult() lootMult() luckMult() coinChanceMult()` (many sources chained).
- World: `ZONES`, `zoneId()/zone()`, `zoneData()` (winter variants Nov–Feb), `tod()`, `season()`, `dayTheme()`, `gameEvent()`, `WEATHER/WORLD`.
- Bosses: Mega `MEGAS` (zone-based, `megaFrame`, mechs summon/push/shield/heal/enrage/debuff), Gods/Titan `TITANS` (`titanFrame`, `summonTitan`), overpower meter, `holdBig`, `autoCloseBox()`.
- Items: weapons `makeWeapon/rollWeapon/forgeAll`, caps `WCAP=300, PCAP=500`, vault `vaultState()`, bag `bagSection()` (items accept `art` html override).
- Pack: `packGameSection()`, pups `pupDps/pupLevel` (only HUGE level), gems `GEMS/RUNES/infuseGem`, Mine `mineOpen()` (closed Oct–Feb).
- Library: tomes `TOME_T/TOME_S`, Scriptorium `ASP` (essences+relics, `aspChip`), `SCROLLS`, `COMPS` (compendiums), Apothecary `POT_BREW`.
- Home/Town: `goHome/leaveHome`, `DECOR`, trophy wall, `goTown`, `TOWN_SPOTS` (Smithy & Market are placeholders).
- Halloween (Oct): chapters, Pumpkin Moon, 31 Nights, treats/visitors, Nocturne god, Omen titan (after 3 Oct god wins).
- Sound: `sfx(kind)` (soft engine, volume 0–2), `audioUnlock()`.
- Mail: `openMail()`, `claimMail()`; snapshot button `copySnapshot()`.

## Planned / ideas
- Town: Smithy (upgrade god weapons; Ink art for blueprints → full color when forged), Meat Market (daily prices; keep coins out of it), quests.
- Art mix next: style = meaning (Noto meat = raw, Fluent = cooked; Noto blade = enchanted; variant names/species per zone).
- November: calm snowy vibes. December: chaotic holiday (trains, Krampus, Santa, elves, possessed trees, cocoa).
- Later: Titans tier above Gods, Primordials above Titans; distance counter, travelers, escorts.
