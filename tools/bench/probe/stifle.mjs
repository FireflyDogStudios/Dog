// node tools/bench/probe/stifle.mjs : the near stifle and tarsus angles (180 = straight) and the hip height through the walk
import { D, pose, ap } from './pose.mjs';
const J = Object.fromEntries(D.joints.map(j => [j.id, j])), P = (M, id) => ap(M[id], J[id].at);
const ang = (a, b, c) => { const v1 = [a[0]-b[0], a[1]-b[1]], v2 = [c[0]-b[0], c[1]-b[1]]; return Math.acos((v1[0]*v2[0]+v1[1]*v2[1]) / Math.hypot(...v1) / Math.hypot(...v2)) * 180 / Math.PI; };
const rows = []; for (let i = 0; i < 48; i++) { const t = i / 48, M = pose(t); rows.push([t, ang(P(M, 'hipN'), P(M, 'shankN'), P(M, 'metaN')), ang(P(M, 'shankN'), P(M, 'metaN'), P(M, 'htoeN')), P(M, 'hipN')[1]]); }
console.log(rows.map(r => `${(r[0]*100).toFixed(0).padStart(3)}% stifle ${r[1].toFixed(0).padStart(4)} tarsus ${r[2].toFixed(0).padStart(4)} hipY ${r[3].toFixed(2)}`).join('\n'));
