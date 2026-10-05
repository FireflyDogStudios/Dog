"""Den Lens: compile each dog's collar mount into clean closed shapes (shapely), and write them into engine/gear.js between the COMPILED markers.
   python3 tools/lens/compile_mounts.py            (re-run whenever a dog's body outline or a MOUNTS row changes)
   The collar band is the footprint between the mount's edges R and F, run a little past both ends and CUT to the dog's body outline, so it is one closed
   path that is flush on the fur, with no clip mask, no overlap and no stray end stroke at runtime. Shade and light strips are cut the same way."""
import sys, re, pathlib, subprocess
from svgpathtools import parse_path
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from geom import Rigs
from shapely.geometry import Polygon, MultiPolygon
from shapely.ops import unary_union

ROOT = pathlib.Path(__file__).resolve().parents[2]; GEAR = ROOT / 'engine/gear.js'

def cub(p, t):
    u = 1 - t; return (u**3*p[0][0] + 3*u*u*t*p[1][0] + 3*u*t*t*p[2][0] + t**3*p[3][0], u**3*p[0][1] + 3*u*u*t*p[1][1] + 3*u*t*t*p[2][1] + t**3*p[3][1])
def pt(m, t, s):
    r, f = cub(m['R'], t), cub(m['F'], t); k = (s + 1) / 2; return (f[0] + (r[0] - f[0]) * k, f[1] + (r[1] - f[1]) * k)
def strip(m, s0, s1, t0=-.12, t1=1.12, n=48):
    ts = [t0 + (t1 - t0) * i / n for i in range(n + 1)]
    return Polygon([pt(m, t, s1) for t in ts] + [pt(m, t, s0) for t in reversed(ts)]).buffer(0)
def path(geom, r=0):
    if isinstance(geom, MultiPolygon): geom = max(geom.geoms, key=lambda g: g.area)
    if r: geom = geom.buffer(-r, join_style=1).buffer(r, join_style=1)  # opening: rounds every convex corner to radius r, so the cut never leaves a spur
    if isinstance(geom, MultiPolygon): geom = max(geom.geoms, key=lambda g: g.area)
    g = geom.simplify(.015, preserve_topology=True); c = list(g.exterior.coords)[:-1]
    return 'M' + ' L'.join(f'{x:.2f} {y:.2f}' for x, y in c) + ' Z'


from shapely.geometry import LineString, Point, box
from shapely import affinity
import math

def torso(rig, mounts, body):
    """The torso piece: the body outline cut under the collar's lower edge and in front of a rear edge, with a tufted hide hem along the belly,
       a spine seam with lacing, and a girth strap. Everything comes from the dog's own outline, so it is flush on the back and chest."""
    t = mounts['torso']; C = mounts['collar']; mid = lambda tt: tuple((a + b) / 2 for a, b in zip(cub(C['R'], tt), cub(C['F'], tt))); p0, p1 = mid(0), mid(1)  # cut along the collar's middle, so the torso runs under half the band and only the collar's outline shows there
    d = (p1[0] - p0[0], p1[1] - p0[1]); n = math.hypot(*d); u = (d[0] / n, d[1] / n)
    A = (p0[0] - u[0] * 40, p0[1] - u[1] * 40); B = (p1[0] + u[0] * 40, p1[1] + u[1] * 40)
    below = Polygon([A, B, (B[0], 80), (A[0], 80)])                     # everything on the body side of the collar's lower edge
    r = t['rear']; rc = [(r + 1.0, -10), (r + .5, 10), (r, 14), (r - .5, 18), (r - 1, 24), (r - 1.5, 80)]
    behind = Polygon(rc + [(120, 80), (120, -10)])                       # everything in front of the rear edge
    base0 = body.intersection(below).intersection(behind)
    if isinstance(base0, MultiPolygon): base0 = max(base0.geoms, key=lambda g: g.area)
    def lower(x): # lowest y of the body shape at x (the belly line), and the highest (the back line)
        hit = LineString([(x, -20), (x, 60)]).intersection(base0)
        if hit.is_empty: return None, None
        ys = [c[1] for g in (hit.geoms if hasattr(hit, 'geoms') else [hit]) for c in g.coords]; return max(ys), min(ys)
    xs = [r + .2 + i * .1 for i in range(int((60 - r) * 10))]
    prof = [(x, *lower(x)) for x in xs if lower(x)[0] is not None]
    xb = max(prof, key=lambda p: p[1])[0]                               # where the belly is deepest (the brisket)
    hem = lambda x: lower(x)[0]
    # hide tufts hanging from the belly line, from the rear edge to the brisket
    amp, per = t['tuft']['amp'], t['tuft']['period']; tufts = []; x = r + .6
    while x + per < xb:
        xa, xc, xm = x, x + per, x + per / 2
        tufts.append(Polygon([(xa, hem(xa) - .15), (xc, hem(xc) - .15), (xm, hem(xm) + amp * (.75 + .25 * math.sin(xm * 3.1)))])); x += per
    # ragged rear edge: tufts along the rear edge, pointing back, so the hide ends like a pelt and not a cut line
    def rx(y): # x of the rear edge at y (piecewise linear through rc)
        for (xa, ya), (xb, yb) in zip(rc, rc[1:]):
            if ya <= y <= yb: return xa + (xb - xa) * (y - ya) / (yb - ya)
        return rc[-1][0]
    y0 = lower(r + 1.0)[1] + .8; y = y0
    while y + per * .9 < lower(r + 1.0)[0] - .8:
        ya, yc, ym = y, y + per * .9, y + per * .45
        tufts.append(Polygon([(rx(ya) + .15, ya), (rx(yc) + .15, yc), (rx(ym) - amp * .8 * (.8 + .2 * math.sin(ym * 2.3)), ym)])); y += per * .9
    shape = unary_union([base0] + tufts)
    shape = shape.buffer(-.15, join_style=1).buffer(.15, join_style=1)
    if isinstance(shape, MultiPolygon): shape = max(shape.geoms, key=lambda g: g.area)
    top = lambda x: lower(x)[1]
    out = {'base': path(shape), 'shade': path(shape.difference(affinity.translate(shape, 0, -1.1)).buffer(-.05, join_style=1).buffer(.05, join_style=1)),
           'light': path(shape.difference(affinity.translate(shape, 0, .8)).buffer(-.05, join_style=1).buffer(.05, join_style=1))}
    # stitching: a seam one even inset inside the back and neck edges, ticks at equal spacing along it, each perpendicular to the seam
    inset = shape.buffer(-.7, join_style=1)
    if isinstance(inset, MultiPolygon): inset = max(inset.geoms, key=lambda g: g.area)
    ring = inset.exterior; N = int(ring.length / .05); samp = [ring.interpolate(i * .05) for i in range(N)]
    keep = [p.y <= (top(p.x) if top(p.x) is not None else -99) + 1.25 and body.exterior.distance(p) < 1.0 for p in samp]
    # rotate so the kept run is contiguous, then take the longest run
    runs, cur = [], []
    for p, k in zip(samp + samp, keep + keep):
        if k: cur.append((p.x, p.y))
        elif cur: runs.append(cur); cur = []
    if cur: runs.append(cur)
    line = max(runs, key=len); line = line[:len(line) // 2 + len(line) // 2] if len(runs) == 1 and len(line) > N else line
    seam = LineString(line); out['seam'] = 'M' + ' L'.join(f'{x:.2f} {y:.2f}' for x, y in line[::4])
    ticks = ''; pos = .5
    while pos < seam.length - .4:
        p, q = seam.interpolate(pos), seam.interpolate(pos + .08); tx, ty = q.x - p.x, q.y - p.y; h = math.hypot(tx, ty) or 1; tx, ty = tx / h, ty / h; nx, ny = -ty, tx
        ticks += f'M{p.x - nx * .3 + tx * .15:.2f} {p.y - ny * .3 + ty * .15:.2f} L{p.x + nx * .3 - tx * .15:.2f} {p.y + ny * .3 - ty * .15:.2f} '; pos += .8
    out['ticks'] = ticks.strip()
    out['gem'] = t['gem']                                              # a brooch on the shoulder, from the mount
    return out

def part_poly(p):
    if 'poly' in p: return Polygon(p['poly']).buffer(0)
    if 'line' in p: a, b = p['line']; return LineString([a, b]).buffer(p['sw'] / 2)
    if 'circle' in p: x, y, rr = p['circle']; return Point(x, y).buffer(rr)
    if 'ellipse' in p: x, y, rx, ry = p['ellipse']; return affinity.scale(Point(x, y).buffer(1), rx, ry)
    if 'd' in p: return Polygon(R.sample(parse_path(p['d']), 120)).buffer(0)
    return None

def tail_at(m, t):
    """a point on a dog's tail and its direction (toward the tip). bezier mounts take the curve parameter t; catmull mounts take the fraction of arc length, as in gear.js"""
    if m['kind'] == 'bezier':
        p = cub(m['c'], t); q = cub(m['c'], min(1, t + .001)); d = math.hypot(q[0] - p[0], q[1] - p[1]) or 1; return p[0], p[1], (q[0] - p[0]) / d, (q[1] - p[1]) / d
    pts = m['pts']; P = [pts[0]] + pts + [pts[-1]]; c = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(10):
            u = k / 10; u2 = u * u; u3 = u2 * u; c.append(tuple(.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3) for j in (0, 1)))
    c.append(tuple(pts[-1])); sa = [0]
    for i in range(1, len(c)): sa.append(sa[-1] + math.dist(c[i], c[i - 1]))
    tot = sa[-1]; i = 0
    while i < len(c) - 2 and sa[i + 1] / tot < t: i += 1
    f = (t * tot - sa[i]) / ((sa[i + 1] - sa[i]) or 1); x = c[i][0] + (c[i + 1][0] - c[i][0]) * f; y = c[i][1] + (c[i + 1][1] - c[i][1]) * f
    a, b = c[max(0, i - 1)], c[min(len(c) - 1, i + 2)]; d = math.hypot(b[0] - a[0], b[1] - a[1]) or 1; return x, y, (b[0] - a[0]) / d, (b[1] - a[1]) / d

def sleeves(rig, mounts):
    """Armor sleeves for the legs, cut from each dog's own leg shapes: a hind sleeve on the thigh, a front sleeve on the upper arm (and a short second piece on the
       forearm when the dog's elbow sits above the cut). Each ends flat and square to its bone, a little above the knee, with hide tufts and a stitched hem.
       Pieces are in the joint's rest frame; they swing with the leg."""
    D = R.rigs[rig]; J = {j['id']: j for j in D['joints']}; sl = mounts['torso']['sleeve']; out = {}
    def shape_of(jid): return unary_union([q for q in (part_poly(p) for p in D['parts'] if p.get('in') == jid) if q is not None])
    def unit(a, b): d = math.hypot(b[0] - a[0], b[1] - a[1]); return ((b[0] - a[0]) / d, (b[1] - a[1]) / d, d)
    def make(shape, o, u, cut, pad=.35):
        S = shape.buffer(pad, join_style=1); perp = (-u[1], u[0]); res = {}
        if cut is not None:
            c = (o[0] + u[0] * cut, o[1] + u[1] * cut)
            keep = Polygon([(c[0] + perp[0] * 60, c[1] + perp[1] * 60), (c[0] - perp[0] * 60, c[1] - perp[1] * 60), (c[0] - perp[0] * 60 - u[0] * 120, c[1] - perp[1] * 60 - u[1] * 120), (c[0] + perp[0] * 60 - u[0] * 120, c[1] + perp[1] * 60 - u[1] * 120)])
            chord = LineString([(c[0] + perp[0] * 60, c[1] + perp[1] * 60), (c[0] - perp[0] * 60, c[1] - perp[1] * 60)]).intersection(S)  # measured before cutting: a line on the new edge intersects to nothing
            S = S.intersection(keep)
            # hide tufts along the flat end
            tufts = []
            if hasattr(chord, 'geoms') and not chord.is_empty: chord = max(chord.geoms, key=lambda g: g.length)
            if not chord.is_empty and hasattr(chord, 'coords'):
                e1, e2 = chord.coords[0], chord.coords[-1]; L = math.dist(e1, e2); n = max(2, round(L / 1.25))
                for i in range(n):
                    a0, a1 = i / n, (i + 1) / n; p1 = (e1[0] + (e2[0] - e1[0]) * a0 - u[0] * .1, e1[1] + (e2[1] - e1[1]) * a0 - u[1] * .1); p2 = (e1[0] + (e2[0] - e1[0]) * a1 - u[0] * .1, e1[1] + (e2[1] - e1[1]) * a1 - u[1] * .1)
                    m = ((p1[0] + p2[0]) / 2 + u[0] * .5 * (.75 + .25 * math.sin(i * 2.1 + cut)), (p1[1] + p2[1]) / 2 + u[1] * .5 * (.75 + .25 * math.sin(i * 2.1 + cut))); tufts.append(Polygon([p1, p2, m]))
                S = unary_union([S] + tufts)
                # stitched hem a little inside the end
                h = (c[0] - u[0] * .6, c[1] - u[1] * .6); hl = LineString([(h[0] + perp[0] * 60, h[1] + perp[1] * 60), (h[0] - perp[0] * 60, h[1] - perp[1] * 60)]).intersection(S.buffer(-.35))
                if hasattr(hl, 'geoms') and not hl.is_empty: hl = max(hl.geoms, key=lambda g: g.length)
                if not hl.is_empty and hasattr(hl, 'coords'):
                    f1_, f2_ = hl.coords[0], hl.coords[-1]; res['seam'] = f'M{f1_[0]:.2f} {f1_[1]:.2f} L{f2_[0]:.2f} {f2_[1]:.2f}'
                    tk = ''; Lh = math.dist(f1_, f2_); pos = .5
                    while pos < Lh - .3:
                        px, py = f1_[0] + (f2_[0] - f1_[0]) * pos / Lh, f1_[1] + (f2_[1] - f1_[1]) * pos / Lh
                        tk += f'M{px - u[0] * .3 - perp[0] * .12:.2f} {py - u[1] * .3 - perp[1] * .12:.2f} L{px + u[0] * .3 + perp[0] * .12:.2f} {py + u[1] * .3 + perp[1] * .12:.2f} '; pos += .8
                    res['ticks'] = tk.strip()
        S = S.buffer(-.12, join_style=1).buffer(.12, join_style=1)
        res['base'] = path(S); res['shade'] = path(S.difference(affinity.translate(S, -1.0, 0)).buffer(-.04, join_style=1).buffer(.04, join_style=1)); res['light'] = path(S.difference(affinity.translate(S, .8, 0)).buffer(-.04, join_style=1).buffer(.04, join_style=1))
        return res
    # hind: thigh, from the hip to just above the stifle
    hip, stifle = tuple(J['hipN']['at']), tuple(J['shankN']['at']); ux, uy, L = unit(hip, stifle); cut = L - sl['hindGap']
    ycut = hip[1] + uy * cut
    hind = make(shape_of('hipN'), hip, (ux, uy), cut); out['hipN'] = hind; out['hipF'] = hind
    # front: upper arm; if the elbow is above the cut, a short forearm piece carries on to the same height
    sh, elbow, wrist = tuple(J['shN']['at']), tuple(J['foreN']['at']), tuple(J['pastN']['at']); vx, vy, Lu = unit(sh, elbow)
    ycut = sl.get('frontY', ycut)                                       # optional: where the front sleeve ends (a y in the rest pose); default the same height as the hind sleeve
    if ycut > elbow[1] + .3:
        up = make(shape_of('shN'), sh, (vx, vy), None); wx, wy, Lw = unit(elbow, wrist); lo = make(shape_of('foreN'), elbow, (wx, wy), (ycut - elbow[1]) / wy)
        out['shN'] = up; out['shF'] = up; out['foreN'] = dict(lo, host='shN', follow='foreN'); out['foreF'] = dict(lo, host='shF', follow='foreF')   # hosted at the top of the leg so it draws above the leg sock
    else:
        up = make(shape_of('shN'), sh, (vx, vy), Lu - max(0.0, elbow[1] - ycut) / max(vy, .3)); out['shN'] = up; out['shF'] = up
    # tail sleeve: the tail's own shape from the root to just short of the tip, a little wider, cut square to the tail, with the same tufts and hem; it goes under the tail guard
    ts = sl.get('tail')
    if ts and 'tail' in mounts:
        tx0, ty0, tdx, tdy = tail_at(mounts['tail'], ts['end']); out['tail'] = make(shape_of('tail'), (tx0, ty0), (tdx, tdy), 0.0, pad=ts.get('pad', .22))
    return out

def joint_shape(rig, jid):
    D = R.rigs[rig]; return unary_union([q for q in (part_poly(p) for p in D['parts'] if p.get('in') == jid) if q is not None])

def _ring(poly, step=.08):
    ext = poly.exterior; n = max(12, int(ext.length / step)); return [ext.interpolate(i * ext.length / n) for i in range(n)]

def _runs(pts, keep):
    """contiguous runs of kept points around a closed ring (the ring is cut open where it is not kept)"""
    n = len(pts)
    if all(keep): return [pts + [pts[0]]]
    st = next(i for i, k in enumerate(keep) if not k); runs, cur = [], []
    for i in range(n):
        p, k = pts[(st + i) % n], keep[(st + i) % n]
        if k: cur.append(p)
        elif cur: runs.append(cur); cur = []
    if cur: runs.append(cur)
    return runs

def _open_path(runs): return ' '.join('M' + ' L'.join(f'{p.x:.2f} {p.y:.2f}' for p in (r[::3] + ([r[-1]] if (len(r) - 1) % 3 else []))) for r in runs if len(r) > 3)

def _half(o, u, t, keep_le=True, far=80):
    perp = (-u[1], u[0]); c = (o[0] + u[0] * t, o[1] + u[1] * t); d = -1 if keep_le else 1
    return Polygon([(c[0] + perp[0] * far, c[1] + perp[1] * far), (c[0] - perp[0] * far, c[1] - perp[1] * far), (c[0] - perp[0] * far + u[0] * far * d, c[1] - perp[1] * far + u[1] * far * d), (c[0] + perp[0] * far + u[0] * far * d, c[1] + perp[1] * far + u[1] * far * d)])

def pawcovers(rig, mounts):
    """Paw covers: a leg sock and a shoe on each of the four legs. The leg sock is ONE continuous silhouette (the union of the leg's two segments, a little wider)
       split only at the joint between them, with the outline cut open there, so it reads as one piece but bends. It is hosted at the top of the leg and follows each half's own
       joint, so it draws over the thigh sleeve. The shoe covers the paw and is hosted last, so it is over everything. Each entry says which joint hosts it and which it follows."""
    D = R.rigs[rig]; J = {j['id']: j for j in D['joints']}; out = {}; pad = .3
    for side in ('N', 'F'):
        for kind, names, top in (('front', ['fore', 'past', 'ftoe'], 'sh'), ('hind', ['shank', 'meta', 'htoe'], 'hip')):
            ids = [n + side for n in names if n + side in J and joint_shape(rig, n + side).area > 0]; host = top + side
            s0, s1 = ids[0], ids[1]; toe = ids[2] if len(ids) > 2 else None
            a = tuple(J[s0]['at']); b = tuple(J[s1]['at']); L0 = math.dist(a, b); u = ((b[0] - a[0]) / L0, (b[1] - a[1]) / L0)
            shape0 = joint_shape(rig, s0)
            if kind == 'hind': shape0 = unary_union([shape0, Point(*a).buffer(2.2)])                       # the knee cup, centred on the stifle (rotation-safe)
            leg = unary_union([shape0, joint_shape(rig, s1)]).buffer(pad, join_style=1).buffer(-.12, join_style=1).buffer(.12, join_style=1)
            if isinstance(leg, MultiPolygon): leg = max(leg.geoms, key=lambda g: g.area)
            sproj = lambda p: (p.x - a[0]) * u[0] + (p.y - a[1]) * u[1]
            ring = _ring(leg); keep_top = [sproj(p) <= L0 for p in ring]; keep_bot = [sproj(p) > L0 for p in ring]
            top_piece = leg.intersection(_half(a, u, L0 + .5, True)); bot_piece = leg.intersection(_half(a, u, L0 - .5, False))
            # a round cap on the joint in BOTH halves (found by `den sweep`: the flat cut edges part on the convex side of a hard wrist bend and the dog's own leg shows). A disc is the same at every angle, so it
            # covers whatever the bend does; its radius is the leg's half-width at the joint, so it sits inside the sock when the leg is straight.
            def width_at(shape, axis):   # the shape's width at the joint, measured square to that segment's own axis
                nr = (-axis[1], axis[0]); ch = shape.intersection(LineString([(b[0] - nr[0] * 8, b[1] - nr[1] * 8), (b[0] + nr[0] * 8, b[1] + nr[1] * 8)]))
                if ch.is_empty: return 99
                if ch.geom_type != 'LineString': ch = max(ch.geoms, key=lambda g: g.length)
                return ch.length
            endp = tuple(J[ids[2]]['at']) if len(ids) > 2 else (b[0], b[1] + 5); L1 = math.dist(b, endp); u1 = ((endp[0] - b[0]) / L1, (endp[1] - b[1]) / L1)
            # the radius is the NARROWER of the two segments' widths here (on the hind leg the gaskin axis is not the cannon's, so a chord of the joined leg would be too wide and bulge)
            cap = Point(*b).buffer(min(width_at(joint_shape(rig, s0).buffer(pad, join_style=1), u), width_at(joint_shape(rig, s1).buffer(pad, join_style=1), u1)) / 2 - .03, 24)
            top_piece = unary_union([top_piece, cap]); bot_piece = unary_union([bot_piece, cap])
            def lat(S): return {'shade': path(S.difference(affinity.translate(S, -.9, 0)).buffer(-.04, join_style=1).buffer(.04, join_style=1)), 'light': path(S.difference(affinity.translate(S, .7, 0)).buffer(-.04, join_style=1).buffer(.04, join_style=1))}
            sh_leg = leg.difference(affinity.translate(leg, -.9, 0)).buffer(-.04, join_style=1).buffer(.04, join_style=1); li_leg = leg.difference(affinity.translate(leg, .7, 0)).buffer(-.04, join_style=1).buffer(.04, join_style=1)
            def piece(fill, keepmask, shade_zone, jid):
                lines = _open_path(_runs(ring, keepmask)); e = {'host': host, 'follow': jid, 'base': path(fill), 'lines': lines, 'shade': path(shade_zone[0].intersection(fill)) if not shade_zone[0].is_empty and not shade_zone[0].intersection(fill).is_empty else '', 'light': path(shade_zone[1].intersection(fill)) if not shade_zone[1].is_empty and not shade_zone[1].intersection(fill).is_empty else ''}
                return e
            p0 = piece(top_piece, keep_top, (sh_leg, li_leg), s0); p1 = piece(bot_piece, keep_bot, (sh_leg, li_leg), s1)
            # lacing along the leg's axis: the upper half in the upper piece, the lower half in the lower piece
            def lace(p, q, inset_a=.6, inset_b=.6):
                Lq = math.dist(p, q)
                if Lq < 2.2: return None, None
                ux, uy = (q[0] - p[0]) / Lq, (q[1] - p[1]) / Lq; seam = f'M{p[0] + ux * inset_a:.2f} {p[1] + uy * inset_a:.2f} L{q[0] - ux * inset_b:.2f} {q[1] - uy * inset_b:.2f}'
                tk = ''; pos = inset_a + .2
                while pos < Lq - inset_b:
                    px, py = p[0] + ux * pos, p[1] + uy * pos; nx, ny = -uy, ux; tk += f'M{px - nx * .3 - ux * .12:.2f} {py - ny * .3 - uy * .12:.2f} L{px + nx * .3 + ux * .12:.2f} {py + ny * .3 + uy * .12:.2f} '; pos += .8
                return seam, tk.strip()
            end = tuple(J[toe]['at']) if toe else None
            if end is None:
                ln = next((p['line'] for p in D['parts'] if p.get('in') == s1 and 'line' in p), None); end = tuple(ln[1]) if ln else (b[0], b[1] + 5)
            p1['cap'] = path(cap)                                                                   # the lower half strokes the cap's outline under its own fill, so the cap reads as outlined wherever a bend exposes it
            p0['seam'], p0['ticks'] = lace(a, b, .6, 0); p1['seam'], p1['ticks'] = lace(b, end, 0, .6)
            for e in (p0, p1):
                if e['seam'] is None: e.pop('seam'); e.pop('ticks')
            # the shoe: the paw (the toe joint's own shape, or the foot end of the last segment when the dog has no toe joint), a little wider than the sock
            if toe: foot = joint_shape(rig, toe).buffer(.45, join_style=1)
            else:
                ux2, uy2 = (end[0] - b[0]) / math.dist(b, end), (end[1] - b[1]) / math.dist(b, end); foot = joint_shape(rig, s1).intersection(_half(b, (ux2, uy2), math.dist(b, end) - 2.6, False)).buffer(.45, join_style=1)
            if toe:                                                                       # the hind paw is a bare oval: give the shoe an ankle (the cannon's lowest 1.6 units) so it has a cuff to fold
                v = ((end[0] - b[0]) / math.dist(b, end), (end[1] - b[1]) / math.dist(b, end)); cannon = joint_shape(rig, s1).intersection(_half(b, v, math.dist(b, end) - 1.6, False)).buffer(.45, join_style=1)
                foot = unary_union([foot, cannon]).buffer(.3, join_style=1).buffer(-.3, join_style=1)
            foot = foot.buffer(-.12, join_style=1).buffer(.12, join_style=1)
            if isinstance(foot, MultiPolygon): foot = max(foot.geoms, key=lambda g: g.area)
            sh = {'host': host, 'follow': toe or s1, 'base': path(foot), **lat(foot)}
            # details: a folded cuff across the top of the shoe (fitting colour), and a sole strip along the ground edge
            v = ((end[0] - b[0]) / math.dist(b, end), (end[1] - b[1]) / math.dist(b, end)); vproj = lambda x, y: (x - b[0]) * v[0] + (y - b[1]) * v[1]; ptop = min(vproj(x, y) for x, y in foot.exterior.coords)
            cuff = foot.intersection(_half(b, v, ptop + 1.05, True)).buffer(-.03, join_style=1).buffer(.03, join_style=1)
            sole = foot.difference(affinity.translate(foot, 0, -.75)).buffer(-.05, join_style=1).buffer(.05, join_style=1)
            if not cuff.is_empty: sh['cuff'] = path(cuff)
            if not sole.is_empty: sh['sole'] = path(sole)
            out[f'{kind}{side}_sock0'] = p0; out[f'{kind}{side}_sock1'] = p1; out[f'{kind}{side}_shoe'] = sh
    return out

def cuffs(rig, mounts):
    """Cuff seats: for each front leg and each of the two slots, the band's centre, the leg's axis and the leg's width there, measured on the forearm's own shape.
       The cuffs ride the forearm (they follow it) and sit over the sleeve and sock, so the width is the forearm shape a little padded (like the sleeve)."""
    D = R.rigs[rig]; J = {j['id']: j for j in D['joints']}; cf = mounts['paws']['cuff']; out = {}
    for side in ('N', 'F'):
        a = tuple(J['fore' + side]['at']); b = tuple(J['past' + side]['at']); L = math.dist(a, b); u = ((b[0] - a[0]) / L, (b[1] - a[1]) / L); n = (-u[1], u[0])
        shape = joint_shape(rig, 'fore' + side).buffer(.3, join_style=1)
        for i, y in enumerate(cf['y']):
            t = (y - a[1]) / u[1]; c = (a[0] + u[0] * t, y)
            seg = shape.intersection(LineString([(c[0] - n[0] * 8, c[1] - n[1] * 8), (c[0] + n[0] * 8, c[1] + n[1] * 8)]))
            if seg.geom_type != 'LineString': seg = max(seg.geoms, key=lambda g: g.length)
            (x0, y0), (x1, y1) = seg.coords[0], seg.coords[-1]
            out[f'{side}{i}'] = {'c': [round((x0 + x1) / 2, 2), round((y0 + y1) / 2, 2)], 'u': [round(u[0], 4), round(u[1], 4)], 'w': round(seg.length, 2), 'h': cf['h']}
    return out

CORNER = .32  # corner radius of the band, in drawing units (the style sheet's contour weight: corners never sharper than the line itself)
R = Rigs(); out = {}
for rig, mounts in R.mounts.items():
    body = R.silhouette(rig, index=0) if False else R.silhouette(rig)
    body = body.buffer(0)
    m = mounts['collar']
    out[rig] = {'collar': {'base': path(strip(m, -1, 1).intersection(body), CORNER), 'shade': path(strip(m, -1, 0).intersection(body), CORNER / 2), 'light': path(strip(m, .55, .9).intersection(body), .08)}}
    if 'torso' in mounts:
        out[rig]['torso'] = torso(rig, mounts, body)
        if 'sleeve' in mounts['torso']: out[rig]['sleeves'] = sleeves(rig, mounts)
    if 'paws' in mounts:
        out[rig]['paws'] = pawcovers(rig, mounts)
        if 'cuff' in mounts['paws']: out[rig]['cuffs'] = cuffs(rig, mounts)
    print(rig, {k: len(v) for k, v in out[rig]['collar'].items()}, 'base points:', out[rig]['collar']['base'].count('L') + 1)
import json as _json
js = '/* BEGIN COMPILED (tools/lens/compile_mounts.py writes this; do not hand-edit) */\nconst COMPILED = {\n' + ',\n'.join(f'  {rig}: ' + _json.dumps(v, separators=(',', ':')) for rig, v in out.items()) + '\n};\n/* END COMPILED */'
s = GEAR.read_text()
if '/* BEGIN COMPILED' in s: s = re.sub(r'/\* BEGIN COMPILED.*?/\* END COMPILED \*/', lambda _: js, s, flags=re.S)
else: s = s.replace('const mountOf =', js + '\nconst mountOf =', 1)
GEAR.write_text(s); print('wrote', GEAR)
