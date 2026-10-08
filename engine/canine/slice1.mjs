// Spark, Oct 8 2026: slice 1. Build the wolf from its species files, score it against the measured wolf outline,
// and render big on three backgrounds, at 120 px, and overlaid. node engine/canine/slice1.mjs [outDir]
import fs from 'node:fs';
import sharp from 'sharp';
import './canine2d.js';
import { loadSpecies } from './species.mjs';
const C = globalThis.Canine2D, out = process.argv[2] || 'ref/research/spark/03-2d-builder';
fs.mkdirSync(out, { recursive: true });
const P = loadSpecies('wolf'), model = C.build(P);

// ---- target outlines (SVG path d in WH) -> polygons
function polys(d) {
  const t = d.match(/[MCLZ]|-?\d*\.?\d+(?:e-?\d+)?/gi), res = []; let cur = null, p = [0, 0], i = 0, cmd;
  while (i < t.length) {
    if (/[MCLZ]/i.test(t[i])) cmd = t[i++].toUpperCase();
    if (cmd === 'Z') { if (cur) res.push(cur); cur = null; continue; }
    if (cmd === 'M') { p = [+t[i], +t[i + 1]]; i += 2; cur = [p]; cmd = 'L'; continue; }
    if (cmd === 'L') { p = [+t[i], +t[i + 1]]; i += 2; cur.push(p); continue; }
    if (cmd === 'C') { const a = [+t[i], +t[i + 1]], b = [+t[i + 2], +t[i + 3]], c = [+t[i + 4], +t[i + 5]]; i += 6;
      for (let s = 1; s <= 8; s++) { const u = s / 8, w = 1 - u; cur.push([w*w*w*p[0] + 3*w*w*u*a[0] + 3*w*u*u*b[0] + u*u*u*c[0], w*w*w*p[1] + 3*w*w*u*a[1] + 3*w*u*u*b[1] + u*u*u*c[1]]); } p = c; }
  }
  if (cur) res.push(cur); return res;
}
const inPoly = (pl, x, y) => { let c = false; for (let i = 0, j = pl.length - 1; i < pl.length; j = i++) { const [xi, yi] = pl[i], [xj, yj] = pl[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
function target(file) {
  const L = JSON.parse(fs.readFileSync(file, 'utf8')).layers;
  const all = Object.values(L).flatMap(l => polys(l.d_wh)), body = polys(L.BODY.d_wh);
  return { all, body, d: Object.values(L).map(l => l.d_wh).join(' ') };
}
const inside = (ps, x, y) => ps.some(p => inPoly(p, x, y));
const mIn = (x, y) => C.field(model, 'BODY', x, y) < 0 || C.field(model, 'FAR', x, y) < 0;
const mBody = (x, y) => C.field(model, 'BODY', x, y) < 0;

function score(T) {
  let I = 0, U = 0; const st = 0.005;
  for (let y = -0.5; y <= 1.04; y += st) for (let x = -1.45; x <= 0.85; x += st) { const a = mIn(x, y), b = inside(T.all, x, y); if (a && b) I++; if (a || b) U++; }
  const scan = (f, x, fromTop) => { for (let k = 0; k <= 300; k++) { const y = fromTop ? -0.5 + k * 0.004 : 1.0 - k * 0.004; if (f(x, y)) return y; } return NaN; };
  const err = (x0, x1, fromTop) => { const e = []; for (let x = x0; x <= x1 + 1e-9; x += 0.01) { const a = scan(mBody, x, fromTop), b = scan((xx, yy) => inside(T.body, xx, yy), x, fromTop); if (isFinite(a) && isFinite(b)) e.push(a - b); }
    const m = e.reduce((s, v) => s + Math.abs(v), 0) / e.length; return { mean_abs: +m.toFixed(4), max_abs: +Math.max(...e.map(Math.abs)).toFixed(4), bias: +(e.reduce((s, v) => s + v, 0) / e.length).toFixed(4), n: e.length }; };
  return { iou: +(I / U).toFixed(3), topline: err(-0.95, 0.0, true), belly: err(-0.8, -0.3, false) };
}
const photo = target('species/build/wolf.photo.json'), curves = target('species/build/wolf.curves.json');
const scores = { vs_photo_outline: score(photo), vs_curves_model: score(curves) };
console.log(JSON.stringify(scores, null, 1));
fs.writeFileSync(`${out}/scores.json`, JSON.stringify({ note: 'WH units; y down so bias > 0 = model line LOWER than target', masses: model.masses.length, ...scores }, null, 1));

// ---- renders
const S = 1000 / 2.4, ox = 1.42 * S, oy = 0.52 * S, H = Math.round(1.62 * S);
const ground = `<line x1="0" y1="${(oy + S).toFixed(1)}" x2="1000" y2="${(oy + S).toFixed(1)}" stroke="#00000033" stroke-width="2"/>`;
const bgs = { dark: '#1e2126', mid: '#7d8590', light: '#efe6d2' };
const svgs = {};
for (const [k, bg] of Object.entries(bgs)) svgs[k] = C.svg(model, { width: 1000, bg, under: ground });
const tPath = (T, col) => `<path d="${T.d}" transform="translate(${ox} ${oy}) scale(${S})" fill="none" stroke="${col}" stroke-width="${2.2 / S}" stroke-dasharray="${8 / S} ${5 / S}"/>`;
svgs.overlay = C.svg(model, { width: 1000, bg: '#1e2126', under: ground, over: tPath(photo, '#ff6a3d') });
svgs.overlay_curves = C.svg(model, { width: 1000, bg: '#1e2126', under: ground, over: tPath(curves, '#5fc6ff') });
for (const [k, s] of Object.entries(svgs)) { fs.writeFileSync(`${out}/wolf-${k}.svg`, s); await sharp(Buffer.from(s)).png().toFile(`${out}/wolf-${k}.png`); }
// 120 px tall dog (withers-to-ground ~ 0.82 of the image height), on the three backgrounds side by side
const small = await Promise.all(Object.values(bgs).map(bg => sharp(Buffer.from(C.svg(model, { width: 1000, bg }))).resize({ height: 148 }).png().toBuffer()));
const w = (await sharp(small[0]).metadata()).width;
await sharp({ create: { width: w * 3, height: 148, channels: 3, background: '#000' } }).composite(small.map((b, i) => ({ input: b, left: i * w, top: 0 }))).png().toFile(`${out}/wolf-120px.png`);
console.log('renders in', out);
