const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:768}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.addInitScript(()=>{ localStorage.setItem('dengame-dev','1'); });
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1200);
 for(let i=0;i<5;i++) await p.evaluate(()=>__advance(2000));
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.sos-ov").forEach(e=>e.remove()));
 const r={};
 await p.mouse.move(700,300); for(let i=0;i<8;i++){ await p.mouse.wheel(0,-100); await p.waitForTimeout(30); }
 await p.evaluate(()=>__advance(300));
 r.zoom = await p.evaluate(()=>__E('camZoom')); r.dingo = await p.evaluate(()=>{const d=document.getElementById('dingo').getBoundingClientRect(); return [Math.round(d.left), Math.round(d.width)]});
 await p.screenshot({path:'sim/z41.png'});
 // inventory swap
 await p.evaluate(()=>__E(`(()=>{const H=huntState(); H.autoSalvage=false; invSetSalvLevel(0); ['rare','uncommon','common','common','epic','rare','legendary'].forEach(rk=>dropWeapon({name:'T',traits:[]},true,rk)); H.equipped=H.weapons.slice(0,5).map(w=>w.id); invSync();})()`));
 await p.click('[data-fkopen="bag"]'); await p.evaluate(()=>__advance(300));
 await p.mouse.move(700,300); await p.mouse.wheel(0,-300); r.zoomAfterWheelOnWindow = await p.evaluate(()=>__E('camZoom'));
 const keys = await p.$$eval('.fkw .islot.full[data-iloc="b"][data-ik^="w:"]',e=>e.map(x=>x.dataset.ik));
 for (const k of keys){ await p.click(`.fkw .islot[data-ik="${k}"]`,{button:'right'}); const has = await p.$('#ivctx [data-ic="swapc"]'); if (has){ const before = await p.evaluate(()=>__E('JSON.stringify(huntState().equipped)')); await has.click(); await p.evaluate(()=>__advance(200)); r.swapped = await p.evaluate(k=>__E(`huntState().equipped.includes('${k.slice(2)}')`), k); r.eqChanged = before !== await p.evaluate(()=>__E('JSON.stringify(huntState().equipped)')); break; } await p.mouse.click(1300,740); }
 console.log(JSON.stringify(r), errs); await b.close();})();
