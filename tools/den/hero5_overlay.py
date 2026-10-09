#!/usr/bin/env python3
"""hero5 laid over GrumpyDingo's own cut-out of the same photo (the exact test): hero5's pieces mapped back to the photo's pixels, the far legs
   swung about the hip / shoulder to where the photo has its far paws. Prints the overlap; writes the picture.
   Usage: python3 tools/den/hero5_overlay.py <cut-out png> <out png>"""
import sys, json, math, pathlib, numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).parent)); import hero5_build as H
from PIL import Image, ImageDraw
G = json.load(open(H.ROOT / 'engine/hero5_geo.json'))['nudged']; J = G['joints']
import os, re
if os.environ.get('FINAL'):  # the shapes the engine draws (after the ground fit and the clean legs), not the builder's photo cuts
    E = json.loads(re.search(r'const HERO5_GEO = (\{.*?\});\n', (H.ROOT / 'engine/hero5.js').read_text(), re.S).group(1)); J = {**J, **E['J']}
    G = {**G, 'parts': {k: [q[:2] for q in v] for k, v in E['parts'].items()}}
P = H.points(); O = H.outline(); g = max(P[k][1] for k in ('r_fToe', 'r_hToe', 'r_fHeel', 'r_hHeel')); ppu = (g - P['wither'][1]) / 25.0; X0 = min(O.bounds[0], P['r_tailTip'][0]) - 3 * ppu
cut = Image.open(sys.argv[1]).convert('RGBA'); k = cut.width / Image.open(H.PHOTO).width; Z = 3
px = lambda q: ((((q[0] - 1.0) * ppu + X0) * k) * Z, ((g - (35.55 - q[1]) * ppu) * k) * Z)
def rot(q, c, a): a = math.radians(a); x, y = q[0] - c[0], q[1] - c[1]; return (c[0] + x * math.cos(a) - y * math.sin(a), c[1] + x * math.sin(a) + y * math.cos(a))
def swing(piv, paw, target):  # the angle about piv that brings paw's x to target x
    best = min(np.arange(-40, 40, .25), key=lambda a: abs(rot(paw, piv, a)[0] - target[0])); return best
aH = swing(J['nHi'], J['nHp'], G['photoFarPaws']['hind']); aF = swing(J['nSh'], J['nFp'], G['photoFarPaws']['front'])
far = {n: (J['nHi'], aH) for n in ('thigh', 'shank', 'cannon', 'hpaw')}; far.update({n: (J['nSh'], aF) for n in ('upperarm', 'forearm', 'pastern', 'fpaw')})
W, Hh = cut.width * Z, cut.height * Z; m = Image.new('L', (W, Hh), 0); d = ImageDraw.Draw(m); outl = []
for n, pts in G['parts'].items():
    d.polygon([px(q) for q in pts], fill=255); outl.append([px(q) for q in pts])
    if n in far: c, a = far[n]; Q = [px(rot(q, c, a)) for q in pts]; d.polygon(Q, fill=255); outl.append(Q)
h5 = np.array(m) > 127; ph = np.array(cut.resize((W, Hh)))[..., 3] > 128
iou = (h5 & ph).sum() / (h5 | ph).sum(); print(f'overlap {iou:.3f} | photo only {(ph & ~h5).sum() / ph.sum():.3f} | hero5 only {(h5 & ~ph).sum() / ph.sum():.3f} | far legs swung: hind {aH:+.1f} deg, front {aF:+.1f} deg')
bg = Image.new('RGBA', cut.size, (250, 250, 248, 255)); bg.alpha_composite(cut); A = np.array(bg.resize((W, Hh))).astype(float)
A[ph & ~h5] = A[ph & ~h5] * .35 + np.array([235, 110, 60, 255]) * .65; A[h5 & ~ph] = A[h5 & ~ph] * .3 + np.array([50, 125, 220, 255]) * .7
img = Image.fromarray(A.astype(np.uint8)); dd = ImageDraw.Draw(img)
for Q in outl: dd.line(Q + [Q[0]], fill=(20, 20, 20, 255), width=2)
ys, xs = np.nonzero(ph | h5); img = img.crop((max(0, xs.min() - 30), max(0, ys.min() - 60), min(W, xs.max() + 30), min(Hh, ys.max() + 30)))
dr = ImageDraw.Draw(img); dr.rectangle((0, 0, img.width, 34), fill=(255, 255, 255, 255)); dr.text((10, 10), f"your cut-out with hero5 v0 on top (black: hero5's pieces; far legs swung to the photo's far paws).  orange = wolf, missing from hero5   blue = hero5, not in the photo   overlap {iou:.2f}", fill=(20, 20, 20, 255))
img.convert('RGB').save(sys.argv[2])
