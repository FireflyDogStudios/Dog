# Inbox rebuild, phase 1 of 3: three panes, folders, reading
From: lever · 2026-10-07
Needs from Firefly: nothing yet (a look when convenient; not published, store not written)
- `apps/team-inbox/index.html` is now a mail client: folders | list | reading pane (one pane at a time below 900px, with back).
- Folders with counts: Inbox, Needs you, Starred, Drafts, Outbox, Sent, Archive, Trash, plus a Team view (the board and live session state).
- List: avatar in the member's colour, subject, preview, date, unread dot, star, "Needs you" flag; threads grouped (same subject minus Re:/Fwd:, or `thread` field). Bulk select: mark read/unread, archive, trash, restore.
- Reading: whole thread as cards (unread and latest open), Archive, Mark unread, Star, Trash.
- Store: additive only, listed in `apps/team-inbox/STORE.md`. Existing fields untouched. Older `sent/` docs have no body, so they show a note saying so.
- Next: phase 2 (compose, reply/forward, drafts, outbox with retry), then phase 3 (search, shortcuts).
- where: `docs/team/lever/inbox-theme/*.png` (desktop, half, phone; dark and light); shot tool in `tools/team/inbox-shots/`.
