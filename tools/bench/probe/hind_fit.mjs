// node tools/bench/probe/hind_fit.mjs : scan hind-walk settings, score the near knee and hock against the walking dogs (shape r and mean error)
import fs from 'node:fs'; import { load } from './hind_scan.mjs';
const src = fs.readFileSync(new URL('../../../engine/hero3.js', import.meta.url), 'utf8'), HIND = src.match(/hind:\{duty:[^}]*\}/)[0];
const ref = {}; for (const l of fs.readFileSync('ref/research/fetched/04-gait-curves/curves.csv', 'utf8').split('\n').slice(1)) { const c = l.split(','); if (c[0] === 'catavitello2015_retrievers' && c[1] === 'walk') (ref[c[2]] ||= [])[+c[3]] = +c[4]; }
const mul = (A, B) => [A[0]*B[0]+A[2]*B[1], A[1]*B[0]+A[3]*B[1], A[0]*B[2]+A[2]*B[3], A[1]*B[2]+A[3]*B[3], A[0]*B[4]+A[2]*B[5]+A[4], A[1]*B[4]+A[3]*B[5]+A[5]], ap = (M, p) => [M[0]*p[0]+M[2]*p[1]+M[4], M[1]*p[0]+M[3]*p[1]+M[5]];
const incl = (a, b, c) => { const v1 = [a[0]-b[0], a[1]-b[1]], v2 = [c[0]-b[0], c[1]-b[1]]; return Math.acos(Math.max(-1, Math.min(1, (v1[0]*v2[0]+v1[1]*v2[1]) / Math.hypot(...v1) / Math.hypot(...v2)))) * 180 / Math.PI; };
const corr = (a, b) => { const n = a.length, ma = a.reduce((x, y) => x + y) / n, mb = b.reduce((x, y) => x + y) / n; return a.reduce((t, v, i) => t + (v - ma) * (b[i] - mb), 0) / Math.sqrt(a.reduce((t, v) => t + (v - ma) ** 2, 0) * b.reduce((t, v) => t + (v - mb) ** 2, 0)); };
export function fit(D) { const RIG = D.__RIG; const J = Object.fromEntries(D.joints.map(j => [j.id, j])), s = {}, St = [], Ta = [], bodyV = [];
  for (let f = 0; f < 100; f++) { const t = (f / 100 - (J.hipN.ph || 0) + 2) % 1, M = { root: [1,0,0,1,0,0] };
    for (const j of D.joints) { const tr = D.tracks[j.track || j.id]; let r = 0, x = 0, y = 0; if (tr) { RIG.sample(tr, (t + (j.ph || 0) + 1) % 1, s); r = s.v; x = s.x; y = s.y; } const o = j.at || [0,0], a = r*Math.PI/180, c = Math.cos(a), n = Math.sin(a); M[j.id] = mul(M[j.in || 'root'], [c, n, -n, c, o[0]+x-(c*o[0]-n*o[1]), o[1]+y-(n*o[0]+c*o[1])]); }
    const P = id => ap(M[id], J[id].at); St.push(incl(P('hipN'), P('shankN'), P('metaN'))); Ta.push(incl(P('shankN'), P('metaN'), P('htoeN'))); }
  const dS = ref.stifle.slice(0, 100), dT = ref.tarsus.slice(0, 100), err = (a, b) => a.reduce((t, v, i) => t + Math.abs(v - b[i]), 0) / a.length, bv = D.tracks.bodyWalk.map(k => k.v);
  return { rS: +corr(St, dS).toFixed(2), rT: +corr(Ta, dT).toFixed(2), eS: +err(St, dS).toFixed(1), eT: +err(Ta, dT).toFixed(1), tilt: [Math.min(...bv), Math.max(...bv)].map(v => +v.toFixed(1)) }; }
if ((process.argv[1] || '').endsWith('hind_fit.mjs')) for (const c of [1, 2, 3, 4]) for (const sm of [0, 2]) { const h = HIND.replace(/centre:[-\d.]+/, 'centre:' + c).replace(/smooth:\d+/, 'smooth:' + sm); console.log(`centre ${c} smooth ${sm}`, JSON.stringify(fit(load(h)))); }
