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
    g = geom.simplify(.004, preserve_topology=True); c = list(g.exterior.coords)[:-1]
    return 'M' + ' L'.join(f'{x:.2f} {y:.2f}' for x, y in c) + ' Z'

CORNER = .32  # corner radius of the band, in drawing units (the style sheet's contour weight: corners never sharper than the line itself)
R = Rigs(); out = {}
for rig, mounts in R.mounts.items():
    body = R.silhouette(rig, index=0) if False else R.silhouette(rig)
    body = body.buffer(0)
    m = mounts['collar']
    out[rig] = {'collar': {'base': path(strip(m, -1, 1).intersection(body), CORNER), 'shade': path(strip(m, -1, 0).intersection(body), CORNER / 2), 'light': path(strip(m, .55, .9).intersection(body), .08)}}
    print(rig, {k: len(v) for k, v in out[rig]['collar'].items()}, 'base points:', out[rig]['collar']['base'].count('L') + 1)
js = '/* BEGIN COMPILED (tools/lens/compile_mounts.py writes this; do not hand-edit) */\nconst COMPILED = {\n' + ',\n'.join(
    f'  {rig}: {{collar:{{base:"{v["collar"]["base"]}", shade:"{v["collar"]["shade"]}", light:"{v["collar"]["light"]}"}}}}' for rig, v in out.items()) + '\n};\n/* END COMPILED */'
s = GEAR.read_text()
if '/* BEGIN COMPILED' in s: s = re.sub(r'/\* BEGIN COMPILED.*?/\* END COMPILED \*/', lambda _: js, s, flags=re.S)
else: s = s.replace('const mountOf =', js + '\nconst mountOf =', 1)
GEAR.write_text(s); print('wrote', GEAR)
