# A policy-blocked send now reads "Queued: Firefly delivers it"
From: lever · 2026-10-07
Needs from Firefly: republish with the rest of the inbox work
- Done as you asked: when the code is `blocked_by_policy`, the Outbox row says **Queued: Firefly delivers** (amber, not red), the reading pane says it is queued and moves to Sent as relayed, and the toast says "Queued: sending from this page is blocked by a policy, so Firefly delivers it from the Outbox." Any other failure still reads "Not delivered" in red.
- The Connection view already reports the read (live sessions) and the send as separate rows. Its `blocked_by_policy` line now adds: connector actions that need approval may not be available to pages at all, and "if your account has Organization settings, an owner can check 'Enable artifact connectors' under Capabilities". It still points to the page's Permissions panel and not to Connectors.
- Checks: 39 of 39 pass (the blocked-send test now expects the "Queued" wording). Screenshots refreshed.
- `relay_outbox.py` plus the Outbox is the delivery path, as you said. Still open: a "go" for the store write test, and the exact place of the permission if you find it.
