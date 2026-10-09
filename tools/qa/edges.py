#!/usr/bin/env python3
"""Edge and seam analysis on the frames edges.mjs rendered (see there). Writes findings.json and sheet.png (a crop per finding) in the same dir.
   bleed:   pixels inside the body that change with the background: the background showing through where two shapes meet (a hairline)
   thin:    a colour region narrower than 0.12 units somewhere (a rim of fur left along an edge, a sliver between two zones)
   corner:  a point sticking out on a colour region's edge: on a shape's own outline under 100 degrees (spikes, square corners); where a colour
            boundary crosses the outline under 45 (a taper); where two markings meet under 60 (a wedge). Occlusion junctions (one leg over another)
            and the pieces in tools/qa/allow.json (the eye's almond points) are not flaws
   rim:     a marking that stops short of the outline, so the piece under it shows as a thin line round it
   seam:    a colour edge that breaks where the head meets the neck or the tail the body, while walking (lined up standing)"""
import sys, json, math, pathlib, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from skimage import measure, morphology
D = pathlib.Path(sys.argv[1]); meta = json.load(open(D / 'meta.json')); PX = meta['px']; V = meta['view']
toU = lambda x, y: (round(V[0] + x / PX, 2), round(V[1] + y / PX, 2))
CORNER = 100  # degrees: a turn sharper than this on a colour edge is reported (GrumpyDingo flags 90-degree corners as strange)
ALLOW = json.load(open(pathlib.Path(__file__).parent / 'allow.json')).get(meta['rig'], []) if (pathlib.Path(__file__).parent / 'allow.json').exists() else []
allowed = lambda u, part='', kind='': next((a['why'] for a in ALLOW if (('part' in a and part and (part == a['part'] or part.rstrip('NF') == a['part'])) or ('at' in a and math.hypot(u[0] - a['at'][0], u[1] - a['at'][1]) <= a.get('r', .6))) and kind in a.get('kinds', [kind])), None)  # allowed by piece (the eye's almond points) or by place
hexrgb = lambda h: np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)
PAL = {k: hexrgb(v) for k, v in meta['palette'].items()}; names = list(PAL); cols = np.array([PAL[k] for k in names])
F = []
import time, os
from concurrent.futures import ProcessPoolExecutor
ONLY = sys.argv[2:]  # optional: frame names to analyse
def analyse(fr):
    F = []; t0 = time.time()
    A = np.array(Image.open(D / f'{fr}_mag.png').convert('RGB')).astype(np.int16); B = np.array(Image.open(D / f'{fr}_grn.png').convert('RGB')).astype(np.int16)
    body = (np.abs(A - [255, 0, 255]).sum(-1) > 40) & (np.abs(B - [0, 255, 0]).sum(-1) > 40)
    I = np.array(Image.open(D / f'{fr}_id.png').convert('RGB')).astype(np.int32); pid = (I[..., 0] << 16 | I[..., 1] << 8 | I[..., 2]) - 1; PARTS = meta['parts']
    def part_at(x, y, rad=3):  # the piece on top at a pixel (or the nearest one within rad pixels)
        x, y = int(round(x)), int(round(y)); win = pid[max(0, y - rad):y + rad + 1, max(0, x - rad):x + rad + 1]; v = win[win >= 0]
        return PARTS[int(np.bincount(v).argmax())]['id'] if len(v) else ''
    inside = ndi.binary_erosion(body, iterations=2)  # (holes are not filled: the gaps between the legs are background, not seams)
    # bleed: inside the body a pixel must be the same on both backgrounds
    bl = inside & (np.abs(A - B).sum(-1) > 24); lab, n = ndi.label(bl, np.ones((3, 3)))
    for i, sl_ in enumerate(ndi.find_objects(lab), 1):  # each component's own box (scanning the whole frame per component was the slow part)
        ys, xs = np.nonzero(lab[sl_] == i); ys = ys + sl_[0].start; xs = xs + sl_[1].start
        if len(xs) < 3: continue
        L = max(np.ptp(xs), np.ptp(ys)) / PX
        y0_, x0_ = max(0, ys.min() - 4), max(0, xs.min() - 4); near_bg = ~body[y0_:ys.max() + 5, x0_:xs.max() + 5]
        if near_bg.sum() > 6: continue  # real background right beside it: a narrow gap between two shapes (legs crossing), not a seam inside one
        F.append({'kind': 'bleed', 'frame': fr, 'at': toU(xs.mean(), ys.mean()), 'size': round(L, 2), 'px': int(len(xs)), 'what': f'background shows through a seam, {L:.2f} units long'})
    # colour labels: the nearest palette colour where a pixel is close to one (anti-aliased edges are left out)
    ys0, xs0 = np.nonzero(body); y0, y1, x0, x1 = ys0.min(), ys0.max() + 1, xs0.min(), xs0.max() + 1  # work inside the body's box only
    A32 = A[y0:y1, x0:x1].astype(np.float32); k = np.zeros(A32.shape[:2], np.int16); best = np.full(A32.shape[:2], 1e9, np.float32)
    for ci in range(len(cols)):
        dd = np.abs(A32 - cols[ci].astype(np.float32)).sum(-1); m = dd < best; best[m] = dd[m]; k[m] = ci
    K = np.full(A.shape[:2], -1, np.int16); K[y0:y1, x0:x1] = np.where(best < 10, k, -1); ok = (K >= 0) & body; k = K
    r = max(1, int(round(.06 * PX)))
    for ci, nm in enumerate(names):
        reg_full = ok & (k == ci)
        if reg_full.sum() < 20: continue
        yy, xx = np.nonzero(reg_full); pad = 3 * r + 4; oy, ox = max(0, yy.min() - pad), max(0, xx.min() - pad)  # this colour's own box: the transforms run on it alone
        sl = (slice(oy, yy.max() + pad), slice(ox, xx.max() + pad)); reg = reg_full[sl]; bodyS = body[sl]
        reg2 = ndi.binary_closing(reg, iterations=1)
        open_ = lambda m, rr: ndi.distance_transform_edt(~(ndi.distance_transform_edt(m) >= rr)) <= rr  # a morphological opening by a disc of radius rr, done with two distance transforms (fast)
        solid = open_(reg2, r) & reg2; thin = reg2 & ~solid & bodyS  # out to the silhouette's edge: a rim left along the outline counts
        lab, n = ndi.label(thin, np.ones((3, 3)))
        for i, sl_ in enumerate(ndi.find_objects(lab), 1):
            ys, xs = np.nonzero(lab[sl_] == i); ys = ys + sl_[0].start + oy; xs = xs + sl_[1].start + ox
            if len(xs) < PX * .1 or max(np.ptp(xs), np.ptp(ys)) < PX * .15: continue  # ignore specks shorter than 0.15 units
            u = toU(xs.mean(), ys.mean()); pt = part_at(xs.mean(), ys.mean()); w = allowed(u, pt, 'thin')
            if fr != 'stand' and nm.startswith('far '): continue  # a far leg peeking past the near one as they cross: natural while walking
            pp = next((q['paint'] for q in PARTS if q['id'] == pt), None)
            if pp and nm.replace('far ', '') != pp: continue  # the colour is not the paint of the piece there: anti-aliased pixels between two zones, not a band
            F.append({'kind': 'thin', 'frame': fr, 'at': u, 'paint': nm, 'part': pt, 'size': round(max(np.ptp(xs), np.ptp(ys)) / PX, 2), 'what': f'a band of {nm} under 0.12 units wide', **({'allowed': w} if w else {})})
        # corners on this region's edge
        solid = open_(solid, max(1, r // 2)) & solid  # corners only on the solid part (thin strips are reported above)
        for c in measure.find_contours(np.pad(solid, 1).astype(float), .5):
            c = c[:, ::-1] - 1 + [ox, oy]
            if len(c) < 30: continue
            seg = np.r_[0, np.cumsum(np.hypot(*np.diff(c, axis=0).T))]; step = PX * .04; t = np.arange(0, seg[-1], step)
            if len(t) < 20: continue
            Q = np.c_[np.interp(t, seg, c[:, 0]), np.interp(t, seg, c[:, 1])]; w_ = max(2, int(.2 * PX / step))
            closed = np.linalg.norm(c[0] - c[-1]) < 2; n_ = len(Q); idx = np.arange(n_) if closed else np.arange(w_, n_ - w_)
            if not len(idx): continue
            P0, P1, P2 = Q[(idx - w_) % n_], Q[idx], Q[(idx + w_) % n_]; v1, v2 = P0 - P1, P2 - P1  # every point at once
            cosv = (v1 * v2).sum(1) / (np.linalg.norm(v1, axis=1) * np.linalg.norm(v2, axis=1) + 1e-9); ang = np.degrees(np.arccos(np.clip(cosv, -1, 1)))
            hits = idx[ang < CORNER]; seen = []
            for j in hits:  # one finding per sharp spot: the sharpest point of each run
                if seen and abs(j - seen[-1][0]) < 2 * w_: 
                    if ang[np.searchsorted(idx, j)] < seen[-1][1]: seen[-1] = (j, ang[np.searchsorted(idx, j)])
                    continue
                seen.append((j, ang[np.searchsorted(idx, j)]))
            for j, an in seen:
                p1 = Q[j]; v1_, v2_ = Q[(j - w_) % n_] - p1, Q[(j + w_) % n_] - p1; bis = v1_ / np.linalg.norm(v1_) + v2_ / np.linalg.norm(v2_)
                pr = p1 + bis / (np.linalg.norm(bis) + 1e-9) * 2; py_, px_ = int(round(pr[1])) - oy, int(round(pr[0])) - ox; convex = bool(0 <= py_ < solid.shape[0] and 0 <= px_ < solid.shape[1] and solid[py_, px_])
                if not convex: continue  # concave corners are where pieces meet (a leg under the body): only points that stick out are reported
                # an occlusion junction: the two edges of the point border different pieces, one of them on another joint (a leg crossing in front of
                # another, a leg over the belly). Natural where shapes overlap; not a flaw of either shape. Points on one shape's own outline stay.
                n1 = np.array([-v1_[1], v1_[0]]); n2 = np.array([v2_[1], -v2_[0]]); n1 /= np.linalg.norm(n1) + 1e-9; n2 /= np.linalg.norm(n2) + 1e-9
                outs = []
                for vv, nn_ in ((v1_, n1), (v2_, n2)):
                    for sg in (1, -1):
                        q_ = p1 + vv * .5 + nn_ * sg * 3; qy, qx = int(round(q_[1])), int(round(q_[0]))
                        if 0 <= qy < pid.shape[0] and 0 <= qx < pid.shape[1] and not (0 <= qy - oy < solid.shape[0] and 0 <= qx - ox < solid.shape[1] and solid[qy - oy, qx - ox]): outs.append(int(pid[qy, qx])); break
                own = pid[int(round(p1[1])), int(round(p1[0]))] if 0 <= int(round(p1[1])) < pid.shape[0] and 0 <= int(round(p1[0])) < pid.shape[1] else -1
                if len(outs) == 2 and outs[0] != outs[1]:
                    joints_ = {PARTS[o]['in'] if o >= 0 else 'bg' for o in outs}; mine = PARTS[own]['in'] if own >= 0 else ''
                    if any(j_ != mine for j_ in joints_ if j_ != 'bg'): continue  # occlusion by a piece on another joint
                    # a colour boundary crossing the outline: the two angles there add up to 180, so one is always 90 or less; only a taper under 45 is a flaw
                    if 'bg' in joints_ and an >= 45: continue
                    # two markings on one piece meeting: only a sharp wedge (under 60) is a flaw
                    if 'bg' not in joints_ and an >= 60: continue
                u = toU(*p1); pt = part_at(p1[0], p1[1]); w = allowed(u, pt, 'corner')
                F.append({'kind': 'corner', 'frame': fr, 'at': u, 'paint': nm, 'part': pt, 'angle': int(round(an)), 'convex': convex, 'what': f'a {round(an)} degree {"point" if convex else "notch"} on the {nm} edge', **({'allowed': w} if w else {})})
    print(f'  {fr}: {time.time() - t0:.1f}s', file=sys.stderr)
    # rim: a marking stopped short of the outline. An outline pixel belongs to a base piece while the pixel just inside it belongs to a marking
    # drawn on that same piece (later in the draw order, on the same joint): the base shows as a thin line round the marking
    edge = body & ~ndi.binary_erosion(body, iterations=1)
    dist, (iy, ix) = ndi.distance_transform_edt(~ndi.binary_erosion(body, iterations=int(.08 * PX) + 1), return_indices=True)
    ey, ex = np.nonzero(edge & (pid >= 0)); po, pi_ = pid[ey, ex], pid[iy[ey, ex], ix[ey, ex]]
    ok_ = (pi_ >= 0) & (pi_ > po); same = np.array([ok_[q] and PARTS[pi_[q]]['in'] == PARTS[po[q]]['in'] and PARTS[pi_[q]]['paint'] != PARTS[po[q]]['paint'] for q in range(len(po))], bool) if len(po) else np.zeros(0, bool)
    rim = np.zeros_like(body); rim[ey[same], ex[same]] = True
    ring2 = ndi.binary_erosion(body, iterations=1) & ~ndi.binary_erosion(body, iterations=2); r2y, r2x = np.nonzero(ring2 & (pid >= 0) & ndi.binary_dilation(rim, iterations=2))
    keep = np.zeros_like(body)
    for y_, x_ in zip(r2y, r2x):  # the base must show two pixels deep (1/40 unit): a one-pixel difference is rounding, invisible on any screen
        po_, pi2 = pid[y_, x_], pid[iy[y_, x_], ix[y_, x_]]
        if pi2 > po_ >= 0 and PARTS[pi2]['in'] == PARTS[po_]['in'] and PARTS[pi2]['paint'] != PARTS[po_]['paint']: keep[y_, x_] = True
    rim = rim & ndi.binary_dilation(keep, iterations=2); lab, n = ndi.label(ndi.binary_dilation(rim, iterations=2), np.ones((3, 3)))
    for i, sl_ in enumerate(ndi.find_objects(lab), 1):
        ys, xs = np.nonzero((lab[sl_] == i) & rim[sl_]); ys = ys + sl_[0].start; xs = xs + sl_[1].start
        if len(xs) < PX * .2: continue
        u = toU(xs.mean(), ys.mean()); q0 = pid[ys[0], xs[0]]; mk = pid[iy[ys[0], xs[0]], ix[ys[0], xs[0]]]; w = allowed(u)
        F.append({'kind': 'rim', 'frame': fr, 'at': u, 'size': round(len(xs) / PX, 2), 'what': f"{PARTS[mk]['id'] or 'a marking'} stops short of the outline: {PARTS[q0]['id'] or 'the piece under it'} shows as a line, {len(xs) / PX:.2f} units", **({'allowed': w} if w else {})})
    # seam: where the head meets the neck and the tail meets the body, a colour edge must carry across (both sides the same colour unless it is so standing)
    grp = np.array([('head' if pt['in'] in ('skull', 'head') else 'tail' if pt['in'] == 'tail' else 'body' if pt['in'] in ('body', 'bodyHead', 'vault', 'vaultHead') else 'leg') for pt in meta['parts']] + ['none'])
    G_ = grp[np.where(pid >= 0, pid, len(meta['parts']))]; kk = k
    mm = np.zeros_like(body)
    for dy, dx in ((0, 1), (1, 0)):
        g1, g2 = G_[:G_.shape[0] - dy, :G_.shape[1] - dx], G_[dy:, dx:]; k1, k2 = kk[:kk.shape[0] - dy, :kk.shape[1] - dx], kk[dy:, dx:]
        pair = ((g1 == 'head') & (g2 == 'body')) | ((g1 == 'body') & (g2 == 'head'))  # the head nods against the neck (the tail's own edge changes against the body as it swings, by design)
        mis = pair & (k1 >= 0) & (k2 >= 0) & (k1 != k2); mm[:mis.shape[0], :mis.shape[1]] |= mis
    return F, {'frame': fr, 'mismatch_px': int(mm.sum()), 'clusters': [[*toU(*np.mean(np.nonzero(lab_ == i)[::-1], axis=1)), int((lab_ == i).sum())] for lab_, n_ in [ndi.label(ndi.binary_dilation(mm, iterations=3))] for i in range(1, n_ + 1)]}
F = []
if __name__ == '__main__':
    with ProcessPoolExecutor(max_workers=min(6, os.cpu_count() or 2)) as ex:
        SEAM = {}
        for f_, sm in ex.map(analyse, [f for f in meta['frames'] if not ONLY or f in ONLY]): F += f_; SEAM[sm['frame']] = sm
    base = SEAM.get('stand', {'mismatch_px': 0, 'clusters': []})
    for fr, sm in SEAM.items():  # a colour edge breaking across the seam while walking: more mismatch than standing, reported where it is
        if fr == 'stand' or sm['mismatch_px'] - base['mismatch_px'] < PX * .3: continue
        for cx, cy, npx in sm['clusters']:
            if npx < PX * .3 or any(math.hypot(cx - bx, cy - by) < .4 for bx, by, _ in base['clusters']): continue
            F.append({'kind': 'seam', 'frame': fr, 'at': (round(cx, 2), round(cy, 2)), 'what': f'a colour edge breaks across the head/neck or tail seam ({npx / PX:.2f} units), lined up when standing'})
real = [f for f in F if 'allowed' not in f]
json.dump({'rig': meta['rig'], 'findings': F}, open(D / 'findings.json', 'w'), indent=1)
by = {}
for f in real: by[f['kind']] = by.get(f['kind'], 0) + 1
from collections import Counter
print('  by kind and colour:', dict(Counter((f['kind'], f.get('paint', '')) for f in real).most_common(14)))
print(f"edges {meta['rig']}: {len(real)} findings ({', '.join(f'{v} {k}' for k, v in by.items()) or 'none'}), {len(F) - len(real)} allowed")
for f in real[:60]: print(f"  {f['kind']:6} {f['frame']:8} at ({f['at'][0]:5.1f}, {f['at'][1]:5.1f})  {f['what']}")
# contact sheet: one crop per finding (3 x 3 units, magenta render), the spot circled
cells = []
for f in real[:48]:
    im = Image.open(D / f"{f['frame']}_mag.png").convert('RGB'); cx, cy = (f['at'][0] - V[0]) * PX, (f['at'][1] - V[1]) * PX; h = 1.5 * PX
    cr = im.crop((int(cx - h), int(cy - h), int(cx + h), int(cy + h))).resize((180, 180), Image.NEAREST); dr = ImageDraw.Draw(cr); dr.ellipse((80, 80, 100, 100), outline=(0, 255, 255), width=2)
    dr.rectangle((0, 0, 180, 14), fill=(0, 0, 0)); dr.text((2, 1), f"{f['kind']} {f['frame']} ({f['at'][0]:.1f},{f['at'][1]:.1f})", fill=(255, 255, 255)); cells.append(cr)
if cells:
    S = Image.new('RGB', (180 * 8, 180 * ((len(cells) + 7) // 8)), (17, 17, 17))
    for i, c in enumerate(cells): S.paste(c, ((i % 8) * 180, (i // 8) * 180))
    S.save(D / 'sheet.png')
sys.exit(0)
