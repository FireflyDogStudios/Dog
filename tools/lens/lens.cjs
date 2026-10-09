#!/usr/bin/env node
/* Den Lens: Firefly's eyes and rulers for the 2D art. Everything is in the rigs' drawing units (62×38, dog faces right), never screen pixels.
   node tools/lens/lens.cjs export <out.json>                     the rigs' raw data (parts, joints, palettes, gear mounts) for the Python side
   node tools/lens/lens.cjs shot  --rig hero,hero2 --box 36,3,14,15 --scale 30 [--grid] [--joints] [--gear <code>] [--bg pink|black|blue|#hex]
                                  [--walk --phase .3] [--state ears-back] [--lines 40,8,47,15] [--out shot.png]
                                  one cell per rig, same view box in every cell; --grid draws a labelled ruler in drawing units; --lines x1,y1,x2,y2[,...] draws measuring lines
   node tools/lens/lens.cjs probe --rig hero2 --at 44,10 [--gear <code>]   which parts cover that point, in draw order (top last)
   node tools/lens/lens.cjs piece --rig hero,hero2 --gear <code>[,<code>...] --out pieces.json     worn pieces' parts as data (one per dog × code), for lint.py
   --ref <git ref>   build from that commit's engine files (before/after: render once with --ref HEAD, change things, render again)
   --hide collar,tag  hide the parts painted with those names (or with those ids); `--hide collar,tag,tag2` gives the bare dog without its own collar
   Needs playwright (npm install). It rebuilds a throwaway page from engine/ each run, so it always sees the current engine files. */
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), cp = require('child_process');
const root = path.resolve(__dirname, '../..'), cache = path.join(__dirname, '.cache'); fs.mkdirSync(cache, {recursive:true});
const argv = process.argv.slice(2), cmd = argv[0], opt = {};
for (let i = 1; i < argv.length; i++){ if (argv[i].startsWith('--')){ const k = argv[i].slice(2), nx = argv[i + 1]; if (nx === undefined || nx.startsWith('--')) opt[k] = true; else { (opt[k] = opt[k] === undefined ? nx : [].concat(opt[k], nx)); i++; } } else opt._ = (opt._ || []).concat(argv[i]); }
const list = v => v === undefined || v === true ? [] : [].concat(v).flatMap(s => String(s).split(',')), nums = v => list(v).map(Number);
const BG = {pink:0xff00ff, black:0x000000, blue:0x0000ff, sand:0xd9c493, white:0xffffff};
(async () => {
  const pagePath = path.join(cache, 'bench.html');
  cp.execFileSync('node', [path.join(root, 'tools/bench/rebuild-gear-bench.mjs'), pagePath], {stdio:'ignore', env:Object.assign({}, process.env, opt.ref ? {ENGINE_REF:String(opt.ref)} : {})});
  const b = await chromium.launch({args:['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']});
  const p = await b.newPage({viewport:{width:1400, height:900}}); p.on('pageerror', e => console.error('PAGEERROR', e.message));
  await p.goto('file://' + pagePath); await p.waitForFunction(() => window.RIG && window.GEAR && window.PIXI && RIG.DEFS && RIG.DEFS.hero2, null, {timeout:15000}).catch(() => {}); await p.waitForTimeout(1500);
  if (cmd === 'export'){
    const out = opt._ && opt._[0] || path.join(cache, 'rigs.json');
    const data = await p.evaluate(() => JSON.parse(JSON.stringify({rigs:RIG.DEFS, mounts:GEAR.MOUNTS})));
    fs.writeFileSync(out, JSON.stringify(data, null, 1)); console.log('wrote', out, Object.keys(data.rigs).join(','));
  } else if (cmd === 'shot'){
    const rigs = list(opt.rig || 'hero2'), box = nums(opt.box || '0,0,62,38'), scale = +(opt.scale || 12), bg = opt.bg && !BG[opt.bg] ? parseInt(String(opt.bg).replace('#', ''), 16) : BG[opt.bg || 'blue'];
    const url = await p.evaluate(async ({rigs, box, scale, bg, o}) => {
      const [x0, y0, w, h] = box, W = w * scale, H = h * scale, app = new PIXI.Application(); await app.init({background:bg, width:W * rigs.length, height:H, antialias:true, resolution:1, preference:'webgl'});
      const lines = o.lines.length ? o.lines : [];
      /* hide parts by paint name or id: the k-th Graphics in a joint is the k-th part of that joint in the rig's data */
      function hide(r, id, names){ if (!names.length) return; const D = RIG.DEFS[id]; (function walk(n){ if (n instanceof PIXI.Graphics){ const host = n.parent.label || 'root', part = D.parts.filter(q => (q.in || 'root') === host)[n.parent.children.filter(c => c instanceof PIXI.Graphics).indexOf(n)]; if (part && (names.includes(part.paint) || names.includes(part.id))) n.visible = false; } (n.children || []).forEach(walk); })(r); }
      rigs.forEach((id, i) => {
        const ox = i * W, r = RIG.build(PIXI, id); r.scale.set(scale); r.position.set(ox + (31 - x0) * scale - 31, (19 - y0) * scale - 19); /* the root scales about its origin (31,19) without shifting, so this puts drawing point (x0,y0) exactly at the cell's corner */
        const m = new PIXI.Graphics().rect(ox, 0, W, H).fill(0xffffff); app.stage.addChild(m); app.stage.addChild(r); r.mask = m;
        o.state.forEach(s => r.rig.set(s, true)); r.rig.walk(!!o.walk); if (o.phase != null) r.rig.seed(o.phase); r.rig.tick(0); hide(r, id, o.hide); /* after tick: it resets named parts' visibility */
        o.gear.forEach(code => { const pc = GEAR.decode(code.split(':').pop(), id); if (pc) RIG.attachPiece(PIXI, r, pc, id); });
        const ov = new PIXI.Graphics(), X = x => ox + (x - x0) * scale, Y = y => (y - y0) * scale;
        if (o.grid){ for (let x = Math.ceil(x0); x <= x0 + w; x++){ ov.moveTo(X(x), 0).lineTo(X(x), H).stroke({width:x % 5 ? 1 : 1.6, color:0xffffff, alpha:x % 5 ? .18 : .5}); }
          for (let y = Math.ceil(y0); y <= y0 + h; y++){ ov.moveTo(ox, Y(y)).lineTo(ox + W, Y(y)).stroke({width:y % 5 ? 1 : 1.6, color:0xffffff, alpha:y % 5 ? .18 : .5}); }
          const lab = (t, x, y) => { const T = new PIXI.Text({text:String(t), style:{fontSize:12, fill:0xffffff, stroke:{color:0x000000, width:3}}}); T.position.set(x, y); app.stage.addChild(T); };
          for (let x = Math.ceil(x0); x <= x0 + w; x++) if (x % (scale >= 20 ? 1 : 5) === 0) lab(x, X(x) + 2, 1); for (let y = Math.ceil(y0); y <= y0 + h; y++) if (y % (scale >= 20 ? 1 : 5) === 0) lab(y, ox + 2, Y(y) + 1); }
        if (o.joints){ const mark = (node, M) => { node.updateLocalTransform(); const Wm = M.clone().append(node.localTransform); const jid = node.label;
            if (jid && node !== r && !(node instanceof PIXI.Graphics)){ const g = Wm.apply(node.origin); ov.circle(g.x, g.y, 3).fill({color:0xffff00}).stroke({width:1, color:0x000000});
              const T = new PIXI.Text({text:jid, style:{fontSize:10, fill:0xffff00, stroke:{color:0x000000, width:3}}}); T.position.set(g.x + 4, g.y - 5); app.stage.addChild(T); }
            (node.children || []).forEach(c => mark(c, Wm)); }; mark(r, new PIXI.Matrix()); }
        for (let k = 0; k + 3 < lines.length; k += 4){ ov.moveTo(X(lines[k]), Y(lines[k + 1])).lineTo(X(lines[k + 2]), Y(lines[k + 3])).stroke({width:2, color:0xff2020}); ov.circle(X(lines[k]), Y(lines[k + 1]), 3).fill(0xff2020); ov.circle(X(lines[k + 2]), Y(lines[k + 3]), 3).fill(0xff2020); }
        app.stage.addChild(ov); ov.mask = m;
      });
      app.render(); const u = app.canvas.toDataURL('image/png'); app.destroy(true); return u;
    }, {rigs, box, scale, bg, o:{grid:!!opt.grid, joints:!!opt.joints, walk:!!opt.walk, phase:opt.phase == null ? null : +opt.phase, state:list(opt.state), gear:list(opt.gear), lines:nums(opt.lines), hide:list(opt.hide)}});
    const out = opt.out || path.join(cache, 'shot.png'); fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); console.log('wrote', out);
  } else if (cmd === 'probe'){
    const id = list(opt.rig || 'hero2')[0], at = nums(opt.at);
    const res = await p.evaluate(async ({id, at, gear, state}) => {
      const app = new PIXI.Application(); await app.init({width:64, height:40, preference:'webgl'}); const r = RIG.build(PIXI, id); r.position.set(0, 0); app.stage.addChild(r); state.forEach(s => r.rig.set(s, true)); r.rig.walk(false); r.rig.tick(0);
      gear.forEach(code => { const pc = GEAR.decode(code.split(':').pop(), id); if (pc) RIG.attachPiece(PIXI, r, pc, id); });
      app.render(); const D = RIG.DEFS[id], gp = new PIXI.Point(at[0], at[1]), out = [];
      /* Pixi does not refresh world transforms off-screen, so the chain is multiplied here: world = parent × local, then the point is mapped back into each part's own space */
      const walk = (node, M) => { node.updateLocalTransform(); const W = M.clone().append(node.localTransform);
        if (node instanceof PIXI.Graphics){ const host = node.parent.label || 'root', mine = D.parts.filter(q => (q.in || 'root') === host), k = node.parent.children.filter(c => c instanceof PIXI.Graphics).indexOf(node), part = mine[k];
          const hit = node.visible && node.containsPoint(W.applyInverse(gp)); if (hit) out.push({joint:host, id:part ? part.id || null : 'GEAR', paint:part ? part.paint : '(gear)', shape:part ? (part.d ? part.d.slice(0, 48) : JSON.stringify(part.circle || part.ellipse || part.poly || part.line || '').slice(0, 48)) : ''}); }
        (node.children || []).forEach(c => walk(c, W)); };
      walk(r, new PIXI.Matrix()); app.destroy(true); return out; }, {id, at, gear:list(opt.gear), state:list(opt.state)});
    console.log(`parts covering ${at} on ${id}, bottom → top:`); res.forEach((q, i) => console.log(`${i + 1}. [${q.joint}] ${q.id || '(unnamed)'} paint=${q.paint}  ${q.shape}`)); if (!res.length) console.log('(nothing)');
  } else if (cmd === 'piece'){
    const ids = list(opt.rig || 'hero2'), codes = list(opt.gear).map(c => c.split(':').pop());
    const data = await p.evaluate(({ids, codes}) => ids.flatMap(id => codes.map(code => { const pc = GEAR.decode(code, id); const layers = pc.layersFor ? pc.layersFor(id) : [{joint:pc.joint, parts:pc.partsFor ? pc.partsFor(id) : pc.parts}]; return JSON.parse(JSON.stringify({kind:pc.kind, rig:id, code, name:pc.name, palette:pc.palette, joint:pc.joint, parts:pc.parts, layers:layers.map(L => ({joint:L.joint, parts:L.parts}))})); })), {ids, codes});
    const out = opt.out || path.join(cache, 'piece.json'); fs.writeFileSync(out, JSON.stringify(data)); console.log('wrote', out, data.length, 'pieces');
  } else console.log('commands: export | shot | probe | piece (see the header of this file)');
  await b.close();
})();
