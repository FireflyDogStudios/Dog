// Gait Tracker smoke test: load a clip (Chromium here plays .webm, not H.264: convert with ffmpeg -c:v libvpx-vp9), click key points, fill, print the tracked points and the carpus angle.
// usage: node tools/bench/tests/gait_tracker.cjs <dir holding vid/fox_test.webm, screenshots land there> '[[frame,"jointId",x,y],...]'
const {chromium}=require('/home/user/Dog/node_modules/playwright');
(async()=>{const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:950}}); const errs=[]; pg.on('pageerror',e=>errs.push(String(e))); pg.on('console',m=>{if(m.type()==='error'&&!/CERT|fonts/.test(m.text())) errs.push(m.text());});
 await pg.goto('file:///home/user/Dog/apps/gait-tracker/index.html'); await pg.waitForTimeout(500);
 await pg.setInputFiles('#file',process.argv[2]+'/vid/fox_test.webm');
 await pg.waitForFunction(()=>st.n>0,null,{timeout:60000}); console.log('frames',await pg.evaluate(()=>[st.n,st.fw,st.fh,st.clip.fps]));
 // place near front leg points on frames 1 and 9 by clicking (frame px -> screen)
 const click=async(f,j,x,y)=>{await pg.evaluate(([f,j])=>{goTo(f); st.sel=j;},[f,j]); const [X,Y]=await pg.evaluate(([x,y])=>{const b=cv.getBoundingClientRect(); const p=toScr(x,y); return [b.left+p[0],b.top+p[1]];},[x,y]); await pg.mouse.click(X,Y);};
 const pts=JSON.parse(process.argv[3]);
 for(const [f,j,x,y] of pts) await click(f,j,x,y);
 await pg.evaluate(()=>fillAll()); await pg.waitForTimeout(1500);
 const out=await pg.evaluate(()=>{const o={}; for(const j of ['nEl','nCa','nFp']){const R=st.res[j]; o[j]=Array.from({length:12},(_,f)=>R&&!isNaN(R.x[f])?[+R.x[f].toFixed(1),+R.y[f].toFixed(1),R.src[f],+R.s[f].toFixed(2)]:null);} return {o,flags:flagList.length,ang:angleSeries(BASE_ANG.find(a=>a.id==='ncarpus')).slice(0,12).map(v=>v==null?null:Math.round(v))};});
 for(const j in out.o) console.log(j,JSON.stringify(out.o[j].slice(0,9).map(p=>p&&[p[0],p[1],p[3]]))); console.log('carpus',JSON.stringify(out.ang),'flags',out.flags);
 await pg.evaluate(()=>{goTo(4); st.sel='nCa';}); await pg.waitForTimeout(300); await pg.screenshot({path:process.argv[2]+'/gt_f5.png'});
 await pg.click('#tabA'); await pg.waitForTimeout(300); await pg.screenshot({path:process.argv[2]+'/gt_angles.png'});
 console.log('errors',errs.length?errs:'none'); await b.close();})();
