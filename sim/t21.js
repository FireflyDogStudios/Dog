const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:900,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1500);
 for(let i=0;i<6;i++) await p.evaluate(()=>__advance(10000));
 console.log(await p.evaluate(()=>__E(`(()=>{state.treats.earned=1e9;const out=[];const cnt={};for(const z of ['meadow','forest','moon']){huntState().zone=z;for(const rk of ['common','uncommon','rare','epic','legendary']){const r=dropWeapon({name:'T',traits:[]},true,rk);const d=SMITHY.decode(r.w.code);out.push(z+' '+rk+': '+r.w.name+' ['+r.w.traits.join(',')+'] inf='+SMITHY.INFS[d.inf].n+(r.w.sig?' sig='+r.w.sig:'')+(r.salvaged?' (salvaged)':''));}}
 for(let i=0;i<2000;i++){const k=rollDrop();cnt[k]=(cnt[k]||0)+1;} out.push(JSON.stringify(cnt)); out.push('forge unlocked: '+isUnlocked('hunt-forge')); return out.join('\\n')})()`)));
 console.log('errs',errs.slice(0,5), await p.evaluate(()=>window.__errs||[]));
 await b.close();})();
