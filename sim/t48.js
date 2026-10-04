const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1366,height:768}});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL/.test(m.text())) errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/game.html'); await p.waitForTimeout(1500);
  const E = c => p.evaluate(c => window.__E(c), c);
  await E(`localStorage.setItem('dengame-dev','0')`);
  console.log("bar", await E(`JSON.stringify(SKILLS.map(s => [s.id, s.lvl, s.cd, s.emoji, !!s.desc]))`));
  // no creatures in range yet? force level 10 via dev hook if exists, else check gating
  const r1 = await E(`(() => { const lvl = playerLevel(); const out = {lvl}; out.noTarget = castSkill("pounce"); out.cdAfterRefuse = SE.cooldown("pounce"); return JSON.stringify(out); })()`);
  console.log("refusal", r1);
  await p.waitForTimeout(4000);
  const r2 = await E(`(() => { const out = {enemies:B.enemies.length, inR:B.enemies.filter(E => E.x - dingoPos().x < 260).length}; out.pounce = castSkill("pounce"); out.cd = Math.round(SE.cooldown("pounce")); out.howl = castSkill("howl"); out.rally = SE.has(DINGO, "rally"); out.dmg = dmgMult(); out.shadow = castSkill("shadow"); out.ghosts = SK.shadows.length; out.feast = castSkill("feast"); out.loot = lootMult(); out.again = castSkill("howl"); return JSON.stringify(out); })()`);
  console.log("casts", r2);
  await p.waitForTimeout(800);
  console.log("cd text", await E(`JSON.stringify([...document.querySelectorAll('.skcd')].map(e => e.textContent))`));
  console.log("errors", errs); await b.close();
})();
