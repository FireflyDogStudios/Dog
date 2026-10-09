import json, sys, numpy as np
R = json.load(open(sys.argv[1])); S = json.load(open(sys.argv[2])); N = len(R)
rows = []
for r in R:
    top = np.array(r['top']); nx, ny = r['nose']
    b = [p for p in r['paws'] if p['n'] > 20]; g = max([p['y'] for p in b] or [r['ground']])
    def hi(a, b_):  # highest topline point between nose+a and nose+b
        xs = [x for x in range(max(0, nx + a), min(len(top), nx + b_)) if top[x] >= 0]
        if not xs: return None, None
        x = min(xs, key=lambda x: top[x]); return x, int(top[x])
    fr = [p['x'] for p in b if nx - 150 < p['x'] < nx + 5]; hd = [p['x'] for p in b if nx - 270 < p['x'] < nx - 150]
    def at(x):
        xs = [k for k in range(int(x) - 8, int(x) + 9) if 0 <= k < len(top) and top[k] >= 0]
        return (int(x), int(min(top[k] for k in xs))) if xs else (None, None)
    wx, wy = at(np.mean(fr)) if fr else (None, None)   # withers: the back above the front feet
    hx, hy = at(np.mean(hd)) if len(hd) and r['xmin'] < np.mean(hd) - 30 else (None, None)   # hips: the back above the hind feet
    ex = [x for x in range(max(0, nx - 70), nx) if top[x] >= 0]; ey = int(min(top[x] for x in ex)) if ex else None  # ear tips (top of the head)
    pl = [g - top[x] for x in range(max(0, nx - 200), nx - 110) if top[x] >= 0]; back = float(np.median(pl)) if pl else None   # the flat stretch of back
    rows.append({'f': r['f'], 'g': g, 'back_h': back, 'nose_h': g - ny, 'withers_h': g - wy if wy else None, 'withers_x': wx - nx if wx else None, 'hip_h': g - hy if hy else None, 'ear_h': g - ey if ey else None})
# reference withers height: standing frames
WH = float(np.median([r['back_h'] for r in rows[52:] if r['back_h']]))
v = S['speed_px_per_frame']
print('reference withers height (standing, px):', WH)
print(' f  speed  back/WH  nose/WH  ears/WH  nose-below-back')
for r in rows:
    f = lambda k: f"{r[k]/WH:5.2f}" if r[k] else "  -  "
    print(f"{r['f']:2d}  {v[r['f']]:5.1f}   {f('back_h')}   {f('nose_h')}   {f('ear_h')}   {(r['back_h']-r['nose_h'])/WH:5.2f}")
json.dump({'WH_px': WH, 'rows': rows}, open(sys.argv[3], 'w'))
