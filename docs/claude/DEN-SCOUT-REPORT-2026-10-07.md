# Scout report for Firefly: second search, wolf skulls and skull candidates

**Date:** October 7, 2026
**From:** Scout (the data-fetch session, named by GrumpyDingo)
**To:** Firefly
**Branch:** `claude/new-session-l3ubx0` (built on your `claude/tender-cerf-o68l6u`; adds files only)

This report is self-contained and fixed in time. It covers what happened **after** `docs/claude/DEN-DATA-FETCH-HANDOFF.md`, which stays as the reference for the first fetch (`ref/research/fetched/`, items 01-11). Everything below lives in `ref/research/missingfound/` (index: its `README.md`). Nothing in `fetched/`, `species/` or any code was changed.

## 1. What is new

| Folder | What you get | Licence |
|---|---|---|
| `dingo-limb-bones/` | Harcourt 1974 bone-to-height formulas verified from two CC BY papers; dingo bone estimates; four real Iron Age village-dog limb sets; CC0 dingo ear and hind-foot lengths | CC BY / CC0 (facts from closed papers marked) |
| `joint-ranges/` | Passive goniometry for all six limb joints (13 CC BY studies + Reusing 2020 text), jump and sit-to-stand ranges, and a proposed hard / comfortable limits table for the rig | CC BY (facts from closed papers marked) |
| `walk-footfall-and-muybridge/` | The walk front-paw phase settled; corrected Muybridge left/right labels | facts + PD |
| `face-ear-and-wild-keypoints/` | Ear and vocal timing facts, DogFACS mouth stages; `COMPARISONS.md` with per-species ear and gape tables split into measured / comparison / guess | CC BY (facts marked) |
| `wolf-skull/` | Two real wolf skulls (MRI PAS 170753 male, 170555 female): measurements, landmarks, jaw hinge, gape estimate, side and top outlines, four decimated GLB meshes (~2.5 MB each) | **CC BY 4.0** (credit required) |
| `atlas-plates/` | Ellenberger-Baum Tafel 1 and Tafel 3 at full resolution, the exact images `fetched/01-skin-offsets` was measured on | no known copyright (PD) |
| `skull-candidates/` | 408 skull models licence-checked (190 usable), 25 bulk collections, best picks per species, and `AUTOMATION.md` (proposed pipeline) | links only; nothing downloaded |

## 2. Key numbers

- **Dingo bones (EST, ±5 %, from shoulder height 542 mm, n = 117):** humerus 166, radius 164, ulna 193, femur 177, **tibia 182.5** mm. No measured dingo or Carolina Dog limb bone exists in open sources. Village-dog skeletons have **wolf** proportions (radius/humerus ≈ 1.0, tibia/femur ≈ 1.02), not coyote.
- **Walk front-paw phase (LF after LH):** **0.16 wolf, 0.17 dingo-sized dog** (range 0.12-0.22 with speed). The fetched 0.135 is a brisk walk of heavy retrievers; the wolf file's 0.20 was a midpoint, not a measurement.
- **Rig limits (included °, hard clamp):** shoulder 45-165, elbow 30-165, carpus 30-200 unloaded / 240 under load, hip 50-175, stifle 40-170 (≤150 when the hip is flexed past ~70), tarsus 38-180. Comfortable bands and sources in `joint-ranges/SUMMARY.md`.
- **Wolf skull (170753, the reference):** condylobasal length 244.3 mm, zygomatic breadth 142.6 mm (wolf.yaml: 253.5 / 142.5). **Jaw hinge level with the upper tooth row, 0.75-0.77 of skull length behind the nose.** Bone does not stop the jaw until ~100°; muscle stretch gives a natural maximum of about 46-50° and a hard maximum of 64-73° (EST), supporting wolf.yaml's 50/65.
- **Ears and jaw (no canid measurements exist):** game guesses for a dingo-type dog are turn to sound 10-20°, flatten 60-75°, flick 0.1-0.2 s; yawn 40-44°, bark 15-25°, howl 15-20°, pant 10-20°. Skull-based gapes from a CC BY study: dhole 27°, African wild dog 29°, hyenas 26-29° (ratios only).

## 3. Warnings

1. **Corrections are written, not applied.** Please apply (with GrumpyDingo's OK):
   - `fetched/07-dingo/data.csv`: dingo tibia 178.3 → **182.5 mm** (the old Harcourt tibia intercept was wrong: +9.41, not +21.62).
   - `species/wolf.yaml`: walk front-paw phase 0.20 → **0.16**; hock extension limit 164 → about **175-180**; carpus extension split into **200 unloaded / 240 loaded**; braincase 0.42 stays confidence C (it is not basion-nasion, which measures 0.55-0.57 of skull length).
   - `fetched/05-muybridge/data.json`: plates **707 and Maggie A have every left/right label mirrored**; take the corrected labels (and 706's two contact fixes) from `walk-footfall-and-muybridge/data.json`. 708, 704 and 705 are still unresolved.
2. **The two wolf skulls are the planned golden reference** for any automated pipeline. Check them first (renders and numbers). Doubts: 170555's closed jaw is reconstructed and its lower canines are broken; orbit and nasion were placed by eye (±2-3 mm); the muscle-stretch thresholds behind the gape estimate (1.5× / 1.7×) were recalled, not checked.
3. **Skull frame:** x forward, y up, **z = the animal's right** (a z-left frame with x forward and y up would be a mirror). GLB units are **mm**, not glTF's usual metres. 2D outlines face right, y down, origin at the nose tip (prosthion).
4. **Dingo-type dogs have no usable 3D skull anywhere** (every dingo scan online is non-commercial or unlicensed). The hero's skull must come from wolf proportions, a Basenji proxy (CC BY) and one CC0 dingo landmark set.
5. **No ear angles or behavioural jaw angles have been measured for any canid.** The guess columns in `COMPARISONS.md` are guesses; own reference clips would beat them.
6. **Unsourced AI notes were checked, not trusted.** GrumpyDingo pasted notes from another assistant; the jackal "180° ear rotation", the lion "50° yawn" and the clouded leopard "100° gape" were unsupported or wrong, and B-DoPED was misattributed. Only verified items are in the repo.
7. **Not usable for the game (non-commercial or unclear):** Animal Kingdom, SMAL / D-SMAL, BITE, BARC, B-DoPED, Animal3D, DogFLW, Ultralytics dog-pose (AGPL), SuperAnimal-Quadruped, all 122 MorphoSource candidates, Phenome10K (unverified). Keep it that way, even "just for proportions".
8. **Credits are owed** once anything built from CC BY sources ships: MRI PAS skull citations (`wolf-skull/LICENSE.txt`), and the CC BY papers listed in each `missingfound/*/NOTE.md`, in addition to the list in the first handoff (section 5).

## 4. Skulls for the species list (links held, nothing downloaded)

Full detail: `skull-candidates/SUMMARY.md`, `candidates.csv`, `collections.csv`.

| Group | Usable 3D | Notes |
|---|---|---|
| Wolf, coyote, golden jackal | ~50 real scans | MRI PAS (7 wolves, 2 golden jackals; no login), Univ. Wyoming, Illinois State Museum |
| Black-backed jackal | 2 | Dundee museum (Sketchfab), CC0 engineering model |
| Side-striped jackal | **none** | 2D shape data only |
| African wild dog | 1 | CC0 engineering (FE) model, needs format conversion |
| Dingo, New Guinea singing dog, Carolina Dog | **none** | one CC0 dingo landmark set; Basenji proxy |
| Domestic dogs | many | Czeibert 2024: 399 CT skulls, 152 breeds, CC0, one 51 GB zip |
| True foxes | 43 | red (MRI PAS), swift, kit (Wyoming), arctic; fennec only in the Czeibert CT set |
| Gray fox, island fox | 17 | Yale Peabody |
| Raccoon dog | 3 | MRI PAS |
| Hyenas | 12 | spotted, brown, aardwolf (CT); **no striped hyena** |

- **Best single find:** Meloro & Tamagnini 2021 (Dryad, doi 10.5061/dryad.2rbnzs7jx, **CC0**): 2D skull landmarks for 188 carnivore species, covering **every wild species on the list**, including side-striped jackal, African wild dog, striped hyena, corsac and Rüppell's fox. No dingo or domestic dogs. Tiny files. Contents should be verified before relying on it.
- **Bulk 3D:** the MRI PAS collection on Open Forest Data (all 34 Canidae datasets checked: CC BY 4.0; 16 have 3D files; no hyenas) and the Czeibert CT set (CC0).
- **Downloads:** Open Forest Data and Zenodo need no login; Dryad works in a browser but refuses scripts; every usable Sketchfab model needs a free account (12 priority links in the summary).

**Scout's recommendation (for GrumpyDingo and Firefly to decide):** use the CC0 landmark set for every species' skull profile, and full 3D scans only for the species seen up close (the hero's relatives: wolf, Basenji; main enemies; one per group), processed with the method of the two wolves.

## 5. Automation (proposed, not built)

`skull-candidates/AUTOMATION.md`: a single cached CLI (`./den skulls`) with steps discover → licence → fetch → normalise → register landmarks from templates (the SlicerMorph ALPACA method; the two wolves as first templates) → measure → outline → export → QA contact sheet, with one manifest per specimen. Estimated 5-10 min per skull (3-5 of them human review) against 1.5-3 h by hand; estimates only. Four phases, each ending with GrumpyDingo's OK. Tool licences are listed; GPL tools (pymeshlab, R geomorph) are for local use only, never shipped. API keys would come from environment variables only, never the repo.

## 6. Status and holds

- **On hold by GrumpyDingo:** no skull downloads or processing until the wolf-skull test results are reviewed and the option in section 4 is chosen.
- **Optional human steps still open:**
  - the Koungoulos 2022 PhD thesis (University of Sydney; licence unknown; probably holds measured limb bones for 117 dingoes);
  - Reusing 2020 Tables 2-3 (VCOT Open, CC BY);
  - the JEB 2025 main article;
  - Sketchfab logins for the priority skulls;
  - own reference clips for ears, jaw and wild species (shot list in `face-ear-and-wild-keypoints/SUMMARY.md`).
- **Storage:** raw scans stay out of git (Drive `My Drive / den-ledger-everything / ref`). A Drive sync tool (rclone, scoped to its own folder) was proposed. It needs a token added to the environment settings by GrumpyDingo, never pasted into chat. Not set up.

Signed,
**Scout**, October 7, 2026
