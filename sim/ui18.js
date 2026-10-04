const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:900,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1500);
 for(let i=0;i<20;i++) await p.evaluate(()=>__advance(10000));
 await p.evaluate(()=>document.querySelectorAll(".welcomeov,.lvlup,.mailnote,.sos-ov").forEach(e=>e.remove()));
 await p.evaluate(()=>__E(`(()=>{const E=B.enemies[0]||{name:'Rat',icon:'🐀',x:300,el:document.querySelector('#dingo'),traits:[]}; for(let i=0;i<4;i++) dropFx(E, dropWeapon(E)); toast("🪙 A rare Dingo Coin dropped!"); toast("🪙 A rare Dingo Coin dropped!"); feed("🐗","Tusk Boar down! +1.2K meats","#ffd34d"); pendingLevel=7; levelUpCheck(); })()`));
 await p.evaluate(()=>__advance(400));
 await p.screenshot({path:'sim/feed.png'});
 console.log('feed lines', await p.$$eval('.lf', x=>x.map(e=>e.innerText)), 'ribbon', await p.$$eval('.lvlrib',x=>x.map(e=>e.innerText)), 'modal', await p.$$eval('.lvlup',x=>x.length));
 // meta trial drain test
 const r = await p.evaluate(()=>__E(`(()=>{B.trial={zone:'meadow',meta:true,wave:1,pts:0,kills:0,waveEnd:Date.now()+60000,energy:100,lastT:Date.now(),loot:[],bossDue:false,tp:0}; return 1})()`));
 for(let i=0;i<10;i++) await p.evaluate(()=>__advance(3000));
 console.log('meta after 30s', await p.evaluate(()=>__E('JSON.stringify({e:Math.round(B.trial?B.trial.energy:-1),w:B.trial&&B.trial.wave,k:B.trial&&B.trial.kills})')), await p.$eval('#trialbar', x=>x.innerText).catch(()=>'nobar'));
 console.log('errs',errs.slice(0,5), await p.evaluate(()=>window.__errs||[]));
 await b.close();})();
