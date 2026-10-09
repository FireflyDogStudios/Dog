/* ===== Time of day: sky, creatures, and little bonuses ===== */
const TOD = {
  dawn:{name:"Dawn", icon:"🌅", bonus:"Early Bird: +20% drops", from:5, to:8},
  day:{name:"Daytime", icon:"☀️", bonus:"Sunny: +10% attack speed", from:8, to:17},
  dusk:{name:"Dusk", icon:"🌇", bonus:"Golden hour: +10% luck", from:17, to:20},
  night:{name:"Night", icon:"🌙", bonus:"Night hunt: bosses come more often", from:20, to:5}
};
const TOD_MONSTERS = {
  dawn:[["🐌","Slow Snail"],["🐛","Hungry Caterpillar"],["🦗","Cricket Thug"],["🦎","Sneaky Lizard"],["🐿️","Nut Bandit"],["🦃","Grumpy Turkey"],["🐗","Boar"],["🦏","Rhino"],["🐉","Dawn Drake"]],
  day:[["🐝","Angry Bee"],["🐜","Ant Soldier"],["🐍","Snake"],["🦂","Scorpion"],["🦅","Hawk"],["🐊","Gator"],["🦏","Rhino"],["🦖","Dino"],["🐉","Sun Dragon"]],
  dusk:[["🦟","Mosquito Swarm"],["🪲","Beetle"],["🦨","Skunk"],["🕷️","Spider"],["🦇","Bat"],["🐍","Viper"],["🐻","Bear"],["🦣","Mammoth"],["🐉","Twilight Wyrm"]],
  night:[["🪳","Roach"],["🐀","Rat"],["🕷️","Spider"],["🦇","Vampire Bat"],["🦂","Scorpion"],["🦉","Night Owl"],["🐊","Swamp Gator"],["🦨","Night Skunk"],["🐉","Night Dragon"]]
};
function todAuto(){ const h = new Date().getHours(); return h >= 5 && h < 8 ? "dawn" : h >= 8 && h < 17 ? "day" : h >= 17 && h < 20 ? "dusk" : "night"; }
function tod(){ const o = state && state.hunt && state.hunt.todOverride; return o && TOD[o] ? o : todAuto(); }
function todMonsters(){ if (!zone().home) return zone().monsters; const EV = gameEvent(), T = TOD_MONSTERS[tod()]; if (!EV && Math.random() < 0.25){ const SM = season().mons; return T.map((x,i) => i < SM.length && Math.random() < 0.5 ? SM[i] : x); } if (EV && Math.random() < 0.75) return EV.monsters; return T; }
function applyTod(){ const hero = document.querySelector("section.hero"); if (!hero) return; const Z = zone(), zid = zoneId(), t = Z.home ? tod() : ""; Object.keys(TOD).forEach(k => hero.classList.toggle("tod-" + k, k === t)); ["spring","summer","fall","winter"].forEach(s => hero.classList.toggle("season-" + s, !!Z.home && seasonKey() === s)); ZONE_ORDER.forEach(k => hero.classList.toggle("zone-" + k, k === zid && !Z.home));
  if (!Z.home){ hero.style.background = Z.sky; hero.style.setProperty("--pine", Z.pine); } else { hero.style.background = ""; hero.style.removeProperty("--pine"); }
  let c = hero.querySelector(".celestial"); if (!c){ c = document.createElement("div"); c.className = "celestial"; c.setAttribute("aria-hidden","true"); hero.insertBefore(c, hero.firstChild); }
  let cl = hero.querySelector(".clouds"); if (!cl){ cl = document.createElement("div"); cl.className = "clouds"; cl.setAttribute("aria-hidden","true"); cl.innerHTML = "<i></i><i></i><i></i>"; hero.insertBefore(cl, hero.firstChild); } }
setInterval(applyTod, 60000);

/* ===== Zones & the Map ===== */
const ZONES = {
  meadow:{name:"The Meadow", icon:"🌼", lvl:1, home:true, hp:1, basket:"meadow", aspect:"wild", desc:"Your home. Day and night, weather, and every monthly event happen here."},
  forest:{name:"Whispering Forest", icon:"🌲", lvl:3, hp:1.8, basket:"forest", aspect:"night", sky:"linear-gradient(180deg,#1f3a2a 0%,#2f5a3a 55%,#4a7a4a 100%)", pine:"#0f2418",
    bases:[["🌿","Vine Whip"],["🪓","Woodcutter Axe"],["🍄","Spore Launcher"],["🌲","Pine Spear"],["🦌","Antler Club"],["🪵","Heartwood Staff"],["🐝","Hive Sling"],["🍂","Leaf Blade"]],
    monsters:[["🍄","Shroom Stalker"],["🕷️","Web Weaver"],["🐍","Moss Viper"],["🦉","Hoot Warden"],["🐗","Tusk Boar"],["🐻","Grizzly"],["🦣","Old Mammoth"],["🦖","Fern Rex"],["🐉","Forest Wyrm"]],
    desc:"Dense old woods. Tougher creatures, bigger drops, and Night essence hides in the shadows."},
  moon:{name:"Moonlit Peaks", icon:"🌙", lvl:6, hp:3.2, basket:"moon", aspect:"spark", sky:"linear-gradient(180deg,#0a1030 0%,#2a3a6a 60%,#8a9ac8 100%)", pine:"#1a2040",
    bases:[["🌙","Crescent Blade"],["⭐","Star Sling"],["💎","Crystal Maul"],["❄️","Frost Shard"],["🔭","Stargazer Lance"],["☄️","Comet Flail"],["🪐","Orbit Ring"],["🌠","Shooting Star Bow"]],
    monsters:[["🦇","Moon Bat"],["👻","Peak Wisp"],["❄️","Frost Sprite"],["🦅","Night Hawk"],["🪨","Stone Golem"],["🦂","Crystal Scorpion"],["👾","Star Invader"],["🦖","Sky Rex"],["🐉","Moon Dragon"]],
    desc:"High, cold, and full of starlight. The hardest hunting grounds, with the richest rewards and more Spark."}
};
const ZONE_ORDER = Object.keys(ZONES);
/* v0.40: only the Meadow is open while the game changes. The other areas and Trials are shelved (code kept). */
const SHELVED = {zones:["forest","moon"], trials:false}; /* v0.45: Meadow Trials open; other areas (and their trials) stay shelved */
function zoneId(){ const z = state && state.hunt && state.hunt.zone; return z && ZONES[z] && !SHELVED.zones.includes(z) && playerLevel() >= ZONES[z].lvl ? z : "meadow"; }
function zone(){ return zoneData(zoneId()); }
function travelTo(z){ const H = huntState(); if (SHELVED.zones.includes(z)){ toast("That area is resting for now. The Meadow comes first!"); return; } if (!ZONES[z] || playerLevel() < ZONES[z].lvl || zoneId() === z) return; GL.slice().forEach(g => glCollect(g, true)); H.zone = z; B.enemies.forEach(E => E.el.remove()); B.enemies = []; B.spawnIn = 1.2; applyTod(); toast(zoneData(z).icon + " Traveled to " + zoneData(z).name + "!"); sfx("chest"); }
function mapSection(){ const cur = zoneId(), L = playerLevel();
  return `<div class="map"><h3 class="pack-h" style="margin-top:0">🗺️ The Map</h3><div class="zones">${ZONE_ORDER.filter(k => !SHELVED.zones.includes(k)).map((k,i) => { const Z = zoneData(k), lock = L < Z.lvl, here = k === cur;
    return `${i ? `<span class="zpath${lock ? "" : " open"}"></span>` : ""}<div class="zcard${here ? " here" : ""}${lock ? " locked" : ""}" style="--zs:${Z.sky || "linear-gradient(180deg,#8fcdf2,#d6f0e0)"}"><span class="zart">${emoImg(Z.icon)}</span><b>${esc(Z.name)}</b><span class="small">${esc(Z.desc)}</span><span class="small">${Z.home ? "Home" : "Creatures ×" + Z.hp + " tougher"}</span>${here ? `<span class="zhere">📍 You are here</span>` : lock ? `<span class="small">🔒 Level ${Z.lvl}</span>` : `<button class="go" data-a="travel" data-id="${k}">Travel</button>`}</div>`; }).join("")}</div></div>`; }

/* ===== Halloween: 31 Nights, the Pumpkin Moon, the Midnight Chapters ===== */
const CHAPTERS = [];
function hw2(){ const W = hwState(); W.cal = W.cal || {}; W.ch = W.ch || {}; W.medals = W.medals || 0; W.moonBest = W.moonBest || 0; return W; }
function isOct(){ return false; }
function octDay(){ return parseInt(todayIso().slice(8,10), 10); }
function moonActive(){ return !!B.trial; }
function _showBanner(t, s){ const hero = document.querySelector("section.hero"); if (!hero || calm) { toast("🌕 " + t + ". " + s); return; } const b = document.createElement("div"); b.className = "moonbanner"; b.innerHTML = `<b>${esc(t)}</b><span>${esc(s)}</span>`; hero.appendChild(b); setTimeout(() => b.remove(), 3200); }
function moonFoe(){ return trialFoe(); }
function chapterWin(i){ const W = hw2(), C = CHAPTERS[i], first = !W.ch[i]; W.ch[i] = Date.now(); B.chapter = null;
  if (first){ if (i === 0){ addEvCur(1200); hwState().cos.ghost = true; } if (i === 1){ const ty = Object.keys(TOME_T).filter(t => !TOME_T[t].ev); giveTome(ty[Math.floor(Math.random()*ty.length)] + "0"); addEss("hallow", 5); }
    if (i === 2){ const w = makeWeapon(enemyHP(false), "legendary", "🗡️", "Midnight Fang"); w.ev = "hw2026"; w.dmg = Math.round(w.dmg * 1.3); huntState().weapons.push(w); if (huntState().autoEquip) autoEquip(); syncGhosts(); showRollFx([w]); }
    if (i === 3){ const K = packState(), p = {id: uid(), key:"specterpup", r:"legendary", v:0, dps: Math.round(enemyHP(false)/40 * 2.2 * 5), from:"hw"}; K.pups.push(p); K.index.specterpup = true; if (K.autoEquip) packAutoEquip(); syncPups(); showHatchFx([p], "👻"); }
    if (i === 4){ W.guardian = true; addEss("hallow", 15); } }
  const ov = document.createElement("div"); ov.className = "lvlup"; ov.innerHTML = `<div class="card"><div class="rays"></div><div class="big-badge" style="font-size:2.4rem">${emoImg(C.boss[0])}</div><h3>${esc(C.name)}: complete!</h3><p>${i === 4 ? "The Lantern-Eater bursts into a thousand lights, and every lantern in the Meadow blazes back to life. The Meadow is safe. You did it, Guardian. 🎃💛" : "The light it stole flickers back into the lanterns. The trail continues..."}</p>${first ? `<p class="small"><b>Reward:</b> ${esc(C.reward)}</p>` : ""}<button class="go" data-close>${i === 4 ? "Home, safe 🐾" : "Onward"}</button></div>`;
  document.body.appendChild(ov); sfx("victory"); autoCloseBox(ov); ov.addEventListener("click", e => { if (e.target === ov || e.target.closest("[data-close]")) ov.remove(); }); save("Chapter complete"); }
