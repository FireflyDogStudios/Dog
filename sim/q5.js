const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:768}});
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1200);
 for(let i=0;i<3;i++) await p.evaluate(()=>__advance(2000));
 await p.evaluate(()=>__E('setZoom(1.8)'));
 console.log(await p.evaluate(()=>{ const h=document.querySelector('section.hero'), cs=getComputedStyle(h); return {inline:h.style.cssText, rect:h.getBoundingClientRect().toJSON(), minH:cs.minHeight, oh:h.offsetHeight, ow:h.offsetWidth, STAGE:__E('JSON.stringify(STAGE)')}; }));
 await b.close();})();
