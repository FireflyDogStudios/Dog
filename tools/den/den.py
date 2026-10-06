#!/usr/bin/env python3
"""den: Firefly's kit V2, ONE command for the gear art. V1 (tools/lens, git tag kit-v1) stays untouched and every V1 tool is reachable from here.

   python3 tools/den/den.py <command> [options]          (or `./den <command>` from the repo root)

   look      shot | probe | export | piece | compile | place-band | measure | refoverlay | diff1      V1 tools, unchanged (passthrough)
   check     lint [codes]        everything below in one run (V1 geometry lint + the V2 checks); non-zero exit on any failure
             sweep [codes]       gait sweep: the ID pass at 16 gait phases on both dogs; holes (the dog's own leg showing between two gear pieces), visibility
             order [codes]       draw order asserted from the render order (sock < sleeve < cuff, guard < rings, torso over legs, collar over torso)
             xcheck [codes]      analytic vs rendered: for sample points, the topmost gear part computed from the data must match the ID pass
             determinism [codes] the same code rendered twice from scratch must be pixel-identical (a stray Math.random fails this)
             flush [codes]       numeric flush score per piece per dog (area outside the body, Hausdorff along the seat), against tools/den/baselines.json
             legibility [codes]  line weights in pixels at game scale, and gear-vs-coat colour contrast (CIEDE2000)
             sample [n]          n random codes across every kind through lint (the code space is large; this samples it)
   species   species [names] [--sheet wolf]   real canid proportions (AwA-Pose keypoints, ref/awa-pose) next to hero2's; --sheet gives a species' style-preserving targets
   compare   diff a.png b.png [--engine ssim|pixelmatch]   before/after images, V1's SSIM or the anti-aliasing-aware pixelmatch
   report    report [codes]      runs every check, writes tools/den/reports/<time>.md
   admin     doctor              what is installed (and the optional backends that can be added); baseline [--update]

   The default code set is one of every kind (collar, guard, three rings, armor, paw covers, four bracelets). Pass codes to test others.
   Everything measures in drawing units (62x38). The ID pass is the second opinion: it needs no colours, no eyeballs, and no palette luck."""
import sys, os, re, json, math, subprocess, pathlib, time, random, argparse
ROOT = pathlib.Path(__file__).resolve().parents[2]; DEN = ROOT / 'tools/den'; LENS = ROOT / 'tools/lens'; CACHE = DEN / '.cache'; CACHE.mkdir(exist_ok=True, parents=True)
sys.path.insert(0, str(LENS))
ENV = {**os.environ, 'NODE_PATH': str(ROOT / 'node_modules')}
DEFAULT_SET = ['h0000000', 'k0000000', 't0000000', 'r0000000', 'r1000000', 'r2000000', 'c0000000', 'p0000000', 'b0000000', 'b1000000', 'b2000000', 'b3000000']
RIGS = ['hero', 'hero2']
LEG = re.compile(r'^(sh|fore|past|ftoe|hip|shank|meta|htoe)[NF]$')
FAILS = []   # every failure message of this run

def node(script, *a, capture=False):
    r = subprocess.run(['node', str(script), *map(str, a)], cwd=ROOT, env=ENV, capture_output=capture, text=True)
    if r.returncode: raise SystemExit((r.stderr or '') + f'\n{script.name} failed')
    return r.stdout
def say(s=''): print(s, flush=True)
def fail(msg): FAILS.append(msg); say('  FAIL ' + msg)
def codes_of(args): return [c for c in args if re.match(r'^[a-z][0-9a-z]+$', c)] or DEFAULT_SET

# ---------- the ID pass ----------
def idframes(codes, rigs=RIGS, phases=('standing',), scale=12):
    import numpy as np
    from PIL import Image
    out = CACHE / 'ids'; [f.unlink() for f in out.glob('*') if f.is_file()] if out.exists() else None
    ph = ','.join(str(p) for p in phases)
    node(DEN / 'bridge.cjs', 'idframes', '--rig', ','.join(rigs), '--gear', ','.join(codes), '--phases', ph, '--scale', scale, '--out', out)
    frames, legends = {}, {}
    for rig in rigs:
        legends[rig] = {int(k): v for k, v in json.load(open(out / f'legend_{rig}.json'))['legend'].items()}
        for pi, p in enumerate(phases):
            a = np.array(Image.open(out / f'{rig}_{pi}.png').convert('RGB')).astype(np.int64); frames[(rig, str(p))] = a[..., 0] << 16 | a[..., 1] << 8 | a[..., 2]
    return frames, legends

def classes(legend, size):
    import numpy as np
    c = np.zeros(size + 1, dtype=np.int8)   # 0 empty, 1 the dog's leg, 2 the dog (other), 3 gear
    for i, v in legend.items():
        c[i] = 3 if v['kind'] == 'gear' else (1 if LEG.match(v.get('joint') or '') else 2)
    return c

# ---------- checks ----------
def check_sweep(codes, n=16, scale=12):
    import numpy as np
    say(f'sweep: ID pass at standing + {n} gait phases, both dogs, {len(codes)} pieces, scale {scale}')
    phases = ['standing'] + [round(i / n, 4) for i in range(n)]
    frames, legends = idframes(codes, RIGS, phases, scale); worst = {}
    for rig in RIGS:
        leg = legends[rig]; cls = classes(leg, max(leg)); base_vis = None; vis_by = {}
        for ph in phases:
            ids = frames[(rig, str(ph))]; cat = cls[ids]; holes = []
            for x in range(cat.shape[1]):   # leg-coloured run sandwiched between gear above and below, in one column: bare leg showing through a seam
                col = cat[:, x]; nz = np.nonzero(np.diff(col, prepend=0))[0]
                if len(nz) < 3: continue
                runs = [(int(col[s]), s, (nz[i + 1] if i + 1 < len(nz) else len(col)) - s) for i, s in enumerate(nz)]; runs = [r for r in runs if r[0] != 0]
                for j in range(1, len(runs) - 1):
                    if runs[j][0] == 1 and runs[j - 1][0] == 3 and runs[j + 1][0] == 3: holes.append((x, runs[j][1], runs[j][2]))
            wid = max((h[2] for h in holes), default=0) / scale; px = sum(h[2] for h in holes)
            where = max(holes, key=lambda h: h[2]) if holes else None
            worst.setdefault(rig, []).append((ph, px, wid, (round(float(where[0]) / scale, 1), round(float(where[1]) / scale, 1)) if where else None))
            for i in np.unique(ids):
                v = leg.get(int(i))
                if v and v['kind'] == 'gear': vis_by.setdefault((v['piece'], v['layer']), {}).setdefault(ph, 0); vis_by[(v['piece'], v['layer'])][ph] += int((ids == i).sum())
        w = max(worst[rig], key=lambda t: t[1]); st = next(t for t in worst[rig] if t[0] == 'standing')
        say(f'  {rig}: bare-leg pixels between gear: standing {st[1]} px (widest {st[2]:.2f}u); worst phase {w[0]}: {w[1]} px, widest {w[2]:.2f}u at {w[3]}')
        bad_ph = [f'{t[0]}({t[1]}px)' for t in worst[rig] if t[1] and t[0] != 'standing']
        if bad_ph: say(f'    phases with bare leg showing: ' + ', '.join(bad_ph))
        if w[2] >= .2: fail(f'sweep {rig}: a {w[2]:.2f}u strip of bare leg shows between gear at phase {w[0]} near {w[3]}')
        low = []
        for (code, layer), by in vis_by.items():
            st_px = by.get('standing', 0)
            if st_px >= 30:
                m = min((v for k, v in by.items() if k != 'standing'), default=st_px)
                if m < .35 * st_px: low.append(f'{code}/L{layer} {m}/{st_px}px')
        if low: say(f'    note: mostly hidden at some phase (covered by the body or another piece): ' + ', '.join(low[:6]))

def roles(legend):
    """what each gear Graphics is, for the order rules: (role, host)"""
    out = {}
    for i, v in legend.items():
        if v['kind'] != 'gear': continue
        k, j = v['pkind'], v['joint'] or ''
        if k == 'paws': role = 'shoe' if re.match(r'^(ftoe|htoe)', v.get('follow') or '') else 'sock'
        elif k == 'armor': role = 'tailsleeve' if j.startswith('tail') else ('sleeve' if re.match(r'^(sh|hip)[NF]$', j) else 'torso')
        elif k and k.startswith('cuff'): role = 'cuff'
        elif k == 'tailguard': role = 'guard'
        elif k and k.startswith('ring'): role = 'ring'
        elif k == 'collar': role = 'collar'
        elif k == 'helmet': role = 'hood'
        else: role = k
        out[i] = (role, j)
    return out

def check_order(codes):
    say('order: draw order asserted from the render order')
    _, legends = idframes(codes, RIGS, ('standing',), 4)
    for rig in RIGS:
        L = legends[rig]; R = roles(L); ords = lambda pred: [L[i]['ord'] for i, (r, h) in R.items() if pred(r, h)]
        rules = []
        for host in ('shN', 'shF', 'hipN', 'hipF'):
            rules += [(f'sock under sleeve on {host}', ords(lambda r, h: r == 'sock' and h == host), ords(lambda r, h: r == 'sleeve' and h == host)),
                      (f'sleeve under cuff on {host}', ords(lambda r, h: r == 'sleeve' and h == host), ords(lambda r, h: r == 'cuff' and h == host))]
        legs = ords(lambda r, h: r in ('sock', 'sleeve', 'cuff') and bool(LEG.match(h)))
        rules += [('tail sleeve under guard', ords(lambda r, h: r == 'tailsleeve'), ords(lambda r, h: r == 'guard')), ('guard under rings', ords(lambda r, h: r == 'guard'), ords(lambda r, h: r == 'ring')),
                  ('torso over every leg piece', legs, ords(lambda r, h: r == 'torso')), ('collar over torso', ords(lambda r, h: r == 'torso'), ords(lambda r, h: r == 'collar')), ('collar over hood', ords(lambda r, h: r == 'hood'), ords(lambda r, h: r == 'collar'))]
        bad = 0
        for name, lower, upper in rules:
            if not lower or not upper: continue
            if max(lower) >= min(upper): fail(f'order {rig}: {name} is violated (lower piece draws at {max(lower)}, upper at {min(upper)})'); bad += 1
        say(f'  {rig}: {sum(1 for _, a, b in rules if a and b)} rules checked, {bad} violated')

def part_geom(part):
    from shapely.geometry import Polygon, LineString, Point
    from svgpathtools import parse_path
    if part.get('circle'): x, y, r = part['circle']; return Point(x, y).buffer(r, 24)
    if part.get('line'): (x1, y1), (x2, y2) = part['line'][:2]; return LineString([(x1, y1), (x2, y2)]).buffer(part.get('sw', 1) / 2, 8)
    if part.get('d'):
        try: pts = [(z.real, z.imag) for sub in parse_path(part['d']).continuous_subpaths() for z in [sub.point(i / 40) for i in range(41)]]
        except Exception: return None
        if len(pts) < 2: return None
        if part.get('stroke'): return LineString(pts).buffer(part.get('sw', 1) / 2, 8)
        return Polygon(pts).buffer(0) if len(pts) > 2 else None
    return None

def pieces_json(codes):
    out = CACHE / 'pieces.json'; node(LENS / 'lens.cjs', 'piece', '--rig', ','.join(RIGS), '--gear', ','.join(codes), '--out', out)
    return {(p['rig'], p['code']): p for p in json.load(open(out))}

def check_xcheck(codes, scale=14, n=900):
    import numpy as np
    say('xcheck: topmost gear part computed from the data vs the ID pass (standing pose)')
    frames, legends = idframes(codes, RIGS, ('standing',), scale); P = pieces_json(codes); rnd = random.Random(7)
    for rig in RIGS:
        L = legends[rig]; ids = frames[(rig, 'standing')]; gear = sorted([(v['ord'], i, v) for i, v in L.items() if v['kind'] == 'gear'])
        geoms = []; skipped = 0
        for _, i, v in gear:
            pc = P.get((rig, v['piece'])); layers = pc['layers'] if pc else []
            parts = layers[v['layer']]['parts'] if v['layer'] < len(layers) else []
            g = part_geom(parts[v['part']]) if v['part'] < len(parts) else None
            if g is None or g.is_empty: skipped += 1
            elif v.get('m'):
                from shapely.affinity import affine_transform
                a, b, c, d, tx, ty = v['m']; g = affine_transform(g, [a, c, b, d, tx, ty])   # where this pose put the part (follow hosts, body bob, joint bends)
            geoms.append((i, g))
        ys, xs = np.nonzero(np.isin(ids, [i for i, v in L.items() if v['kind'] == 'gear'])); agree = tot = 0; bad = []
        from shapely.geometry import Point
        def top_at(x, y):
            pt = Point(x, y); top = None
            for i, g in geoms:
                if g is not None and g.contains(pt): top = i
            return top
        for k in rnd.sample(range(len(xs)), min(n, len(xs))):
            px, py = xs[k], ys[k]; x, y = (px + .5) / scale, (py + .5) / scale; rid = int(ids[py, px]); tot += 1; e = .7 / scale   # an edge pixel may belong to the neighbouring part: allow half a pixel of slack
            tops = {top_at(x + dx, y + dy) for dx, dy in ((0, 0), (e, 0), (-e, 0), (0, e), (0, -e))}
            if rid in tops: agree += 1
            else: bad.append((round(float(x), 2), round(float(y), 2), f'data top {sorted(t for t in tops if t)}, render {rid} {L[rid].get("piece")}/L{L[rid].get("layer")}/{L[rid].get("paint")}'))
        rate = agree / tot if tot else 1
        say(f'  {rig}: {agree}/{tot} points agree ({rate:.1%}); {skipped} parts without analytic geometry')
        import collections
        by = collections.Counter(re.search(r'render \d+ (\S+?)/(L\d+)', b[2]).group(1, 2) for b in bad if re.search(r'render \d+ (\S+?)/(L\d+)', b[2]))
        if bad: say('    mismatches by piece/layer: ' + ', '.join(f'{k[0]}/{k[1]} x{v}' for k, v in by.most_common(4)) + '   (self-crossing hem shapes are the known soft spot of the analytic polygons)')
        if rate < .95: fail(f'xcheck {rig}: only {rate:.1%} agreement; first mismatches {bad[:4]}')

def check_determinism(codes, scale=8):
    say('determinism: each frame built twice from scratch must be pixel-identical')
    out = node(DEN / 'bridge.cjs', 'hashes', '--rig', ','.join(RIGS), '--gear', ','.join(codes), '--phases', 'standing,.3', '--scale', scale, capture=True)
    res = json.loads(out.strip().splitlines()[-1]); bad = [r for r in res if not r['same']]
    say(f'  {len(res)} frames, {len(bad)} differ between two builds')
    for r in bad: fail(f"determinism: {r['code']} on {r['rig']} at {r['phase']} differs between two renders")
    P = pieces_json(codes)
    for c in codes:
        a, b = P.get(('hero', c)), P.get(('hero2', c))
        if a and b:
            sh = lambda p: [[q.get('paint') for q in L['parts']] for L in p['layers']]
            if sh(a) != sh(b): say(f'  note: {c} has a different part list on the two dogs ({sum(len(L) for L in sh(a))} vs {sum(len(L) for L in sh(b))} parts)')

def check_flush(codes, update=False):
    from geom import Rigs
    from shapely.ops import unary_union
    from shapely.geometry import Polygon
    say('flush: area outside the body and Hausdorff distance along the seat')
    R = Rigs(); P = pieces_json([c for c in codes if c[0] in 'kc']); base = json.load(open(DEN / 'baselines.json')) if (DEN / 'baselines.json').exists() else {}; new = {}
    for (rig, code), pc in P.items():
        body = R.silhouette(rig).buffer(0)
        polys = [g for L in pc['layers'] for p in L['parts'] if not p.get('stroke') and p.get('paint') in ('band', 'm') and (g := part_geom(p)) is not None and not g.is_empty and L['joint'] in ('body', 'root', None)]
        if not polys: continue
        u = unary_union(polys); out = u.difference(body).area
        seat = u.boundary.intersection(body.boundary.buffer(.8))   # the part of the piece's edge that lies along the body's edge; directed distance from it to the body outline
        hd = max((body.boundary.distance(seat.interpolate(t, normalized=True)) for t in [i / 80 for i in range(81)]), default=0.0) if not seat.is_empty and seat.length > 0 else 0.0
        key = f'{rig}:{code}'; new[key] = {'outside': round(out, 3), 'hausdorff': round(hd, 3)}; b = base.get(key)
        say(f'  {key}: outside {out:.3f}u², Hausdorff {hd:.3f}u' + (f' (baseline {b["outside"]}, {b["hausdorff"]})' if b else ' (no baseline yet)'))
        if b and (out > b['outside'] + .1 or hd > b['hausdorff'] + .15): fail(f'flush {key}: drifted from its baseline')
    if update: base.update(new); json.dump(base, open(DEN / 'baselines.json', 'w'), indent=1); say('  baselines updated')

def check_legibility(codes, scales=(1.42, 6.0)):
    import numpy as np
    from skimage.color import rgb2lab, deltaE_ciede2000
    say('legibility: line weights in pixels, and gear colour against the coat')
    LINE = {k: float(v) for k, v in re.findall(r'(\w+):(\.?\d+\.?\d*)', re.search(r'const LINE = \{([^}]*)\}', (ROOT / 'engine/gear.js').read_text()).group(1))}
    for s in scales:
        say(f'  at {s} px/unit: ' + ', '.join(f'{k} outline {2 * w * s:.2f}px' for k, w in LINE.items()) + ('   (an outline under ~1px blurs away)' if min(LINE.values()) * 2 * s < 1 else ''))
    from geom import Rigs
    R = Rigs(); P = pieces_json(codes); lab = lambda h: rgb2lab(np.array([[[int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]]]))
    for (rig, code), pc in P.items():
        coat = R.rigs[rig]['palette']; pal = pc['palette']; low = []
        for name in [k for k in ('m', 'band', 'wB', 'gem') if k in pal]:
            for cn in ('fur', 'pale', 'pale2'):
                de = float(deltaE_ciede2000(lab(pal[name]), lab(coat[cn]))[0, 0])
                if de < 9: low.append(f'{name} vs {cn} dE {de:.1f}')
        if low: say(f'  {rig} {code}: low contrast against the coat: ' + '; '.join(low[:4]) + '  (outlines may still carry it)')

def check_lint1(codes):
    say('lint (V1 geometry and style sheet)')
    r = subprocess.run([sys.executable, str(LENS / 'lint.py'), *codes], cwd=ROOT, env=ENV, capture_output=True, text=True)
    for ln in r.stdout.splitlines():
        if ln.startswith('FAIL'): fail('lint1 ' + ln[5:])
        elif ln.startswith('   -'): say(ln)
    say(f"  {sum(1 for l in r.stdout.splitlines() if l.startswith('ok'))} ok, {sum(1 for l in r.stdout.splitlines() if l.startswith('FAIL'))} failing")

def sample_codes(n, seed=1):
    r = random.Random(seed); out = []
    for _ in range(n):
        k = r.choice('kcptrb'); d = [r.randrange(0, 7), r.randrange(0, 8), 0, r.randrange(0, 5), r.randrange(0, 5), r.randrange(0, 4)]
        out.append(k + ('' if k in 'kcpt' else str(r.randrange(0, 3 if k == 'r' else 4))) + ''.join(format(x, 'x') for x in d[:6 if k in 'kcpt' else 5]))
    return out

# ---------- commands ----------
def cmd_lint(a):
    codes = codes_of(a.rest); check_lint1(codes); check_order(codes); check_sweep(codes); check_xcheck(codes); check_determinism(codes); check_flush(codes); finish()
def finish():
    say(); say('ALL CHECKS PASSED' if not FAILS else f'{len(FAILS)} FAILURE(S):'); [say('  - ' + f) for f in FAILS]; sys.exit(1 if FAILS else 0)
def cmd_report(a):
    import io, contextlib
    buf = io.StringIO(); codes = codes_of(a.rest)
    class Tee(io.TextIOBase):
        def write(self, s): sys.__stdout__.write(s); buf.write(s); return len(s)
        def flush(self): sys.__stdout__.flush()
    with contextlib.redirect_stdout(Tee()):
        t = time.time(); check_lint1(codes); check_order(codes); check_sweep(codes); check_xcheck(codes); check_determinism(codes); check_flush(codes); check_legibility(codes)
    (DEN / 'reports').mkdir(exist_ok=True); f = DEN / 'reports' / (time.strftime('%Y%m%d-%H%M%S') + '.md')
    f.write_text('# Den kit V2 report\n\nCodes: ' + ' '.join(codes) + '\n\n```\n' + buf.getvalue() + f'\nfailures: {len(FAILS)}\n' + '\n'.join(FAILS) + '\n```\n'); say('wrote ' + str(f.relative_to(ROOT))); sys.exit(1 if FAILS else 0)
def cmd_sample(a):
    n = int(a.rest[0]) if a.rest else 40; codes = sample_codes(n); say(f'sample: {n} random codes: ' + ' '.join(codes)); check_lint1(codes); check_determinism(codes[:12]); finish()
def cmd_diff(a):
    if '--engine' in a.rest and a.rest[a.rest.index('--engine') + 1] == 'pixelmatch':
        rest = [x for x in a.rest if x not in ('--engine', 'pixelmatch')]; say(node(DEN / 'bridge.cjs', 'pixelmatch', *rest, capture=True).strip())
    else: sys.exit(subprocess.run([sys.executable, str(LENS / 'diff.py'), *[x for x in a.rest if x not in ('--engine', 'ssim')]], cwd=ROOT, env=ENV).returncode)
def cmd_doctor(a):
    import importlib.metadata as m
    say('Python (tools/lens/requirements.txt):')
    for p in ['pillow', 'numpy', 'opencv-python-headless', 'scikit-image', 'scipy', 'shapely', 'svgpathtools', 'matplotlib']:
        try: say(f'  ok   {p} {m.version(p)}')
        except Exception: say(f'  MISSING {p}   pip install -r tools/lens/requirements.txt')
    say('Node:')
    for p in ['playwright', 'pixelmatch', 'pngjs']:
        f = ROOT / 'node_modules' / p / 'package.json'; say(f'  ok   {p} {json.load(open(f))["version"]}' if f.exists() else f'  MISSING {p}   npm install')
    say('Kit: V1 at tools/lens (git tag kit-v1, commit 70c9ee0); V2 at tools/den')
    say('Optional backends (extra options, they replace nothing; each is added only when wanted):')
    for name, hint, why in [('paper', 'npm i paper-jsdom', 'curve-aware booleans: compile shapes as bezier paths instead of polylines'),
                            ('@resvg/resvg-js', 'npm i @resvg/resvg-js', 'a second, deterministic renderer to cross-check Chromium'),
                            ('clipper2-ts', 'npm i @countertype/clipper2-ts', 'integer polygon clipping and offsetting in JS'),
                            ('paper-jsdom', 'npm i paper-jsdom', 'paper.js in Node (installed Oct 6; not wired in yet)'),
                            ('scikit-learn', 'pip install scikit-learn', 'PCA and clustering for species shape spaces'),
                            ('pyclipper', 'pip install pyclipper', 'Clipper polygon offsetting in Python'),
                            ('uv', 'pip install uv', 'fast, pinned Python installs for each session'),
                            ('hypothesis', 'pip install hypothesis', 'property-based sampling of the code space (den sample is the simple version)'),
                            ('colour-science', 'pip install colour-science', 'more colour metrics than CIEDE2000'),
                            ('MeshRope', 'built into Pixi 8', 'socks and sleeves that bend as one mesh (a texture, so it changes the look: try on one sleeve first)')]:
        have = (ROOT / 'node_modules' / name / 'package.json').exists()
        try: have = have or bool(m.version(name))
        except Exception: pass
        say(f'  {"ok  " if have else "..  "} {name:16} {why}   [{hint}]')
def cmd_baseline(a): check_flush(codes_of([x for x in a.rest if not x.startswith('--')]), update='--update' in a.rest); finish() if '--update' not in a.rest else None
V1 = {'shot': 'lens.cjs', 'probe': 'lens.cjs', 'export': 'lens.cjs', 'piece': 'lens.cjs', 'compile': 'compile_mounts.py', 'place-band': 'place_band.py', 'measure': 'measure_image.py', 'refoverlay': 'refoverlay.py', 'diff1': 'diff.py'}
def main():
    ap = argparse.ArgumentParser(add_help=False); ap.add_argument('cmd', nargs='?'); ap.add_argument('rest', nargs=argparse.REMAINDER); a = ap.parse_args()
    if not a.cmd or a.cmd in ('-h', '--help', 'help'): print(__doc__); return
    if a.cmd in V1:
        f = LENS / V1[a.cmd]; sys.exit(subprocess.run((['node'] if f.suffix == '.cjs' else [sys.executable]) + [str(f)] + ([a.cmd] if a.cmd in ('shot', 'probe', 'export', 'piece') else []) + a.rest, cwd=ROOT, env=ENV).returncode)
    fn = {'lint': cmd_lint, 'sweep': lambda a: (check_sweep(codes_of(a.rest)), finish()), 'order': lambda a: (check_order(codes_of(a.rest)), finish()), 'xcheck': lambda a: (check_xcheck(codes_of(a.rest)), finish()),
          'determinism': lambda a: (check_determinism(codes_of(a.rest)), finish()), 'flush': lambda a: (check_flush(codes_of(a.rest)), finish()), 'legibility': lambda a: (check_legibility(codes_of(a.rest)), finish()),
          'sample': cmd_sample, 'species': lambda a: sys.exit(subprocess.run([sys.executable, str(DEN / 'species.py'), *a.rest], cwd=ROOT).returncode), 'diff': cmd_diff, 'report': cmd_report, 'doctor': cmd_doctor, 'baseline': cmd_baseline}.get(a.cmd)
    if not fn: print('unknown command; run `den help`'); sys.exit(2)
    fn(a)
if __name__ == '__main__': main()
