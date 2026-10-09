/* ===== Quit path ===== */
/* ===== Dingo Hunt: idle battler ===== */
const MEAT_PER_COIN = 100000;
const W_RARITY = [
  {k:"junk", label:"Junk", w:55, lo:.15, hi:.4, col:"#8a8f93", sell:1},
  {k:"common", label:"Common", w:28, lo:.4, hi:.7, col:"#b8c4bb", sell:2},
  {k:"uncommon", label:"Uncommon", w:11, lo:.7, hi:.95, col:"#4f8fb8", sell:4},
  {k:"rare", label:"Rare", w:4.7, lo:.95, hi:1.2, col:"#a77bd6", sell:8},
  {k:"epic", label:"Epic", w:1.0, lo:1.4, hi:2.0, col:"#e8741c", sell:20},
  {k:"legendary", label:"Legendary", w:0.3, lo:2.5, hi:4.0, col:"#e3b23c", sell:60},
  {k:"godly", label:"Godly", w:0, lo:5, hi:7, col:"#ff4fd8", sell:150},
  {k:"mythic", label:"Mythic", w:0, lo:10, hi:14, col:"#00e5ff", sell:400},
  {k:"titan", label:"GODFORGED", w:0, lo:22, hi:28, col:"#ff2d55", sell:1200}
];
const W_BASES = [["🪵","Stick"],["🦴","Bone Club"],["🌰","Acorn Sling"],["🥄","Spoon"],["🎾","Ball Launcher"],["🥏","Frisbee"],["🪨","Rock"],["🪃","Boomerang"],["🗡️","Fang Dagger"],["🏹","Pine Bow"],["🔨","Log Hammer"],["🪓","Hatchet"],["⛏️","Dig Pick"],["🔱","Moon Trident"],["⚔️","Twin Claws"]];
const W_PREFIX = {godly:["Godly","Divine","Celestial"], mythic:["Ultimate"], junk:["Soggy","Chewed","Bent","Wobbly","Sad"], common:["Trusty","Plain","Sturdy","Basic"], uncommon:["Sharp","Swift","Polished","Balanced"], rare:["Howling","Moonlit","Wild","Feral"], epic:["Alpha","Thunder","Blazing","Starforged"], legendary:["Legendary Dingo's","Ancient Pack","Moon Howler's","Golden"]};
const MONSTERS = [["🦟","Gnat Swarm"],["🪳","Roach"],["🐀","Rat"],["🪲","Beetle"],["🐝","Angry Bee"],["🦗","Cricket Thug"],["🕷️","Spider"],["🐍","Snake"],["🦂","Scorpion"],["🦇","Vampire Bat"],["🐗","Boar"],["🐊","Gator"],["🦖","Dino"],["🐉","Dragon"],["🦬","Wild Bison"]];
function huntState(){ if (state.hunt && state.hunt.autoRoll) state.hunt.autoRoll = false; /* rolling retired in v0.17 */ const d = {meats:0, kills:0, boss:0, weapons:[], equipped:[], autoRoll:false, autoEquip:false, reserve:0, rolls:0, bestDrop:0, coinsDropped:0}; state.hunt = state.hunt || {}; for (const k in d) if (state.hunt[k] === undefined) state.hunt[k] = d[k];
  if (!state.hunt.weapons.length){ const hp = enemyHP(false); [["🪵","Trusty Stick"],["🦴","Trusty Bone Club"],["🌰","Trusty Acorn Sling"]].forEach(([ic,nm]) => { const w = makeWeapon(hp, "common", ic, nm, 1.0); state.hunt.weapons.push(w); state.hunt.equipped.push(w.id); }); }
  return state.hunt; }
function playerLevel(){ return levelFrom(state.treats.earned || 0).lvl; }
function enemyHP(boss){ const H = state.hunt || {kills:0}, L = playerLevel(); const base = 300 * Math.pow(1.5, L-1) * (1 + 0.003 * (H.kills||0)) * (state.hunt ? zone().hp : 1); return Math.round(base * (boss ? 4 : 1)); }
function makeWeapon(hp, rk, icon, name, mult){
  const R = W_RARITY.find(r => r.k === rk), m = mult || (R.lo + Math.random()*(R.hi - R.lo)), fair = hp / (8*5), dps = Math.max(0.5, fair * m), spd = +(0.4 + Math.random()*1.6).toFixed(2);
  const Zm = state.hunt ? zone() : ZONES.meadow, EVz = Zm.home ? gameEvent() : null, WB = (!icon && EVz) ? EVz.weapons : (!icon && Zm.bases) ? Zm.bases : W_BASES, base = icon ? [icon, name] : WB[Math.floor(Math.random()*WB.length)], pre = W_PREFIX[rk];
  const nw = {id: uid(), zone: !icon && !Zm.home ? zoneId() : undefined, ev: (!icon && EVz) ? EVz.id : undefined, icon: base[0], name: icon ? name : pre[Math.floor(Math.random()*pre.length)] + " " + base[1], r: rk, spd, dmg: Math.max(1, Math.round(dps/spd)), dps: Math.round(dps*10)/10};
  nw.code = SMITHY.forWeapon({seed: nw.id + ":" + Math.random(), name: base[1] || name || "", rar: tierIdx(rk), zone: Zm.home ? "meadow" : zoneId()}); if (!icon) nw.name = SMITHY.nameOf(nw.code);
  return nw; }
/* every weapon gets a Smithy look; older saves get a matching one, stats untouched */
function wCode(w){ if (!w.code || !SMITHY.decode(w.code)) w.code = SMITHY.forWeapon({seed: String(w.id), name: w.name || "", rar: tierIdx(w.r), zone: w.zone || "meadow"}); return w.code; }
function wImg(w, mode){ const m = calm ? "still" : mode === "card" ? (tierIdx(w.r) >= 4 ? "live" : "still") : (mode || "still"); return `<img class="emo wimg r-${w.r}" src="${SMITHY.dataUrl(wCode(w), m)}" alt="" draggable="false">`; }
function wDps(w){ return w.dmg * w.spd; }
function dingoDps(){ const H = huntState(); return H.equipped.map(id => H.weapons.find(w => w.id === id)).filter(Boolean).reduce((a,w) => a + wDps(w), 0) + (state.pack ? packDps() : 0); }
function autoEquip(){ const H = huntState(); H.equipped = H.weapons.slice().sort((a,b) => wDps(b) - wDps(a)).slice(0,5).map(w => w.id); }
function sellValue(w){ const R = W_RARITY.find(r => r.k === w.r); return Math.round(wDps(w) * 25 * R.sell); }
const WCAP = 300, PCAP = 500;
function weaponRoom(){ const H = huntState(); if (H.weapons.length >= WCAP){ const eq = new Set(H.equipped), vic = H.weapons.filter(w => !eq.has(w.id) && !w.lock && !w.set && !w.relic && !(w.gems && w.gems.length) && tierIdx(w.r) <= 2).sort((a,b) => wDps(a) - wDps(b))[0];
    if (vic){ H.meats += sellValue(vic); H.weapons = H.weapons.filter(w => w !== vic); H.salvaged = (H.salvaged||0) + 1; } } return H.weapons.length < WCAP; }
/* Big-number names (v0.19): K, M, B, T, Qa, Qi… then aa, ab… so huge numbers stay short. */
const NUM_SUF = ["","K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc","Ud","Dd","Td","Qad","Qid","Sxd","Spd","Ocd","Nod","Vg","Uvg","Dvg","Tvg","Qavg","Qivg","Sxvg","Spvg","Ocvg","Novg","Tg"];
function numSuf(k){ if (k < NUM_SUF.length) return NUM_SUF[k]; const j = k - NUM_SUF.length, a = "abcdefghijklmnopqrstuvwxyz"; return a[Math.floor(j/26) % 26] + a[j % 26]; }
function fmtMeat(n){ if (!isFinite(n)) return n > 0 ? "∞" : "0"; const neg = n < 0; n = Math.floor(Math.abs(n)); if (n < 1e4) return (neg ? "-" : "") + n.toLocaleString("en-US");
  let k = Math.floor(Math.log10(n) / 3), v = n / Math.pow(10, k*3); if (v < 1){ k--; v *= 1000; } if (v >= 999.95){ k++; v /= 1000; } return (neg ? "-" : "") + v.toFixed(v < 100 ? 2 : 1) + numSuf(k); }

/* --- battle engine (runs in the hero scene) --- */
const B = {enemies:[], ghosts:[], last:0, running:false, spawnIn:1.5, saveIn:30, rollIn:2, layer:null, moonUntil:0};
function battleLayer(){ if (B.layer && document.body.contains(B.layer)) return B.layer; const hero = document.querySelector("section.hero"); if (!hero) return null;
  let l = hero.querySelector("#battle"); if (!l){ l = document.createElement("div"); l.id = "battle"; l.setAttribute("aria-hidden","true"); hero.appendChild(l); } B.layer = l; return l; }
/* v0.40: logical stage units, read from layout (offset*), never from the screen. w = the creature lane, not the window. */
function dingoPos(){ const d = $("#dingo"), hero = document.querySelector("section.hero"); if (!d || !hero) return null; return {x: d.offsetLeft + d.offsetWidth*0.7, y: d.offsetTop + d.offsetHeight*0.35, w: STAGE_LANE, h: hero.offsetHeight, view: STAGE.w}; }
function syncGhosts(){ const H = huntState(), L = battleLayer(); if (!L) return; const ids = H.equipped.slice(0,5);
  B.ghosts = B.ghosts.filter(g => { if (!ids.includes(g.id)){ g.el.remove(); return false; } return true; });
  ids.forEach((id,i) => { const w = H.weapons.find(x => x.id === id); if (!w) return; ensureTraits(w); let g = B.ghosts.find(x => x.id === id);
    if (!g){ const el = document.createElement("span"); el.className = "ghost r-" + w.r; el.innerHTML = wImg(w, "still"); L.appendChild(el); g = {id, el, cd: Math.random(), fly:null, x:0, y:0}; B.ghosts.push(g); }
    g.w = w; g.slot = i; }); }
/* bait + blood moon */
const BAITS = [{name:"Meat Bait", icon:"🍖", rate:1.6, max:2, min:15, cm:30, cc:60}, {name:"Juicy Bait", icon:"🥩", rate:2.2, max:3, min:20, cm:90, cc:150}, {name:"Feast Bait", icon:"🍗", rate:3, max:4, min:30, cm:250, cc:360}];
const BAIT_EV = {"10":[["Candy Trail","🍬"],["Cursed Candle","🕯️"],["Witching Hour Feast","🎃"]], "12":[["Cocoa Trail","☕"],["Gingerbread Lure","🍪"],["Holiday Feast","🎁"]]};
function baitEv(){ return DISABLED.seasonal ? null : BAIT_EV[todayIso().slice(5,7)]; } /* v0.44: seasonal bait names only while events run */
function baitName(i){ const E = baitEv(); return E ? E[i][0] : BAITS[i].name; }
function baitIcon(i){ const E = baitEv(); return E ? E[i][1] : BAITS[i].icon; }
function baitState(){ state.bait = state.bait || {inv:[0,0,0], active:null}; if (!Array.isArray(state.bait.inv)) state.bait.inv = [0,0,0]; const S = state.bait; if (!S.acts){ S.acts = [0,0,0]; if (S.active && S.active.until) S.acts[S.active.tier] = S.active.until; } return S; }
function bloodMoon(){ return B.moonUntil > performance.now(); }
function baitActive(){ const S = baitState(), now = Date.now(); return S.acts.map((u,i) => u > now ? i : -1).filter(i => i >= 0); }
function baitVal(){ const act = baitActive(); let rate = 1 + act.reduce((a,i) => a + (BAITS[i].rate - 1), 0), max = Math.min(7, 1 + act.reduce((a,i) => a + (BAITS[i].max - 1), 0)); rate *= (1 + 0.05*upgLv("lure"));
  max += treatActive("crowd");
  if (B.trial){ max += 2 + Math.floor(B.trial.wave/3); rate *= 2.2; }
  if (compOn("night")) max += 2; if (scrollLv("moonpath")){ max += 1; rate *= 1 + 0.05*scrollLv("moonpath"); } if (dayIs("fri")) max += 1; if (bloodMoon()){ rate *= 2; max += 1; } return {rate, max}; }
function baitCost(i){ const th = dayIs("thu") ? 0.75 : 1; return gameEvent() ? Math.round(BAITS[i].cc*th) : Math.round(enemyHP(false) * BAITS[i].cm * th); }
function startBloodMoon(){ B.moonUntil = performance.now() + 90000; const hero = document.querySelector("section.hero"); if (hero) hero.classList.add("bloodmoon");
  toast("🩸 A BLOOD MOON RISES! Triple candy and more creatures for 90 seconds!"); sfx("spooky"); if (!calm){ document.body.classList.add("shake"); setTimeout(() => document.body.classList.remove("shake"), 400); }
  setTimeout(() => { const h2 = document.querySelector("section.hero"); if (h2) h2.classList.remove("bloodmoon"); toast("The blood moon fades... 🌕"); }, 90000); }
const FACE_RIGHT = new Set(["🐍","🐛","🐉","🐜","🦇","🦗","🦎","🦖","🐝","🦟","🐅","🐆","🐈","🦕","🐊"]);
function spawnEnemy(kind){ const H = huntState(), L = battleLayer(), P = dingoPos(); if (!L || !P) return;
  const EV = gameEvent(), king = kind === "king", thief = kind === "thief", rush = kind === "rush"; let boss = false;
  const mega = kind === "mega" && B.megaNext, titan = kind === "titan" && B.titanNext;
  const sub = kind && kind.includes(":") ? kind.split(":") : null;
  if (!kind){ H.boss++; boss = H.boss >= (dayIs("sat") ? 8 : compOn("night") ? 10 : tod() === "night" ? 15 : 20); if (boss){ H.boss = 0; if (!moonActive() && !B.chapter && !B.mega){ H.megaCount = Math.min(5, (H.megaCount||0) + 1); if (H.megaCount >= 5 && !H.holdBig){ H.megaCount = 0; spawnMega(); return; } } } }
  const chap = kind === "chapter" && B.chapter, mf = !kind && moonActive() ? moonFoe() : null;
  const ML = todMonsters(), tier = Math.min(ML.length-1, Math.floor((playerLevel()-1) * 1.2 + Math.random()*2.5)), m = titan ? [titan.T.icon, titan.T.name] : mega ? [mega.icon, mega.name] : sub ? [sub[1], sub.slice(2).join(":")] : king ? ["🎃","THE PUMPKIN KING"] : thief ? ["🦝","Sneaky Raccoon"] : chap ? CHAPTERS[B.chapter.i].boss : mf ? mf : ML[Math.max(0, tier)];
  const tpartOf = sub && sub[0] === "tpart" && B.titan;
  const hp = titan ? Math.round(Math.max(enemyHP(false) * (titan.T.titan ? 160 : 80), dingoDps() * dmgMult() * 1.3 * (titan.T.titan ? 330 : 230))) : tpartOf ? Math.round(B.titan.E.max * 0.07) : mega ? Math.round(Math.max(enemyHP(false) * 40, dingoDps() * dmgMult() * 1.3 * 80)) : sub ? Math.round(enemyHP(false) * (sub[0] === "swarm" ? 0.45 : sub[0] === "add" ? 0.6 : 0.25)) : chap ? Math.round(Math.max(enemyHP(false) * CHAPTERS[B.chapter.i].hp, dingoDps() * dmgMult() * 1.3 * [30,45,70,100,150][B.chapter.i])) : mf ? Math.round(enemyHP(false) * trialHpMult(mf)) : king ? Math.round(Math.max(enemyHP(false) * 12, dingoDps() * dmgMult() * 1.3 * 18)) : thief ? enemyHP(false) * 2 : rush ? Math.round(enemyHP(false) * 0.35) : enemyHP(boss), el = document.createElement("div"); el.className = "enemy" + (boss || chap || mega || (mf && mf[2] >= 8) ? " boss" : "") + (mega ? " mega" : "") + (titan ? " titan" : "") + (tpartOf ? " tpart" : "") + (king ? " king" : "") + (thief ? " thief" : "") + (chap ? " chapterboss" : "");
  const aSeed = (mega || titan || king || chap) ? undefined : (sub || ALWAYS_MIX.has(m[0])) ? Math.floor(Math.random()*1e9) : zoneId() + "|" + m[0], aPick = artPick(m[0], aSeed, true);
  el.innerHTML = `<span class="ehp"><i></i></span><span class="eart">${emoImg(m[0], aSeed, true)}${king ? `<span class="kcrown">${emoImg("👑")}</span>` : ""}</span>${boss || king || chap || mega || titan || (mf && mf[2] >= 8) ? `<span class="ename">${titan ? "⚠️ " : king ? "👑 " : chap ? "📖 " : mega ? "☠️ " : "BOSS · "}${esc(m[1])}</span>` : ""}`;
  L.appendChild(el); el.classList.add("efade"); setTimeout(() => el.classList.remove("efade"), 600); const lastX = B.enemies.length ? Math.max(...B.enemies.map(e => e.x)) : 0;
  const hl = scrollLv("hallows"); let horror = false; if (hl && !kind && !boss){ H.horrorN = (H.horrorN||0) + 1; if (H.horrorN >= Math.max(7, 15 - hl*2)){ H.horrorN = 0; horror = true; el.classList.add("horror"); const nm2 = document.createElement("span"); nm2.className = "ename"; nm2.textContent = "👻 Spectral " + m[1]; el.appendChild(nm2); } }
  const gold = !kind && (scrollLv("gild") || compOn("midas")) && Math.random() < (0.005 * scrollLv("gild") + (compOn("midas") ? 0.025 : 0)) * (compOn("midas") ? 2 : 1); if (gold){ el.classList.add("gold"); const nm = document.createElement("span"); nm.className = "ename"; nm.textContent = "✨ Golden " + m[1]; el.appendChild(nm); }
  if (aPick ? aPick.right : (FACE_RIGHT.has(m[0]) && m[0] !== "🐊")) el.classList.add("eflip");
  B.enemies.push({el, hp, max: hp, x: thief ? P.w + 30 : mf ? Math.min(P.w + 30, Math.max(P.x + 260 + Math.random()*120, lastX + 55)) : Math.max(P.w + 30, lastX + 60), boss: boss || king || !!chap || !!mega || !!titan || !!(mf && mf[2] >= 8), megaDef: mega || null, titanDef: titan || null, king, thief, rush, gold, horror, chapter: !!chap, moonPts: mf ? mf[2] : 0, moonBoss: !!(mf && mf[2] >= 8), name: m[1], icon: m[0], speed: (king ? 60 : thief ? 150 : rush ? 200 : boss ? 85 : 130) * (mf ? 1.35 : 1)});
  { const NE = B.enemies[B.enemies.length-1]; if (!titan && !tpartOf) applyArchetype(NE, el, kind); else NE.traits = []; if (titan){ NE.speed = 40; NE.traits = []; const H2 = titanState(); if (H2.titanScar && H2.titanScar.id === titan.id) NE.hp = Math.max(1, Math.round(NE.max * H2.titanScar.frac)); B.titan = {E: NE, id: titan.id, T: titan.T, until: Date.now() + (titan.T.titan ? 330000 : 240000), phase: 0}; if (titan.T.titan) NE.el.classList.add("omen"); B.titanNext = null; titanPartsSpawn(B.titan); const hr = document.querySelector("section.hero"); if (hr){ hr.classList.add("titanstage"); if (titan.T.titan) hr.classList.add("omenstage"); } }
    if (mega){ NE.speed = 50; B.mega = {E: NE, def: mega, until: performance.now() + 120000}; B.megaNext = null; moonBanner("☠️ MEGA BOSS: " + mega.name.toUpperCase(), "2 minutes to take it down!"); sfx("mega"); heroShake(10, 500); } if (sub && sub[0] === "add" && B.mega) NE.addOf = B.mega.E; if (NE.flying) el.classList.add("flyer"); if (sub && sub[0] === "baby"){ el.classList.add("baby"); NE.split = false; }
    if (!kind && NE.traits.includes("swarm") && !NE.boss){ NE.hp *= 0.45; NE.max *= 0.45; setTimeout(() => spawnEnemy("swarm:" + m[0] + ":" + m[1]), 250); setTimeout(() => spawnEnemy("swarm:" + m[0] + ":" + m[1]), 500); } }
  if (king){ toast("🎃👑 THE PUMPKIN KING approaches! Defeat him for a mountain of candy!"); sfx("horn"); } else if (boss && !mega && !titan && !chap) sfx("boss"); }
/* v0.44: short in-world callouts over a creature (or the dingo) instead of messages in the corner */
function fieldCue(x, y, txt, big){ const L = battleLayer(); if (!L) return; const d = document.createElement("span"); d.className = "dmg cue" + (big ? " big" : ""); d.textContent = txt; d.style.left = x + "px"; d.style.top = y + "px"; d.style.setProperty("--dx", "0px"); L.appendChild(d); setTimeout(() => d.remove(), 1400); }
function dmgPop(x, y, txt, crit){ const L = battleLayer(); if (!L) return; const d = document.createElement("span"); d.className = "dmg" + (crit ? " crit" : ""); d.textContent = txt; d.style.left = x + "px"; d.style.top = y + "px"; d.style.setProperty("--dx", ((Math.random()*2-1)*18).toFixed(0) + "px"); L.appendChild(d); setTimeout(() => d.remove(), 900); }
function hitEnemy(E, dmg, crit, x){ if (!E || E.dead) return; E.hitAt = performance.now(); if (B.trial && B.trial.meta) trialDamage(dmg); if (!calm) sfx(crit ? "crit" : "hit"); if (E.invuln){ if (Math.random() < 0.3) dmgPop(E.x, (parseFloat(E.el.style.top)||0) + 20, "IMMUNE"); return; } E.hp -= dmg; dmgPop(x != null ? x : E.x + (Math.random()*20-10), (parseFloat(E.el.style.top)||0) - 6, (crit ? "💥" : "") + fmtMeat(dmg), crit);
  if (!calm){ E.el.classList.remove("hit"); void E.el.offsetWidth; E.el.classList.add("hit"); } if (E.hp <= 0) killEnemy(E); }
function huntXp(E){ const H = huntState(); let xp = 0, bones = 0;
  if (E.titanDef){ xp = 60; bones = 8; } else if (E.megaDef){ xp = 25; bones = 4; } else if (E.king){ xp = 20; bones = 3; } else if (E.boss){ xp = 6; bones = 1; } else { H.xpKills = (H.xpKills||0) + 1; if (H.xpKills >= 2){ H.xpKills = 0; xp = 1; } if (E.elite){ xp += 2; } }
  if (bones) earn(bones); const extra = xp - bones; if (extra > 0){ const before = levelFrom(state.treats.earned||0).lvl; state.treats.earned = (state.treats.earned||0) + extra; const after = levelFrom(state.treats.earned).lvl; if (after > before){ pendingLevel = after; setTimeout(levelUpCheck, 300); } } if (xp) renderHud(); }
function killEnemy(E){
  E = E || B.enemies[0]; if (!E || E.dead) return; E.dead = true; huntXp(E); sfx(E.boss ? "chest" : "pop"); B.enemies = B.enemies.filter(x => x !== E);
  hitstop(E.king ? 260 : E.boss ? 160 : 85); heroShake(E.king ? 10 : E.boss ? 7 : 2.5, E.king ? 420 : E.boss ? 320 : 150); poof(E.x, (parseFloat(E.el.style.top)||0) + (E.boss ? 40 : 22), E.king ? 18 : E.boss ? 14 : 8);
  const H = huntState(), S = shopState(), ex = E.x, ey = parseFloat(E.el.style.top) || 0;
  E.el.classList.add("dead"); setTimeout(() => E.el.remove(), 500);
  const lootBase = E.titanDef ? enemyHP(false) * 80 : E.fixed ? enemyHP(false) * 3 : E.megaDef ? enemyHP(false) * 40 : E.chapter ? enemyHP(false) * 20 : E.king ? enemyHP(false) * 12 : E.max;
  const mult = dropMult(lootBase / (E.megaDef ? 40 : E.chapter ? 20 : E.king ? 12 : E.boss ? 4 : 1));
  const meats = Math.round(lootBase * 1.2 * (0.8 + Math.random()*0.4) * mult * (E.king ? 3 : E.boss ? 2.5 : E.rush ? 4 : E.thief ? 3 : 1) * (E.boss && dayIs("sat") ? 2 : 1) * (E.gold ? 5 : 1) * (E.horror ? 13 : 1) * (E.elite ? 3 : 1) * (1 + 0.05*bestTier(E.name)) * (E.lastW && wClass(E.lastW) === "scoop" ? 1.5 : 1) * (hasTrait(E.lastW,"hungry") ? 1.25 : 1) * (E.feast ? 5 : 1) * lootMult());
  const EV = gameEvent(); let evAmt = 0;
  if (EV){ evAmt = Math.max(1, Math.round(killCandy(meats) * (1 + treatActive("candy")) * (E.king ? 8 : 1) * (bloodMoon() ? 3 : 1) * (hwNight() ? 2 : 1))); addEvCur(evAmt); H.evTotal = H.evTotal || {}; H.evTotal[EV.id] = (H.evTotal[EV.id]||0) + evAmt; }
  else { H.meats += meats; H.bestDrop = Math.max(H.bestDrop, meats); } H.kills++;
  let coin = Math.random() < (E.boss ? 0.04 : 0.0025) * coinChanceMult() * (hasTrait(E.lastW,"lucky") ? 2 : 1) * (E.elite ? 3 : 1); if (coin){ S.coins += 1; H.coinsDropped++; }
  if (E.boss && Math.random() < 0.12){ const ts = Object.keys(POT_TYPES), t = ts[Math.floor(Math.random()*ts.length)], BS = boostState(); BS.inv[t+"0"] = (BS.inv[t+"0"]||0) + 1; setTimeout(() => toast("🧪 The boss dropped a " + potName(t,0) + "!"), 900); }
  if (E.thief){ const n = (1 + Math.floor(Math.random()*2)) * (tomeOn("bandit") ? 2 : 1); S.coins += n; const BS = boostState(), ts = Object.keys(POT_TYPES), t = ts[Math.floor(Math.random()*ts.length)]; if (Math.random() < 0.5) BS.inv[t+"0"] = (BS.inv[t+"0"]||0) + 1; const BT = baitState(); BT.inv[0] = (BT.inv[0]||0) + 1; setTimeout(() => toast("🦝 Caught the raccoon! It dropped " + n + " coin" + (n>1?"s":"") + ", some bait" + (BS.inv[t+"0"] ? " and maybe a brew" : "") + "!"), 300); sfx("level"); }
  if (E.king && isOct() && Math.random() < 0.3){ const G = gemState(); G.rough.hallowstone = (G.rough.hallowstone||0) + 1; setTimeout(() => toast("🎃 The Pumpkin King dropped a rough Hallowstone!"), 900); }
  if (E.king){ const BS = boostState(), ts = Object.keys(POT_TYPES), t = ts[Math.floor(Math.random()*ts.length)]; BS.inv[t+"1"] = (BS.inv[t+"1"]||0) + 1;
    let hugeMsg = ""; if (Math.random() < 0.01){ const K = packState(); const p = {id: uid(), key:"hugepump", r:"huge", v:0, dps: Math.round(enemyHP(false)/(40) * 6 * 3), from:"ev-hw"}; K.pups.push(p); K.index.hugepump = true; if (K.autoEquip) packAutoEquip(); syncPups(); hugeMsg = " AND A HUGE PUMPKIN DINGO!!"; }
    setTimeout(() => { toast("👑 The Pumpkin King falls! +" + evAmt + " candy and a " + potName(t,1) + hugeMsg); sfx("level"); }, 300);
    if (!calm) for (let i=0;i<3;i++) setTimeout(() => { const q = stageToScreen(ex, ey + 30); rollBurst(q.x, q.y, ["#ff8a2a","#b98cf0","#ffd34d"][i], 26); }, i*220); }
  if (EV && !bloodMoon() && EV.id === "hw2026" && Math.random() < 0.025 * (tomeOn("hmoon") ? 3 : 1) * (dayTheme().fun ? 1.5 : 1)) startBloodMoon();
  if (EV && EV.id === "hw2026" && !E.king){ H.kingCount = (H.kingCount||0) + 1; if (H.kingCount >= (hwNight() ? 20 : 40)){ H.kingCount = 0; setTimeout(() => spawnEnemy("king"), 1500); } }
  tomeDropRoll(E); mimicChest(E); essenceDrop(E);
  if (!E.fixed && !E.megaDef && !E.titanDef && !E.chapter && Math.random() < dropChance(E)) dropFx(E, dropWeapon(E));
  { const BS = bestiaryState(), before = bestTier(E.name); BS[E.name] = (BS[E.name]||0) + 1; if (bestTier(E.name) > before) setTimeout(() => toast("📖 Bestiary: " + E.name + " reached ★" + bestTier(E.name) + "! +5% damage and drops against them."), 700); }
  if (E.split && !E.boss){ [0,1].forEach(k => setTimeout(() => { spawnEnemy("baby:" + E.icon + ":" + E.name); const nb = B.enemies[B.enemies.length-1]; if (nb) nb.x = ex + 20 + k*26; }, 120 + k*80)); }
  if (E.boss && !E.fixed && isOct() && zone().home && Math.random() < 0.08) giveTreat(randomTreat(), 1);
  if (B.trial) trialKill(E);
  if (E.chapter && B.chapter) setTimeout(() => chapterWin(B.chapter.i), 600);
  if (E.megaDef && !E.escaping) setTimeout(() => megaWin(E), 500);
  if (E.titanDef) setTimeout(() => titanWin(E), 700);
  if (!E.boss && !E.fixed){ zoneMastery(); overpowerTick(); }
  { const K = packState(), gain = E.king ? 20 : E.boss ? 5 : 1; K.equipped.forEach(id => { const p = K.pups.find(x => x.id === id); if (!p || p.r !== "huge") return; const before = pupLevel(p); p.xp = (p.xp||0) + gain; const after = pupLevel(p); if (after > before && (after % 5 === 0 || SOCKET_LV.includes(after))) setTimeout(() => toast("🐾 " + (p.nick || pupName(p)) + " reached level " + after + "!" + (SOCKET_LV.includes(after) ? " A new gem socket opened! 💎" : "")), 600); }); }
  meatShower(ex, ey + 20, E.king ? 30 : E.boss ? 18 : 5, coin);
  dmgPop(ex, ey - 10, EV ? "+" + evAmt + " " + EV.cur.icon : "+" + fmtMeat(meats) + " 🍖", E.boss);
  if (E.boss && !E.king){ sfx("chest"); feed(E.icon, E.name + " down! +" + (EV ? evAmt + " " + EV.cur.name.toLowerCase() : fmtMeat(meats) + " meats"), "#ffd34d"); }
  if (coin){ setTimeout(() => { toast("🪙 A rare Dingo Coin dropped!"); sfx("level"); }, 500); }
  updateHuntHud(); if (!B.enemies.length) B.spawnIn = (1.2 + Math.random()*1.5) / baitVal().rate;
}
function candyFrom(m){ return Math.max(1, Math.round(1.2 * m / Math.max(1, enemyHP(false) * 1.2))); }
function killCandy(meats){ return 3 * Math.sqrt(Math.max(0.2, meats / Math.max(1, enemyHP(false) * 1.2))); }
function hwNight(){ const t = todayIso(); return t.slice(5) === "10-31"; }
