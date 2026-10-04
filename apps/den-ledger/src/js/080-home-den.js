/* ===== The Home Den: a cozy place with no battling ===== */
const DECOR = {
  bed:{n:"Bed", items:[["nest","Straw Nest","🪹",0],["cloud","Cloud Cushion","☁️",40],["moonbed","Moon Bed","🌙",80],["blanket","Cozy Blanket Pile","🧺",25]]},
  rug:{n:"Rug", items:[["woven","Woven Rug","🟫",0],["paw","Paw Print Rug","🐾",30],["star","Starry Rug","⭐",45],["leaf","Autumn Leaf Rug","🍂",35]]},
  light:{n:"Light", items:[["candle","Candle","🕯️",0],["jar","Firefly Jar","✨",25],["lantern","Paper Lantern","🏮",30],["lamp","Glow Mushroom Lamp","🍄",40]]},
  plant:{n:"Plant", items:[["fern","Fern","🌿",0],["pot","Potted Plant","🪴",15],["flower","Sunflower","🌻",20],["cactus","Tiny Cactus","🌵",15]]},
  wall:{n:"Wall", items:[["none","Bare wall","",0],["pic","Pack Portrait","🖼️",30],["map","Star Map","🌌",40],["clock","Cuckoo Clock","🕰️",35]]},
  toy:{n:"Toy", items:[["ball","Tennis Ball","🎾",0],["rope","Rope Toy","🪢",10],["plush","Plush Bear","🧸",20],["frisbee","Frisbee","🥏",15],["bone","Chew Bone","🦴",10]]},
  spooky:{n:"Seasonal", items:[["none","Nothing","",0],["jack","Jack-o'-Lantern","🎃",0,"oct"],["webs","Cobwebs","🕸️",300,"oct"],["bats","Bat Garland","🦇",500,"oct"],["cauldron","Bubbling Cauldron","🧪",700,"oct"]]}
};
function homeState(){ const H = huntState(); H.homeD = H.homeD || {own:{}, eq:{bed:"nest", rug:"woven", light:"candle", plant:"fern", wall:"none", toy:"ball", spooky:"none"}}; return H.homeD; }
function decorItem(slot, id){ return DECOR[slot].items.find(x => x[0] === id); }
function atHome(){ return !!(state.hunt && state.hunt.home); }
function goHome(){ sfx("home"); const H = huntState(); H.town = false; if (!zone().home){ toast("🏠 Your den is in the Meadow. Travel back there first."); return; } if (B.titan || B.mega || B.chapter || moonActive()){ toast("You can't slip away in the middle of a big fight!"); return; }
  const d = $("#dingo"); if (d && !calm){ d.classList.add("gohome"); } setTimeout(() => { H.home = true; H.homeSince = Date.now(); if (d) d.classList.remove("gohome"); B.enemies.forEach(E => E.el.remove()); B.enemies = []; applyHome(); save("Home sweet home 🏠"); render(); }, calm ? 0 : 900); }
function leaveHome(){ const H = huntState(), stayed = Date.now() - (H.homeSince || Date.now()); H.home = false;
  if (stayed >= 10*60000){ H.buffs = H.buffs || {}; H.cozyUntil = Date.now() + 30*60000; toast("🔥 You feel cozy and rested! +15% damage and drops for 30 minutes."); }
  applyHome(); const d = $("#dingo"); if (d && !calm){ d.classList.add("comeout"); setTimeout(() => d.classList.remove("comeout"), 1100); } B.spawnIn = 2.5; save("Back out to the Meadow 🌼"); render(); }
function cozyMult(){ if (devOn) return 1.15; return state.hunt && state.hunt.cozyUntil > Date.now() ? 1.15 : 1; }
function homeScene(){ const D = homeState(), eq = D.eq, K = state.pack || {pups:[], equipped:[]}, pups = K.equipped.map(id => K.pups.find(p => p.id === id)).filter(Boolean).slice(0,4), t = tod(), oct = isOct();
  const ic = (slot) => { const it = decorItem(slot, eq[slot]); return it && it[2] ? emoImg(it[2]) : ""; };
  const curl = document.querySelector(".curl") ? "" : "";
  return `<div class="homescene tod-${t}${oct ? " oct" : ""}${D.editing ? " editing" : ""}">
    <div class="hwall"></div><div class="harch"><div class="hwin"><span class="hsky"></span>${t === "night" || t === "dusk" ? emoImg("🌙") : emoImg("☀️")}</div></div>
    <div class="hglow"></div>
    <span class="hdec wallart" data-slot="wall">${ic("wall")}</span><span class="hdec light" data-slot="light">${ic("light")}</span><span class="hdec plant" data-slot="plant">${ic("plant")}</span><span class="hdec spooky" data-slot="spooky">${eq.spooky !== "none" ? ic("spooky") : ""}</span>${wallRackHtml()}
    <div class="hfloor"></div><span class="hrug rug-${eq.rug}" data-slot="rug">${eq.rug === "woven" ? "" : ic("rug")}</span>
    <span class="hdec bed" data-slot="bed">${ic("bed")}</span>
    <div class="hdingo"><svg class="curl" viewBox="0 0 200 124" aria-hidden="true"><g class="breathe"><ellipse cx="108" cy="78" rx="62" ry="29" fill="#e39a55"/><ellipse cx="140" cy="80" rx="27" ry="22" fill="#e39a55"/><path d="M80 90c10 6 30 8 44 4" stroke="#f6e7cf" stroke-width="7" stroke-linecap="round" fill="none" opacity=".8"/><path d="M58 70 63 50 74 66Z M70 68 80 50 86 68Z" fill="#d9894a"/><ellipse cx="66" cy="80" rx="24" ry="17" fill="#e39a55"/><ellipse cx="47" cy="87" rx="14" ry="9" fill="#f6e7cf"/><ellipse cx="35" cy="86" rx="3.4" ry="2.6" fill="#2b1b12"/><path d="M56 79q5 4 10 0" stroke="#2b1b12" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M166 74C194 88 182 116 132 112 104 110 70 110 44 104 66 101 96 102 122 101 152 100 168 92 166 74Z" fill="#e39a55"/></g></svg><span class="zz">💤</span></div>
    <span class="hdec toy" data-slot="toy">${ic("toy")}</span>
    <button class="homeedit" data-homeedit>${D.editing ? "✓ Done decorating" : "✏️ Decorate"}</button>
    <div class="hpups">${pups.map((p,i) => `<span class="hpup" style="--i:${i}">${pupArt(p)}</span>`).join("")}</div>
  </div>`; }
function applyHome(){ const hero = document.querySelector("section.hero"); if (!hero) return; const home = atHome(), town = atTown(); hero.classList.toggle("athome", home || town); let hs = hero.querySelector(".homewrap");
  if (home || town){ if (!hs){ hs = document.createElement("div"); hs.className = "homewrap"; hero.appendChild(hs); } hs.innerHTML = town ? townScene() : homeScene(); } else if (hs) hs.remove(); }
function homeButton(){ return atHome() ? `<button class="homebtn out" data-a="leave-home">🌼 Walk out to the Meadow</button>` : `<button class="homebtn" data-a="go-home" ${zone().home ? "" : "disabled title=\"Your den is in the Meadow\""}>🏠 Head home</button>`; }
function homeSection(){ const D = homeState(), oct = isOct(), home = atHome(), mins = home ? Math.floor((Date.now() - (state.hunt.homeSince||Date.now()))/60000) : 0;
  return `<section class="box homebox" aria-labelledby="home-h"><div class="jar-top"><h2 id="home-h">🏠 Den Decor</h2><span class="small">${home ? (mins < 10 ? `At home · rest ${10 - mins} more min to feel cozy 🔥` : "At home · 🔥 cozy! You'll get a boost when you head out") : "Your cozy den in the Meadow"}</span></div>
    <p class="small">No creatures, no battles. Just you, the pack, and a warm place to curl up. Decorate it however you like. ${home ? "" : "Tap <b>🏠 Head home</b> on the skill bar (in the Meadow) to see it."}</p>
    <div class="btns" style="margin-bottom:8px">${home ? `<button class="homebtn out" data-a="leave-home">🌼 Walk out to the Meadow</button>` : `<button class="homebtn" data-a="go-home" ${zone().home ? "" : "disabled"}>🏠 Head home now</button>`}</div>
    ${Object.entries(DECOR).filter(([slot,S]) => slot !== "spooky" || oct || Object.keys(D.own).some(k => k.startsWith("spooky:"))).map(([slot,S]) => `<h3 class="pack-h">${esc(S.n)}</h3><div class="decorrow">${S.items.filter(it => !it[4] || oct || D.own[slot + ":" + it[0]]).map(it => { const own = it[3] === 0 || D.own[slot + ":" + it[0]], on = D.eq[slot] === it[0], cur = it[4] === "oct" ? "candy" : "coins", have = cur === "candy" ? evCur() : shopState().coins;
      return `<button class="decor${on ? " on" : ""}" data-a="decor" data-id="${slot}:${it[0]}" ${!own && have < it[3] ? "disabled" : ""}>${it[2] ? emoImg(it[2]) : "—"}<b>${esc(it[1])}</b><span class="small">${on ? "✓ Placed" : own ? "Place" : (cur === "candy" ? "🍬 " : "🪙 ") + it[3]}</span></button>`; }).join("")}</div>`).join("")}
  </section>`; }

{ const __rsb = renderSkillBar; renderSkillBar = function(){ __rsb.apply(this, arguments); renderSkillBarHome(); }; }
