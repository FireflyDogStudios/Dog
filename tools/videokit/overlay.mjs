// Draw hero3 (outline + skeleton) over each fox frame: scaled to the fox's standing back height, ground-matched, phase-synced to the near front touchdown.
import fs from 'node:fs'; import vm from 'node:vm'; import sharp from 'sharp';
const [ENG, DATA, BODY, OUT] = process.argv.slice(2); fs.mkdirSync(OUT, { recursive: true });
const box = { console, Math }; vm.createContext(box);
for (const f of ['rig.js', 'rig_den.js', 'hero3.js']) vm.runInContext(fs.readFileSync(ENG + '/' + f, 'utf8'), box);
const RIG = vm.runInContext('RIG', box); vm.runInContext('registerDenRigs(RIG); registerHero3(RIG);', box); const D = RIG.DEFS.hero3;
const mul = (A, B) => [A[0]*B[0]+A[2]*B[1], A[1]*B[0]+A[3]*B[1], A[0]*B[2]+A[2]*B[3], A[1]*B[2]+A[3]*B[3], A[0]*B[4]+A[2]*B[5]+A[4], A[1]*B[4]+A[3]*B[5]+A[5]], ap = (M, p) => [M[0]*p[0]+M[2]*p[1]+M[4], M[1]*p[0]+M[3]*p[1]+M[5]];
function pose(t, walking) { const ph0 = walking ? (t / D.stride) % 1 : 0, M = { root: [1,0,0,1,0,0] }, s = {};
  for (const j of D.joints) { const tr = D.tracks[j.track || j.id]; let r = 0, x = 0, y = 0; if (tr && (walking || j.always)) { const ph = j.period ? ((t / j.period) % 1) : (ph0 + (j.ph || 0)) % 1; RIG.sample(tr, ph, s); r = s.v; x = s.x; y = s.y; }
    const o = j.at || [0, 0], a = r * Math.PI / 180, c = Math.cos(a), n = Math.sin(a); M[j.id] = mul(M[j.in || 'root'], [c, n, -n, c, o[0]+x-(c*o[0]-n*o[1]), o[1]+y-(n*o[0]+c*o[1])]); } return M; }
const R = JSON.parse(fs.readFileSync(DATA)), BD = JSON.parse(fs.readFileSync(BODY)), WHpx = BD.WH_px, s = WHpx / 24.5, GROUND = 35.55;
const J = Object.fromEntries(D.joints.map(j => [j.id, j])), P = (M, id) => ap(M[id], J[id].at);
const shape = (p, M) => { const tf = `transform="matrix(${M.join(' ')})"`; if (p.d) return `<path d="${p.d}" ${tf}/>`; if (p.poly) return `<polygon points="${p.poly.map(q => q.join(',')).join(' ')}" ${tf}/>`; if (p.circle) return `<circle cx="${p.circle[0]}" cy="${p.circle[1]}" r="${p.circle[2]}" ${tf}/>`; if (p.ellipse) return `<ellipse cx="${p.ellipse[0]}" cy="${p.ellipse[1]}" rx="${p.ellipse[2]}" ry="${p.ellipse[3]}" ${tf}/>`; return ''; };
// sync: the fox's near front paw lands at frame 15; hero3's near front (ph .5 - limb phase) touches down at global phase 1 - (.5 - LP)
const LP = D.gait.limbPhase, phTD = (1 - (.5 - LP)) % 1, STRIDE_F = 21, F0 = 15;
const M0 = pose(phTD * D.stride, true), pawTD = P(M0, 'ftoeN');   // hero3's near front paw at its touchdown
const foxTD = [289, R[F0].paws.reduce((m, p) => Math.max(m, p.y), 0)];
for (const r of R) { const f = r.f, walking = f < 50, t = walking ? (phTD + (f - F0) / STRIDE_F) * D.stride : 0, M = pose(((t % D.stride) + D.stride) % D.stride, walking);
  const g = r.paws.reduce((m, p) => Math.max(m, p.y), 0) || r.ground, ox = foxTD[0] - pawTD[0] * s + (r.nose[0] - R[F0].nose[0]), oy = g - GROUND * s;
  const tf = `translate(${ox.toFixed(2)},${oy.toFixed(2)}) scale(${s.toFixed(4)})`;
  let parts = ''; for (const p of D.parts) if (!p.hidden && !/F$/.test(p.in || '')) parts += shape(p, M[p.in || 'root']);
  let bones = ''; for (const c of [['hipN','shankN','metaN','htoeN'], ['shN','foreN','pastN','ftoeN']]) { const pts = c.map(id => P(M, id)); bones += `<polyline points="${pts.map(q => q.join(',')).join(' ')}" fill="none" stroke="#ffe600" stroke-width="${2.2 / s}"/>` + pts.map(q => `<circle cx="${q[0]}" cy="${q[1]}" r="${3 / s}" fill="#ffe600"/>`).join(''); }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270"><g transform="${tf}"><g fill="none" stroke="#00e5ff" stroke-width="${1.6 / s}" stroke-linejoin="round">${parts}</g>${bones}</g></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(`${OUT}/ov${String(f).padStart(3, '0')}.png`); }
console.log('overlays', R.length, 'scale px/unit', s.toFixed(2));
