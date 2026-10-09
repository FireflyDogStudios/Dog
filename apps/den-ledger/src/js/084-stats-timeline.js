/* ===== Stats & timeline (background tracker for tuning the curve) ===== */
function teleState(){ state.tele = state.tele || {play:0, ev:[], snap:[], last:{}}; const T = state.tele; T.ev = T.ev || []; T.snap = T.snap || []; T.last = T.last || {}; T.play = T.play || 0; return T; }
function tlog(type, detail){ if (!state) return; const T = teleState(); T.ev.push([Math.round(T.play), type, detail === undefined ? "" : String(detail).slice(0, 60)]); if (T.ev.length > 500) T.ev.splice(0, T.ev.length - 500); }
function teleSnap(){ const T = teleState(), H = huntState(), K = state.pack || {pups:[]}, dps = dingoDps(), hp = enemyHP(false);
  T.snap.push([Math.round(T.play), playerLevel(), state.treats.earned || 0, Math.round(dps), Math.round(hp), +(hp / Math.max(0.1, dps)).toFixed(1), H.kills || 0, Math.round(H.meats || 0), shopState().coins, state.treats.bones || 0, H.weapons.length, (K.pups || []).length, zoneId(), (trialState().tp || 0), (titanState().overpower || 0)]);
  if (T.snap.length > 600){ const keep = T.snap.slice(-200), old = T.snap.slice(0, -200).filter((_, i) => i % 2 === 0); T.snap = old.concat(keep); } }
setInterval(() => { if (!state || document.hidden) return; const T = teleState(); T.play += 1;
  const L = playerLevel(); if (T.last.lvl !== undefined && L > T.last.lvl) tlog("level", L); T.last.lvl = L;
  const z = zoneId(); if (T.last.zone !== undefined && z !== T.last.zone) tlog("zone", z); T.last.zone = z;
  ["meadow","forest","moon"].forEach(k => { if (!ZONES[k]) return; const M = zm(k), key = "zr" + k, ko = "zo" + k; if (!T.last[key] && M.h >= READY_KILLS){ T.last[key] = 1; tlog("ready", k); } if (!T.last[ko] && M.o >= OP_KILLS){ T.last[ko] = 1; tlog("overpowered", k); } });
  if (Math.round(T.play) % 60 === 0) teleSnap(); }, 1000);
function fmtPlay(s){ s = Math.round(s); const h = Math.floor(s/3600), m = Math.floor(s%3600/60); return h ? h + "h " + m + "m" : m + "m " + (s%60) + "s"; }
function teleReport(){ const T = teleState(), last = T.snap[T.snap.length-1];
  return JSON.stringify({v: DEVLOG[DEVLOG.length-1].v, play: Math.round(T.play), level: playerLevel(), events: T.ev, snapCols: ["t","lvl","xp","dps","enemyHp","ttk","kills","meats","coins","bones","weapons","pups","zone","tp","overpower"], snaps: T.snap}); }
function openStats(){ const T = teleState(); const ov = document.createElement("div"); ov.className = "sos-ov setov";
  const lvls = T.ev.filter(e => e[1] === "level"), other = T.ev.filter(e => e[1] !== "level"), last = T.snap[T.snap.length-1];
  ov.innerHTML = `<div class="sos-card setcard statcard"><div class="jar-top"><h3>📈 Stats &amp; timeline</h3><button class="x" data-close aria-label="Close">×</button></div>
    <p class="small">A quiet record of your play, used to tune how fast things unlock. Play time only counts while the game is open on screen.</p>
    <div class="statgrid"><div><b>${fmtPlay(T.play)}</b><span class="small">played</span></div><div><b>${playerLevel()}</b><span class="small">level</span></div><div><b>${(huntState().kills||0).toLocaleString()}</b><span class="small">creatures</span></div><div><b>${Math.round(dingoDps()).toLocaleString()}</b><span class="small">damage per second</span></div><div><b>${(enemyHP(false)/Math.max(0.1,dingoDps())).toFixed(1)}s</b><span class="small">per creature</span></div><div><b>${T.snap.length}</b><span class="small">snapshots</span></div></div>
    <h4>⬆️ Level ups</h4>${lvls.length ? `<table class="stab"><tr><th>Level</th><th>At</th><th>Gap</th></tr>${lvls.map((e,i) => `<tr><td>${esc(e[2])}</td><td>${fmtPlay(e[0])}</td><td>${fmtPlay(e[0] - (i ? lvls[i-1][0] : 0))}</td></tr>`).join("")}</table>` : `<p class="small">None recorded yet.</p>`}
    <h4>🔓 Timeline</h4>${other.length ? `<ul class="tline">${other.slice().reverse().map(e => `<li><b>${fmtPlay(e[0])}</b> ${esc(e[1])} <span class="small">${esc(e[2])}</span></li>`).join("")}</ul>` : `<p class="small">Nothing yet.</p>`}
    <div class="btns" style="margin-top:12px"><button class="go" data-st="copy">📋 Copy report for the Dev Team</button></div><p class="small stmsg" aria-live="polite"></p></div>`;
  document.body.appendChild(ov);
  ov.addEventListener("click", e => { if (e.target === ov || e.target.closest("[data-close]")){ ov.remove(); return; } if (e.target.closest('[data-st="copy"]')){ const txt = teleReport(), msg = ov.querySelector(".stmsg"); const done = () => { msg.textContent = "Copied! Paste it to Claude."; }; try { navigator.clipboard.writeText(txt).then(done, () => { fallbackCopy(txt); done(); }); } catch(err){ fallbackCopy(txt); done(); } } }); }
function fallbackCopy(t){ const ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch(e){} ta.remove(); }

