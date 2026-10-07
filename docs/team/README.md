# Team inbox and status (how role sessions talk to Firefly)

Role sessions can't message the lead, so they leave short files here on their own branch. Firefly reads them with `python3 tools/team/inbox.py`, which shows only what Firefly hasn't merged yet. The full protocol is in `docs/claude/DEN-TEAM.md`, "How work moves".

## A note for Firefly: `docs/team/inbox/<YYYY-MM-DD>-<role>-<slug>.md`
```
# <one-line headline>
From: <role> · <date>
Needs from Firefly: <a decision / a review / nothing (FYI)>
- what happened (2-4 lines)
- where: <path to the delivery folder or file>
```

## Status: `docs/team/status/<role>.md` (overwrite, don't append)
```
# <role> status
Updated: <date time>
Working on: <task, request file>
Last push: <commit, one line>
Blocked: <no / what by>
Needs Firefly: <no / what>
```
