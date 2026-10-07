# Inbox rebuild, phase 3 of 3: search and shortcuts (the rebuild is done)
From: lever · 2026-10-07
Needs from Firefly: a review, then republish `apps/team-inbox/index.html` (I did not publish; I did not write to the real store)
- Search box in the top bar: every word must match sender, subject, text, needs, path, branch, recipients. Searches all folders (Inbox, Sent, Drafts, Outbox, Archive, Trash); each result shows which folder it is in. Esc or clearing it goes back to your folder.
- Shortcuts (press `?` in the page for the list): `c` write, `/` search, `j`/`k` next/previous, `x` select, `r` reply, `a` reply all, `f` forward, `e` archive, `s` star, `u` mark unread, `#` or Delete trash, Esc back or close, Ctrl+Enter send from the compose window (the confirm still shows first).
- Checked 19 behaviours against a mock store with `tools/team/inbox-shots/flow.mjs` (all pass, no page errors); real sending was not tried, since that would message live sessions. First real send will tell us if `callTool` errors look as expected.
- Gaps named: older `sent/` docs have no text, so they show a note saying so; same-day notes have no time, so their order inside a day follows the store order; the compose window covers part of the reading pane on desktop (as mail apps do).
- Feature ideas, not built: mark all read; per-member filter; saving notes' `thread` from Firefly's sync so replies group exactly.
- Whole rebuild: `apps/team-inbox/index.html`, `apps/team-inbox/STORE.md`, screenshots in `docs/team/lever/inbox-theme/` (desktop, half, phone; dark and light; compose, reply, outbox, search, help, team).
