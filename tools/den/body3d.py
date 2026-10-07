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
TOPLINE = ROOT / 'ref/research/scout/15-topline/topline_profile.csv'           # skin above the bone envelope by station, Ellenberger Tafel 3 (Scout 15, B)
C2_SKIN = 0.022                                                                    # skin over the C2 spine top, withers heights (Scout 15, B); also used over the back of the skull (EST)
WITHERS_SKIN = 0.026                                                               # skin over the T1-T2 spine tips (Scout 15, B)
THROAT = 0.20                                                                      # throat skin below the occiput, withers heights (EST)
NECK_HALF = 0.42                                                                   # neck half-width / neck depth (EST)
ROUND = 1.0                                                                        # a muscle stands out at most its own half-width x2 (round section)
LEG_OFF = 0.045                                                                    # leg landmarks either side of each bone, withers heights
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
    prof = [r for r in __import__('csv').reader(l for l in open(TOPLINE) if not l.startswith('#')) if len(r) > 6 and r[0] != 'station' and r[3]]
    prof = sorted((float(r[3]), float(r[6].split()[0])) for r in prof if float(r[3]) >= 0)   # (s, offset): withers 0 .. tail root 1
    M = json.load(open(BUILD / f'{sid}.muscles3d.json'))['muscles']; T = json.load(open(T2))
    sp = __import__('yaml').safe_load(open(ROOT / f'species/{sid}.yaml'))['numbers']; mass_k = (sp['size']['weight']['value'] / B3.SRC_MASS) ** (2 / 3)
    # Stark's forces are set for the 13.81 kg Beagle (Scout 14, checked in OpenSim), so mass^(2/3) gives x1.74 for 31.8 kg; sigma 0.3 MPa confirmed (Scout 14, A)
    bones = {}
    for b, t in sk['bodies'].items():
        sc = trimesh.load(S3.mesh_for(sk, b)); g = sc.to_geometry() if hasattr(sc, 'to_geometry') else sc
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
    src = list(plate_n([p for p, _ in pairs])); dst = [np.asarray(q, float) for _, q in pairs]
    PJ = {'shoulder': 'shoulder', 'elbow': 'elbow', 'carpus': 'carpus', 'front_mcp': 'mcp', 'hip': 'hip', 'stifle': 'stifle', 'hock': 'hock', 'hind_mtp': 'mtp'}
    for a_, b_ in (('shoulder', 'elbow'), ('elbow', 'carpus'), ('carpus', 'front_mcp'), ('hip', 'stifle'), ('stifle', 'hock'), ('hock', 'hind_mtp')):
        pa, pb = plate_n([OT.PLATE_JOINTS[a_], OT.PLATE_JOINTS[b_]]); qa, qb = Wj(PJ[a_]), Wj(PJ[b_])
        npl = np.array([-(pb - pa)[1], (pb - pa)[0]]) / np.linalg.norm(pb - pa); nq = np.array([-(qb - qa)[1], (qb - qa)[0]]) / np.linalg.norm(qb - qa)
        for t in (0.25, 0.5, 0.75):
            for o in (-LEG_OFF, 0.0, LEG_OFF):                                    # points along and either side of the bone: each leg bone maps nearly rigidly
                if o == 0.0 and t == 0.5 and False: continue
                src.append(pa + t * (pb - pa) + o * npl); dst.append(qa + t * (qb - qa) + o * WH * nq)
    src = np.array(src); dst = np.array(dst)
    aff = np.linalg.lstsq(np.c_[src, np.ones(len(src))], dst, rcond=None)[0]; A = lambda P: np.c_[P, np.ones(len(P))] @ aff
    tps = RBFInterpolator(src, dst - A(src), kernel='thin_plate_spline', smoothing=0.0)
    warp = lambda P: A(P) + tps(P)
    bend = float(np.abs(tps(src)).max() / WH)                                      # how far from a plain affine stretch the landmarks had to bend
    def poly(frac):
        import shapely
        P = Polygon(frac).buffer(0); P = max(P.geoms, key=lambda q: q.area) if P.geom_type == 'MultiPolygon' else P; P = shapely.segmentize(P, 0.004) if hasattr(shapely, 'segmentize') else P
        return Polygon(warp(np.asarray(P.exterior.coords))).buffer(0)
    # the skin outline: body above the elbow and stifle, plus the near legs only (the plate's outline merges the far legs in)
    from shapely.geometry import LineString, Point, box
    from shapely.ops import unary_union
    skin_f = Polygon(T['skin_outline']['outline_frac_facing_right']).buffer(0)
    pjn = {k: plate_n([v])[0] for k, v in OT.PLATE_JOINTS.items()}
    corr = lambda chain, r: LineString([pjn[c] for c in chain]).buffer(r / U)
    fore_c = corr(['elbow', 'carpus', 'front_mcp', 'front_toe'], 85).union(Point(pjn['front_mcp']).buffer(120 / U))
    hind_c = corr(['stifle', 'hock', 'hind_mtp', 'hind_toe'], 95).union(Point(pjn['hind_mtp']).buffer(120 / U))
    cut_f, cut_h = pjn['elbow'][1] + 40 / U, pjn['stifle'][1] + 40 / U; split = (pjn['elbow'][0] + pjn['hip'][0]) / 2
    bx = skin_f.bounds
    lower = unary_union([box(split, bx[1] - 1, bx[2] + 1, cut_f), box(bx[0] - 1, bx[1] - 1, split, cut_h)])
    near = unary_union([skin_f.difference(lower), skin_f.intersection(fore_c), skin_f.intersection(hind_c)]).buffer(0.004).buffer(-0.004)
    near = max(near.geoms, key=lambda q: q.area) if near.geom_type == 'MultiPolygon' else near
    skin_poly = poly(list(near.exterior.coords))
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
    # the back hugs the bone: from the withers to the ischium the topline is the bone envelope (spine tips, iliac crest, scapula top) plus the
    # skin offset Scout 15 measured on Ellenberger Tafel 3 (0.026 of withers height at the withers, 0.007 at T8, ~0.008 over the loin, 0.015 at
    # the tail root); the back muscles never rise above the spine tips (Scout 14). Not the plate's outline.
    ax_pts = np.vstack([to_side(np.asarray(trimesh.sample.sample_surface(bones[b], 60000, seed=2)[0])) for b in ('thorax', 'abdomen', 'pelvis', 'left_scapula')])
    ci_ = ((ax_pts[:, 0] - x0) / GRID).astype(int); ok = (ci_ >= 0) & (ci_ < Wg); env = np.full(Wg, -np.inf); np.maximum.at(env, ci_[ok], ax_pts[ok, 1])
    env = ndimage.maximum_filter1d(np.where(np.isfinite(env), env, -1e3), size=int(40 / GRID)); env = ndimage.gaussian_filter1d(env, 20 / GRID)
    cau = to_side(np.asarray(bones['cauda'].vertices)); x_tail = float(cau[:, 0].max())     # the tail root: the front of the first caudal vertebra
    xw, xi = J['topline'][0], J['ischium'][0]
    yw = env[int((xw - x0) / GRID)] + WITHERS_SKIN * WH
    # the neck crest follows the nuchal ligament: a straight chord from the C2 spine top to the T1 spine tips, skin on top (Scout 15)
    cv = to_side(np.asarray(bones['cervix'].vertices)); front = cv[cv[:, 0] > cv[:, 0].max() - 0.2 * np.ptp(cv[:, 0])]
    c2 = front[np.argmax(front[:, 1])]; c2_top = c2[1] + C2_SKIN * WH
    occ_top = J['skull_back'][1] + C2_SKIN * WH                                    # the crest meets the back of the skull (EST)
    ps, po = np.array([p[0] for p in prof]), np.array([p[1] for p in prof])
    def set_top(ci, lim):
        rows = np.where(body[:, ci])[0]
        if not len(rows): return
        old_top = gy[rows.min()]; body[gy > lim, ci] = False
        if old_top < lim: body[(gy <= lim) & (gy >= old_top), ci] = True
    def set_bottom(ci, lim):
        rows = np.where(body[:, ci])[0]
        if not len(rows): return
        old_bot = gy[rows.max()]; body[gy < lim, ci] = False
        if old_bot > lim: body[(gy >= lim) & (gy <= old_bot), ci] = True
    sh_low = (J['shoulder'][0] + 0.06 * WH, J['shoulder'][1] - 0.02 * WH); throat = (J['occ'][0], J['occ'][1] - THROAT * WH)
    for ci, x in enumerate(gx):
        if xi <= x <= xw:                                                          # withers to the ischium: bone envelope + Scout 15's skin offset
            set_top(ci, env[ci] + WH * np.interp((xw - x) / max(xw - x_tail, 1), ps, po))
        elif xw < x <= c2[0]:                                                      # neck crest: the C2-T1 chord, skin 0.026 at the withers to 0.022 at C2
            k = (x - xw) / max(c2[0] - xw, 1); set_top(ci, (1 - k) * yw + k * c2_top)
        elif c2[0] < x <= J['occ'][0]:                                             # over the axis to the back of the skull
            k = (x - c2[0]) / max(J['occ'][0] - c2[0], 1); set_top(ci, (1 - k) * c2_top + k * occ_top)
        if xw < x <= J['occ'][0] and x >= sh_low[0]:                               # neck underline: point of the shoulder to the throat (EST)
            k2 = (x - sh_low[0]) / max(throat[0] - sh_low[0], 1); set_bottom(ci, (1 - k2) * sh_low[1] + k2 * throat[1])
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
                k = (x - J['hip'][0]) / max(J['TL'][0] - J['hip'][0], 1); hw = max((1 - k) * WH * 0.075 + k * WH * 0.083, ribw + 3.0)   # half-widths: mid-loin 0.075, last rib 0.083 of WH (Scout 14 from waist girth, EST); never inside the ribs
            else: hw = max(ribw, 0.0) * 0.98
        else:
            lo = max(bot, J['elbow'][1]); hw = NECK_HALF * (top - lo)
        yc, h = (top + lo) / 2, (top - lo) / 2
        if h <= 0: continue
        e = 1 - ((gy - yc) / h) ** 2; fill[:, ci] = np.where((e > 0) & col, hw * np.sqrt(np.clip(e, 0, 1)), 0)
    fill = np.where(body, ndimage.gaussian_filter(fill, sigma=(1.0, 6.0)), 0.0)         # no column stripes
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
    trunk_cols = (gx >= J['hip'][0] - 30) & (gx <= J['shoulder'][0]); neck_cols = (gx > J['shoulder'][0]) & (gx <= J['occ'][0])
    filler = (top < 0) & (fill > boneZ + 1.0)
    top[filler & trunk_cols[None, :]] = -2; top[filler & neck_cols[None, :]] = -3     # the belly wall (obliques) and the deep neck, unshaped
    # 4. roll the surface toward the midline at the body outline (so the near side reads round); legs keep their own bone-and-muscle relief
    dout = ndimage.distance_transform_edt(body) * GRID; roll = np.sqrt(np.clip(dout / (EDGE * WH), 0, 1))
    surfZ = np.where(body, surfZ * (0.35 + 0.65 * roll), np.nan)
    covered = (top >= 0) | (fill > 0) | bone_m
    def girth(p, d):                                                               # walk from point p along direction d through the body: an ellipse through
        p, d = np.asarray(p, float), np.asarray(d, float) / np.linalg.norm(d)      # that section's depth and its near-side half-width, shares of WH
        pts = p[None, :] + np.arange(-600, 600, GRID / 2)[:, None] * d[None, :]
        ci = ((pts[:, 0] - x0) / GRID).astype(int); ri = ((y1 - pts[:, 1]) / GRID).astype(int); ok = (ci >= 0) & (ci < Wg) & (ri >= 0) & (ri < Hg)
        ins = np.zeros(len(pts), bool); ins[ok] = body[ri[ok], ci[ok]]
        lab, _ = ndimage.label(ins); k = lab[np.argmin(np.abs(np.arange(len(pts)) - len(pts) // 2))]
        sel = (lab == k) & (k > 0)
        if not sel.any(): return None
        b = sel.sum() * GRID / 4; a = float(np.nanmax(surfZ[ri[sel], ci[sel]]))
        return round(float(np.pi * (3 * (a + b) - np.sqrt((3 * a + b) * (a + 3 * b))) / WH), 2), round(2 * a / WH, 2), round(2 * b / WH, 2)
    chord = np.array([c2[0] - xw, c2[1] - yw]); mid = np.array([(xw + c2[0]) / 2, (yw + c2[1]) / 2]) - 0.08 * WH * np.array([-chord[1], chord[0]]) / np.linalg.norm(chord)
    cut = lambda x, cap: body[:, int((x - x0) / GRID)] & (gy >= cap)              # trunk sections stop at the elbow / stifle line
    topl = {}                                                                      # skin topline over Scout 15's stations, shares of the withers skin height
    for nm, s_ in (('withers', 0.0), ('T8', 0.256), ('L3', 0.595), ('croup', 0.773), ('tail root', 1.0)):
        ci = int((xw - s_ * (xw - x_tail) - x0) / GRID); rows = np.where(body[:, ci])[0]; topl[nm] = round(float(gy[rows.min()] / yw), 3) if len(rows) else None
    girths = {'neck at mid-neck (across the neck)': girth(mid, [-chord[1], chord[0]])}
    for nm, x, cap in (('chest at the elbow', J['elbow'][0], J['elbow'][1]), ('waist at the last rib', J['TL'][0], J['stifle'][1])):
        ci = int((x - x0) / GRID); rows = np.where(cut(x, cap))[0]; a = float(np.nanmax(surfZ[rows, ci])); b = (gy[rows.min()] - gy[rows.max()]) / 2
        girths[nm] = (round(float(np.pi * (3 * (a + b) - np.sqrt((3 * a + b) * (a + 3 * b))) / WH), 2), round(2 * a / WH, 2), round(2 * b / WH, 2))
    rep_all = {'TPS bending (share of withers height, beyond an affine stretch)': round(bend, 3),
               'body outline covered by muscle, filler or bone': round(float((covered & body).sum() / body.sum()), 3),
               'muscles from the plate': len(rep), 'C2 spine top (side mm)': [round(float(c2[0])), round(float(c2[1]))], 'tail root x (mm)': round(x_tail),
               'topline over the withers (wolf photo, fur: mid-back 0.97, croup 0.92, tail root 0.82; plate dog level)': topl,
               'girth, width, depth (WH; Scout 14 tape: neck 0.53, chest 1.07-1.20, waist 0.77; chest width 0.19-0.26)': girths, 'estimated (not in Stark)': [k for k, v in rep.items() if v['from'] != 'Hill volume']}
    return {'id': sid, 'report': rep_all, 'muscles': rep, 'grid': {'x0': x0, 'y1': y1, 'mm': GRID, 'shape': [Hg, Wg]},
            'skin_outline_mm': [list(map(float, p)) for p in skin_poly.exterior.coords]}, (gx, gy, surfZ, top, allz), bones

def mesh_from(gx, gy, Zs, top, allz, colours):
    """height field -> triangle mesh in the 3D frame (X toward the viewer, Y back, Z up), per-vertex colour by the top muscle"""
    H, W = Zs.shape; ok = np.isfinite(Zs); idx = -np.ones((H, W), int); idx[ok] = np.arange(ok.sum())
    X, Y = np.meshgrid(gx, gy); V = np.c_[Zs[ok], -X[ok], Y[ok] + allz]
    C = np.array([colours.get(t, (0.55, 0.42, 0.40)) for t in top[ok]])
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
    red = {i: (0.62, 0.16, 0.12) for i in range(len(ORDER))}; red.update({-2: (0.55, 0.15, 0.12), -3: (0.55, 0.15, 0.12), -1: (0.88, 0.84, 0.76)})
    vivid = {i: colorsys.hsv_to_rgb((i * 0.381966) % 1.0, 0.75, 0.9) for i in range(len(ORDER))}; vivid.update({-2: (0.55, 0.42, 0.40), -3: (0.45, 0.38, 0.45), -1: (0.88, 0.84, 0.76)})
    render(sid, field, bones, BUILD / f'{sid}.body3d.png', red); render(sid, field, bones, BUILD / f'{sid}.body3d_map.png', vivid)
    print(f'wrote species/build/{sid}.body3d.json, .png and _map.png')
    for k, v in out['report'].items(): print(f'  {k}: {v}')
    for k, v in out['muscles'].items(): print(f'      {k:36} {v["volume_cm3"]:7.1f} cm3 ({v["shown_on_near_face"]:.0%} shows)  mean {v["mean_thickness_mm"]:5.1f} mm  max {v["max_thickness_mm"]:5.1f} mm  ({v["from"]})')
    return 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
