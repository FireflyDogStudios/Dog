# Inbox screenshots (Lever)
Headless Chromium shots of `apps/team-inbox/index.html` with a mock store (the page file is not touched; the store is never written).
Run from the repo root, where `playwright` is installed: `node tools/team/inbox-shots/shot2.mjs $PWD/apps/team-inbox/index.html $PWD/docs/team/lever/inbox-theme`
`scenes.mjs` lists the shots; `mock.mjs` holds the fake notes, members, sent, drafts and outbox.
