# Mail delivery, phases 1 and 2 of the request: Connection check, no silent failures (relay script next)
From: lever · 2026-10-07
Needs from Firefly: a review and republish of `apps/team-inbox/index.html` (not published; the real store was only read)
## Connection check (phase 1)
- A status chip in the top bar (green "All connected", amber "Connected" while something is untried, red "Sending blocked", "Live sessions off", "No store", "Check permissions") that opens a **Connection** page under Den.
- The page has five rows, each with what works, the fix in one line, the code, and buttons:
  - the store (db);
  - notes from the team (age of `meta/sync`);
  - live sessions (the `list_sessions` watch, with its error code);
  - sending (the last real send result, or, before any send in this browser, the newest result found in `outbox/` and `sent/`);
  - the page's permissions (`permissions.state()`, with an **Open Permissions** button that calls `permissions.manage()`).
- Every code from the runtime's `mcp.d.ts` has a plain sentence and fix (`server_not_connected`, `selection_required`, `needs_reauth`, `not_in_manifest`, `approval_required`, `blocked_by_policy`, `server_unavailable`, `upstream_error`, `tool_error`, `not_granted`, `capability_disabled`) plus `not_on_team`. Connector fixes link to https://claude.ai/customize/connectors. Nothing on the page sends a message to find out.
## No silent failures (phase 2, page side)
- A failed send stays in the Outbox with a red **Not delivered** badge and the reason in words; a toast says so at once ("Not delivered: <reason> It is waiting in the Outbox.").
- The confirm box warns first when sending is known blocked ("it will wait in the Outbox").
- After a policy or connector error the page stops trying the other recipients (they would all fail the same way) and records the same code for each.
- Messages Firefly relays show in Sent as "Relayed by Firefly" (any result whose code starts with "relayed").
- Found while testing: the To-field suggestions opened on focus and covered the "Everyone" button; they now open on click or typing, and the button sits in the To row. The compose window also keeps working at drag and resize.
## What I found about blocked_by_policy
- The runtime's `mcp.d.ts` says it means: "the tool is in the manifest, but org policy blocks it for this viewer". The `list_sessions` watch works for GrumpyDingo (the board shows live state) and only `send_message` is refused, so the policy blocks the **write tool** `send_message` from pages. There is nothing to fix in the page, and re-trying will not help. Options: an organization owner allows it in the connector settings (I cannot check or change that), or we relay through Firefly (what `relay_outbox.py` is for).
- **Connectors and permissions GrumpyDingo needs:** only Claude Code Remote, with `list_sessions` (works) and `send_message` (blocked by policy today), allowed for this page in its Permissions menu. Nothing else.
## Step 0 (store access from a member session), read only
- A member session **can read** the page's store with `ArtifactData`: `get meta/sync` and `list notes`, `list sent` all worked for me (Lever).
- **Writing:** I did not write to the live store. Two harmless probes (an `update` of a missing doc, and an `update` of `meta/sync` pinned to a wrong version) were refused with `invalid_argument` and `version_mismatch` and wrote nothing. The second reached the version check, which suggests write access is allowed, but a real create is still unproven. If you want it proven, say "go" and I will make and delete `notes/test-lever-<date>` as the request allows.
## Tests
- `tools/team/inbox-shots/flow.mjs`: 39 behaviour checks pass on the mock store (three connection states, blocked send, outbox, mail, search, shortcuts, move and resize), no page errors.
- Screenshots in `docs/team/lever/inbox-theme/`: `conn-default-dark`, `conn-blocked-dark`, `conn-noconn-dark` (not connected), `conn-blocked-phone-light`, `outbox-blocked-dark`.
- Next: `tools/team/relay_outbox.py`, then `mail.py post`, a note for each.
