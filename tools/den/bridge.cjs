#!/usr/bin/env node
/* Den kit V2, browser side. `den` (tools/den/den.py) calls this; V1 (tools/lens/lens.cjs) is untouched and still does shot / probe / piece / export.
   node tools/den/bridge.cjs idframes --rig hero,hero2 --gear <codes> --phases standing,0,.0625,... --scale 14 --out <dir>
        ID pass: every part (the dog's own and every gear part) drawn in its own flat colour, no anti-aliasing. Colour = part id (r<<16|g<<8|b), black = empty.
        Writes <dir>/<rig>_<phase>.png and <dir>/legend_<rig>.json (id -> what it is, in RENDER ORDER, so draw order is data).
   node tools/den/bridge.cjs hashes --rig hero,hero2 --gear <codes> --phases standing,.3 --scale 10
        Builds each (rig, code, phase) frame TWICE from scratch and prints a hash of each, for the determinism test.
   node tools/den/bridge.cjs anim --rig hero,hero2 --gear <codes> --frames 24 --scale 8 [--box x,y,w,h] [--bg 0xd9c493] [--state ears-back] [--gait walk|stand] --out <dir>
        Colour frames over one gait cycle (phase i/frames), every rig side by side in one image, built once and re-posed per frame. For den gif.
   node tools/den/bridge.cjs joints --rig hero,hero2 --phases 0,.0625,... [--walk]
        Every joint's position in drawing units at each phase (the chain multiplied by hand, the root's own scale left out), as JSON, for the gait checks.
   node tools/den/bridge.cjs pixelmatch a.png b.png [--threshold .1] [--out diff.png]
        Anti-aliasing-aware pixel diff (pixelmatch); prints the number of differing pixels.
   Needs playwright (npm install). Builds a throwaway page from engine/ each run, like V1. */
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), cp = require('child_process'), crypto = require('crypto');
const root = path.resolve(__dirname, '../..'), cache = path.join(__dirname, '.cache'); fs.mkdirSync(cache, {recursive:true});
const argv = process.argv.slice(2), cmd = argv[0], opt = {_:[]};
for (let i = 1; i < argv.length; i++){ if (argv[i].startsWith('--')){ const k = argv[i].slice(2), nx = argv[i + 1]; if (nx === undefined || nx.startsWith('--')) opt[k] = true; else { opt[k] = nx; i++; } } else opt._.push(argv[i]); }
const list = v => v === undefined || v === true ? [] : String(v).split(',').filter(Boolean);

if (cmd === 'pixelmatch'){
  const { PNG } = require('pngjs'), pixelmatch = require('pixelmatch');
  const [a, b] = opt._.map(f => PNG.sync.read(fs.readFileSync(f))); const d = new PNG({width:a.width, height:a.height});
  const n = pixelmatch(a.data, b.data, d.data, a.width, a.height, {threshold:+(opt.threshold || .1)});
  if (opt.out) fs.writeFileSync(opt.out, PNG.sync.write(d)); console.log(JSON.stringify({different:n, total:a.width * a.height, share:n / (a.width * a.height)})); process.exit(0);
}

(async () => {
  const pagePath = path.join(cache, 'bench.html');
  cp.execFileSync('node', [path.join(root, 'tools/bench/rebuild-gear-bench.mjs'), pagePath], {stdio:'ignore'});
  const b = await chromium.launch({args:['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']});
  const p = await b.newPage({viewport:{width:1400, height:900}}); p.on('pageerror', e => console.error('PAGEERROR', e.message));
  await p.goto('file://' + pagePath); await p.waitForFunction(() => typeof RIG !== 'undefined' && typeof GEAR !== 'undefined' && typeof PIXI !== 'undefined' && RIG.DEFS && RIG.DEFS.hero2, null, {timeout:20000}); /* the engines are top-level consts, so they are globals but not window properties */
  const KIND_ORDER = 'pchbtrk'; /* the bench's layer order (the registry): paw covers, armor, helmet, bracelets, guard, rings, collar. Attach order decides what is on top, so frames are built in this order whatever order the codes come in */
  const rigs = list(opt.rig || 'hero,hero2'), codes = list(opt.gear).map((c, i) => [c, i]).sort((a, b) => (KIND_ORDER.indexOf(a[0][0]) - KIND_ORDER.indexOf(b[0][0])) || a[1] - b[1]).map(x => x[0]), scale = +(opt.scale || 14), phases = list(opt.phases || 'standing').map(s => s === 'standing' ? null : +s);
  /* one frame, built from scratch. mode 'id': flat unique colours; mode 'color': as drawn. Returns the PNG and the legend. */
  const frame = (args) => p.evaluate(async ({rig, codes, phase, scale, mode}) => {
    const W = Math.round(62 * scale), H = Math.round(38 * scale), app = new PIXI.Application();
    await app.init({background:0x000000, width:W, height:H, antialias:mode === 'color', resolution:1, preference:'webgl'});
    const r = RIG.build(PIXI, rig); r.scale.set(scale); r.position.set(31 * scale - 31, 19 * scale - 19); app.stage.addChild(r);
    r.rig.walk(phase != null); if (phase != null) r.rig.seed(phase); r.rig.tick(0);
    const gfx = n => { const out = []; (function w(x){ if (x instanceof PIXI.Graphics) out.push(x); (x.children || []).forEach(w); })(n); return out; };
    const D = RIG.DEFS[rig], dog = new Map(); gfx(r).forEach(g => { const host = g.parent.label || 'root', mine = D.parts.filter(q => (q.in || 'root') === host), k = g.parent.children.filter(c => c instanceof PIXI.Graphics).indexOf(g); dog.set(g, {kind:'dog', joint:host, paint:mine[k] ? mine[k].paint : null, part:mine[k] ? mine[k].id || null : null}); });
    const meta = new Map(dog);
    codes.forEach(code => { const pc = GEAR.decode(code, rig); if (!pc) return;
      const layers = pc.layersFor ? pc.layersFor(rig) : [{joint:pc.joint, parts:pc.partsFor ? pc.partsFor(rig) : pc.parts}];
      layers.forEach((l, li) => { if (!l.parts || !r.rig.joints[l.joint]) return; const before = new Set(gfx(r)); RIG.attach(PIXI, r, l.joint, l.parts, pc.palette);
        gfx(r).filter(g => !before.has(g)).forEach((g, i) => meta.set(g, {kind:'gear', piece:code, pkind:pc.kind, layer:li, joint:l.joint, follow:l.parts.follow || null, part:i, paint:l.parts[i] ? l.parts[i].paint || null : null, stroke:!!(l.parts[i] && l.parts[i].stroke)})); }); });
    app.render(); /* lay the scene out once before reading its order */
    /* each Graphics' transform in DRAWING units (every joint and follower above it, the root's own scale and position left out), so the analytic checks can place a part exactly where this pose put it. Pixi does not refresh world transforms off-screen, so the chain is multiplied here. */
    const xf = new Map(); (function walk(n, M){ n.updateLocalTransform(); const Wm = n === r ? new PIXI.Matrix() : M.clone().append(n.localTransform); if (n instanceof PIXI.Graphics) xf.set(n, [Wm.a, Wm.b, Wm.c, Wm.d, Wm.tx, Wm.ty]); (n.children || []).forEach(c => walk(c, Wm)); })(r, new PIXI.Matrix());
    const order = gfx(r), legend = {}; order.forEach((g, i) => { legend[i + 1] = Object.assign({ord:i, m:xf.get(g)}, meta.get(g) || {kind:'?'}); });
    if (mode === 'id'){ (function flat(n){ n.alpha = 1; n.tint = 0xffffff; (n.children || []).forEach(flat); })(r);
      order.forEach((g, i) => { const id = i + 1; g.context.instructions.forEach(ins => { const s = ins.data && ins.data.style; if (s){ s.color = id; s.alpha = 1; s.texture = PIXI.Texture.WHITE; s.fill = undefined; } }); g.alpha = 1; if (g.context.onUpdate) g.context.onUpdate(); if (g.onViewUpdate) g.onViewUpdate(); }); }
    app.render(); const url = app.canvas.toDataURL('image/png'); app.canvas.remove(); return {url, legend, W, H};
  }, args);
  const png = u => Buffer.from(u.split(',')[1], 'base64');
  if (cmd === 'anim'){
    const out = opt.out || path.join(cache, 'anim'); fs.mkdirSync(out, {recursive:true}); for (const f of fs.readdirSync(out)) if (f.endsWith('.png')) fs.unlinkSync(path.join(out, f));
    const n = +(opt.frames || 24), box = (opt.box ? String(opt.box) : '0,-4,62,42').split(',').map(Number), bg = opt.bg ? parseInt(String(opt.bg).replace('#', '0x')) : 0xd9c493, states = list(opt.state), walking = (opt.gait || 'walk') !== 'stand';
    const res = await p.evaluate(async ({rigs, codes, n, scale, box, bg, states, walking}) => {
      const [x0, y0, w, h] = box, W = Math.round(w * scale), H = Math.round(h * scale), app = new PIXI.Application();
      await app.init({background:bg, width:W * rigs.length, height:H, antialias:true, resolution:1, preference:'webgl', preserveDrawingBuffer:true});
      const dogs = rigs.map((id, i) => { const r = RIG.build(PIXI, id); r.scale.set(scale); r.position.set(i * W + (31 - x0) * scale - 31, (19 - y0) * scale - 19);
        const m = new PIXI.Graphics().rect(i * W, 0, W, H).fill(0xffffff); app.stage.addChild(m, r); r.mask = m; states.forEach(s => r.rig.set(s, true)); r.rig.walk(walking); r.rig.seed(0); r.rig.tick(0);
        codes.forEach(code => { const pc = GEAR.decode(code, id); if (pc) RIG.attachPiece(PIXI, r, pc, id); }); return r; });
      const urls = [];
      for (let k = 0; k < n; k++){ dogs.forEach(r => { r.rig.seed(k / n); r.rig.tick(0); }); app.render(); urls.push(app.canvas.toDataURL('image/png')); }
      app.canvas.remove(); return urls; }, {rigs, codes, n, scale, box, bg, states, walking});
    res.forEach((u, k) => fs.writeFileSync(path.join(out, `f${String(k).padStart(3, '0')}.png`), png(u))); console.log('wrote', out, res.length, 'frames');
  } else if (cmd === 'joints'){
    const walking = !opt.stand;
    const res = await p.evaluate(({rigs, phases, walking}) => rigs.map(id => { const r = RIG.build(PIXI, id), out = [];
      for (const ph of phases){ r.rig.walk(walking && ph != null); if (ph != null) r.rig.seed(ph); r.rig.tick(0); const J = {};
        (function walk(nd, M){ nd.updateLocalTransform(); const Wm = nd === r ? new PIXI.Matrix() : M.clone().append(nd.localTransform);
          if (nd.label && nd !== r && !(nd instanceof PIXI.Graphics) && r.rig.joints[nd.label] === nd){ const g = Wm.apply(nd.origin); J[nd.label] = [+g.x.toFixed(4), +g.y.toFixed(4)]; }
          (nd.children || []).forEach(c => walk(c, Wm)); })(r, new PIXI.Matrix());
        out.push({phase:ph, joints:J}); }
      return {rig:id, frames:out}; }), {rigs, phases, walking});
    console.log(JSON.stringify(res));
  } else if (cmd === 'idframes'){
    const out = opt.out || path.join(cache, 'ids'); fs.mkdirSync(out, {recursive:true});
    for (const rig of rigs){ let legend = null;
      for (const [pi, ph] of phases.entries()){ const f = await frame({rig, codes, phase:ph, scale, mode:'id'}); legend = legend || f.legend; fs.writeFileSync(path.join(out, `${rig}_${pi}.png`), png(f.url)); } /* files are numbered by position in --phases */
      fs.writeFileSync(path.join(out, `legend_${rig}.json`), JSON.stringify({scale, legend})); }
    console.log('wrote', out, rigs.length * phases.length, 'frames');
  } else if (cmd === 'hashes'){
    const res = [];
    for (const rig of rigs) for (const code of codes) for (const ph of phases){ const h = []; for (let k = 0; k < 2; k++){ const f = await frame({rig, codes:[code], phase:ph, scale, mode:'color'}); h.push(crypto.createHash('sha256').update(png(f.url)).digest('hex').slice(0, 16)); } res.push({rig, code, phase:ph == null ? 'standing' : ph, hashes:h, same:h[0] === h[1]}); }
    console.log(JSON.stringify(res));
  } else console.log('commands: idframes | hashes | pixelmatch (see the header of this file)');
  await b.close();
})();
