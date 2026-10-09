/* ================= Den Rig (RIG) =================
   Jointed drawings for PixiJS v8, from data. A rig is: parts (SVG path strings, lines, circles, in the 62×38 drawing space),
   joints (containers that rotate about an origin, nested), and tracks (keyframes: the same numbers as the CSS walk rig).
   - RIG.define(id, def) registers a rig. RIG.build(PIXI, id, opts) returns a Container with .rig.tick(dt), .set(state, on), .walk(on), .face(±1).
   - Left-facers are the same rig with scale.x = -1: Pixi mirrors the gait for free (no L keyframes).
   - States (tells, moods) are data: {joint, rot|x|y|scale} added over the walk, {part, show} toggled, {alpha} on the whole rig.
   - Every part's geometry is tessellated once and shared by every copy of the rig (GraphicsContext), so a crowd costs no build hitch.
   No game globals, so it runs in a bench page and in the game unchanged. */
const RIG = (() => {
"use strict";
const DEFS = {}, CTX = {};
const DEG = Math.PI / 180;
function define(id, def){ DEFS[id] = Object.assign({stride:1, box:[62, 38], parts:[], joints:[], tracks:{}, states:{}}, def, {id}); delete CTX[id]; return DEFS[id]; }

/* ---------- keyframes ----------
   track = [{at:0, v:-16}, {at:.62, v:15, ease:"io"}, {at:1, v:-16}] ; at in [0,1]; v = degrees, x/y = drawing units.
   ease on a key eases INTO the next key (like a CSS animation-timing-function set at that keyframe). */
const easeIO = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const FIELDS = ["v", "x", "y"];
function sample(track, ph, out = {}){
  out.v = 0; out.x = 0; out.y = 0; if (!track || !track.length) return out;
  let a = track[track.length - 1], b = a, u = 0;
  for (let i = 0; i < track.length - 1; i++){ if (ph >= track[i].at && ph <= track[i + 1].at){ a = track[i]; b = track[i + 1]; const span = b.at - a.at; u = span > 0 ? (ph - a.at) / span : 1; if (a.ease === "io") u = easeIO(u); break; } }
  for (const f of FIELDS){ const av = a[f] || 0, bv = b[f] || 0; out[f] = av + (bv - av) * u; }
  return out;
}

/* ---------- colours ---------- */
function hex(c){ return typeof c === "number" ? c : parseInt(String(c).replace("#", ""), 16); }
function dim(c, k){ const n = hex(c); const r = Math.round(((n >> 16) & 255) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k); return (r << 16) | (g << 8) | b; }
const css = n => "#" + n.toString(16).padStart(6, "0");

/* ---------- geometry, built once per (rig, part, far) ----------
   part = {d:"path"} filled | {d, stroke:true, sw} stroked path (no fill) | {line:[a,b], sw} | {circle:[x,y,r]} | {ellipse:[x,y,rx,ry]} | {poly:[[x,y],...]}
   + paint:"name" (palette key, default fur), alpha, in:"joint", id, hidden, far */
function context(PIXI, D, i, far, pal){
  const key = (far ? "f" : "n") + i; const C = CTX[D.id] || (CTX[D.id] = {}); if (C[key]) return C[key];
  const p = D.parts[i], k = far ? (pal.far ?? .78) : 1, col = dim(pal[p.paint || "fur"] ?? pal.fur, k);
  const g = new PIXI.GraphicsContext();
  if (p.d){ if (p.stroke) g.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${D.box[0]} ${D.box[1]}"><path d="${p.d}" fill="none" stroke="${css(col)}" stroke-width="${p.sw || 1}"/></svg>`);
    else g.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${D.box[0]} ${D.box[1]}"><path d="${p.d}" fill="${css(col)}"/></svg>`); }
  else if (p.line){ const [a, b] = p.line; g.moveTo(a[0], a[1]).lineTo(b[0], b[1]).stroke({width:p.sw, color:col, cap:p.cap || "round"}); }
  else if (p.circle){ g.circle(p.circle[0], p.circle[1], p.circle[2]).fill(col); }
  else if (p.ellipse){ g.ellipse(p.ellipse[0], p.ellipse[1], p.ellipse[2], p.ellipse[3]).fill(col); }
  else if (p.poly){ g.poly(p.poly.flat()).fill(col); }
  C[key] = g; return g;
}
/* build every part once (tessellation happens on first draw; call after the renderer exists to take the hitch at boot) */
function warm(PIXI, id, pal){ const D = DEFS[id]; if (!D) return; const P = Object.assign({}, D.palette, pal || {}); D.parts.forEach((p, i) => { context(PIXI, D, i, false, P); if (D.joints.some(j => j.far) || p.far) context(PIXI, D, i, true, P); }); }

/* ---------- build ---------- */
function build(PIXI, id, opts = {}){
  const D = DEFS[id]; if (!D) throw new Error("unknown rig " + id);
  const pal = Object.assign({}, D.palette, opts.palette || {});
  const root = new PIXI.Container(); root.label = "rig:" + id; root.origin.set(D.box[0] / 2, D.box[1] / 2); /* mirror and scale about the drawing's centre */
  const J = {root}; const parts = {};
  /* joints in def order = draw order (far legs, body, near legs); parents must come before children */
  for (const j of D.joints){ const c = new PIXI.Container(); c.label = j.id; if (j.at) c.origin.set(j.at[0], j.at[1]); const parent = J[j.in || "root"]; c.__far = !!j.far || !!parent.__far; J[j.id] = c; parent.addChild(c); }
  D.parts.forEach((p, i) => { const host = J[p.in || "root"]; const far = !!p.far || !!host.__far; const g = new PIXI.Graphics(context(PIXI, D, i, far, pal)); if (p.alpha != null) g.alpha = p.alpha; if (p.hidden) g.visible = false; g.label = p.id || ""; host.addChild(g); if (p.id) parts[p.id] = g; });
  const on = new Set(); let t = 0, walking = opts.walk !== false, phase = 0; const smp = {};
  const api = {
    joints:J, parts, states:on,
    tick(dt){ t += dt; if (walking) phase = (t / D.stride) % 1;
      for (const j of D.joints){ const C = J[j.id]; const tr = D.tracks[j.track || j.id]; let rot = 0, x = 0, y = 0;
        if (tr && (walking || j.always)){ const ph = j.period ? ((t / j.period) % 1) : (phase + (j.ph || 0)) % 1; sample(tr, ph, smp); rot = smp.v; x = smp.x; y = smp.y; }
        if (j.bob && walking) y -= Math.pow(Math.sin(phase * Math.PI * 2), 2) * j.bob;
        let sc = 1; for (const s of on){ const S = D.states[s]; if (!S) continue; for (const a of S){ if (a.joint === j.id){ rot += a.rot || 0; x += a.x || 0; y += a.y || 0; if (a.scale) sc *= a.scale; } } }
        C.rotation = rot * DEG; C.x = x; C.y = y; if (sc !== 1 || C.scale.x !== 1) C.scale.set(sc); }
      let al = D.alpha ?? 1; for (const s of on){ const S = D.states[s]; if (!S) continue; for (const a of S){ if (a.alpha != null) al *= a.alpha; } } root.alpha = al;
      for (const p of D.parts){ if (p.id) parts[p.id].visible = !p.state && !p.hidden; }
      for (const s of on){ const S = D.states[s]; if (!S) continue; for (const a of S){ if (a.part && parts[a.part]) parts[a.part].visible = a.show !== false; } } },
    set(name, v = true){ if (v) on.add(name); else on.delete(name); return api; },
    walk(v){ walking = v; return api; },
    seed(v){ t = v * D.stride; return api; },
    face(dir){ root.scale.x = dir < 0 ? -Math.abs(root.scale.x) : Math.abs(root.scale.x); return api; },
    get phase(){ return phase; }, get walking(){ return walking; }
  };
  root.rig = api; return root;
}
/* ---------- attachments: gear drawn onto a built rig's joint (collars, paw covers…). parts use the same specs; palette is the piece's own. ---------- */
function attach(PIXI, root, jointId, parts, pal){ const J = root.rig && root.rig.joints[jointId]; if (!J) throw new Error("no joint " + jointId); const D = {box:[62, 38], id:"__gear", parts}; const made = [];
  parts.forEach((p, i) => { const col = dim(pal[p.paint || "fur"] ?? 0xffffff, J.__far ? .78 : 1); const g = new PIXI.Graphics();
    if (p.d){ if (p.stroke) g.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 38"><path d="${p.d}" fill="none" stroke="${css(col)}" stroke-width="${p.sw || 1}" stroke-linecap="round"/></svg>`); else g.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 38"><path d="${p.d}" fill="${css(col)}"/></svg>`); }
    else if (p.line){ const [a, b] = p.line; g.moveTo(a[0], a[1]).lineTo(b[0], b[1]).stroke({width:p.sw, color:col, cap:"round"}); }
    else if (p.circle){ g.circle(p.circle[0], p.circle[1], p.circle[2]).fill(col); } else if (p.ellipse){ g.ellipse(p.ellipse[0], p.ellipse[1], p.ellipse[2], p.ellipse[3]).fill(col); } else if (p.poly){ g.poly(p.poly.flat()).fill(col); }
    if (p.alpha != null) g.alpha = p.alpha; g.label = "gear"; J.addChild(g); made.push(g); });
  return {remove(){ made.forEach(g => g.destroy()); }, parts:made}; }
return {DEFS, define, build, warm, attach, sample, dim};
})();
/* The Den's rigs as data. The hero: GrumpyDingo's approved Carolina Dog (Den Dingo Workbench), 62×38 drawing space, two-tone. */
function registerDenRigs(RIG){
  const line = (a, b, sw, extra) => Object.assign({line:[a, b], sw}, extra || {});
  const paw = (p, extra) => Object.assign({ellipse:[p[0] + .8, p[1] + .4, 2, 1.05]}, extra || {});
  /* the CSS walk rig's keyframes, verbatim (degrees; ease "io" eases into the next key) */
  const tracks = {
    hhip:[{at:0, v:-16}, {at:.62, v:15, ease:"io"}, {at:1, v:-16}],
    hshank:[{at:0, v:0}, {at:.58, v:0}, {at:.76, v:34}, {at:.94, v:0}, {at:1, v:0}],
    hmeta:[{at:0, v:0}, {at:.58, v:0}, {at:.76, v:-30}, {at:.9, v:6}, {at:1, v:0}],
    fsh:[{at:0, v:-18}, {at:.62, v:16, ease:"io"}, {at:1, v:-18}],
    ffore:[{at:0, v:0}, {at:.6, v:0}, {at:.78, v:-14}, {at:1, v:0}],
    fpast:[{at:0, v:0}, {at:.58, v:0}, {at:.74, v:85}, {at:.9, v:-12}, {at:1, v:0}],
    wag:[{at:0, v:-8, ease:"io"}, {at:.5, v:10, ease:"io"}, {at:1, v:-8}]
  };
  const hind = (k, ph, far) => [
    {id:"hip" + k, at:[18, 17], track:"hhip", ph, far, in:"root"},
    {id:"shank" + k, at:[21, 23], track:"hshank", ph, in:"hip" + k},
    {id:"meta" + k, at:[17, 28], track:"hmeta", ph, in:"shank" + k}];
  const front = (k, ph, far) => [
    {id:"sh" + k, at:[38, 15], track:"fsh", ph, far, in:"root"},
    {id:"fore" + k, at:[38, 22], track:"ffore", ph, in:"sh" + k},
    {id:"past" + k, at:[38.4, 30], track:"fpast", ph, in:"fore" + k}];
  const legParts = k => [
    line([18, 17], [21, 23], 4, {in:"hip" + k}), line([21, 23], [17, 28], 2.8, {in:"shank" + k}), line([17, 28], [18.4, 34.5], 2.3, {in:"meta" + k, paint:"pale2"}), paw([18.4, 34.5], {in:"meta" + k, paint:"pale2"}),
    line([38, 15], [38, 22], 3.6, {in:"sh" + k}), line([38, 22], [38.4, 30], 2.6, {in:"fore" + k, paint:"pale2"}), line([38.4, 30], [39.4, 34.5], 2.3, {in:"past" + k, paint:"pale2"}), paw([39.4, 34.5], {in:"past" + k, paint:"pale2"})];
  const body = "M14 15 C16 11.5 26 11 36 12 C39.5 10 41.5 7.5 43.5 6 C45 4.5 47.5 4 49.5 5 C52 6 55 8.5 57.5 10 C58 11 57 12.5 55.5 12.6 C53 13 50.5 13.4 48 12.8 C46.5 13.5 45 15 44 17.5 C43.6 19.5 42.8 21.5 41.5 23 C36 23.8 29 23.6 23 21.5 C19 20.5 15.5 21.5 13.5 20 C12.5 18.5 12.3 16.5 14 15 Z";
  const tail = "M13.5 16.5 C9.5 19.5 8 25 9 30.5 C9.3 32.3 11.2 32 11.2 30.3 C10.6 25.5 12 21.5 15.5 18.5 Z";
  /* the pale underside is cut from the tail's own inner edge, inset a little, so it can never poke past the tan (GrumpyDingo, Oct 3) */
const tailUnder = "M11.1 29.6 C10.7 25.6 12.1 22 15 19.3 L14.1 19.3 C11.3 21.9 9.9 25.4 10.3 29.4 Z";
  const earFar = "M41.6 9.2 L43.8 0.8 L46.6 6 Z", earNear = "M44.2 6.8 L47.4 -0.8 L49.2 6 Z", earIn = "M45.4 6 L47.3 1.2 L48.2 5.6 Z";
  const chest = "M47 13 C45.5 14.5 44.4 16.5 43.8 19 C43.2 21 42.4 22.5 41.5 23 C36 23.8 29 23.6 23 21.5 L23.6 20 C29.5 21.8 36 22 40.6 21.4 C41.8 19.5 42.4 17.5 43 15.5 C43.8 14 45.2 13.2 47 13 Z";
  const muzzle = "M49.5 8.6 C52 9.4 55 10.6 57.3 11.4 C56.6 12.4 55 12.7 53 12.9 C51 13.1 49.4 13 48.2 12.6 C48.4 11 48.8 9.6 49.5 8.6 Z";
  const band = "M38.9 10 L40.9 8.4 C43.6 9.9 45.5 11.9 46.6 14.1 L45.2 15.9 C44 13.7 42.1 11.5 38.9 10 Z";
  RIG.define("hero", {
    stride:1, tracks,
    palette:{fur:"#dca45e", pale:"#f6e9cf", pale2:"#f0dcb4", ink:"#2a1a10", collar:"#3f8a4f", tag:"#d9a441", tag2:"#8a5a1a", furDark:"#b8773a", far:.78},
    joints:[
      ...hind("F", 0, true), ...front("F", .25, true),
      {id:"body", bob:1.2, in:"root"},
      {id:"tail", at:[15.5, 16.5], track:"wag", period:1.4, in:"body"},
      {id:"earFar", at:[44.1, 7.6], in:"body"}, {id:"earNear", at:[46.7, 6.4], in:"body"},
      ...hind("N", .5, false), ...front("N", .75, false)],
    parts:[
      ...legParts("F"),
      {d:tail, in:"tail"}, {d:tailUnder, in:"tail", paint:"pale"},
      {d:body, in:"body", id:"body"},
      {d:earFar, in:"earFar"}, {d:earNear, in:"earNear"}, {d:earIn, in:"earNear", paint:"pale"},
      {d:chest, in:"body", paint:"pale"}, {d:muzzle, in:"body", paint:"pale"},
      {circle:[51, 7.6, .9], in:"body", paint:"ink"}, {circle:[57.2, 10.2, 1], in:"body", paint:"ink"},
      {d:band, in:"body", paint:"collar"}, {circle:[45.8, 15, .7], in:"body", paint:"tag"}, {circle:[45.8, 15, .35], in:"body", paint:"tag2"},
      ...legParts("N")],
    states:{
      "ears-back":[{joint:"earFar", rot:-55}, {joint:"earNear", rot:-55}],
      "ears-up":[{joint:"earFar", rot:8}, {joint:"earNear", rot:8}],
      howl:[{joint:"earFar", rot:-30}, {joint:"earNear", rot:-30}]
    }
  });

  /* ===== the Meadow creatures (DEN-GAME-CREATURES.md). They face left in the drawing, so they use the mirrored (negated) walk tracks,
     exactly as the Workbench used the …L keyframes. Moods are states: "angry" swaps eyes / lifts wire / swells. ===== */
  const neg = tr => tr.map(k => Object.assign({}, k, k.v != null ? {v:-k.v} : {}));
  const T = {hhip:neg(tracks.hhip), hshank:neg(tracks.hshank), hmeta:neg(tracks.hmeta), fsh:neg(tracks.fsh), ffore:neg(tracks.ffore), fpast:neg(tracks.fpast),
    armsw:[{at:0, v:10, ease:"io"}, {at:.5, v:-14, ease:"io"}, {at:1, v:10}], armfo:[{at:0, v:-6, ease:"io"}, {at:.5, v:12, ease:"io"}, {at:1, v:-6}],
    nod:[{at:0, v:0, ease:"io"}, {at:.5, v:4, ease:"io"}, {at:1, v:0}],
    lurch:[{at:0, v:0, y:0, ease:"io"}, {at:.25, v:-2.5, y:-1.6, ease:"io"}, {at:.5, v:0, y:.4, ease:"io"}, {at:.75, v:2, y:-1.2, ease:"io"}, {at:1, v:0, y:0}],
    hover:[{at:0, y:0, ease:"io"}, {at:.5, y:-2.2, ease:"io"}, {at:1, y:0}],
    bob:[{at:0, y:0, ease:"io"}, {at:.5, y:-1.4, ease:"io"}, {at:1, y:0}],
    twitch:[{at:0, v:-12}, {at:.5, v:12}, {at:1, v:-12}]};
  const stroked = (d, paint, sw, extra) => Object.assign({d, stroke:true, paint, sw}, extra || {});
  /* a three-segment leg (hip, shank, meta) or two-segment (hip, shank); pts = [[hip],[knee],[hock],[foot]] */
  function leg3(k, pts, ws, ph, far, inJ){ const [h, kn, ho, ft] = pts; return {
    joints:[{id:"hip" + k, at:h, track:"hhip", ph, far, in:inJ || "root"}, {id:"shank" + k, at:kn, track:"hshank", ph, in:"hip" + k}, {id:"meta" + k, at:ho, track:"hmeta", ph, in:"shank" + k}],
    parts:[line(h, kn, ws[0], {in:"hip" + k}), line(kn, ho, ws[1], {in:"shank" + k}), line(ho, ft, ws[2], {in:"meta" + k})]}; }
  function leg2(k, pts, ws, ph, far, inJ){ const [h, kn, ft] = pts; return {
    joints:[{id:"hip" + k, at:h, track:"hhip", ph, far, in:inJ || "root"}, {id:"shank" + k, at:kn, track:"hshank", ph, in:"hip" + k}],
    parts:[line(h, kn, ws[0], {in:"hip" + k}), line(kn, ft, ws[1], {in:"shank" + k})]}; }
  const merge = (...L) => ({joints:L.flatMap(l => l.joints), parts:L.flatMap(l => l.parts)});

  /* ---- Hollowhorn: tall, lurching, deer skull, moss. healer ---- */
  (() => {
    const lg = (k, ph, far) => { const L = leg3(k, [[36, 22], [32, 27.5], [35, 32], [34.2, 35]], [3, 2, 1.7], ph, far, "body"); L.parts.push(stroked("M34.2 35 L30.6 36 M34.2 35 L32.6 36.8 M34.2 35 L35.6 36.6", "fur", 1, {in:"meta" + k})); return L; };
    const arm = (k, ph, far) => { const x = far ? 1.12 : 1, el = [16.5, 22 + 9 * x], dy = 9 * x - 9; return {
      joints:[{id:"arm" + k, at:[24, 13], track:"armsw", ph, far, in:"body"}, {id:"fore" + k, at:[20.5, 22], track:"armfo", ph, in:"arm" + k}],
      parts:[line([24, 13], [20.5, 22], 2.6, {in:"arm" + k}), line([20.5, 22], el, 2, {in:"fore" + k}), stroked(`M16.5 ${31 + dy} L13.6 ${34.2 + dy} M16.5 ${31 + dy} L15.8 ${34.8 + dy} M16.5 ${31 + dy} L18.2 ${34.4 + dy}`, "fur", 1.1, {in:"fore" + k})]}; };
    const F = lg("F", 0, true), AF = arm("F", .5, true), N = lg("N", .5, false), AN = arm("N", 0, false);
    RIG.define("hollowhorn", {stride:1.7, tracks:T,
      palette:{fur:"#5b3f2a", bone:"#e3d5b8", socket:"#2a1a10", moss:"#b7c48a", eye:"#f1e6b0", ember:"#ff8a3a", far:.72},
      joints:[{id:"body", at:[36, 22], track:"lurch", in:"root"}, ...F.joints, ...AF.joints, {id:"head", at:[23, 10], track:"nod", period:.85, in:"body"}, ...N.joints, ...AN.joints],
      parts:[...F.parts, ...AF.parts,
        {d:"M22.5 11.5 C19.8 15.5 21 21.5 25.5 24.8 C29.5 27.6 36.5 26.4 40.2 22.2 C43.6 18.2 41.6 11.6 36.4 8.4 C31.6 5.4 26 7 22.5 11.5 Z", in:"body"},
        {d:"M26.7 8.5 L23.6 5.6 L24.2 10.4 Z M30.9 7.3 L28.8 2.8 L27.4 8.2 Z M34.8 8.1 L34.8 4.0 L31.8 7.4 Z M40.1 12.9 L42.5 9.8 L38.3 10.5 Z", paint:"moss", in:"body"},
        {d:"M24 16 C23.4 20 25.4 23.6 28.6 25.2 C32 26.4 35.4 25 37.6 22.4 C34.2 23.4 30.2 22.6 27.6 19.6 C26.4 18 25.2 16.6 24 16 Z", paint:"moss", in:"body"},
        stroked("M18.6 9.6 L17.4 3.2 M17.8 5.8 L14 3.4 M17.6 4.2 L20.8 0.4 M20.8 0.4 L20 -2.2 M14 3.4 L11.8 4.4 M14.6 4.6 L13.2 1.6 M22 9 L22.8 5.4 L25 4.6", "bone", 1.1, {in:"head"}),
        {d:"M23.5 9.6 C21 7.4 15.4 8 11.6 12.4 C11.2 15.4 15 18.4 19.6 17.6 C23 17 24.6 13.2 23.5 9.6 Z", in:"head"},
        {d:"M23 9.8 C19.6 8 14.8 8.8 11.6 12.4 C11.2 14.8 13.6 17 16.8 17.4 C20.4 17.6 23 14.6 23 9.8 Z", paint:"bone", in:"head"},
        {ellipse:[14.9, 12.6, 1.7, 1.5], paint:"socket", in:"head"}, {ellipse:[18.7, 11.3, 1.15, 1.05], paint:"socket", in:"head"},
        {circle:[14.9, 12.7, .55], paint:"eye", in:"head", id:"eyeA"}, {circle:[18.7, 11.4, .45], paint:"eye", in:"head", id:"eyeB"},
        {circle:[14.9, 12.7, 1.9], paint:"eye", alpha:.22, in:"head", id:"glowA"}, {circle:[18.7, 11.4, 1.5], paint:"eye", alpha:.22, in:"head", id:"glowB"},
        {circle:[14.9, 12.7, .55], paint:"ember", in:"head", id:"eyeA2", hidden:true, state:1}, {circle:[18.7, 11.4, .45], paint:"ember", in:"head", id:"eyeB2", hidden:true, state:1},
        {circle:[14.9, 12.7, 1.9], paint:"ember", alpha:.22, in:"head", id:"glowA2", hidden:true, state:1}, {circle:[18.7, 11.4, 1.5], paint:"ember", alpha:.22, in:"head", id:"glowB2", hidden:true, state:1},
        stroked("M12.6 15.6 L13.2 17.2 M14.6 16.4 L14.9 18 M16.6 16.8 L16.4 18.4", "bone", .55, {in:"head"}),
        ...N.parts, ...AN.parts],
      states:{angry:[{part:"eyeA2"}, {part:"eyeB2"}, {part:"glowA2"}, {part:"glowB2"}, {part:"eyeA", show:false}, {part:"eyeB", show:false}, {part:"glowA", show:false}, {part:"glowB", show:false}]}});
  })();

  /* ---- Kindling: six sticks, six twig legs, one knot eye, an ember. quick ---- */
  (() => {
    const lg = (k, hx, ph, far, kx, fx) => { const L = leg2(k, [[hx, 24.5], [hx + kx, 31], [hx + fx, 35.3]], [1.5, 1.2], ph, far, "body"); L.parts.push({poly:[[hx + fx - 1.6, 35.6], [hx + fx + 1.2, 35.6], [hx + fx + .2, 34.6]], in:"shank" + k}); return L; };
    const sticks = [[16.5, 19.6, 41, 20.6, 3.2], [20, 22.6, 44.5, 23.1, 3.4], [18.4, 25.6, 40, 26.2, 3], [22, 16.8, 38, 17.6, 2.6], [26, 28.6, 36, 28.9, 2.2]];
    const F = merge(lg("F1", 24, 0, true, -2.5, -4.5), lg("F2", 31, .33, true, -1.5, -3.5), lg("F3", 38, .66, true, 1, 3)), N = merge(lg("N1", 22, .5, false, 2, 4.5), lg("N2", 29, .83, false, 1, 3.5), lg("N3", 36, .16, false, -2, -4));
    RIG.define("kindling", {stride:.55, tracks:T,
      palette:{fur:"#6b4a2e", twine:"#cbb88a", twine2:"#8a7450", knot:"#e8d9b4", pupil:"#2a1a10", ember:"#d9642a", flare:"#ff9a3a", far:.72},
      joints:[{id:"body", bob:1.2, in:"root"}, ...F.joints, ...N.joints],
      parts:[...F.parts, ...sticks.map(st => line([st[0], st[1]], [st[2], st[3]], st[4], {in:"body"})),
        line([23, 23], [37, 23], 1.4, {paint:"ember", in:"body", id:"emb"}), line([23, 23], [37, 23], 4, {paint:"ember", alpha:.22, in:"body", id:"embg"}),
        line([23, 23], [37, 23], 1.4, {paint:"flare", in:"body", id:"emb2", hidden:true, state:1}), line([23, 23], [37, 23], 4, {paint:"flare", alpha:.45, in:"body", id:"embg2", hidden:true, state:1}),
        {d:"M28.4 15.6 L31.6 15.4 L32.6 29.6 L29.4 29.8 Z", paint:"twine", in:"body"}, stroked("M28.8 18 L32 17.8 M29 22 L32.2 21.8 M29.2 26 L32.4 25.8", "twine2", .5, {in:"body"}),
        {circle:[18.6, 22.6, 1.9], paint:"knot", in:"body"}, {circle:[18.3, 22.7, .75], paint:"pupil", in:"body"},
        ...N.parts],
      states:{angry:[{part:"emb2"}, {part:"embg2"}, {part:"emb", show:false}, {part:"embg", show:false}]}});
  })();

  /* ---- Burrs: five hooked seeds on tiny legs, one eye. swarm ---- */
  (() => {
    const pts = [[20, 30.5, 0], [27, 26.5, .3], [34, 31, .6], [40, 27, .15], [30, 21, .45]]; const joints = [], parts = [];
    pts.forEach(([x, y, ph], i) => { const r = 2.5 + (i % 2) * .4, b = "b" + i;
      joints.push({id:b, track:"bob", period:.45 * 1.6, ph:ph * 1.875, in:"root"}, {id:b + "l", at:[x, y + r], track:"twitch", ph, in:b});
      parts.push(line([x - 1.2, y + r - .5], [x - 2.4, y + r + 2.6], .7, {paint:"leg", in:b + "l"}), line([x, y + r - .3], [x + .4, y + r + 2.8], .7, {paint:"leg", in:b + "l"}), line([x + 1.2, y + r - .5], [x + 2.6, y + r + 2.4], .7, {paint:"leg", in:b + "l"}));
      let hooks = ""; for (let k = 0; k < 8; k++){ const a = k / 8 * Math.PI * 2 + i; hooks += `M${(x + Math.cos(a) * r * .7).toFixed(1)} ${(y + Math.sin(a) * r * .7).toFixed(1)} L${(x + Math.cos(a) * r * 1.7).toFixed(1)} ${(y + Math.sin(a) * r * 1.7).toFixed(1)} `; }
      parts.push(stroked(hooks, "hook", .7, {in:b, id:"hooks" + i}), stroked(hooks, "glow", .7, {in:b, id:"hooksG" + i, hidden:true, state:1}), {circle:[x, y, r], in:b});
      if (i === 1) parts.push({circle:[x - .6, y - .2, .8], paint:"eye", in:b}, {circle:[x - .7, y - .2, .35], paint:"pupil", in:b}); });
    const angry = []; pts.forEach((_, i) => angry.push({part:"hooksG" + i}, {part:"hooks" + i, show:false}));
    RIG.define("burrs", {stride:.45, tracks:T, palette:{fur:"#8a4a6a", hook:"#d9b8c9", leg:"#5a2e44", glow:"#ff8a3a", eye:"#f1e6b0", pupil:"#2a1a10", shadow:"#2a1a10"},
      joints, parts:[{ellipse:[30, 35.4, 13, 1], paint:"shadow", alpha:.15}, ...parts], states:{angry}});
  })();

  /* ---- Clockhead: a dandelion clock that hovers; the seed cluster is a pupil. flying ---- */
  (() => {
    const seeds = (mad) => { let d = ""; const dots = []; for (let k = 0; k < 22; k++){ const a = k / 22 * Math.PI * 2, r0 = 6.6, r1 = mad && k % 3 === 0 ? 14 : 10.2; d += `M${(28 + Math.cos(a) * r0).toFixed(1)} ${(14 + Math.sin(a) * r0).toFixed(1)} L${(28 + Math.cos(a) * r1).toFixed(1)} ${(14 + Math.sin(a) * r1).toFixed(1)} `; dots.push({circle:[+(28 + Math.cos(a) * r1).toFixed(1), +(14 + Math.sin(a) * r1).toFixed(1), .5], in:"hover"}); } return {d, dots}; };
    const calm = seeds(false), mad = seeds(true);
    RIG.define("clockhead", {stride:2.4, tracks:T, palette:{fur:"#e8e6dc", stem:"#7a8a6a", core:"#3b3a2e", ember:"#ff8a3a", glint:"#ffffff", shadow:"#2a1a10"},
      joints:[{id:"hover", track:"hover", period:4.8, always:true, in:"root"}],
      parts:[{ellipse:[29, 35.4, 6, 1], paint:"shadow", alpha:.12},
        stroked("M28 19.4 C27 25 30 29 30.5 33.5", "stem", 1.1, {in:"hover"}), {d:"M30 30 L26.6 31.8 L29.4 32.6 Z", paint:"stem", in:"hover"},
        stroked(calm.d, "fur", .55, {in:"hover", id:"seeds"}), ...calm.dots.map((c, i) => Object.assign(c, {id:"dot" + i})),
        stroked(mad.d, "fur", .55, {in:"hover", id:"seeds2", hidden:true, state:1}), ...mad.dots.map((c, i) => Object.assign(c, {id:"dotM" + i, hidden:true, state:1})),
        {circle:[28, 14, 6.8], in:"hover"}, {circle:[28, 14, 2.3], paint:"core", in:"hover", id:"core"}, {circle:[28, 14, 2.3], paint:"ember", in:"hover", id:"core2", hidden:true, state:1}, {circle:[27.2, 13.2, .5], paint:"glint", alpha:.8, in:"hover"}],
      states:{angry:[{part:"seeds2"}, {part:"seeds", show:false}, {part:"core2"}, {part:"core", show:false}, ...calm.dots.map((_, i) => ({part:"dot" + i, show:false})), ...mad.dots.map((_, i) => ({part:"dotM" + i}))]}});
  })();

  /* ---- Fencepost: a post on two splinter legs, rusty wire. armored + thrower ---- */
  (() => {
    const lg = (k, ph, far, ox) => { const L = leg3(k, [[32.5 + ox, 22.5], [29.5 + ox, 28.5], [31 + ox, 33.2], [31.4 + ox, 35.2]], [1.6, 1.2, 1], ph, far, "body"); L.parts.push(stroked(`M${31.4 + ox} 35.2 L${28.4 + ox} 36.4 M${31.4 + ox} 35.2 L${31 + ox} 37 M${31.4 + ox} 35.2 L${34 + ox} 36.6`, "fur", .9, {in:"meta" + k})); return L; };
    const F = lg("F", 0, true, -1.5), N = lg("N", .5, false, 1.5);
    RIG.define("fencepost", {stride:1.6, tracks:T, palette:{fur:"#8c8a80", rust:"#9a4a2a", grain:"#6a6860", knot:"#3a3630", eye:"#e8e3d2", ember:"#ff8a3a", nail:"#b35a2a", far:.72},
      joints:[{id:"body", bob:1.2, in:"root"}, ...F.joints, ...N.joints],
      parts:[...F.parts,
        stroked("M35.2 14 C40 17 44 22 48 29 M35.4 10.5 C41 12 46 17 50 24", "rust", .8, {in:"body", id:"wire"}), stroked("M40 17.4 l1.4 -1.2 M44 21.6 l1.6 -1 M46.8 26 l1.6 -.8 M41.6 12.4 l1.2 -1.4 M46 16.8 l1.6 -.8", "rust", .7, {in:"body", id:"barb"}),
        stroked("M35.2 8 C40 4 45 3 50 6 M36 11 C42 9 47 10 52 14", "rust", .8, {in:"body", id:"wire2", hidden:true, state:1}), stroked("M41 4.6 l1.2 -1.6 M44.4 3.4 l.4 -2 M48 4.4 l1.6 -1.2 M42.6 9.4 l1 -1.6 M47 10.4 l1.4 -1.4", "rust", .7, {in:"body", id:"barb2", hidden:true, state:1}),
        {d:"M30.4 3.2 L32.2 1.4 L33.6 3 L35.2 1.8 L36 3.4 L36 23.2 C36 24.2 35.2 24.8 34.2 24.8 L31.8 24.8 C30.8 24.8 30 24.2 30 23.2 Z", in:"body"},
        stroked("M31.6 5 L31.4 21 M34.4 6 L34.6 20", "grain", .4, {in:"body"}), stroked("M33 3.4 L33.2 9.8", "grain", .6, {in:"body"}),
        {ellipse:[33, 12.6, 1.3, 1.7], paint:"knot", in:"body"}, {circle:[33, 12.8, .5], paint:"eye", in:"body", id:"eye"}, {circle:[33, 12.8, .5], paint:"ember", in:"body", id:"eye2", hidden:true, state:1},
        {circle:[33, 20.4, .5], paint:"nail", in:"body"},
        ...N.parts],
      states:{angry:[{part:"wire2"}, {part:"barb2"}, {part:"wire", show:false}, {part:"barb", show:false}, {part:"eye2"}, {part:"eye", show:false}]}});
  })();

  /* ---- Mound: a travelling molehill; two pale claws; a nose tip when it surfaces. armored ---- */
  (() => {
    const claw = (k, ph, far, oy) => ({joints:[{id:"sh" + k, at:[24, 30], track:"fsh", ph, far, in:"body"}, {id:"fore" + k, at:[20, 30.5 + oy], track:"ffore", ph, in:"sh" + k}],
      parts:[line([24, 30], [20, 30.5 + oy], 2.2, {paint:"claw", in:"sh" + k}), line([20, 30.5 + oy], [16.5, 33.4], 1.8, {paint:"claw", in:"fore" + k}), stroked("M16.5 33.4 L13.6 33.2 M16.5 33.4 L14 35 M16.5 33.4 L15.4 36", "claw", .9, {in:"fore" + k})]});
    const F = claw("F", 0, true, 1), N = claw("N", .5, false, -1);
    RIG.define("mound", {stride:.8, tracks:T, palette:{fur:"#6a4a30", claw:"#d8c8a8", crumb:"#8a6a4a", nose:"#e09aa0", ember:"#ff8a3a", far:.72},
      joints:[{id:"body", in:"root"}, ...F.joints, ...N.joints],
      parts:[stroked("M38 35.2 C42 34.4 47 35.4 52 34.6", "fur", 1.4), {circle:[44, 33.4, .7]}, {circle:[49, 33.8, .5]},
        ...F.parts,
        {d:"M16 35.4 C18 31 23 26.4 29 26 C35 25.6 40 30 42 35.4 Z", in:"body"},
        {circle:[22, 31.4, .6], paint:"crumb", in:"body"}, {circle:[30, 28.4, .6], paint:"crumb", in:"body"}, {circle:[36, 30.8, .6], paint:"crumb", in:"body"},
        {circle:[17.4, 34.4, .8], paint:"nose", in:"body", id:"nose"}, {circle:[17.6, 33.2 + 4, 1.1], paint:"ember", in:"body", id:"nose2", hidden:true, state:1},
        ...N.parts],
      states:{angry:[{joint:"body", y:-4}, {part:"nose2"}, {part:"nose", show:false}]}});
  })();

  /* ---- Bramble: a blackberry tangle on four thorn legs; one ripe berry for an eye. shover ---- */
  (() => {
    const lg = (k, hx, ph, far, kx, fx) => { const L = leg2(k, [[hx, 26], [hx + kx, 30.5], [hx + fx, 35]], [1.6, 1.2], ph, far, "body"); L.parts.push(stroked(`M${hx + fx} 35 L${hx + fx - 1.8} 36.2 M${hx + fx} 35 L${hx + fx + 1.4} 36.4`, "thorn", .8, {in:"shank" + k})); return L; };
    const ring = [[21, 22], [19, 17], [23, 12], [29, 9.4], [35, 10], [40, 13.6], [42, 19], [40, 25], [34, 28.4], [27, 28.6]];
    const thorns = t => { let a = "", b = ""; ring.forEach(([x, y], i) => { const an = Math.atan2(y - 19, x - 30.5); const seg = `M${x} ${y} L${(x + Math.cos(an) * 2.2 * t).toFixed(1)} ${(y + Math.sin(an) * 2.2 * t).toFixed(1)} `; if (i % 2) a += seg; else b += seg; }); return [a, b]; };
    const [c1, c2] = thorns(1), [m1, m2] = thorns(1.6);
    const F = merge(lg("F1", 25, 0, true, -2, -3), lg("F2", 36, .5, true, 1, 2.5)), N = merge(lg("N1", 27, .5, false, -2.5, -4), lg("N2", 38, 0, false, 2, 3.5));
    RIG.define("bramble", {stride:1.1, tracks:T, palette:{fur:"#3f5a2e", thorn:"#2a3a1e", vine:"#2e4422", leaf:"#6a8a3a", berry:"#3a1f3a", ember:"#ff8a3a", glint:"#f1e6b0", far:.72},
      joints:[{id:"body", bob:1.2, in:"root"}, ...F.joints, ...N.joints],
      parts:[...F.parts,
        stroked(c1, "thorn", .9, {in:"body", id:"th1"}), stroked(c2, "thorn", .7, {in:"body", id:"th2"}), stroked(m1, "thorn", .9, {in:"body", id:"th1m", hidden:true, state:1}), stroked(m2, "thorn", .7, {in:"body", id:"th2m", hidden:true, state:1}),
        {d:"M22 20 C20 15 24 10.4 30.5 10 C37 9.6 42 14 42 19.5 C42 25 37.4 28.8 30.5 28.8 C24 28.8 22 25 22 20 Z", in:"body"},
        stroked("M24 24 C28 20 33 26 38 20 M26 14 C30 18 34 12 39 16", "vine", 1, {in:"body"}),
        {d:"M27.4 12.4 L25 6.4 L30.2 9.6 Z M32.6 11.6 L35.6 5.6 L37.6 11.2 Z M38 14.2 L42.6 10 L41.2 15.8 Z", paint:"leaf", in:"body"},
        {circle:[26.6, 18.4, 1.9], paint:"berry", in:"body", id:"berry"}, {circle:[26.6, 18.4, 1.9], paint:"ember", in:"body", id:"berry2", hidden:true, state:1}, {circle:[25.6, 17.6, .55], paint:"glint", in:"body"},
        ...N.parts],
      states:{angry:[{part:"th1m"}, {part:"th2m"}, {part:"th1", show:false}, {part:"th2", show:false}, {part:"berry2"}, {part:"berry", show:false}]}});
  })();

  /* ---- Puffball: a swollen puffball on three root legs; swells before it pops. splitter ---- */
  (() => {
    const lg = (k, hx, ph, far, kx, fx) => { const L = leg2(k, [[hx, 28], [hx + kx, 31.5], [hx + fx, 35]], [2, 1.5], ph, far, "body"); L.parts.forEach(p => p.paint = "root"); L.parts.push(stroked(`M${hx + fx} 35 L${hx + fx - 2} 36.4 M${hx + fx} 35 L${hx + fx + 1.6} 36.4`, "root", .9, {in:"shank" + k})); return L; };
    const F = merge(lg("F1", 28, 0, true, -1.5, -2.5), lg("F2", 35, .66, true, 1.5, 2.5)), N = lg("N1", 31.5, .33, false, -1, -2);
    RIG.define("puffball", {stride:1, tracks:T, palette:{fur:"#e8dcc0", root:"#b8a888", bruise:"#9a7a52", split:"#8a7050", spot:"#c9b894", far:.78},
      joints:[{id:"body", bob:1.2, in:"root"}, ...F.joints, {id:"swell", at:[31, 24], in:"body"}, ...N.joints],
      parts:[...F.parts,
        {ellipse:[31, 21, 9.5, 8.5], in:"swell"}, {d:"M35 15 C38 16.4 39.6 19.6 39.2 22.8 C37.6 20.4 35.6 17.6 33 15.4 Z", paint:"bruise", in:"swell"},
        stroked("M29.4 13 Q31 14.4 32.6 13", "split", .8, {in:"swell"}), {circle:[26.6, 20.4, .6], paint:"spot", in:"swell"}, {circle:[29, 25.6, .5], paint:"spot", in:"swell"}, {circle:[34, 26.4, .6], paint:"spot", in:"swell"},
        ...N.parts],
      states:{angry:[{joint:"swell", scale:1.18}]}});
  })();

  /* ---- Shade: a tree's shadow walking without its tree. phasing ---- */
  (() => {
    const lg = (k, ph, far, ox) => leg3(k, [[31 + ox, 21], [29 + ox, 28], [31 + ox, 33], [29.5 + ox, 35.4]], [2.4, 1.8, 1.4], ph, far, "body");
    const F = lg("F", 0, true, -2), N = lg("N", .5, false, 2);
    RIG.define("shade", {stride:1.8, tracks:T, alpha:.62, palette:{fur:"#2e2a4a", eye:"#c9c2e8", ember:"#ff8a3a", far:.85},
      joints:[{id:"body", bob:1.2, in:"root"}, ...F.joints, ...N.joints],
      parts:[...F.parts,
        {d:"M28.5 21.5 L33.5 21.5 L34 12 L28 12 Z", in:"body"},
        stroked("M31 12 L31 6 M31 9 L26 4.6 M26 4.6 L23.6 5.4 M26 4.6 L25.4 1.6 M31 7.4 L36.2 3.2 M36.2 3.2 L38.8 4.2 M36.2 3.2 L36.6 .4 M31 6 L30.2 1.2 M31 10.4 L27.2 9.2 M31 9.8 L35 8", "fur", 1.3, {in:"body"}),
        stroked("M28.6 14 L23 19.6 M33.6 14.4 L38.6 18.4", "fur", 1.2, {in:"body"}),
        {ellipse:[30.2, 15.2, .9, 1.2], paint:"eye", in:"body", id:"eye"}, {ellipse:[30.2, 15.2, .9, 1.2], paint:"ember", in:"body", id:"eye2", hidden:true, state:1},
        ...N.parts],
      states:{angry:[{alpha:1 / .62}, {part:"eye2"}, {part:"eye", show:false}]}});
  })();
}
const SMITHY = (() => {
"use strict";
