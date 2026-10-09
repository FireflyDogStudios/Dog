# AwA-Pose keypoints (canids and the raccoon), for measuring proportions

From [AwA-Pose](https://github.com/prinik/AwA-Pose) (Prianka Banik et al. 2021, MIT licence, see `LICENSE.txt`): 39 hand-marked keypoints per animal on photos from the Animals with Attributes 2 set. Only the keypoint coordinates are kept here (no images), converted from the repo's pickles to one JSON: `canids.json` maps species to a list of `{img, kp:{name:[x,y]}}`.

Species kept: wolf, german_shepherd, collie, dalmatian, chihuahua, fox, raccoon. Keypoints include nose, eyes, ear bases and tips, upper and lower jaw, mouth corners, neck, throat, back, belly, tail base and tip, and each leg's top, knee and paw.

**Use:** ratios only (for example front-leg length over body length), as medians over many photos, to set a species' proportions against the new hero. Never tracing (original art only). Credit AwA-Pose in the game's `CREDITS` when a species built from it ships. The coordinates are 2D projections of mixed poses, so they compare species with each other; they are not true bone lengths.
