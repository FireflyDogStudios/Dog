# 11-ethograms: note

Fetched 2026-10-07 by a Firefly research agent. Raw downloads are in `/tmp/item11/` and are not stored in the repo.

## What is here
`data.json` has four parts:
- **`behaviours`**: 59 canid behaviours, each with a category (the 14 Animal Kingdom groups), species and source. Firefly wrote every definition in its own words; none is copied.
- **`numbers`**: 46 entries. Each gives the quantity, value, unit, n, species, context, citation, URL, licence and a confidence grade:
  - A: the source states the number;
  - B: the source states it, but n is small or the measure is indirect;
  - C: Firefly derived it, or the sampling is heavily biased.
- **`tables`**: two bulk tables. Both sources are CC BY or CC0:
  - the per-dingo daily budget (Tatler 2021, Table S1);
  - the shake-off transition matrix (Bryce 2024, Table 3).
- **`game_idle_shortlist`**: a suggested set of idle states, with typical durations.

## Sources
| Key | Source | URL | Licence | Used for |
|---|---|---|---|---|
| TATLER2021 | Tatler, Currie, Cassey, Scharf, Roshier, Prowse 2021, *Movement Ecology* 9:11, doi:10.1186/s40462-021-00246-w | pmc.ncbi.nlm.nih.gov/articles/PMC7977315 | CC BY 4.0; the article puts its data under CC0 | Wild dingo 24-h budgets (Table S1, from the Europe PMC supplementary zip), crepuscular pattern, energy expenditure |
| SCHORK2024 | Schork et al. 2024, *Animals* 14:1109, doi:10.3390/ani14071109 | PMC11011086 | CC BY 4.0 | Night sleep hours and bouts in kennelled dogs (Table 1) |
| BUSO2026 | Buso, Loconsole, Normando 2026, *Animal Cognition*, doi:10.1007/s10071-026-02075-z | PMC13453999 | CC BY 4.0 | 47-behaviour shelter ethogram (Supp. T1, paraphrased); 10-min continuous budgets computed from the S1 xlsx |
| VDLAAN2023 | van der Laan, Vinke, Arndt 2023, *PLoS ONE*, doi:10.1371/journal.pone.0286429 | PMC10270336 | CC BY 4.0 | Night (00:00–04:00) activity share and inactive bouts in pet and shelter dogs; resting-posture definitions |
| WANG2026FARM | Wang, Smit, Cai et al. 2026, *Animals* 16:2035, doi:10.3390/ani16132035 | PMC13359857 | CC BY 4.0 | 24-h sleep, rest and active hours; hourly sleep pattern |
| SMEDBERG2026 | Smedberg, Bergh, Roman et al. 2026, *PLoS ONE*, doi:10.1371/journal.pone.0346895 | PMC13102230 | CC BY 4.0 | Pet dog day and night sedentary, light and vigorous minutes; sleep-like bout lengths (Table 4) |
| OROURKE2025 | O'Rourke et al. 2025, *Front. Vet. Sci.*, doi:10.3389/fvets.2025.1572794 | PMC12287635 | CC BY 4.0 | Population "active minutes" per day |
| FERREIRO2024 | Ferreiro-Arias et al. 2024, *Ecol. Evol.*, doi:10.1002/ece3.70397 | PMC11494153 | CC BY 4.0 | Wild wolf active/inactive hidden Markov model transition probabilities (2-h GPS) |
| BOIC2024 | Boić et al. 2024, *Biology* 13:422, doi:10.3390/biology13060422 | PMC11200557 | CC BY 4.0 | Captive wolf olfactory ethogram; scent-rolling durations |
| BRYCE2024 | Bryce, Nurkin, Horowitz 2024, *Animals* 14:3248, doi:10.3390/ani14223248 | PMC11591167 | CC BY 4.0 | Shake-off as a marker of transitions; transition matrix |
| WANG2026FOX | Wang et al. 2026, *Vet. Sci.*, doi:10.3390/vetsci13090968 | PMC13611874 | CC BY 4.0 | Tibetan fox ethogram (vigilance, freeze, scan, scent mark); camera-trap budget |
| BARANYAI2025 | Baranyai, Iotchev, Gombos, Kis 2025, *Animals*, doi:10.3390/ani15213182 | PMC12608857 | CC BY 4.0 | Sleep-stage definitions (drowsiness, non-REM, REM). The numbers are only in figures, so none were taken |
| MAGLIERI2023 | Maglieri, Zanoli, Mastrandrea, Palagi 2023, *Current Zoology*, doi:10.1093/cz/zoac013 | PMC10039175 | **CC BY-NC 4.0**: single facts only | Full and half play bow; bows per play session |
| ROSE2021 | Rose & Riley 2021, *J. Zool. Bot. Gard.* 2(3):421–444, doi:10.3390/jzbg2030031 | figshare.com/articles/journal_contribution/29781461 (the MDPI copy returned 403) | CC BY 4.0 (checked via Crossref and figshare) | Method only; see below |
| NC3RS | NC3Rs/IAT/RSPCA, "General ethograms" PDF | nc3rs.org.uk/.../General%20ethograms.pdf | © NC3Rs. Personal use only; no reuse in another work or for commercial gain (nc3rs.org.uk/terms-and-conditions) | **Not stored.** The PDF covers only mice, rats, hamsters, gerbils, guinea pigs and zebrafish, with **no canids**. Its structure (maintenance / general activity / social / reproductive / abnormal / other, plus "out of sight") confirms the usual layout of an ethogram |

## Method notes from Rose & Riley 2021 (paraphrased)
- **The ethogram** lists behaviours with their definitions. It should be:
  - drawn from the literature, then refined by watching the animals;
  - include "other" and "out of sight";
  - kept consistent across studies.
- **States and events:**
  - States are long behaviours, such as lying or walking. They go into a time–activity budget as a % of time.
  - Events are short, such as a shake, yawn or bark. They are counted as rates.
  - For the game, states map to idle loops and events to one-shot animations fired inside or between them.
- **Sampling:**
  - focal or scan sampling;
  - continuous or instantaneous recording.
  - Instantaneous sampling misses short behaviours. Buso 2026 measured this: 15–60 s point samples underestimated durations by 63–98% compared with continuous recording.
- **Behavioural diversity (Shannon index), space-use indices (SPI, electivity) and Tinbergen's four questions** are also covered. None of them is needed here.

## How the numbers were made
- **Buso 2026 shelter budgets:**
  - Firefly took the mean, SD and median of the `Continuous` rows in the S1 xlsx (16 dogs × 2 sessions), in seconds per 10 minutes. The share is that value divided by 600 s.
  - The behaviours are not mutually exclusive.
  - Context: the 10 minutes directly after a 5-minute enrichment session in the afternoon, so the dogs are more active than at baseline.
- **Derived values (confidence C):**
  - Schork night bout = 9.7 h / 16 bouts.
  - Wolf run lengths: mean run = 2 h / (1 − p_stay), and stationary active share = 0.13 / (0.13 + 0.64).
  - Wolf scent-roll per response = 564 s / 12 responses.
  - Bryce shake rate = 120 shakes / 19 h, counted for the group, not per dog.
- **Animal Kingdom categories:** "affection" has no separate entry. The sources fold it into "positive interaction" (social). "Sexual" is listed by name only.

## Blocked or refused
- **bioRxiv** (Biswas et al. 2026 preprint on the resting associations of free-ranging dogs, CC BY): HTTP 429 three times, so it was skipped.
- **Banerjee & Bhadra 2021**, "Time-activity budget of urban-adapted free-ranging dogs", *acta ethologica* (doi:10.1007/s10211-021-00379-6): Springer, paywalled, not OA. Not used. Sen Majumder et al. 2014 (*Current Science*) is not in Europe PMC. **The free-ranging Indian dog budget is still missing.**
- **MDPI** (mdpi.com): HTML and PDF both returned 403. The figshare mirror worked.
- **Not found:**
  - a sourced duration or frequency for turning around or circling before lying down;
  - a scratching rate;
  - a stretching rate;
  - a numeric time budget for a captive dingo.
