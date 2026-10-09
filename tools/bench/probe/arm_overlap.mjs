// node tools/bench/probe/arm_overlap.mjs
// How far does the near upper arm (shN) reach over the pale throat and forechest, and past the chest front, through the walk?
import pc from 'polygon-clipping'; import { D, pose, part, world } from './pose.mjs';
const area = mp => mp.reduce((s, poly) => s + poly.reduce((t, ring, k) => { let a = 0; for (let i = 0; i < ring.length - 1; i++) a += ring[i][0]*ring[i+1][1] - ring[i+1][0]*ring[i][1]; return t + (k ? -1 : 1) * Math.abs(a) / 2; }, 0), 0);
const ring = P => [[...P, P[0]]];
export function forbidden(M) { const pale = ['chestFrontPale', 'throat'].map(id => ring(world(part(id), M)));
  const sweep = []; for (const P of pale) for (let dx = 0; dx <= 8; dx += .25) sweep.push([P[0].map(q => [q[0] + dx, q[1]])]); return pc.union(...pale, ...sweep); }
export const arm = D.parts.find(p => p.in === 'shN');
if ((process.argv[1] || '').endsWith('arm_overlap.mjs')) { let worst = 0;
  for (let i = 0; i < 48; i++) { const t = i / 48, M = pose(t), A = ring(world(arm, M)), o = area(pc.intersection(A, forbidden(M), [[[0,0],[80,0],[80,21],[0,21],[0,0]]])) /* the throat and upper forechest only: below y 21 the reaching leg may cross the brisket */; worst = Math.max(worst, o);
    if (o > .005) console.log((t*100).toFixed(1).padStart(5) + '%  arm over the pale/front: ' + o.toFixed(3) + ' sq'); }
  console.log('worst', worst.toFixed(3)); }
