/* ===== Town (Meadow): a calm hub for shops and services ===== */
const TOWN_SPOTS = [
  {id:"post", i:"🏤", n:"Post Office", d:"Your mail and gifts", go:() => openMail()},
  {id:"bank", i:"🏦", n:"Bank", d:"Your vault", go:() => { state.bagView = "vault"; tab = "bag"; render(); }},
  {id:"upg", i:"🏪", n:"Workshop", d:"Upgrades and den decor", go:() => { tab = "upgrades"; render(); }},
  {id:"smithy", i:"⚒️", n:"Smithy", d:"Coming soon: upgrade your god weapons", soon:true},
  {id:"market", i:"📈", n:"Meat Market", d:"Coming soon: daily trading", soon:true}
];
function atTown(){ return false; }
function townScene(){ const t = tod(), s = seasonKey();
  return `<div class="townscene tod-${t} s-${s}"><div class="tsky"></div><div class="tground"></div>
    <div class="tstreet">${TOWN_SPOTS.map(sp => `<button class="tbuild${sp.soon ? " soon" : ""}" data-town="${sp.id}" title="${esc(sp.n)}: ${esc(sp.d)}">${emoImg(sp.i)}<span>${esc(sp.n)}</span></button>`).join("")}</div>
    <span class="tdingo">${emoImg("🐕")}</span></div>`; }
document.addEventListener("click", ev => { const b = ev.target.closest("[data-town]"); if (!b) return; ev.stopPropagation(); const sp = TOWN_SPOTS.find(x => x.id === b.dataset.town); if (!sp) return; if (sp.soon){ toast(sp.i + " The " + sp.n + " is still being built. " + sp.d.replace("Coming soon: ","Soon you'll ") + "!"); return; } sfx("tab"); sp.go(); });

function kidSpawn(E, P, mode){ const K = ABILITY_KIDS[E.icon]; if (!K) return; spawnEnemy("add:" + K[0] + ":" + K[1]); const a = B.enemies[B.enemies.length-1]; if (!a || a === E) return; a.passing = true;
  if (mode === "throw"){ a.toss = {t:0, from:E.x, to:P.x - 40 - Math.random()*40}; a.x = E.x; } else { a.x = P.x - 50 - Math.random()*50; poof(a.x, P.y - 4, 6, "rgba(180,120,255,.7)"); } a.el.style.left = a.x + "px"; }
function abilityFire(E, P, now){ const d = $("#dingo"), art = E.el.querySelector(".eart");
  if (E.ab === "shove"){ if (art && art.animate) art.animate([{transform:"translateX(0)"},{transform:"translateX(-26px) scale(1.2,.85)", offset:.4},{transform:"translateX(0)"}], {duration:420}); if (d){ d.classList.remove("pushed"); void d.offsetWidth; d.classList.add("pushed"); setTimeout(() => d.classList.remove("pushed"), 1300); } B.dazedUntil = now + 900; heroShake(6, 300); dmgPop(P.x, P.y - 30, "SHOVED!", true); B.enemies.forEach(o => { if (o !== E && !o.boss && !o.passing && !o.fixed) o.kb = 14; }); }
  else if (E.ab === "throw"){ if (art && art.animate) art.animate([{transform:"rotate(0)"},{transform:"rotate(-18deg) translateY(-6px)", offset:.4},{transform:"rotate(0)"}], {duration:380}); kidSpawn(E, P, "throw"); dmgPop(E.x, P.y - 40, "TOSS!", false); }
  else if (E.ab === "summon"){ for (let i=0;i<2;i++) setTimeout(() => { if (!E.dead) kidSpawn(E, P, "summon"); }, i*220); dmgPop(E.x, P.y - 40, "SUMMON!", false); } }

