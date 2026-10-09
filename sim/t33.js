const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:768}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1500);
 for(let i=0;i<6;i++) await p.evaluate(()=>__advance(5000));
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.sos-ov").forEach(e=>e.remove()));
 await p.evaluate(()=>__E(`(()=>{const H=huntState();H.autoSalvage=false;['legendary','epic','rare','uncommon','common'].forEach(rk=>dropWeapon({name:'Test',traits:[]},true,rk)); H.view='armory'; fkOpen('hunt'); render();})()`));
 await p.evaluate(()=>__advance(300));
 const E=c=>p.evaluate(c=>__E(c),c);
 const r={};
 // 1 click a weapon tile
 const tiles=await p.$$('.fkw [data-a="w-open"]'); r.tiles=tiles.length;
 if(tiles[2]){ const id=await tiles[2].getAttribute('data-id'); await tiles[2].click(); await p.evaluate(()=>__advance(200)); r.wsel=(await E('huntState().wsel'))===id; }
 // 2 sub-tabs
 const views=await p.$$eval('.fkw [data-a="hunt-view"]',els=>els.map(e=>e.dataset.id)); r.views=views;
 for(const v of views){ await p.click(`.fkw [data-a="hunt-view"][data-id="${v}"]`); await p.evaluate(()=>__advance(200)); r['view_'+v]=(await E('huntState().view'))===v; }
 await p.click('.fkw [data-a="hunt-view"][data-id="armory"]').catch(()=>{}); await p.evaluate(()=>__advance(200));
 // 3 sort select
 const s=await p.$('.fkw select[data-wsort]'); if(s){ const opts=await s.$$eval('option',o=>o.map(x=>x.value)); await s.selectOption(opts[opts.length-1]); await p.evaluate(()=>__advance(200)); r.sort=(await E('huntState().wsort'))===opts[opts.length-1]; }
 // 4 list all data-a buttons in the armory card now
 r.cardActs=await p.$$eval('.fkw [data-a]',els=>[...new Set(els.map(e=>e.dataset.a))]);
 // 5 lock button
 const lk=await p.$('.fkw [data-a="w-lock"]'); if(lk){ const before=await E('JSON.stringify(huntState().weapons.map(w=>!!w.lock))'); await lk.click(); await p.evaluate(()=>__advance(200)); r.lock= before!==(await E('JSON.stringify(huntState().weapons.map(w=>!!w.lock))')); }
 // 6 other windows: count data-a and click a harmless one
 for(const w of ["bag","pack","tomes","mine","events"]){ try{ await E(`fkOpen('${w}')`); await p.evaluate(()=>__advance(200)); }catch(e){ r['open_'+w]=String(e).slice(0,80); } }
 r.wins=await p.$$eval('.fkw',ws=>ws.map(w=>(w.querySelector('.fkw-t,.fkw-h')||w).textContent.trim().slice(0,20)+':'+w.querySelectorAll('[data-a]').length));
 console.log(JSON.stringify(r,null,1)); console.log('errs',errs.slice(0,5)); await b.close();})();
