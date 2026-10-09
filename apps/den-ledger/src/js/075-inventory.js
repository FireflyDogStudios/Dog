/* ===================== v0.36 Inventory (Guild Wars style) =====================
   v0.37: every bag is its own object (name, type, slots), so bags can be reordered, renamed, tidied and salvaged one at a time,
   and stowed in the Stash with everything still inside.
   v0.38: bag preferences (what each bag pulls in, rarities, sort, protect, lock layout, colour) and master settings
   (default sort, Tidy all, auto-salvage level, confirm Rare+, compare mode, New markers, empty slots, headers), plus
   a Recently salvaged list with Undo.
   Slots only store KEYS. Counts still live in each system's own store:
     w:<weaponId>   huntState().weapons (equipped weapons live in the Loadout, not in bags)
     t:<treat>      treatState().treatInv
     p:<brew+tier>  boostState().inv
     a:<0|1|2>      baitState().inv
     g:<bagId>      a stowed bag (only ever in the Stash)
   invSync() keeps the equipped bags in step with those stores: gone things leave their slot, new things go to the first bag
   that wants them (invPlaceFor), marked New. No room: auto-salvage takes what its level allows, the rest waits in the
   overflow bag. The Stash and stowed bags hold things OUTSIDE those stores (stashW/stashC, bag.w/bag.cnt).
   Bag slot addresses are "bagId:index". */
const BAG_TYPES = {satchel:{n:"Den Satchel", size:20, icon:"knapsack"}, keep:{n:"Keepsake Box", size:8, icon:"locked-chest", keep:true}};
const BAG_SLOTS = 6, BAG_SLOTS_MAX = 10, STASH_SIZE = 200;
const INV_KIND = {w:1, p:2, t:3, a:4, g:5};
const BAG_PULL = [["w","Weapons"],["c","Consumables"],["a","Bait"],["m","Materials",true]]; /* "m" arrives with crafting */
const BAG_RAR = [["c","Common"],["u","Uncommon"],["r","Rare"],["e","Epic"],["l","Legendary+"]];
const BAG_SORT = [["rarity","Rarity"],["power","Power"],["type","Type"],["area","Area"],["new","Newest"]];
const BAG_COL = ["", "#d9a441", "#7fae7a", "#4f9fd0", "#b48ae6", "#d0675a", "#e8e2d0"];
const SALV_LVL = [["0","Off"],["1","Common weapons weaker than my gear"],["2","Common and Uncommon weapons weaker than my gear"],["3","Every Common and Uncommon weapon"]];
let INVQ = "", INV_TAB = "bags", INV_REN = "", INV_CFG = "", invLastSync = 0, invHover = null; const invArm = {};
function invDefCfg(type){ return type === "keep" ? {pull:["none"], rar:[], sort:"", prot:true, lock:true, col:"#7fae7a"} : {pull:[], rar:[], sort:"", prot:false, lock:false, col:""}; }
function invState(){ const I = state.inv = state.inv || {};
  if (!I.B){ /* first build, or a v0.36 save: one object per bag */ I.B = {}; I.eqB = Array(BAG_SLOTS).fill(null); const types = Array.isArray(I.bags) ? I.bags : ["satchel","satchel","satchel","keep",null,null], flat = Array.isArray(I.slots) ? I.slots : [];
    let s = 0; types.forEach((t, i) => { if (!t || !BAG_TYPES[t] || i >= BAG_SLOTS) return; const n = BAG_TYPES[t].size, id = "bg" + uid(); I.B[id] = {id, type:t, name:"", slots:Array.from({length:n}, (_, j) => flat[s + j] || null)}; I.eqB[i] = id; s += n; });
    delete I.bags; delete I.slots; }
  Object.values(I.B).forEach(b => { if (!b.cfg) b.cfg = invDefCfg(b.type); });
  if (!Array.isArray(I.eqB)) I.eqB = Array(BAG_SLOTS).fill(null); while (I.eqB.length < BAG_SLOTS) I.eqB.push(null);
  if (!Array.isArray(I.over)) I.over = []; if (!Array.isArray(I.recent)) I.recent = [];
  if (!Array.isArray(I.stash)) I.stash = Array(STASH_SIZE).fill(null); if (!Array.isArray(I.stashW)) I.stashW = []; if (!I.stashC) I.stashC = {};
  if (!I.newK) I.newK = {}; if (!I.shut) I.shut = {}; if (!I.opt) I.opt = {sort:"rarity", cmp:"always", newOn:true, empty:true, heads:true, cfmRare:true}; return I; }
function bagName(b){ return (b && b.name) || (b && BAG_TYPES[b.type] ? BAG_TYPES[b.type].n : "Bag"); }
function eqBags(I){ return I.eqB.map(id => id && I.B[id]).filter(Boolean); }
function bagManual(b){ return !!(b && b.cfg && b.cfg.pull.includes("none")); }
function bagProt(b){ return !!(b && b.cfg && b.cfg.prot); }
function isKeepBag(b){ return !!(b && b.type === "keep"); }
function adr(a){ const c = String(a).lastIndexOf(":"); return {bid:a.slice(0, c), j:+a.slice(c + 1)}; }
function getAt(I, a){ const {bid, j} = adr(a), b = I.B[bid]; return b ? b.slots[j] || null : null; }
function setAt(I, a, k){ const {bid, j} = adr(a), b = I.B[bid]; if (b) b.slots[j] = k || null; }
function ikSplit(key){ const c = key.indexOf(":"); return [key.slice(0, c), key.slice(c + 1)]; }
function invKindOf(key){ const k = key[0]; return k === "w" ? "w" : (k === "t" || k === "p") ? "c" : k === "a" ? "a" : "m"; }
function invRarKey(w){ const t = tierIdx(w.r); return t <= 1 ? "c" : t === 2 ? "u" : t === 3 ? "r" : t === 4 ? "e" : "l"; }
/* Does this bag ask for this item? "specific" = it names the kind; "any" = it takes anything */
function bagWants(b, key, wObj){ const c = b.cfg, kind = invKindOf(key); if (bagManual(b)) return null;
  if (kind === "w" && c.rar.length){ const w = wObj || invWeapon(key); if (!w || !c.rar.includes(invRarKey(w))) return null; }
  if (!c.pull.length) return "any"; return c.pull.includes(kind) ? "specific" : null; }
function invPlaceFor(I, key, wObj){ const bags = eqBags(I);
  for (const pass of ["specific", "any"]) for (const b of bags){ if (bagWants(b, key, wObj) !== pass) continue; const j = b.slots.indexOf(null); if (j >= 0) return b.id + ":" + j; }
  return null; }
function invFree(I){ for (const b of eqBags(I)){ if (bagManual(b)) continue; const j = b.slots.indexOf(null); if (j >= 0) return b.id + ":" + j; } return null; }
function invRoomFor(I, key){ return invPlaceFor(I, key) || invFree(I); }
function invFreeCount(I){ return eqBags(I).filter(b => !bagManual(b)).reduce((a, b) => a + b.slots.filter(x => !x).length, 0); }
function invWeapon(key){ const [k, id] = ikSplit(key); if (k !== "w") return null; const I = invState(); return huntState().weapons.find(w => w.id === id) || I.stashW.find(w => w.id === id) || Object.values(I.B).reduce((f, b) => f || (b.w || []).find(w => w.id === id), null) || null; }
function invCount(key){ const [k, id] = ikSplit(key);
  if (k === "w") return huntState().weapons.some(w => w.id === id) ? 1 : 0;
  if (k === "t") return treatState().treatInv[id] || 0;
  if (k === "p") return boostState().inv[id] || 0;
  if (k === "a") return baitState().inv[+id] || 0; return 0; }
function invSetCount(key, n){ const [k, id] = ikSplit(key);
  if (k === "t") treatState().treatInv[id] = n; if (k === "p") boostState().inv[id] = n; if (k === "a") baitState().inv[+id] = n; }
function invLive(){ const H = huntState(), eq = new Set(H.equipped), out = [];
  H.weapons.forEach(w => { if (!eq.has(w.id)) out.push("w:" + w.id); });
  const T = treatState().treatInv; Object.keys(T).forEach(k => { if (T[k] > 0 && TREATS[k]) out.push("t:" + k); });
  const BI = boostState().inv; Object.keys(BI).forEach(k => { if (BI[k] > 0 && POT_TYPES[k.slice(0,-1)]) out.push("p:" + k); });
  const BA = baitState().inv; [0,1,2].forEach(i => { if (BA[i] > 0) out.push("a:" + i); });
  return out; }
/* ---------- salvage rules ---------- */
function invSalvLevel(){ const H = huntState(); if (H.salvLvl == null) H.salvLvl = H.autoSalvage === false ? 0 : 2; return H.salvLvl; }
function invSetSalvLevel(n){ const H = huntState(); H.salvLvl = n; H.autoSalvage = n > 0; }
/* What salvage may ever take: Common or Uncommon, nothing locked, set, relic, socketed or on the wall */
function invJunk(w){ return !!w && tierIdx(w.r) <= 2 && !w.lock && !w.set && !w.relic && !(w.gems && w.gems.length) && !w.hung; }
/* What AUTO-salvage may take at the chosen level when there's no room */
function invAutoJunk(w){ const L = invSalvLevel(); return L > 0 && invJunk(w) && tierIdx(w.r) <= (L === 1 ? 1 : 2); }
function invSalvPreview(){ const L = invSalvLevel(); if (!L) return "Auto-salvage is off. Everything you find is kept; when your bags are full, it waits in the overflow bag.";
  return "Will salvage: " + (L === 1 ? "Common weapons weaker than your weakest equipped" : L === 2 ? "Common and Uncommon weapons weaker than your weakest equipped" : "every Common and Uncommon weapon") + ", and, when your bags are full, " + (L === 1 ? "Common" : "Common and Uncommon") + " weapons that don't fit. Never: Rare or better, locked items, set pieces, relics, socketed weapons, or anything already in your bags."; }
function invFull(){ return invFreeCount(invState()) < 1; }
function invRecent(w, m, d){ const I = invState(); I.recent.unshift({w:JSON.parse(JSON.stringify(w)), m:m || 0, d:d || 0, t:Date.now()}); if (I.recent.length > 20) I.recent.length = 20; }
function invSalvageW(w, quiet){ const H = huntState(); if (!w) return 0; const m = sellValue(w), d = SCRAP_DUST[w.r] || 0; H.meats += m; if (d) addEss("arcane", d); H.weapons = H.weapons.filter(x => x !== w); H.equipped = H.equipped.filter(x => x !== w.id); H.salvaged = (H.salvaged||0) + 1; if (H.wsel === w.id) H.wsel = ""; invRecent(w, m, d); if (!quiet) logItem("sell", "Salvaged " + w.name + " (" + W_RARITY.find(r => r.k === w.r).label + ")"); return m; }
function invUndo(i){ const I = invState(), H = huntState(), r = I.recent[i]; if (!r) return;
  if (H.meats < r.m){ toast("You need " + fmtMeat(r.m) + " meats to undo that (it gave you " + fmtMeat(r.m) + ")."); return; }
  H.meats -= r.m; if (r.d) addEss("arcane", -r.d); if (!H.weapons.some(w => w.id === r.w.id)) H.weapons.push(r.w); I.recent.splice(i, 1); invSync(); sfx("click"); toast("↩️ " + r.w.name + " is back in your bags."); save("Salvage undone"); }
function invSync(){ if (!state) return; const I = invState(), H = huntState(), live = invLive(), L = new Set(live), seen = new Set();
  eqBags(I).forEach(b => { for (let j = 0; j < b.slots.length; j++){ const k = b.slots[j]; if (!k) continue; if (!L.has(k) || seen.has(k)) b.slots[j] = null; else seen.add(k); } });
  const hadOver = I.over.length; I.over = I.over.filter(k => L.has(k) && !seen.has(k)); I.over.forEach(k => seen.add(k));
  let toOver = 0; const mark = k => { if (I.init && I.opt.newOn) I.newK[k] = 1; };
  live.forEach(k => { if (seen.has(k)) return; seen.add(k); const a = invPlaceFor(I, k);
    if (a){ setAt(I, a, k); mark(k); return; }
    if (k[0] === "w"){ const w = invWeapon(k); if (invAutoJunk(w)){ invSalvageW(w, true); return; } }
    I.over.push(k); mark(k); toOver++; });
  I.init = true; Object.keys(I.newK).forEach(k => { if (!L.has(k)) delete I.newK[k]; });
  if (toOver && !hadOver){ notify("info", {text:"🎒 Your bags are full. New finds are waiting in the overflow bag."}); if (I.overPop) setTimeout(() => fkOpen("bag", true), 50); }
  invLastSync = performance.now(); }
function invNewCount(){ return Object.keys(invState().newK).length; }

/* ---------- item info ---------- */
function invInfo(key){ const [k, id] = ikSplit(key);
  if (k === "w"){ const w = invWeapon(key); if (!w) return null; const R = W_RARITY.find(r => r.k === w.r) || W_RARITY[1]; return {k, w, name:w.name, art:wImg(w, "still"), big:wImg(w, "card"), col:R.col, rank:tierIdx(w.r), pow:wDps(w), n:1, zone:w.zone || "", t:w.found || 0, hay:(w.name + " " + R.label + " weapon " + (w.zone && ZONES[w.zone] ? ZONES[w.zone].name : "") + " " + (w.traits||[]).map(t => WTRAITS[t] ? WTRAITS[t].n : "").join(" ")).toLowerCase()}; }
  if (k === "t"){ const T = TREATS[id]; if (!T) return null; return {k, name:T.n, art:emoImg(T.i), col:"#b8c4bb", rank:1, pow:0, t:0, n:invCount(key), desc:T.d + " for " + T.min + " min.", use:"Eat", hay:(T.n + " treat consumable").toLowerCase()}; }
  if (k === "p"){ const t = id.slice(0,-1), tier = +id.slice(-1), P = POT_TYPES[t]; if (!P) return null; return {k, name:potName(t, tier), art:emoImg(potIcon(t)), col:["#b8c4bb","#4f8fb8","#a77bd6"][tier] || "#b8c4bb", rank:1 + tier, pow:0, t:0, n:invCount(key), desc:P.desc(P.vals[tier]) + " for " + POT_MIN[tier] + " min.", use:"Drink", hay:(potName(t, tier) + " brew consumable").toLowerCase()}; }
  if (k === "a"){ const i = +id, Bt = BAITS[i]; if (!Bt) return null; return {k, name:baitName(i), art:emoImg(baitIcon(i)), col:["#b8c4bb","#4f8fb8","#a77bd6"][i], rank:1 + i, pow:0, t:0, n:invCount(key), desc:"Set it out while hunting: up to " + Bt.max + " creatures come at once, " + Bt.rate + "× as fast, for " + Bt.min + " min.", use:"Set out", hay:(baitName(i) + " bait").toLowerCase()}; }
  if (k === "g"){ const b = invState().B[id]; if (!b) return null; const n = b.slots.filter(Boolean).length; return {k, name:bagName(b), art:fkIcon(BAG_TYPES[b.type] ? BAG_TYPES[b.type].icon : "knapsack"), col:"#d9a441", rank:0, pow:0, t:0, n:1, desc:(BAG_TYPES[b.type] ? BAG_TYPES[b.type].size : 0) + "-slot bag, stowed with " + n + " thing" + (n === 1 ? "" : "s") + " still inside.", use:"Put on", hay:(bagName(b) + " bag").toLowerCase()}; }
  return null; }
function invStashInfo(key){ const it = invInfo(key); if (it && it.k !== "w" && it.k !== "g") it.n = invState().stashC[key] || 0; return it; }
/* Side-by-side compare: hovering a weapon you aren't wearing also shows the equipped weapon it would most likely replace:
   the same kind of weapon if you wear one, otherwise your weakest. Same rule as double-click. */
function invCompareTarget(w){ const H = huntState(), eqW = H.equipped.map(id => H.weapons.find(x => x.id === id)).filter(Boolean); if (!eqW.length || H.equipped.includes(w.id)) return null;
  const same = eqW.filter(x => wClass(x) === wClass(w)).sort((a,b) => wDps(a) - wDps(b))[0]; if (same) return {w:same, why:"Same kind"};
  return eqW.length >= 5 ? {w:eqW.slice().sort((a,b) => wDps(a) - wDps(b))[0], why:"Your weakest"} : null; }
function invWCard(w, o){ const H = huntState(), R = W_RARITY.find(r => r.k === w.r), C = WCLASS[wClass(w)], sg = w.sig && SIGNATURES.find(s => s[0] === w.sig), on = H.equipped.includes(w.id), vs = o.vs;
  const d = vs ? wDps(w) - wDps(vs) : null, dd = vs ? w.dmg - vs.dmg : null, ds = vs ? Math.round((w.spd - vs.spd) * 100) / 100 : null;
  const tag = (v, f) => v == null || v === 0 ? "" : `<span class="dl ${v > 0 ? "up" : "down"}">${v > 0 ? "▲" : "▼"}${f(Math.abs(v))}</span>`;
  const newT = vs ? (w.traits||[]).filter(t => !(vs.traits||[]).includes(t)) : [];
  return `<div class="ivcard${o.eq ? " eqc" : ""}" style="--rc:${R.col}">${o.eq ? `<div class="ivc-eq">Equipped · slot ${H.equipped.indexOf(w.id) + 1} · ${esc(o.why || "")}</div>` : ""}
    <div class="ivc-top"><span class="ivc-art">${wImg(w, "card")}</span><div><div class="ivc-n" style="color:${R.col}">${esc(w.name)}</div><div class="ivc-s">${R.label} · ${esc(C ? C.n : "")}${w.zone && ZONES[w.zone] ? " · " + esc(ZONES[w.zone].name) : ""}</div>
    <div class="ivc-d"><b>${fmtMeat(wDps(w))}</b> dps ${tag(d, fmtMeat)}<small>${fmtMeat(w.dmg)}${tag(dd, fmtMeat)} × ${w.spd}/s${tag(ds, x => x)}</small></div></div></div>
    ${(w.traits||[]).length || sg || w.set ? `<ul class="ivc-a">${(w.traits||[]).map(t => WTRAITS[t] ? `<li${newT.includes(t) ? ` class="nw"` : ""}>${esc(WTRAITS[t].n)}: ${esc(WTRAITS[t].d)}</li>` : "").join("")}${sg ? `<li class="sig">✦ ${esc(sg[1])}: ${esc(sg[2])}</li>` : ""}${w.set ? `<li class="set">Set piece</li>` : ""}</ul>` : ""}
    ${o.eq ? "" : on ? `<div class="ivc-c">Equipped in slot ${H.equipped.indexOf(w.id) + 1}</div>` : vs ? `<div class="ivc-c ${d >= 0 ? "up" : "down"}">${d >= 0 ? "An upgrade: +" : "A downgrade: −"}${fmtMeat(Math.abs(d))} dps vs the equipped ${esc(vs.name)}</div>` : H.equipped.length < 5 ? `<div class="ivc-c up">You have an empty Loadout slot</div>` : ""}
    ${!o.eq && w.from ? `<div class="ivc-f">Dropped by ${esc(w.from)}${w.found ? " · " + new Date(w.found).toLocaleDateString("en-US", {month:"short", day:"numeric"}) : ""}</div>` : ""}
    ${!o.eq && w.lock ? `<div class="ivc-h">${w.hung ? "On your den wall · " : ""}Locked: safe from salvage</div>` : ""}
    ${o.eq ? "" : `<div class="ivc-h">${o.where === "s" ? "Drag to your bags to take it" : on ? "Drag to a bag to unequip" : "Double-click to equip" + (vs ? " (swaps out the one beside it)" : "")} · Right-click for more${o.hint ? " · " + o.hint : ""}</div>`}</div>`; }
function invCard(key, where, shift){ const it = where === "s" ? invStashInfo(key) : invInfo(key); if (!it) return ""; const O = invState().opt;
  if (it.k === "w"){ const mode = O.cmp || "always", cmp = where === "s" || mode === "off" || (mode === "shift" && !shift) ? null : invCompareTarget(it.w);
    const hint = mode === "shift" && !shift && invCompareTarget(it.w) ? "Hold Shift to compare" : "";
    return invWCard(it.w, {where, vs:cmp && cmp.w, hint}) + (cmp ? invWCard(cmp.w, {eq:true, why:cmp.why}) : ""); }
  const kind = ({t:"Treat", p:"Brew", a:"Bait", g:"Bag"})[it.k];
  return `<div class="ivcard" style="--rc:${it.col}"><div class="ivc-top"><span class="ivc-art">${it.art}</span><div><div class="ivc-n" style="color:${it.col}">${esc(it.name)}</div><div class="ivc-s">${kind}${it.k !== "g" ? " · " + it.n + " in stack" : ""}</div></div></div><div class="ivc-x">${esc(it.desc)}</div><div class="ivc-h">${where === "s" ? (it.k === "g" ? "At home: drag it onto an empty bag slot, or double-click" : "Drag to your bags to take it") : "Double-click: " + it.use.toLowerCase()} · Right-click for more</div></div>`; }

/* ---------- drawing ---------- */
function invSlotHtml(loc, i, key, cls){ const I = invState(), it = key && (loc === "s" ? invStashInfo(key) : invInfo(key));
  if (!it) return `<div class="islot empty${cls ? " " + cls : ""}" data-iloc="${loc}" data-ii="${i}"${loc === "l" ? ` data-n="${(+i)+1}"` : ""}></div>`;
  const n = it.n, w = it.w, dim = INVQ && !it.hay.includes(INVQ.toLowerCase());
  return `<div class="islot full${cls ? " " + cls : ""}${it.k === "g" ? " bagit" : ""}${I.newK[key] && loc !== "s" ? " new" : ""}${dim ? " dim" : ""}" data-iloc="${loc}" data-ii="${i}" data-ik="${esc(key)}" style="--rc:${it.col}" tabindex="0" aria-label="${esc(it.name)}">${it.art}${n > 1 ? `<span class="n">${n > 999 ? fmtMeat(n) : n}</span>` : ""}${w && w.lock ? `<span class="lk" aria-hidden="true"></span>` : ""}${w && w.set ? `<span class="setp"></span>` : ""}</div>`; }
function bagPullLabel(b){ const c = b.cfg; if (bagManual(b)) return "Manual only"; const kinds = c.pull.length ? c.pull.map(k => (BAG_PULL.find(x => x[0] === k) || [k, k])[1]).join(", ") : "Anything"; const rar = c.rar.length ? " · " + c.rar.map(r => BAG_RAR.find(x => x[0] === r)[1]).join(", ") : ""; return kinds + rar; }
function invBagHead(b){ const used = b.slots.filter(Boolean).length, c = b.cfg, junk = invJunkList(b.id).length, armed = (invArm[b.id] || 0) > Date.now();
  const name = INV_REN === b.id ? `<input class="iren" data-invname="${b.id}" value="${esc(b.name || "")}" placeholder="${esc(BAG_TYPES[b.type].n)}" maxlength="24" aria-label="Bag name">` : `<span class="nm">${esc(bagName(b))}</span>`;
  return `<div class="ibh"><button type="button" class="ibt" data-a="inv-shut" data-id="${b.id}" aria-label="Show or hide ${esc(bagName(b))}"><span class="cv">▾</span></button>${name}<em>${used}/${b.slots.length} · ${esc(bagPullLabel(b))}${c.lock ? " · layout locked" : ""}${c.prot ? " · protected" : ""}</em>
    <span class="ibx"><button type="button" class="iib${INV_CFG === b.id ? " on" : ""}" data-a="inv-cfg" data-id="${b.id}" title="Bag settings" aria-label="Bag settings">${fkIcon("cog")}</button><button type="button" class="iib" data-a="inv-ren" data-id="${b.id}" title="Rename this bag" aria-label="Rename">${fkIcon("quill-ink")}</button><button type="button" class="iib" data-a="inv-tidy" data-id="${b.id}" ${c.lock ? `disabled title="Layout locked (bag settings)"` : `title="Tidy this bag by ${esc((BAG_SORT.find(s => s[0] === (c.sort || invState().opt.sort)) || BAG_SORT[0])[1].toLowerCase())}"`} aria-label="Tidy">${fkIcon("broom")}</button>${c.prot ? "" : `<button type="button" class="iib${armed ? " arm" : ""}" data-a="inv-junk" data-id="${b.id}" ${junk ? "" : "disabled"} title="${armed ? "Click again to salvage " + junk : "Salvage the Common and Uncommon weapons in this bag" + (junk ? " (" + junk + ")" : "")}" aria-label="Salvage junk">${fkIcon("recycle")}${armed ? `<b>${junk}?</b>` : junk ? `<small>${junk}</small>` : ""}</button>`}</span></div>
    ${INV_CFG === b.id ? invBagCfg(b) : ""}`; }
function invBagCfg(b){ const c = b.cfg, id = b.id, man = bagManual(b), chk = (attr, on, label, dis) => `<label class="ichip${on ? " on" : ""}${dis ? " dis" : ""}"><input type="checkbox" ${attr} ${on ? "checked" : ""} ${dis ? "disabled" : ""}>${esc(label)}</label>`;
  return `<div class="ibcfg"><div class="ibr"><span class="lbl">Pulls in</span><div class="ichips">${chk(`data-bcfg="pull" data-bid="${id}" data-v="any"`, !c.pull.length, "Anything")}${BAG_PULL.map(([k, l, dis]) => chk(`data-bcfg="pull" data-bid="${id}" data-v="${k}"`, c.pull.includes(k), l + (dis ? " (soon)" : ""), dis)).join("")}${chk(`data-bcfg="pull" data-bid="${id}" data-v="none"`, man, "Nothing (manual only)")}</div></div>
    <div class="ibr"><span class="lbl">Weapon rarities</span><div class="ichips">${chk(`data-bcfg="rar" data-bid="${id}" data-v="all"`, !c.rar.length, "All")}${BAG_RAR.map(([k, l]) => chk(`data-bcfg="rar" data-bid="${id}" data-v="${k}"`, c.rar.includes(k), l, man)).join("")}</div></div>
    <div class="ibr"><span class="lbl">Sort by</span><select data-bcfg="sort" data-bid="${id}" aria-label="Sort this bag by"><option value="">Default (${esc(BAG_SORT.find(s => s[0] === invState().opt.sort)[1])})</option>${BAG_SORT.map(([k, l]) => `<option value="${k}" ${c.sort === k ? "selected" : ""}>${l}</option>`).join("")}</select></div>
    <div class="ibr"><span class="lbl">Rules</span><div class="ichips">${chk(`data-bcfg="prot" data-bid="${id}"`, c.prot, "Protect from salvage")}${chk(`data-bcfg="lock" data-bid="${id}"`, c.lock, "Lock layout")}</div></div>
    <div class="ibr"><span class="lbl">Colour</span><div class="icols">${BAG_COL.map(col => `<button type="button" class="icol${(c.col || "") === col ? " on" : ""}" data-bcol="${col}" data-bid="${id}" style="--c:${col || "transparent"}" aria-label="${col ? "Colour " + col : "No colour"}"></button>`).join("")}</div></div>
    <div class="ibr"><span class="lbl"></span><button type="button" class="itb" data-a="inv-gather" data-id="${id}" ${man ? "disabled" : ""} title="Move everything this bag asks for into it, from your other bags (bags with a locked layout are left alone)">${fkIcon("swap-bag")}Gather matching items</button></div></div>`; }
function invMasterCfg(){ const I = invState(), O = I.opt, L = invSalvLevel(), sel = (attr, opts, v) => `<select ${attr}>${opts.map(([k, l]) => `<option value="${k}" ${String(v) === String(k) ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
  const chk = (k, on, label) => `<label><input type="checkbox" data-invopt="${k}" ${on ? "checked" : ""}> ${esc(label)}</label>`;
  return `<details class="icog"><summary aria-label="Inventory settings">${fkIcon("cog")}</summary><div class="imcfg">
    <div class="ibr"><span class="lbl">Default sort</span>${sel(`data-invopt="sort" aria-label="Default sort"`, BAG_SORT, O.sort)}</div>
    <div class="ibr"><span class="lbl">Auto-salvage</span>${sel(`data-invopt="salv" aria-label="Auto-salvage level"`, SALV_LVL, L)}</div><p class="ipre">${esc(invSalvPreview())}</p>
    <div class="ibr"><span class="lbl">Compare cards</span>${sel(`data-invopt="cmp" aria-label="Compare cards"`, [["always","Always"],["shift","Only while holding Shift"],["off","Off"]], O.cmp)}</div>
    ${chk("cfmRare", O.cfmRare, "Ask before salvaging Rare or better")}${chk("newOn", O.newOn, "Mark new items until I hover them")}${chk("empty", O.empty, "Show empty slots")}${chk("heads", O.heads, "Show bag headers")}${chk("overpop", I.overPop, "Open the overflow bag as soon as it fills")}
    <div class="ibr"><button type="button" class="itb" data-a="inv-seen">Mark all as seen</button></div></div></details>`; }
function invSection(){ invSync(); const I = invState(), O = I.opt, H = huntState(), tabs = `<div class="subtabs"><button class="subtab${INV_TAB === "bags" ? " on" : ""}" data-a="inv-tab" data-id="bags">Bags</button><button class="subtab${INV_TAB === "cur" ? " on" : ""}" data-a="inv-tab" data-id="cur">Currencies</button><button class="subtab${INV_TAB === "rec" ? " on" : ""}" data-a="inv-tab" data-id="rec">Recently salvaged${I.recent.length ? " (" + I.recent.length + ")" : ""}</button></div>`;
  if (INV_TAB === "cur") return `<section class="box inv" aria-labelledby="inv-h"><h2 id="inv-h" class="sr">Inventory</h2>${tabs}${invCurrencies()}</section>`;
  if (INV_TAB === "rec") return `<section class="box inv" aria-labelledby="inv-h"><h2 id="inv-h" class="sr">Inventory</h2>${tabs}${invRecentList()}</section>`;
  const lo = Array.from({length:5}, (_,i) => invSlotHtml("l", i, H.equipped[i] ? "w:" + H.equipped[i] : null, "lo")).join("");
  const strip = Array.from({length:BAG_SLOTS_MAX}, (_,i) => { if (i >= BAG_SLOTS) return `<span class="ibag res" title="Reserved for later">${fkIcon("padlock")}</span>`; const b = I.B[I.eqB[i]], T = b && BAG_TYPES[b.type];
    return T ? `<span class="ibag${T.keep ? " keep" : ""}" data-ibag="${i}" data-bid="${b.id}" style="--bc:${b.cfg.col || "transparent"}" title="${esc(bagName(b))} · ${T.size} slots · ${esc(bagPullLabel(b))} · drag to reorder · right-click for more">${fkIcon(T.icon)}<small>${T.size}</small></span>` : `<span class="ibag empty" data-ibag="${i}" title="Empty bag slot. Stowed bags go back on here (from the Stash, at home). Bigger bags will drop from bosses, caves and sets.">${fkIcon("swap-bag")}</span>`; }).join("");
  const over = I.over.length ? `<div class="iover"><div class="ih"><b>${fkIcon("swap-bag")} Overflow bag</b><small>${I.over.length} waiting · drag them into your bags, salvage them, or send them to the Stash</small></div><div class="igrid">${I.over.map((k, i) => invSlotHtml("o", i, k)).join("")}</div></div>` : "";
  const bags = eqBags(I).map(b => `<div class="ibagb${I.shut[b.id] ? " shut" : ""}" style="--bc:${b.cfg.col || "transparent"}">${invBagHead(b)}<div class="igrid">${b.slots.map((k, j) => invSlotHtml("b", b.id + ":" + j, k)).join("")}</div></div>`).join("") || `<p class="small">No bags on you. Head home and put one back on from the Stash.</p>`;
  const S = shopState();
  return `<section class="box inv${O.empty ? "" : " noempty"}${O.heads ? "" : " noheads"}" aria-labelledby="inv-h"><h2 id="inv-h" class="sr">Inventory</h2>${tabs}
    <div class="itools"><label class="isearch">${fkIcon("magnifying-glass")}<input type="search" data-invq value="${esc(INVQ)}" placeholder="Search your bags" aria-label="Search your bags" autocomplete="off"></label>
      <button type="button" class="itb" data-a="inv-tidyall" title="Tidy every bag by its own sort. Bags with a locked layout are left alone.">${fkIcon("broom")}Tidy all</button>${invMasterCfg()}</div>
    ${over}
    <div class="isec"><div class="ihd"><span class="lbl">Loadout</span><small>Drag a weapon here, or double-click it</small></div><div class="irow">${lo}</div>
      <div class="irow back" title="The back bar arrives with weapon swapping">${Array.from({length:5}, () => `<span class="islot locked">${fkIcon("padlock")}</span>`).join("")}<span class="lbl">Back bar · later</span></div></div>
    <div class="isec"><div class="ihd"><span class="lbl">Bags</span><small>${invFreeCount(I)} free spaces · drag bags to reorder · cog for what each bag pulls in</small></div><div class="istrip">${strip}</div>${bags}</div>
    <div class="iwallet"><span title="Meats">${emoImg("🍖")} ${fmtMeat(H.meats)}</span><span title="Dingo Coins">${emoImg("🪙")} ${coinsFmt(S.coins)}</span><span title="Bones">${emoImg("🦴")} ${(state.treats.bones||0).toLocaleString()}</span><button type="button" class="imore" data-a="inv-tab" data-id="cur">All currencies →</button></div>
  </section>`; }
function invRecentList(){ const I = invState(), H = huntState();
  if (!I.recent.length) return `<p class="small">Nothing salvaged lately. Your last 20 salvaged weapons show up here, and you can undo any of them.</p>`;
  return `<p class="small">Your last 20 salvaged weapons. Undo gives the weapon back and takes back the meats it gave you.</p><div class="irec">${I.recent.map((r, i) => { const R = W_RARITY.find(x => x.k === r.w.r) || W_RARITY[1];
    return `<div class="ireci"><span class="ia" style="--rc:${R.col}">${wImg(r.w, "still")}</span><span><b style="color:${R.col}">${esc(r.w.name)}</b><small>${R.label} · ${fmtMeat(wDps(r.w))} dps · ${new Date(r.t).toLocaleString("en-US", {month:"short", day:"numeric", hour:"numeric", minute:"2-digit"})}</small></span><button type="button" class="itb" data-a="inv-undo" data-id="${i}" ${H.meats < r.m ? `disabled title="You need ${fmtMeat(r.m)} meats"` : ""}>Undo (−${fmtMeat(r.m)} 🍖)</button></div>`; }).join("")}</div>`; }
function invCurrencies(){ const H = huntState(), S = shopState(), K = state.pack || {}, Sc = state.scrip || {ess:{}}, EV = gameEvent();
  const row = (art, n, d, v) => `<div class="icur"><span class="ia">${art}</span><span><b>${esc(n)}</b><small>${esc(d)}</small></span><span class="iv">${v}</span></div>`;
  const ess = Object.keys(ASP).filter(k => (Sc.ess[k]||0) > 0);
  return `<div class="isec"><span class="lbl">Everyday</span>${row(emoImg("🍖"), "Meats", "Dropped by every creature.", fmtMeat(H.meats))}${row(emoImg("🪙"), "Dingo Coins", "From bosses and letters.", coinsFmt(S.coins))}${row(emoImg("🦴"), "Bones", "From Trials and daily gifts.", (state.treats.bones||0).toLocaleString())}${(K.spirit||0) ? row(emoImg("✨"), "Spirit", "From your happy pups.", fmtMeat(K.spirit)) : ""}</div>
    <div class="isec"><span class="lbl">Essences</span>${ess.length ? ess.map(k => row(essImg(k), ASP[k].n + " Essence", ASP[k].relic ? "Relic" : ASP[k].of ? "Distilled" : "Primal", (Sc.ess[k]||0).toLocaleString())).join("") : `<p class="small">No essences yet. They come from creatures once you can gather them.</p>`}</div>
    <div class="isec"><span class="lbl">Trials &amp; events</span>${row(emoImg("🏆"), "Trial Points", "Fill the Trial Pass.", (trialState().tp||0).toLocaleString())}${EV ? row(emoImg(EV.cur.icon), EV.cur.name, "This event's currency.", fmtMeat(evCur())) : ""}</div>`; }
function stashSection(){ invSync(); const I = invState(), used = I.stash.filter(Boolean).length;
  return `<section class="box inv" aria-labelledby="stash-h"><h2 id="stash-h" class="sr">Stash</h2>
    <div class="ihd"><span class="lbl">Stash · ${used}/${STASH_SIZE}</span><small>Drag things between your bags and the Stash. From anywhere, right-click an item and pick Send to Stash.</small></div>
    <div class="igrid stash">${I.stash.map((k, i) => invSlotHtml("s", i, k)).join("")}</div></section>`; }

/* ---------- bags: reorder, rename, tidy, salvage, gather, stow ---------- */
function invJunkList(bid){ const I = invState(); return eqBags(I).filter(b => !bagProt(b) && (!bid || b.id === bid)).flatMap(b => b.slots.filter(k => k && k[0] === "w" && invJunk(invWeapon(k)))); }
function invSortKeys(keys, by){ const info = {}; keys.forEach(k => info[k] = invInfo(k) || {name:"", rank:0, zone:"", pow:0, t:0});
  const kind = (a, c) => INV_KIND[a[0]] - INV_KIND[c[0]], rar = (a, c) => info[c].rank - info[a].rank, pow = (a, c) => (info[c].pow||0) - (info[a].pow||0), area = (a, c) => String(info[a].zone).localeCompare(String(info[c].zone)), nm = (a, c) => info[a].name.localeCompare(info[c].name), nw = (a, c) => (info[c].t||0) - (info[a].t||0);
  const order = {rarity:[rar, kind, pow, nm], power:[kind, pow, rar, nm], type:[kind, rar, area, nm], area:[area, kind, rar, nm], new:[nw, kind, rar, nm]}[by] || [rar, kind, pow, nm];
  return keys.sort((a, c) => { for (const f of order){ const v = f(a, c); if (v) return v; } return 0; }); }
function invTidyBag(bid, quiet){ const I = invState(), b = I.B[bid]; if (!b || b.cfg.lock) return; const keys = invSortKeys(b.slots.filter(Boolean), b.cfg.sort || I.opt.sort);
  b.slots = b.slots.map((_, j) => keys[j] || null); if (!quiet){ sfx("click"); save(bagName(b) + " tidied"); } }
function invTidyAll(){ const I = invState(); let n = 0; eqBags(I).forEach(b => { if (!b.cfg.lock){ invTidyBag(b.id, true); n++; } }); sfx("click"); save(n ? "Tidied " + n + " bag" + (n === 1 ? "" : "s") : "Every bag's layout is locked"); }
function invGather(bid){ const I = invState(), b = I.B[bid]; if (!b || bagManual(b)) return; let n = 0;
  eqBags(I).forEach(o => { if (o === b || o.cfg.lock) return; o.slots.forEach((k, j) => { if (!k || bagWants(b, k) === null || (bagWants(o, k) === "specific" && bagWants(b, k) !== "specific")) return; const f = b.slots.indexOf(null); if (f < 0) return; b.slots[f] = k; o.slots[j] = null; n++; }); });
  sfx("click"); toast(n ? "Gathered " + n + " thing" + (n === 1 ? "" : "s") + " into " + bagName(b) + "." : "Nothing to gather (or no room)."); save("Gathered"); }
function invSalvageBag(bid){ const list = invJunkList(bid); if (!list.length) return; if ((invArm[bid] || 0) < Date.now()){ invArm[bid] = Date.now() + 4000; render(); setTimeout(render, 4100); return; }
  invArm[bid] = 0; let m = 0; list.forEach(k => { m += invSalvageW(invWeapon(k)); }); sfx("coin"); floatText("+" + fmtMeat(m) + " 🍖"); toast("♻️ Salvaged " + list.length + " weapon" + (list.length === 1 ? "" : "s") + " for " + fmtMeat(m) + " meats. Changed your mind? Inventory → Recently salvaged."); save("Salvaged"); }
function invStowBag(bid){ const I = invState(), H = huntState(), b = I.B[bid], pos = I.eqB.indexOf(bid); if (!b || pos < 0) return false;
  if (eqBags(I).length <= 1){ toast("Keep at least one bag on you."); return false; }
  const at = I.stash.indexOf(null); if (at < 0){ toast("Your Stash is full."); return false; }
  b.w = []; b.cnt = {};
  b.slots.forEach(k => { if (!k) return; const [t, id] = ikSplit(k); if (t === "w"){ const w = H.weapons.find(x => x.id === id); if (w){ if (w.hung) unhangWeapon(id); H.weapons = H.weapons.filter(x => x !== w); b.w.push(w); } } else { b.cnt[k] = invCount(k); invSetCount(k, 0); } delete I.newK[k]; });
  I.eqB[pos] = null; I.stash[at] = "g:" + bid; if (INV_CFG === bid) INV_CFG = ""; return true; }
function invWearBag(bid, pos, si){ const I = invState(), H = huntState(), b = I.B[bid]; if (!b) return false;
  if (!atHome()){ toast("Your Stash is in the Den. Head home to put that bag back on."); return false; }
  if (pos == null || I.eqB[pos]) pos = I.eqB.indexOf(null); if (pos < 0){ toast("All your bag slots are in use. Stow a bag first."); return false; }
  const placed = new Set(eqBags(I).flatMap(x => x.slots).filter(Boolean).concat(I.over));
  b.slots = b.slots.map(k => { if (!k) return null; const [t] = ikSplit(k); if (t === "w"){ const w = (b.w || []).find(x => "w:" + x.id === k); if (!w) return null; H.weapons.push(w); return k; }
    invSetCount(k, invCount(k) + ((b.cnt || {})[k] || 0)); return placed.has(k) ? null : k; });
  delete b.w; delete b.cnt; I.eqB[pos] = bid; if (si != null && I.stash[si] === "g:" + bid) I.stash[si] = null; else I.stash = I.stash.map(x => x === "g:" + bid ? null : x); return true; }

/* ---------- moving things ---------- */
function invEquip(id, at){ const H = huntState(); if (H.equipped.includes(id)) return; const eq = H.equipped.slice(), w = H.weapons.find(x => x.id === id);
  if (at != null && at < eq.length) eq[at] = id; else if (eq.length < 5) eq.push(id); else { const t = w && invCompareTarget(w), out = t ? t.w : eq.map(x => H.weapons.find(v => v.id === x)).filter(Boolean).sort((a,b) => wDps(a) - wDps(b))[0]; eq[eq.indexOf(out.id)] = id; }
  H.equipped = eq; H.autoEquip = false; syncGhosts(); }
function invTakeFromSlot(loc, i){ const I = invState(); if (loc === "b") setAt(I, i, null); if (loc === "o") I.over.splice(+i, 1); if (loc === "s") I.stash[+i] = null; }
function invDeposit(key, fromLoc, fromI, toI){ const I = invState(), H = huntState(), [k, id] = ikSplit(key);
  if (k === "w"){ const w = H.weapons.find(x => x.id === id); if (!w) return false; if (H.equipped.includes(id)){ toast("Unequip it first."); return false; } }
  const exist = k !== "w" ? I.stash.indexOf(key) : -1; let at = exist >= 0 ? exist : (toI != null && !I.stash[+toI] ? +toI : I.stash.indexOf(null));
  if (at < 0){ toast("Your Stash is full."); return false; }
  if (k === "w"){ const w = H.weapons.find(x => x.id === id); if (w.hung) unhangWeapon(id); H.weapons = H.weapons.filter(x => x !== w); I.stashW.push(w); }
  else { const n = invCount(key); I.stashC[key] = (I.stashC[key]||0) + n; invSetCount(key, 0); }
  if (fromLoc) invTakeFromSlot(fromLoc, fromI); I.stash[at] = key; delete I.newK[key]; return true; }
function invWithdraw(key, si, toA){ const I = invState(), H = huntState(), [k, id] = ikSplit(key);
  if (!atHome()){ toast("Your Stash is in the Den. Head home to take things out."); return false; }
  if (k === "g") return invWearBag(id, null, si);
  const inBags = k !== "w" && (eqBags(I).some(b => b.slots.includes(key)) || I.over.includes(key)), target = toA && !getAt(I, toA) ? toA : null;
  if (!inBags && !target && !invRoomFor(I, key)){ toast("No room in your bags."); return false; }
  if (k === "w"){ const w = I.stashW.find(x => x.id === id); if (!w) return false; I.stashW = I.stashW.filter(x => x !== w); H.weapons.push(w); }
  else { invSetCount(key, invCount(key) + (I.stashC[key]||0)); delete I.stashC[key]; }
  I.stash[+si] = null; if (!inBags && target) setAt(I, target, key); return true; }
function invMove(from, to){ const I = invState(), H = huntState(); if (from.loc === to.loc && String(from.i) === String(to.i)) return;
  const key = from.key, isW = key[0] === "w", tKey = to.loc === "b" ? getAt(I, to.i) : to.loc === "s" ? I.stash[+to.i] : to.loc === "l" ? (H.equipped[+to.i] ? "w:" + H.equipped[+to.i] : null) : null;
  if (to.loc === "o"){ toast("The overflow bag only holds what didn't fit."); return; }
  if (key[0] === "g"){ if (to.loc === "s"){ [I.stash[+from.i], I.stash[+to.i]] = [I.stash[+to.i], I.stash[+from.i]]; save("Stash tidied", true); render(); return; } toast("Drop a bag onto an empty bag slot in the bag strip."); return; }
  if (to.loc === "l"){ if (!isW){ toast("Only weapons go in the Loadout."); return; } if (from.loc === "s"){ toast("Take it out of the Stash first."); return; }
    const id = ikSplit(key)[1];
    if (from.loc === "l"){ const eq = H.equipped.slice(), a = +from.i, b = Math.min(+to.i, eq.length - 1); [eq[a], eq[b]] = [eq[b], eq[a]]; H.equipped = eq; syncGhosts(); save("Loadout changed"); return; }
    invTakeFromSlot(from.loc, from.i); const old = H.equipped[+to.i]; invEquip(id, +to.i);
    if (old && from.loc === "b") setAt(I, from.i, "w:" + old); sfx("click"); save("Equipped " + invWeapon(key).name); return; }
  if (from.loc === "l"){ const id = ikSplit(key)[1];
    if (to.loc === "s"){ toast("Unequip it first."); return; }
    if (tKey && tKey[0] === "w" && to.loc === "b"){ const eq = H.equipped.slice(); eq[+from.i] = ikSplit(tKey)[1]; H.equipped = eq; setAt(I, to.i, key); syncGhosts(); save("Swapped weapons"); return; }
    if (tKey){ toast("Pick an empty slot or another weapon."); return; }
    H.equipped = H.equipped.filter(x => x !== id); setAt(I, to.i, key); syncGhosts(); sfx("click"); save("Unequipped"); return; }
  if (to.loc === "s"){ if (from.loc === "s"){ [I.stash[+from.i], I.stash[+to.i]] = [I.stash[+to.i], I.stash[+from.i]]; save("Stash tidied", true); render(); return; }
    if (invDeposit(key, from.loc, from.i, to.i)){ sfx("click"); save("Sent to your Stash"); } return; }
  if (from.loc === "s"){ if (invWithdraw(key, from.i, to.i)){ sfx("click"); save("Taken from your Stash"); } return; }
  if (from.loc === "o"){ if (tKey){ I.over[+from.i] = tKey; setAt(I, to.i, key); } else { I.over.splice(+from.i, 1); setAt(I, to.i, key); } sfx("click"); save("Moved", true); render(); return; }
  /* bag to bag */ setAt(I, from.i, tKey); setAt(I, to.i, key); save("Moved", true); render(); }
function invUse(key){ const [k, id] = ikSplit(key);
  if (k === "w"){ invEquip(id); save("Equipped"); return; }
  if (k === "t"){ eatTreat(id); save("Treat eaten"); return; }
  if (k === "p"){ const t = id.slice(0,-1), tier = +id.slice(-1); if (!drinkPot(t, tier)) return; sfx("chest"); happy(); toast(potName(t, tier) + ": " + POT_TYPES[t].desc(POT_TYPES[t].vals[tier]) + " for " + POT_MIN[tier] + " min!"); save("Drank a brew"); return; }
  if (k === "a"){ const i = +id, S = baitState(); if (atHome()){ toast("Set bait out in the wild, not in the Den."); return; } if ((S.inv[i]||0) < 1) return; S.inv[i]--; const now = Date.now(); S.acts[i] = Math.max(S.acts[i]||0, now) + BAITS[i].min*60000; S.active = null; const bv = baitVal(); sfx("chest"); toast(baitName(i) + " set out! Up to " + bv.max + " creatures at " + bv.rate.toFixed(1) + "× speed 🐾"); save("Bait used"); } }
function invPutInBags(I, key){ const f = invRoomFor(I, key); if (!f){ toast("No room in your bags."); return false; } setAt(I, f, key); return true; }

/* ---------- pointer drag (items and bags), hover card, right-click ---------- */
let IDRAG = null;
function invSlotAt(x, y){ const t = document.elementFromPoint(x, y); return t && t.closest && t.closest(".islot[data-iloc],.ibag[data-ibag]"); }
document.addEventListener("pointerdown", e => { if (e.button !== 0) return; const s = e.target.closest && e.target.closest(".islot.full[data-ik],.ibag[data-bid]"); if (!s) return;
  IDRAG = s.dataset.bid ? {bag:true, pos:+s.dataset.ibag, x:e.clientX, y:e.clientY, on:false, src:s} : {key:s.dataset.ik, loc:s.dataset.iloc, i:s.dataset.ii, x:e.clientX, y:e.clientY, on:false, src:s}; });
document.addEventListener("pointermove", e => { const D = IDRAG; if (!D) return;
  if (!D.on){ if (Math.hypot(e.clientX - D.x, e.clientY - D.y) < 5) return; D.on = true; invTipHide(); invCtxClose();
    const g = document.createElement("div"); g.className = "ighost" + (D.bag ? " bag" : ""); g.innerHTML = D.src ? D.src.innerHTML : ""; g.style.setProperty("--rc", D.src ? D.src.style.getPropertyValue("--rc") || "#d9a441" : "#d9a441"); document.body.appendChild(g); D.g = g; document.body.classList.add("idragging"); }
  D.g.style.left = e.clientX + "px"; D.g.style.top = e.clientY + "px";
  document.querySelectorAll(".islot.over,.islot.bad,.ibag.over,.ibag.bad").forEach(x => x.classList.remove("over", "bad"));
  const sl = invSlotAt(e.clientX, e.clientY); if (!sl) return;
  const bagTarget = sl.dataset.ibag != null, ok = D.bag ? bagTarget : bagTarget ? (D.key[0] === "g" && !sl.dataset.bid) : !((sl.dataset.iloc === "l" && D.key[0] !== "w") || sl.dataset.iloc === "o");
  sl.classList.add(ok ? "over" : "bad"); });
document.addEventListener("pointerup", e => { const D = IDRAG; IDRAG = null; if (!D || !D.on) return; D.g.remove(); document.body.classList.remove("idragging");
  document.querySelectorAll(".islot.over,.islot.bad,.ibag.over,.ibag.bad").forEach(x => x.classList.remove("over", "bad"));
  const sl = invSlotAt(e.clientX, e.clientY); if (!sl) return; const I = invState();
  if (D.bag){ if (sl.dataset.ibag == null) return; const to = +sl.dataset.ibag; if (to >= BAG_SLOTS || to === D.pos) return; [I.eqB[D.pos], I.eqB[to]] = [I.eqB[to], I.eqB[D.pos]]; sfx("click"); save("Bags reordered"); return; }
  if (sl.dataset.ibag != null){ if (D.key[0] === "g" && D.loc === "s" && !sl.dataset.bid){ if (invWearBag(ikSplit(D.key)[1], +sl.dataset.ibag, +D.i)){ sfx("click"); save("Bag put on"); } } else if (D.key[0] !== "g") toast("Drop items into a bag's slots below."); return; }
  invMove({key:D.key, loc:D.loc, i:D.i}, {loc:sl.dataset.iloc, i:sl.dataset.ii}); });
document.addEventListener("pointercancel", () => { if (IDRAG && IDRAG.g) IDRAG.g.remove(); IDRAG = null; document.body.classList.remove("idragging"); });
function invTip(){ let t = document.getElementById("ivtip"); if (!t){ t = document.createElement("div"); t.id = "ivtip"; t.className = "ivtip"; t.hidden = true; document.body.appendChild(t); } return t; }
function invPlace(el, x, y){ const r = el.getBoundingClientRect(); let L = x + 18, T = y + 14; if (L + r.width > innerWidth - 8) L = x - r.width - 18; if (T + r.height > innerHeight - 8) T = innerHeight - r.height - 8; el.style.left = Math.max(8, L) + "px"; el.style.top = Math.max(8, T) + "px"; }
function invTipHide(){ const t = document.getElementById("ivtip"); if (t) t.hidden = true; invHover = null; }
function invTipShow(key, where, x, y, shift){ const t = invTip(), html = invCard(key, where, shift); if (!html) return; t.innerHTML = html; t.hidden = false; invPlace(t, x, y); invHover = {key, where, x, y}; }
document.addEventListener("mouseover", e => { if (IDRAG && IDRAG.on) return; const s = e.target.closest && e.target.closest(".islot.full[data-ik]"); if (!s) return; const key = s.dataset.ik;
  invTipShow(key, s.dataset.iloc, e.clientX, e.clientY, e.shiftKey);
  const I = invState(); if (I.newK[key]){ delete I.newK[key]; s.classList.remove("new"); fkTick(true); } });
document.addEventListener("mousemove", e => { const t = document.getElementById("ivtip"); if (t && !t.hidden && e.target.closest && e.target.closest(".islot.full")){ invPlace(t, e.clientX, e.clientY); if (invHover){ invHover.x = e.clientX; invHover.y = e.clientY; } } });
document.addEventListener("mouseout", e => { const s = e.target.closest && e.target.closest(".islot.full"); if (s && !s.contains(e.relatedTarget)) invTipHide(); });
["keydown", "keyup"].forEach(ev => document.addEventListener(ev, e => { if (e.key !== "Shift" || !invHover || invState().opt.cmp !== "shift") return; invTipShow(invHover.key, invHover.where, invHover.x, invHover.y, ev === "keydown"); }));
document.addEventListener("dblclick", e => { const s = e.target.closest && e.target.closest(".islot.full[data-ik]"); if (!s) return; invTipHide(); const loc = s.dataset.iloc, key = s.dataset.ik, I = invState(), H = huntState();
  if (loc === "s"){ if (invWithdraw(key, +s.dataset.ii)) save(key[0] === "g" ? "Bag put on" : "Taken from your Stash"); return; }
  if (loc === "l"){ const id = ikSplit(key)[1], f = invRoomFor(I, key); if (!f){ toast("No room in your bags."); return; } H.equipped = H.equipped.filter(x => x !== id); setAt(I, f, key); syncGhosts(); save("Unequipped"); return; }
  if (loc === "o" && key[0] !== "w"){ if (!invRoomFor(I, key)){ toast("No room in your bags."); return; } I.over.splice(+s.dataset.ii, 1); invPutInBags(I, key); save("Moved"); return; }
  if (loc === "o"){ I.over.splice(+s.dataset.ii, 1); }
  invUse(key); });
function invCtxClose(){ const c = document.getElementById("ivctx"); if (c) c.remove(); }
function invCtxOpen(h, x, y, data){ invCtxClose(); const c = document.createElement("div"); c.id = "ivctx"; c.className = "ivctx"; c.innerHTML = h; Object.assign(c.dataset, data, {x, y}); document.body.appendChild(c); invPlace(c, x - 12, y - 8); }
const ivb = (c, ic, label, dis, cls) => `<button type="button" data-ic="${c}" ${dis ? "disabled" : ""}${cls ? ` class="${cls}"` : ""}>${fkIcon(ic)}${esc(label)}</button>`;
function invItemCtx(key, loc, i, x, y){ const I = invState(), it = loc === "s" ? invStashInfo(key) : invInfo(key); if (!it) return;
  const w = it.w, bag = loc === "b" ? I.B[adr(i).bid] : null, on = loc === "l", inKeep = isKeepBag(bag);
  const why = w ? (w.lock ? "Locked" : w.set ? "Set pieces are never salvaged" : w.relic ? "Relics are never salvaged" : (w.gems && w.gems.length) ? "Take its gems out first" : on ? "Unequip it first" : "") : "";
  const armed = w && (invArm[key] || 0) > Date.now(), keepBag = eqBags(I).find(x => isKeepBag(x) && x !== bag);
  let h = "";
  if (loc === "s") h += ivb("take", "knapsack", it.k === "g" ? (atHome() ? "Put this bag on" : "Put this bag on (at home)") : (atHome() ? "Take to bags" : "Take to bags (at home)"), !atHome());
  else {
    if (w) h += on ? ivb("unequip", "swap-bag", "Unequip") : ivb("equip", "crossed-swords", "Equip");
    else h += ivb("use", "sprint", it.use + (it.n > 1 ? " one" : ""));
    { const ct = w && !on && loc !== "s" ? invCompareTarget(w) : null; if (ct) h += ivb("swapc", "swap-bag", "Swap with " + ct.w.name); }
    if (loc === "o") h += ivb("tobag", "knapsack", "Move to bags", !invRoomFor(I, key));
    if (w) h += ivb("lock", "padlock", w.lock && w.hung ? "Locked (on your wall)" : w.lock ? "Unlock" : "Lock", w.lock && w.hung);
    if (w && !on) h += w.hung ? ivb("unhang", "bordered-shield", "Take down from den wall") : ivb("hang", "bordered-shield", "Hang on den wall", wallList().length >= WALL_HOOKS);
    if (loc === "b") h += inKeep ? ivb("keep", "locked-chest", "Move out of the Keepsake Box") : ivb("keep", "locked-chest", "Move to Keepsake Box", !keepBag);
    if (!on) h += ivb("stash", "locked-chest", "Send to Stash", I.stash.indexOf(null) < 0 && !(key[0] !== "w" && I.stash.includes(key)));
    if (w) h += `<hr>` + ivb("salvage", "recycle", armed ? "Salvage this " + W_RARITY.find(r => r.k === w.r).label + "? Click again" : "Salvage", !!why, armed ? "arm" : "") + (why ? `<div class="why">${esc(why)}</div>` : "");
  }
  invCtxOpen(h, x, y, {k:key, loc, i}); }
document.addEventListener("contextmenu", e => {
  const bg = e.target.closest && e.target.closest(".ibag[data-bid]");
  if (bg){ e.preventDefault(); invTipHide(); const I = invState(), b = I.B[bg.dataset.bid]; if (!b) return; const junk = invJunkList(b.id).length;
    invCtxOpen(ivb("bcfg", "cog", "Bag settings") + ivb("bren", "quill-ink", "Rename") + ivb("btidy", "broom", "Tidy this bag", b.cfg.lock) + (bagManual(b) ? "" : ivb("bgather", "swap-bag", "Gather matching items")) + (bagProt(b) ? "" : ivb("bjunk", "recycle", "Salvage junk in this bag" + (junk ? " (" + junk + ")" : ""), !junk)) + `<hr>` + ivb("bstow", "locked-chest", "Stow in Stash (keeps what's inside)", eqBags(I).length <= 1), e.clientX, e.clientY, {bid:b.id}); return; }
  const s = e.target.closest && e.target.closest(".islot.full[data-ik]"); if (!s) return; e.preventDefault(); invTipHide();
  invItemCtx(s.dataset.ik, s.dataset.iloc, s.dataset.ii, e.clientX, e.clientY); });
document.addEventListener("click", e => { const c = document.getElementById("ivctx"); if (!c) return; const bt = e.target.closest("[data-ic]"); if (!bt){ if (!e.target.closest("#ivctx")) invCtxClose(); return; } if (bt.disabled) return;
  const act = bt.dataset.ic, I = invState(), H = huntState(); invCtxClose();
  if (c.dataset.bid){ const bid = c.dataset.bid;
    if (act === "bcfg"){ INV_CFG = bid; I.shut[bid] = false; render(); }
    if (act === "bren"){ INV_REN = bid; render(); setTimeout(() => { const q = document.querySelector(`input[data-invname="${bid}"]`); if (q){ q.focus(); q.select(); } }, 30); }
    if (act === "btidy") invTidyBag(bid);
    if (act === "bgather") invGather(bid);
    if (act === "bjunk") invSalvageBag(bid);
    if (act === "bstow"){ if (invStowBag(bid)){ sfx("click"); toast("Stowed " + bagName(I.B[bid]) + " in your Stash, with everything inside."); save("Bag stowed"); } }
    return; }
  const key = c.dataset.k, loc = c.dataset.loc, i = c.dataset.i, [k, id] = ikSplit(key);
  if (act === "take"){ if (invWithdraw(key, +i)) save(k === "g" ? "Bag put on" : "Taken from your Stash"); return; }
  if (act === "equip"){ if (loc === "o") I.over.splice(+i, 1); else if (loc === "b") setAt(I, i, null); invEquip(id); sfx("click"); save("Equipped"); return; }
  if (act === "swapc"){ const w = invWeapon(key), ct = w && invCompareTarget(w); if (!ct) return; const at = H.equipped.indexOf(ct.w.id); if (loc === "o") I.over.splice(+i, 1); else if (loc === "b") setAt(I, i, "w:" + ct.w.id); invEquip(id, at); if (loc === "o") invSync(); sfx("click"); toast("Swapped: " + w.name + " is equipped, " + ct.w.name + " went to your bags."); save("Swapped weapons"); return; }
  if (act === "unequip"){ const f = invRoomFor(I, key); if (!f){ toast("No room in your bags."); return; } H.equipped = H.equipped.filter(x => x !== id); setAt(I, f, key); syncGhosts(); save("Unequipped"); return; }
  if (act === "use"){ invUse(key); return; }
  if (act === "tobag"){ if (!invRoomFor(I, key)){ toast("No room in your bags."); return; } I.over.splice(+i, 1); invPutInBags(I, key); save("Moved"); return; }
  if (act === "lock"){ const w = invWeapon(key); if (!w || w.hung) return; w.lock = !w.lock; sfx("click"); save(w.lock ? "Locked 🔒" : "Unlocked"); return; }
  if (act === "hang"){ hangWeapon(id); applyHome(); save("Weapon hung 🛡️"); return; }
  if (act === "unhang"){ unhangWeapon(id); applyHome(); save("Taken down"); return; }
  if (act === "keep"){ const from = I.B[adr(i).bid], inKeep = isKeepBag(from); let to = null; for (const b of eqBags(I)){ if (b === from || isKeepBag(b) === inKeep) continue; const j = b.slots.indexOf(null); if (j >= 0){ to = b.id + ":" + j; break; } } if (!to){ toast(inKeep ? "Your other bags are full." : "Your Keepsake Box is full."); return; } setAt(I, to, key); setAt(I, i, null); sfx("click"); save("Moved"); return; }
  if (act === "stash"){ if (invDeposit(key, loc, i)){ sfx("click"); toast("Sent to your Stash."); save("Sent to your Stash"); } return; }
  if (act === "salvage"){ const w = invWeapon(key); if (!w) return;
    if (tierIdx(w.r) >= 3 && I.opt.cfmRare && !((invArm[key] || 0) > Date.now())){ invArm[key] = Date.now() + 4000; invItemCtx(key, loc, i, +c.dataset.x, +c.dataset.y); return; }
    delete invArm[key]; if (loc === "o") I.over.splice(+i, 1); const m = invSalvageW(w); floatText("+" + fmtMeat(m) + " 🍖"); sfx("coin"); save("Salvaged"); return; } });
document.addEventListener("keydown", e => { if (e.key === "Escape"){ invCtxClose(); invTipHide(); if (INV_REN){ INV_REN = ""; render(); } } });
function invRenameDone(q){ if (!INV_REN) return; const I = invState(), b = I.B[q.dataset.invname]; INV_REN = ""; if (b){ b.name = q.value.trim().slice(0, 24); save("Bag renamed"); } else render(); }
document.addEventListener("keydown", e => { const q = e.target.closest && e.target.closest("input[data-invname]"); if (q && e.key === "Enter"){ e.preventDefault(); invRenameDone(q); } }, true);
document.addEventListener("focusout", e => { const q = e.target.closest && e.target.closest("input[data-invname]"); if (q && INV_REN === q.dataset.invname) invRenameDone(q); });
document.addEventListener("input", e => { const q = e.target.closest && e.target.closest("[data-invq]"); if (!q) return; INVQ = q.value.trim();
  document.querySelectorAll(".islot.full[data-ik]").forEach(s => { if (s.dataset.iloc === "s") return; const it = invInfo(s.dataset.ik); s.classList.toggle("dim", !!INVQ && !!it && !it.hay.includes(INVQ.toLowerCase())); }); });
document.addEventListener("click", e => { const cb = e.target.closest && e.target.closest("[data-bcol]"); if (!cb) return; const b = invState().B[cb.dataset.bid]; if (!b) return; b.cfg.col = cb.dataset.bcol; save("Bag colour", true); render(); });
document.addEventListener("change", e => { const t = e.target;
  const bc = t.closest && t.closest("[data-bcfg]");
  if (bc){ const I = invState(), b = I.B[bc.dataset.bid]; if (!b) return; const c = b.cfg, f = bc.dataset.bcfg, v = bc.dataset.v;
    if (f === "pull"){ if (v === "any") c.pull = []; else if (v === "none") c.pull = bc.checked ? ["none"] : []; else { c.pull = c.pull.filter(x => x !== "none"); c.pull = bc.checked ? [...new Set(c.pull.concat(v))] : c.pull.filter(x => x !== v); } }
    if (f === "rar"){ if (v === "all") c.rar = []; else c.rar = bc.checked ? [...new Set(c.rar.concat(v))] : c.rar.filter(x => x !== v); }
    if (f === "sort") c.sort = bc.value;
    if (f === "prot") c.prot = bc.checked;
    if (f === "lock") c.lock = bc.checked;
    save("Bag settings saved", true); render(); return; }
  const o = t.closest && t.closest("[data-invopt]"); if (!o) return; const I = invState(), O = I.opt, k = o.dataset.invopt;
  if (k === "salv"){ invSetSalvLevel(+o.value); save(+o.value ? "Auto-salvage set" : "Auto-salvage off", true); }
  else if (k === "sort" || k === "cmp") O[k] = o.value;
  else if (k === "overpop") I.overPop = o.checked;
  else if (k === "newOn"){ O.newOn = o.checked; if (!o.checked) I.newK = {}; }
  else O[k] = o.checked;
  save("Inventory settings saved", true); render(); });

