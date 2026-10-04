const { chromium } = require('playwright'); const fs=require('fs');
const sizes=[[1366,768],[1920,1080],[960,1080],[2560,1080],[3840,2160]];
(async()=>{ const b=await chromium.launch();
 for (const [W,Hh] of sizes){ const p=await b.newPage({viewport:{width:W,height:Hh}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
  await p.addInitScript(()=>{ Math.random = (()=>{ let s=12345; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; })(); });
  await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1200);
  await p.evaluate(()=>{ document.querySelectorAll(".welcomeov,.lvlup,.sos-ov").forEach(e=>e.remove()); });
  const k0 = await p.evaluate(()=>__E('huntState().kills'));
  for(let i=0;i<120;i++) await p.evaluate(()=>__advance(500));
  await p.evaluate(()=>{ document.querySelectorAll(".welcomeov,.lvlup,.sos-ov").forEach(e=>e.remove()); });
  const r = await p.evaluate(()=>__E(`(()=>{const d=document.querySelector('#dingo').getBoundingClientRect(); return {s:+STAGE.s.toFixed(3), w:Math.round(STAGE.w), h:Math.round(STAGE.h), fkz:fkScale, dingoPx:Math.round(d.width), dingoX:Math.round(d.left), kills:huntState().kills, P:dingoPos()}})()`));
  r.killsIn60s = r.kills - k0;
  await p.screenshot({path:`sim/s40-${W}x${Hh}.png`});
  console.log(W+'x'+Hh, JSON.stringify(r), errs.slice(0,3)); await p.close(); }
 await b.close();})();
