// node tools/qa/motion.mjs <rig> [out.png] : how each moving part moves over one stride. For every animated joint: its swing (degrees, peak to
// peak), how many beats per stride (the strongest harmonic), how far it trails its parent (phase lag, stride fractions), and its jerk (the
// largest jump in angular acceleration: a snap). For the tail: whether it bends along its length (several segments, each later and wider than
// the one before) or swings as one stiff piece in step with the body: GrumpyDingo's "very mechanical". Prints PASS / WARN lines; plots the curves.
import fs from 'node:fs'; import { createRequire } from 'node:module'; import { load } from './rigpose.mjs';
const [id = 'hero5', out] = process.argv.slice(2), R = load(id), N = 192;
const ang = M => Math.atan2(M[1], M[0]) * 180 / Math.PI; /* a joint's world rotation */
const anim = R.D.joints.filter(j => R.D.tracks[j.track || j.id]);
const S = {}; for (const j of R.D.joints) S[j.id] = [];
for (let f = 0; f < N; f++) { const M = R.pose(f / N, true); for (const j of R.D.joints) S[j.id].push(ang(M[j.id])); }
const unwrap = a => { const o = [a[0]]; for (let i = 1; i < a.length; i++) { let d = a[i] - o[i - 1]; d -= 360 * Math.round(d / 360); o.push(o[i - 1] + d); } return o; };
const harm = (a, k) => { let re = 0, im = 0; a.forEach((v, i) => { re += v * Math.cos(2 * Math.PI * k * i / N); im += v * Math.sin(2 * Math.PI * k * i / N); }); return { amp: 2 * Math.hypot(re, im) / N, ph: Math.atan2(im, re) / (2 * Math.PI) }; };
const rel = (j) => { const a = unwrap(S[j.id]), p = unwrap(S[j.in || 'root'] || S[j.id].map(() => 0)); return a.map((v, i) => v - p[i]); }; /* the joint's own turn, relative to its parent */
const rows = [];
for (const j of anim) { const a = rel(j), m = a.reduce((s, v) => s + v, 0) / N, c = a.map(v => v - m), swing = Math.max(...a) - Math.min(...a);
  const H = [1, 2, 3, 4].map(k => harm(c, k)), best = H.reduce((b, h, i) => h.amp > H[b].amp ? i : b, 0);
  const acc = c.map((v, i) => c[(i + 1) % N] - 2 * v + c[(i - 1 + N) % N]), jerk = Math.max(...acc.map((v, i) => Math.abs(acc[(i + 1) % N] - v))) * N * N * N / 1e6;
  rows.push({ id: j.id, in: j.in, swing: +swing.toFixed(2), beats: best + 1, phase: +H[best].ph.toFixed(3), jerk: +jerk.toFixed(2), curve: a }); }
console.log(`motion ${id}: ${anim.length} animated joints over one stride`);
for (const r of rows) console.log(`  ${r.id.padEnd(10)} swing ${String(r.swing).padStart(6)} deg  ${r.beats} beat(s)/stride  jerk ${r.jerk}`);
/* the tail: segments along the chain from the tail joint */
const chain = []; let t = R.D.joints.find(j => j.id === 'tail'); while (t) { chain.push(t); t = R.D.joints.find(j => j.in === t.id && /tail/i.test(j.id)); }
const tailParts = R.D.parts.filter(p => chain.some(c => c.id === (p.in || '')) || (p.skin && chain.some(c => c.id === p.skin.to)));
const bends = tailParts.some(p => p.skin) || chain.length > 1;
const body = rows.find(r => r.id === 'vault') || rows.find(r => r.id === 'body'), tr = rows.filter(r => chain.some(c => c.id === r.id));
const lagOf = (a, b) => { /* phase lag of b behind a (stride fractions) by cross-correlation */ let best = 0, bv = -1e9; const ca = a.map(v => v - a.reduce((s, x) => s + x, 0) / N), cb = b.map(v => v - b.reduce((s, x) => s + x, 0) / N);
  for (let s = 0; s < N; s++) { let v = 0; for (let i = 0; i < N; i++) v += ca[i] * cb[(i + s) % N]; if (v > bv) { bv = v; best = s; } }
  const beat = 1 / (rows.find(r => r.curve === b) || { beats: 1 }).beats; return +((best / N) % beat).toFixed(3); }; /* within one beat: a 2-beat swing late by 0.67 of a stride is 0.17 late */
const res = [];
if (!chain.length) res.push(['SKIP', 'tail', 'no tail joint']);
else { res.push([bends ? 'PASS' : 'WARN', 'tail bend', bends ? `the tail bends along its length (${chain.length} joint${chain.length > 1 ? 's' : ''}${tailParts.some(p => p.skin) ? ', skinned' : ''})` : 'the tail is one stiff piece: it swings as a plank (reads mechanical)']);
  if (tr.length > 1) { const lags = tr.slice(1).map((r, i) => lagOf(tr[i].curve, r.curve)), grow = tr.every((r, i) => !i || r.swing >= tr[i - 1].swing * .9);
    res.push([lags.every(l => l > .02 && l < .5) && grow ? 'PASS' : 'WARN', 'tail wave', `each segment trails the one before by ${lags.join(', ')} of a stride, swings ${tr.map(r => r.swing).join(' → ')} deg (a wave runs down it: ${grow ? 'wider toward the tip' : 'NOT wider toward the tip'})`]); }
  if (body && tr[0]) { const l = lagOf(body.curve, tr[0].curve); res.push([l > .03 ? 'PASS' : 'WARN', 'tail lag', `the tail root trails the body by ${l} of a stride (follow-through; 0 = locked to the body)`]); }
  if (tr[0]) res.push([tr[0].swing >= 3 ? 'PASS' : 'WARN', 'tail life', `root swing ${tr[0].swing} deg over a stride (under 3 reads stiff)`]); }
const jmax = rows.reduce((b, r) => r.jerk > b.jerk ? r : b, { jerk: 0 }); res.push([jmax.jerk < 40 ? 'PASS' : 'WARN', 'smooth', `largest jerk ${jmax.jerk} (${jmax.id || '-'}): ${jmax.jerk < 40 ? 'no snaps' : 'a snap somewhere in its curve'}`]);
for (const [s, k, m] of res) console.log(`  ${s} ${k.padEnd(10)} ${m}`);
if (out) { const W = 900, H = 60 + rows.length * 46; let g = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#15181d"/><text x="10" y="22" fill="#ddd" font-family="sans-serif" font-size="14">${id}: each joint's own turn over one stride (relative to its parent)</text>`;
  rows.forEach((r, i) => { const y0 = 50 + i * 46, mn = Math.min(...r.curve), mx = Math.max(...r.curve), sc = (mx - mn) || 1; const pts = r.curve.map((v, k) => `${(140 + k / N * 740).toFixed(1)},${(y0 + 36 - (v - mn) / sc * 32).toFixed(1)}`).join(' ');
    g += `<text x="10" y="${y0 + 24}" fill="#aaa" font-family="monospace" font-size="12">${r.id} ${r.swing}°</text><polyline points="${pts}" fill="none" stroke="${/tail/.test(r.id) ? '#ffb347' : '#6cb6ff'}" stroke-width="1.6"/>`; });
  fs.writeFileSync('/tmp/motion.svg', g + '</svg>'); const { chromium } = createRequire(import.meta.url)('playwright'); const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H } }); await p.goto('file:///tmp/motion.svg'); await p.screenshot({ path: out }); await b.close(); }
process.exit(0);
