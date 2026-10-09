/* ===== Huge pups, gem mining, refining, infusing ===== */
const GEMS = {
  ruby:{n:"Ruby", f:"hue-rotate(160deg) saturate(2)", fx:"dmg", per:3, d:"damage", ess:["ember","fury"], w:20},
  sapphire:{n:"Sapphire", f:"saturate(1.8)", fx:"spd", per:2, d:"attack speed", ess:["tide","storm"], w:20},
  emerald:{n:"Emerald", f:"hue-rotate(-80deg) saturate(2)", fx:"luck", per:4, d:"luck", ess:["wild","bloom"], w:18},
  topaz:{n:"Topaz", f:"hue-rotate(210deg) saturate(2.2) brightness(1.1)", fx:"loot", per:4, d:"drops", ess:["spark","hunger"], w:18},
  amethyst:{n:"Amethyst", f:"hue-rotate(80deg) saturate(1.8)", fx:"crit", per:1, d:"crit chance", ess:["night","star"], w:14},
  onyx:{n:"Onyx", f:"grayscale(1) brightness(.45) contrast(1.4)", fx:"boss", per:5, d:"boss damage", ess:["bone","spirit"], w:12},
  moonstone:{n:"Moonstone", f:"grayscale(1) brightness(1.45)", fx:"pup", per:5, d:"pup damage", ess:["howl","moon"], w:10},
  citrine:{n:"Citrine", f:"hue-rotate(190deg) saturate(2) brightness(1.2)", fx:"coin", per:6, d:"rare coin chance", ess:["cinder","star"], w:9},
  garnet:{n:"Garnet", f:"hue-rotate(130deg) saturate(1.6) brightness(.8)", fx:"ess", per:4, d:"bonus essence chance", ess:["frost","mist"], w:7},
  opal:{n:"Opal", f:"saturate(.6) brightness(1.3)", fx:"all", per:1, d:"damage, drops, and luck", ess:["dream","heart"], w:3, rainbow:true},
  starheart:{n:"Starheart", f:"hue-rotate(260deg) saturate(3) brightness(1.3)", fx:"all", per:2.5, d:"damage, drops, and luck", ess:["moon","heart","pack"], w:1, rainbow:true}
};
const SOCKET_LV = [5,15,30,50];
const RUNES = {ember:["dmg",1,"+1% damage"], storm:["dmg",1.2,"+1.2% damage"], sol:["dmg",2,"+2% damage"], tide:["spd",0.8,"+0.8% attack speed"], spark:["spd",0.8,"+0.8% attack speed"],
  wild:["luck",1.5,"+1.5% luck"], bloom:["luck",2,"+2% luck"], night:["crit",0.4,"+0.4% crit"], star:["crit",0.5,"+0.5% crit"], umbra:["crit",0.8,"+0.8% crit"],
  bone:["boss",2,"+2% boss damage"], fury:["boss",3,"+3% boss damage"], regal:["boss",5,"+5% boss damage"], cinder:["loot",1.5,"+1.5% drops"], hunger:["loot",1.5,"+1.5% drops"], hallow:["loot",3,"+3% drops"], yule:["loot",3,"+3% drops"],
  spirit:["ess",1.5,"+1.5% essence chance"], howl:["pup",2,"+2% pup damage"], pack:["pup",3,"+3% pup damage"], gilt:["coin",4,"+4% coin chance"],
  heart:["all",0.5,"+0.5% damage, drops, luck"], moon:["all",0.6,"+0.6% damage, drops, luck"],
  mist:["safe",3,"−3% crack risk on this gem"], frost:["safe",4,"−4% crack risk on this gem"], dream:["safe",5,"−5% crack risk on this gem"], arcane:["safe",8,"−8% crack risk, and +0.3% to everything"]};
function runeCost(k){ return ASP[k] && ASP[k].relic ? 1 : 3; }
function gemSafe(g){ return (g.runes || []).reduce((a,r) => a + (RUNES[r] && RUNES[r][0] === "safe" ? RUNES[r][1] : 0), 0) / 100; }
function crackRisk(g, extra){ return Math.max(0.01, (0.04 + 0.05 * (g.lv + 1)) * QUAL[g.q].crack - gemSafe(g) - (extra && RUNES[extra] && RUNES[extra][0] === "safe" ? RUNES[extra][1]/100 : 0)); }
const QUAL = {flawless:{n:"Flawless", m:1.25, crack:0.6, cap:10}, fine:{n:"Fine", m:1, crack:1, cap:10}, cracked:{n:"Cracked", m:0.7, crack:0, cap:0}};
const DEBUFFS = [["spd",-3,"−3% attack speed"],["loot",-3,"−3% drops"],["luck",-4,"−4% luck"],["dmg",-2,"−2% damage"]];
function gemState(){ const d = {rough:{}, gems:[], tumbler:[], energy:20, eLast:0, grid:[], depth:1, dust:0}; state.gemz = state.gemz || {}; for (const k in d) if (state.gemz[k] === undefined) state.gemz[k] = d[k]; return state.gemz; }
function gemArt(type, big){ const G = GEMS[type]; return `<span class="gemart${G.rainbow ? " rb" : ""}" style="filter:${G.f}">${emoImg("💎")}</span>`; }
function gemVal(g){ return GEMS[g.type].per * g.lv * QUAL[g.q].m; }
function gemBonus(fx){ if (!state.pack || !state.gemz) return 0; const K = state.pack; let s = 0;
  K.equipped.forEach(id => { const p = K.pups.find(x => x.id === id); if (!p || !p.sockets) return; p.sockets.forEach(gid => { const g = state.gemz.gems.find(x => x.id === gid); if (!g) return; if (GEMS[g.type].fx === fx || (GEMS[g.type].fx === "all" && ["dmg","loot","luck"].includes(fx))) s += gemVal(g); if (g.debuff && g.debuff[0] === fx) s += g.debuff[1];
    (g.runes || []).forEach(r => { const R = RUNES[r]; if (!R) return; if (R[0] === fx || (R[0] === "all" && ["dmg","loot","luck"].includes(fx))) s += R[1]; if (r === "arcane" && ["dmg","loot","luck","spd"].includes(fx)) s += 0.3; }); }); });
  return s / 100; }
function energyNow(){ const M = gemState(), now = Date.now(); if (!M.eLast) M.eLast = now; const gain = Math.floor((now - M.eLast) / 180000); if (gain > 0){ M.energy = Math.min(20, M.energy + gain); M.eLast += gain * 180000; if (M.energy >= 20) M.eLast = now; } return M.energy; }
function newGrid(depth){ const oct = isOct(), G2 = Object.entries(GEMS).filter(([k,g]) => !g.oct || oct), cells = []; for (let i=0;i<36;i++){ const r = Math.random(); if (r < 0.14 + depth*0.01){ const tot = G2.reduce((a,[k,g]) => a + g.w * (g.w < 10 ? 1 + depth*0.15 : 1), 0); let x = Math.random()*tot, t = "ruby"; for (const [k,g] of G2){ const w = g.w * (g.w < 10 ? 1 + depth*0.15 : 1); if (x < w){ t = k; break; } x -= w; } cells.push({g:t, open:false}); } else cells.push({g: oct && r > 0.85 ? "candy" : r < 0.35 ? "dust" : "", open:false}); } return cells; }
function mineTile(i){ if (!mineOpen()) return; const M = gemState(); if (!M.grid.length) M.grid = newGrid(M.depth); const c = M.grid[i]; if (!c || c.open || energyNow() < 1) return; M.energy--; if (M.energy === 19) M.eLast = Date.now(); c.open = true;
  if (c.g === "candy"){ const n = 20 + Math.floor(Math.random()*40); addEvCur(n); floatText("+" + n + " 🍬"); sfx("coin"); }
  else if (c.g === "dust"){ addEss("arcane", 1); floatText("+1 💠"); } else if (c.g){ M.rough[c.g] = (M.rough[c.g]||0) + 1; floatText("💎 Rough " + GEMS[c.g].n + "!"); sfx("gem"); } else sfx("dig");
  if (M.grid.every(x => x.open || !x.g || x.g === "candy")){ M.depth++; M.grid = newGrid(M.depth); toast("⛏️ You broke through to depth " + M.depth + "! Rarer gems hide down here."); } }
let REF = null;
function openRefine(type){ const M = gemState(); if (!(M.rough[type] > 0)) return; M.rough[type]--; save("Refining", true);
  REF = {type, stage:0, hits:[], zones:[{w:.3},{w:.22},{w:.14}], pos:0, dir:1, speed:[.9,1.25,1.6], raf:0};
  const ov = document.createElement("div"); ov.className = "roll-ov refine"; ov.setAttribute("role","dialog"); ov.setAttribute("aria-label","Refining");
  ov.innerHTML = `<div class="refbox"><h3>Refining a Rough ${esc(GEMS[type].n)}</h3><div class="refgem">${gemArt(type)}</div><p class="small" id="ref-step">Stage 1 of 3: <b>Cleave</b>. Tap when the marker is in the glowing zone. Misses can crack or shatter the gem.</p>
    <div class="refbar"><span class="refzone" id="ref-zone"></span><span class="refmark" id="ref-mark"></span></div><div class="refdots" id="ref-dots"><i></i><i></i><i></i></div>
    <div class="btns" style="justify-content:center"><button class="go big-btn" data-refcut>⚒️ Strike</button></div></div>`;
  document.body.appendChild(ov); placeZone(); const tick = t => { if (!REF) return; REF.pos += REF.dir * REF.speed[REF.stage] * 0.016; if (REF.pos > 1){ REF.pos = 1; REF.dir = -1; } if (REF.pos < 0){ REF.pos = 0; REF.dir = 1; } const m = document.getElementById("ref-mark"); if (m) m.style.left = (REF.pos*100) + "%"; REF.raf = requestAnimationFrame(tick); }; REF.raf = requestAnimationFrame(tick);
  ov.querySelector("[data-refcut]").addEventListener("click", refStrike); }
function placeZone(){ const z = REF.zones[REF.stage]; z.at = 0.1 + Math.random()*(0.8 - z.w); const el = document.getElementById("ref-zone"); if (el){ el.style.left = (z.at*100) + "%"; el.style.width = (z.w*100) + "%"; } }
function refStrike(){ if (!REF) return; const z = REF.zones[REF.stage], p = REF.pos, center = z.at + z.w/2, inZone = p >= z.at && p <= z.at + z.w, perfect = Math.abs(p - center) < z.w * 0.18;
  const res = perfect ? "perfect" : inZone ? "good" : "miss"; REF.hits.push(res); const dots = document.querySelectorAll("#ref-dots i"); if (dots[REF.stage]) dots[REF.stage].className = res; sfx(res === "miss" ? "crack" : "strike");
  const g = document.querySelector(".refgem"); if (g && g.animate) g.animate([{transform:"scale(1)"},{transform: res === "miss" ? "translateX(-6px) rotate(-8deg)" : "scale(1.15)"},{transform:"scale(1)"}], {duration:260});
  REF.stage++; if (REF.stage < 3){ const names = ["Cleave","Shape","Facet"]; document.getElementById("ref-step").innerHTML = `Stage ${REF.stage+1} of 3: <b>${names[REF.stage]}</b>. The zone gets smaller and the marker faster...`; placeZone(); return; }
  cancelAnimationFrame(REF.raf); const misses = REF.hits.filter(x => x === "miss").length, perf = REF.hits.filter(x => x === "perfect").length, type = REF.type, M = gemState(), ov = document.querySelector(".refine");
  let out, q; if (misses >= 2 || (misses === 1 && Math.random() < 0.35)){ out = "shattered"; } else if (misses === 1){ q = "cracked"; } else { q = perf >= 2 ? "flawless" : "fine"; }
  if (out === "shattered"){ const d = 3 + Math.floor(Math.random()*4); addEss("arcane", d); ov.querySelector(".refbox").innerHTML = `<h3>💥 It shattered...</h3><p class="small">The gem split apart, but you swept up <b>${d} Arcane Dust</b> 💠. Careful strikes next time!</p><button class="go" data-close>Okay</button>`; }
  else { const gem = {id: uid(), type, q, lv:0, ready: Date.now() + 5*60000}; if (q === "cracked"){ const db = DEBUFFS[Math.floor(Math.random()*DEBUFFS.length)]; gem.debuff = db; gem.locked = true; } M.tumbler.push(gem);
    ov.querySelector(".refbox").innerHTML = `<h3>${q === "flawless" ? "✨ Flawless cut!" : q === "fine" ? "💎 A fine cut" : "🩹 Cracked, but whole"}</h3><div class="refgem">${gemArt(type)}</div><p class="small">Your ${QUAL[q].n} ${esc(GEMS[type].n)} goes into the <b>polishing tumbler</b> for 5 minutes.${q === "cracked" ? " A cracked gem can't be infused and carries a small flaw: " + esc(gem.debuff[2]) + "." : q === "flawless" ? " Flawless gems are 25% stronger and crack less when infused." : ""}</p><button class="go" data-close>Into the tumbler</button>`; if (q === "flawless") { const r = ov.querySelector(".refgem").getBoundingClientRect(); rollBurst(r.left + r.width/2, r.top + r.height/2, "#9fe8ff", 24); } }
  REF = null; save("Refined"); ov.addEventListener("click", e => { if (e.target.closest("[data-close]")){ ov.remove(); render(); } }); }
function tumblerTick(){ const M = state && state.gemz; if (!M || !M.tumbler.length) return; const now = Date.now(), done = M.tumbler.filter(g => g.ready <= now); if (!done.length) return; M.tumbler = M.tumbler.filter(g => g.ready > now); done.forEach(g => { delete g.ready; M.gems.push(g); }); toast("💎 " + done.length + " gem" + (done.length > 1 ? "s" : "") + " finished polishing!"); save("Polished", true); }
setInterval(tumblerTick, 15000);
function infuseCost(g){ const n = (g.lv + 1) * 2; return Object.fromEntries(GEMS[g.type].ess.map(a => [a, n])); }
function infuseGem(id, rune){ const M = gemState(), g = M.gems.find(x => x.id === id); if (!g || g.locked || g.lv >= QUAL[g.q].cap) return; const c = Object.assign({}, infuseCost(g)); if (rune && RUNES[rune]) c[rune] = (c[rune]||0) + runeCost(rune); if (!Object.entries(c).every(([a,v]) => ess(a) >= v)) return; const crack = crackRisk(g, rune); Object.entries(c).forEach(([a,v]) => addEss(a, -v));
  g.lv++; if (rune && RUNES[rune]){ g.runes = g.runes || []; g.runes.push(rune); } if (g.lv < QUAL[g.q].cap && Math.random() < crack){ g.locked = true; g.q = "cracked"; g.debuff = DEBUFFS[Math.floor(Math.random()*DEBUFFS.length)]; sfx("crack"); toast("💥 The runes surged and the " + GEMS[g.type].n + " cracked! Locked at level " + g.lv + ", with a flaw: " + g.debuff[2]); }
  else { sfx("shimmer"); toast("✨ Infused! " + GEMS[g.type].n + " is now level " + g.lv); } }
function shatterGem(id){ const M = gemState(), g = M.gems.find(x => x.id === id); if (!g) return; const d = Math.round((g.lv + 1) * 5 * (g.q === "flawless" ? 1.5 : g.q === "cracked" ? 0.7 : 1)); M.gems = M.gems.filter(x => x.id !== id); packState().pups.forEach(p => { if (p.sockets) p.sockets = p.sockets.filter(x => x !== id); }); addEss("arcane", d); toast("💠 Shattered into " + d + " Arcane Dust"); sfx("shatter"); }
function gemSocketed(id){ return packState().pups.find(p => p.sockets && p.sockets.includes(id)); }
function mineView(){ const M = gemState(), e = energyNow(); if (!M.grid.length) M.grid = newGrid(M.depth); const nextE = e < 20 ? Math.max(0, 180 - Math.floor((Date.now() - M.eLast)/1000)) : 0;
  return `<div class="mine"><div class="minehead"><b>⛏️ Crystal Caves, depth ${M.depth}</b><span class="small">⚡ ${e}/20 pick energy${e < 20 ? " · +1 in " + Math.floor(nextE/60) + ":" + String(nextE%60).padStart(2,"0") : ""}</span></div>
    <div class="minegrid">${M.grid.map((c,i) => c.open ? `<span class="tile open">${c.g === "dust" ? emoImg("💠") : c.g === "candy" ? emoImg("🍬") : c.g ? gemArt(c.g) : ""}</span>` : `<button class="tile" data-a="mine" data-id="${i}" ${e < 1 ? "disabled" : ""} aria-label="Dig"></button>`).join("")}</div>
    <p class="small">Tap rocks to dig. Each swing uses 1 energy, and energy refills over time. Find <b>rough gems</b> and <b>Arcane Dust</b> 💠. Clear every gem to dig deeper, where rarer gems hide.</p></div>`; }
function gemsView(){ const M = gemState(), rough = Object.entries(M.rough).filter(([k,n]) => n > 0);
  return `<h3 class="pack-h" style="margin-top:0">🪨 Rough gems</h3><div class="gemrow">${rough.length ? rough.map(([k,n]) => `<div class="gemcard">${gemArt(k)}<b>${esc(GEMS[k].n)} ×${n}</b><span class="small">+${GEMS[k].per}% ${esc(GEMS[k].d)} per level</span><button class="go" data-a="refine" data-id="${k}">⚒️ Refine</button></div>`).join("") : `<p class="small">Dig in the Mine to find rough gems.</p>`}</div>
    ${M.tumbler.length ? `<h3 class="pack-h">🌀 Polishing tumbler</h3><div class="gemrow">${M.tumbler.map(g => `<div class="gemcard tumbling">${gemArt(g.type)}<b>${QUAL[g.q].n} ${esc(GEMS[g.type].n)}</b><span class="small">Ready in ${Math.max(0, Math.ceil((g.ready - Date.now())/60000))} min</span></div>`).join("")}</div>` : ""}
    <h3 class="pack-h">💎 Your gems</h3><p class="small">Infuse gems with essences from the Scriptorium to level them up. Each infusion can also <b>inscribe a rune</b> from any essence you've found: runes add their own bonus, and Mist, Frost, Dream, and Arcane runes make future infusions safer. Every infusion risks a crack, which locks the level and adds a small flaw. Shatter any gem for Arcane Dust 💠 (you have ${ess("arcane")}).</p>
    <div class="gemrow">${M.gems.length ? M.gems.map(g => { const rsel = (gemState().rsel || {})[g.id] || "", c = Object.assign({}, infuseCost(g)); if (rsel) c[rsel] = (c[rsel]||0) + runeCost(rsel); const can = !g.locked && g.lv < QUAL[g.q].cap && Object.entries(c).every(([a,v]) => ess(a) >= v), owner = gemSocketed(g.id), crack = Math.round(crackRisk(g, rsel) * 100);
      const runeOpts = Object.keys(RUNES).filter(k => (state.scrip && state.scrip.seen[k])).map(k => `<option value="${k}" ${rsel === k ? "selected" : ""}>${ASP[k].n} rune: ${RUNES[k][2]} (${runeCost(k)}, have ${ess(k)})</option>`).join("");
      return `<div class="gemcard q-${g.q}">${gemArt(g.type)}<b>${QUAL[g.q].n} ${esc(GEMS[g.type].n)} · Lv ${g.lv}</b><span class="small">+${gemVal(g).toFixed(1).replace(".0","")}% ${esc(GEMS[g.type].d)}${g.debuff ? ` · <span style="color:var(--warn)">${esc(g.debuff[2])}</span>` : ""}</span>${owner ? `<span class="small">🐾 Set in ${esc(owner.nick || pupName(owner))}</span>` : ""}${(g.runes||[]).length ? `<span class="gruns">${g.runes.map(r => `<span class="grune" title="${esc(RUNES[r][2])}" style="--ac:${ASP[r].c}">${essImg(r)}</span>`).join("")}</span>` : ""}
        ${g.locked ? `<span class="small">🔒 Locked by a crack</span>` : g.lv >= QUAL[g.q].cap ? `<span class="small">✨ Max level</span>` : `<span class="small">Infuse: ${Object.entries(c).map(([a,v]) => ASP[a].n + " " + ess(a) + "/" + v).join(", ")} · ${crack}% crack risk</span>`}
        ${!g.locked && g.lv < QUAL[g.q].cap ? `<select class="runesel" data-rune="${g.id}" aria-label="Rune to inscribe"><option value="">No rune (just infuse)</option>${runeOpts}</select>` : ""}
        <div class="btns">${!g.locked && g.lv < QUAL[g.q].cap ? `<button class="go" data-a="infuse" data-id="${g.id}" ${can ? "" : "disabled"}>🔮 Infuse</button>` : ""}<button data-a="shatter" data-id="${g.id}">💠 Shatter</button></div></div>`; }).join("") : `<p class="small">No finished gems yet.</p>`}</div>`; }
function mineSection(){ const M = gemState(), v = M.view || (mineOpen() ? "caves" : "work");
  return `<section class="box minebox" aria-labelledby="mine-h"><div class="jar-top"><h2 id="mine-h">⛏️ The Crystal Caves</h2><span class="small">${mineOpen() ? "⚡ " + energyNow() + "/20 energy · " : "🔒 Sealed until March · "}💠 ${ess("arcane")} dust · ${M.gems.length} gems</span></div>
    <div class="subtabs">${[["caves","⛏️ Dig"],["work","💎 Gem workshop"]].map(([k,l]) => `<button class="subtab${v === k ? " on" : ""}" data-a="mine-view" data-id="${k}">${l}</button>`).join("")}</div>
    ${v === "caves" ? (mineOpen() ? mineView() : `<div class="minesealed">${emoImg("🪨")}<h3>The Crystal Caves are sealed for the season</h3><p class="small">Frost and fallen leaves have blocked the tunnels from October through February. The caves reopen in <b>March</b>. Your gem workshop is still open, so polish, infuse, and set the gems you saved up.</p></div>`) : gemsView()}<p class="small" style="margin-top:10px">Set finished gems into HUGE pups from the Pack tab (tap a HUGE in My pack).</p></section>`; }
function pager(key, total, per){ const obj = key === "wpage" ? huntState() : packState(), pages = Math.max(1, Math.ceil(total / per)); if ((obj[key]||0) >= pages) obj[key] = pages - 1; if (pages <= 1) return "";
  const cur = obj[key] || 0; return `<div class="pager"><button data-a="page" data-id="${key}:${cur-1}" ${cur <= 0 ? "disabled" : ""}>‹ Prev</button><span class="small">Page ${cur+1} of ${pages}</span><button data-a="page" data-id="${key}:${cur+1}" ${cur >= pages-1 ? "disabled" : ""}>Next ›</button></div>`; }
function hugeSockets(p){ if (p.r !== "huge") return ""; const lv = pupLevel(p), M = gemState(), open = SOCKET_LV.filter(x => lv >= x).length; p.sockets = p.sockets || [];
  const free = M.gems.filter(g => !gemSocketed(g.id));
  return `<div class="sockets"><b class="small">💎 Gem sockets (${open}/4 open)</b><div class="gemrow">${SOCKET_LV.map((need,i) => { const gid = p.sockets[i], g = gid && M.gems.find(x => x.id === gid);
    if (lv < need) return `<div class="socket locked"><span class="small">🔒 Lv ${need}</span></div>`; if (g) return `<div class="socket filled">${gemArt(g.type)}<span class="small">${esc(GEMS[g.type].n)} Lv ${g.lv}</span><button class="x" data-a="unsock" data-id="${p.id}:${i}" aria-label="Remove gem">×</button></div>`;
    return `<div class="socket"><select data-sock="${p.id}:${i}" aria-label="Choose a gem"><option value="">Empty socket…</option>${free.map(x => `<option value="${x.id}">${QUAL[x.q].n} ${GEMS[x.type].n} Lv ${x.lv}</option>`).join("")}</select></div>`; }).join("")}</div><span class="small">Gems work while this Huge is following you.</span></div>`; }

function startBattle(){ if (state && state.hunt && state.hunt.pmoon && state.hunt.pmoon.until > Date.now() && !B.pmoon){ B.pmoon = state.hunt.pmoon; setTimeout(() => { const hr = document.querySelector("section.hero"); if (hr) hr.classList.add("pmoon"); }, 200); }
  if (state && !state.host) claimHost(); if (isHost()) checkOffline(); checkEventEnd(); if (B.running) return; B.running = true; B.last = 0; requestAnimationFrame(battleFrame); }
/* --- hunt v2: trails, roll effects, pity, offline --- */
const TRAIL = {junk:null, common:{c:"rgba(200,210,205,.55)", s:4}, uncommon:{c:"#6fb3e0", s:5}, rare:{c:"#b98cf0", s:6}, epic:{c:"#ff8a2a", s:7, glow:1}, legendary:{c:"#ffd34d", s:8, glow:1, spark:1}, godly:{c:"#ff4fd8", s:9, glow:1, spark:1}, mythic:{c:"#00e5ff", s:10, glow:1, spark:1, rainbow:1}};
const PITY = 60;
function trailDot(g){ const T = TRAIL[g.w.r]; if (!T || calm) return; const L = battleLayer(); if (!L) return; const now = performance.now(); if (g.lastTrail && now - g.lastTrail < 38) return; g.lastTrail = now;
  if (pfx("trail", g.x + 11, g.y + 11, T.rainbow ? ["#ff4fd8", "#00e5ff", "#ffd34d"] : T.c, {r:T.s / 2})){ if (T.spark && Math.random() < 0.35) pfx("glint", g.x + 11, g.y + 11, "#fff6c8"); return; }
  const col = T.rainbow ? `hsl(${(now/4)%360},100%,65%)` : T.c; const d = document.createElement("span"); d.className = "trail" + (T.glow ? " glow" : ""); d.style.cssText = `left:${g.x+11}px;top:${g.y+11}px;width:${T.s}px;height:${T.s}px;background:${col};--tc:${col}`; L.appendChild(d); setTimeout(() => d.remove(), 420);
  if (T.spark && Math.random() < 0.35){ const s = document.createElement("span"); s.className = "tspark"; s.textContent = "✦"; s.style.cssText = `left:${g.x+8+Math.random()*10}px;top:${g.y+6+Math.random()*10}px`; L.appendChild(s); setTimeout(() => s.remove(), 600); } }
function showRollFx(list, opts){ opts = opts || {};
  if (!list.length) return; if (calm){ const best = list.slice().sort((a,b) => wDps(b)-wDps(a))[0]; toast("Got: " + best.name); return; }
  const ov = document.createElement("div"); ov.className = "roll-ov"; ov.setAttribute("role","dialog"); ov.setAttribute("aria-label","Weapon roll");
  const card = w => { const R = W_RARITY.find(r => r.k === w.r); return `<div class="rcard r-${w.r}" style="--rc:${R.col}"><div class="rback">🎲</div><div class="rfront"><span class="rr">${R.label}</span><span class="ri">${wImg(w, "full")}</span><b>${esc(w.name)}</b><span class="small">${fmtMeat(wDps(w))} dps · ${w.spd}/s</span></div></div>`; };
  const best = list.slice().sort((a,b) => wDps(b)-wDps(a))[0], topR = W_RARITY.findIndex(r => r.k === best.r);
  ov.innerHTML = `<div class="roll-wrap"><button class="roll-x" data-close aria-label="Close">✕</button><div class="roll-grid${list.length > 1 ? " multi" : ""}${list.length > 10 ? " many" : ""}">${list.map(card).join("")}</div><div class="btns" style="justify-content:center">${opts.auto ? autoStopBtn() : ""}<button class="go" data-close>${opts.auto ? "Skip" : "Nice!"}</button></div></div>`; if (opts.auto) ov.classList.add("auto");
  document.body.appendChild(ov);
  const cards = [...ov.querySelectorAll(".rcard")], spinT = opts.auto ? 350 : list.length > 1 ? 500 : (topR >= 4 ? 1500 : 900);
  if (opts.auto) setTimeout(() => { clearInterval(spin); ov.remove(); }, spinT + cards.length*140 + (topR >= 4 ? 2600 : 1300));
  const icons = W_BASES.map(b => b[0]); let spin = setInterval(() => { cards.forEach(c => { if (!c.classList.contains("open")) c.querySelector(".rback").innerHTML = emoImg(icons[Math.floor(Math.random()*icons.length)]); }); sfx("click"); }, 90);
  cards.forEach((c,i) => setTimeout(() => { c.classList.add("open"); const w = list[i];
    if (["rare","epic","legendary"].includes(w.r)){ const rb = c.getBoundingClientRect(); rollBurst(rb.left + rb.width/2, rb.top + rb.height/2, W_RARITY.find(r => r.k === w.r).col, w.r === "legendary" ? 28 : w.r === "epic" ? 18 : 10); }
    if (i === cards.length - 1){ clearInterval(spin); sfx(topR >= 6 ? "roll7" : topR >= 4 ? "roll5" : topR >= 2 ? "roll3" : "roll1"); if (topR >= 4){ document.body.classList.add("shake"); setTimeout(() => document.body.classList.remove("shake"), 400); } else sfx("coin"); } }, spinT + i*140));
  ov.addEventListener("click", e => { if (e.target === ov || e.target.closest("[data-close]")){ clearInterval(spin); ov.remove(); } });
}
function rollBurst(x, y, col, n){ for (let i=0;i<n;i++){ const p = document.createElement("span"); p.className = "rpart"; p.style.cssText = `left:${x}px;top:${y}px;background:${col};box-shadow:0 0 8px ${col}`; document.body.appendChild(p);
  const a = Math.random()*Math.PI*2, d = 60 + Math.random()*90; p.animate([{transform:"translate(-50%,-50%) scale(1)", opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*d}px), calc(-50% + ${Math.sin(a)*d}px)) scale(.2)`, opacity:0}], {duration: 700 + Math.random()*300, easing:"cubic-bezier(.2,.8,.3,1)", fill:"forwards"}).onfinish = () => p.remove(); } }
let offlineChecked = false;
function checkOffline(){
  if (offlineChecked) return; offlineChecked = true; const H = huntState(), now = Date.now(), last = H.lastSeen || 0; H.lastSeen = now; if (!last) return;
  const capH = 8 + upgLv("camp") + 0.5*scrollLv("dream"), secs = Math.min(capH*3600, (now - last)/1000); if (secs < 90) return;
  const hp = enemyHP(false), dps = Math.max(0.1, dingoDps()), cycle = hp/dps + 7, kills = Math.floor(secs / cycle * (compOn("packbond") ? 1 : (0.5 + 0.05*upgLv("camp") + 0.05*scrollLv("dream")))); if (kills < 1) return;
  const mult = dropMult(hp), meats = Math.round(kills * hp * 1.2 * mult * 1.35 * lootMult());
  let coins = 0; for (let i=0;i<Math.min(kills,5000);i++) if (Math.random() < 0.0025) coins++;
  const EVo = gameEvent(), oCandy = Math.max(1, Math.round(0.5 * kills * killCandy(meats / Math.max(1, kills)))); if (EVo) addEvCur(oCandy); else H.meats += meats; H.kills += kills; if (coins) shopState().coins += coins; H.bestDrop = Math.max(H.bestDrop, Math.round(meats/Math.max(1,kills)));
  const hrs = Math.floor(secs/3600), mins = Math.round((secs%3600)/60), away = (hrs ? hrs + "h " : "") + mins + "m";
  /* v0.44: no pop-up box. A sky banner says how long you were gone; the haul arrives in the loot feed and the weapons go to your bags like any other drop */
  const nDrop = Math.min(8, Math.floor(kills * 0.02)); let found = 0; for (let i = 0; i < nDrop; i++){ const r = dropWeapon(null, true); if (!r.salvaged) found++; } if (nDrop) syncGhosts();
  setTimeout(() => { moonBanner("🐾 WELCOME BACK", "Away " + away + (secs >= capH*3600 - 1 ? " (the " + capH + "-hour max)" : "") + " · away-hunting runs at half speed");
    /* the feed puts the newest line on top, so the summary goes in last */
    if (found) feed("🎒", found + " weapon" + (found === 1 ? "" : "s") + " went to your bags"); if (coins) feed("🪙", coins + " Dingo Coin" + (coins === 1 ? "" : "s"));
    feed(EVo ? "🍬" : "🍖", EVo ? oCandy + " " + EVo.cur.name.toLowerCase() : fmtMeat(meats) + " meats"); feed("⚔️", kills.toLocaleString() + " creatures beaten while away");
    sfx("chest"); updateHuntHud(); save("Welcome back!"); }, 1200);
}

/* --- merge forge + real-life buffs --- */
const TIER_ORDER = ["junk","common","uncommon","rare","epic","legendary","godly","mythic"];
function tierIdx(k){ return k === "titan" ? 8 : TIER_ORDER.indexOf(k); }
const BUFFS = {
  nose:{icon:"🧩", name:"Sharp Nose", desc:"+15% crit chance", from:"solving Sniffle"}
};
const BUFF_MS = 2*3600*1000;
function buffLen(){ return BUFF_MS * (1 + 0.1*scrollLv("longdays")) * (compOn("sage") ? 2 : 1); }
const BUFF_ST = {nose:"sharpnose"};
function grantBuff(k){ if (BUFF_ST[k]) SE.apply(DINGO, BUFF_ST[k], {dur:buffLen() / 1000}); setTimeout(() => toast(BUFFS[k].icon + " " + BUFFS[k].name + ": " + BUFFS[k].desc + " for 2 hours!"), 700); }
function buffOn(k){ if (devOn) return true; return !!(state && state.hunt && BUFF_ST[k] && SE.has(DINGO, BUFF_ST[k])); }
function buffBar(){ const H = huntState(), now = Date.now();
  return `<div class="buffbar">${Object.entries(BUFFS).map(([k,b]) => { const left = BUFF_ST[k] ? SE.timeLeft(DINGO, BUFF_ST[k]) * 1000 : 0, on = left > 0;
    return `<div class="buff${on?" on":""}" title="${esc(b.name)}: ${esc(b.desc)}"><span class="bi">${emoImg(b.icon)}</span><span><b>${esc(b.name)}</b><span class="small">${esc(b.desc)} · ${on ? Math.floor(left/3600000) + "h " + Math.floor(left%3600000/60000) + "m left" : "earn it by " + esc(b.from)}</span></span></div>`; }).join("")}</div>`; }

