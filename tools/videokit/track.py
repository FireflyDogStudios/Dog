# Planted-paw chains: a planted paw moves back at the ground speed (the camera tracks the fox); link blobs frame to frame on that rule.
import json, sys, numpy as np
R = json.load(open(sys.argv[1])); N = len(R)
B = [[p for p in r['paws'] if p['n'] > 20] for r in R]
for b, r in zip(B, R):
    g = max([p['y'] for p in b] or [r['ground']])
    for p in b: p['dy'] = p['y'] - g
# ground speed per frame: median shift of the lowest blobs that match
v = []
for t in range(N - 1):
    c = []
    for p in B[t]:
        if p['dy'] < -8: continue
        for q in B[t+1]:
            d = p['x'] - q['x']
            if 2 < d < 16 and abs(p['y'] - q['y']) <= 2: c.append(d)
    v.append(float(np.median(c)) if c else (v[-1] if v else 0))
v.append(v[-1])
from scipy.ndimage import median_filter
v = list(median_filter(np.array(v), size=7, mode='nearest'))
# chains
for t in range(N): 
    for p in B[t]: p['id'] = None
chains = []
for t in range(N):
    for p in B[t]:
        if p['dy'] < -8 or p['id'] is not None: continue
        ch = [(t, p)]; p['id'] = len(chains); tt, cur = t, p
        while tt + 1 < N:
            best = None
            for q in B[tt+1]:
                if q['id'] is None and q['dy'] >= -8 and abs((cur['x'] - v[tt]) - q['x']) <= 5 and abs(cur['y'] - q['y']) <= 3: best = q if best is None or abs(cur['x']-v[tt]-q['x']) < abs(cur['x']-v[tt]-best['x']) else best
            if best is None: break
            best['id'] = p['id']; ch.append((tt+1, best)); tt, cur = tt + 1, best
        chains.append(ch)
out = []
for ch in chains:
    if len(ch) < 3: continue
    t0, p0 = ch[0]; t1, p1 = ch[-1]; nose0 = R[t0]['nose'][0]
    out.append({'start': t0, 'end': t1, 'frames': len(ch), 'x0': round(p0['x']), 'x1': round(p1['x']), 'x0_rel_nose': round(p0['x'] - nose0), 'dy': p0['dy']})
out.sort(key=lambda c: c['start'])
json.dump({'speed_px_per_frame': [round(x, 2) for x in v], 'stances': out}, open(sys.argv[2], 'w'), indent=1)
print('speed', [round(x, 1) for x in v])
for c in out: print(c)
