#!/usr/bin/env python3
"""den overlay3d <id> [template]: the 3D skeleton laid over a real photo of the species, as a CHECK (no warping).

   The skeleton render (den skeleton3d) is placed on the photo by a similarity only (uniform scale, rotation, shift), fitted on the near-leg joints
   (elbow, carpus, paw joint, stifle, hock, hind paw joint) read off the photo (species/templates/<template>.yaml). Then the body's surface points are
   compared: where the photo's fur outline is, against the skeleton's bone + skin offset (Ellenberger) + fur offset (Scout 03, by season).
   Output: species/build/<id>.overlay.png and the numbers printed and saved in <id>.overlay.json."""
import sys, json, pathlib, subprocess, re
import numpy as np, yaml
from PIL import Image, ImageDraw, ImageOps
ROOT = pathlib.Path(__file__).resolve().parents[2]; BUILD = ROOT / 'species/build'
sys.path.insert(0, str(pathlib.Path(__file__).parent)); import skeleton3d as S3, outline_photo as OP

def render_transparent(sid):
    s = open(pathlib.Path(__file__).parent / 'skeleton3d.py').read(); bl = re.search(r"BLENDER = r'''(.*?)'''", s, re.S).group(1)
    bl = bl.replace("sc.render.filepath = out", "sc.render.film_transparent = True; sc.render.image_settings.color_mode = 'RGBA'; sc.render.filepath = out")
    sp = BUILD / '.skel3d_render_t.py'; sp.write_text(bl); out = BUILD / f'.{sid}.skel3d_t.png'
    subprocess.run([sys.executable, str(sp), str(BUILD / f'{sid}.skel3d.json'), str(out)], check=True, capture_output=True)
    im = ImageOps.mirror(Image.open(out)); im.save(out); return im

def sim_fit(A, B):   # similarity taking points A to B (least squares, Umeyama)
    ma, mb = A.mean(0), B.mean(0); a, b = A - ma, B - mb; U, S, Vt = np.linalg.svd(b.T @ a); D = np.eye(2); D[1, 1] = np.sign(np.linalg.det(U @ Vt))
    R = U @ D @ Vt; s = (S * np.diag(D)).sum() / (a ** 2).sum(); return lambda P: (np.asarray(P) - ma) @ (s * R).T + mb, s

def main(args):
    sid = args[0]; tname = args[1] if len(args) > 1 else f'{sid}_01'
    T = yaml.safe_load(open(ROOT / f'species/templates/{tname}.yaml')); sk = json.load(open(BUILD / f'{sid}.skel3d.json'))
    skel = render_transparent(sid); W, H = skel.size
    bb = sk['bbox']; cy, cz = (bb[0][1] + bb[1][1]) / 2, (bb[0][2] + bb[1][2]) / 2
    w = (bb[1][1] - bb[0][1]) * 1.1; h = (bb[1][2] - bb[0][2]) * 1.15; ortho = max(w, h * 2000 / 1250); k = W / ortho
    ground = bb[0][2]
    to_px = lambda xs, ys: np.array([W / 2 + (xs - (-cy)) * k, H / 2 - ((ys + ground) - cz) * k])   # side mm (x forward, y above ground) -> render px (mirrored)
    J = sk['joints_side_mm']; P = lambda n: to_px(*J[n])
    # surface points of the skeleton: bone + skin + fur (summer)
    def thorax_bottom():
        pts = S3.mesh_pts('thorax', 6000) * np.asarray(sk['bodies']['thorax']['mesh_scale']) @ np.array(sk['bodies']['thorax']['R']).T + np.array(sk['bodies']['thorax']['p_mm'])
        side = np.c_[-pts[:, 1], pts[:, 2] - ground]; return side[np.argmin(side[:, 1])]
    WH = J['scap_top'][1]; sb = thorax_bottom(); L = T['landmarks']
    surf = {'withers': np.array(J['scap_top']) + [0, (0.025 + L['withers']['skin'] + L['withers']['fur']) * WH],
            'brisket': sb - [0, (L['brisket']['skin'] + L['brisket']['fur']) * WH],
            'nose': np.array(J['nose']) + [(L['nose']['skin'] + L['nose']['fur']) * WH, 0],
            'ischium': np.array(J['ischium']) - [(L['ischium']['skin'] + L['ischium']['fur']) * WH, 0]}
    # two alignments, so the stance (how far apart the feet stand) does not shrink the comparison: front half on the front leg, rear half on the hind leg
    def fit_leg(pairs):
        A = np.array([P(a) for a, _ in pairs]); B_ = np.array([L[b]['px'] for _, b in pairs], float); return sim_fit(A, B_), A, B_
    (ff, sf), Af, Bf = fit_leg([('elbow', 'elbow'), ('carpus', 'carpus'), ('mcp', 'front_mcp')])
    (fh, sh), Ah, Bh = fit_leg([('stifle', 'stifle'), ('hock', 'hock'), ('mtp', 'hind_mtp')])
    f = ff; A = np.vstack([Af, Ah]); Bp = np.vstack([Bf, Bh]); s = sf
    img = Image.open(ROOT / T['image']).convert('RGBA'); m = OP.cutout(T['image'])
    a = np.asarray(img).copy(); a[..., 3] = (m * 200).astype(np.uint8); photo = Image.fromarray(a)
    # place the skeleton on the photo canvas: invert the similarity onto the skeleton image
    inv, _ = sim_fit(Bf, Af)   # the picture uses the front-leg alignment
    o = inv(np.zeros((1, 2)))[0]; ex = inv(np.array([[1, 0]]))[0] - o; ey = inv(np.array([[0, 1]]))[0] - o
    skel_on = skel.transform(photo.size, Image.AFFINE, (ex[0], ey[0], o[0], ex[1], ey[1], o[1]), resample=Image.BICUBIC)
    bg = Image.new('RGBA', photo.size, (28, 35, 45, 255)); comp = Image.alpha_composite(bg, photo)
    sk_a = np.asarray(skel_on).copy(); sk_a[..., 3] = (sk_a[..., 3] * 0.8).astype(np.uint8); comp = Image.alpha_composite(comp, Image.fromarray(sk_a))
    d = ImageDraw.Draw(comp); rep = {}
    for n, q in surf.items():
        g_ = fh if n == 'ischium' else ff
        sp_ = g_(to_px(*q)[None])[0]; ph = np.array(L[n]['px'] if n in L else L['nose']['px'], float)
        d.ellipse([sp_[0] - 9, sp_[1] - 9, sp_[0] + 9, sp_[1] + 9], outline=(80, 200, 255), width=4); d.ellipse([ph[0] - 9, ph[1] - 9, ph[0] + 9, ph[1] + 9], outline=(255, 160, 40), width=4)
        d.line([tuple(sp_), tuple(ph)], fill=(255, 255, 255), width=2)
        rep[n] = {'skeleton_px': sp_.round(1).tolist(), 'photo_px': ph.tolist(), 'off_px': (ph - sp_).round(1).tolist()}
    wpx = abs(f(to_px(*surf['withers'])[None])[0][1] - f(to_px(J['mtp'][0], 0)[None])[0][1])
    for n in rep: rep[n]['off_as_share_of_height'] = [round(v / wpx, 3) for v in rep[n]['off_px']]
    leg_res = np.r_[np.linalg.norm(ff(Af) - Bf, axis=1), np.linalg.norm(fh(Ah) - Bh, axis=1)]
    stance = (fh(Ah[-1:])[0] - ff(Af[-1:])[0]) - (Bh[-1] - Bf[-1])
    out = {'id': sid, 'template': tname, 'leg_joint_fit_px': leg_res.round(1).tolist(), 'leg_fit_mean_share': round(float(leg_res.mean() / wpx), 3), 'scale_front_vs_hind': round(float(sf / sh), 3),
           'stance_extra_spread_share': round(float(-stance[0] / wpx), 3), 'surface': rep,
           'note': 'off = photo minus skeleton (x forward, y down), as a share of the photo withers-to-ground height'}
    comp.convert('RGB').save(BUILD / f'{sid}.overlay.png'); (BUILD / f'{sid}.overlay.json').write_text(json.dumps(out, indent=1))
    print(f'wrote species/build/{sid}.overlay.png; leg joints fit within {out["leg_fit_mean_share"]:.3f} of height; front/hind leg scale ratio {out["scale_front_vs_hind"]}')
    for n, r in rep.items(): print(f'  {n:8} photo minus skeleton: forward {r["off_as_share_of_height"][0]:+.3f}, down {r["off_as_share_of_height"][1]:+.3f}  (share of height)')
    return 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
