# Den Game — Creatures and the Hero (design + bible)

Started Oct 2, 2026 by Firefly with GrumpyDingo on the **Den Dingo Workbench** (https://claude.ai/artifact/2N5JULUbfKNkKB3szMUo8Y). The earlier style sheet (Den Dingo Style Studio, https://claude.ai/artifact/MVxnkDzLu3inYcetEXc1xi) is superseded by this.

## The frame (GrumpyDingo, Oct 2)
**This is a game about a dingo, built by therians, with dog values.** Creatures are **what the dingo thinks he's seeing**: the meadow where he lives, read by a dog (the Courage the Cowardly Dog idea). A fence post really is a fence post; at dusk, to him, it's a tall thing on two legs that was not there this morning. Things that smell wrong, move when they shouldn't, or stare. He doesn't know what people-things are *for*, so an old fence line is fine, but everything must be something that would actually be in his meadow.

What follows from it (to build toward):
- **The dingo is the narrator.** Bestiary entries and loot flavour in his voice: "Tall. Still. Was not there before. Do not like."
- **Dog senses are the real tells.** Before a creature acts, *he* reacts: ears back, hackles up, a scent wisp from off-screen, a growl line. The player reads the dingo, not a status bar.
- **Night is worse because he can see less.** Same creatures, bigger silhouettes, more ember eyes. The lighting pass is the mechanic.
- **Dog values in the outcome (open question).** Chase off, shake, bury, dig up, rather than kill? Creatures could flee at low health and slip back later, like everything in a meadow does. "Rushed off" and "slips back" are already the game's words.

## Decisions
- **The hero is approved**: the game's own 62×38 flat two-tone dingo, redrawn with Carolina Dog proportions from GrumpyDingo's photo. Green collar with a brass tag (bandana retired). Ears sit back behind the eye.
- **Creatures are "things", not animals.** The method: *one plain idea, pushed one step, drawn flat, played straight.* Odd by day, lurking at dusk and night.
- **Must-rules** live in the `den-creature-design` skill: verified attachment, most creatures walk on jointed legs, joint data first (IK later), left-facers use the mirrored gait, one group per moving part, a different silhouette class and colour per creature, one feature per face and no smiles, asymmetry + a why + a tell, must read at 88px.
- **No generator yet.** Hand-draw and approve creatures first.
- GrumpyDingo judges each one; cuts are cheap.

## Approved (9)
| Creature | Class | What it is / what he sees | Tell | Trait | Colour | When |
|---|---|---|---|---|---|---|
| **Burrs** | swarm | hooked seed burrs that travel as a cloud on tiny legs; only one has an eye | hooks glow (Clinging) → Muddy Paws | swarm | dusty berry | day |
| **Puffball** | low | a swollen puffball on three root legs, a brown bruise, a split at the top; swells, then pops into two small puffs | swells (Swelling) | splitter | bone-cream | day |
| **Clockhead** | floating | a dandelion clock that never blows away; the seed cluster is a pupil, the head is an eye | seeds scatter (Scattering) → Spooked | flying | fog white | day |
| **Kindling** | low/fast | six uneven sticks bound with twine on six twig legs, one knot-eye, an ember inside | ember flares (Flaring) → Scorched | quick | ember brown | day/dusk |
| **Bramble** | mid | a blackberry tangle that uprooted itself, barging on four thorn legs; one ripe berry for an eye | thorns stand out, head lowers (Barging) | shover | dark green, berry | day |
| **Mound** | burrowing | a hump of fresh soil with a dirt trail; two pale digging claws; a pink nose tip | mound rises, nose out (Surfacing) | armored | fresh soil | day |
| **Fencepost** | tall/slow | a weathered post that pulled itself up, stalking on two splinter legs like a heron; rusty wire trails; a knot hole for a face | wire lifts (Wire up) | armored + thrower | weathered grey, rust | dusk |
| **Hollowhorn** | tall/slow | hunched bark thing wearing an old deer skull; one antler broken, one arm longer, pinpoint eyes in dark sockets, moss belly and tufts, clawed feet, lurching gait | eyes go ember (Angry) | healer (moss) | bark + moss | dusk/night |
| **Shade** | tall | a tree's shadow walking without its tree; a crown of branches for a head, one pale eye; translucent until a cloud passes | goes solid (Solid) | phasing | flat indigo | dusk/night |

## Cut
- Lost Glove (sausage fingers), Puddle (too subtle), Clod (didn't fit), Stray Boot and Scarecrow (people-things that don't belong in his meadow). Round Bale and Thresher dropped from the plan for the same reason.

## Meadow v1 roster
Nine approved cover: swarm, splitter, flying, quick, shover, armored, thrower, healer, phasing. Still uncovered: **shielded** and **summoner**, plus a boss. Ideas must be meadow things as the dingo reads them, and must walk: a snail shell with nothing in it (shielded), a wasp paper nest that flies on its own flaps (summoner), and for the boss something he has always been afraid of (the big old oak at the edge, when the wind gets in it).

## Path
1. Finish the Meadow bible (shielded, summoner, boss), each with a why, a tell in the dingo's body, drops.
2. Port into the game as a **creature registry** (paths, joints, palette + the CSS rig), replacing emoji one zone at a time.
3. Status engine hookup so tells are real, with the dingo's own reactions (ears, hackles, scent) as the first layer.
4. IK (library first, FABRIK-size) once bosses need planted feet, reaching arms, turning heads.

## How they're drawn (short)
62×38 viewBox, ground y≈35.5, creatures face left, dingo faces right. Flat fills: base, pale, dark, one accent. Limbs are stroked lines in nested groups with `transform-origin` at each joint; the game's keyframes (`hhip/hshank/hmeta`, `fsh/ffore/fpast`, `dbob`, `wag`, plus `armsw/armfo`, `nod`, `lurch`, `hover`, `bob/twitch`) drive them; left-facers use the `…L` mirrored set. Attachments are tagged (`data-root`, `data-base`, `data-in`) and verified by the page. Source: scratchpad `dingo/workbench.html`.
