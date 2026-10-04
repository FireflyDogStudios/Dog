/* ===== Trials (Events tab) ===== */
const TRIAL_WAVES = 10, READY_KILLS = 60, OP_KILLS = 300;
function trialState(){ const H = huntState(); H.trials = H.trials || {best:{}, clears:{}, tp:0, passClaimed:{}, gifts:{}}; const T = H.trials; T.best = T.best || {}; T.clears = T.clears || {}; T.passClaimed = T.passClaimed || {}; T.gifts = T.gifts || {}; T.tp = T.tp || 0; T.metaBest = T.metaBest || {}; return T; }
function zoneIdx(z){ return Object.keys(ZONES).indexOf(z); }
/* Per-map mastery: "ready" fills when you clear creatures in under ~6s, "overpowered" uses the same rule as the god bar (under ~2.8s). */
function zm(z){ const H = huntState(); H.zm = H.zm || {}; H.zm[z] = H.zm[z] || {h:0, o:0}; return H.zm[z]; }
function zoneMastery(){ if (B.trial || B.mega || B.titan) return; const z = zoneId(), M = zm(z), dm = dropMult(enemyHP(false)); if (dm <= 0.75 && M.h < READY_KILLS) M.h++; if (dm <= 0.35 && M.o < OP_KILLS) M.o++; }
function trialReady(z){ return devOn || zm(z).h >= READY_KILLS || playerLevel() >= ZONES[z].lvl + 5; }
function zoneOP(z){ return devOn || zm(z).o >= OP_KILLS; }
function trialLvl(z){ return Math.max(2, ZONES[z].lvl); }
function trialPool(){ const z = zone(); if (z.home){ const all = []; Object.values(TOD_MONSTERS).forEach(L => L.forEach(m => { if (!all.some(x => x[0] === m[0])) all.push(m); })); return all; } return z.monsters || []; }
function trialNeed(w, meta){ return meta ? 5 + 2*w : 2 + 2*w; }
function trialTime(w){ return 50 + 5*w; }
function trialHpMult(mf){ const T = B.trial, w = T ? T.wave : 1; if (T && T.meta){ const b = 0.5 * Math.pow(1.13, w - 1); return mf[2] >= 8 ? b * 4 : b; } return mf[2] >= 8 ? mf[2] * 0.5 : 0.4 + 0.08*w; }
function trialFoe(){ const T = B.trial, pool = trialPool(); if (!pool.length) return null;
  if (T.bossDue){ T.bossDue = false; const m = pool[pool.length-1]; return [m[0], "Trial Warden " + m[1], 10 + Math.min(T.wave, 40)]; }
  if (T.meta && T.wave > 8 && Math.random() < Math.min(1, (T.wave - 8) / 15)){ const m = pool[Math.floor(Math.random()*pool.length)]; return [m[0], "Elder " + m[1], 10 + Math.min(T.wave, 40)]; }
  const hi = Math.min(pool.length, 2 + Math.floor(Math.min(T.wave, TRIAL_WAVES) * pool.length / TRIAL_WAVES)), m = pool[Math.floor(Math.random()*hi)];
  return [m[0], m[1], 1]; }
function startTrial(z, meta){ if (SHELVED.trials) return; if (B.trial || B.mega || B.titan || atHome()) return; if (!ZONES[z] || playerLevel() < trialLvl(z) || !trialReady(z)) return; if (meta && !zoneOP(z)) return;
  if (zoneId() !== z) travelTo(z);
  B.enemies.forEach(E => E.el.remove()); B.enemies = []; B.spawnIn = 1.5;
  B.trial = {zone:z, meta:!!meta, wave:1, pts:0, kills:0, waveEnd: Date.now() + trialTime(1)*1000, energy:100, lastT: Date.now(), loot:[], bossDue:false, tp:0};
  tab = "hunt"; try { localStorage.setItem("dengame-tab", tab); } catch(e){} render(); window.scrollTo(0,0);
  moonBanner((meta ? "META TRIAL: " : "TRIAL: ") + zoneData(z).name.toUpperCase(), meta ? "Every kill fills the power bar. How far can you go?" : "Wave 1 of " + TRIAL_WAVES + ": beat it before the timer runs out!"); sfx("horn"); }
function trialBar(){ const hero = document.querySelector("section.hero"); if (!hero) return null; let b = hero.querySelector("#trialbar"); if (!b){ b = document.createElement("div"); b.id = "trialbar"; hero.appendChild(b); } return b; }
function metaDrain(w){ return 3 + 0.25*w; }
function trialDamage(dmg){ return; /* v0.20: Meta power comes from kills now (trialKill) */ const T = B.trial; if (!T || !T.meta || !(dmg > 0)) return; const ref = enemyHP(false) * trialHpMult([0,"",1]); T.energy = Math.min(100, T.energy + 25 * dmg / Math.max(1, ref)); }
function trialTick(){ const T = B.trial; if (!T) return; const now = Date.now(), dt = Math.min(1, (now - T.lastT) / 1000); T.lastT = now; const need = trialNeed(T.wave, T.meta), b = trialBar();
  if (T.meta){ const P = dingoPos(), near = P && B.enemies.some(E => !E.dead && !E.passing && E.x - P.x < 120), grace = now < (T.graceUntil || 0); if (!grace) T.energy = Math.max(0, T.energy - metaDrain(T.wave) * dt * (near ? 1 : 0.2));
    if (b) b.innerHTML = `<b>♾️ ${esc(zoneData(T.zone).name)} Meta Trial · Wave ${T.wave}</b><span class="mhp"><i style="width:${T.energy}%;background:linear-gradient(90deg,#5ac8ff,#a77bd6)"></i></span><span class="mtime${T.energy < 25 ? " low" : ""}">💨 Zoomies · Power ${Math.round(T.energy)}% · ${T.pts}/${need} to the next wave</span>`;
    if (T.energy <= 0) endTrial(false); return; }
  const left = Math.max(0, (T.waveEnd - now)/1000);
  if (b) b.innerHTML = `<b>🏆 ${esc(zoneData(T.zone).name)} Trial · Wave ${T.wave}/${TRIAL_WAVES}</b><span class="mhp"><i style="width:${Math.min(100, 100*T.pts/need)}%"></i></span><span class="mtime${left < 10 ? " low" : ""}">💨 Zoomies · ${T.pts}/${need} · ${Math.ceil(left)}s left</span>`;
  if (left <= 0) endTrial(false); }
function trialKill(E){ const T = B.trial; if (!T || !E.moonPts) return; T.kills++; if (T.meta){ T.energy = Math.min(100, T.energy + (E.moonPts >= 8 ? 30 : 12)); T.graceUntil = Date.now() + 3000; } T.pts += E.moonPts >= 8 ? 5 : 1;
  if (E.moonBoss){ const rk = T.wave >= 9 ? "legendary" : T.wave >= 6 ? "epic" : "rare"; if (Math.random() < (T.meta ? 0.12 : 0.35 + 0.03*T.wave)){ const res = dropWeapon(E, false, rk); if (res && !res.salvaged){ res.w.trial = T.zone; T.loot.push(res.w.name); } dropFx(E, res); } }
  if (T.pts >= trialNeed(T.wave, T.meta)){ const gain = Math.ceil(T.wave * (zoneIdx(T.zone) + 1) * (T.meta ? 0.6 : 1)); T.tp += gain;
    if (!T.meta && T.wave >= TRIAL_WAVES){ endTrial(true); return; }
    T.wave++; T.pts = 0; T.waveEnd = Date.now() + trialTime(T.wave)*1000; if (T.wave % 5 === 0) T.bossDue = true;
    moonBanner("WAVE " + T.wave + (!T.meta && T.wave === TRIAL_WAVES ? " (FINAL)" : ""), T.wave % 5 === 0 ? "A Trial Warden is coming!" : T.meta && T.wave > 8 ? "The elders are stirring…" : "Faster, tougher, keep going!"); sfx("horn"); } }
function endTrial(won){ const T = B.trial; if (!T) return; tlog(T.meta ? "meta" : "trial", T.zone + " wave " + T.wave + (won ? " won" : "")); B.trial = null; const b = document.getElementById("trialbar"); if (b) b.remove();
  B.enemies.forEach(E => E.el.remove()); B.enemies = []; B.spawnIn = 2;
  const S = trialState(), cleared = T.meta ? T.wave - 1 : (won ? TRIAL_WAVES : T.wave - 1); S.tp += T.tp; let extra = "", title, icon;
  if (T.meta){ const prev = S.metaBest[T.zone] || 0; S.metaBest[T.zone] = Math.max(prev, cleared); title = "Meta trial over"; icon = "♾️"; if (cleared > prev) extra = " New best!"; }
  else { S.best[T.zone] = Math.max(S.best[T.zone]||0, cleared); title = won ? "Trial complete!" : "Trial failed"; icon = won ? "🏆" : "⏳";
    if (won){ const first = !S.clears[T.zone]; S.clears[T.zone] = (S.clears[T.zone]||0) + 1; const bn = first ? 15 * (zoneIdx(T.zone)+1) : 3 * (zoneIdx(T.zone)+1); earn(bn); extra = ` ${first ? "First clear! " : ""}+${bn} bones.`; } }
  const what = T.meta ? `Your power ran out on wave ${T.wave}` : won ? "You beat all " + TRIAL_WAVES + " waves" : "Time ran out on wave " + T.wave;
  const best = T.meta ? `Best meta wave: ${S.metaBest[T.zone]}` : `Best: wave ${S.best[T.zone]} of ${TRIAL_WAVES}`;
  if (!/First clear|New best/.test(extra)){ moonBanner(icon + " " + title.toUpperCase(), cleared + " wave" + (cleared===1?"":"s") + " · +" + T.tp + " Trial Points"); feed(icon, title + ": +" + T.tp + " Trial Points" + (extra ? " ·" + extra : ""), "#ffd34d"); sfx(won || T.meta ? "chest" : "oops"); save(title); return; }
  const ov = document.createElement("div"); ov.className = "lvlup"; ov.innerHTML = `<div class="card"><div class="rays"></div><div class="big-badge" style="font-size:2.4rem">${icon}</div><h3>${title}</h3><p>${what} in ${esc(zoneData(T.zone).name)}. ${cleared} wave${cleared===1?"":"s"} cleared, ${T.kills} creatures, <b>+${T.tp} Trial Points</b>.${extra}${T.loot.length ? " Loot: " + esc(T.loot.join(", ")) + "." : ""}</p><p class="small">${best}</p><button class="go" data-close>Back to the hunt</button></div>`;
  document.body.appendChild(ov); autoCloseBox(ov); ov.addEventListener("click", e => { if (e.target === ov || e.target.closest("[data-close]")) ov.remove(); }); sfx(won || T.meta ? "chest" : "oops"); save(title); }
function mbar(v, max, col){ return `<span class="zbar"><i style="width:${Math.min(100, 100*v/max)}%;background:${col}"></i></span>`; }
function trialSection(){ const S = trialState(), L = playerLevel(), busy = B.trial || B.mega || B.titan;
  const rows = Object.entries(ZONES).filter(([z]) => !SHELVED.zones.includes(z)).map(([z, Z]) => { const zd = zoneData(z), M = zm(z), lvlOk = L >= trialLvl(z), ready = lvlOk && trialReady(z), op = zoneOP(z), best = S.best[z] || 0, mb = S.metaBest[z] || 0;
    if (!lvlOk) return `<div class="trialrow locked"><span class="tz">${emoImg(zd.icon)}</span><span class="tn"><b>${esc(zd.name)}</b><span class="small">Reach level ${trialLvl(z)} to explore this trial</span></span></div>`;
    return `<div class="trialrow"><span class="tz">${emoImg(zd.icon)}</span><span class="tn"><b>${esc(zd.name)}</b>
      ${ready ? `<span class="small">Best: wave ${best}/${TRIAL_WAVES}${S.clears[z] ? " · cleared ×" + S.clears[z] : ""}${op ? " · Meta best: wave " + mb : ""}</span>` : `<span class="small">Get comfortable hunting here first: ${M.h}/${READY_KILLS} quick wins</span>${mbar(M.h, READY_KILLS, "var(--moss)")}`}
      ${ready && !op ? `<span class="small">Overpowered: ${M.o}/${OP_KILLS} (opens Meta mode and this area's Bestiary pages)</span>${mbar(M.o, OP_KILLS, "#a77bd6")}` : ""}</span>
      <span class="btns" style="flex-direction:column">${ready ? `<button class="go" data-a="trial-start" data-id="${z}" ${busy ? "disabled" : ""}>${B.trial && B.trial.zone === z && !B.trial.meta ? "In progress" : "Start trial"}</button>` : ""}${op ? `<button data-a="trial-meta" data-id="${z}" ${busy ? "disabled" : ""}>♾️ Meta</button>` : ""}</span></div>`; }).join("");
  return `<section class="box" aria-labelledby="trial-h"><h2 id="trial-h">🏆 Trials</h2><p class="hint">${TRIAL_WAVES} waves of that area's creatures. Clear each wave before its timer runs out, or the trial ends. A Trial Warden shows up on waves 5 and 10. Cleared waves earn Trial Points.</p><p class="hint">♾️ <b>Meta mode</b> opens once you're overpowered in an area. No timer: a power bar drains over time and your damage fills it back up. The waves never stop getting tougher, until only elders are left.</p>${atHome() ? `<p class="small">Head out of the den to start a trial.</p>` : ""}<div class="trials">${rows}</div></section>`; }
const TRIAL_PASS = [[30,"brew","str","Strength Brew I"],[90,"bones",5,"5 bones"],[180,"bait",0,"Bait"],[300,"brew","luck","Luck Brew I"],[480,"coins",3,"3 Dingo Coins"],[720,"bait",1,"Better bait"],[1000,"brew2","cur","Tier II brew"],[1400,"bones",25,"25 bones"],[1900,"bait",2,"Best bait"],[2500,"tome",1,"A random Tome"],[3300,"coins",10,"10 Dingo Coins"],[4300,"brew2","str","Strength Brew II"],[5600,"bones",60,"60 bones"],[7200,"hatch",3,"3 free rescues from your best basket"]];
function passReward(r){ const [need, type, val, label] = r; const B2 = boostState();
  if (type === "brew") B2.inv[val+"0"] = (B2.inv[val+"0"]||0) + 1; if (type === "brew2") B2.inv[val+"1"] = (B2.inv[val+"1"]||0) + 1;
  if (type === "bandana") giveBandana(val); if (type === "coins") shopState().coins += val; if (type === "bones") earn(val); if (type === "bait"){ const S = baitState(); S.inv[val] = (S.inv[val]||0) + 1; }
  if (type === "tome"){ const ks = Object.keys(TOME_T).filter(k => !k.startsWith("hw")); giveTome(ks[Math.floor(Math.random()*ks.length)] + "1"); }
  if (type === "hatch"){ const L = playerLevel(), bk = BASKETS.filter(b => L >= b.lvl).pop() || BASKETS[0], got = []; for (let i=0;i<val;i++){ const p = hatchOne(bk); packState().pups.push(p); got.push(p); } if (packState().autoEquip) packAutoEquip(); syncPups(); setTimeout(() => showHatchFx(got, bk.icon), 400); }
  toast("🎟️ Trial Pass: " + label + "!"); }
function passSection(){ const S = trialState();
  return `<section class="box" aria-labelledby="pass-h"><div class="jar-top"><h2 id="pass-h">🎟️ Trial Pass</h2><span class="qcount">${S.tp} TP</span></div><p class="hint">Trial Points come from every wave you clear. Harder areas give more.</p><div class="passrow">${TRIAL_PASS.map((r,i) => { const got = S.passClaimed[i], ready = !got && S.tp >= r[0]; return `<div class="passcell${got ? " got" : ready ? " ready" : ""}"><span class="small">${r[0]} TP</span><b>${esc(r[3])}</b>${got ? `<span class="small">✓ Claimed</span>` : ready ? `<button class="go" data-a="pass-claim" data-id="${i}">Claim</button>` : `<span class="small">Locked</span>`}</div>`; }).join("")}</div></section>`; }
function giftFor(d, dim){ if (d === dim) return {t:"bones", v:25, label:"25 bones (month finale)", big:true}; if (d === 14) return {t:"tome", v:1, label:"A random Tome", big:true}; if (d === 21) return {t:"hatch", v:2, label:"2 free rescues", big:true}; if (d % 7 === 0) return {t:"bones", v:8, label:"8 bones", big:true};
  if (d % 5 === 0) return {t:"ess", v:3, label:"3 random essence"}; if (d % 3 === 0) return {t:"brew", v:d > 15 ? 1 : 0, label:(d > 15 ? "Tier II" : "Tier I") + " brew"}; if (d % 4 === 0) return {t:"coins", v:2, label:"2 Dingo Coins"}; return {t:"meat", v:3 + Math.floor(d/5), label:"A bag of meat + a treat"}; }
function giftSection(){ const S = trialState(), now = new Date(), y = now.getFullYear(), mo = now.getMonth(), dim = new Date(y, mo+1, 0).getDate(), today = now.getDate(), key = todayIso().slice(0,7);
  return `<section class="box" aria-labelledby="gift-h"><h2 id="gift-h">🗓️ Daily gifts</h2><p class="hint">A gift for every day of the month. Missed one? You can still open any earlier day.</p><div class="giftcal">${Array.from({length:dim}, (_,i) => { const d = i+1, g = giftFor(d, dim), got = S.gifts[key + "-" + d], open = d <= today && !got; return `<button class="gday${got ? " got" : open ? " open" : ""}${g.big ? " big" : ""}${d === today ? " today" : ""}" ${open ? `data-a="gift-claim" data-id="${d}"` : "disabled"} title="${esc(g.label)}"><b>${d}</b><span>${got ? "✓" : g.big ? "🎁" : "📦"}</span></button>`; }).join("")}</div></section>`; }
function giftDim(ym){ const [y, m] = (ym || todayIso().slice(0,7)).split("-").map(Number); return new Date(y, m, 0).getDate(); }
function claimGift(d, ym){ const S = trialState(), now = new Date(), cur = todayIso().slice(0,7); ym = ym || cur; const dim = giftDim(ym), key = ym + "-" + d; if (S.gifts[key] || (ym === cur && d > now.getDate())) return; S.gifts[key] = Date.now(); const g = giftFor(d, dim), B2 = boostState();
  if (g.t === "bones") earn(g.v); if (g.t === "coins") shopState().coins += g.v; if (g.t === "meat"){ huntState().meats += Math.round(enemyHP(false) * g.v); giveTreat(randomTreat(), 1, true); }
  if (g.t === "ess"){ const ks = ["ember","tide","wild","night","spark","bone"]; for (let i=0;i<g.v;i++) addEss(ks[Math.floor(Math.random()*ks.length)], 1); }
  if (g.t === "brew"){ const ts = Object.keys(POT_TYPES), t = ts[Math.floor(Math.random()*ts.length)]; B2.inv[t+g.v] = (B2.inv[t+g.v]||0) + 1; }
  if (g.t === "tome" || g.t === "hatch") passReward([0, g.t, g.v, g.label]); else toast("🗓️ Day " + d + ": " + g.label + "!");
  sfx("chest"); }

