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
  /* a joint's own parts draw UNDER its child joints (the upper arm under the forearm, the thigh under the shank), so a limb's rounded
     end never sits on top of the next segment as a knob. Only for animated limb joints (ones with a track): the body keeps drawing over
     the tail and ear roots it hides, and root keeps def order (far legs, body, near legs). */
  for (const j of D.joints){ if (!(j.track || D.tracks[j.id])) continue; const c = J[j.id]; const g = c.children.filter(x => x instanceof PIXI.Graphics), k = c.children.filter(x => !(x instanceof PIXI.Graphics)); if (g.length && k.length){ c.removeChildren(); g.forEach(x => c.addChild(x)); k.forEach(x => c.addChild(x)); } }
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
  parts.forEach((p, i) => { const col = dim(pal[p.paint || "fur"] ?? 0xffffff, J.__far ? .78 : 1); const g = new PIXI.Graphics(), pd = p.d;
    if (pd){ if (p.stroke) g.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 38"><path d="${pd}" fill="none" stroke="${css(col)}" stroke-width="${p.sw || 1}" stroke-linecap="round" stroke-linejoin="round"/></svg>`); else g.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 38"><path d="${pd}" fill="${css(col)}"/></svg>`); }
    else if (p.line){ const [a, b] = p.line; g.moveTo(a[0], a[1]).lineTo(b[0], b[1]).stroke({width:p.sw, color:col, cap:"round"}); }
    else if (p.circle){ g.circle(p.circle[0], p.circle[1], p.circle[2]).fill(col); } else if (p.ellipse){ g.ellipse(p.ellipse[0], p.ellipse[1], p.ellipse[2], p.ellipse[3]).fill(col); } else if (p.poly){ g.poly(p.poly.flat()).fill(col); }
    if (p.alpha != null) g.alpha = p.alpha; g.label = "gear"; J.addChild(g); made.push(g); });
  /* parts.hides = ["collar", ...]: the dog's own parts painted with those names are hidden while the piece is worn (a gear collar replaces the dog's band and tag) and
     come back on remove(). The k-th plain Graphics in a joint is the k-th part of that joint in the rig's data. */
  const hidden = []; if (parts.hides){ const rid = String(root.label || "").replace(/^rig:/, ""), mine = DEFS[rid] ? DEFS[rid].parts.filter(q => (q.in || "root") === jointId) : [];
    J.children.filter(c => c instanceof PIXI.Graphics && c.label !== "gear").forEach((c, k) => { const q = mine[k]; if (q && parts.hides.includes(q.paint) && c.visible){ c.visible = false; hidden.push(c); } }); }
  return {remove(){ hidden.forEach(c => { if (!c.destroyed) c.visible = true; }); made.forEach(g => g.destroy()); }, parts:made}; }
return {DEFS, define, build, warm, attach, sample, dim};
})();
if (typeof module !== "undefined") module.exports = RIG;
