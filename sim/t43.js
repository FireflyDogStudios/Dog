const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:768}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.addInitScript(()=>{ localStorage.setItem('dengame-dev','1'); });
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1200);
 for(let i=0;i<4;i++) await p.evaluate(()=>__advance(2000));
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.sos-ov").forEach(e=>e.remove()));
 await p.evaluate(()=>__E(`(()=>{ const H=huntState(); ['epic','legendary','rare'].forEach(rk=>dropWeapon({name:'T',traits:[]},true,rk)); H.equipped=H.weapons.slice(-5).map(w=>w.id); syncGhosts(); })()`));
 const shots=[["night","storm"],["dusk","rain"],["day",null],["night","snow"],["dawn","fog"],["day","wind"]];
 for (const [td,w] of shots){ await p.evaluate(([td,w])=>__E(`(()=>{ huntState().todOverride='${td}'; applyTod(); endWeather(); ${w?`startWeather('${w}')`:''}; })()`),[td,w]);
   for(let i=0;i<40;i++) await p.evaluate(()=>__advance(100));
   if (w==="storm"){ await p.evaluate(()=>__E(`lightning(B.enemies[0] ? B.enemies[0].x : 700)`)); for(let i=0;i<2;i++) await p.evaluate(()=>__advance(16)); }
   await p.screenshot({path:`sim/fx-${td}-${w||'clear'}.png`}); }
 // rough perf: time 120 frames of fxFrame
 const ms = await p.evaluate(()=>__E(`(()=>{ const P=dingoPos(); const t0=performance.now(); for(let i=0;i<120;i++) fxFrame(1/60,P,true); return (performance.now()-t0)/120; })()`));
 console.log('fxFrame ms/frame', ms.toFixed(2), errs.slice(0,5)); await b.close();})();
