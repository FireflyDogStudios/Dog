const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:768}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.addInitScript(()=>localStorage.setItem('dengame-dev','1'));
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1500);
 for(let i=0;i<6;i++) await p.evaluate(()=>__advance(5000));
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.sos-ov").forEach(e=>e.remove()));
 const docks=await p.$$eval('[data-fkopen]',els=>els.map(e=>e.dataset.fkopen)); console.log('dock',docks);
 for(const d of ['bag','pack','tomes','mine','events']){ if(!docks.includes(d)) continue;
   await p.keyboard.press('Escape');await p.keyboard.press('Escape');await p.keyboard.press('Escape');
   await p.click('[data-fkopen="'+d+'"]'); await p.evaluate(()=>__advance(300));
   const acts=await p.$$eval('.fkw [data-a]',els=>els.map(e=>e.dataset.a+'|'+(e.textContent||'').trim().slice(0,14)));
   const sels=await p.$$eval('.fkw select',els=>els.length);
   // click the first view/tab-like action
   const nav=await p.$('.fkw [data-a$="-view"], .fkw [data-a$="view"]');
   let navRes=''; if(nav){ const a=await nav.getAttribute('data-a'); const h1=await p.$eval('.fkw-b',x=>x.innerHTML.length); const all=await p.$$('.fkw [data-a="'+a+'"]'); await all[all.length-1].click(); await p.evaluate(()=>__advance(200)); const h2=await p.$eval('.fkw-b',x=>x.innerHTML.length); navRes=a+' '+h1+'->'+h2; }
   console.log(d,'acts',acts.length,'selects',sels,'nav',navRes,'|',[...new Set(acts.map(x=>x.split('|')[0]))].slice(0,14).join(','));
 }
 console.log('errs',errs.slice(0,5)); await b.close();})();
