/* ===== Abilities (Nonstop Knight style) + weather & world events ===== */
/* v0.48: skills are engine data (SE.SKILLS, from registerDen). The game keeps only the bar order, the emoji and the words, and the fx. */
const SKILL_BAR = ["pounce", "whirl", "howl", "shadow", "feast"];
const SKILL_WORDS = {pounce:["🐾", "Leap at the front creature for 8× your damage"], whirl:["🌀", "Spin through every creature in range for 3× damage each"], howl:["🐺", "+60% damage and +40% attack speed for 8 seconds"], shadow:["👻", "Summon 3 ghost dingos that fight beside you for 10 seconds"], feast:["🍖", "Triple drops for 12 seconds"]};
SKILL_BAR.forEach(id => { const S = SE.SKILLS[id]; S.emoji = SKILL_WORDS[id][0]; S.desc = SKILL_WORDS[id][1]; });
const SKILLS = SKILL_BAR.map(id => SE.SKILLS[id]);
const SK = {shadowUntil:0, shadows:[], built:false};
function skillCtx(){ const P = dingoPos(), front = B.enemies[0], inR = P ? B.enemies.filter(E => E.x - P.x < 260) : [];
  return {level:playerLevel(), self:DINGO, target:inR.length ? front : null, targets:inR, cdMult: tomeOn("echoes") ? 0.75 : 1,
    hit:(E, mult, S) => { if (S.id === "pounce"){ setTimeout(() => { if (E && !E.dead){ spark(E.x, (parseFloat(E.el.style.top)||0) + 16, "#ffd34d", true); squash(E.el.querySelector(".eart"), 1.45, .6, 320); if (!E.boss) E.kb = 30; hitstop(110); heroShake(7, 260); hitEnemy(E, Math.round(totalDps() * mult * dmgMult()), true); } }, 300); }
      else { const i = inR.indexOf(E); setTimeout(() => hitEnemy(E, Math.round(totalDps() * mult * dmgMult()), false), 120 + Math.max(0, i)*60); } },
    call:(fn, args) => { if (fn === "ghosts"){ SK.shadowUntil = performance.now() + args.dur*1000; spawnShadows(); } },
    note:() => {}}; }
const SKILL_FX = {
  pounce: () => { skillFx("pounce", 560); sfx("coin"); },
  whirl: () => { skillFx("whirl", 700); ringFx("#8fd1ff", true); sfx("chest"); },
  howl: () => { skillFx("howling", 8000); ringFx("#ffd34d"); setTimeout(() => ringFx("#ffd34d"), 250); setTimeout(() => ringFx("#ffd34d"), 500); howlSound(); toast("🐺 AWOOO! Your pack is fired up!"); },
  shadow: () => sfx("level"),
  feast: () => { toast("🍖 Feast Frenzy! Triple drops for 12 seconds!"); sfx("chest"); }
};
function skillReady(s){ return SE.ready(s.id, {level:playerLevel()}); }
function totalDps(){ return Math.max(1, dingoDps()); }
function skillFx(cls, ms){ const d = $("#dingo"); if (!d || calm) return; d.classList.remove(cls); void d.offsetWidth; d.classList.add(cls); setTimeout(() => d.classList.remove(cls), ms); }
function ringFx(color, big){ const L = battleLayer(), P = dingoPos(); if (!L || !P || calm) return; const r = document.createElement("span"); r.className = "skring" + (big ? " big" : ""); r.style.cssText = `left:${P.x-20}px;top:${P.y}px;border-color:${color};box-shadow:0 0 16px ${color}`; L.appendChild(r); setTimeout(() => r.remove(), 800); }
function howlSound(){ if (!soundOn || !AU.ready) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const now = actx.currentTime, o = actx.createOscillator(), g = actx.createGain(), lfo = actx.createOscillator(), lg = actx.createGain();
  o.type = "sine"; lfo.frequency.value = 5; lg.gain.value = 8; lfo.connect(lg).connect(o.frequency); o.frequency.setValueAtTime(380, now); o.frequency.exponentialRampToValueAtTime(620, now+.4); o.frequency.exponentialRampToValueAtTime(480, now+1.3);
  g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(.08, now+.15); g.gain.exponentialRampToValueAtTime(.0001, now+1.4); o.connect(g).connect(auOut()); o.start(now); lfo.start(now); o.stop(now+1.5); lfo.stop(now+1.5); } catch(e){} }
function castSkill(id){ if (!SE.cast(id, skillCtx())) return false; if (SKILL_FX[id]) SKILL_FX[id](); renderSkillBar(); return true; }
function spawnShadows(){ const L = battleLayer(), src = document.querySelector("#dingo svg"); if (!L || !src) return; SK.shadows.forEach(s => s.el.remove()); SK.shadows = [];
  for (let i=0;i<3;i++){ const el = document.createElement("span"); el.className = "shadowdingo"; el.innerHTML = src.outerHTML; L.appendChild(el); SK.shadows.push({el, cd: i*0.2, off: i}); } }
function shadowFrame(dt, P){ if (!SK.shadows.length) return; const now = performance.now();
  if (now > SK.shadowUntil){ SK.shadows.forEach(s => { s.el.classList.add("fade"); setTimeout(() => s.el.remove(), 500); }); SK.shadows = []; return; }
  SK.shadows.forEach((s,i) => { const tgt = B.enemies[i % Math.max(1,B.enemies.length)]; const x = tgt ? tgt.x - 70 - i*6 : P.x + 30 + i*30, y = P.y - 20 - i*10;
    s.el.style.transform = `translate(${x}px, ${y + Math.sin(now/200 + i)*4}px)`; s.cd -= dt; if (tgt && s.cd <= 0 && tgt.x - P.x < 300){ s.cd = 0.5; hitEnemy(tgt, Math.max(1, Math.round(totalDps() * 0.25 * dmgMult())), false); } }); }
/* v0.49 step 5, tells: a target's statuses become classes on its drawing. Creatures get `st-<id>`; the dingo gets `tell-<tell>` from each status's `tell`
   (hackles, ears-back, head-low, paw-shake, howl, shake, fluff, ears-up). The old hero draws none of these yet; the new hero's rig reads them. */
function syncTells(el, t, prefix, byTell){ if (!el) return; const want = new Set(SE.active(t).map(({s, D}) => byTell ? D.tell : s.id).filter(Boolean).map(k => prefix + k));
  const have = el._tells || (el._tells = new Set()); if (want.size === have.size && [...want].every(k => have.has(k))) return;
  have.forEach(k => { if (!want.has(k)) el.classList.remove(k); }); want.forEach(k => { if (!have.has(k)) el.classList.add(k); }); el._tells = want; }
function skillMult(kind){ if (kind === "dmg") return SE.has(DINGO, "rally") ? 1.6 : 1; if (kind === "spd") return SE.has(DINGO, "rally") ? 1.4 : 1; if (kind === "loot") return SE.has(DINGO, "feast") ? 3 : 1; return 1; }
function renderSkillBarHome(){ const skb = $("#skills"); if (!skb) return; let hb = skb.querySelector(".homeslot"); if (!hb){ hb = document.createElement("span"); hb.className = "homeslot"; skb.appendChild(hb); } hb.innerHTML = homeButton(); }
function renderSkillBar(){ const box = $("#skills"); if (!box || !state) return; const lvl = playerLevel(), H = huntState();
  box.innerHTML = `<div class="skbar">${SKILLS.map(s => { const locked = lvl < s.lvl; return `<button class="skbtn${locked ? " locked" : ""}" data-skill="${s.id}" title="${esc(s.name)}: ${esc(s.desc)}" ${locked ? "disabled" : ""}><span class="skic">${emoImg(s.emoji)}</span><span class="skcd" id="skcd-${s.id}"></span><span class="sknm">${locked ? "Lv " + s.lvl : esc(s.name)}</span></button>`; }).join("")}
    <label class="skauto"><input type="checkbox" data-skauto ${H.autoCast ? "checked" : ""}> Auto-cast</label><span class="wxpill" id="wxpill"></span></div>`; }
function tickSkillBar(){ SKILLS.forEach(s => { const el = document.getElementById("skcd-" + s.id); if (!el) return; const left = SE.cooldown(s.id) * 1000, frac = left / (s.cd*1000);
  el.style.background = left > 0 ? `conic-gradient(rgba(0,0,0,.62) ${frac*360}deg, transparent 0)` : "transparent"; el.textContent = left > 0 ? Math.ceil(left/1000) : ""; el.parentElement.classList.toggle("ready", left <= 0 && playerLevel() >= s.lvl); }); }
document.addEventListener("click", ev => { const b = ev.target.closest("[data-skill]"); if (b){ castSkill(b.dataset.skill); } });
document.addEventListener("change", ev => { if (ev.target.matches && ev.target.matches("[data-skauto]")){ huntState().autoCast = ev.target.checked; save(ev.target.checked ? "Auto-cast on" : "Auto-cast off", true); } });

/* weather + world events */
const WEATHER = {
  rain:{icon:"🌧️", name:"Rain", desc:"Creatures slow down in the mud, and drops are 20% bigger", dur:[180,300]},
  storm:{icon:"⛈️", name:"Thunderstorm", desc:"Lightning strikes creatures for big damage", dur:[120,200]},
  fog:{icon:"🌫️", name:"Fog", desc:"+15% crit chance and crits hit for 3×", dur:[150,260]},
  wind:{icon:"🌬️", name:"Windy", desc:"Weapons ride the wind for +25% attack speed", dur:[150,260]},
  snow:{icon:"❄️", name:"Snowfall", desc:"Cozy snow: +15% luck", dur:[180,300], months:["12","01","02"]},
  heat:{icon:"🔥", name:"Heat Wave", desc:"Creatures are sluggish (−25% speed), but everyone needs more water breaks", dur:[150,240], months:["06","07","08"]}
};
const WORLD = {
  raccoon:{icon:"🦝", name:"Sneaky Raccoon", desc:"A raccoon is running off with loot. Catch it before it escapes!", dur:[20,20]},
  stampede:{icon:"🐾", name:"Stampede", desc:"A rush of creatures is coming. Big drops!", dur:[25,25]},
  rainbow:{icon:"🌈", name:"Rainbow", desc:"+50% luck on rolls and baskets", dur:[60,90]},
  ghosts:{icon:"👻", name:"Ghost Parade", desc:"Friendly ghosts drift through the woods. Tap them for candy!", dur:[45,70]}
};
const WX = {w:null, wUntil:0, e:null, eUntil:0, nextRoll:60, strikeIn:4, spawnFx:0};
function chorusOn(){ const h = new Date().getHours(); return h >= 18 && h < 21; }
function wxMult(kind){ const w = WX.w && performance.now() < WX.wUntil ? WX.w : null, e = WX.e && performance.now() < WX.eUntil ? WX.e : null; let m = 1;
  if (kind === "loot"){ if (w === "rain") m *= 1.2; if (chorusOn()) m *= 1.25; }
  if (kind === "spd" && w === "wind") m *= 1.25;
  if (kind === "luck"){ if (w === "snow") m *= 1.15; if (e === "rainbow") m *= 1.5; if (chorusOn()) m *= 1.1; }
  if (kind === "espeed"){ if (w === "rain") m *= 0.8; if (w === "heat") m *= 0.75; }
  if (kind === "crit") m = w === "fog" ? 0.15 : 0; if (kind === "critx") m = w === "fog" ? 3 : 2; return m; }
function wxLayer(){ const hero = document.querySelector("section.hero"); if (!hero) return null; let l = hero.querySelector("#wx"); if (!l){ l = document.createElement("div"); l.id = "wx"; l.setAttribute("aria-hidden","true"); hero.appendChild(l); } return l; }
function startWeather(k){ const W = WEATHER[k], L = wxLayer(); if (!W || !L) return; WX.w = k; WX.wUntil = performance.now() + (W.dur[0] + Math.random()*(W.dur[1]-W.dur[0]))*1000;
  L.className = "wx-" + k; L.innerHTML = fxOn() && (k === "rain" || k === "storm" || k === "fog" || k === "snow") ? "" : k === "rain" || k === "storm" ? Array.from({length: k === "storm" ? 34 : 24}, () => `<i class="drop" style="left:${(Math.random()*110).toFixed(1)}%;--d:${(1.1 + Math.random()*0.6).toFixed(2)}s;--dl:${(-Math.random()*2).toFixed(2)}s;--h:${(10 + Math.random()*8).toFixed(0)}px"></i>`).join("") : k === "fog" ? `<i class="fogl"></i><i class="fogl b"></i>` : k === "wind" ? Array.from({length:10}, (_,i) => `<i class="leaf" style="top:${10+Math.random()*75}%;--d:${(2.5+Math.random()*2).toFixed(1)}s;--dl:${(-Math.random()*4).toFixed(1)}s">${emoImg(Math.random()<.5 ? "🍂" : "🍃")}</i>`).join("") : k === "snow" ? Array.from({length:30}, () => `<i class="flake" style="left:${Math.random()*100}%;--d:${(5+Math.random()*6).toFixed(1)}s;--dl:${(-Math.random()*8).toFixed(1)}s"></i>`).join("") : k === "heat" ? `<i class="heatl"></i>` : "";
  toast(W.icon + " " + W.name + " rolls in! " + W.desc); }
function endWeather(){ WX.w = null; const L = wxLayer(); if (L){ L.className = ""; L.innerHTML = ""; } }
function startWorld(k){ const E = WORLD[k]; if (!E) return; WX.e = k; WX.eUntil = performance.now() + (E.dur[0] + Math.random()*(E.dur[1]-E.dur[0]))*1000; WX.spawnFx = 0; toast(E.icon + " " + E.name + "! " + E.desc); sfx("level");
  if (k === "raccoon") spawnEnemy("thief"); if (k === "stampede"){ for (let i=0;i<6;i++) setTimeout(() => spawnEnemy("rush"), i*350); } }
function catchable(icon, x, y, fall, onCatch){ const L = battleLayer(); if (!L) return; const c = document.createElement("button"); c.className = "catch" + (fall ? " fall" : ""); c.innerHTML = emoImg(icon, Math.random()); c.style.left = x + "px"; c.style.top = y + "px"; c.setAttribute("aria-label", "Catch");
  c.addEventListener("click", ev => { ev.stopPropagation(); if (c.dataset.got) return; c.dataset.got = 1; c.classList.add("got"); lastPt = {x: ev.clientX, y: ev.clientY}; onCatch(); setTimeout(() => c.remove(), 300); });
  L.appendChild(c); setTimeout(() => c.remove(), fall ? 2600 : 7000); }
function wxFrame(dt, P){
  const now = performance.now();
  if (WX.w && now > WX.wUntil){ const was = WX.w; endWeather(); if (was === "rain" || was === "storm"){ if (Math.random() < 0.6) startWorld("rainbow"); } }
  if (WX.e && now > WX.eUntil){ WX.e = null; }
  WX.nextRoll -= dt * (tomeOn("starfall") ? 2 : 1) * (dayIs("wed") ? 2 : 1) * (scrollLv("year") ? 1.5 : 1); if (WX.nextRoll <= 0){ WX.nextRoll = 120 + Math.random()*120; const mo = todayIso().slice(5,7);
    if (!WX.w && Math.random() < 0.55){ const opts = Object.keys(WEATHER).filter(k => !WEATHER[k].months || WEATHER[k].months.includes(mo)).concat(["wind","wind"]), F = todaysForecast(); startWeather(Math.random() < 0.5 ? F.w : opts[Math.floor(Math.random()*opts.length)]); }
    else if (!WX.e && Math.random() < 0.6){ const opts = (tomeOn("bandit") ? ["raccoon","raccoon","raccoon","stampede"] : ["raccoon","stampede"]) /* v0.20: Firefly Swarm and Meat Meteors removed for now */.concat(false ? ["ghosts","ghosts"] : []), F = todaysForecast(); startWorld(Math.random() < 0.5 ? F.e : opts[Math.floor(Math.random()*opts.length)]); } }
  if (dayIs("fri")){ B.friIn = (B.friIn === undefined ? 300 : B.friIn) - dt; if (B.friIn <= 0 && !WX.e){ B.friIn = 900; startWorld("stampede"); } }
  if (WX.e === "ghosts"){ WX.spawnFx -= dt; if (WX.spawnFx <= 0){ WX.spawnFx = 1.3; catchable("👻", 40 + Math.random()*(P.w - 80), 20 + Math.random()*(P.h*0.5), false, () => { const c = Math.max(2, Math.round(3 * Math.max(1, killCandy(enemyHP(false) * 1.2 * lootMult())))); addEvCur(c); floatText("+" + c + " 🍬"); sfx("coin"); updateHuntHud(); }); } }
  if (WX.w === "storm" || tomeOn("storms") || compOn("tempest")){ WX.strikeIn -= dt; if (WX.strikeIn <= 0){ WX.strikeIn = 3 + Math.random()*3; const tgt = B.enemies[Math.floor(Math.random()*B.enemies.length)]; lightning(tgt ? tgt.x : P.x + 200 + Math.random()*200); if (tgt){ hitEnemy(tgt, Math.round(totalDps() * 3), true); SE.apply(tgt, "shocked", {stacks:2, src:"storm"}); } const sl = scrollLv("storm"); if (sl && tgt){ B.enemies.filter(x => x !== tgt).slice(0, 1 + Math.floor(sl/2)).forEach((x,i) => setTimeout(() => { if (!x.dead){ lightning(x.x); hitEnemy(x, Math.round(totalDps() * 1.5), false); SE.apply(x, "shocked", {src:"storm"}); } }, 120*(i+1))); } } }
  
  
  const pill = document.getElementById("wxpill"); if (pill){ const parts = [zone().home ? season().icon + " " + season().name + " · " + TOD[tod()].icon + " " + TOD[tod()].name : zone().icon + " " + zone().name, (dayTheme().fun ? "🎉 " : "📅 ") + dayName()]; if (WX.w) parts.push(WEATHER[WX.w].icon + " " + WEATHER[WX.w].name + " " + fmtTime((WX.wUntil - now)/1000)); if (WX.e) parts.push(WORLD[WX.e].icon + " " + WORLD[WX.e].name + " " + fmtTime((WX.eUntil - now)/1000)); if (chorusOn()) parts.push("🐸 Evening Chorus"); if (now < SK.howlUntil) parts.push("🐺 Howl"); if (now < SK.feastUntil) parts.push("🍖 Feast"); pill.textContent = parts.join("  ·  "); pill.style.display = parts.length ? "" : "none"; }
}
function fmtTime(s){ s = Math.max(0, Math.round(s)); return Math.floor(s/60) + ":" + String(s%60).padStart(2,"0"); }
function lightning(x){ if (fxOn()){ fxBolt(x, fxGround()); pfx("bolt", x, fxGround() - 4); fxThunder(0.05 + Math.random() * 0.35); return; } sfx("thunder"); const L = battleLayer(), hero = document.querySelector("section.hero"); if (!L || calm) return; const h = hero.offsetHeight; let pts = `${x},0`, y = 0, cx = x; while (y < h - 60){ y += 30 + Math.random()*30; cx += Math.random()*30 - 15; pts += ` ${cx},${y}`; }
  const s = document.createElementNS("http://www.w3.org/2000/svg","svg"); s.setAttribute("class","bolt"); s.setAttribute("width", "100%"); s.setAttribute("height", "100%"); s.innerHTML = `<polyline points="${pts}" fill="none" stroke="#fff" stroke-width="3"/><polyline points="${pts}" fill="none" stroke="#9fd3ff" stroke-width="8" opacity=".4"/>`; L.appendChild(s); hero.classList.add("flashwx"); setTimeout(() => { s.remove(); hero.classList.remove("flashwx"); }, 260); }

