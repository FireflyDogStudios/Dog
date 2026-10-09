// Gait Tracker smoke test: guided mode on the image set: Start guided, the card, a click places the point and moves on, skip (X), back (Backspace),
// finishing a picture moves to the next one. usage: node tools/bench/tests/gait_tracker_guided.cjs <dir for screenshots>
const {chromium}=require('/home/user/Dog/node_modules/playwright'); const path=require('path'), fs=require('fs');
(async()=>{const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:950}}); const errs=[]; pg.on('pageerror',e=>errs.push(String(e))); pg.on('console',m=>{if(m.type()==='error') errs.push(m.text());});
 await pg.goto('file:///home/user/Dog/apps/gait-tracker/index.html'); await pg.waitForTimeout(600); const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m);
 const D='/home/user/Dog/ref/research/firefly/wolf-silhouettes/hand', files=fs.readdirSync(D).filter(f=>f.endsWith('.png')).map(f=>path.join(D,f)).slice(0,2);
 await pg.setInputFiles('#imgFiles',files); await pg.waitForFunction(()=>st.n>0,null,{timeout:20000}); await pg.waitForTimeout(300);
 await pg.click('#guideBtn'); await pg.waitForTimeout(150);
 ok(!(await pg.isHidden('#guide'))&&(await pg.textContent('#gName')).includes('Nose'),'guided card shows the first point: '+await pg.textContent('#gName'));
 const box=await pg.locator('#stage').boundingBox(); const click=async(fx,fy)=>{await pg.mouse.click(box.x+box.width*fx,box.y+box.height*fy); await pg.waitForTimeout(80);};
 await click(.62,.42); ok(await pg.evaluate(()=>!!keyAt('nose',0)&&st.sel==='r_stop'),'click placed the nose and moved to: '+await pg.textContent('#gName'));
 await pg.keyboard.press('x'); ok(await pg.evaluate(()=>keyAt('r_stop',0)&&keyAt('r_stop',0).occ&&st.sel==='r_brow'),'X skipped the stop (hidden) and moved on');
 await pg.keyboard.press('Backspace'); ok(await pg.evaluate(()=>st.sel==='r_stop'),'Backspace went back to the stop');
 await pg.screenshot({path:process.argv[2]+'/gt_guided.png'});
 // finish picture 1 quickly: place every remaining point by clicking
 const n=await pg.evaluate(()=>gList().length); for(let i=0;i<n+2&&await pg.evaluate(()=>st.cur===0&&guide.on);i++) await click(.62+.3*(i%7)/7*.4,.08+.8*Math.floor(i/7)/8);
 ok(await pg.evaluate(()=>st.cur===1&&guide.on),'finishing picture 1 moved on to picture 2, guided still on ('+n+' points per picture)');
 await pg.click('summary:has-text("File")'); await pg.click('#fClear'); ok((await pg.textContent('#fClear')).includes('Delete all'),'Clear all points asks first'); await pg.click('#fClear'); await pg.waitForTimeout(200);
 ok(await pg.evaluate(()=>Object.values(st.keys).every(K=>!Object.keys(K).length)),'Clear all points removed every point');
 ok(await pg.evaluate(()=>!!document.querySelector('#gMap svg')),'the guide card shows the wolf diagram');
 console.log('errors',errs.length?errs:'none'); await b.close();})();
