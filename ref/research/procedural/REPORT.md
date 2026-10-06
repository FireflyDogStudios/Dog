# Procedural quadruped animation for the Den rig

Research pass by a Firefly research agent, Oct 6, 2026. Saved here by Firefly from the agent's hand-back, because the agent could not write `.md` files itself. Prototype files in this folder: `ik2d.js`, `ik2d.test.js` (`node ref/research/procedural/ik2d.test.js`, 8/8 checks pass, re-verified by Firefly), and `frames.js`, which writes `stride-frames.svg` (8 frames × 4 gaits). Nothing outside this folder was changed.

## Recommendation in one paragraph
Drive the paws, not the joints, with our own small solver (about 300 lines, no dependencies).
- **A gait table:** a footfall offset per leg plus a duty factor.
- **Paw targets:** in stance the paw slides back at exactly the world scroll speed; in swing it follows a Hermite arc that lands with the paw already moving at ground speed.
- **Analytic IK.** The 3-bone canine legs reduce exactly to two-bone:
  - Hind leg: the metatarsus is kept parallel to the femur, a "pantograph". That leaves one shape variable, solved by the law of cosines, and the stifle and hock limits become one exact clamp.
  - Fore leg: a pastern angle is given. When the wrist passes its limit, the pastern locks to the forearm and the paw rolls onto its toes.
- **Body from the footfalls:** hip and shoulder heights come from the stance legs, dipping where a leg would over-reach. Body pitch follows from the two heights.
- **A scapula arc** lets the fore leg lengthen at the back of the stride.
- **Fixed-step springs** for the tail, ears and head.
- **Deterministic:** everything is a pure function of (phase, seed), with no `Math.random`.

## What the prototype proves (8/8 checks)
- The solvers reproduce hero2's drawn legs exactly.
- The stifle bends forward and the elbow bends back.
- Joint limits hold for 2000 seeded targets.
- A forward-kinematics check copying rig.js's nesting lands each paw on its IK target (to 1e-6).
- **No paw slide in walk, trot, canter or gallop** (measured 0.00000 units). Per gait:

  | Gait | Stride | Strides/s | Froude |
  |---|---|---|---|
  | Walk | 17.5 units | 1.14 | 0.07 |
  | Trot | 28.4 | 1.58 | 0.37 |
  | Canter | 33.8 | 1.77 | 0.65 |
  | Gallop | 43.1 | 2.09 | 1.47 |

- The springs give bit-identical output however frames are split.
- The walk→trot blend is continuous.
- Noise is seeded and the module never calls `Math.random`.

**Needs tuning:**
- Hind swing over-folds the hock: the metatarsus goes nearly horizontal in trot and canter.
- The gallop needs spine flex.
- The cadence is slowish.

## 1. The current rig
- rig.js is a forward-kinematics rig built from nested Pixi containers. Each joint has a pivot (`at`) and an angle from a keyframe track at `phase + ph`, added to the drawn pose. Joint x/y, `bob` and states add on top.
- Hero2's legs have 4 joints each:
  - hind: hip → shank → meta → htoe
  - fore: sh → fore → past → ftoe
- The legs sit in `root`, not `body`, so the body can move without dragging them, which is what IK needs.
- Today's walk is hand-keyed: offsets 0/.25/.5/.75, stance 0→.62.

## 2. Methods surveyed

**Foot-placement gaits, as games do them:**
- Little Polygon "Procedural Animation: Locomotion".
- Overgrowth (GDC 2014): a few key poses, a gait phase and springs.
- Flame in the Flood (GDC 2016): a procedural wolf spine, stride-warping, no transition clips.
- Ubisoft IK Rig (GDC 2016): animation stored as end-effector goals, re-solved on any skeleton.
- Spore (SIGGRAPH 2008): limb-space goals normalised by leg length, then IK. This is the strongest argument that the approach scales across species.
- Rain World: physics plus leg search, overkill for us.
- Robot quadrupeds (MIT Cheetah, open-quadruped): Bezier swing with a velocity-matched touchdown.

**IK:**
- Analytic two-bone with a bend sign and soft reach, recommended.
- A 3-bone leg with one coupling, recommended for canines: it becomes an exact two-bone through a virtual bone.
- FABRIK only for tail or spine chains, with a fixed iteration count. CCD and Jacobian methods aren't needed.

**Gait data:**
- Maes et al. 2008: walk duty factor > .5; trot and gallop < .5; the trot moves diagonal pairs at 50%; dogs use the rotary gallop flat out.
- Hildebrand: walk limb phase ≈ .25.
- Alexander & Jayes 1983: stride length λ ≈ 2.3·h·Fr^0.3, with Fr = v²/(g·h) and h = hip height. Walk→trot happens near Fr ≈ .5 and trot→gallop near Fr ≈ 2–3. This sizes strides for any canid from hip height alone.

**Prototype gait table:**

| Gait | Offsets (hF/fF/hN/fN) | Duty factor (hind/fore) | Swing lift (× hip height) |
|---|---|---|---|
| Walk | 0/.25/.5/.75 | .64/.62 | .10 |
| Trot | 0/.5/.5/0 | .42/.40 | .16 |
| Canter | 0/.55/.30/.30 | .40/.38 | .20 |
| Rotary gallop | 0/.52/.10/.42 | .28/.26 | .24 |

**Gait transitions:** one global phase that only ever advances, `phi += dt·v/λ`. Offsets blend the short way round the circle over about one stride, so walk→trot just slides the fore legs a quarter stride.

**Body from footfalls:**
- Each girdle (hips, shoulders) bobs with its legs' stance: up at mid-stance in the walk (vaulting), down in the trot and gallop (spring).
- Each girdle drops wherever a stance leg would over-reach, which produces the walk's dip without keyframes.
- Pitch = atan2(foreY − hindY, span).
- Scapula: the shoulder joint rides an arc about a pivot high on the withers.
- Spine flex for the gallop comes later and is an art question.

**Secondary motion (t3ssel8r second-order dynamics):** each spring has a frequency f, a damping ζ and an initial response r.
- Tail: f≈2.5, ζ≈.35, driven by wag + hind-girdle velocity.
- Ears: f≈5, ζ≈.25.
- Head stabilisation: rot ≈ −0.8·pitch and y ≈ −0.7·bob. This needs a head joint.
- Verlet chains for a later multi-segment tail.

**MANN and DeepPhase:** per-leg phase and contacts are the right state, and gait should be a continuous blend. Their code and data are research-only (non-commercial), so we can't use them.

**Idle:**
- Paws pinned by IK while the body moves.
- Breathing: ~1% scale at 0.25–0.5 Hz.
- Weight shifts: seeded value noise.
- Look-arounds and ear flicks: seeded event gaps.
- Re-step a paw when it leaves its comfort band.

## 3. Libraries
Licences were checked on the GitHub LICENSE files or the npm registry, Oct 6.

| Library | Licence | Fit |
|---|---|---|
| Our own ik2d.js | ours | Best fit |
| bezier-easing, d3-ease, eases | MIT / BSD-3 / MIT | Optional curve helpers |
| alea, pure-rand | MIT | Seeded random (mulberry32 is enough) |
| Popmotion | MIT | Springs depend on frame rate; reference only |
| lo-th/fullik (FABRIK) | MIT | Only if tail or spine become chains |
| animal-proc-anim, open-quadruped, OpenCat | MIT | Learn from; don't include |
| Spine runtimes | Proprietary | Learn only |
| dragonbones-pixijs | ISC | Would replace rig.js; no |
| AI4Animation | Non-commercial | Ideas only |
| ADAPTIK | No licence found | Don't copy |

## 4. Proposal
**A new `engine/gait.js`:** pure functions, no Pixi, no globals.
- `make(rigDef)`: reads bone lengths and rest angles from the drawn joint points.
- `pose(dog, phi, gait, stride)` → `{jointId: {rot, x, y}}`.
- A Clock and blend, the springs (Secondary), and Idle.

**One small rig.js hook, as its own agreed slice:** `api.drive = fn`. In `tick()`, a joint takes `{rot, x, y}` from the drive map instead of its track. States still add on top, and gear, followers and mirroring are unchanged.

**Hero2 needs only data:** `body.at = [31.6, 16.6]` (so pitch turns about the middle) and `scap = [38.4, 10.4]`.

**Per tick:**
1. Advance phi.
2. Compute paw targets:
   - stance: `x = x0 + step·(½ − p/DF)` at ground level
   - swing: Hermite arc, end tangents = stance speed × match, lift = h·sin(π·s^.75)
3. Scapula angle, then girdle heights (bob, plus the over-reach drop), then pitch.
4. IK for each leg.
5. Convert to rig.js: `rot_k = Δabs_k − Δabs_(k−1)`. The top joint's x,y is the girdle offset. The toe keeps the pad flat in stance.
6. Run the springs.

**Key coupling:** stance paws must move back at exactly the speed the world scrolls at.

**Joint limits** (Jaegger et al. 2002, Labrador goniometry; degrees, 180 = straight):

| Joint | Flexion | Extension |
|---|---|---|
| Carpus | 32 | 196 |
| Elbow | 36 | 166 |
| Shoulder | 57 | 165 |
| Hip | 50 | 162 |
| Stifle | 41 | 162 |
| Tarsus | 38 | 165 |

Dogs use only about 30–40° of stifle range in gait, so these are hard walls and the gait curves stay well inside them. Hip and shoulder limits aren't enforced yet.

## 5. Pseudocode
Conventions: y points down, and angles come from atan2, so positive = clockwise = Pixi's rotation sign.

**Hind leg (pantograph, analytic):**
```
dl = R_meta − R_femur + metaBias
A  = l1 + l3·e^{i·dl}                 // femur + metatarsus as one rigid complex vector (femur frame)
|W(u)|² = |A|² + l2² + 2·l2·|A|·cos(u − argA)
u  = argA + acos((d² − |A|² − l2²) / (2·l2·|A|))
clamp u:  stifle = 180 − u        ∈ [41,162]
          hock   = 180 + dl − u   ∈ [38,165]      // both bound u: one clamp
af = angle(paw − hip) − arg W(u);   at = af + u;   am = af + dl
```
`d` is softened near its maximum, but never below the drawn reach, then clamped. There's no iteration.

**Fore leg:**
```
pastern = stance ? rest − 0.06·sin(πs)        // slight forward lean under load
                 : rest + 1.2·sin(π·s^.8)     // wrist folds back in swing
carpus  = paw − l3·dir(pastern)
(ah, ar) = twoBone(shoulder, l1, l2, carpus, bend=+1 /*elbow behind*/, elbowLimits, soft)
if wrist outside [32,196]:            // late stance: paw rolls onto its toes
    hold the wrist at its limit c
    V = l2 + l3·e^{ic}                // forearm + pastern = one virtual bone
    (ah, av) = twoBone(shoulder, l1, |V|, paw, +1, elbowLimits shifted by argV, soft)
    ar = av − argV;  pastern = ar + c
```

**twoBone:**
```
d range from |l1−l2|, l1+l2 and the middle-joint limits: d(θ) = √(l1² + l2² − 2·l1·l2·cosθ)
soft: if d > ds:  d = ds + w·(1 − e^(−(d − ds)/w))
a1 = base + bend·acos((l1² + d² − l2²) / (2·l1·d))
```

**Determinism:**
- The pose is a pure function of its inputs; no solver starts from the last frame's guess.
- Springs step on an absolute-time grid (`n·h ≤ t`), so frame splits don't change the output.
- Randomness is mulberry32 and hashed value noise, seeded per entity (as the game seeds from E.x).

## 6. First slice (needs GrumpyDingo's agreement)
1. **Bench only, walk only:** a ~5-line `api.drive` hook in a bench copy of rig.js, driving hero2's legs from `ik2d.js` beside the hand-keyed walk, with stride frames shown big. Success = it matches the approved look and the paws measurably never slide. No combat or loot code is touched; run t40/t45b anyway if `engine/rig.js` itself changes.
2. Trot via the gait blend.
3. Tail spring. Ears and head after a head joint exists.
4. Idle.
5. Other canids: each is new leg points + hip height + a gait row.

## Sources
- Maes et al. 2008: https://journals.biologists.com/jeb/article/211/1/138/17472 (abstract via search; full text blocked)
- Jaegger et al. 2002: https://pubmed.ncbi.nlm.nih.gov/12118679
- GDC Vault:
  - Flame in the Flood: https://gdcvault.com/play/1023209/
  - IK Rig: https://www.gdcvault.com/play/1023279/
  - Rain World: https://www.gdcvault.com/play/1023475/
- Spore paper: https://www.chrishecker.com/Real-time_Motion_Retargeting_to_Highly_Varied_User-Created_Morphologies
- MANN: https://history.siggraph.org/learning/mode-adaptive-neural-networks-for-quadruped-motion-control-by-zhang-starke-komura-and-saito/
- t3ssel8r notes: https://github.com/SalvatoreScalia/Giving-Personality-to-Procedural-Animations-using-Math
- Little Polygon: https://blog.littlepolygon.com/posts/loco1/ (blocked from this session)

Gait numbers are ballpark, taken from search abstracts or recalled. Tune them by eye.
