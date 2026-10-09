// node tools/qa/edges.mjs <rig> <outDir> [px=40] [--phases=.442,.835] : renders the rig standing and at 8 walk phases, true vectors at px per unit, each on magenta and
// on green (a pixel inside the body that differs between the two is background showing through a seam: a hairline), then runs edges.py on them:
// background bleed (hairlines), colour bands thinner than 0.12 units, and sharp corners on every colour region (spikes, steps, squares).
import fs from 'node:fs'; import path from 'node:path'; import { spawnSync } from 'node:child_process'; import { createRequire } from 'node:module'; import { load } from './rigpose.mjs';
const ARG = process.argv.slice(2).filter(a => !a.startsWith('--')), OPT = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
const [id = 'hero5', out = `art/${id}/qa/edges`, px = '40'] = ARG, PX = +px; fs.mkdirSync(out, { recursive: true });
const R = load(id), b = R.bounds(), view = [Math.floor(b[0] - 1.5), Math.floor(b[1] - 1.5), Math.ceil(b[2] - b[0] + 3), Math.ceil(b[3] - b[1] + 3)];  /* 1.5 units clear all round (the paws stood on the bottom edge) */
const frames = [['stand', 0, false], ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => [`walk${String(i * 125).padStart(3, '0')}`, i / 8, true]),
  ...(OPT.phases ? OPT.phases.split(',').map(v => [`ph${String(Math.round(+v * 1000)).padStart(4, '0')}`, +v, true]) : [])];  /* --phases=.442,.835: extra walk phases (the frames of GrumpyDingo's notes) */
const ORD = R.order().filter(p => !p.hidden), idHex = p => '#' + (ORD.indexOf(p) + 1).toString(16).padStart(6, '0');
const { chromium } = createRequire(import.meta.url)('playwright'); const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 400, height: 300 } });
for (const [name, t, w] of frames) { const M = R.pose(t, w);
  for (const [tag, bg] of [['mag', '#ff00ff'], ['grn', '#00ff00']]) { await pg.setContent(`<body style="margin:0">${R.svg(M, view, { bg, px: PX })}</body>`); await pg.locator('svg').screenshot({ path: path.join(out, `${name}_${tag}.png`) }); }
  /* the id buffer: each piece in its own flat colour, no anti-aliasing (which piece every pixel belongs to: for the seam test) */
  await pg.setContent(`<body style="margin:0">${R.svg(M, view, { bg: '#000000', px: PX, fill: p => idHex(p) }).replace('<svg ', '<svg shape-rendering="crispEdges" ')}</body>`); await pg.locator('svg').screenshot({ path: path.join(out, `${name}_id.png`) }); }
await br.close();
const pal = {}; for (const p of R.D.parts) if (!p.hidden) pal[(R.isFar(p) ? 'far ' : '') + (p.paint || 'fur')] = R.colour(p);
fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify({ rig: id, view, px: PX, frames: frames.map(f => f[0]), palette: pal, parts: ORD.map(p => ({ id: p.id || '', in: p.in || 'root', paint: p.paint || 'fur' })) }));
const r = spawnSync('python3', [new URL('./edges.py', import.meta.url).pathname, out], { stdio: 'inherit' }); process.exit(r.status);
