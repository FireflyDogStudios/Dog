/* ===== Boosts, upgrades, and seasonal event modes ===== */
const EVENTS_GAME = {};
Object.assign(PUPS, {
  moonpup:{name:"Pumpkin Moon Pup", art:{e:"🐕", o:"🌕", f:"sepia(1) saturate(3) hue-rotate(-10deg)"}}, specterpup:{name:"Specter Pup", art:{e:"🐶", o:"👻", f:"grayscale(1) brightness(1.9) drop-shadow(0 0 4px #9fe8ff)"}},
  skelepup:{name:"Skele-Pup", art:{e:"🐕", o:"🦴", f:"grayscale(1) brightness(1.8)"}}, ghostpup:{name:"Ghost Pup", art:{e:"🐶", o:"👻", f:"grayscale(1) brightness(1.9) opacity(.8)"}}, batfox:{name:"Bat-Eared Fox", art:{e:"🦊", o:"🦇"}},
  pumpup:{name:"Pumpkin Pup", art:{e:"🐶", o:"🎃"}}, werepup:{name:"Werewolf Pup", art:{e:"🐺", o:"🌕", f:"brightness(.6) saturate(.6)"}}, hugepump:{name:"Huge Pumpkin Dingo", art:{custom:"pumpdingo"}},
  snowpup:{name:"Snow Pup", art:{e:"🐶", f:"grayscale(1) brightness(1.7)"}}, cocoapup:{name:"Cocoa Pup", art:{e:"🐶", o:"☕"}}, reinpup:{name:"Reindeer Pup", art:{e:"🐕", o:"🦌"}},
  frostsky:{name:"Frosty Husky", art:{e:"🐶", o:"❄️", f:"grayscale(1) contrast(1.3)"}}, jollypup:{name:"Jolly Pup", art:{e:"🐕", o:"🎁"}}, hugejolly:{name:"Huge Jolly Dingo", art:{custom:"jolly"}}
});
function gameEvent(){ return null; }
function evCur(){ const E = gameEvent(); if (!E) return 0; const H = huntState(); H.evCur = H.evCur || {}; if (H.evBank > 0){ H.evCur[E.id] = (H.evCur[E.id]||0) + H.evBank; H.evBank = 0; } return H.evCur[E.id] || 0; }
function addEvCur(n){ const E = gameEvent(), H = huntState(); if (!E){ if (n > 0) H.evBank = (H.evBank||0) + n; return; } H.evCur = H.evCur || {}; if (H.evBank > 0){ H.evCur[E.id] = (H.evCur[E.id]||0) + H.evBank; H.evBank = 0; } H.evCur[E.id] = Math.max(0, (H.evCur[E.id]||0) + n); }
function evUpg(k){ const E = gameEvent(); if (!E) return 0; const U = state.evUpg = state.evUpg || {}; return (U[E.id] && U[E.id][k]) || 0; }
const POT_TYPES = {str:{name:"Strength Brew", icon:"⚔️", vals:[1.25,1.5,2], desc:v => "+" + Math.round((v-1)*100) + "% damage"},
  cur:{name:"Meat Magnet", icon:"🍖", vals:[1.25,1.5,2], desc:v => "+" + Math.round((v-1)*100) + "% " + (gameEvent() ? gameEvent().cur.name.toLowerCase() : "meats")},
  luck:{name:"Lucky Nose", icon:"🍀", vals:[1.5,2,3], desc:v => v + "× luck on rolls and baskets"},
  swift:{name:"Zoomies Tonic", icon:"⚡", vals:[1.15,1.3,1.6], desc:v => "+" + Math.round((v-1)*100) + "% attack speed"},
  treasure:{name:"Treasure Sniffer", icon:"💰", vals:[2,3,5], desc:v => v + "× rare coin drops"}};
const POT_MIN = [20,30,45], ROMAN = ["I","II","III"];
/* v0.45: brews, treats and buffs live in the status engine. One def per kind; strength and length ride on the instance. */
const BREW_STAT = {str:"dmg", cur:"loot", luck:"luck", swift:"spd", treasure:"coin"}, BREW_ICON = {str:"wolf-head", cur:"ham-shank", luck:"clover", swift:"sprint", treasure:"crystal-ball"};
Object.entries(POT_TYPES).forEach(([t, P]) => SE.define({id:"brew-" + t, name:P.name, icon:BREW_ICON[t] || "crystal-ball", cls:"boon", stack:"refresh", dur:1200, mods:[{stat:BREW_STAT[t], mul:P.vals[0]}], desc:P.desc(P.vals[0])}));
Object.entries(TREATS).forEach(([k, T]) => SE.define({id:"treat-" + k, name:T.n, icon:"ham-shank", cls:"boon", stack:"extend", dur:T.min * 60, mods:[], desc:T.d}));
function brewStatus(t, tier, ms){ const v = POT_TYPES[t].vals[tier], s = SE.get(DINGO, "brew-" + t), now = Date.now(); let until;
  if (s){ if (tier > (s.data ? s.data.tier : 0)) until = now + ms + Math.round((s.until - now) / 2); else until = s.until + ms; } else until = now + ms;
  const inst = SE.apply(DINGO, "brew-" + t, {dur:(until - now) / 1000, data:{tier, v}, mods:[{stat:BREW_STAT[t], mul:v}]}); inst.until = until; inst.at = inst.at || now; return inst; }
function potName(t, tier){ const E = gameEvent(); const nm = E ? E.pots[t][0] : POT_TYPES[t].name; return nm + " " + ROMAN[tier]; }
function potIcon(t){ const E = gameEvent(); return E ? E.pots[t][1] : POT_TYPES[t].icon; }
function boostState(){ const d = {inv:{}, active:{}}; state.boosts = state.boosts || {}; for (const k in d) if (state.boosts[k] === undefined) state.boosts[k] = d[k]; return state.boosts; }
function potVal(t){ if (devOn && POT_TYPES[t]) return POT_TYPES[t].vals[POT_TYPES[t].vals.length-1]; const s = SE.get(DINGO, "brew-" + t); return s && s.data ? s.data.v : 1; }
function drinkPot(t, tier){ const S = boostState(), key = t + tier; if (!(S.inv[key] > 0)) return false; S.inv[key]--; const add = POT_MIN[tier]*60000 * (1 + 0.1*scrollLv("longdays")) * (compOn("sage") ? 2 : 1); brewStatus(t, tier, add); return true; }
/* old saves: brews that were running under the old timers become statuses once */
function migrateBoosts(){ const S = boostState(); if (!S.active) return; const now = Date.now(); Object.entries(S.active).forEach(([t, a]) => { if (a && a.until > now && POT_TYPES[t] && !SE.has(DINGO, "brew-" + t)) brewStatus(t, a.tier || 0, a.until - now); }); delete S.active;
  const H = huntState(); if (H.treatOn){ Object.entries(H.treatOn).forEach(([k, u]) => { if (u > now && TREATS[k] && !SE.has(DINGO, "treat-" + k)) SE.apply(DINGO, "treat-" + k, {dur:(u - now) / 1000, data:{fx:TREATS[k].fx, v:TREATS[k].v}, mods:treatMods(k)}); }); delete H.treatOn; }
  if (H.buffs){ Object.entries(H.buffs).forEach(([k, u]) => { if (u > now && k === "nose" && !SE.has(DINGO, "sharpnose")) SE.apply(DINGO, "sharpnose", {dur:(u - now) / 1000}); }); delete H.buffs; } }
const POT_BREW = {str:{ember:3, fury:1}, cur:{hunger:3, cinder:1}, luck:{wild:3, bloom:1}, swift:{tide:3, storm:1}, treasure:{spark:3, star:1}};
function brewCost(t){ const th = dayIs("thu") ? 0.75 : 1; return Object.fromEntries(Object.entries(POT_BREW[t]).map(([a,n]) => [a, Math.max(1, Math.ceil(n*th))])); }
function canBrew(t){ return Object.entries(brewCost(t)).every(([a,n]) => ess(a) >= n); }
function potCost(){ const E = gameEvent(), th = dayIs("thu") ? 0.75 : 1; return E ? Math.round(30*th) : Math.round(enemyHP(false) * 40 * th); }
const UPGRADES = {fangs:{name:"Sharper Fangs", icon:"🦷", base:60000, desc:"+10% damage", max:10}, paws:{name:"Swift Paws", icon:"🐾", base:80000, desc:"+6% attack speed", max:10},
  appetite:{name:"Big Appetite", icon:"🍖", base:100000, desc:"+10% meats", max:10}, nose:{name:"Keen Nose", icon:"🍀", base:120000, desc:"+8% luck", max:10},
  sniffer:{name:"Coin Sniffer", icon:"🪙", base:150000, desc:"+15% rare coin chance", max:10}, camp:{name:"Cozy Campsite", icon:"🏕️", base:200000, desc:"+1h away-hunting and +5% away speed", max:8}, lure:{name:"Scent Trail", icon:"🪤", base:90000, desc:"+5% creature spawn speed", max:10}};
function upgLv(k){ return (state.upg && state.upg[k]) || 0; }
function upgCost(k){ return Math.round(UPGRADES[k].base * Math.pow(1.75, upgLv(k)) * (dayIs("thu") ? 0.75 : 1)); }
/* v0.47: every multiplier is one call into the status engine. Statuses (brews, treats, rally, feast, weakened…) carry their own mods;
   everything that isn't a status registers here as a passive. Add a source once, every stat it touches follows. */
const DEV_BUFF = {dmg:1.3 /*old "healer"*/, spd:1.3 /*"legs"*/, loot:1.25 /*"fangs"*/};
function devMult(stat){ if (!devOn) return 1; let m = stat === "dmg" ? 10000 : 1; m *= DEV_BUFF[stat] || 1;
  Object.values(TREATS).forEach(T => { if (T.fx === stat && T.fx !== "crit") m *= 1 + T.v; });
  Object.entries(POT_TYPES).forEach(([t, P]) => { if (BREW_STAT[t] === stat) m *= P.vals[P.vals.length - 1]; }); return m; }
function devAdd(stat){ if (!devOn || stat !== "crit") return 0; return .15 /*nose*/ + Object.values(TREATS).filter(T => T.fx === "crit").reduce((a, T) => Math.max(a, T.v), 0); }
const isDingo = t => t === DINGO;
SE.passive("dev", (t, stat) => isDingo(t) ? (stat === "crit" ? {add:devAdd(stat)} : devMult(stat)) : 1);
SE.passive("cozy", (t, stat) => isDingo(t) && (stat === "dmg" || stat === "loot") ? cozyMult() : 1);
SE.passive("gems", (t, stat) => isDingo(t) && ["dmg", "spd", "luck", "coin", "loot"].includes(stat) ? 1 + gemBonus(stat) : stat === "crit" && isDingo(t) ? {add:gemBonus("crit")} : 1);
SE.passive("companions", (t, stat) => { if (!isDingo(t)) return 1; let m = 1; if (["dmg", "spd", "luck", "loot"].includes(stat) && compOn("destiny")) m *= 1.5; if (stat === "spd" && compOn("night")) m *= 1.25; return m; });
SE.passive("scrolls", (t, stat) => { if (!isDingo(t)) return 1; let m = 1;
  if (stat === "dmg" || stat === "luck" || stat === "loot") m *= 1 + 0.1*scrollLv("year"); if (stat === "dmg" || stat === "loot") m *= 1 + 0.04*scrollLv("heart");
  if (stat === "spd") m *= 1 + 0.05*scrollLv("haste"); if (stat === "coin") m *= 1 + 0.15*scrollLv("fortune"); return m; });
const TOME_STAT = {dmg:"fangs", spd:"swift", luck:"fortune", coin:"coins", loot:"plenty"};
SE.passive("tomes", (t, stat) => isDingo(t) ? (TOME_STAT[stat] ? tomeMult(TOME_STAT[stat]) : stat === "crit" ? {add:tomeSum("crits")} : 1) : 1);
const UPG_STAT = {dmg:["fangs", .1], spd:["paws", .06], luck:["nose", .08], coin:["sniffer", .15]};
SE.passive("upgrades", (t, stat) => { if (!isDingo(t)) return 1; if (stat === "loot") return gameEvent() ? 1 + 0.15*evUpg("magnet") : 1 + 0.1*upgLv("appetite"); if (stat === "dmg" && gameEvent()) return (1 + 0.1*upgLv("fangs")) * (1 + 0.15*evUpg("might")); const U = UPG_STAT[stat]; return U ? 1 + U[1]*upgLv(U[0]) : 1; });
SE.passive("season", (t, stat) => isDingo(t) ? (stat === "crit" ? {add:seasonBonus("crit")} : 1 + seasonBonus(stat)) : 1);
const TOD_STAT = {spd:["day", 1.1], luck:["dusk", 1.1], loot:["dawn", 1.2]}, DAY_STAT = {luck:["sun", 2], loot:["fri", 1.5]};
SE.passive("time of day", (t, stat) => isDingo(t) && TOD_STAT[stat] && tod() === TOD_STAT[stat][0] ? TOD_STAT[stat][1] : 1);
SE.passive("day of week", (t, stat) => isDingo(t) && DAY_STAT[stat] && dayIs(DAY_STAT[stat][0]) ? DAY_STAT[stat][1] : 1);
SE.passive("weather", (t, stat) => isDingo(t) ? (stat === "crit" ? {add:wxMult("crit")} : stat === "spd" || stat === "luck" || stat === "loot" ? wxMult(stat) : 1) : 1);
SE.passive("lungs", (t, stat) => isDingo(t) && (stat === "dmg" || stat === "spd") ? lungMult(stat) : 1);
SE.passive("sleepy", (t, stat) => isDingo(t) ? (stat === "dmg" || stat === "loot" ? sleepyMult() : stat === "spd" ? Math.sqrt(sleepyMult()) : 1) : 1);
SE.passive("rest", (t, stat) => isDingo(t) && (stat === "dmg" || stat === "loot") ? restMult(stat) : 1);
SE.passive("pack", (t, stat) => isDingo(t) && stat === "loot" && state.pack ? 1 + packBonus()/100 : 1);
SE.passive("weapon", (t, stat, ctx) => isDingo(t) && stat === "crit" ? {add:0.1 + (ctx && ctx.w && hasTrait(ctx.w, "keen") ? 0.1 : 0)} : 1);
function dmgMult(){ return SE.mult(DINGO, "dmg"); }
function spdMult(){ return SE.mult(DINGO, "spd"); }
function luckMult(){ return SE.mult(DINGO, "luck"); }
function coinChanceMult(){ return SE.mult(DINGO, "coin"); }
function lootMult(){ return SE.mult(DINGO, "loot"); }
function critChance(w){ return SE.sum(DINGO, "crit", {w}); }
function checkEventEnd(){ const H = huntState(), mo = todayIso().slice(5,7); H.evCur = H.evCur || {}; H.evDone = H.evDone || {};
  Object.values(EVENTS_GAME).forEach(E => { const left = H.evCur[E.id] || 0; if (left > 0 && !H.evDone[E.id] && EVENTS_GAME[mo] !== E){ const m = left * 200; H.meats += m; H.evCur[E.id] = 0; H.evDone[E.id] = true; setTimeout(() => toast(E.icon + " " + E.name + " is over! " + left + " leftover " + E.cur.name.toLowerCase() + " became " + fmtMeat(m) + " meats."), 1500); } }); }
function apothecarySection(inner){
  const B2 = boostState(), E = gameEvent(), cur = E ? E.cur : {icon:"🍖", name:"meats"}, have = E ? evCur() : huntState().meats, cost = potCost(), now = Date.now();
  return `${inner ? `<div class="apo-in">` : `<section class="box${E ? " evbox" : ""}" aria-labelledby="apo-h" ${E ? `style="--evc:${E.color}"` : ""}>`}
    ${inner ? `<h3 class="pack-h" style="margin-top:0">🧪 ${E ? E.name + " Apothecary" : "Apothecary"}</h3>` : `<div class="jar-top"><h2 id="apo-h">🧪 ${E ? E.name + " Apothecary" : "Apothecary"}</h2><span class="small">Brewed from essences ⚗️</span></div>`}
    <p class="small" style="margin:4px 0 10px">Brew potions from your Scriptorium essences for a timed boost to your hunt. Drinking the same brew adds time, and 3 of one tier brew up into the next tier. Bosses sometimes drop them too.${E ? ` During ${E.name}, the shop only sells ${E.name} brews, paid with ${E.cur.name.toLowerCase()}.` : ""}</p>
    <div class="potgrid">${Object.keys(POT_TYPES).map(t => { const a = B2.active[t], on = a && a.until > now;
      return `<div class="pot${on?" on":""}"><span class="picon">${emoImg(potIcon(t))}</span><b>${esc(E ? E.pots[t][0] : POT_TYPES[t].name)}</b><span class="small">${esc(POT_TYPES[t].desc(POT_TYPES[t].vals[0]))} (I) up to ${esc(POT_TYPES[t].desc(POT_TYPES[t].vals[2]))} (III)</span>
        ${on ? `<span class="pactive">Active: ${ROMAN[a.tier]} · ${Math.ceil((a.until-now)/60000)} min left</span>` : ""}
        <div class="ptiers">${[0,1,2].map(tier => { const n = B2.inv[t+tier]||0; return `<div class="ptier"><span>${ROMAN[tier]} <b>×${n}</b></span><div class="btns"><button data-a="pot-drink" data-id="${t}:${tier}" ${n<1?"disabled":""}>Drink</button>${tier<2 ? `<button data-a="pot-up" data-id="${t}:${tier}" ${n<3?"disabled":""} title="Brew 3 into 1 of the next tier">3→${ROMAN[tier+1]}</button>` : ""}</div></div>`; }).join("")}</div>
        <span class="small brewc">${Object.entries(brewCost(t)).map(([a,n]) => `<span class="ing ${ess(a) >= n ? "ok" : "short"}">${aspChip(a)}<i class="cnt">${ess(a)}/${n}</i></span>`).join(" ")}</span><button class="go" data-a="pot-buy" data-id="${t}" ${canBrew(t) ? "" : "disabled"}>⚗️ Brew ${ROMAN[0]}</button></div>`; }).join("")}</div>
  ${inner ? "</div>" : "</section>"}`;
}
function upgradesSection(){
  const E = gameEvent(), H = huntState();
  const evRows = E ? Object.entries(E.upg).map(([k,[nm,ic,ds]]) => { const lv = evUpg(k), c = 200 * Math.pow(2, lv), mx = lv >= 5;
    return `<div class="upg"><span class="picon">${emoImg(ic)}</span><span class="un"><b>${esc(nm)} ${"★".repeat(lv)}${"☆".repeat(5-lv)}</b><span class="small">${esc(ds)} per level · ${E.name} only</span></span><button class="go" data-a="evupg" data-id="${k}" ${mx || evCur() < c ? "disabled" : ""}>${mx ? "Maxed" : emoImg(E.cur.icon) + " " + c}</button></div>`; }).join("") : "";
  return `<section class="box" aria-labelledby="upg-h">
    <div class="jar-top"><h2 id="upg-h">⬆️ Den Upgrades</h2><span class="small">${emoImg("🍖")} ${fmtMeat(H.meats)} meats</span></div>
    ${E ? `<div class="event-banner" style="border-color:${E.color}">${emoImg(E.icon)} <b>${E.name} upgrades</b> power you up during the event. They reset when ${E.name} ends. <div style="margin-top:8px">${evRows}</div></div>` : ""}
    <p class="small" style="margin:10px 0">Permanent upgrades paid with meats. Each level costs more, so pick what helps your hunt most.${E ? " Meat upgrades still work during events, but meats only drop outside events." : ""}</p>
    ${Object.entries(UPGRADES).map(([k,u]) => { const lv = upgLv(k), c = upgCost(k), mx = lv >= u.max;
      return `<div class="upg"><span class="picon">${emoImg(u.icon)}</span><span class="un"><b>${esc(u.name)} <span class="small">Lv ${lv}/${u.max}</span></b><span class="small">${esc(u.desc)} per level</span><span class="umeter"><i style="width:${100*lv/u.max}%"></i></span></span>
        <button class="go" data-a="upg" data-id="${k}" ${mx || H.meats < c ? "disabled" : ""}>${mx ? "Maxed" : emoImg("🍖") + " " + fmtMeat(c)}</button></div>`; }).join("")}
  </section>`;
}

