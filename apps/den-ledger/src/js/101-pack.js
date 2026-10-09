/* ===== The Pack: pup companions (rescue, fuse, follow, fight) ===== */
const PUP_R = {common:{label:"Common", col:"#b8c4bb", m:.3, bonus:2}, uncommon:{label:"Uncommon", col:"#4f8fb8", m:.5, bonus:4}, rare:{label:"Rare", col:"#a77bd6", m:.8, bonus:7}, epic:{label:"Epic", col:"#e8741c", m:1.3, bonus:12}, legendary:{label:"Legendary", col:"#e3b23c", m:2.2, bonus:20}, huge:{label:"HUGE", col:"#ff4fd8", m:6, bonus:50}};
const PUPS = {
  mutt:{name:"Mutt", art:"🐕"}, goodpup:{name:"Good Pup", art:"🐶"}, poodle:{name:"Poodle", art:"🐩"}, guide:{name:"Guide Pup", art:"🦮"}, service:{name:"Service Pup", art:"🐕‍🦺"}, hugemutt:{name:"Huge Mutt", art:"🐕"},
  foxkit:{name:"Fox Kit", art:"🦊"}, wolfpup:{name:"Wolf Pup", art:"🐺"}, coyote:{name:"Coyote Pup", art:{e:"🐺", f:"sepia(.9) saturate(1.4)"}}, arctic:{name:"Arctic Fox Kit", art:{e:"🦊", f:"grayscale(1) brightness(1.7)"}}, husky:{name:"Husky Pup", art:{e:"🐶", f:"grayscale(1) contrast(1.3)"}}, hugewolf:{name:"Huge Wolf", art:"🐺"},
  moonshiba:{name:"Moon Shiba", art:{e:"🐶", o:"🌙"}}, dhole:{name:"Dhole Pup", art:{e:"🐺", f:"sepia(1) saturate(4) hue-rotate(-15deg)"}}, fennec:{name:"Fennec Kit", art:{e:"🦊", o:"📡"}}, maned:{name:"Maned Wolf Pup", art:{e:"🦊", o:"🦒"}}, dingopup:{name:"Dingo Pup", art:{custom:"dingo"}}, hugedingo:{name:"Huge Dingo", art:{custom:"golden"}}
};
const BASKETS = [
  {id:"meadow", name:"Meadow Basket", icon:"🧺", lvl:1, cost:50000, mult:1, pool:[["mutt","common",45],["goodpup","common",30],["poodle","uncommon",15],["guide","rare",7],["service","epic",2.7],["hugemutt","huge",0.05]]},
  {id:"forest", name:"Forest Basket", icon:"🌲", lvl:3, cost:400000, mult:2.5, pool:[["foxkit","common",40],["wolfpup","common",30],["coyote","uncommon",18],["arctic","rare",8],["husky","epic",3.5],["hugewolf","huge",0.07]]},
  {id:"moon", name:"Moon Basket", icon:"🌙", lvl:6, cost:3000000, mult:7, pool:[["moonshiba","common",40],["dhole","uncommon",30],["fennec","rare",18],["maned","epic",9],["dingopup","legendary",2.8],["hugedingo","huge",0.03]]}
];
const VARIANT = [{n:"", x:1}, {n:"Golden ", x:1.5}, {n:"Rainbow ", x:3}, {n:"Spectral ", x:6}, {n:"Arcane ", x:9}, {n:"Transcendent ", x:14}];
function packMigrate(K){ if (K.vmig) return; K.vmig = 1; K.pups.forEach(p => { if (p.v === 4) p.v = 5; }); }
function packState(){ const d = {pups:[], equipped:[], hatched:0, index:{}, autoEquip:true}; state.pack = state.pack || {}; for (const k in d) if (state.pack[k] === undefined) state.pack[k] = d[k]; packMigrate(state.pack); return state.pack; }
function packSlots(){ const L = playerLevel(); return Math.min(6, 3 + (L >= 5 ? 1 : 0) + (L >= 10 ? 1 : 0) + (L >= 15 ? 1 : 0) + ((state.merchant && state.merchant.whistle) || 0)); }
function pupDps(p){ return p.dps * VARIANT[p.v||0].x * (1 + 0.05 * pupLevel(p)); }
function pupBonus(p){ return PUP_R[p.r].bonus * VARIANT[p.v||0].x; }
function packDps(){ const K = packState(); return K.equipped.slice(0, packSlots()).map(id => K.pups.find(p => p.id === id)).filter(Boolean).reduce((a,p) => a + pupDps(p), 0); }
function packBonus(){ const K = packState(); return K.equipped.slice(0, packSlots()).map(id => K.pups.find(p => p.id === id)).filter(Boolean).reduce((a,p) => a + pupBonus(p), 0); }
function packAutoEquip(){ const K = packState(); K.equipped = K.pups.slice().sort((a,b) => pupDps(b) - pupDps(a)).slice(0, packSlots()).map(p => p.id); }
function pupName(p){ return VARIANT[p.v||0].n + PUPS[p.key].name; }
function hatchOne(b){ const L = luckMult() * (1 + 0.1*scrollLv("litters")) * (b.ev ? 1 + 0.1*evUpg("pluck") : 1), wts = b.pool.map(e => e[2] * (e[1] === "common" ? 1 : L) * (e[1] === "huge" && tomeOn("hugehunter") ? 1.25 : 1)), tot = wts.reduce((a,x) => a + x, 0); let x = Math.random()*tot, pick = b.pool[0];
  for (let i=0;i<b.pool.length;i++){ if (x < wts[i]){ pick = b.pool[i]; break; } x -= wts[i]; }
  const fair = enemyHP(false) / (8*5), dps = Math.max(1, Math.round(fair * PUP_R[pick[1]].m * b.mult * (0.85 + Math.random()*0.3)));
  const K = packState(); K.index[pick[0]] = true; K.hatched++; return {id: uid(), key: pick[0], r: pick[1], v: 0, dps, from: b.id}; }
function basketList(){ const E = gameEvent(), Z = zone(); if (Z.home && E) return [Object.assign({lvl:1, mult:3, ev:E.id, cur:E.cur}, E.basket)]; return BASKETS.filter(b => b.id === Z.basket); }
function hatch(bid, n){ const K = packState(), H = huntState(), b = basketList().find(x => x.id === bid); if (!b || playerLevel() < b.lvl) return [];
  if (K.pups.length + n > PCAP && K.autoFuseFull !== false) fuseAll();
  const room = PCAP - K.pups.length; if (room < 1){ toast("🐾 Your pack is full (" + PCAP + " pups). Fuse some, or send a few to the Sanctuary, to make room. Nothing was lost."); return []; }
  const bal = b.ev ? evCur() : H.meats, can = Math.min(n, room, Math.floor(bal / b.cost)); if (can < 1) return []; if (b.ev) addEvCur(-can * b.cost); else H.meats -= can * b.cost; const out = [];
  for (let i=0;i<can;i++){ const p = hatchOne(b); K.pups.push(p); out.push(p); if (compOn("sage") && Math.random() < 0.1){ const tw = hatchOne(b); K.pups.push(tw); out.push(tw); } }
  if (K.autoEquip) packAutoEquip(); return out; }
function fuseGroups(v){ const K = packState(), g = {}; K.pups.filter(p => (p.v||0) === v).forEach(p => (g[p.key] = g[p.key] || []).push(p)); return Object.entries(g).filter(([k,a]) => a.length >= 5); }
function fuse(key, v){ const K = packState(), grp = K.pups.filter(p => p.key === key && (p.v||0) === v).sort((a,b) => (K.equipped.includes(a.id) - K.equipped.includes(b.id)) || (a.dps - b.dps)); if (grp.length < 5 || v >= 2) return null;
  const use = grp.slice(0,5), ids = new Set(use.map(p => p.id)), best = use.reduce((a,p) => p.dps > a.dps ? p : a, use[0]);
  const np = {id: uid(), key, r: best.r, v: v+1, dps: best.dps, from: best.from, xp: Math.max(...use.map(p => p.xp || 0)), nick: (use.find(p => p.nick) || {}).nick}; K.pups = K.pups.filter(p => !ids.has(p.id)); K.equipped = K.equipped.filter(id => !ids.has(id)); K.pups.push(np);
  if (K.autoEquip) packAutoEquip(); return np; }
function pupArt(p, big){ return `<span class="pupart v${p.v||0}${p.r === "huge" ? " huge" : ""}">${artHtml(PUPS[p.key].art, big)}</span>`; }
function showHatchFx(list, basketIcon, opts){ opts = opts || {};
  if (!list.length) return; if (calm){ toast("Rescued: " + list.map(pupName).join(", ")); return; }
  const ov = document.createElement("div"); ov.className = "roll-ov"; ov.setAttribute("role","dialog"); ov.setAttribute("aria-label","Rescuing");
  ov.innerHTML = `<div class="roll-wrap"><button class="roll-x" data-close aria-label="Close">✕</button><div class="roll-grid${list.length > 1 ? " multi" : ""}${list.length > 10 ? " many" : ""}">${list.map(p => { const R = PUP_R[p.r];
    return `<div class="rcard" style="--rc:${R.col}"><div class="rback">${emoImg(basketIcon)}</div><div class="rfront"><span class="rr">${R.label}</span><span class="ri">${pupArt(p, true)}</span><b>${esc(pupName(p))}</b><span class="small">${fmtMeat(pupDps(p))} dps · +${pupBonus(p)}% meats</span></div></div>`; }).join("")}</div><div class="btns" style="justify-content:center">${opts.auto ? autoStopBtn() : ""}<button class="go" data-close>${opts.auto ? "Skip" : "Welcome to the pack!"}</button></div></div>`; if (opts.auto) ov.classList.add("auto");
  document.body.appendChild(ov); const cards = [...ov.querySelectorAll(".rcard")], big = list.some(p => ["legendary","huge"].includes(p.r)) || list.some(p => p.v > 0);
  if (opts.auto) setTimeout(() => ov.remove(), (opts.auto ? 450 : 900) + cards.length*160 + (big ? 2800 : 1300));
  cards.forEach((c,i) => setTimeout(() => { c.classList.add("open"); const p = list[i]; sfx(["legendary","huge"].includes(p.r) || (p.v||0) > 0 ? "roll5" : "hatch"); if (opts.auto && i === cards.length-1 && !big){} if (["rare","epic","legendary","huge"].includes(p.r)){ const rb = c.getBoundingClientRect(); rollBurst(rb.left + rb.width/2, rb.top + rb.height/2, PUP_R[p.r].col, p.r === "huge" ? 36 : 14); }
    if (i === cards.length-1){ const top = list.some(p => ["legendary","huge"].includes(p.r)); sfx(top ? "level" : "chest"); if (list.some(p => p.r === "huge")){ document.body.classList.add("shake"); setTimeout(() => document.body.classList.remove("shake"), 400); toast("🎉 A HUGE pup joined your pack!"); } } }, 900 + i*160));
  ov.addEventListener("click", e => { if (e.target === ov || e.target.closest("[data-close]")) ov.remove(); });
}
/* pups in the battle scene */
const PB = {els:[]};
function syncPups(){ const K = packState(), L = battleLayer(); if (!L) return; const ids = K.equipped.slice(0, packSlots());
  PB.els = PB.els.filter(e => { if (!ids.includes(e.id)){ e.el.remove(); return false; } return true; });
  ids.forEach((id,i) => { const p = K.pups.find(x => x.id === id); if (!p) return; let e = PB.els.find(x => x.id === id);
    if (!e){ const el = document.createElement("span"); el.className = "pup v" + (p.v||0) + (p.r === "huge" ? " huge" : ""); el.innerHTML = artHtml(PUPS[p.key].art); L.appendChild(el); e = {id, el, cd: Math.random(), hop: null, x: 0, y: 0}; PB.els.push(e); }
    e.p = p; e.slot = i; }); }
function pupFrame(dt, P, fighting, inRange){
  const K = packState(); if (PB.els.length !== Math.min(packSlots(), K.equipped.length)) syncPups(); inRange = inRange || [];
  PB.els.forEach((e,i) => { const hx = P.x - 60 - i*24, hy = P.y + 10 + (i%2)*6; e.cd -= dt;
    if (e.hop){ e.hop.t += dt/0.3; const k = Math.min(1, e.hop.t);
      if (e.hop.phase === "out"){ const tx = e.hop.enemy.dead ? e.hop.tx : e.hop.enemy.x - 14; e.x = hx + (tx - hx)*k; e.y = hy - Math.sin(k*Math.PI)*26 + (e.hop.ty - hy)*k;
        if (k >= 1){ if (!e.hop.enemy.dead){ spark(e.hop.enemy.x - 10, (parseFloat(e.hop.enemy.el.style.top)||0) + 24, "#f2c9a5", false); squash(e.hop.enemy.el.querySelector(".eart"), 1.15, .88, 170); }
          hitEnemy(e.hop.enemy, Math.max(1, Math.round(pupDps(e.p) * 1.2 * dmgMult() * tomeMult("pack") * (dayIs("sun") ? 1.5 : 1) * (1 + 0.1*scrollLv("kin")) * (compOn("packbond") ? 2 : 1) * (1 + gemBonus("pup")))), false, e.hop.enemy.x - 8); e.hop.tx = tx; e.hop.phase = "back"; e.hop.t = 0; } }
      else { e.x = e.hop.tx + (hx - e.hop.tx)*k; e.y = e.hop.ty + (hy - e.hop.ty)*k - Math.sin(k*Math.PI)*16; if (k >= 1){ e.hop = null; squash(e.el.firstElementChild, 1.2, .8, 200); } } }
    else { e.x = hx; e.y = hy - (fighting ? 0 : Math.abs(Math.sin(performance.now()/180 + i))*4); if (fighting && inRange.length && e.cd <= 0 && dt > 0){ const tgt = inRange[Math.floor(Math.random()*inRange.length)]; e.cd = 1.2 * (1 - 0.05*scrollLv("kin")) / spdMult(); squash(e.el.firstElementChild, 1.25, .78, 180); e.hop = {phase:"out", t:0, tx: tgt.x - 14, ty: (parseFloat(tgt.el.style.top)||0) + 22, enemy: tgt}; } }
    e.el.style.transform = `translate(${e.x}px, ${e.y}px)`; });
}
