# Den Game (standalone fork) — plan + status

Decided Oct 1, 2026: a **full fork** of the Den Ledger into a game-only artifact for other players. Non-destructive: the user's own Den is untouched. Name stays **The Den Ledger**. Branding stripped. Mail stays.

- **Game artifact:** https://claude.ai/artifact/APeiXGfpJhnYRfjs7NorsT (v2 published Oct 1; capabilities `db` + `user`)
- **User's Den (untouched):** https://claude.ai/artifact/NUJoMc4k9TXFYGMdPwgu3F
- Build source: copy of Den v110, then trimmed. The two codebases are now separate; port features deliberately.
- Local work files (this session only): scratchpad `game/index.html`, `prune.py` (removes unreferenced top-level functions/consts, cascading), `branches.py` (removes `if (a === "x")` action branches).

## Focus decision (Oct 1, theirs)
Fix and improve core game mechanics first; no live events while doing that.

## v2 (current)
- Tabs: Hunt (default), Pack, Mine (open all year in the game), Library, Upgrades (perm upgrades + den decor), Bag (Trophy Wall on top, credits + dev link at bottom), Sniffle, **Events**.
- **Removed:** all Halloween + seasonal events (`isOct()` false, `gameEvent()` null, EVENTS_GAME/MOON_FOES/CHAPTERS emptied, Nocturne/Omen + Pumpkin Colossus removed, visitors, costumes, Spooky tab), and the **town** (atTown false; home button only).
- Season *visuals* (fall/winter) kept.
- **Trials** (Events tab), adapted from the Pumpkin Moon: one per zone, unlock at max(2, zone level). 10 waves; each wave needs `2 + 2w` points before `50 + 5w` seconds, or the trial fails. Waves are sequential. Uses that zone's monster set (Meadow = all time-of-day monsters). Trial Warden boss on waves 5 and 10 (worth 5 points, weapon drop chance). HP ×(0.4 + 0.08w). Creatures enter closer and 35% faster. Trial Points = wave × (zone index + 1). First full clear: 15 × zone bones; repeat clears 3 × zone. Code: `startTrial/trialTick/trialKill/endTrial/trialSection`, state `huntState().trials`.
- **Trial Pass**: 14 tiers by TP (brews, bones, baits, coins, a tome, 3 hatches). `TRIAL_PASS`, `passReward`.
- **Daily gifts**: a gift for each day of the month; any earlier day can still be claimed. `giftFor/giftSection/claimGift`.
- **Dev mode**: "🛠️ Developer" in the Bag credits footer → password popup (SHA-256 compared; password is the user's name). On: damage ×10,000, every buff/comp/treat/brew active; "Reset my save" (confirm) wipes this fork's save and reloads. Stored per device (`dengame-dev`). Note: any client-side password can be found by someone reading the code; fine for a dev toggle.
- XP from hunting (`huntXp`): 1 XP per 2 kills, elites +2, boss 6 (+1 bone), king 20 (+3), mega 25 (+4), god 60 (+8).
- Per-player saves at `data/users/<id>/save`, device-only fallback.

## Known tuning notes
- A brand-new level 1 player kills slowly (~3–7 a minute), so trials start at level 2 and wave 1 needs 4 points. Playtest will tell.

## Next
1. Playtest with the friend; tune XP, trial pacing, pass thresholds.
2. Players need "can use" access to save in the cloud.
3. Trim leftover CSS / unused art.
4. Shop later; events return later as a planned feature with their own currency.
