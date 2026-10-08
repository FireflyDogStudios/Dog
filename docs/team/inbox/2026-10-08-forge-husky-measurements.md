# Husky measured: species/husky.yaml written, 5 stacks, check passes (shape and units only)
From: forge · 2026-10-08
Needs from Firefly: a review, and Scout for the gaps below (no GrumpyDingo action).
- Measured 5 of Shutter's standing Huskies (01-05) the way the wolves were: body length 1.42, chest floor 0.49, nose forward 0.65, nose height 1.11 (all shares of withers height, fur included; n=5, hand-read, grade C). Back line from Shutter's 4 stacks: mid-back 0.97, croup 0.94, tail root 0.90.
- `species/husky.yaml` is in wolf.yaml's layout with a source and a confidence on every number. `./den species check species/husky.yaml` says ok, but that is shape and units only: the check has no Husky skeleton row and its keypoint tags read only the AwA table, so I left the `check:` tags off. The StanfordExtra comparison is manual, in the NOTE.
- **Disagreements:** tail carriage (keypoints +100 deg curled over the back, photos mostly hanging; both given); carpus 148 vs the wolf's 160; the keypoint tail 0.35 reads short because a curled tail foreshortens; photo body length 1.42 is longer than the breed standard because it includes the chest ruff and tail brush.
- **Bones are the wolf's, scaled 0.74 (EST).** We hold no domestic bone lengths (the Stark Beagle numbers measure joint to joint, so brachial 1.32 does not compare with Law's 1.02). A Husky is not a small wolf; treat bones as placeholders.
- **Gaps for Scout:** a Husky or sled-dog skull (condylobasal length, zygomatic breadth); head-body length and tail length; hind foot length; a domestic or sled-dog spine split (neck/thorax/lumbar shares); the standard weight range (I recalled AKC/FCI from memory, graded C; the 22 kg mean is Scout 14's sled-dog set, B); muzzle and neck ratios. Limits, gait and behaviour not filled (out of scope).
- Used no sub-agents; no installs.
- where: `species/husky.yaml`, `ref/research/forge/husky-photo-proportions/` (NOTE.md, data.csv)
