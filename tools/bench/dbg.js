const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const p = await b.newPage({viewport:{width:1400,height:900}});
  await p.goto('file:///tmp/claude-0/-home-claude/a9103c21-f632-55a9-95a5-5d7a9adce206/scratchpad/pixi/bench/collar.html'); await p.waitForTimeout(2500);
  const url = await p.evaluate(async () => { const scale = 14; const app = new PIXI.Application(); await app.init({background:0x0000ff, width:62*scale+80, height:38*scale+80, antialias:true, resolution:1});
    RIG.define('hero2', Object.assign({}, RIG.DEFS.hero2, {palette:Object.assign({}, RIG.DEFS.hero2.palette, {pale2:'#ff0000', far:.5})})); const r = RIG.build(PIXI, 'hero2'); r.scale.set(scale); r.position.set(40+31*scale, 40+19*scale); app.stage.addChild(r); r.rig.walk(false); r.rig.tick(0); app.render(); return app.canvas.toDataURL(); });
  require('fs').writeFileSync('/tmp/dbg.png', Buffer.from(url.split(',')[1], 'base64')); await b.close(); })();
