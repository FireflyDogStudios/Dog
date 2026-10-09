# Den Game — hero2 fit sheet

The dimensions of the new hero (`hero2` in `engine/rig_den.js`, bench v39, Oct 3 2026) for fitting gear in `engine/gear.js`. Everything is in the rig's 62×38 drawing space, dog facing right, ground at y 35.5. All numbers are copied from the rig; when the rig changes, this sheet changes with it.

## 1. Overall

- Dog spans x 9.8..54.0 (tail tip to nose), y −1.8..35.5 (ear tip to paws). Body without head: rump 17.7 to forechest 46.8.
- Withers y ≈ 11.0 (x 37); back line y 11.6–12.1 (x 23–33); croup corner (23.2, 11.6) sloping into the tail root.
- Brisket (deepest chest) y 23.3 at x ≈ 39.5; tuck-up (belly meets thigh) at (25.0, 19.8).
- Height withers → ground 24.5; body length rump → forechest 29.1 (ratio 1.19, near-square per the standard).
- Palette: fur `#dca45e`, pale `#f6e9cf` (chest, tail underside, ear inside), pale2 `#f0dcb4` (lower legs, paws), wing `#e8bc7c`, ink `#2a1a10`, collar `#3f8a4f`, tag `#d9a441` / `#8a5a1a`. Far-side legs ×.78.

## 2. Body outline (`body2`, one path, drawn in the `body` joint)

`M23.2 11.6 C27 11.9 33 12.1 37.2 11.0 C39.4 10.0 41.2 8.0 42.6 5.8 C43.6 4.3 45.6 3.9 47.2 5.4 L47.6 5.9 C49.6 6.3 51.8 7.4 53.6 8.6 C54.0 9.1 53.8 9.7 53.1 9.9 C51.4 10.4 49.5 10.8 47.6 10.8 C46.8 11.6 46.2 12.6 46.0 13.8 C46.3 15.2 46.4 16.6 45.8 18.2 C45.0 20.6 43.0 22.6 40.2 23.2 C39.0 23.3 37.8 23.1 36.6 22.8 C33 22.5 28 21.6 25.0 19.8 C23.4 18.9 21.4 18.4 19.6 17.6 C17.6 16.4 17.4 14.0 19.6 12.8 C20.8 12.1 22.2 11.7 23.2 11.6 Z`

Landmarks along it: croup (23.2,11.6) → back → withers (37.2,11.0) → crest → occiput (42.6,5.8) → skull top → stop (47.2,5.4) → muzzle top → nose (53.6,8.6) → lip (53.1,9.9) → jaw (47.6,10.8) → throat (46.0,13.8) → forechest, holds forward (46.4,16.6) → brisket (40.2,23.2) → belly → tuck (25.0,19.8) → flank → rump (17.5,15) → croup.

Neck cross-section at the collar line: crest point (41.6, 7.0) to throat point (46.8, 14.2); the neck is 9.0 across there, measured along that line, which leans 54° from vertical. Head: eye ellipse (46.1,7.1) 0.9×0.6 on the skull behind the stop; nose circle (53.3,8.7) r .85; pale muzzle strip under the lip; pale chest strip `chest2` inset along the whole front edge from the jaw to the brisket.

## 3. Collar line (for `collar` and the armor's top edge)

- Base collar `band2`: `M40.1 8.8 C40.2 7.8 40.9 7.1 41.6 7.0 C44.0 9.0 45.7 11.3 46.8 14.2 C46.6 15.0 45.9 15.5 45.3 15.4 C44.3 12.6 42.6 10.3 40.1 8.8 Z`. Rear (upper) edge from (41.6,7.0) to (46.8,14.2); front (lower) edge from (40.1,8.8) to (45.3,15.4); band is 1.6 wide along the neck; both ends overhang the outline (0.9 above the crest, 0.7 past the throat) so it reads as a loop around the neck, with rounded ends.
- Tag hangs at (46.3, 15.0), r .65.
- A gear collar replaces this band: same two edges, same overhang, and the collar's lower edge is where body armor starts.
- The crest line behind the collar (for a wider collar or a yoke): at x 40 the crest is y 9.4; at x 38 it is y 10.4; the withers at (37.2,11.0).

## 4. Front legs (joints `shN`/`shF` → `foreN` → `pastN` → `ftoeN`)

- Shoulder (42.6, 15.4) — point of the chest; elbow (40.0, 21.8) — at the brisket; wrist (40.4, 30.4); paw (40.8, 34.5). Forearm vertical, pastern within a few degrees of vertical.
- Upper arm capsule 4.8→2.8 wide (fur); forearm 2.5→1.9 (pale2) with a fur elbow point drawn over its top (2.9→2.4, 0.7 long); pastern 1.9→1.6 (pale2); paw `pawShape` on the toe joint: from x−1.1 to x+3.0, y−1.0 to y+1.05 around the paw point.
- Bracelet seat: the forearm between y 23.5 (just under the elbow point) and y 29.5 (above the wrist), x centre ≈ 40.2, width 2.4→2.0. Paw cover seat: pastern + paw, y 30.4..35.5.

## 5. Hind legs (joints `hipN`/`hipF` → `shankN` → `metaN` → `htoeN`)

- Hip pivot (20.6, 17.8) — at the hand-over where the thigh's rear edge takes over the rump outline; stifle (24.4, 26.2) — centre of the knee cap; hock (19.4, 29.8); paw (20.3, 34.5). Stifle 38% of the dog's height off the ground, hock 23%, measured off GrumpyDingo's photos.
- Thigh `THIGH` polygon (fur, in the hip joint): `[21.6,14.4] [19.4,15.0] [18.2,16.0] [17.7,17.4] [17.8,19.6] [18.3,22.4] [19.2,25.2] [20.8,26.6] [22.4,26.2] [22.9,27.5] [24.4,28.2] [25.9,27.5] [26.4,26.2] [26.2,24.6] [25.6,22.0] [25.0,18.8] [24.4,17.0] [23.6,15.2]`. Rear edge = the buttock line from y 16 down; bottom = a knee cap of radius 2.0 about the stifle.
- Gaskin: capsule stifle → hock, 3.6→2.2 (fur); its round top (r 1.8) sits inside the knee cap about the same centre. Hock: fur disc r 1.1 at the hock. Rear pastern (cannon): capsule hock → paw, 2.2→1.9 (pale2). Hind paw as the front.
- Hind paw cover seat: cannon + paw, y 30.9..35.5, x centre ≈ 19.9.

## 6. Tail (joint `tail` at the root, wag track)

- Root (23.4, 13.6), inside the croup. Centre line `TAILC`: `[23.4,13.6] [19.6,14.6] [15.6,14.6] [12.2,13.0] [10.2,10.4] [9.8,7.8] [11.0,6.2]` (Catmull-Rom through these). Length along the curve 19.7. Width 3.8 at the root tapering to 1.8 at the tip; round cap r .9 at the tip. Pale half on the underside (bottom edge at the root, outer edge of the hook).
- Sampled centre line (fraction of length → point, width): 0 → (23.4,13.6) 3.8; .15 → (20.4,14.4) 3.5; .30 → (17.6,14.8) 3.2; .45 → (14.9,14.4) 2.9; .60 → (12.2,13.0) 2.6; .75 → (10.3,10.7) 2.3; .90 → (9.8,7.8) 2.0; 1 → (11.0,6.2) 1.8.
- Tail guard seat: .08..0.62 of the length (the straight-ish run out behind the body, before the hook). Ring slots: the guard's three gaps, at about .18, .35 and .52 of the length, each ring 1.0 wide along the tail, perpendicular to the centre line there. Nothing sits on the hook (.62..1).

## 7. Ears (joints `earFar` at (42.9,6.0), `earNear` at (44.9,5.6))

Bases buried in the skull outline at the back of the skull; near ear base (42.8,6.2)→(46.4,4.8), tip (45.0,−1.6); far ear base (42.3,6.5)→(44.6,5.4), tip (43.4,−0.5). A head piece sits on the skull between the ears and the stop (x 42.6..47.2, y 4.3..6) and must leave both ear bases free.

## 8. Body armor silhouette

Front-top edge = the collar's lower edge. Hem must stay above the leg roots: above the shoulder (y < 15.4 at x 42.6) and above the hip hand-over (y < 17 at x 20.6); the belly line to follow is the body path from the brisket (40.2,23.2) to the tuck (25.0,19.8); the back line is y 11.0–12.1. The angel wing (`wing2`) lies under the armor and can show at a hem.

## 9. Gaits (hero2's own tracks)

Stride 1 s, phases: far hind 0, far front .25, near hind .5, near front .75 (lateral walk). Stance 0→.62 is linear (no foot slide); swing eases. Hip ±13.5°, shoulder ±11.8° (both strides 7.8 units). Elbow folds +18° at .8, lands straight; wrist +30° at .66, +70° at .78, straight by .92; front toes peel −40° at .66; stifle +34° at .76; hock −30° at .76; hind toes −22° at .76. Body bob 0.45. Tail wag ±9°, period 1.4 s. Ears-back −42°.

## 10. Draw order (what gear can rely on)

Far legs → body (with tail and ears as children, drawn over it) → near legs. Within a leg, each segment draws under the next one down (upper arm under forearm, thigh under gaskin). Gear attached with `RIG.attach(root, joint, parts, pal)` draws after that joint's own parts and after its child joints, so a collar on `body` draws over the ears and tail root; attach ear-free gear to `body` and paw gear to the toe joints.
