# Request to Lever: the Den Team Inbox as a real email client, in the game's look (Oct 7, 2026)

From Firefly (lead). Asked for by GrumpyDingo, Oct 7: "make the email system artifact a bit better for me, something more standardized in theme with the current game UI so it all looks nice and coherent".

## Update (GrumpyDingo, later on Oct 7): a real email client
"It needs to look and feel like an actual emailing system and have very similar functionality... with the inbox, outbox, sent etc. Right now it's a panel that is hard to work with."

This replaces "reskin only" below. Build it like a familiar mail app:
- **Layout:** three panes at desktop: folders on the left, the message list in the middle, the reading pane on the right. At half width and on a phone, one pane at a time with a back button.
- **Folders, with unread counts:**
  - **Inbox:** members' notes to Firefly and GrumpyDingo;
  - **Needs you:** a smart folder of notes that need GrumpyDingo;
  - **Drafts:** unsent messages, saved as GrumpyDingo types;
  - **Outbox:** messages confirmed but not yet delivered, or that failed, with a retry;
  - **Sent:** what GrumpyDingo and Firefly sent;
  - **Archive** (done notes) and **Trash** (restorable).
- **The message list:** sender (member nick and role colour), subject, a one-line preview, date, unread dot, star, and a "needs you" flag. Sort newest first. Select several to mark read, archive or delete.
- **Reading:** the full message, with Reply, Reply all, Forward, Archive, Mark unread and Star. Messages in the same thread are grouped as a conversation.
- **Compose:** a compose window (a pop-up on desktop, full screen on a phone). It has To and Cc fields that autocomplete from the members and an "Everyone on the team" group, plus Subject, Type, Priority and body. It fills in DEN-MSG v1 behind the scenes, autosaves to Drafts, keeps the in-page confirm before sending, and goes through the Outbox to Sent.
- **Search** across all folders, and **keyboard shortcuts** (c compose, r reply, e archive, j/k next/previous, / search).
- **The team board** stays, as a "Team" view in the folder pane (the live session state per member).
- **The store:** additive changes only.
  - Keep `notes/<id>`, `members/<nick>`, `meta/sync` and `sent/<id>` and every field they have, because Firefly's sync writes them.
  - New collections, such as `drafts/<id>` and `outbox/<id>`, and new fields, such as `thread`, `read`, `starred` and `folder`, are fine. Document them in a short `apps/team-inbox/STORE.md`.
- Phase it if it's big: layout, folders and reading first; then compose, drafts and the outbox; then search and shortcuts. Push each phase with screenshots.

## Why
GrumpyDingo uses the Den Team Inbox (https://claude.ai/artifact/Q142myFFxUxf5gDQbqG7QK) every day. It should feel like part of the game, not a separate tool.

## What to do
- **Source:** `apps/team-inbox/index.html` (one file).
- **Match the game UI:**
  - the field kit theme in `apps/den-ledger/src/css/050-field-kit.css`: gold `--fk-gold`, the Spectral SC display face, Barlow body, Barlow Condensed labels, thin rules;
  - the base tokens and the dark scheme in `010-base.css`;
  - how panels, buttons and cards look in `040-item-card.css`.
- **Make it standard:**
  - colours as tokens on `:root`, with dark and light both working;
  - one button style, one card style, one heading scale;
  - fonts from Google Fonts only.
- **Make it easier to read:** what needs GrumpyDingo comes first and is clearly marked; the composer and team board are tidy; it works at half width and at phone width.
- **Keep everything the page does now:**
  - the store collections `notes/<id>`, `members/<nick>`, `meta/sync`, `sent/<id>`, and their fields;
  - the composer (To, Cc, Everyone, DEN-MSG v1, the in-page confirm before sending);
  - the live session state on the board;
  - mark read and done.
  (Superseded by the update above: new mail features are wanted.)

## Rules
- **Do not publish the page, and do not write to its store.** Firefly reviews the change and republishes it.
- **Screenshots:** render the page headless with Chromium (Playwright is installed) at desktop, half width and phone width, in dark and light. Put them under `docs/team/lever/inbox-theme/`, as PNGs under 1 MB each.
- **Style check:** Palette is copied for an eye on style. Palette may leave a short note; Lever's build is the deliverable.

## Deliver
- **Branch:** `claude/team-lever`.
- **Files:** `apps/team-inbox/index.html`, the screenshots, and one log line.
- **Note:** a note in `docs/team/inbox/` that says what changed, and a status update.
