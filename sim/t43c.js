const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:768}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1200);
 for(let i=0;i<4;i++) await p.evaluate(()=>__advance(2000));
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.sos-ov,.mailnote").forEach(e=>e.remove()));
 await p.evaluate(()=>__E(`(()=>{ huntState().todOverride='night'; applyTod(); startWeather('storm'); })()`)); for(let i=0;i<20;i++) await p.evaluate(()=>__advance(100));
 await p.evaluate(()=>__E(`(()=>{ Math.random=()=>0.5; fxBolt(800, fxGround()); FX.flash=0.35; const P=dingoPos(); fxFrame(0.016,P,false); })()`));
 await p.screenshot({path:'sim/fx-bolt.png'}); console.log(errs); await b.close();})();
