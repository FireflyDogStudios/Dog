// Parametric dingo: points → smooth paths, per-style proportions and paint.
function spline(pts, closed, tension){ // Catmull-Rom → cubic bezier path string
  tension = tension == null ? 1 : tension; const n = pts.length; if (n < 2) return "";
  const P = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  let d = "M" + P(0)[0].toFixed(1) + " " + P(0)[1].toFixed(1);
  const m = closed ? n : n - 1;
  for (let i = 0; i < m; i++){ const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6 * tension, p1[1] + (p2[1] - p0[1]) / 6 * tension];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6 * tension, p2[1] - (p3[1] - p1[1]) / 6 * tension];
    d += " C" + [c1[0], c1[1], c2[0], c2[1], p2[0], p2[1]].map(v => v.toFixed(1)).join(" "); }
  return closed ? d + " Z" : d;
}
function sc(pts, cx, cy, kx, ky){ return pts.map(([x, y]) => [cx + (x - cx) * kx, cy + (y - cy) * (ky == null ? kx : ky)]); }
function tr(pts, dx, dy){ return pts.map(([x, y]) => [x + dx, y + dy]); }

const STYLES = {
  storybook:{ head:1.0, ear:1.0, body:1.0, legW:1.0, legL:1.0, tail:1.0, snout:1.0,
    bg:"#f3e7cf", ground:"#d9c39a", base:"#d9823c", baseDark:"#b25f24", belly:"#f6e8cc", dark:"#5a2f17", line:"#5a2f17", lineW:2.2, jitter:0, shade:"paint", eye:"#2a1a10", glow:null, label:"Vector-painted storybook", note:"Soft layered shapes, warm paper, gentle shading. Fits the Field Kit UI." },
  scratchy:{ head:1.22, ear:1.3, body:0.9, legW:0.55, legL:1.05, tail:0.85, snout:1.1,
    bg:"#cdbf9f", ground:"#9a8a6a", base:"#b77b47", baseDark:"#7d4b25", belly:"#d8c9a4", dark:"#2b1d14", line:"#2b1d14", lineW:3.2, jitter:2.4, shade:"hatch", eye:"#1a1210", glow:null, label:"Scratchy ink gothic", note:"Wobbly hand-inked lines, hatching, big head on thin legs, faded colours. The survival-cartoon mood." },
  clay:{ head:1.3, ear:1.1, body:1.18, legW:1.5, legL:0.82, tail:1.15, snout:0.9,
    bg:"#e9ecef", ground:"#b9c2c9", base:"#e8924a", baseDark:"#c76f2e", belly:"#fbefd8", dark:"#3b2a22", line:"#3b2a22", lineW:5, jitter:0, shade:"flat", eye:"#22181a", glow:null, label:"Chunky flat cartoon", note:"Thick even outline, flat fills, round chunky body, big readable face. The colony-sim look." },
  ink:{ head:0.95, ear:1.3, body:0.92, legW:0.75, legL:1.15, tail:1.05, snout:1.05,
    bg:"#0f1418", ground:"#1c242b", base:"#8a4a28", baseDark:"#4c2614", belly:"#e9dcc0", dark:"#0a0d10", line:"#0a0d10", lineW:1.6, jitter:0.6, shade:"ink", eye:"#f2e6c8", glow:"#d9a441", label:"Ink and shadow", note:"Dark world, pale mask and eyes, slender elegant lines, a soft lantern glow. The hand-inked metroidvania mood." },
  trio:{ head:1.15, ear:1.25, body:1.0, legW:0.9, legL:1.0, tail:1.0, snout:1.0,
    bg:"#2a2622", ground:"#4a3f34", base:"#c9803f", baseDark:"#8a4f22", belly:"#efe0c0", dark:"#1a120d", line:"#1a120d", lineW:3.4, jitter:1.2, shade:"hatchflat", eye:"#f0e4c6", glow:"#c9803f", label:"Blend: your three", note:"Scratchy outline and hatching, chunky readable shapes, dark moody ground with pale eyes." },
  all:{ head:1.1, ear:1.2, body:1.02, legW:0.95, legL:1.02, tail:1.0, snout:1.0,
    bg:"#1f2a24", ground:"#3b4a3a", base:"#d4843e", baseDark:"#9a5a26", belly:"#f3e5c7", dark:"#2a1a10", line:"#2a1a10", lineW:2.8, jitter:0.9, shade:"paintink", eye:"#f3e5c7", glow:"#e2b35a", label:"Blend: all four", note:"Painted storybook shading, a slightly scratchy line, chunky silhouette, moody forest light." },
  woodcut:{ head:1.05, ear:1.15, body:1.0, legW:0.9, legL:1.0, tail:1.0, snout:1.0,
    bg:"#efe3c6", ground:"#c9a56a", base:"#c8742f", baseDark:"#7a3f14", belly:"#efe3c6", dark:"#2b1a10", line:"#2b1a10", lineW:4, jitter:0.5, shade:"cut", eye:"#efe3c6", glow:null, label:"Woodcut print", note:"Two or three inks, carved-looking lines, bold shapes. Field-guide and folk-tale feel." },
  retro:{ head:1.08, ear:1.15, body:1.0, legW:0.85, legL:1.08, tail:1.0, snout:1.0,
    bg:"#d9d2b6", ground:"#8f9a7a", base:"#d6793a", baseDark:"#9a4f1e", belly:"#efe3c4", dark:"#2d2622", line:"#2d2622", lineW:3, jitter:0.3, shade:"poster", eye:"#2d2622", glow:null, label:"Retro sixties poster", note:"Posterised shading, mustard and mint, bold confident line, a touch of stylised uncanny. Mid-century propaganda-poster mood." },
  pulp:{ head:1.05, ear:1.2, body:1.04, legW:0.9, legL:1.1, tail:1.05, snout:1.0,
    bg:"#1d2a33", ground:"#3b4f55", base:"#e4863b", baseDark:"#8f4518", belly:"#f6e4c0", dark:"#1a110c", line:"#1a110c", lineW:2.4, jitter:0.4, shade:"pulp", eye:"#f6e4c0", glow:"#f2b24a", label:"Pulp sci-fi poster", note:"Warm orange against teal, dramatic rim light, halftone grain, deco sunburst. Retro-futurist frontier mood." },
  fieldguide:{ head:1.0, ear:1.05, body:1.0, legW:0.9, legL:1.05, tail:1.0, snout:1.05,
    bg:"#f7f1e3", ground:"#e4d7bb", base:"#e0924f", baseDark:"#b86a2c", belly:"#fbf4e4", dark:"#4a3a2c", line:"#4a3a2c", lineW:1.4, jitter:1.0, shade:"wash", eye:"#2a1f16", glow:null, label:"Naturalist watercolour", note:"Pencil line with loose watercolour wash, soft edges. Reads like the Field Kit's own sketchbook." }
};

function dingo(name){
  const S = STYLES[name] || STYLES.storybook, p = {};
  // body + neck as one silhouette (facing right, head up, chest forward = heroic stance)
  const bc = [245, 215];
  let body = [[160,186],[210,172],[290,160],[322,136],[344,118],[346,150],[338,176],[342,214],[332,250],[282,264],[222,260],[186,250],[156,230],[148,206]];
  body = sc(body, bc[0], bc[1], 1, S.body);
  p.body = spline(body, true, 0.95);
  // head
  const hc = [378, 128], k = S.head, sn = S.snout;
  let head = [[336,112],[352,92],[378,88],[400,104],[418,124],[432,138],[428,154],[408,166],[376,170],[352,166],[336,150],[328,130]];
  head = head.map(([x,y]) => [hc[0] + (x - hc[0]) * k * (x > 400 ? sn : 1), hc[1] + (y - hc[1]) * k]);
  p.head = spline(head, true, 0.95);
  // ears: tall, upright
  const e = S.ear * k;
  const earOf = (bx, by, lean) => spline([[bx-13*k, by+6*k],[bx-8*k, by-26*e],[bx+lean*k, by-54*e],[bx+14*k, by-20*e],[bx+15*k, by+8*k]], true, 0.85);
  const earIn = (bx, by, lean) => spline([[bx-5*k, by+2*k],[bx-2*k, by-20*e],[bx+lean*k, by-40*e],[bx+9*k, by-16*e],[bx+9*k, by+2*k]], true, 0.85);
  const E1 = [hc[0] - 26*k, hc[1] - 28*k], E2 = [hc[0] + 2*k, hc[1] - 34*k];
  p.earL = earOf(E1[0], E1[1], 2); p.earR = earOf(E2[0], E2[1], 4); p.earInL = earIn(E1[0], E1[1], 2); p.earInR = earIn(E2[0], E2[1], 4);
  // legs
  const W = 13 * S.legW, L = S.legL;
  const front = (tx, ty, lean) => { const py = ty + 142*L; return spline([[tx-W*1.1, ty],[tx-W*0.9+lean, ty+70*L],[tx-W*0.8+lean, py-10],[tx-W*1.1+lean, py+2],[tx+W*1.4+lean, py+4],[tx+W*0.9+lean, py-12],[tx+W*0.8+lean, ty+70*L],[tx+W*1.1, ty]], true, 0.7); };
  const back = (tx, ty, lean) => { const py = ty + 145*L; return spline([[tx-W*1.6, ty],[tx-W*1.5-8+lean, ty+50*L],[tx-W*1.1-14+lean, ty+90*L],[tx-W*0.8-4+lean, py-8],[tx-W*1.1+lean, py+3],[tx+W*1.4+lean, py+4],[tx+W*0.9+lean, py-10],[tx+W*0.9-6+lean, ty+92*L],[tx+W*1.3+lean, ty+50*L],[tx+W*1.6, ty]], true, 0.7); };
  p.legFF = front(302, 206, 4); p.legFB = front(284, 204, -6);
  p.legBF = back(182, 204, 2); p.legBB = back(166, 202, -8);
  // tail: a raised bushy plume from the rump
  const t = S.tail, tail = [[166,190],[138,180],[112,160],[98,132],[104,104],[122,94],[136,110],[130,140],[142,160],[160,174],[172,200]];
  p.tail = spline(sc(tail, 166, 192, t), true);
  p.tailTip = spline(sc([[104,124],[106,104],[122,96],[134,110],[130,136],[116,144],[104,136]], 166, 192, t), true);
  // cream chest/belly and face mask
  p.chest = spline([[334,184],[342,222],[332,256],[282,268],[224,264],[204,250],[244,236],[300,230],[324,206]], true);
  p.mask = spline([[hc[0]+22*k, hc[1]-14*k],[hc[0]+44*k*sn, hc[1]],[hc[0]+52*k*sn, hc[1]+16*k],[hc[0]+40*k*sn, hc[1]+34*k],[hc[0]+12*k, hc[1]+42*k],[hc[0]-22*k, hc[1]+38*k],[hc[0]-30*k, hc[1]+18*k],[hc[0]-4*k, hc[1]+6*k]], true);
  // face
  p.eye = {x: hc[0] + 14*k, y: hc[1] - 4*k, r: 4.6*k}; p.nose = {x: hc[0] + 52*k*sn, y: hc[1] + 12*k, r: 5.5*k};
  p.mouth = "M" + (hc[0] + 44*k*sn) + " " + (hc[1] + 26*k) + " q -10 8 -24 2";
  // shading
  p.shadeBody = spline([[190,236],[164,232],[158,246],[190,262],[250,270],[300,262],[332,246],[320,250],[260,256],[214,252]], true);
  p.shadeHead = spline([[hc[0]-34*k, hc[1]+22*k],[hc[0]-14*k, hc[1]+40*k],[hc[0]+16*k, hc[1]+46*k],[hc[0]+40*k, hc[1]+36*k],[hc[0]+20*k, hc[1]+36*k],[hc[0]-14*k, hc[1]+30*k]], true);
  p.highlight = spline([[200,178],[250,166],[296,162]], false);
  p.ground = {x: 60, y: 356, rx: 215, ry: 13};
  return {p, S};
}
