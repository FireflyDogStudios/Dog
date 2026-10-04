const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1366,height:768}}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 let reqs=[]; p.on('request',r=>{ if(/art-/.test(r.url())) reqs.push(r.url().split('/').pop()); });
 for (const run of [1,2]){ reqs=[];
  const t0=Date.now(); await p.goto('http://127.0.0.1:8766/index.html'); await p.waitForFunction(()=>!document.getElementById('boot'),null,{timeout:20000}); const t1=Date.now();
  await p.waitForTimeout(2500);
  const r = await p.evaluate(()=>{ const els=[...document.querySelectorAll('em-i.emo')]; const vis=els.filter(e=>{const cs=getComputedStyle(e); return cs.backgroundImage!=='none'||cs.maskImage!=='none'||cs.webkitMaskImage!=='none';}).length; return {emo:els.length, withArt:vis, styles:[...document.querySelectorAll('style[id^=art-]')].map(s=>s.id)}; });
  console.log('run',run,'bootGone ms',t1-t0, JSON.stringify(r), 'fetched', reqs.join(','));
 }
 await p.screenshot({path:'sim/d42.png'}); console.log('errs',errs.slice(0,5)); await b.close();})();
