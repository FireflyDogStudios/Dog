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
const nowMs = () => now();
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
/* apply(target, id, {dur, stacks, per, src, data}) → the instance */
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

return {DEFS, SKILLS, STATS, TIERS, define, defineSkill, passive, apply, remove, cleanse, rule, clear, get, has, stacks, active, flag, timeLeft, mult, sum, explain, tick, ready, cooldown, cast, resetCooldowns, autoCast, save, load, setClock, now:nowMs, _passives:PASSIVES};
})();
/* The Den's statuses and skills, as data for the engine. Names are ours (DEN-GAME-COMBAT.md). Icons are game-icons ids. */
function registerDen(SE){
  const D = SE.define, K = SE.defineSkill;
  /* ----- boons on the dingo ----- */
  D({id:"hackles", name:"Hackles Up", icon:"wolf-head", cls:"boon", stack:"stacks", max:5, dur:8, mods:[{stat:"dmg", mul:1.1, perStack:true}], desc:"Hits harder. Stacks up to 5.", tell:"hackles"});
  D({id:"zoomies", name:"Zoomies", icon:"sprint", cls:"boon", stack:"refresh", dur:8, mods:[{stat:"spd", mul:1.4}, {stat:"move", mul:1.3}], desc:"Attacks and moves faster.", tell:"ears-up"});
  D({id:"thickcoat", name:"Thick Coat", icon:"bordered-shield", cls:"boon", stack:"refresh", dur:10, mods:[{stat:"armor", add:.5}], desc:"Takes half damage.", tell:"fluff"});
  D({id:"sharpnose", name:"Sharp Nose", icon:"sniffing-dog", cls:"boon", stack:"refresh", dur:7200, mods:[{stat:"crit", add:.15}], desc:"+15% crit chance."});
  D({id:"secondwind", name:"Second Wind", icon:"regeneration", cls:"boon", stack:"refresh", dur:6, tick:{stat:"heal", per:1, every:1}, desc:"Mending a little every second."});
  D({id:"rally", name:"Rally Howl", icon:"wolf-howl", cls:"boon", stack:"refresh", dur:8, mods:[{stat:"dmg", mul:1.6}, {stat:"spd", mul:1.4}], desc:"+60% damage and +40% attack speed.", tell:"howl"});
  D({id:"feast", name:"Feast Frenzy", icon:"meat", cls:"boon", stack:"refresh", dur:12, mods:[{stat:"loot", mul:3}], desc:"Triple drops."});
  D({id:"windy", name:"Windy", icon:"wind-slap", cls:"boon", stack:"unique", dur:0, mods:[{stat:"spd", mul:1.25}], desc:"Weapons ride the wind: +25% attack speed."});
  /* brews and treats become statuses too: one entry per kind, strength carried in `per`-like data via mods on apply (see brew helper) */
  D({id:"brew-str", name:"Strength Brew", icon:"crystal-ball", cls:"boon", stack:"refresh", dur:1200, mods:[{stat:"dmg", mul:1.25}], desc:"+25% damage."});
  D({id:"brew-swift", name:"Zoomies Tonic", icon:"crystal-ball", cls:"boon", stack:"refresh", dur:1200, mods:[{stat:"spd", mul:1.15}], desc:"+15% attack speed."});
  D({id:"brew-luck", name:"Lucky Nose", icon:"clover", cls:"boon", stack:"refresh", dur:1200, mods:[{stat:"luck", mul:1.5}], desc:"Luckier finds."});
  D({id:"brew-treasure", name:"Treasure Sniffer", icon:"coins", cls:"boon", stack:"refresh", dur:1200, mods:[{stat:"coin", mul:2}], desc:"Rare coins twice as often."});
  D({id:"treat-kibble", name:"Crunchy Kibble", icon:"meat", cls:"boon", stack:"refresh", dur:900, mods:[{stat:"spd", mul:1.2}], desc:"+20% attack speed."});
  D({id:"treat-broth", name:"Warm Bone Broth", icon:"meat", cls:"boon", stack:"refresh", dur:1200, mods:[{stat:"dmg", mul:1.25}], desc:"+25% damage."});
  D({id:"treat-apple", name:"Apple Chew", icon:"meat", cls:"boon", stack:"refresh", dur:900, mods:[{stat:"luck", mul:1.4}], desc:"+40% luck."});
  D({id:"treat-jerky", name:"Pepper Jerky", icon:"meat", cls:"boon", stack:"refresh", dur:600, mods:[{stat:"crit", add:.15}], desc:"+15% crit chance."});
  /* ----- conditions on the dingo (what creatures do to him; the icon is the only announcement) ----- */
  D({id:"weakened", name:"Weakened", icon:"footprint", cls:"cond", stack:"extend", maxDur:14, dur:7, mods:[{stat:"dmg", mul:.7}], desc:"−30% damage.", tell:"head-low"});
  D({id:"sluggish", name:"Sluggish", icon:"snowflake-1", cls:"cond", stack:"extend", maxDur:14, dur:7, mods:[{stat:"spd", mul:.7}], desc:"−30% attack speed.", tell:"head-low"});
  D({id:"dazzled", name:"Dazzled", icon:"ghost", cls:"cond", stack:"extend", maxDur:14, dur:7, mods:[{stat:"dodge", add:-.25}], desc:"Some attacks miss.", tell:"shake"});
  D({id:"muddypaws", name:"Muddy Paws", icon:"footprint", cls:"cond", stack:"stacks", max:3, dur:6, mods:[{stat:"move", mul:.8, perStack:true}, {stat:"spd", mul:.92, perStack:true}], desc:"Slowed. Stacks up to 3.", tell:"paw-shake"});
  D({id:"spooked", name:"Spooked", icon:"ghost", cls:"cond", stack:"extend", maxDur:8, dur:4, mods:[{stat:"dmg", mul:.85}], flags:["flee"], desc:"Backs off for a moment.", tell:"ears-back"});
  D({id:"dazed", name:"Dazed", icon:"sleepy", cls:"cond", stack:"refresh", dur:1, flags:["noact"], desc:"Can't act for a moment.", tell:"shake"});
  /* ----- conditions on creatures (what weapons do) ----- */
  D({id:"burrs", name:"Burrs", icon:"thorny-vine", cls:"cond", stack:"stacks", max:5, dur:6, tick:{stat:"hp", every:.5, perStack:true}, desc:"Bleeding. Every burr bleeds on its own."});
  D({id:"scorched", name:"Scorched", icon:"flame", cls:"cond", stack:"stacks", max:5, dur:4, tick:{stat:"hp", every:.5, perStack:true}, desc:"Burning. Every stack burns on its own."});
  D({id:"frostbit", name:"Frostbit", icon:"snowflake-1", cls:"cond", stack:"extend", maxDur:6, dur:3, mods:[{stat:"move", mul:.5}], desc:"Moves at half speed."});
  D({id:"stunned", name:"Stunned", icon:"sleepy", cls:"cond", stack:"refresh", dur:.5, flags:["noact"], desc:"Can't act."});
  D({id:"shocked", name:"Shocked", icon:"lightning-frequency", cls:"cond", stack:"stacks", max:10, dur:6, mods:[{stat:"armor", add:-.03, perStack:true}], desc:"Takes 3% more damage per stack. Pile it on."});
  /* ----- creature boons (from traits; the status engine replaces one-off trait checks) ----- */
  D({id:"armored", name:"Armored", icon:"bordered-shield", cls:"boon", stack:"unique", dur:0, mods:[{stat:"armor", add:.5}], desc:"Takes half damage unless hit by Blunt or Breaker weapons."});
  D({id:"shielded", name:"Shielded", icon:"checked-shield", cls:"boon", stack:"unique", dur:0, desc:"A shield soaks damage first. Breakers shred it."});
  D({id:"flying", name:"Flying", icon:"feather", cls:"boon", stack:"unique", dur:0, flags:["flying"], desc:"Hovers. Ranged weapons hit it harder."});
  D({id:"quick", name:"Quick", icon:"sprint", cls:"boon", stack:"unique", dur:0, mods:[{stat:"dodge", add:.2}, {stat:"move", mul:1.5}], desc:"Fast and dodgy. Ranged weapons never miss."});
  D({id:"healer", name:"Healer", icon:"regeneration", cls:"boon", stack:"unique", dur:0, flags:["healer"], desc:"Slowly mends the creatures around it."});
  D({id:"phasing", name:"Phasing", icon:"ghost", cls:"boon", stack:"unique", dur:0, flags:["phasing"], desc:"Can't be hit while it isn't solid."});
  D({id:"enraged", name:"Enraged", icon:"fangs", cls:"boon", stack:"refresh", dur:20, mods:[{stat:"dmg", mul:1.5}, {stat:"spd", mul:1.3}], desc:"Hits the field harder and faster."});
  /* ----- skills (keys 1–5 today; weapon-driven later) ----- */
  K({id:"pounce", name:"Pounce", icon:"paw", lvl:1, cd:12, needs:"target", steps:[{do:"hit", to:"target", mult:8}], shout:"Pounce!"});
  K({id:"whirl", name:"Zoomies Whirl", icon:"spiral", lvl:2, cd:25, needs:"targets", steps:[{do:"hit", to:"targets", mult:3}, {do:"status", to:"self", id:"zoomies", dur:3}], shout:"Zoomies!"});
  K({id:"howl", name:"Rally Howl", icon:"wolf-howl", lvl:3, cd:45, steps:[{do:"status", to:"self", id:"rally", dur:8}], shout:"Awooo!"});
  K({id:"shadow", name:"Shadow Pack", icon:"ghost", lvl:5, cd:60, steps:[{do:"call", fn:"ghosts", args:{n:3, dur:10}}], shout:"The pack runs with me!"});
  K({id:"feast", name:"Feast Frenzy", icon:"meat", lvl:7, cd:90, steps:[{do:"status", to:"self", id:"feast", dur:12}], shout:"Feast!"});
}
registerDen(SE); /* wall clock: the dingo's statuses survive a reload; creatures don't need to */
/* the dingo as a status target; its instances live in the hunt save (state.hunt.st) so they persist and sync */
const DINGO = { get st(){ const H = typeof huntState === "function" && typeof state !== "undefined" && state ? huntState() : null; if (!H) return (DINGO._tmp = DINGO._tmp || []); H.st = H.st || []; return H.st; }, set st(v){ const H = typeof state !== "undefined" && state ? huntState() : null; if (H) H.st = v; else DINGO._tmp = v; } };
/* v0.45: trait boons are display + flags only until step 3 moves armor and dodge into SE.mult */
SE.DEFS.quick.mods = [{stat:"dodge", add:.2}]; /* Quick's move speed still rides E.speed until creatures move through the engine */
