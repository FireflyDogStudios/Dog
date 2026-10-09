const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:768}});
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1500);
 for(let i=0;i<4;i++) await p.evaluate(()=>__advance(5000));
 const r=await p.evaluate(()=>[...document.body.querySelectorAll('*')].filter(e=>{const s=getComputedStyle(e);const r=e.getBoundingClientRect();return (s.position==='fixed'||s.position==='absolute')&&r.top<120&&r.right>1000&&r.width>60&&r.height>15}).map(e=>e.tagName+'#'+e.id+'.'+e.className+' '+JSON.stringify(e.getBoundingClientRect().toJSON())).slice(0,12));
 console.log(r.join('\n')); await b.close();})();
