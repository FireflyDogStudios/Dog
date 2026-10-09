// Dingo v2: Carolina Dog anatomy (pointed muzzle, equilateral ears set on top pointing slightly forward,
// straight back with a waist, brisket to the elbows, straight forelegs with elbow/pastern, angulated hind legs
// with stifle and hock, fish-hook tail at ~45°, ginger with pale buff). Facing right.
function spline(pts, closed, tension){
  tension = tension == null ? 1 : tension; const n = pts.length; if (n < 2) return "";
  const P = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  let d = "M" + P(0)[0].toFixed(1) + " " + P(0)[1].toFixed(1); const m = closed ? n : n - 1;
  for (let i = 0; i < m; i++){ const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6 * tension, p1[1] + (p2[1] - p0[1]) / 6 * tension];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6 * tension, p2[1] - (p3[1] - p1[1]) / 6 * tension];
    d += " C" + [c1[0], c1[1], c2[0], c2[1], p2[0], p2[1]].map(v => v.toFixed(1)).join(" "); }
  return closed ? d + " Z" : d;
}
function sc(pts, cx, cy, kx, ky){ return pts.map(([x, y]) => [cx + (x - cx) * kx, cy + (y - cy) * (ky == null ? kx : ky)]); }
// limb outline from a joint chain [[x, y, halfWidth], ...] (top to paw)
function limb(chain, tension){ const L = [], R = [];
  for (let i = 0; i < chain.length; i++){ const [x, y, w] = chain[i]; const a = chain[Math.max(0, i - 1)], b = chain[Math.min(chain.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
    L.push([x - dy * w, y + dx * w]); R.push([x + dy * w, y - dx * w]); }
  return spline(L.concat(R.reverse()), true, tension == null ? 0.6 : tension); }

const LOOKS = {
  smithy:{ label:"Smithy match", bg:"#efe3c6", ground:"#cdb286", base:"#c97a3a", shade:"#8f4f1f", light:"#e8a86a", buff:"#f1e1bf", buffS:"#d6bd92", dark:"#2e1c0c", line:"#2e1c0c", lineW:3.2, mode:"cel", eye:"#2a1a10" },
  storybook:{ label:"Vector-painted storybook", bg:"#f3e7cf", ground:"#d9c39a", base:"#d9823c", shade:"#b25f24", light:"#efb47a", buff:"#f6e8cc", buffS:"#dcc7a0", dark:"#5a2f17", line:"#5a2f17", lineW:2.2, mode:"paint", eye:"#2a1a10" },
  ink:{ label:"Ink and shadow", bg:"#0f1418", ground:"#1c242b", base:"#8a4a28", shade:"#4c2614", light:"#b8703c", buff:"#e9dcc0", buffS:"#b9a98a", dark:"#0a0d10", line:"#0a0d10", lineW:1.8, mode:"ink", eye:"#f2e6c8", glow:"#d9a441" },
  pulp:{ label:"Pulp poster", bg:"#1d2a33", ground:"#3b4f55", base:"#e4863b", shade:"#8f4518", light:"#f6b06a", buff:"#f6e4c0", buffS:"#c9b48e", dark:"#1a110c", line:"#1a110c", lineW:2.6, mode:"cel", eye:"#f6e4c0", glow:"#f2b24a" },
  woodcut:{ label:"Woodcut", bg:"#efe3c6", ground:"#c9a56a", base:"#c8742f", shade:"#7a3f14", light:"#c8742f", buff:"#efe3c6", buffS:"#efe3c6", dark:"#2b1a10", line:"#2b1a10", lineW:4, mode:"cut", eye:"#efe3c6" }
};

function dingo(S, K){
  K = K || {}; const p = {};
  const kh = K.head || 1, ke = K.ear || 1, kl = K.leg || 1, kb = K.body || 1;
  // ---- torso + neck (one silhouette) ----
  // withers (300,162) → croup (178,172) → tail set → thigh → tuck-up → brisket → chest → throat → nape
  let torso = [[306,160],[250,158],[200,164],[172,176],[160,196],[166,224],[200,238],[250,250],[300,256],[330,236],[340,206],[344,176],[346,148],[338,126],[322,134]];
  torso = sc(torso, 250, 210, 1, kb);
  p.torso = spline(torso, true, 0.9);
  // ---- head: skull round, muzzle tapers to a point (muzzle ≈ skull length) ----
  const hc = [372, 118], h = kh;
  const head = [[338,118],[346,96],[366,86],[388,90],[402,104],[418,116],[434,132],[436,140],[424,146],[404,150],[384,154],[362,156],[346,148],[338,134]];
  p.head = spline(head.map(([x,y]) => [hc[0] + (x-hc[0])*h, hc[1] + (y-hc[1])*h]), true, 0.85);
  // ears: equilateral-ish triangles set on top, pointing slightly forward, one a little turned
  const ear = (bx, by, s, fwd) => spline([[bx - s*0.5, by], [bx + fwd*s*0.25, by - s*0.98], [bx + s*0.5, by + 2]], true, 0.35);
  const earIn = (bx, by, s, fwd) => spline([[bx - s*0.28, by - 2], [bx + fwd*s*0.25, by - s*0.72], [bx + s*0.3, by]], true, 0.35);
  const es = 34 * ke * h;
  const E1 = [hc[0] - 14*h, hc[1] - 26*h], E2 = [hc[0] + 14*h, hc[1] - 30*h];
  p.earL = ear(E1[0], E1[1], es, 0.9); p.earR = ear(E2[0], E2[1], es, 0.6); p.earInL = earIn(E1[0], E1[1], es, 0.9); p.earInR = earIn(E2[0], E2[1], es, 0.6);
  // eye: almond, set obliquely
  const ex = hc[0] + 22*h, ey = hc[1] - 8*h;
  p.eye = spline([[ex-7*h, ey+1],[ex-2*h, ey-4*h],[ex+6*h, ey-3*h],[ex+8*h, ey+1],[ex+2*h, ey+4*h],[ex-4*h, ey+3*h]], true, 0.8);
  p.pupil = {x: ex + 1*h, y: ey, r: 2.6*h}; p.brow = "M" + (ex - 10*h) + " " + (ey - 10*h) + " q 10 -4 20 0";
  p.nose = spline([[hc[0]+58*h, hc[1]+12*h],[hc[0]+64*h, hc[1]+16*h],[hc[0]+62*h, hc[1]+23*h],[hc[0]+54*h, hc[1]+21*h]], true, 0.6);
  p.mouth = "M" + (hc[0] + 56*h) + " " + (hc[1] + 26*h) + " q -8 6 -20 4";
  // pale muzzle sides + throat
  p.muzzle = spline([[hc[0]+22*h, hc[1]+6*h],[hc[0]+44*h, hc[1]+8*h],[hc[0]+58*h, hc[1]+22*h],[hc[0]+44*h, hc[1]+32*h],[hc[0]+16*h, hc[1]+38*h],[hc[0]-16*h, hc[1]+34*h],[hc[0]-22*h, hc[1]+20*h],[hc[0]-2*h, hc[1]+10*h]], true, 0.9);
  // ---- legs (joint chains: [x, y, halfWidth]) ----
  const w = kl;
  // foreleg: shoulder → elbow (at the brisket) → straight forearm → pastern → paw
  const fore = (ox, oy) => limb([[300+ox, 200+oy, 15*w],[310+ox, 252+oy, 11*w],[314+ox, 300+oy, 8*w],[316+ox, 330+oy, 7.5*w],[322+ox, 344+oy, 8*w]], 0.5);
  // hind leg: hip → stifle (forward) → hock (back) → rear pastern → paw
  const hind = (ox, oy) => limb([[196+ox, 196+oy, 24*w],[204+ox, 236+oy, 19*w],[208+ox, 262+oy, 12*w],[184+ox, 300+oy, 8.5*w],[184+ox, 330+oy, 7.5*w],[190+ox, 344+oy, 8*w]], 0.5);
  const paw = (x, y) => spline([[x-10, y-6],[x+4, y-9],[x+16, y-4],[x+15, y+4],[x-9, y+5]], true, 0.8);
  p.legFF = fore(4, 0); p.legFB = fore(-14, 0); p.legBF = hind(2, 0); p.legBB = hind(-16, 0);
  p.pawFF = paw(326, 346); p.pawFB = paw(308, 346); p.pawBF = paw(194, 346); p.pawBB = paw(176, 346);
  // ---- tail: fish-hook, carried at ~45°, lighter underside ----
  const tailC = [[166,190,9],[142,214,10],[124,246,10],[122,276,9],[134,292,7],[150,286,5]];
  p.tail = limb(tailC, 0.8);
  p.tailUnder = limb([[160,200,3],[140,224,4],[128,252,4],[128,276,4],[136,286,3]], 0.8);
  // ---- buff chest/belly ----
  p.chest = spline([[340,180],[344,206],[334,232],[304,254],[252,248],[206,236],[200,224],[236,226],[290,228],[316,212],[322,186]], true, 0.9);
  // ---- cel shading regions (clipped to the body in the renderer) ----
  p.shadeTorso = spline([[160,214],[170,250],[220,262],[300,266],[340,236],[346,210],[330,214],[300,232],[250,230],[200,222]], true, 0.9);
  p.shadeHead = spline([[336,134],[348,160],[384,162],[420,152],[438,142],[430,146],[400,144],[366,142],[344,128]], true, 0.9);
  p.shadeNeck = spline([[306,160],[320,200],[344,206],[346,150],[330,126],[314,140]], true, 0.9);
  p.lightBack = spline([[200,170],[250,164],[304,166],[318,142],[330,128],[324,132],[310,150],[300,172],[250,172],[204,178]], true, 0.9);
  p.ground = {cx: 258, cy: 352, rx: 190, ry: 11};
  return p;
}
if (typeof module !== "undefined") module.exports = {dingo, LOOKS, spline};
