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

## Team mail (member to member; `tools/team/mail.py all --json` produces these)
- `mail/<id>`: `id, thread, from, to[], cc[], re, type, date, body, branch, branches[]`. `<id>` is the mail file name without `.md`.
- Added by the page for GrumpyDingo's own view: `seen` (bool), `starred` (bool). **Firefly's sync must merge into these docs (`update`, or `set` that keeps `seen` and `starred`), not replace them.**
- The page shows them read-only (no archive or trash) in the Team mail folder, threaded by `thread`. Reply, Reply all and Forward go out as ordinary messages through the compose window, so they appear in Sent and in the same thread.

## Outbox relay and posting (Oct 7)
- A failed send keeps its `outbox/<id>` doc with `status: failed` and `results[{nick, ok, code}]` (`code` is the runtime's error code, for example `blocked_by_policy`, or `not_on_team`). `tools/team/relay_outbox.py` plans the relay and builds the batch that moves delivered messages to `sent/<id>` with `relayed_by` and result codes starting `delivered by <name>`; the page shows those as "Delivered by Firefly" (it also still understands the older `relayed by` wording). Once the page has seen `blocked_by_policy` it stops calling send_message and queues the message ("Queued: Firefly delivers it"); the Retry button still tries once by hand.
- `tools/team/mail.py post` builds `notes/<id>` (id = the note file name without `.md`, fields as above, `state: new`) and `mail/<id>` documents for members to post themselves. Create only; never overwrite `state`, `seen` or `starred`.

## Mail pickup (Oct 7; replaces the courier, which is switched off)
- `outbox/<id>` also carries `picked_up` (list of nicks), written by members when they collect GrumpyDingo's message at the start of a working block. When every To and Cc nick has picked it up, the member moves it to `sent/<id>` with `results: [{nick, ok: true, code: "picked up by <nick>"}]` and deletes the outbox doc.
- The page shows every Outbox message as "Waiting for pickup n of N" and, in the reading pane, who has picked it up and who is still waiting. Sent shows "Picked up by Atlas, Forge" (or "Delivered by Firefly" when Firefly pushed it). A pickup says nothing about whether the page can send, so the Connection view ignores it.
- `meta/courier` is no longer read.
