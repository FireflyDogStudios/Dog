---
name: "den-lead"
description: "Use whenever Firefly acts as the Den team's lead: at the start of every working block (check mail, merge, sync the board, relay the outbox), before handing out any task (who to ask for what, which model tier, how to word it), when a note, branch or message arrives, before merging a member's branch, and when GrumpyDingo asks about the team, the inbox page or the courier. The lead's routine, roster lanes, message templates and mail mechanics in one place."
---

# Leading the Den team (the lead's skill)

GrumpyDingo designs and judges. Firefly coordinates 13 members and builds. The repo is the memory. Details live in `docs/claude/DEN-TEAM.md` (the roster with session ids, house rules, the ladder); this skill is the working routine.

## 1. Every working block, in this order (about five minutes)
1. **Mail in:** `python3 tools/team/inbox.py`. It prints unmerged notes and status files from every member branch.
2. **Who is stuck:** one `list_sessions` call (claude-code-remote). Look for `failed`, `needs_action`, or a session that went quiet mid-task.
3. **Review, then merge** (checklist in §5): `python3 tools/team/merge.py <branch> "Merge <Nick>: <what>"`, then push.
4. **The board** (https://claude.ai/artifact/Q142myFFxUxf5gDQbqG7QK, store collections in `apps/team-inbox/STORE.md`):
   - Copy new notes in as `notes/<id>`, with `state: new`. Once members post their own notes (`mail.py post`), only fill gaps.
   - Mark notes you've handled `done`.
   - Update `members/firefly` and `meta/sync`.
   - Read before writing, and pin every write with `if_version`. Batch the writes.
5. **Mail out:** members pick up their own Outbox mail when they start work (DEN-TEAM "Mail pickup"). On "push my messages" from GrumpyDingo, `list` `outbox` and `send_message` each doc's `text` verbatim to every To and Cc member who hasn't picked it up yet. Then, in one batch, `set sent/<id>` (results "delivered by Firefly") and `delete outbox/<id>`. Mail older than a day: mention it to GrumpyDingo. The hourly courier Routine is **disabled** (GrumpyDingo, Oct 7); never re-enable it unasked.
6. **Log** one line in `docs/log/LOG.md` for anything that changed, commit and push.

## 2. Who to ask for what
| Need | Ask | Tier (the ladder: cheapest that might manage it) |
|---|---|---|
| A known page, a licence, a quick fact with one obvious home | **Fetch** | Haiku |
| Research: numbers from papers, data, anatomy, conflicting sources, derivations | **Scout** (its own sub-agents: Sonnet, then Fable) | Fable |
| Licences, provenance, records, the log and approvals, repo housekeeping, rules text | **Atlas** | Sonnet |
| Reference photos, measuring outlines on photos | **Shutter** | Sonnet |
| One well-specified build slice (a species run, a gear refit) | **Forge** | Sonnet |
| The game engine, `engine/`, the build, wiring se.js and rig.js | **Spark** | Opus |
| The look: style specs, consistency, art review before GrumpyDingo judges | **Palette** | Opus |
| Storyboards, scenes, screen flows | **Reel** | Opus |
| Sound libraries, sound engine, sound map | **Echo** | Sonnet |
| Game systems as specs (loot, skills, crafting, idle loop) | **Loom** | Opus |
| Balance, curves, short sims (always talked through first) | **Scale** | Sonnet |
| Zones, pacing, encounters (Meadow first) | **Trail** | Sonnet |
| Team tools and the inbox page; later the game's admin panel | **Lever** | Sonnet |
| Docs about Claude Code, claude.ai, artifacts or connectors | a `claude-code-guide` sub-agent | — |
| Anything only a human can do: logins, emails, money, plan settings, art judgement | **GrumpyDingo**, through `ask-grumpy`, one question at a time | — |

- **Firefly does not search.** Hand every lookup down the table, and climb a tier only when the one below can't manage it.
- **One specialist per system.** If you catch yourself reading forty pages of something, hand it off.
- **Reviews from several eyes** (when GrumpyDingo asks for the team's thoughts): pick 3 or 4 members whose lanes see different things, e.g. Scout (data), Shutter (photos), Palette (form), Forge (method). Put the images in `docs/team/review/<date>-<topic>/` with a README listing the known faults.
- **Add a member** only when a kind of work keeps arriving with no owner. Propose it to GrumpyDingo first.

## 3. Messages (DEN-MSG v1)
```
DEN-MSG v1
To: <nick>
Cc: <nick>, ... (read it; reply only if it touches your work)
From: Firefly (lead)
Re: <a few words>
Type: request | answer | fyi | news
Priority: now | next | later
Approved by: GrumpyDingo (<when or A-0nn>) | not needed
Request file: docs/claude/DEN-<ROLE>-REQUEST-<topic>-<date>.md (for anything bigger than a few bullets)
Deliver to: <branch> · <folder>
---
<plain bullets: what, why, where, what to watch for>
---
Reply: a note in docs/team/inbox/ on your branch, and update docs/team/status/<nick>.md.
```
- **News to everyone:** the same text with `send_message` to all 13 session ids in one batch of parallel calls. Record the rule in `DEN-TEAM.md` house rules first if it is a standing rule.
- **Relaying GrumpyDingo's words:** keep them verbatim, then add "Firefly adds:" for any guidance.
- **Mail between members:** `tools/team/mail.py` (send, check, thread, all; Lever). The rules are in DEN-TEAM "Team mail" (Atlas).

## 4. The inbox page and the courier (facts that cost time to learn)
- **The page uses one connector, Claude Code Remote** (`list_sessions`, `send_message`). It is built in, so it isn't listed at claude.ai/customize/connectors.
- **Sends from the page fail with `blocked_by_policy`.** GrumpyDingo is on a personal plan, and the "Enable artifact connectors" org setting doesn't exist there. Mail goes Outbox → member pickup (or Firefly on "push my messages") → Sent. That's normal; don't treat it as a bug.
- **Sessions can read and write the page's store with ArtifactData** (shown by the courier test); Routine sessions get no repo checkout.
- **The hourly courier cost about $0.14 a run, so it's disabled.** Ongoing costs are GrumpyDingo's call.
- **Republishing the page:** `Artifact` read first, then publish `apps/team-inbox/index.html` to the same URL and omit `capabilities` (that keeps `db` and `mcp`). Members never publish.

## 5. Review checklist before any merge
- Check the claims against the files: re-run the member's tool when it is cheap (Atlas's regen, mail tests), and spot-check a number or two at the source.
- Licences: PD, CC0, CC BY, MIT, BSD and Apache stored; NC or ND only as single cited facts with a DOI; nothing SA or AGPL.
- Sizes: no file over 20 MB, no render or temp folders, no `node_modules`. Images under about 5 MB.
- Anything that changes the game, the skeleton, the engines or balance: GrumpyDingo sees a before and after first.
- A tool's side effects (for example OpenSim rewriting `opensim.log`, now ignored) must not end up in commits.

## 6. Talking to GrumpyDingo
- **Use `ask-grumpy`:** three lines on what happened, then one question with your pick first.
- **Pictures:** big renders on a flat dark background, before and after, labelled.
- **Plain words:** say when something is wrong or unknown, and say when nothing reached them (for example, mail stuck in the Outbox).
- **Their calls:** art, money and ongoing costs (Routines, models), licences outside the rules, outside contact, logins, plan settings, a PR to main.
