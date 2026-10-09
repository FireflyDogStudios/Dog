// node tools/bench/probe/joints5.mjs out.png [bg] [contrast=1] : hero5 joint audit. One row per joint (near and far legs, where the legs meet
// the body), one column per walk frame (standing + 8), each cell a true-vector zoom (radius 3 units) round the joint. With contrast=1 every
// piece gets its own loud colour (where pieces meet and which is on top); with 0 the real coat (what a player sees, enlarged).
import fs from 'node:fs'; import { createRequire } from 'node:module'; import { D, pose, world, order, isFar, ap } from './pose5.mjs';
const [out, bg = '#2040ff', con = '1'] = process.argv.slice(2), pal = D.palette;
const C = ['#e6194b','#3cb44b','#ffe119','#f58231','#911eb4','#46f0f0','#f032e6','#bcf60c','#fabebe','#008080','#e6beff','#9a6324','#fffac8','#800000','#aaffc3','#808000','#ffd8b1','#000075'];
const dim = (c, k) => '#' + [1, 3, 5].map(i => Math.round(parseInt(c.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('');
const JOINTS = [['scap', 'elbow (shoulder → forearm)', 'foreN'], ['fore', 'carpus', 'pastN'], ['past', 'front paw', 'ftoeN'], ['hip', 'knee', 'shankN'], ['shank', 'hock', 'metaN'], ['meta', 'hind paw', 'htoeN'],
  ['', 'far carpus', 'pastF'], ['', 'far front paw', 'ftoeF'], ['', 'far hock', 'metaF'], ['', 'far hind paw', 'htoeF']];
const frames = [[0, false, 'standing'], ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => [i / 8, true, Math.round(i / 8 * 100) + '%'])], R = 3;
const ord = order().filter(p => !p.hidden);
const cell = (jid, t, w) => { const M = pose(t, w), j = D.joints.find(x => x.id === jid), c = ap(M[jid], j.at); let s = '';
  ord.forEach((p, i) => { const col = con === '1' ? C[i % C.length] : (isFar(p) ? dim(pal[p.paint || 'fur'], pal.far || .74) : pal[p.paint || 'fur']);
    s += `<polygon points="${world(p, M).map(q => q[0].toFixed(3) + ',' + q[1].toFixed(3)).join(' ')}" fill="${col}"/>`; });
  return `<svg viewBox="${c[0] - R} ${c[1] - R} ${2 * R} ${2 * R}" width="150" height="150"><rect x="${c[0] - R}" y="${c[1] - R}" width="${2 * R}" height="${2 * R}" fill="${bg}"/>${s}<line x1="${c[0] - R}" x2="${c[0] + R}" y1="35.55" y2="35.55" stroke="#fff" stroke-width=".03"/></svg>`; };
let h = '<table style="border-collapse:collapse"><tr><td></td>' + frames.map(f => `<td>${f[2]}</td>`).join('') + '</tr>';
for (const [, name, jid] of JOINTS) h += `<tr><td style="width:110px">${name}</td>` + frames.map(([t, w]) => `<td style="padding:1px">${cell(jid, t, w)}</td>`).join('') + '</tr>';
fs.writeFileSync('/tmp/joints5.html', `<body style="margin:4px;background:#111;color:#ddd;font:12px sans-serif">${h}</table>`);
const { chromium } = createRequire(import.meta.url)('playwright'); const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1520, height: 900 } });
await p.goto('file:///tmp/joints5.html'); await p.screenshot({ path: out, fullPage: true }); await b.close();
