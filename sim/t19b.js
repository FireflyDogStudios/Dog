const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:900,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1500);
 for(let i=0;i<12;i++) await p.evaluate(()=>__advance(10000));
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.mailnote,.sos-ov").forEach(e=>e.remove()));
 const st=()=>p.evaluate(()=>__E('JSON.stringify({run:B.running,en:B.enemies.length,kills:huntState().kills,e:B.trial&&Math.round(B.trial.energy),tk:B.trial&&B.trial.kills,xs:B.enemies.map(e=>Math.round(e.x)),P:dingoPos()&&Math.round(dingoPos().x)})'));
 console.log('before',await st());
 await p.evaluate(()=>__E(`B.trial={zone:'meadow',meta:true,wave:1,pts:0,kills:0,waveEnd:Date.now()+60000,energy:100,lastT:Date.now(),loot:[],bossDue:false,tp:0}`));
 for(let s=0;s<6;s++){ for(let i=0;i<5;i++) await p.evaluate(()=>__advance(1000)); console.log(s,await st()); }
 console.log('errs',errs.slice(0,5), await p.evaluate(()=>window.__errs||[]));
 await b.close();})();
