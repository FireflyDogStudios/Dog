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

// ---- primary yardsticks: Shutter's 7-wolf back line and the 7-wolf photo proportions (medians with ranges)
const BACKLINE = [[0, 1.0, 1.0, 1.0], [0.25, 0.97, 0.96, 1.0], [0.5, 0.98, 0.94, 1.0], [0.65, 0.99, 0.93, 1.0], [0.78, 0.97, 0.94, 0.98], [0.9, 0.93, 0.92, 0.96], [1.0, 0.90, 0.88, 0.94]];  // s, median, lo, hi (ref/research/photos/backline)
const PROPS = { body_len_over_h: [1.15, 1.08, 1.48], chest_floor_h_over_h: [0.47, 0.42, 0.56], nose_fwd_over_h: [0.54, 0.49, 0.54], nose_h_over_h: [0.85, 0.75, 0.86] };   // ref/research/wolf-photo-proportions (median, lo, hi)
const only = names => ({ masses: model.masses.filter(m => m.layer === 'BODY' && names(m.name)) });
const fIn = (mm, x, y) => C.field(mm, 'BODY', x, y) < 0;
const topY = (mm, x) => { for (let k = 0; k <= 400; k++) { const y = -0.5 + k * 0.0025; if (fIn(mm, x, y)) return y; } return NaN; };
function yardsticks() {
  const noTail = only(n => !/^tail/.test(n)), trunk = only(n => /^(trunk|chest|buttock|neck|ruff|throat)/.test(n));
  // withers: highest outline point over the shoulder blades (Shutter: a window about 12% of body length behind the front leg); tail root: back outline first falls at 45 deg behind the croup
  let wx = 0, wy = 9; for (let x = -0.3; x <= -0.08; x += 0.005) { const y = topY(model, x); if (y < wy) { wy = y; wx = x; } }
  let tr = NaN; for (let x = -0.85; x > -1.4; x -= 0.005) { const a = topY(noTail, x), b = topY(noTail, x - 0.01); if (!isFinite(b) || (b - a) / 0.01 >= 1) { tr = x; break; } }
  const H = 1 - wy, back = BACKLINE.map(([s, med, lo, hi]) => { const h = (1 - topY(model, wx + s * (tr - wx))) / H; return { s, model: +h.toFixed(3), median: med, range: [lo, hi], in_range: h >= lo - 1e-3 && h <= hi + 1e-3, err: +(h - med).toFixed(3) }; });
  // proportions, measured the way the photos were (outer outline; heights over the local ground)
  let cf = -9, bt = 9; for (let y = 0.3; y <= 0.55; y += 0.005) for (let x = 0.4; x > -1.5; x -= 0.0025) if (fIn(trunk, x, y)) { cf = Math.max(cf, x); break; }
  for (let y = 0.1; y <= 0.55; y += 0.005) for (let x = -1.5; x < 0.4; x += 0.0025) if (fIn(noTail, x, y)) { bt = Math.min(bt, x); break; }
  let floor = -9; for (let x = -0.45; x <= -0.1; x += 0.005) for (let y = 1.0; y > 0; y -= 0.0025) if (fIn(trunk, x, y)) { floor = Math.max(floor, y); break; }
  let nx = -9, ny = 0; for (let y = -0.3; y <= 0.4; y += 0.0025) for (let x = 0.9; x > 0; x -= 0.0025) if (fIn(model, x, y)) { if (x > nx) { nx = x; ny = y; } break; }
  const val = { body_len_over_h: (cf - bt) / H, chest_floor_h_over_h: (1 - floor) / H, nose_fwd_over_h: (nx - wx) / H, nose_h_over_h: (1 - ny) / H };
  const props = Object.fromEntries(Object.entries(PROPS).map(([k, [med, lo, hi]]) => [k, { model: +val[k].toFixed(3), median: med, range: [lo, hi], in_range: val[k] >= lo - 1e-3 && val[k] <= hi + 1e-3 }]));
  return { withers: [+wx.toFixed(3), +wy.toFixed(3)], tail_root_x: +tr.toFixed(3), backline: back, backline_mean_abs_err: +(back.reduce((s, b) => s + Math.abs(b.err), 0) / back.length).toFixed(3), proportions: props };
}
const Y = yardsticks();
const photo = target('species/build/wolf.photo.json'), curves = target('species/build/wolf.curves.json');
const scores = { primary_7_wolves: Y, secondary_vs_photo_outline: { ...score(photo), caveat: 'wolf.photo.json has a mid-back hump (the photo wolf raised its back, worsened by the warp onto our skeleton); a check only, not the yardstick' }, reference_vs_curves_model: score(curves) };
console.log(JSON.stringify(scores, null, 1));
fs.writeFileSync(`${out}/scores.json`, JSON.stringify({ note: 'WH units; y down so bias > 0 = model line LOWER than target', masses: model.masses.length, ...scores }, null, 1));

// ---- renders
const S = 1000 / 2.4, ox = 1.42 * S, oy = 0.52 * S, H = Math.round(1.62 * S);
const ground = `<line x1="0" y1="${(oy + S).toFixed(1)}" x2="1000" y2="${(oy + S).toFixed(1)}" stroke="#00000033" stroke-width="2"/>`;
const bgs = { dark: '#1e2126', mid: '#7d8590', light: '#efe6d2' };
const svgs = {};
for (const [k, bg] of Object.entries(bgs)) svgs[k] = C.svg(model, { width: 1000, bg, under: ground });
const tPath = (T, col) => `<path d="${T.d}" transform="translate(${ox} ${oy}) scale(${S})" fill="none" stroke="${col}" stroke-width="${2.2 / S}" stroke-dasharray="${8 / S} ${5 / S}"/>`;
const WHm = 1 - Y.withers[1], X = x => ox + x * S, Yp = h => oy + (1 - h * WHm) * S;
const bars = Y.backline.map(b => { const x = X(Y.withers[0] + b.s * (Y.tail_root_x - Y.withers[0]));
  return `<line x1="${x}" y1="${Yp(b.range[0])}" x2="${x}" y2="${Yp(b.range[1])}" stroke="#ffd166" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${Yp(b.median)}" r="5" fill="#ff6a3d" stroke="#1e2126" stroke-width="1.5"/>`; }).join('');
const legend = `<text font-family="sans-serif" font-size="17" fill="#ddd"><tspan x="20" y="30">Back line of 7 standing wolves (Shutter): orange dot = median, yellow bar = range.</tspan><tspan x="20" y="54">Faint dashes: wolf.photo.json, secondary only (it has a mid-back hump).</tspan></text>`;
svgs.overlay = C.svg(model, { width: 1000, bg: '#1e2126', under: ground, over: tPath(photo, '#ff6a3d55') + bars + legend });
svgs.overlay_curves = C.svg(model, { width: 1000, bg: '#1e2126', under: ground, over: tPath(curves, '#5fc6ff') });
for (const [k, s] of Object.entries(svgs)) { fs.writeFileSync(`${out}/wolf-${k}.svg`, s); await sharp(Buffer.from(s)).png().toFile(`${out}/wolf-${k}.png`); }
// 120 px tall dog (withers-to-ground ~ 0.82 of the image height), on the three backgrounds side by side
const small = await Promise.all(Object.values(bgs).map(bg => sharp(Buffer.from(C.svg(model, { width: 1000, bg }))).resize({ height: 148 }).png().toBuffer()));
const w = (await sharp(small[0]).metadata()).width;
await sharp({ create: { width: w * 3, height: 148, channels: 3, background: '#000' } }).composite(small.map((b, i) => ({ input: b, left: i * w, top: 0 }))).png().toFile(`${out}/wolf-120px.png`);
console.log('renders in', out);
