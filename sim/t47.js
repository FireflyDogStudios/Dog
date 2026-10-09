const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1366,height:768}});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/game.html'); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => window.__E(`(() => {
    const out = {};
    out.before = {dmg:dmgMult(), spd:spdMult(), loot:lootMult(), luck:luckMult(), coin:coinChanceMult(), crit:critChance(null)};
    brewStatus("str", 2, 60000); SE.apply(DINGO, "rally"); SE.apply(DINGO, "weakened"); SE.apply(DINGO, "sharpnose", {dur:60});
    out.after = {dmg:dmgMult(), spd:spdMult(), loot:lootMult(), crit:critChance(null)};
    out.explainDmg = SE.explain(DINGO, "dmg");
    const E = {st:[]}; SE.apply(E, "armored"); out.armor = SE.sum(E, "armor"); SE.apply(E, "armored", {mods:[{stat:"armor", add:.65}]}); out.armorElite = SE.sum(E, "armor"); SE.apply(E, "shocked"); out.armorShocked = SE.sum(E, "armor");
    const Q = {st:[]}; SE.apply(Q, "quick"); out.dodge = SE.sum(Q, "dodge"); SE.apply(Q, "quick", {mods:[{stat:"dodge", add:.3}]}); out.dodgeElite = SE.sum(Q, "dodge");
    SE.clear(DINGO); return out;
  })()`));
  console.log(JSON.stringify(r, null, 1)); console.log("errors:", errs); await b.close();
})();
