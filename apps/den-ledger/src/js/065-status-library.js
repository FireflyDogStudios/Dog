/* ===================== v0.32 Status library: every buff (boon) and debuff (condition) in one list =====================
   Used by the target frame and your status bar. Add a status here once and every screen can show it. */
const STATUS = {
  trialpace:{n:"Trial Pace", i:"sprint", c:"boon", d:"Trial pace: creatures reach you faster and come more often."},
  hackles:{n:"Hackles Up", i:"wolf-head", c:"boon", d:"Hits harder."},
  swift:{n:"Swift Paws", i:"sprint", c:"boon", d:"Attacks faster."},
  lucky:{n:"Lucky", i:"clover", c:"boon", d:"Better drops."},
  brew:{n:"Brew", i:"crystal-ball", c:"boon", d:"A brew is working."},
  windy:{n:"Windy", i:"wind-slap", c:"boon", d:"Weapons ride the wind: +25% attack speed."},
  thickcoat:{n:"Thick Coat", i:"bordered-shield", c:"boon", d:"Takes half damage unless hit by Blunt or Breaker weapons."},
  shielded:{n:"Shielded", i:"checked-shield", c:"boon", d:"A shield soaks damage first. Breakers shred it."},
  flying:{n:"Flying", i:"feather", c:"boon", d:"Hovers above the ground. Ranged weapons hit it harder."},
  quick:{n:"Quick", i:"sprint", c:"boon", d:"Moves fast and dodges some attacks. Ranged weapons never miss."},
  healer:{n:"Healer", i:"regeneration", c:"boon", d:"Slowly mends the creatures around it."},
  enraged:{n:"Enraged", i:"fangs", c:"boon", d:"Hits the field harder and faster."},
  burrs:{n:"Burrs", i:"thorny-vine", c:"cond", d:"Bleeding a little every second. Stacks up to 5."},
  scorched:{n:"Scorched", i:"flame", c:"cond", d:"Burning for a few seconds."},
  frostbit:{n:"Frostbit", i:"snowflake-1", c:"cond", d:"Moves at half speed."},
  dazed:{n:"Dazed", i:"sleepy", c:"cond", d:"Can't act for a moment."},
  weakened:{n:"Weakened", i:"footprint", c:"cond", d:"−30% damage."},
  sluggish:{n:"Sluggish", i:"snowflake-1", c:"cond", d:"−30% attack speed."},
  dazzled:{n:"Dazzled", i:"ghost", c:"cond", d:"Some attacks miss."}
};
const TRAIT_STATUS = {armored:"thickcoat", shield:"shielded", flying:"flying", fast:"quick", healer:"healer"};
function stOf(id, extra){ const S = STATUS[id] || (SE.DEFS[id] ? {i:SE.DEFS[id].icon, c:SE.DEFS[id].cls, n:SE.DEFS[id].name, d:SE.DEFS[id].desc} : STATUS.dazed); return Object.assign({id, icon:S.i, cls:S.c, name:S.n, desc:S.d}, extra || {}); }
let fkLast = 0;
function fkTick(force){ if (!fkOn || !state) return; const now = performance.now(); if (!force && now - fkLast < 140) return; fkLast = now;
  const L = levelFrom(state.treats.earned || 0), tl = $("#fk-tl"), tr = $("#fk-tr"), dock = $("#fk-dock"), tg = $("#fk-target"), ps = $("#fk-pst"), eq = $("#fk-eq");
  { const tb = document.getElementById("trialbar"); if (tb && tg){ const hr = tb.offsetParent ? tb.offsetParent.getBoundingClientRect().top : 0, r = tg.hidden ? null : tg.getBoundingClientRect(); tb.style.top = Math.round((r && r.height ? r.bottom + 8 : 14) - hr) + "px"; } }
  const pct = L.need ? Math.min(100, 100 * (L.into || 0) / L.need) : 0;
  if (tl) tl.innerHTML = `<span class="fk-badge"><span>${L.lvl}</span></span><div class="fk-who"><b>${esc(titleFor(L.lvl))}</b><div class="fk-xp"><i style="width:${pct.toFixed(1)}%"></i></div></div>`;
  if (tr){ const Z = zone(), W = typeof WX !== "undefined" && WX.w ? WEATHER[WX.w] : null, t = tod(); const H = huntState(), EV = gameEvent();
    tr.innerHTML = `<span class="fkhi">${fkIcon("pine-tree")} ${esc(Z.name)}</span><span class="sep"></span><span class="fkhi">${fkIcon(t === "night" ? "moon" : t === "dawn" ? "sunrise" : t === "dusk" ? "sunset" : "sun")} ${esc(TOD[t] ? TOD[t].name : "")}${W ? " · " + esc(W.name) : ""}</span><span class="sep"></span><span class="fkhi" id="fk-meat" title="Meat">${fkIcon("ham-shank")} <b>${EV ? fmtMeat(evCur ? evCur() : 0) : fmtMeat(H.meats)}</b></span>`; }
  if (performance.now() - invLastSync > 1000) invSync();
  const ivI = invState(), ivNew = Object.keys(ivI.newK).length, ivOver = ivI.over.length, home = atHome();
  document.body.classList.toggle("fkhome", home);
  if (!home) DEN_DOCK.forEach(([t]) => { const w0 = fkWinFor(t); if (w0) fkCloseWin(w0); });
  { const den = $("#fk-den"); if (den){ den.hidden = !home; const sg = home ? DEN_DOCK.map(([t]) => fkWinFor(t) ? 1 : 0).join("") : "x"; if (home && (force || den.dataset.sig !== sg)){ den.dataset.sig = sg; den.innerHTML = `<span class="cap">Den</span>` + DEN_DOCK.filter(([t]) => isUnlocked(t)).map(([t,ic,n,k]) => `<button type="button" data-fkopen="${t}" class="${fkWinFor(t) ? "on" : ""}" title="${esc(n)} (${k})" aria-label="${esc(n)}">${fkIcon(ic)}<span class="k">${k}</span></button>`).join(""); } } }
  if (dock){ const sig = FK_DOCK.map(([t]) => (t[0] === "@" || isUnlocked(t) ? 1 : 0) + (fkWinFor(t) ? 2 : 0)).join("") + (mailUnread() ? "m" : "") + (atHome() ? "h" : "") + "|" + ivNew + "|" + ivOver;
    if (force || dock.dataset.sig !== sig){ dock.dataset.sig = sig;     dock.innerHTML = FK_DOCK.filter(([t]) => t[0] === "@" || isUnlocked(t)).map(([t,ic,n,k]) => { const home = t === "@home", nm = home && atHome() ? "Walk out to the Meadow" : n, ico = home && atHome() ? "pine-tree" : ic; return `${home ? `<span class="fk-dsep"></span>` : ""}<button type="button" data-fkopen="${t}" class="${fkWinFor(t) || (home && atHome()) ? "on" : ""}" title="${esc(nm)} (${k})" aria-label="${esc(nm)}">${fkIcon(ico)}<span class="k">${k}</span>${t === "@mail" && mailUnread() ? `<span class="dot"></span>` : ""}${t === "bag" && (ivOver || ivNew) ? `<span class="ibadge${ivOver ? " full" : ""}" title="${ivOver ? ivOver + " waiting in your overflow bag" : ivNew + " new"}">${ivOver || ivNew}</span>` : ""}</button>`; }).join(""); } }
  if (tg){ const P = dingoPos(), BOSS = (B.titan && B.titan.E && !B.titan.E.dead) ? B.titan : (B.mega && B.mega.E && !B.mega.E.dead) ? B.mega : null, E = BOSS ? BOSS.E : P && B.enemies.filter(x => !x.dead && !x.passing).sort((a,b) => a.x - b.x)[0];
    tg.classList.toggle("big", !!BOSS);
    if (!E || atHome()){ tg.hidden = true; } else { tg.hidden = false; const tags = [E.titanDef ? "God" : E.megaDef ? "Mega boss" : E.boss ? "Boss" : E.elite ? "Elite" : "", ...(E.traits||[]).slice(0,2).map(t => CTRAITS[t] ? CTRAITS[t].n : "")].filter(Boolean).join(" · ");
      const L2 = SE.active(E).map(({s, D}) => { const left = s.until ? Math.max(0, (s.until - SE.now()) / 1000) : 0, tot = (D.dur || 1); return stOf(s.id, {name:D.name, desc:D.desc + " " + SE.rule(D), cls:D.cls, n: s.stacks > 1 ? s.stacks : undefined, t: s.until ? Math.min(100, 100 * left / tot) : undefined, left: s.until ? left.toFixed(1) + "s left" : undefined}); });
      if (E.shield > 0 && !SE.has(E, "shielded")) L2.push(stOf("shielded"));
      if (E.enraged && !SE.has(E, "enraged")) L2.push(stOf("enraged"));
      const hp = Math.max(0, Math.min(100, 100 * E.hp / E.max)), sh = E.shieldMax ? Math.max(0, Math.min(100, 100 * (E.shield||0) / E.shieldMax)) : 0;
      if (tg.dataset.eid !== String(E.id || E.name) || !tg.querySelector(".fk-sts")){ tg.dataset.eid = String(E.id || E.name); tg.innerHTML = `<div class="tn"><span class="fkhi">${fkIcon("crosshair")} <span class="nm"></span></span><small></small></div><div class="hp"><b></b><em></em><i></i></div><div class="fk-sts"></div>`; }
      tg.querySelector(".nm").textContent = BOSS ? (BOSS.def ? BOSS.def.name : BOSS.T ? BOSS.T.name : E.name) : (E.name || "Creature");
      let tm = ""; if (BOSS && BOSS.until){ const left = Math.max(0, (BOSS.until - performance.now()) / 1000); tm = Math.floor(left/60) + ":" + String(Math.floor(left%60)).padStart(2,"0") + (BOSS.enraged ? " · Enraged" : ""); }
      tg.querySelector("small").innerHTML = esc(tags) + (tm ? ` · <span class="tm${tm && parseInt(tm) === 0 && parseInt(tm.split(":")[1]) < 20 ? " low" : ""}">${esc(tm)}</span>` : "");
      if (BOSS && BOSS.enraged && !L2.some(x => x.id === "enraged")) L2.push(stOf("enraged"));
      tg.querySelector(".hp i").style.width = hp + "%"; tg.querySelector(".hp b").style.width = hp + "%"; tg.querySelector(".hp em").style.width = sh + "%"; fkStatusRow(tg.querySelector(".fk-sts"), L2); } }
  if (ps){ const L3 = [], nowD = SE.now();
    if (B.trial) L3.push(stOf("trialpace"));
    SE.active(DINGO).forEach(({s, D}) => { const left = s.until ? Math.max(0, (s.until - nowD) / 1000) : 0, tot = s.until ? Math.max(1, (s.until - (s.at || nowD)) / 1000) : 1;
      const desc = s.id.startsWith("brew-") && s.data && POT_TYPES[s.id.slice(5)] ? POT_TYPES[s.id.slice(5)].desc(s.data.v) : D.desc;
      L3.push(stOf(s.id, {name:D.name + (s.data && s.data.tier != null ? " " + ROMAN[s.data.tier] : ""), desc:desc + " " + SE.rule(D), cls:D.cls, n:s.stacks > 1 ? s.stacks : undefined, t:s.until ? 100 * left / tot : undefined, left:s.until ? (left >= 60 ? Math.ceil(left/60) + " min" : Math.ceil(left) + "s") + " left" : undefined})); });
    if (typeof WX !== "undefined" && WX.w === "wind") L3.push(stOf("windy"));
    fkStatusRow(ps, L3); }
  if (eq && (force || now % 2000 < 260)){ const H = huntState(); eq.innerHTML = H.equipped.map(id => H.weapons.find(w => w.id === id)).filter(Boolean).map(w => `<button type="button" data-fkweapon="${w.id}" title="${esc(w.name)}" style="--rc:${W_RARITY.find(r => r.k === w.r).col}">${wImg(w, "still")}</button>`).join(""); }
}
document.addEventListener("click", e => { const o = e.target.closest("[data-fkopen]"); if (o){ fkOpen(o.dataset.fkopen); return; }
  const cl = e.target.closest("[data-fkclose]"); if (cl){ const w = FKW.wins.find(x => x.el.contains(cl)); if (w) fkCloseWin(w); return; }
  const c = e.target.closest("[data-fkclaim]"); if (c){ claimMail(c.dataset.fkclaim); save("Mail accepted"); const w = fkWinFor("@mail"); if (w) fkRenderWin(w); fkTick(true); return; }
  const g = e.target.closest("[data-fkgo]"); if (g){ const m = mailState().find(x => x.id === g.dataset.fkgo); save("Mail read", true); goMail(m && m.go); return; }
  const d = e.target.closest("[data-fkdel]"); if (d && !d.disabled){ state.mail = mailState().filter(x => x.id !== d.dataset.fkdel); FKW.mailOpen.delete(d.dataset.fkdel); save("Mail deleted", true); const w = fkWinFor("@mail"); if (w) fkRenderWin(w); fkTick(true); return; }
  const w = e.target.closest("[data-fkweapon]"); if (w){ INV_TAB = "bags"; fkOpen("bag", true); render(); } });
document.addEventListener("keydown", e => { if (!fkOn || e.ctrlKey || e.metaKey || e.altKey) return; const a = document.activeElement; if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) return;
  if (e.key === "Escape"){ if (document.querySelector(".sos-ov,.lvlup,.mailov,#ivctx")) return; fkClose(); return; }
  if (e.key === "-" || e.key === "="){ const i = UI_SIZES.findIndex(x => +x[0] === uiPref), j = Math.max(0, Math.min(UI_SIZES.length - 1, (i < 0 ? 1 : i) + (e.key === "=" ? 1 : -1))); uiSetPref(+UI_SIZES[j][0]); toast("Interface size: " + UI_SIZES[j][1]); return; }
  const T = FK_DOCK.concat(atHome() ? DEN_DOCK : []).find(x => x[3].toLowerCase() === e.key.toLowerCase()); if (T){ e.preventDefault(); fkOpen(T[0]); } });
setInterval(() => fkTick(false), 150);
