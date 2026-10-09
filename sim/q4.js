const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1920,height:1080}});
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1200);
 for(let i=0;i<4;i++) await p.evaluate(()=>__advance(500));
 console.log(await p.evaluate(()=>{ const h=document.querySelector('section.hero'); const cs=getComputedStyle(h); return {inline:h.style.cssText.slice(0,200), tr:cs.transform, w:cs.width, rect:JSON.stringify(h.getBoundingClientRect())}; }));
 await b.close();})();
