#!/usr/bin/env python3
"""Line the clean wolf silhouettes up (ground at the bottom, scale and slide to best overlap with the first), average them into a "mean wolf"
   (how many of the photos cover each pixel), and fit our standing hero3 onto it the same way. Writes ref/research/firefly/wolf-silhouettes/overlay.png
   and prints the overlap. Usage: python3 tools/den/wolf_overlay.py <hero3 standing silhouette png, black on white>"""
import sys, pathlib, numpy as np
from PIL import Image, ImageDraw
D = pathlib.Path(__file__).resolve().parents[2] / 'ref/research/firefly/wolf-silhouettes'
H, W, G = 900, 1500, 860

def mask(p, w=None):
    im = Image.open(p).convert('L'); a = np.array(im) < 128; ys, xs = np.nonzero(a); a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    return a
def place(a, s, dx):
    im = Image.fromarray((a * 255).astype(np.uint8)); im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.BILINEAR); b = np.array(im) > 127
    C = np.zeros((H, W), bool); y0 = G - b.shape[0]; x0 = 150 + dx
    if y0 < 0 or x0 < 0 or x0 + b.shape[1] > W: return None
    C[y0:G, x0:x0 + b.shape[1]] = b; return C
def fit(a, target, s_rng):
    best = None
    for s in s_rng:
        for dx in range(-200, 201, 4):
            C = place(a, s, dx)
            if C is None: continue
            iou = (C & target).sum() / (C | target).sum()
            if best is None or iou > best[0]: best = (iou, s, dx, C)
    return best
refs = sorted(D.glob('[0-9][0-9]_wolf_*.png')); base = mask(refs[0]); s0 = 600 / base.shape[0]; T = place(base, s0, 0); stack = [T]
for r in refs[1:]:
    a = mask(r); s = 600 / a.shape[0]; b = fit(a, T, np.linspace(s * .8, s * 1.25, 19)); print(r.name[:40], 'overlap with 01:', round(b[0], 2)); stack.append(b[3])
mean = np.mean(stack, axis=0); core = mean >= .5
ours = mask(sys.argv[1]); s = 600 / ours.shape[0]; b = fit(ours, core, np.linspace(s * .7, s * 1.4, 36)); O = b[3]
print('hero3 overlap with the mean wolf (pixels at least half the photos cover):', round(b[0], 3))
img = np.full((H, W, 3), 252.0)
for c in range(3): img[..., c] -= mean * (252 - [205, 200, 192][c])  # the mean wolf: warm grey, darker where more photos agree
img[core] = (150, 142, 130)
edge = O ^ np.roll(O, 1, 0) | O ^ np.roll(O, 1, 1); img[O & ~core] = (42, 120, 214); img[core & ~O] = (225, 95, 70); img[edge] = (20, 20, 20)
im = Image.fromarray(img.astype(np.uint8)).crop((60, 120, 1440, 880)); ImageDraw.Draw(im).text((10, 8), f"grey: where most of the {len(refs)} wolf photos agree   orange: wolf, not ours   blue: ours, not wolf   black line: our outline", fill=(30, 30, 30))
im.save(D / 'overlay.png')
