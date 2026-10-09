const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file://'+process.cwd()+'/../mock_test.html'); await p.waitForTimeout(800);
 await p.screenshot({path:'../m1.png'});
 const r={};
 r.badge0=await p.$eval('#newbadge',e=>e.textContent);
 const nw=await p.$('.slot.new'); const bb=await nw.boundingBox(); await p.mouse.move(bb.x+20,bb.y+20); await p.waitForTimeout(200); await p.screenshot({path:'../m2.png'});
 r.badge1=await p.$eval('#newbadge',e=>e.textContent);
 // drag satchel 0 (epic bow) onto loadout slot 4
 const a=await (await p.$('.slot[data-loc="satchel"][data-i="0"]')).boundingBox(), t=await (await p.$('.slot[data-loc="lo"][data-i="3"]')).boundingBox();
 await p.mouse.move(a.x+20,a.y+20); await p.mouse.down(); await p.mouse.move(a.x+60,a.y+40,{steps:5}); await p.mouse.move(t.x+20,t.y+20,{steps:8}); await p.mouse.up();
 r.lo3=await p.$eval('.slot[data-loc="lo"][data-i="3"]',e=>e.getAttribute('aria-label'));
 // drag treat onto loadout -> refused
 const tr=await (await p.$('.slot[data-loc="satchel"][data-i="6"]')).boundingBox(), t4=await (await p.$('.slot[data-loc="lo"][data-i="4"]')).boundingBox();
 await p.mouse.move(tr.x+20,tr.y+20); await p.mouse.down(); await p.mouse.move(tr.x+60,tr.y+40,{steps:5}); await p.mouse.move(t4.x+20,t4.y+20,{steps:8}); await p.mouse.up();
 r.lo4empty=await p.$eval('.slot[data-loc="lo"][data-i="4"]',e=>e.classList.contains('empty'));
 // right click legendary
 await p.click('.slot[data-loc="satchel"][data-i="5"]',{button:'right'}); await p.waitForTimeout(100); await p.screenshot({path:'../m3.png'});
 r.ctx=await p.$eval('#ctx',e=>e.innerText.replace(/\n/g,' | '));
 await p.keyboard.press('Escape');
 await p.click('#tidy'); await p.waitForTimeout(100);
 r.afterTidy=await p.$$eval('#bags .slot[data-loc="satchel"].full',els=>els.map(e=>e.getAttribute('aria-label')).join(', '));
 await p.click('#junk'); await p.waitForTimeout(100);
 r.afterJunk=await p.$$eval('#bags .slot[data-loc="satchel"].full',els=>els.length);
 r.toasts=await p.$$eval('.toast',els=>els.map(e=>e.textContent));
 await p.dblclick('.slot[data-loc="satchel"][data-i="0"]'); 
 await p.click('[data-open="w-alc"]'); await p.click('[data-alc="Bait"]'); await p.click('[data-craft]'); await p.waitForTimeout(100);
 await p.click('[data-open="w-lib"]'); await p.waitForTimeout(200); await p.screenshot({path:'../m4.png'});
 await p.click('#w-inv [data-itab="cur"]'); await p.waitForTimeout(100); await p.screenshot({path:'../m5.png'});
 await p.setViewportSize({width:420,height:900}); await p.waitForTimeout(200); r.hscroll=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth); await p.screenshot({path:'../m6.png',fullPage:false});
 console.log(JSON.stringify(r,null,1)); console.log('errs',errs); await b.close();})();
