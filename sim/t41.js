const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:898,height:641}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error' && !/fonts|TUNNEL/.test(m.text())) errs.push(m.text()); });
 await p.goto('file://'+process.cwd()+'/dist/index.html'); await p.waitForTimeout(500);
 const early = await p.evaluate(()=>!!document.getElementById('boot'));
 await p.waitForTimeout(4000);
 const r = await p.evaluate(()=>{ const e=document.querySelector('#battle .emo, .emo'); return {boot:!!document.getElementById('boot'), bodyFk:document.body.classList.contains('fk'), emoBg: e ? getComputedStyle(e).backgroundImage.slice(0,30) : null, altMedia: (document.querySelector('link[href^="art-alt"]')||{}).media, dock: document.getElementById('fk-dock').getBoundingClientRect().toJSON()}; });
 await p.screenshot({path:'sim/d41.png'});
 console.log(JSON.stringify({early, ...r}), errs.slice(0,5)); await b.close();})();
