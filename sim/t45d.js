const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:768}});
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.addInitScript(()=>{ Math.random = (()=>{ let s=12345; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; })(); localStorage.setItem('dengame-dev','0'); });
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(800);
 for(let i=0;i<200;i++){ await p.evaluate(()=>__advance(500)); }
 const r=await p.evaluate(()=>__E(`(()=>{ const P=dingoPos(); return {P:{x:Math.round(P.x)}, kills:huntState().kills, ghosts:B.ghosts.map(g=>({ph:g.f&&g.f.phase, en:g.f&&g.f.enemy&&g.f.enemy.name, dead:g.f&&g.f.enemy&&g.f.enemy.dead})), en:B.enemies.filter(e=>!e.dead).sort((a,b)=>a.x-b.x).slice(0,5).map(e=>({n:e.name,x:Math.round(e.x),hp:Math.round(e.hp),max:e.max,pass:e.passing,st:(typeof SE!=='undefined'?SE.active(e).map(a=>a.s.id).join('/'):(e.stun>0?'stun':'')+(e.healer?'/healer':'')),fly:e.flying,inv:e.invuln,kb:e.kb,fixed:e.fixed})), halt:document.querySelector('section.hero').classList.contains('halt')} })()`));
 console.log(JSON.stringify(r,null,1)); await b.close(); })();
