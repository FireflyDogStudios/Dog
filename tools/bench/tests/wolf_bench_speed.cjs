// Wolf Bench smoke test: the speed slider and chips, , . keys, step size, go to %, loop a range, and clear all issues (local mode).
// usage: node tools/bench/tests/wolf_bench_speed.cjs <dir for screenshots>
const {chromium}=require('/home/user/Dog/node_modules/playwright');
(async()=>{const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1400,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(String(e))); pg.on('console',m=>{if(m.type()==='error') errs.push(m.text());});
 await pg.goto('file:///home/user/Dog/apps/wolf-bench/index.html'); await pg.waitForTimeout(800);
 const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m);
 await pg.click('#speedChips button:has-text("0.1×")'); ok(Math.abs(await pg.evaluate(()=>st.speed)-.1)<1e-9,'chip sets 0.1x: '+await pg.textContent('#speedV'));
 await pg.keyboard.press('.'); ok(Math.abs(await pg.evaluate(()=>st.speed)-.125)<1e-9,'full stop speeds up 1.25x: '+await pg.textContent('#speedV'));
 await pg.keyboard.press(','); await pg.keyboard.press(','); ok(Math.abs(await pg.evaluate(()=>st.speed)-.08)<1e-9,'comma slows: '+await pg.textContent('#speedV'));
 await pg.$eval('#speed',e=>{e.value=0; e.dispatchEvent(new Event('input'));}); ok(Math.abs(await pg.evaluate(()=>st.speed)-.02)<1e-9,'slider low end 0.02x');
 await pg.$eval('#speed',e=>{e.value=1000; e.dispatchEvent(new Event('input'));}); ok(Math.abs(await pg.evaluate(()=>st.speed)-2)<1e-9,'slider high end 2x');
 await pg.fill('#goPct','37.5'); await pg.press('#goPct','Enter'); await pg.click('#stage',{position:{x:5,y:5}}).catch(()=>{}); ok(Math.abs(await pg.evaluate(()=>phaseNow())-.375)<1e-6,'go to 37.5%: '+await pg.textContent('#pct'));
 await pg.selectOption('#stepDiv','240'); await pg.evaluate(()=>document.activeElement.blur()); await pg.keyboard.press('ArrowRight'); ok(Math.abs(await pg.evaluate(()=>phaseNow())-(.375+1/240))<1e-6,'step 1/240');
 await pg.fill('#loopA','60'); await pg.fill('#loopB','70'); await pg.click('#loopOn'); await pg.click('#speedChips button:has-text("1.5×")'); await pg.click('#play');
 const seen=[]; for(let i=0;i<30;i++){await pg.waitForTimeout(50); seen.push(await pg.evaluate(()=>phaseNow()));}
 ok(seen.every(p=>p>=.6-1e-9&&p<.7+1e-9),'loop stays in 60-70%: '+Math.min(...seen).toFixed(3)+'-'+Math.max(...seen).toFixed(3));
 await pg.fill('#loopA','90'); await pg.press('#loopA','Enter'); await pg.fill('#loopB','5'); await pg.press('#loopB','Enter'); await pg.waitForTimeout(100);
 const seen2=[]; for(let i=0;i<30;i++){await pg.waitForTimeout(50); seen2.push(await pg.evaluate(()=>phaseNow()));}
 ok(seen2.every(p=>p>=.9-1e-9||p<.05+1e-9),'loop across the stride end 90-5%');
 await pg.click('#play'); await pg.screenshot({path:process.argv[2]+'/bench_speed.png'});
 // clear all: make two notes and a tag in local mode, then clear
 await pg.evaluate(()=>{st.notes=[{id:'local1',rig:'hero3',status:'open',text:'a',type:'pin',joint:'body',lx:30,ly:15,phase:.5},{id:'local2',rig:'hero3',status:'fixed',text:'b',type:'pin',joint:'body',lx:31,ly:15,phase:.5}]; st.trouble=[{id:'hero3~eye',rig:'hero3',key:'eye',status:'open'}]; renderNotes(); renderParts();});
 await pg.click('#tabN'); await pg.click('#nClearFixed'); ok((await pg.textContent('#nClearFixed')).includes('Delete 1'),'clear fixed asks first: '+await pg.textContent('#nClearFixed'));
 await pg.click('#nClearFixed'); await pg.waitForTimeout(100); ok(await pg.evaluate(()=>st.notes.length)===1,'clear fixed removes 1');
 await pg.click('#nClearAll'); ok((await pg.textContent('#nClearAll')).includes('1 note + 1 tag'),'clear all asks: '+await pg.textContent('#nClearAll'));
 await pg.click('#nClearAll'); await pg.waitForTimeout(100); ok(await pg.evaluate(()=>st.notes.length+st.trouble.length)===0,'clear all removes notes and tags: '+await pg.textContent('#store'));
 console.log('errors',errs.length?errs:'none'); await b.close();})();
