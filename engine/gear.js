/* ================= Den Gear (GEAR) =================
   Armor pieces for the dingo, generated from the Smithy's own materials and drawn as rig parts on his joints.
   Every piece is a short code like a weapon: band material, fitting metal, style, gem, rarity, infusion. Rules shared by every piece:
   decoration spaced evenly along the piece, the gem centred, the hardware where it fastens, the Smithy's brush (outline, base, shade, light).
   GEAR.init(SMITHY) borrows the Smithy's palettes; GEAR.KINDS lists the pieces in layer order; GEAR.decode(code) rebuilds one.
   Parts are plain rig part specs (paths in the 62×38 drawing space) so RIG.attach draws them on the hero. */
const GEAR = (() => {
"use strict";
let P = null, RARS = [], INFS = [];
function init(S){ P = S.PAL; RARS = S.RARS; INFS = S.INFS; }
/* seeded dice of our own: a generator must never touch the game's Math.random */
function rngOf(seed){ let h = 1779033703 ^ String(seed).length; for (let i = 0; i < String(seed).length; i++){ h = Math.imul(h ^ String(seed).charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

/* ---------- the collar: one band that sits over the hero's own, around the neck line of the drawing ----------
   Drawn the Smithy's way: an outline, a base, the lower half in shade, a light strip on the upper edge; gems are the Smithy's diamond with a
   dark rim and a glint, always centred on the band (the centre stud gives way to it); the fitting lives at the throat. The hero's base collar runs (38.9,10) → (46.6,14.1); this traces the same neck a touch wider. */
const STYLES = [
  {k:"plain", n:"Collar", fit:"buckle"},
  {k:"studded", n:"Studded Collar", fit:"buckle", studs:5},
  {k:"tag", n:"Tag Collar", fit:"tag"},
  {k:"rope", n:"Rope Collar", fit:"knot"},
];
/* the band's centreline as a cubic, so studs (and later rings) can be spaced evenly and centred (symmetry reads at any size) */
const BAND = [[39.9, 9.2], [42.85, 10.7], [44.75, 12.8], [45.9, 15]];
function bandAt(t){ const [a, b, c, d] = BAND, u = 1 - t; const x = u*u*u*a[0] + 3*u*u*t*b[0] + 3*u*t*t*c[0] + t*t*t*d[0], y = u*u*u*a[1] + 3*u*u*t*b[1] + 3*u*t*t*c[1] + t*t*t*d[1];
  const dx = 3*u*u*(b[0]-a[0]) + 6*u*t*(c[0]-b[0]) + 3*t*t*(d[0]-c[0]), dy = 3*u*u*(b[1]-a[1]) + 6*u*t*(c[1]-b[1]) + 3*t*t*(d[1]-c[1]); const m = Math.hypot(dx, dy) || 1;
  return {x, y, tx:dx / m, ty:dy / m, nx:dy / m, ny:-dx / m}; } /* n points up and away from the neck */
function along(n, t0 = .1, t1 = .82){ const out = []; for (let i = 0; i < n; i++) out.push(bandAt(t0 + (t1 - t0) * (n === 1 ? .5 : i / (n - 1)))); return out; }
const diamond = (x, y, r) => `M${x} ${y - r} L${x + r} ${y} L${x} ${y + r} L${x - r} ${y} Z`;
function gemParts(G, x, y, r){ return [{d:diamond(x, y, r + .28), paint:"rim"}, {d:diamond(x, y, r), paint:"gem"}, {d:`M${x} ${y} L${x + r} ${y} L${x} ${y + r} Z`, paint:"gemS", alpha:.8}, {circle:[x - r * .3, y - r * .35, r * .22], paint:"white", alpha:.9}]; }
function collar(seed, picks = {}){
  if (!P) throw new Error("GEAR.init(SMITHY) first");
  const r = rngOf(seed);
  const band = picks.band ?? Math.floor(r() * P.WRAP.length), fit = picks.fit ?? Math.floor(r() * P.FIT.length), style = picks.style ?? Math.floor(r() * STYLES.length);
  const rar = picks.rar ?? Math.min(RARS.length - 1, Math.floor(Math.pow(r(), 2.2) * RARS.length)), gem = picks.gem ?? (rar >= 3 ? 1 + Math.floor(r() * (P.GEMS.length - 1)) : 0), inf = picks.inf ?? (rar >= 2 && r() < .5 ? 1 + Math.floor(r() * (INFS.length - 1)) : 0);
  const W = P.WRAP[band], F = P.FIT[fit], S = STYLES[style], G = P.GEMS[gem], I = INFS[inf], R = RARS[rar];
  const pal = {band:W.b, bandS:W.s, bandL:W.l, bandO:W.o, fit:F.b, fitS:F.s, fitL:F.l, fitO:F.o, gem:G ? G.b : F.b, gemS:G ? G.s : F.s, gemL:G ? G.l : F.l, rim:"#1a1020", white:"#ffffff", glow:R.c, inf:I.c || R.c};
  const parts = [];
  if (rar >= 3) parts.push({d:"M38.3 10.3 L40.9 7.4 C44.1 9.3 46.3 11.9 47.6 14.4 L45 16.8 C43.7 14 41.7 11.5 38.3 10.3 Z", paint:"glow", alpha:.35});
  /* band: outline · base · shade on the lower half · light on the upper edge */
  parts.push({d:"M38.5 10.1 L40.9 7.9 C43.9 9.5 45.9 11.9 47.1 14.2 L45.1 16.3 C43.9 13.9 42 11.5 38.5 10.1 Z", paint:"bandO"});
  parts.push({d:"M38.9 10 L40.9 8.4 C43.6 9.9 45.5 11.9 46.6 14.1 L45.2 15.9 C44 13.7 42.1 11.5 38.9 10 Z", paint:"band"});
  parts.push({d:"M38.9 10 L39.9 9.2 C42.8 10.7 44.7 12.8 45.9 15.1 L45.2 15.9 C44 13.7 42.1 11.5 38.9 10 Z", paint:"bandS", alpha:.8});
  parts.push({d:"M40.3 8.9 L40.9 8.4 C43.6 9.9 45.5 11.9 46.6 14.1 L46.2 14.6 C45 12.3 43.1 10.3 40.3 8.9 Z", paint:"bandL", alpha:.6});
  if (S.k === "rope"){ parts.push({d:"M39.8 9.5 L40.3 10.5 M40.9 10.2 L41.3 11.3 M42.1 11.2 L42.5 12.4 M43.2 12.4 L43.5 13.6 M44.2 13.7 L44.4 14.9", stroke:true, paint:"bandO", sw:.45, alpha:.8}); }
  const mid = bandAt(.46), socket = [mid.x, mid.y]; /* the gem is always centred on the band (GrumpyDingo: symmetry first); the fitting stays at the throat */
  if (S.studs){ along(S.studs).forEach((q, i) => { if (G && i === (S.studs - 1) / 2) return; /* the centre stud is the gem's socket */ const {x, y} = q; parts.push({circle:[x, y, .62], paint:"fitO"}, {circle:[x, y, .45], paint:"fit"}, {circle:[x + .1, y + .15, .3], paint:"fitS", alpha:.8}, {circle:[x - .15, y - .17, .14], paint:"fitL"}); }); }
  /* the fitting at the throat, outline · base · shade · light */
  if (S.fit === "buckle"){ parts.push({d:"M44.5 14.4 L46.1 13 L47.3 14.8 L45.8 16.3 Z", paint:"fitO"}, {d:"M44.8 14.4 L46 13.4 L46.9 14.8 L45.8 15.9 Z", paint:"fit"}, {d:"M45.8 15.9 L46.9 14.8 L46.4 14.1 L45.3 15.2 Z", paint:"fitS", alpha:.8}, {d:"M44.8 14.4 L46 13.4 L46.3 13.9 L45.2 14.7 Z", paint:"fitL", alpha:.6}, {d:"M45.4 14.5 L46 14 L46.4 14.6 L45.8 15.2 Z", paint:"band"}, {d:"M45.9 13.2 L45.9 16", stroke:true, paint:"fitO", sw:.3}); }
  if (S.fit === "tag"){ parts.push({d:"M45.9 14.8 L46.6 15.3 L46 17.6 L44.4 17.2 L44.9 15.3 Z", paint:"fitO"}, {d:"M45.8 15.05 L46.3 15.45 L45.8 17.3 L44.7 17 L45.1 15.45 Z", paint:"fit"}, {d:"M45.8 15.05 L46.3 15.45 L45.8 17.3 L45.3 17.15 Z", paint:"fitS", alpha:.8}, {circle:[45.5, 15.45, .17], paint:"fitO"}); }
  if (S.fit === "knot"){ parts.push({circle:[45.9, 15.1, 1.05], paint:"bandO"}, {circle:[45.9, 15.1, .8], paint:"band"}, {d:"M44.85 15.1 A1.05 1.05 0 0 0 46.95 15.1 Z", paint:"bandS", alpha:.8}, {circle:[45.6, 14.8, .22], paint:"bandL", alpha:.8}, {d:"M45.6 16 L45.1 17.7 M46.2 16 L46.6 17.6", stroke:true, paint:"bandO", sw:.55}); }
  if (G) parts.push(...gemParts(G, socket[0], socket[1], S.fit === "tag" ? .42 : .52));
  if (I.c){ parts.push({d:"M38.9 10 L40.9 8.4 C43.6 9.9 45.5 11.9 46.6 14.1", stroke:true, paint:"inf", sw:.35, alpha:.9}); }
  const name = (R.adj ? R.adj + " " : "") + (I.pre ? I.pre + " " : "") + W.n + " " + S.n + (G ? " with " + G.n : "") + (I.suf ? " " + I.suf : "");
  const code = "k" + [band, fit, style, gem, rar, inf].map(n => n.toString(36)).join("");
  return {kind:"collar", code, name, rk:R.k, rar, parts, palette:pal, joint:"body", picks:{band:W.n, fitting:F.n, style:S.n, gem:G ? G.n : "none", rarity:R.n, infusion:I.n}};
}
/* ---------- the tail guard: a wrap, a sleeve or plates along the tail, under the rings ----------
   The tail hangs from the rump (14.5,17.5) to the tip (10.1,30.4), drawn in the "tail" joint so the guard wags with it.
   Same rules as the collar: even spacing along the centreline, the gem centred, the Smithy's brush. */
const TAIL = [[14.4, 17.6], [10.8, 20.6], [9.3, 25.4], [10.1, 30.4]];
function tailAt(t){ const [a, b, c, d] = TAIL, u = 1 - t; const x = u*u*u*a[0] + 3*u*u*t*b[0] + 3*u*t*t*c[0] + t*t*t*d[0], y = u*u*u*a[1] + 3*u*u*t*b[1] + 3*u*t*t*c[1] + t*t*t*d[1];
  const dx = 3*u*u*(b[0]-a[0]) + 6*u*t*(c[0]-b[0]) + 3*t*t*(d[0]-c[0]), dy = 3*u*u*(b[1]-a[1]) + 6*u*t*(c[1]-b[1]) + 3*t*t*(d[1]-c[1]); const m = Math.hypot(dx, dy) || 1;
  return {x, y, tx:dx / m, ty:dy / m, nx:dy / m, ny:-dx / m, w: 1.4 - t * .3}; } /* w = the tail's half width there (1.4 at the rump, 1.1 at the tip) */
const f1 = v => (+v).toFixed(2);
/* a band across the tail at t: a quad of half-length len along the tail and the tail's width plus `pad` across it */
function tailBand(t0, t1, pad){ const n = 7, L = [], R = []; for (let i = 0; i <= n; i++){ const q = tailAt(t0 + (t1 - t0) * i / n), w = q.w + pad; L.push([q.x + q.nx * w, q.y + q.ny * w]); R.push([q.x - q.nx * w, q.y - q.ny * w]); }
  return "M" + L.map(p => p.map(f1).join(" ")).join(" L") + " L" + R.reverse().map(p => p.map(f1).join(" ")).join(" L") + " Z"; }
function tailHalf(t0, t1, pad, upper){ const n = 7, L = [], R = []; for (let i = 0; i <= n; i++){ const q = tailAt(t0 + (t1 - t0) * i / n), w = q.w + pad; const sgn = upper ? 1 : -1; L.push([q.x + q.nx * w * sgn, q.y + q.ny * w * sgn]); R.push([q.x, q.y]); }
  return "M" + L.map(p => p.map(f1).join(" ")).join(" L") + " L" + R.reverse().map(p => p.map(f1).join(" ")).join(" L") + " Z"; }
const TAIL_STYLES = [
  {k:"sleeve", n:"Tail Sleeve", sleeve:[.3 - .075, .92 + .075]}, /* covers the same length as the guard, plate edge to plate edge */
  {k:"plated", n:"Tail Guard", plates:4, len:.075, hard:true},
];
/* ring slots: the three gaps between the guard's four plates. Tail rings sit here (one centred, two outer, three all), whatever the guard. */
const RING_SLOTS = [.3 + .62 / 6, .3 + .62 / 2, .3 + .62 * 5 / 6];
function tailguard(seed, picks = {}){
  if (!P) throw new Error("GEAR.init(SMITHY) first");
  const r = rngOf(seed);
  const band = picks.band ?? Math.floor(r() * P.WRAP.length), fit = picks.fit ?? Math.floor(r() * P.FIT.length), style = picks.style ?? Math.floor(r() * TAIL_STYLES.length);
  const rar = picks.rar ?? Math.min(RARS.length - 1, Math.floor(Math.pow(r(), 2.2) * RARS.length)), gem = picks.gem ?? (rar >= 3 ? 1 + Math.floor(r() * (P.GEMS.length - 1)) : 0), inf = picks.inf ?? (rar >= 2 && r() < .5 ? 1 + Math.floor(r() * (INFS.length - 1)) : 0);
  const W = P.WRAP[band], F = P.FIT[fit], S = TAIL_STYLES[style], G = P.GEMS[gem], I = INFS[inf], R = RARS[rar];
  const M = {b:W.b, s:W.s, l:W.l, o:W.o}; /* the band is the material of the whole piece; the fitting is the accent (trim, rivets, plate edges) */
  const pal = {m:M.b, mS:M.s, mL:M.l, mO:M.o, u:W.s, uS:W.o, uO:W.o, fit:F.b, fitS:F.s, fitL:F.l, fitO:F.o, gem:G ? G.b : F.b, gemS:G ? G.s : F.s, gemL:G ? G.l : F.l, rim:"#1a1020", white:"#ffffff", glow:R.c, inf:I.c || R.c};
  const parts = [], piece = (t0, t1, pad) => { parts.push({d:tailBand(t0, t1, pad + .32), paint:"mO"}, {d:tailBand(t0, t1, pad), paint:"m"}, {d:tailHalf(t0, t1, pad, false), paint:"mS", alpha:.8}, {d:tailHalf(t0 + (t1 - t0) * .15, t0 + (t1 - t0) * .4, pad, true), paint:"mL", alpha:.6}); };
  if (rar >= 3) parts.push({d:tailBand(.22, .96, .9), paint:"glow", alpha:.3});
  const centre = tailAt(.6);
  if (S.bands){ const T0 = .32, T1 = .9; for (let i = 0; i < S.bands; i++){ const tc = T0 + (T1 - T0) * i / (S.bands - 1); piece(tc - S.len, tc + S.len, .22); } }
  if (S.sleeve){ piece(S.sleeve[0], S.sleeve[1], .22); /* a trim at each end in the fitting metal */ [S.sleeve[0], S.sleeve[1]].forEach(t => { parts.push({d:tailBand(t - .025, t + .025, .42), paint:"fitO"}, {d:tailBand(t - .018, t + .018, .3), paint:"fit"}); }); }
  if (S.plates){ const T0 = .3, T1 = .92; parts.push({d:tailBand(T0 - S.len, T1 + S.len, .22 + .3), paint:"uO"}, {d:tailBand(T0 - S.len, T1 + S.len, .22), paint:"u"}); /* a darker strip of the same material shows in the gaps */
    for (let i = 0; i < S.plates; i++){ const tc = T0 + (T1 - T0) * i / (S.plates - 1); piece(tc - S.len, tc + S.len, .28); /* fitting accents: a metal edge along the top of each plate and a rivet in the middle */ parts.push({d:tailBand(tc - S.len, tc - S.len * .55, .28), paint:"fit"}, {d:tailBand(tc - S.len, tc - S.len * .75, .28), paint:"fitL", alpha:.6}); const q = tailAt(tc); parts.push({circle:[q.x, q.y, .3], paint:"fitO"}, {circle:[q.x, q.y, .2], paint:"fit"}, {circle:[q.x - .07, q.y - .08, .08], paint:"fitL"}); } }
  if (G){ const q = tailAt(RING_SLOTS[1]); parts.push(...gemParts(G, q.x, q.y, .5)); } /* the gem takes the middle ring slot */
  if (I.c){ parts.push({d:"M" + [.3, .45, .6, .75, .9].map(t => { const q = tailAt(t); return f1(q.x) + " " + f1(q.y); }).join(" L"), stroke:true, paint:"inf", sw:.35, alpha:.9}); }
  const name = (R.adj ? R.adj + " " : "") + (I.pre ? I.pre + " " : "") + W.n + " " + S.n + (G ? " with " + G.n : "") + (I.suf ? " " + I.suf : "");
  const code = "t" + [band, fit, style, gem, rar, inf].map(n => n.toString(36)).join("");
  return {kind:"tailguard", code, name, rk:R.k, rar, parts, palette:pal, joint:"tail", picks:{band:W.n, fitting:F.n, style:S.n, gem:G ? G.n : "none", rarity:R.n, infusion:I.n}};
}
/* ---------- tail rings: each ring is its own piece (its own metal, gem, rarity, infusion) in one of the three ring slots ----------
   code: r<slot><fitting><band><gem><rarity><infusion>; the band is the ring's material, the fitting its metal edges. */
const RING_SLOT_NAMES = [{n:"Ring 1 · near the rump"}, {n:"Ring 2 · middle"}, {n:"Ring 3 · near the tip"}];
function tailring(seed, picks = {}){
  if (!P) throw new Error("GEAR.init(SMITHY) first");
  const r = rngOf(seed);
  const slot = Math.min(2, Math.max(0, picks.slot ?? 1)), fit = picks.fit ?? Math.floor(r() * P.FIT.length), band = picks.band ?? Math.floor(r() * P.WRAP.length);
  const rar = picks.rar ?? Math.min(RARS.length - 1, Math.floor(Math.pow(r(), 2.2) * RARS.length)), gem = picks.gem ?? (rar >= 3 ? 1 + Math.floor(r() * (P.GEMS.length - 1)) : 0), inf = picks.inf ?? (rar >= 2 && r() < .5 ? 1 + Math.floor(r() * (INFS.length - 1)) : 0);
  const F = P.FIT[fit], W = P.WRAP[band], G = P.GEMS[gem], I = INFS[inf], R = RARS[rar];
  const pal = {m:W.b, mS:W.s, mL:W.l, mO:W.o, fit:F.b, fitL:F.l, fitO:F.o, gem:G ? G.b : F.b, gemS:G ? G.s : F.s, gemL:G ? G.l : F.l, rim:"#1a1020", white:"#ffffff", glow:R.c, inf:I.c || R.c};
  const parts = [], len = .032, pad = .5, t = RING_SLOTS[slot], q = tailAt(t);
  if (rar >= 3) parts.push({d:tailBand(t - len * 2, t + len * 2, pad + .5), paint:"glow", alpha:.3});
  parts.push({d:tailBand(t - len, t + len, pad + .3), paint:"mO"}, {d:tailBand(t - len, t + len, pad), paint:"m"}, {d:tailHalf(t - len, t + len, pad, false), paint:"mS", alpha:.8}, {d:tailHalf(t - len * .6, t + len * .2, pad, true), paint:"mL", alpha:.6});
  /* fitting accent: a metal edge on each side of the ring */
  parts.push({d:tailBand(t - len, t - len * .6, pad), paint:"fit"}, {d:tailBand(t + len * .6, t + len, pad), paint:"fit"});
  if (I.c) parts.push({d:tailBand(t - len * 1.4, t - len * .9, pad + .05), paint:"inf", alpha:.9});
  if (G) parts.push(...gemParts(G, q.x, q.y, .42));
  const name = (R.adj ? R.adj + " " : "") + (I.pre ? I.pre + " " : "") + W.n + " Tail Ring" + (G ? " with " + G.n : "") + (I.suf ? " " + I.suf : "");
  const code = "r" + [slot, fit, band, gem, rar, inf].map(n => n.toString(36)).join("");
  return {kind:"ring" + (slot + 1), slot, code, name, rk:R.k, rar, parts, palette:pal, joint:"tail", picks:{slot:RING_SLOT_NAMES[slot].n, band:W.n, fitting:F.n, gem:G ? G.n : "none", rarity:R.n, infusion:I.n}};
}
const ringKind = i => ({n:"Tail ring " + (i + 1), make:(seed, picks = {}) => tailring(seed, Object.assign({}, picks, {slot:i})), styles:[RING_SLOT_NAMES[i]], code:"r", noStyle:true, group:"Tail rings", slot:i});
/* ---------- the body armor: the base layer. A silhouette of the body from just under the collar, over the back to the rump, down the
   sides to a hem that stays ABOVE the leg roots (hips at y17, shoulders at y15), so the legs come out from under it and swing free.
   Its front-top edge IS the collar's lower edge, so the collar sits on it flush. Drawn in the body joint, first of everything;
   the near legs are drawn after the body, so they cross the armor the way legs cross a coat. (Reference: a dog in mail barding.) */
const ARMOR_STYLES = [
  {k:"hide", n:"Hide Armor"},
  {k:"scale", n:"Scale Armor", scales:true},
  {k:"plated", n:"Plated Armor", plates:true},
];
/* the silhouette: collar line → back → rump → hem → chest → back up the collar line */
const ARM_O = "M38.4 10.3 C35.6 11.4 30 10.6 25 10.9 C20 11.2 16.2 11.8 14.0 14.6 C12.8 16.2 12.8 18.2 13.9 19.6 C22 20.5 34 20.5 43.2 19.8 L45.6 16.0 C44.2 13.5 42.1 11.3 38.4 10.3 Z";
const ARM   = "M38.8 10.8 C35.8 11.8 30 11.0 25 11.3 C20.2 11.6 16.6 12.2 14.5 14.9 C13.4 16.3 13.4 18.0 14.4 19.2 C22 20.1 34 20.1 42.9 19.4 L45.1 16.0 C43.9 13.7 42 11.6 38.8 10.8 Z";
const ARM_S = "M14.4 19.2 C22 20.1 34 20.1 42.9 19.4 L44.0 17.5 C34 18.3 22 18.3 13.6 17.5 C13.5 18.2 13.8 18.8 14.4 19.2 Z";
const ARM_L = "M38.8 10.8 C35.8 11.8 30 11.0 25 11.3 C20.2 11.6 16.6 12.2 14.5 14.9 L15.3 15.2 C17.3 12.9 20.6 12.4 25 12.1 C30 11.8 35.6 12.6 38.5 11.6 Z";
/* hem line (for stitching, scallops) and a mid line */
const HEM = "M14.4 19.2 C22 20.1 34 20.1 42.9 19.4";
const MID = "M14.0 16.3 C22 17.1 34 17.1 43.6 16.4";
function armor(seed, picks = {}){
  if (!P) throw new Error("GEAR.init(SMITHY) first");
  const r = rngOf(seed);
  const band = picks.band ?? Math.floor(r() * P.WRAP.length), fit = picks.fit ?? Math.floor(r() * P.FIT.length), style = picks.style ?? Math.floor(r() * ARMOR_STYLES.length);
  const rar = picks.rar ?? Math.min(RARS.length - 1, Math.floor(Math.pow(r(), 2.2) * RARS.length)), gem = picks.gem ?? (rar >= 3 ? 1 + Math.floor(r() * (P.GEMS.length - 1)) : 0), inf = picks.inf ?? (rar >= 2 && r() < .5 ? 1 + Math.floor(r() * (INFS.length - 1)) : 0);
  const W = P.WRAP[band], F = P.FIT[fit], S = ARMOR_STYLES[style], G = P.GEMS[gem], I = INFS[inf], R = RARS[rar];
  const pal = {m:W.b, mS:W.s, mL:W.l, mO:W.o, fit:F.b, fitS:F.s, fitL:F.l, fitO:F.o, gem:G ? G.b : F.b, gemS:G ? G.s : F.s, gemL:G ? G.l : F.l, rim:"#1a1020", white:"#ffffff", glow:R.c, inf:I.c || R.c};
  const parts = [];
  if (rar >= 3) parts.push({d:ARM_O, paint:"glow", alpha:.3});
  parts.push({d:ARM_O, paint:"mO"}, {d:ARM, paint:"m"}, {d:ARM_S, paint:"mS", alpha:.8}, {d:ARM_L, paint:"mL", alpha:.6});
  if (S.scales){ /* rows of scallops along the body, in the band material with the fitting as each scale's edge */
    for (let row = 0; row < 3; row++){ const y0 = 13.2 + row * 2.3; let d = ""; for (let x = 15 + (row % 2) * 1.3; x < 43; x += 2.6){ const yy = y0 + (x - 14) * .02; d += `M${f1(x)} ${f1(yy)} A1.3 1.3 0 0 0 ${f1(x + 2.6)} ${f1(yy)} `; }
      parts.push({d, stroke:true, paint:"mO", sw:.55, alpha:.6}, {d, stroke:true, paint:"fit", sw:.3, alpha:.9}); } }
  if (S.plates){ /* a shoulder plate and a chest plate in the fitting metal, riveted, like the reference */
    const sh = "M32.4 13.2 C34.6 12.0 37.2 12.6 37.9 14.6 C38.2 16.4 36.6 17.8 34.4 17.6 C32.4 17.3 31.4 15.1 32.4 13.2 Z";
    parts.push({d:sh, paint:"fitO"}, {d:"M32.8 13.5 C34.8 12.5 37.0 13.0 37.5 14.7 C37.8 16.1 36.4 17.3 34.5 17.1 C32.9 16.9 32.0 15.0 32.8 13.5 Z", paint:"fit"}, {d:"M32.1 15.4 C32.4 16.6 33.2 17.3 34.5 17.1 C36.4 17.3 37.8 16.1 37.5 14.7 L37.0 15.2 C36.5 16.3 35.5 16.9 34.4 16.8 C33.3 16.7 32.6 16.1 32.1 15.4 Z", paint:"fitS", alpha:.8}, {d:"M32.8 13.5 C34.8 12.5 37.0 13.0 37.5 14.7 L36.9 14.6 C36.2 13.6 34.6 13.2 33.2 14.0 Z", paint:"fitL", alpha:.6});
    [[33.3, 14.6], [36.4, 14.3], [34.8, 16.4]].forEach(([x, y]) => parts.push({circle:[x, y, .26], paint:"fitO"}, {circle:[x, y, .17], paint:"fit"}, {circle:[x - .05, y - .06, .07], paint:"fitL"}));
    const ch = "M40.2 13.6 C42.2 13.4 43.9 14.6 44.9 16.2 L43.4 19.0 C42.0 18.7 40.6 18.0 39.6 16.9 C39.0 15.7 39.3 14.4 40.2 13.6 Z";
    parts.push({d:ch, paint:"fitO"}, {d:"M40.4 14.0 C42.1 13.8 43.6 14.9 44.4 16.3 L43.2 18.6 C42.0 18.3 40.8 17.7 39.9 16.7 C39.4 15.7 39.6 14.6 40.4 14.0 Z", paint:"fit"}, {d:"M39.9 16.7 C40.8 17.7 42.0 18.3 43.2 18.6 L43.8 17.5 C42.6 17.2 41.3 16.7 40.4 15.8 Z", paint:"fitS", alpha:.8}, {d:"M40.4 14.0 C42.1 13.8 43.6 14.9 44.4 16.3 L43.8 16.3 C43.1 15.3 41.9 14.5 40.5 14.6 Z", paint:"fitL", alpha:.6});
    [[41.0, 15.0], [43.3, 16.3], [41.6, 17.5]].forEach(([x, y]) => parts.push({circle:[x, y, .24], paint:"fitO"}, {circle:[x, y, .16], paint:"fit"}, {circle:[x - .05, y - .05, .06], paint:"fitL"})); }
  /* every style: the fitting binds the hem, and the collar line; a girth strap in the fitting colour behind the shoulder */
  parts.push({d:HEM, stroke:true, paint:"fit", sw:.4, alpha:.9}, {d:"M30.6 11.0 L30.2 20.0", stroke:true, paint:"fitO", sw:.9, alpha:.7}, {d:"M30.6 11.0 L30.2 20.0", stroke:true, paint:"fit", sw:.55});
  parts.push({circle:[30.4, 13.3, .3], paint:"fitO"}, {circle:[30.4, 13.3, .2], paint:"fit"}, {circle:[30.3, 17.6, .3], paint:"fitO"}, {circle:[30.3, 17.6, .2], paint:"fit"});
  if (G) parts.push(...gemParts(G, S.plates ? 42.3 : 42.6, S.plates ? 16.2 : 16.4, .5)); /* the gem rides the chest, where the near leg never covers it */
  if (I.c) parts.push({d:HEM, stroke:true, paint:"inf", sw:.3, alpha:.9});
  const name = (R.adj ? R.adj + " " : "") + (I.pre ? I.pre + " " : "") + W.n + " " + S.n + (G ? " with " + G.n : "") + (I.suf ? " " + I.suf : "");
  const code = "c" + [band, fit, style, gem, rar, inf].map(n => n.toString(36)).join("");
  return {kind:"armor", code, name, rk:R.k, rar, parts, palette:pal, joint:"body", picks:{band:W.n, fitting:F.n, style:S.n, gem:G ? G.n : "none", rarity:R.n, infusion:I.n}};
}
/* ---------- registry: kinds in LAYER order (what goes on first is first) ---------- */
const KINDS = {armor:{n:"Body armor", make:armor, styles:ARMOR_STYLES, code:"c"}, tailguard:{n:"Tail guard", make:tailguard, styles:TAIL_STYLES, code:"t"}, ring1:ringKind(0), ring2:ringKind(1), ring3:ringKind(2), collar:{n:"Collar", make:collar, styles:STYLES, code:"k"}};
function decode(code){ if (!code) return null; let K = Object.values(KINDS).find(k => k.code === code[0]); if (!K) return null; if (code[0] === "r"){ K = KINDS["ring" + (Math.min(2, parseInt(code[1], 36) || 0) + 1)]; const v = code.slice(1).split("").map(c => parseInt(c, 36) || 0), cl = (x, n) => Math.min(n - 1, Math.max(0, x)); return K.make(code, {fit:cl(v[1], P.FIT.length), band:cl(v[2], P.WRAP.length), gem:cl(v[3], P.GEMS.length), rar:cl(v[4], RARS.length), inf:cl(v[5], INFS.length)}); } const v = code.slice(1).split("").map(c => parseInt(c, 36) || 0), cl = (x, n) => Math.min(n - 1, Math.max(0, x)); return K.make(code, {band:cl(v[0], P.WRAP.length), fit:cl(v[1], P.FIT.length), style:cl(v[2], K.styles.length), gem:cl(v[3], P.GEMS.length), rar:cl(v[4], RARS.length), inf:cl(v[5], INFS.length)}); }
return {init, collar, tailguard, tailring, armor, decode, KINDS, STYLES, TAIL_STYLES, RING_SLOT_NAMES, RING_SLOTS, tailAt, get PAL(){ return P; }, get RARS(){ return RARS; }, get INFS(){ return INFS; }};
})();
if (typeof module !== "undefined") module.exports = GEAR;
