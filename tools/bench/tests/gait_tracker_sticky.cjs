// Gait Tracker sticky-joint test (GrumpyDingo Oct 8): pick the wrist, click 5 frames: every point is the wrist, the frame advances, a nearby elbow point is never grabbed.
// usage: node tools/bench/tests/gait_tracker_sticky.cjs <dir holding vid/fox_test.webm>
const {chromium}=require('/home/user/Dog/node_modules/playwright');
(async()=>{const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:950}}); const errs=[]; pg.on('pageerror',e=>errs.push(String(e)));
 await pg.goto('file:///home/user/Dog/apps/gait-tracker/index.html'); await pg.setInputFiles('#file',process.argv[2]+'/vid/fox_test.webm'); await pg.waitForFunction(()=>st.n>0,null,{timeout:60000});
 const scr=async(x,y)=>pg.evaluate(([x,y])=>{const b=cv.getBoundingClientRect(); const p=toScr(x,y); return [b.left+p[0],b.top+p[1]];},[x,y]); const ev=f=>pg.evaluate(f);
 console.log('flow',await pg.$eval('#flow',e=>e.value));
 // put an elbow point near where the wrist clicks will land, to prove clicks do not grab it
 await ev(()=>{for(let f=0;f<5;f++) st.keys.nEl={...(st.keys.nEl||{}),[f]:{x:222-12*f+4,y:178}}; rebuildAll();});
 await ev(()=>{st.sel='nCa'; renderJoints();}); await ev(()=>goTo(0));
 for(let f=0;f<5;f++){const [X,Y]=await scr(222-12*f,180); await pg.mouse.click(X,Y); await pg.waitForTimeout(40);}
 console.log('selected after 5 clicks',await ev(()=>st.sel),'frame',await ev(()=>st.cur+1));
 console.log('wrist frames',await ev(()=>Object.keys(st.keys.nCa||{}).join(',')),'| elbow untouched',await ev(()=>Object.values(st.keys.nEl).every((k,i)=>Math.abs(k.x-(226-12*i))<.01)));
 console.log('other joints with points',await ev(()=>Object.keys(st.keys).filter(j=>j!=='nCa'&&j!=='nEl'&&Object.keys(st.keys[j]).length).join(',')||'none'));
 console.log('errors',errs.length?errs:'none'); await b.close();})();
