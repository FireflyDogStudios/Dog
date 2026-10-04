"""Den Lens: is the art CLEAN? Checks a worn gear piece against the style sheet and the cleanliness standards, in numbers.
   python3 tools/lens/lint.py <code> [<code> ...] [--rig hero,hero2]        e.g. lint.py k2310000
   Checks per dog: (1) FLUSH: no filled part lies outside the dog's body outline (outlines may sit just outside, by their own width), (2) NO GAP: the dog's own
   collar footprint is covered by the piece's base, within the corner rounding, (3) STRAY: no filled fragment below a minimum area, (4) SPURS: no corner sharper than the contour
   weight can render, (5) DUPLICATE POINTS: no two nodes closer than 0.02, (6) WEIGHTS: every stroke is on the style sheet (2× contour/interior/detail, or a known mark).
   Exits non-zero when anything fails, so it can gate a commit."""
import sys, json, math, subprocess, pathlib, os, re
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from geom import Rigs
from svgpathtools import parse_path
from shapely.geometry import Polygon, Point

ROOT = pathlib.Path(__file__).resolve().parents[2]; LENS = ROOT / 'tools/lens/lens.cjs'
LINE = {k: float(v) for k, v in re.findall(r'(\w+):(\.?\d+\.?\d*)', re.search(r'const LINE = \{([^}]*)\}', (ROOT / 'engine/gear.js').read_text()).group(1))}  # the style sheet, read from gear.js
OK_STROKES = {round(2 * v, 2) for v in LINE.values()} | {round(2 * LINE['contour'] + 1.0, 2)}  # outlines under fills, and the rarity glow
OK_LINES = {round(v, 2) for v in LINE.values()}   # a drawn line (rope tails etc.) at one of the three weights, or the rope's own mark weights below
KNOWN_MARKS = {.45, .55, .35}                      # rope ticks and tails: a mark's weight, listed so the sheet knows about it
args = [a for a in sys.argv[1:] if not a.startswith('--')]; rigs = ['hero', 'hero2']
for a in sys.argv[1:]:
    if a.startswith('--rig'): rigs = (a.split('=')[1] if '=' in a else sys.argv[sys.argv.index(a) + 1]).split(',')
R = Rigs(); fails = 0
def poly_of(d):
    try: pts = [(z.real, z.imag) for sub in parse_path(d).continuous_subpaths() for z in [sub.point(i / 60) for i in range(60)]]
    except Exception: return None
    return Polygon(pts).buffer(0) if len(pts) > 2 else None
codes = [a for a in args if a not in rigs]
out = ROOT / 'tools/lens/.cache/pieces.json'   # one browser launch for every dog × code
subprocess.run(['node', str(LENS), 'piece', '--rig', ','.join(rigs), '--gear', ','.join(codes), '--out', str(out)], check=True, cwd=ROOT, env={**os.environ, 'NODE_PATH': str(ROOT / 'node_modules')}, capture_output=True)
for piece in json.load(open(out)):
    code, rig = piece['code'], piece['rig']
    body = R.silhouette(rig).buffer(0); problems = []
    base = next((p for p in piece['parts'] if p.get('paint') == 'band' and p.get('d')), None)
    for i, p in enumerate(piece['parts']):
        tag = f"part {i} ({p.get('paint')})"
        if p.get('d'):
            nodes = re.findall(r'(-?\d+\.?\d*) (-?\d+\.?\d*)', p['d']); pts = [(float(x), float(y)) for x, y in nodes]
            dup = sum(1 for a, b in zip(pts, pts[1:]) if math.dist(a, b) < .02)
            if dup: problems.append(f'{tag}: {dup} duplicate nodes (closer than 0.02)')
            if p.get('stroke'):
                if round(p.get('sw', 1), 2) not in OK_STROKES: problems.append(f"{tag}: stroke width {p.get('sw')} is not on the style sheet {sorted(OK_STROKES)}")
            else:
                pg = poly_of(p['d'])
                if pg is not None and pg.area > 0:
                    if pg.area < .03: problems.append(f'{tag}: stray fragment, area {pg.area:.3f}')
                    if p.get('paint') in ('band', 'bandS', 'bandL') and pg.difference(body).area > .02: problems.append(f'{tag}: {pg.difference(body).area:.3f} units² outside the dog (not flush)')
                    c = list(pg.exterior.coords)[:-1]
                    for j in range(len(c)):
                        a, b, d = c[j - 1], c[j], c[(j + 1) % len(c)]
                        v1, v2 = (a[0] - b[0], a[1] - b[1]), (d[0] - b[0], d[1] - b[1]); n1, n2 = math.hypot(*v1), math.hypot(*v2)
                        if n1 > .08 and n2 > .08:
                            ang = math.degrees(math.acos(max(-1, min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / (n1 * n2)))))
                            if ang < 28 and p.get('paint') == 'band': problems.append(f'{tag}: spur, a {ang:.0f}° corner at ({b[0]:.2f}, {b[1]:.2f})'); break
        elif p.get('line') and round(p.get('sw', 1), 2) not in OK_LINES | KNOWN_MARKS: problems.append(f"{tag}: line weight {p.get('sw')} is not on the style sheet")
    own = next((q for q in R.parts(rig, 'body') if q.get('paint') == 'collar'), None)
    if own and base:
        gap = poly_of(own['d']).intersection(body).difference(poly_of(base['d'])).area
        if gap > .35: problems.append(f"gap: {gap:.2f} units² of the dog's own collar footprint is not covered (more than the corner rounding explains)")
    print(f"{'FAIL' if problems else 'ok  '} {code} on {rig}" + ''.join('\n   - ' + q for q in problems)); fails += bool(problems)
sys.exit(1 if fails else 0)
