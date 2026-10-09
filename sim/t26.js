const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:900,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1200);
 for(let i=0;i<4;i++) await p.evaluate(()=>__advance(5000));
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.mailnote,.sos-ov").forEach(e=>e.remove()));
 await p.evaluate(()=>__E(`(()=>{huntState().autoSalvage=false; const P=dingoPos(); const E={name:'Test Boar',icon:'🐗',x:P.x+160,el:document.querySelector('#dingo'),traits:[]}; E.el={style:{top:(P.y-18)+'px'}}; ['common','rare','epic','legendary'].forEach((rk,i)=>{const e2=Object.assign({},E,{x:P.x+120+i*70}); dropFx(e2, dropWeapon(e2,true,rk));}); meatShower(P.x+300, P.y, 18, true); lootPile(P.x+420, P.y-20, [["🌟","3 Mega Cores"],["💠","40 Arcane Dust"],["📜","5 Scroll Paper"]]); })()`));
 for(let i=0;i<6;i++) await p.evaluate(()=>__advance(100));
 const h=await p.$('section.hero'); await h.screenshot({path:'sim/gl1.png'});
 console.log('ground items', await p.$$eval('.gl', x=>x.length));
 for(let i=0;i<10;i++) await p.evaluate(()=>__advance(1000));
 await p.waitForTimeout(800); console.log('after 10s', await p.$$eval('.gl', x=>x.length), await p.evaluate(()=>__E('GL.length')), 'feed', await p.$$eval('.lf', x=>x.map(e=>e.innerText.slice(0,40))));
 await p.evaluate(()=>__E(`(()=>{const H=huntState(); const w=H.weapons.find(w=>w.r==='legendary'); H.wsel=w.id; H.view='armory'; tab='hunt'; render(); })()`));
 await p.evaluate(()=>__advance(300)); const c=await p.$('.icard'); if(c){ await c.scrollIntoViewIfNeeded(); await c.screenshot({path:'sim/card.png'}); }
 console.log('errs',errs.slice(0,5), await p.evaluate(()=>window.__errs||[]));
 await b.close();})();
