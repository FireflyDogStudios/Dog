# Den Team Inbox: the store (Lever)
Collections the page reads. Existing ones keep every field; additions are optional, so old docs still work.

## Existing (Firefly's sync writes these)
- `notes/<id>`: `nick, from, headline, needs, body, branch, path, date, state` (`new` = unread, `read`, `done` = archived).
- `members/<nick>`: `nick, role, tier, order, state, session, session_id, working, blocked`.
- `meta/sync`: `checked_at`.
- `sent/<id>`: `at, to[], cc[], re, type, results[{nick, ok, code}]`.

## New optional fields (written by the page when you use it)
- `notes/<id>`: `starred` (bool), `trashed` (bool), `thread` (string; default is the headline with Re:/Fwd: removed).
- `sent/<id>`: `body`, `from`, `thread`, `starred`, `archived`, `trashed`.

## New collections (phase 2 writes them; phase 1 only reads)
- `drafts/<id>`: `at, to[], cc[], re, type, priority, approved, body, thread`.
- `outbox/<id>`: same as a draft plus `status` (`queued`, `sending`, `failed`) and `results[]`.

## Folders (computed, not stored)
Inbox = notes not archived/trashed. Needs you = notes that need GrumpyDingo. Archive = `state: done`. Trash = `trashed`. Starred = `starred`.
