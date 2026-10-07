#!/usr/bin/env python3
"""den body3d <id>: muscles, step M2 (plate-shaped): the muscle body of the species' near side, built so the muscles pack edge to edge like a real
   body instead of floating as spindles (den bellies3d, the first try).

   1. Shapes: the 25 surface muscles and the skin outline of Ellenberger's Tafel 2 (public domain; ref/research/scout/08-tafel2-muscles), warped
      onto the species' 3D skeleton (species/build/<id>.skel3d.json) by a thin-plate spline on the plate's bone landmarks and joint centres
      (the same pairs as den outline --template) -> each muscle's footprint in the side view, in mm.
   2. Base: how far the bones reach toward the viewer at each side-view point (near-side and axial bones, z-buffered), plus a trunk and neck
      filler between spine and skin line (the belly wall, the viscera and the deep neck, which Stark's model does not have): an elliptic cross-
      section whose half-width runs from the ribcage's to the pelvis's (trunk) and is a share of the depth (neck, EST).
   3. Muscles: each footprint is a dome (thickest at the middle, to zero at its edges) stacked on what lies under it; its volume is the Hill
      volume of the Stark muscles it stands for (den bellies3d: F_max x L_opt / 0.3 MPa, force scaled by mass^2/3). The six plate muscles
      Stark's model lacks get a thickness from THICK_EST (EST).
   4. Edge: the surface rolls toward the midline near the skin outline, so the body reads round in the side view.
   Checks: share of the body outline covered (no gaps), each muscle's mean / max thickness, and a TPS bending figure.
   Output: species/build/<id>.body3d.json, <id>.body3d.png (one muscle colour) and <id>.body3d_map.png (each muscle its own colour)."""
import sys, json, pathlib, subprocess, colorsys
import numpy as np
ROOT = pathlib.Path(__file__).resolve().parents[2]; BUILD = ROOT / 'species/build'
sys.path.insert(0, str(pathlib.Path(__file__).parent)); import skeleton3d as S3, bellies3d as B3, outline_template as OT
T2 = ROOT / 'ref/research/scout/08-tafel2-muscles/data.json'; SKIN = ROOT / 'ref/research/fetched/01-skin-offsets/data.json'
GRID = 2.0                                                                         # mm per side-view cell
THICK_EST = {'temporalis': 8, 'masseter': 14, 'sternocephalicus': 14, 'sternohyoid_ventral_strap_zone': 9, 'omotransversarius': 7, 'cleidobrachialis': 12}   # mm, EST
NECK_HALF = 0.42                                                                   # neck half-width / neck depth (EST)
ROUND = 1.0                                                                        # a muscle stands out at most its own half-width x2 (round section)
EDGE = 0.045                                                                       # edge roll-off, share of withers height (EST)
ORDER = ['gluteus_medius', 'gluteus_superficialis', 'deltoid_scapular_part', 'deltoid_acromial_part', 'triceps_lateral_head', 'triceps_long_head',
         'forearm_extensor_group', 'forearm_flexor_group', 'crus_cranial_group', 'gastrocnemius', 'semitendinosus', 'tensor_fasciae_latae', 'biceps_femoris',
         'pectoralis_profundus', 'pectoralis_superficialis', 'latissimus_dorsi', 'sternohyoid_ventral_strap_zone', 'sternocephalicus', 'omotransversarius',
         'trapezius_thoracic', 'trapezius_cervical', 'cleidobrachialis', 'brachiocephalicus_cleidocephalicus', 'masseter', 'temporalis']

def build(sid):
    import trimesh
    from scipy.interpolate import RBFInterpolator
    from scipy import ndimage
    from shapely.geometry import Polygon
    from PIL import Image, ImageDraw
    sk = json.load(open(BUILD / f'{sid}.skel3d.json')); J = sk['joints_side_mm']
    M = json.load(open(BUILD / f'{sid}.muscles3d.json'))['muscles']; T = json.load(open(T2))
    sp = __import__('yaml').safe_load(open(ROOT / f'species/{sid}.yaml'))['numbers']; mass_k = (sp['size']['weight']['value'] / B3.SRC_MASS) ** (2 / 3)
    bones = {}
    for b, t in sk['bodies'].items():
        sc = trimesh.load(S3.MESH / f'meshes/{b}.glb'); g = sc.to_geometry() if hasattr(sc, 'to_geometry') else sc
        g = g.copy(); g.vertices = (np.asarray(g.vertices) * np.asarray(t['mesh_scale'])) @ np.array(t['R']).T + np.array(t['p_mm']); bones[b] = g
    # ground in the 3D frame: joints_side_mm are heights above it
    allz = np.vstack([np.asarray(bones[b].vertices) for b in bones if 'paw' in b])[:, 2].min()
    to_side = lambda P: np.c_[-P[:, 1], P[:, 2] - allz]
    WH = J['scap_top'][1]
    # 1. warp the plate onto the skeleton
    skin = {l['landmark']: l for l in json.load(open(SKIN))['landmarks']}
    th = to_side(np.asarray(bones['thorax'].vertices)); br = th[np.argmin(th[:, 1])]
    Wj = lambda n: np.array(J[n], float)
    pairs = [(skin['withers']['bone_px_plate'], Wj('topline')), (skin['scapula_top']['bone_px_plate'], Wj('scap_top')), (skin['croup']['bone_px_plate'], Wj('ilium')),
             (skin['ischium']['bone_px_plate'], Wj('ischium')), (skin['brisket']['bone_px_plate'], br)]
    for pj, sj in (('shoulder', 'shoulder'), ('elbow', 'elbow'), ('carpus', 'carpus'), ('front_mcp', 'mcp'), ('hip', 'hip'), ('stifle', 'stifle'), ('hock', 'hock'), ('hind_mtp', 'mtp')):
        pairs.append((OT.PLATE_JOINTS[pj], Wj(sj)))
    pairs += [((765 - 31, 450), Wj('occ')), ((195 - 31, 570), Wj('nose'))]
    U = 1837.0; plate_n = lambda P: np.c_[-(np.asarray(P, float)[:, 0] - 1130) / U, (2626 - np.asarray(P, float)[:, 1]) / U]   # facing right, withers heights
    src = plate_n([p for p, _ in pairs]); dst = np.array([q for _, q in pairs], float)
    aff = np.linalg.lstsq(np.c_[src, np.ones(len(src))], dst, rcond=None)[0]; A = lambda P: np.c_[P, np.ones(len(P))] @ aff
    tps = RBFInterpolator(src, dst - A(src), kernel='thin_plate_spline', smoothing=0.0)
    warp = lambda P: A(P) + tps(P)
    bend = float(np.abs(tps(src)).max() / WH)                                      # how far from a plain affine stretch the landmarks had to bend
    def poly(frac):
        import shapely
        P = Polygon(frac).buffer(0); P = max(P.geoms, key=lambda q: q.area) if P.geom_type == 'MultiPolygon' else P; P = shapely.segmentize(P, 0.004) if hasattr(shapely, 'segmentize') else P
        return Polygon(warp(np.asarray(P.exterior.coords))).buffer(0)
    skin_poly = poly(T['skin_outline']['outline_frac_facing_right'])
    shapes = {k: poly(v['polygon_frac_facing_right']) for k, v in T['muscles'].items()}
    # grid
    x0, y0, x1, y1 = skin_poly.bounds; x0 -= 40; y0 = -10; x1 += 40; y1 += 40
    Wg, Hg = int((x1 - x0) / GRID) + 1, int((y1 - y0) / GRID) + 1
    gx = x0 + np.arange(Wg) * GRID; gy = y1 - np.arange(Hg) * GRID; X, Y = np.meshgrid(gx, gy)
    def raster(pg):
        im = Image.new('L', (Wg, Hg), 0); d = ImageDraw.Draw(im)
        gs = getattr(pg, 'geoms', [pg])
        for g_ in gs: d.polygon([((x - x0) / GRID, (y1 - y) / GRID) for x, y in g_.exterior.coords], fill=255)
        return np.asarray(im) > 0
    body = raster(skin_poly)
    # 2. bones toward the viewer (+X is the near, left side), z-buffered from dense surface samples
    Z = np.full((Hg, Wg), -np.inf)
    for b, g in bones.items():
        if b.startswith('right_'): continue
        P = np.asarray(trimesh.sample.sample_surface(g, 120000, seed=1)[0]); s = to_side(P)
        ci = ((s[:, 0] - x0) / GRID).astype(int); ri = ((y1 - s[:, 1]) / GRID).astype(int); ok = (ci >= 0) & (ci < Wg) & (ri >= 0) & (ri < Hg)
        np.maximum.at(Z, (ri[ok], ci[ok]), P[ok, 0])
    boneZ = ndimage.grey_closing(np.where(np.isfinite(Z), Z, -1e3), size=5); bone_m = boneZ > -500; boneZ = np.where(bone_m, boneZ, 0.0)
    # trunk and neck filler between the topline and the skin's lower line, an ellipse across
    fill = np.zeros_like(boneZ)
    xs_sh, xs_hip = J['shoulder'][0], J['hip'][0]; xs_t1, xs_occ = J['T1'][0], J['occ'][0]
    rib_c = (gx <= J['scap_top'][0] + 20) & (gx >= J['TL'][0] - 60)
    for ci, x in enumerate(gx):
        col = body[:, ci]
        if not col.any(): continue
        rows = np.where(col)[0]; r0 = rows.min(); gaps = np.where(np.diff(rows) > 1)[0]; r1 = rows[gaps[0]] if len(gaps) else rows.max()
        top, bot = gy[r0], gy[r1]                                                  # the run of body from the topline down to the first gap
        trunk = J['hip'][0] - 30 <= x <= J['shoulder'][0]; neck = J['shoulder'][0] < x <= J['occ'][0]
        if not (trunk or neck): continue
        cap = J['elbow'][1] if x > J['TL'][0] else J['stifle'][1]                   # never fill down the legs
        if trunk:
            lo = max(bot, cap)
            ribw = np.nanmax(np.where(bone_m[:, ci], boneZ[:, ci], np.nan)) if bone_m[:, ci].any() else 0.0
            if x < J['TL'][0]:                                                     # abdomen: half-width from the last ribs to the pelvis
                k = (x - J['hip'][0]) / max(J['TL'][0] - J['hip'][0], 1); hw = (1 - k) * WH * 0.16 + k * WH * 0.21
            else: hw = max(ribw, 0.0) * 0.98
        else:
            lo = max(bot, J['elbow'][1]); hw = NECK_HALF * (top - lo)
        yc, h = (top + lo) / 2, (top - lo) / 2
        if h <= 0: continue
        e = 1 - ((gy - yc) / h) ** 2; fill[:, ci] = np.where((e > 0) & col, hw * np.sqrt(np.clip(e, 0, 1)), 0)
    base = np.maximum(boneZ, fill)
    # 3. the muscles, deepest first, each a dome of its own volume on what lies under it
    surfZ = base.copy(); top = np.full(base.shape, -1, int); rep = {}
    for i, name in enumerate(ORDER):
        if name not in shapes: continue
        m = raster(shapes[name]) & body
        if not m.any(): continue
        d = ndimage.distance_transform_edt(m) * GRID; dome = np.sqrt(d / d.max())
        if name in B3.MAP:
            V = sum(M['left_' + b]['Fmax_N_shepherd'] * mass_k * (M['left_' + b]['L_opt_mm'] / 1000) / B3.SIGMA * 1e9 for b in B3.MAP[name] if 'left_' + b in M)
            t = min(V / (dome.sum() * GRID * GRID), ROUND * d.max()); src_ = 'Hill volume'   # no rounder than round: the rest of the volume lies deep or medial, out of the side view
        else: t = THICK_EST[name]; V = t * dome.sum() * GRID * GRID; src_ = 'EST thickness'
        surfZ = np.where(m, surfZ + t * dome, surfZ); top[m] = i
        Vs = t * dome.sum() * GRID * GRID
        rep[name] = {'volume_cm3': round(V / 1000, 1), 'shown_on_near_face': round(min(Vs / V, 1.0), 2), 'area_cm2': round(m.sum() * GRID * GRID / 100, 1), 'mean_thickness_mm': round(float(Vs / (m.sum() * GRID * GRID)), 1),
                     'max_thickness_mm': round(float(t), 1), 'from': src_}
    # 4. roll the surface toward the midline at the body outline (so the near side reads round); legs keep their own bone-and-muscle relief
    dout = ndimage.distance_transform_edt(body) * GRID; roll = np.sqrt(np.clip(dout / (EDGE * WH), 0, 1))
    surfZ = np.where(body, surfZ * (0.35 + 0.65 * roll), np.nan)
    covered = (top >= 0) | (fill > 0) | bone_m
    rep_all = {'TPS bending (share of withers height, beyond an affine stretch)': round(bend, 3),
               'body outline covered by muscle, filler or bone': round(float((covered & body).sum() / body.sum()), 3),
               'muscles from the plate': len(rep), 'estimated (not in Stark)': [k for k, v in rep.items() if v['from'] != 'Hill volume']}
    return {'id': sid, 'report': rep_all, 'muscles': rep, 'grid': {'x0': x0, 'y1': y1, 'mm': GRID, 'shape': [Hg, Wg]},
            'skin_outline_mm': [list(map(float, p)) for p in skin_poly.exterior.coords]}, (gx, gy, surfZ, top, allz), bones

def mesh_from(gx, gy, Zs, top, allz, colours):
    """height field -> triangle mesh in the 3D frame (X toward the viewer, Y back, Z up), per-vertex colour by the top muscle"""
    H, W = Zs.shape; ok = np.isfinite(Zs); idx = -np.ones((H, W), int); idx[ok] = np.arange(ok.sum())
    X, Y = np.meshgrid(gx, gy); V = np.c_[Zs[ok], -X[ok], Y[ok] + allz]
    C = np.array([colours[t] if t >= 0 else (0.55, 0.42, 0.40) for t in top[ok]])
    a, b, c, d = idx[:-1, :-1], idx[:-1, 1:], idx[1:, :-1], idx[1:, 1:]
    q = (a >= 0) & (b >= 0) & (c >= 0) & (d >= 0)
    F = np.r_[np.c_[a[q], c[q], b[q]], np.c_[b[q], c[q], d[q]]]
    return V, F, C

BL = r'''
import bpy, json, sys
d = json.load(open(sys.argv[-2])); out = sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
def mat(name, col, rough=0.55, attr=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']; b.inputs['Roughness'].default_value = rough
    if attr:
        a = nt.nodes.new('ShaderNodeVertexColor'); nt.links.new(a.outputs['Color'], b.inputs['Base Color'])
    else: b.inputs['Base Color'].default_value = col
    return m
bone, far = mat('bone', (0.9, 0.85, 0.74, 1)), mat('far', (0.45, 0.42, 0.38, 1)); mus = mat('mus', None, 0.45, True)
for f in d['bones']:
    bpy.ops.wm.obj_import(filepath=f, forward_axis='Y', up_axis='Z')
    for o in bpy.context.selected_objects: o.data.materials.clear(); o.data.materials.append(far if 'right_' in f else bone)
bpy.ops.wm.ply_import(filepath=d['body'], forward_axis='Y', up_axis='Z')
for o in bpy.context.selected_objects:
    o.data.materials.clear(); o.data.materials.append(mus)
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

def render(sid, field, bones, png, colours):
    import trimesh
    gx, gy, Zs, top, allz = field; V, F, C = mesh_from(gx, gy, Zs, top, allz, colours)
    od = BUILD / '.body3d_obj'; od.mkdir(exist_ok=True); bf = []
    for b, g in bones.items(): f = od / f'bone_{b}.obj'; g.export(f); bf.append(str(f))
    m = trimesh.Trimesh(V, F, vertex_colors=(np.c_[C, np.ones(len(C))] * 255).astype(np.uint8), process=False); pf = od / 'body.ply'; m.export(pf)
    sk = json.load(open(BUILD / f'{sid}.skel3d.json'))
    j = BUILD / f'.{sid}.body3d_render.json'; j.write_text(json.dumps({'bones': bf, 'body': str(pf), 'bbox': sk['bbox']}))
    script = BUILD / '.body3d_render.py'; script.write_text(BL)
    r = subprocess.run([sys.executable, str(script), str(j), str(png)], capture_output=True, text=True)
    if r.returncode: print(r.stdout[-1500:], r.stderr[-1500:]); raise SystemExit('blender failed')
    from PIL import Image, ImageOps
    ImageOps.mirror(Image.open(png)).save(png)

def main(args):
    sid = args[0]; out, field, bones = build(sid)
    (BUILD / f'{sid}.body3d.json').write_text(json.dumps(out, indent=1))
    red = {i: (0.62, 0.16, 0.12) for i in range(len(ORDER))}
    vivid = {i: colorsys.hsv_to_rgb((i * 0.381966) % 1.0, 0.75, 0.9) for i in range(len(ORDER))}
    render(sid, field, bones, BUILD / f'{sid}.body3d.png', red); render(sid, field, bones, BUILD / f'{sid}.body3d_map.png', vivid)
    print(f'wrote species/build/{sid}.body3d.json, .png and _map.png')
    for k, v in out['report'].items(): print(f'  {k}: {v}')
    for k, v in out['muscles'].items(): print(f'      {k:36} {v["volume_cm3"]:7.1f} cm3 ({v["shown_on_near_face"]:.0%} shows)  mean {v["mean_thickness_mm"]:5.1f} mm  max {v["max_thickness_mm"]:5.1f} mm  ({v["from"]})')
    return 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
