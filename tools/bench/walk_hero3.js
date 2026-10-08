const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
  const p = await b.newPage({viewport:{width:1400, height:900}});
  await p.goto('file://' + path.resolve(__dirname, process.env.BENCH || 'collar.html')); await p.waitForTimeout(2500);
  await p.addScriptTag({path:path.resolve(__dirname, '../../engine/hero3.js')}); await p.evaluate(() => registerHero3(RIG));
  const url = await p.evaluate(async () => {
    const sc = 6, n = 6, W = 62 * sc, Hh = 38 * sc;
    const app = new PIXI.Application(); await app.init({background:0x1d2128, width:W * 3, height:Hh * 2 + 20, antialias:true, resolution:1, preference:'webgl'});
    for (let i = 0; i < n; i++){ const r = RIG.build(PIXI, 'hero3'); r.scale.set(sc); r.position.set((i % 3) * W + 31 * sc, Math.floor(i / 3) * Hh + 16 * sc);
      app.stage.addChild(r); r.rig.walk(true); r.rig.seed(.3); r.rig.tick(0); for (let k = 0; k < i * 10; k++) r.rig.tick(1 / 60); }
    app.render(); return app.canvas.toDataURL('image/png'); });
  fs.writeFileSync(process.argv[2] || 'walk.png', Buffer.from(url.split(',')[1], 'base64')); await b.close();
})();
