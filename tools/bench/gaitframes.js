const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const p = await b.newPage({viewport:{width:1400,height:900}});
  await p.goto('file:///tmp/claude-0/-home-claude/a9103c21-f632-55a9-95a5-5d7a9adce206/scratchpad/pixi/bench/collar.html'); await p.waitForTimeout(2500);
  const urls = await p.evaluate(async () => { const scale = 8, out = []; const app = new PIXI.Application(); await app.init({background:0x000000, width:62*scale+40, height:38*scale+40, antialias:true, resolution:1});
    const r = RIG.build(PIXI, 'hero2'); r.scale.set(scale); r.position.set(20+31*scale, 20+19*scale); app.stage.addChild(r); r.rig.walk(true);
    for (let i = 0; i < 24; i++){ r.rig.seed(i / 24); r.rig.tick(0); app.render(); out.push(app.canvas.toDataURL()); } return out; });
  urls.forEach((u, i) => require('fs').writeFileSync(`/tmp/gait_${i}.png`, Buffer.from(u.split(',')[1], 'base64'))); await b.close(); })();
