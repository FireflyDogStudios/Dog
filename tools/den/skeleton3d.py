#!/usr/bin/env python3
"""den skeleton3d <id>: the species' REAL 3D skeleton: the Stark 2021 dog model's bones (MIT; ref/research/scout/10-stark-meshes), scaled per bone to
   the species' sourced lengths (species/<id>.yaml), stood in its sourced standing angles, and rendered side-on in Blender (headless).

   1. Kinematics: OpenSim 4.6 loads the real-Beagle model (fetched/03-dog-model/stark_beagle_fore_verified.osim; muscles removed, they are not needed
      to pose bones). Every bone is placed by the model's own joints.
   2. Scale: each body is scaled uniformly by (species bone length / Beagle bone length), measured joint centre to joint centre (OpenSim Model.scale),
      so the chest depth, pelvis and skull follow the real bones instead of a photo ratio.
   3. Stance: the sagittal joint angles are solved (least squares) so the side view hits the species' standing angles (scapula elevation, shoulder,
      elbow, carpus, stifle, hock, pastern tilt), with all four paws on one ground line and a level trunk; the far legs mirror the near ones.
   4. Render: Blender 4.2 headless, orthographic camera from the dog's left, Cycles CPU; bone meshes at their model display scale.
   Output: species/build/<id>.skel3d.json (body transforms, joint centres, the fit report) and <id>.skel3d.png."""
import sys, json, csv, math, pathlib, subprocess
import numpy as np, yaml
from scipy.optimize import least_squares
ROOT = pathlib.Path(__file__).resolve().parents[2]; BUILD = ROOT / 'species/build'
OSIM = ROOT / 'ref/research/fetched/03-dog-model/stark_beagle_fore_verified.osim'; MESH = ROOT / 'ref/research/scout/10-stark-meshes'

def load():
    import opensim as osim
    m = osim.Model(str(OSIM)); m.updForceSet().clearAndDestroy(); s = m.initSystem(); return osim, m, s

def jc(m, s, joint):   # joint centre in ground, metres -> mm, in the OpenSim frame (X left, Y back, Z up)
    p = m.getJointSet().get(joint).getChildFrame().getPositionInGround(s); return np.array([p.get(0), p.get(1), p.get(2)]) * 1000

def side(p): return np.array([-p[1], p[2]])   # side view facing right: x = forward (-Y), y = up (Z)

CH = {'shoulder': 'left_scapula_left_humerus', 'elbow': 'left_humerus_left_antebrachium', 'carpus': 'left_antebrachium_left_carpus', 'mcp': 'left_carpus_left_forepaw',
      'hip': 'pelvis_left_femur', 'stifle': 'left_femur_left_crus', 'hock': 'left_crus_left_calx', 'mtp': 'left_calx_left_hindpaw',
      'T1': 'thorax_cervix', 'TL': 'thorax_abdomen', 'LS': 'abdomen_cauda', 'occ': 'cervix_caput'}

def mesh_pts(body, n=4000):
    import trimesh
    sc = trimesh.load(MESH / f'meshes/{body}.glb'); g = sc.dump(concatenate=True) if hasattr(sc, 'dump') else sc
    v = np.asarray(g.vertices); return v[np.random.default_rng(0).choice(len(v), min(n, len(v)), replace=False)]

def to_ground(m, s, body, P_mm, scale):
    T = m.getBodySet().get(body).getTransformInGround(s); R = T.R(); p = T.p()
    Rm = np.array([[R.get(i, j) for j in range(3)] for i in range(3)]); pm = np.array([p.get(i) for i in range(3)]) * 1000
    return (np.asarray(P_mm) * np.asarray(scale)) @ Rm.T + pm

def build(sid):
    osim, m, s = load(); sp = yaml.safe_load(open(ROOT / f'species/{sid}.yaml'))['numbers']; B = sp['bones']; SP = sp['spine']; SK = sp['skull']; A = sp['angles']; RAT = sp['ratios']
    d = lambda a, b: np.linalg.norm(jc(m, s, CH[a]) - jc(m, s, CH[b]))
    scales0 = {r['body']: float(r['mesh_scale_beagle'].split()[0]) for r in csv.DictReader(open(MESH / 'bodies.csv'))}
    # the Beagle's own lengths, joint centre to joint centre; the scapula and skull from their meshes
    sh = jc(m, s, CH['shoulder']); scap = to_ground(m, s, 'left_scapula', mesh_pts('left_scapula'), scales0['left_scapula'])
    GL = lambda b: float(np.ptp(mesh_pts(b, 20000)[:, 2]) * scales0[b])      # greatest length along the bone's own axis (body Z), as museums measure it
    beagle = {'scapula': GL('left_scapula'), 'humerus': GL('left_humerus'), 'radius': GL('left_antebrachium'), 'mc': d('carpus', 'mcp'),
              'femur': GL('left_femur'), 'tibia': GL('left_crus'), 'mt': d('hock', 'mtp'), 'thorax': d('T1', 'TL'), 'lumbar': d('TL', 'LS'), 'neck': d('T1', 'occ')}
    cap = mesh_pts('caput') * scales0['caput']; beagle['skull'] = np.ptp(cap[:, 1])
    pre = SP['presacral_length']['value']
    wolf = {'scapula': B['scapula']['value'], 'humerus': B['humerus']['value'], 'radius': B['radius']['value'], 'mc': B['mc3']['value'],
            'femur': B['femur']['value'], 'tibia': B['tibia']['value'], 'mt': B['mt3']['value'], 'thorax': pre * SP['thorax_share']['value'],
            'lumbar': pre * SP['lumbar_share']['value'], 'neck': pre * SP['neck_share']['value'], 'skull': SK['condylobasal_length']['value']}
    f = {k: wolf[k] / beagle[k] for k in wolf}
    # Law's spine lengths are vertebral bodies only; the Beagle's joint-to-joint lengths include its discs, so the wolf gets its discs (Scout 13) before comparing.
    # The meshes are not given extra gaps: they scale with their own.
    for k in ('thorax', 'lumbar', 'neck'): f[k] /= 1 - SP.get(f'disc_share_{k}', {}).get('value', 0.0)
    body_f = {'thorax': f['thorax'], 'abdomen': f['lumbar'], 'cervix': f['neck'], 'caput': f['skull'], 'cauda': (f['lumbar'] + f['femur']) / 2, 'pelvis': f['femur']}
    for sd in ('left', 'right'):
        body_f.update({f'{sd}_scapula': f['scapula'], f'{sd}_humerus': f['humerus'], f'{sd}_antebrachium': f['radius'], f'{sd}_carpus': f['mc'], f'{sd}_forepaw': f['mc'],
                       f'{sd}_femur': f['femur'], f'{sd}_crus': f['tibia'], f'{sd}_calx': f['mt'], f'{sd}_hindpaw': f['mt']})
    # limb bones: stretched along their own axis (body Z) by their length ratio; thickness by the overall size ratio (mean of the limb ratios)
    cross = float(np.mean([f[k] for k in ('humerus', 'radius', 'femur', 'tibia')])); limb = lambda b: any(t in b for t in ('scapula', 'humerus', 'antebrachium', 'carpus', 'forepaw', 'femur', 'crus', 'calx', 'hindpaw'))
    vec = {b: ((cross, cross, k) if limb(b) else (cross, k, cross) if b in ('thorax', 'abdomen', 'cervix') else (k, k, k)) for b, k in body_f.items()}
    # trunk and neck: length (body Y, along the spine) by the spine ratio, depth and width (X, Z) by the overall size ratio, so the ribcage keeps a real depth
    ss = osim.ScaleSet()
    for b, v in vec.items():
        sc = osim.Scale(); sc.setSegmentName(b); sc.setScaleFactors(osim.Vec3(*v)); sc.setApply(True); ss.cloneAndAppend(sc)
    m.scale(s, ss, True); s = m.initSystem()
    mesh_scale = {b: [scales0[b] * c for c in vec[b]] for b in vec}
    cs = m.getCoordinateSet(); C = lambda n: cs.get(n)
    for i in range(cs.getSize()): cs.get(i).set_clamped(False); cs.get(i).set_locked(False)         # the model's default ranges are not anatomical (fetched/03 NOTE); limits are checked separately
    # the scapula slides on the ribcage through translation coordinates, which Model.scale leaves at the Beagle's values: scale them with the thorax
    # (x across and z up by the girth ratio, y along the spine by the thorax length ratio), so the blade sits where it does on the Beagle's ribcage
    for sd in ('left', 'right'):
        for ax, k in (('x', cross), ('y', f['thorax']), ('z', cross)):
            c = C(f'{sd}_r_m_superioris_trans{ax}'); c.setDefaultValue(c.getDefaultValue() * k)
    s = m.initSystem()
    # stance: solve the sagittal angles
    free = ['thorax_sagittal', 'left_r_m_superioris_sagittal', 'left_r_deltoidea_sagittal', 'left_r_cubitalis_sagittal', 'left_r_carpalis_sagittal', 'left_r_forepaw_sagittal',
            'm_inferioris_sagittal', 'left_r_coxae_sagittal', 'left_r_genus_sagittal', 'left_r_talocruralis_sagittal', 'left_r_hindpaw_sagittal', 'cervix_sagittal', 'caput_sagittal']
    x0 = np.array([C(n).getValue(s) for n in free])
    scap_local = mesh_pts('left_scapula', 1500); pelv_local = mesh_pts('pelvis', 1500); cap_local = mesh_pts('caput', 1500); th_local = mesh_pts('thorax', 1500)
    INOSE = IBACK = None   # nose tip and back of the skull: fixed skull points picked at the start pose (picking per pose let the solver flip the head over)
    def ang(a, b, c): v1, v2 = a - b, c - b; return math.degrees(math.acos(np.clip(v1 @ v2 / np.linalg.norm(v1) / np.linalg.norm(v2), -1, 1)))
    def pose(x):
        for n, v in zip(free, x): C(n).setValue(s, float(v), False)
        m.realizePosition(s)
        P = {k: side(jc(m, s, j)) for k, j in CH.items()}
        sg = np.array([side(q) for q in to_ground(m, s, 'left_scapula', scap_local, mesh_scale['left_scapula'])])
        P['scap_top'] = sg[np.argmax(np.linalg.norm(sg - P['shoulder'], axis=1))]
        fp = np.array([side(q) for q in to_ground(m, s, 'left_forepaw', mesh_pts('left_forepaw', 800), mesh_scale['left_forepaw'])]); hp = np.array([side(q) for q in to_ground(m, s, 'left_hindpaw', mesh_pts('left_hindpaw', 800), mesh_scale['left_hindpaw'])])
        pg = np.array([side(q) for q in to_ground(m, s, 'pelvis', pelv_local, mesh_scale['pelvis'])]); P['ilium'] = pg[np.argmax(pg[:, 0] + 0.3 * pg[:, 1])]; P['ischium'] = pg[np.argmin(pg[:, 0])]
        nonlocal INOSE, IBACK
        cg = np.array([side(q) for q in to_ground(m, s, 'caput', cap_local, mesh_scale['caput'])])
        if INOSE is None: INOSE, IBACK = int(np.argmax(cg[:, 0])), int(np.argmin(cg[:, 0]))
        P['nose'] = cg[INOSE]; P['skull_back'] = cg[IBACK]
        tg = np.array([side(q) for q in to_ground(m, s, 'thorax', th_local, mesh_scale['thorax'])]); P['topline'] = tg[np.argmax(tg[:, 1])]   # top of the thoracic spines: the real withers
        P['ftoe'] = fp[np.argmax(fp[:, 0])]; P['htoe'] = hp[np.argmax(hp[:, 0])]; P['fpad'] = fp[np.argmin(fp[:, 1])]; P['hpad'] = hp[np.argmin(hp[:, 1])]
        return P
    GR_ = lambda P: min(P['fpad'][1], P['hpad'][1]); WH_ = lambda P: P['scap_top'][1] - GR_(P)
    HS_ = lambda P: max(P['topline'][1], P['scap_top'][1]) - GR_(P) + 0.067 * WH_(P)    # outline height, as the photos were measured: highest back point + skin + fur
    def res(x):
        P = pose(x); r = []
        scap_el = math.degrees(math.atan2(P['scap_top'][1] - P['shoulder'][1], -(P['scap_top'][0] - P['shoulder'][0])))
        r += [(scap_el - 60) / 3, (ang(P['scap_top'], P['shoulder'], P['elbow']) - A['shoulder_standing']['value']) / 5, (ang(P['shoulder'], P['elbow'], P['carpus']) - A['elbow_standing']['value']) / 3,
              (ang(P['elbow'], P['carpus'], P['mcp']) - A['carpus_standing']['value']) / 3, (ang(P['hip'], P['stifle'], P['hock']) - A['stifle_standing']['value']) / 3,
              (ang(P['stifle'], P['hock'], P['mtp']) - A['hock_standing']['value']) / 1.5,
              (math.degrees(math.atan2(P['mtp'][0] - P['hock'][0], P['hock'][1] - P['mtp'][1])) - 5) / 3,          # hind pastern tilted ~5 deg, paw forward
              (P['fpad'][1] - P['hpad'][1]) / 2, (P['T1'][1] - P['LS'][1] - 0.06 * (P['T1'][0] - P['LS'][0])) / 40,      # paws on one ground; trunk about level
              (math.degrees(math.atan2(P['ftoe'][1] - P['mcp'][1], P['ftoe'][0] - P['mcp'][0])) + 35) / 6,          # toes forward-down onto the pad (estimate)
              (math.degrees(math.atan2(P['htoe'][1] - P['mtp'][1], P['htoe'][0] - P['mtp'][0])) + 35) / 6,
              (((P['nose'][0] + 0.037 * WH_(P)) - P['scap_top'][0]) / HS_(P) - RAT['nose_forward_over_height']['value']) / 0.02,
              ((P['nose'][1] - GR_(P)) / HS_(P) - RAT['nose_height_over_height']['value']) / 0.02,   # head where real wolves hold it (photos)
              (math.degrees(math.atan2(P['ilium'][1] - P['ischium'][1], P['ilium'][0] - P['ischium'][0])) - 40) / 4,    # croup: crest-ischium axis 40 deg below horizontal (fact-check Q6)
              (math.degrees(math.atan2(P['stifle'][0] - P['hip'][0], P['hip'][1] - P['stifle'][1])) - 10) / 2.5,
              (P['mtp'][0] - (P['ischium'][0] - 30)) / 25,                                                             # hind paw about under the point of the buttock         # femur ~10 deg off vertical, stifle ahead (fact-check Q3)
              (math.degrees(math.atan2(P['skull_back'][1] - P['nose'][1], P['nose'][0] - P['skull_back'][0])) - 20) / 8]  # skull axis ~20 deg below horizontal (fact-check Q9)
        return r
    sol = least_squares(res, x0, x_scale=0.3, max_nfev=1500); P = pose(sol.x)
    mirror = {n: n.replace('left_', 'right_') for n in free if n.startswith('left_')}
    for n, mn in mirror.items(): C(mn).setValue(s, float(C(n).getValue(s)), False)
    m.realizePosition(s)
    ground = min(P['fpad'][1], P['hpad'][1])
    T = {}
    for i in range(m.getBodySet().getSize()):
        b = m.getBodySet().get(i); X = b.getTransformInGround(s); R = X.R(); p = X.p()
        T[b.getName()] = {'R': [[R.get(r, c) for c in range(3)] for r in range(3)], 'p_mm': [p.get(k) * 1000 for k in range(3)], 'mesh_scale': mesh_scale[b.getName()]}
    withers = max(P['scap_top'][1], P['T1'][1]) - ground
    fit = {'scapula elevation': round(math.degrees(math.atan2(P['scap_top'][1] - P['shoulder'][1], -(P['scap_top'][0] - P['shoulder'][0]))), 1),
           'shoulder': round(ang(P['scap_top'], P['shoulder'], P['elbow']), 1), 'elbow': round(ang(P['shoulder'], P['elbow'], P['carpus']), 1),
           'carpus': round(ang(P['elbow'], P['carpus'], P['mcp']), 1), 'hip-stifle-hock': round(ang(P['hip'], P['stifle'], P['hock']), 1), 'hock': round(ang(P['stifle'], P['hock'], P['mtp']), 1),
           'croup (crest-ischium below horizontal)': round(math.degrees(math.atan2(P['ilium'][1] - P['ischium'][1], P['ilium'][0] - P['ischium'][0])), 1),
           'femur off vertical': round(math.degrees(math.atan2(P['stifle'][0] - P['hip'][0], P['hip'][1] - P['stifle'][1])), 1),
           'skull axis below horizontal': round(math.degrees(math.atan2(P['skull_back'][1] - P['nose'][1], P['nose'][0] - P['skull_back'][0])), 1),
           'scapula-top height above ground (mm)': round(float(P['scap_top'][1] - ground), 1), 'elbow height / scapula-top height': round(float((P['elbow'][1] - ground) / (P['scap_top'][1] - ground)), 3),
           'spine top above scapula top (share of WH)': round(float((P['topline'][1] - P['scap_top'][1]) / (P['scap_top'][1] - ground)), 3)}
    # outline proportions (bone + skin + summer fur), the same way the wolf photos were measured
    WHb = P['scap_top'][1] - ground; Hs = HS_(P)
    th = to_ground(m, s, 'thorax', mesh_pts('thorax', 6000), mesh_scale['thorax']); chest_bone = th[:, 2].min() - ground
    outline = {'body length / height': ((P['shoulder'][0] + 0.059 * WHb) - (P['ischium'][0] - 0.057 * WHb)) / Hs,
               'chest floor height / height': (chest_bone - 0.048 * WHb) / Hs, 'nose forward / height': ((P['nose'][0] + 0.037 * WHb) - P['scap_top'][0]) / Hs,
               'nose height / height': (P['nose'][1] - ground) / Hs}
    want = {'body length / height': RAT['body_length_over_height']['value'], 'chest floor height / height': RAT['chest_floor_over_height']['value'],
            'nose forward / height': RAT['nose_forward_over_height']['value'], 'nose height / height': RAT['nose_height_over_height']['value']}
    fit['outline check (skeleton / real wolves)'] = {k: f'{outline[k]:.2f} / {want[k]:.2f}' for k in outline}
    return {'id': sid, 'scale_factors': {k: round(v, 3) for k, v in f.items()}, 'beagle_mm': {k: round(float(v), 1) for k, v in beagle.items()}, 'species_mm': wolf,
            'bodies': T, 'joints_side_mm': {k: [round(float(v[0]), 1), round(float(v[1] - ground), 1)] for k, v in P.items()}, 'fit': fit, 'cost': float(sol.cost), 'cross_scale': round(cross, 3)}

BLENDER = r'''
import bpy, json, sys
d = json.load(open(sys.argv[-2])); out = sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
def mat(name, col):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = col; b.inputs['Roughness'].default_value = 0.55; return m
near, far = mat('near', (0.9, 0.85, 0.74, 1)), mat('far', (0.5, 0.46, 0.4, 1))
for b in d['bodies']:
    bpy.ops.wm.obj_import(filepath=d['obj_dir'] + '/' + b + '.obj', forward_axis='Y', up_axis='Z')
    for o in bpy.context.selected_objects:
        o.data.materials.clear(); o.data.materials.append(far if b.startswith('right_') else near)
        for p in o.data.polygons: p.use_smooth = True
bb = d['bbox']; cx, cy, cz = [(bb[0][i] + bb[1][i]) / 2 for i in range(3)]; w = (bb[1][1] - bb[0][1]) * 1.1; h = (bb[1][2] - bb[0][2]) * 1.15
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); bpy.context.collection.objects.link(cam); cam.data.type = 'ORTHO'
cam.location = (cx + 4000, cy, cz); cam.rotation_euler = (1.5708, 0, 1.5708); cam.data.ortho_scale = max(w, h * 2000 / 1250); cam.data.clip_end = 20000
bpy.context.scene.camera = cam
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); bpy.context.collection.objects.link(sun); sun.rotation_euler = (0.6, 0.2, 2.0); sun.data.energy = 4
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 32; sc.render.resolution_x = 2000; sc.render.resolution_y = 1250
sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True; bg = sc.world.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.11, 0.14, 0.18, 1); bg.inputs['Strength'].default_value = 1.0
sc.render.filepath = out; bpy.ops.render.render(write_still=True)
'''

def render(sid, out):
    import trimesh
    od = BUILD / '.skel3d_obj'; od.mkdir(exist_ok=True); P = []
    for b, t in out['bodies'].items():
        sc = trimesh.load(MESH / f'meshes/{b}.glb'); g = sc.to_geometry() if hasattr(sc, 'to_geometry') else sc
        g = g.copy(); g.vertices = (np.asarray(g.vertices) * np.asarray(t['mesh_scale'])) @ np.array(t['R']).T + np.array(t['p_mm'])
        g.export(od / f'{b}.obj'); P.append(np.asarray(g.vertices)[::50])
    P = np.vstack(P); out['bbox'] = [P.min(0).tolist(), P.max(0).tolist()]; out['obj_dir'] = str(od)
    j = BUILD / f'{sid}.skel3d.json'; j.write_text(json.dumps(out, indent=1)); script = BUILD / '.skel3d_render.py'; script.write_text(BLENDER)
    r = subprocess.run([sys.executable, str(script), str(j), str(BUILD / f'{sid}.skel3d.png')], capture_output=True, text=True)
    if r.returncode: print(r.stdout[-1500:], r.stderr[-1500:]); raise SystemExit('blender failed')
    from PIL import Image, ImageOps
    im = Image.open(BUILD / f'{sid}.skel3d.png'); ImageOps.mirror(im).save(BUILD / f'{sid}.skel3d.png')   # facing right, like the game

def main(args):
    sid = args[0]; out = build(sid); render(sid, out)
    print(f'wrote species/build/{sid}.skel3d.json and .png  (solve cost {out["cost"]:.3f})')
    print('  scale factors (species / Beagle):', out['scale_factors'])
    for k, v in out['fit'].items():
        if isinstance(v, dict): print(f'  {k}:'); [print(f'      {kk:32} {vv}') for kk, vv in v.items()]
        else: print(f'  {k:42} {v}')
    return 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
