// dogcheck (Firefly, Oct 8 2026): one command that checks a Den dog rig the way GrumpyDingo's reviews do, so faults are caught before anyone looks.
// node tools/dogcheck/dogcheck.mjs [rigId=hero3] [outDir=art/<rigId>/dogcheck]   (also: ./den dogcheck <rigId>)
// The rig is posed here exactly as engine/rig.js poses it (same tracks, origins, nesting and draw order), written out as true-vector SVG
// and rasterised with sharp, so every check runs on real curves, not on Pixi's tessellation.
// Checks (each from a fault we actually hit):
//   fit       outline vs the 7 measured wolves (Spark's scorer, engine/canine/score_hero3.mjs; hero3 only for now)
//   pieces    every walk frame is one connected silhouette (a part that comes loose shows as a second blob)
//   slivers   thin bands or rims of one colour squeezed between two shapes, and stray fragments (rest pose)
//   markings  markings (saddle, bib, tail top...) stay inside the shape they mark, and what draws over them is listed
//   feet      no paw below the ground; a planted paw does not slide or bob; front and hind strides cover the same ground
//   contrast  the dog's main colours against the meadow sand at game size
// Output: sheet.png (contact sheet: three backgrounds, auto zooms, walk frames, game size), report.md, report.json. Exit 1 on any FAIL.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ARGS = process.argv.slice(2).filter(a => !a.startsWith('--')), id = ARGS[0] || 'hero3', OUT = ARGS[1] || path.join(ROOT, 'art', id, 'dogcheck');
fs.mkdirSync(OUT, { recursive: true });

// ---------- load the engine (classic scripts) in one sandbox ----------
const box = { console, Math }; vm.createContext(box);
for (const f of ['rig.js', 'rig_den.js', 'hero3.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'engine', f), 'utf8'), box, { filename: f });
const RIG = vm.runInContext('RIG', box); vm.runInContext('registerDenRigs(RIG); registerHero3(RIG);', box);
const D = RIG.DEFS[id]; if (!D) { console.error('unknown rig ' + id); process.exit(2); }
const [BW, BH] = D.box, GROUND = 35.55; /* paw soles stand on y = paw joint + 1.05 = 35.55 */
const PX = 40; /* px per drawing unit for the checks */

// ---------- pose: rig.js tick() as matrices ----------
const mul = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
const apply = (M, p) => [M[0] * p[0] + M[2] * p[1] + M[4], M[1] * p[0] + M[3] * p[1] + M[5]];
function pose(t, walking = true, states = []) {
  const phase = walking ? (t / D.stride) % 1 : 0, M = { root: [1, 0, 0, 1, 0, 0] }, smp = {};
  for (const j of D.joints) {
    const tr = D.tracks[j.track || j.id]; let rot = 0, x = 0, y = 0;
    if (tr && (walking || j.always)) { const ph = j.period ? ((t / j.period) % 1) : (phase + (j.ph || 0)) % 1; RIG.sample(tr, ph, smp); rot = smp.v; x = smp.x; y = smp.y; }
    if (j.bob && walking) y -= Math.pow(Math.sin(phase * Math.PI * 2), 2) * j.bob;
    for (const s of states) for (const a of (D.states[s] || [])) if (a.joint === j.id) { rot += a.rot || 0; x += a.x || 0; y += a.y || 0; }
    const o = j.at || [0, 0], r = rot * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    const L = [c, s, -s, c, o[0] + x - (c * o[0] - s * o[1]), o[1] + y - (s * o[0] + c * o[1])];
    M[j.id] = mul(M[j.in || 'root'], L);
  }
  return M;
}

// ---------- draw order (rig.js build): joint containers are created first, so a container's child joints draw under its own parts,
// except animated limb joints, whose parts draw under their children ----------
const kids = {}, far = { root: false }; D.joints.forEach(j => { (kids[j.in || 'root'] ||= []).push(j.id); far[j.id] = !!j.far || far[j.in || 'root']; });
const animated = new Set(D.joints.filter(j => j.track || D.tracks[j.id]).map(j => j.id));
const ORDER = []; (function walk(jid) { const P = D.parts.map((p, i) => [p, i]).filter(([p]) => (p.in || 'root') === jid), K = kids[jid] || [];
  if (animated.has(jid)) { P.forEach(e => ORDER.push(e)); K.forEach(walk); } else { K.forEach(walk); P.forEach(e => ORDER.push(e)); } })('root');
const pal = D.palette;
const dimHex = (c, k) => { const n = parseInt(c.slice(1), 16); const f = s => Math.round(((n >> s) & 255) * k).toString(16).padStart(2, '0'); return '#' + f(16) + f(8) + f(0); };
const colourOf = p => { let c = pal[p.paint || 'fur'] ?? pal.fur; if (far[p.in || 'root'] || p.far) c = dimHex(c, pal.far ?? .78); return c; };
const label = p => p.id || `${p.paint || 'fur'}@${p.in || 'root'}`;

function shapeSVG(p, fill, M, opacity = true) {
  const tf = `transform="matrix(${M.map(v => +v.toFixed(5)).join(' ')})"`, a = opacity && p.alpha != null ? ` fill-opacity="${p.alpha}"` : '';
  if (p.d && p.stroke) return `<path d="${p.d}" fill="none" stroke="${fill}" stroke-width="${p.sw}" stroke-linecap="round" stroke-linejoin="round" ${tf}/>`;
  if (p.d) return `<path d="${p.d}" fill="${fill}"${a} ${tf}/>`;
  if (p.poly) return `<polygon points="${p.poly.map(q => q.join(',')).join(' ')}" fill="${fill}"${a} ${tf}/>`;
  if (p.circle) return `<circle cx="${p.circle[0]}" cy="${p.circle[1]}" r="${p.circle[2]}" fill="${fill}"${a} ${tf}/>`;
  if (p.ellipse) return `<ellipse cx="${p.ellipse[0]}" cy="${p.ellipse[1]}" rx="${p.ellipse[2]}" ry="${p.ellipse[3]}" fill="${fill}"${a} ${tf}/>`;
  if (p.line) return `<line x1="${p.line[0][0]}" y1="${p.line[0][1]}" x2="${p.line[1][0]}" y2="${p.line[1][1]}" stroke="${fill}" stroke-width="${p.sw}" stroke-linecap="round" ${tf}/>`;
  return '';
}
// fill(p, i) → colour or null to skip; view = [x0, y0, x1, y1] in drawing units
function svgOf(M, { fill = colourOf, view = [0, -2, BW, BH], ppu = PX, bg = null, crisp = false, only = null, opacity = true } = {}) {
  const [x0, y0, x1, y1] = view, el = [];
  for (const [p, i] of ORDER) { if (p.hidden) continue; if (only && !only.has(i)) continue; const c = fill(p, i); if (c) el.push(shapeSVG(p, c, M[p.in || 'root'], opacity)); }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round((x1 - x0) * ppu)}" height="${Math.round((y1 - y0) * ppu)}" viewBox="${x0} ${y0} ${x1 - x0} ${y1 - y0}"${crisp ? ' shape-rendering="crispEdges"' : ''}>${bg ? `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="${bg}"/>` : ''}${el.join('')}</svg>`;
}
const raster = async svg => { const { data, info } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); return { data, w: info.width, h: info.height }; };
const VIEW = [0, -2, BW, BH], toU = (px, py) => [VIEW[0] + px / PX, VIEW[1] + py / PX];

// connected components of a boolean mask (8-connected); returns [{area, minx, miny, maxx, maxy, cx, cy}]
function components(mask, w, h, minArea = 1) {
  const seen = new Uint8Array(w * h), out = [], st = new Int32Array(w * h);
  for (let s = 0; s < w * h; s++) { if (!mask[s] || seen[s]) continue; let n = 0, top = 0, minx = w, miny = h, maxx = 0, maxy = 0, sx = 0, sy = 0; st[top++] = s; seen[s] = 1;
    while (top) { const q = st[--top], x = q % w, y = (q / w) | 0; n++; sx += x; sy += y; if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= w || Y >= h) continue; const r = Y * w + X; if (mask[r] && !seen[r]) { seen[r] = 1; st[top++] = r; } } }
    if (n >= minArea) out.push({ area: n, minx, miny, maxx, maxy, cx: sx / n, cy: sy / n }); }
  return out;
}

const ATT = [];
const R = []; const add = (check, level, msg, extra = {}) => { R.push({ check, level, msg, ...extra }); console.log(`  ${level.padEnd(4)} ${check.padEnd(9)} ${msg}`); };
console.log(`dogcheck ${id}`);

// ---------- fit: Spark's scorer ----------
if (id === 'hero3') {
  const tmp = path.join(OUT, '.score'); const r = spawnSync('node', [path.join(ROOT, 'engine/canine/score_hero3.mjs'), tmp], { cwd: ROOT, encoding: 'utf8' });
  if (r.status !== 0) add('fit', 'WARN', 'scorer failed: ' + (r.stderr || '').split('\n')[0]);
  else { const S = JSON.parse(fs.readFileSync(path.join(tmp, 'scores.json'), 'utf8'));
    const bad = S.backline.filter(b => !b.in_range).map(b => `back s=${b.s} ${b.model} (${b.range.join('–')})`);
    for (const [k, v] of Object.entries(S.proportions)) if (!v.in_range) bad.push(`${k} ${v.model} (${v.range.join('–')})`);
    add('fit', bad.length ? 'WARN' : 'PASS', bad.length ? 'outside the 7-wolf range: ' + bad.join('; ') : `all ${S.backline.length} back-line points and ${Object.keys(S.proportions).length} proportions in range (back error ${S.backline_mean_abs_err})`); }
} else add('fit', 'SKIP', 'no measured yardstick wired for this rig yet');

// ---------- pieces: one silhouette per walk frame ----------
const NF = 24; let worst = null;
for (let f = 0; f < NF; f++) { const t = f / NF * D.stride, M = pose(t); const { data, w, h } = await raster(svgOf(M, { fill: () => '#000' }));
  const m = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) m[i] = data[i * 4 + 3] > 127;
  const cs = components(m, w, h, 20); if (cs.length > 1 && (!worst || cs.length > worst.n)) worst = { f, n: cs.length, cs }; }
if (worst) { const c = worst.cs.sort((a, b) => a.area - b.area)[0], [ux, uy] = toU(c.cx, c.cy); add('pieces', 'FAIL', `frame ${worst.f}/${NF}: ${worst.n} separate pieces; smallest near (${ux.toFixed(1)}, ${uy.toFixed(1)})`); }
else add('pieces', 'PASS', `one connected silhouette in all ${NF} walk frames`);

// ---------- slivers: thin same-colour regions at rest ----------
{ const M = pose(0, false); const { data, w, h } = await raster(svgOf(M, { crisp: true, opacity: false }));
  const key = new Int32Array(w * h); for (let i = 0; i < w * h; i++) key[i] = data[i * 4 + 3] > 127 ? (data[i * 4] << 16 | data[i * 4 + 1] << 8 | data[i * 4 + 2]) : -1;
  // chamfer distance (3-4) from each pixel to the nearest pixel of a different colour
  const INF = 1 << 28, d = new Int32Array(w * h).fill(INF);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (key[i] < 0) { d[i] = 0; continue; }
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1 || key[i - 1] !== key[i] || key[i + 1] !== key[i] || key[i - w] !== key[i] || key[i + w] !== key[i]) d[i] = 3; }
  const nb = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (!d[i]) continue; let v = d[i];
    if (nb(x - 1, y)) v = Math.min(v, d[i - 1] + 3); if (nb(x, y - 1)) v = Math.min(v, d[i - w] + 3); if (nb(x - 1, y - 1)) v = Math.min(v, d[i - w - 1] + 4); if (nb(x + 1, y - 1)) v = Math.min(v, d[i - w + 1] + 4); d[i] = v; }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) { const i = y * w + x; if (!d[i]) continue; let v = d[i];
    if (nb(x + 1, y)) v = Math.min(v, d[i + 1] + 3); if (nb(x, y + 1)) v = Math.min(v, d[i + w] + 3); if (nb(x + 1, y + 1)) v = Math.min(v, d[i + w + 1] + 4); if (nb(x - 1, y + 1)) v = Math.min(v, d[i + w - 1] + 4); d[i] = v; }
  // regions by colour
  const seen = new Uint8Array(w * h), st = new Int32Array(w * h), found = [];
  for (let s = 0; s < w * h; s++) { if (key[s] < 0 || seen[s]) continue; const k = key[s]; let n = 0, top = 0, dm = 0, sx = 0, sy = 0; st[top++] = s; seen[s] = 1;
    while (top) { const q = st[--top], x = q % w, y = (q / w) | 0; n++; sx += x; sy += y; if (d[q] > dm) dm = d[q];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (!nb(X, Y)) continue; const r = Y * w + X; if (!seen[r] && key[r] === k) { seen[r] = 1; st[top++] = r; } } }
    const thick = 2 * dm / 3 / PX, area = n / PX / PX, [ux, uy] = toU(sx / n, sy / n);
    if (area < 0.04 && n >= 6 && thick > 0.06) found.push({ kind: 'stray fragment', thick, area, at: [ux, uy], col: '#' + k.toString(16).padStart(6, '0') });
    else if (thick < 0.2 && thick > 0.06 && area >= 0.04) found.push({ kind: 'sliver', thick, area, at: [ux, uy], col: '#' + k.toString(16).padStart(6, '0') }); }
  // thin parts INSIDE a region (a rim along an edge, a neck between two shapes): pixels a disc of radius r cannot reach (opening)
  { const r = Math.round(0.1 * PX * 3), keys = new Set(); for (let i = 0; i < w * h; i++) if (key[i] >= 0) keys.add(key[i]);
    const e = new Int32Array(w * h), thin = new Uint8Array(w * h);
    for (const k of keys) { const INF2 = 1 << 28; for (let i = 0; i < w * h; i++) e[i] = key[i] === k && d[i] > r ? 0 : INF2; /* seeds: the eroded region */
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (!e[i]) continue; let v = e[i]; if (x > 0) v = Math.min(v, e[i - 1] + 3); if (y > 0) v = Math.min(v, e[i - w] + 3); if (x > 0 && y > 0) v = Math.min(v, e[i - w - 1] + 4); if (x < w - 1 && y > 0) v = Math.min(v, e[i - w + 1] + 4); e[i] = v; }
      for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) { const i = y * w + x; if (!e[i]) continue; let v = e[i]; if (x < w - 1) v = Math.min(v, e[i + 1] + 3); if (y < h - 1) v = Math.min(v, e[i + w] + 3); if (x < w - 1 && y < h - 1) v = Math.min(v, e[i + w + 1] + 4); if (x > 0 && y < h - 1) v = Math.min(v, e[i + w - 1] + 4); e[i] = v; }
      for (let i = 0; i < w * h; i++) if (key[i] === k && e[i] > r + 3 && d[i] > 3) thin[i] = 1; }
    for (const c of components(thin, w, h, 1)) { const area = c.area / PX / PX, len = Math.hypot(c.maxx - c.minx, c.maxy - c.miny) / PX, [ux, uy] = toU(c.cx, c.cy);
      if (area >= 0.12 && len >= 1.2) { const q = Math.round(c.cy) * w + Math.round(c.cx); found.push({ kind: 'thin band', thick: area / len, area, at: [ux, uy], col: key[q] >= 0 ? '#' + key[q].toString(16).padStart(6, '0') : 'edge' }); } } }
  if (found.length) for (const f of found.slice(0, 8)) add('slivers', 'FAIL', `${f.kind} of ${f.col} at (${f.at[0].toFixed(1)}, ${f.at[1].toFixed(1)}): ${f.thick.toFixed(2)} thick, ${f.area.toFixed(2)} sq units`);
  else add('slivers', 'PASS', 'no colour band thinner than 0.2 units and no stray fragments at rest'); }

// ---------- notches: narrow cracks of background cutting into the outline (a closing by radius r fills them) ----------
async function notches(M, r = 0.12) { const { data, w, h } = await raster(svgOf(M, { fill: () => '#000' })), n = w * h, R3 = Math.round(r * PX * 3);
  const dist = seed => { const e = new Int32Array(n); for (let i = 0; i < n; i++) e[i] = seed(i) ? 0 : 1 << 28;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (!e[i]) continue; let v = e[i]; if (x > 0) v = Math.min(v, e[i - 1] + 3); if (y > 0) v = Math.min(v, e[i - w] + 3); if (x > 0 && y > 0) v = Math.min(v, e[i - w - 1] + 4); if (x < w - 1 && y > 0) v = Math.min(v, e[i - w + 1] + 4); e[i] = v; }
    for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) { const i = y * w + x; if (!e[i]) continue; let v = e[i]; if (x < w - 1) v = Math.min(v, e[i + 1] + 3); if (y < h - 1) v = Math.min(v, e[i + w] + 3); if (x < w - 1 && y < h - 1) v = Math.min(v, e[i + w + 1] + 4); if (x > 0 && y < h - 1) v = Math.min(v, e[i + w - 1] + 4); e[i] = v; } return e; };
  const sil = i => data[i * 4 + 3] > 127, d1 = dist(sil), dil = new Uint8Array(n); for (let i = 0; i < n; i++) dil[i] = d1[i] <= R3;
  const d2 = dist(i => !dil[i]), crack = new Uint8Array(n); for (let i = 0; i < n; i++) crack[i] = !sil(i) && d2[i] > R3;
  return components(crack, w, h, 1).map(c => ({ ...c, area: c.area / PX / PX, at: toU(c.cx, c.cy) })).filter(c => c.area >= 0.015); }
{ const found = []; for (const [t, M] of [['standing', pose(0, false)], ...[0, .25, .5, .75].map(t => [`walk ${t * 100}%`, pose(t * D.stride)])]) for (const c of await notches(M)) found.push({ ...c, t });
  const seen = new Set(), uniq = found.filter(c => { const k = `${Math.round(c.at[0])},${Math.round(c.at[1])}`; if (seen.has(k)) return false; seen.add(k); return true; });
  // a baseline (art/<id>/dogcheck/baseline.json, written with --baseline) lists the cracks GrumpyDingo has seen; only new ones are flagged
  const BF = path.join(OUT, 'baseline.json'), base = fs.existsSync(BF) ? JSON.parse(fs.readFileSync(BF, 'utf8')).notches || [] : null;
  const known = c => base && base.some(b => b.t === c.t && Math.hypot(b.at[0] - c.at[0], b.at[1] - c.at[1]) < 0.6);
  if (process.argv.includes('--baseline')) { fs.writeFileSync(BF, JSON.stringify({ notches: uniq.map(c => ({ t: c.t, at: c.at.map(v => +v.toFixed(2)), area: +c.area.toFixed(3) })) }, null, 1)); add('notches', 'INFO', `baseline written: ${uniq.length} known cracks`); }
  else { const fresh = uniq.filter(c => !known(c)), old = uniq.length - fresh.length;
    fresh.slice(0, 8).forEach(c => add('notches', 'WARN', `NEW narrow crack in the outline at (${c.at[0].toFixed(1)}, ${c.at[1].toFixed(1)}), ${c.area.toFixed(2)} sq units (${c.t}): two edges meet at a sharp angle`));
    if (!fresh.length) add('notches', 'PASS', base ? `no new cracks (${old} known ones in the baseline)` : 'no narrow cracks where parts meet, standing or walking'); } }

// ---------- attachment: each joint's parts overlap the parts of the joint they hang from ----------
{ const owner = {}; D.joints.forEach(j => owner[j.id] = j.in || 'root');
  const partsIn = jid => new Set(D.parts.map((p, i) => [p, i]).filter(([p]) => (p.in || 'root') === jid && !p.hidden).map(e => e[1]));
  const hostOf = jid => { let c = owner[jid]; while (c && c !== 'root' && !partsIn(c).size) c = owner[c]; return !c || c === 'root' ? 'body' : c; };
  const bad = [], frames = [0, .25, .5, .75].map(t => [t, pose(t * D.stride)]); frames.unshift(['rest', pose(0, false)]);
  for (const j of D.joints) { const own = partsIn(j.id); if (!own.size || j.id === 'body') continue; const host = hostOf(j.id); let worstF = 1, at = '';
    for (const [t, M] of frames) { const A = await raster(svgOf(M, { fill: () => '#000', only: own })), B = await raster(svgOf(M, { fill: () => '#000', only: partsIn(host) }));
      let a = 0, o = 0; for (let q = 0; q < A.w * A.h; q++) if (A.data[q * 4 + 3] > 127) { a++; if (B.data[q * 4 + 3] > 127) o++; }
      const f = o / a; if (f < worstF) { worstF = f; at = t === 'rest' ? 'standing' : `walk ${t * 100}%`; } }
    const need = /ear/i.test(j.id) ? 0.08 : 0.03;
    if (worstF < need) bad.push(`${j.id} on ${host}: only ${(worstF * 100).toFixed(1)}% rooted (${at}; needs ${need * 100}%)`); else ATT.push(`${j.id} ${(worstF * 100).toFixed(0)}%`); }
  if (bad.length) bad.forEach(b => add('attach', 'FAIL', b)); else add('attach', 'PASS', `every part is rooted in what it hangs from (least: ${ATT.sort((x, y) => parseFloat(x.split(' ')[1]) - parseFloat(y.split(' ')[1])).slice(0, 3).join(', ')})`); }

// ---------- markings: inside their shape; what covers them ----------
{ const M = pose(0, false), BASEPAINT = new Set(['fur', 'leg', 'pale2', 'tan']);
  const marks = ORDER.filter(([p]) => !BASEPAINT.has(p.paint || 'fur') && p.paint !== 'ink' && !/[FN]$/.test(p.in || ''));
  // id image: each part its own colour (crisp), to see what is on top where
  const idCol = i => '#' + (i + 1).toString(16).padStart(6, '0');
  const ID = await raster(svgOf(M, { fill: (p, i) => idCol(i), crisp: true, opacity: false }));
  const topAt = q => ID.data[q * 4 + 3] > 127 ? ((ID.data[q * 4] << 16 | ID.data[q * 4 + 1] << 8 | ID.data[q * 4 + 2]) - 1) : -1;
  let issues = 0;
  for (const [p, i] of marks) { const jid = p.in || 'root';
    const base = new Set(ORDER.filter(([q, k]) => (q.in || 'root') === jid && BASEPAINT.has(q.paint || 'fur') && ORDER.findIndex(e => e[1] === k) < ORDER.findIndex(e => e[1] === i)).map(e => e[1]));
    const mk = await raster(svgOf(M, { fill: () => '#000', crisp: true, only: new Set([i]) })), bs = await raster(svgOf(M, { fill: () => '#000', crisp: true, only: base }));
    let n = 0, out = 0; const cover = {};
    for (let q = 0; q < mk.w * mk.h; q++) { if (mk.data[q * 4 + 3] < 128) continue; n++; if (bs.data[q * 4 + 3] < 128) out++; const t = topAt(q); if (t !== i && t >= 0) { const L = label(D.parts[t]); cover[L] = (cover[L] || 0) + 1; } }
    const name = label(p), fo = out / n;
    if (base.size && fo > 0.01) { issues++; add('markings', 'FAIL', `${name} pokes ${(fo * 100).toFixed(1)}% outside the shape it marks`); }
    const cov = Object.entries(cover).filter(([, c]) => c / n > 0.03).map(([L, c]) => `${L} ${(c / n * 100).toFixed(0)}%`);
    if (cov.length) add('markings', 'INFO', `${name} is partly drawn over by ${cov.join(', ')} (check the edge that makes)`); }
  if (!issues) add('markings', 'PASS', `${marks.length} markings stay inside their shapes`); }

// ---------- feet: ground, slide, bob, stride match ----------
{ const toes = D.joints.filter(j => /toe/.test(j.id)), N = 96, legs = {};
  const topOf = j => { let c = j; while (c && !(c.track === 'hhip' || c.track === 'fsh')) c = D.joints.find(x => x.id === c.in); return c; };
  for (const j of toes) { const top = topOf(j), tr = D.tracks[top.track]; legs[j.id] = { top, stance: D.gait ? [0, D.gait.duty] : [tr[0].at, tr[1].at], pts: [] }; } /* a rig may say its duty factor (baked walks have many keys) */
  let sink = 0, sinkAt = '';
  for (let f = 0; f < N; f++) { const t = f / N * D.stride, M = pose(t), phase = (t / D.stride) % 1;
    for (const j of toes) { const L = legs[j.id], c = apply(M[j.id], [j.at[0] + .5, j.at[1] + 1.05]), ph = (phase + (L.top.ph || 0)) % 1; L.pts.push({ t, ph, x: c[0], y: c[1] });
      if (c[1] - GROUND > sink) { sink = c[1] - GROUND; const st = ph >= L.stance[0] && ph <= L.stance[1]; sinkAt = `${j.id} at ${(ph * 100).toFixed(0)}% of its stride, ${st ? 'while planted' : 'mid-swing: the paw scrapes through the ground'}`; } } }
  if (sink > 0.15) add('feet', 'FAIL', `a paw sinks ${sink.toFixed(2)} below the ground (${sinkAt})`); else add('feet', 'PASS', `no paw below the ground (deepest ${sink.toFixed(2)})`);
  const speeds = {};
  for (const [jid, L] of Object.entries(legs)) { const [a, b] = L.stance, span = b - a, S = L.pts.filter(q => q.ph > a + .05 * span && q.ph < b - .05 * span);
    if (S.length < 4) continue; S.forEach(q => q.u = (q.ph - a) * D.stride); const mt = S.reduce((s, q) => s + q.u, 0) / S.length, mx = S.reduce((s, q) => s + q.x, 0) / S.length;
    const k = S.reduce((s, q) => s + (q.u - mt) * (q.x - mx), 0) / S.reduce((s, q) => s + (q.u - mt) ** 2, 0);
    const slide = Math.max(...S.map(q => Math.abs(q.x - (mx + k * (q.u - mt))))), bob = Math.max(...S.map(q => q.y)) - Math.min(...S.map(q => q.y));
    speeds[jid] = -k * span * D.stride; /* ground the paw pushes back over its stance */
    if (slide > 0.25) add('feet', 'FAIL', `${jid} slides ${slide.toFixed(2)} units while planted (not a steady push)`);
    if (bob > 0.3) add('feet', 'WARN', `${jid} rises and dips ${bob.toFixed(2)} units while planted (a stiff leg swinging from the hip; needs knee/IK compensation)`); }
  const v = Object.values(speeds), lo = Math.min(...v), hi = Math.max(...v);
  add('feet', hi / lo > 1.12 ? 'WARN' : 'PASS', `planted paws push back over their stance: ${Object.entries(speeds).map(([k, s]) => `${k} ${s.toFixed(1)}`).join(', ')} units${hi / lo > 1.12 ? ': front and hind do not match, so a paw skates against the ground' : ''}`); }

// ---------- contrast at game size ----------
{ const lum = c => { const n = parseInt(c.slice(1), 16), ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * ch[0] + .7152 * ch[1] + .0722 * ch[2]; };
  const cr = (a, b) => { const A = lum(a), B = lum(b); return (Math.max(A, B) + .05) / (Math.min(A, B) + .05); }, SAND = '#d9c493';
  const main = ['fur', 'leg', 'saddle', 'pale', 'pale2'].filter(k => pal[k]), rows = main.map(k => `${k} ${cr(pal[k], SAND).toFixed(2)}`);
  const weak = main.filter(k => (k === 'fur' || k === 'leg') && cr(pal[k], SAND) < 1.5);
  add('contrast', weak.length ? 'WARN' : 'PASS', `against the meadow sand: ${rows.join(', ')}${weak.length ? ` (${weak.join(', ')} under 1.5: may melt into the ground)` : ''}`); }

// ---------- contact sheet ----------
{ const tiles = [], txt = (s, w, h = 26) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><text x="6" y="18" font-family="sans-serif" font-size="15" fill="#ddd">${s}</text></svg>`);
  const png = async svg => sharp(Buffer.from(svg)).png().toBuffer();
  const M0 = pose(0, false); let y = 0; const W = 1860;
  const row = async (items, label) => { tiles.push({ input: txt(label, W), top: y, left: 0 }); y += 26; let x = 0, hmax = 0; for (const it of items) { tiles.push({ input: it.buf, top: y, left: x }); x += it.w + 10; hmax = Math.max(hmax, it.h); } y += hmax + 14; };
  await row(await Promise.all(['#ff00ff', '#000000', '#0000ff'].map(async bg => ({ buf: await png(svgOf(M0, { bg, ppu: 10 })), w: 620, h: 400 }))), 'standing: pink / black / blue');
  const J = Object.fromEntries(D.joints.map(j => [j.id, j])), zoomAt = (c, r) => [c[0] - r, c[1] - r, c[0] + r, c[1] + r];
  const zooms = [['head and ears', zoomAt([46, 9], 6)], ['tail root', zoomAt(J.tail ? J.tail.at : [20, 14], 5)]];
  for (const k of ['shN', 'foreN', 'pastN', 'hipN', 'shankN', 'metaN']) if (J[k]) zooms.push([k, zoomAt(J[k].at, 3.2)]);
  await row(await Promise.all(zooms.map(async ([n, v]) => ({ buf: await sharp(await png(svgOf(M0, { bg: '#ff00ff', view: v, ppu: 200 / (v[2] - v[0]) }))).composite([{ input: txt(n, 200, 22), top: 0, left: 0 }]).png().toBuffer(), w: 200, h: 200 }))), 'zooms (true vectors, pink)');
  const walk = []; for (let f = 0; f < 8; f++) walk.push({ buf: await png(svgOf(pose(f / 8 * D.stride), { bg: '#1d2128', ppu: 3.6 })), w: 223, h: 144 });
  await row(walk, 'walk: 8 frames of one stride');
  const gh = 120 / 36, game = await png(svgOf(M0, { bg: '#d9c493', ppu: gh }));
  const big = await sharp(game).resize({ width: Math.round(62 * gh) * 3, kernel: 'nearest' }).png().toBuffer();
  await row([{ buf: game, w: Math.round(62 * gh), h: Math.round(40 * gh) }, { buf: big, w: Math.round(62 * gh) * 3, h: Math.round(40 * gh) * 3 }], 'game size (about 120 px tall) on the sand, and the same pixels x3');
  await sharp({ create: { width: W, height: y, channels: 4, background: '#2a2d33' } }).composite(tiles).png().toFile(path.join(OUT, 'sheet.png')); }

// ---------- walk preview: frames with ground marks scrolling at the planted-paw speed (if the paws stay put on the marks, nothing slides) ----------
{ const FR = 36, dir = path.join(OUT, '.frames'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const duty = D.gait ? D.gait.duty : .62, speed = 7.8 / duty; /* ground units per stride, from the baked stance */
  for (let f = 0; f < FR; f++) { const t = f / FR * D.stride, M = pose(t), off = ((t / D.stride) * speed) % 4;
    let marks = ''; for (let x = -4; x < BW + 4; x += 4) marks += `<rect x="${(x - off).toFixed(3)}" y="${GROUND}" width="1.2" height=".35" fill="#4a5160"/>`;
    const svg = svgOf(M, { bg: '#1d2128', ppu: 10 }).replace('</svg>', `<rect x="0" y="${GROUND}" width="${BW}" height=".08" fill="#5c6474"/>${marks}</svg>`);
    await sharp(Buffer.from(svg)).png().toFile(path.join(dir, String(f).padStart(3, '0') + '.png')); }
  const py = spawnSync('python3', ['-c', `import glob,sys\nfrom PIL import Image\nfs=sorted(glob.glob(sys.argv[1]+'/*.png'))\nim=[Image.open(f).convert('P', palette=Image.ADAPTIVE, colors=64) for f in fs]\nim[0].save(sys.argv[2], save_all=True, append_images=im[1:], duration=int(1000*${D.stride}/len(im)), loop=0, disposal=2)`, dir, path.join(OUT, 'walk.gif')], { encoding: 'utf8' });
  if (py.status) add('preview', 'WARN', 'walk.gif not written: ' + py.stderr.split('\n').slice(-2).join(' ')); else add('preview', 'INFO', `walk.gif: ${FR} frames, one stride, ground marks scroll at the planted-paw speed`); }

// ---------- report ----------
const nF = R.filter(r => r.level === 'FAIL').length, nW = R.filter(r => r.level === 'WARN').length;
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ rig: id, fails: nF, warns: nW, results: R }, null, 1));
fs.writeFileSync(path.join(OUT, 'report.md'), `# dogcheck ${id}\n\n${nF} fail, ${nW} warn. Contact sheet: \`sheet.png\`.\n\n| check | result | detail |\n|---|---|---|\n${R.map(r => `| ${r.check} | ${r.level} | ${r.msg.replace(/\|/g, '/')} |`).join('\n')}\n`);
console.log(`${nF} fail, ${nW} warn → ${path.relative(ROOT, OUT)}/sheet.png`);
process.exit(nF ? 1 : 0);
