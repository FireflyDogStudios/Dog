# SUMMARY: 19 dog generators — is there one we can use? (Scout, 2026-10-08)

**Status: first shortlist delivered (sweep done; Atlas's licence read and Spark's trials are the next gates).** 45 candidates across five categories in `candidates.csv`; method and caveats in `NOTE.md`.

## The honest answer first
**No off-the-shelf "dog generator" produces what the game ships** — a flat two-tone, side-view, restylable vector dog at ~120 px with our gaits and gear points. Everything found is either 3D (needs a render-and-restyle pipeline), pixel art (clashes with the style and resists restyling), or a rig tool that still needs our art. What DOES exist, twice over, is the **multi-breed 3D source + shared skeleton** pattern — and shipped games (Sims pets, Wobbledogs) all converge on **one skeleton + breed-as-data**, which is exactly the architecture our joint-data rig and Spark's SDF prototype already have. So the realistic outcomes are: (a) adopt a 3D breed source as the *upstream reference/render base* and keep our 2D pipeline, or (b) keep building our own, now validated as the industry pattern.

## Ranked shortlist (verdict vs the six needs)
1. **Daz Dog 8 + Phenotypes morph pack** (~$26 + packs; account+purchase = GrumpyDingo) — the only true "many breeds from one source" system found (63 construction morphs over breed morphs, one rig). Verdict: strong on needs 2/3/4 as a *render-to-2D reference base*; needs 1/6 come from our restyle; need 5 hinges on **the deciding licence question: do Daz's standard terms cover shipping 2D renders/sprites** (reportedly yes; Interactive License only for 3D in-game) → **Atlas first**.
2. **Fab "Dog Character and Animation Pack"** (price unlisted; Fab account = GrumpyDingo) — 20 breeds on ONE shared skeleton with 44 shared animations. Verdict: the strongest single-purchase multi-breed+rig+animation source; same render-to-2D caveat; Fab EULA unread → **Atlas**.
3. **Infinigen** (BSD-3, free) — cleanest licence in the field; scout/12 found wolf body/head templates and fur-groom code in its source, but no confirmed dog generator or rig. Verdict: unknowns resolve only by running it → **Spark already assigned; nothing further from me**.
4. **Tripo** (~$20/mo; account = GrumpyDingo) — the only AI generator with a documented **quadruped auto-rig** (Rigging v2.5), vendor-claimed. Verdict: could mass-produce breed meshes + rigs for the render pipeline; free-tier terms contradictory across sources → **Atlas reads the ToS, Spark tests only if a free generation is possible without an account (likely not)**. Meshy ($20/mo, clearest terms: free tier CC BY, Pro private) is the backup.
5. **Spine Professional** ($379–449, per-person; purchase = GrumpyDingo) — not a dog source, but the strongest 2D skeletal tool: bone attachments = gear points, IK, mesh deformation, and a Pixi runtime matching our engine. Verdict: infrastructure for whatever dog art we make; breeds and art stay ours. **Rive** ($9/seat/mo, MIT runtimes, vector-native) is the cheaper, licence-cleaner but less quadruped-proven alternative.
6. **Build-our-own, validated** — the shipped-game lessons (Sims pets bone-delta sliders; Wobbledogs genetics-as-data) say the scaling approach IS one skeleton + breed-as-data, i.e. what we already have in the species files, the rig and the SDF prototype. Verdict: if Atlas/Spark knock out 1–4, continuing our own builder is not a failure — it is the documented industry pattern, and nothing found replaces its 2D output stage anyway.

## Dead ends (don't revisit)
SMAL family (non-commercial, known), Hunyuan3D (excludes EU/UK sales), Luma Genie (rights tied to subscription), Live2D (deformer tool, wrong shape), Reallusion CC (no quadruped base), creature kitbashes, Sloyd/Spline/Alpha3D/Kaedim (no creature evidence), DoodleDino sprites (personal-use only), pixel packs as shipping art (style + restyle rule; fine as gait reference — Pixelcave is $10, ChanceKite the best coverage at $200).

## Needs GrumpyDingo (no sign-ups made, nothing bought)
Accounts/purchases if pursued: Daz (base + Phenotypes + any aniBlocks), Fab, Unity Asset Store, Tripo/Meshy accounts, Spine or Rive licence, Stable Fast 3D's gated Hugging Face accept. All prices in `candidates.csv` are listing-page figures, unverified.

## Atlas licence verdicts (2026-10-08, after the shortlist — full table with quotes: `docs/team/atlas/2026-10-08-generator-licences.md` on Atlas's branch)
- **Daz Dog 8 + Phenotypes: OK with cost, 2D art only** — standard EULA covers commercial 2D renders incl. sprite stacks; Interactive License only for shipping 3D; one licence per person; AI image tools excluded. Phenotypes is $19.99 on top of the base.
- **Fab pack: NOT determined** — fab.com and Epic help pages 403 every fetch; a human (GrumpyDingo) must read the listing and EULA.
- **Tripo: free plan NOT OK** (§5.2.1 "Tripo retains all rights", contradicting §3.2); paid OK with cost. **Meshy: free plan not OK as it stands**; paid OK with cost.
- **Spine: OK with cost** (Professional $379 sale for meshes+IK; one named person; $500k threshold counts financing; spine-pixi-v8 runtime carries the Spine Runtimes licence). **Rive: OK with cost** ($9/seat/mo removes splash; MIT runtimes; no official Pixi runtime).
- My snippet prices held up where Atlas could see them.

## Open questions routed
- **Atlas** (licence file `docs/team/atlas/2026-10-08-generator-licences.md`): Daz standard-EULA 2D-render question (decides rank 1), Fab EULA + price, Tripo free/paid ToS, Meshy confirmation, Spine runtime terms + $500k Enterprise threshold vs our plans, Rive seat terms, Animal Rigger Pro output licence.
- **Spark**: Infinigen run (already assigned); then the best free-testable candidate — realistically only Infinigen and the open-weight shape models (TRELLIS/TripoSR, MIT) are testable without an account.
