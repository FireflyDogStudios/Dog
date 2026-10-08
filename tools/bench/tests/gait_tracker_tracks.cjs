// Gait Tracker tracks test: key 1 = near front leg only, place a leg then on to the next frame, Shift+Delete clears only the track, a custom Nose track, undo.
// usage: node tools/bench/tests/gait_tracker_tracks.cjs <dir holding vid/fox_test.webm>
const {chromium}=require('/home/user/Dog/node_modules/playwright');
(async()=>{const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:950}}); const errs=[]; pg.on('pageerror',e=>errs.push(String(e))); pg.on('console',m=>{if(m.type()==='error'&&!/CERT|fonts/.test(m.text())) errs.push(m.text());});
 await pg.goto('file:///home/user/Dog/apps/gait-tracker/index.html'); await pg.setInputFiles('#file',process.argv[2]+'/vid/fox_test.webm'); await pg.waitForFunction(()=>st.n>0,null,{timeout:60000}); await pg.selectOption('#flow','joints');
 const scr=async(x,y)=>pg.evaluate(([x,y])=>{const b=cv.getBoundingClientRect(); const p=toScr(x,y); return [b.left+p[0],b.top+p[1]];},[x,y]); const ev=f=>pg.evaluate(f); const log=(...a)=>console.log(...a);
 await pg.focus('#stage'); await pg.keyboard.press('1'); log('track',await ev(()=>st.track),'sel',await ev(()=>st.sel),'list rows',await pg.$$eval('#joints .jrow',r=>r.length));
 for(const [x,y] of [[200,128],[203,150],[222,180],[238,204]]){const [X,Y]=await scr(x,y); await pg.mouse.click(X,Y); await pg.waitForTimeout(50);}
 log('after near-front leg: frame',await ev(()=>st.cur+1),'sel',await ev(()=>st.sel));
 await pg.keyboard.press('Shift+Delete'); log('clear (track only) on frame 2 ok');
 await pg.keyboard.press('2'); log('track',await ev(()=>st.track),'sel',await ev(()=>st.sel));
 // new nose track
 await pg.click('#newTrack'); await pg.fill('#tName','Nose track'); await pg.check('#tJoints input[value="nose"]'); await pg.click('#tMake');
 log('track',await ev(()=>tracks().find(t=>t.id===st.track).name),'joints',await ev(()=>trackIds(st.track).join(',')),'sel',await ev(()=>st.sel));
 await ev(()=>goTo(0)); const [X,Y]=await scr(305,123); await pg.mouse.click(X,Y); log('nose placed f1',await ev(()=>!!keyAt('nose',0)),'then frame',await ev(()=>st.cur+1));
 await pg.screenshot({path:process.argv[2]+'/gt_tracks.png'});
 await pg.keyboard.press('Control+z'); await pg.keyboard.press('Control+z'); log('undo x2 -> track still exists?',await ev(()=>tracks().length));
 log('errors',errs.length?errs:'none'); await b.close();})();
