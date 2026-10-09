const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:768}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push('console: '+m.text()); });
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.addInitScript(()=>{ localStorage.setItem('dengame-dev','1'); });
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1500);
 const r = await p.evaluate(()=>__E(`(()=>{ const out={se: typeof SE, defs: Object.keys(SE.DEFS).length};
   // run 20s of battle on the virtual clock, then inspect a live creature
   __advance(20000);
   const E = B.enemies.find(e=>!e.dead); out.enemies=B.enemies.length; out.kills=huntState().kills;
   if (E){ out.st = SE.active(E).map(a=>a.s.id); out.traits=E.traits; }
   // force a status and check the target frame shows it
   if (E){ SE.apply(E,"burrs",{per:3}); SE.apply(E,"burrs",{per:3}); SE.apply(E,"frostbit",{dur:2}); fkTick(true); out.chips=[...document.querySelectorAll('#fk-target .fk-sts [data-id]')].map(x=>x.dataset.id); out.chilled=E.el.classList.contains('chilled'); const hp0=E.hp; __advance(1100); out.hpDrop=hp0-E.hp; out.stacks=SE.stacks(E,'burrs'); }
   return out; })()`));
 console.log(JSON.stringify(r,null,1), errs.slice(0,5)); await b.close(); })();
