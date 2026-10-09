# Quadruped (canine) walk: animation baseline (Oct 8, 2026)

Asked by GrumpyDingo ("we need some general quad guidance... get a baseline and then we can plug things in"). A research sub-agent swept animation and biomechanics sources. **Caveat:** the network blocked full-page reads, so its citations are search-result summaries of the named pages, not full texts. Where our own measured files cover a number, they win (they are primary and were read in full).

## The baseline, reconciled with our own data

| Item | Animation / research baseline | Our measured files | Used for hero3 |
|---|---|---|---|
| Footfall order | lateral sequence LH, LF, RH, RF (Today's Veterinary Practice; Catavitello 2015) | same (`missingfound/walk-footfall-and-muybridge/`) | yes (unchanged) |
| Fore after same-side hind (limb phase) | textbook 25%; measured 15% (Griffin, Main & Farley 2004 JEB) | 0.135 retrievers, 0.16 Malinois, 0.14 long-legged breeds; **wolf recommendation 0.16 (0.12-0.20)** | **0.16** (was 0.25) |
| Duty (share of stride a paw is down) | fore 0.57-0.61, fore above hind at slow speeds (Maes 2008) | fore 0.594, hind 0.576 (Catavitello); hind 0.56-0.64 (Fischer 2018); wolf rec. 0.64 | **fore 0.62, hind 0.60** |
| Body | two pendulums: hips and shoulders each rise and fall **twice per stride**, offset by the limb phase; lowest just after each touchdown, highest over mid-stance; hips bounce more than shoulders (Griffin 2004; AnimSchool; Williams' contact-down-passing-up) | none absolute | hips 0.45, shoulders 0.30 units peak to peak (EST: 3-4% / 2-3% of leg length, minus 30% for a wolf's smoother gait) |
| Front leg | nearly straight in stance; at lift-off the wrist and toes peel with a pronounced break; wrist fold peaks late in the swing (~80% of the limb's cycle) (AnimationMentor; AJVR 71(7)) | carpus curves (Catavitello) | as baked (fold peaks ~76%) |
| Hind leg | plants flatter, less joint break, some toe drag near passing; the hind legs are the engine (AnimationMentor; AnimSchool) | stifle/tarsus curves | hind lift lowered 1.5 → 1.1 |
| Head | stays fairly level; lowest during the front stance, 1-3 frames late (Bergh 2018; animation sources) | none | **not yet**: the head is part of the body path; needs its own joint (next) |
| Tail | the base follows the hip drop 3-5 frames late, a wave down the tail (AnimationMentor; UAL notes) | none | tail now rides the stride: base dips with the hips, 15% late |
| Ears | follow-through behind the head (EST) | none | later, with the head joint |
| Wolf | mostly trots; single-tracks (hind paw into the front print); head level with or below the back; smoother, less bouncy than a dog (Texas Wolfdog Project; Wilderness College; KORA) | — | lower bounce (above) |
| Cycle length | 24 frames common, large dog 28-36 at 24 fps (EST); retrievers walk 1.46 strides/s | 1.45 Hz | unchanged (1 s, game-tied) |

## Common mistakes (all sources agree)
- Front and back moving the same way: the "two people in a horse suit" look. The hips drive and bounce more, the front wrist breaks while the hind paw plants flat.
- Legs in mirror sync, or all four feet sharing one timing.
- Floating weight: there's no dip after each contact.
- Front legs not reaching far enough back at lift-off.
- A rigid spine.
- Head and tail as an afterthought instead of overlapping the body.
- Sliding feet. Ours are pinned by IK.

## Open
- Maes 2008 tables: walk duty and phase by speed (doi 10.1242/jeb.008243).
- An absolute withers and pelvis bounce (Bergh 2018, Table 1).
- Williams, Survival Kit pp. 356-357.
- Daniel Fotheringham's spine-gaits notes.
