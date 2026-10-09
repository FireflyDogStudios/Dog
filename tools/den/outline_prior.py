#!/usr/bin/env python3
"""EXPERIMENT, FAILED AS A GENERATOR (Oct 7): the consensus smears into a blob (only ~48 dogs pass; poses, head turns and leg spreads vary; StanfordExtra
   outlines are coarse polygons; no topline keypoints). Kept as a basis for a CHECK (distance to real dogs), not for drawing.
   den outline <id> --prior [--breeds a,b,c]: the CONSENSUS silhouette of many real photographed dogs, warped onto the species skeleton.

   Data: StanfordExtra v12 (MIT; ref/research/fetched/02-outline-landmarks): real fur-on outlines with 20 keypoints each. For every single-dog,
   profile-view photo of the chosen breeds with all keypoints present, a thin-plate spline maps its keypoints onto the skeleton's matching points
   (nose and chin with their skin offsets, ear base and tip, tail base and tip, elbow, carpus, front paw, stifle, hock, hind paw; left and right legs
   averaged), and its outline is warped with it. The warped outlines are rasterised and voted: the consensus is where at least half of them agree.
   Output: species/build/<id>.prior.json (consensus outline as Bezier path data, per-dog warped outlines) and .svg/.png.
   Keypoint meanings (StanfordExtra): front top = elbow, front middle = carpus, rear top = stifle, rear middle = hock (see 02-outline-landmarks/NOTE.md)."""
import sys, json, pathlib, subprocess
import numpy as np
from scipy.interpolate import RBFInterpolator
from shapely.geometry import Polygon
from skimage import draw, measure
ROOT = pathlib.Path(__file__).resolve().parents[2]; BUILD = ROOT / 'species/build'
SE = ROOT / 'ref/research/fetched/02-outline-landmarks/data.json'
sys.path.insert(0, str(pathlib.Path(__file__).parent)); import outline_curves as OC
DEFAULT = {'wolf': ['Siberian_husky', 'malamute', 'Eskimo_dog', 'Norwegian_elkhound', 'dhole', 'German_shepherd'],
           'dingo': ['dingo', 'basenji', 'kelpie'], 'carolina': ['dingo', 'basenji', 'kelpie']}
RES = 0.003; X0, X1, Y0, Y1 = -1.7, 1.0, -0.7, 1.08

def targets(J):
    g = lambda a, b, t=0.5: J[a] + (J[b] - J[a]) * t
    return {'nose': J['nose'] + np.array([0.0297, 0]), 'chin': J['chin'] + np.array([0, 0.0117]), 'ear_base': J['ear_base'], 'ear_tip': J['ear_tip'],
            'tail_base': J['sacrum_end'], 'tail_end': J['tail_tip'], 'front_top': J['elbow'], 'front_middle': J['carpus'],
            'front_paw': np.array([g('front_mcp', 'front_toe')[0], 0.985]), 'rear_top': J['stifle'], 'rear_middle': J['hock'],
            'rear_paw': np.array([g('hind_mtp', 'hind_toe')[0], 0.985])}

def dog_pairs(r):
    k = r['kp']; P = {}
    for n in ('nose', 'chin', 'tail_base', 'tail_end'):
        if n in k: P[n] = np.array(k[n][:2], float)
    for n in ('ear_base', 'ear_tip'):
        v = [np.array(k[f'{s}_{n}'][:2], float) for s in ('left', 'right') if f'{s}_{n}' in k]
        if v: P[n] = np.mean(v, 0)
    for leg in ('front', 'rear'):
        for part in ('top', 'middle', 'paw'):
            v = [np.array(k[f'{s}_{leg}_{part}'][:2], float) for s in ('left', 'right') if f'{s}_{leg}_{part}' in k]
            if len(v) == 2: P[f'{leg}_{part}'] = np.mean(v, 0)
    return P

def build(sid, breeds):
    sk = json.load(open(BUILD / f'{sid}.skeleton.json')); J0 = sk['joints_mm']; W = J0['withers']; H = W[1]
    J = {k: np.array([(v[0] - W[0]) / H, (H - v[1]) / H]) for k, v in J0.items()}
    T = targets(J); data = json.load(open(SE)); used = []
    nx, ny = int((X1 - X0) / RES), int((Y1 - Y0) / RES); votes = np.zeros((ny, nx), np.float32)
    for br in breeds:
        for r in data.get(br, []):
            if r.get('multi') or 'outline' not in r: continue
            P = dog_pairs(r); need = ['nose', 'chin', 'tail_base', 'front_top', 'front_middle', 'front_paw', 'rear_top', 'rear_middle', 'rear_paw']
            if not all(n in P for n in need): continue
            if abs(P['nose'][0] - P['tail_base'][0]) < 2.2 * abs(P['nose'][1] - P['tail_base'][1]): continue       # profile views only
            if 'tail_end' in P and P['tail_end'][1] < P['tail_base'][1]: P.pop('tail_end')                       # curled-up tails: do not pin
            names = [n for n in T if n in P]; src = np.array([P[n] for n in names]); dst = np.array([T[n] for n in names])
            if P['nose'][0] < P['tail_base'][0]: src[:, 0] = -src[:, 0]                                            # face right
            ring = max(r['outline'], key=len); R = np.array(ring, float)
            if R.ndim != 2 or len(R) < 8: continue
            if P['nose'][0] < P['tail_base'][0]: R[:, 0] = -R[:, 0]
            # a similarity first (scale by the elbow-to-hind-paw span) keeps the spline well conditioned, then the thin-plate spline
            s = np.linalg.norm(dst[names.index('front_top')] - dst[names.index('rear_paw')]) / np.linalg.norm(src[names.index('front_top')] - src[names.index('rear_paw')])
            c0 = src.mean(0); srcn = (src - c0) * s; Rn = (R - c0) * s
            f = RBFInterpolator(srcn, dst - srcn, kernel='thin_plate_spline', smoothing=1e-4)
            Q = Rn + f(Rn)
            if not np.all(np.isfinite(Q)): continue
            poly = Polygon(Q).buffer(0)
            if poly.is_empty or not (0.25 < poly.area < 2.0): continue
            g = poly if poly.geom_type == 'Polygon' else max(poly.geoms, key=lambda q: q.area)
            rr, cc = draw.polygon((np.array(g.exterior.coords)[:, 1] - Y0) / RES, (np.array(g.exterior.coords)[:, 0] - X0) / RES, votes.shape)
            m = np.zeros_like(votes); m[rr, cc] = 1; votes += m; used.append({'breed': br, 'img': r['img'], 'outline_wh': np.round(np.array(g.exterior.coords)[::3], 4).tolist()})
    frac = votes / max(1, len(used))
    cons = max(measure.find_contours(frac, 0.5), key=len); C = np.c_[cons[:, 1] * RES + X0, cons[:, 0] * RES + Y0]
    Pc = OC.resample(C, 0.004, 2.0); curves, _ = OC.pin_and_fit(Pc, [], 0.004)
    return {'id': sid, 'breeds': breeds, 'n_dogs': len(used), 'consensus_d_wh': OC.path_d(curves), 'segments': len(curves),
            'dogs': used, 'note': 'consensus = pixels inside at least half the warped outlines'}, J, frac

def render(sid, out, J, frac, S=900):
    ox, oy = 1.55, 0.6; W, Hh = int(2.6 * S), int(1.8 * S)
    tr = f'translate({ox * S},{oy * S}) scale({S})'
    ana = json.load(open(BUILD / f'{sid}.curves.json')) if (BUILD / f'{sid}.curves.json').exists() else None
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W * 2}" height="{Hh + 60}"><rect width="100%" height="100%" fill="#efe6d2"/>']
    g = f'<g transform="{tr}"><line x1="-2" y1="1" x2="2" y2="1" stroke="#7a6a50" stroke-width="{3 / S}"/>'
    for d in out['dogs']: g += '<polyline points="' + ' '.join(f'{x:.3f},{y:.3f}' for x, y in d['outline_wh']) + f'" fill="none" stroke="#5a4a3a" stroke-opacity="0.12" stroke-width="{1.5 / S}"/>'
    g += f'<path d="{out["consensus_d_wh"]}" fill="#a0917b" fill-opacity="0.55" stroke="#2a1a10" stroke-width="{3 / S}"/>'
    for a, b in [('scapula_top', 'shoulder'), ('shoulder', 'elbow'), ('elbow', 'carpus'), ('carpus', 'front_mcp'), ('front_mcp', 'front_toe'), ('hip', 'stifle'), ('stifle', 'hock'), ('hock', 'hind_mtp'), ('hind_mtp', 'hind_toe'), ('ilium_crest', 'ischium'), ('neck_root', 'occiput'), ('occiput', 'stop'), ('stop', 'nose'), ('withers', 'croup')]:
        g += f'<line x1="{J[a][0]:.4f}" y1="{J[a][1]:.4f}" x2="{J[b][0]:.4f}" y2="{J[b][1]:.4f}" stroke="#4a3b2a" stroke-opacity="0.6" stroke-width="{5 / S}" stroke-linecap="round"/>'
    o.append(g + '</g>')
    g = f'<g transform="translate({W},0) {tr}"><line x1="-2" y1="1" x2="2" y2="1" stroke="#7a6a50" stroke-width="{3 / S}"/>'
    g += f'<path d="{out["consensus_d_wh"]}" fill="#a0917b" stroke="#2a1a10" stroke-width="{2.5 / S}"/>'
    if ana:
        for k in ('BODY', 'HEAD', 'TAIL', 'FORELEG', 'HINDLEG'):
            if k in ana['layers']: g += f'<path d="{ana["layers"][k]["d_wh"]}" fill="none" stroke="#b3261e" stroke-opacity="0.8" stroke-width="{2 / S}" stroke-dasharray="{8 / S} {6 / S}"/>'
    o.append(g + '</g>')
    o.append(f'<text x="16" y="{Hh + 35}" font-family="sans-serif" font-size="22" font-weight="bold" fill="#2a1a10">{sid}: consensus of {out["n_dogs"]} real photographed dogs ({", ".join(out["breeds"])}; StanfordExtra, MIT) warped onto the skeleton. Left: every dog faint + skeleton. Right: consensus, with yesterday\'s outline dashed red.</text>')
    o.append('</svg>'); (BUILD / f'{sid}.prior.svg').write_text('\n'.join(o))
    subprocess.run(['node', '-e', f"const {{Resvg}}=require('@resvg/resvg-js');const fs=require('fs');fs.writeFileSync('{BUILD}/{sid}.prior.png',new Resvg(fs.readFileSync('{BUILD}/{sid}.prior.svg','utf8')).render().asPng())"], cwd=ROOT, check=True)

def main(args):
    sid = args[0]; br = args[args.index('--breeds') + 1].split(',') if '--breeds' in args else DEFAULT.get(sid, DEFAULT['wolf'])
    out, J, frac = build(sid, br); (BUILD / f'{sid}.prior.json').write_text(json.dumps(out)); render(sid, out, J, frac)
    print(f'wrote species/build/{sid}.prior.json, .svg, .png: {out["n_dogs"]} dogs, consensus in {out["segments"]} curves'); return 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
