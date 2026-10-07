#!/usr/bin/env python3
"""den outline <id> --photo <template>: the outline from a REAL PHOTO of the species, warped onto its sourced skeleton.

   Template spec: species/templates/<template>.yaml (image, licence, landmarks in photo pixels and what each maps to). The animal is cut out with IS-Net
   (rembg), the far legs are removed (redrawn from the near legs), the body (with head, ears, ruff and tail) is warped by a thin-plate spline on the
   landmarks, and each near leg is moved bone by bone (linear blend skinning). Surface landmarks map to skeleton point + skin offset (Ellenberger-Baum) +
   fur offset (Scout 03, by season), so the photo's fur stays where fur is. Then clean Bezier curves are fitted (outline_curves).
   Output: species/build/<id>.photo.json and .svg/.png (left: the cut-out photo with its landmarks; right: the wolf on its skeleton)."""
import sys, json, pathlib, subprocess, base64, io
import numpy as np, yaml
from PIL import Image
from scipy import ndimage as ndi
from scipy.interpolate import RBFInterpolator
from skimage import measure
from shapely.geometry import Polygon, Point, LineString, box
from shapely.ops import unary_union
import shapely, shapely.affinity
ROOT = pathlib.Path(__file__).resolve().parents[2]; BUILD = ROOT / 'species/build'
sys.path.insert(0, str(pathlib.Path(__file__).parent)); import outline_curves as OC
DIRS = {'up': (0, -1), 'down': (0, 1), 'forward': (1, 0), 'back': (-1, 0)}
big = lambda g: max(g.geoms, key=lambda q: q.area) if g.geom_type == 'MultiPolygon' else g

def cutout(img_path):
    cache = BUILD / ('.' + pathlib.Path(img_path).stem + '_isnet.npy')
    if cache.exists(): return np.load(cache)
    from rembg import remove, new_session
    m = np.asarray(remove(Image.open(ROOT / img_path).convert('RGB'), session=new_session('isnet-general-use'), only_mask=True)) > 128
    lab = measure.label(m); m = ndi.binary_fill_holes(lab == max(measure.regionprops(lab), key=lambda q: q.area).label)
    np.save(cache, m); return m

def build(sid, tname):
    T = yaml.safe_load(open(ROOT / f'species/templates/{tname}.yaml'))
    sk = json.load(open(BUILD / f'{sid}.skeleton.json')); J0 = sk['joints_mm']; W = J0['withers']; H = W[1]
    J = {k: np.array([(v[0] - W[0]) / H, (H - v[1]) / H]) for k, v in J0.items()}
    J['mid_back'] = (J['withers'] + J['croup']) / 2
    J['brisket'] = np.array([J['elbow'][0], J['sternum_back'][1] - 0.02 - 0.0212])
    face = json.load(open(BUILD / f'{sid}.curves.json'))['face'] if (BUILD / f'{sid}.curves.json').exists() else {}
    m = cutout(T['image']); c = max(measure.find_contours(m.astype(float), 0.5), key=len)
    whole = Polygon(np.c_[c[:, 1], c[:, 0]]).buffer(0).simplify(1.0)
    flip = T.get('facing', 'right') == 'left'
    L = T['landmarks']; src, dst, names = [], [], []
    for n, l in L.items():
        if l['kind'] == 'joint': d = J[l['at']]
        elif l['kind'] == 'eye':
            if 'orbit_centre_EST' not in face: continue
            d = np.array(face['orbit_centre_EST'])
        else: d = J[l['at']] + np.array(DIRS[l['dir']]) * (l['skin'] + l['fur'])
        src.append(l['px']); dst.append(d); names.append(n)
    src = np.array(src, float); dst = np.array(dst)
    if flip: src[:, 0] = -src[:, 0]
    # similarity first (keeps the spline well conditioned), then the spline
    s = np.linalg.norm(dst[names.index('withers')] - dst[names.index('hind_toe')]) / np.linalg.norm(src[names.index('withers')] - src[names.index('hind_toe')])
    c0 = src.mean(0); norm = lambda P: (np.asarray(P, float) * ([-1, 1] if flip else [1, 1]) - c0) * s
    f = RBFInterpolator(norm(src), dst - norm(src), kernel='thin_plate_spline', smoothing=1e-5)
    warp = lambda P: norm(P) + f(norm(P))
    px = {n: np.array(l['px'], float) for n, l in L.items()}
    corr = lambda chain, r: LineString(chain).buffer(r, cap_style='round')
    # split: near legs by corridors around their bones; far legs removed; the tail protected
    fore_c = corr([px['elbow'], px['carpus'], px['front_mcp'], px['front_toe']], 48).union(Point(px['front_mcp']).buffer(70))
    hind_c = corr([px['stifle'], px['hock'], px['hind_mtp'], px['hind_toe']], 52).union(Point(px['hind_mtp']).buffer(70))
    far = corr(T['far_fore'], 50).union(Point(T['far_fore'][-1]).buffer(75)).union(corr(T['far_hind'], 52)).union(Point(T['far_hind'][-1]).buffer(75))
    tail_c = corr(T['tail_line'], 48)
    cut_f, cut_h = px['elbow'][1] - 25, px['stifle'][1] - 25
    xmin, ymin, xmax, ymax = whole.bounds; split_x = (px['elbow'][0] + px['stifle'][0]) / 2
    lower = unary_union([box(split_x, cut_f, xmax + 9, ymax + 9) if not flip else box(xmin - 9, cut_f, split_x, ymax + 9),
                         box(xmin - 9, cut_h, split_x, ymax + 9) if not flip else box(split_x, cut_h, xmax + 9, ymax + 9)])
    body = big(whole.difference(lower.difference(tail_c)).difference(far.difference(tail_c).intersection(lower)).buffer(0))
    foreleg = big(whole.intersection(fore_c).intersection(box(xmin, cut_f - 30, xmax, ymax)).buffer(0))
    hindleg = big(whole.intersection(hind_c).intersection(box(xmin, cut_h - 30, xmax, ymax)).buffer(0))
    def tps(g): P = np.array(shapely.segmentize(g, 4).exterior.coords); return big(Polygon(warp(P)).buffer(0))
    def along(p1, p2, q1, q2):
        u = (p2 - p1) / np.linalg.norm(p2 - p1); v = (q2 - q1) / np.linalg.norm(q2 - q1); k = np.linalg.norm(q2 - q1) / np.linalg.norm(p2 - p1)
        nu, nv = np.array([-u[1], u[0]]), np.array([-v[1], v[0]])
        return lambda P: q1 + np.outer((P - p1) @ u * k, v) + np.outer((P - p1) @ nu, nv)
    def lbs(g, chain, top_px):
        P0 = np.array(shapely.segmentize(g, 4).exterior.coords); P = norm(P0); A = [norm(px[c][None])[0] for c in chain]
        segs = [(A[i], A[i + 1], J[chain[i]], J[chain[i + 1]]) for i in range(len(chain) - 1)]; Ts = [along(*q) for q in segs]; D = []
        for a_, b_, _, _ in segs:
            t = np.clip(((P - a_) @ (b_ - a_)) / ((b_ - a_) @ (b_ - a_)), 0, 1); D.append(np.linalg.norm(P - (a_ + t[:, None] * (b_ - a_)), axis=1))
        D = np.array(D); w = 1 / (D ** 4 + 1e-9); w /= w.sum(0); Q = sum(w[i][:, None] * Ts[i](P) for i in range(len(Ts)))
        tb = np.clip((P0[:, 1] - top_px) / 60, 0, 1)[:, None]; Q = tb * Q + (1 - tb) * (P + f(P))     # blend into the body warp at the top
        return big(Polygon(Q).buffer(0))
    layers = {'BODY': tps(body), 'FORELEG': lbs(foreleg, ['elbow', 'carpus', 'front_mcp', 'front_toe'], cut_f - 30),
              'HINDLEG': lbs(hindleg, ['stifle', 'hock', 'hind_mtp', 'hind_toe'], cut_h - 30)}
    layers['BODY'] = big(layers['BODY'].buffer(-0.012).buffer(0.012))          # clear slivers left by the split
    layers['FORELEG_FAR'] = shapely.affinity.translate(layers['FORELEG'], OC.A_FAR['fore'], 0)
    layers['HINDLEG_FAR'] = shapely.affinity.translate(layers['HINDLEG'], OC.A_FAR['hind'], 0)
    out = {'id': sid, 'template': tname, 'source': {k: T[k] for k in ('image', 'source', 'author', 'licence')}, 'layers': {},
           'pairs': [{'name': n, 'species_wh': d.round(4).tolist()} for n, d in zip(names, dst)]}
    sc = sk['scale_units_per_mm'] * H; X0, Y0 = sk['joints']['withers']; M = lambda q: (X0 + q[0] * sc, Y0 + q[1] * sc)
    for k, g in layers.items():
        P = OC.resample(list(g.exterior.coords)[:-1], 0.003, 2.0); curves, _ = OC.pin_and_fit(P, [], 0.0035)
        out['layers'][k] = {'d_wh': OC.path_d(curves), 'd_units': OC.path_d(curves, M), 'segments': len(curves)}
    return out, J, (whole, body, foreleg, hindleg, far, src, names), T

def render(sid, out, J, dbg, T, S=900):
    whole, body, fore, hind, far, src, names = dbg
    img = Image.open(ROOT / T['image']).convert('RGBA'); m = cutout(T['image'])
    a = np.asarray(img).copy(); a[..., 3] = (m * 255).astype(np.uint8); cut = Image.fromarray(a); cut.thumbnail((1400, 1400)); k = cut.size[0] / img.size[0]
    buf = io.BytesIO(); cut.save(buf, 'PNG'); b64 = base64.b64encode(buf.getvalue()).decode()
    pw, ph = cut.size
    ox, oy = 1.45, 0.62; W2, Hh = int(2.6 * S), int(1.85 * S)
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{pw + 40 + W2}" height="{max(Hh, ph) + 70}"><rect width="100%" height="100%" fill="#efe6d2"/>']
    o.append(f'<image x="20" y="20" width="{pw}" height="{ph}" xlink:href="data:image/png;base64,{b64}"/>')
    for g, col in ((fore, '#1d7a3a'), (hind, '#1d4f7a'), (far, '#b3261e')):
        for q in getattr(g, 'geoms', [g]):
            o.append('<polygon points="' + ' '.join(f'{20 + x * k:.1f},{20 + y * k:.1f}' for x, y in q.exterior.coords) + f'" fill="none" stroke="{col}" stroke-width="2" stroke-dasharray="6 4"/>')
    for (x, y), n in zip(src, names): o.append(f'<circle cx="{20 + abs(x) * k:.1f}" cy="{20 + y * k:.1f}" r="5" fill="#d9822b" stroke="#2a1a10"/>')
    col = {'HINDLEG_FAR': '#7d725f', 'FORELEG_FAR': '#7d725f', 'HINDLEG': '#a39377', 'BODY': '#a0917b', 'FORELEG': '#b9a588'}
    g = f'<g transform="translate({pw + 40 + ox * S},{oy * S}) scale({S})"><line x1="-2" y1="1" x2="2" y2="1" stroke="#7a6a50" stroke-width="{3 / S}"/>'
    for kk in ('HINDLEG_FAR', 'FORELEG_FAR', 'HINDLEG', 'BODY', 'FORELEG'):
        g += f'<path d="{out["layers"][kk]["d_wh"]}" fill="{col[kk]}" stroke="#2a1a10" stroke-width="{2.2 / S}" stroke-linejoin="round"/>'
    for a_, b_ in [('scapula_top', 'shoulder'), ('shoulder', 'elbow'), ('elbow', 'carpus'), ('carpus', 'front_mcp'), ('front_mcp', 'front_toe'), ('hip', 'stifle'), ('stifle', 'hock'), ('hock', 'hind_mtp'), ('hind_mtp', 'hind_toe'), ('ilium_crest', 'ischium'), ('neck_root', 'occiput'), ('withers', 'croup')]:
        g += f'<line x1="{J[a_][0]:.4f}" y1="{J[a_][1]:.4f}" x2="{J[b_][0]:.4f}" y2="{J[b_][1]:.4f}" stroke="#2a1a10" stroke-opacity="0.35" stroke-width="{4 / S}" stroke-linecap="round"/>'
    o.append(g + '</g>')
    segs = sum(v['segments'] for v in out['layers'].values())
    o.append(f'<text x="20" y="{max(Hh, ph) + 50}" font-family="sans-serif" font-size="20" font-weight="bold" fill="#2a1a10">Left: the template photo cut out (IS-Net) with its landmarks; green / blue dashed = near legs, red = far legs removed. Photo: {out["source"]["author"]}, {out["source"]["licence"]}. Right: warped onto the {sid} skeleton (faint lines), {segs} curves.</text>')
    o.append('</svg>'); (BUILD / f'{sid}.photo.svg').write_text('\n'.join(o))
    subprocess.run(['node', '-e', f"const {{Resvg}}=require('@resvg/resvg-js');const fs=require('fs');fs.writeFileSync('{BUILD}/{sid}.photo.png',new Resvg(fs.readFileSync('{BUILD}/{sid}.photo.svg','utf8')).render().asPng())"], cwd=ROOT, check=True)

def main(args):
    sid = args[0]; tname = args[1] if len(args) > 1 else f'{sid}_01'
    out, J, dbg, T = build(sid, tname); (BUILD / f'{sid}.photo.json').write_text(json.dumps(out, indent=1)); render(sid, out, J, dbg, T)
    print(f'wrote species/build/{sid}.photo.json, .svg, .png'); [print(f'  {k:12} {v["segments"]} curves') for k, v in out['layers'].items()]; return 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
