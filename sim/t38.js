const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.addInitScript(()=>{ localStorage.setItem('dengame-dev','1'); });
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1500);
 for(let i=0;i<3;i++) await p.evaluate(()=>__advance(5000));
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.sos-ov").forEach(e=>e.remove()));
 const E=c=>p.evaluate(c=>__E(c),c); const adv=ms=>p.evaluate(m=>__advance(m),ms); const r={};
 const [b0,b1,b2] = await E(`invState().eqB.slice(0,3)`);
 await p.click('[data-fkopen="bag"]'); await adv(300);
 // open cfg for bag1 and set Weapons + Rare,Epic,Legendary
 await p.click(`.fkw [data-a="inv-cfg"][data-id="${b1}"]`); await adv(200);
 await p.screenshot({path:'sim/i38a.png'});
 for (const sel of [`[data-bcfg="pull"][data-bid="${b1}"][data-v="w"]`,`[data-bcfg="rar"][data-bid="${b1}"][data-v="r"]`,`[data-bcfg="rar"][data-bid="${b1}"][data-v="e"]`,`[data-bcfg="rar"][data-bid="${b1}"][data-v="l"]`]){ await p.click('.fkw label:has('+sel+')'); await adv(150); }
 r.cfg1 = await E(`JSON.stringify(invState().B['${b1}'].cfg)`);
 // bag2: consumables
 await E(`(()=>{const c=invState().B['${b2}'].cfg; c.pull=['c'];})()`);
 // clear bag0 auto (anything) - drop items
 await E(`(()=>{const H=huntState(); invSetSalvLevel(0); ['rare','common','epic','uncommon','legendary'].forEach(rk=>dropWeapon({name:'T',traits:[]},true,rk)); giveTreat(Object.keys(TREATS)[0],2,true); invSync();})()`);
 r.where = await E(`(()=>{const I=invState(); const out={}; eqBags(I).forEach(b=>{ out[b.id===('${b1}')?'rareBag':b.id===('${b2}')?'consBag':b.type+'_'+b.id.slice(-3)] = b.slots.filter(Boolean).map(k=>k[0]==='w'?invWeapon(k).r:k); }); return JSON.stringify(out);})()`);
 // lock bag0 then tidy all; expect bag0 unchanged
 await E(`(()=>{const b=invState().B['${b0}']; b.cfg.lock=true; b.slots.reverse();})()`);
 const before = await E(`JSON.stringify(invState().B['${b0}'].slots)`);
 await p.click('.fkw [data-a="inv-tidyall"]'); await adv(200);
 r.lockHeld = before === await E(`JSON.stringify(invState().B['${b0}'].slots)`);
 // protect bag0 -> salvage list empty
 await E(`invState().B['${b0}'].cfg.prot=true`); r.protJunk = await E(`invJunkList('${b0}').length`);
 await E(`invState().B['${b0}'].cfg.prot=false`); r.unprotJunk = await E(`invJunkList('${b0}').length`);
 // salvage one common via ctx, then undo
 const w0 = await E(`(()=>{const k=invState().B['${b0}'].slots.find(k=>k&&k[0]==='w'&&invWeapon(k).r==='common'); return k;})()`);
 if (w0){ await p.click(`.fkw .islot[data-ik="${w0}"]`,{button:'right'}); await p.click('#ivctx [data-ic="salvage"]'); await adv(200);
  r.salvaged = await E(`!huntState().weapons.some(w=>'w:'+w.id==='${w0}')`); r.recent = await E(`invState().recent.length`);
  await p.click('.fkw [data-a="inv-tab"][data-id="rec"]'); await adv(200); await p.screenshot({path:'sim/i38c.png'});
  await p.click('.fkw [data-a="inv-undo"][data-id="0"]'); await adv(200); r.undone = await E(`huntState().weapons.some(w=>'w:'+w.id==='${w0}')`);
  await p.click('.fkw [data-a="inv-tab"][data-id="bags"]'); await adv(200); }
 // rare confirm: right-click a rare in rareBag, click salvage once -> still there
 const rk = await E(`invState().B['${b1}'].slots.find(Boolean)`);
 if (rk){ await p.click(`.fkw .islot[data-ik="${rk}"]`,{button:'right'}); await p.click('#ivctx [data-ic="salvage"]'); await adv(100); r.rareStillAfter1 = await E(`!!invWeapon('${rk}') && huntState().weapons.some(w=>'w:'+w.id==='${rk}')`); r.ctxArm = await p.$eval('#ivctx',e=>e.innerText.includes('Click again')).catch(()=>false); await p.mouse.click(1300,880); await adv(100); }
 // master cog screenshot
 await p.click('.fkw .icog > summary'); await adv(150); await p.screenshot({path:'sim/i38b.png'});
 r.preview = await p.$eval('.fkw .ipre',e=>e.textContent.slice(0,60));
 console.log(JSON.stringify(r,null,1)); console.log('errs',errs.slice(0,8)); await b.close();})();
