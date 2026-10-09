// node tools/bench/probe/sheet5.mjs out.png [frames] [bg] [paintJSON] : hero5 walk sheet (true vectors via SVG → PNG in Chromium), plus a standing frame
import fs from 'node:fs'; import { createRequire } from 'node:module'; import { D, pose, world, order, isFar } from './pose5.mjs';
const [out, n = 8, bg = '#1d2128', ov = '{}'] = process.argv.slice(2); const N = +n, OV = JSON.parse(ov), pal = { ...D.palette, ...OV };
const dim = (c, k) => '#' + [1, 3, 5].map(i => Math.round(parseInt(c.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('');
const frame = (t, walking) => { const M = pose(t, walking); let s = ''; for (const p of order()) { if (p.hidden) continue; const col = OV[p.id] || pal[p.paint || 'fur']; const c = isFar(p) ? dim(col, pal.far || .74) : col;
  s += `<polygon points="${world(p, M).map(q => q[0].toFixed(3) + ',' + q[1].toFixed(3)).join(' ')}" fill="${c}"/>`; } return `<svg viewBox="-1 2 61 36" width="100%"><rect x="-1" y="2" width="61" height="36" fill="${bg}"/><line x1="-1" x2="60" y1="35.55" y2="35.55" stroke="#d9c493" stroke-width=".12"/>${s}</svg>`; };
let cells = `<div><b>standing</b>${frame(0, false)}</div>`; for (let i = 0; i < N; i++) cells += `<div><b>${Math.round(i / N * 100)}%</b>${frame(i / N, true)}</div>`;
fs.writeFileSync('/tmp/claude-0/-home-user-Dog/3ff36a2a-418a-5e21-b2aa-c610e4c0c5f5/scratchpad/sheet5.html', `<body style="margin:0;background:#111;color:#ddd;font:14px sans-serif"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">${cells}</div>`);
const { chromium } = createRequire('/home/user/Dog/package.json')('playwright'); const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1500, height: 900 } });
await p.goto('file:///tmp/claude-0/-home-user-Dog/3ff36a2a-418a-5e21-b2aa-c610e4c0c5f5/scratchpad/sheet5.html'); await p.screenshot({ path: out, fullPage: true }); await br.close();
