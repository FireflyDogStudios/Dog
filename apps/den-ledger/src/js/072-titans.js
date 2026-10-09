/* ===== Halloween God (Nocturne) and the first TITAN (Omen) ===== */
function batSwarm(G){ const E = G.E; for (let i=0;i<6;i++){ const b = document.createElement("button"); b.className = "voideye batfly"; b.innerHTML = emoImg("🦇"); b.style.top = (10 + Math.random()*75) + "vh"; b.style.left = "-60px"; b.style.setProperty("--dur", (3.5 + Math.random()*2.5) + "s"); b.style.animationDelay = (i*0.25) + "s"; b.setAttribute("aria-label","Swat the bat");
    b.addEventListener("click", ev => { ev.stopPropagation(); if (b.dataset.hit) return; b.dataset.hit = 1; b.classList.add("popped"); if (!E.dead) hitEnemy(E, Math.round(E.max * 0.008), true); setTimeout(() => b.remove(), 250); }, true);
    document.body.appendChild(b); setTimeout(() => { if (b.isConnected && !b.dataset.hit){ b.remove(); if (!E.dead) E.hp = Math.min(E.max, E.hp + E.max * 0.004); } }, 7000); } }
function candyLantern(G){ const b = document.createElement("button"); b.className = "voideye anchor"; b.innerHTML = emoImg("🏮"); b.style.left = (15 + Math.random()*70) + "vw"; b.style.top = (20 + Math.random()*60) + "vh"; b.setAttribute("aria-label","Light the lantern");
  b.addEventListener("click", ev => { ev.stopPropagation(); b.remove(); toast("🏮 Lantern lit! Nocturne recoils from the light."); if (!G.E.dead) hitEnemy(G.E, Math.round(G.E.max * 0.03), true); }, true); document.body.appendChild(b);
  setTimeout(() => { if (b.isConnected){ b.remove(); const n = Math.min(evCur(), 150); if (n > 0 && gameEvent()){ addEvCur(-n); toast("🦇 Nocturne drained " + n + " candy in the dark!"); } } }, 4500); }
const PLANETS = ["🪐","🌕","🌑","🌍","☄️","🌖","🌘","🪨"];
function planetBreak(G){ G.balls = G.balls || []; const cx = innerWidth * 0.5, cy = innerHeight * 0.3; titleCard("🎱 BREAK!", "OMEN racks the planets", G.T.color); heroShake(12, 500);
  document.body.classList.add("tilt"); setTimeout(() => document.body.classList.remove("tilt"), 1800);
  for (let i=0;i<8;i++){ const el = document.createElement("button"); el.className = "planet"; el.innerHTML = emoImg(PLANETS[i % PLANETS.length]); el.setAttribute("aria-label","Pocket the planet"); document.body.appendChild(el);
    const ang = Math.random()*Math.PI*2, sp = 380 + Math.random()*320, ball = {el, x: cx + (i%4)*26 - 40, y: cy + Math.floor(i/4)*26, vx: Math.cos(ang)*sp, vy: Math.sin(ang)*sp, life: 14, cd: 0};
    el.addEventListener("click", ev => { ev.stopPropagation(); if (ball.dead) return; ball.dead = true; el.classList.add("pocket"); const E = G.E; if (!E.dead){ hitEnemy(E, Math.round(E.max * 0.025), true); floatText("🎱 Pocketed!"); sfx("coin"); } setTimeout(() => el.remove(), 350); }, true);
    G.balls.push(ball); } }
function ballsFrame(G, dt){ if (!G.balls || !G.balls.length) return; const hero = document.querySelector("section.hero"), hr = hero ? hero.getBoundingClientRect() : null, W = innerWidth, Hh = innerHeight;
  G.balls.forEach(b => { if (b.dead) return; b.life -= dt; b.cd -= dt; b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x < 24){ b.x = 24; b.vx = Math.abs(b.vx); } if (b.x > W - 24){ b.x = W - 24; b.vx = -Math.abs(b.vx); } if (b.y < 24){ b.y = 24; b.vy = Math.abs(b.vy); } if (b.y > Hh - 24){ b.y = Hh - 24; b.vy = -Math.abs(b.vy); }
    G.balls.forEach(o => { if (o === b || o.dead) return; const dx = o.x - b.x, dy = o.y - b.y, d = Math.hypot(dx, dy); if (d > 0 && d < 46){ const nx = dx/d, ny = dy/d, p = (b.vx - o.vx)*nx + (b.vy - o.vy)*ny; if (p > 0){ b.vx -= p*nx; b.vy -= p*ny; o.vx += p*nx; o.vy += p*ny; } } });
    if (hr && b.cd <= 0 && b.x > hr.left && b.x < hr.right && b.y > hr.top && b.y < hr.bottom){ b.cd = 1.2; heroShake(7, 250); B.dazedUntil = performance.now() + 700; if (!G.E.dead) G.E.hp = Math.min(G.E.max, G.E.hp + G.E.max * 0.004); }
    b.el.style.transform = `translate(${b.x - 24}px, ${b.y - 24}px) rotate(${(b.x + b.y) % 360}deg)`;
    if (b.life <= 0){ b.dead = true; b.el.classList.add("fade"); setTimeout(() => b.el.remove(), 400); } });
  G.balls = G.balls.filter(b => !b.dead || b.el.isConnected); }

/* ===== TITANS: reality-bending bosses ===== */
const TITANS = {
  unmaker:{name:"THE UNMAKER", icon:"👁️", part:["🌀","Hand of Nothing"], color:"#b98cf0", lore:"It doesn't live in the woods. It lives behind them.", title:"Unmaker's Bane",
    phases:["Its hands shield its eye. Break them.","It reaches OUT of the woods. Watch the whole screen.","Reality turns inside out."], weapon:["👁️","Eye of the Unmaker","pierce"]},
  chrono:{name:"CHRONOPHAGE", icon:"⏳", part:["⌛","Stolen Hour"], color:"#ffd34d", lore:"It eats seconds the way you eat meat.", title:"Keeper of Time",
    phases:["It hoards the hours. Shatter them.","It rewinds its wounds. Anchor the moment!","Time itself stutters and races."], weapon:["⏳","Hourglass of Chronophage","stone"]},
  eclipse:{name:"THE HOLLOW SUN", icon:"🌑", part:["☄️","Falling Star"], color:"#ff6b3a", lore:"A sun that forgot how to shine, and wants yours.", title:"Sunbreaker",
    phases:["The light is going out.","Gravity forgets which way is down.","The stars fall. Throw them back!"], weapon:["🌑","Shard of the Hollow Sun","blade"]},
};
function titanState(){ const H = huntState(); H.overpower = H.overpower || 0; H.titanWins = H.titanWins || {}; H.titanScar = H.titanScar || null; return H; }
const OVERPOWER_MAX = 300;
function overpowerTick(){ const H = titanState(); if (B.titan || B.mega || B.chapter || moonActive()) return; if (H.holdBig && H.overpower >= OVERPOWER_MAX) return; if (dropMult(enemyHP(false)) > 0.35) return; H.overpower = Math.min(OVERPOWER_MAX, H.overpower + 1);
  if (H.overpower === Math.round(OVERPOWER_MAX * 0.5)) toast("⚠️ Reality around you is starting to crack. You're far too strong for these woods... something divine is watching.");
  if (H.overpower >= OVERPOWER_MAX && !H.holdBig){ H.overpower = 0; setTimeout(summonTitan, 1500); } }
function pageFx(on){ let c = document.getElementById("titan-crack"), lb = document.getElementById("titan-lb");
  if (!on){ if (c) c.remove(); if (lb) lb.remove(); document.body.classList.remove("titan-on","glitch"); return; }
  if (!c){ c = document.createElement("div"); c.id = "titan-crack"; c.setAttribute("aria-hidden","true"); let paths = ""; for (let k=0;k<5;k++){ let x = Math.random()*100, y = Math.random()*100, d = `M${x} ${y}`; for (let s=0;s<7;s++){ x += Math.random()*18 - 9; y += Math.random()*18 - 9; d += ` L${x.toFixed(1)} ${y.toFixed(1)}`; } paths += `<path d="${d}"/>`; }
    c.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${paths}</svg>`; document.body.appendChild(c); }
  if (!lb){ lb = document.createElement("div"); lb.id = "titan-lb"; lb.setAttribute("aria-hidden","true"); lb.innerHTML = "<i></i><i></i>"; document.body.appendChild(lb); }
  document.body.classList.add("titan-on"); }
function titleCard(big, small, col){ const t = document.createElement("div"); t.className = "titancard"; t.style.setProperty("--tc", col || "#ff4fd8"); t.innerHTML = `<b>${esc(big)}</b><span>${esc(small)}</span>`; document.body.appendChild(t); setTimeout(() => t.remove(), 3800); }
function summonTitan(){ if (B.titan) return; const H = titanState(), oct = isOct() && zone().home, keys = Object.keys(TITANS).filter(k => !TITANS[k].titan && (!TITANS[k].oct || oct)), omenReady = oct && (H.octGodWins||0) >= 3 && !H.titanWins.omen, id = H.titanScar ? H.titanScar.id : omenReady ? "omen" : (oct && Math.random() < 0.4 ? "nocturne" : keys[Math.floor(Math.random()*keys.length)]), T = TITANS[id];
  B.enemies.forEach(E => E.el.remove()); B.enemies = []; pageFx(true); sfx("god"); document.body.classList.add("glitch"); setTimeout(() => document.body.classList.remove("glitch"), 1200); heroShake(14, 900); sfx("level");
  titleCard(T.titan ? "A TITAN RISES" : "A GOD AWAKENS", T.name, T.color); if (T.titan){ document.body.classList.add("titan-omen"); setTimeout(() => titleCard("THE FIRST TITAN", "Gods manage planets. Titans play pool with them.", T.color), 3900); } B.titanNext = {id, T}; setTimeout(() => spawnEnemy("titan"), 1600); }
function titanPartsSpawn(G){ const E = G.E, np = G.T.titan ? 3 : 2; G.parts = []; for (let i=0;i<np;i++){ spawnEnemy("tpart:" + G.T.part[0] + ":" + G.T.part[1]); const p = B.enemies[B.enemies.length-1]; if (!p) continue; p.fixed = true; p.partOf = E; p.pOff = [-80, 80, 0][i]; p.pY = [-40, 10, -90][i]; G.parts.push(p); } E.invuln = true; E.el.classList.add("warded"); }
function titanFrame(dt, P, now){ const G = B.titan; if (!G) return; const E = G.E, hero = document.querySelector("section.hero"), bar = megaBar();
  if (E.dead){ endTitanFx(); B.titan = null; return; }
  G.parts = (G.parts || []).filter(p => !p.dead); G.parts.forEach(p => { p.x = E.x + p.pOff; p.el.style.left = p.x + "px"; p.el.style.top = ((parseFloat(E.el.style.top)||0) + 40 + p.pY + Math.sin(now/300 + p.pOff)*8) + "px"; });
  if (E.invuln && !G.parts.length){ E.invuln = false; E.el.classList.remove("warded"); fieldCue(E.x, (parseFloat(E.el.style.top)||0) - 30, "Exposed!", true); G.regrow = now + 40000; heroShake(6, 300); }
  if (!E.invuln && G.regrow && now > G.regrow && G.id !== "eclipse"){ G.regrow = 0; titanPartsSpawn(G); fieldCue(E.x, (parseFloat(E.el.style.top)||0) - 30, "Guard regrown"); }
  const left = Math.max(0, (G.until - Date.now())/1000), fr = E.hp / E.max, phase = G.T.titan ? (fr < 0.25 ? 3 : fr < 0.5 ? 2 : fr < 0.75 ? 1 : 0) : (fr < 0.33 ? 2 : fr < 0.66 ? 1 : 0);
  if (phase > G.phase){ G.phase = phase; sfx("phase"); titleCard("PHASE " + (phase + 1), G.T.phases[phase], G.T.color); heroShake(12, 700); document.body.classList.add("glitch"); setTimeout(() => document.body.classList.remove("glitch"), 900); }
  if (bar) bar.innerHTML = `<b style="color:${G.T.color}">⚠️ ${G.T.titan ? "TITAN" : "GOD"}: ${esc(G.T.name)} · Phase ${G.phase+1}/${G.T.titan ? 4 : 3}</b><span class="mhp titan"><i style="width:${Math.max(0, 100*E.hp/E.max)}%"></i></span><span class="mtime${left < 30 ? " low" : ""}">⏱️ ${Math.floor(left/60)}:${String(Math.floor(left%60)).padStart(2,"0")}${E.invuln ? " · 🛡️ IMMUNE: break its guard" : ""}${G.anchor ? " · ⚓ TAP THE ANCHOR!" : ""}</span>`;
  if (left <= 0){ const H = titanState(); H.titanScar = {id: G.id, frac: E.hp / E.max}; E.el.classList.add("escape"); toast("🕳️ " + G.T.name + " slips back through the crack... wounded. It will return, and you'll get another pass at it."); B.enemies.filter(x => x === E || x.partOf === E).forEach(x => x.el.remove()); B.enemies = B.enemies.filter(x => x !== E && x.partOf !== E); endTitanFx(); B.titan = null; save("The God retreated"); return; }
  if (dt <= 0) return; G.t = (G.t||0) + dt;
  if (G.id === "unmaker"){
    if (G.phase >= 1 && G.t - (G.eyeT||0) > 4.5){ G.eyeT = G.t; voidEye(G); }
    if (G.phase >= 2 && G.t - (G.mirT||0) > 16){ G.mirT = G.t; hero.classList.add("mirror"); titleCard("↔", "Reality is backwards", G.T.color); setTimeout(() => hero && hero.classList.remove("mirror"), 9000); }
    if (G.phase >= 1 && G.t - (G.closeT||0) > 38){ G.closeT = G.t; fakeClose(G); } }
  if (G.id === "nocturne"){
    if (G.phase >= 1 && G.t - (G.batT||0) > 7){ G.batT = G.t; batSwarm(G); }
    if (G.phase >= 2 && G.t - (G.lanT||0) > 9){ G.lanT = G.t; candyLantern(G); }
    if (G.phase >= 1 && !G.bm){ G.bm = true; startBloodMoon(); } }
  if (G.id === "omen"){ ballsFrame(G, dt);
    if (G.phase >= 1 && G.t - (G.breakT||0) > (G.phase >= 3 ? 10 : 16)){ G.breakT = G.t; planetBreak(G); }
    if (G.phase >= 2 && G.t - (G.eyeT||0) > 5){ G.eyeT = G.t; voidEye(G); }
    if (G.phase >= 2 && G.t - (G.mirT||0) > 20){ G.mirT = G.t; hero.classList.add(Math.random() < 0.5 ? "mirror" : "gravity"); setTimeout(() => hero && hero.classList.remove("mirror","gravity"), 8000); }
    if (G.phase >= 3 && G.t - (G.batT||0) > 8){ G.batT = G.t; batSwarm(G); }
    if (G.phase >= 3 && !G.lastcall){ G.lastcall = true; B.timeScale = 1.35; hero.classList.add("fastfwd"); } }
  if (G.id === "chrono"){
    if (G.t - (G.snapT||0) > 5){ G.snapT = G.t; G.snaps = (G.snaps||[]).concat([E.hp]).slice(-3); }
    if (G.phase >= 1 && G.t - (G.rwT||0) > 20 && !G.anchor){ G.rwT = G.t; timeAnchor(G); }
    if (G.phase >= 2 && G.t - (G.tsT||0) > 12){ G.tsT = G.t; const fast = Math.random() < 0.5; B.timeScale = fast ? 1.8 : 0.4; hero.classList.toggle("slowmo", !fast); hero.classList.toggle("fastfwd", fast); titleCard(fast ? "⏩" : "⏪", fast ? "Time races forward" : "Time crawls", G.T.color); setTimeout(() => { B.timeScale = 1; if (hero){ hero.classList.remove("slowmo","fastfwd"); } }, 6000); } }
  if (G.id === "eclipse"){
    let dk = hero.querySelector(".eclipse"); if (!dk){ dk = document.createElement("div"); dk.className = "eclipse"; hero.appendChild(dk); } dk.style.setProperty("--lx", P.x + "px"); dk.style.setProperty("--ly", (P.y + 10) + "px"); dk.style.opacity = (0.5 + 0.3 * Math.abs(Math.sin(G.t/3))).toFixed(2);
    if (G.phase >= 1 && G.t - (G.gravT||0) > 18){ G.gravT = G.t; hero.classList.add("gravity"); titleCard("↕", "Gravity forgot which way is down", G.T.color); setTimeout(() => hero && hero.classList.remove("gravity"), 8000); }
    if (G.phase >= 2 && G.t - (G.starT||0) > 1.6){ G.starT = G.t; catchable("☄️", 40 + Math.random()*(P.w - 80), -30, true, () => { if (!E.dead){ lightning(E.x); spark(E.x, (parseFloat(E.el.style.top)||0) + 60, "#ff6b3a", true); hitEnemy(E, Math.round(E.max * 0.02), true); floatText("☄️ Hurled back!"); } }); }
    if (G.t - (G.flareT||0) > 22){ G.flareT = G.t; hero.classList.add("flare"); B.dazedUntil = performance.now() + 2500; setTimeout(() => hero && hero.classList.remove("flare"), 900); { const Pd = dingoPos(); if (Pd) fieldCue(Pd.x, Pd.y - 60, "Solar flare!"); } } } }
function voidEye(G){ const E = G.E, b = document.createElement("button"); b.className = "voideye"; b.innerHTML = emoImg("👁️"); b.style.left = (8 + Math.random()*80) + "vw"; b.style.top = (14 + Math.random()*70) + "vh"; b.setAttribute("aria-label","Strike the eye");
  b.addEventListener("click", ev => { ev.stopPropagation(); if (b.dataset.hit) return; b.dataset.hit = 1; b.classList.add("popped"); if (!E.dead){ E.invuln = false; hitEnemy(E, Math.round(E.max * 0.035), true); sfx("coin"); } setTimeout(() => b.remove(), 300); }, true);
  document.body.appendChild(b); setTimeout(() => { if (!b.dataset.hit){ b.remove(); if (!E.dead){ E.hp = Math.min(E.max, E.hp + E.max * 0.01); } } }, 3200); }
function fakeClose(G){ const ov = document.createElement("div"); ov.className = "sos-ov titanclose"; ov.innerHTML = `<div class="sos-card" style="border-color:${G.T.color}"><h3>🌀 ${esc(G.T.name)}</h3><p class="small">"I'm going to close your Den now, little dingo."</p><div class="closebar"><i></i></div><div class="btns" style="justify-content:center;margin-top:10px"><button class="go" data-refuse>🐾 NO YOU'RE NOT</button></div></div>`;
  document.body.appendChild(ov); const t = setTimeout(() => { if (ov.isConnected){ ov.remove(); if (!G.E.dead){ G.E.hp = Math.min(G.E.max, G.E.hp + G.E.max * 0.06); toast("🌀 It fed on your hesitation and healed!"); } } }, 5000);
  ov.querySelector("[data-refuse]").addEventListener("click", () => { clearTimeout(t); ov.remove(); if (!G.E.dead){ hitEnemy(G.E, Math.round(G.E.max * 0.06), true); heroShake(10, 400); toast("💥 You refused! The Unmaker reels back!"); } }); }
function timeAnchor(G){ G.anchor = true; const b = document.createElement("button"); b.className = "voideye anchor"; b.innerHTML = emoImg("⚓"); b.style.left = (20 + Math.random()*60) + "vw"; b.style.top = (25 + Math.random()*50) + "vh"; b.setAttribute("aria-label","Anchor the moment");
  const E = G.E; b.addEventListener("click", ev => { ev.stopPropagation(); G.anchor = false; b.remove(); toast("⚓ Moment anchored! The rewind fails."); hitEnemy(E, Math.round(E.max * 0.03), true); }, true); document.body.appendChild(b);
  setTimeout(() => { if (b.isConnected){ b.remove(); G.anchor = false; const back = (G.snaps||[])[0]; if (back && !E.dead && back > E.hp){ E.hp = back; G.until -= 15000; toast("⏪ CHRONOPHAGE rewound its wounds and stole 15 seconds from you!"); document.body.classList.add("glitch"); setTimeout(() => document.body.classList.remove("glitch"), 700); } } }, 4000); }
function endTitanFx(){ pageFx(false); document.body.classList.remove("titan-omen","tilt"); document.querySelectorAll(".planet,.batfly").forEach(x => x.remove()); if (B.titan) B.titan.balls = []; const hr0 = document.querySelector("section.hero"); if (hr0) hr0.classList.remove("omenstage"); const hero = document.querySelector("section.hero"); if (hero){ hero.classList.remove("mirror","gravity","slowmo","fastfwd","flare","titanstage"); const dk = hero.querySelector(".eclipse"); if (dk) dk.remove(); } B.timeScale = 1; document.querySelectorAll(".voideye,.titanclose").forEach(x => x.remove()); const bar = document.querySelector("#megabar"); if (bar) bar.remove(); }
function titanWin(E){ tlog("god", E.titanDef && E.titanDef.T ? E.titanDef.T.name : ""); const G = E.titanDef, H = titanState(), first = !H.titanWins[G.id]; if (isOct() && !G.T.titan){ H.octGodWins = (H.octGodWins||0) + 1; if (H.octGodWins === 3 && !H.titanWins.omen) setTimeout(() => toast("🎃 Something far older than the gods has noticed you..."), 4000); } H.titanWins[G.id] = (H.titanWins[G.id]||0) + 1; H.titanScar = null; const got = [];
  addEss("titanheart", G.T.titan ? 3 : 1); got.push(["❤️‍🔥", (G.T.titan ? "3 " : "") + "Divine Heart"]); if (G.T.titan){ addEss("hallow", 40); got.push(["🎃","40 Hallow"]); addEvCur(5000); got.push(["🍬","5,000 candy"]); } addEss("megacore", 5); got.push(["🌟","5 Mega Cores"]); addEss("arcane", 40); got.push(["💠","40 Arcane Dust"]); addEss("paper", 10); got.push(["📜","10 Scroll Paper"]);
  PRIMALS.forEach(a => addEss(a, 12)); got.push(["⚗️","12 of every primal essence"]); shopState().coins += 25; got.push(["🪙","25 Dingo Coins"]);
  if (first){ const [ic, nm] = G.T.weapon, w = makeWeapon(enemyHP(false), "titan", ic, nm); w.dmg = Math.round(w.dmg * (G.T.titan ? 2 : 1.3)); if (G.T.titan){ w.ev = "hw2026"; } w.trophy = G.id; w.o = "titan"; ensureTraits(w); huntState().weapons.push(w); if (huntState().autoEquip) autoEquip(); syncGhosts(); got.push(["🏆", nm + (G.T.titan ? " (TITAN-forged, twice as strong)" : " (GODFORGED weapon)")]); got.push(["👑", "Title: " + G.T.title]); }
  endTitanFx(); B.titan = null;
  if (!first){ moonBanner(G.T.name.toUpperCase() + " HAS FALLEN", "God victory #" + H.titanWins[G.id]); lootPile(E.x, (parseFloat(E.el.style.top)||0) + 60, got, G.T.color); sfx("victory"); save("A God has fallen!"); return; }
  const ov = document.createElement("div"); ov.className = "lvlup titanwin"; ov.innerHTML = `<div class="card" style="border-color:${G.T.color}"><div class="rays"></div><div class="big-badge" style="font-size:2.4rem">${emoImg(G.T.icon)}</div><h3>${esc(G.T.name)} HAS FALLEN</h3>${G.T.titan ? `<p class="small" style="color:#ff8a2a"><b>You defeated the first Titan.</b></p>` : ""}<p class="small">${first ? "You did the impossible, dingo. The woods will tell stories about this." : "God victory #" + H.titanWins[G.id] + "."}</p><div class="mitems" style="position:relative">${got.map((x,i) => `<span class="mitem" style="--i:${i};background:var(--panel-2);border-color:var(--line)">${emoImg(x[0])}<b>${esc(x[1])}</b></span>`).join("")}</div><button class="go" data-close style="margin-top:14px;position:relative">LEGENDARY 🐾</button></div>`;
  document.body.appendChild(ov); sfx("victory"); autoCloseBox(ov); ov.addEventListener("click", e => { if (e.target === ov || e.target.closest("[data-close]")) ov.remove(); });
  for (let i=0;i<6;i++) setTimeout(() => rollBurst(innerWidth/2, innerHeight/2, ["#ff4fd8","#ffd34d","#00e5ff","#fff",G.T.color,"#ff2d55"][i], 40), i*160); save("A God has fallen!"); }
function titanSection(){ const H = titanState(), pct = Math.round(100 * H.overpower / OVERPOWER_MAX), strong = dropMult(enemyHP(false)) <= 0.35;
  return `<div class="titanbox"><p class="small">When your dingo grows <b>far too strong for the woods</b> it's hunting in, reality starts to crack. Fill the <b>Overpower</b> meter by hunting while you're overpowered, and a <b>GOD</b> tears through: a reality-bending boss with three phases, screen-breaking attacks, and <b>4 minutes</b> to beat it. If it escapes, it keeps its wounds, and you get another pass next time.</p>
    <div class="opmeter"><span class="small">⚠️ Overpower ${pct}%${strong ? "" : " (not overpowered here right now, try an easier area)"}</span><span class="umeter"><i style="width:${pct}%;background:linear-gradient(90deg,#b98cf0,#ff2d55)"></i></span></div>
    ${H.titanScar ? `<p class="small">🕳️ <b>${esc(TITANS[H.titanScar.id].name)}</b> is still out there, wounded to ${Math.round(H.titanScar.frac*100)}% health.</p>` : ""}
    <div class="bgrid">${Object.entries(TITANS).filter(([id,T]) => !T.oct || isOct() || H.titanWins[id]).map(([id,T]) => { const w = H.titanWins[id] || 0; return `<div class="bcard titanc${w ? "" : " bunk"}" style="--tc:${T.color}"><span class="bart">${emoImg(T.icon)}</span><b>${w ? esc(T.name) : "???"}</b><span class="small">${w ? esc(T.lore) : "A shape behind the trees..."}</span><span class="small">${w ? "🏆 " + w + " win" + (w===1?"":"s") + " · 👑 " + esc(T.title) : ""}</span></div>`; }).join("")}</div></div>`; }

