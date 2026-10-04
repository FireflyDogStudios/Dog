/* ===== The Scriptorium: aspects, alchemy, research, scrolls ===== */
const ASP = {
  ember:{n:"Ember", i:"🔥", c:"#ff7a3a"}, tide:{n:"Tide", i:"💧", c:"#4fa8e8"}, wild:{n:"Wild", i:"🌿", c:"#5ac06a"}, night:{n:"Night", i:"🌙", c:"#8a7bff"}, spark:{n:"Spark", i:"⚡", c:"#ffd34d"}, bone:{n:"Bone", i:"🦴", c:"#e8e2d0"},
  mist:{n:"Mist", i:"🌫️", c:"#b8c4d8", of:["tide","ember"]}, storm:{n:"Storm", i:"⛈️", c:"#6a8ad8", of:["spark","tide"]}, bloom:{n:"Bloom", i:"🌸", c:"#ff9ad5", of:["wild","tide"]},
  cinder:{n:"Cinder", i:"🍂", c:"#d0703a", of:["ember","wild"]}, spirit:{n:"Spirit", i:"👻", c:"#cfe8ff", of:["night","bone"]}, howl:{n:"Howl", i:"🐺", c:"#9aa6b8", of:["wild","night"]},
  hunger:{n:"Hunger", i:"🍖", c:"#c85a4a", of:["bone","wild"]}, star:{n:"Star", i:"⭐", c:"#ffe98a", of:["night","spark"]}, frost:{n:"Frost", i:"❄️", c:"#a0e0ff", of:["tide","night"]},
  heart:{n:"Heart", i:"💚", c:"#6ae08a", of:["howl","bloom"]}, moon:{n:"Moon", i:"🌕", c:"#fff0b8", of:["star","spirit"]}, pack:{n:"Pack", i:"🐾", c:"#e3b23c", of:["howl","hunger"]},
  fury:{n:"Fury", i:"💥", c:"#ff5a5a", of:["storm","hunger"]}, dream:{n:"Dream", i:"💤", c:"#b98cf0", of:["spirit","mist"]},
  hallow:{n:"Hallow", i:"🎃", c:"#ff8a2a", relic:"Only from Halloween creatures in October (the Pumpkin King drops a lot)"},
  yule:{n:"Yule", i:"🎄", c:"#4fc36a", relic:"Only from Holiday creatures in December"},
  sol:{n:"Sol", i:"☀️", c:"#ffd34d", relic:"From bosses at dawn and during the day"},
  umbra:{n:"Umbra", i:"🌑", c:"#6a5a9a", relic:"From bosses at dusk and at night"},
  regal:{n:"Regal", i:"👑", c:"#e3b23c", relic:"Sometimes from bosses, always from kings"},
  gilt:{n:"Gilt", i:"✨", c:"#fff0a0", relic:"From Golden creatures and caught raccoons"},
  arcane:{n:"Arcane Dust", i:"💠", c:"#6ae0ff", relic:"Dug up in the Mine and left behind by shattered gems"},
  titanheart:{n:"Divine Heart", i:"❤️‍🔥", c:"#ff2d55", relic:"Torn from a fallen God. The rarest thing in the woods"},
  megacore:{n:"Mega Core", i:"🌟", c:"#ff4fd8", relic:"Only from Mega Bosses. Bank them for the most advanced crafting"},
  paper:{n:"Scroll Paper", i:"📜", c:"#e8dcc0", relic:"Dropped by bosses. Every scroll needs paper to write on", paperNote:true}
};
const PRIMALS = ["ember","tide","wild","night","spark","bone"];
function aspLinked(a, b){ return !!(a && b && ((ASP[a].of || []).includes(b) || (ASP[b].of || []).includes(a))); }
const SCROLLS = {
  echo:{n:"Scroll of Echo Fangs", i:"🐺", d:lv => (6 + 2*lv) + "% of weapon hits strike twice", r:["howl","spark",2], cost:{howl:3, spark:6}},
  embers:{n:"Scroll of Embers", i:"🔥", d:lv => "Hits set creatures burning for " + (8*lv) + "% extra damage", r:["ember","hunger",2], cost:{ember:6, hunger:3}},
  kin:{n:"Scroll of Kinship", i:"🐾", d:lv => "Pups hit " + (10*lv) + "% harder and leap " + (5*lv) + "% faster", r:["pack","dream",3], cost:{pack:2, dream:2}},
  gild:{n:"Scroll of Gilding", i:"✨", d:lv => (0.5*lv).toFixed(1) + "% of creatures are Golden, with 5× drops", r:["bone","star",4], cost:{bone:8, star:4}},
  moonpath:{n:"Scroll of the Moonlit Path", i:"🌕", d:lv => "+1 creature on the field and +" + (5*lv) + "% spawn speed", r:["moon","bloom",4], cost:{moon:2, bloom:4}},
  storm:{n:"Scroll of Storm Calling", i:"⛈️", d:lv => "Lightning chains to " + (1 + Math.floor(lv/2)) + " more creature" + (lv >= 2 ? "s" : ""), r:["storm","spirit",5], cost:{storm:4, spirit:4}},
  heart:{n:"Scroll of the Wild Heart", i:"💚", d:lv => "+" + (4*lv) + "% damage and drops", r:["heart","fury",5], cost:{heart:2, fury:2}},
  dream:{n:"Scroll of Dreamwalking", i:"💤", d:lv => "Away-hunting " + (5*lv) + "% faster, and " + (lv*0.5) + " more hours of it", r:["dream","frost",6], cost:{dream:3, frost:4}},
  sniff:{n:"Scroll of Keen Senses", i:"👃", d:lv => "Books drop " + (20*lv) + "% more often", r:["bone","fury",3], cost:{bone:10, fury:2}},
  fortune:{n:"Scroll of Fortune's Paw", i:"🍀", d:lv => "+" + (15*lv) + "% rare coin chance", r:["spark","bloom",4], cost:{spark:8, bloom:4}},
  haste:{n:"Scroll of Swift Wind", i:"💨", d:lv => "+" + (5*lv) + "% attack speed", r:["tide","pack",3], cost:{tide:10, pack:2}},
  bountiful:{n:"Scroll of the Bountiful", i:"🧺", d:lv => "Guild tasks and bounties pay " + (15*lv) + "% more", r:["wild","moon",5], cost:{wild:12, moon:2}},
  alchemist:{n:"Scroll of the Alchemist", i:"⚗️", d:lv => (10*lv) + "% chance for a bonus essence from each creature", r:["ember","dream",3], cost:{ember:10, dream:2}},
  litters:{n:"Scroll of Litters", i:"🐶", d:lv => "+" + (10*lv) + "% luck when rescuing pups", r:["storm","heart",4], cost:{storm:4, heart:2}},
  mark:{n:"Scroll of the Hunter's Mark", i:"🎯", d:lv => "Bosses take " + (10*lv) + "% more damage", r:["frost","hunger",5], cost:{frost:6, hunger:6}},
  piercing:{n:"Scroll of Piercing Fangs", i:"🗡️", d:lv => "Crits hit " + (0.2*lv).toFixed(1) + "× harder", r:["cinder","star",5], cost:{cinder:6, star:4}},
  longdays:{n:"Scroll of Long Days", i:"⏳", d:lv => "Buffs and brews last " + (10*lv) + "% longer", r:["mist","fury",6], cost:{mist:6, fury:3}},
};
const SCROLL_ORDER = Object.keys(SCROLLS);
const SCROLL_MAIN = SCROLL_ORDER.filter(k => !SCROLLS[k].special);
function specialOpen(k){ const sc = SCROLLS[k], S = scripState(); const need = [].concat(sc.need || []); return need.every(x => S.seen[x]); }
function scripState(){ const d = {ess:{}, seen:{}, done:{}, lv:{}, rack:[], cur:"", slots:[]}; state.scrip = state.scrip || {}; for (const k in d) if (state.scrip[k] === undefined) state.scrip[k] = d[k]; return state.scrip; }
function ess(k){ return (state.scrip && state.scrip.ess[k]) || 0; }
function addEss(k, n){ const S = scripState(); S.ess[k] = Math.max(0, (S.ess[k]||0) + n); if (n > 0) S.seen[k] = true; }
function rackSlots(){ const L = playerLevel(); return 2 + (L >= 6 ? 1 : 0) + (L >= 10 ? 1 : 0); }
function scrollLv(k){ const S = state.scrip; return S && S.rack && S.rack.includes(k) ? ((S.lv && S.lv[k]) || 0) : 0; }
function scribeCost(k){ const lv = (state.scrip && state.scrip.lv[k]) || 0, m = Math.pow(2, lv); return Object.assign({paper: 1 + Math.floor(lv/2)}, scribeCost0(k, m)); }
function scribeCost0(k, m){ return Object.fromEntries(Object.entries(SCROLLS[k].cost).map(([a,n]) => [a, n*m])); }
const WX_ASP = {rain:"tide", storm:"spark", fog:"night", wind:"wild", snow:"tide", heat:"ember"};
function relicDrop(E){ const EV = gameEvent(), t = tod(); let r = [];
  if (EV && EV.id === "hw2026" && EV.monsters.some(m => m[0] === E.icon) && Math.random() < (E.king ? 1 : E.boss ? 0.6 : 0.12)) r.push(["hallow", E.king ? 10 : E.boss ? 3 : 1]);
  if (EV && EV.id === "xmas2026" && EV.monsters.some(m => m[0] === E.icon) && Math.random() < (E.boss ? 0.6 : 0.12)) r.push(["yule", E.boss ? 3 : 1]);
  if (E.boss && (t === "dawn" || t === "day") && Math.random() < 0.5) r.push(["sol", 1]);
  if (E.boss && (t === "dusk" || t === "night") && Math.random() < 0.5) r.push(["umbra", 1]);
  if (E.king || (E.boss && Math.random() < 0.15)) r.push(["regal", E.king ? 3 : 1]);
  if (E.gold || E.thief) r.push(["gilt", E.gold ? 2 : 1]); if (E.gold && compOn("midas")) shopState().coins += 1;
  if (E.horror) r.push(["hallow", 2]); if (E.cursed) r.push(["hallow", 2]);
  r.forEach(([k,n]) => { const first = !(state.scrip && state.scrip.seen[k]); addEss(k, n); if (first) setTimeout(() => toast("✨ New relic essence: " + ASP[k].n + "! Bank it for something special."), 400); }); }
function essenceDrop(E){ if (tomeHas("gather")) relicDrop(E); if (E.boss && Math.random() < (E.king ? 1 : 0.3)){ const n = E.king ? 3 : 1, first = !(state.scrip && state.scrip.seen.paper); addEss("paper", n); if (first) setTimeout(() => toast("📜 A boss dropped Scroll Paper! You'll need it to scribe scrolls."), 500); } let n = (E.king ? 6 : E.boss ? 3 : Math.random() < 0.3 ? 1 : 0) + (Math.random() < 0.1*scrollLv("alchemist") ? 1 : 0) + (Math.random() < gemBonus("ess") ? 1 : 0) + (Math.random() < treatActive("ess") ? 1 : 0) + (Math.random() < seasonBonus("ess") ? 1 : 0); if (compOn("sage")) n *= 2; if (!n) return;
  if (!tomeHas("gather")) return; { const x = n * (1 + tomeSum("gather")); n = Math.floor(x) + (Math.random() < x % 1 ? 1 : 0); }
  for (let i=0;i<n;i++){ let k = (WX.w && WX_ASP[WX.w] && Math.random() < 0.5) ? WX_ASP[WX.w] : PRIMALS[(E.icon ? E.icon.codePointAt(0) + i : i) % 6]; if (Math.random() < 0.35) k = PRIMALS[Math.floor(Math.random()*6)]; if (!zone().home && Math.random() < 0.3) k = zone().aspect; addEss(k, 1); } }
function aspChip(k, extra){ const a = ASP[k]; return `<span class="asp" style="--ac:${a.c}" title="${esc(a.n)}${a.of ? " = " + ASP[a.of[0]].n + " + " + ASP[a.of[1]].n : " (primal)"}">${essImg(k)}<b>${esc(a.n)}</b>${extra || ""}</span>`; }
function curProject(){ const S = scripState(); const next = SCROLL_MAIN.find(k => !S.done[k]); if (!S.cur || S.done[S.cur] || (SCROLLS[S.cur].special && !specialOpen(S.cur))){ S.cur = next || SCROLL_ORDER.find(k => SCROLLS[k].special && !S.done[k] && specialOpen(k)) || ""; S.slots = []; } return S.cur; }
function aspSource(k){ const a = ASP[k]; if (a.paperNote) return a.relic + "."; if (a.relic) return "Relic essence. " + a.relic + ". Can't be distilled, so bank it!"; if (a.of) return "Distill: " + ASP[a.of[0]].n + " + " + ASP[a.of[1]].n;
  const w = Object.entries(WX_ASP).filter(([wx,x]) => x === k).map(([wx]) => WEATHER[wx] ? WEATHER[wx].name : wx); return "Dropped by creatures" + (w.length ? " (more during " + w.join(" and ") + ")" : ""); }
function aspUsedIn(k){ const out = []; Object.entries(ASP).forEach(([c,a]) => { if (a.of && a.of.includes(k)) out.push(a.n); }); return out; }
function needMapFor(key){ const S = scripState(); if (!key) return null; const sc = SCROLLS[key];
  if (!S.done[key]){ const need = {}; (S.cur === key ? S.slots : []).forEach(x => { if (x) need[x] = (need[x]||0) + 2; }); return {phase:"research", need}; }
  if ((S.lv[key]||0) >= 5) return {phase:"max", need:{}}; return {phase:"scribe", need: scribeCost(key)}; }
function distillToward(k, want){ const A = ASP[k]; if (!A.of) return 0; let made = 0; while (ess(k) < want){ const [x,y] = A.of; if (ess(x) < 2) distillToward(x, 2); if (ess(y) < 2) distillToward(y, 2); if (ess(x) < 2 || ess(y) < 2) break; addEss(x,-2); addEss(y,-2); addEss(k,1); made++; } return made; }
function needRows(need){ return Object.entries(need).map(([k,v]) => { const have = ess(k), ok = have >= v; return `<div class="nrow ${ok ? "ok" : "short"}">${aspChip(k)}<b>${have} / ${v}</b><span class="small">${ok ? "✓ ready" : esc(aspSource(k))}</span></div>`; }).join(""); }
function researchPuzzle(cur){ const S = scripState(), sc = SCROLLS[cur], [A, Bk, n] = sc.r, known = Object.keys(ASP).filter(k => S.seen[k] || ASP[k].of === undefined);
  S.slots = S.slots.slice(0, n); while (S.slots.length < n) S.slots.push("");
  const chain = [A, ...S.slots, Bk], ok = chain.every((x,i) => i === 0 || aspLinked(chain[i-1], x)), full = S.slots.every(x => x), need = {}; S.slots.forEach(x => { if (x) need[x] = (need[x]||0) + 2; });
  const afford = Object.entries(need).every(([k,v]) => ess(k) >= v), fi = S.slots.findIndex(x => !x), left = fi === -1 ? null : chain[fi], rel = left ? Object.keys(ASP).filter(k => aspLinked(left, k)) : [];
  return `<div class="rtable"><div class="small">Link <b>${esc(ASP[A].n)}</b> to <b>${esc(ASP[Bk].n)}</b> through ${n} runes. Neighbors must be related (one is made from the other).</div>
    <div class="chain">${chain.map((x,i) => { const fixed = i === 0 || i === chain.length-1, link = i > 0 ? `<span class="lnk ${chain[i-1] && x ? (aspLinked(chain[i-1], x) ? "ok" : "bad") : ""}"></span>` : "";
      return link + (fixed ? `<span class="rune fixed" style="--ac:${ASP[x].c}">${essImg(x)}<b>${esc(ASP[x].n)}</b></span>` : `<label class="rune${x ? "" : " empty"}" style="--ac:${x ? ASP[x].c : "var(--line)"}">${x ? essImg(x) + `<b>${esc(ASP[x].n)}</b>` : "?"}<select data-rslot="${i-1}" aria-label="Rune ${i}"><option value="">Pick…</option>${known.map(k => `<option value="${k}" ${x === k ? "selected" : ""}>${ASP[k].n} (${ess(k)})</option>`).join("")}</select></label>`); }).join("")}</div>
    ${left ? `<p class="small hint">💡 Rune ${fi+1} touches <b>${esc(ASP[left].n)}</b>. Related: ${rel.map(k => `${esc(ASP[k].n)}${S.seen[k] ? " (" + ess(k) + ")" : " (undiscovered)"}`).join(", ")}.${fi === S.slots.length-1 ? ` It must also relate to <b>${esc(ASP[Bk].n)}</b>.` : ""}</p>` : ""}
    <div class="btns" style="margin-top:8px"><button class="go" data-a="research" ${ok && full && afford ? "" : "disabled"}>🕯️ Inscribe research</button><button data-a="rclear">Clear</button><span class="small" style="align-self:center">${!full ? "Fill every rune." : !ok ? "Red lines are broken links." : !afford ? "Short on essences (2 per rune). See the tracker above." : "The pattern holds! Inscribe it."}</span></div></div>`; }
/* ===== Compendiums: bind sealed max-level scrolls ===== */
const COMPS = {
  tempest:{n:"Compendium of the Tempest", i:"⛈️", col:"#6a8ad8", need:{echo:1, storm:1, embers:1}, d:"Every echo strike calls down lightning and sets the creature ablaze, and lightning strikes the field every few seconds in any weather"},
  packbond:{n:"Compendium of the Pack", i:"🐾", col:"#e3b23c", need:{kin:1, dream:1, heart:1}, d:"Pups deal double damage, and away-hunting runs at full speed"},
  midas:{n:"Compendium of Midas", i:"✨", col:"#ffd34d", need:{gild:1, fortune:1, sniff:1}, d:"Golden creatures appear far more often and drop coins, and books drop twice as often"},
  night:{n:"Compendium of the Endless Night", i:"🌌", col:"#8a7bff", need:{moonpath:1, haste:1, mark:1}, d:"+2 creatures on the field, a boss every 10 fights, and +25% attack speed"},
  sage:{n:"Compendium of the Sage", i:"📚", col:"#6ae08a", need:{alchemist:1, litters:1, bountiful:1, longdays:1}, d:"Double essences, rescues sometimes bring a twin, and buffs and brews last twice as long"},
  destiny:{n:"Compendium of Ultimate Destiny", i:"🌠", col:"#ff4fd8", ultimate:true, needComp:["tempest","packbond","midas"], need:{piercing:3}, d:"Everything ×1.5: damage, drops, luck, and speed. Your dingo shines with the light of the stars"}
};
function compState(){ const S = scripState(); S.sealed = S.sealed || {}; S.comps = S.comps || {}; S.cshelf = S.cshelf || []; return S; }
function compOn(k){ if (devOn) return true; const S = state.scrip; return !!(S && S.cshelf && S.cshelf.includes(k)); }
function compSlots(){ const L = playerLevel(); return 2 + (L >= 8 ? 1 : 0) + (L >= 12 ? 1 : 0); }
function sealCost(k){ return Object.assign({paper: 3}, Object.fromEntries(Object.entries(SCROLLS[k].cost).map(([a,n]) => [a, n*16]))); }
function compCanBind(k){ const S = compState(), C = COMPS[k]; if (S.comps[k]) return false; return Object.entries(C.need).every(([s,n]) => (S.sealed[s]||0) >= n) && (C.needComp || []).every(c => S.comps[c]); }
function compView(){
  const S = compState(), cs = compSlots();
  const sealable = SCROLL_ORDER.filter(k => (S.lv[k]||0) >= 5).map(k => { const c = sealCost(k), can = Object.entries(c).every(([a,v]) => ess(a) >= v);
    return `<div class="desk"><span class="scroll-ic">${emoImg(SCROLLS[k].i)}</span><div class="dk-main"><b>${esc(SCROLLS[k].n)} V</b><span class="small">Sealed copies: <b>${S.sealed[k]||0}</b>. Seal a max-level copy to bind into compendiums. Your hung scroll stays put.</span><div class="nrows nmini">${needRows(c)}</div></div><span class="btns"><button class="go" data-a="seal" data-id="${k}" ${can ? "" : "disabled"}>🔏 Seal a copy</button></span></div>`; }).join("");
  const list = Object.entries(COMPS).map(([k,C]) => { const own = S.comps[k], can = compCanBind(k), on = S.cshelf.includes(k);
    const reqs = Object.entries(C.need).map(([s,n]) => `<span class="creq ${(S.sealed[s]||0) >= n || own ? "ok" : ""}">${emoImg(SCROLLS[s].i)} ${esc(SCROLLS[s].n.replace("Scroll of ",""))} V ×${n} <b>(${S.sealed[s]||0})</b></span>`).join("") + (C.needComp || []).map(c => `<span class="creq ${S.comps[c] ? "ok" : ""}">${emoImg(COMPS[c].i)} ${esc(COMPS[c].n.replace("Compendium of ",""))}</span>`).join("");
    return `<div class="compcard${own ? " owned" : ""}${C.ultimate ? " ultimate" : ""}" style="--cc:${C.col}"><div class="cbook"><span class="cspine"></span>${emoImg(C.i)}</div><div class="dk-main"><b>${esc(C.n)}</b><span class="small">${esc(C.d)}</span><div class="creqs">${reqs}</div></div>
      <span class="btns">${own ? `<button class="${on ? "" : "go"}" data-a="cshelf" data-id="${k}" ${!on && S.cshelf.length >= cs ? "disabled" : ""}>${on ? "Take down" : "Place on shelf"}</button>` : `<button class="go" data-a="bind-comp" data-id="${k}" ${can ? "" : "disabled"}>📕 Bind</button>`}</span></div>`; }).join("");
  return `<h3 class="pack-h" style="margin-top:0">📕 Compendium shelf (${S.cshelf.length}/${cs})</h3>
    <div class="shelf compshelf">${Array.from({length:4}, (_,i) => i < cs ? (S.cshelf[i] ? `<button class="slot filled" data-a="cshelf" data-id="${S.cshelf[i]}"><span class="cbook sm" style="--cc:${COMPS[S.cshelf[i]].col}"><span class="cspine"></span>${emoImg(COMPS[S.cshelf[i]].i)}</span><span class="small">${esc(COMPS[S.cshelf[i]].n)}</span></button>` : `<div class="slot empty"><span class="small">Empty place</span></div>`) : `<div class="slot locked"><span class="small">🔒 Lv ${i === 2 ? 8 : 12}</span></div>`).join("")}</div>
    <p class="small">Compendiums are bound from <b>sealed copies</b> of fully leveled (V) scrolls, at least 3 kinds each. The <b>Compendium of Ultimate Destiny</b> needs three compendiums, both special scrolls, and more.</p>
    <h3 class="pack-h">Compendiums</h3><div class="comps">${list}</div>
    <h3 class="pack-h">🔏 Seal max-level scrolls</h3>${sealable || `<p class="small">Level a scroll to V to start sealing copies.</p>`}`;
}

let libMode = false;
function scriptoriumSection(){
  const S = scripState(), cur = curProject(), rs = rackSlots(), view = S.view || "research";
  if (!S.pin || (S.lv[S.pin]||0) >= 5) S.pin = cur || SCROLL_ORDER.find(k => S.done[k] && (S.lv[k]||0) < 5) || "";
  const pinned = S.pin, nm = needMapFor(pinned);
  const pouch = Object.keys(ASP).filter(k => S.seen[k]).map(k => `<button class="aspbtn${S.inspect === k ? " on" : ""}" data-a="asp-inspect" data-id="${k}" style="--ac:${ASP[k].c}">${essImg(k)}<b>${ess(k)}</b></button>`).join("") || `<span class="small">Hunt creatures to gather essences.</span>`;
  const insp = S.inspect && ASP[S.inspect] ? (() => { const k = S.inspect, a = ASP[k], used = aspUsedIn(k), inR = SCROLL_ORDER.filter(s => SCROLLS[s].r.slice(0,2).includes(k) || Object.keys(SCROLLS[s].cost).includes(k)).map(s => SCROLLS[s].n);
    return `<div class="inspect">${aspChip(k, `<i class="cnt">${ess(k)}</i>`)}<div class="small"><b>How to get:</b> ${esc(aspSource(k))}</div>${used.length ? `<div class="small"><b>Distills into:</b> ${esc(used.join(", "))}</div>` : ""}${inR.length ? `<div class="small"><b>Used for:</b> ${esc(inR.join(", "))}</div>` : ""}<div class="small"><b>Related to:</b> ${esc(Object.keys(ASP).filter(x => aspLinked(k, x)).map(x => ASP[x].n).join(", ") || "nothing yet")}</div><button class="x" data-a="asp-inspect" data-id="${k}" aria-label="Close">×</button></div>`; })() : "";
  const tracker = pinned ? `<div class="tracker"><div class="trk-top"><span class="scroll-ic">${emoImg(SCROLLS[pinned].i)}</span><div><b>🎯 Tracking: ${esc(SCROLLS[pinned].n)}</b><span class="small">${nm.phase === "research" ? "Step 1: solve its research" : nm.phase === "scribe" ? "Step 2: scribe it" + ((S.lv[pinned]||0) ? " to level " + ROMAN7[S.lv[pinned]] : "") : "Maxed!"}</span></div>
      <select data-pin aria-label="Track a scroll">${SCROLL_ORDER.filter(k => (S.lv[k]||0) < 5).map(k => `<option value="${k}" ${k === pinned ? "selected" : ""}>${SCROLLS[k].n}</option>`).join("")}</select></div>
      ${Object.keys(nm.need).length ? `<div class="nrows">${needRows(nm.need)}</div>${Object.entries(nm.need).some(([k,v]) => ASP[k].of && ess(k) < v) ? `<button class="go" data-a="distill-missing">⚗️ Distill what's missing</button>` : ""}` : nm.phase === "research" ? `<p class="small">Fill in the runes on the Research page and the essences you need will show up here.</p>` : ""}</div>` : "";
  const tabs = [["research","🔍 Research"],["alembic","⚗️ Alembic"],["apo","🧪 Apothecary"],["scrolls","📜 Scrolls"],["comps","📕 Compendiums"]].map(([k,l]) => `<button class="subtab${view === k ? " on" : ""}" data-a="scrip-view" data-id="${k}">${l}</button>`).join("");
  let body = "";
  if (view === "research"){
    const nextMain = SCROLL_MAIN.find(k => !S.done[k]);
    const nodes = SCROLL_ORDER.map((k,i) => { const sc = SCROLLS[k], avail = !S.done[k] && (k === nextMain || (sc.special && specialOpen(k))), st = S.done[k] ? "done" : k === cur ? "cur" : avail ? "avail" : "locked";
      const lockTxt = sc.special ? "Needs " + [].concat(sc.need).map(x => ASP[x].n).join(", ") + " essence" : "Locked";
      return `<button class="rnode ${st}${sc.special ? " special" : ""}" data-a="rselect" data-id="${k}" ${avail && k !== cur ? "" : "disabled"}><span class="scroll-ic">${emoImg(sc.i)}</span><b>${esc(sc.n.replace("Scroll of ",""))}</b><span class="small">${st === "done" ? "✓ Researched" : st === "cur" ? "Researching now" : st === "avail" ? "Tap to research" : esc(lockTxt)} · ${sc.r[2]} runes</span></button>`; }).join("");
    body = `<div class="rtree">${nodes}</div>${cur ? `<h3 class="pack-h">Now researching: ${esc(SCROLLS[cur].n)}</h3>${researchPuzzle(cur)}` : `<p class="small">Every scroll is researched! 📜</p>`}`;
  }
  if (view === "alembic"){
    const only = !!S.canOnly;
    const rows = Object.entries(ASP).filter(([k,a]) => a.of && (S.seen[k] || (S.seen[a.of[0]] && S.seen[a.of[1]]))).map(([k,a]) => { const [x,y] = a.of, can = ess(x) >= 2 && ess(y) >= 2, maxN = Math.min(Math.floor(ess(x)/2), Math.floor(ess(y)/2)), adv = !!(ASP[x].of || ASP[y].of);
      if (only && !can) return ""; return `<div class="almcard${can ? "" : " no"}${adv ? " adv" : ""}"><div class="almeq"><span class="ing ${ess(x) >= 2 ? "ok" : "short"}">${aspChip(x)}<i class="cnt">${ess(x)}/2</i></span><span>+</span><span class="ing ${ess(y) >= 2 ? "ok" : "short"}">${aspChip(y)}<i class="cnt">${ess(y)}/2</i></span><span>→</span>${aspChip(k, `<i class="cnt">${ess(k)}</i>`)}</div>
        <div class="btns"><button class="go" data-a="alm" data-id="${k}:1" ${can ? "" : "disabled"}>Distill</button><button data-a="alm" data-id="${k}:5" ${maxN >= 5 ? "" : "disabled"}>×5</button><button data-a="alm" data-id="${k}:${Math.max(1,maxN)}" ${maxN >= 2 ? "" : "disabled"}>Max (${maxN})</button></div></div>`; }).join("");
    body = `<label class="small" style="display:flex;gap:6px;align-items:center;margin-bottom:8px"><input type="checkbox" data-canonly ${only ? "checked" : ""}> Only show what I can make right now</label><div class="almgrid">${rows || `<p class="small">Nothing to distill yet. Gather more essences!</p>`}</div>`;
  }
  if (view === "comps") body = compView();
  if (view === "apo") body = apothecarySection(true);
  if (view === "scrolls"){
    const desk = SCROLL_ORDER.filter(k => S.done[k]).map(k => { const sc = SCROLLS[k], lv = S.lv[k]||0, c = scribeCost(k), can = lv < 5 && Object.entries(c).every(([a,v]) => ess(a) >= v), on = S.rack.includes(k);
      return `<div class="desk"><span class="scroll-ic">${emoImg(sc.i)}</span><div class="dk-main"><b>${esc(sc.n)}${lv ? " " + ROMAN7[lv-1] : ""}</b><span class="small">${lv ? esc(sc.d(lv)) : "Researched. Scribe it to use it."}</span>${lv < 5 ? `<span class="small" style="margin-top:6px">${lv ? "To improve:" : "To scribe:"}</span><div class="nrows nmini">${needRows(c)}</div>` : `<span class="small">Max level</span>`}</div>
        <span class="btns"><button class="go" data-a="scribe" data-id="${k}" ${can ? "" : "disabled"}>${lv ? "Improve" : "Scribe"}</button>${lv ? `<button data-a="rack" data-id="${k}" ${!on && S.rack.length >= rs ? "disabled" : ""}>${on ? "Take down" : "Hang"}</button>` : ""}<button data-a="pin" data-id="${k}">🎯 Track</button></span></div>`; }).join("");
    body = `<h3 class="pack-h" style="margin-top:0">Scroll rack (${S.rack.length}/${rs})</h3><div class="shelf rackshelf">${Array.from({length:4}, (_,i) => i < rs ? (S.rack[i] ? `<button class="slot filled" data-a="rack" data-id="${S.rack[i]}"><span class="scroll-ic big">${emoImg(SCROLLS[S.rack[i]].i)}</span><span class="small">${esc(SCROLLS[S.rack[i]].n)} ${ROMAN7[(S.lv[S.rack[i]]||1)-1]}</span></button>` : `<div class="slot empty"><span class="small">Empty hook</span></div>`) : `<div class="slot locked"><span class="small">🔒 Lv ${i === 2 ? 6 : 10}</span></div>`).join("")}</div>
      <h3 class="pack-h">Scribing desk</h3>${desk || `<p class="small">Finish your first research to start scribing.</p>`}`;
  }
  return `<section class="box scrip" aria-labelledby="scrip-h">
    <div class="jar-top"><h2 id="scrip-h">🕯️ The Scriptorium</h2><span class="small">${Object.keys(S.done).length} / ${SCROLL_ORDER.length} researched · ${S.rack.length}/${rs} scrolls hung</span></div>
    <div class="pouchbar"><span class="small">👜 Essences (tap one to learn about it):</span><div class="pouch">${pouch}</div>${insp}</div>
    ${tracker}
    ${libMode ? "" : `<div class="subtabs">${tabs}</div>`}
    ${body}
  </section>`;
}

