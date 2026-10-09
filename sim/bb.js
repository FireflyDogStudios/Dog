const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage(); await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(800);
 console.log(await p.evaluate(()=>{const s=document.querySelector('svg.trees path'); const bb=s.getBBox(); return [bb.x,bb.width, bb.x+bb.width];})); await b.close();})();
