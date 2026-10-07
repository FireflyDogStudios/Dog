import { chromium } from 'playwright';
import { init } from './mock.mjs';
const [,, file, out, ...only] = process.argv;
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
const W={desktop:[1280,800],half:[640,800],phone:[390,800]};
async function run(name,w,h,sch,steps){
  const c=await b.newContext({viewport:{width:w,height:h},colorScheme:sch}); const p=await c.newPage();
  await p.addInitScript(init); await p.goto('file://'+file); await p.waitForTimeout(500);
  for(const [tag,fn] of steps){ if(fn) await fn(p); await p.waitForTimeout(150); await p.screenshot({path:`${out}/${tag}.png`});
    const ov=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth); if(ov) console.log('HSCROLL',tag); }
  await c.close();
}
const open=(t)=>async p=>{await p.click(`.row:has-text("${t}")`)};
const fld=(f)=>async p=>{await p.click(`[data-f="${f}"]`)};
const scn=(await import(process.argv[1].replace(/shot2.mjs$/,'scenes.mjs'))).default;
await scn({run,W,open,fld});
await b.close();
