// Build the Gait Tracker: inline the measured dog walk curves (Catavitello 2015) and hero3's own joint curves, so the page can compare a
// tracked clip against both. node apps/gait-tracker/build.mjs  → apps/gait-tracker/index.html
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { execSync } from 'node:child_process'; import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '../..');
const box = { console, Math }; vm.createContext(box);
for (const f of ['rig.js', 'rig_den.js', 'hero3.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'engine', f), 'utf8'), box);
const RIG = vm.runInContext('RIG', box); vm.runInContext('registerDenRigs(RIG); registerHero3(RIG);', box); const D = RIG.DEFS.hero3;
const mul = (A, B) => [A[0]*B[0]+A[2]*B[1], A[1]*B[0]+A[3]*B[1], A[0]*B[2]+A[2]*B[3], A[1]*B[2]+A[3]*B[3], A[0]*B[4]+A[2]*B[5]+A[4], A[1]*B[4]+A[3]*B[5]+A[5]];
const apply = (M, p) => [M[0]*p[0]+M[2]*p[1]+M[4], M[1]*p[0]+M[3]*p[1]+M[5]];
function pose(phase) { const M = { root: [1, 0, 0, 1, 0, 0] }, s = {}; for (const j of D.joints) { const tr = D.tracks[j.track || j.id]; let rot = 0, x = 0, y = 0;
  if (tr) { RIG.sample(tr, (phase + (j.ph || 0)) % 1, s); rot = s.v; x = s.x; y = s.y; }
  const o = j.at || [0, 0], r = rot * Math.PI / 180, c = Math.cos(r), n = Math.sin(r); M[j.id] = mul(M[j.in || 'root'], [c, n, -n, c, o[0] + x - (c*o[0] - n*o[1]), o[1] + y - (n*o[0] + c*o[1])]); } return M; }
const J = Object.fromEntries(D.joints.map(j => [j.id, j])), P = (M, id) => apply(M[id], J[id].at);
/* the same signed joint angle the page uses: 180 = straight, below = bent the normal way, above = past straight (facing right, y down) */
const FLEX = { shoulder: 1, elbow: -1, carpus: 1, hip: -1, stifle: 1, tarsus: -1 };
const jointAngle = (k, a, b, c) => { const cr = (c[0]-a[0])*(b[1]-a[1]) - (c[1]-a[1])*(b[0]-a[0]), v1 = [a[0]-b[0], a[1]-b[1]], v2 = [c[0]-b[0], c[1]-b[1]];
  const inc = Math.acos(Math.max(-1, Math.min(1, (v1[0]*v2[0] + v1[1]*v2[1]) / Math.hypot(...v1) / Math.hypot(...v2)))) * 180 / Math.PI; return 180 - FLEX[k] * Math.sign(-cr) * (180 - inc); };
const sc = D.landmarks.scapTop, offH = J.hipN.ph || 0, offF = J.shN.ph || 0, W = { stifle: [], tarsus: [], shoulder: [], elbow: [], carpus: [] };
for (let f = 0; f <= 100; f++) { const u = f / 100, Mh = pose(((u - offH + 2) % 1)), Mf = pose(((u - offF + 2) % 1)); /* 0 = that leg's touchdown */
  W.stifle.push(jointAngle('stifle', P(Mh, 'hipN'), P(Mh, 'shankN'), P(Mh, 'metaN'))); W.tarsus.push(jointAngle('tarsus', P(Mh, 'shankN'), P(Mh, 'metaN'), P(Mh, 'htoeN')));
  W.shoulder.push(jointAngle('shoulder', apply(Mf[sc.in], sc.at), P(Mf, 'shN'), P(Mf, 'foreN'))); W.elbow.push(jointAngle('elbow', P(Mf, 'shN'), P(Mf, 'foreN'), P(Mf, 'pastN')));
  W.carpus.push(jointAngle('carpus', P(Mf, 'foreN'), P(Mf, 'pastN'), P(Mf, 'ftoeN'))); }
for (const k in W) W[k] = W[k].map(v => +v.toFixed(1));
const ref = {}; for (const line of fs.readFileSync(path.join(ROOT, 'ref/research/fetched/04-gait-curves/curves.csv'), 'utf8').split('\n').slice(1)) { const c = line.split(','); if (c[0] === 'catavitello2015_retrievers' && c[1] === 'walk') (ref[c[2]] ||= [])[+c[3]] = +(+c[4]).toFixed(1); }
const commit = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(), date = new Date().toISOString().slice(0, 10);
let html = fs.readFileSync(path.join(HERE, 'template.html'), 'utf8');
html = html.replace('/*BUILD*/', () => JSON.stringify({ commit, date })).replace('/*GAITREF*/', () => JSON.stringify(ref)).replace('/*WOLF*/', () => JSON.stringify(W));
fs.writeFileSync(path.join(HERE, 'index.html'), html);
console.log('wrote apps/gait-tracker/index.html', (html.length / 1024).toFixed(0) + ' KB', commit, 'wolf carpus', Math.min(...W.carpus), '-', Math.max(...W.carpus));
