"""Den Lens: lay a reference photo under (or over) a render by LANDMARKS, to measure proportions. Never to trace: the drawing stays our own.
   python3 tools/lens/refoverlay.py photo.jpg shot.png out.png --box 8,-2,50,40 --scale 16 \\
        --pair nose:812,300=53.6,8.6 --pair tailtip:90,210=11.0,6.2 [--pair ...] [--alpha .5]
   Each --pair is  name:photoX,photoY=unitX,unitY  (the same landmark in the photo's pixels and in drawing units). Two pairs fix a similarity
   (scale, rotation, shift); more pairs are fitted by least squares and the residuals tell you how well the drawing agrees with the photo.
   --pt name:photoX,photoY   adds a photo-only landmark; --dist a,b prints the distance and angle between any two landmarks in drawing units.
   Out: the photo warped into the shot's space, blended at --alpha. Residuals are in drawing units."""
import argparse, math, re, sys
import numpy as np, cv2

ap = argparse.ArgumentParser(); ap.add_argument('photo'); ap.add_argument('shot'); ap.add_argument('out')
ap.add_argument('--box', required=True); ap.add_argument('--scale', type=float, required=True); ap.add_argument('--alpha', type=float, default=.5)
ap.add_argument('--pair', action='append', default=[]); ap.add_argument('--pt', action='append', default=[]); ap.add_argument('--dist', action='append', default=[])
a = ap.parse_args(); x0, y0, w, h = map(float, a.box.split(',')); S = a.scale
def pt(s): return tuple(map(float, s.split(',')))
pairs = {}
for p in a.pair:
    m = re.match(r'([^:]+):([^=]+)=(.+)', p); pairs[m[1]] = (pt(m[2]), pt(m[3]))
if len(pairs) < 2: sys.exit('need at least two --pair landmarks')
src = np.array([v[0] for v in pairs.values()], np.float32); dst = np.array([v[1] for v in pairs.values()], np.float32)
M, _ = cv2.estimateAffinePartial2D(src, dst, method=cv2.LMEDS if len(src) > 3 else cv2.RANSAC, ransacReprojThreshold=1e9) if len(src) > 2 else (None, None)
if M is None:  # exactly two pairs: solve the similarity directly
    (p1, p2), (q1, q2) = src, dst; zp, zq = complex(*(p2 - p1)), complex(*(q2 - q1)); k = zq / zp
    M = np.array([[k.real, -k.imag, q1[0] - (k.real * p1[0] - k.imag * p1[1])], [k.imag, k.real, q1[1] - (k.imag * p1[0] + k.real * p1[1])]], np.float32)
to_units = lambda p: tuple(M @ np.array([p[0], p[1], 1.0]))
scale_units_per_px = math.hypot(M[0, 0], M[1, 0]); rot = math.degrees(math.atan2(M[1, 0], M[0, 0]))
print(f'photo → drawing units: {scale_units_per_px:.4f} units per photo pixel, rotated {rot:.1f}°')
for n, (p, u) in pairs.items():
    q = to_units(p); print(f'  {n:10s} fits to ({q[0]:.2f}, {q[1]:.2f})  wanted ({u[0]:.2f}, {u[1]:.2f})  off by {math.dist(q, u):.2f} units')
pts = {n: p for n, (p, _) in pairs.items()}; pts.update({m[1]: pt(m[2]) for m in (re.match(r'([^:]+):(.+)', s) for s in a.pt)})
for d in a.dist:
    n1, n2 = d.split(','); u1, u2 = to_units(pts[n1]), to_units(pts[n2]); print(f'  {n1} → {n2}: {math.dist(u1, u2):.2f} units, {math.degrees(math.atan2(u2[1] - u1[1], u2[0] - u1[0])):.1f}° below horizontal')
shot = cv2.imread(a.shot); photo = cv2.imread(a.photo)
# units → shot pixels: ((u - origin) * S); compose with photo → units
U2S = np.array([[S, 0, -x0 * S], [0, S, -y0 * S], [0, 0, 1]]); M3 = np.vstack([M, [0, 0, 1]]); T = (U2S @ M3)[:2]
warp = cv2.warpAffine(photo, T, (shot.shape[1], shot.shape[0]), borderValue=(0, 0, 0))
valid = cv2.warpAffine(np.full(photo.shape[:2], 255, np.uint8), T, (shot.shape[1], shot.shape[0])) > 0
out = shot.copy(); out[valid] = cv2.addWeighted(shot, 1 - a.alpha, warp, a.alpha, 0)[valid]
cv2.imwrite(a.out, out); print('wrote', a.out)
