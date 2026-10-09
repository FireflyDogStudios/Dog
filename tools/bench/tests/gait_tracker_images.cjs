// Gait Tracker smoke test: Open images (a set of still pictures, one per frame), the Rig landmarks track, mirroring a picture with its points, and the
// picture layout kept with the saved points (local mode). usage: node tools/bench/tests/gait_tracker_images.cjs <dir for screenshots>
const {chromium}=require('/home/user/Dog/node_modules/playwright'); const path=require('path'), fs=require('fs');
(async()=>{const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:950}}); const errs=[]; pg.on('pageerror',e=>errs.push(String(e))); pg.on('console',m=>{if(m.type()==='error') errs.push(m.text());});
 await pg.goto('file:///home/user/Dog/apps/gait-tracker/index.html'); await pg.waitForTimeout(600); const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m);
 const D='/home/user/Dog/ref/research/firefly/wolf-silhouettes/hand', files=fs.readdirSync(D).filter(f=>f.endsWith('.png')).map(f=>path.join(D,f));
 await pg.setInputFiles('#imgFiles',files); await pg.waitForFunction(()=>st.n>0,null,{timeout:20000}); await pg.waitForTimeout(400);
 ok(await pg.evaluate(()=>st.n)===files.length,`${files.length} pictures became ${await pg.evaluate(()=>st.n)} frames`);
 ok(await pg.evaluate(()=>['rH','rB','rF','rK','rT'].every(g=>tracks().some(t=>t.id===g))&&joints().filter(j=>j.id.startsWith('r_')).length===31),'5 rig tracks with 31 points');
 ok((await pg.textContent('#clipInfo')).includes('01_wolf'),'shows the picture name: '+await pg.textContent('#clipInfo'));
 // place the near shoulder on frame 2 (the left-facing 02), then mirror it
 await pg.evaluate(()=>{st.cur=1; st.sel='nSh'; st.keys.nSh={1:{x:300,y:300}}; draw();}); await pg.click('#mirrorImg'); await pg.waitForTimeout(300);
 const k=await pg.evaluate(()=>st.keys.nSh[1]); ok(Math.abs(k.x-(960-300))<1e-6,'mirroring moves the point with the picture: x '+k.x);
 const doc=await pg.evaluate(()=>buildDoc()); ok(doc.images&&doc.images.length===files.length&&doc.images[1].flip===true&&doc.images[0].s>0,'the saved doc keeps each picture\'s scale, offset and mirror');
 await pg.evaluate(()=>{st.cur=0; draw();}); await pg.waitForTimeout(300); await pg.screenshot({path:process.argv[2]+'/gt_images.png'});
 console.log('errors',errs.length?errs:'none'); await b.close();})();
