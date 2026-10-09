/* ===== Tomes: rare enchant books (equip, bind, collect) ===== */
const TOME_T = {
  fangs:{name:"Tome of Fangs", icon:"⚔️", col:"#d0453b", vals:[.10,.18,.28,.40,.55,.75,1.0,1.3,1.7,2.2], fmt:v => "+" + Math.round(v*100) + "% damage"},
  plenty:{name:"Tome of Plenty", icon:"🍖", col:"#6a9a3a", vals:[.10,.18,.28,.40,.55,.75,1.0,1.3,1.7,2.2], fmt:v => "+" + Math.round(v*100) + "% meats"},
  swift:{name:"Tome of Swiftness", icon:"⚡", col:"#4f8fb8", vals:[.05,.09,.14,.20,.27,.35,.45,.56,.68,.80], fmt:v => "+" + Math.round(v*100) + "% attack speed"},
  fortune:{name:"Tome of Fortune", icon:"🍀", col:"#3aa870", vals:[.10,.18,.28,.40,.55,.75,1.0,1.3,1.7,2.2], fmt:v => "+" + Math.round(v*100) + "% luck"},
  crits:{name:"Tome of Criticals", icon:"💥", col:"#e8741c", vals:[.02,.035,.05,.07,.09,.12,.15,.18,.21,.25], fmt:v => "+" + (v*100).toFixed(1).replace(".0","") + "% crit chance"},
  pack:{name:"Tome of the Pack", icon:"🐕", col:"#a77bd6", vals:[.10,.18,.28,.40,.55,.75,1.0,1.3,1.7,2.2], fmt:v => "+" + Math.round(v*100) + "% pup damage"},
  gather:{name:"Tome of Gathering", icon:"🫙", col:"#5ab0a0", vals:[0,.15,.3,.5,.75,1.0,1.3,1.7,2.2,3.0], fmt:v => v ? "Lets creatures drop essences, +" + Math.round(v*100) + "% more" : "Lets creatures drop essences"},
  coins:{name:"Tome of Coins", icon:"🪙", col:"#e3b23c", vals:[.2,.35,.55,.8,1.1,1.5,2.0,2.6,3.3,4.0], fmt:v => "+" + Math.round(v*100) + "% rare coin chance"},
};
const TOME_S = {
  storms:{name:"Tome of Storms", icon:"⛈️", desc:"Lightning strikes creatures every few seconds, in any weather"},
  starfall:{name:"Tome of Starfall", icon:"☄️", desc:"Weather and wildlife events happen twice as often"},
  mimic:{name:"Tome of the Mimic", icon:"🎁", desc:"Creatures sometimes drop a surprise mini chest"},
  bandit:{name:"Tome of the Bandit", icon:"🦝", desc:"Sneaky raccoons show up more and carry double loot"},
  hugehunter:{name:"Tome of Huge Hunting", icon:"💎", desc:"+25% chance to rescue HUGE pups"},
  echoes:{name:"Tome of Echoes", icon:"🌀", desc:"Abilities recharge 25% faster"},
};
const BIND_NEED = [3,3,4,5,5,5,5,5,7];
const ROMAN7 = ["I","II","III","IV","V","VI","VII","VIII","IX","X"];
const TOME_ACH = [
  {id:"kills1k", name:"Thousand Fangs", desc:"Defeat 1,000 creatures", goal:1000, stat:() => huntState().kills, reward:"storms"},
  {id:"bounty10", name:"Chore Champion", desc:"Complete 10 bounties", goal:10, stat:() => Object.values((state.guild && state.guild.bounties) || {}).reduce((a,b) => a + (b.count||0), 0), reward:"bandit"},
  {id:"hatch50", name:"Pack Builder", desc:"Rescue 50 pups", goal:50, stat:() => packState().hatched, reward:"hugehunter"},
  {id:"sniff20", name:"Word Hound", desc:"Solve 20 Sniffles", goal:20, stat:() => (state.sniffle && state.sniffle.wins) || 0, reward:"echoes"},
  {id:"godly", name:"Forgemaster", desc:"Own a Godly or Mythic weapon", goal:1, stat:() => huntState().weapons.some(w => w.r === "godly" || w.r === "mythic") ? 1 : 0, reward:"mimic"}
];
function tomeState(){ const d = {inv:{}, eq:[], found:{}, ach:{}, drops:0, seen:{}}; state.tomes = state.tomes || {}; for (const k in d) if (state.tomes[k] === undefined) state.tomes[k] = d[k]; return state.tomes; }
function tomeSlots(){ const L = playerLevel(); return [1,3,5,8,11,15].filter(x => L >= x).length + ((state.merchant && state.merchant.shelf) || 0); }
function tomeKeyParts(k){ const m = k.match(/^([a-z]+)(\d)$/); return m && TOME_T[m[1]] ? {type:m[1], tier:+m[2], special:false} : {type:k, tier:0, special:true}; }
function tomeName(k){ const p = tomeKeyParts(k); return p.special ? TOME_S[k].name : TOME_T[p.type].name + " " + ROMAN7[p.tier]; }
function tomeIcon(k){ const p = tomeKeyParts(k); return p.special ? TOME_S[k].icon : TOME_T[p.type].icon; }
function tomeDesc(k){ const p = tomeKeyParts(k); return p.special ? TOME_S[k].desc : TOME_T[p.type].fmt(TOME_T[p.type].vals[p.tier]); }
function tomeSum(type){ if (!state.tomes) return 0; return state.tomes.eq.reduce((a,k) => { const p = tomeKeyParts(k); return a + (!p.special && p.type === type ? TOME_T[type].vals[p.tier] : 0); }, 0); }
function tomeOn(sp){ return !!(state.tomes && state.tomes.eq.includes(sp)); }
function tomeHas(type){ return !!(state.tomes && state.tomes.eq.some(k => tomeKeyParts(k).type === type)); }
function tomeMult(type){ return 1 + tomeSum(type); }
function giveTome(k, silent, how){ tlog("tome", k); const T = tomeState(); T.inv[k] = (T.inv[k]||0) + 1; T.found[tomeKeyParts(k).type] = true; T.seen = T.seen || {}; T.seen[k] = true; if (silent) return; if (!how && T.autoAccept !== false){ toast("📚 A book dropped: " + tomeName(k) + "! Added to your library."); sfx("page"); return; } showTomeFx(k, how); }
function tomeDropRoll(E){ const chance = (E.king ? 1/8 : E.boss ? 1/120 : E.thief ? 1/60 : 1/1500) * (dayIs("tue") ? 2 : 1) * (1 + 0.2*scrollLv("sniff")) * (compOn("midas") ? 2 : 1) * (1 + treatActive("tome")); if (Math.random() >= chance) return;
  const T = tomeState(); T.drops++; let k;
  if (Math.random() < 0.03){ const sp = Object.keys(TOME_S).filter(s => !TOME_S[s].ev); k = sp[Math.floor(Math.random()*sp.length)]; }
  else { const oct = false, ty = Object.keys(TOME_T).filter(t => !TOME_T[t].ev), t = oct && Math.random() < 0.3 ? "hwcandy" : ty[Math.floor(Math.random()*ty.length)], r = Math.random(); k = t + (r < 0.02 ? 2 : r < 0.15 ? 1 : 0); }
  giveTome(k); }
function showTomeFx(k, how){ const p = tomeKeyParts(k), col = p.special ? "#ffd34d" : TOME_T[p.type].col;
  if (calm){ toast("📚 A book dropped: " + tomeName(k) + "!"); return; }
  const ov = document.createElement("div"); ov.className = "roll-ov"; ov.setAttribute("role","dialog"); ov.setAttribute("aria-label","Book found");
  ov.innerHTML = `<div class="roll-wrap"><div class="tome-drop"><div class="tome big${p.special ? " special" : ""}" style="--tc:${col}"><span class="tspine"></span><span class="ticon">${emoImg(tomeIcon(k))}</span><span class="ttier">${p.special ? "✦" : ROMAN7[p.tier]}</span></div></div>
    <h3 class="tdrop-h">${how === "bind" ? "📖 Bound into a stronger tome!" : how === "ach" ? "🏆 Achievement reward!" : p.special ? "✨ A LEGENDARY TOME! ✨" : "📚 A book dropped!"}</h3><p style="color:#fff;margin:0;text-align:center"><b>${esc(tomeName(k))}</b><br><span class="small">${esc(tomeDesc(k))}</span></p><button class="go" data-close>Add to the library</button></div>`;
  document.body.appendChild(ov); sfx("page"); document.body.classList.add("shake"); setTimeout(() => document.body.classList.remove("shake"), 400);
  setTimeout(() => { const r = ov.querySelector(".tome").getBoundingClientRect(); rollBurst(r.left + r.width/2, r.top + r.height/2, col, p.special ? 40 : 24); }, 500);
  ov.addEventListener("click", e => { if (e.target === ov || e.target.closest("[data-close]")) ov.remove(); }); }
function tomeCard(k, extra){ const p = tomeKeyParts(k), col = p.special ? "#ffd34d" : TOME_T[p.type].col;
  return `<div class="tome${p.special ? " special" : ""} t${p.tier}" style="--tc:${col}" title="${esc(tomeName(k))}: ${esc(tomeDesc(k))}"><span class="tspine"></span><span class="ticon">${emoImg(tomeIcon(k))}</span><span class="ttier">${p.special ? "✦" : ROMAN7[p.tier]}</span>${extra || ""}</div>`; }

function libState(){ state.lib = state.lib || {view:"tomes"}; return state.lib; }
const LIB_VIEWS = [["tomes","📚 Tomes","lib-tomes"],["best","📖 Bestiary","lib-best"],["alembic","⚗️ Alembic","lib-alembic"],["apo","🧪 Apothecary","lib-apo"],["research","🔍 Research","lib-research"],["scrolls","📜 Scrolls","lib-research"],["comps","📕 Compendiums","lib-research"]];
function librarySection(){ const L = libState(), open = LIB_VIEWS.filter(v => isUnlocked(v[2])); let v = L.view; if (!open.some(x => x[0] === v)) v = "tomes";
  const nav = `<div class="subtabs">${open.map(([k,l]) => `<button class="subtab${v === k ? " on" : ""}" data-a="lib-view" data-id="${k}">${l}</button>`).join("")}</div>`;
  let body = "";
  if (v === "tomes") body = tomesSection();
  else if (v === "best") body = `<section class="box" aria-labelledby="bestl-h"><h2 id="bestl-h">📖 Bestiary</h2>${bestiaryBody()}</section>`;
  else { scripState().view = v; libMode = true; try { body = scriptoriumSection(); } finally { libMode = false; } }
  return `<div class="libwrap" aria-labelledby="lib-h"><h2 id="lib-h" class="sr-only">Library</h2>${nav}${body}</div>`; }
function tomesSection(){
  const T = tomeState(), slots = tomeSlots(), eqCount = k => T.eq.filter(x => x === k).length, keys = Object.keys(T.inv).filter(k => T.inv[k] > 0).sort((a,b) => { const pa = tomeKeyParts(a), pb = tomeKeyParts(b); return (pb.special - pa.special) || pa.type.localeCompare(pb.type) || (pb.tier - pa.tier); });
  const nextSlot = [1,3,5,8,11,15].find(x => playerLevel() < x);
  return `<section class="box" aria-labelledby="tome-h">
    <div class="jar-top"><h2 id="tome-h">📚 The Den Library</h2><span class="small">${keys.reduce((a,k) => a + T.inv[k], 0)} books · ${T.drops} found in the wild</span></div>
    <p class="small" style="margin:4px 0 10px">Tomes are <b>extremely rare</b> drops (about 1 in 1,500 creatures, better from bosses and raccoons). Equip them on your shelf for permanent boosts. Bind duplicates into higher tiers, all the way to <b>X</b>, and try to discover every tier of every book. Legendary tomes (✦) come from achievements or the rarest drops of all.</p>
    <label class="small" style="display:flex;gap:6px;align-items:center;margin-bottom:6px"><input type="checkbox" data-autobook ${T.autoAccept !== false ? "checked" : ""}> Auto-accept dropped books (just a quick note instead of a pop-up)</label>
    <h3 class="pack-h" style="margin-top:0">Your shelf (${T.eq.length}/${slots})</h3>
    <div class="shelf">${Array.from({length:Math.max(6, slots)}, (_,i) => i < slots ? (T.eq[i] ? `<button class="slot filled" data-a="tome-uneq" data-id="${i}" title="Tap to take off">${tomeCard(T.eq[i])}<span class="small">${esc(tomeDesc(T.eq[i]))}</span></button>` : `<div class="slot empty"><span class="small">Empty slot</span></div>`) : `<div class="slot locked"><span class="small">🔒 Lv ${[1,3,5,8,11,15][i]}</span></div>`).join("")}</div>
    ${nextSlot ? `<p class="small">Next shelf slot unlocks at level ${nextSlot}.</p>` : ""}
    <h3 class="pack-h">Your books</h3>
    ${keys.length ? `<div class="tlist">${keys.map(k => { const p = tomeKeyParts(k), n = T.inv[k], free = n - eqCount(k), need = !p.special && p.tier < 9 ? BIND_NEED[p.tier] : 0;
      return `<div class="titem">${tomeCard(k, `<span class="tcount">×${n}</span>`)}<span class="tn"><b>${esc(tomeName(k))}</b><span class="small">${esc(tomeDesc(k))}</span></span>
        <span class="btns"><button data-a="tome-eq" data-id="${k}" ${free < 1 || T.eq.length >= slots ? "disabled" : ""}>Equip</button>${need ? `<button class="${free >= need ? "go" : ""}" data-a="tome-bind" data-id="${k}" ${free < need ? "disabled" : ""} title="Bind ${need} into ${ROMAN7[p.tier+1]}">Bind ${need}→${ROMAN7[p.tier+1]}</button>` : ""}</span></div>`; }).join("")}</div>` : `<p class="small">No books yet. Keep hunting... one will turn up. 📖</p>`}
    <h3 class="pack-h">Achievements</h3>
    <div class="achs">${TOME_ACH.map(a => { const v = Math.min(a.goal, a.stat()), done = v >= a.goal, got = T.ach[a.id];
      return `<div class="ach${got ? " got" : done ? " ready" : ""}"><span class="ticon">${emoImg(TOME_S[a.reward].icon)}</span><span class="tn"><b>${esc(a.name)}</b><span class="small">${esc(a.desc)} · reward: ${esc(TOME_S[a.reward].name)}</span><span class="umeter"><i style="width:${Math.round(100*v/a.goal)}%"></i></span><span class="small">${v.toLocaleString()} / ${a.goal.toLocaleString()}</span></span>${got ? `<span class="small">✓ Claimed</span>` : done ? `<button class="go" data-a="ach-claim" data-id="${a.id}">Claim</button>` : ""}</div>`; }).join("")}</div>
    <h3 class="pack-h">Codex</h3>
    ${(() => { Object.keys(T.inv).forEach(k => { if (T.inv[k] > 0) T.seen[k] = true; }); const keys = Object.keys(TOME_T).filter(t => !TOME_T[t].ev || T.found[t] || todayIso().slice(5,7) === TOME_T[t].ev), tot = keys.length * 10 + Object.keys(TOME_S).filter(s => !TOME_S[s].ev || T.found[s]).length, got = Object.keys(T.seen).filter(k => T.seen[k]).length; return `<p class="small">📖 <b>${got} / ${tot}</b> books discovered. Every tier counts as its own book!</p>`; })()}
    <div class="codex">${Object.entries(TOME_T).filter(([t,x]) => !x.ev || T.found[t] || todayIso().slice(5,7) === x.ev).map(([t,x]) => `<div class="cx${T.found[t] ? "" : " unk"}">${tomeCard(t+"0")}<span class="small"><b>${T.found[t] ? esc(x.name) : "???"}</b><br>${T.found[t] ? esc(x.fmt(x.vals[0])) + " to " + esc(x.fmt(x.vals[9])) : "Not found yet"}<span class="tdots">${ROMAN7.map((r,i) => `<i class="${T.seen[t+i] ? "on" : ""}" title="${r}">${r}</i>`).join("")}</span></span></div>`).join("")}${Object.entries(TOME_S).filter(([k,x]) => !x.ev || T.found[k] || todayIso().slice(5,7) === x.ev).map(([k,x]) => `<div class="cx${T.found[k] ? "" : " unk"}">${tomeCard(k)}<span class="small"><b>${T.found[k] ? esc(x.name) : "??? (legendary)"}</b><br>${T.found[k] ? esc(x.desc) : "Legendary tome"}</span></div>`).join("")}</div>
  </section>`;
}
function mimicChest(E){ if (!tomeOn("mimic") || Math.random() >= 0.04) return; const EV = gameEvent(), m = Math.round(Math.min(E.max, enemyHP(false) * 4) * 1.2 * 5 * lootMult());
  if (EV) addEvCur(Math.max(3, candyFrom(m))); else huntState().meats += m; if (Math.random() < 0.25){ const S = baitState(); S.inv[0] = (S.inv[0]||0) + 1; } if (Math.random() < 0.1) shopState().coins += 1;
  const hb = document.querySelector("section.hero"); if (hb && !calm){ const q = stageToScreen(E.x, (parseFloat(E.el.style.top)||0) + 20); rollBurst(q.x, q.y, "#ffd34d", 16); } floatText("🎁 Mimic chest!"); }

