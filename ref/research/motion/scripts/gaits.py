"""Segment MANN dog BVH clips into strides, classify gait, extract sagittal joint angles.
Usage: python3 -I gaits.py <bvh_dir> <out_dir>
"""
import sys, os, glob, json
import numpy as np
from scipy.ndimage import uniform_filter1d
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bvhfk import parse, fk

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
N = 101
HT = float(os.environ.get("HT", 0.05)); VT = float(os.environ.get("VT", 0.5))
LIMBS = {'LF': 'LeftHand_End', 'RF': 'RightHand_End', 'LH': 'LeftFoot_End', 'RH': 'RightFoot_End'}


def wrap(a):
    return (a + 180) % 360 - 180


def contacts(p, ft):
    """bool contact per frame for a toe trajectory p (nf,3)."""
    h = p[:, 1]
    v = np.r_[0, np.linalg.norm(np.diff(p[:, [0, 2]], axis=0), axis=1) / ft]
    v = uniform_filter1d(v, int(os.environ.get("SM", 5)))
    floor = np.percentile(h, 5)
    c = (h < floor + HT) & (v < VT)
    # remove blips shorter than 4 frames (both ways)
    for val in (True, False):
        i = 0
        while i < len(c):
            if c[i] == val:
                j = i
                while j < len(c) and c[j] == val:
                    j += 1
                if j - i < 4 and i > 0 and j < len(c):
                    c[i:j] = not val
                i = j
            else:
                i += 1
    return c


def touchdowns(c):
    return np.where(~c[:-1] & c[1:])[0] + 1


strides = []
for f in sorted(glob.glob(os.path.join(SRC, '*.bvh'))):
    J, data, ft = parse(f)
    pos, rot = fk(J, data)
    nm = [j['name'] for j in J]
    ix = {n: i for i, n in enumerate(nm)}
    nf = len(data)
    # body frame: heading from root local +X projected to horizontal
    fwd = pos[:, ix['Neck']] - pos[:, ix['Hips']]  # body heading from geometry (root axes are not reliable)
    fwd[:, 1] = 0
    fwd /= np.linalg.norm(fwd, axis=1, keepdims=True)
    up = np.array([0, 1.0, 0])
    lat = np.cross(fwd, up)

    def segang(a, b):
        d = pos[:, ix[b]] - pos[:, ix[a]]
        return np.degrees(np.arctan2(d[:, 1], np.sum(d * fwd, 1)))  # pitch in sagittal plane, 0 = forward, -90 = down

    def yaw(a, b):  # lateral angle of segment vs. body midline (top view), + = to the dog's left
        d = pos[:, ix[b]] - pos[:, ix[a]]
        return np.degrees(np.arctan2(-np.sum(d * lat, 1), -np.sum(d * fwd, 1)))  # for tail: 0 = straight back

    seg = {}
    for s in ('Left', 'Right'):
        k = s[0]
        seg[k + 'scap'] = segang(s + 'Shoulder', s + 'Arm')
        seg[k + 'hum'] = segang(s + 'Arm', s + 'ForeArm')
        seg[k + 'rad'] = segang(s + 'ForeArm', s + 'Hand')
        seg[k + 'paw'] = segang(s + 'Hand', s + 'Hand_End')
        seg[k + 'fem'] = segang(s + 'UpLeg', s + 'Leg')
        seg[k + 'tib'] = segang(s + 'Leg', s + 'Foot')
        seg[k + 'met'] = segang(s + 'Foot', s + 'Foot_End')
    trunk = segang('Hips', 'Neck')
    neck = segang('Neck', 'Head')
    head = segang('Head', 'Head_End')
    tail0 = segang('Tail', 'Tail1')
    tail1 = segang('Tail1', 'Tail1_End')
    tailyaw = yaw('Tail', 'Tail1_End')
    ch = {}
    for k in ('L', 'R'):
        # included joint angles, veterinary-style (180 = straight). Signs checked against standing pose.
        ch[k + '_shoulder'] = 180 + wrap(seg[k + 'hum'] - seg[k + 'scap'])
        ch[k + '_elbow'] = 180 - wrap(seg[k + 'rad'] - seg[k + 'hum'])
        ch[k + '_carpus'] = 180 + wrap(seg[k + 'paw'] - seg[k + 'rad'])
        ch[k + '_hip'] = -wrap(seg[k + 'fem'] - trunk)  # angle between cranial trunk axis (hips->neck) and femur; smaller = more flexed (no pelvis segment in data)
        ch[k + '_stifle'] = 180 + wrap(seg[k + 'tib'] - seg[k + 'fem'])
        ch[k + '_hock'] = 180 - wrap(seg[k + 'met'] - seg[k + 'tib'])
        for s in ('scap', 'hum', 'rad', 'paw', 'fem', 'tib', 'met'):
            ch[k + '_seg_' + s] = seg[k + s]
    ch['trunk_pitch'] = trunk
    ch['neck_pitch'] = neck
    ch['head_pitch'] = head
    ch['tail_base_elev'] = -wrap(tail0 + 180)  # elevation above caudal horizontal; negative = hanging down
    ch['tail_tip_elev'] = -wrap(tail1 + 180)
    ch['tail_yaw'] = tailyaw  # whole tail (base->tip chord), lateral angle; + = to the dog's left
    hips_y = pos[:, ix['Hips'], 1]
    wither_y = (pos[:, ix['LeftShoulder'], 1] + pos[:, ix['RightShoulder'], 1]) / 2
    ch['hip_height_m'] = hips_y
    ch['wither_height_m'] = wither_y
    ch['head_height_m'] = pos[:, ix['Head'], 1]

    C = {L: contacts(pos[:, ix[t]], ft) for L, t in LIMBS.items()}
    root = pos[:, 0]
    td = touchdowns(C['LH'])
    for a, b in zip(td[:-1], td[1:]):
        dur = (b - a) * ft
        if dur < 0.2 or dur > 1.6:
            continue
        sl = slice(a, b + 1)
        dist = np.linalg.norm(root[b, [0, 2]] - root[a, [0, 2]])
        speed = dist / dur
        if speed < 0.3:
            continue
        # straightness: heading change over stride
        dh = np.degrees(np.arccos(np.clip(np.dot(fwd[a], fwd[b]), -1, 1)))
        if dh > 20:
            continue
        rec = dict(file=os.path.basename(f), a=int(a), b=int(b), dur=dur, speed=speed, turn=dh)
        ok = True
        for L in LIMBS:
            cc = C[L][a:b]
            rec['duty_' + L] = float(cc.mean())
            t = np.array([0])
            if L != 'LH':
                t = touchdowns(C[L][max(a - 1, 0):b + 1]) + max(a - 1, 0) - a
                t = t[(t >= 0) & (t < b - a)]
                if len(t) != 1:
                    ok = False
                    break
            rec['phase_' + L] = float(t[0] / (b - a))
        if not ok:
            continue
        x = np.linspace(0, 1, b - a + 1)
        xi = np.linspace(0, 1, N)
        curves = {}
        for k, v in ch.items():
            vv = v[sl]
            if 'height' not in k:
                vv = np.degrees(np.unwrap(np.radians(vv)))
            curves[k] = np.interp(xi, x, vv)
        for L in LIMBS:
            curves['contact_' + L] = np.interp(xi, x, C[L][sl].astype(float))
        rec['curves'] = curves
        # per-limb own cycle: from this limb's touchdown inside the window to its next touchdown
        LJ = {'LF': ['L_shoulder', 'L_elbow', 'L_carpus', 'L_seg_scap', 'L_seg_hum', 'L_seg_rad', 'L_seg_paw'],
              'RF': ['R_shoulder', 'R_elbow', 'R_carpus', 'R_seg_scap', 'R_seg_hum', 'R_seg_rad', 'R_seg_paw'],
              'LH': ['L_hip', 'L_stifle', 'L_hock', 'L_seg_fem', 'L_seg_tib', 'L_seg_met'],
              'RH': ['R_hip', 'R_stifle', 'R_hock', 'R_seg_fem', 'R_seg_tib', 'R_seg_met']}
        own = {}
        for L in LIMBS:
            tdL = touchdowns(C[L])
            t0 = a + int(round(rec['phase_' + L] * (b - a)))
            nxt = tdL[tdL > t0]
            if len(nxt) == 0 or (nxt[0] - t0) * ft > 1.6:
                own = None
                break
            t1 = nxt[0]
            xx = np.linspace(0, 1, t1 - t0 + 1)
            for k in LJ[L]:
                vv = np.degrees(np.unwrap(np.radians(ch[k][t0:t1 + 1])))
                own[L + '_' + k[2:]] = np.interp(xi, xx, vv)
            lo = np.where(~C[L][t0:t1 + 1])[0]
            own[L + '_liftoff_pct'] = 100.0 * (lo[0] / (t1 - t0) if len(lo) else 1.0)
        rec['own'] = own
        rec['hip_mean'] = float(hips_y[sl].mean())
        strides.append(rec)


def cd(a, b):
    d = abs(a - b) % 1.0
    return min(d, 1 - d)


def cmean(xs):
    z = np.mean(np.exp(2j * np.pi * np.asarray(xs)))
    return float((np.angle(z) / (2 * np.pi)) % 1.0)


def classify(r):
    pRH, pLF, pRF = r['phase_RH'], r['phase_LF'], r['phase_RF']
    duty = np.mean([r['duty_' + L] for L in LIMBS])
    if cd(pRH, 0.5) > 0.12:
        lead = 'RHfirst' if pRH > 0.5 else 'LHfirst'  # which hind lands first in the hind pair
        return ('gallop' if r['speed'] >= 2.6 else 'canter') + '_' + lead
    if cd(pRF, 0) < 0.12 and cd(pLF, 0.5) < 0.12:
        return 'trot'
    if cd(pLF, 0) < 0.12 and cd(pRF, 0.5) < 0.12:
        return 'pace'
    if 0.12 <= pLF <= 0.38 and duty >= 0.5:
        return 'walk'
    return 'other'


for r in strides:
    r['gait'] = classify(r)

summary = {}
for g in sorted(set(r['gait'] for r in strides)):
    S = [r for r in strides if r['gait'] == g]
    summary[g] = dict(
        n=len(S),
        files=sorted(set(r['file'] for r in S)),
        speed_mps=[float(np.mean([r['speed'] for r in S])), float(np.std([r['speed'] for r in S]))],
        stride_s=[float(np.mean([r['dur'] for r in S])), float(np.std([r['dur'] for r in S]))],
        hip_height_m=float(np.mean([r['hip_mean'] for r in S])),
        duty={L: float(np.mean([r['duty_' + L] for r in S])) for L in LIMBS},
        phase={L: cmean([r['phase_' + L] for r in S]) for L in LIMBS},
    )
    keys = list(S[0]['curves'].keys())
    M = {k: np.array([r['curves'][k] for r in S]) for k in keys}
    hdr = ['pct_cycle'] + [c for k in keys for c in (k, k + '_sd')]
    rows = [np.linspace(0, 100, N)]
    rng = {}
    for k in keys:
        rows += [M[k].mean(0), M[k].std(0)]
        if not k.startswith('contact'):
            m = M[k].mean(0)
            rng[k] = [float(m.min()), float(m.max()), float(m.max() - m.min())]
    summary[g]['mean_curve_range'] = rng
    O = [r['own'] for r in S if r.get('own')]
    if O:
        ok = [k for k in O[0] if not k.endswith('liftoff_pct')]
        hdr2 = ['pct_own_cycle'] + [c for k in ok for c in (k, k + '_sd')]
        rows2 = [np.linspace(0, 100, N)]
        for k in ok:
            A = np.array([o[k] for o in O])
            rows2 += [A.mean(0), A.std(0)]
        np.savetxt(os.path.join(OUT, f'mann_{g}_limbs_own_cycle.csv'), np.array(rows2).T, delimiter=',',
                   header=','.join(hdr2), comments='', fmt='%.3f')
        summary[g]['own_cycle_n'] = len(O)
        summary[g]['liftoff_pct_own_cycle'] = {L: float(np.mean([o[L + '_liftoff_pct'] for o in O])) for L in LIMBS}
    np.savetxt(os.path.join(OUT, f'mann_{g}_cycle.csv'), np.array(rows).T, delimiter=',',
               header=','.join(hdr), comments='', fmt='%.3f')
json.dump(summary, open(os.path.join(OUT, 'summary.json'), 'w'), indent=1)
for g, s in summary.items():
    print(g, s['n'], 'speed %.2f' % s['speed_mps'][0], 'stride %.2f s' % s['stride_s'][0],
          'duty', {k: round(v, 2) for k, v in s['duty'].items()}, 'phase', {k: round(v, 2) for k, v in s['phase'].items()})
