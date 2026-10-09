const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1920,height:1080}});
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(3000);
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.sos-ov").forEach(e=>e.remove()));
 await p.evaluate(()=>__E(`(()=>{ fxSet('q','full'); FX.gentle=false; huntState().todOverride='night'; applyTod(); endWeather(); startWeather('storm'); })()`)); await p.waitForTimeout(1500);
 for (const hide of ['none','shade','wx','light']){ await p.evaluate(h=>{ ['shade','wx','light'].forEach(id=>{ const c=document.getElementById('fx-'+id); if(c) c.style.visibility = id===h?'hidden':'visible'; }); }, hide);
  const r = await p.evaluate(()=>new Promise(res=>{ let n=0, t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<2500) requestAnimationFrame(f); else res((n/2.5).toFixed(1)); }; requestAnimationFrame(f); }));
  console.log('hidden', hide, 'fps', r); }
 await b.close();})();
