#!/usr/bin/env python3
"""Species proportions from real keypoints (AwA-Pose, ref/awa-pose, MIT), compared with our dogs' rigs in the same terms.

   python3 tools/den/species.py [wolf fox ...]          the table: each species' median landmarks next to hero2's and hero's
   python3 tools/den/species.py --sheet wolf             the numbers for a species sheet (landmarks in hero2's drawing units)

   AwA-Pose's names, as the data shows them (checked on the wolf's medians, Oct 6): neck_base = the top of the neck at the skull (behind the ears), neck_end = the withers,
   front thai/knee/paw = elbow / wrist / paw, back thai/knee/paw = stifle / hock / paw, mouth_end = the corner of the mouth, upper/lower_jaw = the front of the lips.
   Every animal is put in one frame: neck_base at (0, 0), tail_base at (-1, 0), y down, so 1 unit = the dog's length from skull to tail base.
   Only near-profile photos count: the head is not foreshortened (nose well ahead of the ear base) and the body is not (front and hind paws well apart).
   Medians, not means, so a few odd photos cannot pull the numbers. These are 2D projections of mixed poses: good for comparing species, not bone lengths."""
import json, math, sys, pathlib, statistics as st
ROOT = pathlib.Path(__file__).resolve().parents[2]
REF = ROOT / 'ref/awa-pose/canids.json'

# hero2 and hero landmarks in drawing units, named as AwA-Pose names them (from engine/rig_den.js and the fit sheet)
RIG_POINTS = {
  'hero2': {'neck_base': (42.6, 5.8), 'neck_end': (37.2, 11.0), 'back_middle': (30.0, 12.0), 'back_end': (23.2, 11.6), 'tail_base': (21.0, 14.3), 'tail_end': (11.0, 6.2),
            'eye': (46.1, 7.1), 'nose': (53.3, 8.7), 'earbase': (44.6, 5.4), 'earend': (45.0, -1.6), 'upper_jaw': (53.1, 9.9), 'lower_jaw': (51.6, 10.5), 'mouth_end': (47.6, 10.8),
            'throat_base': (46.0, 13.8), 'belly_bottom': (32.0, 22.3), 'front_thai': (40.0, 21.8), 'front_knee': (40.4, 30.4), 'front_paw': (40.8, 34.5),
            'back_thai': (24.4, 26.2), 'back_knee': (19.4, 29.8), 'back_paw': (20.3, 34.5)},
}
FEATURES = [  # name, how it is measured, what it means
  ('front leg', lambda p: add(d(p, 'front_thai', 'front_knee'), d(p, 'front_knee', 'front_paw')), 'elbow to wrist to paw'),
  ('hind leg', lambda p: add(d(p, 'back_thai', 'back_knee'), d(p, 'back_knee', 'back_paw')), 'stifle to hock to paw'),
  ('height', lambda p: p['front_paw'][1] - p['neck_end'][1] if 'front_paw' in p and 'neck_end' in p else None, 'withers to the ground'),
  ('chest depth', lambda p: p['belly_bottom'][1] - p['back_middle'][1] if 'belly_bottom' in p and 'back_middle' in p else None, 'back to belly, mid-body'),
  ('neck', lambda p: d(p, 'neck_base', 'neck_end'), 'skull to withers'),
  ('head', lambda p: d(p, 'earbase', 'nose'), 'ear base to nose'),
  ('muzzle', lambda p: d(p, 'eye', 'nose'), 'eye to nose'),
  ('ear', lambda p: d(p, 'earbase', 'earend'), 'ear base to tip'),
  ('gape', lambda p: d(p, 'mouth_end', 'upper_jaw'), 'mouth corner to the front of the lip'),
  ('tail', lambda p: d(p, 'tail_base', 'tail_end'), 'base to tip, straight'),
]
def d(p, a, b): return math.dist(p[a], p[b]) if a in p and b in p else None
def add(*v): return None if any(x is None for x in v) else sum(v)

def frame(kp):
    """one animal in the common frame, near side only (left/right pairs collapse to the one that is there, preferring the lower-numbered side)"""
    nb, tb = kp.get('neck_base'), kp.get('tail_base')
    if not nb or not tb: return None
    dx, dy = nb[0] - tb[0], nb[1] - tb[1]; L = math.hypot(dx, dy)
    if L < 40: return None
    a = math.atan2(dy, dx); c, s = math.cos(-a), math.sin(-a)
    p = {k: ((x - nb[0]) * c - (y - nb[1]) * s, (x - nb[0]) * s + (y - nb[1]) * c) for k, (x, y) in kp.items()}
    p = {k: (x / L, y / L) for k, (x, y) in p.items()}
    paws = [p[k][1] for k in ('front_left_paw', 'front_right_paw', 'back_left_paw', 'back_right_paw') if k in p]
    if paws and st.median(paws) < 0: p = {k: (x, -y) for k, (x, y) in p.items()}   # mirrored photo: paws must be below the back
    out = {}
    for k, v in p.items():
        for side in ('left_', 'right_', '_left', '_right'):
            if side in k: k2 = k.replace(side, '_' if side.startswith('_') else '').replace('__', '_'); out.setdefault(k2.strip('_'), v); break
        else: out[k] = v
    return out

def profile(p):
    if not all(k in p for k in ('nose', 'earbase', 'front_paw', 'back_paw')): return False
    return p['nose'][0] - p['earbase'][0] >= .10 and abs(p['front_paw'][0] - p['back_paw'][0]) >= .45 and p['front_paw'][1] > .55   # tested at three strictness levels (Oct 6): the ratios below hold within a few percent

def rig_frame(rig):
    P = RIG_POINTS[rig]; nb, tb = P['neck_base'], P['tail_base']; dx, dy = nb[0] - tb[0], nb[1] - tb[1]; L = math.hypot(dx, dy); a = math.atan2(dy, dx); c, s = math.cos(-a), math.sin(-a)
    return {k: (((x - nb[0]) * c - (y - nb[1]) * s) / L, ((x - nb[0]) * s + (y - nb[1]) * c) / L) for k, (x, y) in P.items()}, L, (nb, a)

def species(name):
    D = json.load(open(REF)); S = [q for q in (frame(e['kp']) for e in D[name]) if q and profile(q)]
    return S

def stats(S):
    out = {}
    for fname, f, _ in FEATURES:
        v = [x for x in (f(p) for p in S) if x is not None]
        out[fname] = (st.median(v), len(v), (st.quantiles(v, n=4)[0], st.quantiles(v, n=4)[2]) if len(v) >= 4 else (None, None))
    return out

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]; names = args or ['wolf', 'german_shepherd', 'collie', 'dalmatian', 'chihuahua', 'fox', 'raccoon']
    h2, L2, _ = rig_frame('hero2')
    hs = {fname: f(h2) for fname, f, _ in FEATURES}
    rows = {n: stats(species(n)) for n in names}
    print(f"{'feature':12} {'hero2':>7} " + ' '.join(f'{n[:10]:>10}' for n in names) + '   (fractions of skull-to-tail-base length; profile photos only)')
    for fname, _, what in FEATURES:
        print(f"{fname:12} {hs[fname]:7.2f} " + ' '.join(f'{rows[n][fname][0]:10.2f}' for n in names) + f'   {what}')
    print('photos used: ' + ', '.join(f'{n} {len(species(n))}' for n in names))
    if '--sheet' in sys.argv and args:
        # STYLE-PRESERVING: our dogs are drawn in a style (bigger head and ears than life), so a species is NOT its raw photo numbers. It is the hero2 drawing
        # times (species / medium domestic dogs), the domestic baseline standing in for the Carolina Dog, which the photo set does not have.
        n = args[0]; r = rows[n]; base = [stats(species(b)) for b in BASELINE]
        print(f'\n{n} sheet: ratio = {n} / medium domestic dogs ({", ".join(BASELINE)}); hero2 target = hero2 x ratio')
        for fname, _, what in FEATURES:
            m, k, (q1, q3) = r[fname]; b = st.median([x[fname][0] for x in base]); ratio = m / b
            print(f'  {fname:12} {n} {m:.2f} (middle half {q1:.2f}-{q3:.2f}, {k} photos)  domestic {b:.2f}  ratio {ratio:.2f}  hero2 {hs[fname]:.2f} -> {hs[fname] * ratio:.2f} ({hs[fname] * ratio * L2:.1f} units)   {what}')
        print(f'  hero2 skull-to-tail-base length: {L2:.1f} drawing units')

BASELINE = ['german_shepherd', 'collie', 'dalmatian']
if __name__ == '__main__': main()
