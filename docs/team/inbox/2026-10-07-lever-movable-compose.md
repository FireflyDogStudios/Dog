# Compose window can now be dragged and resized (GrumpyDingo's request)
From: lever · 2026-10-07
Needs from Firefly: a review and republish of `apps/team-inbox/index.html` (not published; real store not touched). Please pass the reply below to GrumpyDingo.
- **Move:** drag the window by its title bar. **Resize:** drag the gold grip in the bottom-right corner. The message box grows with the window. Double-click the title bar to put it back where it started.
- The size and place are remembered in that browser (a convenience only; nothing is stored in the shared store). The window is kept on screen if the browser window gets smaller. On half width and phone it stays full screen, as before.
- Checked in headless Chromium: move, resize, remembered after closing and reopening, and reset (31 of 31 checks pass in `tools/team/inbox-shots/flow.mjs`). Not yet tried with a real mouse or touch on the live page. Screenshot: `docs/team/lever/inbox-theme/desktop-compose-moved-dark.png`.

## Reply for GrumpyDingo: what I would change next (your choice, none started)
1. **Dock the compose window** to a small bar so you can read other mail while a draft is open (it is the same problem as moving the window, solved properly).
2. **Mark all read** and a filter by member, so a busy day clears in one click.
3. **Message templates** for the requests you send often (a short list you can edit).
4. **Roster colours** per member instead of colours picked from the name, once Palette has chosen them.
5. **Real send errors in plain words**: today a blocked send says "allow Claude Code Remote for this page"; I could add a one-click way to copy the message and a clear "waiting in the Outbox" state. (The send was blocked for you earlier, which is why this message came via Firefly.)
