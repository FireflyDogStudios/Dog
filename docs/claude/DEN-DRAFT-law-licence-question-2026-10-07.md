# DRAFT, NOT SENT: question to the authors of the Law 2025 skeleton data

Drafted by Atlas, Oct 7, 2026, at Firefly's go. **Nobody has been contacted.** Whether and when this is sent, and by whom, is GrumpyDingo's call (house rule: emails go to GrumpyDingo; `docs/claude/DEN-TEAM.md`). Decision wanted in `docs/log/APPROVALS.md` as A-009 once Firefly has read it.

## Why we are asking (for Firefly and GrumpyDingo, not part of the message)
- The core of our bone lengths comes from Chris J. Law's public data. Two GitHub repositories carry **no licence file** and only say "please cite if data are used":
  - Law et al. 2025, *Integrative Organismal Biology* 7:obaf001, repository `chrisjlaw/published_data-Law_etal_2025_IOB` (`rawdata.csv`).
  - Law 2021, *The American Naturalist*, doi:10.1086/715588, repository `chrisjlaw/published_data-Law_2021_AmNat` (`data/data.csv`).
- Without a licence the default is "all rights reserved". Facts such as a bone length are generally not protected, but the dataset as a compilation may be, and we would rather ask than guess.
- **What we hold** (`ref/research/skeleton/DATA-NOTE.txt`): not the raw files. Only species means and ratios we computed ourselves (`species_numbers.json`, `derived_skeleton_ratios.csv`), with citation: 18 species (16 canids and 2 hyenas) from 1 to 3 adult males each; the wolf is n = 2. They feed `species/wolf.yaml` (grade B).
- **What a "yes" unlocks:** putting those derived means in a public, openly licensed reference dataset (proposed CC BY 4.0 for data and MIT for code, approval A-005), with full credit. **What a "no" or silence means:** we keep them out of any public release and use the CC0 Samuels et al. 2013 limb dataset (`ref/research/fetched/06-limb-indices/`) for limb ratios instead.
- **A second, useful question:** we guessed two column codes (see below). A confirmation would remove a low-confidence item.

## The message (plain text, short; GrumpyDingo may change the voice)
Subject: Question about reusing species means from your canid skeleton data

Hello Chris Law and co-authors,

We are building an open reference of canid body proportions (bone lengths, joint angles, gait), mostly to help animators, veterinary students and researchers. Your public data for Law et al. 2025 (*Integrative Organismal Biology* 7:obaf001) and Law 2021 (*American Naturalist*, doi:10.1086/715588) is the best measured source we found for wild canid skeletons, and we are grateful for it.

We did not copy your raw files. We computed species means and a few ratios (for example humerus, radius, femur, tibia, skull length) and credit your papers wherever they appear. The two GitHub repositories have no licence file, so we would like to ask:

1. May we include those derived species means and ratios, with citation to your papers, in an openly licensed dataset (we are thinking of CC BY 4.0)?
2. Would you consider adding a licence to the repositories (CC BY 4.0 or CC0, for example), so that others can reuse them with less doubt? We understand if you prefer not to.
3. Two column codes were not documented, so we guessed: we read `BCL` as braincase length and `COL` as the canine out-lever (jaw joint to canine). Could you confirm or correct that?

If you would rather we did not redistribute the means, please say so and we will keep them out of anything public. Thank you for your time.

Kind regards,
<GrumpyDingo or the sender GrumpyDingo chooses>
The Den team (Project Dog) · <contact>

## Notes for whoever sends it
- Find the corresponding author and the repository owner's contact in the paper and on the GitHub profile; this draft does not carry any address.
- Attach nothing. Do not send our tables unprompted.
- Log the reply (or its absence after two weeks) in `docs/log/LOG.md` and tell Atlas, who updates the licence audit in `docs/research-package/06-gaps-and-risks.md`.
