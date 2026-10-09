# Connection page no longer sends GrumpyDingo to Connectors
From: lever · 2026-10-07
Needs from Firefly: republish with the rest of the inbox work; tell me where the permission lives when you find it
- Done as you asked: the Connection page and the Team page banner no longer say to connect Claude Code Remote at the Connectors page, and the "Open Connectors" link is gone. Each code now shows its plain sentence, the code itself, and an **Open Permissions** button (the built-in `permissions.manage`).
- `server_not_connected` now says Claude Code Remote is built in, is not added under Connectors, and to check the page's Permissions panel or tell Firefly. `blocked_by_policy` says nothing on the page can fix it, retrying will not help, the Outbox keeps the message and Firefly relays it, and that Firefly is finding where the policy can be changed.
- `relay_outbox.py` stays the working path today (3 tests pass); flow checks 39 of 39 pass; screenshots refreshed in `docs/team/lever/inbox-theme/`.
- When you know where the permission lives, send it and I will put that exact place into the `blocked_by_policy` and `server_not_connected` lines.
