#!/usr/bin/env python3
"""hero5 from a real wolf: GrumpyDingo's rig points on photo 01 (ref/research/firefly/wolf-rig-points/) plus the photo's IS-Net outline become
   the skeleton and the pieces. The outline is the photo's own; pieces are cut from it along lines across each leg at the joints, far legs dropped
   (they are drawn as copies of the near ones), the tail drawn as a ribbon through its four points. Output: engine/hero5_geo.json (rig units: withers
   height 25, ground y 35.55, facing right), one per knee variant ("placed": GrumpyDingo's knee; "nudged": the knee moved back until it reads 140 deg).
   Usage: python3 tools/den/hero5_build.py"""
import json, math, pathlib, numpy as np
from PIL import Image
from skimage import measure
from shapely.geometry import Polygon, LineString, Point, MultiPolygon, box
from shapely.ops import split, unary_union
ROOT = pathlib.Path(__file__).resolve().parents[2]
PHOTO = ROOT / 'ref/research/scout/01-body-templates/wolf/01_wolf_inat130681789_RobFoster_stand_R.jpg'
MASK = ROOT / 'species/build/.01_wolf_inat130681789_RobFoster_stand_R_isnet.npy'
PTS = ROOT / 'ref/research/firefly/wolf-rig-points/01_RobFoster_GrumpyDingo_2026-10-09.json'
big = lambda g: max(g.geoms, key=lambda q: q.area) if g.geom_type in ('MultiPolygon', 'GeometryCollection') else g

def points():
    d = json.load(open(PTS)); m = d['images'][0]; k = Image.open(PHOTO).width / m['w']
    return {j: np.array([((v['0'][0] - m['ox']) / m['s']) * k, ((v['0'][1] - m['oy']) / m['s']) * k]) for j, v in d['keys'].items() if '0' in v and isinstance(v['0'], list)}

from scipy.ndimage import gaussian_filter1d, gaussian_filter
SMOOTH_PX = 9.0   # how much fur noise to iron out of the outline (photo px; about a quarter of a rig unit)
def smooth_ring(coords, sigma, step=2.0):
    """resample a closed ring every `step` px and smooth it (circular gaussian on x and y): clean curves instead of traced fur"""
    P = np.array(coords[:-1] if np.allclose(coords[0], coords[-1]) else coords, float); seg = np.r_[0, np.cumsum(np.hypot(*np.diff(np.vstack([P, P[:1]]), axis=0).T))]
    t = np.arange(0, seg[-1], step); Q = np.c_[np.interp(t, seg, np.r_[P[:, 0], P[0, 0]]), np.interp(t, seg, np.r_[P[:, 1], P[0, 1]])]
    if sigma > 0: Q = np.c_[gaussian_filter1d(Q[:, 0], sigma / step, mode='wrap'), gaussian_filter1d(Q[:, 1], sigma / step, mode='wrap')]
    return Q
def smooth_poly(poly, sigma):
    poly = big(poly.buffer(0)); return Polygon(smooth_ring(list(poly.exterior.coords), sigma)).buffer(0).simplify(.6)

VECTOR = ROOT / 'ref/research/firefly/wolf-silhouettes/hand/01_wolf_RobFoster_vector_GrumpyDingo.svg'  # GrumpyDingo's vector silhouette of photo 01 (VTracer)
_OUTLINE = None
def outline():
    """the master silhouette: GrumpyDingo's vector silhouette when there is one (clean curves; it overlaps the photo's own cut-out 0.97), fitted onto
       the photo by its bounding box; otherwise the photo's IS-Net mask, smoothed"""
    global _OUTLINE
    if _OUTLINE is not None: return _OUTLINE
    if VECTOR.exists():
        import subprocess, tempfile
        with tempfile.TemporaryDirectory() as td:
            png = pathlib.Path(td) / 'v.png'; subprocess.run(['inkscape', str(VECTOR), '-o', str(png), '-w', '4096'], check=True, capture_output=True); V = np.array(Image.open(png).convert('LA'))
        V = (V[..., 1] > 127) & (V[..., 0] < 128); ys, xs = np.nonzero(V); M = np.load(MASK); my, mx = np.nonzero(M)
        sx = (mx.max() - mx.min()) / (xs.max() - xs.min()); sy = (my.max() - my.min()) / (ys.max() - ys.min())
        C = max(measure.find_contours(V.astype(float), .5), key=len)
        a0, b0, a1, b1 = mx.min(), my.min(), xs.min(), ys.min()
        _OUTLINE = smooth_poly(Polygon([(a0 + (c[1] - a1) * sx, b0 + (c[0] - b1) * sy) for c in C]), 2.0); return _OUTLINE
    return outline_photo()
_OPH = None
def outline_photo():
    global _OPH
    if _OPH is not None: return _OPH
    M = np.load(MASK); M = gaussian_filter(M.astype(float), 2.0) > .5  # a light blur first, so single stray hairs never become spikes
    C = max(measure.find_contours(M.astype(float), .5), key=len); _OPH = smooth_poly(Polygon([(c[1], c[0]) for c in C]), SMOOTH_PX); return _OPH

def ang(a, b, c):
    v1, v2 = a - b, c - b; return math.degrees(math.acos(np.clip(v1 @ v2 / np.linalg.norm(v1) / np.linalg.norm(v2), -1, 1)))

def cut_line(P, j, axis_from, axis_to, L=400):
    """a line through joint j across the leg (perpendicular to the bone axis_from→axis_to)"""
    d = P[axis_to] - P[axis_from]; d /= np.linalg.norm(d); n = np.array([-d[1], d[0]]); return LineString([P[j] - n * L, P[j] + n * L])

def side(poly, line, ref):
    """the part of poly on ref's side of the line"""
    parts = split(poly, line).geoms if poly.intersects(line) else [poly]
    return big(unary_union([g for g in parts if g.distance(Point(ref)) < 1e-6 or g.contains(Point(ref))] or [min(parts, key=lambda g: g.distance(Point(ref)))]))

def ray(O, p, d, cap):
    """distance from p along unit vector d to where the outline is left (capped)"""
    L = LineString([p, p + d * cap * 3]); I = L.intersection(O)
    if I.is_empty: return cap
    segs = list(I.geoms) if hasattr(I, 'geoms') else [I]; first = min(segs, key=lambda g: g.distance(Point(p)))
    return min(cap, max(np.linalg.norm(np.array(c) - p) for c in first.coords))

def limb_shape(a, b, wa, wb, n=10):
    """a tapered leg segment from joint a to joint b; wa/wb = (front, back) half-widths in px at each end; rounded caps"""
    d = b - a; L = np.linalg.norm(d); u = d / L; nf = np.array([u[1], -u[0]])  # nf points to the leg's front (the animal faces +x, legs run down)
    if nf[0] < 0: nf = -nf
    pts = []
    for t in np.linspace(0, 1, n): c = a + d * t; f = wa[0] + (wb[0] - wa[0]) * t; pts.append(c + nf * f)
    for k in range(1, 8): th = math.pi * k / 8; r = (wb[0] + wb[1]) / 2; mid = b + nf * (wb[0] - wb[1]) / 2; pts.append(mid + nf * r * math.cos(th) + u * r * math.sin(th) * .6)
    for t in np.linspace(1, 0, n): c = a + d * t; k_ = wa[1] + (wb[1] - wa[1]) * t; pts.append(c - nf * k_)
    for k in range(1, 8): th = math.pi * k / 8; r = (wa[0] + wa[1]) / 2; mid = a + nf * (wa[0] - wa[1]) / 2; pts.append(mid - nf * r * math.cos(th) - u * r * math.sin(th) * .6)
    return Polygon(pts).buffer(0)

_M = None
def leg_from_mask(axis, y0, y1, cap_l, cap_r, foot=None):
    """trace one leg row by row from the photo's mask: in each row, the run of fur around the leg's bone line (axis: joints top to bottom),
       clipped to cap_l/cap_r px behind/in front of it where two legs merge; foot = (x_heel, x_toe) widens the bottom rows to the paw"""
    global _M
    if _M is None: _M = np.load(MASK)
    A = np.array(axis); L, R = [], []
    for y in range(int(y0), int(y1)):
        k = np.searchsorted(A[:, 1], y); k = min(max(k, 1), len(A) - 1); a, b = A[k - 1], A[k]; t = np.clip((y - a[1]) / max(1e-6, b[1] - a[1]), 0, 1); x = a[0] + (b[0] - a[0]) * t
        row = _M[y]; xi = int(round(x))
        if not row[min(max(xi, 0), len(row) - 1)]: continue
        l = xi; r = xi
        while l > 0 and row[l - 1]: l -= 1
        while r < len(row) - 1 and row[r + 1]: r += 1
        cl, cr = cap_l(y), cap_r(y)
        if foot and y > foot[2]: cl, cr = max(cl, x - foot[0] + 6), max(cr, foot[1] - x + 6)
        L.append((max(l, x - cl), y)); R.append((min(r, x + cr), y))
    return smooth_poly(Polygon(R + L[::-1]), SMOOTH_PX * .8)

def build(knee_dx):
    P = points(); P['nKn'] = P['nKn'] + np.array([-knee_dx, 0]); O = outline()
    g = max(P[k][1] for k in ('r_fToe', 'r_hToe', 'r_fHeel', 'r_hHeel')); ppu = (g - P['wither'][1]) / 25.0
    X0 = min(O.bounds[0], P['r_tailTip'][0]) - 3 * ppu
    U = lambda q: [round((q[0] - X0) / ppu + 1.0, 3), round(35.55 - (g - q[1]) / ppu, 3)]
    UP = lambda poly: [U(c) for c in list(big(poly).exterior.coords)[:-1]]
    def across(j, a, b):  # unit vector across the leg at joint j, pointing to the leg's front
        d = P[b] - P[a]; d = d / np.linalg.norm(d); n = np.array([d[1], -d[0]]); return n if n[0] > 0 else -n
    dist = lambda j, k, nf: abs((P[k] - P[j]) @ nf)
    # front leg widths (front, back half-widths in px) at the elbow, wrist and ball
    nE = across('nEl', 'nEl', 'nCa'); nW = across('nCa', 'nEl', 'nFp'); nB = across('nFp', 'nCa', 'nFp')
    eB = dist('nEl', 'r_elbowBack', nE); eF = ray(O, P['nEl'], nE, eB * 1.3)
    wF, wB = dist('nCa', 'r_wristFront', nW), dist('nCa', 'r_wristBack', nW); bF = ray(O, P['nFp'], nB, wF * 1.1); bB = ray(O, P['nFp'], -nB, wB * 1.1)
    wW = wF + wB; capF = lambda y: wW * (1.25 if y < P['nCa'][1] else .9); 
    legF = leg_from_mask([P['nEl'] - np.array([0, 40]), P['nEl'], P['nCa'], P['nFp'], P['nFp'] + np.array([0, 60])], P['nEl'][1] - 30, g + 2, lambda y: (wB * 1.5 if y > P['nCa'][1] else eB * 1.4), lambda y: (wF * 1.8 if y > P['nCa'][1] else eF * 1.15 + (wF * 1.8 - eF * 1.15) * max(0, min(1, (y - P['nEl'][1]) / (P['nCa'][1] - P['nEl'][1])))), (P['r_fHeel'][0], P['r_fToe'][0], P['nFp'][1] - wW * .3))
    fwr, fball = cut_line(P, 'nCa', 'nEl', 'nFp'), cut_line(P, 'nFp', 'nCa', 'nFp')
    forearm = side(legF, fwr, P['nEl']).union(limb_shape(P['nEl'], P['nCa'], (eF, eB), (wF, wB))).buffer(0); low = side(legF, fwr, P['nFp']); pastern = side(low, fball, P['nCa'] + (P['nFp'] - P['nCa']) * .5).union(Point(P['nCa']).buffer(wW * .45)).buffer(0)
    fpaw = side(low, fball, P['r_fToe']).union(Point(P['nFp']).buffer(wW * .4)).buffer(0)
    # upper arm: from just under the point of the shoulder to the elbow, inside the body; front edge close to the bone (the bulk is the triceps behind)
    nU = across('nEl', 'nSh', 'nEl'); top = P['nSh'] + (P['nEl'] - P['nSh']) * .22
    upperarm = limb_shape(top, P['nEl'], (eF * .45, eB * 1.15), (eF, eB))
    # hind leg widths at the knee, hock and ball
    nK = across('nKn', 'nKn', 'nHo'); nH = across('nHo', 'nKn', 'nHp'); nHb = across('nHp', 'nHo', 'nHp')
    kF = dist('nKn', 'r_kneeFront', nK) if (P['r_kneeFront'] - P['nKn']) @ nK > 0 else ray(O, P['nKn'], nK, 2.2 * ppu)
    kB = ray(O, P['nKn'], -nK, kF * 1.6); hB = dist('nHo', 'r_hockPoint', nH); hF = ray(O, P['nHo'], nH, hB * 1.2)
    pF = ray(O, P['nHp'], nHb, hF * 1.1); pB = ray(O, P['nHp'], -nHb, hB * .9)
    hW = hF + hB; capH = lambda y: hW * (1.05 if y > P['nHo'][1] else 1.0)
    legH = leg_from_mask([P['nHo'] - np.array([0, 30]), P['nHo'], P['nHp'], P['nHp'] + np.array([0, 60])], P['nHo'][1] - 20, g + 2, lambda y: hB * 1.05, lambda y: hF * 1.2, (P['r_hHeel'][0], P['r_hToe'][0], P['nHp'][1] - hW * .3))
    hk, hball = cut_line(P, 'nHo', 'nKn', 'nHp'), cut_line(P, 'nHp', 'nHo', 'nHp')
    shank = limb_shape(P['nKn'], P['nHo'], (kF, kB), (hF, hB)); cannon = side(legH, hball, P['nHo'] + (P['nHp'] - P['nHo']) * .5).union(Point(P['nHo']).buffer(hW * .45)).buffer(0)
    hpaw = side(legH, hball, P['r_hToe']).union(Point(P['nHp']).buffer(hW * .4)).buffer(0)
    # the body: the outline, minus everything below the elbow line at the front and below the knee line at the back
    # the underside follows GrumpyDingo's points: deepest chest, then a gently sagging belly line up to the tuck-up (the far legs' tops hide the real line)
    bk, tk = P['r_brisket'], P['r_tuck']; belly = [bk + (tk - bk) * t + np.array([0, (1 - t) * t * 4 * (tk[1] - bk[1]) * -.18]) for t in np.linspace(0, 1, 12)]
    ch = P['r_chest']; ef = P['nEl'] + nE * eF; chest_curve = [ef + (ch - ef) * t + np.array([0, (ch[1] - ef[1]) * .35 * math.sin(math.pi * t) * 0]) * 0 + np.array([((ch - ef) * t)[0] * 0, -(1 - (1 - t) ** 2) * 0]) for t in np.linspace(0, 1, 2)]
    cc = [ef + np.array([(ch[0] - ef[0]) * t, (ch[1] - ef[1]) * (1 - (1 - t) ** 2)]) for t in np.linspace(0, 1, 12)]  # bulges down, rises steeply to the point of the chest
    fr = Polygon([(O.bounds[2] + 50, ch[1])] + [tuple(q) for q in cc[::-1]] + [tuple(bk)] + [tuple(q) for q in belly] + [(tk[0], g + 99), (O.bounds[2] + 50, g + 99)]).buffer(0)
    kl = P['nKn'][1] - (P['nKn'][1] - P['r_tuck'][1]) * .0
    rr = Polygon([(O.bounds[0] - 50, kl), (P['r_tuck'][0], P['r_tuck'][1] + (kl - P['r_tuck'][1]) * .5), (P['r_tuck'][0], g + 99), (O.bounds[0] - 50, g + 99)])
    # between the near legs the photo's own underside shows (no far leg there in photo 01): keep the outline itself from the knee front to the elbow back
    gap = box(P['r_kneeFront'][0] + 4, P['r_tuck'][1] - 5, P['r_elbowBack'][0] - 4, P['nEl'][1] + 2 * ppu)
    body = big(O.difference(fr.difference(gap)).difference(rr.difference(gap)))
    body = big(body.difference(box(P['r_kneeFront'][0] + 4, P['nEl'][1] + .9 * ppu, P['r_elbowBack'][0] - 4, g + 99)))  # never below the elbows' level
    hcut = LineString([P['r_nape'] + (P['r_nape'] - P['r_throat']) * .3, P['r_throat'] + (P['r_throat'] - P['r_nape']) * .3]); head = side(body, hcut, P['nose']); trunk = side(body, hcut, P['wither'])
    # the ear: the vector silhouette melts it into a lump, so inside a box round the ear the photo's own (smoothed) outline is used instead
    if VECTOR.exists():
        eL, eT, eR = P['r_earBack'], P['r_earTip'], P['ear']; xs_ = [eL[0], eT[0], eR[0]]
        ebox = box(max(min(xs_) - 2.2 * ppu, max(P['r_nape'][0], P['r_throat'][0]) + .3 * ppu), eT[1] - 3 * ppu, max(xs_) + 1.0 * ppu, max(eL[1], eR[1]) + .2 * ppu)
        photo_ear = outline_photo().intersection(ebox)
        head = big(head.difference(ebox).union(photo_ear.intersection(head.buffer(3 * ppu))).buffer(.5).buffer(-.5))
    # the tail: a band along its own line (root between its top and underside, through its widest point, to the tip), trimmed to the photo's
    # outline; in photo 01 it hangs over the far hind leg, so "everything behind the near leg" would take the far thigh too
    root = (P['r_tailTop'] + P['r_tailUnder']) / 2; w0 = np.linalg.norm(P['r_tailTop'] - P['r_tailUnder']); tip = P['r_tailTip']
    axis = tip - root; L = np.linalg.norm(axis); dvec = axis / L; nvec = np.array([dvec[1], -dvec[0]])
    uw = float(np.clip(((P['r_tailWide'] - root) @ dvec) / L, .2, .85)); ww = max(w0 * 1.15, 2 * abs((P['r_tailWide'] - root) @ nvec))
    wf = lambda u: (w0 + (ww - w0) * (u / uw) if u < uw else ww * (1 - (u - uw) / (1 - uw)) ** .7 + 6 * (1 - (u - uw) / (1 - uw)))
    us = np.linspace(0, 1, 15); C = [root + axis * u for u in us]
    tail_ribbon = Polygon([c + nvec * wf(u) / 2 for c, u in zip(C, us)] + [c - nvec * wf(u) / 2 for c, u in zip(C, us)][::-1]).buffer(0)
    wide = Polygon([c + nvec * wf(u) * .75 for c, u in zip(C, us)] + [c - nvec * wf(u) * .75 for c, u in zip(C, us)][::-1]).buffer(0)
    tail = big(O.intersection(wide).union(tail_ribbon)); tail = big(tail.intersection(O.buffer(ppu * .15)))
    tail = big(tail.union(O.intersection(tail.buffer(ppu * .35))))  # fill the photo's silhouette right round it, so no notch opens where the tip meets the leg
    tail_line = [P['r_tailUnder'], P['r_buttock'], P['r_hockPoint']]; tail_zone = tail
    # the thigh: the rump behind a line from the tuck up through the pelvis top, down to the knee (skinned to the body)
    tl = LineString([P['r_tuck'] + (P['r_tuck'] - P['nIl']) * .4, P['nIl'] + (P['nIl'] - P['r_tuck']) * 1.5])
    nT = across('nHi', 'nHi', 'nKn'); tF, tB = dist('nHi', 'r_thighFront', nT), max(dist('nHi', 'r_buttock', nT), dist('nHi', 'r_tailUnder', nT))
    thigh = side(trunk, tl, P['nHi']).intersection(box(0, P['nIl'][1], 1e5, P['nHi'][1] + (P['nKn'][1] - P['nHi'][1]) * .3)).union(limb_shape(P['nHi'], P['nKn'], (tF, tB), (kF * 1.05, max(kB, kF) * 1.1))).buffer(0)
    thigh = big(thigh.intersection(box(0, P['nIl'][1], 1e5, P['nKn'][1] + kF * .6)))
    rump = O.difference(tail_zone).intersection(Polygon([P['nIl'], P['r_tuck'] + np.array([0, ppu]), P['nKn'] + nK * kF, P['nKn'] - nK * kB * 1.5] + tail_line[::-1]).buffer(0))
    thigh = big(thigh.union(rump).difference(tail_zone.buffer(-1)))

    M = np.load(MASK); farpaw = {}
    for leg, ref, xr in (('hind', 'nHp', (O.bounds[0], P['r_tuck'][0])), ('front', 'nFp', (P['r_tuck'][0], O.bounds[2]))):
        for f in np.arange(.6, 3.0, .1):  # the far paw stands a little higher in the picture (further from the camera): scan up until it shows
            y = int(g - f * ppu); row = M[y]; xs = np.nonzero(row[int(xr[0]):int(xr[1])])[0] + int(xr[0]); runs = np.split(xs, np.where(np.diff(xs) > 3)[0] + 1)
            cs = [r.mean() for r in runs if len(r) > 8]; far = [c for c in cs if abs(c - P[ref][0]) > ppu * 1.2]
            if far: farpaw[leg] = U((min(far, key=lambda c: abs(c - P[ref][0])), y)); break
    J = {k: U(P[k]) for k in P}
    rep = {'knee_dx_px': knee_dx, 'ppu_px': round(ppu, 2), 'angles': {'shoulder': round(ang(P['r_scap'], P['nSh'], P['nEl']), 1), 'elbow': round(ang(P['nSh'], P['nEl'], P['nCa']), 1), 'carpus': round(ang(P['nEl'], P['nCa'], P['nFp']), 1),
           'stifle': round(ang(P['nHi'], P['nKn'], P['nHo']), 1), 'tarsus': round(ang(P['nKn'], P['nHo'], P['nHp']), 1)},
           'widths_units': {k: round(v / ppu, 2) for k, v in dict(elbow=eF + eB, wrist=wF + wB, fball=bF + bB, knee=kF + kB, hock=hF + hB, hball=pF + pB).items()}}
    trunk = big(trunk.difference(tail_zone.intersection(box(0, P['r_tailUnder'][1] + ppu * .3, 1e5, 1e5))))
    parts = {'head': head, 'trunk': trunk, 'thigh': thigh, 'shank': shank, 'cannon': cannon, 'hpaw': hpaw, 'upperarm': upperarm, 'forearm': forearm, 'pastern': pastern, 'fpaw': fpaw, 'tail': tail}
    parts = {k: smooth_poly(v, 2.5) for k, v in parts.items()}  # a last light pass, so the cut seams and traced rows leave no steps
    return {'joints': J, 'outline': UP(O), 'parts': {k: UP(v) for k, v in parts.items()}, 'report': rep, 'photoFarPaws': farpaw}

if __name__ == '__main__':
    P = points(); dx = 0
    for dx in range(0, 300, 2):
        if ang(P['nHi'], P['nKn'] - np.array([dx, 0]), P['nHo']) >= 140: break
    out = {'source': 'photo 01 (Rob Foster, iNaturalist, CC BY 4.0) + GrumpyDingo rig points, Oct 9 2026', 'placed': build(0), 'nudged': build(dx)}
    (ROOT / 'engine/hero5_geo.json').write_text(json.dumps(out))
    for k in ('placed', 'nudged'): print(k, json.dumps(out[k]['report']), {p: len(v) for p, v in out[k]['parts'].items()})
