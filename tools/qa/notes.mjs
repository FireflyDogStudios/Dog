// node tools/qa/notes.mjs <rig> <notesDir> <edgesDir> <out.png> : replays GrumpyDingo's Wolf Bench notes (the JSON files ArtifactData saves) on the
// current build: for each note, where its arrow points (or its pin) at its own frame, and whether the edge detector found something there.
// Writes a contact sheet and prints caught / not caught. Run edges.mjs first with --phases set to the notes' phases.
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { load } from './rigpose.mjs';
const [id, nd, ed, out] = process.argv.slice(2), R = load(id);
const notes = fs.readdirSync(nd).filter(f => f.endsWith('.json')).map(f => ({ _id: f.slice(0, -5), ...JSON.parse(fs.readFileSync(path.join(nd, f), 'utf8')) })).filter(n => n.rig === id).sort((a, b) => a.created - b.created);
const F = JSON.parse(fs.readFileSync(path.join(ed, 'findings.json'), 'utf8')).findings.filter(f => !f.allowed), meta = JSON.parse(fs.readFileSync(path.join(ed, 'meta.json'), 'utf8'));
const frameOf = n => n.standing ? 'stand' : `ph${String(Math.round(n.phase * 1000)).padStart(4, '0')}`;
const rows = [];
for (const [k, n] of notes.entries()) { const M = R.pose(n.standing ? 0 : n.phase, !n.standing), J = M[n.joint || 'root'] || M.root;
  const tip = R.ap(J, n.type === 'arrow' ? [n.lx2, n.ly2] : [n.lx, n.ly]), tail = n.type === 'arrow' ? R.ap(J, [n.lx, n.ly]) : null, fr = frameOf(n);
  const near = F.filter(f => f.frame === fr && Math.hypot(f.at[0] - tip[0], f.at[1] - tip[1]) < 1.2).sort((a, b) => Math.hypot(a.at[0] - tip[0], a.at[1] - tip[1]) - Math.hypot(b.at[0] - tip[0], b.at[1] - tip[1]));
  rows.push({ k: k + 1, n, tip, tail, fr, near }); console.log(`${String(k + 1).padStart(2)}  ${near.length ? 'flagged' : 'clear  '}  ${n.text}  @ (${tip[0].toFixed(1)}, ${tip[1].toFixed(1)}) ${fr}${near.length ? '  → ' + near[0].kind + ': ' + near[0].what : ''}`); }
const V = meta.view, PX = meta.px, cell = r => { const src = path.join(ed, `${r.fr}_mag.png`); if (!fs.existsSync(src)) return `<div class=c><b>${r.k}</b> no frame ${r.fr}</div>`;
  const s = 3, x0 = (r.tip[0] - s - V[0]) * PX, y0 = (r.tip[1] - s - V[1]) * PX, z = 240 / (2 * s * PX);
  return `<div class=c><b>${r.k}. ${r.near.length ? 'flagged' : 'clear'}</b> ${r.n.text}<div class=v><img src="file://${path.resolve(src)}" style="transform:translate(${-x0 * z}px,${-y0 * z}px) scale(${z});transform-origin:0 0"><i style="left:${120 - 9}px;top:${120 - 9}px"></i>${r.near.map(f => `<u style="left:${120 + (f.at[0] - r.tip[0]) * PX * z - 6}px;top:${120 + (f.at[1] - r.tip[1]) * PX * z - 6}px"></u>`).join('')}</div></div>`; };
fs.writeFileSync('/tmp/notes_sheet.html', `<style>body{margin:6px;background:#111;color:#ddd;font:12px sans-serif;display:flex;flex-wrap:wrap;gap:6px}.c{width:240px}.v{position:relative;width:240px;height:240px;overflow:hidden;background:#f0f}.v img{position:absolute;left:0;top:0;image-rendering:pixelated}.v i{position:absolute;width:14px;height:14px;border:2px solid #0ff;border-radius:50%}.v u{position:absolute;width:8px;height:8px;border:2px solid #ff0}</style>${rows.map(cell).join('')}`);
const { chromium } = createRequire(import.meta.url)('playwright'); const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage({ viewport: { width: 1520, height: 600 } });
await p.goto('file:///tmp/notes_sheet.html'); await p.waitForTimeout(500); await p.screenshot({ path: out, fullPage: true }); await b.close();
console.log(`${rows.filter(r => r.near.length).length} of ${rows.length} notes flagged by the detector at their spot (on an old build: it sees them; on a fixed one: 0) → ${out}`);
