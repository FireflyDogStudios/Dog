# Den Smithy — modular weapon art (decision + prototype)

Firefly, 2026-10-02. **Decision (GrumpyDingo):** go with custom-drawn modular weapons instead of emoji weapons. Push hard on custom art wherever it beats emoji. GrumpyDingo wants primal, dog-flavoured weapon types, Terraria-style. Credit line: **"Art by Firefly · design by GrumpyDingo"**.

**Shipped in the game as v0.16** (game artifact https://claude.ai/artifact/APeiXGfpJhnYRfjs7NorsT).
Prototype / showroom: https://claude.ai/artifact/AX1AckrJ39AdzZ16Vt4XSs (v4).
Source parts live in the scratchpad at `proto/sm/`:
- `engine.js`, `render.js`, `ui.js`, `page.html` and `style.css` build the prototype.
- `game_api.js` is the game bridge. It is assembled into `smithy_module.js`, which is pasted at the top of the game's main IIFE as `const SMITHY`.

## The 13 types
Sword, Dagger, Polearm, Stick, Ball, Disc, Tug Rope, Slingshot, Bone Club, Claws, Staff, Bow, Shovel. Each type has 4 part slots and its own material list.

**Retired per GrumpyDingo (v4):**
- Shovel D-grip (broken).
- Crescent sword guard.
- Ball comet tail.

Retired parts stay in the art code. The part lists map to the original drawing index via `{v:i}` and `resolveParts()`, so nothing else breaks.

**Stick ties fixed:** twine, bandana and tape now follow the stick's centreline, so they sit right on crooked sticks.

**Collar is on hold** as `COLLAR_GEAR` (not registered). GrumpyDingo loves the look but a collar as a weapon felt odd. Possible future dingo gear system.

## How it works in the game (v0.16)
- **New weapons:** `makeWeapon` gives every weapon `w.code` from `SMITHY.forWeapon({seed, name, rar, zone})`.
  - The type comes from keywords in the weapon base name (stick, ball, frisbee, whip, sling, bone, claw, bow, hammer→maul, axe, pick, trident→spear, dagger, sword, staff, spoon→shovel…).
  - The material is biased by zone: meadow woods/iron, forest pine/mossjade, moon moonsilver/frostglass.
  - Infusion chance by rarity: 0 / 5 / 15 / 35 / 60 / 100% from junk up.
  - Rolled weapons take the Smithy name. Special weapons that come with an explicit icon keep their given name.
- **Rarity:** 9 tiers matching `W_RARITY`, including titan/Godforged (red-gold cycling outline, rays, aura).
- **Old saves:** `wCode(w)` lazily gives existing weapons a matching look, seeded by weapon id and name. Their name and stats are unchanged.
- **Forging:** `doMerge` keeps the best weapon's code and raises only its rarity, so forged weapons keep their look. They are renamed with the Smithy name.
- **Rendering:** `wImg(w, mode)` returns `<img class="emo wimg">` with a cached SVG data URL. The SVG is standalone, with its own `<style>`.

  | Mode | What it does | Used in |
  |---|---|---|
  | full | particles | weapon detail, roll reveal |
  | live / card | animated only for epic+ | weapon cards, wall |
  | still | no motion | vault, wall rack, battle ghosts |

  Calm mode forces still.
- **The 9 old `emoImg(w.icon, w.id)` calls were replaced.** `w.icon` is still kept on weapons.

## Gotchas
- Scope `transform-box`/`transform-origin` to the particle classes only.
- A CSS animation's `transform` overrides the `transform` attribute. Wrap the element in a `<g>`.
- Infusion overlays use the metal mask.
- Ring shapes need `clip-rule="evenodd"`.
- `makeWeapon(hp,"titan")` without an icon crashes, because `W_PREFIX` has no titan entry. This was already true before Smithy, and titan weapons always pass an icon.

## Ideas parked
- **Seeded modular pets (GrumpyDingo):** the same RNG-built pets for every player in each zone, so adding a themed pet to a zone is a small update. Do this after the weapons settle.
- **Per-type battle feel:** thrown types return, bows and slingshots fire projectiles, claws multi-hit.
- **Starter Stick, plus god-unlocked types and parts.**
- **Rerun the sims.**
