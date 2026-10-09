/* ===== game layer ===== */
const TITLES = ["Pup","Den Sitter","Scout","Tracker","Trail Runner","Pack Guard","Howler","Moon Chaser","Wild Dingo","Legend of the Woods"];
let chipPop = false, pendingLevel = 0, lastPt = null, soundOn = false, actx = null;
try { soundOn = localStorage.getItem("den-sound") === "on"; } catch(e){}
function levelFrom(xp){ let lvl = 1, need = 10, rem = xp; while (rem >= need){ rem -= need; lvl++; need = 10*lvl; } return {lvl, into: rem, need}; }
function titleFor(l){ return l <= TITLES.length ? TITLES[l-1] : "Legend +" + (l - TITLES.length); }
document.addEventListener("pointerdown", ev => { lastPt = {x: ev.clientX, y: ev.clientY}; }, true);
function _showShout(txt){
  if (calm) return; let p = lastPt || {x: innerWidth/2, y: innerHeight/2};
  if (fkOn){ const hero = document.querySelector("section.hero"), P = dingoPos(); if (hero && P){ const r = hero.getBoundingClientRect(); const q = stageToScreen(P.x + 10, P.y - 70); p = {x: q.x, y: q.y}; } }
  const el = document.createElement("div"); el.className = "float"; el.textContent = txt;
  el.style.left = p.x + "px"; el.style.top = p.y + "px"; document.body.appendChild(el); setTimeout(() => el.remove(), 1200);
  lastPt = {x: p.x + 14, y: p.y - 18};
}
