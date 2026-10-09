#!/usr/bin/env python3
"""hero5's first coat (Oct 9, 2026): flat marking shapes drawn from GrumpyDingo's rig points and the pieces' own outlines, coloured from photo 01.
   Imported by tools/den/hero5_engine.py (after the ground fit); run alone it prints the palette and saves a zone preview over the photo.
   Zones: a dark saddle along the topline with the shoulder stripe, a cream underside and chest front, pale cheeks and muzzle, the eye and nose,
   a dark top edge and tip on the tail, tawny legs and rump, pale paws. The photo is dim (evening, overcast), so every zone's colour gets the
   same lightness gain (base fur to hero3's lightness): the coat keeps the photo's own contrasts between zones."""
import json, pathlib, numpy as np
from PIL import Image
from shapely.geometry import Polygon, Point, box, LineString
from shapely import affinity
from shapely.ops import unary_union
from skimage import color
ROOT = pathlib.Path(__file__).resolve().parents[2]
PHOTO = ROOT / 'ref/research/scout/01-body-templates/wolf/01_wolf_inat130681789_RobFoster_stand_R.jpg'
MASK = ROOT / 'species/build/.01_wolf_inat130681789_RobFoster_stand_R_isnet.npy'

def big(g):
    g = g.buffer(0)
    return max(g.geoms, key=lambda q: q.area) if hasattr(g, 'geoms') else g
def soft(g, r=.35):  # round the corners of a zone (open then close), so no zone has a sharp cut end
    return big(g.buffer(-r).buffer(2 * r).buffer(-r))
def band(P, v):  # the edge band of P on the side opposite to vector v: P minus P moved by v
    return P.difference(affinity.translate(P, *v))

def zones(J, parts):
    """J: joints (rig units), parts: {name: [[x,y]...]} after the ground fit. Returns [(id, host part, paint, polygon)]"""
    Pg = {k: Polygon(v).buffer(0) for k, v in parts.items()}; q = lambda k: np.array(J[k], float); T, H, TL = Pg['trunk'], Pg['head'], Pg['tail']
    depth = q('r_brisket')[1] - q('wither')[1]; ALL = unary_union([g for g in Pg.values()]).buffer(0)
    inner = lambda P, host: P.intersection(host).intersection(ALL.buffer(-.03))  # inside its piece; off the outside edge by a hair only (a seam between pieces gets no gap)
    out = []; TH = T.union(H).buffer(0)  # the zones are drawn over trunk and head together, then cut per piece: they flow across the neck seam
    split = lambda zid, z, pal, hz=None: [(zid, 'trunk', pal, inner(z, T)), *([(hz, 'head', pal, inner(z.intersection(H.buffer(.12)), TH))] if hz else [])]  # the head's part reaches 0.12 past the head's edge, over the trunk's: no antialiased seam line
    # saddle: a cape along the topline from the tail root to the back of the ears, deepest over the withers and shoulders (0.34 of the body's
    # depth), thinning over the loin (0.24) and the croup (0.2), with the dark stripe that runs down behind the shoulder blade
    x0, xn = q('r_tailTop')[0] - .6, q('r_earBack')[0] + .6; xs = np.linspace(x0, xn, 14)
    th = lambda x: depth * np.interp(x, [x0, q('r_croup')[0], q('r_back')[0], q('wither')[0] - 2, q('r_nape')[0], xn], [.2, .22, .24, .34, .3, .2])
    from scipy.ndimage import gaussian_filter1d
    def edge_y(P, x, top=True):  # the outline's top (or bottom) at x
        I = P.intersection(LineString([(x, -99), (x, 99)])); ys = [c[1] for g in (I.geoms if hasattr(I, 'geoms') else [I]) for c in g.coords] if not I.is_empty else [np.nan]
        return min(ys) if top else max(ys)
    xs = np.linspace(x0, xn, 120); ty = gaussian_filter1d(np.array([edge_y(TH, x) for x in xs]), 4, mode='nearest')  # the topline, smoothed: the saddle's lower edge hangs from it in one curve
    sad = Polygon([(x0, -99), *[(x, y + th(x)) for x, y in zip(xs, ty)], (xn, -99)]).buffer(0).intersection(TH)
    sc, el = q('r_scap'), q('r_elbowBack'); d = (el - sc) / np.linalg.norm(el - sc); n = np.array([-d[1], d[0]])
    stripe = Polygon([sc + n * 1.1 - d * 1.5, sc - n * 1.1 - d * 1.5, sc + d * depth * .5 - n * .15, sc + d * depth * .5 + n * .3])
    zs = soft(sad.union(stripe).intersection(TH), .6); zs = big(zs.union(zs.buffer(.4).intersection(TH).intersection(sad.union(stripe).buffer(.1))))
    out += split('saddle', zs, 'saddle', 'saddleNeck')
    # cream underside: belly and brisket (0.2 of the depth), the chest front and the throat
    tk = q('r_tuck'); bx = np.linspace(tk[0] - .5, q('r_brisket')[0] + 6.5, 18); bt = lambda x: depth * np.interp(x, [tk[0] - .5, tk[0] + 3.5, 99], [.02, .2, .2])
    bx = np.linspace(bx[0], bx[-1], 90); by = gaussian_filter1d(np.array([edge_y(T, x, False) for x in bx]), 3, mode='nearest')
    und = Polygon([(bx[0], 99), *[(x, y - bt(x)) for x, y in zip(bx, by)], (bx[-1], 99)]).buffer(0).intersection(T)  # thins to nothing at the tuck
    br, ch, tr, jw0 = q('r_brisket'), q('r_chest'), q('r_throat'), q('r_jaw'); ctl = [br + [3.0, -1.0], ch + [-.6, -1.9], tr + [-.4, -2.0], jw0 + [.4, -.3]]  # the cream's upper edge, a smooth line
    cv = [np.array(ctl[0])] + [(1 - t) ** 3 * ctl[0] + 3 * (1 - t) ** 2 * t * ctl[1] + 3 * (1 - t) * t * t * ctl[2] + t ** 3 * ctl[3] for t in np.linspace(0, 1, 24)]
    chest = TH.intersection(Polygon([*cv, jw0 + [8, -.3], jw0 + [8, 12], br + [3, 12]]).buffer(0))
    raw_u = und.union(chest); zb = soft(soft(raw_u, .45).buffer(.6).buffer(-.6).intersection(TH), .9)
    zb = big(zb.union(zb.buffer(.4).intersection(TH).intersection(raw_u.buffer(.1))))  # then out to the silhouette near it: no fur slivers left along the tufty edge
    out += split('belly', zb, 'pale', 'throat')  # opened hard: the neck's fur tufts would make its edge jagged
    # face: pale cheek, lips and throat below a line under the eye; the eye; the nose
    e, st, ns, jw, th = q('r_eye'), q('r_stop'), q('nose'), q('r_jaw'), q('r_throat')
    cheek = H.intersection(Polygon([th + [-.8, 0], jw + [-1.2, -.6], e + [-1.0, 1.0], e + [.6, .7], st + [.4, 1.6], ns + [.2, .6], ns + [3, 3], th + [0, 5]]))
    out.append(('cheek', 'head', 'pale', inner(soft(cheek, .25), H)))
    a = np.degrees(np.arctan2(st[1] - e[1], st[0] - e[0]))
    out.append(('eye', 'head', 'ink', affinity.rotate(affinity.scale(Point(e).buffer(1), .42, .2), a, origin=tuple(e))))
    nose = H.intersection(Point(ns + [-.25, -.1]).buffer(.62)); out.append(('noseTip', 'head', 'ink', inner(nose, H) if not inner(nose, H).is_empty else nose))
    eb, et, ef = q('r_earBack'), q('r_earTip'), q('ear'); ear = H.intersection(Polygon([eb, et + [0, -.5], ef]).buffer(.35))
    rim = ear.intersection(LineString([eb + (eb - et) * .1, et + (et - eb) * .2]).buffer(.38)); out.append(('earRim', 'head', 'saddle', inner(rim, H)))
    # tail: the dark guard hair along its top (back) edge, and the black tip (the last 28% of its length from the root)
    root = q('tail'); tip = np.array(max(TL.exterior.coords, key=lambda c: np.hypot(c[0] - root[0], c[1] - root[1]))); ax = tip - root; L = np.linalg.norm(ax); u = ax / L
    top = band(TL, (.55, .3)).intersection(Polygon([root - u * 9 + [9 * u[1], -9 * u[0]], root + u * L * .8 + [9 * u[1], -9 * u[0]], root + u * L * .8 - [9 * u[1], -9 * u[0]], root - u * 9 - [9 * u[1], -9 * u[0]]]))
    cut = root + u * L * .76; tipz = TL.intersection(Polygon([cut + [u[1] * 9, -u[0] * 9], cut + u * 9 + [u[1] * 9, -u[0] * 9], cut + u * 9 - [u[1] * 9, -u[0] * 9], cut - [u[1] * 9, -u[0] * 9]]))
    zt = soft(top.union(tipz), .2); zt = big(zt.union(zt.buffer(.3).intersection(TL).intersection(top.union(tipz).buffer(.3))))
    out.append(('tailTip', 'tail', 'furDark', inner(zt, TL)))
    # legs: grey fur at the top like the body, tawny from partway down (a slanted edge, higher at the front, as on photo 01): no 'sleeve' cap at the elbow or knee
    for host, a_, b_, f in (('forearm', 'nEl', 'nCa', .28), ('shank', 'nKn', 'nHo', .38)):
        A, B = q(a_), q(b_); c = A + (B - A) * f; dd = (B - A) / np.linalg.norm(B - A); nn = np.array([dd[1], -dd[0]]); nn = nn if nn[0] > 0 else -nn
        e1, e2 = c + nn * 3 - dd * .9, c - nn * 3 + dd * .9  # the edge rises toward the front of the leg
        zone = Pg[host].intersection(Polygon([e1, e2, e2 + dd * 20, e1 + dd * 20]))
        out.append((host + 'Tan', host, 'leg', soft(zone, .15)))
    return [(i, h, p, big(g)) for i, h, p, g in out if not g.is_empty and g.area > .05]

def palette(J, parts, frame):
    """median photo colour of each zone at rest (zones mapped back onto photo 01), then one lightness gain for all"""
    im = np.array(Image.open(PHOTO).convert('RGB')).astype(float) / 255; M = np.load(MASK); Lab = color.rgb2lab(im)
    X0, g, ppu = frame['X0'], frame['g'], frame['ppu']; toP = lambda P: affinity.affine_transform(P, [ppu, 0, 0, ppu, X0 - ppu, g - 35.55 * ppu])
    yy, xx = np.mgrid[0:M.shape[0], 0:M.shape[1]]
    def med(P, pct=50):  # lightness at a percentile of the zone (a/b: median): the saddle is read by its dark hair, the cream by its bright, as a painter would
        from matplotlib.path import Path as MP
        P = big(toP(P)); x0, y0, x1, y1 = [int(v) for v in P.bounds]; sub = MP(np.array(P.exterior.coords)).contains_points(np.c_[xx[y0:y1, x0:x1].ravel(), yy[y0:y1, x0:x1].ravel()]).reshape(y1 - y0, x1 - x0)
        sel = sub & M[y0:y1, x0:x1]; px = Lab[y0:y1, x0:x1][sel]; return np.array([np.percentile(px[:, 0], pct), np.median(px[:, 1]), np.median(px[:, 2])])
    Z = {i: P for i, h, p, P in zones(J, parts)}; Pg = {k: Polygon(v).buffer(0) for k, v in parts.items()}
    base = Pg['trunk'].difference(Z['saddle']).difference(Z['belly']).buffer(-.3); legs = Pg['forearm'].union(Pg['shank'])
    raw = {'fur': med(base), 'saddle': med(Z['saddle'], 15), 'pale': med(Z['belly'], 80), 'tan': med(Pg['thigh'], 65), 'leg': med(legs, 60), 'pale2': med(Pg['fpaw'], 85), 'cheek': med(Z['cheek'], 85)}
    gain = 57.0 / raw['fur'][0]; hexs = {}
    for k, v in raw.items():
        L = min(92, v[0] * gain); c = color.lab2rgb(np.array([[[L, v[1] * 1.15, v[2] * 1.15]]]))[0, 0]; hexs[k] = '#%02x%02x%02x' % tuple(int(round(x * 255)) for x in np.clip(c, 0, 1))
    hexs['furDark'] = '#2f2a26'; hexs['ink'] = '#1a1714'
    return hexs, {k: [round(x, 1) for x in v] for k, v in raw.items()}, gain

if __name__ == '__main__':
    G = json.load(open(ROOT / 'engine/hero5_geo.json'))['nudged']
    pal, raw, gain = palette(G['joints'], G['parts'], G['frame']); print('gain', round(gain, 2)); print('photo Lab', raw); print('palette', pal)
