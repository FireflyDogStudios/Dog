const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:720}});
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1500); await p.evaluate(()=>__advance(3000));
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.mailnote,.sos-ov").forEach(e=>e.remove()));
 await p.keyboard.press('h'); await p.evaluate(()=>__advance(300));
 console.log(await p.$eval('.fkw', e=>{const c=getComputedStyle(e); return [c.backgroundImage.slice(0,80), c.backgroundColor, c.opacity, c.zIndex, c.animationName]}));
 await b.close();})();
