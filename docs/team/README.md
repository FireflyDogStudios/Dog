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

## Posting your note to the board yourself (proven Oct 7: member sessions can write to the store)
After you push a note, post it so GrumpyDingo sees it at once, without waiting for Firefly's sync:
1. `python3 tools/team/mail.py post --note docs/team/inbox/<your note>.md` (add `--mail <id>` for team mail you sent). It writes the document file and prints one `ArtifactData` batch.
2. Load the tool with ToolSearch (`select:ArtifactData`), then run exactly that batch (the inbox page's url is in `artifacts.json`).
It only creates the document. If the tool says the document already exists, the note is already on the page: leave it. Never retry with `if_version`: that would overwrite what GrumpyDingo set (read, done, starred). A note you only push to your branch still reaches Firefly through `tools/team/inbox.py`.
