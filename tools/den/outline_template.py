#!/usr/bin/env python3
"""den outline <id> --template: the species outline by TEMPLATE WARP (the method the outline research recommends, ref/research/outline-methods).

   Template: the Ellenberger-Baum dog, public domain (ref/research/missingfound/atlas-plates). Its exterior silhouette is segmented from Tafel 1 (a shaded
   dog on white paper); its bone landmarks come from Tafel 3, which draws the same dog's skeleton (Tafel 1 x = Tafel 3 x + 31 px). The plate faces left.
   Landmark pairs: the 17 bone landmarks of ref/research/fetched/01-skin-offsets plus near-leg joint centres read by Firefly from gridded crops of
   Tafel 3 (PLATE_JOINTS below, about +-10 px = +-0.6% of withers height), each paired with the species skeleton (species/build/<id>.skeleton.json).
   Warp: thin-plate spline (scipy RBFInterpolator) from plate landmarks to skeleton landmarks, applied to the densified silhouette; the bending energy
   is reported as the distance from the template. The head is placeholder (Tafel 1's head is raised; the head will come from the wolf skull)."""
import sys, json, pathlib, subprocess
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from scipy.interpolate import RBFInterpolator
from skimage import filters, morphology, measure
from shapely.geometry import Polygon, Point
import shapely
ROOT = pathlib.Path(__file__).resolve().parents[2]; BUILD = ROOT / 'species/build'
PLATES = ROOT / 'ref/research/missingfound/atlas-plates'; SKIN = ROOT / 'ref/research/fetched/01-skin-offsets/data.json'
# near-leg joint centres on Tafel 3 (left-facing pixels), read by Firefly from gridded crops (Oct 7)
PLATE_JOINTS = {'shoulder': (950, 1290), 'elbow': (1174, 1736), 'carpus': (1230, 2300), 'front_mcp': (1140, 2510), 'front_toe': (1030, 2585),
                'hip': (2560, 1046), 'stifle': (2600, 1625), 'hock': (2930, 2150), 'hind_mtp': (2944, 2490), 'hind_toe': (2850, 2610),
                'tail_tip': (3195 - 31, 2055)}
PAIR = {'withers': 'withers', 'scapula_top': 'scapula_top', 'croup': 'croup', 'ischium': 'ischium'}   # Ellenberger landmark -> skeleton joint

def silhouette_mask():
    """the plate dog cut out with GrabCut (OpenCV): seeded by a brightness threshold, it follows the real edge through the engraving's hatching. Tafel 1 pixels."""
    import cv2
    cache = BUILD / '.tafel1_grabcut.npy'
    if cache.exists(): return np.load(cache)
    g = cv2.imread(str(PLATES / 'tafel1_exterior_left-lateral.jpg'), 0); img = cv2.cvtColor(g, cv2.COLOR_GRAY2BGR)
    fg = (cv2.GaussianBlur(g, (0, 0), 3) < 205).astype(np.uint8); fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19)))
    n, lab, st, _ = cv2.connectedComponentsWithStats(fg); big = (lab == 1 + np.argmax(st[1:, 4])).astype(np.uint8)
    mask = np.full(g.shape, cv2.GC_BGD, np.uint8); mask[cv2.dilate(big, np.ones((61, 61), np.uint8)) > 0] = cv2.GC_PR_BGD; mask[big > 0] = cv2.GC_PR_FGD; mask[cv2.erode(big, np.ones((25, 25), np.uint8)) > 0] = cv2.GC_FGD
    sm = 4; small = cv2.resize(img, None, fx=1 / sm, fy=1 / sm); ms = cv2.resize(mask, None, fx=1 / sm, fy=1 / sm, interpolation=cv2.INTER_NEAREST)
    cv2.grabCut(small, ms, None, np.zeros((1, 65)), np.zeros((1, 65)), 6, cv2.GC_INIT_WITH_MASK)
    out = cv2.resize(np.isin(ms, [cv2.GC_FGD, cv2.GC_PR_FGD]).astype(np.uint8), (g.shape[1], g.shape[0]), interpolation=cv2.INTER_LINEAR)
    out = cv2.morphologyEx(out, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))); out = cv2.morphologyEx(out, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
    n, lab, st, _ = cv2.connectedComponentsWithStats(out); out = ndi.binary_fill_holes(lab == 1 + np.argmax(st[1:, 4]))
    BUILD.mkdir(exist_ok=True); np.save(cache, out); return out

def mask_poly(m, shift=-31):
    c = max(measure.find_contours(m.astype(float), 0.5), key=len)
    return Polygon(np.c_[c[:, 1] + shift, c[:, 0]]).buffer(0).simplify(1.5)   # into Tafel 3 pixels

def build(sid):
    sk = json.load(open(BUILD / f'{sid}.skeleton.json')); J0 = sk['joints_mm']; W = J0['withers']; H = W[1]
    J = {k: np.array([(v[0] - W[0]) / H, (H - v[1]) / H]) for k, v in J0.items()}
    skin = {l['landmark']: l for l in json.load(open(SKIN))['landmarks']}
    wb = np.array(skin['withers']['bone_px_plate'], float); ground = skin['withers']['outline_px_plate'][1] + 1837; U = ground - wb[1]
    to_wh = lambda p: np.array([-(p[0] - wb[0]) / U, (p[1] - wb[1]) / U])     # plate pixels -> facing right, withers bone at 0,0, y down, ground at y = 1
    src, dst, names = [], [], []
    for e, j in PAIR.items(): src.append(to_wh(skin[e]['bone_px_plate'])); dst.append(J[j]); names.append(j)
    for j, p in PLATE_JOINTS.items(): src.append(to_wh(p)); dst.append(J[j]); names.append(j)
    # the brisket: the plate's sternum bone sits under the elbow; the species' at its bone chest depth, the same distance behind the elbow
    sb = to_wh(skin['brisket']['bone_px_plate']); el = to_wh(PLATE_JOINTS['elbow']); depth = J['sternum_back'][1] - 0.02 - 0.0212
    src.append(sb); dst.append(np.array([J['elbow'][0] + (sb[0] - el[0]), depth])); names.append('brisket')
    # head and neck: placeholders to carry the neck (Tafel 1's head is raised; the head will come from the wolf skull)
    src.append(to_wh((765 - 31, 450))); dst.append(J['occiput']); names.append('occiput (placeholder)')
    src.append(to_wh((195 - 31, 570))); dst.append(J['nose']); names.append('nose (placeholder)')
    src, dst = np.array(src), np.array(dst)
    f = RBFInterpolator(src, dst - src, kernel='thin_plate_spline', smoothing=0.0)
    whole = mask_poly(silhouette_mask())
    pj = {k: np.array(v, float) for k, v in PLATE_JOINTS.items()}
    from shapely.geometry import LineString, box
    from shapely.ops import unary_union
    # near legs: a corridor around each near leg's bones (the far legs stand clear of it below the elbow and stifle); body: everything above the cuts
    def corridor(chain, r): return LineString([pj[c] for c in chain]).buffer(r, cap_style='round')
    fore_c = corridor(['elbow', 'carpus', 'front_mcp', 'front_toe'], 85).union(Point(pj['front_mcp']).buffer(120))
    hind_c = corridor(['stifle', 'hock', 'hind_mtp', 'hind_toe'], 95).union(Point(pj['hind_mtp']).buffer(120))
    cut_f, cut_h = pj['elbow'][1] - 40, pj['stifle'][1] - 40                       # the legs overlap the body by 40 px so the layers join
    xmin, ymin, xmax, ymax = whole.bounds
    split_x = (pj['elbow'][0] + pj['hip'][0]) / 2
    lower = unary_union([box(xmin - 10, cut_f, split_x, ymax + 10), box(split_x, cut_h, xmax + 10, ymax + 10)])
    body = whole.difference(lower.difference(box(xmin, ymin, xmax, ymax).difference(box(0, 0, 1, 1))) ).buffer(0)
    body = whole.difference(lower).buffer(0)
    ground_y = skin['withers']['outline_px_plate'][1] + 1837
    no_shadow = lambda g, a, b: g.difference(box(xmin - 10, ground_y - 22, a, ymax + 10)).difference(box(b, ground_y - 22, xmax + 10, ymax + 10))
    foreleg = no_shadow(whole.intersection(fore_c).intersection(box(xmin, cut_f - 40, xmax, ymax)), pj['front_toe'][0] - 15, pj['front_mcp'][0] + 70)
    hindleg = no_shadow(whole.intersection(hind_c).intersection(box(xmin, cut_h - 40, xmax, ymax)), pj['hind_toe'][0] - 15, pj['hind_mtp'][0] + 70)
    big = lambda g: max(g.geoms, key=lambda q: q.area) if g.geom_type == 'MultiPolygon' else g
    body, foreleg, hindleg = big(body), big(foreleg), big(hindleg)
    # body: thin-plate spline on the landmarks; legs: each bone's own map, blended near the joints (linear blend skinning)
    def tps_map(g): P = np.array([to_wh(q) for q in shapely.segmentize(g, 6).exterior.coords]); return Polygon(P + f(P)).buffer(0), P
    def along(p1, p2, q1, q2):
        u = (p2 - p1) / np.linalg.norm(p2 - p1); v = (q2 - q1) / np.linalg.norm(q2 - q1); k = np.linalg.norm(q2 - q1) / np.linalg.norm(p2 - p1)
        nu, nv = np.array([-u[1], u[0]]), np.array([-v[1], v[0]])
        return lambda P: q1 + np.outer((P - p1) @ u * k, v) + np.outer((P - p1) @ nu, nv)
    def lbs_map(g, chain, top):
        P = np.array([to_wh(q) for q in shapely.segmentize(g, 6).exterior.coords]); A = [to_wh(pj[c]) if c in pj else None for c in chain]
        segs = [(A[i], A[i + 1], J[chain[i]], J[chain[i + 1]]) for i in range(len(chain) - 1)]
        Ts = [along(*sg) for sg in segs]; D = []
        for a_, b_, _, _ in segs:
            t = np.clip(((P - a_) @ (b_ - a_)) / ((b_ - a_) @ (b_ - a_)), 0, 1); D.append(np.linalg.norm(P - (a_ + t[:, None] * (b_ - a_)), axis=1))
        D = np.array(D); w = 1 / (D ** 4 + 1e-6); w /= w.sum(0)
        Q = sum(w[i][:, None] * Ts[i](P) for i in range(len(Ts)))
        top_body = f(P)[:, :] + P                           # near the top cut, blend into the body's warp so the layers meet
        tb = np.clip((P[:, 1] - top) / 0.06, 0, 1)[:, None]; Q = tb * Q + (1 - tb) * top_body
        return Polygon(Q).buffer(0), P
    body_w, Pb = tps_map(body)
    fore_w, Pf = lbs_map(foreleg, ['elbow', 'carpus', 'front_mcp', 'front_toe'], to_wh(pj['elbow'])[1] - 0.03)
    hind_w, Ph = lbs_map(hindleg, ['stifle', 'hock', 'hind_mtp', 'hind_toe'], to_wh(pj['stifle'])[1] - 0.03)
    sm = lambda g: big(g.buffer(0.006).buffer(-0.006))
    layers = {'BODY': sm(body_w), 'FORELEG': sm(fore_w), 'HINDLEG': sm(hind_w)}
    out_poly = layers['BODY'].union(layers['FORELEG']).union(layers['HINDLEG'])
    P = np.vstack([Pb, Pf, Ph])
    # bending energy (the TPS's own measure of how far the template had to be bent), and the skin-landmark check
    checks = []
    dirs = {'up': (0, -1), 'down': (0, 1), 'forward': (1, 0), 'back': (-1, 0)}
    for n, l in skin.items():
        b = to_wh(l['bone_px_plate']); tgt = b + f(b[None])[0] + np.array(dirs[l['offset_direction']]) * l['offset_over_withers_height']
        if n in ('skull_top', 'occiput', 'nose', 'chin'): continue
        lay = layers['FORELEG'] if n.startswith('carpus') else layers['HINDLEG'] if n.startswith('hock') else layers['BODY']
        d = lay.exterior.distance(Point(tgt)); out_poly_ = lay; checks.append({'landmark': n, 'miss_wh': round(float(d), 4), 'target_wh': tgt.round(4).tolist(), 'target_is': 'inside' if out_poly_.contains(Point(tgt)) else 'outside'})
    return {'id': sid, 'method': 'template warp (Ellenberger Tafel 1 silhouette, Tafel 3 landmarks, thin-plate spline)',
            'layers_wh': {k: [[round(q[0], 4), round(q[1], 4)] for q in v.exterior.coords] for k, v in layers.items()},
            'plate_layers_wh': {'BODY': [to_wh(q).round(4).tolist() for q in body.exterior.coords], 'FORELEG': [to_wh(q).round(4).tolist() for q in foreleg.exterior.coords], 'HINDLEG': [to_wh(q).round(4).tolist() for q in hindleg.exterior.coords]},
            'pairs': [{'name': n, 'plate_wh': s.round(4).tolist(), 'species_wh': d.round(4).tolist()} for n, s, d in zip(names, src, dst)],
            'skin_checks': checks}, J

def render(sid, out, J, S=800):
    ox, oy = 1.5, 0.45; T = lambda q: f'{(q[0] + ox) * S:.1f},{(q[1] + oy) * S:.1f}'
    sk = json.load(open(BUILD / f'{sid}.skeleton.json'))
    W, H = int(4.2 * S), int(1.75 * S) + 60
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}"><rect width="100%" height="100%" fill="#efe6d2"/>']
    for k, dx in (('plate', 0), ('wolf', 2.1)):
        o.append(f'<line x1="{(dx) * S}" y1="{(1 + oy) * S}" x2="{(dx + 2.1) * S}" y2="{(1 + oy) * S}" stroke="#7a6a50" stroke-width="3"/>')
    cols = {'HINDLEG': '#b08a5c', 'BODY': '#c9a272', 'FORELEG': '#bb9363'}
    for k in ('HINDLEG', 'BODY', 'FORELEG'): o.append('<polygon points="' + ' '.join(T(q) for q in out['plate_layers_wh'][k]) + f'" fill="{cols[k]}" fill-opacity="0.85" stroke="#3b2a1a" stroke-width="2"/>')
    for p in out['pairs']: o.append(f'<circle cx="{(p["plate_wh"][0] + ox) * S:.1f}" cy="{(p["plate_wh"][1] + oy) * S:.1f}" r="6" fill="#d9822b" stroke="#2a1a10"/>')
    T2 = lambda q: f'{(q[0] + ox + 2.1) * S:.1f},{(q[1] + oy) * S:.1f}'
    for k in ('HINDLEG', 'BODY', 'FORELEG'): o.append('<polygon points="' + ' '.join(T2(q) for q in out['layers_wh'][k]) + f'" fill="{cols[k]}" fill-opacity="0.85" stroke="#3b2a1a" stroke-width="2.5"/>')
    Jw = {k: np.array(v) for k, v in J.items()}
    for a, b in [('scapula_top', 'shoulder'), ('shoulder', 'elbow'), ('elbow', 'carpus'), ('carpus', 'front_mcp'), ('front_mcp', 'front_toe'), ('hip', 'stifle'), ('stifle', 'hock'), ('hock', 'hind_mtp'), ('hind_mtp', 'hind_toe'), ('ilium_crest', 'ischium'), ('neck_root', 'occiput'), ('occiput', 'stop'), ('stop', 'nose'), ('withers', 'croup')]:
        o.append(f'<line x1="{(Jw[a][0] + ox + 2.1) * S:.1f}" y1="{(Jw[a][1] + oy) * S:.1f}" x2="{(Jw[b][0] + ox + 2.1) * S:.1f}" y2="{(Jw[b][1] + oy) * S:.1f}" stroke="#4a3b2a" stroke-width="6" stroke-linecap="round"/>')
    for c in out['skin_checks']:
        t = c['target_wh']; col = '#1d7a3a' if c['miss_wh'] < 0.015 else '#c77d00' if c['miss_wh'] < 0.03 else '#b3261e'
        o.append(f'<circle cx="{(t[0] + ox + 2.1) * S:.1f}" cy="{(t[1] + oy) * S:.1f}" r="7" fill="{col}" stroke="#fff" stroke-width="2"/>')
    o.append(f'<text x="16" y="{H - 20}" font-family="sans-serif" font-size="22" font-weight="bold" fill="#2a1a10">left: the atlas dog (public domain) with its landmarks; right: warped onto the {sid} skeleton (dots: skin targets, green close / orange near / red off). Head is a placeholder.</text>')
    o.append('</svg>'); (BUILD / f'{sid}.template.svg').write_text('\n'.join(o))
    subprocess.run(['node', '-e', f"const {{Resvg}}=require('@resvg/resvg-js');const fs=require('fs');fs.writeFileSync('{BUILD}/{sid}.template.png',new Resvg(fs.readFileSync('{BUILD}/{sid}.template.svg','utf8')).render().asPng())"], cwd=ROOT, check=True)

def main(args):
    sid = args[0]; out, J = build(sid); (BUILD / f'{sid}.template.json').write_text(json.dumps(out)); render(sid, out, J)
    print(f'wrote species/build/{sid}.template.json, .svg, .png')
    for c in out['skin_checks']: print(f'  {c["landmark"]:<20} miss {c["miss_wh"]:.3f} ({c["target_is"]})')
    print(f'  mean miss {np.mean([c["miss_wh"] for c in out["skin_checks"]]):.3f}')
    return 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
