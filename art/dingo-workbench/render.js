// Builds the SVG for one style (string) — the same markup goes into the artboards.
const {dingo, STYLES} = require('./gen.js');
function svgFor(name, w, h){
  const {p, S} = dingo(name); const id = name; const sw = S.lineW;
  const F = S.jitter ? `filter="url(#rough-${id})"` : "";
  const defs = [];
  if (S.jitter) defs.push(`<filter id="rough-${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${S.jitter * 2}" xChannelSelector="R" yChannelSelector="G"/></filter>`);
  defs.push(`<linearGradient id="coat-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${S.base}"/><stop offset="1" stop-color="${S.baseDark}"/></linearGradient>`);
  defs.push(`<pattern id="hatch-${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="6" stroke="${S.dark}" stroke-width="1.3" opacity=".55"/></pattern>`);
  defs.push(`<pattern id="dots-${id}" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.4" fill="${S.dark}" opacity=".35"/></pattern>`);
  defs.push(`<radialGradient id="glow-${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${S.glow || '#fff'}" stop-opacity=".55"/><stop offset="1" stop-color="${S.glow || '#fff'}" stop-opacity="0"/></radialGradient>`);
  defs.push(`<filter id="soft-${id}"><feGaussianBlur stdDeviation="2.5"/></filter>`);
  defs.push(`<filter id="grain-${id}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="3"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .18"/></feComponentTransfer></filter>`);
  const paint = S.shade === "paint" || S.shade === "paintink" || S.shade === "wash" || S.shade === "pulp";
  const coat = paint ? `url(#coat-${id})` : S.base;
  const line = `stroke="${S.line}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"`;
  const lineThin = `stroke="${S.line}" stroke-width="${Math.max(1, sw * 0.6)}" stroke-linejoin="round" stroke-linecap="round"`;
  const shadeFill = S.shade === "hatch" || S.shade === "hatchflat" ? `url(#hatch-${id})` : S.shade === "cut" ? `url(#hatch-${id})` : S.shade === "pulp" || S.shade === "poster" ? `url(#dots-${id})` : S.dark;
  const shadeOp = S.shade === "flat" ? .18 : S.shade === "paint" || S.shade === "wash" ? .22 : S.shade === "ink" ? .5 : .9;
  const part = (d, fill, extra) => `<path d="${d}" fill="${fill}" ${extra || line}/>`;
  const far = (d) => `<path d="${d}" fill="${S.baseDark}" ${line}/>`;
  let body = "";
  // ground + glow
  if (S.glow) body += `<ellipse cx="${p.ground.x + 230}" cy="${p.ground.y - 120}" rx="260" ry="200" fill="url(#glow-${id})"/>`;
  body += `<ellipse cx="${p.ground.x + 230}" cy="${p.ground.y}" rx="${p.ground.rx}" ry="${p.ground.ry}" fill="${S.ground}"/>`;
  body += `<g ${F}>`;
  body += far(p.legBB) + far(p.legFB);
  body += part(p.tail, coat); body += part(p.tailTip, S.belly, lineThin);
  body += part(p.neck, coat, `stroke="none"`);
  body += part(p.body, coat);
  body += part(p.chest, S.belly, lineThin);
  body += `<path d="${p.shadeBody}" fill="${shadeFill}" opacity="${shadeOp}" stroke="none"/>`;
  if (paint) body += `<path d="${p.highlight}" fill="none" stroke="${S.belly}" stroke-width="${sw * 1.6}" opacity=".35" stroke-linecap="round"/>`;
  body += part(p.legBF, coat) + part(p.legFF, coat);
  body += part(p.earL, coat) + part(p.earR, coat);
  body += part(p.head, coat);
  body += part(p.mask, S.belly, `stroke="none"`);
  body += `<path d="${p.shadeHead}" fill="${shadeFill}" opacity="${shadeOp * .8}" stroke="none"/>`;
  body += `<path d="${p.earInL}" fill="${S.belly}" opacity=".9" stroke="none"/><path d="${p.earInR}" fill="${S.belly}" opacity=".9" stroke="none"/>`;
  body += `<circle cx="${p.eye.x}" cy="${p.eye.y}" r="${p.eye.r}" fill="${S.eye}"/>`;
  if (S.glow) body += `<circle cx="${p.eye.x}" cy="${p.eye.y}" r="${p.eye.r * 2.6}" fill="${S.eye}" opacity=".25" filter="url(#soft-${id})"/>`;
  else body += `<circle cx="${p.eye.x + p.eye.r * .35}" cy="${p.eye.y - p.eye.r * .35}" r="${p.eye.r * .35}" fill="#fff"/>`;
  body += `<circle cx="${p.nose.x}" cy="${p.nose.y}" r="${p.nose.r}" fill="${S.dark}"/>`;
  body += `<path d="${p.mouth}" fill="none" ${lineThin}/>`;
  body += `</g>`;
  if (S.shade === "wash" || S.shade === "pulp" || S.shade === "hatch") body += `<rect x="0" y="0" width="480" height="400" filter="url(#grain-${id})" opacity=".6" style="mix-blend-mode:multiply"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 400" width="${w || 480}" height="${h || 400}"><defs>${defs.join("")}</defs>${body}</svg>`;
}
module.exports = {svgFor, STYLES};
if (require.main === module){
  const fs = require('fs'); const names = Object.keys(STYLES);
  let html = `<html><body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:8px">`;
  for (const n of names){ const S = STYLES[n]; html += `<div style="background:${S.bg};padding:8px;font:13px sans-serif;color:${S.line}"><b>${S.label}</b>${svgFor(n, 360, 300)}</div>`; }
  fs.writeFileSync('preview.html', html + '</body></html>'); console.log('wrote preview.html', names.length);
}
