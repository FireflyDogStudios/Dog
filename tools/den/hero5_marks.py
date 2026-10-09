#!/usr/bin/env python3
"""hero5's first coat (Oct 9, 2026): flat marking shapes drawn from GrumpyDingo's rig points and the pieces' own outlines, coloured from photo 01.
   Imported by tools/den/hero5_engine.py (after the ground fit); run alone it prints the palette and saves a zone preview over the photo.
   Zones: a dark saddle along the topline with the shoulder stripe, a cream underside and chest front, pale cheeks and muzzle, the eye and nose,
   a dark top edge and tip on the tail, tawny legs and rump, pale paws. The photo is dim (evening, overcast), so every zone's colour gets the
   same lightness gain (base fur to hero3's lightness): the coat keeps the photo's own contrasts between zones."""
import json, math, pathlib, numpy as np
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
    zs = soft(sad.intersection(TH), .6); zs = big(zs.union(zs.buffer(.4).intersection(TH).intersection(sad.buffer(.1))))
    # the shoulder bar (photo 01's dark streak behind the blade): a tapered sweep from the saddle down the blade's back edge, added after the
    # smoothing (the opening had shaved it to a stub that read as a drip)
    s0 = sc - d * 1.2 - n * .2; s1 = sc + d * depth * .5 + n * .5; ctl_s = (s0 + s1) / 2 - n * .35
    bar = [tuple((1 - t) ** 2 * s0 + 2 * (1 - t) * t * ctl_s + t * t * s1) for t in np.linspace(0, 1, 22)]
    P_ = np.array(bar); Lb, Rb = [], []
    for i in range(len(P_)):
        dd_ = P_[min(i + 1, len(P_) - 1)] - P_[max(i - 1, 0)]; dd_ = dd_ / np.linalg.norm(dd_); nn_ = np.array([-dd_[1], dd_[0]]); w_ = (1.5 * (1 - i / (len(P_) - 1)) ** .8 + .05) / 2
        Lb.append(tuple(P_[i] + nn_ * w_)); Rb.append(tuple(P_[i] - nn_ * w_))
    zs = big(zs.union(Polygon(Lb + Rb[::-1]).buffer(0).intersection(TH)).buffer(.25).buffer(-.25))
    eb0, ef0 = q('r_earBack'), q('ear'); db = (ef0 - eb0) / np.linalg.norm(ef0 - eb0); nb = np.array([db[1], -db[0]]); nb = nb if nb[1] < 0 else -nb  # up, off the ear's base line
    Hx = np.array(H.exterior.coords); cand = Hx[(Hx[:, 0] > eb0[0] - 1) & (Hx[:, 0] < ef0[0] + 2.5)]; tip = cand[np.argmin(cand[:, 1])]  # the ear tip: the outline's top
    by = (eb0[1] + ef0[1]) / 2; I = H.exterior.intersection(LineString([(tip[0], by), (tip[0] + 6, by)]))
    fx = max([c[0] for g_ in (I.geoms if hasattr(I, 'geoms') else [I]) for c in g_.coords]) if not I.is_empty else ef0[0]; ef1 = np.array([fx, by])  # front base: the outline's front edge at base height
    EAR = big(H.intersection(Polygon([eb0 - [.3, -.2], tip + [0, -1], ef1 + [.5, 0]]).buffer(0)))  # the ear: the outline inside the triangle back base, tip, front base
    eb0, ef0 = eb0 - [.3, -.2], ef1; db = (ef0 - eb0) / np.linalg.norm(ef0 - eb0); nb = np.array([db[1], -db[0]]); nb = nb if nb[1] < 0 else -nb
    out += [(i_, h_, p_, g_.difference(EAR) if h_ == 'head' else g_) for i_, h_, p_, g_ in split('saddle', zs, 'saddle', 'saddleNeck')]  # the saddle stops at the ear's base: the ear is its own shape
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
    ti = next(k for k, o in enumerate(out) if o[0] == 'throat'); thr = out[ti][3]
    face = soft(cheek, .3).union(thr).buffer(.35).buffer(-.35)  # cheek and throat as one cream shape: no step where they met
    out[ti] = ('throat', 'head', 'pale', inner(face.intersection(H.buffer(.12)), TH))
    a = np.degrees(np.arctan2(st[1] - e[1], st[0] - e[0]))
    # the eye: almond, set obliquely with the outer (back) corner higher, toward the ear, as on photo 01; a dark rim, a muted amber iris, the pupil
    def lens(c, L, H, ang):  # an almond: two arcs meeting in points at both corners
        t = np.linspace(0, math.pi, 16); top = [(L / 2 * math.cos(x), -H / 2 * math.sin(x) ** .8) for x in t]; bot = [(L / 2 * math.cos(x), H / 2 * math.sin(x) ** .8) for x in t[::-1]]
        return affinity.translate(affinity.rotate(Polygon(top + bot[1:-1]), ang, origin=(0, 0)), *c)
    ea = 16  # degrees: the front corner lower (y grows down, the dog faces +x)
    out.append(('eyeRim', 'head', 'furDark', inner(lens(e, 1.15, .6, ea), H)))
    out.append(('iris', 'head', 'iris', inner(lens(e + [.06, .01], .84, .42, ea), H)))
    out.append(('eye', 'head', 'ink', Point(e + [.1, .01]).buffer(.15)))
    # the lips: tight and black, as on photo 01. One line where the lips meet, from the mouth's corner curving down to where they part behind the
    # nose, thin at the corner; then flush along the upper lip's underside to under the nose, and down the front of the chin (the lower lip)
    mc, ch = q('r_mouth'), q('r_chin'); Hc = np.array(H.exterior.coords)
    def turn(i, k=3):  # signed turn of the outline at point i (negative = a notch, for this ring's direction)
        p0, p1, p2 = Hc[(i - k) % len(Hc)], Hc[i], Hc[(i + k) % len(Hc)]; v1, v2 = p1 - p0, p2 - p1; return float(np.cross(v1, v2)) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-9)
    near = [i for i in range(len(Hc)) if ch[0] < Hc[i, 0] < ns[0] - .3 and ns[1] + .4 < Hc[i, 1] < ch[1] + .1]
    sg = 1 if Polygon(Hc).exterior.is_ccw else -1; gi = min(near, key=lambda i: sg * turn(i)); gap = Hc[gi]  # the deepest notch: where the lips part
    lo = min((Hc[i] for i in near if Hc[i, 1] > gap[1] + .3), key=lambda c: abs(c[1] - gap[1] - .5))  # the front of the lower lip, below it
    # the open mouth (photo 01 pants): a dark wedge from the corner to the notch; its edges are the black lips. No teeth or tongue: kept plain.
    mc = mc + (gap - mc) * .3  # the corner a little forward of the point: a long black line curving up reads as a grin
    up_ = [tuple((1 - t) ** 2 * mc + 2 * (1 - t) * t * ((mc + gap) / 2 + [.12, .22]) + t * t * gap) for t in np.linspace(0, 1, 20)]
    lw_ = [tuple((1 - t) ** 2 * lo + 2 * (1 - t) * t * ((mc + lo) / 2 + [.12, .32]) + t * t * mc) for t in np.linspace(0, 1, 20)]
    mouth = Polygon(up_ + lw_[1:]).buffer(0)
    edge = H.exterior.intersection(box(gap[0] - .02, gap[1] - .9, ns[0] - .3, gap[1] + .05)); rim = edge.buffer(.24).intersection(H)  # the upper lip's black edge, flush, to under the nose
    out.append(('lips', 'head', 'furDark', soft(inner(mouth.buffer(.05).union(rim), H), .03)))
    nose = H.intersection(Point(ns + [-.25, -.1]).buffer(.62)); out.append(('noseTip', 'head', 'ink', inner(nose, H) if not inner(nose, H).is_empty else nose))
    # the ear: a dark rim all round its edge (wolves' ears are edged dark), a warm inside, the base open into the head
    core = EAR.buffer(-.3); open_ = Polygon([eb0 - db * .6, ef0 + db * .6, ef0 + db * .6 - nb * 3, eb0 - db * .6 - nb * 3]).buffer(0).union(Polygon([eb0 + nb * .35 - db * .6, ef0 + nb * .35 + db * .6, ef0 - nb * 3, eb0 - nb * 3]))
    rimz = EAR.difference(core).difference(open_); out.append(('earRim', 'head', 'saddle', soft(inner(rimz, H), .06)))
    out.append(('earIn', 'head', 'tan', soft(inner(core.difference(open_.buffer(-.1)), H), .1)))
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
    # a last pass on the broad zones: each outline resampled and smoothed (sigma 0.25 units), then trimmed back inside its piece, so no zone keeps
    # a stair step from the shapes it was built from (the throat's edge by the shoulder). The small features (eye, nose, lips) keep their drawn shapes.
    from scipy.ndimage import gaussian_filter1d as g1
    def smooth(g, sig=.25, step=.05):
        g = big(g); P = np.array(g.exterior.coords)[:-1]; seg = np.r_[0, np.cumsum(np.hypot(*np.diff(np.vstack([P, P[:1]]), axis=0).T))]
        t = np.arange(0, seg[-1], step); Q = np.c_[np.interp(t, seg, np.r_[P[:, 0], P[0, 0]]), np.interp(t, seg, np.r_[P[:, 1], P[0, 1]])]
        return Polygon(np.c_[g1(Q[:, 0], sig / step, mode='wrap'), g1(Q[:, 1], sig / step, mode='wrap')]).buffer(0)
    host = {'trunk': T, 'head': TH, 'tail': TL}
    BROAD = {'saddle', 'saddleNeck', 'belly', 'throat', 'tailTip', 'forearmTan', 'shankTan'}
    def keep_edge(g, hs):  # smoothed inside, but flush with the silhouette where the zone meets it (the outline's own band keeps the original)
        ring = hs.difference(hs.buffer(-.35)); return inner(big(smooth(g).union(g.intersection(ring)).buffer(.05).buffer(-.05)), hs)
    # pairs that cross the neck seam are smoothed as one shape and split again, so both halves share one edge
    for a_, b_ in (('saddle', 'saddleNeck'), ('belly', 'throat')):
        ia, ib = [next(k for k, o in enumerate(out) if o[0] == x) for x in (a_, b_)]; whole = keep_edge(out[ia][3].union(out[ib][3]), TH)
        out[ia] = (a_, 'trunk', out[ia][2], inner(whole, T)); out[ib] = (b_, 'head', out[ib][2], whole.intersection(H.buffer(.12)))
    out = [(i, h, p, keep_edge(g, host.get(h, Pg.get(h))) if i in BROAD - {'saddle', 'saddleNeck', 'belly', 'throat'} and not g.is_empty else g) for i, h, p, g in out]
    out = [(i, h, p, (g.intersection(H.buffer(.12)) if i in ('saddleNeck', 'throat') else g)) for i, h, p, g in out]
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
    raw = {'fur': med(base), 'saddle': med(Z['saddle'], 15), 'pale': med(Z['belly'], 80), 'tan': med(Pg['thigh'], 65), 'leg': med(legs, 60), 'pale2': med(Pg['fpaw'], 85), 'cheek': med(Z['throat'], 85)}
    gain = 57.0 / raw['fur'][0]; hexs = {}
    for k, v in raw.items():
        L = min(92, v[0] * gain); c = color.lab2rgb(np.array([[[L, v[1] * 1.15, v[2] * 1.15]]]))[0, 0]; hexs[k] = '#%02x%02x%02x' % tuple(int(round(x * 255)) for x in np.clip(c, 0, 1))
    hexs['furDark'] = '#2f2a26'; hexs['ink'] = '#1a1714'; hexs['iris'] = '#a8843f'  # the eye: photo 01's amber, muted
    return hexs, {k: [round(x, 1) for x in v] for k, v in raw.items()}, gain

if __name__ == '__main__':
    G = json.load(open(ROOT / 'engine/hero5_geo.json'))['nudged']
    pal, raw, gain = palette(G['joints'], G['parts'], G['frame']); print('gain', round(gain, 2)); print('photo Lab', raw); print('palette', pal)
