"""Den Lens: before/after, with numbers.
   python3 tools/lens/diff.py before.png after.png out.png [--box x0,y0,w,h --scale s] [--tol 24]
   out.png is three panels: before | after | ghost (the two blended, every changed region outlined in yellow).
   Prints the share of pixels that changed, SSIM, and where the change is (in drawing units when --box and --scale are given).
   Make the pair with lens.cjs: `shot ... --ref HEAD --out before.png`, edit, then the same `shot` without --ref."""
import argparse, sys
import numpy as np, cv2
from PIL import Image
from skimage.metrics import structural_similarity as ssim

ap = argparse.ArgumentParser(); ap.add_argument('before'); ap.add_argument('after'); ap.add_argument('out')
ap.add_argument('--box'); ap.add_argument('--scale', type=float); ap.add_argument('--tol', type=int, default=24); ap.add_argument('--cells', type=int, default=1, help='dogs side by side in the shot (one cell each)')
a = ap.parse_args()
A = np.array(Image.open(a.before).convert('RGB')); B = np.array(Image.open(a.after).convert('RGB'))
if A.shape != B.shape: sys.exit(f'sizes differ: {A.shape} vs {B.shape}; render both with the same --box and --scale')
d = np.abs(A.astype(int) - B.astype(int)).max(axis=2) > a.tol
mask = d.astype(np.uint8) * 255; mask = cv2.dilate(mask, np.ones((5, 5), np.uint8)); mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
ghost = cv2.addWeighted(A, .5, B, .5, 0); cv2.drawContours(ghost, cnts, -1, (255, 255, 0), 2)
Image.fromarray(np.hstack([A, B, ghost])).save(a.out)
score = ssim(cv2.cvtColor(A, cv2.COLOR_RGB2GRAY), cv2.cvtColor(B, cv2.COLOR_RGB2GRAY))
print(f'changed pixels: {d.mean() * 100:.2f}%   SSIM: {score:.4f}   regions: {len(cnts)}')
if a.box and a.scale:
    x0, y0, w, h = map(float, a.box.split(','))
    cellw = w * a.scale
    for c in sorted(cnts, key=cv2.contourArea, reverse=True)[:8]:
        x, y, cw, ch = cv2.boundingRect(c); cell = int(x // cellw); x -= cell * cellw
        print(f'  dog {cell + 1}: region x {x0 + x / a.scale:.1f}..{x0 + (x + cw) / a.scale:.1f}  y {y0 + y / a.scale:.1f}..{y0 + (y + ch) / a.scale:.1f}  (drawing units)')
