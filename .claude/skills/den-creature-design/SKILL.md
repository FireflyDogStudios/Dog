---
name: "den-creature-design"
description: "Use when designing or drawing a creature, monster or character for The Den Game (or any flat 2D game art): must-rules (verified attachment, most creatures walk on jointed legs, joint-data rigs ready for IK, mirrored gait for left-facers), horror/wrongness rules, the game's flat two-tone SVG language and CSS walk rig, and the iterate-with-screenshots process."
---

# Den creature design

How to design and draw a creature (or the hero) for The Den Game so it reads at 88px, sits next to the dingo and the Smithy weapons, and feels right. Learned on the Den Dingo Workbench (Oct 2026) with GrumpyDingo. The bible of approved creatures lives in the project doc `claude/DEN-GAME-CREATURES.md`.

## 0. Must-rules (never post a round that breaks one)

1. **Everything is attached, and it is verified, not eyeballed.** Every limb root and every attachment base (ears, tufts, antlers, collar ends, tails, hats, wire) lies inside the part it hangs from. Tag roots with `data-root="x,y"` and bases with `data-base="x,y;x,y"` (plus `data-in="class"` when the host is a sub-part like a head, not the `.bodyp` body). The Workbench tests each point with `isPointInFill` and shows a red dot and a line of text per creature; a round is posted only when every creature says "all parts attached". Points exactly on the edge count as outside: put bases 0.5–1 unit inside.
2. **Most creatures walk on jointed legs.** Legless is allowed only when the idea *is* the movement (a clod that hops, a seed head that drifts), and never more than a third of a zone's roster. Legs use the rig below so the animation and later IK are real. A thing that "stomps" or "stalks" gets an ankle or a knee, not a rocking blob. (GrumpyDingo: "we are starting to have a lot of creatures without legs".)
3. **Joint data first, drawing second.** A creature is defined as data: per limb `{root:[x,y], joints:[[x,y,width],...]}`, plus body paths. The SVG is rendered from that data. CSS keyframes drive the joint angles today; an IK solver (FABRIK or a small library, libraries first) can drive the same joints later for planted feet, reaching arms and heads that turn. Nested `<g>` per joint with `transform-origin` at the joint is the rig.
4. **Facing picks the gait.** The game's keyframes are for walking right (the dingo). Anything facing left gets the `left` class and the mirrored set (`hhipL/hshankL/hmetaL`, `fshL/fforeL/fpastL`, `armswL/armfoL`); otherwise it moonwalks.
5. **Parts that move together are one group** with one origin (tail + its pale underside, head + skull + eyes + hat, boot shaft + laces at the ankle).
6. **Silhouette class before detail.** Each new creature picks a class: tall/slow, low/fast, flying, swarm, floating, burrowing, mid/stomping. Silhouettes must differ before colours do, and every creature owns one colour nobody else has.
7. **One feature carries the face. No smile on anything that lurks.**
8. **Asymmetry somewhere, a why for every part, and a tell before it acts** (ember flares, eyes go ember, laces stand up, wire lifts, head turns first).
9. **It must read at 88px.** The game-size mini in the corner of the Workbench is the real test.

## 1. Process (do this, not a generator)

1. **One thing at a time.** Design one creature on one board; batches of three at most, each a different class. No parametric generator until hand-drawn creatures have been approved; a generator later is built from them as templates.
2. **Start from what exists.** Read the game's current drawing of the thing (the dingo is a 62×38 flat SVG with jointed stick legs). Keep its language and fix proportions, rather than inventing a new drawing.
3. **Get a reference photo** from the user before drawing a real animal, and trace proportions from it (scale and mirror the photo into the drawing's coordinate space, then place landmarks). Breed standards help with words, photos help with shapes.
4. **Iterate against screenshots.** Draw → render locally (Playwright) → look → fix one or two things → repeat. Post a round every 3–4 fixes, say what still bugs you, and ask for plain-words feedback.
5. **Build mockups as an artifact page**, not PNGs: a Workbench with "Now" beside "Next", walk and paint toggles, mood toggles per creature, the attachment check, and every creature at game size in a corner.
6. **GrumpyDingo judges; cuts are cheap.** Anything that doesn't make the cut is removed from the Workbench and noted in the bible under Cut, with the reason; its trait slot goes back on the list.
7. **Honest self-review.** If it looks like "a creature from the deep", say so before the user does. Dog anatomy from memory is unreliable; photos fix it. Legless blobs are the easy way out; notice when you reach for them.

## 2. Drawing language (the game's style)

- **Flat silhouette, no gradients.** One base colour, one pale second tone, one dark for eyes/nose, one accent (collar, ember, moss). Far-side limbs get `filter: brightness(.72–.78)`.
- **62×38 viewBox**, ground at y≈35.5, drawn in the direction the thing moves (dingo faces right, creatures face left). `overflow: visible` so ears/antlers can poke above.
- **Jointed limbs as stroked lines** in nested groups: hind leg = `hip → stifle (shank) → hock (meta) → paw`, foreleg = `shoulder → elbow (fore) → pastern (past) → paw`. Each group sets `transform-origin` at its joint and `--ph` phase. Keyframes: `hhip/hshank/hmeta`, `fsh/ffore/fpast`, body `dbob`, tail `wag` from the root; arms `armsw/armfo`, head `nod`; extras `hover`, `hop`, `stomp` + `ankle`, `bob`/`twitch` for swarms. Slow creatures get a longer `--stride`; skitterers a short one with 3 phases. The same rig makes digging claws (front rig on a mound) and heron legs (hind rig on a post).
- **Attachments must sit inside the body**: ear and tuft bases 0.5–1 unit inside the silhouette; limb roots inside the body; collars/bands end on the body edge (compute the edge, don't eyeball). Accessories that rotate with a part live inside that part's group.
- **Compute attachments on curves**: sample the body's bezier at t, offset the base inward along the normal, point the tip outward. Don't hand-place spikes or ears.
- Keep hero and creatures in the same language so they never fight; the Smithy weapons are cel-shaded with a dark outline, so an outlined variant is the bridge if needed.

## 3. Real-animal proportions (Carolina Dog / dingo hero)

From the reference photo and the UKC standard: body ≈1.2× shoulder height; legs ≈55–60% of height with the elbow at the brisket; hock behind the buttock; neck rises forward with the head carried ahead of the chest, not on top; pointed wedge muzzle about as long as the skull; big near-equilateral ears set high and back on the skull (behind the eye), leaning forward; fish-hook tail hanging to the hock; ginger with pale throat, chest, belly, muzzle and lower legs. A green collar (bandana retired).

## 4. Creature design rules (from Fundamentals of Creature Design + horror creature-design writing)

- **The method: one plain idea, pushed one step, drawn flat, played straight.** Firewood that walks. A boot that stomps. Odd by day, lurking by night; the lighting pass does the rest. It's an attitude, not a borrowed style.
- **Made from what is actually lying around the zone.** Meadow: turf, firewood, seed heads, burrs, bones, a lost boot, fence posts, molehills, hay, a scarecrow, the rusted machine at the field edge.
- **Silhouette first.** The outline must say what it is (and that it is wrong) before any detail.
- **Every part has a why.** Even an invented creature follows function; decoration without reason reads random.
- **Asymmetry unsettles.** One antler broken, one arm longer, eyes of two sizes, sticks of uneven length.
- **The familiar, worn wrong.** Recognisable things on the wrong body (a deer skull worn as a face; firewood that walks). This is the strongest single trick.
- **Fewer facial features, not more.** No smile. Hollow sockets with pinpoint eyes, a knot hole, one button: a mouth reads as a friend.
- **Movement is character.** Slow, inevitable walks for the big ones; skittering for the small ones; a stomp for a boot; a heron stalk for a post.
- **Restraint.** Don't show everything at once; a glow or a status tint can carry the reveal.
- **Each creature takes a combat trait slot** (swarm, flying, quick, armored, splitter, shielded, healer, phasing, shover, thrower, summoner) so weapon counters keep meaning something.

## 5. Checklist before showing a round

- Attachment check clean for every creature (no red dots)?
- Does it walk on jointed legs, or is legless truly the idea? Zone still under one-third legless?
- Left-facer has the `left` class?
- Parts that move together are in one group?
- Reads at game size in the corner?
- Silhouette class and colour differ from every existing creature?
- Pale second tone where it belongs (for animals: throat, chest, belly, lower legs)?
- No smile on anything meant to lurk; one feature carries the face.
- Say what still bugs you, in order, and ask for feedback in plain words.

## Clean art standards
Creatures follow the same clean-art standards as the hero: the line-weight style sheet, one outline per shape, merged shapes instead of overlaps, rounded corners, no stray parts, and measuring with Den Lens (`tools/lens/`). See sections 9 and 10 of the `den-dog-anatomy` skill for the full list.
