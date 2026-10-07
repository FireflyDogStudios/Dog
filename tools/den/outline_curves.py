#!/usr/bin/env python3
"""den outline <id> --curves: the clean outline, as an artist builds it (step 3b of the species creator).

   1. Start from the template warp (species/build/<id>.template.json: the public-domain atlas dog moved onto the skeleton).
   2. PINS: surface landmarks placed by the data, each at its bone position plus its measured skin offset (Ellenberger-Baum): withers, point of shoulder,
      sternum, brisket, elbow, croup, ischium, stifle (body); carpus front and back (foreleg); hock top and back (hind leg). The traced line is pulled
      onto each pin with a local, smooth correction, so the pins are exact.
   3. CURVES: between pins, cubic Beziers fitted to the traced line (Schneider 1990, Graphics Gems: least-squares fit with fixed ends and tangents,
      split where the error exceeds the tolerance). Tangents are continuous through every pin. The result is a few dozen clean curves, not pixels.
   4. HEAD: the real wolf skull (ref/research/missingfound/wolf-skull, specimen 170753, CC BY 4.0, MRI PAS) placed by nose tip and jaw hinge, with a
      thin skin offset; the template's placeholder head is cut away at the neck. Ears come later.
   Output: species/build/<id>.curves.json (SVG path data per layer, in withers-height units and drawing units) and .svg/.png (big, flat background)."""
import sys, json, pathlib, subprocess, math
import numpy as np
from shapely.geometry import Polygon, Point, LineString, box
from shapely.ops import unary_union
import shapely
ROOT = pathlib.Path(__file__).resolve().parents[2]; BUILD = ROOT / 'species/build'
SKULL = ROOT / 'ref/research/missingfound/wolf-skull/data.json'
TOL = 0.004          # curve-fit tolerance, withers-height units (about 3 mm on a wolf)
PIN_LAYER = {'withers': 'BODY', 'point_of_shoulder': 'BODY', 'sternum_manubrium': 'BODY', 'brisket': 'BODY', 'elbow_olecranon': 'BODY',
             'croup': 'BODY', 'ischium': 'BODY', 'stifle_patella': 'BODY', 'carpus_caudal': 'FORELEG', 'carpus_cranial': 'FORELEG',
             'hock_caudal': 'HINDLEG', 'hock_top': 'HINDLEG'}
HEAD_SKIN = 0.012    # skin over the skull, withers-height units (Ellenberger: skull top 0.017, occiput 0.008, chin 0.012)

# ---------- curve fitting (Schneider 1990) ----------
def bez(c, t):
    t = np.asarray(t)[:, None]; return (1 - t) ** 3 * c[0] + 3 * (1 - t) ** 2 * t * c[1] + 3 * (1 - t) * t ** 2 * c[2] + t ** 3 * c[3]
def bez_d(c, t, k=1):
    t = np.asarray(t)[:, None]
    if k == 1: return 3 * (1 - t) ** 2 * (c[1] - c[0]) + 6 * (1 - t) * t * (c[2] - c[1]) + 3 * t ** 2 * (c[3] - c[2])
    return 6 * (1 - t) * (c[2] - 2 * c[1] + c[0]) + 6 * t * (c[3] - 2 * c[2] + c[1])
def fit_one(P, u, t0, t1):
    A1, A2 = np.outer(3 * (1 - u) ** 2 * u, t0), np.outer(3 * (1 - u) * u ** 2, t1)
    base = np.outer((1 - u) ** 3 + 3 * (1 - u) ** 2 * u, P[0]) + np.outer(3 * (1 - u) * u ** 2 + u ** 3, P[-1])
    C = np.array([[np.sum(A1 * A1), np.sum(A1 * A2)], [np.sum(A1 * A2), np.sum(A2 * A2)]]); X = np.array([np.sum(A1 * (P - base)), np.sum(A2 * (P - base))])
    d = np.linalg.norm(P[-1] - P[0])
    try: a1, a2 = np.linalg.solve(C, X)
    except np.linalg.LinAlgError: a1 = a2 = d / 3
    if a1 < 1e-3 * d or a2 < 1e-3 * d: a1 = a2 = d / 3
    return np.array([P[0], P[0] + a1 * t0, P[-1] + a2 * t1, P[-1]])
def fit(P, t0, t1, tol):
    if len(P) < 4: d = np.linalg.norm(P[-1] - P[0]) / 3; return [np.array([P[0], P[0] + d * t0, P[-1] + d * t1, P[-1]])]
    u = np.r_[0, np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))]; u /= u[-1]
    for _ in range(4):
        c = fit_one(P, u, t0, t1); q, q1, q2 = bez(c, u) - P, bez_d(c, u), bez_d(c, u, 2)
        u = np.clip(u - np.sum(q * q1, 1) / (np.sum(q1 * q1, 1) + np.sum(q * q2, 1) + 1e-12), 0, 1); u[0], u[-1] = 0, 1
    err = np.linalg.norm(bez(c, u) - P, axis=1)
    if err.max() <= tol: return [c]
    k = int(np.clip(np.argmax(err), 2, len(P) - 3)); tc = P[k - 1] - P[k + 1]; tc /= np.linalg.norm(tc)
    return fit(P[:k + 1], t0, tc, tol) + fit(P[k:], -tc, t1, tol)

def resample(ring, step=0.003, sigma=2.5):
    """closed ring -> evenly spaced points, lightly smoothed along the line (removes pixel jiggle, keeps the shape)"""
    L = LineString(ring); n = max(40, int(L.length / step)); P = np.array([L.interpolate(i / n, normalized=True).coords[0] for i in range(n)])
    from scipy.ndimage import gaussian_filter1d
    return np.c_[gaussian_filter1d(P[:, 0], sigma, mode='wrap'), gaussian_filter1d(P[:, 1], sigma, mode='wrap')]

def pin_and_fit(P, pins, tol=TOL):
    """pull the ring onto the pins (local Gaussian correction along the ring), then fit Beziers pin to pin"""
    n = len(P); idx = []
    for name, tgt in pins:
        i = int(np.argmin(np.linalg.norm(P - tgt, axis=1))); idx.append((i, name, tgt))
    idx.sort(); D = np.zeros_like(P); arc = np.r_[0, np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))]; Lt = arc[-1] + np.linalg.norm(P[0] - P[-1])
    for i, _, tgt in idx:
        d = np.abs(arc - arc[i]); d = np.minimum(d, Lt - d); w = np.exp(-(d / 0.04) ** 2)[:, None]; D += w * (tgt - P[i])
    Q = P + D
    if not idx: idx = [(0, 'start', Q[0])]
    def tangent(i): t = Q[(i + 3) % n] - Q[(i - 3) % n]; return t / np.linalg.norm(t)
    curves = []; I = [i for i, _, _ in idx]
    for a, b in zip(I, I[1:] + [I[0] + n]):
        seg = np.array([Q[k % n] for k in range(a, b + 1)])
        if len(seg) < 2: continue
        curves += fit(seg, tangent(a), -tangent(b % n), tol)
    return curves, [(name, Q[i].tolist()) for i, name, _ in idx]

def path_d(curves, M=lambda q: q):
    c0 = M(curves[0][0]); s = f'M{c0[0]:.3f} {c0[1]:.3f}'
    for c in curves: a, b, e = M(c[1]), M(c[2]), M(c[3]); s += f' C{a[0]:.3f} {a[1]:.3f} {b[0]:.3f} {b[1]:.3f} {e[0]:.3f} {e[1]:.3f}'
    return s + ' Z'

# ---------- the head from the real wolf skull ----------
def skull_head(J):
    w = json.load(open(SKULL))['wolves']['170753']; o = w['outlines']['head_closed_side']['cbl']; L = w['landmarks_side_2d']
    get = lambda k: np.array(L[k]['cbl'] if isinstance(L[k], dict) else L[k], float)
    a, b = np.zeros(2), get('akrokranion_inion'); A, B = J['nose'], J['occiput']     # similarity: nose tip (prosthion) and back of the skull (akrokranion) onto the skeleton's
    v1, v2 = b - a, B - A; s = np.linalg.norm(v2) / np.linalg.norm(v1); ang = math.atan2(v2[1], v2[0]) - math.atan2(v1[1], v1[0])
    R = np.array([[math.cos(ang), -math.sin(ang)], [math.sin(ang), math.cos(ang)]])
    T = lambda P: (np.asarray(P) - a) @ R.T * s + A
    rings = o if isinstance(o[0][0], list) else [o]
    g = unary_union([Polygon(T(r)).buffer(0) for r in rings])
    return g.buffer(HEAD_SKIN).buffer(0.004).buffer(-0.004), {k: T(get(k)).tolist() for k in ('orbit_centre_EST', 'nasion_EST', 'tmj_hinge_centre', 'coronoid_tip_right') if k in L}

def build(sid):
    tp = json.load(open(BUILD / f'{sid}.template.json')); sk = json.load(open(BUILD / f'{sid}.skeleton.json'))
    J0 = sk['joints_mm']; W = J0['withers']; H = W[1]; J = {k: np.array([(v[0] - W[0]) / H, (H - v[1]) / H]) for k, v in J0.items()}
    layers = {k: Polygon(v).buffer(0) for k, v in tp['layers_wh'].items()}
    # paw shadows: clip each leg near the ground to the paw's own length (heel to toe tip)
    for k, toe, heel in (('FORELEG', 'front_toe', 'front_mcp'), ('HINDLEG', 'hind_toe', 'hind_mtp')):
        g = layers[k]; x0, x1 = J[heel][0] - 0.06, J[toe][0] + 0.012
        g = g.difference(box(-9, 0.955, x0, 2)).difference(box(x1, 0.955, 9, 2)).intersection(box(-9, -9, 9, 1.002))
        layers[k] = max(g.geoms, key=lambda q: q.area) if g.geom_type == 'MultiPolygon' else g
    # the head: cut the template's placeholder head away at the neck, add the wolf skull's
    # stubs: the tops of the legs (near and far) left under the belly by the cut; a morphological opening removes anything leg-narrow. The tail is narrow
    # too, so it is kept aside as its own layer first.
    tailzone = Point(J['croup']).buffer(0.02).union(LineString([J['croup'], J['tail_tip']]).buffer(0.12))
    opened = layers['BODY'].buffer(-0.045).buffer(0.045)
    rest = layers['BODY'].difference(opened)
    tail = [g for g in getattr(rest, 'geoms', [rest]) if g.intersects(tailzone) and g.area > 1e-4]
    layers['BODY'] = max(opened.geoms, key=lambda q: q.area) if opened.geom_type == 'MultiPolygon' else opened
    if tail: layers['TAIL'] = max(tail, key=lambda q: q.area).buffer(0.006).buffer(-0.006)
    head, face = skull_head(J)
    nd = J['occiput'] - J['neck_root']; nd /= np.linalg.norm(nd); nrm = np.array([-nd[1], nd[0]]); c = J['occiput'] - nd * 0.05
    cut = Polygon([c + nrm * 2, c + nrm * 2 + nd * 3, c - nrm * 2 + nd * 3, c - nrm * 2])
    body = layers['BODY'].difference(cut).buffer(0); body = max(body.geoms, key=lambda q: q.area) if body.geom_type == 'MultiPolygon' else body
    layers['BODY'] = body.union(head.intersection(cut.buffer(0.08))).buffer(0.05).buffer(-0.05)   # the neck reaches into the back of the head, blended (closing)
    layers['BODY'] = max(layers['BODY'].geoms, key=lambda q: q.area) if layers['BODY'].geom_type == 'MultiPolygon' else layers['BODY']
    layers['HEAD'] = head
    targets = {c['landmark']: np.array(c['target_wh']) for c in tp['skin_checks']}
    out = {'id': sid, 'units': 'wh: withers heights, withers bone top at 0,0, y down, ground at y = 1', 'layers': {}, 'face': face}
    s = sk['scale_units_per_mm'] * H; X0, Y0 = sk['joints']['withers']; M = lambda q: (X0 + q[0] * s, Y0 + q[1] * s)
    for k in [x for x in ('TAIL', 'BODY', 'FORELEG', 'HINDLEG', 'HEAD') if x in layers]:
        pins = [(n, targets[n]) for n, L in PIN_LAYER.items() if L == k and n in targets]
        P = resample(list(layers[k].exterior.coords)[:-1]); curves, placed = pin_and_fit(P, pins, TOL if k != 'HEAD' else 0.003)
        out['layers'][k] = {'d_wh': path_d(curves), 'd_units': path_d(curves, M), 'segments': len(curves), 'pins': placed}
    return out, J

def render(sid, out, J, S=900):
    ox, oy = 1.35, 0.45; W, Hh = int(2.6 * S), int(1.6 * S)
    tr = f'translate({ox * S},{oy * S}) scale({S})'
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W * 2}" height="{Hh + 60}"><rect width="100%" height="100%" fill="#efe6d2"/>']
    for panel in (0, 1):
        g = f'<g transform="translate({panel * W},0) {tr}">'
        g += f'<line x1="-2" y1="1" x2="2" y2="1" stroke="#7a6a50" stroke-width="{3 / S}"/>'
        cols = {'TAIL': '#b58856', 'HINDLEG': '#a9804f', 'BODY': '#c99b66', 'FORELEG': '#b58856', 'HEAD': '#c99b66'}
        for k in [x for x in ('TAIL', 'HINDLEG', 'BODY', 'FORELEG', 'HEAD') if x in out['layers']]:
            g += f'<path d="{out["layers"][k]["d_wh"]}" fill="{cols[k]}" stroke="#2a1a10" stroke-width="{2.5 / S}" stroke-linejoin="round"/>'
        if panel == 0:
            for a, b in [('scapula_top', 'shoulder'), ('shoulder', 'elbow'), ('elbow', 'carpus'), ('carpus', 'front_mcp'), ('front_mcp', 'front_toe'), ('hip', 'stifle'), ('stifle', 'hock'), ('hock', 'hind_mtp'), ('hind_mtp', 'hind_toe'), ('ilium_crest', 'ischium'), ('neck_root', 'occiput'), ('withers', 'croup')]:
                g += f'<line x1="{J[a][0]:.4f}" y1="{J[a][1]:.4f}" x2="{J[b][0]:.4f}" y2="{J[b][1]:.4f}" stroke="#4a3b2a" stroke-opacity="0.55" stroke-width="{5 / S}" stroke-linecap="round"/>'
            for k, L in out['layers'].items():
                for n, p in L['pins']: g += f'<circle cx="{p[0]:.4f}" cy="{p[1]:.4f}" r="{6 / S}" fill="#1d7a3a" stroke="#fff" stroke-width="{1.5 / S}"/>'
            for n, p in out['face'].items():
                if 'orbit' in n: g += f'<circle cx="{p[0]:.4f}" cy="{p[1]:.4f}" r="{6 / S}" fill="#2a1a10"/>'
        o.append(g + '</g>')
    segs = sum(L['segments'] for L in out['layers'].values())
    o.append(f'<text x="16" y="{Hh + 35}" font-family="sans-serif" font-size="22" font-weight="bold" fill="#2a1a10">{sid} outline: pinned landmarks (green, bone + measured skin offset) and {segs} smooth curves. Left with the skeleton; right clean. Head from a real wolf skull (CC BY 4.0, MRI PAS); ears, fur and far legs not yet.</text>')
    o.append('</svg>'); (BUILD / f'{sid}.curves.svg').write_text('\n'.join(o))
    subprocess.run(['node', '-e', f"const {{Resvg}}=require('@resvg/resvg-js');const fs=require('fs');fs.writeFileSync('{BUILD}/{sid}.curves.png',new Resvg(fs.readFileSync('{BUILD}/{sid}.curves.svg','utf8')).render().asPng())"], cwd=ROOT, check=True)

def main(args):
    sid = args[0]; out, J = build(sid); (BUILD / f'{sid}.curves.json').write_text(json.dumps(out, indent=1)); render(sid, out, J)
    print(f'wrote species/build/{sid}.curves.json, .svg, .png')
    for k, L in out['layers'].items(): print(f'  {k:8} {L["segments"]:3} curves, {len(L["pins"])} pins')
    return 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
