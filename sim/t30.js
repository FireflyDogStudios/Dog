const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:720}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')+';localStorage.setItem("dengame-dev","1");'});
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1500);
 for(let i=0;i<6;i++) await p.evaluate(()=>__advance(5000));
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.mailnote,.sos-ov").forEach(e=>e.remove()));
 await p.keyboard.press('h'); await p.keyboard.press('i'); await p.keyboard.press('n'); await p.evaluate(()=>__advance(400));
 console.log('wins', await p.$$eval('.fkw', x=>x.map(e=>e.dataset.t+'@'+e.style.left+','+e.style.top)));
 const hd = await p.$('.fkw[data-t="@mail"] .fkw-h'); const bb = await hd.boundingBox(); await p.mouse.move(bb.x+60,bb.y+15); await p.mouse.down(); await p.mouse.move(bb.x+260,bb.y+115,{steps:5}); await p.mouse.up();
 console.log('mail moved to', await p.$eval('.fkw[data-t="@mail"]', e=>e.style.left+','+e.style.top));
 const sum = await p.$('.fkw[data-t="@mail"] summary'); if (sum){ await sum.click(); await p.evaluate(()=>__advance(200)); console.log('mail open', await p.$eval('.fkw[data-t="@mail"] details', d=>d.open)); }
 await p.screenshot({path:'sim/fk30.png'});
 await p.keyboard.press('Escape'); await p.evaluate(()=>__advance(200)); console.log('after esc', await p.$$eval('.fkw', x=>x.map(e=>e.dataset.t)));
 await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); await p.evaluate(()=>__advance(300)); const st = await p.$('#fk-target .fk-st'); if (st){ await st.hover(); await p.waitForTimeout(100); console.log('tip', await p.$eval('#fktip', t=>t.hidden?'hidden':t.innerText)); } else console.log('no target status');
 console.log('errs',errs.slice(0,5), await p.evaluate(()=>window.__errs||[]));
 await b.close();})();
