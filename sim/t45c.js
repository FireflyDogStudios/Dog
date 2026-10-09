const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:768}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message+'\n'+(e.stack||'').split('\n').slice(0,3).join('\n')));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.addInitScript(()=>{ Math.random = (()=>{ let s=12345; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; })(); localStorage.setItem('dengame-dev','0'); });
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(800);
 for(let i=0;i<200;i++){ await p.evaluate(()=>__advance(500)); if (errs.length) break; }
 const r=await p.evaluate(()=>__E(`(()=>{ const E=B.enemies.filter(e=>!e.dead).sort((a,b)=>a.x-b.x)[0]; return E?{x:E.x,hp:E.hp,max:E.max,st:SE.active(E).map(a=>a.s.id+':'+a.s.stacks+':'+Math.round((a.s.until||0)-performance.now())),dead:E.dead,boss:!!E.boss,name:E.name,invuln:E.invuln,passing:E.passing}:null })()`));
 console.log(JSON.stringify(r), '\nERRS:', errs.slice(0,3).join('\n---\n')); await b.close(); })();
