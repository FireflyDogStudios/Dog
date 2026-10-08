// Gait Tracker share test: import the saved fox points, export GIF, frame sheet and zip (captured through the no-downloads fallback), check them with PIL / zipfile.
// usage: node tools/bench/tests/gait_tracker_gif.cjs <dir holding vid/fox_test.webm and import.json>
const {chromium}=require('/home/user/Dog/node_modules/playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(String(e)));
 await pg.goto('file:///home/user/Dog/apps/gait-tracker/index.html'); await pg.setInputFiles('#file',process.argv[2]+'/vid/fox_test.webm'); await pg.waitForFunction(()=>st.n>0,null,{timeout:60000});
 await pg.evaluate(()=>{$('fileMenu').open=true;}); await pg.setInputFiles('#fImport',process.argv[2]+'/import.json'); await pg.waitForTimeout(700);
 const grab=async(id,out)=>{await pg.evaluate(()=>{window.__lastExport=null;}); await pg.evaluate(id=>$(id).click(),id); await pg.waitForFunction(()=>window.__lastExport,null,{timeout:120000});
   const bytes=await pg.evaluate(async()=>Array.from(new Uint8Array(await window.__lastExport.data.arrayBuffer()))); fs.writeFileSync(out,Buffer.from(bytes)); console.log(out.split('/').pop(),bytes.length,'bytes');};
 const t0=Date.now(); await grab('fGif',process.argv[2]+'/fox_tracked.gif'); console.log('gif secs',(Date.now()-t0)/1000);
 await grab('fSheet',process.argv[2]+'/fox_sheet.png'); await pg.evaluate(()=>{$('gxW').value='360';}); await grab('fZip',process.argv[2]+'/fox_frames.zip');
 console.log('errors',errs.length?errs:'none'); await b.close();})();
