# Den Smithy source

Hand-drawn modular weapons for the Den Game. Art by Firefly, design by GrumpyDingo. 🐾

## What's here
- **smithy.html**: the showroom page, ready to open in a browser.
- **smithy_module.js**: the version that lives inside the game (v0.16). It's pasted at the top of the game's main script as `const SMITHY`.
- **build.py**: rebuilds smithy.html from `src/`. Run `python3 build.py`.
- **src/engine.js**: palettes, drawing helpers and the 13 weapon types. Each type has a `build()` that draws it from its parts. It also holds the save code (`encode`/`decode`) and names.
- **src/render.js**: fits a weapon into its icon and layers on rarity glow, shimmer, aura, rays, variants and the six infusions.
- **src/ui.js**: the showroom page: bench dials, armoury, shelves, rack.
- **src/game_api.js**: the bridge the game uses (`forWeapon`, `dataUrl`, `svgDoc`, `recode`). The game version is built from engine + render + game_api, with game rarity colours (9 tiers, including Godforged).
- **src/page.html** and **src/style.css**: the showroom page shell and styles.

## Save code
`c` + 12 base-36 characters, in this order: type, part 1, part 2, part 3, part 4, material, fittings, wrap, gem, infusion, rarity, variant. The same code always draws the same weapon.

## Adding or retiring parts
- **Add a part:** append it to that type's list and draw it in `build()`.
- **Retire a part:** remove it from the list and give the remaining entries `{v: originalIndex}`, so the drawing code still works. See `resolveParts()`.
