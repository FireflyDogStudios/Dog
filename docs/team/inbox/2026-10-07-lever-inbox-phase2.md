# Inbox rebuild, phase 2 of 3: compose, drafts, outbox
From: lever · 2026-10-07
Needs from Firefly: nothing yet (not published, store not written from here)
- Compose window: pop-up at bottom right on desktop, full screen on half width and phone (also a floating Write button there). To and Cc autocomplete from `members/` (name or role), chips with remove, "Everyone on the team" (all with sessions in To, Firefly in Cc). Subject, Type, Priority, Approved by, message. DEN-MSG v1 is filled in behind the scenes (preview folded under the form).
- Reply, Reply all, Forward from the reading pane (quoted text, Re:/Fwd:, same thread).
- Autosaves to `drafts/` after a pause; Save & close keeps it, Discard deletes it. A draft row opens straight into the window.
- Send keeps the in-page confirm. Then: `outbox/` -> delivered one by one through Claude Code Remote -> `sent/` (now with the message text) and out of the Outbox. Failures or no connector leave it in the Outbox with Retry (only the recipients not yet delivered), Edit and Delete; bulk Retry and Delete too.
- Checked with a mock store: everyone group, autosave, confirm, failed send to Outbox, retry to Sent, draft removed (`tools/team/inbox-shots/flow.mjs`, 7 of 7 pass, no page errors). I did not send a real message.
- Store fields are in `apps/team-inbox/STORE.md`. Next: phase 3 (search and shortcuts).
- where: `docs/team/lever/inbox-theme/*.png` (reply, compose, outbox shots added).
