/* ================= Den Gear (GEAR) =================
   Armor pieces for the dingo, generated from the Smithy's own materials and drawn as rig parts on his joints.
   Every piece is a short code like a weapon: band material, fitting metal, style, gem, rarity, infusion. Rules shared by every piece:
   decoration spaced evenly along the piece, the gem centred, the hardware where it fastens, the Smithy's brush (outline, base, shade, light).
   GEAR.init(SMITHY) borrows the Smithy's palettes; GEAR.KINDS lists the pieces in layer order; GEAR.decode(code) rebuilds one.
   Parts are plain rig part specs (paths in the 62×38 drawing space) so RIG.attach draws them on the hero. */
const GEAR = (() => {
"use strict";
let P = null, RARS = [], INFS = [];
/* Oak and Dark wood are also fittings (pegs, toggles, plate edges, rings), appended at the END so every existing code keeps its meaning. Done here, not in the Smithy: the game's own lists and the weapons are untouched. */
function init(S){ const W = S.PAL.WRAP, wood = n => W.find(w => w.n === n); P = Object.assign({}, S.PAL, {FIT:[...S.PAL.FIT, wood("Oak"), wood("Dark wood")]}); RARS = S.RARS; INFS = S.INFS; }
/* seeded dice of our own: a generator must never touch the game's Math.random */
function rngOf(seed){ let h = 1779033703 ^ String(seed).length; for (let i = 0; i < String(seed).length; i++){ h = Math.imul(h ^ String(seed).charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

/* ---------- connection points: where each dog's neck (and later tail, paws and hem) sits ----------
   A piece is drawn against these, never against one dog's numbers, so the same collar fits every dog and a new dog is one more row.
   collar: the footprint of the dog's own collar band, as its two edges R (rear, upper) and F (front, lower), each a cubic running crest → throat.
   A gear collar covers exactly this footprint, so it sits flush, at the dog's own angle, and never drapes past the neck. Numbers are in each rig's 62×38 space
   (hero: its `band`; hero2: its `band2`). */
/* line weights: the style sheet. Visible outline widths; an outline is drawn as a stroke UNDER its fill at twice this width, so it sits outside the shape.
   contour = a piece's silhouette; interior = a part inside a piece (stud, buckle frame); detail = fine marks. One outline per shape, round joins, nothing else. */
const LINE = {contour:.32, interior:.22, detail:.14};
const MOUNTS = {
  hero:  {collar:{R:[[40.9, 8.4], [43.6, 9.9], [45.5, 11.9], [46.6, 14.1]], F:[[38.9, 10], [42.1, 11.5], [44, 13.7], [45.2, 15.9]]},
          tail:{kind:"bezier", c:[[14.4, 17.6], [10.8, 20.6], [9.3, 25.4], [10.1, 30.4]], w:[2.8, 2.2], seat:[.225, .995], plates:4, gap:.0567, ring:.9, light:1}},
  hero2: {collar:{R:[[40.73, 7.81], [43.15, 8.79], [45.23, 10.26], [46.97, 12.22]], F:[[39.60, 9.41], [42.02, 10.39], [44.10, 11.86], [45.83, 13.82]]}, /* 35.3° (GrumpyDingo's red line): tools/lens/place_band.py */
          tail:{kind:"catmull", pts:[[23.4, 13.6], [19.6, 14.6], [15.6, 14.6], [12.2, 13.0], [10.2, 10.4], [9.8, 7.8], [11.0, 6.2]], w:[3.8, 1.8], seat:[.29, .92], plates:4, gap:.043, ring:.95, light:-1}} /* seat: from where the tail comes out from behind the rump (the body draws over the tail root, so it is hidden until about .29) round the whole hook, leaving the tip tuft bare. gap: thin, so a ring (ring = its width in units) sits across it and overlaps the plate edges a little */,
};
/* tail: the dog's tail centreline (kind "bezier": one cubic c, t is the curve parameter; kind "catmull": a Catmull-Rom curve through pts, t is the fraction of ARC LENGTH, as in the fit sheet),
   w = the tail's full width at the root and the tip, seat = the stretch of the tail the guard covers, plates and gap = the guard's links (gap as a fraction of the tail's length).
   THE SPACING RULE (GrumpyDingo, Oct 4): the gaps between the guard's plates ARE the ring slots. Rings are placed from guardLayout(), never from a separate number. light = which side of the tail catches the light (+1 or -1). */
/* BEGIN COMPILED (tools/lens/compile_mounts.py writes this; do not hand-edit) */
const COMPILED = {
  hero: {collar:{base:"M39.30 9.69 L39.25 9.74 L39.22 9.79 L39.19 9.85 L39.18 9.91 L39.18 9.97 L39.19 10.03 L39.22 10.09 L39.28 10.17 L39.35 10.22 L39.70 10.41 L40.16 10.66 L40.59 10.93 L41.00 11.20 L41.39 11.48 L41.77 11.77 L42.13 12.07 L42.47 12.38 L42.80 12.69 L43.11 13.00 L43.40 13.32 L43.68 13.65 L43.95 13.98 L44.20 14.32 L44.44 14.65 L44.77 15.15 L44.81 15.20 L44.86 15.24 L44.95 15.27 L45.04 15.28 L45.13 15.26 L45.19 15.23 L45.24 15.19 L45.61 14.71 L45.90 14.38 L46.19 14.08 L46.30 13.98 L46.33 13.93 L46.36 13.87 L46.38 13.78 L46.38 13.72 L46.35 13.63 L46.10 13.20 L45.89 12.87 L45.55 12.39 L45.18 11.91 L44.91 11.59 L44.50 11.14 L44.20 10.84 L43.74 10.40 L43.41 10.12 L43.07 9.84 L42.54 9.44 L42.17 9.18 L41.78 8.93 L41.39 8.68 L41.02 8.47 L40.97 8.44 L40.91 8.43 L40.84 8.43 L40.78 8.44 L40.72 8.46 L40.65 8.51 L39.77 9.29 Z", shade:"M39.81 9.25 L39.08 9.87 L39.06 9.91 L39.05 9.97 L39.06 10.02 L39.07 10.05 L39.11 10.10 L39.70 10.40 L40.15 10.66 L40.59 10.93 L41.00 11.20 L41.39 11.48 L41.77 11.77 L42.13 12.07 L42.47 12.38 L42.80 12.69 L43.11 13.00 L43.40 13.33 L43.82 13.82 L44.07 14.15 L44.32 14.48 L44.55 14.82 L44.89 15.36 L44.94 15.39 L45.00 15.41 L45.05 15.40 L45.08 15.39 L45.13 15.35 L45.33 15.07 L45.63 14.68 L45.65 14.64 L45.66 14.61 L45.65 14.58 L45.64 14.53 L45.38 14.10 L45.16 13.76 L44.81 13.27 L44.56 12.94 L44.16 12.46 L43.87 12.15 L43.42 11.69 L43.10 11.39 L42.76 11.09 L42.41 10.80 L42.05 10.52 L41.67 10.25 L41.27 9.98 L40.86 9.73 L40.43 9.48 L39.96 9.23 L39.93 9.23 L39.89 9.22 L39.86 9.23 Z", light:"M40.48 8.66 L40.46 8.69 L40.46 8.72 L40.47 8.75 L40.49 8.78 L40.95 9.04 L41.36 9.29 L41.76 9.54 L42.14 9.80 L42.51 10.07 L42.87 10.35 L43.21 10.63 L43.54 10.92 L43.85 11.22 L44.29 11.67 L44.57 11.98 L44.97 12.46 L45.21 12.78 L45.56 13.27 L45.77 13.60 L46.06 14.09 L46.08 14.10 L46.11 14.11 L46.13 14.11 L46.16 14.10 L46.34 13.94 L46.36 13.89 L46.35 13.85 L46.22 13.62 L46.03 13.29 L45.81 12.96 L45.59 12.63 L45.23 12.15 L44.84 11.68 L44.42 11.22 L43.97 10.78 L43.66 10.49 L43.33 10.20 L42.99 9.92 L42.45 9.52 L42.08 9.26 L41.69 9.01 L41.08 8.64 L40.78 8.47 L40.73 8.46 L40.69 8.47 Z"}},
  hero2: {collar:{base:"M39.96 9.08 L39.92 9.13 L39.88 9.21 L39.87 9.27 L39.87 9.33 L39.88 9.40 L39.90 9.45 L39.95 9.53 L40.00 9.57 L40.06 9.60 L40.58 9.84 L40.94 10.02 L41.29 10.21 L41.64 10.40 L41.98 10.60 L42.32 10.81 L42.65 11.02 L42.97 11.25 L43.45 11.60 L43.76 11.84 L44.07 12.09 L44.37 12.35 L44.66 12.62 L44.95 12.89 L45.23 13.18 L45.55 13.51 L45.62 13.57 L45.71 13.60 L45.77 13.61 L45.83 13.61 L45.89 13.59 L45.95 13.57 L46.00 13.53 L46.04 13.48 L46.08 13.40 L46.15 13.15 L46.27 12.79 L46.42 12.46 L46.61 12.07 L46.63 12.01 L46.63 11.95 L46.62 11.89 L46.59 11.83 L46.54 11.75 L46.23 11.43 L45.94 11.15 L45.50 10.75 L45.20 10.49 L44.90 10.24 L44.58 10.00 L44.27 9.76 L43.94 9.53 L43.61 9.31 L43.11 9.00 L42.77 8.80 L42.25 8.51 L41.89 8.33 L41.35 8.08 L41.23 8.02 L41.17 8.01 L41.10 8.01 L41.04 8.02 L40.98 8.04 L40.90 8.10 L40.63 8.40 L40.37 8.67 Z", shade:"M40.11 8.94 L39.77 9.26 L39.75 9.30 L39.74 9.36 L39.75 9.41 L39.76 9.44 L39.78 9.46 L39.81 9.49 L40.40 9.76 L40.76 9.93 L41.12 10.11 L41.47 10.30 L41.98 10.60 L42.32 10.81 L42.81 11.13 L43.13 11.36 L43.45 11.60 L43.76 11.84 L44.22 12.22 L44.51 12.48 L44.81 12.76 L45.09 13.04 L45.37 13.32 L45.79 13.77 L45.84 13.79 L45.90 13.80 L45.96 13.78 L46.01 13.74 L46.04 13.68 L46.05 13.52 L46.15 13.16 L46.23 12.93 L46.23 12.88 L46.23 12.85 L46.20 12.80 L45.94 12.52 L45.52 12.09 L45.23 11.82 L44.93 11.55 L44.63 11.29 L44.33 11.04 L44.02 10.80 L43.70 10.56 L43.38 10.33 L42.88 10.01 L42.55 9.80 L42.21 9.60 L41.86 9.41 L41.33 9.13 L40.79 8.88 L40.44 8.73 L40.41 8.72 L40.36 8.72 L40.33 8.73 L40.29 8.76 Z", light:"M40.83 8.32 L41.28 8.52 L41.64 8.69 L41.99 8.87 L42.34 9.06 L42.69 9.26 L43.03 9.46 L43.36 9.67 L43.69 9.89 L44.17 10.24 L44.48 10.48 L44.79 10.73 L45.10 10.98 L45.54 11.38 L45.83 11.65 L46.11 11.94 L46.41 12.25 L46.45 12.27 L46.48 12.27 L46.51 12.25 L46.53 12.23 L46.63 12.05 L46.64 12.02 L46.63 11.99 L46.45 11.80 L46.17 11.51 L45.88 11.24 L45.59 10.97 L45.14 10.57 L44.84 10.32 L44.53 10.08 L44.21 9.84 L43.89 9.61 L43.56 9.39 L43.23 9.18 L42.89 8.98 L42.54 8.78 L42.19 8.59 L41.84 8.41 L41.48 8.24 L41.02 8.03 L40.98 8.03 L40.94 8.05 L40.81 8.20 L40.80 8.22 L40.79 8.26 L40.81 8.31 Z"}}
};
/* END COMPILED */
const mountOf = (rigId, what) => { const m = MOUNTS[rigId || "hero"]; if (!m || !m[what]) throw new Error("no " + what + " mount for " + rigId); return m[what]; };

/* ---------- the collar: one band that sits over the dog's own, around the neck line of the drawing ----------
   Drawn the Smithy's way: an outline, a base, the lower half in shade, a light strip on the upper edge; gems are the Smithy's diamond with a
   dark rim and a glint, always centred on the band (the centre stud gives way to it); the fitting lives at the throat. */
const STYLES = [
  {k:"plain", n:"Collar", fit:"buckle"},
  {k:"studded", n:"Studded Collar", fit:"buckle", studs:5},
  {k:"tag", n:"Tag Collar", fit:"tag"},
  {k:"rope", n:"Rope Collar", fit:"knot"},
];
const cub = (p, t) => { const u = 1 - t; return [u*u*u*p[0][0] + 3*u*u*t*p[1][0] + 3*u*t*t*p[2][0] + t*t*t*p[3][0], u*u*u*p[0][1] + 3*u*u*t*p[1][1] + 3*u*t*t*p[2][1] + t*t*t*p[3][1]]; };
/* a point on the band: t runs crest → throat, s across it (-1 the front edge, 0 the middle, +1 the rear edge) */
function bandPt(m, t, s){ const r = cub(m.R, t), f = cub(m.F, t), k = (s + 1) / 2; return [f[0] + (r[0] - f[0]) * k, f[1] + (r[1] - f[1]) * k]; }
/* the middle of the band with its frame: t along it, n across it (toward the rear edge), hw the half width there */
function bandAt(t, m){ const [x, y] = bandPt(m, t, 0), a = bandPt(m, Math.max(0, t - .01), 0), b = bandPt(m, Math.min(1, t + .01), 0), d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, tx = (b[0] - a[0]) / d, ty = (b[1] - a[1]) / d;
  const r = cub(m.R, t), f = cub(m.F, t);
  return {x, y, tx, ty, nx:ty, ny:-tx, hw:Math.hypot(r[0] - f[0], r[1] - f[1]) / 2}; }
function along(m, n, t0 = .1, t1 = .74){ const out = []; for (let i = 0; i < n; i++) out.push(bandAt(t0 + (t1 - t0) * (n === 1 ? .5 : i / (n - 1)), m)); return out; }
function bandLine(m, s){ let d = ""; for (let i = 0; i <= 12; i++){ const p = bandPt(m, .02 + .96 * i / 12, s); d += (i ? " L" : "M") + f1(p[0]) + " " + f1(p[1]); } return d; }
const diamond = (x, y, r) => `M${x} ${y - r} L${x + r} ${y} L${x} ${y + r} L${x - r} ${y} Z`;
function gemParts(G, x, y, r){ return [{d:diamond(x, y, r + .28), paint:"rim"}, {d:diamond(x, y, r), paint:"gem"}, {d:`M${x} ${y} L${x + r} ${y} L${x} ${y + r} Z`, paint:"gemS", alpha:.8}, {circle:[x - r * .3, y - r * .35, r * .22], paint:"white", alpha:.9}]; }
function collar(seed, picks = {}, rigId = "hero"){
  if (!P) throw new Error("GEAR.init(SMITHY) first");
  const r = rngOf(seed);
  const band = picks.band ?? Math.floor(r() * P.WRAP.length), fit = picks.fit ?? Math.floor(r() * P.FIT.length), style = picks.style ?? Math.floor(r() * STYLES.length);
  const rar = picks.rar ?? Math.min(RARS.length - 1, Math.floor(Math.pow(r(), 2.2) * RARS.length)), gem = picks.gem ?? (rar >= 3 ? 1 + Math.floor(r() * (P.GEMS.length - 1)) : 0), inf = picks.inf ?? (rar >= 2 && r() < .5 ? 1 + Math.floor(r() * (INFS.length - 1)) : 0);
  const W = P.WRAP[band], F = P.FIT[fit], S = STYLES[style], G = P.GEMS[gem], I = INFS[inf], R = RARS[rar];
  const pal = {band:W.b, bandS:W.s, bandL:W.l, bandO:W.o, fit:F.b, fitS:F.s, fitL:F.l, fitO:F.o, gem:G ? G.b : F.b, gemS:G ? G.s : F.s, gemL:G ? G.l : F.l, rim:"#1a1020", white:"#ffffff", glow:R.c, inf:I.c || R.c};
  /* the same piece drawn for any dog: the code never changes, only the connection points it is drawn against */
  const build = rid => {
    const m = mountOf(rid, "collar"), parts = [];
    /* band: ONE closed shape (compiled: the dog's footprint cut to its body outline, so it is flush on the fur), one outline, then shade and light inside it */
    const C = COMPILED[rid || "hero"].collar;
    if (rar >= 3) parts.push({d:C.base, stroke:true, paint:"glow", sw:2 * (LINE.contour + .5), alpha:.35});
    parts.push({d:C.base, stroke:true, paint:"bandO", sw:2 * LINE.contour}, {d:C.base, paint:"band"}, {d:C.shade, paint:"bandS", alpha:.8}, {d:C.light, paint:"bandL", alpha:.6});
    if (S.k === "rope"){ let d = ""; for (let i = 0; i < 6; i++){ const t = .1 + i * .15, a = bandPt(m, t - .02, -.78), b = bandPt(m, t + .02, .78); d += `M${f1(a[0])} ${f1(a[1])} L${f1(b[0])} ${f1(b[1])} `; } parts.push({d, stroke:true, paint:"bandO", sw:2 * LINE.interior, alpha:.8}); }
    const mid = bandAt(.42, m), socket = [mid.x, mid.y]; /* the gem is always centred on the band (GrumpyDingo: symmetry first); the fitting stays at the throat */
    if (S.studs){ along(m, S.studs).forEach((q, i) => { if (G && i === (S.studs - 1) / 2) return; /* the centre stud is the gem's socket */ const {x, y, hw} = q, k = hw / 1.1; parts.push({circle:[x, y, .6 * k], paint:"fitO"}, {circle:[x, y, .44 * k], paint:"fit"}, {circle:[x + .1, y + .15, .3 * k], paint:"fitS", alpha:.8}, {circle:[x - .15, y - .17, .14 * k], paint:"fitL"}); }); }
    /* the fitting at the throat, outline · base · shade · light. Buckle and knot sit in the band's own frame (u along it, v across it); the tag hangs straight down */
    const q = bandAt(.83, m), k = q.hw / 1.1, at = (u, v) => [q.x + q.tx * u * k + q.nx * v * k, q.y + q.ty * u * k + q.ny * v * k], H = q.hw / k; /* H = the band's half width in the frame's units */
    const box = (u0, u1, v0, v1) => "M" + [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)].map(p => f1(p[0]) + " " + f1(p[1])).join(" L") + " Z";
    if (S.fit === "buckle"){ const o = H - .12, i = o - LINE.interior; /* the frame stays inside the band: outline at the interior weight, never poking past the band's own edge */
      parts.push({d:box(-.62, .62, -o, o), paint:"fitO"}, {d:box(-.4, .4, -i, i), paint:"fit"}, {d:box(-.4, .4, -i, -.2), paint:"fitS", alpha:.8}, {d:box(-.4, .4, i - .3, i), paint:"fitL", alpha:.6}, {d:box(-.2, .2, -(i - .45), i - .45), paint:"band"}, {line:[at(0, -(i - .35)), at(0, i - .35)], sw:LINE.interior, paint:"fitO"}); }
    if (S.fit === "tag"){ const x = q.x, y = q.y + q.hw * .5, p = (dx, dy, mm = 1) => f1(x + dx * mm) + " " + f1(y + dy * mm), plate = mm => `M${p(-.55, .5, mm)} L${p(.55, .5, mm)} L${p(.75, 2.3, mm)} L${p(0, 2.7, mm)} L${p(-.75, 2.3, mm)} Z`;
      parts.push({d:plate(1), paint:"fitO"}, {d:plate(.8), paint:"fit"}, {d:`M${p(-.6, 1.9, .8)} L${p(.6, 1.9, .8)} L${p(.75, 2.3, .8)} L${p(0, 2.7, .8)} L${p(-.75, 2.3, .8)} Z`, paint:"fitS", alpha:.8}, {circle:[x, y + .95, .17], paint:"fitO"}); }
    if (S.fit === "knot"){ const r1 = Math.min(1.05 * k, q.hw * 1.05); parts.push({circle:[q.x, q.y, r1], paint:"bandO"}, {circle:[q.x, q.y, r1 * .76], paint:"band"}, {d:`M${f1(q.x - r1 * .76)} ${f1(q.y)} A${f1(r1 * .76)} ${f1(r1 * .76)} 0 0 0 ${f1(q.x + r1 * .76)} ${f1(q.y)} Z`, paint:"bandS", alpha:.8}, {circle:[q.x - .3, q.y - .3, .22], paint:"bandL", alpha:.8}, {d:`M${f1(q.x - .3)} ${f1(q.y + 1)} L${f1(q.x - .8)} ${f1(q.y + 2.6)} M${f1(q.x + .3)} ${f1(q.y + 1)} L${f1(q.x + .7)} ${f1(q.y + 2.5)}`, stroke:true, paint:"bandO", sw:2 * LINE.contour}); }
    if (G) parts.push(...gemParts(G, socket[0], socket[1], S.fit === "tag" ? .42 : Math.min(.52, mid.hw * .5)));
    if (I.c) parts.push({d:bandLine(m, .8), stroke:true, paint:"inf", sw:.35, alpha:.9});
    parts.hides = ["collar", "tag", "tag2"]; /* and hides the dog's own collar and tag while it is worn */
    return parts;
  };
  const name = (R.adj ? R.adj + " " : "") + (I.pre ? I.pre + " " : "") + W.n + " " + S.n + (G ? " with " + G.n : "") + (I.suf ? " " + I.suf : "");
  const code = "k" + [band, fit, style, gem, rar, inf].map(n => n.toString(36)).join("");
  return {kind:"collar", code, name, rk:R.k, rar, parts:build(rigId), partsFor:build, rig:rigId, palette:pal, joint:"body", picks:{band:W.n, fitting:F.n, style:S.n, gem:G ? G.n : "none", rarity:R.n, infusion:I.n}};
}
/* ---------- the tail guard: a wrap, a sleeve or plates along the tail, under the rings ----------
   The tail hangs from the rump (14.5,17.5) to the tip (10.1,30.4), drawn in the "tail" joint so the guard wags with it.
   Same rules as the collar: even spacing along the centreline, the gem centred, the Smithy's brush. */
const f1 = v => (+v).toFixed(2);
/* a Catmull-Rom curve through pts, ten samples a segment (the same construction the rig uses for hero2's tail ribbon, so the guard hugs the real tail) */
function catmull(pts){ const P = [pts[0], ...pts, pts[pts.length - 1]], c = [];
  for (let i = 1; i < P.length - 2; i++){ const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]]; for (let k = 0; k < 10; k++){ const t = k / 10, t2 = t * t, t3 = t2 * t; c.push([0, 1].map(j => .5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } }
  c.push(pts[pts.length - 1]); return c; }
const tailCache = new WeakMap();
function tailSamples(m){ let k = tailCache.get(m); if (k) return k; const c = catmull(m.pts), s = [0]; for (let i = 1; i < c.length; i++) s.push(s[i - 1] + Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]));
  const L = s[s.length - 1]; k = {c, s:s.map(v => v / L), L}; tailCache.set(m, k); return k; }
/* a point on the tail at t, with its frame: t along it, n across (toward the side that catches the light), w the tail's half width there */
function tailAt(t, m = MOUNTS.hero.tail){
  if (m.kind === "bezier"){ const [a, b, c, d] = m.c, u = 1 - t; const x = u*u*u*a[0] + 3*u*u*t*b[0] + 3*u*t*t*c[0] + t*t*t*d[0], y = u*u*u*a[1] + 3*u*u*t*b[1] + 3*u*t*t*c[1] + t*t*t*d[1];
    const dx = 3*u*u*(b[0]-a[0]) + 6*u*t*(c[0]-b[0]) + 3*t*t*(d[0]-c[0]), dy = 3*u*u*(b[1]-a[1]) + 6*u*t*(c[1]-b[1]) + 3*t*t*(d[1]-c[1]); const n = Math.hypot(dx, dy) || 1, l = m.light || 1;
    return {x, y, tx:dx / n, ty:dy / n, nx:l * dy / n, ny:l * -dx / n, w:(m.w[0] + (m.w[1] - m.w[0]) * t) / 2}; }
  const k = tailSamples(m), n = k.c.length; t = Math.min(1, Math.max(0, t)); let i = 0; while (i < n - 2 && k.s[i + 1] < t) i++;
  const f = (t - k.s[i]) / ((k.s[i + 1] - k.s[i]) || 1), x = k.c[i][0] + (k.c[i + 1][0] - k.c[i][0]) * f, y = k.c[i][1] + (k.c[i + 1][1] - k.c[i][1]) * f;
  const a = k.c[Math.max(0, i - 1)], b = k.c[Math.min(n - 1, i + 2)], dx = b[0] - a[0], dy = b[1] - a[1], h = Math.hypot(dx, dy) || 1, l = m.light || 1, u = (i + f) / (n - 1);
  return {x, y, tx:dx / h, ty:dy / h, nx:l * dy / h, ny:l * -dx / h, w:(m.w[0] + (m.w[1] - m.w[0]) * u) / 2}; }
/* a band across the tail from t0 to t1: the tail's own width plus `pad` each side */
/* nodes only where they are needed: about one a 0.6 units along the band, never two closer than that */
function tailLength(m = MOUNTS.hero.tail){ if (m.kind === "catmull") return tailSamples(m).L; let L = 0, p = tailAt(0, m); for (let i = 1; i <= 24; i++){ const q = tailAt(i / 24, m); L += Math.hypot(q.x - p.x, q.y - p.y); p = q; } return L; }
const tailNodes = (t0, t1, m) => Math.max(1, Math.min(30, Math.ceil(Math.abs(t1 - t0) * tailLength(m) / .6)));
function tailBand(t0, t1, pad, m){ const n = tailNodes(t0, t1, m), L = [], R = []; for (let i = 0; i <= n; i++){ const q = tailAt(t0 + (t1 - t0) * i / n, m), w = q.w + pad; L.push([q.x + q.nx * w, q.y + q.ny * w]); R.push([q.x - q.nx * w, q.y - q.ny * w]); }
  return "M" + L.map(p => p.map(f1).join(" ")).join(" L") + " L" + R.reverse().map(p => p.map(f1).join(" ")).join(" L") + " Z"; }
function tailHalf(t0, t1, pad, upper, m){ const n = tailNodes(t0, t1, m), L = [], R = []; for (let i = 0; i <= n; i++){ const q = tailAt(t0 + (t1 - t0) * i / n, m), w = q.w + pad, sgn = upper ? 1 : -1; L.push([q.x + q.nx * w * sgn, q.y + q.ny * w * sgn]); R.push([q.x, q.y]); }
  return "M" + L.map(p => p.map(f1).join(" ")).join(" L") + " L" + R.reverse().map(p => p.map(f1).join(" ")).join(" L") + " Z"; }
/* the guard's links: `plates` plates over the seat with `gap` between them. The gaps are the ring slots (their centres), so the rings can never disagree with the guard. */
function guardLayout(m){ const [s0, s1] = m.seat, n = m.plates, p = (s1 - s0 - (n - 1) * m.gap) / n, plates = [], slots = [];
  for (let i = 0; i < n; i++){ const t0 = s0 + i * (p + m.gap); plates.push([t0, t0 + p]); if (i < n - 1) slots.push(t0 + p + m.gap / 2); }
  return {plates, slots, plate:p, gap:m.gap, seat:m.seat}; }
const ringSlots = rigId => guardLayout(mountOf(rigId, "tail")).slots;
const TAIL_STYLES = [
  {k:"sleeve", n:"Tail Sleeve", sleeve:true}, /* one sleeve over the whole seat */
  {k:"plated", n:"Tail Guard", plated:true, hard:true}, /* the links: plates with gaps; the gaps are the ring slots */
];
/* the old hero's ring slots, kept as the rings are not refitted yet (they are the old hero's guard gaps, from the same layout) */
const RING_SLOTS = ringSlots("hero");
function tailguard(seed, picks = {}, rigId = "hero"){
  if (!P) throw new Error("GEAR.init(SMITHY) first");
  const r = rngOf(seed);
  const band = picks.band ?? Math.floor(r() * P.WRAP.length), fit = picks.fit ?? Math.floor(r() * P.FIT.length), style = picks.style ?? Math.floor(r() * TAIL_STYLES.length);
  const rar = picks.rar ?? Math.min(RARS.length - 1, Math.floor(Math.pow(r(), 2.2) * RARS.length)), gem = picks.gem ?? (rar >= 3 ? 1 + Math.floor(r() * (P.GEMS.length - 1)) : 0), inf = picks.inf ?? (rar >= 2 && r() < .5 ? 1 + Math.floor(r() * (INFS.length - 1)) : 0);
  const W = P.WRAP[band], F = P.FIT[fit], S = TAIL_STYLES[style], G = P.GEMS[gem], I = INFS[inf], R = RARS[rar];
  const pal = {m:W.b, mS:W.s, mL:W.l, mO:W.o, u:W.s, uS:W.o, uO:W.o, fit:F.b, fitS:F.s, fitL:F.l, fitO:F.o, gem:G ? G.b : F.b, gemS:G ? G.s : F.s, gemL:G ? G.l : F.l, rim:"#1a1020", white:"#ffffff", glow:R.c, inf:I.c || R.c}; /* the band is the material of the whole piece; the fitting is the accent */
  /* the same piece drawn for any dog: the code never changes, only the tail it is drawn against */
  const build = rid => {
    const m = mountOf(rid, "tail"), lay = guardLayout(m), [s0, s1] = m.seat, parts = [], OUT = 2 * LINE.contour;
    /* one link: an outline (one, under the fill, round joins), the fill, shade on the lower half, light on the upper */
    const link = (t0, t1, pad) => { const d = tailBand(t0, t1, pad, m); parts.push({d, stroke:true, paint:"mO", sw:OUT}, {d, paint:"m"}, {d:tailHalf(t0, t1, pad, false, m), paint:"mS", alpha:.8}, {d:tailHalf(t0 + (t1 - t0) * .15, t0 + (t1 - t0) * .4, pad, true, m), paint:"mL", alpha:.6}); };
    if (rar >= 3) parts.push({d:tailBand(s0 - .02, s1 + .02, .9, m), paint:"glow", alpha:.3});
    if (S.sleeve){ link(s0, s1, .22);
      [s0, s1].forEach(t => { const d = tailBand(t - .02, t + .02, .34, m); parts.push({d, stroke:true, paint:"fitO", sw:2 * LINE.detail}, {d, paint:"fit"}); }); } /* a trim at each end in the fitting metal */
    if (S.plated){ const strip = tailBand(s0, s1, .22, m); parts.push({d:strip, stroke:true, paint:"uO", sw:OUT}, {d:strip, paint:"u"}); /* a darker strip of the same material shows in the gaps */
      lay.plates.forEach(([t0, t1]) => { link(t0, t1, .28);
        /* fitting accents: a metal edge along the leading end of each plate and a rivet in the middle */
        parts.push({d:tailBand(t0, t0 + lay.plate * .26, .28, m), paint:"fit"}, {d:tailBand(t0, t0 + lay.plate * .12, .28, m), paint:"fitL", alpha:.6});
        const q = tailAt((t0 + t1) / 2, m); parts.push({circle:[q.x, q.y, .2 + LINE.detail], paint:"fitO"}, {circle:[q.x, q.y, .2], paint:"fit"}, {circle:[q.x - .07, q.y - .08, .07], paint:"fitL"}); }); }
    if (G){ const q = tailAt(lay.slots[1], m); parts.push(...gemParts(G, q.x, q.y, .5)); } /* the gem takes the middle ring slot */
    if (I.c){ let d = ""; for (let i = 0; i <= 5; i++){ const q = tailAt(s0 + (s1 - s0) * (.08 + .84 * i / 5), m); d += (i ? " L" : "M") + f1(q.x) + " " + f1(q.y); } parts.push({d, stroke:true, paint:"inf", sw:.35, alpha:.9}); }
    return parts;
  };
  const name = (R.adj ? R.adj + " " : "") + (I.pre ? I.pre + " " : "") + W.n + " " + S.n + (G ? " with " + G.n : "") + (I.suf ? " " + I.suf : "");
  const code = "t" + [band, fit, style, gem, rar, inf].map(n => n.toString(36)).join("");
  return {kind:"tailguard", code, name, rk:R.k, rar, parts:build(rigId), partsFor:build, rig:rigId, palette:pal, joint:"tail", picks:{band:W.n, fitting:F.n, style:S.n, gem:G ? G.n : "none", rarity:R.n, infusion:I.n}};
}
/* ---------- tail rings: each ring is its own piece (its own metal, gem, rarity, infusion) in one of the three ring slots ----------
   code: r<slot><fitting><band><gem><rarity><infusion>; the band is the ring's material, the fitting its metal edges. */
const RING_SLOT_NAMES = [{n:"Ring 1 · near the rump"}, {n:"Ring 2 · middle"}, {n:"Ring 3 · near the tip"}];
function tailring(seed, picks = {}, rigId = "hero"){
  if (!P) throw new Error("GEAR.init(SMITHY) first");
  const r = rngOf(seed);
  const slot = Math.min(2, Math.max(0, picks.slot ?? 1)), fit = picks.fit ?? Math.floor(r() * P.FIT.length), band = picks.band ?? Math.floor(r() * P.WRAP.length);
  const rar = picks.rar ?? Math.min(RARS.length - 1, Math.floor(Math.pow(r(), 2.2) * RARS.length)), gem = picks.gem ?? (rar >= 3 ? 1 + Math.floor(r() * (P.GEMS.length - 1)) : 0), inf = picks.inf ?? (rar >= 2 && r() < .5 ? 1 + Math.floor(r() * (INFS.length - 1)) : 0);
  const F = P.FIT[fit], W = P.WRAP[band], G = P.GEMS[gem], I = INFS[inf], R = RARS[rar];
  /* the ring is the FITTING material (a metal, antler or wood); the BAND material is the gem's socket, shown as an empty setting when there is no gem */
  const pal = {m:F.b, mS:F.s, mL:F.l, mO:F.o, wB:W.b, wS:W.s, wL:W.l, wO:W.o, gem:G ? G.b : F.b, gemS:G ? G.s : F.s, gemL:G ? G.l : F.l, rim:"#1a1020", white:"#ffffff", glow:R.c, inf:I.c || R.c};
  /* the same ring on any dog: it sits across the guard's slot (the slot comes from the guard's own gaps), its width is the mount's ring width */
  const build = rid => {
    const m = mountOf(rid, "tail"), t = ringSlots(rid)[slot], len = (m.ring / 2) / tailLength(m), pad = .48, q = tailAt(t, m), parts = [];
    if (rar >= 3) parts.push({d:tailBand(t - len * 2, t + len * 2, pad + .5, m), paint:"glow", alpha:.3});
    const d = tailBand(t - len, t + len, pad, m);
    parts.push({d, stroke:true, paint:"mO", sw:2 * LINE.contour}, {d, paint:"m"}, {d:tailHalf(t - len, t + len, pad, false, m), paint:"mS", alpha:.8}, {d:tailHalf(t - len * .6, t + len * .2, pad, true, m), paint:"mL", alpha:.6});
    /* a lighter rim on each side of the ring, in its own material */
    parts.push({d:tailBand(t - len, t - len * .7, pad, m), paint:"mL", alpha:.55}, {d:tailBand(t + len * .7, t + len, pad, m), paint:"mL", alpha:.55});
    if (I.c) parts.push({d:tailBand(t - len * 1.4, t - len * .9, pad + .05, m), paint:"inf", alpha:.9});
    /* the socket: the gem's diamond a little larger, in the band material, outline at the interior weight; empty (a recess) when there is no gem */
    const rs = .9, x = q.x, y = q.y, dia = rr => diamond(+f1(x), +f1(y), rr); /* numbers, not text, or the helper joins them as strings */
    parts.push({d:dia(rs), stroke:true, paint:"wO", sw:2 * LINE.interior}, {d:dia(rs), paint:"wB"}, {d:`M${f1(x - rs)} ${f1(y)} L${f1(x)} ${f1(y + rs)} L${f1(x + rs)} ${f1(y)} Z`, paint:"wS", alpha:.8}, {d:`M${f1(x - rs)} ${f1(y)} L${f1(x)} ${f1(y - rs)} L${f1(x + rs * .35)} ${f1(y - rs * .65)} L${f1(x - rs * .3)} ${f1(y)} Z`, paint:"wL", alpha:.6});
    if (G) parts.push(...gemParts(G, x, y, .42));
    else parts.push({d:dia(.42), paint:"wO", alpha:.55}, {circle:[x - .12, y - .14, .1], paint:"wL", alpha:.8});
    return parts;
  };
  const name = (R.adj ? R.adj + " " : "") + (I.pre ? I.pre + " " : "") + F.n + " Tail Ring" + (G ? " with " + G.n : "") + (I.suf ? " " + I.suf : "");
  const code = "r" + [slot, fit, band, gem, rar, inf].map(n => n.toString(36)).join("");
  return {kind:"ring" + (slot + 1), slot, code, name, rk:R.k, rar, parts:build(rigId), partsFor:build, rig:rigId, palette:pal, joint:"tail", picks:{slot:RING_SLOT_NAMES[slot].n, material:F.n, setting:W.n, gem:G ? G.n : "none", rarity:R.n, infusion:I.n}};
}
const ringKind = i => ({n:"Tail ring " + (i + 1), make:(seed, picks = {}, rigId) => tailring(seed, Object.assign({}, picks, {slot:i}), rigId), styles:[RING_SLOT_NAMES[i]], code:"r", noStyle:true, group:"Tail rings", slot:i});
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
function decode(code, rigId){ if (!code) return null; let K = Object.values(KINDS).find(k => k.code === code[0]); if (!K) return null; if (code[0] === "r"){ K = KINDS["ring" + (Math.min(2, parseInt(code[1], 36) || 0) + 1)]; const v = code.slice(1).split("").map(c => parseInt(c, 36) || 0), cl = (x, n) => Math.min(n - 1, Math.max(0, x)); return K.make(code, {fit:cl(v[1], P.FIT.length), band:cl(v[2], P.WRAP.length), gem:cl(v[3], P.GEMS.length), rar:cl(v[4], RARS.length), inf:cl(v[5], INFS.length)}, rigId); } const v = code.slice(1).split("").map(c => parseInt(c, 36) || 0), cl = (x, n) => Math.min(n - 1, Math.max(0, x)); return K.make(code, {band:cl(v[0], P.WRAP.length), fit:cl(v[1], P.FIT.length), style:cl(v[2], K.styles.length), gem:cl(v[3], P.GEMS.length), rar:cl(v[4], RARS.length), inf:cl(v[5], INFS.length)}, rigId); }
return {init, MOUNTS, collar, tailguard, tailring, armor, decode, KINDS, STYLES, TAIL_STYLES, RING_SLOT_NAMES, RING_SLOTS, ringSlots, guardLayout, tailAt, get PAL(){ return P; }, get RARS(){ return RARS; }, get INFS(){ return INFS; }};
})();
if (typeof module !== "undefined") module.exports = GEAR;
