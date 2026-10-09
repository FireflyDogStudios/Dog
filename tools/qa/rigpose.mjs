// Shared pose helper for the QA tools: load the real engines (rig.js, rig_den.js, hero3.js, hero5.js) and pose any rig by id.
// import { load } from './rigpose.mjs'; const R = load('hero5'); R.pose(t, walking) → matrices; R.world(part, M) → points; R.order() → draw order.
import fs from 'node:fs'; import vm from 'node:vm';
export function load(id) {
  const box = { console, Math }; vm.createContext(box);
  for (const f of ['rig.js', 'rig_den.js', 'hero3.js', 'hero5.js']) { const p = new URL('../../engine/' + f, import.meta.url); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), box); }
  vm.runInContext('registerDenRigs(RIG); registerHero3(RIG); if (typeof registerHero5 === "function") registerHero5(RIG);', box);
  const RIG = vm.runInContext('RIG', box), D = RIG.DEFS[id]; if (!D) throw new Error('no rig ' + id);
  const mul = (A, B) => [A[0]*B[0]+A[2]*B[1], A[1]*B[0]+A[3]*B[1], A[0]*B[2]+A[2]*B[3], A[1]*B[2]+A[3]*B[3], A[0]*B[4]+A[2]*B[5]+A[4], A[1]*B[4]+A[3]*B[5]+A[5]];
  const ap = (M, p) => [M[0]*p[0]+M[2]*p[1]+M[4], M[1]*p[0]+M[3]*p[1]+M[5]];
  const pose = (t, walking = true) => { const M = { root: [1,0,0,1,0,0] }, s = {}; for (const j of D.joints) { const tr = D.tracks[j.track || j.id]; let r = 0, x = 0, y = 0;
    if (tr && walking) { RIG.sample(tr, (((t + (j.ph || 0)) % 1) + 1) % 1, s); r = s.v || 0; x = s.x || 0; y = s.y || 0; }
    const o = j.at || [0,0], a = r*Math.PI/180, c = Math.cos(a), n = Math.sin(a); M[j.id] = mul(M[j.in || 'root'], [c, n, -n, c, o[0]+x-(c*o[0]-n*o[1]), o[1]+y-(n*o[0]+c*o[1])]); } return M; };
  const world = (p, M) => p.skin ? RIG.skinPts(p, M[p.in || 'root'], M[p.skin.to]) : p.poly ? p.poly.map(q => ap(M[p.in || 'root'], q)) : null;
  const order = () => { const kids = {}; D.joints.forEach(j => (kids[j.in || 'root'] ||= []).push(j.id)); const anim = new Set(D.joints.filter(j => j.track || D.tracks[j.id]).map(j => j.id)), O = [];
    (function w(jid) { const P = D.parts.filter(p => (p.in || 'root') === jid), K = kids[jid] || []; if (anim.has(jid)) { O.push(...P); K.forEach(w); } else { K.forEach(w); O.push(...P); } })('root'); return O; };
  const far = {}; D.joints.forEach(j => { far[j.id] = !!j.far || far[j.in || 'root']; }); const isFar = p => !!far[p.in || 'root'];
  const dim = (c, k) => '#' + [1, 3, 5].map(i => Math.round(parseInt(c.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('');
  const colour = p => { const c = D.palette[p.paint || 'fur'] || D.palette.fur; return isFar(p) ? dim(c, D.palette.far ?? .78) : c; };
  /* an SVG of the rig in a view [x, y, w, h]; fill(p) overrides colours (e.g. one id colour per part); parts with a d path are drawn too */
  const svg = (M, view, { fill, bg = '#ff00ff', px = 40 } = {}) => { let s = ''; for (const p of order()) { if (p.hidden) continue; const f = fill ? fill(p) : colour(p);
    if (p.d) s += `<path d="${p.d}" fill="${f}" transform="matrix(${M[p.in || 'root'].join(' ')})"/>`; else { const w = world(p, M); if (w) s += `<polygon points="${w.map(q => q[0].toFixed(4) + ',' + q[1].toFixed(4)).join(' ')}" fill="${f}"/>`; } }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view.join(' ')}" width="${Math.round(view[2] * px)}" height="${Math.round(view[3] * px)}"><rect x="${view[0]}" y="${view[1]}" width="${view[2]}" height="${view[3]}" fill="${bg}"/>${s}</svg>`; };
  /* the rig's bounding box over a standing pose and a stride */
  const bounds = () => { let b = [1e9, 1e9, -1e9, -1e9]; for (const [t, w] of [[0, false], ...[0, .25, .5, .75].map(t => [t, true])]) { const M = pose(t, w); for (const p of D.parts) { if (p.hidden) continue; const W = world(p, M); if (W) for (const q of W) { b = [Math.min(b[0], q[0]), Math.min(b[1], q[1]), Math.max(b[2], q[0]), Math.max(b[3], q[1])]; } } } return b; };
  return { RIG, D, pose, world, order, isFar, colour, svg, bounds, ap };
}
