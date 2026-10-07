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

def silhouette():
    a = np.asarray(Image.open(PLATES / 'tafel1_exterior_left-lateral.jpg').convert('L')).astype(float) / 255
    m = filters.gaussian(a, 3) < 0.80; m = morphology.closing(m, morphology.disk(9)); m = ndi.binary_fill_holes(m)
    lab = measure.label(m); big = lab == max(measure.regionprops(lab), key=lambda q: q.area).label
    c = max(measure.find_contours(big.astype(float), 0.5), key=len)            # (row, col)
    poly = Polygon(np.c_[c[:, 1] - 31, c[:, 0]]).buffer(0).simplify(1.5)     # into Tafel 3 pixels
    return poly

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
    poly = silhouette(); P = np.array([to_wh(q) for q in shapely.segmentize(poly, 6).exterior.coords])
    Q = P + f(P); out_poly = Polygon(Q).buffer(0)
    # bending energy (the TPS's own measure of how far the template had to be bent), and the skin-landmark check
    checks = []
    dirs = {'up': (0, -1), 'down': (0, 1), 'forward': (1, 0), 'back': (-1, 0)}
    for n, l in skin.items():
        b = to_wh(l['bone_px_plate']); tgt = b + f(b[None])[0] + np.array(dirs[l['offset_direction']]) * l['offset_over_withers_height']
        if n in ('skull_top', 'occiput', 'nose', 'chin'): continue
        d = out_poly.exterior.distance(Point(tgt)); checks.append({'landmark': n, 'miss_wh': round(float(d), 4), 'target_wh': tgt.round(4).tolist(), 'target_is': 'inside' if out_poly.contains(Point(tgt)) else 'outside'})
    return {'id': sid, 'method': 'template warp (Ellenberger Tafel 1 silhouette, Tafel 3 landmarks, thin-plate spline)',
            'outline_wh': [list(map(lambda q: [round(q[0], 4), round(q[1], 4)], out_poly.exterior.coords))],
            'pairs': [{'name': n, 'plate_wh': s.round(4).tolist(), 'species_wh': d.round(4).tolist()} for n, s, d in zip(names, src, dst)],
            'skin_checks': checks, 'plate_silhouette_wh': P.round(4).tolist()}, J

def render(sid, out, J, S=800):
    ox, oy = 1.5, 0.45; T = lambda q: f'{(q[0] + ox) * S:.1f},{(q[1] + oy) * S:.1f}'
    sk = json.load(open(BUILD / f'{sid}.skeleton.json'))
    W, H = int(4.2 * S), int(1.75 * S) + 60
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}"><rect width="100%" height="100%" fill="#efe6d2"/>']
    for k, dx in (('plate', 0), ('wolf', 2.1)):
        o.append(f'<line x1="{(dx) * S}" y1="{(1 + oy) * S}" x2="{(dx + 2.1) * S}" y2="{(1 + oy) * S}" stroke="#7a6a50" stroke-width="3"/>')
    pl = out['plate_silhouette_wh']; o.append('<polygon points="' + ' '.join(T(q) for q in pl) + '" fill="#c9b08a" stroke="#3b2a1a" stroke-width="2"/>')
    for p in out['pairs']: o.append(f'<circle cx="{(p["plate_wh"][0] + ox) * S:.1f}" cy="{(p["plate_wh"][1] + oy) * S:.1f}" r="6" fill="#d9822b" stroke="#2a1a10"/>')
    T2 = lambda q: f'{(q[0] + ox + 2.1) * S:.1f},{(q[1] + oy) * S:.1f}'
    o.append('<polygon points="' + ' '.join(T2(q) for q in out['outline_wh'][0]) + '" fill="#c99b66" stroke="#3b2a1a" stroke-width="2.5"/>')
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
