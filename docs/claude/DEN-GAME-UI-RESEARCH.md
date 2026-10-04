# Den Game — UI Identity Research

Written Oct 2, 2026 by Firefly for GrumpyDingo. Goal: pick the game's look on purpose, so the UI overhaul doesn't go wrong. Companion to DEN-GAME-UI.md.

## 1. Why this is less scary than it looks
- **The UI is a skin over the game.** The systems (loot, pack, library, saves) stay the same. A new UI changes how they're shown, not how they work.
- **Nothing gets dismantled first.** The new shell gets built next to the old one with a **Classic / New UI** switch in Settings, so we can flip back any time and players' saves are never touched (Article 10).
- **We decide in cheap steps:** words → pictures → one tiny sample → a whole kit → the real game. Each step is easy to throw away.

## 2. What the research says

### GW2: timeless beats trendy
- ArenaNet's art director: "We focused on creating something timeless, rather than trying to push cutting-edge graphics that would be outdated in a few years." Fundamentals (composition, colour, shape language) carry the look, not effects. ([Creative Bloq](https://www.creativebloq.com/art/digital-art/we-focused-on-creating-something-timeless-why-guild-wars-2-remains-an-artistically-unique-game))
- For us: the UI should support the scene's art, not compete with it. Quiet frames, strong shapes.

### ESO: a UI that gets out of the way
- ESO is known for a deliberately minimal HUD that only shows things when they matter (for example, bars that appear in combat). ([Game Rant](https://gamerant.com/elder-scrolls-online-ui-features/))
- For us: the tracker, weapon bar and currencies can fade when idle and wake up when something happens.

### Cozy games: what breaks coziness (Project Horseshoe 2017)
- Coziness = **safety, abundance, softness**. ([report](https://projecthorseshoe.com/reports/featured/Project_Horseshoe_2017_report_section_3.pdf))
- **Damages coziness:** pop-ups and notifications that interrupt, transactional pressure, intense stimuli (sudden noise, bright colours, lots of movement), mandatory maintenance.
- **Builds coziness:** warm palettes, soft lighting, handmade natural materials, intimate focused spaces, smooth transitions.
- This explains GrumpyDingo's earlier complaints (pop-ups, too loud, "Roblox") and matches the Constitution (Articles 6 and 11).

### Idle games: clarity isn't identity
- Melvor Idle is famously clear but players call its UI boring: a sidebar of menus and numbers. ([Steam discussion](https://steamcommunity.com/app/1267910/discussions/0/3944650879129936794/))
- For us: idle UIs show lots of numbers, so **hierarchy** matters most (one big thing per screen, the rest quiet), and identity must come from materials, type and the world, not from more panels.

### Where UI can live (diegetic vs. non-diegetic)
- Game UI can sit **in the world** (diegetic), **in the world's space but not the story** (spatial), **in the story but not the space** (meta), or **on top** (non-diegetic). ([overview](https://nastyrodent.com/diegetic-and-non-diegetic-ui/), [Beyond the HUD](https://www.researchgate.net/publication/277202228_Beyond_the_HUD_-_User_Interfaces_for_Increased_Player_Immersion_in_FPS_Games))
- We already do some: loot on the ground, weather and time in the sky. More ideas: mail as a mailbox at the Den, the map as a hand-drawn chart, the Inventory as a satchel. **This is the strongest identity tool we have.**

### How studios set a visual identity
- Start from **art pillars** (a few words the whole look must serve), then build the identity across artistic, creative, technical and audience needs. ([GDC 2023, Building a Visual Identity](https://gdcvault.com/play/1028954/Art-Direction-Summit-Building-a))
- Common practice: mood board → style tiles (colour, type, one button, one panel) → UI kit → layout → playtest. ([Milanote moodboard template](https://milanote.com/templates/game-design/game-design-moodboard), [Game Developer: UI design in video games](https://www.gamedeveloper.com/design/user-interface-design-in-video-games))
- Reference library: **Game UI Database** has 55,000+ screenshots searchable by game and screen type. ([gameuidatabase.com](https://www.gameuidatabase.com/))

## 3. Why the current UI feels "Roblox"
- Chunky pressable buttons and cards everywhere (thick borders + solid drop shadows).
- One bubbly display font for nearly everything.
- Bright, saturated, flat colour on every panel at once.
- No hierarchy: world, currencies, tabs and panels all at the same volume.
- Built as one long page (the old budget app), not as a world with windows.

## 4. The plan (cheap → expensive)
1. **Pillars:** pick 3 words the look must serve.
2. **Mood board:** GrumpyDingo picks 3–6 games (or screenshots) whose look they love, and what exactly they love. Firefly adds references from Game UI Database.
3. **Style tiles:** 2–3 tiny samples (palette, fonts, one button, one window frame, one item card, one icon). Pick one.
4. **UI kit:** every component in the chosen style, in Den Look Studio.
5. **Layout:** where each window and HUD piece lives, which things become diegetic.
6. **New shell beside the old** (Classic / New UI switch), playtest, iterate, then retire Classic.

## 5. Guardrails
- Readable first: body text ≥ 14px, strong contrast on the scene, colour never the only signal.
- Calm by default: no pop-ups that block, little motion, sounds soft (cozy research).
- Works in a half-width desktop window.
- Performance: frosted-glass blur is costly on big pages; use it sparingly.

## Candidate pillars (to pick from or replace)
- **Wild · Cozy · Earned**
- **Hand-made · Calm · Alive**
- **Field guide · Hearth · Adventure**
