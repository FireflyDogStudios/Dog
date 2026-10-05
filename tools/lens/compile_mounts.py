"""Den Lens: compile each dog's collar mount into clean closed shapes (shapely), and write them into engine/gear.js between the COMPILED markers.
   python3 tools/lens/compile_mounts.py            (re-run whenever a dog's body outline or a MOUNTS row changes)
   The collar band is the footprint between the mount's edges R and F, run a little past both ends and CUT to the dog's body outline, so it is one closed
   path that is flush on the fur, with no clip mask, no overlap and no stray end stroke at runtime. Shade and light strips are cut the same way."""
import sys, re, pathlib, subprocess
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

CORNER = .32  # corner radius of the band, in drawing units (the style sheet's contour weight: corners never sharper than the line itself)
R = Rigs(); out = {}
for rig, mounts in R.mounts.items():
    body = R.silhouette(rig, index=0) if False else R.silhouette(rig)
    body = body.buffer(0)
    m = mounts['collar']
    out[rig] = {'collar': {'base': path(strip(m, -1, 1).intersection(body), CORNER), 'shade': path(strip(m, -1, 0).intersection(body), CORNER / 2), 'light': path(strip(m, .55, .9).intersection(body), .08)}}
    if 'torso' in mounts: out[rig]['torso'] = torso(rig, mounts, body)
    print(rig, {k: len(v) for k, v in out[rig]['collar'].items()}, 'base points:', out[rig]['collar']['base'].count('L') + 1)
import json as _json
js = '/* BEGIN COMPILED (tools/lens/compile_mounts.py writes this; do not hand-edit) */\nconst COMPILED = {\n' + ',\n'.join(f'  {rig}: ' + _json.dumps(v, separators=(',', ':')) for rig, v in out.items()) + '\n};\n/* END COMPILED */'
s = GEAR.read_text()
if '/* BEGIN COMPILED' in s: s = re.sub(r'/\* BEGIN COMPILED.*?/\* END COMPILED \*/', lambda _: js, s, flags=re.S)
else: s = s.replace('const mountOf =', js + '\nconst mountOf =', 1)
GEAR.write_text(s); print('wrote', GEAR)
