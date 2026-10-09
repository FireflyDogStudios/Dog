/* ===== v0.26 ground loot ===== Rewards are already in your bag/counters the moment they drop (saves stay safe); the ground item is the fun part. */
const GL = [];
const GL_STING = {common:"blip", uncommon:"coin", rare:"chime", epic:"gem", legendary:"shimmer", godly:"shimmer", mythic:"shimmer", titan:"shimmer"};
function glChest(tier){ const c = tier === "legendary" ? ["#e3b23c","#8a5a10","#fff2b0"] : tier === "epic" ? ["#7a8892","#3a4650","#e8741c"] : ["#9a6a3a","#5a3a1a","#a77bd6"];
  return `<svg class="glc" viewBox="0 0 30 26"><rect x="3" y="11" width="24" height="13" rx="2" fill="${c[0]}" stroke="${c[1]}" stroke-width="1.6"/><rect x="3" y="15" width="24" height="2.4" fill="${c[2]}" opacity=".85"/><g class="lid" style="transform-box:fill-box;transform-origin:0% 100%"><path d="M3 11 Q15 1 27 11 Z" fill="${c[0]}" stroke="${c[1]}" stroke-width="1.6"/><rect x="12.5" y="8" width="5" height="6" rx="1" fill="${c[2]}" stroke="${c[1]}" stroke-width="1"/></g></svg>`; }
function spawnLoot(o){ const L = battleLayer(), P = dingoPos(), hero = document.querySelector("section.hero");
  if (!L || !P || calm || !hero || (typeof atHome === "function" && atHome())){ if (o.onPick) o.onPick(null); return; }
  while (GL.length >= 24) glCollect(GL[0], true);
  const tier = o.tier || "common", beam = {rare:46, epic:70, legendary:100, godly:110, mythic:110, titan:120}[tier] || 0;
  const el = document.createElement("div"); el.className = "gl t-" + tier + (o.big ? " big" : "") + (o.meat ? " t-meat" : "");
  el.style.setProperty("--lc", o.col || "#b8c4bb"); if (beam) el.style.setProperty("--bh", beam + "px");
  el.innerHTML = `${beam ? `<span class="glb"></span>` : ""}<span class="glr"></span><span class="gli">${o.chest ? glChest(tier) : o.html}</span>`;
  const gy = P.y + 2, sx = o.x, sy = Math.min(gy, o.y || gy), tx = Math.max(P.x + 40, o.x + (o.dx !== undefined ? o.dx : 10 + Math.random()*40));
  el.style.left = tx + "px"; el.style.top = gy + "px"; L.appendChild(el);
  if (el.animate) el.animate([{transform:`translate(${sx - tx}px, ${sy - gy}px) scale(.4)`}, {transform:`translate(${(sx - tx)/2}px, ${sy - gy - 46}px) scale(1.1)`, offset:.45}, {transform:"translate(0,0) scale(1)"}], {duration:520, easing:"cubic-bezier(.3,.7,.4,1)"});
  GL.push({el, x: tx, y: gy, born: performance.now(), o}); }
function glTick(dt, P, walking){ if (!GL.length || !P) return; const now = performance.now();
  for (const g of GL.slice()){ const hold = g.o.meat ? 350 : ({rare:900, epic:1100, legendary:1400, godly:1400, mythic:1400, titan:1600}[g.o.tier] || 550), age = now - g.born;
    if (age > hold){ g.v = Math.min(1400, (g.v || 60) + 1600 * dt); g.x -= (g.v + (walking ? 52 : 0)) * dt; g.el.style.left = g.x + "px"; }
    else if (walking){ g.x -= 52 * dt; g.el.style.left = g.x + "px"; }
    if (g.x <= P.x + 26 || age > hold + 2500) glCollect(g); } }
function glCollect(g, instant){ const i = GL.indexOf(g); if (i < 0) return; GL.splice(i, 1); const o = g.o, P = dingoPos();
  if (o.chest && !instant){ g.el.classList.add("open"); setTimeout(() => glFinish(g, P), 260); } else glFinish(g, P, instant); }
function glFinish(g, P, instant){ const o = g.o; if (!instant && FX_RCOL[o.tier]) pfx("pickup", g.x, g.y - 6, o.col || "#ffd34d"); if (!instant && P && g.el.animate){ g.el.animate([{transform:"translate(0,0) scale(1)", opacity:1}, {transform:`translate(${P.x - g.x}px, -10px) scale(.4)`, opacity:0}], {duration:300, easing:"ease-in", fill:"forwards"}).onfinish = () => g.el.remove(); } else g.el.remove();
  if (!instant) sfx(o.meat ? "pop" : (GL_STING[o.tier] || "blip")); if (o.onPick) o.onPick(g); }
function glFly(icon, g){ const hero = document.querySelector("section.hero"), chip = fkOn ? document.getElementById("fk-meat") : gameEvent() ? $("#chip-ev") : $("#chip-meat"); if (!hero || !g) return;
  const q = stageToScreen(g.x, g.y + 10), tb = chip ? chip.getBoundingClientRect() : {left: innerWidth-60, top: 20, width: 20, height: 20}, sx = q.x, sy = q.y;
  const m = document.createElement("span"); m.className = "meatfly"; m.innerHTML = emoImg(icon); document.body.appendChild(m);
  m.animate([{left: sx+"px", top: sy+"px", transform:"scale(1)"}, {left: (tb.left + tb.width/2)+"px", top: (tb.top + tb.height/2)+"px", transform:"scale(.4)", opacity:.85}], {duration:700, easing:"cubic-bezier(.4,0,.6,1)", fill:"forwards"}).onfinish = () => m.remove(); }
function lootPile(x, y, items, col){ items.forEach((it, i) => setTimeout(() => spawnLoot({x, y, dx: 6 + i*16 + Math.random()*8, html: emoImg(it[0]), tier: "legendary", col: col || "#ffd34d", onPick: () => feed(it[0], it[1], col || "#ffd34d")}), i*90)); }
function meatShower(x, y, n, coin){ /* v0.26: one meat chunk on the ground (bigger for bosses); a coin lands next to it */
  const ic = gameEvent() ? gameEvent().cur.icon : "🍖";
  spawnLoot({x, y, html: emoImg(ic), meat: true, big: n >= 10, dx: 4 + Math.random()*16, onPick: g => glFly(ic, g)});
  if (coin) spawnLoot({x, y, html: emoImg("🪙"), meat: true, dx: 22 + Math.random()*16, col: "#ffd34d", onPick: g => glFly("🪙", g)}); }
function dropMult(hp){ const dd = Math.max(0.1, dingoDps()); return Math.max(0.2, Math.min(1.5, hp / (dd * 8))); }
function updateHuntHud(){ const H = huntState(), S = shopState();
  const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  set("chip-meat", emoImg("🍖") + " " + fmtMeat(H.meats)); if (gameEvent()) set("chip-ev", emoImg(gameEvent().cur.icon) + " " + coinsFmt(evCur())); set("chip-coin", emoImg("🪙") + " " + coinsFmt(S.coins));
  set("hunt-meats", emoImg("🍖") + " " + fmtMeat(H.meats)); set("pack-meats", emoImg("🍖") + " " + fmtMeat(H.meats)); set("hunt-coins", emoImg("🪙") + " " + coinsFmt(S.coins));
  set("hunt-kills", "Level " + playerLevel() + " woods · " + H.kills.toLocaleString() + " kills"); set("hunt-best", "Best drop: " + fmtMeat(H.bestDrop) + " meats");
  const cv = document.querySelector('[data-a="meat-convert"]'); if (cv) cv.disabled = H.meats < MEAT_PER_COIN; }
