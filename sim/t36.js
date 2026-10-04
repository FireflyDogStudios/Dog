const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.addInitScript(()=>{ localStorage.setItem('dengame-dev','1'); localStorage.setItem('den-game-v1', JSON.stringify({treats:{bones:5,earned:999},hunt:{meats:5}})); });
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1500);
 for(let i=0;i<6;i++) await p.evaluate(()=>__advance(5000));
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.sos-ov").forEach(e=>e.remove()));
 const E=c=>p.evaluate(c=>__E(c),c); const r={};
 r.reset = await E(`[state.epoch, state.treats.earned]`);
 await E(`(()=>{const H=huntState(); H.autoSalvage=false; ['legendary','epic','rare','uncommon','common','common','rare'].forEach(rk=>dropWeapon({name:'Test',traits:[]},true,rk)); giveTreat(Object.keys(TREATS)[0],3,true); boostState().inv[Object.keys(POT_TYPES)[0]+'1']=2; baitState().inv[0]=4; invSync(); })()`);
 r.newCount = await E(`invNewCount()`);
 await p.click('[data-fkopen="bag"]'); await p.evaluate(()=>__advance(300));
 r.slots = await p.$$eval('.fkw .islot.full[data-iloc="b"]',els=>els.length);
 r.lo = await p.$$eval('.fkw .islot.full[data-iloc="l"]',els=>els.length);
 await p.screenshot({path:'sim/i36a.png'});
 // hover first new
 const nw = await p.$('.fkw .islot.new'); if (nw){ const bb=await nw.boundingBox(); await p.mouse.move(bb.x+20,bb.y+20); await p.waitForTimeout(150); r.tip = await p.$eval('#ivtip',e=>!e.hidden && e.textContent.slice(0,60)); await p.screenshot({path:'sim/i36b.png'}); }
 r.newAfterHover = await E(`invNewCount()`);
 // drag a weapon from bag to loadout slot 1
 const src = await p.$('.fkw .islot.full[data-iloc="b"][data-ik^="w:"]'); const lo = await p.$('.fkw .islot[data-iloc="l"][data-ii="0"]');
 const sb = await src.boundingBox(), lb = await lo.boundingBox(); const k = await src.getAttribute('data-ik');
 await p.mouse.move(sb.x+20,sb.y+20); await p.mouse.down(); await p.mouse.move(sb.x+40,sb.y+40,{steps:4}); await p.mouse.move(lb.x+20,lb.y+20,{steps:6}); await p.mouse.up(); await p.evaluate(()=>__advance(200));
 r.equipped = await E(`huntState().equipped.includes('${k.slice(2)}')`);
 // drag bag -> another empty bag slot
 const s2 = await p.$('.fkw .islot.full[data-iloc="b"]'); const k2=await s2.getAttribute('data-ik'); const e2 = await p.$('.fkw .islot.empty[data-iloc="b"][data-ii="30"]');
 const b2=await s2.boundingBox(), t2=await e2.boundingBox(); await p.mouse.move(b2.x+20,b2.y+20); await p.mouse.down(); await p.mouse.move(b2.x+40,b2.y+40,{steps:4}); await p.mouse.move(t2.x+20,t2.y+20,{steps:6}); await p.mouse.up(); await p.evaluate(()=>__advance(200));
 r.moved = await E(`invState().slots[30]==='${k2}'`);
 // right-click menu
 await p.click('.fkw .islot.full[data-iloc="b"][data-ik^="w:"]',{button:'right'}); await p.waitForTimeout(100); r.ctx = await p.$eval('#ivctx',e=>e.innerText.replace(/\n/g,' | ')); await p.screenshot({path:'sim/i36c.png'});
 // send to stash from menu
 await p.click('#ivctx [data-ic="stash"]'); await p.evaluate(()=>__advance(200)); r.stashUsed = await E(`invState().stash.filter(Boolean).length`);
 // tidy and junk
 await p.click('.fkw [data-a="inv-tidy"]'); await p.evaluate(()=>__advance(200));
 const jb = await p.$('.fkw [data-a="inv-junk"]'); r.junkDisabled = await jb.isDisabled();
 if (!r.junkDisabled){ await jb.click(); await p.evaluate(()=>__advance(200)); await p.click('.fkw [data-a="inv-junk"]'); await p.evaluate(()=>__advance(200)); }
 r.weaponsAfterJunk = await E(`huntState().weapons.length`);
 // currencies tab
 await p.click('.fkw [data-a="inv-tab"][data-id="cur"]'); await p.evaluate(()=>__advance(200)); await p.screenshot({path:'sim/i36d.png'}); await p.click('.fkw [data-a="inv-tab"][data-id="bags"]');
 // fill bags to overflow
 await E(`(()=>{ const H=huntState(); for(let i=0;i<75;i++) dropWeapon({name:'T',traits:[]},true,i%3?'rare':'common'); invSync(); })()`);
 r.over = await E(`invState().over.length`); r.badge = await p.evaluate(()=>{const b=document.querySelector('[data-fkopen="bag"] .ibadge'); return b && b.textContent+'/'+b.className;});
 await p.evaluate(()=>__advance(300)); await p.screenshot({path:'sim/i36e.png'});
 // home + stash
 await E(`huntState().home=true; applyHome(); render(); fkTick(true)`); await p.evaluate(()=>__advance(300));
 r.den = await p.$$eval('#fk-den button',els=>els.map(e=>e.dataset.fkopen));
 await p.click('#fk-den [data-fkopen="stash"]'); await p.evaluate(()=>__advance(300));
 r.stashSlots = await p.$$eval('.fkw .islot[data-iloc="s"]',els=>els.length);
 await p.screenshot({path:'sim/i36f.png'});
 // withdraw by dblclick
 const st = await p.$('.fkw .islot.full[data-iloc="s"]'); if (st){ await st.dblclick(); await p.evaluate(()=>__advance(200)); }
 r.stashAfter = await E(`invState().stash.filter(Boolean).length`);
 await E(`huntState().home=false; applyHome(); render(); fkTick(true)`); await p.evaluate(()=>__advance(300));
 r.stashWinOpenAway = await p.$$eval('.fkw',ws=>ws.map(w=>w.dataset.t).join(','));
 console.log(JSON.stringify(r,null,1)); console.log('errs',errs.slice(0,8)); await b.close();})();
