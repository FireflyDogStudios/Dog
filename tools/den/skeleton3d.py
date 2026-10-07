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
OSIM = ROOT / 'ref/research/fetched/03-dog-model/stark_beagle_fore_verified.osim'; BEAGLE_TRUNK = 0.8   # Stark's Beagle = the Shepherd-sized model x0.8 (trunk), x0.6 (limbs)
MESH = ROOT / 'ref/research/scout/10-stark-meshes'

def load():
    import opensim as osim
    m = osim.Model(str(OSIM)); m.updForceSet().clearAndDestroy(); s = m.initSystem(); return osim, m, s

def jc(m, s, joint):   # joint centre in ground, metres -> mm, in the OpenSim frame (X left, Y back, Z up)
    p = m.getJointSet().get(joint).getChildFrame().getPositionInGround(s); return np.array([p.get(0), p.get(1), p.get(2)]) * 1000

def side(p): return np.array([-p[1], p[2]])   # side view facing right: x = forward (-Y), y = up (Z)

CH = {'shoulder': 'left_scapula_left_humerus', 'elbow': 'left_humerus_left_antebrachium', 'carpus': 'left_antebrachium_left_carpus', 'mcp': 'left_carpus_left_forepaw',
      'hip': 'pelvis_left_femur', 'stifle': 'left_femur_left_crus', 'hock': 'left_crus_left_calx', 'mtp': 'left_calx_left_hindpaw',
      'T1': 'thorax_cervix', 'TL': 'thorax_abdomen', 'LS': 'abdomen_cauda', 'occ': 'cervix_caput'}

MESHFILE = {}   # body -> a species' own mesh in place of Stark's (e.g. the wolf's real skull), in the Stark body's local frame and units
def mesh_file(body): return MESHFILE.get(body, MESH / f'meshes/{body}.glb')
def mesh_for(sk, body):   # for the later steps: the mesh a built skeleton used for this body
    m = sk['bodies'][body].get('mesh'); return ROOT / m if m else MESH / f'meshes/{body}.glb'

def fit_skull(sid, spec, CBL, scale):
    """A real skull scan (ref/research/missingfound/wolf-skull: x forward, y up, z right, mm, origin at the jaw hinge; jaw closed) in place of the
       Beagle's head: scaled to the species' condylobasal length, its occipital condyles pinned on the head joint (the Beagle head's origin), and
       turned onto the Beagle braincase by a trimmed point fit (the closest 60% of points; the Beagle's open jaw finds no partner and is ignored).
       Written in the Beagle head's local frame, divided by the head's mesh scale, so every step places it exactly like the bone it replaces."""
    import trimesh
    from scipy.spatial import cKDTree
    src_dir = ROOT / spec['source']; wid = str(spec['specimen'])
    ld = lambda f: (lambda sc: sc.to_geometry() if hasattr(sc, 'to_geometry') else sc)(trimesh.load(src_dir / f))
    sk, mb = ld(f'wolf_{wid}_skull.glb'), ld(f'wolf_{wid}_mandible.glb')
    lm = json.load(open(src_dir / 'data.json'))['wolves'][wid]; k = CBL / lm['condylobasal_length_mm']; L = lm['landmarks_3d_mm']
    M = np.array([[0, 0, -1], [-1, 0, 0], [0, 1, 0]], float)                       # (forward, up, right) -> Stark body (X left, Y back, Z up)
    to_b = lambda P: (np.asarray(P, float) @ M.T) * k
    sc = trimesh.load(MESH / 'meshes/caput.glb'); bg = sc.to_geometry() if hasattr(sc, 'to_geometry') else sc
    Bw = np.asarray(bg.vertices) * np.asarray(scale); tree = cKDTree(Bw)
    Vs = to_b(sk.vertices); cond = to_b([(np.array(L['occipital_condyle_caudal_right']) + np.array(L['occipital_condyle_caudal_left'])) / 2])[0]
    src = Vs[np.random.default_rng(0).choice(len(Vs), 6000, replace=False)]; R = np.eye(3); t = -cond
    for _ in range(80):
        P = src @ R.T + t; d, i = tree.query(P); keep = d < np.quantile(d, 0.6)
        A = np.vstack([P[keep], np.repeat((cond @ R.T + t)[None], 200, 0)]); Bq = np.vstack([Bw[i[keep]], np.zeros((200, 3))])   # condyles stay on the joint
        ca, cb = A.mean(0), Bq.mean(0); U, _, Vt = np.linalg.svd((A - ca).T @ (Bq - cb)); D = np.diag([1, 1, np.sign(np.linalg.det(Vt.T @ U.T))]); dR = Vt.T @ D @ U.T
        R = dR @ R; t = dR @ (t - ca) + cb
    gap = float(np.median(tree.query(src @ R.T + t)[0])); turn = float(np.degrees(np.arccos(np.clip((np.trace(R) - 1) / 2, -1, 1))))
    g = trimesh.util.concatenate([sk, mb]); g = trimesh.Trimesh((to_b(g.vertices) @ R.T + t) / np.asarray(scale), g.faces, process=False)
    out = BUILD / 'meshes' / sid; out.mkdir(parents=True, exist_ok=True); f = out / 'caput.glb'; g.export(f)
    return f, {'specimen': wid, 'scaled to CBL': round(k, 3), 'median gap to the Beagle braincase (mm)': round(gap, 1),
               'turned off the axis map (deg)': round(turn, 1), 'condyles to head joint (mm)': round(float(np.linalg.norm(cond @ R.T + t)), 1)}

def mesh_pts(body, n=4000):
    import trimesh
    sc = trimesh.load(mesh_file(body)); g = sc.dump(concatenate=True) if hasattr(sc, 'dump') else sc
    v = np.asarray(g.vertices); return v[np.random.default_rng(0).choice(len(v), min(n, len(v)), replace=False)]

def to_ground(m, s, body, P_mm, scale):
    T = m.getBodySet().get(body).getTransformInGround(s); R = T.R(); p = T.p()
    Rm = np.array([[R.get(i, j) for j in range(3)] for i in range(3)]); pm = np.array([p.get(i) for i in range(3)]) * 1000
    return (np.asarray(P_mm) * np.asarray(scale)) @ Rm.T + pm

def build(sid, head='awa'):
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
    # the rib cage's width: per-bone scaling keeps the Beagle's barrel chest (0.45 of withers height wide at wolf size); squash it sideways to the
    # species' width (Scout 16: wolf ~0.26), using withers height from the last build (the side view does not depend on the width)
    lat = 1.0; tw = SP.get('thorax_width_over_wh')
    if tw:
        th = mesh_pts('thorax', 20000) * scales0['thorax'] * cross; prev = BUILD / f'{sid}.skel3d.json'
        wh = json.load(open(prev))['joints_side_mm']['scap_top'][1] if prev.exists() else 0.9 * sp['size']['shoulder_height']['value']
        lat = tw['value'] * wh / np.ptp(th[:, 0]); vec['thorax'] = (cross * lat, f['thorax'], cross)
    # trunk and neck: length (body Y, along the spine) by the spine ratio, depth and width (X, Z) by the overall size ratio, so the ribcage keeps a real depth
    ss = osim.ScaleSet()
    for b, v in vec.items():
        sc = osim.Scale(); sc.setSegmentName(b); sc.setScaleFactors(osim.Vec3(*v)); sc.setApply(True); ss.cloneAndAppend(sc)
    m.scale(s, ss, True); s = m.initSystem()
    mesh_scale = {b: [scales0[b] * c for c in vec[b]] for b in vec}
    MESHFILE.clear(); skull_fit = None
    sk_mesh = (yaml.safe_load(open(ROOT / f'species/{sid}.yaml')).get('meshes') or {}).get('caput')
    if sk_mesh:                                                                    # the species' own skull scan in place of the Beagle head
        MESHFILE['caput'], skull_fit = fit_skull(sid, sk_mesh, SK['condylobasal_length']['value'], mesh_scale['caput'])
    cs = m.getCoordinateSet(); C = lambda n: cs.get(n)
    for i in range(cs.getSize()): cs.get(i).set_clamped(False); cs.get(i).set_locked(False)         # the model's default ranges are not anatomical (fetched/03 NOTE); limits are checked separately
    # the scapula slides on the ribcage through translation coordinates. Model.scale leaves them alone, and the Beagle file never rescaled them from the
    # Shepherd-sized original (identical values in both files; every other joint is the Shepherd's x0.8 trunk / x0.6 limbs). So: Shepherd value x 0.8
    # (to the Beagle's trunk) x the wolf/Beagle thorax factors (x across and z up by girth, y along the spine by thorax length)
    for sd in ('left', 'right'):
        for ax, k in (('x', cross * lat), ('y', f['thorax']), ('z', cross)):          # the blades follow the narrower ribs inward
            c = C(f'{sd}_r_m_superioris_trans{ax}'); c.setDefaultValue(c.getDefaultValue() * BEAGLE_TRUNK * k)
    # the head joint: Stark's Beagle puts it ~10 mm below and ahead of the atlas (out in space; ~18 mm once scaled to a wolf), so the skull floated.
    # Move it onto the atlas's cranial face: the neck mesh's midline, its front-most point, at the mean height of its front 8 mm (the articular foveae).
    import trimesh
    sc_ = trimesh.load(mesh_file('cervix')); V = np.asarray((sc_.to_geometry() if hasattr(sc_, 'to_geometry') else sc_).vertices) * np.asarray(mesh_scale['cervix'])
    fr = V[V[:, 1] < V[:, 1].min() + 8 * mesh_scale['cervix'][1] / scales0['cervix']]
    atlas = np.array([(V[:, 0].min() + V[:, 0].max()) / 2, V[:, 1].min(), fr[:, 2].mean()])
    po = m.updJointSet().get(CH['occ']).upd_frames(0)                               # the joint's frame on the neck (cervix_offset)
    head_moved = float(np.linalg.norm(atlas - np.array([po.get_translation().get(i) for i in range(3)]) * 1000))
    po.set_translation(osim.Vec3(*(atlas / 1000)))
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
        tg = np.array([side(q) for q in to_ground(m, s, 'thorax', th_local, mesh_scale['thorax'])]); over = tg[(tg[:, 0] >= sg[:, 0].min()) & (tg[:, 0] <= sg[:, 0].max())]; P['topline'] = over[np.argmax(over[:, 1])]   # withers: the highest spine tip above the shoulder blades
        P['ftoe'] = fp[np.argmax(fp[:, 0])]; P['htoe'] = hp[np.argmax(hp[:, 0])]; P['fpad'] = fp[np.argmin(fp[:, 1])]; P['hpad'] = hp[np.argmin(hp[:, 1])]
        return P
    GR_ = lambda P: min(P['fpad'][1], P['hpad'][1]); WH_ = lambda P: P['scap_top'][1] - GR_(P)
    HS_ = lambda P: max(P['topline'][1], P['scap_top'][1]) - GR_(P) + 0.067 * WH_(P)    # outline height, as the photos were measured: highest back point + skin + fur
    def head_res(P):   # three ways to place the head (den skeleton3d <id> --head awa|photos|neck40); awa is the default (GrumpyDingo, Oct 7: the best-sourced)
        if head == 'awa':      # angles.head_line_standing: withers-to-skull line above the ground (AwA wolf photos, n = 15)
            return [(math.degrees(math.atan2(P['occ'][1] - P['scap_top'][1], P['occ'][0] - P['scap_top'][0])) - A['head_line_standing']['value']) / 2]
        if head == 'neck40':   # the bony neck (T1 to occiput) 40 deg above horizontal (estimate, the 2D skeleton's value)
            return [(math.degrees(math.atan2(P['occ'][1] - P['T1'][1], P['occ'][0] - P['T1'][0])) - 40) / 2]
        return [(((P['nose'][0] + 0.037 * WH_(P)) - P['scap_top'][0]) / HS_(P) - RAT['nose_forward_over_height']['value']) / 0.02,   # photos 01 and 05: nose position
                ((P['nose'][1] - GR_(P)) / HS_(P) - RAT['nose_height_over_height']['value']) / 0.02]
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
              *head_res(P),   # head where real wolves hold it (photos)
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
        if b.getName() in MESHFILE: T[b.getName()]['mesh'] = str(MESHFILE[b.getName()].relative_to(ROOT))
    withers = max(P['scap_top'][1], P['T1'][1]) - ground
    fit = {'scapula elevation': round(math.degrees(math.atan2(P['scap_top'][1] - P['shoulder'][1], -(P['scap_top'][0] - P['shoulder'][0]))), 1),
           'shoulder': round(ang(P['scap_top'], P['shoulder'], P['elbow']), 1), 'elbow': round(ang(P['shoulder'], P['elbow'], P['carpus']), 1),
           'carpus': round(ang(P['elbow'], P['carpus'], P['mcp']), 1), 'hip-stifle-hock': round(ang(P['hip'], P['stifle'], P['hock']), 1), 'hock': round(ang(P['stifle'], P['hock'], P['mtp']), 1),
           'croup (crest-ischium below horizontal)': round(math.degrees(math.atan2(P['ilium'][1] - P['ischium'][1], P['ilium'][0] - P['ischium'][0])), 1),
           'femur off vertical': round(math.degrees(math.atan2(P['stifle'][0] - P['hip'][0], P['hip'][1] - P['stifle'][1])), 1),
           'skull axis below horizontal': round(math.degrees(math.atan2(P['skull_back'][1] - P['nose'][1], P['nose'][0] - P['skull_back'][0])), 1),
           'scapula-top height above ground (mm)': round(float(P['scap_top'][1] - ground), 1), 'elbow height / scapula-top height': round(float((P['elbow'][1] - ground) / (P['scap_top'][1] - ground)), 3),
           'bony neck, T1 to occiput, above horizontal': round(math.degrees(math.atan2(P['occ'][1] - P['T1'][1], P['occ'][0] - P['T1'][0])), 1),
           'withers-to-skull line above horizontal (AwA wolves 26)': round(math.degrees(math.atan2(P['occ'][1] - P['scap_top'][1], P['occ'][0] - P['scap_top'][0])), 1),
           'withers spine tip above scapula top (share of WH; sourced 0.025)': round(float((P['topline'][1] - P['scap_top'][1]) / (P['scap_top'][1] - ground)), 3)}
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
            'bodies': T, 'joints_side_mm': {k: [round(float(v[0]), 1), round(float(v[1] - ground), 1)] for k, v in P.items()}, 'fit': fit, 'skull_fit': skull_fit, 'thorax_lateral_squash': round(lat, 3), 'head_joint_moved_onto_atlas_mm': round(head_moved, 1), 'cost': float(sol.cost), 'cross_scale': round(cross, 3),
            'body_factors': {b: list(v) for b, v in vec.items()}, 'coords': {cs.get(i).getName(): cs.get(i).getValue(s) for i in range(cs.getSize())}}   # for muscles3d: the same bones in the same stance

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

def render(sid, out, tag=''):
    import trimesh
    od = BUILD / f'.skel3d_obj{tag}'; od.mkdir(exist_ok=True); P = []
    for b, t in out['bodies'].items():
        sc = trimesh.load(mesh_for(out, b)); g = sc.to_geometry() if hasattr(sc, 'to_geometry') else sc
        g = g.copy(); g.vertices = (np.asarray(g.vertices) * np.asarray(t['mesh_scale'])) @ np.array(t['R']).T + np.array(t['p_mm'])
        g.export(od / f'{b}.obj'); P.append(np.asarray(g.vertices)[::50])
    P = np.vstack(P); out['bbox'] = [P.min(0).tolist(), P.max(0).tolist()]; out['obj_dir'] = str(od)
    j = BUILD / f'{sid}.skel3d{tag}.json'; j.write_text(json.dumps(out, indent=1)); script = BUILD / f'.skel3d_render{tag}.py'; script.write_text(BLENDER)
    r = subprocess.run([sys.executable, str(script), str(j), str(BUILD / f'{sid}.skel3d{tag}.png')], capture_output=True, text=True)
    if r.returncode: print(r.stdout[-1500:], r.stderr[-1500:]); raise SystemExit('blender failed')
    from PIL import Image, ImageOps
    im = Image.open(BUILD / f'{sid}.skel3d{tag}.png'); ImageOps.mirror(im).save(BUILD / f'{sid}.skel3d{tag}.png')   # facing right, like the game

def main(args):
    sid = args[0]; head = args[args.index('--head') + 1] if '--head' in args else 'awa'; tag = '' if head == 'awa' else f'.{head}'
    out = build(sid, head); out['head'] = head; render(sid, out, tag)
    print(f'wrote species/build/{sid}.skel3d{tag}.json and .png  (solve cost {out["cost"]:.3f})')
    print('  scale factors (species / Beagle):', out['scale_factors'])
    for k, v in out['fit'].items():
        if isinstance(v, dict): print(f'  {k}:'); [print(f'      {kk:32} {vv}') for kk, vv in v.items()]
        else: print(f'  {k:42} {v}')
    return 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
