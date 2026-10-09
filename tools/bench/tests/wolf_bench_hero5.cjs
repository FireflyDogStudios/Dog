// Wolf Bench: hero5 in the creature menu. Picks it, steps the walk, opens every tab, ghosts hero3 over it, checks for page errors.
// usage: node tools/bench/tests/wolf_bench_hero5.cjs <dir for screenshots>
const {chromium}=require('/home/user/Dog/node_modules/playwright');
(async()=>{const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1400,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(String(e))); pg.on('console',m=>{if(m.type()==='error') errs.push(m.text());});
 await pg.goto('file:///home/user/Dog/apps/wolf-bench/index.html'); await pg.waitForTimeout(800);
 const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m);
 const opts=await pg.$$eval('#rig option',o=>o.map(x=>x.value+'|'+x.textContent)); ok(opts.some(o=>o.startsWith('hero5|')),'hero5 in the creature menu: '+opts.join(', '));
 await pg.selectOption('#rig','hero5'); await pg.waitForTimeout(300); ok(await pg.evaluate(()=>st.rig)==='hero5','hero5 loaded');
 const n=await pg.$$eval('#dog polygon,#dog path',e=>e.length); ok(n>20,'hero5 drawn on the stage: '+n+' shapes');
 await pg.click('#play').catch(()=>{}); await pg.waitForTimeout(600); await pg.screenshot({path:process.argv[2]+'/bench_hero5.png'});
 for(const t of ['T','P','C','Q','N']){await pg.click(`[aria-controls="pane${t}"], #tab${t}`).catch(()=>{}); await pg.waitForTimeout(250);}
 await pg.screenshot({path:process.argv[2]+'/bench_hero5_tabs.png'});
 await pg.selectOption('#cmp','hero3').catch(()=>{}); await pg.waitForTimeout(300); await pg.screenshot({path:process.argv[2]+'/bench_hero5_ghost.png'});
 await pg.selectOption('#rig','hero3'); await pg.waitForTimeout(300); ok(await pg.evaluate(()=>st.rig)==='hero3','back to hero3');
 ok(!errs.length,'no page errors'+(errs.length?': '+errs.slice(0,5).join(' | '):'')); await b.close();})();
