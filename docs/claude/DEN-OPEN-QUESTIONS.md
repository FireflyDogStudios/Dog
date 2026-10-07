# Firefly's open questions (species creator and skeleton-first models)

Kept by Firefly, started Oct 6, 2026. Two kinds: **research questions** (facts the research should settle; agents are checking them against several sources) and **decisions** (GrumpyDingo's to make; asked one at a time, never as a list). Update this file as answers come in.

## Research questions (answered Oct 6: see `ref/research/factcheck/REPORT.md`; the values are not applied yet)
1. **Scapula layback when standing.** The wolf skeleton came out with an almost upright scapula (81° above horizontal) because the one standing goniometry study (Anatolian shepherds: shoulder 119.8°, elbow 124.8°) fights typical canine anatomy (about 60°). Which is right for wolves and medium dogs, measured how?
2. **Standing elbow angle.** 125° (Anatolian goniometry) vs 130–150° (the measurement sheet, unsourced). Which definition and value?
3. **Standing hip angle** (pelvis vs femur): ours came out at 106°; the sheet says 90–100°. Is there a measured value?
4. **Standing stifle angle:** 145° (mixed dogs) vs 128° (Anatolian). We used their mean, 136°.
5. **Standing hock angle and metatarsus:** 150° from wolf photos (9 standing wolves only), with a vertical metatarsus assumed from breed standards. Confirm for wolves.
6. **Croup / pelvis angle** (assumed 30° below horizontal), **pelvis length** (assumed 0.8 × femur) and **where the hip joint sits on the pelvis** (assumed 45% back from the iliac crest).
7. **Paw:** toe-joint height above the ground (assumed 0.22 × metacarpal) and toe length (0.55 × metacarpal).
8. **Withers:** how far the thoracic spines rise above the scapula top (assumed 3.5% of withers height).
9. **Neck carriage** at a relaxed stand (assumed 40° above horizontal) and **head pitch** (skull axis 12° below horizontal).
10. **Skull and jaw:** mandible length vs condylobasal length (assumed 0.80), where the jaw joint sits, and the wolf's maximum gape (we only have dogs, 44°, and a dingo model, 65°).
11. **Ear set:** the wolf photo "ear carriage" of 19° seems to use another definition; what is the erect ear's angle to the skull?
12. **Tail:** caudal vertebra count for wolves (we used the dog's 20–23), and relaxed tail carriage.
13. **Field size vs skeleton:** withers from the bones is 695 mm; field guides say 660–840 mm. How much is skin, fur and posture?

## Prior art (answered Oct 6: see `ref/research/prior-art/REPORT.md`)
14. Has anyone built **skeleton-first, data-driven quadruped or canine characters**, in games, animation tools or science (for example Spore, SMAL/SMALR, musculoskeletal dog models, procedural quadruped generators, parametric 2D rigs)? What worked, what failed, and what should we copy or avoid?

## Found Oct 7 (photo template test)
- The real wolf photo (Scout template 01) disagrees with the skeleton: chest depth with fur 0.44 vs 0.59 of surface height; elbow height 0.52 vs 0.43; nose forward of withers 0.54 vs 0.61. Suspect: `ratios.chest_depth_over_height` 0.54 (AwA keypoints have no brisket point) and the head and neck carriage. Next: measure the best Scout wolf photos the same way and correct the skeleton.

## Decisions for GrumpyDingo (one at a time, when they come up)
- ~~Apply the fact-check's 13 suggested values to the wolf~~ done Oct 6 (GrumpyDingo said yes); the rebuilt skeleton hits every angle target.
- The Carolina Dog: the player's own species needs its own species file (dingo and pariah-dog numbers). Build it right after the wolf?
- Which new model becomes the hero, and which the companion, once the current two are retired?
- The licence holds: the non-commercial motion curves and the copyleft keypoint file stay out of the repo unless he says otherwise.
- ~~More data~~ fetched Oct 7 by a separate session (`ref/research/fetched/`, merged by Firefly).
- ~~Walk footfall phase conflict~~ settled Oct 7: LF 0.16 wolf, 0.17 dingo-sized dog (applied).
- How realistic vs stylised the final look should be: **open (Oct 7)**. GrumpyDingo: the flat style came from "stone knives and bear skins"; with the research in hand, aim to be amazing and go from there. Plan: style tests on the anatomy-complete wolf.
- Sex-specific anatomy (the male sheath, which the outline step removed by mistake on Oct 7): a per-species, per-sex detail; whether the game shows it is GrumpyDingo's call.
