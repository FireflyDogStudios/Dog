# Build the published game from index.html (the working copy, which includes the served wrapper).
#   dist/index.html    the page: core styles + game script (small, changes every update)
#   dist/art-base.css  the main emoji/creature art (big, rarely changes, so the browser can keep it cached)
#   dist/art-alt.css   the alternate art sets, loaded after the game starts
# The game in index.html stays one self-contained file for testing; this split only happens at publish time.
import re, os, hashlib
h = open('index.html').read()
pub0 = open('publish.html').read() if os.path.exists('publish.html') else None
start = h.index('<!doctype html>\n<html lang="en">')  # the game document starts after the served wrapper
end = h.find('</script>\n</body>\n</html>\n', start); assert end > 0
doc = h[start:end + len('</script>\n</body>\n</html>\n')]
ART = re.compile(r'\.(e|xt|xn|xb)(\d+)\{background-image:url\("data:image/svg\+xml[^}]*\}')
base, alt = [], []
def pull(m):
    (base if m.group(1) == 'e' else alt).append(m.group(0)); return ''
def strip_styles(d):
    out = []; pos = 0
    for m in re.finditer(r'(<style[^>]*>)(.*?)(</style>)', d, re.S):
        out.append(d[pos:m.start()]); out.append(m.group(1) + ART.sub(pull, m.group(2)) + m.group(3)); pos = m.end()
    out.append(d[pos:]); return ''.join(out)
doc = strip_styles(doc)
assert base and alt, (len(base), len(alt))
os.makedirs('dist', exist_ok=True)
b = '\n'.join(base); a = '\n'.join(alt)
open('dist/art-base.css', 'w').write(b); open('dist/art-alt.css', 'w').write(a)
vb = hashlib.md5(b.encode()).hexdigest()[:8]; va = hashlib.md5(a.encode()).hexdigest()[:8]
# art: a small loader script fetches the art files, caches them in IndexedDB, and injects them (v0.42)
LOADER = r'''<script>/* v0.42 art loader: fetch the art files (documented to work for files published with the page), keep them in
   IndexedDB so later visits don't download them again, and inject them as <style>. Retries once; tells the player if it fails. */
(function(){ window.__artReady = false; const V = {base:"%VB%", alt:"%VA%"};
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
})();</script>
'''
assert doc.count('<script>') == 1, 'expected exactly one <script>'
doc = doc.replace('<script>', LOADER.replace('%VB%', vb).replace('%VA%', va) + '<script>', 1)
doc = doc.replace('let artAltReady = /*ART_ALT_READY*/true;', 'let artAltReady = false;')
open('dist/index.html', 'w').write(doc)
import shutil; shutil.copy('proton.web.min.js', 'dist/proton.web.min.js')  # v0.44 particle library, published next to the page
shutil.copy('pixi.min.js', 'dist/pixi.min.js')  # v0.50 field renderer (PixiJS v8, MIT), published next to the page
print('page', len(doc), 'art-base', len(b), 'art-alt', len(a))
