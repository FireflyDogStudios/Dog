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

## New collections (written by the compose window)
- `drafts/<id>`: `at, to[], cc[], re, type, priority, approved, body, thread`.
- `outbox/<id>`: same as a draft plus `text` (the full DEN-MSG v1 message), `status` (`queued`, `sending`, `failed`) and `results[{nick, ok, code}]`. Retry only resends to recipients not yet `ok`.
- Flow: compose -> `drafts/<id>` (autosave) -> confirm -> `outbox/<id>` (draft deleted) -> delivered to each session -> `sent/<id>` (same id, with `body`, `text`, `thread`, `from`) and the outbox doc deleted. Failed or offline sends stay in the outbox.

## Folders (computed, not stored)
Inbox = notes not archived/trashed. Needs you = notes that need GrumpyDingo. Archive = `state: done`. Trash = `trashed`. Starred = `starred`.
