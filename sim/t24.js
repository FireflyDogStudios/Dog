const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:900,height:520}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1200); await p.evaluate(()=>{document.querySelectorAll(".welcomeov,.sos-ov").forEach(e=>e.remove()); __E('startWeather("rain")');});
 await p.waitForTimeout(800); const h=await p.$('section.hero'); await h.screenshot({path:'sim/rain.png'});
 console.log('drops', await p.$$eval('#wx .drop', x=>x.length), 'errs',errs.slice(0,5)); await b.close();})();
