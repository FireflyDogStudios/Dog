# Shared log: how it works

A running log, so that Firefly, Scout, Atlas and GrumpyDingo all see the same state of play. Keep it light.

## Files
| File | What goes in it |
|---|---|
| `LOG.md` | **One line per thing done**, newest at the top |
| `APPROVALS.md` | Anything that needs Firefly's (or GrumpyDingo's) yes before it happens |

## Writing a log line
```
- 2026-10-07 · Scout · Delivered scout/13-disc-share (12 rows, 3 CC BY sources). → ref/research/scout/13-disc-share/
```
- Format: date · who · what you did, in one sentence · → where it lives.
- **Who** is one of Firefly, Scout, Atlas, GrumpyDingo, or a new session name.
- Add a line when you finish something, change a number, find an error, or leave something half-done.
- Use **Keynote:** at the start for anything others must know, such as a number that changed, a file that is wrong, or a licence problem.
- No essays. Link to the NOTE, REPORT or commit for detail.
- Never rewrite another session's line. Add a new line that corrects it.

## Approvals
- **Firefly is the source of truth.** Before anything big, add an entry to `APPROVALS.md` and wait.
- Big means: deleting or moving files, changing numbers in `species/*.yaml`, changing `CLAUDE.md` or skills, licence decisions, large downloads (>1 GB), long sims, publishing or anything outward-facing, splitting the repo.
- Fixing typos, adding new docs, and updating `docs/README.md` pointers do not need approval. Log them.
