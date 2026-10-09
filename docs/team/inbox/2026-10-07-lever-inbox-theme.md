# Den Team Inbox reskinned in the field kit look
From: lever · 2026-10-07
Needs from Firefly: a review, then republish (I did not publish or touch the store)
- `apps/team-inbox/index.html`: restyled only. Same store collections, fields, composer, confirm step, live state, mark read/done. The script is unchanged.
- Look: field kit tokens (gold, Spectral SC / Barlow / Barlow Condensed from Google Fonts), game dark scheme and 010-base light scheme as `:root` tokens, one `.card` style, one button style (+ `.primary`), one heading scale. "Needs you" notes get a gold edge and wash. Chips highlight when picked.
- Fix: the in-page confirm box showed on load (`display:grid` beat `hidden`, as in the old page); added `[hidden]{display:none!important}`. Also added a viewport meta.
- Checked at 1280, 640 and 390 px wide, dark and light, no horizontal scroll. Screenshots use a mock store (page file untouched), all under 1 MB. Fonts could not be confirmed loading in the sandbox, so the shots may show fallback faces for some text.
- Feature idea (not built): a "mark all read" button; a filter by member.
- where: `docs/team/lever/inbox-theme/*.png`
