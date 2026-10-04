const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:768}});
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.addInitScript(()=>{ Math.random = (()=>{ let s=12345; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; })(); localStorage.setItem('dengame-dev','0'); });
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(800);
 const log=[]; for(let i=0;i<360;i++){ await p.evaluate(()=>__advance(500)); const r=await p.evaluate(()=>__E(`({k:huntState().kills, n:B.enemies.filter(e=>!e.dead).length, x:B.enemies.filter(e=>!e.dead).map(e=>Math.round(e.x)+(e.st&&e.st.length?'*':'')).join(',')})`)); log.push((i+1)*0.5+'s k'+r.k+' n'+r.n+' ['+r.x+']'); }
 console.log(log.filter((l,i)=>i%40===39).join('\n')); await b.close(); })();
