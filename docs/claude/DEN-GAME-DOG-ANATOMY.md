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
- **Tail:** set as a **continuation of the spine**, the last third **bends back over itself: the fishhook**. Held at about 45° when alert, carried **down when gaiting**, low or tucked when wary. **Never curled over the back, never slack or straight.** Often a white tip and a lighter underside.
- **Coat and colour:** short, close; coarser guard hairs on neck, withers and back that **stand up when aroused** (the hackles tell). Ginger in every shade (red, straw, buff). **Pale buff "angel wings" over/behind the shoulders**, lighter chest and underside, pale muzzle/throat. Black, black-and-tan and piebald also exist; no merle, no dilute, no white.
- **Movement:** long, low, free, effortless; built for a double-suspension gallop. Faults: high choppy gait, moving close behind.
- **Temperament for the art:** shy and suspicious of strangers, soft with the pack. Tells: ears, hackles, tail height.

## 2. Anatomy, as it applies to a side view (dog faces right in our drawings)

Human-term map and **which way things bend**:
- **Shoulder blade** lies on the ribcage, angled back about 45°; the shoulder joint is near the point of the chest. **Upper arm** runs back-and-down to the **elbow, which sits at the bottom of the chest** (brisket level). **Forearm** drops straight to the **wrist (carpus)**, which bends **backward** (a slight forward lean of the pastern is normal). Then the **paw**: dogs are **digitigrade**, standing on their toes; what looks like a long foot is the pastern.
- **Pelvis** slopes down to the tail. **Hip** sits inside the rump. **Thigh (femur)** runs **forward-and-down** to the **stifle (knee), which bends forward like ours**. **Lower thigh (gaskin)** runs **back-and-down** to the **hock (ankle/heel)**, which points **backward**: it is the heel held up off the ground, not a backwards knee. The **rear pastern** (metatarsus) drops to the paw.
- At rest the hind leg zig-zags: hip → stifle forward → hock back → paw under the hip. The front leg is nearly straight: shoulder → elbow → straight down.
- **Neck** enters the skull at the **back/base**, not the top; the throat line runs from under the jaw down to the forechest. The crest is the arched top line of the neck.
- **Tail** starts where the spine ends (croup), not stuck on the rump's edge.
- **Chest:** deepest just behind the front legs; the belly rises to the loin (tuck-up); the rump is full (thigh muscle), not a point.

## 3. Our rig (RIG, `engine/rig_den.js`) and how anatomy maps onto it

Drawing space 62×38, ground y ≈ 35.5, the hero faces right. Joints are containers with an `origin` at the joint, nested hip→stifle→hock and shoulder→elbow→pastern. Limbs are **tapered capsules** (`limb(a, b, w0, w1)`): thigh wide and blending into the rump, gaskin medium, cannon thin; upper arm medium, forearm and pastern thin. Far-side legs are tinted ×.78 and drawn before the body; near legs after, so they cross gear like real legs. The tail is a **ribbon along a curve** (`ribbon(pts, w0, w1, side)`), the pale half on the inside of the hook, wagging from the croup.

Current hero proportions (measured off GrumpyDingo's references): dog spans x 11..52, y 0..35.5; back line y ≈ 11–12; brisket y ≈ 23; tuck y ≈ 20; hip (20.2,16.4), stifle (21,22.8), hock (15.6,27.8), hind paw (14.6,34.5); shoulder (40.2,13.4), elbow (40,21.6), pastern (40.2,30.4), front paw (40.9,34.5); tail root (21.4,12.6), hanging behind the hocks and hooking back out at the tip.

Tells map to rig states: `ears-back`, `ears-up`, `howl` exist; `head-low`, `shake`, `paw-shake`, `fluff` (hackles) need a head joint and a hackle part.

## 4. Gaits (for the tracks on these joints)

Phase is a fraction of one stride; legs run the same track with an offset.
- **Walk** (4-beat, lateral sequence): BL → FL → BR → FR, each a quarter stride apart; 2–3 feet always down; body rocks side to side; head bobs slightly, out of phase. Ours: hind far 0, front far .25, hind near .5, front near .75.
- **Amble:** same order, faster, one foot always up. **Pace:** same-side pairs together (tired dog, camel). Avoid for the hero.
- **Trot** (2-beat diagonal): BR+FL together, then BL+FR, with a small bounce between beats. The gait he should spend most time in when hurrying (Zoomies). Phase: diagonal pairs equal, the other pair .5.
- **Canter** (3-beat + suspension): BL → BR+FR → FL → air. Pronounced back-to-front rocking.
- **Gallop (rotatory, a dog's fastest):** BL → BR → air → FR → FL → air; the trunk compresses hardest as the front lifts and stretches longest just before the front lands. Use for Pounce and going home.
- Animation rules: front paws **peel** off with a wrist break; hind paws plant flatter; hips and shoulders shift with the weight; the head leads a little late; tail joints trail in a wave. **Never slide a planted foot.**

## 5. Mistakes to avoid (the ones we have made or nearly made)

- Legs as **tubes of one width** off an egg: the "robot dog". Give the thigh and upper arm mass; taper down the leg.
- Treating the **hock as a backward knee**. The hind leg has two bends: stifle forward, hock back.
- **Elbow too high** or floating: it belongs at the brisket.
- **Tail from the wrong place or the wrong way**: it continues the spine from the croup; it hangs and hooks (fishhook), it does not curl over the back and it is not a stiff slant. When in doubt, look at the outline reference again, carefully, before redrawing.
- **Bull-terrier head**: a straight-topped egg with no stop. He is a triangle with a stop and a pointed muzzle.
- **Ears on the forehead** or too small. High, at the back of the skull, big.
- **Pale parts drawn as separate blobs** that poke past the fur (the old tail underside). Cut pale shapes from the fur shape's own edge, inset.
- **Chest too shallow, no tuck-up**: reads as a sausage. Deep brisket, waist, tuck.
- **Long-and-low** proportions: he is leggy and nearly square, not a corgi.
- Decorating before the dog is right: gear is fitted after the body is approved, and refitted whenever the body changes.

## 6. Process (how we actually work on him)

1. Put the reference beside the drawing (GrumpyDingo's outline and side-view art; the UKC words above). **Never trace a stock image**; measure proportions off it and draw our own in our style.
2. Change **one thing**, rebuild the Gear Bench (`pixi/bench/gear.tpl.html` → `collar.html`), screenshot big and game-size, and look at it before showing it.
3. Show it on the Hero tab and wait for GrumpyDingo's call. Cuts are cheap; don't argue for a drawing.
4. When the body changes, retrace the gear that sits on it (collar line, armor silhouette, tail curve for guard and rings) in `engine/gear.js`.
5. Keep joints and tracks stable so the gait and tells carry over; a drawing change should never require an animation change.
6. Drawing never touches `Math.random`; the kill checks must stay identical after any hero change that reaches the game.

Sources: [UKC Carolina Dog standard](https://www.ukcdogs.com/docs/breeds/carolina-dog-ukc.pdf), [Animator Notebook: quadruped gaits](https://www.animatornotebook.com/learn/quadrupeds-gaits), [Animation Mentor: quadruped walk cycle](https://www.animationmentor.com/blog/tutorial-how-to-animate-a-quadruped-walk-cycle/), [OrthoDog: dog leg anatomy](https://orthodog.com/article/dog-leg-anatomy/), [Chewy: Carolina Dog](https://www.chewy.com/education/dog-breeds/carolina-dog), [Dimensions: Carolina Dog](https://www.dimensions.com/element/carolina-dog).