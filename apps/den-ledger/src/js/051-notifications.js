/* ===================== v0.32 Notifications: ONE entry point =====================
   notify(kind, data). Every message in the game goes through here, so placement, de-duplication and pacing live in one spot.
   kinds:  "loot"  {icon, text, col}  → loot feed (top-left of the scene)
           "info"  {text}             → message column (top-right, under the area bar). Repeats merge as ×N.
           "event" {title, sub}       → banner in the sky. Queued, one at a time, duplicates skipped.
           "shout" {text}             → short pop above your dingo (skill shouts)
           "mail"  {mail}             → new-mail notice (top-right)
   Old helpers toast(), feed(), moonBanner(), floatText(), mailNotice() are thin wrappers kept for older code. */
const NOTE = {bannerQ: [], bannerOn: false, lastBanner: ""};
function notify(kind, d){ d = d || {};
  if (kind === "loot") return _showFeed(d.icon || "✨", d.text || "", d.col);
  if (kind === "info"){ const m = String(d.text || ""); if (/dropped|Caught the raccoon|Rare Dingo Coin|^🧪 The boss/.test(m)){ const x = m.match(/^(\S+)\s+(.*)$/); return _showFeed(x ? x[1] : "✨", x ? x[2] : m); } return _showToast(m); }
  if (kind === "event"){ const key = (d.title || "") + "|" + (d.sub || ""); if (key === NOTE.lastBanner && NOTE.bannerOn) return; if (NOTE.bannerQ.some(b => b.key === key)) return;
    NOTE.bannerQ.push({key, t: d.title || "", s: d.sub || ""}); if (NOTE.bannerQ.length > 3) NOTE.bannerQ.shift(); if (!NOTE.bannerOn) noteNextBanner(); return; }
  if (kind === "shout") return _showShout(d.text || "");
  if (kind === "mail") return _showMail(d.mail || {});
}
function noteNextBanner(){ const b = NOTE.bannerQ.shift(); if (!b){ NOTE.bannerOn = false; return; } NOTE.bannerOn = true; NOTE.lastBanner = b.key; _showBanner(b.t, b.s); setTimeout(noteNextBanner, calm ? 1800 : 3300); }
function toast(msg){ notify("info", {text: msg}); }
function feed(icon, text, col){ notify("loot", {icon, text, col}); }
function moonBanner(t, s){ notify("event", {title: t, sub: s}); }
function floatText(txt){ notify("shout", {text: txt}); }
function mailNotice(m){ notify("mail", {mail: m}); }
function _showToast(msg){ 
  const box = $("#toasts"); if (!box) return; const same = [...box.children].find(x => x.dataset.k === msg);
  if (same){ const n = (+same.dataset.n || 1) + 1; same.dataset.n = n; same.textContent = msg + "  ×" + n; clearTimeout(same._t); same._t = setTimeout(() => same.remove(), 3200); return; }
  while (box.children.length >= 4) box.firstChild.remove(); const t = document.createElement("div"); t.className = "toast"; t.dataset.k = msg; t.textContent = msg; box.appendChild(t); t._t = setTimeout(() => t.remove(), 3200); }
/* Loot feed (v0.18): small stacked lines in the corner, like most loot-heavy games. Repeats merge into ×N. */
function _showFeed(icon, text, col){ const hero = document.body; /* v0.41: the loot feed lives on the page, not in the scene, so camera zoom never resizes it */ let box = hero && hero.querySelector(".lootfeed.inhero");
  if (hero && !box){ box = document.createElement("div"); box.className = "lootfeed inhero"; box.setAttribute("aria-live","polite"); hero.appendChild(box); }
  if (!box) box = document.getElementById("lootfeed"); if (!box) return; const key = icon + "|" + text;
  const old = [...box.children].find(x => x.dataset.k === key && !x.classList.contains("out"));
  if (old){ const n = (+old.dataset.n || 1) + 1; old.dataset.n = n; const c = old.querySelector(".lfn"); c.textContent = " ×" + n; old.classList.remove("bump"); void old.offsetWidth; old.classList.add("bump"); clearTimeout(old._t); old._t = setTimeout(() => lfOut(old), 4200); return; }
  while (box.children.length >= 5) box.lastChild.remove();
  const d = document.createElement("div"); d.className = "lf"; d.dataset.k = key; d.dataset.n = 1; if (col) d.style.setProperty("--lc", col);
  d.innerHTML = `<span class="lfi">${/^</.test(icon) ? icon : emoImg(icon)}</span><span class="lft">${esc(text)}<span class="lfn"></span></span>`;
  box.prepend(d); d._t = setTimeout(() => lfOut(d), 4200); }
function fkNoteShift(){ const t = document.getElementById("toasts"), n = document.querySelector(".mailnote"); if (!n || !fkOn) return; n.style.marginTop = t && t.children.length ? (t.offsetHeight + 8) + "px" : ""; }
setInterval(fkNoteShift, 300);
function lfOut(d){ d.classList.add("out"); setTimeout(() => d.remove(), 500); }
