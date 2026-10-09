#!/usr/bin/env python3
"""den outline <id>: grow a species' side-view outline over its skeleton (step 3 of the species creator).

   Input: species/build/<id>.skeleton.json (./den skeleton <id>), the Stark 2021 dog model's bone outlines and muscle lines
   (ref/research/fetched/03-dog-model, MIT), and the Ellenberger-Baum skin-over-bone offsets (ref/research/fetched/01-skin-offsets, public domain).
   Output: species/build/<id>.outline.json (layers as polygons, in withers-height units and in drawing units) and .svg/.png (big check render with
   the bones, the muscles, the skin-landmark targets and how far the outline misses each).

   Method:
   1. Bones: every near-side (left) bone outline of the REAL Beagle (the 2021 paper's forelimb-verified model; the Shepherd-sized model is the Beagle
      stretched x1.66 in the limbs but x1.25 in the trunk, which distorts the chest, so it only supplies the muscle lines, placed by its own landmarks) is moved onto the species skeleton. Limb bones by their two joint centres (stretched along the
      bone to the species' length, width kept in withers-height units); thorax, pelvis and skull by three landmarks each (affine).
   2. Muscles: every muscle line whose bodies are mapped is moved with its bodies and thickened by its cross-section: PCSA = max isometric force /
      specific tension (0.3 MPa, an assumption), drawn with the diameter of a circle of that area.
   3. Layers, so legs never web into the body (prior-art lesson): BODY (trunk, neck, head, scapula, humerus, femur, and every muscle on them: shoulder,
      upper arm, thigh), FORELEG (antebrachium, carpus, forepaw) and HINDLEG (crus, calx, hindpaw). Each layer is wrapped (concave hull), grown by the
      median skin offset and smoothed. The tail is our own tapered line (its silhouette is mostly fur; widths are estimates).
   4. Check: each Ellenberger landmark's skin target (bone landmark + its offset) is compared with the nearest outline point.
   Assumptions are named in ASSUME and listed in the output."""
import sys, json, csv, math, pathlib, subprocess
import numpy as np, yaml
from shapely.geometry import Polygon, MultiPolygon, LineString, Point
from shapely.ops import unary_union, nearest_points
import shapely
ROOT = pathlib.Path(__file__).resolve().parents[2]; BUILD = ROOT / 'species/build'
M = ROOT / 'ref/research/fetched/03-dog-model'; SKIN = ROOT / 'ref/research/fetched/01-skin-offsets/data.json'

ASSUME = {
  'specific_tension_MPa': (0.30, 'muscle force per cross-section area, to turn max isometric force into thickness (typical 0.25-0.3; estimate)'),
  'muscle_end':           (0.25, 'muscle thickness at its attachments, x its belly thickness (muscles taper into tendons and flat sheets; estimate)'),
  'hull_ratio':           (0.06, 'concave-hull tightness (0 tight, 1 convex); a drawing choice'),
  'smooth':               (0.012, 'outline smoothing radius, withers-height units (a drawing choice)'),
  'fur_chest':            (0.02, 'fur and skin below the sternum the photo chest depth includes, withers-height units (estimate; wolves have a belly ruff)'),
  'tail_width':           ((0.040, 0.014), 'tail half-width at base and tip, withers-height units (bone + muscle only; fur comes later; estimate)'),
}
A = {k: v[0] for k, v in ASSUME.items()}

def load_stark(model):
    lm = {}
    for r in csv.DictReader(open(M / 'stark_side_view.csv')):
        if r['model'] == model: lm[r['point']] = np.array([float(r['side_x_wh']), float(r['side_y_wh'])])
    bones = json.load(open(M / 'stark_bone_outlines.json'))[model]['wh']
    mus = {}
    for r in csv.DictReader(open(M / 'stark_muscles.csv')):
        if r['model'] != model: continue
        mus.setdefault(r['muscle'], {'F': float(r['max_isometric_force_N']), 'pts': []})['pts'].append((int(r['point_index']), r['body'], np.array([float(r['side_x_wh']), float(r['side_y_wh'])])))
    for m in mus.values(): m['pts'].sort(key=lambda t: t[0])
    return lm, bones, mus

def along(p1, p2, q1, q2):
    """affine taking segment p1-p2 to q1-q2: rotate, stretch along the bone by the length ratio, keep the cross width"""
    u = (p2 - p1) / np.linalg.norm(p2 - p1); v = (q2 - q1) / np.linalg.norm(q2 - q1); k = np.linalg.norm(q2 - q1) / np.linalg.norm(p2 - p1)
    nu, nv = np.array([-u[1], u[0]]), np.array([-v[1], v[0]])
    return lambda P: q1 + np.outer((P - p1) @ u * k, v) + np.outer((P - p1) @ nu, nv)

def affine3(P3, Q3):
    P = np.hstack([np.array(P3), np.ones((3, 1))]); T = np.linalg.solve(P, np.array(Q3))
    return lambda X: np.hstack([np.atleast_2d(X), np.ones((len(np.atleast_2d(X)), 1))]) @ T

def build(sid):
    sk = json.load(open(BUILD / f'{sid}.skeleton.json')); J0 = sk['joints_mm']; W = J0['withers']; H = W[1]
    J = {k: np.array([(v[0] - W[0]) / H, (H - v[1]) / H]) for k, v in J0.items()}          # the species skeleton in the Stark frame: withers at 0,0; y down; ground at y = 1
    depth_bone = (J['sternum_back'][1]) - A['fur_chest'] - 0.0212           # photo chest depth minus fur minus the brisket skin offset
    def transforms(lm):
        """every Stark body onto the species skeleton, from one model's own landmarks (so that model's scaling cancels out)"""
        jc = lambda a, b: lm[f'{a}_{b}'] if f'{a}_{b}' in lm else lm[f'{b}_{a}']
        # the trunk (thorax and lumbar spine) moves as ONE piece, set by the topline (withers, croup) and the chest floor, so ribs and spine stay together
        sw, sc = lm['withers_spines_top'], lm['croup_sacrum_top']; span = (J['croup'][0] - J['withers'][0]) / (sc[0] - sw[0])
        ventral = np.array([J['withers'][0] + (lm['thorax_ventral_most'][0] - sw[0]) * span, depth_bone])
        trunk = affine3([sw, sc, lm['thorax_ventral_most']], [J['withers'], J['croup'], ventral])
        T = {
          'left_scapula': along(lm['left_scapula_top'], jc('left_scapula', 'left_humerus'), J['scapula_top'], J['shoulder']),
          'left_humerus': along(jc('left_scapula', 'left_humerus'), jc('left_humerus', 'left_antebrachium'), J['shoulder'], J['elbow']),
          'left_antebrachium': along(jc('left_humerus', 'left_antebrachium'), jc('left_antebrachium', 'left_carpus'), J['elbow'], J['carpus']),
          'left_carpus': along(jc('left_antebrachium', 'left_carpus'), jc('left_carpus', 'left_forepaw'), J['carpus'], J['front_mcp']),
          'left_forepaw': along(jc('left_carpus', 'left_forepaw'), lm['left_fore_toe_tip'], J['front_mcp'], J['front_toe']),
          'left_femur': along(jc('pelvis', 'left_femur'), jc('left_femur', 'left_crus'), J['hip'], J['stifle']),
          'left_crus': along(jc('left_femur', 'left_crus'), jc('left_crus', 'left_calx'), J['stifle'], J['hock']),
          'left_calx': along(jc('left_crus', 'left_calx'), jc('left_calx', 'left_hindpaw'), J['hock'], J['hind_mtp']),
          'left_hindpaw': along(jc('left_calx', 'left_hindpaw'), lm['left_hind_toe_tip'], J['hind_mtp'], J['hind_toe']),
          'pelvis': affine3([lm['iliac_crest_top'], lm['tuber_ischiadicum'], jc('pelvis', 'left_femur')], [J['ilium_crest'], J['ischium'], J['hip']]),
          'thorax': trunk, 'abdomen': trunk,
          'cervix': along(lm['thorax_cervix'], lm['cervix_caput'], J['neck_root'], J['occiput']),
          'caput': affine3([lm['cervix_caput'], lm['nose_tip'], lm['chin_lowest']], [J['occiput'], J['nose'], J['chin']]),
        }
        stretch = {k: round(float(np.linalg.norm(J[d] - J[c]) / np.linalg.norm(jc(*x) - jc(*y))), 3) for k, (x, y, c, d) in {
            'humerus': (('left_scapula', 'left_humerus'), ('left_humerus', 'left_antebrachium'), 'shoulder', 'elbow'),
            'radius': (('left_humerus', 'left_antebrachium'), ('left_antebrachium', 'left_carpus'), 'elbow', 'carpus'),
            'femur': (('pelvis', 'left_femur'), ('left_femur', 'left_crus'), 'hip', 'stifle'),
            'tibia': (('left_femur', 'left_crus'), ('left_crus', 'left_calx'), 'stifle', 'hock')}.items()}
        stretch['trunk_along_back'] = round(float(span), 3)
        return T, stretch, lm
    lm_v, bones, _ = load_stark('beagle_fore_verified')     # the real Beagle (Simon, 13.8 kg): bone shapes and proportions
    lm_f, _, mus = load_stark('full_linear')                  # the Shepherd-sized model: the only one with all 158 muscle lines (its own landmarks place them)
    T, stretch, lm = transforms(lm_v); Tm, _, _ = transforms(lm_f)
    BODY = {'thorax', 'abdomen', 'pelvis', 'cervix', 'caput', 'left_scapula', 'left_humerus', 'left_femur'}
    FORE = {'left_antebrachium', 'left_carpus', 'left_forepaw'}; HIND = {'left_crus', 'left_calx', 'left_hindpaw'}
    bone_polys = {}
    for b, f in T.items():
        rings = bones[b]; polys = [Polygon(f(np.array(r))) for r in rings if len(r) >= 3]
        bone_polys[b] = unary_union([p.buffer(0) for p in polys])
    # muscles: thickness from strength; a muscle joins the layer of the most distal body it touches
    order = ['thorax', 'abdomen', 'pelvis', 'cervix', 'caput', 'left_scapula', 'left_humerus', 'left_femur', 'left_antebrachium', 'left_crus', 'left_carpus', 'left_calx', 'left_forepaw', 'left_hindpaw']
    layer_of = lambda bs: 'FORE' if bs & FORE else 'HIND' if bs & HIND else 'BODY'   # a muscle that reaches the forearm or shank belongs to that leg's layer
    mus_geo = {'BODY': [], 'FORE': [], 'HIND': []}; mlines = []
    for name, m in mus.items():
        if name.startswith('right_'): continue
        bs = {b for _, b, _ in m['pts']}
        if not bs <= set(Tm): continue
        pts = [Tm[b](p[None, :])[0] for _, b, p in m['pts']]
        r = math.sqrt(m['F'] / (A['specific_tension_MPa'] * 1e6) / math.pi) / 0.6168   # thickness in the Shepherd-sized model's withers heights
        if len(pts) > 1:
            line = LineString(pts); n = max(6, int(line.length / 0.01)); g = []
            for i in range(n):   # thickest in the middle, A['muscle_end'] x at the ends (bellies and tendons)
                t0, t1 = i / n, (i + 1) / n; w = A['muscle_end'] + (1 - A['muscle_end']) * math.sin(math.pi * (t0 + t1) / 2)
                g.append(LineString([line.interpolate(t0, normalized=True), line.interpolate(t1, normalized=True)]).buffer(r * w))
            g = unary_union(g)
        else: g = Point(pts[0]).buffer(r)
        L = layer_of(bs); mus_geo[L].append(g); mlines.append((L, pts, r))
    skin = json.load(open(SKIN))['landmarks']; med = float(np.median([l['offset_over_withers_height'] for l in skin]))
    def wrap(geoms):
        g = unary_union(geoms); dense = shapely.segmentize(g, 0.004)   # dense points, so the wrap follows curves instead of jumping between sparse corners
        hull = shapely.concave_hull(shapely.MultiPoint(shapely.get_coordinates(dense)), ratio=A['hull_ratio'])
        s = unary_union([g, hull]).buffer(med).buffer(A['smooth']).buffer(-A['smooth'])
        return max(s.geoms, key=lambda q: q.area) if isinstance(s, MultiPolygon) else s
    layers = {'BODY': wrap([bone_polys[b] for b in BODY] + mus_geo['BODY']),
              'FORELEG': wrap([bone_polys[b] for b in FORE] + mus_geo['FORE']),
              'HINDLEG': wrap([bone_polys[b] for b in HIND] + mus_geo['HIND'])}
    # tail: our own line, tapered
    tl = [np.array([(x - sk['joints']['withers'][0]) / (sk['scale_units_per_mm'] * H), (y - sk['joints']['withers'][1]) / (sk['scale_units_per_mm'] * H)]) for x, y in sk['tail']]
    w0, w1 = A['tail_width']; segs = [LineString([tl[i], tl[i + 1]]).buffer(w0 + (w1 - w0) * i / (len(tl) - 1)) for i in range(len(tl) - 1)]
    layers['TAIL'] = unary_union(segs).buffer(0.004).buffer(-0.004)
    # the skin-landmark check: Ellenberger bone landmark mapped onto ours, plus its offset
    dirs = {'up': (0, -1), 'down': (0, 1), 'forward': (1, 0), 'back': (-1, 0)}
    where = {'withers': J['withers'], 'scapula_top': J['scapula_top'], 'point_of_shoulder': T['left_humerus'](lm['left_point_of_shoulder'][None])[0],
             'sternum_manubrium': T['thorax'](lm['sternum_cranial_most'][None])[0], 'brisket': T['thorax'](lm['thorax_ventral_most'][None])[0],
             'elbow_olecranon': T['left_antebrachium'](lm['left_olecranon_tip'][None])[0], 'stifle_patella': J['stifle'], 'hock_caudal': T['left_calx'](lm['left_tuber_calcanei'][None])[0],
             'croup': J['croup'], 'ischium': J['ischium'], 'skull_top': T['caput'](lm['skull_top'][None])[0], 'nose': J['nose'], 'chin': J['chin'],
             'carpus_caudal': J['carpus'], 'carpus_cranial': J['carpus'], 'hock_top': J['hock'], 'occiput': J['occiput']}
    lay_of = {'elbow_olecranon': 'BODY', 'carpus_caudal': 'FORELEG', 'carpus_cranial': 'FORELEG', 'stifle_patella': 'BODY', 'hock_caudal': 'HINDLEG', 'hock_top': 'HINDLEG'}
    checks = []
    for l in skin:
        n = l['landmark']; b = where.get(n)
        if b is None: continue
        tgt = b + np.array(dirs[l['offset_direction']]) * l['offset_over_withers_height']
        poly = layers[lay_of.get(n, 'BODY')]; got = np.array(nearest_points(poly.exterior, Point(tgt))[0].coords[0])
        inside = poly.contains(Point(tgt)); d = float(np.linalg.norm(got - tgt))
        checks.append({'landmark': n, 'layer': lay_of.get(n, 'BODY'), 'target_wh': tgt.round(4).tolist(), 'miss_wh': round(d, 4), 'target_is': 'inside' if inside else 'outside'})
    s = sk['scale_units_per_mm'] * H; X0, Y0 = sk['joints']['withers']
    to_units = lambda P: [[round(X0 + x * s, 3), round(Y0 + y * s, 3)] for x, y in P]
    out = {'id': sid, 'units': 'wh: withers-height units, withers at 0,0, y down, ground at y = 1; units: drawing units (same frame as the skeleton)',
           'layers_wh': {k: [list(map(lambda q: [round(q[0], 4), round(q[1], 4)], v.exterior.coords))] for k, v in layers.items()},
           'layers_units': {k: to_units(v.exterior.coords) for k, v in layers.items()},
           'stretch_vs_beagle': stretch, 'skin_checks': checks, 'median_skin_offset_wh': round(med, 4), 'bone_chest_depth_wh': round(float(depth_bone), 4),
           'assumptions': {k: {'value': v[0], 'why': v[1]} for k, v in ASSUME.items()}}
    return out, bone_polys, mlines, J, layers, checks

def render(sid, out, bone_polys, mlines, J, layers, checks, S=900):
    ox, oy = 1.45, 0.42
    P = lambda q: f'{(q[0] + ox) * S:.1f},{(q[1] + oy) * S:.1f}'
    path = lambda g: 'M' + ' L'.join(P(q) for q in list(g.exterior.coords)) + ' Z'
    W, Hh = int(2.45 * S), int(1.55 * S)
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{Hh + 40 + 26 * len(checks)}"><rect width="100%" height="100%" fill="#efe6d2"/>',
         f'<line x1="0" y1="{(1 + oy) * S}" x2="{W}" y2="{(1 + oy) * S}" stroke="#7a6a50" stroke-width="3"/>']
    fills = {'TAIL': '#b98c5a', 'HINDLEG': '#a77a4a', 'BODY': '#c99b66', 'FORELEG': '#b38552'}
    for k in ('TAIL', 'HINDLEG', 'BODY', 'FORELEG'):
        o.append(f'<path d="{path(layers[k])}" fill="{fills[k]}" fill-opacity="0.55" stroke="#3b2a1a" stroke-width="2.5"/>')
    for g in bone_polys.values():
        for q in (g.geoms if isinstance(g, MultiPolygon) else [g]): o.append(f'<path d="{path(q)}" fill="#f4ecd8" fill-opacity="0.85" stroke="#6b5a40" stroke-width="1"/>')
    for L, pts, r in mlines:
        o.append(f'<polyline points="{" ".join(P(q) for q in pts)}" fill="none" stroke="#a3322a" stroke-opacity="0.45" stroke-width="{max(1, r * S * 0.5):.1f}" stroke-linecap="round"/>')
    for c in checks:
        t = c['target_wh']; col = '#1d7a3a' if c['miss_wh'] < 0.015 else '#c77d00' if c['miss_wh'] < 0.03 else '#b3261e'
        o.append(f'<circle cx="{(t[0] + ox) * S:.1f}" cy="{(t[1] + oy) * S:.1f}" r="7" fill="{col}" stroke="#fff" stroke-width="2"/>')
    y = Hh + 10; o.append(f'<text x="16" y="{y}" font-family="sans-serif" font-size="20" font-weight="bold" fill="#2a1a10">{sid}: outline v1 over the skeleton (Stark bones and muscles, Ellenberger skin offsets) - draft</text>')
    for c in checks:
        y += 26; o.append(f'<text x="16" y="{y}" font-family="monospace" font-size="16" fill="#2a1a10">{c["landmark"]:<20} {c["layer"]:<8} misses its skin target by {c["miss_wh"]:.3f} withers heights ({c["target_is"]} the outline)</text>')
    o.append('</svg>'); svg = '\n'.join(o)
    (BUILD / f'{sid}.outline.svg').write_text(svg)
    subprocess.run(['node', '-e', f"const {{Resvg}}=require('@resvg/resvg-js');const fs=require('fs');fs.writeFileSync('{BUILD}/{sid}.outline.png',new Resvg(fs.readFileSync('{BUILD}/{sid}.outline.svg','utf8')).render().asPng())"], cwd=ROOT, check=True)

def main(args):
    if not args: print(__doc__); return 2
    sid = args[0]; out, bp, ml, J, layers, checks = build(sid)
    (BUILD / f'{sid}.outline.json').write_text(json.dumps(out, indent=1)); render(sid, out, bp, ml, J, layers, checks)
    print(f'wrote species/build/{sid}.outline.json, .svg and .png  (bone chest depth {out["bone_chest_depth_wh"]} wh; median skin offset {out["median_skin_offset_wh"]} wh)')
    for c in checks: print(f'  {c["landmark"]:<20} {c["layer"]:<8} miss {c["miss_wh"]:.3f}  ({c["target_is"]})')
    print(f'  mean miss {np.mean([c["miss_wh"] for c in checks]):.3f} withers heights')
    return 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
