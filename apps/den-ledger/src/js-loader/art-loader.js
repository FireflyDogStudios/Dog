/* v0.42 art loader: fetch the art files (documented to work for files published with the page), keep them in
   IndexedDB so later visits don't download them again, and inject them as <style>. Retries once; tells the player if it fails. */
(function(){ window.__artReady = false; const V = {base:"ae335b59", alt:"844522c6"};
  function idb(){ return new Promise((res, rej) => { try { const r = indexedDB.open("den-art", 1); r.onupgradeneeded = () => r.result.createObjectStore("a"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch(e){ rej(e); } }); }
  async function get(k){ try { const db = await idb(); return await new Promise(res => { const q = db.transaction("a").objectStore("a").get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(null); }); } catch(e){ return null; } }
  async function put(k, v){ try { const db = await idb(); await new Promise(res => { const tx = db.transaction("a", "readwrite"); tx.objectStore("a").put(v, k); tx.oncomplete = res; tx.onerror = res; }); } catch(e){} }
  function inject(id, css){ const s = document.createElement("style"); s.id = id; s.textContent = css; document.head.appendChild(s); }
  async function load(name){ const c = await get(name); if (c && c.v === V[name] && c.css){ inject("art-" + name, c.css); return true; }
    for (let i = 0; i < 2; i++){ try { const r = await fetch("art-" + name + ".css", {cache:"no-cache"}); if (r.ok){ const css = await r.text(); if (css.length > 1000){ inject("art-" + name, css); put(name, {v:V[name], css}); return true; } } } catch(e){} await new Promise(r => setTimeout(r, 1500)); }
    return false; }
  window.__artLoad = load("base").then(ok => { window.__artReady = true; if (window.__bootWait) window.__bootWait();
    if (!ok){ const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "art-base.css"; document.head.appendChild(l); const n = document.createElement("div"); n.style.cssText = "position:fixed;left:50%;bottom:150px;transform:translateX(-50%);z-index:99999;background:#1a1410;color:#ece3cf;border:1px solid #d9a441;padding:8px 14px;font:600 14px sans-serif"; n.textContent = "Some of the game's art couldn't load. Reload the page to try again."; document.body.appendChild(n); setTimeout(() => n.remove(), 9000); return; }
    return load("alt").then(ok2 => { if (ok2 && window.__artAlt) window.__artAlt(); }); });
})();
