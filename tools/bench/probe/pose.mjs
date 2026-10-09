// Shared pose helper for hero3 probes: load the rig, pose it at a phase, give world polygons for any part.
import fs from 'node:fs'; import vm from 'node:vm';
const box = { console, Math }; vm.createContext(box);
for (const f of ['rig.js', 'rig_den.js', 'hero3.js']) vm.runInContext(fs.readFileSync(new URL('../../../engine/' + f, import.meta.url), 'utf8'), box);
export const RIG = vm.runInContext('RIG', box); vm.runInContext('registerDenRigs(RIG); registerHero3(RIG);', box); export const D = RIG.DEFS.hero3;
export const mul = (A, B) => [A[0]*B[0]+A[2]*B[1], A[1]*B[0]+A[3]*B[1], A[0]*B[2]+A[2]*B[3], A[1]*B[2]+A[3]*B[3], A[0]*B[4]+A[2]*B[5]+A[4], A[1]*B[4]+A[3]*B[5]+A[5]];
export const ap = (M, p) => [M[0]*p[0]+M[2]*p[1]+M[4], M[1]*p[0]+M[3]*p[1]+M[5]];
export const inv = M => { const d = M[0]*M[3]-M[1]*M[2]; return [M[3]/d, -M[1]/d, -M[2]/d, M[0]/d, (M[2]*M[5]-M[3]*M[4])/d, (M[1]*M[4]-M[0]*M[5])/d]; };
export function pose(t) { const M = { root: [1,0,0,1,0,0] }, s = {}; for (const j of D.joints) { const tr = D.tracks[j.track || j.id]; let r = 0, x = 0, y = 0;
  if (tr) { const ph = j.period ? (t / j.period) % 1 : (t + (j.ph || 0) + 1) % 1; RIG.sample(tr, ph, s); r = s.v; x = s.x; y = s.y; }
  const o = j.at || [0,0], a = r*Math.PI/180, c = Math.cos(a), n = Math.sin(a); M[j.id] = mul(M[j.in || 'root'], [c, n, -n, c, o[0]+x-(c*o[0]-n*o[1]), o[1]+y-(n*o[0]+c*o[1])]); } return M; }
export const part = id => D.parts.find(p => p.id === id);
export const world = (p, M) => p.skin ? RIG.skinPts(p, M[p.in || 'root'], M[p.skin.to]) : p.poly.map(q => ap(M[p.in || 'root'], q));
