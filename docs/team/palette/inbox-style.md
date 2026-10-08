# Den Team Inbox: style spec (field kit look)
From: Palette · 2026-10-07 · for Lever, phase 1 · spec only
Source of truth: `apps/den-ledger/src/css/050-field-kit.css`. The game's mail list `.fkmail` (lines 74-89) is the model for the message list.
All text colours below were contrast-checked against `--panel` and `--bg`, and all pass WCAG AA (4.5:1 or more).

## 1. Tokens
Put these on `:root`. Use dark by default under `prefers-color-scheme: dark`, and also under `[data-theme="dark"]`. Light is the same set under `[data-theme="light"]`.

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#0b0f0d` | `#e6ebe4` | page, folder pane |
| `--panel` | `#141b17` | `#f4f6f1` | list and reading panes |
| `--panel-2` | `#1b241f` | `#eaeee7` | hover row, input fill |
| `--field` | `#101511` | `#ffffff` | buttons, inputs |
| `--ink` | `#ece3cf` | `#1f2a24` | text (13.7:1 and 13.6:1) |
| `--muted` | `#9fa898` | `#56655f` | meta, timestamps (7.1:1 and 5.6:1) |
| `--rule` | `rgba(236,227,207,.10)` | `rgba(31,42,36,.12)` | hairlines |
| `--line` | `rgba(236,227,207,.18)` | `rgba(31,42,36,.22)` | input and button borders |
| `--gold` | `#d9a441` | `#8a5a12` | needs-you, primary, unread (7.8:1 and 5.4:1) |
| `--gold-soft` | `rgba(217,164,65,.42)` | `rgba(138,90,18,.35)` | gold borders |
| `--gold-wash` | `rgba(217,164,65,.08)` | `rgba(138,90,18,.07)` | selected row |
| `--ok` | `#7fae7a` | `#2f6b45` | done, idle, sent |
| `--warn` | `#d0675a` | `#a8323f` | blocked, failed, trash count |
| `--btn-ink` | `#17120a` | `#fbf6ea` | text on gold (8.3:1 and 5.5:1) |

Light gold is darkened from `#d9a441` to `#8a5a12` on purpose. The dark-mode gold is 1.9:1 on a pale ground and can't be read.

## 2. Type
Load from Google Fonts: Spectral SC 500, Barlow 400/500/600, Barlow Condensed 500/600. Use three faces with one job each, and nothing outside this table.

| Role | Face | Size / weight | Extras |
|---|---|---|---|
| Page title ("Den Ledger · Team Inbox") | Spectral SC | 1.35rem / 500 | letter-spacing .04em |
| Reading-pane subject | Spectral SC | 1.15rem / 500 | .04em |
| Folder names, row sender | Barlow | .95rem / 600 | |
| Body, row headline | Barlow | .95rem / 400 (unread 600) | line-height 1.55, body max 68ch |
| Labels, tabs, chips, timestamps, counts | Barlow Condensed | .72-.8rem / 600 | uppercase, .08-.14em; counts and times use `tabular-nums` |

Base size is 15px.

## 3. Panes
- **Layout:** folders 200px | list 340-380px | reading pane flexible.
- **Panes:** separated by 1px `--rule`, with no gaps, radii or shadows between them.
- **Half width (under 1100px):** folders collapse to a 52px icon rail.
- **Phone (under 700px):** one pane at a time, with a back button.
- **Folder row:** Barlow 600 name, with the count right-aligned in condensed `tabular-nums`. The active folder gets a 2px gold left border and `--panel-2` fill. "Needs you" is listed second, and its count is gold when above 0.

## 4. List row (copy `.fkmail summary`)
- **Grid:** `14px | 1fr | auto`, padding 10px 12px, 1px `--rule` under each row, no boxes.
  - Line 1: sender (Barlow 600) with the role tag after it, then the time on the right (condensed, muted).
  - Line 2: headline, clipped to one line.
  - Line 3 (optional): the first line of the body, muted, clipped.
- **Unread:** an 8px gold dot in the 14px column, and the headline goes to 600. Read rows have no dot, with nothing taking its place.
- **Needs you:** a 3px gold left border on the row, plus a `NEEDS YOU` tag: condensed 600, .7rem, .1em, gold text, 1px `--gold-soft` border, padding 2px 8px, no fill.
- **Gold:** keep it for "act on this" (unread, needs you, the one primary button, the active folder). Don't use it for decoration.
- **Hover:** `--panel-2`. **Selected:** `--gold-wash` with a 1px `--gold-soft` inset.
- **Done or archived:** muted headline with a small condensed `DONE` in `--ok`.

## 5. Member role colours
Use one colour per group, not per member, so the set stays readable as the team grows. Colours appear only as text: the sender's role tag, and a 6px square before the name on the board.

| Group | Members | Dark | Light |
|---|---|---|---|
| Lead | Firefly | `--gold` | `--gold` |
| Research and records | Scout, Atlas, Shutter, Fetch | `#6fb3b8` | `#1f6a70` |
| Build and engine | Forge, Spark, Smith, Lever, Relay | `#d98a5a` | `#9a4a1c` |
| Craft | Palette, Reel, Echo | `#b79ad6` | `#6b4a96` |
| Design | Loom, Scale, Trail | `#8fb4e0` | `#2f5f96` |
| GrumpyDingo | | `--ink`, with the name in Spectral SC | same |

All role colours pass 6.4:1 or more on dark and 5.7:1 or more on light. Build orange sits near `--warn`, so state is shown only by left borders and state words, never by text colour.

Board card state is a 2px left border plus one condensed word: `WORKING` gold, `IDLE` `--ok`, `BLOCKED` `--warn`, `ASLEEP` muted.

## 6. Buttons
- **Radius:** 3px on everything. The only shadow is the compose window (below).
- **Default:** `--field` fill, 1px `--line` border, condensed 600 .78rem uppercase .08em, padding 6px 12px, and the border goes `--gold-soft` on hover.
- **Primary:** `--gold` fill with `--btn-ink` text. There is one per view: Compose in the folder pane, and Send in the compose window.
- **Danger (Delete, Empty trash):** default style with `--warn` text and border.
- **Icon buttons:** 32px square, default style.
- **Focus:** 2px `--gold` outline with a 2px offset.

## 7. Compose window
- **Window:** docked bottom-right, 560px wide (full width on phone), `--panel` fill, 1px `--gold-soft` border with a 2px gold top border, radius 4px, shadow `0 18px 40px rgba(0,0,0,.6)` (light: `0 12px 30px rgba(31,42,36,.18)`).
- **Header bar:** condensed uppercase "NEW MESSAGE", with minimise and close on the right.
- **Fields:** To, Cc, Subject are rows with a condensed muted label (64px), a 1px `--rule` under each, and no boxed inputs. Recipient chips are 1px `--line`, radius 2px, and carry the role-colour square.
- **Body:** Barlow .95rem with the DEN-MSG header block in condensed muted text.
- **Footer:** Send (primary) on the left, then Save draft and the Everyone toggle. The confirm step reuses the same window and swaps the body for a summary. It is not a second pop-up.

## 8. Don't
- Don't use Lilita One, Bricolage, Atkinson or mono fonts. Barlow Condensed with tabular figures covers paths and times.
- Don't use radii over 4px, chunky 3-5px edge shadows, or filled pill badges.
- Don't put gold on anything that doesn't need action.
