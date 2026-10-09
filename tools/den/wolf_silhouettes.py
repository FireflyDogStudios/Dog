#!/usr/bin/env python3
"""Cut black-on-white silhouettes from the Scout's licensed wolf photos (ref/research/scout/01-body-templates/wolf, CC BY 4.0 / PD / CC0), each
   turned to face right and cropped to the animal: ref/research/firefly/wolf-silhouettes/<name>.png, plus a contact sheet. IS-Net via rembg, the
   same cutter as `den outline --photo`. Usage: python3 tools/den/wolf_silhouettes.py"""
import pathlib, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from skimage import measure
from rembg import remove, new_session
ROOT = pathlib.Path(__file__).resolve().parents[2]; SRC = ROOT / 'ref/research/scout/01-body-templates/wolf'; OUT = ROOT / 'ref/research/firefly/wolf-silhouettes'
PICK = ['01', '02', '04', '05', '07', '08', '09', '10', '11', '12']  # true side views (03, 06, 13 have the head turned; 14 is three-quarter)
ses = new_session('isnet-general-use'); tiles = []
for f in sorted(SRC.glob('*.jpg')):
    if f.name[:2] not in PICK: continue
    m = np.asarray(remove(Image.open(f).convert('RGB'), session=ses, only_mask=True)) > 128
    lab = measure.label(m); m = ndi.binary_fill_holes(lab == max(measure.regionprops(lab), key=lambda q: q.area).label)
    if '_L' in f.stem.split('_')[-1] or f.stem.endswith('_L'): m = m[:, ::-1]
    ys, xs = np.nonzero(m); m = m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    im = Image.fromarray(np.where(m, 0, 255).astype(np.uint8)); im.save(OUT / (f.stem + '.png')); tiles.append((f.stem, im))
W = 420; rows = []
for name, im in tiles:
    t = im.copy(); t.thumbnail((W, 300)); c = Image.new('L', (W, 330), 255); c.paste(t, ((W - t.width) // 2, 320 - t.height)); ImageDraw.Draw(c).text((6, 4), name[:44], fill=0); rows.append(c)
sheet = Image.new('L', (W * 4, 330 * ((len(rows) + 3) // 4)), 255)
for i, c in enumerate(rows): sheet.paste(c, ((i % 4) * W, (i // 4) * 330))
sheet.save(OUT / 'contact-sheet.png'); print('wrote', len(tiles), 'silhouettes')
