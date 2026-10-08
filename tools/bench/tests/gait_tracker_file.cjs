// Gait Tracker file test: import GrumpyDingo's saved fox points, backup, CSV export (clipboard fallback), undo the import.
// usage: node tools/bench/tests/gait_tracker_file.cjs <dir holding vid/fox_test.webm>
const {chromium}=require('/home/user/Dog/node_modules/playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:900},permissions:['clipboard-read','clipboard-write']}); const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(String(e)));
 await pg.goto('file:///home/user/Dog/apps/gait-tracker/index.html'); await pg.setInputFiles('#file',process.argv[2]+'/vid/fox_test.webm'); await pg.waitForFunction(()=>st.n>0,null,{timeout:60000});
 const ev=f=>pg.evaluate(f);
 // import GrumpyDingo's real saved doc
 const doc=JSON.parse(fs.readFileSync('/home/user/Dog/ref/research/firefly/fox-walk-analysis/tracked/clips/Fox.mp4_480x270_433_0_1500.json','utf8')); fs.writeFileSync(process.argv[2]+'/import.json',JSON.stringify(doc));
 await pg.click('#fileMenu summary'); await pg.setInputFiles('#fImport',process.argv[2]+'/import.json'); await pg.waitForTimeout(800);
 console.log('imported points',await ev(()=>Object.values(st.keys).reduce((a,K)=>a+Object.keys(K).length,0)),'toast',await pg.textContent('#banner'));
 await ev(()=>{$('fileMenu').open=true;}); await pg.click('#fBackup'); await pg.waitForTimeout(300); await ev(()=>{$('fileMenu').open=true;}); console.log('backups:',await pg.textContent('#backups'));
 await pg.click('#fCsv'); await pg.waitForTimeout(300); const csv=await pg.evaluate(()=>navigator.clipboard.readText()); console.log('csv lines',csv.split('\n').length,'header',csv.split('\n')[0].slice(0,90));
 await pg.keyboard.press('Control+z'); console.log('after undo of import',await ev(()=>Object.values(st.keys).reduce((a,K)=>a+Object.keys(K).length,0)));
 await pg.evaluate(()=>goTo(20)); await pg.screenshot({path:process.argv[2]+'/gt_imported.png'});
 console.log('errors',errs.length?errs:'none'); await b.close();})();
