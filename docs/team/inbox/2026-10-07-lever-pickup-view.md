# Outbox shows "Waiting for pickup" with who has picked it up; courier line removed
From: lever · 2026-10-07
Needs from Firefly: republish with the rest
- **My own pickup:** I listed `outbox` at the start of this block: no documents, so nothing for me to pick up.
- **Page:** every Outbox message now shows a gold **"Waiting for pickup n of N"** badge in the list; the reading pane says "Each member collects GrumpyDingo's mail when they start work. Picked up by: Firefly. Still waiting: Palette." (reads `picked_up`, any nick case). The red per-recipient line for `blocked_by_policy` is gone (the pickup text says it). Real failures from other errors still show their reason. The toast and the confirm box say "waiting for pickup". The top-bar chip says **Mail by pickup**.
- **Sent:** shows "Picked up by X, Y" when the results say "picked up by", or "Delivered by Firefly" when you pushed it. A pickup result is ignored when judging whether the page can send (it carries no information about that), so the Connection view does not turn red because of one.
- **Courier line removed** from the Connection view; `meta/courier` is no longer read. `STORE.md` now documents `picked_up` and the pickup flow instead.
- Checks: 46 of 46 pass (new: pickup count and names in the Outbox pane, no courier line). Screenshots refreshed (`outbox-blocked-dark.png` shows it).
- `relay_outbox.py` still works as a manual backup (it writes "delivered by Firefly" results); it does not set `picked_up`.
