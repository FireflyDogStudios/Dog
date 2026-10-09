const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:768}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.addInitScript(()=>{ localStorage.setItem('dengame-dev','1'); });
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1200);
 for(let i=0;i<10;i++) await p.evaluate(()=>__advance(3000));
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.sos-ov,.mailnote").forEach(e=>e.remove()));
 const wins=['hunt','pack','mine','@mail'];
 for (const w of wins){ await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); await p.evaluate(w=>__E(`fkOpen('${w}', true)`), w); await p.evaluate(()=>__advance(400));
   const subs = await p.$$eval('.fkw.front .fkw-sub [data-a]', e=>e.map(x=>x.dataset.a+':'+x.dataset.id));
   await p.screenshot({path:`sim/a-${w.replace('@','')}.png`});
   for (const s of subs.slice(1)){ const [a,id]=s.split(':'); const el = await p.$(`.fkw.front .fkw-sub [data-a="${a}"][data-id="${id}"]`); if(!el) continue; await el.click(); await p.evaluate(()=>__advance(300)); await p.screenshot({path:`sim/a-${w.replace('@','')}-${id}.png`}); }
   console.log(w, subs.join(' ')); }
 await p.evaluate(()=>__E(`huntState().home=true; applyHome(); render(); fkTick(true)`)); await p.evaluate(()=>__advance(500));
 await p.keyboard.press('Escape'); await p.keyboard.press('Escape');
 await p.evaluate(()=>__E(`fkOpen('tomes', true)`)); await p.evaluate(()=>__advance(400));
 const subs = await p.$$eval('.fkw.front .fkw-sub [data-a]', e=>e.map(x=>x.dataset.a+':'+x.dataset.id)); console.log('tomes', subs.join(' '));
 await p.screenshot({path:'sim/a-tomes.png'});
 for (const s of subs.slice(1)){ const [a,id]=s.split(':'); const el = await p.$(`.fkw.front .fkw-sub [data-a="${a}"][data-id="${id}"]`); if(!el) continue; await el.click(); await p.evaluate(()=>__advance(300)); await p.screenshot({path:`sim/a-tomes-${id}.png`}); }
 await p.keyboard.press('Escape'); await p.screenshot({path:'sim/a-home.png'});
 console.log('errs', errs.slice(0,5)); await b.close();})();
