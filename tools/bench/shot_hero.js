// Hero review shots (GrumpyDingo's method): render hero2 BIG as vectors (no pixel zoom) on three flat backgrounds,
// dev pink, black and bluescreen blue, plus one game-size shot, so edges, pale cut-outs and joints can be checked against the dog skill.
// usage: node shot_hero.js [outdir] [rigId] [state,state...] [walk]
const { chromium } = require('playwright');
const path = require('path');
const outdir = process.argv[2] || '/tmp/hero_shots', rigId = process.argv[3] || 'hero2';
const states = (process.argv[4] || '').split(',').filter(Boolean), walk = process.argv.includes('walk');
const BG = {pink:0xff00ff, black:0x000000, blue:0x0000ff};
(async () => {
  require('fs').mkdirSync(outdir, {recursive:true});
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
  const p = await b.newPage({viewport:{width:1400, height:900}});
  await p.goto('file://' + path.resolve(__dirname, 'collar.html')); await p.waitForTimeout(2500);
  for (const [name, color] of Object.entries(BG)){
    const dataUrl = await p.evaluate(async ({color, rigId, states, walk, scale}) => {
      const app = new PIXI.Application(); await app.init({background:color, width:62 * scale + 80, height:38 * scale + 80, antialias:true, resolution:1, preference:'webgl'});
      const r = RIG.build(PIXI, rigId); r.scale.set(scale); r.position.set(40 + 31 * scale, 40 + 19 * scale); app.stage.addChild(r);
      states.forEach(s => r.rig.set(s, true)); r.rig.walk(walk); r.rig.seed(.3); r.rig.tick(0); app.render();
      const url = app.canvas.toDataURL('image/png'); app.destroy(true); return url;
    }, {color, rigId, states, walk, scale: name === 'game' ? 1.6 : 14});
    require('fs').writeFileSync(path.join(outdir, `hero_${name}.png`), Buffer.from(dataUrl.split(',')[1], 'base64'));
  }
  /* game size: the hero at 62×38 drawn at the game's usual ~1.6× on the meadow sand */
  const small = await p.evaluate(async ({rigId, states, walk}) => {
    const app = new PIXI.Application(); await app.init({background:0xd9c493, width:62 * 4, height:38 * 4, antialias:true, resolution:1, preference:'webgl'});
    const r = RIG.build(PIXI, rigId); r.scale.set(1.6); r.position.set(31 * 4, 19 * 4); app.stage.addChild(r);
    states.forEach(s => r.rig.set(s, true)); r.rig.walk(walk); r.rig.seed(.3); r.rig.tick(0); app.render();
    const url = app.canvas.toDataURL('image/png'); app.destroy(true); return url;
  }, {rigId, states, walk});
  require('fs').writeFileSync(path.join(outdir, 'hero_game.png'), Buffer.from(small.split(',')[1], 'base64'));
  await b.close(); console.log('wrote', outdir);
})();
