#!/usr/bin/env python3
"""den muscles3d <id>: muscles, step M1: Stark's 158 muscle lines (full dog model, MIT; ref/research/fetched/03-dog-model) put on the species' 3D
   skeleton (den skeleton3d) in the same stance, and checked so everything lines up before any muscle gets a volume.

   The full model is the Shepherd-sized original of the Beagle we build from (Beagle = full x0.8 trunk, x0.6 limbs), so it is scaled by the same
   per-body factors times 0.8 / 0.6, and stood in the solved coordinates from species/build/<id>.skel3d.json. OpenSim rescales each muscle's
   optimal fibre length and tendon slack with its path length.
   Checks:
     0. the bones: every body lands where skeleton3d put it (mm);
     1. attachments: each origin and insertion sits on its own bone's surface (distance to the bone mesh, mm);
     2. stance length: each muscle's fibre length at the stance, as a share of its optimal length (0.5-1.5 plausible). Outliers are split into ours and
        inherited (already outside the range in Stark's model at its own default pose: its straight-line paths skip the wrapping);
     3. left/right: the two sides have the same path length.
   The 8 trunk muscles with placeholder parameters (1.0 N, 0.01 m; fetched/03 NOTE) are listed but not judged on length.
   Output: species/build/<id>.muscles3d.json and .png (bones with the near-side muscle lines: forelimb red, hindlimb blue, trunk and neck amber)."""
import sys, json, csv, pathlib, subprocess
import numpy as np
ROOT = pathlib.Path(__file__).resolve().parents[2]; BUILD = ROOT / 'species/build'
FULL = ROOT / 'ref/research/fetched/03-dog-model/stark_full_linear_spezzoo.osim'
sys.path.insert(0, str(pathlib.Path(__file__).parent)); import skeleton3d as S3
TRUNK = {'thorax', 'cervix', 'caput', 'abdomen', 'cauda'}          # Beagle = full x0.8 for these, x0.6 for the pelvis and limbs
PLACEHOLDER = {'iliocostalis', 'longissimus', 'quadratus_lumborum', 'sacrocaudalis'}
FORE = ('scapula', 'humerus', 'antebrachium', 'carpus', 'forepaw'); HIND = ('pelvis', 'femur', 'crus', 'calx', 'hindpaw')

def group(bodies):
    if any(t in b for b in bodies for t in FORE): return 'fore'
    if any(t in b for b in bodies for t in HIND[1:]): return 'hind'
    return 'hind' if all(b in ('pelvis', 'cauda') for b in bodies) else 'trunk'

def build(sid):
    import opensim as osim
    sk = json.load(open(BUILD / f'{sid}.skel3d.json'))
    def fresh():
        m = osim.Model(str(FULL)); fs = m.updForceSet()
        for i in reversed(range(fs.getSize())):
            if 'Muscle' not in fs.get(i).getConcreteClassName(): fs.remove(i)
        return m
    def equil(m, s):
        try: m.equilibrateMuscles(s)
        except Exception: pass                                                   # the placeholder muscles do not converge; the rest do
    # the source model at its own default pose: path lengths (to rescale fibre and tendon lengths) and its own fibre lengths (to tell inherited from ours)
    m0 = fresh(); s0 = m0.initSystem(); m0.realizePosition(s0); equil(m0, s0); ms0 = m0.getMuscles()
    src = {ms0.get(i).getName(): (ms0.get(i).getLength(s0), ms0.get(i).getOptimalFiberLength(), ms0.get(i).getTendonSlackLength(), float(ms0.get(i).getNormalizedFiberLength(s0))) for i in range(ms0.getSize())}
    import trimesh
    from scipy.spatial import cKDTree
    scales0 = {r['body']: float(r['mesh_scale_beagle'].split()[0]) for r in csv.DictReader(open(S3.MESH / 'bodies.csv'))}
    def surface(b): sc = trimesh.load(S3.MESH / f'meshes/{b}.glb'); g = sc.to_geometry() if hasattr(sc, 'to_geometry') else sc; return np.asarray(trimesh.sample.sample_surface(g, 40000, seed=0)[0])
    SURF = {b: surface(b) for b in sk['bodies']}
    def tree_in(mod, st, b, scale):   # a body's bone surface in ground, mm
        X = mod.getBodySet().get(b).getTransformInGround(st); R = X.R(); p = X.p()
        return cKDTree((SURF[b] * np.asarray(scale)) @ np.array([[R.get(i, j) for j in range(3)] for i in range(3)]).T + np.array([p.get(i) for i in range(3)]) * 1000)
    trees0 = {b: tree_in(m0, s0, b, [scales0[b] / (0.8 if b in TRUNK else 0.6)] * 3) for b in sk['bodies']}   # the source model's own bones (Beagle meshes / 0.8 or 0.6)
    att0 = {}
    for i in range(ms0.getSize()):
        pps = ms0.get(i).getGeometryPath().getPathPointSet(); ends = [pps.get(0), pps.get(pps.getSize() - 1)]
        att0[ms0.get(i).getName()] = [round(float(trees0[e.getParentFrame().findBaseFrame().getName()].query([e.getLocationInGround(s0).get(k) * 1000 for k in range(3)])[0]), 1) for e in ends]
    m = fresh(); s = m.initSystem(); ss = osim.ScaleSet()
    for b, v in sk['body_factors'].items():
        k = 0.8 if b in TRUNK else 0.6
        sc = osim.Scale(); sc.setSegmentName(b); sc.setScaleFactors(osim.Vec3(*[c * k for c in v])); sc.setApply(True); ss.cloneAndAppend(sc)
    m.scale(s, ss, True); cs = m.getCoordinateSet()
    for i in range(cs.getSize()): cs.get(i).set_clamped(False); cs.get(i).set_locked(False)
    # rescale fibre and tendon lengths by each path's length change at the default pose, with the scapula slid to its scaled place (Model.scale measures
    # the scaled path with the Shepherd's unscaled scapula translations, which stretches or squashes the thoracic sling)
    for n, v in sk['coords'].items():
        if 'superioris_trans' in n: cs.get(n).setDefaultValue(float(v))
    s = m.initSystem(); m.realizePosition(s); ms = m.getMuscles()
    for i in range(ms.getSize()):
        mu = ms.get(i); L0, lo, lt, _ = src[mu.getName()]; r = mu.getLength(s) / L0
        mu.setOptimalFiberLength(lo * r); mu.setTendonSlackLength(lt * r)
    s = m.initSystem()
    for n, v in sk['coords'].items():
        if cs.contains(n): cs.get(n).setValue(s, float(v), False)
    m.realizePosition(s)
    # 0. bones
    bone_off = {}
    for i in range(m.getBodySet().getSize()):
        b = m.getBodySet().get(i); p = b.getTransformInGround(s).p()
        bone_off[b.getName()] = float(np.linalg.norm(np.array([p.get(k) for k in range(3)]) * 1000 - np.array(sk['bodies'][b.getName()]['p_mm'])))
    # bone surfaces in ground (mm), as skeleton3d places and renders them
    trees = {b: cKDTree((SURF[b] * np.asarray(t['mesh_scale'])) @ np.array(t['R']).T + np.array(t['p_mm'])) for b, t in sk['bodies'].items()}
    equil(m, s); mus = {}; ms = m.getMuscles()
    for i in range(ms.getSize()):
        mu = ms.get(i); name = mu.getName(); gp = mu.getGeometryPath(); pps = gp.getPathPointSet()
        pts, bodies = [], []
        for j in range(pps.getSize()):
            pp = pps.get(j); q = pp.getLocationInGround(s); pts.append([q.get(k) * 1000 for k in range(3)]); bodies.append(pp.getParentFrame().findBaseFrame().getName())
        cur = gp.getCurrentPath(s); path = [[cur.get(j).getLocationInGround(s).get(k) * 1000 for k in range(3)] for j in range(cur.getSize())]
        att = [round(float(trees[bodies[j]].query(pts[j])[0]), 1) for j in (0, len(pts) - 1)]
        base = name.split('_', 1)[1] if name.startswith(('left_', 'right_')) else name
        try: nfl = float(mu.getNormalizedFiberLength(s))
        except Exception: nfl = float('nan')
        mus[name] = {'group': group(bodies), 'bodies': bodies, 'points_mm': pts, 'path_mm': path, 'length_mm': round(gp.getLength(s) * 1000, 1),
                     'attach_off_mm': att, 'attach_off_source_mm': att0[name], 'norm_fibre_length': round(nfl, 3), 'norm_fibre_length_source_default': round(src[name][3], 3), 'placeholder': base in PLACEHOLDER,
                     'L_opt_mm': round(mu.getOptimalFiberLength() * 1000, 1), 'tendon_slack_mm': round(mu.getTendonSlackLength() * 1000, 1), 'Fmax_N_shepherd': mu.getMaxIsometricForce()}
    # 3. left/right
    lr = {n[5:]: round(abs(mus[n]['length_mm'] - mus['right_' + n[5:]]['length_mm']), 1) for n in mus if n.startswith('left_') and 'right_' + n[5:] in mus}
    SIZE = float(np.mean([np.mean(v) * (0.8 if b in TRUNK else 0.6) for b, v in sk['body_factors'].items()]))   # wolf / source size, to compare offsets
    real = {n: v for n, v in mus.items() if not v['placeholder']}
    off = sorted(((max(v['attach_off_mm']), n) for n, v in mus.items()), reverse=True)
    ok = lambda x: 0.5 <= x <= 1.5
    nfl_bad = sorted((v['norm_fibre_length'], n) for n, v in real.items() if not ok(v['norm_fibre_length']) and ok(v['norm_fibre_length_source_default']))
    nfl_inh = sorted(n for n, v in real.items() if not ok(v['norm_fibre_length_source_default']))
    rep = {'bones: worst offset from skeleton3d (mm)': round(max(bone_off.values()), 2),
           'muscles': len(mus), 'placeholder (not judged)': sorted(n for n, v in mus.items() if v['placeholder']),
           'attachments: median / 95th pct / worst distance to own bone (mm)': [round(float(np.median([a for v in mus.values() for a in v['attach_off_mm']])), 1),
                                                                                 round(float(np.percentile([a for v in mus.values() for a in v['attach_off_mm']], 95)), 1), off[0]],
           'attachments over 10 mm from their bone, ours (on the bone in the source model)': [f'{n} {d}' for d, n in off if d > 10 and max(mus[n]['attach_off_source_mm']) * SIZE <= 10],
           'attachments off the bone in the source model too (inherited; muscles from fascia or neighbouring bone)': sorted(n for d, n in off if d > 10 and max(mus[n]['attach_off_source_mm']) * SIZE > 10),
           'stance fibre length / optimal: median and range (real muscles)': [round(float(np.nanmedian([v['norm_fibre_length'] for v in real.values()])), 2),
                                                                              round(float(np.nanmin([v['norm_fibre_length'] for v in real.values()])), 2), round(float(np.nanmax([v['norm_fibre_length'] for v in real.values()])), 2)],
           'stance fibre length outside 0.5-1.5, ours (fine in the source model)': [f'{n} {x}' for x, n in nfl_bad],
           'already outside 0.5-1.5 in the source model at its own pose (inherited)': nfl_inh,
           'left/right path difference, worst (mm)': max(lr.values()) if lr else None}
    return {'id': sid, 'report': rep, 'muscles': mus, 'bone_offsets_mm': bone_off}

BL_EXTRA = r'''
cols = {'fore': (0.85, 0.2, 0.18, 1), 'hind': (0.2, 0.45, 0.95, 1), 'trunk': (0.95, 0.65, 0.15, 1)}
mm = {g: mat('m_' + g, c) for g, c in cols.items()}
for f, g in d['muscle_objs']:
    bpy.ops.wm.obj_import(filepath=f, forward_axis='Y', up_axis='Z')
    for o in bpy.context.selected_objects: o.data.materials.clear(); o.data.materials.append(mm[g])
bb = d['bbox'];'''

def render(sid, out):
    import trimesh
    sk = json.load(open(BUILD / f'{sid}.skel3d.json')); od = BUILD / '.muscles3d_obj'; od.mkdir(exist_ok=True); objs = []
    for n, v in out['muscles'].items():
        if not n.startswith('left_'): continue                                  # the near side only (the camera is on the left, the picture is mirrored)
        P = np.array(v['path_mm']); parts = [trimesh.creation.cylinder(radius=2.2, segment=P[j:j + 2]) for j in range(len(P) - 1) if np.linalg.norm(P[j + 1] - P[j]) > 0.5]
        parts += [trimesh.creation.icosphere(radius=4.0).apply_translation(P[j]) for j in (0, len(P) - 1)]
        f = od / f'{n}.obj'; trimesh.util.concatenate(parts).export(f); objs.append([str(f), v['group']])
    sk['muscle_objs'] = objs; j = BUILD / f'.{sid}.muscles3d_render.json'; j.write_text(json.dumps(sk))
    script = BUILD / '.muscles3d_render.py'; script.write_text(S3.BLENDER.replace("bb = d['bbox'];", BL_EXTRA, 1))
    png = BUILD / f'{sid}.muscles3d.png'; r = subprocess.run([sys.executable, str(script), str(j), str(png)], capture_output=True, text=True)
    if r.returncode: print(r.stdout[-1500:], r.stderr[-1500:]); raise SystemExit('blender failed')
    from PIL import Image, ImageOps
    ImageOps.mirror(Image.open(png)).save(png)

def main(args):
    sid = args[0]; out = build(sid)
    (BUILD / f'{sid}.muscles3d.json').write_text(json.dumps(out, indent=1)); render(sid, out)
    print(f'wrote species/build/{sid}.muscles3d.json and .png')
    for k, v in out['report'].items(): print(f'  {k}: {v}')
    return 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
