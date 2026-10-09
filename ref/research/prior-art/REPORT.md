# Prior art for the species creator: has anyone done this, and what can we learn?

Research pass by a Firefly research agent, Oct 6, 2026; saved here by Firefly from its hand-back. Companion file: `sources.json` (42 entries, each `{name, kind, url, licence, summary, lessons, verified}`).

**How solid the sources are.** Some hosts were blocked: chrishecker.com, the mirrors of the Spore paper PDF, and the INRIA and Dryad pages were never opened. For those, the facts come from search snippets, and the `verified` field says so. The agent opened the GitHub READMEs of nintendogs-threejs, Spawnforge, StanfordExtra, RGBD-Dog, AcinoSet, open-quadruped, StanfordQuadruped, OpenCat, DragonBonesJS, smal-fitter and barc_release.

## Short answer
Yes. Parts of our pipeline have been built many times. As far as the agent could find, nobody has put all three parts together for a game: a species file of sourced, graded anatomy numbers, a skeleton laid out from those numbers, and paw-goal IK driven by measured gait data.

- **Closest academic precedent:** Reveret et al. 2005, "Morphable model of quadrupeds skeletons". It builds a rig-ready quadruped skeleton from a few measurements plus learned ratios.
- **Closest game precedent:** Spore (2008), which retargets authored motion stored as limb-normalised goals onto arbitrary bodies.
- **Closest hobby project:** nintendogs-threejs. Each breed is a set of proportions driving a skeleton and a smooth skin, with two-bone foot IK. Its proportions are artistic, not sourced, and it has no licence, so we can't reuse its code.

## Games and tools
- **Spore** (Hecker et al., SIGGRAPH 2008):
  - Motion is authored once in an in-house tool (Spasm) and stored as goals that don't depend on the body. Goals are marked, for example, "ground-relative" or "scale with limb length".
  - At runtime the goals feed a tunable IK solver, plus a gait synthesiser that groups legs by length and a layer of passive secondary motion.
  - The skin is a blobby surface built from spherical metaballs. It joins smoothly, but it also webs between limbs.
  - Players called the generic motion floppy.
  - Lesson: limb-normalised paw goals work; per-species tuning is what Spore couldn't do and we can.
- **WolfQuest:**
  - NSF-funded wolf-ecology game with wolf biologists as advisers (Mech, MacNulty, Stahler and others).
  - Coats are textured from real Yellowstone wolves. The animation is ordinary keyframing, outsourced to a studio working from specs.
  - Lesson: the scientists' biggest effect was on behaviour and ecology, so our `behaviour` group deserves the same care as the bones.
- **Rain World:** creatures are points joined at fixed distances, plus AI that searches for footholds, and the creatures have goals of their own. Too much for a dog; borrow the distance-chain idea for the tail.
- **Overgrowth:** about 13 key poses, blended by gait phase, with springs on top; physics first, animation layered over it. Lesson: a few poses plus phase plus springs is enough.
- **The Flame in the Flood:** a wolf with a procedural spine and stride warping, needing no transition clips.
- **Ubisoft IK Rig:** animation stored as end-effector goals, re-solved on any skeleton. This confirms our approach.
- **Red Dead Redemption 2 horses:**
  - Continuous speed instead of fixed gaits.
  - Real horses were filmed, and small behaviours such as a side-step before turning and a lean into the turn made the difference.
  - Lesson: record such behaviours as `traits`.
- **Shadow of the Colossus and The Last Guardian:**
  - Keyframed animals with procedural foot IK and spine on top.
  - Trico steadies its head first, then the neck, and picks each foot's landing point at lift-off.
  - Lesson: head stabilisation and landing points chosen at lift-off.
- **Nintendogs** (Iwata Asks): the team hoped to share animation between dogs and cats, but the motion was too different and ended up almost entirely separate. Lesson: separate gait and behaviour tables for each family, not just rescaled bones.
- **Stray:** one animator, no motion capture, video of the team's own cats. They say living with cats lets them see at once when motion is off. This matches the rule that GrumpyDingo judges every change.
- **Rigify** (GPL; rigs it generates are content, not code):
  - Ships wolf, horse and cat metarigs. A simple metarig goes in, a full rig comes out, which is the same split as our species file and skeleton builder.
  - Its quadruped leg type is a 4-bone chain (thigh, shin, paw, toe) with the extra hock joint, the same layout as our legs.
- **Auto-Rig Pro** (commercial): its 3-bone dog legs are two-bone IK plus one coupling or stiffness control, the same idea as our "pantograph" hind leg.
- **2D tools:**
  - **Spine:** its runtime licence requires every user to hold a Spine licence. Avoid it.
  - **DragonBones:** MIT, has a PixiJS runtime. Not needed.
  - **Moho Smart Bones:** joint angles drive corrective shapes. Worth copying for our silhouette, for example the elbow point, the stifle bulge and the chest at full reach.
- **Robotics** (all MIT code):
  - **open-quadruped:** Bezier swing curves.
  - **StanfordQuadruped:** a clean stance/swing gait scheduler.
  - **OpenCat:** stores gaits as tables of joint angles, which shows why that format doesn't transfer between bodies.
  - **MIT Cheetah:** light lower limbs, with bones taking compression and tendons tension. Draw the pastern and paw thin and compact.

## Science
- **SMAL and its follow-ups (SMALR, SMBLD, BARC, BITE):**
  - SMAL is a parametric 3D shape and pose model built from 41 scans of *toy figurines*, with roughly 33–35 joints. Its proportions aren't real anatomy.
  - SMBLD had to add a length scale for each body segment to cover dogs, which is our bone-lengths-first idea.
  - BARC fills missing data using breed similarity. That matches our approach of borrowing from the nearest relative at a lower confidence grade.
  - BITE adds ground contact, which supports our paws-on-the-ground solve.
  - The licences are non-commercial research only. Take the ideas, not the files.
- **Coros et al. 2011, "Locomotion Skills for Simulated Quadrupeds":**
  - Gait graphs, a "dual leg frame" model, a flexible spine, and a dog with walk, trot, pace, canter, transverse and rotary gallop, sitting and lying.
  - The dual leg frame is our two girdles (hips and shoulders) driven by their own legs, so this strongly validates our structure.
- **Torkos & van de Panne 1998:** footprints and their timings are the hard constraints, and the body's path is fitted to them. That is our step of deriving the body from the footfalls.
- **Reveret et al. 2005:** a few measurements plus learned ratios give a usable skeleton. This supports our `ASSUME` table.
- **Skrba et al. 2009 survey:** the hard parts are real motion data, accurate skeletons and locomotion knowledge.
- **Stark, Fischer et al. 2021, OpenSim dog model** on SimTK ("dogmodel"):
  - A Beagle with 84 degrees of freedom and 134 muscles; scalable and modular; the article is **CC BY 4.0**.
  - Lesson: a citable source of joint centres and joint ranges for our `limits` group.
- **Greyhound hindlimb model** (Ellis et al. 2018, SimTK): sit-to-stand joint angles.
- **Fischer & Lilje, *Dogs in Motion*:**
  - X-ray video, markers and force plates on 327 dogs of 32 breeds.
  - The shoulder blade sliding along the ribs makes up at least about 65% of forelimb stride length.
  - Lesson: our scapula arc needs real range. This is the best source for joint angles; cite the numbers, never copy the figures.
- **Skull and limb shape studies:**
  - Drake & Klingenberg 2010: dog skull shape varies as much as across all carnivores, and the skull is modular. Lesson: give the skull its own parameters instead of scaling a wolf skull.
  - Wayne 1986: wolf-like canids overlap dogs of the same size, and proportions change with body size. Lesson: fill gaps from a relative of *similar size*.
- **Samuels, Meachen & Sakai 2013:** limb indices for 107 carnivore species on Dryad (Dryad data is normally CC0). Possibly a licence-clean source of bone ratios for coyote, foxes, dhole and African wild dog. Unopened: check the file and its licence first.
- **Datasets:**
  - **StanfordExtra:** annotations are **MIT since Nov 2024**; the images keep the Stanford Dogs terms. 12k dogs with 20 keypoints and silhouettes. The keypoints have no shoulder or hip, so they suit leg, ear and tail ratios only.
  - **RGBD-Dog** (motion capture of 5 dogs): academic use only, through a release form.
  - **MANN:** non-commercial.
  - **AcinoSet** (cheetahs): licence not stated.

## Art and animation practice
- **Muybridge** dog plates (705–707 mastiffs trotting and galloping, 709, 710 greyhound "Maggie" galloping):
  - **Public domain**, with scans on Wikimedia Commons, the Smithsonian and NGA.
  - We can trace keypoints over them to check footfall order and duty factors. Muybridge's frame timings are approximate.
- **Ellenberger, Baum & Dittrich atlas:** the 1901 German original is probably public domain; the Dover English edition may still be in copyright. It has matching side views of skeleton, muscles and exterior, which is ideal for checking how far the skin sits off the bones.
- **Preston Blair, Toon Boom, Richard Williams:**
  - The hind leg leads the front by about half a step, the body bobs as the legs pass, and contact and passing poses come first.
  - Our gait offsets already reproduce these rules.
- **Milt Kahl, Ken Hultgren, Aaron Blaise, Eliot Goldfinger:** artists stylise with a line of action and simple masses, exaggerating proportions while keeping joint order, bend directions and the visible landmarks (point of shoulder, elbow, hock, croup) where the skeleton puts them.

## The 5 most useful lessons for our pipeline
1. **Store motion as paw goals in leg-normalised units, never as joint angles.** Spore, Ubisoft IK Rig and Nintendogs-style breed transfer all depend on this, and OpenCat's angle tables show the failure. Express stride, swing lift and stance length in hip-height units in the `gait` group.
2. **Model the body as two girdles driven by their own legs, joined by a flexible spine, with a scapula that slides.** Coros 2011's dual leg frames, Flame in the Flood and Trico's spine curve, and Fischer's finding that the scapula gives at least about 65% of forelimb stride all point here. Give lumbar flex and scapula range their own species numbers.
3. **Fill gaps from the nearest relative of similar size, at a lower confidence grade, never by stretching the wolf linearly.** This follows BARC's breed prior, SMBLD's per-segment scales and Wayne's finding that proportions change with size. Give the skull separate parameters (Drake & Klingenberg).
4. **Stylise masses, not joints.** Keep joint positions, bend directions and visible landmarks from the skeleton, and exaggerate only the silhouette masses and proportions. Add Moho-style corrective shapes driven by joint angles. Keep limbs as separate layers rather than one merged skin, to avoid Spore-style webbing.
5. **Believability comes from small behaviours and expert eyes as much as from bones.** Examples: head stabilisation (Trico), choosing the landing point at lift-off, the side-step and lean before a turn (RDR2), behaviour-first design (Rain World), science advisers for behaviour (WolfQuest), and a person who knows the animal judging every change (Stray). Put these in `traits` and `behaviour`, and keep checking against Muybridge frames.

## Reusable, permissively licensed code and data
- **Public domain:** Muybridge *Animal Locomotion* dog plates. Use them for gait checks and keypoint tracing, crediting the scanning institution.
- **CC BY 4.0:** the Stark/Fischer OpenSim dog model article and its data, for joint centres and ranges. The greyhound hindlimb paper (Frontiers) is also open access.
- **MIT:** StanfordExtra annotations, for keypoint ratios (images not included).
- **MIT code to read or borrow from:** open-quadruped (Bezier swing), StanfordQuadruped (gait scheduler), OpenCat, DragonBonesJS, smal-fitter.
- **Probably CC0:** Samuels et al. 2013 carnivore limb measurements on Dryad. Check before use.
- **GPL:** Rigify's wolf metarig. Fine as a proportion sanity check inside Blender, but don't copy its code into the game.
- **Not usable** (non-commercial or no licence): SMAL, SMALR, BARC, BITE, RGBD-Dog, MANN, nintendogs-threejs, Spawnforge (licence not shown on its README), and the Spine runtimes.

## Main sources
Full URLs are in `sources.json`. Key ones:
- Spore: https://www.chrishecker.com/Real-time_Motion_Retargeting_to_Highly_Varied_User-Created_Morphologies
- WolfQuest: https://www.wolfquest.org/about
- RDR2 horses: https://media.gdcvault.com/GDC+2021/making_horses_gdc2021.pdf
- Coros 2011: https://www.cs.ubc.ca/~van/papers/2011-TOG-quadruped/index.html
- Reveret 2005: http://morpheo.inrialpes.fr/people/reveret/MorphableSkeleton/index.html
- Dog musculoskeletal model: https://www.nature.com/articles/s41598-021-90058-0
- SimTK dogmodel: https://simtk.org/projects/dogmodel/
- Dogs in Motion: https://www.vdh.de/en/dogs-in-motion/
- Drake & Klingenberg 2010: https://morphometrics.uk/PDF_files/AmNat2010.pdf
- Samuels 2013 (Dryad): https://datadryad.org/dataset/doi:10.5061/dryad.77tm4
- Muybridge plate 710: https://commons.wikimedia.org/wiki/File:Dog_Maggie_galloping_(rbm-QP301M8-1887-710).jpg
- Ellenberger atlas: https://archive.org/details/atlasofanimalana0000well
