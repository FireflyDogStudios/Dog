---
name: "den-dog-anatomy"
description: "Use when drawing, rigging, animating or fitting gear to the Den Game's hero (a Carolina Dog / American Dingo) or any canine in its flat style: breed spec, anatomy and joint bends, gaits, idle/alive motion, mistakes to avoid, fidelity-first review (big vector renders, three backgrounds, contrast paints), and the one-thing-at-a-time process."
---

# Den dog anatomy

The hero is a **Carolina Dog** (American Dingo, Dixie Dingo, Yellow Dog, "Yaller Dog"): a primitive pariah-type dog of the American Southeast, steeped in Native American heritage. He is a dog drawn by people who know dogs; get the dog right before anything decorative. GrumpyDingo judges every change; work **one issue at a time**, show it big and at game size, and wait.

## 1. The breed, from the UKC standard (what he must read as)

- **Silhouette:** medium size, light-to-medium bone, "a small jackal or a medium sighthound". Lean, athletic, never stocky. Rectangular but only just: medium-length straight back, distinct waist, **deep brisket to the elbow**, **high tuck-up** at the loin.
- **Size:** 18–24 in at the withers, roughly 35–50 lb. Height is a bit more than half the body length.
- **Head:** a **triangle** tapering to a strong pointed muzzle; slight but distinct **stop**; refined skull, never blocky; muzzle about as long as the skull; tight black lips; black nose with big nostrils.
- **Eyes:** almond, set at a slight angle, brown/amber/yellow, black rims. Soft, intelligent, cautious.
- **Ears:** large, **triangular, wide at the base, slightly rounded tips**, carried **upright when alert**, very mobile (rotate back). Set high on the back of the skull, not on the forehead.
- **Neck:** notably strong, **crested** (arched along the top), graceful, long enough to stab downward when hunting.
- **Front:** long, laid-back shoulders, defined forechest (prosternum), **straight forelegs set close together**, pasterns at 15–20°.
- **Back:** strong, straight, horizontal, maybe a slight rise over the loin.
- **Hindquarters:** powerful, **thick upper thigh**, legs set squarely under the dog, hock just behind the point of the buttock; upper and lower thigh equal length; **rear pasterns longer than front**.
- **Feet:** moderately small, compact, well-arched toes; never splayed.
- **Tail:** set as a **continuation of the spine**, the last third **bends back over itself: the fishhook**. Held at about 45° when alert, carried **down when gaiting**, low or tucked when wary. **Never curled over the back, never slack or straight.** Often a white tip and a lighter underside. GrumpyDingo's rule from the photos: the hook always turns **up and away** from the body; a tail bent in toward the body is an upset dog and sends the wrong message.
- **Coat and colour:** short, close; coarser guard hairs on neck, withers and back that **stand up when aroused** (the hackles tell). Ginger in every shade (red, straw, buff). **Pale buff "angel wings" over/behind the shoulders** (a soft sweep lying along the shoulder blade, broad near the withers, trailing back over the ribs; never a round sticker), lighter chest and underside, pale muzzle/throat. Black, black-and-tan and piebald also exist; no merle, no dilute, no white.
- **Movement:** long, low, free, effortless; built for a double-suspension gallop. Faults: high choppy gait, moving close behind.
- **Temperament for the art:** shy and suspicious of strangers, soft with the pack. Tells: ears, hackles, tail height.

## 2. Anatomy, as it applies to a side view (dog faces right in our drawings)

Human-term map and **which way things bend**:
- **Shoulder blade** lies on the ribcage, angled back about 45°; the shoulder joint is near the point of the chest. **Upper arm** runs back-and-down to the **elbow, which sits at the bottom of the chest** (brisket level). **Forearm** drops straight to the **wrist (carpus)**, which bends **backward** (a slight forward lean of the pastern is normal). Then the **paw**: dogs are **digitigrade**, standing on their toes; what looks like a long foot is the pastern.
- **Pelvis** slopes down to the tail. **Hip** sits inside the rump. **Thigh (femur)** runs **forward-and-down** to the **stifle (knee), which bends forward like ours**. **Lower thigh (gaskin)** runs **back-and-down** to the **hock (ankle/heel)**, which points **backward**: it is the heel held up off the ground, not a backwards knee. The **rear pastern** (metatarsus) drops to the paw.
- At rest the hind leg zig-zags: hip → stifle forward → hock back → paw under the hip; standing square, the rear pastern is vertical and the hock sits just behind the point of the buttock. The front leg is nearly straight: shoulder → elbow → straight down.
- **Neck** enters the skull at the **back/base**, not the top; the throat line runs from under the jaw down to the forechest. The crest is the arched top line of the neck.
- **Chest line:** the throat drops steeply, the forechest holds forward at shoulder level, then the line sweeps down and back to the brisket under the elbow; deepest just behind the front legs; the belly rises to the loin (tuck-up); the rump is full (thigh muscle), not a point.
- **Tail** starts where the spine ends (croup), not stuck on the rump's edge: the back line slopes into the tail root, and the root is drawn from inside the croup so no blunt end shows.

## 3. Our rig (RIG, `engine/rig_den.js`) and how anatomy maps onto it

Drawing space 62×38, ground y ≈ 35.5, the hero faces right. Joints are containers with an `origin` at the joint, nested hip→stifle→hock→toe and shoulder→elbow→pastern→toe. Limbs are **tapered capsules** (`limb(a, b, w0, w1)`): thigh wide and blending into the rump, gaskin medium, cannon thin; upper arm medium, forearm and pastern thin. Paws are their own parts on toe joints (`htoe*`, `ftoe*`) so they peel and plant. Far-side legs are tinted ×.78 and drawn before the body; near legs after, so they cross gear like real legs. The tail is a **ribbon along a curve** (`ribbon(pts, w0, w1, side)`), the pale half on the **underside** (bottom edge at the root, outer edge of the hook), a round cap on the tip, wagging from the croup. In `engine/rig.js` an animated limb joint draws its own part **under** its child joint, so the upper arm sits under the forearm and the thigh under the shank; a limb's rounded end never shows as a knob on the next segment.

Current `hero2` proportions (measured off GrumpyDingo's references): dog spans x 11..54, y 0..35.5; back line y ≈ 11–12; brisket y ≈ 23; tuck y ≈ 20; hip (20.4,16.6), stifle (22.6,22.2), hock (17.2,26.6), hind paw (17.2,34.5); shoulder (42.6,15.4), elbow (40,21.8), pastern (40.2,30.4), front paw (41.4,34.5); tail root (23.4,13.6) inside the croup, carried out behind and a little up, the last third hooking up and away (tip near (11,6)).

Tells map to rig states: `ears-back`, `ears-up`, `howl` exist; `head-low`, `shake`, `paw-shake`, `fluff` (hackles) need a head joint and a hackle part.

## 4. Gaits (for the tracks on these joints)

Phase is a fraction of one stride; legs run the same track with an offset.
- **Walk** (4-beat, lateral sequence): BL → FL → BR → FR, each a quarter stride apart; 2–3 feet always down; body rocks side to side; head bobs slightly, out of phase. Ours: hind far 0, front far .25, hind near .5, front near .75.
- **Amble:** same order, faster, one foot always up. **Pace:** same-side pairs together (tired dog, camel). Avoid for the hero.
- **Trot** (2-beat diagonal): BR+FL together, then BL+FR, with a small bounce between beats. The gait he should spend most time in when hurrying (Zoomies). Phase: diagonal pairs equal, the other pair .5.
- **Canter** (3-beat + suspension): BL → BR+FR → FL → air. Pronounced back-to-front rocking.
- **Gallop (rotatory, a dog's fastest):** BL → BR → air → FR → FL → air; the trunk compresses hardest as the front lifts and stretches longest just before the front lands. Use for Pounce and going home.
- Animation rules: front paws **peel** off with a wrist break; hind paws plant flatter; hips and shoulders shift with the weight; the head leads a little late; tail joints trail in a wave. **Never slide a planted foot.**
- A gait is just another set of tracks on the same joints, picked by speed and blended over a stride; a drawing change never needs an animation change.
- Cross-check for timing only: the OpenCat robot's gait tables (MIT, `scratchpad/ref/opencat/src/InstinctBittle.h`: `wkF` walk, `trF` trot, `crF` crawl, `bdF` bound, `bk` back-up; 8 columns = 4 shoulder then 4 knee servo angles per frame) give duty factors and which legs move together. The robot has 2-joint legs, so its angles do **not** transfer to our 3-joint digitigrade leg; GrumpyDingo's gait sheet and real dog footage decide the shapes.

## 5. Alive, not a machine (idle and secondary motion)

A dog standing still is never still. What separates an icon from a creature is continuous low-amplitude motion underneath everything, run as `always` tracks on the rig, never started and stopped with states:
- **Breathe:** body scale ~1.00→1.02, period ~2 s, sine, never below 1. Pivot at the feet (bottom-centre), not the body centre.
- **Blink:** eye part hidden for ~120 ms every 3–6 s (jittered by a seeded value, never `Math.random`). **Ear flick:** one ear rotates a few degrees for a beat, rarely. **Tail:** slow wag at rest, faster and higher when happy, low and still when wary; the tail trails the body (follow-through), it does not lead.
- **Weight shift:** a tiny rock (±1°) on the body, slower than breathing.
- During a big move (Pounce, Whirl, go-home) scale idle amplitude down to ~0.1 over the first 40% of the move with a sine in-out, never to 0 (dead) and not 0.3 (competes with the move); ramp back the same way after. One idle timeline per rig; amplitude is a parameter.
- **Anticipation:** before a leap he crouches (hind compress, head drops) for ~100 ms. **Follow-through / stagger:** head settles after the body, ears after the head, tail last (offset each by ~50 ms). **Easing:** state changes ease in-out (sine for ambient, power2 for moves); linear only for continuous spins and fades. **Arcs:** anything that travels follows a curve, not a straight line. Duration encodes mass: a 40 lb dog's pose change is ~0.3–0.5 s, never instant.
- Diagnostics: robotic → linear easing; floaty → no anticipation or stagger; dead between moves → no idle; jarring → too short.

## 6. Mistakes to avoid (the ones we have made or nearly made)

- Legs as **tubes of one width** off an egg: the "robot dog". Give the thigh and upper arm mass; taper down the leg.
- Treating the **hock as a backward knee**. The hind leg has two bends: stifle forward, hock back. Over-angulated hind legs read as **"chicken legs"**: keep the hock just behind the buttock and the paw under the hip.
- **Elbow too high** or floating: it belongs at the brisket.
- **Tail from the wrong place or the wrong way**: it continues the spine from the croup; it hangs and hooks (fishhook), it does not curl over the back and it is not a stiff slant. A ribbon tail's blunt root must start inside the body or it pokes above the croup. When in doubt, look at the outline reference again, carefully, before redrawing.
- **Bull-terrier head**: a straight-topped egg with no stop. He is a triangle with a stop and a pointed muzzle.
- **Ears on the forehead** or too small. High, at the back of the skull, big.
- **Pale parts drawn as separate blobs** that poke past the fur (the old tail underside). Cut pale shapes from the fur shape's own edge, inset.
- **Markings as stickers:** the angel wing is a soft sweep along the blade, not a round patch.
- **Lines on the paws** (toe lines) read as cracks at game size; leave paws as plain shapes.
- **Chest too shallow, no tuck-up**, or a chest that is one backward slant with no forechest: reads as a sausage. Deep brisket, forechest, waist, tuck.
- **Long-and-low** proportions: he is leggy and nearly square, not a corgi.
- Decorating before the dog is right: gear is fitted after the body is approved, and refitted whenever the body changes.
- **A knob at a joint** is usually draw order, not the drawing: check which part is on top (contrast paint) before reshaping anything.

## 7. Fidelity first (GrumpyDingo's rules for looking)

- **Higher fidelity always makes the work easier.** Never judge a drawing from a small or blurry image. Render the rig itself big as vectors (14× or more); crop and enlarge one part when a detail is in question; keep the game-size shot only as the final "does it still read" check.
- **If zooming in makes it blurry, the source was too small.** Blur means pixels were scaled, not shapes. Go back and render bigger instead of squinting; a blurry crop is not evidence of anything.
- **Paint the part you're looking at in a contrasting colour.** When a part blends into the parts around it (fur on fur, pale on pale) it is impossible to tell where it starts, which part is on top, or whether the shape is right. Re-define the rig with that part's paint swapped for something loud (red, cyan), render, and the shape and the draw order show themselves. Write down the original colours before swapping and put them back after; the debug render never gets published. (`RIG.define(id, {...RIG.DEFS[id], palette:{...RIG.DEFS[id].palette, pale2:"#ff0000"}})` works because `define` clears the cached geometry; `build` with a palette option alone does not, the cache ignores it.)
- **Three flat backgrounds**, pink / black / blue, for every review (section 8). The sand hides the dog.
- If the tools at hand make something hard to see, work with or check (a bench that hides a state, a library that fights the task), **say so to GrumpyDingo plainly and early** and propose the tool, skill or research that would fix it, instead of pushing through half-blind. He would rather hear the complaint than get a worse dog.

## 8. Process (how we actually work on him)

1. Put the reference beside the drawing (GrumpyDingo's outline and side-view art; the UKC words above). **Never trace a stock image**; measure proportions off it and draw our own in our style.
2. Change **one thing**, rebuild the Gear Bench (`python3 pixi/bench/build_gear_bench.py` → `collar.html`).
3. **Review on three flat backgrounds, big.** Run `node pixi/bench/shot_hero.js <outdir> [rigId] [states] [walk]`: it renders the rig as vectors at 14× (never a pixel zoom of a small shot, which blurs every edge) on **dev pink (#ff00ff), black and bluescreen blue (#0000ff)**, plus one game-size shot on the meadow sand. Look at all three closely: pink shows the fur edge and the pale cut-outs, black shows the outline and any notch or blunt end, blue shows the darker far legs and the ink. Then the game-size one, because that is what the player sees. Walk the drawing against sections 1, 2 and 6 landmark by landmark (head, ears, neck, chest line, elbow, pasterns, back, croup, tail root, tail hook, hip, stifle, hock, paws, markings) and note what is off, in order of how much it breaks the dog. Never judge from the meadow stage alone: the sand is the dog's colour and hides everything.
4. Suggest the improvements that review found, each with the skill's reason. When unsure whether something is right for the breed, look it up (the UKC standard, breed photos, canine anatomy references) or ask GrumpyDingo rather than guessing.
5. Show it on the Hero tab and wait for GrumpyDingo's call. Cuts are cheap; don't argue for a drawing.
6. When the body changes, retrace the gear that sits on it (collar line, armor silhouette, tail curve for guard and rings) in `engine/gear.js`.
7. Keep joints and tracks stable so the gait and tells carry over; a drawing change should never require an animation change.
8. Drawing never touches `Math.random`; the kill checks must stay identical after any hero change that reaches the game.
9. Outside material lives in `scratchpad/ref/` (OpenCat gait tables; the svg-character-animator idle/motion notes; the svg-design path reference). Learn the timing and the principles from them; the drawing stays ours.

Sources: UKC Carolina Dog standard (ukcdogs.com/docs/breeds/carolina-dog-ukc.pdf), Animator Notebook quadruped gaits, Animation Mentor quadruped walk cycle, OrthoDog dog leg anatomy, Chewy and Dimensions Carolina Dog pages, PetoiCamp OpenCat (MIT) gait tables, molauu/svg-character-animator (MIT) idle-animation and motion-design references.

## 9. Gear fits through connection points

The whole method is written down in `docs/claude/DEN-GEAR-PIPELINE.md`; read it before fitting anything. (collars, rings, armor, paw covers)

The old `hero` stays in the game as the first companion and `hero2` is the player's dog, so **every piece is drawn once and fits both**.
- Each dog publishes **connection points** in `GEAR.MOUNTS` (`engine/gear.js`): the footprint of its own collar band as two edges R and F, and later the tail curve, paw seats and the hem. A piece is drawn against the mount, never against one dog's numbers. A new dog is one more row. A piece's code is identical on every dog; only the mount changes.
- **Never trust a number you typed.** The fit sheet and the shape can disagree (hero2's collar was drawn at 57° while the sheet and GrumpyDingo's red line said 35°). Measure from the rig's own data with Den Lens (`tools/lens/`) and fix the shape.
- **Flush means flush.** A band that wraps the neck runs past both ends and is cut to the dog's body outline, so it closes the gap and never pokes into the air. Do this offline (`python3 tools/lens/compile_mounts.py`, shapely), not with masks at runtime. The dog's own collar and tag are hidden while a gear collar is worn (`parts.hides`).
- **Rings and materials (GrumpyDingo, Oct 5):** a tail ring is the FITTING material (a metal, antler, or one of the two woods); the band material is the gem's socket, a slightly larger diamond behind the gem, shown as an empty setting when there is no gem. Oak and Dark wood are also fittings for every piece (appended to the end of the list inside `GEAR.init`, so existing codes keep their meaning). **Ring slots are the guard's own gaps** (`GEAR.ringSlots(rig)`, from `guardLayout`): never place a ring from a separate number.
- **Torso layering (GrumpyDingo, Oct 5):** the torso piece is drawn over the legs (the leg tops are under it, the legs emerge below the hem, so no cut-outs are needed because the hem sits above the elbow and the stifle) and under the collar. Gear that must draw above the limbs is hosted at the root with `parts.follow = "body"` so it copies the body joint's transform each tick and bobs with the body; `RIG.attach` does the hosting. Shapes are cut from the dog's own outline in `tools/lens/compile_mounts.py`. One style (Hide) is nailed on both dogs before any other style; styles must differ in silhouette and construction, not only decoration. The twelve slots: tail guard, three rings, collar, torso, four bracelets (two per front leg), paw covers (one slot, drawn on all four paws: a continuous leg sock under a shoe; the thigh sleeve tucks into the sock and the sock into the shoe, so the shoe is over everything), helmet (ears free).
- **Review without distractions:** render with the dog's own collar and tag hidden (`lens.cjs shot --hide collar,tag,tag2`), on pink, black and blue, big, with the grid (`--grid`), and as a before/after ghost (`diff.py`). Both dogs side by side in every review.

## 10. Clean art standards (the style sheet and the lint)

GrumpyDingo's call, Oct 4: stray bits and messy ends are not acceptable; apply the usual vector and 2D-game standards.
- **Line weights come from one style sheet** (`LINE` in `engine/gear.js`): contour (a piece's silhouette), interior (parts inside a piece), detail. Visible widths .32 / .22 / .14 drawing units. No other weights without adding them to the sheet.
- **One outline per shape.** Draw a closed shape as a stroke UNDER its fill at twice the weight, round joins and caps. Do not stack a separate end stroke, a clip mask and an outline on one edge: that is what made the first collar "messy".
- **Merge, don't overlap.** Combine shapes with a boolean (shapely, or skia-pathops) into one closed path; never leave two shapes meeting by overlap.
- **Round every convex corner** to at least the contour weight (the compile step uses a .32 radius). A corner sharper than the line renders as a spur.
- **No stray parts:** no fragments below a minimum area, no duplicate or near-duplicate nodes, nothing hanging outside the silhouette except what is meant to hang (tags, rope tails).
- **Run `python3 tools/lens/lint.py <code>` before showing GrumpyDingo anything.** It checks flush, gaps, stray fragments, spurs, duplicate nodes and weights on every dog, and exits non-zero on a failure.
- Tools to know: Den Lens (`lens.cjs shot | probe | piece | export`, `geom.py`, `measure_image.py`, `diff.py`, `refoverlay.py`, `place_band.py`, `compile_mounts.py`, `lint.py`). Measure; do not eyeball. Sources behind the standards: consistent weight and silhouette hierarchy (2dgameartguru, clearly.sh outline guide), boolean/union over overlaps and stray-node cleanup (Illustrator clean-up practice), picosvg/skia-pathops for path cleanup.

