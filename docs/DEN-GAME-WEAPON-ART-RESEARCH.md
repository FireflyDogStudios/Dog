# Den Game — Making the Weapon Pool Look Big (research)

Firefly, 2026-10-01. Proposal only. Context: GrumpyDingo wants god kills to unlock new weapon families (a Terraria-style pool), without the "recoloured log" cop-out.

## What we have to work with
- Weapons render as sprite-sheet `<em-i>` elements (`emoImg`), not font glyphs. That means CSS can layer them, outline them and **mask effects to the emoji's own shape**.
- Several art sheets are already in the Den mix: Noto, Twemoji, ink and others. The same emoji looks like genuinely different art in each.
- Weapons already carry rarity, traits and names (`ensureTraits`, `W_RARITY`). Each zone has about 6 `bases`.

## How others solve "big pool, small art budget"
| Game | Technique | Takeaway for us |
|---|---|---|
| Borderlands | Guns are assembled from parts and manufacturers (BL4 claims ~30 billion combinations). The art director says **form tells function**: sleek and angular means fast, round and bulky means heavy. | Make the base shape mean something (stab / smash / throw / magic), and use a **"maker" identity** for families. |
| Diablo | Prefix + base + suffix ("Glowing Ring of Craftsmanship"). Rarity is shown by **name colour** (blue for magic). | Cheap, huge perceived variety. Tie the affixes to our traits so names describe what the weapon does. |
| Hearthstone golden cards | No redraw. They **mask the art** and add up to **4 effect layers** (particles, glow pulse, distortion). Rule: effects must **tell a story** and match the card's ability, and stay subtle. | Premium versions come from masked FX layers, not new art. |
| Minecraft | The enchant **glint**: one shimmer texture applied to any item, signalling "magic" instantly. | One reusable glint, masked to the sprite shape, for enchanted or high tiers. |
| Pet Sim 99 | Normal → **Golden (100 copies)** → **Rainbow (10 golden)**, plus **auras**. Each variant is visibly special and gives a power bump. | Variants as a crafting sink for duplicates. It fits the forge we already have. |
| Emoji Kitchen | Tens of thousands of mashups, but **each one is hand-made**. Automatic emoji mashing looks janky. | Composites need hand-tuned anchor points per base, never random placement. |
| Modular sword packs (itch / GameDev Market) | 15 blades × 15 handles × styles gives about 255 icons. | Swapping parts beats recolouring for perceived variety. |

## Proposed layer stack (each layer is independent, max ~3 visible at once)
1. **Base silhouette (form = function).** Each zone/god family adds bases, grouped by type: stab, smash, throw, magic. A god kill unlocks that family into the roll pool.
2. **Maker style (Borderlands manufacturers).** The same base drawn in different emoji sheets (Noto / Twemoji / ink…) as named origins, e.g. "Meadow-made", "Frostpine-forged", "Ink-scribed". This is **real different art, not a recolour**. Keep one style per family so areas stay consistent.
3. **Infusion (kitbash, hand-anchored).** A small emoji charm at a per-base anchor point (tip or hilt), plus a matching subtle tint and a particle: 🔥 ember, ❄️ frost, ⚡ storm, 🌿 bloom, 🌙 moon, 🦴 bone. About 6, each tied to a trait so the look tells you the effect.
4. **Rarity treatment (no recolour).**
   - Card frame and name colour (Diablo).
   - Outline/glow via `drop-shadow`.
   - **Glint masked to the sprite** (Minecraft) from epic up.
   - Aura particles (PS99) for legendary and up.
   - A slow animated loop for godly/mythic (Hearthstone; 1–2 layers max).
5. **Variants as a duplicate sink (PS99).** Golden / Starlit (or a cozy name) made from copies at the forge. Gold or shimmer gradient-map plus sparkle, with a small power bump.
6. **Signature weapons.** One hand-designed weapon per god (Emoji Kitchen lesson: curated equals special). These are the wow drops.
7. **Names.** Prefix (infusion / maker) + base + suffix (trait), e.g. "Ember Bone Club of the Pack".

**Scale example:** 24 bases × 3 makers × 6 infusions × 7 rarities ≈ **3,000 visibly distinct weapons**, before names and variants. Very few of them are just a recolour.

## Guardrails
- Readable at small size: the base plus at most 2 extra layers at hand size. Full FX only in the card view.
- Rarity must be readable at a glance.
- No hue-rotate-only variants. Tint is only allowed alongside a part or effect change.
- Effects match function (constitution: wow factor, honest).
- Respect the calm/reduced-motion setting: animations off, static glow only.

## Next step
Build a standalone mockup sheet (not in the game yet): 3 bases × makers × infusions × rarities, so GrumpyDingo can judge the look before anything ships.

## Sources
- Borderlands 4 procedural guns / form follows function: https://www.g2a.com/news/latest/borderlands-4-will-have-30-billion-guns-heres-how-that-works/
- Diablo magic items: https://diablo.fandom.com/wiki/Magic_Items
- Hearthstone golden cards (Jon Briggs): https://hearthstone.blizzard.com/en-us/news/18053404/hearthside-chat-golden-cards-with-jon-briggs-3-5-2015
- Minecraft glint: https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_glint?view=minecraft-bedrock-stable
- PS99 golden/rainbow: https://twinfinite.net/guides/rainbow-pets-pet-simulator-99/
- Emoji Kitchen (handmade combos): https://9to5google.com/gboard-android-emoji-kitchen-list/
- Modular sword icons: https://www.gamedevmarket.net/asset/modular-pixel-art-sword-icons
