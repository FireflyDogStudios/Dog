# Composite the hero3 overlays onto the fox frames, add the tracked data (planted paws, nose, back line, HUD) and write a GIF + a contact sheet.
import sys, json, glob, numpy as np
from PIL import Image, ImageDraw
frames, out, ovdir, dst = sys.argv[1:5]
R = json.load(open(out + '/data.json')); S = json.load(open(out + '/stances.json')); B = json.load(open(out + '/body.json')); WH = B['WH_px']
planted = {}
for c in S['stances']:
    for f in range(c['start'], c['end'] + 1): planted.setdefault(f, []).append(c)
imgs = []; trail = []
for r in R:
    f = r['f']; im = Image.open(f'{frames}/f{f+1:03d}.png').convert('RGBA'); ov = Image.open(f'{ovdir}/ov{f:03d}.png').convert('RGBA')
    im = Image.alpha_composite(im, ov); d = ImageDraw.Draw(im); b = B['rows'][f]; g = b['g']
    d.line([(0, g), (480, g)], fill=(150, 150, 150, 255))
    if b['back_h']: y = g - b['back_h']; d.line([(r['nose'][0] - 200, y), (r['nose'][0] - 110, y)], fill=(255, 120, 0, 255), width=2)
    for p in r['paws']:
        if p['n'] < 20: continue
        down = any(abs(p['x'] - (c['x0'] - sum(S['speed_px_per_frame'][c['start']:f]))) < 8 for c in planted.get(f, []))
        col = (0, 200, 0, 255) if down else (230, 30, 30, 255); d.ellipse([p['x'] - 4, p['y'] - 4, p['x'] + 4, p['y'] + 4], outline=col, width=2)
    trail.append(tuple(r['nose'])); d.line(trail[-12:], fill=(255, 0, 200, 255), width=2) if len(trail) > 1 else None
    nx, ny = r['nose']; d.ellipse([nx - 3, ny - 3, nx + 3, ny + 3], fill=(255, 0, 200, 255))
    d.rectangle([0, 248, 480, 270], fill=(255, 255, 255, 220))
    d.text((4, 252), f"frame {f}  t {f/15:.2f}s  speed {S['speed_px_per_frame'][f]:.1f}px/f  back {b['back_h']/WH:.2f}  nose {b['nose_h']/WH:.2f}  nose below back {(b['back_h']-b['nose_h'])/WH:.2f} (shoulder heights)", fill=(0, 0, 0, 255))
    imgs.append(im.convert('RGB'))
imgs[0].save(dst + '/fox_vs_hero3.gif', save_all=True, append_images=imgs[1:], duration=1000 // 15, loop=0)
sel = list(range(0, 65, 4)); W = 3; sheet = Image.new('RGB', (480 * W, 270 * ((len(sel) + W - 1) // W)), 'white')
for k, f in enumerate(sel): sheet.paste(imgs[f], ((k % W) * 480, (k // W) * 270))
sheet.save(dst + '/fox_vs_hero3_sheet.png'); print('wrote', len(imgs), 'frames')
