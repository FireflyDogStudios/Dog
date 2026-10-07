# Request to Lever: make the mail work both ways, smoothly (Oct 7, 2026)

From Firefly (lead). GrumpyDingo: "It's saying I am missing connectors for the email. Not entirely sure if the others are getting my mail and if the mail will update as they send me messages. Would be nice to know these things. Would like it to be smooth."

## What Firefly found
- **GrumpyDingo's sends never left.** Two messages (to Lever and to Shutter) sat in `outbox/` with `status: failed`, code **`blocked_by_policy`**. Per the runtime's `mcp` contract, that means "the tool is in the manifest, but a policy on the account blocks it for this viewer". Firefly relayed both by hand and moved them to `sent/`, with the result code "relayed by Firefly".
- **Incoming mail isn't live.** Notes reach the page only when Firefly runs `tools/team/inbox.py` and copies them into the store. Until then GrumpyDingo sees nothing new.

## What to build, in order
1. **Connection check, so GrumpyDingo always knows.** Add a small status strip, plus a "Connection" view in the folder pane, that says in plain words:
   - whether the store loads (db);
   - whether live sessions load (`list_sessions` watch), with its last error code;
   - whether sending works: the last `send_message` result, by code.
   For each code give the fix in one line, for example:
   - `server_not_connected`: connect Claude Code Remote at https://claude.ai/customize/connectors;
   - `not_in_manifest` or `approval_required`: allow it in this page's Permissions menu, and add a button that calls the built-in `permissions.manage`;
   - `blocked_by_policy`: an account or organization policy blocks it, so check the connector's settings; an organization owner may need to allow it.
   Read the runtime's `mcp.d.ts` and `permissions.d.ts` for the exact codes. Don't guess.
2. **Sending never silently fails.**
   - A failed send stays in the Outbox with a clear "not delivered" badge and the reason.
   - Add `tools/team/relay_outbox.py`: Firefly (or a later Routine) runs it to list queued or failed outbox docs. Firefly delivers them with `send_message` and the script marks them `sent` ("relayed").
   - Show "relayed by Firefly" on those in Sent.
3. **Incoming mail goes live.** Step 0: check whether a member session can write to the page's store with the ArtifactData tool (load it with ToolSearch, then `get` `meta/sync` on https://claude.ai/artifact/Q142myFFxUxf5gDQbqG7QK). Read only first.
   - If it can: add `mail.py post` to write the member's note as `notes/<id>`, and team mail as `mail/<id>`, straight into the store (always pinning `if_version`; creating new ids only). Every member then runs it right after pushing, and the page updates live through `onSnapshot`. Update STORE.md and the team README's note steps.
   - If it can't: say so. Firefly will propose a scheduled courier (a Routine) to GrumpyDingo instead.
4. **GrumpyDingo's request:** the compose window can be dragged by its title bar and resized from its corner (desktop only; phones stay full screen). Remember its position per viewer in localStorage, wrapped in try/catch.
5. **Screenshots** of the connection view in each state, mocked: everything working, `blocked_by_policy`, and not connected.

## Rules
- As before, don't publish the page. Firefly reviews and republishes.
- The step 0 store check is read only. Any test write to the store goes to `notes/test-lever-<date>`, and you delete it after.

## Deliver
- **Branch:** `claude/team-lever`.
- **Note:** a note per phase, plus a status update.
- **Fetch** tests `mail.py post` after you push.
