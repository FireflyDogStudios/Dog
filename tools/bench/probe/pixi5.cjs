// node tools/bench/probe/pixi5.cjs out.png : hero5 drawn by the game's renderer (RIG.build with Pixi 8, WebGL via swiftshader) at four walk phases,
// at bench size and at game size (about 120 px tall); prints any page errors. Compare with tools/bench/probe/sheet5.mjs (true vectors).
const { chromium } = require('playwright'), fs = require('fs'), path = require('path'), os = require('os');
const R = path.resolve(__dirname, '../../..'), out = path.resolve(process.argv[2] || 'pixi5.png'), dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixi5-'));
const src = f => `<script src="file://${R}/${f}"></script>`;
fs.writeFileSync(path.join(dir, 'p.html'), `<html><body style="margin:0;background:#d9c493">${src('apps/den-ledger/public/pixi.min.js')}${['rig', 'rig_den', 'hero3', 'hero5'].map(f => src('engine/' + f + '.js')).join('')}
<script>(async()=>{registerDenRigs(RIG); registerHero3(RIG); registerHero5(RIG); const app=new PIXI.Application(); await app.init({width:1400,height:880,background:"#d9c493",antialias:true}); document.body.appendChild(app.canvas);
 [0,.25,.5,.75].forEach((ph,i)=>{ const r=RIG.build(PIXI,"hero5",{}); r.scale.set(8); r.x=330+(i%2)*660; r.y=190+Math.floor(i/2)*290; app.stage.addChild(r); r.rig.seed(ph); r.rig.tick(0); });
 [0,.25,.5,.75].forEach((ph,i)=>{ const r=RIG.build(PIXI,"hero5",{}); r.scale.set(120/36); r.x=140+i*300; r.y=770; app.stage.addChild(r); r.rig.seed(ph); r.rig.tick(0); });
 app.render(); window.done=true;})().catch(e=>{window.err=String(e);});</script></body></html>`);
(async () => { const b = await chromium.launch({ args: ['--allow-file-access-from-files', '--use-gl=swiftshader'] }); const pg = await b.newPage({ viewport: { width: 1400, height: 880 } }); const errs = [];
  pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto('file://' + dir + '/p.html'); await pg.waitForFunction(() => window.done || window.err, null, { timeout: 30000 }); console.log('err', await pg.evaluate(() => window.err || 'none'));
  await pg.waitForTimeout(300); await pg.screenshot({ path: out }); console.log('errors', errs.length ? errs : 'none', '→', out); await b.close(); })();
