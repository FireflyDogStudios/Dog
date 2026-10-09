// node tools/bench/probe/hind_scan.mjs : try hind-walk settings and score how smooth the hind leg's angles are (no long straight-knee lock, no corners)
import fs from 'node:fs'; import vm from 'node:vm';
const src = { rig: fs.readFileSync(new URL('../../../engine/rig.js', import.meta.url), 'utf8'), den: fs.readFileSync(new URL('../../../engine/rig_den.js', import.meta.url), 'utf8'), h3: fs.readFileSync(new URL('../../../engine/hero3.js', import.meta.url), 'utf8') };
const HIND = src.h3.match(/hind:\{duty:[^}]*\}/)[0];
export function load(hind) { const box = { console, Math }; vm.createContext(box); vm.runInContext(src.rig, box); vm.runInContext(src.den, box); vm.runInContext(src.h3.replace(HIND, hind || HIND), box); vm.runInContext('registerDenRigs(RIG); registerHero3(RIG);', box); return vm.runInContext('RIG.DEFS.hero3', box); }
export function score(D) { const T = ['hhip', 'hshank', 'hmeta'].map(n => D.tracks[n].map(k => k.v)); const n = T[0].length - 1; let worst = 0, at = 0;
  for (const v of T) for (let i = 0; i < n; i++) { const a = v[(i - 1 + n) % n], b = v[i], c = v[(i + 1) % n], d2 = Math.abs(a - 2 * b + c); if (d2 > worst) { worst = d2; at = i / n; } }
  const sh = T[1], lo = Math.min(...sh), lock = sh.filter(v => v < lo + .05).length; return { worst: +worst.toFixed(1), at: +(at * 100).toFixed(0), lockKeys: lock }; }
if ((process.argv[1] || '').endsWith('hind_scan.mjs') && !process.argv[2]) {
  console.log('now', HIND, score(load()));
  for (const c of [-.5, 0, .5, 1, 1.5]) for (const f of [4, 15, 30]) for (const ln of [16]) { const h = HIND.replace(/centre:[-\d.]+/, 'centre:' + c).replace(/fold:[\d.]+/, 'fold:' + f).replace(/lean:[\d.]+/, 'lean:' + ln); console.log(`centre ${c} fold ${f} lean ${ln}`, JSON.stringify(score(load(h)))); } }
if (process.argv[2] === 'smooth') for (const c of [.5, 1, 1.5]) for (const sm of [0, 2, 4, 8]) { const h = HIND.replace(/centre:[-\d.]+/, 'centre:' + c).replace('}', `, smooth:${sm}}`); console.log(`centre ${c} smooth ${sm}`, JSON.stringify(score(load(h)))); }
