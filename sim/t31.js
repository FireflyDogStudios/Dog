const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:768}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')+';localStorage.setItem("dengame-dev","1");'});
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1500);
 for(let i=0;i<6;i++) await p.evaluate(()=>__advance(5000));
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.sos-ov").forEach(e=>e.remove()));
 await p.evaluate(()=>{ __E('toast("🦝 A raccoon thief appeared!")'); __E('mailNotice({subject:"A test letter"})'); __advance(200); });
 await p.screenshot({path:'sim/w-hud.png'});
 for (const k of ['hunt','bag','pack','tomes','mine','events']){ await p.evaluate(t=>__E(`fkOpen("${t}")`),k); await p.evaluate(()=>__advance(300)); const w=await p.$('.fkw'); await w.screenshot({path:`sim/w-${k}.png`}); await p.evaluate(()=>__E('fkClose()')); }
 console.log('errs',errs.slice(0,5), await p.evaluate(()=>window.__errs||[]));
 await b.close();})();
