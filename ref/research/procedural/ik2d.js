/* ik2d.js - prototype procedural gait for the Den rig (research only; not wired into the game).
   Firefly, Oct 6. MIT-style, no dependencies, no Pixi, no Math.random.

   Coordinates: the rig's 62x38 drawing space, y DOWN. Angles: radians, atan2(dy, dx) in y-down space, so a positive
   change is CLOCKWISE on screen, which is exactly Pixi's rotation sign. That means "absolute bone angle now minus
   absolute bone angle in the drawing" is the sum of the rig.js rotations from the leg's top joint down to that bone.

   Pieces:
     twoBone()        analytic two-bone IK (law of cosines) with bend side, soft reach and joint limits
     solveHind()      3-bone hind leg: femur, tibia, metatarsus; the metatarsus is held parallel-ish to the femur
                      (the canine hind "pantograph"), solved by a FIXED number of passes (deterministic)
     solveFore()      3-bone fore leg: humerus, radius/ulna, metacarpus (pastern); the pastern angle is given
                      (near vertical in stance, folding back in swing), so the top two bones are a plain two-bone
     GAITS / legPhase / pawTarget   gait table (offsets, duty factor) -> paw targets (stance slides back at body
                      speed, swing is a Hermite arc whose end speed matches the ground)
     girdles()        hip and shoulder heights from the footfalls -> body bob and pitch
     SecondOrder      t3ssel8r-style second-order follower for tail, ears, head (fixed sub-steps)
     mulberry32 / noise1   seeded randomness for idle events
     legRig()         turns solved bone angles into rig.js joint {rot (deg), x, y} entries
*/
"use strict";
const TAU = Math.PI * 2, DEG = 180 / Math.PI;
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const len = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
const ang = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
const wrap = a => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };

/* ---------- analytic two-bone IK ----------
   root [x,y], bone lengths l1, l2, target [x,y].
   bend: +1 puts the middle joint clockwise of the root->target line (for a leg hanging down, that is BEHIND, -x:
         the fore leg's elbow), -1 puts it in FRONT (+x: the hind stifle). Facing left is free (scale.x = -1).
   lim: {flex, ext} anatomical angle at the middle joint in DEGREES (180 = straight). Limits are applied by clamping
        the root->target distance, which is exactly equivalent and never fights the solve.
   soft: 0..1 fraction of total length over which reach eases out (Spine/"soft IK") so the knee never pops straight;
   dFree: reach below which nothing is softened (pass the drawn reach so the rest pose is exact).
   returns {a1, a2, mid, end, d, err}: absolute bone angles, the middle joint, the reached end, error to the target. */
function twoBone(root, l1, l2, target, bend, lim, soft, dFree = 0){
  const dx = target[0] - root[0], dy = target[1] - root[1]; let d = Math.hypot(dx, dy);
  const base = Math.atan2(dy, dx);
  let dMin = Math.abs(l1 - l2) + 1e-6, dMax = l1 + l2 - 1e-6;
  if (lim){ const dAt = deg => Math.sqrt(l1 * l1 + l2 * l2 - 2 * l1 * l2 * Math.cos(deg / DEG));
    if (lim.flex != null) dMin = Math.max(dMin, dAt(lim.flex));
    if (lim.ext != null) dMax = Math.min(dMax, dAt(Math.min(lim.ext, 179.9))); }
  /* soft zone: from max(dMax - soft*(l1+l2), dFree) up to dMax; dFree = the drawn (rest) reach, so the drawing is never softened */
  if (soft){ const ds = Math.min(Math.max(dMax - soft * (l1 + l2), dFree), dMax - 1e-4), s = dMax - ds; if (d > ds) d = ds + s * (1 - Math.exp(-(d - ds) / s)); }
  d = clamp(d, dMin, dMax);
  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), A = Math.acos(cosA);
  const a1 = base + bend * A;
  const mid = [root[0] + l1 * Math.cos(a1), root[1] + l1 * Math.sin(a1)];
  const end = [root[0] + d * Math.cos(base), root[1] + d * Math.sin(base)];
  const a2 = Math.atan2(end[1] - mid[1], end[0] - mid[0]);
  return {a1, a2, mid, end, d, err:len(end[0], end[1], target[0], target[1])};
}
/* anatomical angle at a joint between bone a (pointing into the joint) and bone b (pointing out): 180 = straight */
const jointDeg = (aIn, aOut) => 180 - Math.abs(wrap(aOut - aIn)) * DEG;

/* ---------- leg description from the rig's own joint points ----------
   pts = [top, j1, j2, paw] drawing points (e.g. H.hip, H.stifle, H.hock, H.paw). Lengths and REST angles come from the
   drawing, so a new species is just new points. */
function leg(pts, kind, limits){
  const L = [0, 1, 2].map(i => len(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]));
  const R = [0, 1, 2].map(i => ang(pts[i], pts[i + 1]));
  const reach = len(pts[0][0], pts[0][1], pts[2][0], pts[2][1]), reachPaw = len(pts[0][0], pts[0][1], pts[3][0], pts[3][1]); /* drawn reaches */
  return {kind, pts, L, R, reach, reachPaw, lim:limits || {}, bend:kind === "hind" ? -1 : +1};
}

/* ---------- 3-bone hind leg (pantograph), solved ANALYTICALLY ----------
   The canine metatarsus stays roughly parallel to the femur through stance (the hind-limb "pantograph"); metaBias (rad)
   opens/closes that coupling (hock folds in swing, extends at push-off). With the metatarsus locked to the femur by an
   angle dl, the leg has ONE shape freedom, u = tibia angle relative to femur:
       paw - top = R(af) * W(u),   W(u) = A + l2 e^{iu},   A = l1 + l3 e^{i dl}   (complex numbers, femur frame)
   |W(u)|^2 = |A|^2 + l2^2 + 2 l2 |A| cos(u - arg A), so u comes straight from the law of cosines, and af is whatever
   rotation points W(u) at the paw. No iteration, exact. Both the stifle and the hock limits are limits on u
   (stifle = 180 - u, hock = 180 + dl - u, degrees), so they become one clamp on u: exact, and the paw only misses
   when the target is truly out of reach. */
function solveHind(lg, top, paw, metaBias = 0){
  const [l1, l2, l3] = lg.L, [rf, , rm] = lg.R, dl = wrap(rm - rf + metaBias);
  const Ax = l1 + l3 * Math.cos(dl), Ay = l3 * Math.sin(dl), An = Math.hypot(Ax, Ay), Ag = Math.atan2(Ay, Ax);
  /* u range from the limits (degrees -> rad); the stifle bends forward so u > 0 */
  let uMin = 1e-3, uMax = Math.PI - 1e-3;
  if (lg.lim.mid){ uMin = Math.max(uMin, (180 - lg.lim.mid.ext) / DEG); uMax = Math.min(uMax, (180 - lg.lim.mid.flex) / DEG); }
  if (lg.lim.low){ uMin = Math.max(uMin, (180 - lg.lim.low.ext) / DEG + dl); uMax = Math.min(uMax, (180 - lg.lim.low.flex) / DEG + dl); }
  const W = u => [Ax + l2 * Math.cos(u), Ay + l2 * Math.sin(u)];
  const reachOf = u => Math.hypot(...W(u)); /* decreasing in u over the usable range */
  const dMax = reachOf(uMin), dMin = reachOf(uMax), dFree = Math.min(lg.reachPaw || 0, dMax);
  let d = Math.hypot(paw[0] - top[0], paw[1] - top[1]);
  { const s = .04 * (l1 + l2 + l3), ds = Math.min(Math.max(dMax - s, dFree), dMax - 1e-4), w = dMax - ds; if (d > ds) d = ds + w * (1 - Math.exp(-(d - ds) / w)); }
  d = clamp(d, dMin, dMax);
  const c = clamp((d * d - An * An - l2 * l2) / (2 * l2 * An), -1, 1);
  let u = Ag + Math.acos(c); /* the + root keeps the stifle forward (checked against the drawing in the test) */
  u = clamp(wrap(u), uMin, uMax);
  const w = W(u), af = Math.atan2(paw[1] - top[1], paw[0] - top[0]) - Math.atan2(w[1], w[0]);
  const at = af + u, am = af + dl;
  const st = [top[0] + l1 * Math.cos(af), top[1] + l1 * Math.sin(af)], hk = [st[0] + l2 * Math.cos(at), st[1] + l2 * Math.sin(at)];
  const end = [hk[0] + l3 * Math.cos(am), hk[1] + l3 * Math.sin(am)];
  return {a:[af, at, am], joints:[top, st, hk, end], err:len(end[0], end[1], paw[0], paw[1])};
}

/* ---------- 3-bone fore leg ----------
   The pastern (metacarpus) angle is GIVEN (absolute, rad): near vertical in stance (a few degrees of lean, more under
   load = carpal hyperextension), folding back in swing. Then shoulder->elbow->carpus is a plain two-bone. */
function solveFore(lg, top, paw, pasternAbs){
  const [l1, l2, l3] = lg.L;
  const carpus = [paw[0] - l3 * Math.cos(pasternAbs), paw[1] - l3 * Math.sin(pasternAbs)];
  const sol = twoBone(top, l1, l2, carpus, lg.bend, lg.lim.mid, .04, lg.reach);
  let ap = pasternAbs;
  /* carpus: signed anatomical angle, 180 = straight, < 180 = folded back (flexed), > 180 = pastern leaning forward
     (hyperextended under load; dogs reach ~196 passively) */
  if (lg.lim.low){ const j = 180 - wrap(ap - sol.a2) * DEG, want = clamp(j, lg.lim.low.flex, lg.lim.low.ext);
    if (want !== j){
      /* the wrist hit its limit: hold it AT the limit and re-solve with the pastern locked to the forearm. The forearm +
         pastern is then one rigid virtual bone (length |l2 + l3 e^{ic}|), so it is still an exact analytic two-bone and
         the paw stays planted (this is the paw rolling up onto its toes at the back of the stride). */
      const c = (180 - want) / DEG, vx = l2 + l3 * Math.cos(c), vy = l3 * Math.sin(c), lv = Math.hypot(vx, vy), gv = Math.atan2(vy, vx);
      /* the elbow limits carry over shifted by the virtual bone's angle offset gv (elbow folds the forearm counter-clockwise, u < 0) */
      const m = lg.lim.mid, vl = m ? {flex:180 - Math.abs(-(180 - m.flex) + gv * DEG), ext:180 - Math.abs(-(180 - m.ext) + gv * DEG)} : null;
      const s2 = twoBone(top, l1, lv, paw, lg.bend, vl, .04, Math.min(lg.reachPaw, l1 + lv - 1e-3));
      const ar = s2.a2 - gv; ap = ar + c;
      const carp = [s2.mid[0] + l2 * Math.cos(ar), s2.mid[1] + l2 * Math.sin(ar)];
      sol.a1 = s2.a1; sol.a2 = ar; sol.mid = s2.mid; sol.end = carp;
    } }
  const end = [sol.end[0] + l3 * Math.cos(ap), sol.end[1] + l3 * Math.sin(ap)];
  return {a:[sol.a1, sol.a2, ap], joints:[top, sol.mid, sol.end, end], err:len(end[0], end[1], paw[0], paw[1])};
}

/* ---------- gaits ----------
   off: footfall phase of each leg (hF far hind, fF far fore, hN near hind, fN near fore), fraction of the stride.
   df: duty factor (fraction of the stride each paw is on the ground), hind/fore may differ.
   lift: swing height as a fraction of hip height. bob: girdle bob amplitude (fraction of hip height);
   vault: +1 = girdle highest at mid-stance (walk, inverted pendulum), -1 = lowest (trot/gallop, spring-mass).
   Values are canine ballpark (Hildebrand-style footfall diagrams; Maes et al. 2008 JEB 211:138) to be tuned by eye. */
const GAITS = {
  walk:   {off:{hF:0,   fF:.25, hN:.5,  fN:.75}, df:{h:.64, f:.62}, lift:.10, bob:.012, vault:+1},
  trot:   {off:{hF:0,   fF:.5,  hN:.5,  fN:0  }, df:{h:.42, f:.40}, lift:.16, bob:.025, vault:-1},
  /* canter, near-fore lead: hind of the opposite side first, then the diagonal pair together, then the lead fore */
  canter: {off:{hF:0,   fN:.30, hN:.30, fF:.55}, df:{h:.40, f:.38}, lift:.20, bob:.04,  vault:-1},
  /* rotary gallop (what dogs use flat out): hinds close together, fores close together, the sequence goes round */
  gallop: {off:{hF:0,   hN:.10, fN:.42, fF:.52}, df:{h:.28, f:.26}, lift:.24, bob:.05,  vault:-1}
};
const LEGS = ["hF", "fF", "hN", "fN"];
/* blend two gait entries; offsets interpolate on the circle (shortest way round) so a walk->trot change just slides
   the fore legs a quarter stride, without a jump. Drive k with a smooth ramp over about one stride. */
function blendGait(A, B, k){
  const off = {}; for (const l of LEGS){ let d = B.off[l] - A.off[l]; d -= Math.round(d); off[l] = ((A.off[l] + d * k) % 1 + 1) % 1; }
  const m = (a, b) => a + (b - a) * k;
  return {off, df:{h:m(A.df.h, B.df.h), f:m(A.df.f, B.df.f)}, lift:m(A.lift, B.lift), bob:m(A.bob, B.bob), vault:m(A.vault, B.vault)};
}
/* stride length from dynamic similarity (Alexander & Jayes 1983: lambda/h ~= 2.3 Fr^0.3, Fr = v^2/(g h)). Works for
   any canid size: only hip height h changes. g in drawing units/s^2 (hero hip height 16.7u ~= 0.5 m -> g ~= 330 u/s^2). */
function strideFor(v, h, g = 330){ const Fr = v * v / (g * h); return {len:h * 2.3 * Math.pow(Math.max(Fr, 1e-4), .3), Fr}; }

/* per-leg phase in [0,1): 0 = touchdown */
const legPhase = (phi, off) => ((phi - off) % 1 + 1) % 1;
/* paw target in the BODY frame (paw x relative to its neutral x0; y relative to the ground line y0).
   stance: slides back linearly at exactly body speed (so it is still on the ground in world space).
   swing: cubic Hermite from back to front whose end tangents are (match x) the stance speed, so the paw arrives
   already moving back ("ground-speed matching") and leaves without a jerk; height is an early-peaking arc.
   step = ground covered during stance = stride length * duty factor. */
const smooth = s => s * s * (3 - 2 * s);
function pawTarget(p, df, step, liftH, x0, y0, match = .6){
  if (p < df){ const s = p / df; return {x:x0 + step * (.5 - s), y:y0, stance:true, s}; }
  const s = (p - df) / (1 - df), m = -step * (1 - df) / df * match; /* dx/ds of stance, scaled */
  const h00 = 2*s*s*s - 3*s*s + 1, h10 = s*s*s - 2*s*s + s, h01 = -2*s*s*s + 3*s*s, h11 = s*s*s - s*s;
  const x = x0 + (h00 * -step / 2 + h10 * m + h01 * step / 2 + h11 * m);
  const y = y0 - liftH * Math.sin(Math.PI * Math.pow(s, .75)); /* peak at ~40% of swing: dogs pick the paw up fast */
  return {x, y, stance:false, s};
}

/* ---------- body from footfalls ----------
   each girdle (hips, shoulders) rises or sinks with its legs' stance progress. Returns drawing-unit offsets (y down). */
function girdles(phi, G, hipH){
  const one = (a, b, df) => { let sum = 0, n = 0; for (const l of [a, b]){ const p = legPhase(phi, G.off[l]); if (p < df){ sum += Math.sin(Math.PI * p / df); n++; } }
    return n ? sum / n : 0; };
  const A = G.bob * hipH, hindY = -G.vault * A * one("hF", "hN", G.df.h), foreY = -G.vault * A * one("fF", "fN", G.df.f);
  return {hindY, foreY};
}

/* ---------- secondary motion: second-order dynamics (t3ssel8r, "Giving Personality to Procedural Animations")
   f = natural frequency (Hz), z = damping (0 wobbly, 1 critical, >1 sluggish), r = initial response (<0 anticipates,
   >1 overshoots). Fixed internal step, so the result depends only on the input signal over time, not on frame rate. */
class SecondOrder {
  constructor(f, z, r, x0 = 0, step = 1 / 120){ this.k1 = z / (Math.PI * f); this.k2 = 1 / ((TAU * f) * (TAU * f)); this.k3 = r * z / (TAU * f);
    this.y = x0; this.yd = 0; this.xp = x0; this.h = step; this.n = 0; }
  /* to(tNow, xOf): run every fixed step k*h <= tNow. xOf(t) is the input as a FUNCTION of time, sampled at k*h, and
     the step count comes from absolute time (not a float accumulator), so any frame split gives bit-identical output. */
  to(tNow, xOf){ const h = this.h, k2 = Math.max(this.k2, h * h / 2 + h * this.k1 / 2, h * this.k1);
    const N = Math.floor(tNow / h + 1e-7);
    while (this.n < N){ this.n++; const x = xOf(this.n * h), xd = (x - this.xp) / h; this.xp = x;
      this.y += h * this.yd; this.yd += h * (x + this.k3 * xd - this.y - this.k1 * this.yd) / k2; }
    return this.y; }
}

/* ---------- seeded randomness ---------- */
function mulberry32(a){ return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hash2 = (seed, i) => mulberry32((seed * 374761393 + i * 668265263) | 0)();
/* smooth 1-D value noise in [-1,1]: same (seed, x) -> same value, always */
function noise1(seed, x){ const i = Math.floor(x), u = x - i, a = hash2(seed, i) * 2 - 1, b = hash2(seed, i + 1) * 2 - 1; return a + (b - a) * smooth(u); }

/* ---------- to rig.js ----------
   ids = [topJoint, j1, j2, toe] e.g. ["hipN","shankN","metaN","htoeN"]. sol from solveHind/solveFore.
   top: where the top pivot is NOW (the girdle moved it); the joint's x,y is that offset from the drawing point.
   toeAbs: absolute paw angle change (0 = flat as drawn) - keep 0 in stance so the pad stays flat. */
function legRig(lg, ids, sol, top, toeAbs = 0){
  const d = sol.a.map((a, i) => wrap(a - lg.R[i]) * DEG); /* absolute changes, degrees */
  return {
    [ids[0]]:{rot:d[0], x:top[0] - lg.pts[0][0], y:top[1] - lg.pts[0][1]},
    [ids[1]]:{rot:d[1] - d[0], x:0, y:0},
    [ids[2]]:{rot:d[2] - d[1], x:0, y:0},
    [ids[3]]:{rot:toeAbs - d[2], x:0, y:0}
  };
}

/* ---------- one whole-dog pose, a pure function of (time, speed, gait) ----------
   rig: {hind:[pts], fore:[pts], ground, bodyAt}; returns {joints, debug}. phi is the stride phase (caller integrates
   phi += dt * v / strideLen so speed changes never jump the phase). */
const HERO2 = {
  hind:[[20.6, 17.8], [24.4, 26.2], [19.4, 29.8], [20.3, 34.5]],
  fore:[[42.6, 15.4], [40.0, 21.8], [40.4, 30.4], [40.8, 34.5]],
  /* scapula: the fore leg's real top pivot is high on the withers, not the point of the shoulder. The shoulder joint
     rides an arc about it, which is most of how a dog lengthens its fore leg at the back of the stride. */
  scap:[38.4, 10.4],
  ground:34.5, bodyAt:[31.6, 16.6]
};
/* canine joint limits, degrees, anatomical (180 = straight). Passive ranges from goniometry in Labradors
   (Jaegger et al. 2002, AJVR 63:979): carpus 32-196, elbow 36-166, shoulder 57-165, tarsus 38-165, stifle 41-162,
   hip 50-162. Gait uses much less: keep the passive range as the hard wall and art-direct inside it. */
const LIMITS = {hind:{mid:{flex:41, ext:162}, low:{flex:38, ext:165}}, fore:{mid:{flex:36, ext:166}, low:{flex:32, ext:196}}};
/* the longest top->target distance each leg reaches EXACTLY (below its soft zone): girdles drop to stay inside it */
function freeReach(lg){
  const [l1, l2, l3] = lg.L, sum = l1 + l2 + (lg.kind === "hind" ? l3 : 0);
  let dMax;
  if (lg.kind === "hind"){ const dl = wrap(lg.R[2] - lg.R[0]); const Ax = l1 + l3 * Math.cos(dl), Ay = l3 * Math.sin(dl);
    let uMin = Math.max((180 - lg.lim.mid.ext) / DEG, (180 - lg.lim.low.ext) / DEG + dl);
    dMax = Math.hypot(Ax + l2 * Math.cos(uMin), Ay + l2 * Math.sin(uMin)); return Math.min(Math.max(dMax - .04 * sum, lg.reachPaw), dMax) * .998; }
  dMax = Math.sqrt(l1 * l1 + l2 * l2 - 2 * l1 * l2 * Math.cos(lg.lim.mid.ext / DEG));
  return Math.min(Math.max(dMax - .04 * sum, lg.reach), dMax) * .998; /* fore: shoulder -> carpus */
}
function makeDog(def = HERO2){
  const dog = {def, hind:leg(def.hind, "hind", LIMITS.hind), fore:leg(def.fore, "fore", LIMITS.fore), hipH:def.ground - def.hind[0][1]};
  dog.hind.free = freeReach(dog.hind); dog.fore.free = freeReach(dog.fore);
  if (def.scap){ dog.scapL = len(def.scap[0], def.scap[1], def.fore[0][0], def.fore[0][1]); dog.scapR = ang(def.scap, def.fore[0]); }
  return dog;
}
/* lowest top height (largest y, y down) that still lets a leg reach point q exactly with free reach R */
const needY = (topX, q, R) => { const dx = q[0] - topX; return q[1] - Math.sqrt(Math.max(R * R - dx * dx, 0)); };

/* one pose, a pure function of (phi, gait, stride length). Order:
   1 paw targets from the gait table   2 scapula angle from the fore paws' swing   3 girdle heights = the gait's bob,
   dropped wherever a stance leg would otherwise over-reach (this IS the walk's inverted-pendulum dip, from footfalls)
   4 body pitch from the two girdles   5 IK each leg   6 rig.js joint entries */
function pose(dog, phi, G, stride, opt = {}){
  const D = dog.def, out = {}, dbg = {}, kS = opt.scapK ?? .55;
  const T = {};
  for (const k of ["F", "N"]){
    { const lg = dog.hind, p = legPhase(phi, G.off["h" + k]); T["h" + k] = pawTarget(p, G.df.h, stride * G.df.h, G.lift * dog.hipH, lg.pts[3][0], D.ground); }
    { const lg = dog.fore, p = legPhase(phi, G.off["f" + k]); const t = pawTarget(p, G.df.f, stride * G.df.f, G.lift * dog.hipH, lg.pts[3][0], D.ground);
      /* stance: a few degrees more forward lean at mid-stance (carpus takes the load); swing: the wrist folds back hard */
      t.pastern = t.stance ? lg.R[2] - 0.06 * Math.sin(Math.PI * t.s) : lg.R[2] + 1.2 * Math.sin(Math.PI * Math.pow(t.s, .8));
      t.carpus = [t.x - lg.L[2] * Math.cos(t.pastern), t.y - lg.L[2] * Math.sin(t.pastern)];
      /* scapula: paw behind -> the shoulder point swings back and down (clockwise), paw ahead -> forward and up */
      const sw = clamp(-(t.x - lg.pts[3][0]) / (lg.L[0] + lg.L[1] + lg.L[2]), -.6, .6);
      t.top = D.scap ? [D.scap[0] + dog.scapL * Math.cos(dog.scapR + kS * sw), D.scap[1] + dog.scapL * Math.sin(dog.scapR + kS * sw)] : lg.pts[0].slice();
      T["f" + k] = t; }
  }
  const bob = girdles(phi, G, dog.hipH);
  let hindY = bob.hindY, foreY = bob.foreY;
  for (const k of ["F", "N"]){
    const th = T["h" + k], tf = T["f" + k];
    hindY = Math.max(hindY, needY(dog.hind.pts[0][0], [th.x, th.y], dog.hind.free) - dog.hind.pts[0][1]);
    foreY = Math.max(foreY, needY(tf.top[0], tf.carpus, dog.fore.free) - tf.top[1]);
  }
  const span = D.fore[0][0] - D.hind[0][0], pitch = Math.atan2(foreY - hindY, span);
  out.body = {rot:pitch * DEG, x:0, y:(hindY + foreY) / 2};
  for (const k of ["F", "N"]){
    { const lg = dog.hind, t = T["h" + k], top = [lg.pts[0][0], lg.pts[0][1] + hindY];
      const fold = t.stance ? 0 : -0.55 * Math.sin(Math.PI * t.s); /* hock flexes in swing (metatarsus swings forward-up) */
      const sol = solveHind(lg, top, [t.x, t.y], fold);
      Object.assign(out, legRig(lg, ["hip" + k, "shank" + k, "meta" + k, "htoe" + k], sol, top, t.stance ? 0 : -0.35 * Math.sin(Math.PI * t.s) * DEG));
      dbg["h" + k] = {target:[t.x, t.y], sol, stance:t.stance}; }
    { const lg = dog.fore, t = T["f" + k], top = [t.top[0], t.top[1] + foreY];
      const sol = solveFore(lg, top, [t.x, t.y], t.pastern);
      Object.assign(out, legRig(lg, ["sh" + k, "fore" + k, "past" + k, "ftoe" + k], sol, top, t.stance ? 0 : -0.5 * Math.sin(Math.PI * t.s) * DEG));
      dbg["f" + k] = {target:[t.x, t.y], sol, stance:t.stance}; }
  }
  return {joints:out, debug:dbg, hindY, foreY, pitch};
}

const IK2D = {twoBone, jointDeg, leg, solveHind, solveFore, GAITS, LEGS, blendGait, strideFor, legPhase, pawTarget, girdles,
  SecondOrder, mulberry32, noise1, legRig, HERO2, LIMITS, makeDog, freeReach, pose, wrap, DEG};
if (typeof module !== "undefined") module.exports = IK2D;
