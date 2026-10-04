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
