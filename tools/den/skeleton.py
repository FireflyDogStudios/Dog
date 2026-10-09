#!/usr/bin/env python3
"""den skeleton <id>: build a species' standing skeleton from its species file (species/<id>.yaml), skeleton-first.

   Writes species/build/<id>.skeleton.json (every joint in millimetres and in drawing units, the bones, and a fit report: each target, what was achieved,
   and where targets fought each other) and species/build/<id>.skeleton.svg/.png (the bare skeleton, big, on a flat background, with the ground line).

   How it is laid out (side view, facing right; local frame in mm, x forward, y up, ground at y = 0):
   - Front leg from the ground up: toes, metacarpus (MC3) at the measured standing carpus angle, radius vertical, then humerus and scapula at angles solved
     so the scapula top meets the withers height while the shoulder angle stays near its measured value.
   - Spine from the withers back: thoracic and lumbar lengths from the presacral length and its measured shares, then the sacrum and pelvis (croup angle).
   - Hind leg from the hip joint (acetabulum) down: femur, tibia and metatarsus at angles solved so the paw meets the ground, near the measured stifle and hock
     angles and a near-vertical metatarsus.
   - Neck forward and up from the withers; skull (braincase, muzzle) and lower jaw from the skull numbers; ribcage to the measured chest depth; tail hanging
     at the measured carriage.
   Numbers the research does not give are ASSUMPTIONS, listed by name in the JSON and on the drawing, each with why. Change them in ASSUME below.
   Drawing units: the withers stand at --withers units (default 24.5, the size the current dogs are drawn at) above the ground line at y = 35.5."""
import sys, json, math, pathlib
import numpy as np, yaml
from scipy.optimize import least_squares
ROOT = pathlib.Path(__file__).resolve().parents[2]; SPECIES = ROOT / 'species'; BUILD = SPECIES / 'build'

# Assumptions: anatomy the research tables do not give. Fractions are of the named bone. Each is visible in the output.
ASSUME = {
  'digit_height':      (0.22, 'height of the toe joint above the ground, x MC3/MT3 (paw pad thickness; estimate)'),
  'digit_length':      (0.55, 'toes, joint to tip, x MC3/MT3 (estimate)'),
  'olecranon':         (0.10, 'point of the elbow above the joint, x radius (ulna olecranon 7-12% of ulna, Law 2025)'),
  'withers_gap':       (0.025, 'withers top above the scapula top, x withers height (T1-T3 spines just above the scapula; Miller via fact-check Q8)'),
  'scapula_elevation': (60.0, 'scapula angle above horizontal, deg (Elliott cineradiography; Fischer & Lilje: about 30 deg off vertical; fact-check Q1, firm target)'),
  'croup_angle':       (40.0, 'pelvis (crest to ischium) below horizontal, deg (standing radiographs 43 +- 4; conformation texts 30-40; fact-check Q6)'),
  'pelvis_length':     (0.80, 'ilium crest to ischium, x femur (wolf 0.82 from Law 2025 raw data; fact-check Q6)'),
  'acetabulum_at':     (0.60, 'hip joint position along the pelvis from the crest (ilium:ischium about 3:2, Riser 1975; fact-check Q6)'),
  'acetabulum_drop':   (0.15, 'hip joint below the crest-ischium line, x pelvis length (estimate; fact-check Q6)'),
  'sacrum_length':     (0.06, 'sacrum, x presacral length (wolf 48.8 mm, Law 2025 raw data; fact-check Q6)'),
  'neck_elevation':    (40.0, 'neck angle above horizontal at standing carriage, deg (estimate; the photo number uses another definition)'),
  'skull_pitch':       (20.0, 'skull axis below horizontal, deg (wolf standing photos about 19; semicircular-canal studies; fact-check Q9)'),
  'mandible':          (0.78, 'lower jaw length, x condylobasal length (wolf craniometry 0.77-0.80; fact-check Q10)'),
  'tmj_drop':          (0.10, 'jaw joint below the skull axis, x condylobasal length (estimate)'),
  'ear_set':           (130.0, 'ear angle from the FORWARD skull axis, deg (wolf photos: about 23 deg back of vertical relaxed; about 105 alert; fact-check Q11)'),
  'tmj_along':         (0.23, 'jaw joint ahead of the occiput along the skull axis, x condylobasal length (Law 2025 raw data, 22 canids; fact-check Q10)'),
  'metatarsus_tilt':   (5.0, 'hind pastern off vertical, paw ahead, deg (standing radiographs: up to about 20; a vertical one is a show stance; fact-check Q5)'),
  'cervicothoracic':   ((0.06, -0.10), 'neck root from the withers point, (forward, down) x withers height (estimate)'),
}

def num(sp, group, key):
    return sp['numbers'][group][key]['value']

def build(sp, withers_units=24.5, ground_y=35.5):
    A = {k: v[0] for k, v in ASSUME.items()}; B = sp['numbers']['bones']; H = num(sp, 'size', 'shoulder_height')
    scap, hum, rad, mc3 = (B[k]['value'] for k in ('scapula', 'humerus', 'radius', 'mc3'))
    fem, tib, mt3 = (B[k]['value'] for k in ('femur', 'tibia', 'mt3'))
    carpus_ang = num(sp, 'angles', 'carpus_standing'); stifle_ang = num(sp, 'angles', 'stifle_standing'); hock_ang = num(sp, 'angles', 'hock_standing'); shoulder_ang = num(sp, 'angles', 'shoulder_standing'); elbow_ang = num(sp, 'angles', 'elbow_standing')
    pre = num(sp, 'spine', 'presacral_length'); thor = pre * num(sp, 'spine', 'thorax_share'); lumb = pre * num(sp, 'spine', 'lumbar_share'); neck = pre * num(sp, 'spine', 'neck_share')
    disc = lambda k: 1 / (1 - sp['numbers']['spine'].get(f'disc_share_{k}', {}).get('value', 0.0))   # add the discs (Scout 13); the sacrum stays centra-only
    thor *= disc('thorax'); lumb *= disc('lumbar'); neck *= disc('neck')
    cbl = num(sp, 'skull', 'condylobasal_length'); bcl = num(sp, 'skull', 'braincase_over_length') * cbl
    chest = num(sp, 'ratios', 'chest_depth_over_height') * H; tail_len = num(sp, 'size', 'tail_length'); tail_carry = num(sp, 'angles', 'tail_carriage')
    ear = num(sp, 'size', 'ear_length'); muzzle_bend = 180 - num(sp, 'angles', 'head_muzzle_vs_skull')
    d = lambda deg: (math.cos(math.radians(deg)), math.sin(math.radians(deg)))
    add = lambda p, L, deg: (p[0] + L * d(deg)[0], p[1] + L * d(deg)[1])

    # ---- front leg, ground up: paw contact at x = 0 ----
    mcp = (0.0, A['digit_height'] * mc3); slope = 180 - carpus_ang                      # pastern slopes back from the vertical radius by (180 - carpus angle)
    carpus = (mcp[0] - mc3 * math.sin(math.radians(slope)), mcp[1] + mc3 * math.cos(math.radians(slope)))
    elbow = (carpus[0], carpus[1] + rad)
    def front(v):
        ae, be = v   # humerus elevation (forward-up from the elbow), scapula elevation (back-up from the shoulder joint)
        sh = add(elbow, hum, ae); top = add(sh, scap, 180 - be); return sh, top
    def fres(v):   # bones and angles drive the pose; the withers height is an OUTCOME, compared with the field height in the fit report
        ae, be = v
        return [0.5 * ((ae + be) - shoulder_ang) / 5, 1.0 * ((90 + ae) - elbow_ang) / 5, 1.5 * (be - A['scapula_elevation']) / 5]   # the scapula is the firm target (fact-check Q1); the shoulder follows
    fv = least_squares(fres, [50, 60], bounds=([10, 20], [85, 89])).x; shoulder, scap_top = front(fv)
    gap = A['withers_gap'] * H; withers = (scap_top[0] + 0.02 * H, scap_top[1] + gap); Hd = withers[1]   # the derived withers height

    # ---- hind leg, ground up (metatarsus near vertical, the measured hock and the stifle target), then the pelvis on the hip joint ----
    ms = A['metatarsus_tilt']; mtp = (0.0, A['digit_height'] * mt3); hock = (mtp[0] - mt3 * math.sin(math.radians(ms)), mtp[1] + mt3 * math.cos(math.radians(ms)))
    up = 90 + ms                                                    # direction hock -> up along the metatarsus... reversed: mtp -> hock
    hock_to_mtp = up + 180; tib_dir = hock_to_mtp + hock_ang        # the tibia leaves the hock forward-up (the stifle is in front of the hock)
    stifle = add(hock, tib, tib_dir); stifle_to_hock = tib_dir + 180; fem_dir = stifle_to_hock - stifle_ang   # the femur leaves the stifle back-up
    acet = add(stifle, fem, fem_dir)
    pel = A['pelvis_length'] * fem; on_line = add(acet, A['acetabulum_drop'] * pel, A['croup_angle'] + 90)   # the crest-ischium line runs above the hip joint
    crest = add(on_line, A['acetabulum_at'] * pel, A['croup_angle']); ischium = add(crest, pel, 180 + A['croup_angle'])
    croup = (crest[0] - 0.05 * pel, crest[1] + 0.04 * H)
    # ---- spine from the withers back to the croup: its length fixes how far behind the front paw the hind paw stands ----
    L = (thor + lumb) * 0.985; dy = Hd - croup[1]; span = math.sqrt(max(L * L - dy * dy, 1)); shift = (withers[0] - span) - croup[0]
    mv = lambda q: (q[0] + shift, q[1])
    mtp, hock, stifle, acet, crest, ischium, croup = map(mv, (mtp, hock, stifle, acet, crest, ischium, croup))
    sac = A['sacrum_length'] * pre; sacrum_end = add(croup, sac, 180 + 8)
    def inc(a, b, c):
        v1 = np.subtract(a, b); v2 = np.subtract(c, b); return math.degrees(math.acos(np.dot(v1, v2) / np.linalg.norm(v1) / np.linalg.norm(v2)))
    H = Hd; chest = num(sp, 'ratios', 'chest_depth_over_height') * H   # from here on, heights are relative to the derived withers
    # ---- neck, skull, jaw, ears ----
    ct = (withers[0] + A['cervicothoracic'][0] * H, withers[1] + A['cervicothoracic'][1] * H)
    occiput = add(ct, neck, A['neck_elevation']); p = -A['skull_pitch']
    stop = add(occiput, bcl, p); nose = add(stop, cbl - bcl, p - muzzle_bend)
    tmj = add(add(occiput, A['tmj_along'] * cbl, p), A['tmj_drop'] * cbl, p - 90); chin = add(tmj, A['mandible'] * cbl, p - muzzle_bend - 4)
    eye = add(add(occiput, bcl * 0.95, p), 0.10 * cbl, p + 90 - 180 + 180)   # just behind the stop, a little above the axis
    earbase = add(occiput, bcl * 0.35, p); eartip = add(earbase, ear, p + A['ear_set'])   # measured from the forward skull axis, so 130 leans the ear back of vertical

    # ---- ribcage, tail ----
    sternum_front = (shoulder[0] - 0.02 * H, H - chest * 0.82); sternum_back = (withers[0] - thor * 0.80, H - chest)
    ribs = []
    for i in range(13):
        t = i / 12; top = (withers[0] - thor * t, H - 0.05 * H - 0.01 * H * t); bot_t = min(1, t / 0.8)
        bot = (sternum_front[0] + (sternum_back[0] - sternum_front[0]) * bot_t, sternum_front[1] + (sternum_back[1] - sternum_front[1]) * bot_t) if t <= .8 else (top[0] + 0.12 * thor * (t - .8) / .2, top[1] - chest * (0.9 - 0.4 * (t - .8) / .2))
        ribs.append((top, bot))
    tail = [sacrum_end]; n_c = int(round(num(sp, 'spine', 'caudal'))); seg = tail_len / n_c
    for i in range(n_c):
        ang = 180 + (-tail_carry) * (0.85 + 0.15 * i / n_c)      # hangs at the measured carriage (degrees below the topline), curling a little toward the tip
        tail.append(add(tail[-1], seg, ang))

    J = {'nose': nose, 'stop': stop, 'occiput': occiput, 'eye': eye, 'tmj': tmj, 'chin': chin, 'ear_base': earbase, 'ear_tip': eartip, 'neck_root': ct,
         'withers': withers, 'scapula_top': scap_top, 'shoulder': shoulder, 'elbow': elbow, 'carpus': carpus, 'front_mcp': mcp, 'front_toe': (mcp[0] + A['digit_length'] * mc3, 0.0),
         'croup': croup, 'ilium_crest': crest, 'hip': acet, 'ischium': ischium, 'stifle': stifle, 'hock': hock, 'hind_mtp': mtp, 'hind_toe': (mtp[0] + A['digit_length'] * mt3, 0.0),
         'sacrum_end': sacrum_end, 'tail_tip': tail[-1], 'sternum_front': sternum_front, 'sternum_back': sternum_back}
    bones = [('scapula', 'scapula_top', 'shoulder'), ('humerus', 'shoulder', 'elbow'), ('radius', 'elbow', 'carpus'), ('metacarpus', 'carpus', 'front_mcp'), ('front toes', 'front_mcp', 'front_toe'),
             ('femur', 'hip', 'stifle'), ('tibia', 'stifle', 'hock'), ('metatarsus', 'hock', 'hind_mtp'), ('hind toes', 'hind_mtp', 'hind_toe'),
             ('pelvis', 'ilium_crest', 'ischium'), ('thoracic spine', 'withers', None), ('neck', 'neck_root', 'occiput'), ('braincase', 'occiput', 'stop'), ('muzzle', 'stop', 'nose'), ('mandible', 'tmj', 'chin'), ('ear', 'ear_base', 'ear_tip'), ('sternum', 'sternum_front', 'sternum_back')]
    spine = [ct, withers, ((withers[0] + croup[0]) / 2 + 0.0, H * 1.0), croup, sacrum_end]

    # ---- the fit report: each target, what came out ----
    fe_inc = lambda a, b, c: round(inc(J[a], J[b], J[c]), 1)
    Hf = num(sp, 'size', 'shoulder_height'); rng = sp['numbers']['size']['shoulder_height'].get('range')
    fit = [
      ('withers height from the bones (mm)', f'{Hf} {rng}', round(withers[1], 1), 'species size.shoulder_height (field, includes skin and fur)'),
      ('croup height / withers (topline slope)', 'about 1', round(croup[1] / withers[1], 3), 'outcome of the hind leg; wolves stand roughly level'),
      ('shoulder angle', shoulder_ang, fe_inc('scapula_top', 'shoulder', 'elbow'), 'species angles.shoulder_standing (dog proxy)'),
      ('elbow angle', elbow_ang, fe_inc('shoulder', 'elbow', 'carpus'), 'species angles.elbow_standing (dog proxy)'),
      ('scapula elevation', A['scapula_elevation'], round(fv[1], 1), 'assumption scapula_elevation (firm, fact-check Q1)'),
      ('carpus angle', carpus_ang, fe_inc('elbow', 'carpus', 'front_mcp'), 'species angles.carpus_standing'),
      ('stifle angle', stifle_ang, fe_inc('hip', 'stifle', 'hock'), 'species angles.stifle_standing'),
      ('hock angle', hock_ang, fe_inc('stifle', 'hock', 'hind_mtp'), 'species angles.hock_standing'),
      ('hip angle (pelvic axis vs femur)', '~122 (95-122)', round(math.degrees(math.acos(np.dot(np.subtract(J['ilium_crest'], J['ischium']), np.subtract(J['stifle'], J['hip'])) / np.linalg.norm(np.subtract(J['ilium_crest'], J['ischium'])) / np.linalg.norm(np.subtract(J['stifle'], J['hip'])))), 1), 'outcome; standing radiographs about 122 (crest-ischium axis vs femur, fact-check Q3)'),
      ('elbow point height / withers', num(sp, 'ratios', 'elbow_height_over_height'), round((elbow[1] + A['olecranon'] * rad) / withers[1], 3), 'species ratios.elbow_height_over_height (photos, includes fur)'),
      ('chest depth / withers', num(sp, 'ratios', 'chest_depth_over_height'), round((withers[1] - sternum_back[1]) / withers[1], 3), 'species ratios (photos)'),
      ('body length (occiput to tail base) / withers', num(sp, 'ratios', 'body_over_height'), round(math.dist(occiput, sacrum_end) / withers[1], 3), 'species ratios.body_over_height (photos)'),
      ('front to hind paw (mm)', '-', round(J['front_mcp'][0] - J['hind_mtp'][0], 1), 'outcome of the spine length'),
    ]
    s = withers_units / withers[1]; x0 = 31 - (min(p[0] for p in J.values()) + max(p[0] for p in J.values())) / 2 * s   # centre the animal in the 62-wide drawing
    U = lambda q: [round(x0 + q[0] * s, 3), round(ground_y - q[1] * s, 3)]
    return {'id': sp['id'], 'name': sp['name'], 'scale_units_per_mm': s, 'ground_y': ground_y,
            'joints_mm': {k: [round(v[0], 1), round(v[1], 1)] for k, v in J.items()}, 'joints': {k: U(v) for k, v in J.items()},
            'bones': [{'name': n, 'from': a, 'to': b} for n, a, b in bones if b], 'spine': [U(q) for q in spine], 'ribs': [[U(a), U(b)] for a, b in ribs], 'tail': [U(q) for q in tail],
            'fit': [{'target': t, 'wanted': w, 'got': g, 'from': f} for t, w, g, f in fit], 'assumptions': {k: {'value': v[0], 'why': v[1]} for k, v in ASSUME.items()}}

def svg(sk, scale=22):
    W, Hh = 62 * scale, 40 * scale; J = sk['joints']; P = lambda q: f'{q[0] * scale:.1f},{(q[1] + 1) * scale:.1f}'
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{Hh + 330}" viewBox="0 0 {W} {Hh + 330}"><rect width="100%" height="100%" fill="#efe6d2"/>']
    for x in range(0, 63, 5): out.append(f'<line x1="{x * scale}" y1="0" x2="{x * scale}" y2="{Hh}" stroke="#d9cdb3" stroke-width="1"/>')
    for y in range(-1, 40, 5): out.append(f'<line x1="0" y1="{(y + 1) * scale}" x2="{W}" y2="{(y + 1) * scale}" stroke="#d9cdb3" stroke-width="1"/>')
    gy = (sk['ground_y'] + 1) * scale; out.append(f'<line x1="0" y1="{gy}" x2="{W}" y2="{gy}" stroke="#7a6a50" stroke-width="3"/>')
    for a, b in sk['ribs']: out.append(f'<line x1="{a[0] * scale:.1f}" y1="{(a[1] + 1) * scale:.1f}" x2="{b[0] * scale:.1f}" y2="{(b[1] + 1) * scale:.1f}" stroke="#bfae8c" stroke-width="5" stroke-linecap="round"/>')
    pts = lambda L: ' '.join(P(q) for q in L)
    out.append(f'<polyline points="{pts(sk["spine"])}" fill="none" stroke="#8b7a5c" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>')
    out.append(f'<polyline points="{pts(sk["tail"])}" fill="none" stroke="#8b7a5c" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>')
    for b in sk['bones']:
        a, c = J[b['from']], J[b['to']]; w = 9 if b['name'] in ('femur', 'humerus', 'tibia', 'radius', 'scapula', 'pelvis', 'braincase') else 6
        out.append(f'<line x1="{a[0] * scale:.1f}" y1="{(a[1] + 1) * scale:.1f}" x2="{c[0] * scale:.1f}" y2="{(c[1] + 1) * scale:.1f}" stroke="#4a3b2a" stroke-width="{w}" stroke-linecap="round"/>')
    for k, q in J.items():
        out.append(f'<circle cx="{q[0] * scale:.1f}" cy="{(q[1] + 1) * scale:.1f}" r="5" fill="#d9822b" stroke="#2a1a10" stroke-width="1.5"/>')
        out.append(f'<text x="{q[0] * scale + 7:.1f}" y="{(q[1] + 1) * scale - 6:.1f}" font-family="sans-serif" font-size="13" fill="#2a1a10">{k}</text>')
    y = Hh + 28; out.append(f'<text x="16" y="{y}" font-family="sans-serif" font-size="18" font-weight="bold" fill="#2a1a10">{sk["name"]}: standing skeleton from species/{sk["id"]}.yaml (draft)</text>')
    for f in sk['fit']:
        y += 22; out.append(f'<text x="16" y="{y}" font-family="monospace" font-size="15" fill="#2a1a10">{f["target"]:<46} wanted {f["wanted"]:>7}   got {f["got"]:>7}   ({f["from"]})</text>')
    out.append('</svg>'); return '\n'.join(out)

def main(args):
    if not args: print(__doc__); return 2
    sid = args[0]; sp = yaml.safe_load(open(SPECIES / f'{sid}.yaml')); sk = build(sp)
    BUILD.mkdir(exist_ok=True); (BUILD / f'{sid}.skeleton.json').write_text(json.dumps(sk, indent=1))
    s = svg(sk); (BUILD / f'{sid}.skeleton.svg').write_text(s)
    import subprocess
    subprocess.run(['node', '-e', f"const {{Resvg}}=require('@resvg/resvg-js');const fs=require('fs');fs.writeFileSync('{BUILD}/{sid}.skeleton.png',new Resvg(fs.readFileSync('{BUILD}/{sid}.skeleton.svg','utf8')).render().asPng())"], cwd=ROOT, check=True)
    print(f'wrote species/build/{sid}.skeleton.json, .svg and .png'); print(f'{"target":<46} {"wanted":>8} {"got":>8}')
    for f in sk['fit']: print(f'{f["target"]:<46} {f["wanted"]:>8} {f["got"]:>8}   {f["from"]}')
    return 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
