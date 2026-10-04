const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const p = await b.newPage({viewport:{width:1400,height:900}});
  await p.goto('file:///tmp/claude-0/-home-claude/a9103c21-f632-55a9-95a5-5d7a9adce206/scratchpad/pixi/bench/collar.html'); await p.waitForTimeout(2500);
  const urls = await p.evaluate(async () => { const scale = 14; const D = RIG.DEFS.hero2;
    const col = {hipN:"dbgA", shankN:"dbgB", metaN:"dbgC", htoeN:"dbgD"};
    const parts = D.parts.map(pt => { const c = col[pt.in]; if (!c) return pt; const q = Object.assign({}, pt); if (pt.paint === "pale2" && pt.in === "metaN") q.paint = "dbgE"; else if (pt.paint === "pale2") q.paint = "dbgD"; else q.paint = c; return q; });
    RIG.define("hero2dbg", Object.assign({}, D, {parts, palette:Object.assign({}, D.palette, {dbgA:"#ff3030", dbgB:"#30c0ff", dbgC:"#30ff60", dbgD:"#ffe030", dbgE:"#ff30e0"})}));
    const app = new PIXI.Application(); await app.init({background:0x000000, width:62*scale+80, height:38*scale+80, antialias:true, resolution:1});
    const r = RIG.build(PIXI, "hero2dbg"); r.scale.set(scale); r.position.set(40+31*scale, 40+19*scale); app.stage.addChild(r);
    const out = []; r.rig.walk(false); r.rig.tick(0); app.render(); out.push(app.canvas.toDataURL());
    r.rig.walk(true); for (const ph of [.0, .62, .7, .78, .86, .94]){ r.rig.seed(ph + .5); r.rig.tick(0); app.render(); out.push(app.canvas.toDataURL()); } /* near hind leg phase = seed - .5 */
    return out; });
  urls.forEach((u, i) => require('fs').writeFileSync(`/tmp/legdbg_${i}.png`, Buffer.from(u.split(',')[1], 'base64'))); await b.close(); })();
