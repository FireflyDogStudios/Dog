// Gait Tracker layout screenshot: three key frames on the near front leg, Fill, footfalls; writes <dir>/gt_layout.png
// usage: node tools/bench/tests/gait_tracker_shot.cjs <dir holding vid/fox_test.webm> [width height]
const {chromium}=require('/home/user/Dog/node_modules/playwright');
(async()=>{const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:+process.argv[3]||1440,height:+process.argv[4]||900}}); const errs=[]; pg.on('pageerror',e=>errs.push(String(e)));
 await pg.goto('file:///home/user/Dog/apps/gait-tracker/index.html'); await pg.setInputFiles('#file',process.argv[2]+'/vid/fox_test.webm'); await pg.waitForFunction(()=>st.n>0,null,{timeout:60000});
 await pg.evaluate(()=>{const P={nSh:[200,128],nEl:[203,150],nCa:[222,180],nFp:[238,204]}; for(const f of [0,4,8]) for(const [j,[x,y]] of Object.entries(P)) setKey(j,f,{x:x-11*f,y:y+(j==='nFp'?0:f*.2)}); st.events.nFp={down:[0,16],up:[9]}; st.sel='nCa'; $("fill").click(); goTo(5);});
 await pg.waitForTimeout(900); await pg.screenshot({path:process.argv[2]+'/gt_layout.png'}); console.log('errors',errs.length?errs:'none'); await b.close();})();
