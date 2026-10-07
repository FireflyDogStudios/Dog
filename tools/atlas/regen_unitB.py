"""Regenerate ref/research/keypoints/stanfordextra_breeds_unitB.csv from the MIT StanfordExtra v12 data
(ref/research/fetched/02-outline-landmarks/data.json), replacing the table built from the AGPL-labelled Ultralytics mirror.

Method as written in ref/research/keypoints/REPORT.md section 3 (the original script was not stored):
  unit B frame: skull point = midpoint of the ear bases at (0,0), tail base at (-1,0), y down, 1 unit = skull to tail base;
  near-profile only (nose >= 0.10 ahead of the ear base, front and hind paws >= 0.45 apart, front paw > 0.55 below the topline);
  near side collapses left/right; medians. Standing = elbow-to-paw and hock-to-paw both within 20 degrees of plumb.
  Angles: carpus = elbow-wrist-paw, hock = stifle-hock-paw (180 = straight); ear carriage = ear base-to-tip against the skull
  line pointing back (+90 upright, 0 laid back, about -100 hanging); tail carriage = base-to-tip against straight back (+up).

  python3 tools/atlas/regen_unitB.py --validate   rerun the method on AwA-Pose and compare with proportions.json awa_unitB
  python3 tools/atlas/regen_unitB.py              write the CSV"""
import json, math, sys, statistics as st, csv
SE = 'ref/research/fetched/02-outline-landmarks/data.json'
AWA = 'ref/awa-pose/canids.json'
OUT = 'ref/research/keypoints/stanfordextra_breeds_unitB.csv'
SE_TO_AWA = {'front_top': 'thai', 'front_middle': 'knee', 'front_paw': 'paw', 'rear_top': 'thai', 'rear_middle': 'knee', 'rear_paw': 'paw'}

def se_points(kp):
    """StanfordExtra names -> AwA-style names; drop occluded (v=0) and NaN points"""
    out = {}
    for k, (x, y, v) in kp.items():
        if not v or x != x or y != y: continue
        for side in ('left', 'right'):
            if k.startswith(side + '_'):
                rest = k[len(side) + 1:]
                if rest in SE_TO_AWA:
                    k = f"{'front' if rest.startswith('front') else 'back'}_{side}_{SE_TO_AWA[rest]}"
                elif rest in ('ear_base', 'ear_tip'):
                    k = f"{side}_{'earbase' if rest == 'ear_base' else 'earend'}"
        out[k] = (x, y)
    return out

def collapse(p):
    out = {}
    for k, v in p.items():
        for side in ('left_', 'right_'):
            if side in k: out.setdefault(k.replace(side, ''), v); break
        else: out[k] = v
    return out

def frame(kp):
    eb = [kp[k] for k in ('left_earbase', 'right_earbase') if k in kp]
    tb = kp.get('tail_base')
    if not eb or not tb: return None
    sk = (sum(e[0] for e in eb) / len(eb), sum(e[1] for e in eb) / len(eb))
    dx, dy = sk[0] - tb[0], sk[1] - tb[1]; L = math.hypot(dx, dy)
    if L < 40: return None
    a = math.atan2(dy, dx); c, s = math.cos(-a), math.sin(-a)
    p = {k: (((x - sk[0]) * c - (y - sk[1]) * s) / L, ((x - sk[0]) * s + (y - sk[1]) * c) / L) for k, (x, y) in kp.items()}
    paws = [p[k][1] for k in ('front_left_paw', 'front_right_paw', 'back_left_paw', 'back_right_paw') if k in p]
    if paws and st.median(paws) < 0: p = {k: (x, -y) for k, (x, y) in p.items()}   # mirrored: paws below the back
    return collapse(p)

def profile(p):
    if not all(k in p for k in ('nose', 'earbase', 'front_paw', 'back_paw')): return False
    return p['nose'][0] - p['earbase'][0] >= .10 and abs(p['front_paw'][0] - p['back_paw'][0]) >= .45 and p['front_paw'][1] > .55

def d(p, a, b): return math.dist(p[a], p[b]) if a in p and b in p else None
def add(*v): return None if any(x is None for x in v) else sum(v)
def ang3(p, a, b, c):
    if not all(k in p for k in (a, b, c)): return None
    u = (p[a][0] - p[b][0], p[a][1] - p[b][1]); w = (p[c][0] - p[b][0], p[c][1] - p[b][1])
    nu, nw = math.hypot(*u), math.hypot(*w)
    if not nu or not nw: return None
    return math.degrees(math.acos(max(-1, min(1, (u[0] * w[0] + u[1] * w[1]) / (nu * nw)))))
def plumb(p, a, b):
    if a not in p or b not in p: return None
    dx, dy = p[b][0] - p[a][0], p[b][1] - p[a][1]
    return abs(math.degrees(math.atan2(dx, dy)))
def ear_carriage(p):
    if not all(k in p for k in ('earbase', 'earend', 'nose')): return None
    bx, by = p['earbase'][0] - p['nose'][0], p['earbase'][1] - p['nose'][1]; n = math.hypot(bx, by); bx, by = bx / n, by / n
    ux, uy = -by, bx   # 90 degrees from "back"; for a level skull this is straight up (y down)
    if uy > 0: ux, uy = -ux, -uy
    ex, ey = p['earend'][0] - p['earbase'][0], p['earend'][1] - p['earbase'][1]
    return math.degrees(math.atan2(ex * ux + ey * uy, ex * bx + ey * by))
def tail_carriage(p):
    if 'tail_base' not in p or 'tail_end' not in p: return None
    tx, ty = p['tail_end'][0] - p['tail_base'][0], p['tail_end'][1] - p['tail_base'][1]
    return math.degrees(math.atan2(-ty, -tx))

FEATURES = {
    'front leg': lambda p: add(d(p, 'front_thai', 'front_knee'), d(p, 'front_knee', 'front_paw')),
    'hind leg': lambda p: add(d(p, 'back_thai', 'back_knee'), d(p, 'back_knee', 'back_paw')),
    'chest depth': lambda p: p['belly_bottom'][1] - p['back_middle'][1] if 'belly_bottom' in p and 'back_middle' in p else None,
    'head': lambda p: d(p, 'earbase', 'nose'),
    'ear': lambda p: d(p, 'earbase', 'earend'),
    'tail': lambda p: d(p, 'tail_base', 'tail_end'),
    'topline-to-paw': lambda p: (p['front_paw'][1] + p['back_paw'][1]) / 2 if 'front_paw' in p and 'back_paw' in p else None,
}
ANGLES = {'ear carriage (standing)': ear_carriage, 'tail carriage (standing)': tail_carriage,
          'carpus angle (standing)': lambda p: ang3(p, 'front_thai', 'front_knee', 'front_paw'),
          'hock angle (standing)': lambda p: ang3(p, 'back_thai', 'back_knee', 'back_paw')}
def standing(p):
    a, b = plumb(p, 'front_thai', 'front_paw'), plumb(p, 'back_knee', 'back_paw')
    return a is not None and b is not None and a <= 20 and b <= 20

def summarise(S):
    stand = [p for p in S if standing(p)]
    props = {}
    for f, fn in FEATURES.items():
        v = [x for x in (fn(p) for p in S) if x is not None]
        props[f] = (round(st.median(v), 2), len(v)) if v else (None, 0)
    angs = {}
    for f, fn in ANGLES.items():
        v = [x for x in (fn(p) for p in stand) if x is not None]
        angs[f] = round(st.median(v), 0) if v else None
    return len(S), len(stand), props, angs

def validate():
    D = json.load(open(AWA)); P = json.load(open('ref/research/keypoints/proportions.json'))['awa_unitB']; worst = 0
    for sp in P:
        S = [q for q in (frame(e['kp']) for e in D[sp]) if q and profile(q)]
        n, ns, props, _ = summarise(S); ref = P[sp]
        line = [f"{sp:16} n {n}/{ref['n_profile']} standing {ns}/{ref['n_standing']}"]
        for f in ('front leg', 'hind leg', 'chest depth', 'head', 'ear', 'tail', 'topline-to-paw'):
            r = ref['props'].get(f)
            if r and props[f][0] is not None:
                worst = max(worst, abs(props[f][0] - r['median'])); line.append(f"{f} {props[f][0]}/{r['median']}")
        print('  '.join(line))
    print(f'largest median difference vs stored awa_unitB: {worst:.3f}')

def main():
    if '--validate' in sys.argv: return validate()
    D = json.load(open(SE))   # Python's json accepts the file's NaN tokens
    per = {b: [q for q in (frame(se_points(e['kp'])) for e in dogs) if q and profile(q)] for b, dogs in D.items()}
    cols = ['breed', 'n_profile', 'n_standing'] + [f'{f} median' for f in FEATURES if f != 'chest depth'] + [f'{f} n' for f in ('front leg', 'hind leg', 'head', 'ear', 'tail')] + [f'{a} median' for a in ANGLES]
    rows = []
    for name, S in [('ALL_DOMESTIC', [p for b, s in per.items() for p in s])] + sorted(per.items(), key=lambda kv: kv[0].lower()):
        n, ns, props, angs = summarise(S)
        rows.append([name, n, ns] + [props[f][0] for f in FEATURES if f != 'chest depth'] + [props[f][1] for f in ('front leg', 'hind leg', 'head', 'ear', 'tail')] + [angs[a] for a in ANGLES])
    with open(OUT, 'w', newline='') as fh:
        w = csv.writer(fh); w.writerow(cols); w.writerows(rows)
    print(f'wrote {OUT}: {len(rows) - 1} breeds, ALL_DOMESTIC n_profile {rows[0][1]}')

if __name__ == '__main__': main()
