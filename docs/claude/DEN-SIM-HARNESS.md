# Den Sim Harness (source)

Pacing-test harness for The Den Game. Restore: save game HTML as `index.html`, put these files in `sim/` beside it (the .py files next to index.html), run `python3 make_game_copy.py`, then `NODE_PATH=$(npm root -g) node sim/run.js power 3` and `python3 analyze.py power casual`. Verified working on v0.16, Oct 1 2026.

## make_game_copy.py
```python
# Makes sim/game.html from a saved copy of the game (index.html in this folder).
# It adds one line that lets the bot reach the game's insides. Never publish this copy.
s = open("index.html", encoding="utf-8").read()
k = s.rfind("})();")
open("sim/game.html", "w", encoding="utf-8").write(s[:k] + "window.__E=(c)=>eval(c);\n" + s[k:])
print("wrote sim/game.html")
```

## analyze.py
```python
import json,sys
def fm(s): s=int(s); return f"{s//3600}h{(s%3600)//60:02d}m" if s>=3600 else f"{s//60}m{s%60:02d}s"
for mode in sys.argv[1:]:
    d=json.load(open(f'sim/out_{mode}.json')); D=d['data']; T=D['tele']
    print(f"\n===== {mode.upper()} ===== final lvl {D['lvl']} xp {D['earned']} kills {D['H']['kills']} weapons {D['H']['weapons']} pups {D['pups']} coins {D['coins']} tp {D['trials'].get('tp')}")
    print('errors:',d['errs'][:5],d['pageErrs'][:5])
    ev=T['ev']; lv=[e for e in ev if e[1]=='level']
    print('LEVELS:', ', '.join(f"L{e[2]}@{fm(e[0])}" for e in lv))
    print('UNLOCK/LETTERS:')
    for e in ev:
        if e[1] in ('unlock','letter','ready','overpowered','mega','god','trial','meta','zone'): print('  ',fm(e[0]),e[1],e[2])
    print('SNAPS every 15m: t lvl xp dps enemyHp ttk kills meats coins weapons pups zone tp op')
    for s in T['snap']:
        if s[0]%900<60: print('  ',fm(s[0]),s[1:6],s[6],s[7],s[8],s[10],s[11],s[12],s[13],s[14])
    print('trials:',{k:D['trials'].get(k) for k in ('best','clears','metaBest')})
    print('zm:',D['H']['zm'])
    print('tomes eq:',(D.get('tomes') or {}).get('eq'),'upg:',D.get('upg'))
```

## sim/warp.js
```js
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
```

## sim/bot.js
```js
// Page-side bot, evaluated inside the game's closure via __E.
(function(mode, simT){
  const act = (a, id) => { const r = document.getElementById("rest") || document.body; const b = document.createElement("button"); b.dataset.a = a; if (id !== undefined) b.dataset.id = id; r.appendChild(b); try { b.click(); } catch(e){} b.remove(); };
  const clean = () => document.querySelectorAll(".welcomeov,.lvlup,.roll-ov,.reveal,.mailnote,.sos-ov,.hatch-ov,.devov").forEach(e => e.remove());
  clean();
  const H = huntState(), log = [];
  const power = mode === "power";
  // mail
  mailState().forEach(m => { m.read = true; if (!m.claimed && (m.items||[]).length) { claimMail(m.id); log.push("mail:" + m.id); } });
  // daily gifts + pass
  if (isUnlocked("events")) { const d = new Date().getDate(); for (let i = 1; i <= d; i++) claimGift(i); const S = trialState(); TRIAL_PASS.forEach((r,i) => { if (!S.passClaimed[i] && S.tp >= r[0]) { S.passClaimed[i] = Date.now(); passReward(r); log.push("pass:" + i); } }); }
  H.autoCast = true;
  // upgrades
  if (isUnlocked("upgrades") && (power || Math.random() < 0.4)) { for (let n = 0; n < 20; n++) { const ks = Object.keys(UPGRADES).filter(k => upgLv(k) < UPGRADES[k].max).sort((a,b) => upgCost(a) - upgCost(b)); if (!ks.length || upgCost(ks[0]) > H.meats * (power ? 0.6 : 0.3)) break; act("upg", ks[0]); log.push("upg:" + ks[0]); } }
  // rescue pups
  if (isUnlocked("pack")) { const b = basketList()[0]; if (b && playerLevel() >= b.lvl) { const want = power ? 10 : 3; if (H.meats > b.cost * want * (power ? 2 : 3)) { act("hatch", b.id + ":" + want); log.push("rescue:" + want); } } act("fuse-all"); packAutoEquip(); syncPups(); }
  // meat -> coins
  if (power || Math.random() < 0.6) { const keep = power ? 0 : H.meats * 0.4; let c = 0; while (H.meats - keep >= MEAT_PER_COIN && c < 500) { act("meat-convert", "1"); c++; } if (c) log.push("coins+" + c); }
  // roll
  const reserve = power ? 0 : 2; let rolls = 0; while (shopState().coins - reserve >= 1 && weaponRoom() && rolls < 200) { const c = shopState().coins - reserve; act(c >= 20 ? "w-roll20" : c >= 10 ? "w-roll10" : "w-roll"); rolls++; } if (rolls) log.push("rollx" + rolls);
  // forge + tidy
  if (isUnlocked("hunt-forge") && (power || Math.random() < 0.5)) { act("forge-all"); if (power) act("w-sellweak"); }
  autoEquip(); syncGhosts();
  // tomes
  if (isUnlocked("tomes")) { const T = tomeState();
    if (power || Math.random() < 0.5) Object.keys(T.inv).forEach(k => { const p = tomeKeyParts(k); if (p.special || p.tier >= 9) return; for (let n = 0; n < 5; n++){ const free = (T.inv[k]||0) - T.eq.filter(x => x === k).length; if (free >= BIND_NEED[p.tier]) act("tome-bind", k); else break; } });
    const score = k => { const p = tomeKeyParts(k); return (p.type === "gather" ? 1000 : 0) + (p.special ? 50 : p.tier * 10 + (p.type === "fangs" ? 5 : 0)); };
    if (power || Math.random() < 0.5) { T.eq = []; Object.keys(T.inv).filter(k => T.inv[k] > 0).sort((a,b) => score(b) - score(a)).forEach(k => { while (T.eq.length < tomeSlots() && (T.inv[k]||0) - T.eq.filter(x => x === k).length > 0 && !(tomeKeyParts(k).special && T.eq.includes(k))) T.eq.push(k); }); }
  }
  // brews
  if (power && isUnlocked("lib-alembic")) { ["str","cur","swift","luck"].forEach(t => { Object.entries(POT_BREW[t]).forEach(([k,v]) => { if (ASP[k].of && ess(k) < v) distillToward(k, v); }); if (isUnlocked("lib-apo")) { for (let n=0;n<3;n++) if (canBrew(t)) act("pot-buy", t); const B2 = boostState(); for (const tier of [2,1,0]) { if ((B2.inv[t+tier]||0) > 0 && !(B2.active[t] && B2.active[t].until > Date.now())) { act("pot-drink", t + ":" + tier); log.push("drink:" + t + tier); break; } } } }); }
  // travel: hardest zone where creatures die in < 5s (power) / when 2 levels over (casual)
  const zs = Object.keys(ZONES), L = playerLevel(); let best = "meadow";
  zs.forEach(z => { if (L < ZONES[z].lvl) return; if (power) { const hp = 300 * Math.pow(1.5, L-1) * (1 + 0.003*(H.kills||0)) * ZONES[z].hp; if (hp / Math.max(0.1, dingoDps()) < 5) best = z; } else if (L >= ZONES[z].lvl + 2) best = z; });
  if (!B.trial && zoneId() !== best) { travelTo(best); log.push("travel:" + best); }
  // trials
  if (!B.trial && !B.mega && !B.titan && isUnlocked("events") && (power || Math.random() < 0.25)) { const z = zoneId(); if (L >= trialLvl(z) && trialReady(z)) { const meta = zoneOP(z) && Math.random() < 0.5; startTrial(z, meta); log.push((meta ? "meta:" : "trial:") + z); } }
  clean();
  return log.join(" ");
})
```

## sim/run.js
```js
const { chromium } = require('playwright'); const fs = require('fs');
const mode = process.argv[2] || 'power', hours = +(process.argv[3] || 3), out = 'sim/out_' + mode + '.json';
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1000,height:900}});
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
  await p.goto('file://' + process.cwd() + '/sim/game.html'); await p.waitForTimeout(1500);
  await p.evaluate(src => { window.__bot = __E(src); }, fs.readFileSync('sim/bot.js','utf8'));
  const total = hours * 3600, step = 10; let next = 5, actions = [];
  const t0 = Date.now();
  for (let t = 0; t < total; t += step) {
    await p.evaluate(ms => __advance(ms), step * 1000);
    if (t >= next) {
      const res = await p.evaluate(([m, t]) => window.__bot(m, t), [mode, t]);
      if (res) actions.push([t, res]);
      next = t + (mode === 'power' ? 20 : (300 + Math.random() * 300));
    }
    if (t % 600 === 0) { const s = await p.evaluate(() => __E('JSON.stringify({lvl:playerLevel(), kills:huntState().kills, dps:Math.round(dingoDps())})')); console.log(mode, Math.round(t/60) + 'm', s, ((Date.now()-t0)/1000).toFixed(0) + 's real'); }
  }
  const data = await p.evaluate(() => __E('JSON.stringify({tele: state.tele, unlocks: state.unlocks, mail: state.mail.map(m => [m.id, m.ts]), trials: trialState(), lvl: playerLevel(), earned: state.treats.earned, H: {kills: huntState().kills, meats: huntState().meats, weapons: huntState().weapons.length, zm: huntState().zm}, pups: (state.pack||{pups:[]}).pups.length, coins: shopState().coins, tomes: state.tomes, upg: state.upg})'));
  fs.writeFileSync(out, JSON.stringify({mode, actions, errs: errs.slice(0,30), pageErrs: await p.evaluate(() => window.__errs || []), data: JSON.parse(data)}));
  console.log('done', mode, ((Date.now()-t0)/1000).toFixed(0) + 's'); await b.close(); })();
```
