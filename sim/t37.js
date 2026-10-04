const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.addInitScript(()=>{ localStorage.setItem('dengame-dev','1'); localStorage.setItem('den-game-v1', JSON.stringify({epoch:2,treats:{bones:5,earned:9},inv:{bags:["satchel","keep",null,null,null,null],slots:Array(28).fill(null)}})); });
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1500);
 for(let i=0;i<4;i++) await p.evaluate(()=>__advance(5000));
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.sos-ov").forEach(e=>e.remove()));
 const E=c=>p.evaluate(c=>__E(c),c); const r={};
 r.migrated = await E(`JSON.stringify(invState().eqB.map(id=>id&&invState().B[id].type))`);
 await E(`(()=>{ const I=invState(); const id='bgX'; I.B[id]={id,type:'satchel',name:'',slots:Array(20).fill(null)}; I.eqB[2]=id; huntState().autoSalvage=false; ['legendary','epic','rare','uncommon','common','common','rare','uncommon'].forEach(rk=>dropWeapon({name:'Test',traits:[]},true,rk)); giveTreat(Object.keys(TREATS)[0],3,true); invSync(); })()`);
 await p.click('[data-fkopen="bag"]'); await p.evaluate(()=>__advance(300));
 // hover a non-equipped weapon -> compare
 const ws = await p.$$('.fkw .islot.full[data-iloc="b"][data-ik^="w:"]'); const bb=await ws[0].boundingBox(); await p.mouse.move(bb.x+25,bb.y+25); await p.waitForTimeout(150);
 r.cards = await p.$$eval('#ivtip .ivcard',e=>e.length); await p.screenshot({path:'sim/i37a.png'});
 await p.mouse.move(5,5);
 // per-bag tidy on first bag
 const b1 = await E(`invState().eqB[0]`);
 await E(`(()=>{const b=invState().B['${b1}']; b.slots=b.slots.slice().reverse();})()`);
 const otherBefore = await E(`JSON.stringify(invState().B['bgX'].slots)`);
 await p.click(`.fkw [data-a="inv-tidy"][data-id="${b1}"]`); await p.evaluate(()=>__advance(200));
 r.tidyFirstSlotFilled = await E(`!!invState().B['${b1}'].slots[0]`); r.otherUntouched = otherBefore === await E(`JSON.stringify(invState().B['bgX'].slots)`);
 // per-bag junk (two clicks)
 const jb = `.fkw [data-a="inv-junk"][data-id="${b1}"]`; r.junkN = await E(`invJunkList('${b1}').length`);
 await p.click(jb); await p.evaluate(()=>__advance(100)); await p.click(jb); await p.evaluate(()=>__advance(200)); r.junkAfter = await E(`invJunkList('${b1}').length`);
 // rename
 await p.click(`.fkw [data-a="inv-ren"][data-id="${b1}"]`); await p.waitForTimeout(80); await p.keyboard.type('Weapons'); await p.keyboard.press('Enter'); await p.evaluate(()=>__advance(200));
 r.name = await E(`invState().B['${b1}'].name`);
 // reorder bags: drag strip 0 to strip 4 (empty)
 const s0 = await (await p.$('.fkw .ibag[data-ibag="0"]')).boundingBox(), s4 = await (await p.$('.fkw .ibag[data-ibag="4"]')).boundingBox();
 await p.mouse.move(s0.x+20,s0.y+20); await p.mouse.down(); await p.mouse.move(s0.x+40,s0.y+30,{steps:4}); await p.mouse.move(s4.x+20,s4.y+20,{steps:6}); await p.mouse.up(); await p.evaluate(()=>__advance(200));
 r.order = await E(`JSON.stringify(invState().eqB.map(id=>id?invState().B[id].name||invState().B[id].type:null))`);
 // stow named bag via context menu
 const cnt = await E(`invState().B['${b1}'].slots.filter(Boolean).length`);
 await p.click(`.fkw .ibag[data-bid="${b1}"]`,{button:'right'}); await p.click('#ivctx [data-ic="bstow"]'); await p.evaluate(()=>__advance(200));
 r.stowed = await E(`[invState().stash.filter(Boolean), invState().eqB.includes('${b1}'), (invState().B['${b1}'].w||[]).length, ${cnt}]`);
 r.liveAfterStow = await E(`huntState().weapons.length`);
 // wear back at home
 await E(`huntState().home=true; applyHome(); render(); fkTick(true)`); await p.click('#fk-den [data-fkopen="stash"]'); await p.evaluate(()=>__advance(300));
 await p.dblclick('.fkw .islot.full[data-iloc="s"][data-ik^="g:"]'); await p.evaluate(()=>__advance(300));
 r.worn = await E(`[invState().eqB.includes('${b1}'), invState().B['${b1}'].slots.filter(Boolean).length, huntState().weapons.length]`);
 await p.screenshot({path:'sim/i37b.png'});
 console.log(JSON.stringify(r)); console.log('errs',errs.slice(0,8)); await b.close();})();
