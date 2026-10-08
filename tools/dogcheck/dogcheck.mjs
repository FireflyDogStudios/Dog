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
  for (const [p, i] of ORDER) { if (p.hidden && !(only && only.has(i) && p.ref)) continue; if (only && !only.has(i)) continue; /* a hidden reference shape (p.ref) is drawn only when asked for */ const c = fill(p, i); if (c) el.push(shapeSVG(p, c, M[p.in || 'root'], opacity)); }
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

// ---------- visible: small features (eye, nose, markings) must show in every frame; a draw-order change can bury them ----------
{ const feat = ORDER.filter(([p]) => !p.mayHide && !p.ref && (p.paint === 'ink' || p.id && !/^(body|bodyChest|neck|neckLow|tail)$/.test(p.id))).map(e => e[1]); /* a part marked mayHide is allowed to tuck out of sight */
  const idCol = i => '#' + (i + 1).toString(16).padStart(6, '0'), lost = new Map();
  for (const [t, M] of [['standing', pose(0, false)], ...[0, .25, .5, .75].map(t => [`walk ${t * 100}%`, pose(t * D.stride)])]) {
    const ID = await raster(svgOf(M, { fill: (p, i) => idCol(i), crisp: true, opacity: false })), seen = new Map();
    for (let q = 0; q < ID.w * ID.h; q++) if (ID.data[q * 4 + 3] > 127) { const k = (ID.data[q * 4] << 16 | ID.data[q * 4 + 1] << 8 | ID.data[q * 4 + 2]) - 1; seen.set(k, (seen.get(k) || 0) + 1); }
    for (const i of feat) { const own = await raster(svgOf(M, { fill: () => '#000', crisp: true, only: new Set([i]) })); let n = 0; for (let q = 0; q < own.w * own.h; q++) if (own.data[q * 4 + 3] > 127) n++;
      const vis = (seen.get(i) || 0) / Math.max(1, n), L = label(D.parts[i]); if (vis < (D.parts[i].paint === 'ink' ? .9 : .15) && !lost.has(L)) lost.set(L, `${(vis * 100).toFixed(0)}% visible (${t})`); } }
  if (lost.size) for (const [L, m] of lost) add('visible', 'FAIL', `${L} is hidden: ${m}`); else add('visible', 'PASS', `eye, nose and every named marking show in all checked frames`); }

// ---------- topline: above hip / shoulder height a leg stays inside the body (a thigh or upper arm swinging out over the croup or withers) ----------
{ const body = new Set(ORDER.filter(([p]) => /^(body|bodyChest|neck|neckLow)$/.test(p.id || '')).map(e => e[1])), Jx = Object.fromEntries(D.joints.map(j => [j.id, j]));
  const tops = D.joints.filter(j => j.track === 'hhip' || j.track === 'fsh'), under = top => { const ids = new Set([top.id]); let grew = true; while (grew) { grew = false; for (const j of D.joints) if (!ids.has(j.id) && ids.has(j.in)) { ids.add(j.id); grew = true; } } return ids; };
  let worst = { d: 0 };
  for (let f = 0; f < 12; f++) { const t = f / 12 * D.stride, M = pose(t), B = await raster(svgOf(M, { fill: () => '#000', only: body }));
    for (const top of tops) { const ids = under(top), parts = new Set(ORDER.filter(([p]) => ids.has(p.in)).map(e => e[1])), Lg = await raster(svgOf(M, { fill: () => '#000', only: parts }));
      const pivotY = (apply(M[top.id], top.at)[1] - VIEW[1]) * PX, w = B.w;
      for (let y = 0; y < Math.min(B.h, pivotY); y++) for (let x = 0; x < w; x++) { const q = (y * w + x) * 4 + 3; if (Lg.data[q] > 127 && B.data[q] < 128) { let dd = 99; for (let r = 1; r < 40 && dd === 99; r++) for (const [dx, dy] of [[r, 0], [-r, 0], [0, r], [0, -r]]) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < w && Y < B.h && B.data[(Y * w + X) * 4 + 3] > 127) { dd = r; break; } }
        const d = dd / PX; if (d > worst.d) worst = { d, at: toU(x, y), f, leg: top.id }; } } } }
  if (worst.d > .1) add('topline', 'FAIL', `${worst.leg} pokes ${worst.d.toFixed(2)} out of the body above its pivot at (${worst.at[0].toFixed(1)}, ${worst.at[1].toFixed(1)}) (walk frame ${worst.f}/12)`); else add('topline', 'PASS', 'above hip and shoulder height every leg stays inside the body, all walk frames'); }

// ---------- markings: inside their shape; what covers them ----------
{ const M = pose(0, false), BASEPAINT = new Set(['fur', 'leg', 'pale2', 'tan']);
  const marks = ORDER.filter(([p]) => !BASEPAINT.has(p.paint || 'fur') && p.paint !== 'ink' && !/[FN]$/.test(p.in || ''));
  // id image: each part its own colour (crisp), to see what is on top where
  const idCol = i => '#' + (i + 1).toString(16).padStart(6, '0');
  const ID = await raster(svgOf(M, { fill: (p, i) => idCol(i), crisp: true, opacity: false }));
  const topAt = q => ID.data[q * 4 + 3] > 127 ? ((ID.data[q * 4] << 16 | ID.data[q * 4 + 1] << 8 | ID.data[q * 4 + 2]) - 1) : -1;
  let issues = 0;
  for (const [p, i] of marks) { const jid = p.in || 'root';
    const base = p.markOn ? new Set(ORDER.filter(([q]) => q.id === p.markOn).map(e => e[1])) /* a marking that sits across pieces (the throat over the chest) is checked against a named shape, e.g. a hidden copy of the whole outline */
      : new Set(ORDER.filter(([q, k]) => (q.in || 'root') === jid && BASEPAINT.has(q.paint || 'fur') && ORDER.findIndex(e => e[1] === k) < ORDER.findIndex(e => e[1] === i)).map(e => e[1]));
    const mk = await raster(svgOf(M, { fill: () => '#000', crisp: true, only: new Set([i]) })), bs = await raster(svgOf(M, { fill: () => '#000', crisp: true, only: base }));
    let n = 0, out = 0; const cover = {};
    for (let q = 0; q < mk.w * mk.h; q++) { if (mk.data[q * 4 + 3] < 128) continue; n++; if (bs.data[q * 4 + 3] < 128) out++; const t = topAt(q); if (t !== i && t >= 0) { const L = label(D.parts[t]); cover[L] = (cover[L] || 0) + 1; } }
    const name = label(p), fo = out / n;
    if (base.size && fo > 0.01) { issues++; add('markings', 'FAIL', `${name} pokes ${(fo * 100).toFixed(1)}% outside the shape it marks`); }
    const cov = Object.entries(cover).filter(([, c]) => c / n > 0.03).map(([L, c]) => `${L} ${(c / n * 100).toFixed(0)}%`);
    if (cov.length) add('markings', 'INFO', `${name} is partly drawn over by ${cov.join(', ')} (check the edge that makes)`); }
  // walking: a leg that draws over the body must not cut into a body marking more than it does standing (the thigh eating into the saddle)
  const legParts = new Set(ORDER.filter(([p]) => /[FN]$/.test(p.in || '')).map(e => e[1]));
  const topOfJ = jid => { let c = D.joints.find(j => j.id === jid); while (c && !(c.track === 'hhip' || c.track === 'fsh')) c = D.joints.find(j => j.id === c.in); return c; };
  const partTop = Object.fromEntries([...legParts].map(k => [k, topOfJ(D.parts[k].in)])); /* only a leg's top, above its own pivot, can 'cut' (below it the leg is simply in front) */
  for (const [p, i] of marks.filter(([p]) => (p.in || 'root') === 'body')) { let rest = null, worst = { c: 0 };
    for (const t of [null, ...Array.from({ length: 12 }, (_, f) => f / 12)]) { const M = t == null ? pose(0, false) : pose(t * D.stride);
      const ID = await raster(svgOf(M, { fill: (q, k) => idCol(k), crisp: true, opacity: false })), mk = await raster(svgOf(M, { fill: () => '#000', crisp: true, only: new Set([i]) }));
      let n = 0, cut = 0; const pv = {}; for (const k of legParts) { const tj = partTop[k]; if (tj && pv[tj.id] == null) pv[tj.id] = (apply(M[tj.id], tj.at)[1] - VIEW[1]) * PX; }
      for (let q = 0; q < mk.w * mk.h; q++) { if (mk.data[q * 4 + 3] < 128) continue; n++; const k = ID.data[q * 4 + 3] > 127 ? ((ID.data[q * 4] << 16 | ID.data[q * 4 + 1] << 8 | ID.data[q * 4 + 2]) - 1) : -1; if (legParts.has(k) && partTop[k] && Math.floor(q / mk.w) < pv[partTop[k].id]) cut++; }
      const c = cut / Math.max(1, n); if (t == null) rest = c; else if (c - rest > worst.c) worst = { c: c - rest, t }; }
    if (worst.c > .02) { issues++; add('markings', 'FAIL', `a leg cuts into ${label(p)} while walking: ${(worst.c * 100).toFixed(1)}% more of it covered than standing (walk ${Math.round(worst.t * 100)}%)`); } }
  if (!issues) add('markings', 'PASS', `${marks.length} markings stay inside their shapes, and no leg cuts into them while walking`); }

// ---------- feet: ground, slide, bob, stride match ----------
{ const toes = D.joints.filter(j => /toe/.test(j.id)), N = 96, legs = {};
  const topOf = j => { let c = j; while (c && !(c.track === 'hhip' || c.track === 'fsh')) c = D.joints.find(x => x.id === c.in); return c; };
  for (const j of toes) { const top = topOf(j), tr = D.tracks[top.track]; legs[j.id] = { top, stance: D.gait ? [0, top.track === 'hhip' && D.gait.hindDuty ? D.gait.hindDuty : D.gait.duty] : [tr[0].at, tr[1].at], pts: [] }; } /* a rig may say its duty factor (baked walks have many keys) */
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
    speeds[jid] = -k * D.stride; /* how fast a planted paw moves back, ground units per stride: every paw must match the ground */
    if (slide > 0.25) add('feet', 'FAIL', `${jid} slides ${slide.toFixed(2)} units while planted (not a steady push)`);
    if (bob > 0.3) add('feet', 'WARN', `${jid} rises and dips ${bob.toFixed(2)} units while planted (a stiff leg swinging from the hip; needs knee/IK compensation)`); }
  // footfall timing, read from the animation itself: when each paw lands and lifts (global stride phase), against measured dog walks
  // (Catavitello 2015 LF 0.135, RH 0.491, RF 0.63; Maes 2008 LF 0.16; wolf recommendation LF 0.16 (0.12-0.20); duty fore 0.59 / hind 0.58, range 0.56-0.68)
  { const td = {}, du = {}; for (const [jid, L] of Object.entries(legs)) { const P = L.pts, n = P.length, down = P.map(q => q.y >= GROUND - .03);
      for (let i = 0; i < n; i++) if (down[i] && !down[(i - 1 + n) % n]) td[jid] = P[i].t / D.stride % 1; du[jid] = down.filter(Boolean).length / n; }
    const rel = k => ((td[k] - td.htoeF) % 1 + 1) % 1, lf = rel('ftoeF'), rh = rel('htoeN'), rf = rel('ftoeN');
    const okLF = lf >= .12 && lf <= .20, okRH = Math.abs(rh - .5) < .03, okRF = Math.abs(((rf - .5 - lf) % 1 + 1.5) % 1 - .5) < .03;
    const fd = (du.ftoeF + du.ftoeN) / 2, hd = (du.htoeF + du.htoeN) / 2, okD = fd >= .56 && fd <= .68 && hd >= .56 && hd <= .68;
    add('gait', okLF && okRH && okRF && okD ? 'PASS' : 'WARN', `footfalls (left hind = 0): left fore ${lf.toFixed(2)} (measured 0.13-0.16, wolf 0.12-0.20), right hind ${rh.toFixed(2)} (0.50), right fore ${rf.toFixed(2)}; paws down fore ${fd.toFixed(2)}, hind ${hd.toFixed(2)} of the stride (measured 0.56-0.68)`); }
  const v = Object.values(speeds), lo = Math.min(...v), hi = Math.max(...v);
  add('feet', hi / lo > 1.12 ? 'WARN' : 'PASS', `planted paws move back at (ground units per stride): ${Object.entries(speeds).map(([k, s]) => `${k} ${s.toFixed(1)}`).join(', ')} units${hi / lo > 1.12 ? ': front and hind speeds differ, so one pair skates against the ground' : ''}`); }

// ---------- joints: included angles (180 = straight), standing and over the walk, against measured dog walks ----------
{ const W = {}; try { for (const line of fs.readFileSync(path.join(ROOT, 'ref/research/fetched/04-gait-curves/curves.csv'), 'utf8').split('\n').slice(1)) { const c = line.split(','); if (c[0] === 'catavitello2015_retrievers' && c[1] === 'walk') (W[c[2]] ||= []).push(+c[4]); } } catch (e) {}
  const J = Object.fromEntries(D.joints.map(j => [j.id, j])), P = (M, id) => apply(M[id], J[id].at);
  const inc = (a, b, c) => { const v1 = [a[0] - b[0], a[1] - b[1]], v2 = [c[0] - b[0], c[1] - b[1]]; return Math.acos(Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / Math.hypot(...v1) / Math.hypot(...v2)))) * 180 / Math.PI; };
  const carpus = (e, w, p) => { const a1 = Math.atan2(w[1] - e[1], w[0] - e[0]), a2 = Math.atan2(p[1] - w[1], p[0] - w[0]); let t = (a2 - a1) * 180 / Math.PI; while (t > 180) t -= 360; while (t < -180) t += 360; return 180 - t; }; /* >180 = over-extended (normal in stance) */
  const L = D.landmarks && D.landmarks.scapTop;
  const angles = M => { const o = { stifle: inc(P(M, 'hipN'), P(M, 'shankN'), P(M, 'metaN')), tarsus: inc(P(M, 'shankN'), P(M, 'metaN'), P(M, 'htoeN')),
      elbow: inc(P(M, 'shN'), P(M, 'foreN'), P(M, 'pastN')), carpus: carpus(P(M, 'foreN'), P(M, 'pastN'), P(M, 'ftoeN')) };
    if (L) o.shoulder = inc(apply(M[L.in], L.at), P(M, 'shN'), P(M, 'foreN')); return o; };
  const rest = angles(pose(0, false)), walk = {}; for (let f = 0; f < 48; f++) { const a = angles(pose(f / 48 * D.stride)); for (const k in a) (walk[k] ||= []).push(a[k]); }
  for (const k of ['shoulder', 'elbow', 'carpus', 'stifle', 'tarsus']) { if (!walk[k]) continue; const lo = Math.min(...walk[k]), hi = Math.max(...walk[k]), m = W[k];
    if (k === 'carpus') { /* Catavitello's carpus runs to the toe tip (20-35 deg high), so the wrist is checked against metacarpal-based numbers instead:
         GrumpyDingo's hand-tracked fox (ref/research/firefly/fox-walk-analysis/TRACKED-ANGLES.md) 64-214, the 5MC-marker dogs 88-217 (04-gait-curves/joint_extremes.csv) */
      const off = []; if (lo > 95) off.push(`folds only to ${lo.toFixed(0)} in the swing (fox ~64, dogs 88)`); if (lo < 55) off.push(`folds to ${lo.toFixed(0)}, past the fox's 64`);
      if (hi < 185) off.push(`never gives past straight under load (fox and dogs 195-220)`); if (hi > 228) off.push(`opens to ${hi.toFixed(0)}, past the measured ~220`);
      add('joints', off.length ? 'WARN' : 'PASS', `carpus: standing ${rest[k].toFixed(0)}, walk ${lo.toFixed(0)}–${hi.toFixed(0)}; fox (hand-tracked) 64–214, dogs (5MC) 88–217${off.length ? ': ' + off.join('; ') : ''}`);
    /* while its paw is down the wrist must hold (the forearm and pastern move as one column; GrumpyDingo, Oct 8): the fox's stance wrist spans 187-198 (IQR) */
    { const offF = (J.shN && J.shN.ph) || 0, duty = (D.gait && D.gait.duty) || .62, S = []; for (let f = 0; f < 96; f++) { const u = ((f / 96) + offF) % 1; if (u > .04 && u < duty - .04) S.push(angles(pose(f / 96 * D.stride)).carpus); }
      if (S.length) { const a0 = Math.min(...S), a1 = Math.max(...S), crosses = a0 < 177 && a1 > 183;
        add('joints', a1 - a0 > 20 || crosses ? 'FAIL' : 'PASS', `wrist while the paw is down: ${a0.toFixed(0)}–${a1.toFixed(0)}${crosses ? ': it bends one way then the other (looks broken)' : a1 - a0 > 20 ? `: sweeps ${(a1 - a0).toFixed(0)}° (the fox holds within ~11°)` : ' (holds, as the tracked fox does)'}`); } } continue; }
    if (!m) { add('joints', 'INFO', `${k}: standing ${rest[k].toFixed(0)}, walk ${lo.toFixed(0)}–${hi.toFixed(0)} (no measured walk curve)`); continue; }
    const mlo = Math.min(...m), mhi = Math.max(...m), tol = k === 'carpus' ? 25 : 10; /* Catavitello's carpus uses the toe tip: inflated, so a wider tolerance */
    const off = []; if (lo < mlo - tol) off.push(`bends to ${lo.toFixed(0)}, beyond the measured ${mlo.toFixed(0)}`); if (hi > mhi + tol) off.push(`opens to ${hi.toFixed(0)}, beyond the measured ${mhi.toFixed(0)}`);
    if (hi - lo < (mhi - mlo) * .5) off.push(`moves only ${(hi - lo).toFixed(0)}° against the measured ${(mhi - mlo).toFixed(0)}°`);
    add('joints', off.length ? 'WARN' : 'PASS', `${k}: standing ${rest[k].toFixed(0)}, walk ${lo.toFixed(0)}–${hi.toFixed(0)}; measured dog walk ${mlo.toFixed(0)}–${mhi.toFixed(0)}${off.length ? ': ' + off.join('; ') : ''}`); } }

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
  const speed = D.gait && D.gait.speed ? D.gait.speed : 7.8 / (D.gait ? D.gait.duty : .62); /* ground units per stride, from the baked stance */
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
