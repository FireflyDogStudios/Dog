/* ===== Wandering merchant (weekends) ===== */
/* ===== Sanctuary: pups settle into a happy home, their joy becomes spirit; transcend past Rainbow ===== */
const SPIRIT_R = {common:1, uncommon:3, rare:8, epic:25, legendary:80, huge:600}, SPIRIT_V = [1,5,25,100,220,500];
const DUST_R = {common:1, uncommon:1.5, rare:2, epic:3, legendary:5, huge:10};
function pupSpirit(p){ return Math.round(SPIRIT_R[p.r] * SPIRIT_V[p.v||0] * (1 + Math.min(2, pupDps(p) / Math.max(1, enemyHP(false)/40)) * 0.25)); }
function transCost(p){ return (p.v === 2 ? 400 : p.v === 3 ? 200 : 2000) * SPIRIT_R[p.r]; }
function dustCost(p){ return p.v === 3 ? Math.round(12 * DUST_R[p.r]) : 0; }
function sanctuarySection(){ const K = packState(), eq = new Set(K.equipped), elig = K.pups.filter(p => p.v >= 2 && p.v <= 4).sort((a,b) => pupDps(b) - pupDps(a));
  return `<div class="forge sanct"><h3 class="pack-h" style="margin-top:0">🏡 The Sanctuary</h3>
    <p class="small">The Sanctuary is a big, sunny home of rolling meadows where pups can roam, play and live their own happy lives. Send pups there to settle in, and they're so joyful that <b>spirit</b> ✨ fills the air around them. Rarer, fancier and stronger pups bring even more joy, and more spirit. Spirit lets a Rainbow pup climb: Rainbow → <b>Spectral</b> (×6) → <b>Arcane</b> (×9, needs Arcane Dust 💠 too) → <b>Transcendent</b> (×14). Each step is expensive on purpose.</p>
    <div class="spirit-bal">${emoImg("✨")} <b>${coinsFmt(K.spirit||0)}</b> spirit</div>
    ${elig.length ? elig.map(p => `<div class="forge-row"><span>${pupArt(p)} <b>${esc(pupName(p))}</b> <span class="small">${PUP_R[p.r].label}</span></span><button class="go" data-a="transcend" data-id="${p.id}" ${(K.spirit||0) < transCost(p) || ess("arcane") < dustCost(p) ? "disabled" : ""}>${p.v === 2 ? "Make Spectral" : p.v === 3 ? "Make Arcane" : "Transcend"} · ✨ ${coinsFmt(transCost(p))}${dustCost(p) ? " + 💠 " + dustCost(p) + " (have " + ess("arcane") + ")" : ""}</button></div>`).join("") : `<p class="small">Fuse a Rainbow pup to start transcending.</p>`}
    <div class="relf"><b class="small">🏡 Send a group to the Sanctuary</b><div class="autorow"><select data-relr aria-label="Rarity">${[["","Pick a rarity…"]].concat(Object.entries(PUP_R).filter(([k]) => k !== "huge").map(([k,r]) => [k, r.label])).map(([k,l]) => `<option value="${k}" ${(K.relR||"") === k ? "selected" : ""}>${l}</option>`).join("")}</select>
      <select data-relv aria-label="Variant">${[["0","Plain only (not Golden)"],["1","Golden only"],["2","Rainbow only"],["any","Any variant"]].map(([k,l]) => `<option value="${k}" ${(K.relV||"0") === k ? "selected" : ""}>${l}</option>`).join("")}</select>
      <label class="small"><input type="checkbox" data-relkeep ${K.relKeep !== false ? "checked" : ""}> Keep 5 of each for fusing</label></div>
      ${(() => { const list = releaseList(); return K.relR ? `<p class="small">That's <b>${list.length}</b> pup${list.length === 1 ? "" : "s"}, worth ✨ <b>${coinsFmt(list.reduce((a,p) => a + pupSpirit(p), 0))}</b> spirit. Following and named pups are always kept safe.</p><button class="go" data-a="release-filter" ${list.length ? "" : "disabled"}>Send ${list.length} to the Sanctuary</button>` : ""; })()}</div></div>`; }
function releaseList(){ const K = packState(), eq = new Set(K.equipped); if (!K.relR) return []; const v = K.relV || "0", keep = K.relKeep !== false, seen = {};
  return K.pups.slice().sort((a,b) => pupDps(b) - pupDps(a)).filter(p => { if (eq.has(p.id) || p.nick || p.r !== K.relR || p.r === "huge") return false; if (v !== "any" && (p.v||0) !== parseInt(v,10)) return false; if (keep){ const k = p.key + ":" + (p.v||0); seen[k] = (seen[k]||0) + 1; if (seen[k] <= 5) return false; } return true; }); }
function releasePup(id){ const K = packState(), p = K.pups.find(x => x.id === id); if (!p || K.equipped.includes(id)) return 0; const s = pupSpirit(p); K.spirit = (K.spirit||0) + s; K.pups = K.pups.filter(x => x.id !== id); return s; }

/* ===== Forge all / fuse all ===== */
function fuseAll(){ const made = []; for (const v of [0,1]){ let g; while ((g = fuseGroups(v)).length){ const np = fuse(g[0][0], v); if (!np) break; made.push(np); } } const K = packState(), ids = new Set(K.pups.map(p => p.id)); return made.filter(p => ids.has(p.id)); }

/* ===== Auto-roll and auto-rescue with pop-ups ===== */
const AUTO = {next:0};
function autoTick(){ if (!state || !isHost() || document.hidden) return; const H = huntState(), K = packState(), now = performance.now(); if (now < AUTO.next) return;
  if (document.querySelector(".roll-ov:not(.auto),.reveal,.lvlup,.sleep-ov,.morning-ov,.sos-ov")) return; if (document.querySelector(".roll-ov.auto")) return;
  
  if (K.autoHatch){ const b = basketList().find(x => x.id === K.autoHatch.b); const got = b ? hatch(b.id, K.autoHatch.n) : []; if (!got.length){ K.autoHatch = null; toast(K.pups.length >= PCAP ? "🐾 Auto-rescue paused: your pack is full. Nothing was lost." : "Auto-rescue stopped: out of " + (b && b.ev ? b.cur.name.toLowerCase() : "meats")); save("Auto-rescue stopped", true); render(); return; }
    syncPups(); save("Auto-rescued", true); if (["hunt","pack"].includes(tab)) showHatchFx(got, b.icon, {auto:true}); AUTO.next = now + (["hunt","pack"].includes(tab) ? 900 : 2500); }
}
setInterval(autoTick, 700);
function autoStopBtn(){ return `<button class="autostop" data-autostop>⏹ Stop auto</button>`; }
document.addEventListener("click", e => { if (e.target.closest("[data-autostop]")){ const H = huntState(), K = packState(); H.autoRoll = false; K.autoHatch = null; const ov = e.target.closest(".roll-ov"); if (ov) ov.remove(); save("Auto stopped"); } });

