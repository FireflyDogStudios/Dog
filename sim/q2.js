const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:768}});
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.addInitScript(()=>localStorage.setItem('dengame-dev','1')); await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1500);
 for(let i=0;i<4;i++) await p.evaluate(()=>__advance(5000));
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.sos-ov").forEach(e=>e.remove()));
 for (const [w,v] of [['hunt','hunt'],['bag',null]]){ await p.keyboard.press('Escape'); await p.click('[data-fkopen="'+w+'"]'); await p.evaluate(()=>__advance(300));
  if(v) { await p.click('.fkw [data-a="hunt-view"][data-id="hunt"]'); await p.evaluate(()=>__advance(300)); }
  console.log('=== '+w); console.log(await p.$eval('.fkw-b',x=>[...x.querySelectorAll('h2,h3,.hint,summary,[data-a$="view"]')].map(e=>e.tagName+': '+e.textContent.trim().replace(/\s+/g,' ').slice(0,90)).join('\n')));
  await p.screenshot({path:'sim/q2-'+w+'.png'}); }
 await b.close();})();
