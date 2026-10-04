/* ===================== v0.43 Den Sky & Light =====================
   Weather and lighting drawn on canvases inside the scene (logical stage units, so they scale with the Den Stage and zoom).
   Weather techniques adapted from web-weather by greywen (MIT, https://github.com/greywen/web-weather): pooled
   struct-of-arrays particles, alpha-binned rain drawing, splash pool, cached fog texture, branching lightning drawn as
   glow + core lines, and procedural thunder (snap → crack → sub-bass → rolling rumble). Lighting is our own:
   ambient by time of day and weather, light holes around the dingo, loot and weapons, fireflies, sun rays, and soft
   ground shadows that lean away from the sun (or away from the dingo's light at night). Ideas for the light model
   were inspired by pixi-lights-and-shadows by Dominic Branchaud (MIT). Gameplay never reads any of this. */
const FXQ_KEY = "dengame-fx", FXG_KEY = "dengame-gentle", FXS_KEY = "dengame-wxsnd";
const FX = {q:"full", gentle:true, snd:true, cv:{}, w:0, h:0, k:1, t:0, amb:[0,0,0,0], flash:0, bolts:[], ff:[], drops:null, splash:null, flakes:null, fogs:[], gusts:[], accum:0, ready:false};
try { const q = localStorage.getItem(FXQ_KEY); if (q === "full" || q === "light" || q === "off") FX.q = q; FX.gentle = localStorage.getItem(FXG_KEY) !== "0"; FX.snd = localStorage.getItem(FXS_KEY) !== "0"; } catch(e){}
function fxOn(){ return FX.q !== "off" && !calm; }
function fxSet(k, v){ FX[k] = v; try { localStorage.setItem(k === "q" ? FXQ_KEY : k === "gentle" ? FXG_KEY : FXS_KEY, k === "q" ? v : (v ? "1" : "0")); } catch(e){} fxApply(); }
function fxApply(){ const hero = document.querySelector("section.hero"); if (!hero) return; hero.classList.toggle("fxon", fxOn()); if (!fxOn()){ Object.values(FX.cv).forEach(c => { const x = c.getContext("2d"); x.clearRect(0, 0, c.width, c.height); }); wxAmbientStop(); }
  if (WX.w && WX.w !== FX.lastW) FX.lastW = null; }
function fxCanvas(id, z, blend){ const hero = document.querySelector("section.hero"); if (!hero) return null; let c = FX.cv[id];
  if (!c || !hero.contains(c)){ c = document.createElement("canvas"); c.className = "fxc"; c.id = "fx-" + id; c.setAttribute("aria-hidden", "true"); c.style.zIndex = z; if (blend) c.style.mixBlendMode = blend; hero.appendChild(c); FX.cv[id] = c; } return c; }
function fxSize(){ const s = STAGE.s || 1, dpr = Math.min(2, window.devicePixelRatio || 1); let k = s * dpr; const cap = FX.q === "light" ? 0.85 : 1.25; k = Math.min(k, cap, 2400 / Math.max(1, STAGE.w)); /* soft light and rain don't need full sharpness */
  const W = Math.ceil(STAGE.w * k), H = Math.ceil(STAGE.h * k); if (W === FX.w && H === FX.h && Math.abs(k - FX.k) < 1e-3) return;
  FX.w = W; FX.h = H; FX.k = k; Object.values(FX.cv).forEach(c => { c.width = W; c.height = H; }); }
function fxCtx(id){ const c = FX.cv[id]; if (!c) return null; const x = c.getContext("2d"); x.setTransform(FX.k, 0, 0, FX.k, 0, 0); return x; }
/* ---------- pools (struct of arrays: fast, no garbage) ---------- */
function fxPool(n, fields){ const p = {n:0, max:n}; fields.forEach(f => p[f] = new Float32Array(n)); p.kill = i => { const L = --p.n; if (i < L) fields.forEach(f => p[f][i] = p[f][L]); }; return p; }
function fxInit(){ if (FX.ready) return; FX.drops = fxPool(700, ["x","y","vx","vy","len","a"]); FX.splash = fxPool(260, ["x","y","vx","vy","life"]); FX.flakes = fxPool(260, ["x","y","vy","r","ph","a"]);
  const T = document.createElement("canvas"); T.width = T.height = 128; const g = T.getContext("2d"), rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  rg.addColorStop(0, "rgba(225,235,240,1)"); rg.addColorStop(.4, "rgba(215,225,235,.8)"); rg.addColorStop(.7, "rgba(205,220,235,.3)"); rg.addColorStop(1, "rgba(205,220,235,0)"); g.fillStyle = rg; g.fillRect(0, 0, 128, 128); FX.fogTex = T; FX.ready = true; }
function fxGround(){ const d = $("#dingo"); return d ? d.offsetTop + d.offsetHeight - 2 : STAGE.h - 4; }
/* ---------- the frame ---------- */
function fxFrame(dt, P, walking){ if (!fxOn() || !P) return; fxInit();
  ["shade", "wx", "light"].forEach((id, i) => fxCanvas(id, [2, 6, 5][i], "")); /* glows are drawn additively on the light layer: one fewer full-screen layer to blend */
  fxSize(); FX.t += dt; fxPerf(dt); const now = performance.now(), w = WX.w && now < WX.wUntil ? WX.w : null, td = tod(), ground = fxGround(), vw = STAGE.w, gentle = FX.gentle, lite = FX.q === "light";
  const scroll = walking ? STAGE_WALK : 0;
  /* ambient light by time of day + weather, eased so changes glide */
  const A = {day:[0,0,0,0], dawn:[60,40,90,.18], dusk:[70,35,60,.28], night:[6,10,34,.62]}[td] || [0,0,0,0], tgt = A.slice();
  if (w === "rain"){ tgt[0] = (tgt[0] + 30) / 2; tgt[1] = (tgt[1] + 40) / 2; tgt[2] = (tgt[2] + 70) / 2; tgt[3] += .1; }
  if (w === "storm"){ tgt[0] = 15; tgt[1] = 20; tgt[2] = 45; tgt[3] += .24; }
  if (w === "fog") tgt[3] += .05;
  tgt[3] = Math.min(.72, tgt[3]); for (let i = 0; i < 4; i++) FX.amb[i] += (tgt[i] - FX.amb[i]) * Math.min(1, dt * 1.5);
  FX.flash = Math.max(0, FX.flash - dt * 3.2);
  fxWeather(dt, w, ground, vw, scroll, gentle, lite);
  fxShadows(P, ground, td);
  FX.walking = walking; fxLight(P, ground, td, w, lite);
  wxAmbient(w); pfxFrame(); }
/* ---------- weather ---------- */
function fxWeather(dt, w, ground, vw, scroll, gentle, lite){ const cv = FX.cv.wx, idle = !w && !FX.drops.n && !FX.splash.n && !FX.flakes.n && !FX.fogs.length && !FX.gusts.length && FX.accum <= 0.01; if (cv) cv.style.display = idle ? "none" : ""; if (idle) return; const c = fxCtx("wx"); if (!c) return; c.clearRect(0, 0, vw + 10, STAGE.h + 10);
  const D = FX.drops, S = FX.splash, F = FX.flakes, rainy = w === "rain" || w === "storm", storm = w === "storm";
  const want = rainy ? Math.round((storm ? 520 : 300) * (gentle ? 0.5 : 1) * (lite ? 0.5 : 1)) : 0, vy0 = gentle ? 520 : 880, slant = (storm ? 0.28 : 0.12) * (gentle ? 0.5 : 1);
  let spawn = Math.min(want - D.n, Math.ceil(want * dt * 1.6)); while (spawn-- > 0 && D.n < D.max){ const i = D.n++; D.x[i] = Math.random() * (vw + 200) - 100; D.y[i] = -20 - Math.random() * STAGE.h * 0.4; D.vy[i] = vy0 * (0.8 + Math.random() * 0.4); D.vx[i] = D.vy[i] * slant; D.len[i] = (gentle ? 9 : 14) + Math.random() * 10; D.a[i] = 0.12 + Math.random() * 0.45; }
  for (let i = 0; i < D.n; i++){ D.x[i] += (D.vx[i] - scroll) * dt; D.y[i] += D.vy[i] * dt; const gy = ground - (i % 7) * 3; if (D.y[i] >= gy){ if (!lite && S.n < S.max - 2 && Math.random() < (gentle ? 0.35 : 0.6)) for (let k = 0; k < 2; k++){ const j = S.n++; S.x[j] = D.x[i]; S.y[j] = gy; S.vx[j] = (Math.random() - 0.5) * 120; S.vy[j] = -(Math.random() * 120 + 80); S.life[j] = 1; }
      if (D.n > want){ D.kill(i); i--; } else { D.x[i] = Math.random() * (vw + 200) - 100; D.y[i] = -20 - Math.random() * 60; } } }
  /* rain: three alpha bins, one path each (cheap) */
  if (D.n){ c.lineCap = "round"; [[0, .22], [.22, .38], [.38, 1]].forEach(([lo, hi], b) => { c.beginPath(); for (let i = 0; i < D.n; i++){ if (D.a[i] < lo || D.a[i] >= hi) continue; const L = D.len[i], dx = D.vx[i] / D.vy[i] * L; c.moveTo(D.x[i], D.y[i]); c.lineTo(D.x[i] - dx, D.y[i] - L); }
    c.strokeStyle = `rgba(190,210,240,${([.18, .3, .48][b] * (1 - Math.min(.45, FX.amb[3] * 0.6))).toFixed(3)})`; c.lineWidth = b === 2 ? 1.4 : 1; c.stroke(); }); }
  if (S.n){ for (let j = 0; j < S.n; j++){ S.vy[j] += 900 * dt; S.x[j] += (S.vx[j] - scroll) * dt; S.y[j] += S.vy[j] * dt; S.life[j] -= dt * 3; if (S.life[j] <= 0){ S.kill(j); j--; } }
    c.fillStyle = "rgba(205,222,250,.55)"; c.beginPath(); for (let j = 0; j < S.n; j++) c.rect(S.x[j] - 1, S.y[j] - 1, 2, 2); c.fill(); }
  /* snow, with a soft drift that builds up on the ground */
  const wantS = w === "snow" ? Math.round(180 * (lite ? 0.5 : 1)) : 0; let sp = Math.min(wantS - F.n, Math.ceil(wantS * dt)); while (sp-- > 0 && F.n < F.max){ const i = F.n++; F.x[i] = Math.random() * (vw + 100) - 50; F.y[i] = -10 - Math.random() * 80; F.vy[i] = 30 + Math.random() * 45; F.r[i] = 1.2 + Math.random() * 2.2; F.ph[i] = Math.random() * 6.28; F.a[i] = 0.55 + Math.random() * 0.4; }
  if (F.n){ c.fillStyle = "#fff"; for (let i = 0; i < F.n; i++){ F.ph[i] += dt * 1.4; F.x[i] += (Math.sin(F.ph[i]) * 22 - scroll * 0.9) * dt; F.y[i] += F.vy[i] * dt; if (F.y[i] > ground - 2 || F.x[i] < -60){ if (F.n > wantS){ F.kill(i); i--; continue; } F.x[i] = Math.random() * (vw + 100) - 50; F.y[i] = -10; } c.globalAlpha = F.a[i]; c.beginPath(); c.arc(F.x[i], F.y[i], F.r[i], 0, 6.283); c.fill(); } c.globalAlpha = 1; }
  FX.accum = Math.max(0, Math.min(1, FX.accum + (w === "snow" ? dt / 90 : -dt / 40)));
  if (FX.accum > 0.01){ const g = c.createLinearGradient(0, ground - 10, 0, ground + 6); g.addColorStop(0, "rgba(245,250,255,0)"); g.addColorStop(1, `rgba(245,250,255,${(0.55 * FX.accum).toFixed(3)})`); c.fillStyle = g; c.fillRect(0, ground - 10, vw, 16); }
  /* fog: drifting puffs from one cached texture */
  const wantF = w === "fog" ? (lite ? 7 : 12) : 0;
  while (FX.fogs.length < wantF){ const z = Math.random(); FX.fogs.push({x:Math.random() * (vw + 400) - 200, y:STAGE.h * (0.45 + Math.random() * 0.5), r:Math.min(380, STAGE.h * (0.25 + z * 0.4)), sp:(6 + z * 14) * (Math.random() < .5 ? -1 : 1), o:0, to:0.12 + Math.random() * 0.16, ph:Math.random() * 6.28}); }
  for (let i = FX.fogs.length - 1; i >= 0; i--){ const f = FX.fogs[i]; f.o += ((i < wantF ? f.to : 0) - f.o) * Math.min(1, dt * 0.6); if (i >= wantF && f.o < 0.004){ FX.fogs.splice(i, 1); continue; }
    f.x += (f.sp - scroll * 0.6) * dt; if (f.x < -f.r * 1.5) f.x = vw + f.r; if (f.x > vw + f.r * 1.5) f.x = -f.r; const rr = f.r * (1 + Math.sin(FX.t * 0.3 + f.ph) * 0.06);
    c.globalAlpha = f.o; c.drawImage(FX.fogTex, f.x - rr, f.y - rr, rr * 2, rr * 2); } c.globalAlpha = 1;
  /* wind: a few long, faint gust lines */
  if (w === "wind" && !lite && FX.gusts.length < 6 && Math.random() < dt * 2) FX.gusts.push({x:-200, y:STAGE.h * (0.2 + Math.random() * 0.65), v:420 + Math.random() * 300, l:120 + Math.random() * 160, a:0.08 + Math.random() * 0.08});
  if (FX.gusts.length){ c.lineWidth = 1.2; FX.gusts = FX.gusts.filter(g => { g.x += g.v * dt; if (g.x - g.l > vw) return false; c.strokeStyle = `rgba(255,255,255,${g.a})`; c.beginPath(); c.moveTo(g.x - g.l, g.y); c.quadraticCurveTo(g.x - g.l / 2, g.y - 6, g.x, g.y); c.stroke(); return true; }); } }
/* ---------- soft ground shadows ---------- */
function fxShadows(P, ground, td){ const cv = FX.cv.shade; if (cv) cv.style.display = FX.q === "light" ? "none" : ""; if (FX.q === "light") return; const c = fxCtx("shade"); if (!c) return; c.clearRect(0, 0, STAGE.w + 10, STAGE.h + 10);
  const cel = document.querySelector("section.hero .celestial"), night = td === "night", low = td === "dawn" || td === "dusk";
  const sunX = cel && cel.offsetWidth ? cel.offsetLeft + cel.offsetWidth / 2 : STAGE.w * 0.85;
  const base = night ? 0.2 : low ? 0.24 : 0.3, stretch = night ? 1.5 : low ? 2.1 : 1.15;
  const shadow = (x, w, a, src) => { const dir = Math.max(-1, Math.min(1, (x - src) / 420)), cx = x + dir * w * (stretch - 1) * 0.55; c.save(); c.translate(cx, ground); c.scale(stretch, 1); const g = c.createRadialGradient(0, 0, 0, 0, 0, w / 2);
    g.addColorStop(0, `rgba(20,14,10,${a.toFixed(3)})`); g.addColorStop(1, "rgba(20,14,10,0)"); c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, w / 2, w * 0.13, 0, 0, 6.283); c.fill(); c.restore(); };
  const src = night ? P.x : sunX;
  shadow(P.x - 24, 74, base * 1.1, night ? P.x - 120 : src);
  B.enemies.forEach(E => { if (E.dead || E.passing) return; const big = E.boss || E.megaDef || E.titanDef, wdt = big ? 90 : 46, a = (E.flying && !big ? base * 0.45 : base) * (E.el.classList.contains("efade") ? 0.4 : 1); shadow(E.x, wdt, a, src); });
  B.ghosts.forEach(g => { if (g.x != null) shadow(g.x + 11, 18, base * 0.35, src); }); }
/* ---------- light ---------- */
const FX_RCOL = {rare:"180,140,240", epic:"240,130,50", legendary:"240,200,80", godly:"255,90,220", mythic:"80,230,255", titan:"255,60,90"};
function fxLight(P, ground, td, w, lite){ const L = fxCtx("light"), G = L; if (!L) return; const vw = STAGE.w + 10, vh = STAGE.h + 10;
  L.clearRect(0, 0, vw, vh);
  const [r, g, b, a0] = FX.amb, a = a0 * (1 - Math.min(1, FX.flash * 1.4)), dark = Math.max(0, Math.min(1, a / 0.5));
  /* ambient, then cut light holes */
  if (a > 0.01){ const sky = L.createLinearGradient(0, 0, 0, vh); sky.addColorStop(0, `rgba(${r | 0},${g | 0},${b | 0},${Math.min(.85, a * 1.2).toFixed(3)})`); sky.addColorStop(1, `rgba(${r | 0},${g | 0},${b | 0},${(a * 0.85).toFixed(3)})`); L.fillStyle = sky; L.fillRect(0, 0, vw, vh); L.globalCompositeOperation = "destination-out";
    const hole = (x, y, rad, s) => { const gr = L.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(0,0,0,${s})`); gr.addColorStop(1, "rgba(0,0,0,0)"); L.fillStyle = gr; L.fillRect(x - rad, y - rad, rad * 2, rad * 2); };
    hole(P.x - 20, P.y + 4, 190, 0.85);
    B.ghosts.forEach(gh => { if (gh.x != null) hole(gh.x + 11, gh.y + 11, 46, 0.5); });
    GL.forEach(l => { const t = l.o && l.o.tier; if (FX_RCOL[t]) hole(l.x, l.y - 10, 70, 0.7); });
    FX.ff.forEach(f => hole(f.x, f.y, 11, 0.55 * f.b));
    L.globalCompositeOperation = "source-over"; }
  /* warm glows, added on top */
  G.globalCompositeOperation = "lighter";
  if (dark > 0.05){ const gr = G.createRadialGradient(P.x - 20, P.y, 0, P.x - 20, P.y, 150); gr.addColorStop(0, `rgba(255,190,120,${(0.22 * dark).toFixed(3)})`); gr.addColorStop(1, "rgba(255,190,120,0)"); G.fillStyle = gr; G.fillRect(P.x - 170, P.y - 170, 340, 340); }
  B.ghosts.forEach(gh => { const col = gh.w && FX_RCOL[gh.w.r]; if (!col || gh.x == null) return; const gr = G.createRadialGradient(gh.x + 11, gh.y + 11, 0, gh.x + 11, gh.y + 11, 30); gr.addColorStop(0, `rgba(${col},${(0.25 + 0.3 * dark).toFixed(3)})`); gr.addColorStop(1, `rgba(${col},0)`); G.fillStyle = gr; G.fillRect(gh.x - 20, gh.y - 20, 62, 62); });
  GL.forEach(l => { const col = l.o && FX_RCOL[l.o.tier]; if (!col) return; const gr = G.createRadialGradient(l.x, l.y - 8, 0, l.x, l.y - 8, 54); gr.addColorStop(0, `rgba(${col},${(0.3 + 0.3 * dark).toFixed(3)})`); gr.addColorStop(1, `rgba(${col},0)`); G.fillStyle = gr; G.fillRect(l.x - 56, l.y - 64, 112, 112); });
  /* fireflies at dusk and night */
  const wantFF = (td === "night" || td === "dusk") && w !== "storm" && w !== "rain" ? (lite ? 6 : 12) : 0;
  while (FX.ff.length < wantFF) FX.ff.push({x:Math.random() * STAGE.w, y:STAGE.h * (0.45 + Math.random() * 0.45), ph:Math.random() * 6.28, sp:0.4 + Math.random() * 0.6, b:0});
  FX.ff = FX.ff.filter((f, i) => { f.ph += 0.016 * f.sp * 2; f.x += Math.cos(f.ph * 0.7) * 0.35 - (FX.walking ? STAGE_WALK / 60 * 0.5 : 0); f.y += Math.sin(f.ph) * 0.25; if (f.x < -20) f.x = STAGE.w + 10;
    f.b += ((i < wantFF ? 0.5 + 0.5 * Math.sin(f.ph * 3) : 0) - f.b) * 0.05; if (i >= wantFF && f.b < 0.02) return false;
    const gr = G.createRadialGradient(f.x, f.y, 0, f.x, f.y, 8); gr.addColorStop(0, `rgba(240,255,160,${(0.95 * f.b).toFixed(3)})`); gr.addColorStop(0.25, `rgba(220,255,120,${(0.5 * f.b).toFixed(3)})`); gr.addColorStop(1, "rgba(220,255,120,0)"); G.fillStyle = gr; G.fillRect(f.x - 8, f.y - 8, 16, 16); return true; });
  /* sun rays by day, dawn and dusk */
  const cel = document.querySelector("section.hero .celestial");
  if (!lite && (td === "day" || td === "dawn" || td === "dusk") && cel && cel.offsetWidth && w !== "storm" && w !== "fog"){ const sx = cel.offsetLeft + cel.offsetWidth / 2, sy = cel.offsetTop + cel.offsetHeight / 2, col = td === "day" ? "255,240,190" : "255,170,110", str = (td === "day" ? 0.07 : 0.1) * (w === "rain" ? 0.4 : 1);
    G.save(); G.translate(sx, sy); for (let i = 0; i < 5; i++){ const ang = 1.75 + i * 0.22 + Math.sin(FX.t * 0.12 + i) * 0.05, len = STAGE.h * 1.4, wd = 0.05 + (i % 2) * 0.03; const gr = G.createLinearGradient(0, 0, Math.cos(ang) * len, Math.sin(ang) * len); gr.addColorStop(0, `rgba(${col},${str})`); gr.addColorStop(1, `rgba(${col},0)`); G.fillStyle = gr;
      G.beginPath(); G.moveTo(0, 0); G.lineTo(Math.cos(ang - wd) * len, Math.sin(ang - wd) * len); G.lineTo(Math.cos(ang + wd) * len, Math.sin(ang + wd) * len); G.closePath(); G.fill(); } G.restore(); }
  /* heat haze tint */
  if (w === "heat"){ G.fillStyle = "rgba(255,140,40,.07)"; G.fillRect(0, 0, vw, vh); }
  /* lightning: glow pass + core pass, flickering out; and the sky flash */
  if (FX.flash > 0){ G.fillStyle = `rgba(210,225,255,${(FX.flash * 0.35).toFixed(3)})`; G.fillRect(0, 0, vw, vh); }
  FX.bolts = FX.bolts.filter(bt => { bt.life -= 1; if (bt.life <= 0) return false; if (Math.random() > 0.8) return true; const al = bt.life < 10 ? bt.life / 10 : 1;
    [[`rgba(180,210,255,${(al * 0.3).toFixed(3)})`, 8, 4], [`rgba(235,245,255,${al.toFixed(3)})`, 2.5, 1]].forEach(([st, w0, w1]) => { G.strokeStyle = st; bt.segs.forEach((sg, i) => { G.lineWidth = i ? w1 : w0; G.beginPath(); sg.forEach((p, j) => j ? G.lineTo(p[0], p[1]) : G.moveTo(p[0], p[1])); G.stroke(); }); }); return true; }); G.globalCompositeOperation = "source-over"; }
/* Smoothness guard: if the game runs below ~40 frames a second for a few seconds with Full effects, step down to Light once and say so. */
function fxPerf(dt){ if (FX.q !== "full" || FX.perfDone || dt <= 0 || document.hidden) return; FX.pf = FX.pf || {t:0, n:0}; FX.pf.t += dt; FX.pf.n++;
  if (FX.pf.t >= 5){ const fps = FX.pf.n / FX.pf.t; FX.pf = {t:0, n:0}; FX.pfChecks = (FX.pfChecks || 0) + 1; if (fps < 40){ FX.perfDone = true; fxSet("q", "light"); notify("info", {text:"🌦️ Weather & lighting switched to Light to keep things smooth. You can change it in Settings."}); } else if (FX.pfChecks >= 3) FX.perfDone = true; } }
/* branching bolt: the main bolt may split up to three times */
function fxBolt(x, toY){ const segs = [], make = (sx, sy, ey, off, depth) => { let cx = sx, cy = sy, n = 0; const path = [[cx, cy]]; while (cy < ey){ cy += Math.random() * 40 + 20; cx += (Math.random() - 0.5) * off; path.push([cx, cy]);
      if (!depth && Math.random() < 0.12 && ey - cy > 150 && n < 3){ make(cx, cy, cy + Math.random() * 250 + 100, off * 0.6, 1); n++; } } segs.push(path); };
  make(x, 0, toY, 70, 0); segs.sort((a, b) => b.length - a.length); FX.bolts.push({segs, life:15 + Math.random() * 10}); FX.flash = 1; }

/* ---------- procedural thunder + rain/wind ambience (Web Audio, no sound files) ---------- */
const WXA = {buf:null, amb:null, cur:null};
function wxNoiseBuf(){ if (WXA.noise && WXA.noise.sampleRate === actx.sampleRate) return WXA.noise; const n = actx.sampleRate * 2, b = actx.createBuffer(1, n, actx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; WXA.noise = b; return b; }
function wxBuild(){ if (WXA.buf && WXA.buf.ctx === actx) return WXA.buf; const sr = actx.sampleRate;
  const snap = dur => { const len = Math.ceil(sr * dur), bf = actx.createBuffer(2, len, sr); for (let ch = 0; ch < 2; ch++){ const d = bf.getChannelData(ch); let prev = 0; for (let i = 0; i < len; i++){ const t = i / sr, wh = Math.random() * 2 - 1, edge = wh - prev * 0.98; prev = wh; const env = Math.exp(-t * 145), spike = Math.random() < 0.02 ? (Math.random() * 2 - 1) * 2 * Math.exp(-t * 120) : 0; d[i] = Math.tanh((edge * 2.3 + spike) * env * 1.9); } } return bf; };
  const crack = dur => { const len = Math.ceil(sr * dur), bf = actx.createBuffer(2, len, sr); for (let ch = 0; ch < 2; ch++){ const d = bf.getChannelData(ch); let hp = 0, pw = 0, lo = 0; for (let i = 0; i < len; i++){ const t = i / sr, wh = Math.random() * 2 - 1; hp = 0.985 * (hp + wh - pw); pw = wh; const ch2 = t < 0.012 ? 0.34 : t < 0.05 ? 0.12 : t < 0.1 ? 0.04 : 0, imp = Math.random() < ch2 ? (Math.random() * 2 - 1) * 2.2 : 0; lo += 0.012 * (wh - lo); d[i] = Math.tanh((imp + hp * Math.exp(-t * 55) * 1.6 + lo * Math.exp(-t * 16) * 0.35) * 1.15); } } return bf; };
  const bass = dur => { const len = Math.ceil(sr * dur), bf = actx.createBuffer(1, len, sr), d = bf.getChannelData(0); let ph = 0; for (let i = 0; i < len; i++){ const t = i / sr, f = 80 * Math.exp(-t * 0.8) + 25; ph += 2 * Math.PI * f / sr; const env = Math.exp(-t * 1.2); d[i] = (Math.sin(ph) * 0.7 + Math.sin(ph * 2) * 0.2 + Math.sin(ph * 0.5) * 0.3) * env * Math.tanh(env * 2); } return bf; };
  const rumble = dur => { const len = Math.ceil(sr * dur), bf = actx.createBuffer(2, len, sr); for (let ch = 0; ch < 2; ch++){ const d = bf.getChannelData(ch); let br = 0; const dr = 0.015 + Math.random() * 0.01; for (let i = 0; i < len; i++){ const t = i / sr; br = (br + dr * (Math.random() * 2 - 1)) / (1 + dr); d[i] = br * 35 * Math.pow(Math.max(0, 1 - t / dur), 1.5) * (0.5 + 0.5 * Math.sin(t * 2.3 + ch)) * (0.5 + 0.5 * Math.sin(t * 0.7 + ch * 3)); } } return bf; };
  WXA.buf = {ctx:actx, snap:[snap(0.032), snap(0.022)], crack:crack(0.11), bass:[bass(2.5), bass(1.8)], rumble:[rumble(5), rumble(7)]}; return WXA.buf; }
function fxThunder(dist){ if (!soundOn || !AU.ready || !actx) return; try { const C = wxBuild(), now = actx.currentTime + (dist || 0), v = Math.min(1.2, soundLevel / 100 * 1.4) * (FX.gentle ? 0.75 : 1), out = actx.createDynamicsCompressor(); out.threshold.value = -18; out.ratio.value = 12; out.attack.value = 0.001; out.release.value = 0.08; out.connect(auOut());
  const play = (buf, at, vol, o) => { const s = actx.createBufferSource(); s.buffer = buf; let n = s; const f = (type, freq, q) => { const bq = actx.createBiquadFilter(); bq.type = type; bq.frequency.value = freq; if (q) bq.Q.value = q; n.connect(bq); n = bq; };
    if (o.hp) f("highpass", o.hp, 0.7); if (o.bp) f("bandpass", o.bp, o.q || 1.2); if (o.lp) f("lowpass", o.lp, 0.7); const g = actx.createGain(); g.gain.value = vol; n.connect(g); n = g; if (o.pan != null && actx.createStereoPanner){ const p = actx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, o.pan)); n.connect(p); n = p; } n.connect(out); s.start(at); s.stop(at + buf.duration); s.onended = () => { try { s.disconnect(); } catch(e){} }; };
  const pan = (Math.random() - 0.5) * 0.5, rs = now + 0.045 + Math.random() * 0.06;
  play(C.snap[0], now, v * 1.0, {hp:1800, bp:4800, q:2.2, pan}); play(C.crack, now + 0.003, v * 0.4, {hp:900, bp:2600, q:1.1, pan});
  play(C.bass[0], now + 0.005, v * 1.1, {lp:120}); play(C.snap[1], rs, v * 0.6, {hp:1700, bp:4300, q:1.8, pan:pan + (Math.random() - 0.5) * 0.6});
  play(C.rumble[0], now + 0.08, v * 0.5, {lp:250}); play(C.bass[1], rs + 0.01, v * 0.6, {lp:90}); play(C.rumble[1], now + 0.5 + Math.random() * 0.5, v * 0.22, {lp:150, pan:(Math.random() - 0.5) * 0.8}); } catch(e){} }
function wxAmbientStop(){ if (!WXA.amb) return; const A = WXA.amb; WXA.amb = null; WXA.cur = null; try { const t = actx.currentTime; A.g.gain.cancelScheduledValues(t); A.g.gain.setValueAtTime(A.g.gain.value, t); A.g.gain.linearRampToValueAtTime(0, t + 1.5); setTimeout(() => A.nodes.forEach(n => { try { n.stop ? n.stop() : 0; n.disconnect(); } catch(e){} }), 1700); } catch(e){} }
function wxAmbient(w){ const want = FX.snd && soundOn && AU.ready && actx && FX.q === "full" && (w === "rain" || w === "storm" || w === "wind") ? w : null; if (want === WXA.cur) return; wxAmbientStop(); if (!want) return;
  try { const g = actx.createGain(), nodes = []; g.gain.value = 0; g.connect(auOut()); const layer = (type, f, q, vol) => { const s = actx.createBufferSource(); s.buffer = wxNoiseBuf(); s.loop = true; const bq = actx.createBiquadFilter(); bq.type = type; bq.frequency.value = f; bq.Q.value = q; const lg = actx.createGain(); lg.gain.value = vol; s.connect(bq).connect(lg).connect(g); s.start(); nodes.push(s, bq, lg); return bq; };
    if (want === "wind"){ const bq = layer("bandpass", 600, 2, 0.6); layer("bandpass", 2000, 5, 0.12); const lfo = actx.createOscillator(), lg = actx.createGain(); lfo.frequency.value = 0.12; lg.gain.value = 220; lfo.connect(lg).connect(bq.frequency); lfo.start(); nodes.push(lfo, lg); }
    else { layer("bandpass", 3000, 0.8, want === "storm" ? 0.7 : 0.5); layer("lowpass", 400, 0.6, want === "storm" ? 0.5 : 0.3); }
    const target = (want === "wind" ? 0.05 : want === "storm" ? 0.09 : 0.06) * (FX.gentle ? 0.7 : 1), t = actx.currentTime; g.gain.linearRampToValueAtTime(target, t + 2.5); nodes.push(g); WXA.amb = {g, nodes}; WXA.cur = want; } catch(e){} }

setInterval(() => { if (WXA.amb && (document.hidden || (typeof atHome === "function" && atHome()) || !fxOn())) wxAmbientStop(); }, 1000);

