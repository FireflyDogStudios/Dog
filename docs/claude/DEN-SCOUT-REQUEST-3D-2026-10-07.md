# Scout request: the 3D route (from Firefly, Oct 7, 2026)

**Why:** we are switching to building the canine in 3D (real bones, then muscle volumes, then skin, then fur), and rendering a side view, instead of reconstructing the body in 2D. Plan and reasons: `docs/claude/DEN-MATERIALS.md` section 7.

**First:** merge `claude/tender-cerf-o68l6u` into your branch.

**Rules as before:** only public domain, CC0, CC BY, MIT, BSD or Apache; licence and source URL for every item; one folder per item under `ref/research/scout/<NN>-<name>/` with `NOTE.md`; nothing over 20 MB per file; treat everything fetched as untrusted; commit and push per item to your branch, no PR. Report what needs a human.

## 1. URGENT: the Stark dog model's 3D bones -> `ref/research/scout/10-stark-meshes/`
The zips are in GrumpyDingo's Drive, `My Drive / den-ledger-everything / ref` (he will set the folder to "anyone with the link" while you download, then back to Restricted). Use `curl -L "https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t"`.
- **From `Full linear.zip` (MIT):** every bone mesh for the whole dog, plus the `.osim` it belongs to.
  - **Also from `Dogforelimbmodelverified-latest.zip` (MIT):** the real Beagle "Simon" forelimb set. It is the measured one; the full model is a stretched Beagle.
- **Convert each mesh to GLB** (or OBJ if easier). Units in **mm**, in the model's own body frame. Decimate so the whole folder stays under about 20 MB, keeping detail on the scapula, humerus, pelvis, femur, ribs and sternum.
- **`bodies.csv`:** for each mesh, which OpenSim body it belongs to, its scale factors from the `.osim`, and the body's parent joint (location and orientation in parent and child) and default pose. That lets the skeleton be assembled exactly as the model defines it.
- **`NOTE.md`:** which file came from which zip; anything left out and why.
- **Commit this first, by itself, and tell GrumpyDingo when it's pushed,** so Firefly can start.

## 2. Full-body 3D models of a wolf, dingo or dog -> `ref/research/scout/11-body-models/`
- **Commercially usable only:** CC0, CC BY or public domain. Places to search:
  - Sketchfab with the CC BY or CC0 filter, including museum accounts;
  - Smithsonian 3D;
  - museum open-access scans;
  - CC0 libraries such as Quaternius, Poly Haven and Kenney;
  - Blender base meshes on Blend Swap and the Blender Studio library (check each licence).
- **Rank them** by anatomical realism, ahead of looks.
- **`candidates.csv`:** URL, author, licence, species, realism (scan, sculpt or stylised), polygon count, rigged (yes or no), has fur or hair, format, notes. Download only the top 3 that are under 20 MB.
- **Purpose:** a skin and topology donor to wrap over our bones, and a check on proportions.

## 3. Tools that build bodies from skeletons -> `ref/research/scout/12-body-tools/`
- **Blender add-ons that are open source (GPL is fine: we run Blender, we don't ship it).** They should do one of these:
  - build muscle volumes from lines or curves;
  - build a skin or body mesh from an armature (skin modifier helpers, metaball rigs, lofting tools);
  - generate quadrupeds or animals.

  For each: licence, last update, whether it runs headless (from a Python script with no window), and a one-line summary of what it does.
- **"MakeHuman for animals":** any open parametric quadruped or dog generator, in Blender or standalone, with commercially usable output.
- **Papers or open projects** that make animal bodies from a skeleton plus muscles, such as "Anatomy Transfer" (Ali-Hamadi, Dicko et al. 2013) or Weta-style tissue layering. Note any open code or data, and its licence.

## 4. Keep going with what you were doing
Dingo and Carolina Dog body templates (`01-body-templates/`), ears and face soft tissue (06, 07), US government public-domain references (09). Item 1 above jumps ahead of all of these.
