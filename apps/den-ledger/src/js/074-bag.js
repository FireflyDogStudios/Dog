/* ===== The Bag: everything you own, in one place ===== */
function bagSection(){ const H = treatState(), Bq = (state.bagQ || "").toLowerCase(), view = state.bagView || "all", match = s => !Bq || String(s).toLowerCase().includes(Bq);
  const S = state.scrip || {ess:{}}, G = state.gemz || {rough:{}, gems:[]}, T = state.tomes || {inv:{}}, K = state.pack || {pups:[]}, BS = state.boosts || {inv:{}}, BT = state.bait || {inv:[0,0,0]}, W = H.weapons;
  const secs = [];
  const add = (key, title, items) => { const f = items.filter(x => match(x.n)); if (f.length && (view === "all" || view === key)) secs.push(`<h3 class="pack-h">${title}${key === "money" ? "" : ` <span class="small">(${f.reduce((a,x) => a + (x.c||1), 0).toLocaleString()})</span>`}</h3><div class="baggrid">${f.map(x => `<div class="bagitem${x.act ? " act" : ""}" title="${esc(x.d || "")}">${x.art || emoImg(x.i)}<b>${esc(x.n)}</b>${x.c != null ? `<span class="bagc">×${coinsFmt(x.c)}</span>` : ""}${x.d ? `<span class="small">${esc(x.d)}</span>` : ""}${x.act || ""}</div>`).join("")}</div>`); };
  add("treats", "🍬 Treats", Object.entries(TREATS).filter(([k]) => (H.treatInv[k]||0) > 0).map(([k,t]) => ({i:t.i, n:t.n, c:H.treatInv[k], d:t.d + " for " + t.min + " min", act:`<button class="go" data-a="eat" data-id="${k}">Eat</button>`})));
  const EV = gameEvent(); add("money", "💰 Currencies", [{i:"🍖", n:"Meats", c:H.meats}, {i:"🦴", n:"Bones", c:state.treats.bones}, {i:"🏆", n:"Trial Points", c:trialState().tp}, {i:"🪙", n:"Dingo Coins", c:shopState().coins}].concat(EV ? [{i:EV.cur.icon, n:EV.cur.name, c:evCur()}] : []).concat([{i:"✨", n:"Spirit", c:K.spirit||0}]));
  add("brews", "🧪 Brews", Object.entries(BS.inv || {}).filter(([k,n]) => n > 0).map(([k,n]) => { const t = k.slice(0,-1), tier = +k.slice(-1); return POT_TYPES[t] ? {i:potIcon(t), n:potName(t,tier), c:n} : null; }).filter(Boolean));
  add("bait", "🪤 Bait", [0,1,2].filter(i => (BT.inv[i]||0) > 0).map(i => ({i:baitIcon(i), n:baitName(i), c:BT.inv[i]})));
  add("ess", "⚗️ Essences & relics", Object.keys(ASP).filter(k => (S.ess[k]||0) > 0).map(k => ({i:ASP[k].i, art:essImg(k), n:ASP[k].n, c:S.ess[k], d:ASP[k].relic ? "Relic" : ASP[k].of ? "Distilled" : "Primal"})));
  add("gems", "💎 Gems", Object.entries(G.rough||{}).filter(([k,n]) => n > 0).map(([k,n]) => ({art:gemArt(k), n:"Rough " + GEMS[k].n, c:n})).concat((G.gems||[]).map(g => ({art:gemArt(g.type), n:QUAL[g.q].n + " " + GEMS[g.type].n + " Lv " + g.lv, d:"+" + gemVal(g).toFixed(1) + "% " + GEMS[g.type].d}))));
  add("tomes", "📚 Tomes", Object.entries(T.inv||{}).filter(([k,n]) => n > 0).map(([k,n]) => ({art:tomeCard(k), n:tomeName(k), c:n, d:tomeDesc(k)})));
  add("scrolls", "📜 Scrolls", SCROLL_ORDER.filter(k => (S.lv||{})[k]).map(k => ({i:SCROLLS[k].i, n:SCROLLS[k].n + " " + ROMAN7[(S.lv[k]||1)-1], d:SCROLLS[k].d(S.lv[k]), c:((S.sealed||{})[k]||0) ? (S.sealed[k]) : null})));
  const wr = {}; W.forEach(w => wr[w.r] = (wr[w.r]||0) + 1); add("weapons", "⚔️ Weapons", W_RARITY.filter(r => wr[r.k]).map(r => ({i:"⚔️", n:r.label + " weapons", c:wr[r.k], act:`<button data-a="bag-go" data-id="hunt">Open Armory</button>`})));
  const pr = {}; K.pups.forEach(p => pr[p.r] = (pr[p.r]||0) + 1); add("pups", "🐕 Pups", Object.keys(PUP_R).filter(r => pr[r]).map(r => ({i:"🐾", n:PUP_R[r].label + " pups", c:pr[r], act:`<button data-a="bag-go" data-id="pack">Open Pack</button>`})));
  const tabs = [["vault","🔐 Vault"],["all","All"],["treats","Treats"],["money","Currencies"],["brews","Brews"],["bait","Bait"],["ess","Essences"],["gems","Gems"],["tomes","Tomes"],["scrolls","Scrolls"],["weapons","Weapons"],["pups","Pups"]];
  return `<section class="box" aria-labelledby="bag-h"><div class="jar-top"><h2 id="bag-h">🎒 The Bag</h2><span class="small">Everything you've collected, in one place</span></div>
    <div class="pctrl"><input type="search" data-bagq value="${esc(state.bagQ || "")}" placeholder="Search your stuff…" aria-label="Search your bag" style="flex:1;min-width:180px"></div>
    <div class="subtabs">${tabs.map(([k,l]) => `<button class="subtab${view === k ? " on" : ""}" data-a="bag-view" data-id="${k}">${l}</button>`).join("")}</div>
    ${treatChips() ? `<p class="small">Active treats: ${treatChips()}</p>` : ""}
    ${view === "vault" ? vaultView() : (secs.join("") || `<p class="small">Nothing here${Bq ? " matches that search" : ""} yet.</p>`)}</section>`; }

