/* ================= Den Status & Skill Engine (SE) =================
   One source of truth for everything that changes how a thing fights:
   boons, conditions, brews, treats, skill buffs, creature traits, passives.
   - A STATUS is a definition in SE.DEFS (data). An INSTANCE lives on a target (dingo, creature, pup).
   - Every stat the game multiplies (dmg, spd, loot, luck, coin, crit, dodge, move) is answered by SE.mult(target, stat).
   - Skills are data too: SE.SKILLS. SE.cast() applies statuses / hits through the same engine.
   No DOM, no game globals: pure logic, so it runs in node for tests and in the game unchanged. */
const SE = (() => {
"use strict";
const DEFS = {}, SKILLS = {}, PASSIVES = [];
let now = () => Date.now();
const setClock = fn => { now = fn; };
const STATS = ["dmg", "spd", "loot", "luck", "coin", "crit", "dodge", "move", "armor", "heal"];

/* ---------- definitions ----------
   def = {id, name, icon, cls:"boon"|"cond", stack:"refresh"|"extend"|"stacks"|"unique", max, dur (s),
          mods:[{stat, mul} | {stat, add}], tick:{stat:"hp", per, every}, flags:["noact","phasing"], tell, desc} */
function define(def){ if (!def.id) throw new Error("status needs an id"); DEFS[def.id] = Object.assign({cls:"cond", stack:"refresh", max:1, dur:5, mods:[], flags:[]}, def); return DEFS[def.id]; }
function defineSkill(sk){ if (!sk.id) throw new Error("skill needs an id"); SKILLS[sk.id] = Object.assign({cd:10, lvl:1, auto:true, steps:[]}, sk); return SKILLS[sk.id]; }
/* passives: things that aren't statuses but still change stats (gems, scrolls, tomes, time of day).
   fn(target, stat, ctx) → a multiplier (1 = none) or {mul, add} for stats that are chances (crit, dodge, armor). */
function passive(name, fn){ PASSIVES.push({name, fn}); }
function pv(p, t, stat, ctx){ const v = p.fn(t, stat, ctx); if (typeof v === "number") return {mul:v, add:0}; if (v && typeof v === "object") return {mul:v.mul ?? 1, add:v.add || 0}; return {mul:1, add:0}; }

/* ---------- instances on a target ---------- */
function list(t){ if (!t.st) t.st = []; return t.st; }
function get(t, id){ return list(t).find(s => s.id === id && (!s.until || s.until > now())) || null; }
function has(t, id){ return !!get(t, id); }
function stacks(t, id){ const s = get(t, id); if (!s) return 0; if (s.q){ const T = now(); const live = s.q.filter(x => !x.u || x.u > T); if (live.length !== s.q.length){ s.q = live; s.stacks = live.length; } } return s.stacks; }
/* apply(target, id, {dur, stacks, per, src, data, mods}) → the instance. `mods` on the instance override the def's (a brew's tier, an elite's armor). */
function apply(t, id, o = {}){
  const D = DEFS[id]; if (!D) throw new Error("unknown status " + id);
  const L = list(t), T = now(), dur = (o.dur ?? D.dur) * 1000;
  if (D.cls === "cond" && flag(t, "resist")) return null; /* a Resist boon shrugs conditions off */
  let s = L.find(x => x.id === id);
  if (s && s.until && s.until <= T){ L.splice(L.indexOf(s), 1); s = null; }
  const n = o.stacks ?? 1;
  if (!s){ s = {id, stacks:Math.min(D.max, n), until: dur > 0 ? T + dur : 0, per:o.per || 0, src:o.src || null, data:o.data || null, mods:o.mods || null, at:T};
    if (D.stack === "stacks"){ s.q = []; for (let i = 0; i < s.stacks; i++) s.q.push({u:s.until, per:o.per || 0}); }
    L.push(s); if (D.onApply) D.onApply(t, s, o); return s; }
  if (o.data) s.data = o.data; if (o.mods) s.mods = o.mods;
  switch (D.stack){
    case "refresh": s.until = dur > 0 ? T + dur : 0; s.per = Math.max(s.per, o.per || 0); break;
    /* stacks long: durations queue up (GW2 Chilled), capped by maxDur so a fast weapon can't freeze something forever */
    case "extend": s.until = Math.min((s.until || T) + dur, D.maxDur ? T + D.maxDur * 1000 : Infinity); break;
    /* stacks up: every application is its own stack with its own timer and strength (GW2 Bleeding); the oldest falls off first */
    case "stacks": s.q = (s.q || []).filter(x => x.u > T); for (let i = 0; i < n && s.q.length < D.max; i++) s.q.push({u:dur > 0 ? T + dur : 0, per:o.per || 0}); s.stacks = s.q.length; s.until = s.q.some(x => !x.u) ? 0 : Math.max(...s.q.map(x => x.u)); s.per = Math.max(s.per, o.per || 0); break;
    case "unique": break;
  }
  if (o.src) s.src = o.src; return s;
}
/* cleanse(target, n, cls): remove n statuses of a class (conditions by default), newest first. Potions and Second Wind call this. */
function cleanse(t, n = 1, cls = "cond"){ const L = active(t).filter(({D}) => D.cls === cls).sort((a, b) => (b.s.at || 0) - (a.s.at || 0)).slice(0, n); L.forEach(({s}) => remove(t, s.id)); return L.map(({s}) => s.id); }
/* rule(def): the one plain line every tooltip ends with: what it does is the desc; this says how it stacks and how long */
function rule(D){ const d = D.dur ? (D.dur >= 60 ? Math.round(D.dur / 60) + " min" : D.dur + " s") : ""; if (D.stack === "stacks") return "Stacks up to " + D.max + ". " + (d ? "Each stack lasts " + d + "." : ""); if (D.stack === "extend") return "Stacks longer, not stronger" + (D.maxDur ? " (up to " + D.maxDur + " s)" : "") + ". " + (d ? d + " a hit." : ""); if (D.stack === "unique" || !D.dur) return "Part of what it is."; return d + ". Reapplying restarts it."; }
function remove(t, id){ const L = list(t); const i = L.findIndex(s => s.id === id); if (i < 0) return false; const s = L[i]; L.splice(i, 1); const D = DEFS[id]; if (D && D.onExpire) D.onExpire(t, s, "removed"); return true; }
function clear(t, cls){ list(t).slice().forEach(s => { if (!cls || DEFS[s.id].cls === cls) remove(t, s.id); }); }
/* active, non-expired instances with their defs (for UI and math) */
function active(t){ const T = now(); return list(t).filter(s => !s.until || s.until > T).map(s => ({s, D:DEFS[s.id]})); }
function flag(t, f){ return active(t).some(({D}) => D.flags.includes(f)); }
function timeLeft(t, id){ const s = get(t, id); return s && s.until ? Math.max(0, (s.until - now()) / 1000) : 0; }

/* ---------- the one stat function ----------
   mult(target, stat) = Π(status mods, each scaled by stacks when the def says so) × Π(passives) + adds folded in. */
/* tiers: one table says what Lesser, the thing itself (base) and Greater mean for every stat; a mod just names its tier
   ({stat:"spd", tier:"greater"} is a Greater Zoomies). Same tier never stacks (the best one counts); the three tiers do:
   Lesser × base × Greater is the most one stat can carry. Untiered mods keep multiplying as before (legacy, until every status names a tier). */
const TIERS = {lesser:{mul:1.10}, base:{mul:1.20}, greater:{mul:1.35}};
function tiered(t, stat, out){ const best = {}; for (const {s, D} of active(t)){ for (const mod of (s.mods || D.mods)){ if (mod.stat !== stat || !mod.tier) continue; const T = TIERS[mod.tier]; if (!T) continue; const v = T[stat] ?? T.mul; if (!best[mod.tier] || v > best[mod.tier]) best[mod.tier] = v; if (out) out.push({from:D.name, tier:mod.tier, mul:v}); } } let m = 1; for (const k in best) m *= best[k]; return m; }
function mult(t, stat, ctx){
  let m = 1, add = 0;
  for (const {s, D} of active(t)){ for (const mod of (s.mods || D.mods)){ if (mod.stat !== stat || mod.tier) continue; const k = mod.perStack ? stacks(t, s.id) : 1; if (mod.mul != null) m *= Math.pow(mod.mul, k); if (mod.add != null) add += mod.add * k; } }
  m *= tiered(t, stat);
  for (const p of PASSIVES){ const v = pv(p, t, stat, ctx); m *= v.mul; add += v.add; }
  return m * (1 + add);
}
/* sum(target, stat) = the adds alone (statuses × stacks + passives): the number for chance stats (crit, dodge, armor) */
function sum(t, stat, ctx){ let add = 0; for (const {s, D} of active(t)){ for (const mod of (s.mods || D.mods)){ if (mod.stat === stat && mod.add != null) add += mod.add * (mod.perStack ? stacks(t, s.id) : 1); } } for (const p of PASSIVES) add += pv(p, t, stat, ctx).add; return add; }
function explain(t, stat, ctx){ const out = []; { const tiers = []; tiered(t, stat, tiers); const best = {}; tiers.forEach(x => { if (!best[x.tier] || x.mul > best[x.tier].mul) best[x.tier] = x; }); tiers.forEach(x => out.push({from:x.from + " (" + x.tier + ")", mul: best[x.tier] === x ? x.mul : 1, add:0, tier:x.tier, counted: best[x.tier] === x})); }
  for (const {s, D} of active(t)){ for (const mod of (s.mods || D.mods)){ if (mod.stat !== stat || mod.tier) continue; const k = mod.perStack ? s.stacks : 1; out.push({from:D.name, mul: mod.mul != null ? Math.pow(mod.mul, k) : 1, add: mod.add != null ? mod.add * k : 0}); } } for (const p of PASSIVES){ const v = pv(p, t, stat, ctx); if (v.mul !== 1 || v.add) out.push({from:p.name, mul:v.mul, add:v.add}); } return out; }

/* ---------- time ----------
   tick(target, dt seconds, ctx) → events [{type:"expire"|"tick", id, amount}] ; DoTs call ctx.damage(target, amount, id) */
function tick(t, dt, ctx = {}){
  const ev = [], T = now(), L = list(t);
  for (let i = L.length - 1; i >= 0; i--){ const s = L[i], D = DEFS[s.id];
    if (s.until && s.until <= T){ L.splice(i, 1); if (D.onExpire) D.onExpire(t, s, "expired"); ev.push({type:"expire", id:s.id}); continue; }
    if (s.q){ const live = s.q.filter(x => !x.u || x.u > T); if (live.length !== s.q.length){ s.q = live; s.stacks = live.length; ev.push({type:"stack", id:s.id, stacks:s.stacks}); } }
    if (D.tick){ s.acc = (s.acc || 0) + dt; const every = D.tick.every || 1; while (s.acc >= every){ s.acc -= every; const amt = D.tick.perStack ? (s.q ? s.q.reduce((a, x) => a + (x.per || D.tick.per || 0), 0) : (s.per || D.tick.per || 0) * s.stacks) : (s.per || D.tick.per || 0); if (amt && ctx.damage && D.tick.stat === "hp") ctx.damage(t, amt, s.id); if (amt && ctx.heal && D.tick.stat === "heal") ctx.heal(t, amt, s.id); ev.push({type:"tick", id:s.id, amount:amt}); } }
  }
  return ev;
}

/* ---------- skills ----------
   skill = {id, name, icon, lvl, cd (s), auto, needs:"target"|"targets" (cast refuses without one), steps:[ {do:"status", to:"self"|"target"|"targets", id, dur, stacks}
                                                     | {do:"hit", to:"target"|"targets", mult}
                                                     | {do:"call", fn:"name", args}  (handled by ctx.call) ]}
   ctx = {level, self, target, targets, cdMult (×cooldown; .75 = faster), hit(target, mult, skill), call(name, args, skill), note(text)} */
const CD = {};
function ready(id, ctx){ const S = SKILLS[id]; if (!S) return false; if (ctx && ctx.level != null && ctx.level < S.lvl) return false; return (CD[id] || 0) <= now(); }
function cooldown(id){ return Math.max(0, ((CD[id] || 0) - now()) / 1000); }
function cast(id, ctx = {}){
  const S = SKILLS[id]; if (!S || !ready(id, ctx)) return false;
  if (S.needs === "target" && !ctx.target) return false; if (S.needs === "targets" && !(ctx.targets && ctx.targets.length)) return false;
  CD[id] = now() + S.cd * 1000 * (ctx.cdMult || 1);
  for (const st of S.steps){
    const who = st.to === "self" ? [ctx.self] : st.to === "target" ? [ctx.target] : (ctx.targets || []);
    if (st.do === "status") who.filter(Boolean).forEach(w => apply(w, st.id, {dur:st.dur, stacks:st.stacks, src:id}));
    else if (st.do === "hit" && ctx.hit) who.filter(Boolean).forEach(w => ctx.hit(w, st.mult, S));
    else if (st.do === "call" && ctx.call) ctx.call(st.fn, st.args, S);
  }
  if (ctx.note && S.shout) ctx.note(S.shout);
  return true;
}
function resetCooldowns(){ for (const k in CD) delete CD[k]; }
/* auto-cast: first ready skill in bar order whose auto flag is on (data decides the policy) */
function autoCast(bar, ctx){ for (const id of bar){ const S = SKILLS[id]; if (S && S.auto && ready(id, ctx)){ return cast(id, ctx) ? id : null; } } return null; }

/* ---------- save / load: instances are plain data ---------- */
function save(t){ return list(t).map(s => ({id:s.id, stacks:s.stacks, until:s.until, per:s.per, src:s.src, data:s.data || undefined, mods:s.mods || undefined, q:s.q || undefined})); }
function load(t, arr){ t.st = (arr || []).filter(s => DEFS[s.id]).map(s => Object.assign({}, s)); }

return {DEFS, SKILLS, STATS, TIERS, define, defineSkill, passive, apply, remove, cleanse, rule, clear, get, has, stacks, active, flag, timeLeft, mult, sum, explain, tick, ready, cooldown, cast, resetCooldowns, autoCast, save, load, setClock, _passives:PASSIVES};
})();
if (typeof module !== "undefined") module.exports = SE;
