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
import shapely, shapely.affinity
ROOT = pathlib.Path(__file__).resolve().parents[2]; BUILD = ROOT / 'species/build'
SKULL = ROOT / 'ref/research/missingfound/wolf-skull/data.json'
TOL = 0.004          # curve-fit tolerance, withers-height units (about 3 mm on a wolf)
PIN_LAYER = {'withers': 'BODY', 'point_of_shoulder': 'BODY', 'sternum_manubrium': 'BODY', 'brisket': 'BODY', 'elbow_olecranon': 'BODY',
             'croup': 'BODY', 'ischium': 'BODY', 'stifle_patella': 'BODY', 'carpus_caudal': 'FORELEG', 'carpus_cranial': 'FORELEG',
             'hock_caudal': 'HINDLEG', 'hock_top': 'HINDLEG'}
SEX = 'male'
# estimates (withers-height units) until Scout's coat, tail and ear data arrive; the neck ruff is the one sourced value (guard hairs ~90 mm)
FUR = {'neck_ruff': 0.05, 'throat': 0.04, 'withers': 0.04, 'back': 0.026, 'croup': 0.024, 'rump': 0.03, 'thigh': 0.014, 'belly': 0.01, 'chest': 0.028,
       'floor': 0.006, 'head_top': 0.006, 'cheek_ruff': 0.024, 'muzzle': 0.002, 'legs': 0.006, 'ear': 0.004, 'tail_base': 0.03, 'tail_mid': 0.05, 'tail_tip': 0.032}   # a moderate (autumn) coat
A_TAIL = {'skin': (0.03, 0.009)}                    # bone + muscle half-width at the base and the tip
A_EAR = {'base_width': 0.62, 'far_offset': (0.012, 0.006)}   # base width x ear length (wolf ears are broad-based); the far ear peeks out ahead
A_FAR = {'fore': -0.045, 'hind': 0.045}             # far legs offset so all four read standing
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
    # leg-narrow pieces under the belly (far-leg tops) are removed by a morphological opening; the SHEATH (the atlas dog is male) is kept aside
    opened = layers['BODY'].buffer(-0.045).buffer(0.045); rest = layers['BODY'].difference(opened)
    big = lambda g: max(g.geoms, key=lambda q: q.area) if g.geom_type == 'MultiPolygon' else g
    sheath_zone = box(J['stifle'][0] + 0.04, J['elbow'][1] - 0.12, J['elbow'][0] - 0.2, J['elbow'][1] + 0.12)
    sheath = [g for g in getattr(rest, 'geoms', [rest]) if g.intersects(sheath_zone) and g.area > 2e-4 and g.centroid.y > 0.35]
    layers['BODY'] = big(opened)
    if sheath and SEX == 'male': layers['SHEATH'] = big(unary_union(sheath)).buffer(0.004).buffer(-0.004)
    # the head: cut the template's placeholder head away at the neck, add the wolf skull's
    head, face = skull_head(J)
    nd = J['occiput'] - J['neck_root']; nd /= np.linalg.norm(nd); nrm = np.array([-nd[1], nd[0]]); c = J['occiput'] - nd * 0.05
    cut = Polygon([c + nrm * 2, c + nrm * 2 + nd * 3, c - nrm * 2 + nd * 3, c - nrm * 2])
    body = big(layers['BODY'].difference(cut).buffer(0))
    layers['BODY'] = big(body.union(head.intersection(cut.buffer(0.08))).buffer(0.05).buffer(-0.05))   # the neck reaches into the back of the head (closing)
    layers['HEAD'] = head
    # the TAIL from the skeleton's tail line (wolf.yaml: 455 mm, 20 caudals, hanging ~75 deg below the topline): bone and muscle taper
    tl = np.array([[(x - sk['joints']['withers'][0]) / (sk['scale_units_per_mm'] * H), (y - sk['joints']['withers'][1]) / (sk['scale_units_per_mm'] * H)] for x, y in sk['tail']])
    tl = np.vstack([J['croup'] + (tl[0] - J['croup']) * 0.0 + np.array([0.01, 0.01]), tl])
    w0, w1 = A_TAIL['skin']; n = len(tl) - 1
    layers['TAIL'] = big(unary_union([LineString([tl[i], tl[i + 1]]).buffer(w0 + (w1 - w0) * i / n) for i in range(n)]).buffer(0.004).buffer(-0.004))
    # EARS (wolf.yaml: length 120 mm, set ~130 deg from the forward skull axis; base width and rounded tip are estimates)
    eb, et = J['ear_base'], J['ear_tip']; ax = et - eb; L = np.linalg.norm(ax); u = ax / L; pn = np.array([-u[1], u[0]])
    if (pn @ (J['nose'] - eb)) < 0: pn = -pn                                   # pn points toward the nose
    wb = A_EAR['base_width'] * L
    ear = [eb + pn * wb * 0.5, eb + pn * wb * 0.42 + u * L * 0.55, et + pn * wb * 0.06, et - pn * wb * 0.08, eb - pn * wb * 0.35 + u * L * 0.5, eb - pn * wb * 0.5]
    near_ear = Polygon(ear).buffer(0.01).buffer(-0.01)
    layers['EAR'] = near_ear; layers['EAR_FAR'] = shapely.affinity.translate(near_ear, *A_EAR['far_offset'])
    # FAR LEGS: the near legs, offset (a drawing choice so all four legs read in a standing pose)
    layers['FORELEG_FAR'] = shapely.affinity.translate(layers['FORELEG'], A_FAR['fore'], 0)
    layers['HINDLEG_FAR'] = shapely.affinity.translate(layers['HINDLEG'], A_FAR['hind'], 0)
    skin = dict(layers)
    # FUR: the coat grown off the skin, thickness blended between named anchors (withers-height units). Shoulder ruff from guard hairs ~90 mm
    # (Heptner & Naumov via the fact-check, Q13) standing off at ~60% of their length; every other value is an ESTIMATE until Scout's coat data lands.
    anchors = [(J['neck_root'] + (J['occiput'] - J['neck_root']) * 0.45 + nrm * 0.0, FUR['neck_ruff']), (J['withers'], FUR['withers']),
               ((J['withers'] + J['croup']) / 2, FUR['back']), (J['croup'], FUR['croup']), (J['ischium'], FUR['rump']),
               (np.array([J['stifle'][0] + 0.15, J['elbow'][1] - 0.02]), FUR['belly']), (np.array([J['elbow'][0] - 0.02, J['elbow'][1] + 0.02]), FUR['chest']),
               (J['shoulder'] + np.array([0.08, 0.0]), FUR['throat']), (J['stifle'], FUR['thigh'])]
    def grow(g, anchors, sigma=0.09, floor=0.0):
        P = resample(list(g.exterior.coords)[:-1], 0.004, 1.5); n = len(P)
        T = np.roll(P, -1, 0) - np.roll(P, 1, 0); N = np.c_[T[:, 1], -T[:, 0]]; N /= np.linalg.norm(N, axis=1)[:, None]
        test = P + N * 0.002; flip = np.array([g.contains(Point(q)) for q in test[::max(1, n // 50)]]).mean() > 0.5
        if flip: N = -N
        A = np.array([a for a, _ in anchors]); D = np.array([d for _, d in anchors])
        w = np.exp(-np.sum((P[:, None, :] - A[None]) ** 2, 2) / sigma ** 2); d = (w * D).sum(1) / (w.sum(1) + 1e-9)
        d = np.maximum(d, floor); return big(Polygon(P + N * d[:, None]).buffer(0)).buffer(0.008).buffer(-0.008).union(g)
    fur = {'BODY': grow(skin['BODY'], anchors, floor=FUR['floor']),
           'HEAD': grow(skin['HEAD'], [(J['occiput'], FUR['head_top']), (J['tmj'] + np.array([-0.03, 0.06]), FUR['cheek_ruff']), (J['nose'], FUR['muzzle']), (J['chin'], FUR['muzzle'])], sigma=0.07, floor=0.004),
           'TAIL': grow(skin['TAIL'], [(J['croup'], FUR['tail_base']), ((J['croup'] + J['tail_tip']) / 2, FUR['tail_mid']), (J['tail_tip'], FUR['tail_tip'])], sigma=0.12)}
    for k in ('FORELEG', 'HINDLEG', 'FORELEG_FAR', 'HINDLEG_FAR'): fur[k] = skin[k].buffer(FUR['legs']).buffer(0.004).buffer(-0.004)
    for k in ('EAR', 'EAR_FAR'): fur[k] = skin[k].buffer(FUR['ear'])
    if 'SHEATH' in skin: fur['SHEATH'] = skin['SHEATH'].buffer(FUR['legs'])
    targets = {c['landmark']: np.array(c['target_wh']) for c in tp['skin_checks']}
    out = {'id': sid, 'sex': SEX, 'units': 'wh: withers heights, withers bone top at 0,0, y down, ground at y = 1', 'layers': {}, 'skin': {}, 'face': face,
           'estimates': {'fur_wh': FUR, 'tail': A_TAIL, 'ear': A_EAR, 'far_legs_dx': A_FAR}}
    sc = sk['scale_units_per_mm'] * H; X0, Y0 = sk['joints']['withers']; M = lambda q: (X0 + q[0] * sc, Y0 + q[1] * sc)
    for k, g in fur.items():
        P = resample(list(g.exterior.coords)[:-1]); curves, _ = pin_and_fit(P, [], 0.004)
        out['layers'][k] = {'d_wh': path_d(curves), 'd_units': path_d(curves, M), 'segments': len(curves)}
    for k, g in skin.items():
        pins = [(nm, targets[nm]) for nm, L in PIN_LAYER.items() if L == k and nm in targets]
        P = resample(list(g.exterior.coords)[:-1]); curves, placed = pin_and_fit(P, pins, TOL if k != 'HEAD' else 0.003)
        out['skin'][k] = {'d_wh': path_d(curves), 'd_units': path_d(curves, M), 'segments': len(curves), 'pins': placed}
    return out, J

def render(sid, out, J, S=900):
    ox, oy = 1.4, 0.55; W, Hh = int(2.7 * S), int(1.7 * S)
    tr = f'translate({ox * S},{oy * S}) scale({S})'
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W * 2}" height="{Hh + 60}"><rect width="100%" height="100%" fill="#efe6d2"/>']
    # wolf coat (ref/research/fetched/10-coat-palettes, median of photos): back #918e72, flank #a0917b, belly #b8a58f, legs #c5ab8f, face #d0cfc5, muzzle top #bb997e
    col = {'TAIL': '#8f8a70', 'HINDLEG_FAR': '#857a66', 'FORELEG_FAR': '#857a66', 'EAR_FAR': '#7d7560', 'HINDLEG': '#b39c80', 'SHEATH': '#a8987f',
           'BODY': '#a0917b', 'FORELEG': '#c5ab8f', 'HEAD': '#a69780', 'EAR': '#918e72'}
    order = ['TAIL', 'HINDLEG_FAR', 'FORELEG_FAR', 'EAR_FAR', 'HINDLEG', 'SHEATH', 'BODY', 'FORELEG', 'HEAD', 'EAR']
    for panel in (0, 1):
        g = f'<g transform="translate({panel * W},0) {tr}">'
        g += f'<line x1="-2" y1="1" x2="2" y2="1" stroke="#7a6a50" stroke-width="{3 / S}"/>'
        for k in order:
            if k not in out['layers']: continue
            g += f'<path d="{out["layers"][k]["d_wh"]}" fill="{col[k]}" stroke="#2a1a10" stroke-width="{2.2 / S}" stroke-linejoin="round"/>'
        if panel == 0:
            for k in order:
                if k in out['skin']: g += f'<path d="{out["skin"][k]["d_wh"]}" fill="none" stroke="#2a1a10" stroke-opacity="0.45" stroke-width="{1.5 / S}" stroke-dasharray="{6 / S} {5 / S}"/>'
            for a, b in [('scapula_top', 'shoulder'), ('shoulder', 'elbow'), ('elbow', 'carpus'), ('carpus', 'front_mcp'), ('front_mcp', 'front_toe'), ('hip', 'stifle'), ('stifle', 'hock'), ('hock', 'hind_mtp'), ('hind_mtp', 'hind_toe'), ('ilium_crest', 'ischium'), ('neck_root', 'occiput'), ('withers', 'croup')]:
                g += f'<line x1="{J[a][0]:.4f}" y1="{J[a][1]:.4f}" x2="{J[b][0]:.4f}" y2="{J[b][1]:.4f}" stroke="#4a3b2a" stroke-opacity="0.5" stroke-width="{5 / S}" stroke-linecap="round"/>'
            for k, L in out['skin'].items():
                for n, p in L.get('pins', []): g += f'<circle cx="{p[0]:.4f}" cy="{p[1]:.4f}" r="{6 / S}" fill="#1d7a3a" stroke="#fff" stroke-width="{1.5 / S}"/>'
        for n, p in out['face'].items():
            if 'orbit' in n: g += f'<ellipse cx="{p[0]:.4f}" cy="{p[1]:.4f}" rx="{11 / S}" ry="{7 / S}" fill="#6c5744" stroke="#2a1a10" stroke-width="{1.5 / S}"/>'
        o.append(g + '</g>')
    o.append(f'<text x="16" y="{Hh + 35}" font-family="sans-serif" font-size="22" font-weight="bold" fill="#2a1a10">{sid} ({out["sex"]}): anatomy complete in plain colour. Left: fur over the skin (dashed), skeleton, pins. Right: clean. Fur, ear and tail widths are estimates until Scout data arrives; far legs offset by choice.</text>')
    o.append('</svg>'); (BUILD / f'{sid}.anatomy.svg').write_text('\n'.join(o))
    subprocess.run(['node', '-e', f"const {{Resvg}}=require('@resvg/resvg-js');const fs=require('fs');fs.writeFileSync('{BUILD}/{sid}.anatomy.png',new Resvg(fs.readFileSync('{BUILD}/{sid}.anatomy.svg','utf8')).render().asPng())"], cwd=ROOT, check=True)

def main(args):
    sid = args[0]; out, J = build(sid); (BUILD / f'{sid}.curves.json').write_text(json.dumps(out, indent=1)); render(sid, out, J)
    print(f'wrote species/build/{sid}.curves.json and {sid}.anatomy.svg/.png')
    for k, L in out['layers'].items(): print(f'  {k:12} {L["segments"]:3} curves')
    return 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
