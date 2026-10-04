# Den Game — Sky & Light (weather + lighting pass, v0.43)

Built Oct 2, 2026 by Firefly at GrumpyDingo's request ("weather pass… might as well do a lighting pass").

## Sources we looked at
- **web-weather** by greywen (MIT): https://github.com/greywen/web-weather. It's a Next.js app, not a library. We adapted its techniques and its thunder synthesis into our own canvas layer:
  - pooled struct-of-arrays particles
  - rain drawn in three alpha bins
  - a splash pool
  - a cached fog texture
  - branching lightning drawn as a glow pass plus a core pass
  - thunder in layers: snap, crack, sub-bass, rolling rumble
  - rain and wind noise ambience

  Credited in Settings → Credits.
- **pixi-lights-and-shadows** by Dominic Branchaud (MIT): https://github.com/dobrado76/pixi-lights-and-shadows. It's a WebGL/PixiJS engine that needs every sprite rendered in Pixi with normal maps. Our scene is HTML/CSS with emoji art and no normal maps, so a port would mean rebuilding the whole renderer. We took the *ideas* instead (ambient light + light sources + directional shadows) and built a 2D canvas version. Credited as "Lighting ideas".

## How it works (code: `/* v0.43 Den Sky & Light */`)
- **Canvases inside the scene,** in logical stage units, so they follow the Den Stage and zoom:
  - `fx-shade` (z 2, under sprites): soft ground shadows.
  - `fx-light` (z 5): ambient darkness with light holes cut out (destination-out), then glows added on top ("lighter").
  - `fx-wx` (z 6): rain, splashes, snow, fog, gusts.
- **Ambient by time of day:** day 0, dawn .18, dusk .28, night .62 (deep blue), plus weather (rain +.10, storm +.24, fog +.05), capped at .72. It eases over a second or two, and is darker at the top of the sky.
- **Lights:**
  - The dingo's warm glow (a hole plus a halo).
  - Orbiting weapons glow by rarity (rare and up).
  - Ground loot beams (rare and up).
  - Fireflies at dusk and night.
  - Sun rays from the sun's position at day, dawn and dusk.
  - Lightning flash.
- **Shadows:** under the dingo, creatures (fainter for flyers) and weapons. They stretch longer at dawn and dusk, and lean away from the sun, or away from the dingo's glow at night.
- **Weather hooks:**
  - `fxFrame(dt, P, walking)` runs from `battleFrame` after `wxFrame`.
  - `startWeather` no longer builds DOM drops, fog or snow when effects are on. The leaves for wind and the heat layer stay.
  - `lightning(x)` calls `fxBolt` and `fxThunder` (the storm damage is unchanged).
- **Gameplay is untouched.** The five-screen-size test still gives identical kills.

## Settings
- **Weather & lighting:** Full / Light / Off.
  - Light: lower resolution, half the particles, no sun rays or shadows, no ambience.
  - Off: the old simple look.
- **Gentle weather** (on by default): half as much rain, slower and less slanted, quieter thunder. GrumpyDingo found the old rain made him seasick.
- **Weather sounds:** rain and wind ambience. Thunder always plays when sound is on.
- **Smoothness guard:** with Full on, if the game runs under 40 fps over 5 seconds, it switches to Light once and says so.

## Performance notes
- `fxFrame` JS costs about 0.1–0.4 ms. The real cost is compositing full-screen canvases, so canvas resolution is capped (Full 1.25×, Light 0.85×), and the weather canvas hides itself when there's no weather.
- In headless software rendering (worst case) at 1920×1080 night storm: Off 60 fps, Light 50, Full 47. Real GPUs should do much better.

## Ideas for later
- Normal-map-style rim light on the dingo (a pre-drawn highlight layer that tracks the sun side).
- Wet ground sheen after rain, and puddles that hold splashes.
- Lanterns and lights in the Den.
- Seasonal particles (petals, falling leaves) on the same engine.
