/* ===== The Vault: safe storage for anything ===== */
const VAULT_CAP = 250;
function vaultState(){ state.vault = state.vault || {}; const V = state.vault; V.w = V.w || []; V.p = V.p || []; V.g = V.g || []; V.t = V.t || {}; V.tr = V.tr || {}; V.br = V.br || {}; return V; }
function vaultCount(){ const V = vaultState(); return V.w.length + V.p.length + V.g.length + Object.values(V.t).reduce((a,b) => a + b, 0) + Object.values(V.tr).reduce((a,b) => a + b, 0) + Object.values(V.br).reduce((a,b) => a + b, 0); }
function vaultDeposit(kind, id){ const V = vaultState(); if (vaultCount() >= VAULT_CAP){ toast("🔐 The vault is full (" + VAULT_CAP + " items)."); return; } const H = huntState(), K = packState();
  if (kind === "w"){ const w = H.weapons.find(x => x.id === id); if (!w) return; if (H.equipped.includes(id)){ toast("Unequip it first, then vault it."); return; } if (w.hung){ const D = homeState(); D.wall = (D.wall||[]).filter(x => x !== id); w.hung = false; } H.weapons = H.weapons.filter(x => x.id !== id); if (H.wsel === id) H.wsel = ""; V.w.push(w); syncGhosts(); }
  if (kind === "p"){ const p = K.pups.find(x => x.id === id); if (!p) return; if (K.equipped.includes(id)){ toast("Let that pup rest first, then vault it."); return; } K.pups = K.pups.filter(x => x.id !== id); if (K.sel === id) K.sel = ""; V.p.push(p); }
  if (kind === "g"){ const G = gemState(), g = G.gems.find(x => x.id === id); if (!g) return; if (gemSocketed(id)){ toast("Take that gem out of its HUGE first."); return; } G.gems = G.gems.filter(x => x.id !== id); V.g.push(g); }
  if (kind === "t"){ const T = tomeState(), free = (T.inv[id]||0) - T.eq.filter(x => x === id).length; if (free < 1) return; T.inv[id]--; V.t[id] = (V.t[id]||0) + 1; }
  if (kind === "tr"){ const TS = treatState(); if (!(TS.treatInv[id] > 0)) return; TS.treatInv[id]--; V.tr[id] = (V.tr[id]||0) + 1; }
  if (kind === "br"){ const BS = boostState(); if (!(BS.inv[id] > 0)) return; BS.inv[id]--; V.br[id] = (V.br[id]||0) + 1; }
  sfx("chest"); }
function vaultWithdraw(kind, id){ const V = vaultState(), H = huntState(), K = packState();
  if (kind === "w"){ if (H.weapons.length >= WCAP){ toast("🎒 Your weapon bag is full. Make room first."); return; } const w = V.w.find(x => x.id === id); if (!w) return; V.w = V.w.filter(x => x.id !== id); H.weapons.push(w); }
  if (kind === "p"){ if (K.pups.length >= PCAP){ toast("🐾 Your pack is full. Make room first."); return; } const p = V.p.find(x => x.id === id); if (!p) return; V.p = V.p.filter(x => x.id !== id); K.pups.push(p); }
  if (kind === "g"){ const g = V.g.find(x => x.id === id); if (!g) return; V.g = V.g.filter(x => x.id !== id); gemState().gems.push(g); }
  if (kind === "t" && V.t[id] > 0){ V.t[id]--; const T = tomeState(); T.inv[id] = (T.inv[id]||0) + 1; }
  if (kind === "tr" && V.tr[id] > 0){ V.tr[id]--; treatState().treatInv[id] = (treatState().treatInv[id]||0) + 1; }
  if (kind === "br" && V.br[id] > 0){ V.br[id]--; const BS = boostState(); BS.inv[id] = (BS.inv[id]||0) + 1; }
  sfx("blip"); }
function vaultView(){ const V = vaultState(), H = huntState(), K = packState(), eq = new Set(H.equipped), peq = new Set(K.equipped), G = state.gemz || {gems:[]}, T = state.tomes || {inv:{}, eq:[]}, TS = treatState(), BS = state.boosts || {inv:{}};
  const card = (art, name, sub, btn) => `<div class="bagitem">${art}<b>${esc(name)}</b>${sub ? `<span class="small">${sub}</span>` : ""}${btn}</div>`;
  const wR = w => W_RARITY.find(r => r.k === w.r), stored = [];
  V.w.forEach(w => stored.push(card(wImg(w, "still"), w.name, `<span style="color:${wR(w).col}">${wR(w).label}</span>`, `<button data-a="vout" data-id="w:${w.id}">Take out</button>`)));
  V.p.forEach(p => stored.push(card(pupArt(p), p.nick || pupName(p), `<span style="color:${PUP_R[p.r].col}">${PUP_R[p.r].label}</span>`, `<button data-a="vout" data-id="p:${p.id}">Take out</button>`)));
  V.g.forEach(g => stored.push(card(gemArt(g.type), QUAL[g.q].n + " " + GEMS[g.type].n, "Lv " + g.lv, `<button data-a="vout" data-id="g:${g.id}">Take out</button>`)));
  Object.entries(V.t).filter(([k,n]) => n > 0).forEach(([k,n]) => stored.push(card(tomeCard(k), tomeName(k), "×" + n, `<button data-a="vout" data-id="t:${k}">Take one out</button>`)));
  Object.entries(V.tr).filter(([k,n]) => n > 0).forEach(([k,n]) => stored.push(card(emoImg(TREATS[k].i), TREATS[k].n, "×" + n, `<button data-a="vout" data-id="tr:${k}">Take one out</button>`)));
  Object.entries(V.br).filter(([k,n]) => n > 0).forEach(([k,n]) => { const t = k.slice(0,-1), tier = +k.slice(-1); if (POT_TYPES[t]) stored.push(card(emoImg(potIcon(t)), potName(t,tier), "×" + n, `<button data-a="vout" data-id="br:${k}">Take one out</button>`)); });
  const dk = state.vdep || "w"; let dep = "";
  if (dk === "w") dep = H.weapons.filter(w => !eq.has(w.id)).sort((a,b) => tierIdx(b.r) - tierIdx(a.r) || wDps(b) - wDps(a)).slice(0, 40).map(w => card(wImg(w, "still"), w.name, `<span style="color:${wR(w).col}">${wR(w).label}</span>${w.hung ? " · on your wall" : ""}`, `<button class="go" data-a="vin" data-id="w:${w.id}">🔐 Vault</button>`)).join("");
  if (dk === "p") dep = K.pups.filter(p => !peq.has(p.id)).sort((a,b) => Object.keys(PUP_R).indexOf(b.r) - Object.keys(PUP_R).indexOf(a.r) || pupDps(b) - pupDps(a)).slice(0, 40).map(p => card(pupArt(p), p.nick || pupName(p), `<span style="color:${PUP_R[p.r].col}">${PUP_R[p.r].label}</span>`, `<button class="go" data-a="vin" data-id="p:${p.id}">🔐 Vault</button>`)).join("");
  if (dk === "g") dep = (G.gems||[]).filter(g => !gemSocketed(g.id)).map(g => card(gemArt(g.type), QUAL[g.q].n + " " + GEMS[g.type].n, "Lv " + g.lv, `<button class="go" data-a="vin" data-id="g:${g.id}">🔐 Vault</button>`)).join("");
  if (dk === "t") dep = Object.entries(T.inv||{}).filter(([k,n]) => n - (T.eq||[]).filter(x => x === k).length > 0).map(([k,n]) => card(tomeCard(k), tomeName(k), "×" + n, `<button class="go" data-a="vin" data-id="t:${k}">🔐 Vault one</button>`)).join("");
  if (dk === "tr") dep = Object.entries(TS.treatInv||{}).filter(([k,n]) => n > 0).map(([k,n]) => card(emoImg(TREATS[k].i), TREATS[k].n, "×" + n, `<button class="go" data-a="vin" data-id="tr:${k}">🔐 Vault one</button>`)).join("");
  if (dk === "br") dep = Object.entries(BS.inv||{}).filter(([k,n]) => n > 0 && POT_TYPES[k.slice(0,-1)]).map(([k,n]) => card(emoImg(potIcon(k.slice(0,-1))), potName(k.slice(0,-1), +k.slice(-1)), "×" + n, `<button class="go" data-a="vin" data-id="br:${k}">🔐 Vault one</button>`)).join("");
  return `<div class="vaultbox"><h3 class="pack-h" style="margin-top:0">🔐 The Vault (${vaultCount()}/${VAULT_CAP})</h3><p class="small">Anything in the vault is <b>completely safe</b>: it can't be scrapped, sold, forged, fused, sent to the Sanctuary, or used up, and it doesn't take up room in your bag or pack. Take things out whenever you want them back.</p>
    <div class="baggrid">${stored.join("") || `<p class="small">The vault is empty.</p>`}</div>
    <h3 class="pack-h">Put something in</h3><div class="subtabs">${[["w","⚔️ Weapons"],["p","🐕 Pups"],["g","💎 Gems"],["t","📚 Tomes"],["tr","🍬 Treats"],["br","🧪 Brews"]].map(([k,l]) => `<button class="subtab${dk === k ? " on" : ""}" data-a="vdep" data-id="${k}">${l}</button>`).join("")}</div>
    <div class="baggrid">${dep || `<p class="small">Nothing here to vault (equipped, socketed, and shelved items stay out).</p>`}</div></div>`; }

function isoWeek(d){ const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y0) / 86400000 + 1) / 7); }
function tickClock(){ const md = document.getElementById("mdot"); if (md && state){ const n = mailUnread(); md.hidden = !n; md.textContent = n; } const sd = document.getElementById("sdot"); if (sd){ const u = devlogUnseen(); sd.hidden = !u; sd.textContent = u; } const el = document.getElementById("nowclock"); if (!el) return; const d = new Date(); el.textContent = "🗓️ " + d.toLocaleDateString("en-US", {weekday:"long", month:"long", day:"numeric", year:"numeric"}) + " · 🕒 " + d.toLocaleTimeString("en-US", {hour:"numeric", minute:"2-digit"}) + " · Week " + isoWeek(d); }
setInterval(tickClock, 5000); setTimeout(tickClock, 0);
