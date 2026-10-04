"""Den Lens, image side: measure things in a screenshot or render (what the eye cannot).
   python3 tools/lens/measure_image.py shot.png --colour 'ff2020'        angle, centre and box of every pixel near that colour
   --axis splits left/right at --split-x so two dogs in one shot are measured apart.
   Angles are degrees BELOW horizontal for a line running down to the right."""
import sys, math, argparse
import numpy as np
from PIL import Image

def mask_for(im, hexcol, tol=40):
    c = np.array([int(hexcol[i:i + 2], 16) for i in (0, 2, 4)])
    return (np.abs(im.astype(int) - c).sum(axis=2) <= tol)

def axis_of(mask):
    ys, xs = np.nonzero(mask)
    if len(xs) < 5: return None
    p = np.c_[xs, ys].astype(float); c = p.mean(0); _, _, vt = np.linalg.svd(p - c); d = vt[0]
    ang = math.degrees(math.atan2(d[1], d[0])); ang = ang + 180 if ang < -90 else ang - 180 if ang > 90 else ang
    return {'pixels': int(len(xs)), 'centre': tuple(c.round(1)), 'angle_below_horizontal': round(ang, 1), 'bbox': (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()))}

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('image'); ap.add_argument('--colour', required=True); ap.add_argument('--tol', type=int, default=40); ap.add_argument('--split-x', type=int)
    a = ap.parse_args(); im = np.array(Image.open(a.image).convert('RGB')); m = mask_for(im, a.colour, a.tol)
    if a.split_x:
        for name, sl in (('left', slice(0, a.split_x)), ('right', slice(a.split_x, None))):
            mm = np.zeros_like(m); mm[:, sl] = m[:, sl]; print(name, axis_of(mm))
    else: print(axis_of(m))
