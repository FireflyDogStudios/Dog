// Wolf Bench smoke test: right-click menu, hide / show only / show all, trouble tag saved and outlined, kept after reload (local mode).
// usage: node tools/bench/tests/wolf_bench_parts.cjs <dir for screenshots>
const {chromium}=require('/home/user/Dog/node_modules/playwright');
(async()=>{const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1400,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(String(e))); pg.on('console',m=>{if(m.type()==='error') errs.push(m.text());});
 await pg.goto('file:///home/user/Dog/apps/wolf-bench/index.html'); await pg.waitForTimeout(800);
 await pg.click('#pStand'); await pg.waitForTimeout(200);
 // find the screen point of the eye part
 const pt=await pg.evaluate(()=>{const els=[...document.querySelectorAll('#dog [data-i]')]; const i=R.KEYS.indexOf('saddle'); const el=els.find(e=>+e.dataset.i===i); const r=el.getBoundingClientRect(); return {x:r.x+r.width*.5,y:r.y+r.height*.5};});
 await pg.mouse.move(pt.x,pt.y); await pg.mouse.click(pt.x,pt.y,{button:'right'}); await pg.waitForTimeout(200);
 const menu=await pg.$$eval('#cmenu button',B=>B.map(b=>b.textContent)); console.log('menu head:',await pg.textContent('#cmenu .mh')); console.log('items:',menu.join(' | '));
 await pg.screenshot({path:process.argv[2]+'/bench_menu.png'});
 await pg.click('#cmenu button:has-text("Hide this part")'); await pg.waitForTimeout(150);
 console.log('hidden strip:',await pg.textContent('#hidTxt'), 'drawn saddle?', await pg.evaluate(()=>[...document.querySelectorAll('#dog [data-i]')].some(e=>+e.dataset.i===R.KEYS.indexOf('saddle'))));
 await pg.keyboard.press('u'); await pg.waitForTimeout(150); console.log('after U strip hidden:',await pg.$eval('#hidStrip',e=>e.hidden));
 // tag trouble via menu
 const pt2=await pg.evaluate(()=>{const i=R.KEYS.indexOf('neck'); const el=[...document.querySelectorAll('#dog [data-i]')].find(e=>+e.dataset.i===i); const r=el.getBoundingClientRect(); return {x:r.x+r.width*.4,y:r.y+r.height*.3};});
 await pg.mouse.click(pt2.x,pt2.y,{button:'right'}); console.log('menu2 head:',await pg.textContent('#cmenu .mh'));
 await pg.click('#cmenu button:has-text("Tag as troubled")'); await pg.click('#tReasons button:has-text("Bad edge or seam")'); await pg.selectOption('#tSev','must'); await pg.fill('#tText','test tag'); await pg.click('#tSave'); await pg.waitForTimeout(250);
 console.log('trouble:',await pg.evaluate(()=>JSON.stringify(st.trouble.map(t=>[t.key,t.reasons,t.sev]))), 'outlines:',await pg.evaluate(()=>document.querySelectorAll('#stage [stroke-dasharray][stroke="#ff4d3a"]').length));
 // show only the near front leg
 const pt3=await pg.evaluate(()=>{const i=R.KEYS.indexOf('foreN.leg'); const el=[...document.querySelectorAll('#dog [data-i]')].find(e=>+e.dataset.i===i); const r=el.getBoundingClientRect(); return {x:r.x+r.width*.5,y:r.y+r.height*.5};});
 await pg.mouse.click(pt3.x,pt3.y,{button:'right'}); await pg.click('#cmenu button:has-text("Show only the near front leg")'); await pg.waitForTimeout(200);
 console.log('drawn parts after solo:',await pg.evaluate(()=>document.querySelectorAll('#dog [data-i]').length));
 await pg.screenshot({path:process.argv[2]+'/bench_solo.png'}); await pg.keyboard.press('u');
 await pg.click('#pFilter'); await pg.selectOption('#pFilter','all'); await pg.waitForTimeout(150); await pg.screenshot({path:process.argv[2]+'/bench_parts.png'});
 // reload: local persistence
 await pg.reload(); await pg.waitForTimeout(600); console.log('after reload trouble:',await pg.evaluate(()=>st.trouble.length));
 console.log('errors:',errs.length?errs:'none'); await b.close();})();
