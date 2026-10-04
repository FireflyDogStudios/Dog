const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const errs=[];
 for (const d of ['2026-04-10','2026-07-10','2026-10-02','2027-01-10']){ const p=await b.newPage({viewport:{width:900,height:520}}); p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8').replace('2026-10-02',d)});
  await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1200); await p.evaluate(()=>__advance(3000));
  await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.mailnote,.sos-ov").forEach(e=>e.remove()));
  const h=await p.$('section.hero'); await h.screenshot({path:'sim/s-'+d+'.png'}); await p.close(); }
 const p=await b.newPage({viewport:{width:390,height:640}}); await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1200); await p.evaluate(()=>{document.querySelectorAll(".welcomeov,.sos-ov").forEach(e=>e.remove()); __E('openSettings()');});
 const c=await p.$eval('.setcard',e=>{const r=e.getBoundingClientRect();return [Math.round(r.top),Math.round(r.bottom),e.scrollHeight,e.clientHeight,innerHeight]}); console.log('settings card top/bottom/scrollH/clientH/vh',c);
 console.log('errs',errs.slice(0,5)); await b.close();})();
