const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.addInitScript(()=>{ localStorage.setItem('dengame-dev','1'); });
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1500);
 for(let i=0;i<3;i++) await p.evaluate(()=>__advance(5000));
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.sos-ov").forEach(e=>e.remove()));
 await p.click('[data-fkopen="bag"]'); await p.evaluate(()=>__advance(300));
 const b1 = await p.evaluate(()=>__E(`invState().eqB[0]`));
 await p.click(`.fkw [data-a="inv-ren"][data-id="${b1}"]`);
 for (let i=0;i<3;i++){ await p.evaluate(()=>__advance(20)); }
 console.log('input', await p.$$eval('input[data-invname]',e=>e.length), await p.evaluate(()=>document.activeElement && document.activeElement.outerHTML.slice(0,80)), await p.evaluate(()=>__E('INV_REN')));
 await p.keyboard.type('Weapons'); await p.keyboard.press('Enter'); await p.evaluate(()=>__advance(200));
 console.log(await p.evaluate(()=>__E(`invState().B['${'X'}']`)) , await p.evaluate((b1)=>__E(`invState().B['${b1}'].name`), b1));
 console.log('errs',errs); await b.close();})();
