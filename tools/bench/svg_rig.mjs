// Export a Den rig's rest pose as a true-vector SVG (no Pixi tessellation), in rig.js draw order, far parts dimmed.
// usage: node tools/bench/svg_rig.mjs <rigId> <out.svg> [x0 y0 x1 y1] [bg #hex] [px per unit]
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ENG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../engine');
const [id = 'hero3', out = 'rig.svg', x0 = 0, y0 = -2, x1 = 62, y1 = 38, bg = '#000000', ppu = 16] = process.argv.slice(2);
import vm from 'vm';
const box = { console, Math }; vm.createContext(box); for (const f of ['rig.js', 'rig_den.js', 'hero3.js']) vm.runInContext(fs.readFileSync(path.join(ENG, f), 'utf8'), box, { filename: f });
const RIG = vm.runInContext('RIG', box); vm.runInContext('registerDenRigs(RIG); registerHero3(RIG);', box); const DEFS = RIG.DEFS; /* the real engine (the walk baker samples tracks) */
const D = DEFS[id]; if (!D) throw new Error('unknown rig ' + id);
const dim = (c, k) => { const n = parseInt(c.slice(1), 16); const f = s => Math.round(((n >> s) & 255) * k).toString(16).padStart(2, '0'); return '#' + f(16) + f(8) + f(0); };
const kids = {}, far = {root:false}; D.joints.forEach(j => { (kids[j.in || 'root'] ||= []).push(j.id); far[j.id] = !!j.far || far[j.in || 'root']; });
const animated = new Set(D.joints.filter(j => j.track || D.tracks[j.id]).map(j => j.id));
const partsOf = jid => D.parts.filter(p => (p.in || 'root') === jid);
const order = []; const walk = jid => { const P = partsOf(jid), K = kids[jid] || [];
  if (animated.has(jid)){ P.forEach(p => order.push([p, far[jid]])); K.forEach(walk); } else { K.forEach(walk); P.forEach(p => order.push([p, far[jid]])); } };
walk('root');
const pal = D.palette, el = [];
for (const [p, isFar] of order){ if (p.hidden) continue; let col = pal[p.paint || 'fur'] ?? pal.fur; if (isFar) col = dim(col, pal.far ?? .78);
  const a = p.alpha != null ? ` fill-opacity="${p.alpha}"` : '';
  if (p.d && p.stroke) el.push(`<path d="${p.d}" fill="none" stroke="${col}" stroke-width="${p.sw}" stroke-linecap="round" stroke-linejoin="round"${a.replace('fill-', 'stroke-')}/>`);
  else if (p.d) el.push(`<path d="${p.d}" fill="${col}"${a}/>`);
  else if (p.poly) el.push(`<polygon points="${p.poly.map(q => q.join(',')).join(' ')}" fill="${col}"${a}/>`);
  else if (p.circle) el.push(`<circle cx="${p.circle[0]}" cy="${p.circle[1]}" r="${p.circle[2]}" fill="${col}"${a}/>`);
  else if (p.ellipse) el.push(`<ellipse cx="${p.ellipse[0]}" cy="${p.ellipse[1]}" rx="${p.ellipse[2]}" ry="${p.ellipse[3]}" fill="${col}"${a}/>`);
  else if (p.line) el.push(`<line x1="${p.line[0][0]}" y1="${p.line[0][1]}" x2="${p.line[1][0]}" y2="${p.line[1][1]}" stroke="${col}" stroke-width="${p.sw}" stroke-linecap="round"${a.replace('fill-', 'stroke-')}/>`); }
const w = (x1 - x0) * ppu, h = (y1 - y0) * ppu;
fs.writeFileSync(out, `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${x0} ${y0} ${x1 - x0} ${y1 - y0}"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="${bg}"/>${el.join('')}</svg>\n`);
console.log('wrote', out, el.length, 'shapes');
