#!/usr/bin/env python3
"""den bellies3d <id>: muscles, step M2: the surface muscles get volume. Reads species/build/<id>.muscles3d.json (step M1) and <id>.skel3d.json.

   Which muscles: the 25 that show under the skin on Ellenberger's Tafel 2 (ref/research/scout/08-tafel2-muscles); 19 of them exist in Stark's model
   (MAP below), the other 6 (temporalis, masseter, sternocephalicus, the ventral neck straps, omotransversarius, cleidobrachialis) are listed as missing.
   Volume (Hill): V = F_max x L_opt / sigma, sigma = 0.3 MPa (EST, 0.2-0.35 in the literature). F_max is Stark's, scaled from the model's own mass
   (13.81 kg) to the species' weight by mass^(2/3) (EST until real dog muscle masses calibrate it).
   Shape: a belly along the muscle's stance path, from the origin over (path length - tendon slack), never shorter than L_opt; cross-section area
   follows sin(pi u) so the volume is right; sheet muscles are flat ellipses (width / thickness from SHEET), the rest slightly flattened against the
   bone. The straight lines are bent out of the bones: every centreline point is pushed along the nearest bone normal until it clears the bone by
   its half-thickness (approximate signed distance from 40k surface samples per bone), with smoothing, ends pinned to the attachments.
   Check: each Tafel 2 muscle's side-view bulge beyond the bone silhouette, as a share of withers height, against the plate (a lean dog: the wolf
   should match or exceed it).
   Output: species/build/<id>.bellies3d.json and .png (bones and the near-side bellies)."""
import sys, json, pathlib, subprocess, math
import numpy as np
ROOT = pathlib.Path(__file__).resolve().parents[2]; BUILD = ROOT / 'species/build'
sys.path.insert(0, str(pathlib.Path(__file__).parent)); import skeleton3d as S3
T2 = ROOT / 'ref/research/scout/08-tafel2-muscles/data.json'
SIGMA = 0.3e6; SRC_MASS = 13.81
MAP = {'brachiocephalicus_cleidocephalicus': ['brachiocephalicus_1', 'brachiocephalicus_2'], 'trapezius_cervical': ['trapezius_cervical'],
       'trapezius_thoracic': ['trapezius_thoracic'], 'deltoid_scapular_part': ['deltoideus_sca'], 'deltoid_acromial_part': ['deltoideus_acr'],
       'triceps_long_head': ['triceps_caput_longum'], 'triceps_lateral_head': ['triceps_caput_laterale'], 'pectoralis_superficialis': ['pectoralis_superficialis'],
       'pectoralis_profundus': ['pectoralis_profundus'], 'latissimus_dorsi': ['latissimus_dorsi'],
       'forearm_extensor_group': ['extensor_carpi_radialis', 'extensor_carpi_ulnaris', 'abductor_policis_longum'], 'forearm_flexor_group': ['flexor_carpi_radialis', 'flexor_carpi_ulnaris'],
       'gluteus_medius': ['gluteus_medius'], 'gluteus_superficialis': ['gluteus_superficialis'], 'tensor_fasciae_latae': ['tensor_fasciae'],
       'biceps_femoris': ['biceps_femoris_longum', 'abductor_cruris'], 'semitendinosus': ['semitendinosus'], 'gastrocnemius': ['gastrocnemius_lateralis', 'gastrocnemius_medialis'],
       'crus_cranial_group': ['tibialis_cranialis', 'peroneus_longus']}
MISSING = ['temporalis', 'masseter', 'sternocephalicus', 'sternohyoid_ventral_strap_zone', 'omotransversarius', 'cleidobrachialis']
SHEET = {'latissimus_dorsi': 6, 'trapezius_thoracic': 6, 'trapezius_cervical': 5, 'pectoralis_profundus': 3, 'pectoralis_superficialis': 3, 'gluteus_superficialis': 3,
         'brachiocephalicus_1': 2, 'brachiocephalicus_2': 2, 'deltoideus_sca': 2, 'tensor_fasciae': 3, 'abductor_cruris': 3}
NEAR = lambda b: not b.startswith('right_')
OVER_RIBS = {'latissimus_dorsi', 'trapezius_thoracic', 'pectoralis_profundus', 'pectoralis_superficialis'}   # sheets that lie on the outside of the ribcage

def bone_field(sk, surf):
    from scipy.spatial import cKDTree
    P, N = [], []
    for b, t in sk['bodies'].items():
        if not NEAR(b): continue
        pts, nrm = surf[b]; R = np.array(t['R']); sc = np.asarray(t['mesh_scale'])
        P.append((pts * sc) @ R.T + np.array(t['p_mm'])); n = (nrm / sc) @ R.T; N.append(n / np.linalg.norm(n, axis=1, keepdims=True))
    P = np.vstack(P); N = np.vstack(N); return cKDTree(P), P, N

def resample(path, n):
    path = np.asarray(path, float); seg = np.linalg.norm(np.diff(path, axis=0), axis=1); s = np.r_[0, np.cumsum(seg)]
    t = np.linspace(0, s[-1], n); return np.c_[[np.interp(t, s, path[:, k]) for k in range(3)]].T, s[-1]

def belly(v, base, mass_k, field, hull):
    tree, BP, BN = field
    path, L = resample(v['path_mm'], 60)
    Lb = float(np.clip(L - v['tendon_slack_mm'], v['L_opt_mm'], L)); nb = max(8, int(round(60 * Lb / L)))
    c = path[:nb].copy() if nb < 60 else path.copy()
    V = v['Fmax_N_shepherd'] * mass_k * (v['L_opt_mm'] / 1000) / SIGMA * 1e9          # mm^3
    u = np.linspace(0, 1, len(c)); A = (2 * V / Lb) * np.sin(np.pi * u)            # area profile, integral = V
    k = SHEET.get(base, 1.3); a = np.sqrt(A * k / np.pi); b = np.sqrt(A / (k * np.pi))
    for it in range(12):                                                           # push the centreline out of the bones
        d, i = tree.query(c); q = BP[i]; n = BN[i]; sd = np.einsum('ij,ij->i', c - q, n)
        need = b + 1.0; push = np.clip(need - sd, 0, None); push[[0, -1]] = 0
        c = c + push[:, None] * n
        if base in OVER_RIBS:   # stay outside the ribcage's convex hull by the half-thickness (the straight lines run through the chest)
            E = c @ hull[:, :3].T + hull[:, 3]; f = E.argmax(1); dh = E[np.arange(len(c)), f]; ph = np.clip(b + 1.0 - dh, 0, None); ph[[0, -1]] = 0
            c = c + ph[:, None] * hull[f, :3]
        sm = c.copy(); sm[1:-1] = (c[:-2] + 2 * c[1:-1] + c[2:]) / 4; c = sm
    d, i = tree.query(c); n_out = BN[i]
    tg = np.gradient(c, axis=0); tg /= np.linalg.norm(tg, axis=1, keepdims=True) + 1e-9
    n_out = n_out - np.einsum('ij,ij->i', n_out, tg)[:, None] * tg; n_out /= np.linalg.norm(n_out, axis=1, keepdims=True) + 1e-9
    w = np.cross(tg, n_out)
    return {'centre': c, 'a': a, 'b': b, 'n': n_out, 'w': w, 'volume_cm3': V / 1000, 'belly_mm': Lb, 'path_mm': L, 'tendon_end': path[nb - 1:] if nb < 60 else None}

def tube(bl, ring=20):
    import trimesh
    c, a, b, n, w = bl['centre'], np.maximum(bl['a'], 0.6), np.maximum(bl['b'], 0.4), bl['n'], bl['w']
    th = np.linspace(0, 2 * np.pi, ring, endpoint=False)
    V = np.vstack([c[j] + a[j] * np.cos(th)[:, None] * w[j] + b[j] * np.sin(th)[:, None] * n[j] for j in range(len(c))])
    F = []
    for j in range(len(c) - 1):
        for r in range(ring):
            p0, p1, p2, p3 = j * ring + r, j * ring + (r + 1) % ring, (j + 1) * ring + r, (j + 1) * ring + (r + 1) % ring
            F += [[p0, p2, p1], [p1, p2, p3]]
    V = np.vstack([V, c[0], c[-1]]); s0, s1 = len(V) - 2, len(V) - 1; last = (len(c) - 1) * ring
    F += [[s0, (r + 1) % ring, r] for r in range(ring)] + [[s1, last + r, last + (r + 1) % ring] for r in range(ring)]
    m = trimesh.Trimesh(V, F, process=False)
    if bl['tendon_end'] is not None and len(bl['tendon_end']) > 1:
        P = bl['tendon_end']; m = trimesh.util.concatenate([m] + [trimesh.creation.cylinder(radius=1.6, segment=P[j:j + 2]) for j in range(len(P) - 1) if np.linalg.norm(P[j + 1] - P[j]) > 0.5])
    return m

def side_mask(meshes, x0, y0, W, H, px=1.0):
    from PIL import Image, ImageDraw
    im = Image.new('L', (W, H), 0); d = ImageDraw.Draw(im)
    for m in meshes:
        v = np.asarray(m.vertices); s = np.c_[(-v[:, 1] - x0) / px, (y0 - v[:, 2]) / px]
        for f in np.asarray(m.faces): d.polygon([tuple(s[i]) for i in f], fill=255)
    return np.asarray(im) > 0

def build(sid):
    import trimesh
    from scipy import ndimage
    sk = json.load(open(BUILD / f'{sid}.skel3d.json')); M = json.load(open(BUILD / f'{sid}.muscles3d.json'))['muscles']
    sp = __import__('yaml').safe_load(open(ROOT / f'species/{sid}.yaml'))['numbers']; mass = sp['size']['weight']['value']; mass_k = (mass / SRC_MASS) ** (2 / 3)
    surf, bones = {}, {}
    for b, t in sk['bodies'].items():
        sc = trimesh.load(S3.mesh_for(sk, b)); g = sc.to_geometry() if hasattr(sc, 'to_geometry') else sc
        pts, fi = trimesh.sample.sample_surface(g, 40000, seed=0); surf[b] = (np.asarray(pts), np.asarray(g.face_normals)[fi])
        g = g.copy(); g.vertices = (np.asarray(g.vertices) * np.asarray(t['mesh_scale'])) @ np.array(t['R']).T + np.array(t['p_mm']); bones[b] = g
    field = bone_field(sk, surf)
    from scipy.spatial import ConvexHull
    hull = ConvexHull(np.asarray(bones['thorax'].vertices)).equations             # rows: unit outward normal, offset (n.x + d <= 0 inside)
    out, meshes = {}, {}
    for plate, names in MAP.items():
        for base in names:
            n = 'left_' + base
            if n not in M: continue
            bl = belly(M[n], base, mass_k, field, hull); meshes[n] = (plate, tube(bl))
            out[n] = {'plate_muscle': plate, 'volume_cm3': round(bl['volume_cm3'], 1), 'mass_g': round(bl['volume_cm3'] * 1.06, 1), 'belly_mm': round(bl['belly_mm'], 1),
                      'max_thickness_mm': round(float(2 * bl['b'].max()), 1), 'max_width_mm': round(float(2 * bl['a'].max()), 1)}
    # side-view bulge check against the plate
    J = sk['joints_side_mm']; ground = min(v[1] for v in J.values()); WH = J['scap_top'][1]
    allv = np.vstack([np.asarray(b.vertices) for k, b in bones.items() if NEAR(k)] + [np.asarray(m.vertices) for _, m in meshes.values()])
    x0, x1 = (-allv[:, 1]).min() - 20, (-allv[:, 1]).max() + 20; y1, y0 = allv[:, 2].min() - 20, allv[:, 2].max() + 20
    W, H = int(x1 - x0) + 1, int(y0 - y1) + 1
    plate = json.load(open(T2))['muscles']; check = {}
    LINE = {'cervical': ('cervix', ('T1', 'occ')), 'thoracic_spinous': ('thorax', None), 'humerus': ('left_humerus', ('shoulder', 'elbow')), 'sternum': ('thorax', None),
            'radius': ('left_antebrachium', ('elbow', 'carpus')), 'ulna': ('left_antebrachium', ('elbow', 'carpus')), 'pelvis': ('pelvis', ('ilium', 'ischium')),
            'femur': ('left_femur', ('hip', 'stifle')), 'tibia': ('left_crus', ('stifle', 'hock'))}
    yy, xx = np.mgrid[0:H, 0:W]; sx = xx + x0; sy = y0 - yy - ground      # side-view mm, y above ground
    for pm in MAP:
        ms = [m for p, m in meshes.values() if p == pm]; pb = plate.get(pm, {}).get('bulge'); pb = pb if isinstance(pb, dict) else {}
        if not ms: continue
        line = pb.get('bone_line') or ''; key = next((k for k in LINE if line.startswith(k)), None)
        row = {'plate': pb.get('max_over_withers_height'), 'plate_confidence': plate.get(pm, {}).get('confidence'), 'from': line or 'no profile bulge on the plate'}
        if key:
            body, seg = LINE[key]; dist = ndimage.distance_transform_edt(~side_mask([bones[body]], x0, y0, W, H)); mk = side_mask(ms, x0, y0, W, H)
            if seg:   # only beside the bone, between its two joints
                A, B = np.array(J[seg[0]]), np.array(J[seg[1]]); t = ((sx - A[0]) * (B[0] - A[0]) + (sy - A[1]) * (B[1] - A[1])) / ((B - A) ** 2).sum(); mk &= (t > 0.1) & (t < 0.9)
            row['wolf'] = round(float(dist[mk].max()) / WH, 3) if mk.any() else 0.0
        else: row['wolf'] = None
        check[pm] = row
    tot = sum(v['mass_g'] for v in out.values())
    allmass = sum(M[n]['Fmax_N_shepherd'] * mass_k * M[n]['L_opt_mm'] / 1000 / SIGMA * 1e6 * 1.06 for n in M if not M[n]['placeholder'])
    rep = {'species weight (kg)': mass, 'force scale from the model (mass^2/3)': round(mass_k, 3),
           'all 150 real muscles, both sides (kg; share of body weight)': [round(allmass / 1000, 1), round(allmass / 1000 / mass, 2)],
           'surface muscles built (near side)': len(out), 'their mass, near side (g)': round(tot), 'missing from the model (from the plate)': MISSING}
    return {'id': sid, 'report': rep, 'bulge_check_share_of_WH': check, 'bellies': out}, bones, meshes

BL = r'''
import bpy, json, sys
d = json.load(open(sys.argv[-2])); out = sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
def mat(name, col, rough=0.55):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = col; b.inputs['Roughness'].default_value = rough; return m
bone = mat('bone', (0.9, 0.85, 0.74, 1))
for f in d['bones']:
    bpy.ops.wm.obj_import(filepath=f, forward_axis='Y', up_axis='Z')
    for o in bpy.context.selected_objects: o.data.materials.clear(); o.data.materials.append(bone)
for f, col in d['muscles']:
    bpy.ops.wm.obj_import(filepath=f, forward_axis='Y', up_axis='Z'); mm = mat(f, tuple(col) + (1,), 0.4)
    for o in bpy.context.selected_objects:
        o.data.materials.clear(); o.data.materials.append(mm)
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

def render(sid, bones, meshes):
    import colorsys
    od = BUILD / '.bellies3d_obj'; od.mkdir(exist_ok=True); bf, mf = [], []
    for b, g in bones.items(): f = od / f'bone_{b}.obj'; g.export(f); bf.append(str(f))
    plates = sorted({p for p, _ in meshes.values()})
    for n, (p, m) in meshes.items():
        h = (plates.index(p) * 0.37) % 1.0; col = colorsys.hsv_to_rgb(0.98 + 0.06 * math.sin(h * 6.28), 0.55 + 0.3 * ((h * 3) % 1), 0.55 + 0.35 * ((h * 7) % 1))
        f = od / f'{n}.obj'; m.export(f); mf.append([str(f), list(col)])
    sk = json.load(open(BUILD / f'{sid}.skel3d.json'))
    j = BUILD / f'.{sid}.bellies3d_render.json'; j.write_text(json.dumps({'bones': bf, 'muscles': mf, 'bbox': sk['bbox']}))
    script = BUILD / '.bellies3d_render.py'; script.write_text(BL); png = BUILD / f'{sid}.bellies3d.png'
    r = subprocess.run([sys.executable, str(script), str(j), str(png)], capture_output=True, text=True)
    if r.returncode: print(r.stdout[-1500:], r.stderr[-1500:]); raise SystemExit('blender failed')
    from PIL import Image, ImageOps
    ImageOps.mirror(Image.open(png)).save(png)

def main(args):
    sid = args[0]; out, bones, meshes = build(sid)
    (BUILD / f'{sid}.bellies3d.json').write_text(json.dumps(out, indent=1)); render(sid, bones, meshes)
    print(f'wrote species/build/{sid}.bellies3d.json and .png')
    for k, v in out['report'].items(): print(f'  {k}: {v}')
    print('  bulge beyond the bones, side view, share of withers height (wolf / lean plate dog):')
    for k, v in out['bulge_check_share_of_WH'].items(): print(f'      {k:36} {v["wolf"]} / {v["plate"]}  ({v["plate_confidence"]}; from {v["from"]})')
    return 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
