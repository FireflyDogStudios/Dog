# 06-limb-indices: summary

**Status: fetched.** GrumpyDingo downloaded the dataset by hand (Dryad, CC0 1.0) on 2026-10-06.
- `samuels2013_full.txt`: the full data file, 150 taxa.
- `README_dryad.txt`: the README, verbatim.
- `data.csv`: 20 living canids, 4 hyenas and 13 fossil canids, with every original column plus computed ratios.

The index formulas are now confirmed from the data (see NOTE.md). Two things to know:
- The file's `OLI` and `URI` headers look swapped.
- The dhole's own BI/IM values disagree with its measurements.

## Living canids and hyenas (lengths in mm; BI, CI, IM from the file; MC3/Ra and MT3/Ti computed here)
| Species | Ecology | HuL | RaL | MC3L | FeL | TiL | MT3L | BI Ra/Hu | CI Ti/Fe | MC3/Ra | MT3/Ti | IM |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Canis lupus (wolf) | cursorial | 212.1 | 210.9 | 89.3 | 229.5 | 233.7 | 98.6 | 0.998 | 1.018 | 0.423 | 0.422 | 0.913 |
| Canis latrans (coyote) | cursorial | 160.1 | 168.3 | 68.3 | 179.7 | 187.9 | 77.7 | 1.052 | 1.046 | 0.406 | 0.413 | 0.893 |
| Canis mesomelas | cursorial | 139.0 | 142.7 | 58.5 | 147.8 | 156.4 | 65.0 | 1.027 | 1.058 | 0.410 | 0.416 | 0.926 |
| Canis adustus | cursorial | 127.8 | 135.9 | 57.4 | 138.6 | 146.7 | 63.5 | 1.063 | 1.058 | 0.423 | 0.433 | 0.924 |
| Lycaon pictus (African wild dog) | cursorial | 189.8 | 199.1 | 79.0 | 209.7 | 215.1 | 88.7 | 1.050 | 1.025 | 0.397 | 0.413 | 0.915 |
| Cuon alpinus (dhole) | cursorial | 150.5 | 141.4 | 71.5 | 168.6 | 162.4 | 82.1 | 0.860* | 0.963 | 0.505 | 0.506 | 0.846* |
| Chrysocyon brachyurus | generalist | 253.7 | 264.9 | 112.1 | 270.4 | 295.2 | 128.7 | 1.045 | 1.092 | 0.423 | 0.436 | 0.917 |
| Vulpes vulpes | cursorial | 126.9 | 123.7 | 52.1 | 134.2 | 147.6 | 67.7 | 0.975 | 1.100 | 0.421 | 0.459 | 0.890 |
| Alopex (Vulpes) lagopus | generalist | 106.5 | 101.9 | 42.3 | 106.9 | 123.3 | 52.8 | 0.957 | 1.154 | 0.415 | 0.428 | 0.906 |
| Vulpes macrotis | cursorial | 90.3 | 87.0 | 35.5 | 94.7 | 107.5 | 48.7 | 0.948 | 1.136 | 0.408 | 0.453 | 0.884 |
| Vulpes zerda | cursorial | 70.7 | 65.9 | 25.2 | 73.3 | 89.0 | 37.8 | 0.932 | 1.214 | 0.383 | 0.425 | 0.842 |
| Otocyon megalotis | cursorial | 103.6 | 106.8 | 43.7 | 115.4 | 123.9 | 55.4 | 1.023 | 1.073 | 0.409 | 0.447 | 0.881 |
| Lycalopex gymnocerus | cursorial | 107.6 | 101.1 | 39.6 | 116.6 | 124.6 | 52.6 | 0.940 | 1.067 | 0.391 | 0.422 | 0.865 |
| Lycalopex sp. | cursorial | 94.3 | 90.1 | 37.9 | 106.2 | 114.4 | 45.8 | 0.955 | 1.076 | 0.421 | 0.400 | 0.836 |
| Cerdocyon thous | generalist | 105.3 | 98.5 | 45.1 | 120.0 | 120.3 | 53.3 | 0.936 | 1.004 | 0.458 | 0.443 | 0.850 |
| Atelocynus microtis | generalist | 116.0 | 107.8 | 46.9 | 139.5 | 125.8 | 55.2 | 0.929 | 0.902 | 0.435 | 0.439 | 0.844 |
| Speothos venaticus | generalist | 100.4 | 79.8 | 35.9 | 105.3 | 95.3 | 39.1 | 0.794 | 0.906 | 0.450 | 0.410 | 0.898 |
| Nyctereutes procyonoides | generalist | 83.9 | 73.3 | 35.8 | 92.8 | 95.3 | 41.9 | 0.874 | 1.026 | 0.488 | 0.440 | 0.836 |
| Urocyon cinereoargenteus | generalist | 99.0 | 87.1 | 33.0 | 108.6 | 114.5 | 50.8 | 0.880 | 1.054 | 0.380 | 0.444 | 0.834 |
| Urocyon littoralis | generalist | 75.9 | 66.2 | 29.3 | 84.0 | 88.6 | 39.1 | 0.874 | 1.054 | 0.442 | 0.441 | 0.823 |
| Crocuta crocuta (spotted hyena) | cursorial | 214.8 | 228.1 | 67.5 | 237.8 | 199.3 | 88.0 | 1.063 | 0.841 | 0.296 | 0.442 | 1.014 |
| Hyaena brunnea (brown hyena) | cursorial | 198.3 | 218.6 | 82.2 | 221.7 | 181.2 | 81.1 | 1.102 | 0.818 | 0.376 | 0.447 | 1.035 |
| Hyaena hyaena (striped hyena) | cursorial | 198.7 | 222.7 | 78.9 | 211.4 | 187.4 | 84.7 | 1.121 | 0.887 | 0.354 | 0.452 | 1.057 |
| Proteles cristatus (aardwolf) | generalist | 120.5 | 129.9 | 59.6 | 126.6 | 128.8 | 57.4 | 1.079 | 1.018 | 0.459 | 0.445 | 0.981 |

\* Dhole: from its own means, RaL/HuL = 0.940 and IM = 0.882; the file's BI and IM disagree (see NOTE.md).

**For the game.** In wolf-like canids the radius is about as long as the humerus (BI about 1.0) and the tibia about as long as the femur (CI about 1.02-1.06). The metapodials are about 0.41-0.42 of the radius or tibia. Hyenas differ: fore longer than hind (IM > 1), a short tibia (CI about 0.82-0.89) and a short metacarpal (MC3/Ra about 0.30-0.38). The earlier wolf brachial index (0.994) holds; the file gives 0.998. Law et al. 2025 give 1.02 (`ref/research/skeleton`).
