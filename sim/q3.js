const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:768}});
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1500);
 for(let i=0;i<4;i++) await p.evaluate(()=>__advance(5000));
 console.log(await p.evaluate(()=>[...document.querySelector('section.hero').children].map(e=>e.tagName.toLowerCase()+'#'+e.id+'.'+String(e.className.baseVal??e.className).replace(/ /g,'.')).join('\n')));
 console.log(await p.evaluate(()=>[...document.querySelector('#battle').children].slice(0,30).map(e=>e.className).join(' | ')));
 await b.close();})();
