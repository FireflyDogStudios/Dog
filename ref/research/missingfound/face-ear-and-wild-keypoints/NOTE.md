# Face, ear and wild-canid keypoints: notes

Searched 2026-10-07 by a Firefly data agent. Follows `docs/claude/DEN-DATA-FETCH-PROMPT.md`. Builds on `ref/research/fetched/09-face-and-ear/` and `ref/research/fetched/08-wild-keypoints/`; nothing there is redone. Animal Kingdom was not touched (non-commercial terms, see 08).

Numbers are in `numbers.json` (value, unit, n, context, citation, URL, licence, confidence A/B/C). **No keypoint data file was written:** no permissively licensed source with coyote, jackal, dhole, African wild dog, hyena, raccoon dog, dingo or non-red fox keypoints was found.

## Method
- **Europe PMC REST** (`https://www.ebi.ac.uk/europepmc/webservices/rest/search`, `resultType=core` for the licence; `fullTextXML` for the text). Queries: ear angle / pinna angle / ear position / ear movement / ear flick / pinna movement with dog, wolf, fox, canid; `BODY:"ear angle"`, `BODY:"angle of the ear"`; DogFACS EAD durations; play face / relaxed open mouth; bark, howl, growl, snarl with mouth opening, gape, lip retraction, jaw angle; bark, howl, growl durations; gape angle in Carnivora; maximum mouth opening in dogs; DeepLabCut / pose estimation / kinematics with each wild canid and hyena.
- Full texts were read as text and searched with regular expressions; tables were flattened from the XML. When Europe PMC had no full text, `pmc.ncbi.nlm.nih.gov` worked with a browser user agent (facts only).
- **Research Square** preprint PDFs (`/article/<id>/v1.pdf`) for two CC BY preprints, read with `pdftotext`.
- **Hugging Face** dataset API (`/api/datasets?search=`): dog keypoint, dog pose, animal pose, dog face landmark, dog facial, quadruped, animal keypoint, hyena, jackal, coyote, wild dog, fox pose, animal3d, mammalnet, superanimal, canine.
- **Kaggle** public API (`/api/v1/datasets/list?search=`): hyena, jackal, coyote, wild dog, dingo, fox, animal pose, animal keypoint, dog keypoint, dog facial landmarks, dhole.
- **Zenodo** API (`/api/records?q=`): Quadruped-80K, SuperAnimal quadruped, keypoints hyena, wild-canid pose, dog facial landmarks, canid DeepLabCut.
- **GitHub** through raw.githubusercontent.com (the session's GitHub API access did not cover these repos), and a general web search for Roboflow, Animal3D, AnimalWeb and Columbia Dogs.
- Raw downloads went to `/tmp/mf-face/` only; the Animal3D JSON (30 MB) was deleted after inspection. No images were downloaded.

## Sources used (facts stored in numbers.json)
| Source | URL | Licence | Used for |
|---|---|---|---|
| Populin & Yin 1998, J Neurosci 18(11):4233 (cat pinna, search coils) | https://pmc.ncbi.nlm.nih.gov/articles/PMC6792787/ | CC BY-NC-SA 4.0: **fact only** | pinna turns ~10° (up to ~20°) toward an 18–23° target; 25 ms short-latency twitch, bigger in the near ear |
| Gähwiler, Bremhorst, Tóth & Riemer 2020, Sci Rep 10:16035 | https://europepmc.org/article/PMC/PMC7525486 | CC BY 4.0 | ear-base score backward under fireworks, d = 0.68, n = 36; yawn = mouth wide open ≥ 1 s; blink definition |
| Martvel & Riemer 2025, Sci Rep (geometric morphometrics) | https://europepmc.org/article/PMC/PMC12405473 | CC BY 4.0 | ear bases move medially (ears back) under fear; landmark data "on request" only |
| Bremhorst et al. 2019, Sci Rep 9:19312 | https://europepmc.org/article/PMC/PMC6917793 | CC BY 4.0 | EAD102 positive / EAD103 negative; DogFACS ear and mouth definitions; n = 29 Labradors |
| Déaux et al. 2024, PLoS Biol 22:e3002789 | https://europepmc.org/article/PMC/PMC11444399 | CC BY 4.0 | dog vocal rhythm 2 ± 1.1 per s across all call types |
| Sadhukhan, Hennelly & Habib 2019, PLoS ONE 14:e0216186 | https://europepmc.org/article/PMC/PMC6822943 | CC BY 4.0 | Indian wolf howl 5.21 ± 2.49 s (n = 238), squeak, whine, whimper durations |
| Ekström et al. 2024, Research Square preprint rs-5354163 | https://www.researchsquare.com/article/rs-5354163/v1 | CC BY 4.0 | howl tongue gesture; statement that canine jaw lowering is undescribed |
| Maglieri 2025, Research Square preprint rs-6219576 | https://www.researchsquare.com/article/rs-6219576/v1 | CC BY 4.0 | ROM action-unit sets for wolf and 30 breeds |
| Palagi, Nicotra & Cordoni 2015, R Soc Open Sci 2:150505 | https://europepmc.org/article/PMC/PMC4807458 | CC BY 4.0 | ROM grades; mimicry within 1 s; 77% of 49 dogs |

## Checked: no usable numbers (licence fine, content missing)
- Canori et al. 2026, Anim Cogn (PMC13002743, CC BY): EAD101/103/105 total holding time per still-face phase, in figures only; not bout durations.
- Hobkirk & Twiss 2024, Sci Rep (PMC11076640, CC BY): wolves rely on ear movements more than dogs; floppy ears confuse classifiers. No angles.
- Cunningham et al. 2024, coyote facial expressions, R Soc Open Sci (PMC11444785, CC BY): no ear durations.
- Capitain et al. 2025, wolf vs dog greeting, Anim Cogn (PMC12226620, CC BY): no ear durations.
- Sheidin et al. 2026, Front Vet Sci (PMC13212098, CC BY); Flint et al. 2024, Sci Rep (PMC10944520, CC BY); Mota-Rojas et al. 2025 review (PMC11926555, CC BY); Górski et al. 2026 review (PMC12837618, CC BY): no ear angles.
- Martvel et al. 2025, BMC Vet Res (PMC12102829, **CC BY-NC-ND**): facial "dynamics" indices only, no angles.
- Martvel et al. 2025, DogFLW paper, Sci Rep (PMC12218811, CC BY): describes the dataset; no movement numbers.
- Policht et al. 2021, hunting dog barks, Sci Rep (PMC8460642, CC BY): bark durations only in figures and DFA loadings.
- Savel & Legou 2024, Animals (PMC10812668, CC BY): no call durations in the text.
- Wolf and jackal howl detection papers (PMC8012383, PMC8909475, PMC11879656; CC BY): repeat the 5.21 s value or have none.
- Gape-angle searches in Carnivora (aardwolf craniometry PMC12918353, sabretooth papers, carnivore ecomorphology PMC10685142, feline TMJ MRI PMC13611908): no live-animal gape for canids or hyenas.
- Ruhland, Jones & Yin 2015 (cat dynamic localisation, PMC4725098): not open access; abstract has no pinna numbers.

## Keypoint and landmark datasets checked (gap C and face landmarks)
| Dataset | Where | Licence verdict | Species / content | Stored? |
|---|---|---|---|---|
| **DogFLW** (Martvel et al. 2025), 4,335 dog faces, 46 landmarks incl. ears and mouth | https://github.com/martvelge/DogFLW (README + LICENSE read via raw.githubusercontent.com); https://www.kaggle.com/datasets/georgemartvel/dogflw | **CC BY-NC 4.0** (LICENSE file and Kaggle licence field agree). Non-commercial | dog faces only | No |
| **Animal3D** (Xu et al. ICCV 2023), 3,379 images, 26 keypoints + SMAL | https://xujiacong.github.io/Animal3D/ ; GitHub XuJiacong/Animal3D (LICENSE = MIT, but the repo holds only a README); annotations train.json/test.json on Google Drive folder 17KRe8Z7jCZNDeBu45Wx2zS8Yh2tV_t2v | **Unclear, so not stored.** The annotation files themselves say `"info": "Traing set for Animal3D; All Right Reserved."`, which conflicts with the repo's MIT licence; images are ImageNet (non-commercial) and the SMAL parameters come from the SMAL model, which has its own non-commercial licence. | ImageNet classes: 18 dog breeds, **timber wolf** (n02114367, 52 images) and **arctic fox** (n02120079, 61 images); no coyote, dingo, dhole, African hunting dog, hyena or red fox | No |
| SuperAnimal-Quadruped-80K (Ye et al. 2024) | https://zenodo.org/records/14016777 | **"Modified MIT", academic non-commercial only.** Not usable | mix of AwA-Pose, AnimalPose, AcinoSet, Horse-30, StanfordExtra, AP-10K, iRodent, APT-36K; no new wild canids beyond those already in 08 | No |
| APTv2 (Yang et al. 2023) | https://github.com/ViTAE-Transformer/APTv2 | not checked further | same 30 species as APT-36K (Canidae = dog, fox, wolf only, already in 08) | No |
| AnimalWeb (Khan et al. CVPR 2020), 21.9K faces, 334 species, 9 face landmarks | https://fdmaproject.wordpress.com/ (5.5 GB RAR on Google Drive) | **No licence stated anywhere** (site, paper). Unclear | might include wild canid and hyena faces | No (not downloaded) |
| Columbia Dogs (Liu et al. ECCV 2012), 8,351 images, 8 face points incl. ear tips and bases | paper only; no download page found | unclear | dogs only | No |
| Animal Pose (Cao et al. 2019) and the Kaggle copies (bloodaxe/animal-pose-dataset, egorovalexeyd/...; licence "Unknown") | Kaggle | unclear | dog, cat, cow, horse, sheep: no wild canids | No |
| Hyena ID 2022 (Botswana Predator Conservation Trust, LILA) | https://www.kaggle.com/datasets/mexwell/hyena-id-2022 | CDLA-Permissive 1.0 (permissive) | spotted hyena, **bounding boxes and viewpoint only, no keypoints** | No (no keypoints) |
| MammalNet | https://huggingface.co/datasets/linxxx3/MammalNet | no licence in the card | behaviour videos, no keypoints | No |
| Hugging Face: stockeh/dog-pose-cv (Apache-2.0), chenhaonan143/dog_poses (MIT) | huggingface.co | permissive | dog posture class labels only (standing/sitting/lying), no coordinates | No |
| Roboflow Universe | universe.roboflow.com | **Blocked**: Cloudflare 403 on 3 tries; the API needs an account key (401). Web search found only detection (box) sets for coyote, hyena and jackal, plus one generic "animal pose" set (yoi/animal-pose-dhzxt) whose licence page could not be opened | — | No |
| Animal Kingdom | — | non-commercial (see 08); deliberately not touched | — | No |
| TigDog, OpenMonkeyStudio | — | not relevant (tigers, horses, monkeys) | — | No |

## Conversions
None. All values are as published; "Hz" for the vocal rhythm is the paper's own unit (vocalisations per second).
