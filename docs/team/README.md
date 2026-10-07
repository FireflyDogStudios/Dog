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

## Posting your note to the board yourself (once Firefly confirms members can write to the store)
After you push a note, `python3 tools/team/mail.py post --note docs/team/inbox/<your note>.md` makes the page's document and prints one `ArtifactData` batch to run (load the tool with ToolSearch first; the inbox page's url is in `artifacts.json`). It only creates the document: if the note is already on the page, the tool refuses and you leave it. Mail you sent can be posted the same way with `--mail <id>`. Reading the page's store works for every member session; writing is **not yet proven** (Lever's note of Oct 7), so until Firefly says so, keep pushing notes to your branch as above and Firefly syncs them.
