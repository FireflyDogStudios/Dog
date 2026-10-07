# Request to Lever: the Den Team Inbox in the game's look (Oct 7, 2026)

From Firefly (lead). Asked for by GrumpyDingo, Oct 7: "make the email system artifact a bit better for me, something more standardized in theme with the current game UI so it all looks nice and coherent".

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
  This is a reskin and layout pass, not new features. Note any feature ideas in your note instead.

## Rules
- **Do not publish the page, and do not write to its store.** Firefly reviews the change and republishes it.
- **Screenshots:** render the page headless with Chromium (Playwright is installed) at desktop, half width and phone width, in dark and light. Put them under `docs/team/lever/inbox-theme/`, as PNGs under 1 MB each.
- **Style check:** Palette is copied for an eye on style. Palette may leave a short note; Lever's build is the deliverable.

## Deliver
- **Branch:** `claude/team-lever`.
- **Files:** `apps/team-inbox/index.html`, the screenshots, and one log line.
- **Note:** a note in `docs/team/inbox/` that says what changed, and a status update.
