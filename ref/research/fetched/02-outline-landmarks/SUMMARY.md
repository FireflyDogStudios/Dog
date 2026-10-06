# 02-outline-landmarks: summary

**Status: fetched.** GrumpyDingo got the full StanfordExtra v12 annotations through the authors' Google form on 2026-10-06.
- **Licence:** MIT; the README says "As of 02-NOV-2024, this dataset is now MIT licensed". The zip carries no other terms.
- **Stored:** `data.json` (14.5 MB): all 12,538 dogs in 120 breeds, with keypoints, the silhouette outline (simplified polygons) and the train/val/test split. No images.
- **Converter:** `convert_stanfordextra.py` re-runs the conversion and the checks.

| What | Number |
|---|---|
| Dogs / breeds | 12,538 / 120 (66-183 per breed) |
| Split (from the .npy files, disjoint, covers all) | train 6,773, val 4,062, test 1,703 |
| Keypoints labelled per dog | up to 20 of 24 (median 13); eyes, withers, throat never labelled |
| Outline points | 790,725 (about 63 per dog); 60 dogs have no outline, 419 have more than one polygon |
| Visible keypoints inside or within 6 px of the outline | 99.25% (161,482 / 162,696) |
| Outline extent vs bbox | median IoU 0.956; bboxes are sometimes loose or wrong, so trust the outline |

## Breeds relevant to us
Keypoints per dog and outline points per dog are averages.

| Breed | Dogs | Train | Val | Test | Keypoints/dog | Outline pts/dog |
|---|---|---|---|---|---|---|
| dingo | 108 | 0 | 108 | 0 | 14.0 | 65 |
| dhole | 102 | 0 | 102 | 0 | 13.2 | 67 |
| African_hunting_dog | 84 | 1 | 83 | 0 | 13.8 | 72 |
| basenji | 157 | 107 | 25 | 25 | 15.3 | 70 |
| kelpie | 87 | 55 | 15 | 17 | 13.8 | 64 |
| Mexican_hairless | 104 | 0 | 104 | 0 | 14.2 | 75 |
| Ibizan_hound | 142 | 96 | 19 | 27 | 16.0 | 71 |
| Siberian_husky | 127 | 77 | 30 | 20 | 14.2 | 62 |
| malamute | 121 | 77 | 23 | 21 | 14.6 | 63 |
| Eskimo_dog | 67 | 46 | 9 | 12 | 14.9 | 66 |
| German_shepherd | 98 | 58 | 24 | 16 | 14.7 | 64 |
| malinois | 100 | 64 | 19 | 17 | 15.0 | 63 |
| Norwegian_elkhound | 143 | 92 | 29 | 22 | 15.5 | 64 |
| Saluki | 139 | 96 | 20 | 23 | 14.9 | 79 |
| whippet | 138 | 91 | 26 | 21 | 14.9 | 76 |
| Irish_wolfhound | 144 | 93 | 21 | 30 | 14.1 | 65 |
| Samoyed | 161 | 47 | 104 | 10 | 12.6 | 61 |
| chow | 93 | 29 | 61 | 3 | 12.4 | 54 |
| keeshond | 75 | 9 | 66 | 0 | 10.9 | 60 |

- There is no wolf, coyote, jackal or Carolina Dog: Stanford Dogs has only domestic breeds plus dingo, dhole and African hunting dog.
- The dingo is the closest match to our hero. Basenji, kelpie, Ibizan hound and Mexican hairless are the nearest pariah or primitive types.

## All breeds (dogs)
Afghan_hound 170, African_hunting_dog 84, Airedale 131, American_Staffordshire_terrier 95, Appenzeller 92, Australian_terrier 119, Bedlington_terrier 131, Bernese_mountain_dog 129, Blenheim_spaniel 138, Border_collie 79, Border_terrier 96, Boston_bull 92, Bouvier_des_Flandres 109, Brabancon_griffon 90, Brittany_spaniel 91, Cardigan 98, Chesapeake_Bay_retriever 97, Chihuahua 119, Dandie_Dinmont 118, Doberman 95, English_foxhound 122, English_setter 75, English_springer 75, EntleBucher 149, Eskimo_dog 67, French_bulldog 95, German_shepherd 98, German_short-haired_pointer 74, Gordon_setter 67, Great_Dane 110, Great_Pyrenees 136, Greater_Swiss_Mountain_dog 104, Ibizan_hound 142, Irish_setter 71, Irish_terrier 87, Irish_water_spaniel 80, Irish_wolfhound 144, Italian_greyhound 122, Japanese_spaniel 145, Kerry_blue_terrier 130, Labrador_retriever 83, Lakeland_terrier 115, Leonberg 162, Lhasa 66, Maltese_dog 183, Mexican_hairless 104, Newfoundland 87, Norfolk_terrier 95, Norwegian_elkhound 143, Norwich_terrier 119, Old_English_sheepdog 84, Pekinese 104, Pembroke 98, Pomeranian 98, Rhodesian_ridgeback 134, Rottweiler 76, Saint_Bernard 88, Saluki 139, Samoyed 161, Scotch_terrier 67, Scottish_deerhound 131, Sealyham_terrier 151, Shetland_sheepdog 75, Shih-Tzu 160, Siberian_husky 127, Staffordshire_bullterrier 99, Sussex_spaniel 108, Tibetan_mastiff 98, Tibetan_terrier 117, Walker_hound 103, Weimaraner 79, Welsh_springer_spaniel 101, West_Highland_white_terrier 80, Yorkshire_terrier 89, affenpinscher 78, basenji 157, basset 126, beagle 129, black-and-tan_coonhound 94, bloodhound 102, bluetick 110, borzoi 113, boxer 77, briard 93, bull_mastiff 83, cairn 120, chow 93, clumber 78, cocker_spaniel 80, collie 84, curly-coated_retriever 96, dhole 102, dingo 108, flat-coated_retriever 76, giant_schnauzer 83, golden_retriever 75, groenendael 83, keeshond 75, kelpie 87, komondor 89, kuvasz 89, malamute 121, malinois 100, miniature_pinscher 111, miniature_poodle 102, miniature_schnauzer 77, otterhound 113, papillon 154, pug 108, redbone 83, schipperke 86, silky_terrier 109, soft-coated_wheaten_terrier 79, standard_poodle 86, standard_schnauzer 88, toy_poodle 81, toy_terrier 139, vizsla 88, whippet 138, wire-haired_fox_terrier 105.
