/* ===== Halloween hub: Spooky Path, Trick-or-Treat, Costumes ===== */
function hwState(){ const H = huntState(), d = {claimed:{}, cos:{}, wearing:"", knockDay:"", knocks:0, bonusKnocks:0, trickUntil:0, aura:false}; H.hw = H.hw || {}; for (const k in d) if (H.hw[k] === undefined) H.hw[k] = d[k]; return H.hw; }
const TRICKS = [["👻","A ghost swiped some candy! (−40 candy)", W => addEvCur(-40)], ["🦇","Bats burst out! More creatures swarm in for 5 minutes (more candy!)", W => { const S = baitState(); S.acts[1] = Math.max(S.acts[1]||0, Date.now()) + 5*60000; }],
  ["🎭","TRICKED! Your dingo is stuck in a Ghost Sheet for 30 minutes", W => { W.trickUntil = Date.now() + 30*60000; }], ["🧻","The house TP'd your den! Nothing lost, just your pride 😄", W => {}]];
function wearingCostume(){ const W = state.hunt && state.hunt.hw; if (!W) return ""; if (W.trickUntil > Date.now()) return "ghost"; return W.wearing || ""; }
function baitSection(){
  const S = baitState(), E = gameEvent(), act = baitActive(), bvv = baitVal(), cur = E ? E.cur : {icon:"🍖", name:"meats"}, have = E ? evCur() : huntState().meats;
  return `<div class="forge" style="border-color:#86b894"><h3 class="pack-h" style="margin-top:0">🪤 Bait</h3>
    <p class="small">Craft bait to lure more creatures at once. Stronger bait brings them faster and lets more crowd in. It lasts a while, then wears off, so save it for when you're watching the fight.${act.length ? ` <b>Active: ${act.map(i => esc(baitName(i)) + " (" + Math.ceil((S.acts[i] - Date.now())/60000) + " min)").join(", ")}. Up to ${bvv.max} creatures at ${bvv.rate.toFixed(1)}× speed.</b>` : ""} Different baits stack!${bloodMoon() ? " 🩸 <b>Blood Moon active!</b>" : ""}</p>
    ${BAITS.map((b,i) => `<div class="forge-row"><span>${emoImg(baitIcon(i))} <b>${esc(baitName(i))}</b> <span class="small">up to ${b.max} creatures, ${b.rate}× spawns, ${b.min} min · you have ${S.inv[i]||0}</span></span><span class="btns"><button data-a="bait-craft" data-id="${i}" ${have < baitCost(i) ? "disabled" : ""}>Craft · ${emoImg(cur.icon)} ${E ? baitCost(i) : fmtMeat(baitCost(i))}</button><button class="go" data-a="bait-use" data-id="${i}" ${(S.inv[i]||0) < 1 ? "disabled" : ""}>Use</button></span></div>`).join("")}
  </div>`;
}

function pupLevel(p){ return p.r === "huge" ? Math.min(50, Math.floor(Math.sqrt((p.xp||0) / 6))) : 0; }
function pupXpNext(p){ const l = pupLevel(p); return l >= 50 ? null : (l+1)*(l+1)*6; }
function packGameSection(){
  const K = packState(), H = huntState(), lvl = playerLevel(), slots = packSlots(), eq = new Set(K.equipped), view = K.view || "hatch", Z = zone();
  const allKeys = Object.keys(PUPS), found = allKeys.filter(k => K.index[k]).length;
  const tabs = [["hatch","🧺 Rescue"],["pack","🐕 My pack"],["fuse","✨ Fuse"],["sanct","🏡 Sanctuary"],["index","📖 Index"]].map(([k,l]) => `<button class="subtab${view === k ? " on" : ""}" data-a="pack-view" data-id="${k}">${l}</button>`).join("");
  const party = `<div class="party">${Array.from({length:slots}, (_,i) => { const p = K.pups.find(x => x.id === K.equipped[i]); return p ? `<button class="pslot on" data-a="pup-open" data-id="${p.id}" style="--pc:${PUP_R[p.r].col}"><span class="pbig">${pupArt(p, true)}</span><b>${esc(p.nick || pupName(p))}</b><span class="small">${p.r === "huge" ? "Lv " + pupLevel(p) + " · " : ""}${fmtMeat(pupDps(p))} dps</span></button>` : `<div class="pslot empty"><span class="small">Empty spot</span></div>`; }).join("")}</div>`;
  let body = "";
  if (view === "hatch"){
    const hatchable = new Set(basketList().map(b => b.id)), ev = gameEvent(), all = BASKETS.filter(b => !SHELVED.zones.includes(b.zone || Object.keys(ZONES).find(z => ZONES[z].basket === b.id) || "meadow")).concat(ev && Z.home ? [Object.assign({lvl:1, mult:3, ev:ev.id, cur:ev.cur, zone:"meadow"}, ev.basket)] : []);
    body = `${ev && Z.home ? `<div class="event-banner" style="border-color:${ev.color}">${emoImg(ev.icon)} <b>${ev.name} in the Meadow!</b> The Meadow's basket is the ${esc(ev.basket.name)} this month. Travel to other areas to rescue their baskets.</div>` : ""}
      <div class="baskets">${all.map(b => { const bz = b.zone || Object.keys(ZONES).find(z => ZONES[z].basket === b.id) || "meadow", locked = lvl < b.lvl, here = hatchable.has(b.id), tot = b.pool.reduce((a,x) => a + x[2], 0), bal = b.ev ? evCur() : H.meats, ci = b.ev ? b.cur.icon : "🍖";
        return `<div class="basket${locked ? " locked" : ""}${here ? " here" : ""}"><span class="bk-icon">${emoImg(b.icon)}</span><b>${esc(b.name)}</b><span class="small">${emoImg(ZONES[bz].icon)} ${esc(ZONES[bz].name)} · ${emoImg(ci)} ${b.ev ? b.cost : fmtMeat(b.cost)} each</span>
          <div class="bk-pool">${b.pool.map(([k,r,w]) => `<span title="${esc(PUPS[k].name)}" class="${K.index[k] ? "" : "sil"}">${artHtml(PUPS[k].art)}<i style="color:${PUP_R[r].col}">${(100*w/tot).toFixed(w/tot < .001 ? 2 : w/tot < .01 ? 1 : 0)}%</i></span>`).join("")}</div>
          ${locked ? `<span class="small">🔒 Unlocks at level ${b.lvl}</span>` : !here ? `<button data-a="travel" data-id="${bz}">🗺️ Travel to ${esc(ZONES[bz].name)} to rescue</button>` : `<div class="btns"><button class="go" data-a="hatch" data-id="${b.id}:1" ${bal < b.cost ? "disabled" : ""}>Rescue</button><button data-a="hatch" data-id="${b.id}:3" ${bal < b.cost*3 ? "disabled" : ""}>×3</button><button data-a="hatch" data-id="${b.id}:10" ${bal < b.cost*10 ? "disabled" : ""}>×10</button><button data-a="hatch" data-id="${b.id}:20" ${bal < b.cost*20 ? "disabled" : ""}>×20</button>${K.autoHatch && K.autoHatch.b === b.id ? `<button data-a="autohatch-stop">⏹ Stop auto</button>` : `<button data-a="autohatch" data-id="${b.id}" ${bal < b.cost ? "disabled" : ""}>▶ Auto</button>`}</div>`}</div>`; }).join("")}</div>
      <p class="small">Auto-rescue batch: <select data-autohatchn aria-label="Pups per auto-rescue">${[1,3,10,20].map(n => `<option value="${n}" ${((K.autoHatchN)||3) === n ? "selected" : ""}>${n}</option>`).join("")}</select></p>`;
  }
  if (view === "pack"){
    const sort = K.sort || "power", filt = K.filt || "all";
    let list = K.pups.slice(); if (filt !== "all") list = list.filter(p => filt === "fancy" ? (p.v||0) > 0 : p.r === filt);
    list.sort((a,b) => (eq.has(b.id) - eq.has(a.id)) || (sort === "power" ? pupDps(b) - pupDps(a) : sort === "level" ? pupLevel(b) - pupLevel(a) : sort === "rarity" ? Object.keys(PUP_R).indexOf(b.r) - Object.keys(PUP_R).indexOf(a.r) : 0));
    const sel = K.sel && K.pups.find(p => p.id === K.sel);
    body = `<div class="pctrl"><label class="small">Sort <select data-pupsort>${[["power","Power"],["level","Level"],["rarity","Rarity"],["new","Newest"]].map(([k,l]) => `<option value="${k}" ${sort === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
        <label class="small">Show <select data-pupfilt>${[["all","All pups"],["fancy","Golden and up"]].concat(Object.entries(PUP_R).map(([k,r]) => [k, r.label])).map(([k,l]) => `<option value="${k}" ${filt === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
        <button data-a="pack-auto">${K.autoEquip ? "✓ " : ""}Auto-equip best</button><span class="small">${K.pups.length} pups</span></div>
      ${sel ? pupDetail(sel, eq.has(sel.id), slots, K) : ""}
      <p class="small">🐾 ${K.pups.length} / ${PCAP} pups <label style="margin-left:10px"><input type="checkbox" data-autofusefull ${K.autoFuseFull !== false ? "checked" : ""}> Auto-fuse when the pack fills</label></p>
      ${pager("ppage", list.length, 48)}<div class="pgrid">${list.length ? list.slice((K.ppage||0)*48, (K.ppage||0)*48 + 48).map(p => { const R = PUP_R[p.r], on = eq.has(p.id);
        return `<button class="pcard${on ? " on" : ""}${K.sel === p.id ? " sel" : ""}" data-a="pup-open" data-id="${p.id}" style="--pc:${R.col}">${on ? `<span class="pheart">❤</span>` : ""}<span class="pbig">${pupArt(p, true)}</span><b>${esc(p.nick || pupName(p))}</b><span class="small" style="color:${R.col}">${R.label}${p.v ? " · " + VARIANT[p.v].n.trim() : ""}</span><span class="small">${p.r === "huge" ? "Lv " + pupLevel(p) + " · " : ""}${fmtMeat(pupDps(p))} dps</span></button>`; }).join("") : `<p class="small">No pups here yet.</p>`}</div>`;
  }
  if (view === "fuse"){
    body = `<div class="forge" style="border-color:#e3b23c"><p class="small" style="margin-top:0">5 of the same pup make 1 <b>Golden</b> (×1.5). 5 of the same Golden make 1 <b>Rainbow</b> (×3). Uses your weakest unequipped copies first, and the new pup keeps the highest level.</p>
      ${[0,1].map(v => fuseGroups(v).map(([k,a]) => `<div class="forge-row"><span>${artHtml(PUPS[k].art)} <b>${VARIANT[v].n}${esc(PUPS[k].name)}</b> <span class="small">(${a.length} owned)</span></span><button class="go" data-a="fuse" data-id="${k}:${v}">Make ${v ? "Rainbow" : "Golden"}</button></div>`).join("")).join("") || `<p class="small">Collect 5 of the same pup to start fusing.</p>`}
      <div class="btns" style="margin-top:8px"><button class="go" data-a="fuse-all">✨ Fuse everything</button></div></div>`;
  }
  if (view === "sanct") body = sanctuarySection();

  if (view === "index") body = `<p class="small">${found} of ${allKeys.length} pups discovered.</p><div class="pgrid">${allKeys.map(k => `<div class="pcard idx${K.index[k] ? "" : " unk2"}"><span class="pbig">${artHtml(PUPS[k].art, true)}</span><b>${K.index[k] ? esc(PUPS[k].name) : "???"}</b></div>`).join("")}</div>`;
  return `<section class="box" aria-labelledby="pack-h">
    <div class="jar-top"><h2 id="pack-h">🐕 The Pack</h2><span class="small">${K.hatched.toLocaleString()} rescued · Index ${found}/${allKeys.length}</span></div>
    <div class="wallet">
      <div><span class="small">Meats</span><b id="pack-meats">${emoImg("🍖")} ${fmtMeat(H.meats)}</b><span class="small">${emoImg(Z.icon)} In ${esc(Z.name)}</span></div>
      <div><span class="small">Pack power</span><b>${fmtMeat(packDps())} dps</b><span class="small">${K.equipped.length}/${slots} following</span></div>
      <div><span class="small">Meat bonus</span><b>+${Math.round(packBonus())}%</b><span class="small">From your pack</span></div>
    </div>
    <h3 class="pack-h" style="margin-top:4px">Following your dingo</h3>${party}
    <div class="subtabs">${tabs}</div>
    ${body}
  </section>`;
}
function pupDetail(p, on, slots, K){ const R = PUP_R[p.r], nx = pupXpNext(p), lv = pupLevel(p), prevXp = lv*lv*6;
  return `<div class="pdetail" style="--pc:${R.col}"><span class="pbig xl">${pupArt(p, true)}</span><div class="dk-main"><b style="font-size:1.2rem">${esc(p.nick || pupName(p))}</b>${p.nick ? `<span class="small">${esc(pupName(p))}</span>` : ""}<span class="small" style="color:${R.col}">${R.label}${p.v ? " · " + VARIANT[p.v].n.trim() : ""}</span>
    ${p.r === "huge" ? `<span class="small">Level ${lv}${nx ? ` · ${(p.xp||0) - prevXp} / ${nx - prevXp} XP to the next level` : " · Max level!"}</span>${nx ? `<span class="umeter"><i style="width:${Math.round(100*((p.xp||0)-prevXp)/(nx-prevXp))}%"></i></span>` : ""}` : ""}
    <span class="small"><b>${fmtMeat(pupDps(p))}</b> dps · <b>+${pupBonus(p)}%</b> meats · worth ✨ ${coinsFmt(pupSpirit(p))} spirit</span>
    <span class="small">${p.r === "huge" ? "HUGE pups grow by fighting beside you (+5% power per level, up to 50) and open gem sockets at levels 5, 15, 30, and 50." : "Only HUGE pups grow in level and hold gems."}</span><form class="add" data-f="pup-name" style="margin:6px 0 0"><input type="hidden" name="id" value="${p.id}"><input type="text" name="nick" maxlength="20" value="${esc(p.nick || "")}" placeholder="Give them a name" aria-label="Pup name"><button type="submit">✏️ Name</button></form></div>
    <div class="btns"><button class="go" data-a="pup-eq" data-id="${p.id}" ${!on && K.equipped.length >= slots ? "disabled" : ""}>${on ? "Let them rest" : "Follow me!"}</button>${on ? "" : `<button data-a="pup-release" data-id="${p.id}">🏡 Send to the Sanctuary (✨ ${coinsFmt(pupSpirit(p))})</button><button data-a="vin" data-id="p:${p.id}">🔐 Send to vault</button>`}<button data-a="pup-open" data-id="${p.id}">Close</button></div>${hugeSockets(p)}</div>`; }

function wEvLabel(w){ return !w.ev ? "" : (w.ev.startsWith("hw") || w.ev === "pmoon") ? "Halloween 2026" : "Holiday 2026"; }
const SCRAP_DUST = {epic:1, legendary:3, godly:8, mythic:20, titan:60};
function scrapList(){ const H = huntState(), eq = new Set(H.equipped); if (!H.scrR) return []; const keep = parseInt(H.scrKeep || "3", 10), seen = 0;
  const pool = H.weapons.filter(w => w.r === H.scrR && !eq.has(w.id) && !w.lock && (H.scrEv || !w.ev) && (H.scrForged || !(w.o && w.o !== w.r))).sort((a,b) => wDps(b) - wDps(a));
  return pool.slice(keep); }
function weaponTile(w, on, sel){ const R = W_RARITY.find(r => r.k === w.r);
  return `<button type="button" class="wt${sel ? " sel" : ""}" data-a="w-open" data-id="${w.id}" style="--rc:${R.col}" title="${esc(w.name)} · ${R.label} · ${fmtMeat(wDps(w))} dps">${wImg(w, "still")}<span class="d">${fmtMeat(wDps(w))}</span>${w.lock ? `<span class="lk" aria-label="Locked">●</span>` : ""}${on ? `<span class="eqm" aria-label="Equipped"></span>` : ""}</button>`; }
function weaponCard(w, on, sel){ const R = W_RARITY.find(r => r.k === w.r);
  return `<button class="wcard${on ? " on" : ""}${sel ? " sel" : ""}" data-a="w-open" data-id="${w.id}" style="--wc:${R.col}">${w.lock ? `<span class="wlock">🔒</span>` : ""}${on ? `<span class="pheart">⚔</span>` : ""}<span class="wbig">${wImg(w, "card")}</span><b>${esc(w.name)}</b><span class="small" style="color:${R.col}">${R.label}</span><span class="small">${fmtMeat(wDps(w))} dps</span>${wTagHtml(w)}</button>`; }
function weaponDetail(w, on, H){ const R = W_RARITY.find(r => r.k === w.r), C = WCLASS[wClass(w)], base = w.code ? SMITHY.baseOf(w.code) : "", sg = w.sig && SIGNATURES.find(s => s[0] === w.sig);
  const from = [w.from ? "Dropped by " + w.from : w.trophy ? "Trophy" : "", w.zone && ZONES[w.zone] ? ZONES[w.zone].name : "", w.found ? new Date(w.found).toLocaleDateString("en-US", {month:"short", day:"numeric"}) : ""].filter(Boolean).join(" · ");
  return `<div class="icard${tierIdx(w.r) >= 4 ? " foil" : ""}" style="--pc:${R.col}"><span class="ic-art">${wImg(w, "full")}</span>
    <div><div class="ic-name">${esc(w.name)}</div><div class="ic-base">${R.label}${base ? " " + esc(base) : ""} · ${emoImg(C.i)} ${esc(C.n)}${wEvLabel(w) ? " · " + wEvLabel(w) : ""}</div></div>
    <div class="ic-dps"><b>${fmtMeat(wDps(w))}</b> dps <span class="small" style="color:#b9c2bc">${fmtMeat(w.dmg)} per hit × ${w.spd}/s</span></div>
    <div class="ic-rule"></div>
    <div class="ic-body"><span class="ic-cls">${esc(C.d)}.</span>
      ${(w.traits||[]).map(t => `<span class="ic-aff">${emoImg(WTRAITS[t].i)} ${esc(WTRAITS[t].n)}: ${esc(WTRAITS[t].d)}</span>`).join("")}
      ${sg ? `<span class="ic-sig">✦ ${esc(sg[1])}: ${esc(sg[2])}</span>` : ""}
      ${w.o && w.o !== w.r ? `<span class="small" style="color:#8f9a94">Forged from ${esc(W_RARITY.find(r => r.k === w.o).label)}</span>` : ""}
      ${from ? `<span class="ic-from">${esc(from)}</span>` : ""}
      <span class="small" style="color:#8f9a94">Scraps for ${fmtMeat(sellValue(w))} meats${SCRAP_DUST[w.r] ? " + " + SCRAP_DUST[w.r] + " 💠" : ""}</span></div>
    <div class="btns"><button class="go" data-a="w-eq" data-id="${w.id}" ${!on && H.equipped.length >= 5 ? "disabled" : ""}>${on ? "Unequip" : "Equip"}</button><button data-a="w-lock" data-id="${w.id}">${w.lock ? "🔓 Unlock" : "🔒 Lock (protect)"}</button>${on || w.lock ? "" : `<button data-a="w-sell" data-id="${w.id}">Scrap</button>`}<button data-a="w-open" data-id="${w.id}">Close</button></div></div>`; }
function huntSection(){
  const H = huntState(), S = shopState(), eq = new Set(H.equipped), dps = dingoDps(), hp = enemyHP(false), ttk = hp / Math.max(0.1, dps), v = ["hunt","bait"].includes(H.view) && isUnlocked("hunt-" + H.view) ? H.view : "hunt";
  const tabs = [["hunt","🌲 Hunt"],["bait","🪤 Bait"]].filter(([k]) => isUnlocked("hunt-" + k)).map(([k,l]) => `<button class="subtab${v === k ? " on" : ""}" data-a="hunt-view" data-id="${k}">${l}</button>`).join("");
  const party = `<div class="party wparty">${Array.from({length:5}, (_,i) => { const w = H.weapons.find(x => x.id === H.equipped[i]); return w ? weaponCard(w, true, H.wsel === w.id) : `<div class="pslot empty"><span class="small">Empty slot</span></div>`; }).join("")}</div>`;
  let body = "";
  if (v === "hunt") body = `${gameEvent() ? `<div class="event-banner" style="border-color:${gameEvent().color};margin-bottom:10px">${emoImg(gameEvent().icon)} <b>${gameEvent().name} Hunt!</b> The Meadow is full of ${gameEvent().name} creatures that drop ${gameEvent().cur.name.toLowerCase()} ${emoImg(gameEvent().cur.icon)}, and they drop ${gameEvent().name}-exclusive weapons.</div>` : ""}
    ${mapSection()}
    <div class="todrow">${emoImg(TOD[tod()].icon)} <b>${TOD[tod()].name}</b> <span class="small">${zone().home ? esc(TOD[tod()].bonus) + ". Different creatures come out at dawn, daytime, dusk, and night." : "Time of day and events only change the Meadow. " + esc(zone().name) + " always looks and hunts the same."}</span>
      <label class="small">Time: <select data-tod aria-label="Time of day">${[["","Follow my clock"]].concat(Object.entries(TOD).map(([k,x]) => [k, x.name])).map(([k,n]) => `<option value="${k}" ${((H.todOverride||"") === k) ? "selected" : ""}>${n}</option>`).join("")}</select></label></div>
    ${(H.itemLog||[]).length ? `<details><summary>📜 History (${H.itemLog.length})</summary><ul class="rows">${H.itemLog.map(l => `<li><span class="name">${esc(l.text)}<small>${esc(new Date(l.t).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}))}</small></span></li>`).join("")}</ul></details>` : ""}`;
  if (v === "armory"){ const sort = H.wsort || "power", filt = H.wfilt || "all"; let inv = H.weapons.filter(w => !eq.has(w.id)); if (filt !== "all") inv = inv.filter(w => filt === "locked" ? w.lock : w.r === filt);
    inv.sort((a,b) => sort === "power" ? wDps(b) - wDps(a) : sort === "rarity" ? tierIdx(b.r) - tierIdx(a.r) || wDps(b) - wDps(a) : sort === "speed" ? b.spd - a.spd : (b.found||0) - (a.found||0)); const sel = H.wsel && H.weapons.find(w => w.id === H.wsel);
    const slots = Array.from({length:5}, (_,i) => { const w = H.weapons.find(x => x.id === H.equipped[i]); return w ? weaponTile(w, true, H.wsel === w.id) : `<span class="wt empty" title="Empty slot"></span>`; }).join("");
    const pg = H.wpage || 0, per = 48;
    body = `<div class="arm">
      <div class="arm-top"><div><div class="lbl">Equipped · ${H.equipped.length}/5</div><div class="arm-slots">${slots}</div></div>
        <div class="arm-tools"><button type="button" class="tg${H.autoEquip ? " on" : ""}" data-a="w-autoeq">Auto-equip best</button><button type="button" class="tg${H.autoSalvage !== false ? " on" : ""}" data-a="w-salvage">Auto-salvage weaker drops</button></div></div>
      <div class="arm-main"><div class="arm-bag">
        <div class="arm-filter"><label>Sort <select data-wsort>${[["power","Power"],["rarity","Rarity"],["speed","Speed"],["new","Newest"]].map(([k,l]) => `<option value="${k}" ${sort === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
          <label>Show <select data-wfilt>${[["all","All weapons"],["locked","Locked"]].concat(W_RARITY.filter(r => r.k !== "junk" || H.weapons.some(w => w.r === "junk")).map(r => [r.k, r.label])).map(([k,l]) => `<option value="${k}" ${filt === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
          <span class="arm-count">${H.weapons.length} / ${WCAP}</span></div>
        <div class="arm-grid">${inv.slice(pg*per, pg*per + per).map(w => weaponTile(w, false, H.wsel === w.id)).join("") || `<p class="small">Nothing here yet. Weapons drop from creatures out in the wild.</p>`}</div>
        ${pager("wpage", inv.length, per)}</div>
        <div class="arm-card">${sel ? weaponDetail(sel, eq.has(sel.id), H) : `<div class="arm-empty">Pick a weapon to see its card.</div>`}</div></div>
      <p class="arm-foot">${(H.drops||0).toLocaleString()} found${H.salvaged ? ` · ${H.salvaged.toLocaleString()} salvaged into meat` : ""} · Epic or better within ${PITY - (H.pity||0)} drops · When the bag is full, your weakest unlocked Common or Uncommon becomes meat.</p></div>`; }
  if (v === "bait") body = baitSection();
  if (v === "best") body = bestiaryBody();
  if (v === "scrap"){ const list = scrapList(), meat = list.reduce((a,w) => a + sellValue(w), 0), dust = list.reduce((a,w) => a + (SCRAP_DUST[w.r]||0), 0);
    body = `<div class="forge" style="border-color:#8a8f93"><h3 class="pack-h" style="margin-top:0">🗑️ The Scrapyard</h3><p class="small">Break down weapons you don't need into meats. Epic and better also leave <b>Arcane Dust</b> 💠. Equipped and 🔒 locked weapons are always safe.</p>
      <div class="autorow"><select data-scrr aria-label="Rarity">${[["","Pick a rarity…"]].concat(W_RARITY.map(r => [r.k, r.label])).map(([k,l]) => `<option value="${k}" ${(H.scrR||"") === k ? "selected" : ""}>${l}</option>`).join("")}</select>
        <select data-scrkeep aria-label="How many to keep">${[["0","Keep none"],["3","Keep my best 3"],["5","Keep my best 5"],["10","Keep my best 10"]].map(([k,l]) => `<option value="${k}" ${(H.scrKeep||"3") === k ? "selected" : ""}>${l}</option>`).join("")}</select>
        <label class="small"><input type="checkbox" data-scrforged ${H.scrForged ? "checked" : ""}> Include forged</label><label class="small"><input type="checkbox" data-screv ${H.scrEv ? "checked" : ""}> Include event weapons</label></div>
      ${H.scrR ? `<p class="small">That's <b>${list.length}</b> weapon${list.length === 1 ? "" : "s"}, worth <b>${fmtMeat(meat)}</b> meats${dust ? " and <b>" + dust + "</b> 💠" : ""}.</p><button class="go" data-a="scrap-go" ${list.length ? "" : "disabled"}>🗑️ Scrap ${list.length}</button>` : `<p class="small">Pick a rarity to see what would be scrapped.</p>`}</div>`; }
  return `<section class="box" aria-labelledby="hunt-h">
    <div class="jar-top"><h2 id="hunt-h">${v === "armory" ? "Armory" : v === "scrap" ? "Scrapyard" : v === "bait" ? "Bait" : "Dingo Hunt"}</h2><span class="small" id="hunt-kills">Level ${playerLevel()} woods · ${H.kills.toLocaleString()} kills</span></div>
    ${v === "hunt" ? `<div class="wallet">
      <div><span class="small">Meats</span><b id="hunt-meats">${emoImg("🍖")} ${fmtMeat(H.meats)}</b><span class="small">${emoImg(zone().icon)} ${esc(zone().name)}</span></div>
      <div><span class="small">Dingo power</span><b>${fmtMeat(dps)} dps</b><span class="small">~${ttk < 1 ? "<1" : Math.round(ttk)}s per creature · drops at <b>${Math.round(dropMult(hp)*100)}%</b>${dropMult(hp) < 0.6 ? " (level up for bigger drops!)" : ""}</span></div>
      <div><span class="small">Coins</span><b id="hunt-coins">${emoImg("🪙")} ${coinsFmt(S.coins)}</b><span class="small" id="hunt-best">Best drop: ${fmtMeat(H.bestDrop)} meats</span></div>
    </div>` : ""}
    <div class="subtabs">${tabs}</div>
    ${body}
  </section>`;
}

