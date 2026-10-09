const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1920,height:1080}});
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(3000);
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.sos-ov").forEach(e=>e.remove()));
 for (const q of ['off','light','full']){ await p.evaluate(q=>__E(`(()=>{ fxSet('q','${q}'); FX.gentle=false; huntState().todOverride='night'; applyTod(); endWeather(); startWeather('storm'); })()`),q); await p.waitForTimeout(1500);
  const r = await p.evaluate(()=>new Promise(res=>{ let n=0, t0=performance.now(), fx=0; const o=window.fxFrame; const f=()=>{ n++; if(performance.now()-t0<3000) requestAnimationFrame(f); else res({fps:(n/3).toFixed(1)}); }; requestAnimationFrame(f); }));
  const t = await p.evaluate(()=>__E(`(()=>{ const P=dingoPos(); const t0=performance.now(); for(let i=0;i<60;i++) fxFrame(1/60,P,true); return ((performance.now()-t0)/60).toFixed(2); })()`));
  console.log(q, r, 'fxFrame ms', t); }
 await b.close();})();
