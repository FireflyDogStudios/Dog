const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1366,height:768}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/ERR_TUNNEL/.test(m.text())) errs.push('console: '+m.text()); });
 await p.addInitScript({content: fs.readFileSync('sim/warp.js','utf8')});
 await p.addInitScript(()=>{ localStorage.setItem('dengame-dev','0'); });
 await p.goto('file://'+process.cwd()+'/sim/game.html'); await p.waitForTimeout(1500);
 const r = await p.evaluate(()=>__E(`(()=>{ const out={}; __advance(3000);
   // brew: give one and drink it; treat: give and eat; buff; mega debuff; skill buffs
   boostState().inv["str1"]=1; out.drank=drinkPot("str",1); out.potVal=potVal("str"); out.brewSt=SE.get(DINGO,"brew-str")&&SE.get(DINGO,"brew-str").data;
   giveTreat("kibble",1,true); eatTreat("kibble"); out.treatSpd=treatActive("spd"); out.chips=treatChips().length>0;
   grantBuff("nose"); out.nose=buffOn("nose");
   SE.apply(DINGO,"weakened",{dur:7}); out.weak=megaDebuff("weak"); out.dmgWeak=dmgMult();
   SK.cd={}; const lvl=playerLevel(); out.lvl=lvl;
   fkTick(true); out.bar=[...document.querySelectorAll('#fk-pst [data-id]')].map(x=>x.dataset.id);
   __advance(8000); out.weakAfter=megaDebuff("weak"); out.dmgAfter=dmgMult();
   out.saved=(huntState().st||[]).map(s=>s.id);
   // simulate reload: re-read state from the saved snapshot
   const snap=JSON.parse(JSON.stringify(huntState().st)); out.snapHasBrew=snap.some(s=>s.id==="brew-str"&&s.data&&s.data.v===1.5);
   return out; })()`));
 console.log(JSON.stringify(r,null,1), errs.slice(0,5)); await b.close(); })();
