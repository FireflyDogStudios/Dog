const {dingo, LOOKS} = require('./gen2.js');
LOOKS.scratchy = { label:"Scratchy ink gothic", bg:"#cdbf9f", ground:"#9a8a6a", base:"#b77b47", shade:"#7d4b25", light:"#cf9a66", buff:"#d8c9a4", buffS:"#b8a888", dark:"#2b1d14", line:"#2b1d14", lineW:3.2, mode:"hatch", jitter:2.4, eye:"#1a1210" };
LOOKS.smithyScratch = { label:"Smithy match + scratchy line", bg:"#e6d8b8", ground:"#c0a67c", base:"#c97a3a", shade:"#8f4f1f", light:"#e8a86a", buff:"#f1e1bf", buffS:"#d6bd92", dark:"#2e1c0c", line:"#2e1c0c", lineW:3.2, mode:"celhatch", jitter:1.4, eye:"#2a1a10" };
function svgFor(name, K, w, h){
  const S = LOOKS[name], p = dingo(S, K), id = name, sw = S.lineW;
  const F = S.jitter ? `filter="url(#rough-${id})"` : "";
  const defs = [];
  if (S.jitter) defs.push(`<filter id="rough-${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${S.jitter * 2}" xChannelSelector="R" yChannelSelector="G"/></filter>`);
  defs.push(`<pattern id="hatch-${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="6" stroke="${S.dark}" stroke-width="1.3" opacity=".55"/></pattern>`);
  defs.push(`<clipPath id="body-${id}"><path d="${p.torso}"/><path d="${p.head}"/><path d="${p.legFF}"/><path d="${p.legBF}"/><path d="${p.earL}"/><path d="${p.earR}"/></clipPath>`);
  defs.push(`<mask id="bm-${id}"><rect width="480" height="400" fill="#fff"/><path d="${p.torso}" fill="#000"/><path d="${p.head}" fill="#000"/></mask>`);
  if (S.glow) defs.push(`<radialGradient id="glow-${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${S.glow}" stop-opacity=".5"/><stop offset="1" stop-color="${S.glow}" stop-opacity="0"/></radialGradient><filter id="soft-${id}"><feGaussianBlur stdDeviation="2.5"/></filter>`);
  const line = `stroke="${S.line}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"`;
  const thin = `stroke="${S.line}" stroke-width="${Math.max(1, sw * .6)}" stroke-linejoin="round" stroke-linecap="round"`;
  const hatch = S.mode === "hatch" || S.mode === "celhatch" || S.mode === "cut";
  const shadeFill = hatch ? `url(#hatch-${id})` : S.shade, shadeOp = hatch ? 1 : S.mode === "paint" ? .75 : S.mode === "ink" ? .9 : .85;
  const part = (d, fill, ex) => `<path d="${d}" fill="${fill}" ${ex || line}/>`;
  let b = "";
  if (S.glow) b += `<ellipse cx="270" cy="220" rx="250" ry="190" fill="url(#glow-${id})"/>`;
  b += `<ellipse cx="${p.ground.cx}" cy="${p.ground.cy}" rx="${p.ground.rx}" ry="${p.ground.ry}" fill="${S.ground}"/>`;
  b += `<g ${F}>`;
  // far legs (shaded), tail
  b += part(p.legBB, S.shade) + part(p.pawBB, S.shade, thin) + part(p.legFB, S.shade) + part(p.pawFB, S.shade, thin);
  b += part(p.tail, S.base) + part(p.tailUnder, S.buff, `stroke="none"`);
  // torso, chest, near legs (fill first, outline masked so they grow out of the body)
  b += part(p.torso, S.base);
  b += part(p.chest, S.buff, `stroke="none"`);
  b += part(p.legBF, S.base, `stroke="none"`) + part(p.legFF, S.base, `stroke="none"`);
  b += `<g mask="url(#bm-${id})">` + part(p.legBF, "none") + part(p.legFF, "none") + `</g>`;
  b += part(p.pawBF, S.base, thin) + part(p.pawFF, S.base, thin);
  // ears + head
  b += part(p.earL, S.base) + part(p.earR, S.base);
  b += part(p.head, S.base);
  b += part(p.muzzle, S.buff, `stroke="none"`);
  b += part(p.earInL, S.buffS, `stroke="none"`) + part(p.earInR, S.buffS, `stroke="none"`);
  // cel shading clipped to the body
  if (S.mode !== "cut"){
    b += `<g clip-path="url(#body-${id})">`;
    b += `<path d="${p.shadeTorso}" fill="${shadeFill}" opacity="${shadeOp}"/><path d="${p.shadeNeck}" fill="${shadeFill}" opacity="${shadeOp * .8}"/><path d="${p.shadeHead}" fill="${shadeFill}" opacity="${shadeOp * .8}"/>`;
    if (S.mode === "cel" || S.mode === "paint" || S.mode === "celhatch") b += `<path d="${p.lightBack}" fill="${S.light}" opacity=".8"/>`;
    b += `</g>`;
  } else b += `<g clip-path="url(#body-${id})"><path d="${p.shadeTorso}" fill="${shadeFill}"/><path d="${p.shadeHead}" fill="${shadeFill}"/></g>`;
  // face
  b += part(p.eye, S.eye, `stroke="${S.dark}" stroke-width="1.2"`) + `<circle cx="${p.pupil.x}" cy="${p.pupil.y}" r="${p.pupil.r}" fill="${S.dark}"/>`;
  if (S.glow) b += `<path d="${p.eye}" fill="${S.eye}" opacity=".5" filter="url(#soft-${id})"/>`;
  else b += `<circle cx="${p.pupil.x + 1}" cy="${p.pupil.y - 1.5}" r="1" fill="#fff"/>`;
  b += `<path d="${p.brow}" fill="none" ${thin}/>`;
  b += part(p.nose, S.dark, `stroke="none"`) + `<path d="${p.mouth}" fill="none" ${thin}/>`;
  b += `</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 400" width="${w || 480}" height="${h || 400}"><defs>${defs.join("")}</defs>${b}</svg>`;
}
module.exports = {svgFor, LOOKS};
if (require.main === module){
  const fs = require('fs'); const names = Object.keys(LOOKS);
  let html = `<html><body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px">`;
  for (const n of names){ const S = LOOKS[n]; html += `<div style="background:${S.bg};padding:8px;font:13px sans-serif;color:${S.line}"><b>${S.label}</b>${svgFor(n, {}, 440, 366)}</div>`; }
  fs.writeFileSync('preview2.html', html + '</body></html>'); console.log('wrote', names.length);
}
