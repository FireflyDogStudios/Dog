/* ===== Juice: hitstop, squash & stretch, sparks, knockback, local shake ===== */
function hitstop(ms){ if (calm) return; const base = B.last || performance.now(); B.freezeUntil = Math.min(base + 400, Math.max(B.freezeUntil || 0, base + ms)); }
function heroShake(px, ms){ if (calm) return; const hero = document.querySelector("section.hero"); if (!hero || !hero.animate) return; const k = [];
  for (let i=0;i<6;i++){ const f = 1 - i/6; k.push({transform:`translate(${((Math.random()*2-1)*px*f).toFixed(1)}px, ${((Math.random()*2-1)*px*0.6*f).toFixed(1)}px)`}); } k.push({transform:"translate(0,0)"}); hero.animate(k, {duration: ms || 200, easing:"linear"}); }
function squash(el, sx, sy, ms){ if (calm || !el || !el.animate) return; el.animate([{transform:`scale(${sx},${sy})`},{transform:`scale(${(2-sx)*0.97+0.03},${(2-sy)*0.97+0.03})`, offset:.45},{transform:"scale(1,1)"}], {duration: ms || 240, easing:"cubic-bezier(.2,.9,.3,1.2)"}); }
function spark(x, y, col, big){ if (pfx(big ? "crit" : "hit", x, y, col)) return; const L = battleLayer(); if (!L || calm) return; const n = big ? 10 : 6;
  for (let i=0;i<n;i++){ const s = document.createElement("span"), a = (i/n)*360 + Math.random()*20; s.className = "spk-ln"; s.style.cssText = `left:${x}px;top:${y}px;background:${col};--a:${a}deg;--d:${(big ? 26 : 16) + Math.random()*10}px;height:${big ? 3 : 2}px`; L.appendChild(s); setTimeout(() => s.remove(), 300); }
  if (big){ const r = document.createElement("span"); r.className = "spk-ring"; r.style.cssText = `left:${x}px;top:${y}px;border-color:${col}`; L.appendChild(r); setTimeout(() => r.remove(), 320); }
  const f = document.createElement("span"); f.className = "spk-flash" + (big ? " big" : ""); f.style.cssText = `left:${x}px;top:${y}px`; L.appendChild(f); setTimeout(() => f.remove(), 160); }
function poof(x, y, n, col){ if (pfx("poof", x, y, col)) return; const L = battleLayer(); if (!L || calm) return; for (let i=0;i<(n||8);i++){ const p = document.createElement("span"), a = Math.random()*Math.PI*2, d = 14 + Math.random()*22; p.className = "poof"; p.style.cssText = `left:${x}px;top:${y}px;--x:${Math.cos(a)*d}px;--y:${Math.sin(a)*d - 8}px;--s:${(0.6 + Math.random()*0.8).toFixed(2)};background:${col || "rgba(230,230,240,.85)"}`; L.appendChild(p); setTimeout(() => p.remove(), 520); } }
const RARITY_SPARK = {titan:"#ff2d55", junk:"#cfcfcf", common:"#e8efe9", uncommon:"#6fb3e0", rare:"#b98cf0", epic:"#ff8a2a", legendary:"#ffd34d", godly:"#ff4fd8", mythic:"#00e5ff"};
function ease(t, kind){ t = Math.max(0, Math.min(1, t)); if (kind === "in") return t*t*t; if (kind === "out") return 1 - Math.pow(1-t, 3); return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }

function syncStride(){ const hero = document.querySelector("section.hero"), d = $("#dingo"); if (!hero || !d) return; const dw = d.offsetWidth || 88;
  const ground = STAGE_WALK, sweep = 12.1 * (dw / 88), stride = Math.max(0.55, Math.min(1.4, sweep / (0.62 * ground))); d.style.setProperty("--stride", stride.toFixed(2) + "s"); }
window.addEventListener("resize", () => setTimeout(syncStride, 100)); setTimeout(() => { fkApplyScale(); syncStride(); if (typeof fxApply === "function") fxApply(); }, 0);
