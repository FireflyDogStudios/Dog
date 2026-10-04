# Den Game — Screen, scale and camera standard (proposal)

Written Oct 2, 2026 by Firefly after GrumpyDingo's report: icons too small, the UI only fits at the smallest Interface size, resizing the window changes the game, and the question "what if one player has a 90-inch TV and another a 20-inch monitor?". **Status: proposal, waiting for a go-ahead.**

## What's wrong today (found in the code)
- **The game reads the screen.** The battle field is as wide as the window (`P.w` = hero width), and the dingo's position comes from `getBoundingClientRect()`. Game logic uses screen pixels.
- **The dingo trots across the whole window** (a CSS animation from left −70px to 100% over 38s), then wraps. A wider window means a faster dingo in pixels and a longer walk for creatures.
- **Creatures spawn at the right edge** of the window (`P.w + 30`), so how long they take to arrive depends on window width.
- **Sizes are fixed CSS pixels**: the dingo is 88px whether the screen is 768 or 2160 tall. The UI is fixed pixels × a manual "Interface size" slider, so every fix only moved the problem.

## How engines solve it (research)
- **Pick one design size and scale everything from it.** Godot recommends a 1920×1080 base for non-pixel-art desktop games, with "canvas_items" stretch and "expand" aspect. The engine never changes the monitor; it scales the base size to fit.
- **Keep the height, let the width vary.** Godot's "keep height" aspect is meant for side-scrollers: wider screens show more to the sides, taller ones don't change the play height.
- **UI scales with the screen, then the player's preference.** Unity's Canvas Scaler ("Scale With Screen Size") uses a reference resolution, so UI is the same proportion of the screen everywhere. The player's Interface size (like GW2's Small/Normal/Large/Larger) multiplies on top.
- **Text:** the IGDA Game Accessibility SIG asks for at least 32px at 1080p (46px for timed text) for TV-distance play. Desktop players sit closer, so a smaller default is fine, but a "Larger" option matters.

## The Den Stage (proposed standard)
1. **Design size 1920×1080 logical units.** Scale `s = screen height / 1080`. Logical width = screen width / s, clamped from about 1000 (half-width window) to 2560 (21:9). Beyond that: extended sky/ground, no extra play space.
2. **World and UI scale separately.** World uses `s` only. UI uses `s × Interface size` (85 / 100 / 115 / 130%). Icons and text are sized in logical units, so they keep the same proportion on every screen.
3. **Game logic never reads the screen.** Positions, spawn distances and speeds are in logical units. The DOM only draws.
4. **Camera follows the dingo (runner camera).** The dingo stays at about 28% of the view and the world scrolls past (parallax layers move while walking, stop during fights). No wrap means no camera jump.
5. **Creatures spawn at a fixed distance ahead** (e.g. 1400 units) and walk at a fixed speed. A narrow window just sees them a little later; the timing is the same for everyone.
6. **Loot drops on the ground ahead and comes to the dingo** as the world scrolls, then gets picked up. It never piles on top of the dingo, so loot can be bigger.
7. **Multiplayer:** everyone simulates the same logical world. A 90-inch TV shows the same world at a bigger size; it never shows more of the play space. Only the UI size differs, by player choice.

## How we'll test it
Fixed screen sizes, before and after: 1366×768, 1920×1080, 960×1080 (half width), 2560×1080 (ultrawide), 3840×2160 (4K). Same time-to-kill and spawn timing at every size.

## Built in v0.40 (Oct 2) — status: live
GrumpyDingo: go ahead with the Den Stage + camera; careful with mechanics; shelve other areas and Trials (Meadow only); credits in Settings.
- **Design size:** the scene is 640 logical units tall (not 1080: the existing art was drawn for ~650px-tall scenes, so 640 keeps today's look on a laptop and scales up from there). `s = scene height on screen / 640`; logical width = screen width / s, at least 760 (narrow windows shrink to fit).
- **Scaling:** `section.hero` gets `width/height` in logical units and the CSS `scale` property (not `transform`: shakes animate transform and would undo it). `stageToScreen(x, y)` converts for effects drawn over the page.
- **Logic never reads the screen:** `dingoPos()` uses layout offsets (logical). `P.w` = the creature lane (`STAGE_LANE` 1330), `P.view` = visible width. The dingo stands at `STAGE_DINGO_X` 300.
- **Runner camera:** the dingo's trot animation is off; the ground layer scrolls at `STAGE_WALK` 52 units/s (same as ground loot) and pauses in fights; creatures get the same world scroll while walking. Creatures spawning inside a wide view fade in.
- **Interface:** `fkScale = uiFit() × uiPref`, where `uiFit = clamp(min(h/860, w/1400), 0.68, 2.2)` and uiPref = Small 0.85 / Normal 1 / Large 1.15 / Larger 1.3 (Settings, or − and =). `fkClampWins()` keeps open windows on screen.
- **Tested** at 1366×768, 1920×1080, 960×1080, 2560×1080 and 3840×2160 with a fixed random seed: the same 6 kills in 60 seconds at every size.
- **Shelved (code kept):** `SHELVED = {zones:["forest","moon"], trials:true}`; the Events window is in `DISABLED`; trial letters are off.
- **Not yet:** a mid-hills parallax layer that scrolls (the trees and mushrooms are still static), and a walk speed that grows with dingo tier.
- **GitHub note:** page-scroll parallax libraries (Jarallax and similar) move layers as a web page scrolls; a game's runner parallax is a few lines of its own, so no library was needed. Free art packs (itch.io, CC0) can be plugged in later; every outside asset goes in `CREDITS`.
