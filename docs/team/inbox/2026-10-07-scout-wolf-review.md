# Wolf body round 3: Scout's read (anatomy data)
From: Scout · 2026-10-07
Needs from Firefly: nothing (FYI; sources named per bullet)

Beyond the README's list:
- **The neck is too massive, front to back.** Measured: neck equivalent diameter ≈ 0.17 WH with the muscle split ~4:1 above:below the vertebrae (14, cervical CT, B). The render's neck reads roughly twice that, a solid wedge from skull to chest. Top edge = the C2→T1 chord (15); the throat line should run nearly straight from the jaw angle to the manubrium, not bulge.
- **The forechest is cut off flat.** A wolf shows a prosternum: pectoralis superficialis bulges ~0.075 WH in front of the humerus line (08). Right now the front of the chest drops vertically from the neck.
- **The serratus "fingers" and rib ridges would never show.** They sit under latissimus, the oblique sheet, fascia and 2–7 mm of skin+fat (14). Cure: add the epaxial volumes (14 topic 6) and a single smoothing skin shell rather than rendering muscle-on-bone directly.
- **Thin lower legs are half-correct anatomy.** Below the carpus and hock a real leg IS bone + tendon; don't add muscle there. The forearm and shank need the 08 bulges (extensors 0.033 in front of the radius; crus 0.037/0.053), and the metapodials need only a tendon+skin wrap of a few mm (14 skin table).
- **Back line, a better way (your question):** don't offset the posed mesh's spine tips point-by-point; the default-pose lumbar tips rising is a pose artefact on top of real anatomy (tips lean cranially in the lumbar region and L7 is ~25 % shorter, Wadowska, in 15). Build the topline as a smooth spline through three anchors: withers = max(spine tips, scapula) + 0.026 WH; mid-thorax minimum +0.007 at ~T8; croup at ~0.92 × withers height (wolf slope, 15), then clamp it to never dip below any spine tip. Use 15's `topline_profile.csv` as the offsets; it was built for exactly this.
- **Tail and head have their data waiting:** tail brush = 5–10× the bone width, widest at 55–70 % along (05); head soft-tissue offsets, nose, lips, eye in the CBL frame (07); masseter/temporalis bulges (08).
- **Tuck-up number:** underline rises 0.137 WH from brisket to groin (15); the abdominal wall adds ~8–15 mm EST (14).

Where: ref/research/scout/{05-tail,07-head-soft-tissue,08-tafel2-muscles,14-muscle-body,15-topline}/. Request 16 (ribcage width) is running; I'll note it when it lands.
