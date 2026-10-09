#!/usr/bin/env python3
"""Write engine/hero5.js from engine/hero5_geo.json (variant "nudged", GrumpyDingo's pick): the rig definition of hero5, with its skeleton and
   pieces from photo 01 and the shared canine walk engine (canineWalk in engine/hero3.js). Load order: rig.js, rig_den.js, hero3.js, hero5.js.
   Usage: python3 tools/den/hero5_engine.py"""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]
G = json.load(open(ROOT / 'engine/hero5_geo.json'))['nudged']
r2 = lambda v: round(v, 2)
J = {k: [r2(v[0]), r2(v[1])] for k, v in G['joints'].items()}
parts = {k: [[x, y] for x, y in v] for k, v in G['parts'].items()}
GROUND, TOE = 35.55, 1.05  # the rig's ground line; a toe joint sits 1.05 above the bottom of its paw (dogcheck's contact point)
# ground fit: in the photo the near paws stand a little low (the near side is nearer the camera), so the hind paw cut reaches 0.78 below the
# ground. Lift each leg's paw onto the ground: the bone from the stifle (elbow) to the hock (carpus) shortens a little, the paw and the cannon keep their shape.
def ground_fit(top, low, paw, names):
    bottom = max(y for _, y in parts[names[-1]]); J[paw] = [J[paw][0], bottom - TOE]  # the toe joint's contact point at the paw cut's own bottom
    d = bottom - GROUND
    if d <= 0: return 0
    t, h = J[top][1], J[low][1]; k = (h - d - t) / (h - t)
    f = lambda y: y if y <= t else (t + (y - t) * k if y <= h else y - d)
    for n in names: parts[n] = [[x, f(y)] for x, y in parts[n]]
    for n in (low, paw): J[n] = [J[n][0], f(J[n][1])]
    return d
fit = {'hind': ground_fit('nKn', 'nHo', 'nHp', ['thigh', 'shank', 'cannon', 'hpaw']), 'front': ground_fit('nEl', 'nCa', 'nFp', ['upperarm', 'forearm', 'pastern', 'fpaw'])}
J = {k: [r2(v[0]), r2(v[1])] for k, v in J.items()}
parts = {k: [[r2(x), r2(y)] for x, y in v] for k, v in parts.items()}
import sys; sys.path.insert(0, str(ROOT / 'tools/den')); import hero5_legs
FAR_HIND_DX = -.4  # must match FAR_DX.hind in the rig below
parts = hero5_legs.rebuild(J, parts, G['report']['widths_units'], FAR_HIND_DX)  # clean capsule bones and drawn paws (GrumpyDingo's joint notes, Oct 9)
print('ground fit (units lifted):', {k: round(v, 3) for k, v in fit.items()})
import sys; sys.path.insert(0, str(ROOT / 'tools/den')); import hero5_marks
PAL, _, _ = hero5_marks.palette(J, parts, G['frame'])
marks = [{'id': i, 'host': h, 'paint': p, 'poly': [[r2(x), r2(y)] for x, y in list(g.exterior.coords)[:-1]]} for i, h, p, g in hero5_marks.zones(J, parts)]
print('marks', [(m['id'], m['host'], len(m['poly'])) for m in marks]); print('palette', PAL)
from shapely.geometry import Polygon as _Poly
_ref = _Poly(parts['trunk']).buffer(0).union(_Poly(parts['head']).buffer(0)).buffer(.01)
data = {'J': J, 'parts': parts, 'marks': marks, 'outlineRef': [[r2(x), r2(y)] for x, y in list(_ref.exterior.coords)[:-1]]}
js = '''/* hero5: the wolf cut from a real wolf (Oct 9, 2026). Photo 01 (Rob Foster, iNaturalist, CC BY 4.0), GrumpyDingo's vector silhouette of it and his
   44 rig points (ref/research/firefly/wolf-rig-points/); built by tools/den/hero5_build.py, written by tools/den/hero5_engine.py: do not edit by hand.
   Walks with the shared canine walk engine (canineWalk, engine/hero3.js): every leg joint follows the measured walking dogs. Units: withers height 25,
   ground y 35.55, facing right. */
const HERO5_GEO = ''' + json.dumps(data, separators=(',', ':')) + ''';
function registerHero5(RIG){
  const H2 = RIG.DEFS.hero2; if (!H2) throw new Error("hero5 needs hero2 (its toe tracks)");
  if (typeof canineWalk !== "function") throw new Error("hero5 needs engine/hero3.js loaded first (canineWalk)");
  const G = HERO5_GEO, J = G.J, f2 = v => +(+v).toFixed(2);
  const H = {hip:J.nHi, stifle:J.nKn, hock:J.nHo, paw:J.nHp}, Fj = {sc:J.r_scap, sh:J.nSh, elbow:J.nEl, past:J.nCa, paw:J.nFp};
  /* hero3's walk, re-centred for hero5's own legs: each paw's stance sits where hero3's does relative to its hip or shoulder */
  const C3 = {hind:4 + (16.47 - 20.6), front:-2.3}; /* hero3: hind stance centre is 4 ahead of a paw that stands 4.13 behind the hip */
  const WALK = {speed:20, limbPhase:.16, keys:48, crouch:1.5, head:{pitch:6, bob:1.2, lag:.06},
    hind:{duty:.60, lift:.9, fold:4, centre:f2(H.hip[0] + C3.hind - H.paw[0]), maxOpen:148, bob:.45, lean:16, smooth:2, follow:"hind", crouch:0},
    front:{duty:.62, follow:"front", matchBase:true, lift:1.8, fold:120, carpusHold:190, swingCarpus:66, centre:f2(C3.front + (Fj.sh[0] - 42.4) - (Fj.paw[0] - 40.37)), maxOpen:152, bob:.30, scap:{top:Fj.sc, swing:16}, lean:10}};
  const BODY_PIVOT = [f2((H.hip[0] + Fj.sh[0]) / 2), f2((J.wither[1] + J.r_brisket[1]) / 2)];
  const HEAD_PIVOT = [f2((J.r_nape[0] + J.r_throat[0]) / 2), f2((J.r_nape[1] * 2 + J.r_throat[1]) / 3)]; /* the head nods at the neck's end, nearer the top */
  const tracks = Object.assign({}, H2.tracks, canineWalk(RIG, {H, Fj, WALK, BODY_PIVOT, toe:{htoe:H2.tracks.htoe, ftoe:H2.tracks.ftoe}}));
  const FAR_DX = {hind:''' + str(FAR_HIND_DX) + ''', front:-1.3}, shJ = (o, dx) => Object.fromEntries(Object.entries(o).map(([n, q]) => [n, [f2(q[0] + dx), q[1]]]));
  const HL = k => k === "F" ? shJ(H, FAR_DX.hind) : H, FL = k => k === "F" ? shJ(Fj, FAR_DX.front) : Fj, shP = (P, dx) => P.map(q => [f2(q[0] + dx), q[1]]);
  const hind = (k, ph, far) => [{id:"hip" + k, at:HL(k).hip, track:"hhip", ph, far, in:"root"}, {id:"shank" + k, at:HL(k).stifle, track:"hshank", ph, in:"hip" + k},
    {id:"meta" + k, at:HL(k).hock, track:"hmeta", ph, in:"shank" + k}, {id:"htoe" + k, at:HL(k).paw, track:"htoe", ph, in:"meta" + k}];
  const front = (k, ph, far) => [{id:"scap" + k, at:FL(k).sc, track:"fscap", ph, far, in:"root"}, {id:"sh" + k, at:FL(k).sh, track:"fsh", ph, in:"scap" + k},
    {id:"fore" + k, at:FL(k).elbow, track:"ffore", ph, in:"sh" + k}, {id:"past" + k, at:FL(k).past, track:"fpast", ph, in:"fore" + k}, {id:"ftoe" + k, at:FL(k).paw, track:"ftoe", ph, in:"past" + k}];
  /* the thigh bends: its top rides with the body (weight 1 down to just below the pelvis top), its knee end with the femur */
  const W0 = J.nIl[1] + (J.nKn[1] - J.nIl[1]) * .2, W1 = J.nKn[1] - (J.nKn[1] - J.nIl[1]) * .15;
  const densify = (P, step) => P.flatMap((q, k) => { const n = P[(k + 1) % P.length], m = Math.max(1, Math.ceil(Math.hypot(n[0] - q[0], n[1] - q[1]) / step)); return [...Array(m)].map((_, u) => [f2(q[0] + (n[0] - q[0]) * u / m), f2(q[1] + (n[1] - q[1]) * u / m)]); });
  const thighSkin = P0 => { const P = densify(P0, .3); return {poly:P, skin:{to:"body", w:P.map(q => { const u = Math.max(0, Math.min(1, (q[1] - W0) / (W1 - W0))); return +(1 - u * u * (3 - 2 * u)).toFixed(3); })}}; };
  const legMk = (h, k, dx) => G.marks.filter(m => m.host === h).map(m => ({poly:shP(m.poly, dx), in:{shank:"shank", forearm:"fore"}[h] + k, paint:m.paint, id:m.id + k}));
  const legParts = k => { const dh = k === "F" ? FAR_DX.hind : 0, df = k === "F" ? FAR_DX.front : 0, P = G.parts;
    const hide = k === "F" ? {mayHide:true} : {}; /* the far legs tuck behind the body and the near legs */
    return [{...thighSkin(shP(k === "F" ? P.thighFar : P.thigh, dh)), in:"hip" + k, id:"thigh" + k}, {poly:shP(P.shank, dh), in:"shank" + k, id:"shank" + k}, ...legMk("shank", k, dh), {poly:P.achilles.map(q => [f2(q[0] + dh), q[1]]), skin:{to:"meta" + k, w:P.achilles.map(q => q[2])}, in:"shank" + k, id:"achilles" + k, paint:"leg"}, {poly:shP(P.cannon, dh), in:"meta" + k, id:"cannon" + k, paint:"leg"}, {poly:shP(P.hpaw, dh), in:"htoe" + k, id:"hpaw" + k, paint:"pale"},
      {poly:shP(P.upperarm, df), in:"sh" + k, id:"upperarm" + k}, {poly:shP(P.forearm, df), in:"fore" + k, id:"forearm" + k}, ...legMk("forearm", k, df), {poly:shP(P.pastern, df), in:"past" + k, id:"pastern" + k, paint:"leg"}, {poly:shP(P.fpaw, df), in:"ftoe" + k, id:"fpaw" + k, paint:"pale"}].map(p => ({...p, ...hide})); };
  /* the coat's markings (tools/den/hero5_marks.py): each rides the piece it was cut inside and draws just after it */
  const HOST = {tail:"tail", trunk:"body", head:"skull"}, mk = h => G.marks.filter(m => m.host === h).map(m => ({poly:m.poly, in:HOST[h], paint:m.paint, id:m.id, ...(m.id === "belly" ? {mayHide:true} : {}), ...(m.host === "head" && /Neck$|^throat$/.test(m.id) ? {markOn:"outlineRef"} : {})})); /* the neck pieces lap over the trunk's: checked against the whole outline */
  RIG.define("hero5", {
    stride:1, gait:{duty:WALK.front.duty, hindDuty:WALK.hind.duty, limbPhase:WALK.limbPhase, speed:WALK.speed},
    landmarks:{scapTop:{at:Fj.sc, in:"body", note:"top of the shoulder blade (GrumpyDingo's point on photo 01)"}}, tracks,
    palette:''' + json.dumps({**PAL, 'far': .74}) + ''',  /* sampled from photo 01 by tools/den/hero5_marks.py */
    joints:[
      ...hind("F", 0, true), ...front("F", 1 - WALK.limbPhase, true),
      {id:"vault", at:BODY_PIVOT, track:"bodyWalk", in:"root"}, {id:"body", in:"vault"},
      {id:"tail", at:J.tail, track:"tailWalk", in:"vault"}, /* a second child of the vault, after the body: the tail draws over the rump, under the near hind leg */
      ...hind("N", .5, false), ...front("N", .5 - WALK.limbPhase, false),
      {id:"vaultHead", at:BODY_PIVOT, track:"bodyWalk", in:"root"}, {id:"bodyHead", in:"vaultHead"},
      {id:"head", at:HEAD_PIVOT, track:"headWalk", in:"bodyHead"}, {id:"skull", in:"head"}],
    parts:[...legParts("F"), {poly:G.parts.tail, in:"tail", id:"tail"}, ...mk("tail"), {poly:G.parts.trunk, in:"body", id:"body"}, {poly:G.outlineRef, in:"body", id:"outlineRef", hidden:true, ref:true} /* never drawn: trunk and head as one, for dogcheck */, ...mk("trunk"), ...legParts("N"), {poly:G.parts.head, in:"skull", id:"head"}, ...mk("head")],
    states:{}
  });
}
if (typeof module !== "undefined") module.exports = {registerHero5, HERO5_GEO};
'''
(ROOT / 'engine/hero5.js').write_text(js); print('wrote engine/hero5.js', len(js) // 1024, 'KB')
