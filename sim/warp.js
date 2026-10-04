// Injected before the game loads: a virtual clock we can fast-forward in-page.
(() => {
  const RD = Date, base = new RD('2026-10-02T09:00:00').getTime(); let T = 0, seq = 0; const q = [];
  class FD extends RD { constructor(...a){ if (a.length === 0) super(base + T); else super(...a); } static now(){ return base + T; } }
  window.Date = FD;
  const perf = window.performance; try { Object.defineProperty(perf, 'now', {value: () => T, configurable: true}); } catch(e){}
  const add = (fn, ms, rep, args) => { const id = ++seq; q.push({id, at: T + Math.max(0, ms|0), fn, ms: Math.max(1, ms|0), rep, args}); return id; };
  window.setTimeout = (fn, ms, ...args) => add(fn, ms || 0, false, args);
  window.setInterval = (fn, ms, ...args) => add(fn, ms || 0, true, args);
  window.clearTimeout = window.clearInterval = id => { const i = q.findIndex(t => t.id === id); if (i >= 0) q.splice(i, 1); };
  window.requestAnimationFrame = cb => add(() => cb(T), 50, false, []);
  window.cancelAnimationFrame = id => window.clearTimeout(id);
  window.__advance = (ms) => { const end = T + ms; let n = 0;
    while (true){ let k = -1; for (let i = 0; i < q.length; i++) if (q[i].at <= end && (k < 0 || q[i].at < q[k].at)) k = i; if (k < 0) break;
      const t = q[k]; T = Math.max(T, t.at); if (t.rep) t.at = T + t.ms; else q.splice(k, 1);
      try { typeof t.fn === 'function' ? t.fn(...t.args) : 0; } catch(e){ window.__errs = (window.__errs||[]).concat(String(e && e.message || e)).slice(-20); } if (++n > 2e6) break; }
    T = end; return n; };
  window.__now = () => T;
})();
