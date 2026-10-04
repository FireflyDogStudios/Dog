const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1000,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1500);
 for(let i=0;i<60;i++) await p.evaluate(()=>__advance(10000));
 const r=await p.evaluate(()=>__E(`(()=>{const H=huntState();return JSON.stringify({kills:H.kills,drops:H.drops,salv:H.salvaged,n:H.weapons.length,ws:H.weapons.map(w=>[w.name,w.r,w.cls||'-',w.zone||'-',w.from||'-',(SMITHY.decode(w.code)||{}).type])})})()`));
 console.log(r);
 // force-travel test: forest + moon drops
 const t=await p.evaluate(()=>__E(`(()=>{state.treats.earned=1e9;const out={};for(const z of ['forest','moon']){huntState().zone=z;const c={};for(let i=0;i<40;i++){const E={name:'Test',traits:['flying'],x:300,el:document.createElement('div')};const res=dropWeapon(E,true);const d=SMITHY.decode(res.w.code);const k=SMITHY.TYPES[d.type].n+'/'+SMITHY.TYPES[d.type].mats[d.mat].n+'/'+res.w.cls;c[k]=(c[k]||0)+1;}out[z]=c;}return JSON.stringify(out)})()`));
 console.log(t);
 console.log('errs',errs.slice(0,5), await p.evaluate(()=>window.__errs||[]));
 await b.close();})();
