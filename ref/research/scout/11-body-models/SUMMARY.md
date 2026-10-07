# 11: full-body canid models, summary (2026-10-07)

**Bottom line:** no CC BY or CC0 scan of a **standing** real wolf, dingo or dog can be downloaded without a login. The best real-animal shapes we have are a **sitting** golden retriever and a **curled, sleeping** Australian Shepherd. The best **standing** body is a wolf made by an artist. The one standing taxidermy scan (a fox) needs a Sketchfab login.

## Downloaded (all CC BY 4.0, https://creativecommons.org/licenses/by/4.0/, unmodified, each under 20 MB; credit lines in each LICENSE.txt)
| # | Folder | What it is | Why it is here |
|---|---|---|---|
| 1 | `01-golden-retriever-ella-scan/ella_scan.glb` (19.2 MB, 604k faces, texture) | 3D-camera scan of a live golden retriever, sitting (3DFascination, 2015): https://sketchfab.com/3d-models/ella-of-golden-house-1100336a3ab94d478e41e3136429cae4 | Real skin over real anatomy: chest depth, neck, limb volumes. It is sitting, so it checks volumes, not standing proportions. |
| 2 | `02-aussie-shepherd-diego-scan/diego_scan.glb` (18.5 MB, 699k faces, no texture) | Revopoint scan of a live Australian Shepherd, asleep and curled (rapterron, 2021): https://sketchfab.com/3d-models/australian-shepherd-dog-diego-by-revopoint-pop-06353b8c5b754ea3a8b8ca6cf0cf90af | A second real dog, a medium herding breed closer in size to the Carolina Dog. Skin and volume reference only (curled, open underside). |
| 3 | `03-italian-white-wolf/italian_white_wolf.glb` (2.7 MB, 30k faces, 1024 px texture, no rig) | Grey wolf made by an artist, standing neutral (SDPM Esare / sdpm, 2021): https://sketchfab.com/3d-models/italian-white-wolf-1de9441cb0744c0d8459ce957b8d0a57 | The best standing body in reach: believable wolf proportions and paws, few enough faces to be a good **skin and topology donor** over our bones. |

All three came login-free from the Objaverse 1.0 mirror on Hugging Face (`huggingface.co/datasets/allenai/objaverse`; licences per item, confirmed today through the Sketchfab API). Each was rendered in three views and checked: each is what it claims to be.

## Next best, one command away (no login)
- **Fully Rigged IK/FK Wolf** (stephenmmichie, CC BY 4.0, 11.6k faces, 76-joint rig, 0.9 MB): the best rig and topology donor; left out only by the top-3 limit. `curl -L -o wolf_rig.glb https://huggingface.co/datasets/allenai/objaverse/resolve/main/glbs/000-016/e96cb4ad45ef4766a02a305ce8d652b8.glb`
- **VR Dingo Standing** (BeThere/betherevt, CC BY 4.0, 5.1k faces, rigged, 2.3 MB): the only full body labelled as a dingo; low poly, but the outline is right. `https://huggingface.co/datasets/allenai/objaverse/resolve/main/glbs/000-149/35bd9d73e9384980ae7c748cb3909aff.glb`

## Needs a human (Sketchfab login; all CC BY 4.0, confirmed through the API today)
1. **Test scan of taxidermy fox** (Jakob.Normand): https://sketchfab.com/3d-models/test-scan-of-taxidermy-fox-b961f8be18fd4765be1fccfe47ee2512 . The **top realism pick**: full-body standing taxidermy mount, photogrammetry, about 1M faces. Download the glTF into Drive; Scout will check and decimate it.
2. **Blue Heeler / Australian Cattle Dog** (3Danny): https://sketchfab.com/3d-models/blue-heelerkelpyaustralian-cattle-dog-no-ai-fa112be1e4074e3caea884f61848af0e . LiDAR scan of a live dog lying with its legs stretched out.
3. **Spanish Greyhound (Galgo Español)** (Abrazafarolas): https://sketchfab.com/3d-models/spanish-greyhound-galgo-espanol-6acb647e5f694066bfd98585f1d6c77c . Best realistic standing sculpt, sighthound build.
4. Optional: University of Nottingham vet-school dog plane models, a simple standing dog body: https://sketchfab.com/3d-models/dog-sagital-plane-demo-427a932ee6514fa39ce23b34a20277a5

Also for a human:
- **Blend Swap** is behind Cloudflare and was not searched: a browser search for wolf, dog and fox (CC0 or CC BY only).
- **Confirm who made the Italian White Wolf:** another account re-uploaded the same mesh in 2022; we credit sdpm, who uploaded it first.

## What did not work, and why
- **Museums:** every canid on the museum Sketchfab accounts (NHM Denmark, MRI PAS, MSB, UBC Beaty, ZMMU, Dundee) is a skull or bone. Smithsonian 3D has only a dire wolf skeleton (CC0): useful for checking bones, but the species is extinct.
- **AI-generated "realistic" canids** are common (84 found); all rejected.
- **Research dog-shape datasets** (3DDogs/RGBD-Dog, SMAL/SMBLD) are non-commercial.
- **MRI "Canine Skin" model** (UQ Vet School, CC BY) is a head only; could help `07-head-soft-tissue`, but the file is 96.6 MB and would need decimating.
- A "Silver Fox" scan turned out to be a figurine reconstructed from frames of someone else's YouTube video: not kept.

Details: `NOTE.md` (searches, licence checks, rejections) and `candidates.csv` (40 ranked rows).
