// Spark, Oct 8 2026: score hero3's standing outline (body path + near legs, rest pose) against the 7 measured wolves,
// with the same yardsticks as slice 1 (Shutter's back line, the 7-wolf photo ratios), and draw one overlay.
// node engine/canine/score_hero3.mjs [outDir]
import fs from 'node:fs';
import vm from 'node:vm';
import sharp from 'sharp';
// the engine files are classic scripts (module.exports at the end); load them in one shared sandbox
const box = { console, Math }; vm.createContext(box);
for (const f of ['rig.js', 'rig_den.js', 'hero3.js']) vm.runInContext(fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'), box, { filename: f });
const RIG = vm.runInContext('RIG', box); vm.runInContext('registerDenRigs(RIG); registerHero3(RIG);', box);
const D = RIG.DEFS.hero3, out = process.argv[2] || 'ref/research/spark/04-hero3-score';
fs.mkdirSync(out, { recursive: true });

// hero3's own frame (engine/hero3.js header): drawing units, y down, ground y 35.5, withers top (37.2, 11.0), WH 24.5
const GROUND = 35.5, WX = 37.2, PX = 40, [BW, BH] = D.box;
const shape = (p, fill) => p.d ? `<path d="${p.d}" fill="${fill}"/>` : p.poly ? `<polygon points="${p.poly.map(q => q.join(',')).join(' ')}" fill="${fill}"/>`
  : p.circle ? `<circle cx="${p.circle[0]}" cy="${p.circle[1]}" r="${p.circle[2]}" fill="${fill}"/>` : p.ellipse ? `<ellipse cx="${p.ellipse[0]}" cy="${p.ellipse[1]}" rx="${p.ellipse[2]}" ry="${p.ellipse[3]}" fill="${fill}"/>` : '';
const BODY = new Set(['body', 'bodyChest', 'neck']); /* hero3 splits the body path into the torso and the neck-and-head piece (head joint); at rest they make the old outline */
const near = p => /N$/.test(p.in || '');                                  // legParts("N")
const sets = {
  outline: D.parts.filter(p => BODY.has(p.id) || near(p)),             // what the request scores: body (with the neck and head piece) + near legs
  body: D.parts.filter(p => BODY.has(p.id)),
};
async function mask(parts) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${BW * PX}" height="${BH * PX}" viewBox="0 0 ${BW} ${BH}"><rect width="100%" height="100%" fill="#fff"/>${parts.map(p => shape(p, '#000')).join('')}</svg>`;
  const { data } = await sharp(Buffer.from(svg)).greyscale().raw().toBuffer({ resolveWithObject: true });
  return (x, y) => { const i = Math.round(y * PX), j = Math.round(x * PX); return i >= 0 && j >= 0 && i < BH * PX && j < BW * PX && data[i * BW * PX + j] < 128; };
}
const M = { outline: await mask(sets.outline), body: await mask(sets.body) };
const st = 1 / PX;
const topY = (m, x) => { for (let y = 0; y < BH; y += st) if (m(x, y)) return y; return NaN; };

// withers: highest outline point over the shoulder blades (the back behind hero3's drawn withers, before the neck rises)
let wx = WX, wy = 99; for (let x = WX - 6; x <= WX + 1e-9; x += st) { const y = topY(M.body, x); if (y < wy) { wy = y; wx = x; } }
const H = GROUND - wy;
// tail root: the back outline first falls at 45 deg behind the croup (body path only; the tail is its own part)
let tr = NaN; for (let x = wx - 0.5 * H; x > 0; x -= st) { const a = topY(M.body, x), b = topY(M.body, x - 0.25); if (!isFinite(b) || (b - a) / 0.25 >= 1) { tr = x; break; } }
const BACKLINE = [[0, 1.0, 1.0, 1.0], [0.25, 0.97, 0.96, 1.0], [0.5, 0.98, 0.94, 1.0], [0.65, 0.99, 0.93, 1.0], [0.78, 0.97, 0.94, 0.98], [0.9, 0.93, 0.92, 0.96], [1.0, 0.90, 0.88, 0.94]];
const back = BACKLINE.map(([s, med, lo, hi]) => { const x = wx + s * (tr - wx), h = (GROUND - topY(M.body, x)) / H;
  return { s, model: +h.toFixed(3), median: med, range: [lo, hi], in_range: h >= lo - 1e-3 && h <= hi + 1e-3, err: +(h - med).toFixed(3) }; });
// proportions, measured as on the photos (outer outline, heights over the ground)
let cf = -1, bt = 99, floor = -1, nx = -1, ny = 0;
for (let y = wy + 0.3 * H; y <= wy + 0.55 * H; y += st) for (let x = BW; x > 0; x -= st) if (M.body(x, y)) { cf = Math.max(cf, x); break; }
for (let y = wy + 0.1 * H; y <= wy + 0.55 * H; y += st) for (let x = 0; x < BW; x += st) if (M.outline(x, y)) { bt = Math.min(bt, x); break; }
for (let x = wx - 0.3 * H; x <= wx + 0.1 * H; x += st) for (let y = GROUND; y > 0; y -= st) if (M.body(x, y)) { floor = Math.max(floor, y); break; }
const front = []; for (let y = 0; y < wy + 0.5 * H; y += st) for (let x = BW; x > 0; x -= st) if (M.body(x, y)) { front.push([x, y]); break; }
nx = Math.max(...front.map(q => q[0])); { const tip = front.filter(q => q[0] >= nx - 0.1); ny = tip.reduce((s, q) => s + q[1], 0) / tip.length; }   // nose: the middle of its foremost edge
const PROPS = { body_len_over_h: [1.15, 1.08, 1.48], chest_floor_h_over_h: [0.47, 0.42, 0.56], nose_fwd_over_h: [0.54, 0.49, 0.54], nose_h_over_h: [0.85, 0.75, 0.86] };
const val = { body_len_over_h: (cf - bt) / H, chest_floor_h_over_h: (GROUND - floor) / H, nose_fwd_over_h: (nx - wx) / H, nose_h_over_h: (GROUND - ny) / H };
const props = Object.fromEntries(Object.entries(PROPS).map(([k, [med, lo, hi]]) => [k, { model: +val[k].toFixed(3), median: med, range: [lo, hi], in_range: val[k] >= lo - 1e-3 && val[k] <= hi + 1e-3 }]));
const res = { rig: 'hero3', frame: 'drawing units, y down, ground 35.5', withers: [+wx.toFixed(2), +wy.toFixed(2)], WH_measured: +H.toFixed(2), tail_root_x: +tr.toFixed(2),
  backline: back, backline_mean_abs_err: +(back.reduce((s, b) => s + Math.abs(b.err), 0) / back.length).toFixed(3), proportions: props,
  method: 'outline = body path + near legs at rest; withers = highest body point in the 6 units behind the drawn withers; tail root = first 45 deg fall; chest front = foremost body point 0.30-0.55 H below the withers; buttock = rearmost outline point 0.10-0.55 H below; chest floor = lowest body point from 0.3 H behind to 0.1 H ahead of the withers; nose = the middle of the foremost edge of the head (within 0.1 units of the tip)' };
fs.writeFileSync(`${out}/scores.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));

// overlay: hero3 (all parts, far ones dimmed) + the 7-wolf back line (median dot, range bar) + measured points
const S = 16, W = BW * S, Hh = BH * S, pal = D.palette;
const col = p => pal[p.paint || 'fur'] || pal.fur, isFar = p => /F$/.test(p.in || '') || p.in === 'earFar';
const art = D.parts.map(p => `<g opacity="${isFar(p) ? 0.6 : 1}">${shape(p, col(p))}</g>`).join('');
const bars = back.map(b => { const x = wx + b.s * (tr - wx), y = h => GROUND - h * H;
  return `<line x1="${x}" y1="${y(b.range[0])}" x2="${x}" y2="${y(b.range[1])}" stroke="#ffd166" stroke-width="0.35" stroke-linecap="round"/><circle cx="${x}" cy="${y(b.median)}" r="0.32" fill="#ff6a3d" stroke="#1e2126" stroke-width="0.08"/>`; }).join('');
const lines = `<line x1="0" y1="${GROUND}" x2="${BW}" y2="${GROUND}" stroke="#ffffff33" stroke-width="0.08"/>` +
  `<line x1="${bt}" y1="${GROUND - 0.47 * H}" x2="${cf}" y2="${GROUND - 0.47 * H}" stroke="#5fc6ff" stroke-width="0.12" stroke-dasharray="0.4 0.3"/>` +
  `<circle cx="${wx + 0.54 * H}" cy="${GROUND - 0.85 * H}" r="0.35" fill="none" stroke="#5fc6ff" stroke-width="0.12"/>`;
const legend = `<text font-family="sans-serif" font-size="13" fill="#ddd"><tspan x="12" y="20">hero3, standing. Back line of 7 wolves (Shutter): orange dot = median, yellow bar = range.</tspan><tspan x="12" y="38">Blue dashes: the 7-wolf median chest floor (0.47). Blue ring: the median nose point (0.54 forward, 0.85 high).</tspan></text>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Hh}" viewBox="0 0 ${W} ${Hh}"><rect width="100%" height="100%" fill="#1e2126"/><g transform="scale(${S})">${art}${bars}${lines}</g>${legend}</svg>`;
await sharp(Buffer.from(svg)).png().toFile(`${out}/hero3-overlay.png`);
console.log('wrote', out);
