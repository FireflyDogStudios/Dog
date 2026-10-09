// Gear review shots: every dog wearing the same piece, big vectors on dev pink / black / bluescreen blue, plus a neck close-up.
// usage: node shot_gear.js <bench.html> <outdir> [kind=collar] [code ...]   (codes decode against each dog; none = the four plain styles)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const [page_, outdir, kind = 'collar', ...codes] = process.argv.slice(2);
const BG = {pink:0xff00ff, black:0x000000, blue:0x0000ff};
(async () => {
  fs.mkdirSync(outdir, {recursive:true});
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
  const p = await b.newPage({viewport:{width:1400, height:900}});
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.goto('file://' + path.resolve(page_)); await p.waitForTimeout(2500);
  for (const [bg, color] of Object.entries(BG)){
    for (const [mode, scale, crop] of [['full', 9, null], ['neck', 34, [36, 3, 14, 15]]]){
      if (mode === 'neck' && bg !== 'pink') continue;
      const url = await p.evaluate(async ({color, scale, crop, kind, codes}) => {
        const rigs = ['hero', 'hero2'], list = codes.length ? codes : [0, 1, 2, 3];
        const W = crop ? crop[2] * scale * rigs.length : 62 * scale * rigs.length, H = crop ? crop[3] * scale * list.length : 38 * scale * list.length;
        const app = new PIXI.Application(); await app.init({background:color, width:W, height:H, antialias:true, resolution:1, preference:'webgl'});
        list.forEach((it, row) => rigs.forEach((rid, col) => {
          const r = RIG.build(PIXI, rid); r.scale.set(scale);
          const ox = (31 - (crop ? crop[0] : 0)) * scale, oy = (19 - (crop ? crop[1] : 0)) * scale, cw = crop ? crop[2] * scale : 62 * scale, ch = crop ? crop[3] * scale : 38 * scale;
          r.position.set(col * cw + ox, row * ch + oy); const m = new PIXI.Graphics().rect(col * cw, row * ch, cw, ch).fill(0xffffff); app.stage.addChild(m); r.mask = m; app.stage.addChild(r);
          const piece = typeof it === 'string' ? GEAR.decode(it, rid) : GEAR.KINDS[kind].make('shot', {style:it, band:P0(it), fit:3, gem:0, rar:0, inf:0}, rid);
          RIG.attach(PIXI, r, piece.joint, piece.parts, piece.palette); r.rig.walk(false); r.rig.tick(0);
        }));
        function P0(i){ return [2, 5, 9, 1][i] % GEAR.PAL.WRAP.length; }
        app.render(); const u = app.canvas.toDataURL('image/png'); app.destroy(true); return u;
      }, {color, scale, crop, kind, codes});
      fs.writeFileSync(path.join(outdir, `${kind}_${mode}_${bg}.png`), Buffer.from(url.split(',')[1], 'base64'));
    }
  }
  await b.close(); console.log('done');
})();
