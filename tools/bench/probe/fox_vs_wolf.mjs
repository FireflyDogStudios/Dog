// node tools/bench/probe/fox_vs_wolf.mjs [--json out.json] : the wolf's joint angles through one stride against GrumpyDingo's hand-tracked fox,
// each stride starting at that leg's touchdown. Fox strides (from the paw tracks): near fore f14-f35, near hind f29-f50 (the fox is slowing), far fore f5-f25.
import fs from 'node:fs'; import { D, pose, ap, RIG } from './pose.mjs';
const J = Object.fromEntries(D.joints.map(j => [j.id, j])), P = (M, id) => apply(M, id), apply = (M, id) => ap(M[id], J[id].at);
const FLEX = { shoulder: 1, elbow: -1, carpus: 1, hip: -1, stifle: 1, tarsus: -1 };
const jointAngle = (k, a, b, c) => { const cr = (c[0]-a[0])*(b[1]-a[1]) - (c[1]-a[1])*(b[0]-a[0]), v1 = [a[0]-b[0], a[1]-b[1]], v2 = [c[0]-b[0], c[1]-b[1]];
  const inc = Math.acos(Math.max(-1, Math.min(1, (v1[0]*v2[0] + v1[1]*v2[1]) / Math.hypot(...v1) / Math.hypot(...v2)))) * 180 / Math.PI; return 180 - FLEX[k] * Math.sign(-cr) * (180 - inc); };
const sc = D.landmarks.scapTop, offH = J.hipN.ph || 0, offF = J.shN.ph || 0;
const wolf = { carpus: [], elbow: [], shoulder: [], tarsus: [], stifle: [] };
for (let f = 0; f <= 100; f++) { const u = f / 100, Mh = pose((u - offH + 2) % 1), Mf = pose((u - offF + 2) % 1);
  wolf.stifle.push(jointAngle('stifle', P(Mh, 'hipN'), P(Mh, 'shankN'), P(Mh, 'metaN'))); wolf.tarsus.push(jointAngle('tarsus', P(Mh, 'shankN'), P(Mh, 'metaN'), P(Mh, 'htoeN')));
  wolf.shoulder.push(jointAngle('shoulder', ap(Mf[sc.in], sc.at), P(Mf, 'shN'), P(Mf, 'foreN'))); wolf.elbow.push(jointAngle('elbow', P(Mf, 'shN'), P(Mf, 'foreN'), P(Mf, 'pastN')));
  wolf.carpus.push(jointAngle('carpus', P(Mf, 'foreN'), P(Mf, 'pastN'), P(Mf, 'ftoeN'))); }
const R = JSON.parse(fs.readFileSync('ref/research/firefly/fox-walk-analysis/tracked/results/Fox.mp4_480x270_433_0_1500.json', 'utf8')).angles;
const strideOf = (series, f0, f1) => { const out = []; for (let f = f0; f <= f1; f++) { const v = series[f]; out.push(v == null ? null : v); } return out.map((v, i) => [i / (f1 - f0), v]).filter(e => e[1] != null); };
const fox = { carpus: strideOf(R.ncarpus.perFrame, 14, 35), elbow: strideOf(R.nelbow.perFrame, 14, 35), shoulder: strideOf(R.nshoulder.perFrame, 14, 35), tarsus: strideOf(R.ntarsus.perFrame, 29, 50) };
const duty = { foxFore: 14 / 21, foxHind: 15 / 21, wolfFore: D.gait.duty, wolfHind: D.gait.hindDuty };
const at = (arr, u) => { const x = u * 100, i = Math.floor(x), t = x - i; return arr[Math.min(100, i)] * (1 - t) + arr[Math.min(100, i + 1)] * t; };
const stat = (k, shift = 0) => { const F = fox[k], wv = F.map(([u]) => at(wolf[k], (u + shift + 1) % 1)), fv = F.map(e => e[1]), n = F.length, mf = fv.reduce((a, b) => a + b) / n, mw = wv.reduce((a, b) => a + b) / n;
  const cov = fv.reduce((a, v, i) => a + (v - mf) * (wv[i] - mw), 0), r = cov / Math.sqrt(fv.reduce((a, v) => a + (v - mf) ** 2, 0) * wv.reduce((a, v) => a + (v - mw) ** 2, 0));
  const rms = Math.sqrt(fv.reduce((a, v, i) => a + (v - wv[i]) ** 2, 0) / n), rmsShape = Math.sqrt(fv.reduce((a, v, i) => a + ((v - mf) - (wv[i] - mw)) ** 2, 0) / n);
  const fMin = F.reduce((a, e) => e[1] < a[1] ? e : a), wMinI = wolf[k].indexOf(Math.min(...wolf[k]));
  return { r: +r.toFixed(2), rms: +rms.toFixed(0), rmsShape: +rmsShape.toFixed(0), offset: +(mw - mf).toFixed(0), fox: [Math.min(...fv), Math.max(...fv)].map(Math.round), wolf: [Math.min(...wolf[k]), Math.max(...wolf[k])].map(Math.round), foxMinAt: Math.round(fMin[0] * 100), wolfMinAt: wMinI, n }; };
const best = k => { let b = null; for (let s = -30; s <= 30; s++) { const x = stat(k, s / 100); if (!b || x.r > b.r) b = { ...x, shift: s }; } return b; };
const out = { duty, joints: Object.fromEntries(Object.keys(fox).map(k => [k, { asIs: stat(k), bestShift: best(k) }])), wolf, fox };
if (process.argv[2] === '--json') fs.writeFileSync(process.argv[3], JSON.stringify(out)); else console.log(JSON.stringify({ duty, joints: out.joints }, null, 1));
