/* ===== v0.40 The Den Stage (see DEN-GAME-SCREEN.md) =====
   The scene is laid out in fixed LOGICAL units and scaled to the screen, so the game plays the same on a laptop, a 4K
   monitor or a TV. Game logic never reads screen pixels: the dingo stands at STAGE_DINGO_X, creatures spawn at the end
   of a fixed lane (STAGE_LANE), and the world scrolls past at STAGE_WALK units/second while the dingo walks.
   The interface scales separately: fit-to-screen × the player's Interface size (Small / Normal / Large / Larger). */
const STAGE_H = 640, STAGE_MIN_W = 760, STAGE_LANE = 1330, STAGE_DINGO_X = 300, STAGE_WALK = 52;
const STAGE = {s:1, w:STAGE_LANE, h:STAGE_H, camX:0};
const CAM_MIN = 1, CAM_MAX = 2;
let camZoom = (() => { try { const v = parseFloat(localStorage.getItem("dengame-zoom")); if (v >= CAM_MIN && v <= CAM_MAX) return v; } catch(e){} return 1; })();
function setZoom(v){ camZoom = Math.round(Math.max(CAM_MIN, Math.min(CAM_MAX, v)) * 100) / 100; try { localStorage.setItem("dengame-zoom", String(camZoom)); } catch(e){} stageFit(); }
/* scroll wheel over the Meadow zooms the camera; over any window, panel or bar it scrolls as usual */
document.addEventListener("wheel", e => { if (e.ctrlKey) return; const t = e.target; if (!t || !t.closest || !t.closest("section.hero") || t.closest(".fkw,.fkp,.homewrap button")) return; if (typeof atHome === "function" && atHome()) return; e.preventDefault(); setZoom(camZoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08)); }, {passive:false});
const UI_SIZES = [["0.85","Small"],["1","Normal"],["1.15","Large"],["1.3","Larger"]];
let uiPref = (() => { try { const v = parseFloat(localStorage.getItem("dengame-uipref")); if (v >= 0.8 && v <= 1.35) return v; } catch(e){} return 1; })();
function uiFit(){ return Math.max(0.68, Math.min(2.2, Math.min(innerHeight / 860, innerWidth / 1400))); }
let fkScale = Math.round(uiFit() * uiPref * 100) / 100;
function fkApplyScale(){ fkScale = Math.round(uiFit() * uiPref * 100) / 100; document.documentElement.style.setProperty("--fkz", String(fkScale)); stageFit(); fkClampWins(); }
/* keep every open window on screen after the interface size or the window size changes */
function fkClampWins(){ if (typeof FKW === "undefined") return; const z = fkScale; FKW.wins.forEach(w => { const el = w.el, maxW = (innerWidth - 24) / z, maxH = (innerHeight - 24) / z;
  let W = parseFloat(el.style.width) || el.offsetWidth, H = parseFloat(el.style.height) || el.offsetHeight; if (W > maxW){ W = maxW; el.style.width = W + "px"; } if (H > maxH){ H = Math.max(220, maxH); el.style.height = H + "px"; }
  let L = parseFloat(el.style.left) || 0, T = parseFloat(el.style.top) || 0; L = Math.max(0, Math.min(L, innerWidth - W * z - 8)); T = Math.max(0, Math.min(T, innerHeight - H * z - 8)); el.style.left = L + "px"; el.style.top = T + "px"; }); }
function uiSetPref(v){ uiPref = v; try { localStorage.setItem("dengame-uipref", String(v)); } catch(e){} fkApplyScale(); }
function stageFit(){ const hero = document.querySelector("section.hero"); if (!hero) return;
  const bot = Math.round(124 * fkScale), sh = Math.max(200, innerHeight - bot), sw = innerWidth;
  let s0 = sh / STAGE_H; if (sw / s0 < STAGE_MIN_W) s0 = sw / STAGE_MIN_W; const s = s0 * camZoom;
  /* camera: zooming in keeps the dingo about a quarter of the way across, so it never slides off to the side */
  const vw = sw / s, camX = Math.max(0, STAGE_DINGO_X - 0.24 * vw);
  STAGE.s = s; STAGE.w = vw + camX; STAGE.h = sh / s; STAGE.camX = camX;
  hero.style.minHeight = "0"; hero.style.width = STAGE.w + "px"; hero.style.height = STAGE.h + "px"; hero.style.translate = (-camX * s) + "px 0"; hero.style.scale = String(s); /* the separate scale property, so shakes (which animate transform) never undo it */
  document.documentElement.style.setProperty("--hs", String(s)); if (typeof pixiFit === "function") pixiFit(); }
function stageToScreen(x, y){ const hero = document.querySelector("section.hero"), r = hero ? hero.getBoundingClientRect() : {left:0, top:0}; return {x: r.left + x * STAGE.s, y: r.top + y * STAGE.s}; } /* the rect already includes the camera shift */
window.addEventListener("resize", () => { fkApplyScale(); fkTick && fkTick(true); });
function fkSetup(){ document.body.classList.toggle("fk", fkOn); fkApplyScale(); if (!fkOn) FKW.wins.slice().forEach(w => fkCloseWin(w)); }
function fkSet(on){ fkOn = on; try { localStorage.setItem("dengame-ui", on ? "new" : "classic"); } catch(e){} fkSetup(); render(); fkTick(true); }
const FKW = {wins: [], z: 50, mailOpen: new Set()};
function fkWinFor(t){ return FKW.wins.find(w => w.t === t); }
function fkFront(w){ FKW.z += 1; w.el.style.zIndex = FKW.z; FKW.wins.forEach(x => x.el.classList.toggle("front", x === w)); if (w.t[0] !== "@") tab = w.t; }
function fkOpen(t, keep){ if (t === "@settings"){ openSettings(); return; } if (t === "@home"){ const b = document.createElement("button"); b.dataset.a = atHome() ? "leave-home" : "go-home"; if (!atHome() && !zone().home){ toast("Your den is in the Meadow. Travel there first."); return; } (document.getElementById("rest") || document.body).appendChild(b); b.click(); b.remove(); fkTick(true); return; }
  if (t !== "@mail" && !isUnlocked(t)) return; if (DEN_DOCK.some(x => x[0] === t) && !atHome()){ toast((t === "stash" ? "Your Stash" : "The Library") + " is in the Den. Head home to use it."); return; } let w = fkWinFor(t);
  if (w){ if (!keep && w.el.classList.contains("front")){ fkCloseWin(w); return; } fkFront(w); fkRenderWin(w); fkTick(true); return; }
  const T = FK_DOCK.concat(DEN_DOCK).find(x => x[0] === t) || [t, "knapsack", "Den", ""], el = document.createElement("section");
  el.className = "fkw"; el.dataset.t = t; el.setAttribute("aria-label", T[2]);
  el.innerHTML = `<div class="fkw-h"><h2>${fkIcon(T[1])}${esc(T[2])}</h2><button class="fkw-x" type="button" data-fkclose aria-label="Close ${esc(T[2])}">✕</button></div><div class="fkw-sub"></div><div class="fkw-b"></div>`;
  const z = fkScale, vw = innerWidth / z, vh = innerHeight / z, SZ = FK_SIZE[t], W = Math.min(SZ ? SZ[0] : t === "@mail" ? 620 : 900, vw - 140), H = Math.min(SZ ? SZ[1] : t === "@mail" ? 560 : 680, vh - 230), k = FKW.wins.length;
  el.style.width = W + "px"; el.style.height = H + "px"; el.style.left = (t === "bag" ? 84 : t === "stash" ? Math.max(84, innerWidth - W * z - 92) : (Math.max(70, (innerWidth - W * z) / 2) + k * 32)) + "px"; el.style.top = Math.min(innerHeight - 160, Math.max(118, (innerHeight - 92 - H * z) / 2) + k * 32) + "px";
  document.body.appendChild(el); w = {t, el}; FKW.wins.push(w); fkFront(w); fkRenderWin(w); fkTick(true); sfx("tab"); }
/* v0.38b: a window's frame never scrolls. Focus and scrollIntoView can scroll an overflow:hidden box, which pushed the title bar out of sight. */
document.addEventListener("scroll", e => { const t = e.target; if (t && t.classList && t.classList.contains("fkw") && (t.scrollTop || t.scrollLeft)){ t.scrollTop = 0; t.scrollLeft = 0; } }, true);
function fkCloseWin(w){ w.el.remove(); FKW.wins = FKW.wins.filter(x => x !== w); const top = FKW.wins.slice().sort((a,b) => (+b.el.style.zIndex) - (+a.el.style.zIndex))[0]; if (top) fkFront(top); fkTick(true); }
function fkClose(){ const top = FKW.wins.slice().sort((a,b) => (+b.el.style.zIndex) - (+a.el.style.zIndex))[0]; if (top) fkCloseWin(top); }
function fkRenderWin(w){ const body = w.el.querySelector(".fkw-b"), sub = w.el.querySelector(".fkw-sub"); if (!body) return;
  { const ae = document.activeElement; if (ae && ae.matches && ae.matches("input[data-invname]") && body.contains(ae)) return; } /* don't redraw under someone typing a bag name */
  const st = body.scrollTop, opened = [...body.querySelectorAll("details")].map((d,i) => d.open ? i : -1).filter(i => i >= 0), fa = document.activeElement, fsel = fa && body.contains(fa) && fa.matches("input[data-invq]") ? [fa.selectionStart, fa.selectionEnd] : null;
  if (w.t === "@mail"){ body.innerHTML = fkMailHtml(); sub.innerHTML = ""; body.scrollTop = st; return; }
  const was = tab; tab = w.t; let html = "";
  try { const L = LAYOUT[w.t] || {}, ids = [].concat(L.full || [], ...(L.cols || []), L.after || []).filter(id => id !== "credits-h");
    html = ids.filter(id => LAZY[id]).map(id => { try { return LAZY[id](); } catch(e){ return ""; } }).join(""); } finally { tab = was; }
  body.innerHTML = `<div class="tabpane">${html}</div>`; sub.innerHTML = ""; body.querySelectorAll(".subtabs").forEach(s => sub.appendChild(s));
  const ds = body.querySelectorAll("details"); opened.forEach(i => { if (ds[i]) ds[i].open = true; }); body.scrollTop = st;
  if (fsel){ const q = body.querySelector("input[data-invq]"); if (q){ q.focus(); try { q.setSelectionRange(fsel[0], fsel[1]); } catch(e){} } } }
function fkRenderAll(){ FKW.wins.forEach(w => fkRenderWin(w)); }
function fkMailHtml(){ const list = mailState().slice().sort((a,b) => (b.ts||0) - (a.ts||0));
  if (!list.length) return `<p class="fkmail-empty">No mail right now. Letters from the Den Team show up here.</p>`;
  return list.map(m => { const gift = (m.items||[]).length && !m.claimed, open = FKW.mailOpen.has(m.id);
    return `<details class="fkmail${m.read ? "" : " unread"}" data-mail="${esc(m.id)}"${open ? " open" : ""}><summary><span class="u"></span><span><b>${esc(m.subject || "A letter")}</b><small>From ${esc(m.from || "The Den Team")} · ${esc(m.date || "")}</small></span>${gift ? `<span class="mgift">Gift</span>` : ""}</summary>
      <div class="mb"><p>${esc(m.body || "").replace(/\n/g,"<br>")}</p>
      ${(m.items||[]).length ? `<div class="mi">${m.items.map(it => { const [i,l] = itemLabel(it); return `<span>${emoImg(i)}${esc(l)}</span>`; }).join("")}</div>` : ""}
      <div class="acts">${gift ? `<button class="go" type="button" data-fkclaim="${esc(m.id)}">Accept gifts</button>` : (m.items||[]).length ? `<span class="small">✓ Accepted</span>` : ""}${m.go ? `<button type="button" data-fkgo="${esc(m.id)}">Take me there</button>` : ""}<button type="button" data-fkdel="${esc(m.id)}" ${gift ? 'disabled title="Accept the gifts first"' : ""}>Delete</button></div></div></details>`; }).join(""); }
document.addEventListener("click", e => { const s = e.target.closest && e.target.closest(".fkmail > summary"); if (!s) return; e.preventDefault(); e.stopPropagation(); const d = s.parentElement, id = d.dataset.mail;
  if (FKW.mailOpen.has(id)) FKW.mailOpen.delete(id); else { FKW.mailOpen.add(id); const m = mailState().find(x => x.id === id); if (m && !m.read){ m.read = true; save("Mail read", true); } }
  const w = fkWinFor("@mail"); if (w) fkRenderWin(w); fkTick(true); }, true);
/* drag windows by their title bar; click anywhere to bring to front */
document.addEventListener("pointerdown", e => { const el = e.target.closest && e.target.closest(".fkw"); if (!el) return; const w = FKW.wins.find(x => x.el === el); if (!w) return; if (!el.classList.contains("front")) fkFront(w);
  const hd = e.target.closest(".fkw-h"); if (!hd || e.target.closest("button")) return; e.preventDefault();
  const sx = e.clientX, sy = e.clientY, ox = parseFloat(el.style.left) || 0, oy = parseFloat(el.style.top) || 0;
  const mv = ev => { const r = el.getBoundingClientRect(); el.style.left = Math.min(innerWidth - 80, Math.max(-r.width + 120, ox + ev.clientX - sx)) + "px"; el.style.top = Math.min(innerHeight - 40, Math.max(0, oy + ev.clientY - sy)) + "px"; };
  const up = () => { removeEventListener("pointermove", mv); removeEventListener("pointerup", up); };
  addEventListener("pointermove", mv); addEventListener("pointerup", up); });
/* status tooltips */
let fkTipEl = null;
function fkTipShow(chip){ const tip = document.getElementById("fktip"); if (!tip || !chip) return; fkTipEl = chip; const d = chip.dataset;
  tip.style.setProperty("--tc", chip.classList.contains("cond") ? "#d0675a" : "#7fae7a");
  tip.innerHTML = `<b>${esc(d.name || "")}</b>${esc(d.desc || "")}<small>${chip.classList.contains("cond") ? "Condition" : "Boon"}${d.n ? " · " + esc(d.n) + " stacks" : ""}${d.left ? " · " + esc(d.left) : ""}</small>`; tip.hidden = false;
  const r = chip.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight; let x = r.left + r.width/2 - tw/2, y = r.bottom + 8; if (y + th > innerHeight - 8) y = r.top - th - 8;
  tip.style.left = Math.max(8, Math.min(innerWidth - tw - 8, x)) + "px"; tip.style.top = y + "px"; }
document.addEventListener("mouseover", e => { const c = e.target.closest && e.target.closest(".fk-st"); if (c) fkTipShow(c); else if (fkTipEl){ fkTipEl = null; const t = document.getElementById("fktip"); if (t) t.hidden = true; } });
/* keyed status rows: chips update in place, so hovering and the time bar stay smooth */
function fkStatusRow(box, list){ if (!box) return; const have = new Map([...box.children].map(c => [c.dataset.id, c]));
  { const seen = new Set(); list = list.filter(s => !seen.has(s.id) && seen.add(s.id)); } /* v0.52: one chip per id, whatever the list says (the Trial pace chip used to share the Zoomies id and bred a chip a frame) */
  list.forEach((s, i) => { let c = have.get(s.id); if (!c){ c = document.createElement("span"); c.className = "fk-st " + s.cls; c.dataset.id = s.id; c.innerHTML = fkIcon(s.icon) + `<span class="n"></span>`; }
    have.delete(s.id); if (box.children[i] !== c) box.insertBefore(c, box.children[i] || null);
    c.dataset.name = s.name; c.dataset.desc = s.desc; c.dataset.n = s.n || ""; c.dataset.left = s.left || ""; c.setAttribute("aria-label", s.name);
    c.querySelector(".n").textContent = s.n || ""; c.style.setProperty("--t", Math.max(3, Math.min(100, s.t == null ? 100 : s.t)) + "%"); });
  have.forEach(c => { if (fkTipEl === c){ fkTipEl = null; const t = document.getElementById("fktip"); if (t) t.hidden = true; } c.remove(); });
  if (fkTipEl && box.contains(fkTipEl)) fkTipShow(fkTipEl); }
