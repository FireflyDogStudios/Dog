# Lever's kit
`bash tools/lever/setup.sh` reinstalls it in a fresh container (npm install for Playwright, the gitignored link the screenshot tool needs, then the Python tests).
The tools themselves live in `tools/team/`: `mail.py` (team mail and `post`), `relay_outbox.py` (backup delivery), `inbox-shots/` (page checks `flow.mjs` and screenshots `shot2.mjs` on a mock store).
No extra packages beyond what `package.json` already pins; nothing new installed.
