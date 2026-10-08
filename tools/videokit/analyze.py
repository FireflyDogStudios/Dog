# Fox clip analysis: silhouette, ground, nose, topline, dark lower legs (paws), contacts, motion. Writes data.json + annotated frames.
import sys, json, glob, os, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
frames_dir, out = sys.argv[1], sys.argv[2]; os.makedirs(out + '/ann', exist_ok=True)
def segment(im):
    mx, mn = im.max(2), im.min(2); sat = (mx-mn)/(mx+1e-6); H, W = mx.shape
    yy, xx = np.mgrid[0:H, 0:W]; yy = yy/H; xx = xx/W
    A = np.stack([np.ones_like(xx), xx, yy, xx*xx, yy*yy, xx*yy], -1); cand = (mx > .8) & (sat < .08)
    c, *_ = np.linalg.lstsq(A[cand], mx[cand], rcond=None)
    for _ in range(2): bg = A @ c; keep = cand & (np.abs(mx-bg) < .04); c, *_ = np.linalg.lstsq(A[keep], mx[keep], rcond=None)
    bg = A @ c; fg = ((bg-mx) > .12) | (sat > .14)
    fg = ndi.binary_opening(fg, iterations=1); fg = ndi.binary_closing(fg, iterations=2)
    holes = ndi.binary_fill_holes(fg) & ~fg; hl, hn = ndi.label(holes)
    if hn: hs = ndi.sum(holes, hl, range(1, hn+1)); fg |= np.isin(hl, 1 + np.where(hs < 250)[0])  # only small holes (the white chest), never the gap between the legs
    lab, n = ndi.label(fg); sizes = ndi.sum(fg, lab, range(1, n+1)); fg = lab == (1 + np.argmax(sizes))
    dark = (mx < .33) & fg
    return fg, dark, mx
files = sorted(glob.glob(frames_dir + '/f*.png')); R = []
for fi, f in enumerate(files):
    im = np.asarray(Image.open(f).convert('RGB')).astype(float)/255; fg, dark, mx = segment(im); H, W = fg.shape
    ys, xs = np.nonzero(fg); ground = int(np.percentile(ys, 99.7))
    top = np.full(W, -1); 
    for x in range(W):
        col = np.nonzero(fg[:, x])[0]
        if len(col): top[x] = col[0]
    # nose: the front-most silhouette point in the head band (well above the ground)
    band = ys < ground - 40; nx = int(xs[band].max()); ny = int(np.median(ys[band & (xs >= nx - 1)]))
    # dark lower legs near the ground -> paws
    low = dark & (np.arange(H)[:, None] > ground - 45); lab, n = ndi.label(ndi.binary_closing(low, iterations=1))
    paws = []
    for k in range(1, n+1):
        py, px = np.nonzero(lab == k)
        if len(py) < 12: continue
        b = py.max(); paws.append({'x': float(px[py >= b - 2].mean()), 'y': int(b), 'n': int(len(py)), 'down': bool(b >= ground - 3), 'xmin': int(px.min()), 'xmax': int(px.max())})
    paws.sort(key=lambda p: p['x'])
    R.append({'f': fi, 'ground': ground, 'nose': [nx, ny], 'top': top.tolist(), 'paws': paws, 'area': int(fg.sum()), 'xmin': int(xs.min()), 'xmax': int(xs.max()), 'ymin': int(ys.min())})
    np.save(f'{out}/mask{fi:03d}.npy', fg)
json.dump(R, open(out + '/data.json', 'w'))
print(len(R), 'frames; ground', [r['ground'] for r in R[::8]], 'nose', [r['nose'] for r in R[::8]])
print('paws per frame', [len(r['paws']) for r in R])
