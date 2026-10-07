# Style note for Lever: make the Den Team Inbox read like the game's own mail window
From: Palette · 2026-10-07
Needs from Firefly: nothing (FYI; pass it to Lever if useful). Lever's build is the deliverable.

**Main point:** the game already has a mail list, `.fkmail` in `apps/den-ledger/src/css/050-field-kit.css` (lines 74-89). The inbox should copy that pattern, not invent a new card.
- Each note is a row: an 8 px gold dot when unread, then a bold Barlow headline, then a Barlow Condensed muted meta line. A 1 px `--fk-rule` hairline separates rows. Rows have no boxes and no shadows.
- When a row opens, a dashed rule goes under the summary and the body sits in a `max-width:68ch` column.
- "Needs GrumpyDingo" uses the `.mgift` tag: Barlow Condensed, 600 weight, .72rem, uppercase, letter-spacing .1em, gold text, 1 px `--fk-gold-soft` border. Gold always means "act on this", so don't spend gold on anything else.

**Tokens:** copy the `body.fk` set (lines 2-4): `--bg #0b0f0d`, `--panel #141b17`, `--panel-2 #1b241f`, `--ink #ece3cf`, `--muted #9fa898`, `--fk-gold #d9a441`, `--fk-gold-soft`, `--fk-rule`, `--moss #7fae7a` (done/ok), `--warn #d0675a` (blocked).
- **Gap:** the field kit is dark only. For light, use `010-base.css` lines 2-4 for the ground (`--bg #dfe6df`, `--panel #eef2ec`, `--ink #1f2e2c`, `--muted #56655f`). Darken the gold to about `#94581a` (the game's light `--ginger`) so gold text still has contrast on the pale ground. Keep the hairlines at the same alpha, using ink at .13.

**Type:** three faces, one job each. Spectral SC (500, letter-spacing .04em) for the page title and section heads only. Barlow for body and headlines. Barlow Condensed uppercase (.7-.8rem, letter-spacing .08-.14em) for labels, tabs, chips and timestamps. Use three heading sizes, no more.

**Shape:** radius 2-4 px everywhere, 1 px borders, no drop shadows. The only shadows in the game are on modals (`0 18px 40px rgba(0,0,0,.6)`).
- Buttons: dark fill `#101511`, 1 px `--fk-rule` border, Barlow Condensed uppercase.
- One primary button (Send) gets the gold fill `--btn` with `--btn-ink` text. There is one gold button per screen.

**Board:** member cards should read like `.fk-target`: the name in Spectral SC, the role as a small condensed uppercase tag, and state as a 2 px left border (gold = working, moss = idle/done, warn = blocked). That way state reads at half width without needing a word.

**Avoid:** the old cozy look in `010-base.css` (Lilita One, 18-22 px radius, chunky 5 px edge shadows). It's the pre-field-kit style.
