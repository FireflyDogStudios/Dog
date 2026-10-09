const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:768}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')+(process.argv[2]==='dev'?';localStorage.setItem("dengame-dev","1");':'')});
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1500);
 for(let i=0;i<20;i++) await p.evaluate(()=>__advance(5000));
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.sos-ov").forEach(e=>e.remove()));
 const st=await p.evaluate(()=>__E('JSON.stringify({lvl:playerLevel(),kills:huntState().kills,drops:huntState().drops,w:huntState().weapons.length,mail:state.mail.length})')); console.log('state',st);
 for (const k of ['hunt','bag','pack','tomes','mine','events','@mail']){ await p.evaluate(t=>__E(`fkOpen("${t}")`),k); await p.evaluate(()=>__advance(200)); const n=await p.$$eval('.fkw .fkw-b *',x=>x.length); console.log(k,'nodes',n); await p.evaluate(()=>__E('fkClose && 0')); }
 await p.evaluate(()=>__E('spawnMega()')); for(let i=0;i<5;i++) await p.evaluate(()=>__advance(300)); console.log('target', await p.$eval('#fk-target',e=>e.innerText.slice(0,60).replace(/\n/g,' | ')));
 await p.evaluate(()=>__E('openSettings()')); await p.evaluate(()=>__advance(200)); console.log('settings rows', await p.$$eval('.setrow b',x=>x.map(e=>e.textContent)));
 await p.screenshot({path:'sim/smoke.png'});
 console.log('errs',errs.slice(0,8), await p.evaluate(()=>window.__errs||[]));
 await b.close();})();
