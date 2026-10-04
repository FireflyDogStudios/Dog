/* ===== v0.50 Pixi field (slice 2 of the port): one canvas inside the Den Stage. The hero is a Den Rig drawn there; the old DOM dingo
   stays as the invisible anchor (position, skill animations, going home) until those move over. Creatures stay DOM until slice 3. ===== */
const PX = {app:null, hero:null, wrap:null, on:false};
async function pixiBoot(){ if (PX.app || typeof PIXI === "undefined" || typeof RIG === "undefined") return; const hero = document.querySelector("section.hero"); if (!hero) return;
  try { const app = new PIXI.Application(); await app.init({backgroundAlpha:0, antialias:true, autoDensity:true, resolution:1, width:STAGE.w, height:STAGE.h, preference:"webgl"});
    app.canvas.id = "pixi"; hero.appendChild(app.canvas); PX.app = app; registerDenRigs(RIG);
    const wrap = new PIXI.Container(); const r = RIG.build(PIXI, "hero"); r.scale.set(88 / 62); r.position.set(-31, -19); /* the rig's centre sits on the wrapper's origin */ wrap.addChild(r); app.stage.addChild(wrap);
    PX.wrap = wrap; PX.hero = r; PX.on = true; document.body.classList.add("pixi-on"); pixiFit(); for (const id in RIG.DEFS) RIG.warm(PIXI, id); app.ticker.add(tk => pixiFrame(tk.deltaMS / 1000)); }
  catch(e){ console.warn("Pixi field off:", e); PX.on = false; } }
function pixiFit(){ if (!PX.app) return; const dpr = Math.min(2, window.devicePixelRatio || 1); PX.app.renderer.resolution = dpr * STAGE.s; PX.app.renderer.resize(STAGE.w, STAGE.h); }
/* v0.51 slice 3: every regular Meadow creature is drawn as one of the nine approved rigs, picked by what it does (its traits). The emoji element
   stays as the anchor (position, hp bar, name, hit/dead classes); the rig follows it. Bosses, megas and titans keep their emoji for now. */
const RIG_BY_TRAIT = [["phasing", "shade"], ["healer", "hollowhorn"], ["flying", "clockhead"], ["swarm", "burrs"], ["splitter", "puffball"], ["shover", "bramble"], ["thrower", "fencepost"], ["fast", "kindling"], ["armored", "fencepost"], ["shield", "mound"]];
function rigFor(E){ if (E.boss || E.megaDef || E.titanDef || E.king || E.thief) return null; const tr = E.traits || []; for (const [t, id] of RIG_BY_TRAIT) if (tr.includes(t)) return id; return "bramble"; }
PX.rigs = new Map(); /* enemy el → rig container */
function rigEnemy(E){ if (!PX.on || !E || !E.el || PX.rigs.has(E.el)) return; const id = rigFor(E); if (!id) return; const r = RIG.build(PIXI, id); r.scale.set((E.el.classList.contains("baby") ? .62 : 1) * 88 / 62); r.rig.seed(((E.x || 0) * .173) % 1); /* not Math.random: drawing must never touch the game's dice */ r.__E = E; PX.app.stage.addChild(r); PX.rigs.set(E.el, r); E.el.classList.add("rigged"); }
function rigEnemiesFrame(dt){ if (!PX.on) return; for (const E of B.enemies) if (!PX.rigs.has(E.el)) rigEnemy(E);
  for (const [el, r] of PX.rigs){ const E = r.__E; if (!document.body.contains(el) || !B.enemies.includes(E) && !el.classList.contains("dead")){ r.destroy({children:true}); PX.rigs.delete(el); continue; }
    const art = el.querySelector(".eart"); if (!art){ r.visible = false; continue; } const s = r.scale.x, ground = el.offsetTop + art.offsetTop + art.offsetHeight, cx = parseFloat(el.style.left) || E.x;
    r.position.set(cx - 31, ground - 19 - 16.5 * s); r.visible = true;
    const dead = el.classList.contains("dead"); r.alpha = dead ? Math.max(0, r.alpha - dt * 2.5) : (el.classList.contains("efade") ? Math.min(1, r.alpha + dt * 2) : 1);
    const rig = r.rig; rig.walk(!dead && !SE.flag(E, "noact") && !el.classList.contains("close")); rig.set("angry", !dead && (el.classList.contains("close") || SE.has(E, "enraged")));
    /* creature conditions (burrs, scorched…) get rig states in a later slice */
    rig.tick(dt); } }
const CSS_MAT = /matrix\(([^)]+)\)/;
function pixiFrame(dt){ const d = $("#dingo"), svg = d && d.querySelector("svg.dingo"); if (!PX.hero || !d || !svg) return; const W = PX.wrap;
  const cs = getComputedStyle(svg), m = CSS_MAT.exec(cs.transform); const M = m ? m[1].split(",").map(Number) : [1, 0, 0, 1, 0, 0];
  W.setFromMatrix(new PIXI.Matrix(M[0], M[1], M[2], M[3], M[4] + d.offsetLeft + 44, M[5] + d.offsetTop + 27)); /* the svg's transform-origin is its centre (44,27) */
  W.alpha = parseFloat(getComputedStyle(d).opacity); W.visible = d.offsetParent !== null && W.alpha > 0;
  const rig = PX.hero.rig; rig.walk(!d.classList.contains("fighting") && !calm);
  if (typeof SE !== "undefined" && typeof DINGO !== "undefined"){ const tells = new Set(SE.active(DINGO).map(({D}) => D.tell).filter(Boolean)); for (const s in RIG.DEFS.hero.states) rig.set(s, tells.has(s)); }
  rig.tick(dt); rigEnemiesFrame(dt); }
function battleFrame(now){
  if (!B.running) return; requestAnimationFrame(battleFrame);
  let dt = Math.min(0.1, (now - (B.last || now))/1000) * (B.timeScale || 1); B.last = now; if (now < (B.freezeUntil||0)) dt = 0;
  if (B.trial) trialTick();
  if (B.chapter && Date.now() > B.chapter.until){ B.enemies.filter(E => E.chapter).forEach(E => { E.el.remove(); B.enemies = B.enemies.filter(x => x !== E); }); B.chapter = null; toast("The boss slipped back into the dark... Try the chapter again when you're ready."); }
  const hero = document.querySelector("section.hero"); if (!hero || hero.style.display === "none" || document.hidden) return;
  if (atHome() || atTown()){ B.last = now; return; }
  const L = battleLayer(), P = dingoPos(); if (!L || !P) return; const H = huntState(), d = $("#dingo");
  if (isHost()){ const hn = document.getElementById("hostnote"); if (hn) hn.remove(); }
  if (!isHost()){ if (!document.getElementById("hostnote")){ const n = document.createElement("div"); n.id = "hostnote"; n.textContent = "Your dingo is hunting on your other device. Tap anywhere to hunt here instead."; L.appendChild(n); } return; }
  if (!B.ghosts.length || B.ghosts.length !== Math.min(5, H.equipped.length)) syncGhosts();
  const bv = baitVal(); if (B.titan){ B.spawnIn = 2; } else if (B.enemies.length < bv.max){ B.spawnIn -= dt * bv.rate * (B.trial ? 2.6 : 1); if (B.spawnIn <= 0){ spawnEnemy(); B.spawnIn = (1.4 + Math.random()*1.2); } }
  glTick(dt, P, !(document.querySelector("section.hero") || {classList:{contains:()=>false}}).classList.contains("halt"));
  B.enemies.sort((a,b) => a.x - b.x); let fighting = false; const walking = !hero.classList.contains("halt"), wv = walking ? STAGE_WALK : 0;
  let prevStop = null, prevG = null, prevA = null; const es = wxMult("espeed"), nowP = performance.now();
  B.enemies.slice().forEach((E,i) => {
    if (E.fixed){ return; }
    if (E.thief){ E.x -= (E.speed * es + wv) * dt; if (E.x < -60){ E.el.remove(); B.enemies = B.enemies.filter(x => x !== E); toast("🦝 The raccoon got away with the loot!"); return; } }
    else if (E.toss){ E.toss.t += dt / 0.7; const k = Math.min(1, E.toss.t); E.x = E.toss.from + (E.toss.to - E.toss.from) * k; E.tossY = Math.sin(k * Math.PI) * 70; if (k >= 1){ E.toss = null; E.tossY = 0; squash(E.el.querySelector(".eart"), 1.25, .8, 200); } }
    else { const air = !!E.flying && !E.boss, big = E.boss || E.king || E.chapter || E.megaDef || E.titanDef, prev = air ? prevA : prevG;
      let stop = prev === null ? P.x + 80 : prev.x + (E.king || prev.king ? 80 : 48);
      if (!big && !E.passing && E.phasing && nowP - (E.hitAt||0) > 1200 && E.x < P.x + 90){ E.passing = true; E.el.classList.add("phasing"); }
      if (E.passing) stop = -1e9;
      if (E.kb){ E.x += E.kb * dt * 8; E.kb = Math.max(0, E.kb - dt * 160); } if (E.boss && E.x > Math.min(P.w, P.view || P.w) - 40 && !E.escaping) E.x = Math.min(P.w, P.view || P.w) - 40;
      const stunned = SE.flag(E, "noact"); syncTells(E.el, E, "st-");
      if (E.x > stop && !E.kb && !stunned) E.x = Math.max(stop, E.x - E.speed * SE.mult(E, "move") * es * dt * (calm ? 3 : 1) * (E.passing ? 1.3 : 1) * (B.trial && !big ? 2.6 : 1) - wv * dt);
      if (!E.passing){ if (prev === null && E.x - P.x <= 82) fighting = true; if (air) prevA = E; else prevG = E; prevStop = E; }
      if (E.ab && !E.passing && !E.dead && !calm && dt > 0 && E.x - P.x < 230){ E.abT += dt; if (E.abT >= E.abCd){ E.abT = 0; abilityFire(E, P, now); } }
      if (!big && !E.passing && E.x < P.x - 40){ E.passing = true; }
      if (E.x < -60){ if (big){ E.el.remove(); B.enemies = B.enemies.filter(x => x !== E); return; } E.x = P.w + 30 + Math.random()*40; E.passing = false; E.hitAt = nowP; E.el.classList.remove("phasing"); } }
    E.el.style.left = E.x + "px"; if (!E.fixed) E.el.style.top = (P.y - (E.titanDef ? 130 : E.megaDef ? 82 : E.king ? 74 : E.boss ? 44 : E.flying ? 50 : 18) - (E.tossY || 0)) + "px"; E.el.querySelector(".ehp i").style.width = Math.max(0, 100*E.hp/E.max) + "%"; E.el.classList.toggle("close", !E.thief && !E.passing && fighting);
    if (!E.dead && dt > 0) SE.tick(E, dt, {damage:(t, amt, id) => { if (t.dead) return; if (id === "scorched") spark(t.x, (parseFloat(t.el.style.top)||0) + 20, "#ff7a3a", false); hitEnemy(t, Math.max(1, Math.round(amt)), false, t.x + (id === "burrs" ? -6 : 8)); }});
    if (E.healer && !E.dead && dt > 0){ E.healT = (E.healT||0) + dt; if (E.healT >= 1){ E.healT = 0; B.enemies.forEach(o => { if (o !== E && !o.dead && o.hp < o.max){ o.hp = Math.min(o.max, o.hp + o.max * 0.03); } }); } }
    });
  if (!fighting && B.enemies.some(E => E.thief && Math.abs(E.x - P.x) < 240)) fighting = true;
  if (fighting && prevStop === null && B.enemies[0]){} 
  { const F = B.enemies.find(E => !E.thief && !E.passing && !E.toss); if (fighting && F && !calm && dt > 0){ F.atk = (F.atk === undefined ? 1 + Math.random() : F.atk) - dt; if (F.atk <= 0){ F.atk = 1.3 + Math.random()*0.9; const art = F.el.querySelector(".eart");
      if (art && art.animate) art.animate([{transform:"translateX(0) scale(1)"},{transform:"translateX(7px) scale(.9,1.1)", offset:.35},{transform:"translateX(-16px) scale(1.15,.9)", offset:.55},{transform:"translateX(0) scale(1)"}], {duration:420, easing:"ease-in-out"});
      setTimeout(() => { if (d){ d.classList.add("flinch"); setTimeout(() => d.classList.remove("flinch"), 130); } }, 230); } } }
  if (d) d.classList.toggle("fighting", fighting); hero.classList.toggle("halt", fighting);
  const inRange = B.enemies.filter(E => E.x - P.x < 260 && !E.passing && !E.toss), t = now/1000;
  B.ghosts.forEach((g,i) => { const a = t*1.6 + i*(Math.PI*2/Math.max(1,B.ghosts.length)), ox = P.x - 24 + Math.cos(a)*40, oy = P.y - 30 + Math.sin(a)*14;
    g.cd -= dt; let rot = 0, sx = 1, sy = 1;
    if (g.fly){ const f = g.fly;
      if (f.phase === "wind"){ f.t += dt/0.09; const k = ease(f.t, "out"), dx = (f.enemy.x + 6) - ox, dy = f.ty - oy, len = Math.hypot(dx, dy) || 1; g.x = ox - dx/len*10*k; g.y = oy - dy/len*6*k; rot = Math.atan2(dy, dx) * 180/Math.PI * k; sx = 1 - .18*k; sy = 1 + .1*k; if (f.t >= 1){ f.phase = "out"; f.t = 0; f.sx = g.x; f.sy = g.y; } }
      else if (f.phase === "out"){ f.t += dt/0.15; const k = ease(f.t, "in"), tx = f.enemy.dead ? f.tx : f.enemy.x + 6; g.x = f.sx + (tx - f.sx)*k; g.y = f.sy + (f.ty - f.sy)*k - Math.sin(k*Math.PI)*14; rot = Math.atan2(f.ty - f.sy, tx - f.sx) * 180/Math.PI; sx = 1 + .5*k; sy = 1 - .3*k;
        if (f.t >= 1){ const crit = Math.random() < critChance(g.w), E = f.enemy;
          if (!E.dead){ spark(tx - 2, f.ty + 4, RARITY_SPARK[g.w.r] || "#fff", crit); const art = E.el.querySelector(".eart"); squash(art, crit ? 1.35 : 1.2, crit ? .7 : .82, crit ? 280 : 200); if (!E.boss) E.kb = crit ? 22 : 10; if (crit){ hitstop(55); heroShake(3, 160); } }
          const dmg0 = E.dead ? 0 : wHit(g, E, crit); if (dmg0 > 0) hitEnemy(E, dmg0, crit);
          if (wClass(g.w) === "boomer" && dmg0 > 0) setTimeout(() => { if (!E.dead){ spark(E.x, (parseFloat(E.el.style.top)||0) + 10, RARITY_SPARK[g.w.r] || "#fff", false); hitEnemy(E, Math.round(dmg0 * 0.6), false); } }, 180);
          const el2 = scrollLv("embers"); if (el2 && !E.dead) SE.apply(E, "scorched", {per: Math.max(1, Math.round(dmg0 * 0.02 * el2)), dur:2, src:"embers"});
          const ec = scrollLv("echo"); if (ec && Math.random() < 0.06 + 0.02*ec){ setTimeout(() => { if (!E.dead){ spark(E.x, (parseFloat(E.el.style.top)||0) + 12, "#cfd8ff", false); if (compOn("tempest")){ lightning(E.x); SE.apply(E, "scorched", {per: Math.max(1, Math.round(dmg0 * 0.1)), dur:3, src:"tempest"}); hitEnemy(E, Math.round(dmg0 * 1.5), true); } hitEnemy(E, dmg0, false); } }, 90); }
          f.tx = tx; f.phase = "back"; f.t = 0; } }
      else { f.t += dt/0.26; const k = ease(f.t, "out"); g.x = f.tx + (ox - f.tx)*k; g.y = f.ty + (oy - f.ty)*k; sx = 1 + .15*(1-k); sy = 1 - .1*(1-k); if (f.t >= 1) g.fly = null; } }
    else { g.x = ox; g.y = oy + Math.sin(t*3 + i)*1.5; if (fighting && inRange.length && g.cd <= 0 && dt > 0 && !(performance.now() < (B.dazedUntil||0))){ const tgt = inRange[i % inRange.length]; g.cd = 1 / (g.w.spd * spdMult() * (hasTrait(g.w,"swift") ? 1.2 : 1)); g.fly = {phase: calm ? "out" : "wind", t:0, tx: tgt.x + 6, ty: (parseFloat(tgt.el.style.top)||0) + 16, enemy: tgt, sx: ox, sy: oy}; } }
    if (g.fly && g.fly.phase !== "wind") trailDot(g); g.el.style.transform = `translate(${g.x}px, ${g.y}px) rotate(${rot.toFixed(1)}deg) scale(${sx.toFixed(2)},${sy.toFixed(2)})`; });
  pupFrame(dt, P, fighting, inRange);
  shadowFrame(dt, P); wxFrame(dt, P); fxFrame(dt, P, walking); if (!H.stMig){ H.stMig = 1; migrateBoosts(); } if (!H.stMig2){ H.stMig2 = 1; SE.active(DINGO).forEach(({s}) => { if (s.id.startsWith("treat-") && TREATS[s.id.slice(6)]) s.mods = treatMods(s.id.slice(6)); (s.mods || []).forEach(m => { if (m.stat === "meat") m.stat = "loot"; }); }); } SE.tick(DINGO, dt); syncTells($("#dingo"), DINGO, "tell-", true); megaFrame(dt, P); titanFrame(dt, P, performance.now()); tickSkillBar();
  if (H.autoCast && fighting){ B.acIn = (B.acIn||0) - dt; if (B.acIn <= 0){ B.acIn = 1; const id = SE.autoCast(SKILL_BAR, skillCtx()); if (id){ if (SKILL_FX[id]) SKILL_FX[id](); renderSkillBar(); } } }
  H.lastSeen = Date.now();
  B.saveIn -= dt; if (B.saveIn <= 0){ B.saveIn = 30; claimHost(); save("Hunt saved", true); }
}
