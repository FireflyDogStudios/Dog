const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:768}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.addInitScript(()=>{ localStorage.setItem('dengame-dev','1'); });
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1200);
 for(let i=0;i<4;i++) await p.evaluate(()=>__advance(2000));
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.sos-ov,.mailnote").forEach(e=>e.remove()));
 await p.evaluate(()=>__E(`(()=>{ const H=huntState(); ['epic','legendary','mythic','rare','uncommon'].forEach(rk=>dropWeapon({name:'T',traits:[]},true,rk)); H.equipped=H.weapons.slice(-5).map(w=>w.id); syncGhosts(); huntState().todOverride='dusk'; applyTod(); })()`));
 const r = {proton: await p.evaluate(()=>typeof Proton)};
 for(let i=0;i<30;i++) await p.evaluate(()=>__advance(40));
 r.ready = await p.evaluate(()=>__E('!!PFX.p')); r.emitters = await p.evaluate(()=>__E('PFX.p ? PFX.p.emitters.length : -1')); r.particles = await p.evaluate(()=>__E('PFX.p ? PFX.p.getCount() : -1'));
 r.oldSparks = await p.$$eval('#battle .spk-ln, #battle .trail, #battle .poof',e=>e.length);
 await p.evaluate(()=>__E(`(()=>{ const E=B.enemies[0]; if(E){ spark(E.x, 590, '#ffd34d', true); poof(E.x+30, 600); } })()`)); for(let i=0;i<3;i++) await p.evaluate(()=>__advance(30));
 await p.screenshot({path:'sim/p44.png'});
 // trigger mega debuff code path quickly
 console.log(JSON.stringify(r), errs.slice(0,5)); await b.close();})();
