# videokit: measure a side-view animal walk from a clean video

For clips on a plain, light background with the camera tracking the animal (it walks to the right). Built on the fox clip (Oct 8, 2026); the results are in `ref/research/firefly/fox-walk-analysis/`.

```
ffmpeg -i clip.mp4 frames/f%03d.png
python3 -I tools/videokit/analyze.py frames out      # cut out the animal, find the ground, nose, topline and dark lower legs per frame
python3 -I tools/videokit/track.py out/data.json out/stances.json   # planted paws: linked frame to frame (a planted paw slides back at the walking speed)
python3 -I tools/videokit/body.py out/data.json out/stances.json out/body.json   # back, nose and ear heights as shares of the standing back height
node tools/videokit/overlay.mjs engine out/data.json out/body.json ov          # hero3 drawn over every frame, scaled and step-synced
python3 -I tools/videokit/compose.py frames out ov dst   # overlay GIF + contact sheet
python3 -I tools/videokit/charts.py out dst 15           # head/back/speed charts and the footfall diagram
```

Limits:
- It needs a light, plain background.
- The animal must face right.
- Dark lower legs make paw tracking much better.
- Thresholds in `analyze.py` and `body.py` are tuned on the fox clip (the band widths assume roughly a 160 px tall animal).
- `overlay.mjs` takes the sync frame and the stride length (`F0`, `STRIDE_F`) from that clip.
- Keep source videos and their frames out of the repo unless their licence allows it.
