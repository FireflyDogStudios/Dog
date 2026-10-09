/* node ref/research/procedural/frames.js : writes stride-frames.svg, a big flat-background contact sheet of the IK
   gait (8 frames per gait, walk / trot / canter / gallop) for the hero2 leg geometry. Bones are drawn as thick lines,
   far legs dimmed; the paw's ground contact is a dot. A body bar shows the girdle bob and pitch. */
"use strict";
const fs = require("fs"), path = require("path");
const K = require("./ik2d.js");
const dog = K.makeDog(), H = K.HERO2;
const gaits = [["walk", 20], ["trot", 45], ["canter", 60], ["gallop", 90]];
const N = 8, cw = 70, ch = 46, sc = 6;
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${N * cw * sc}" height="${gaits.length * ch * sc}" viewBox="0 0 ${N * cw} ${gaits.length * ch}" font-family="sans-serif">
<rect width="100%" height="100%" fill="#f4efe4"/>\n`;
const line = (a, b, w, c) => `<line x1="${a[0].toFixed(2)}" y1="${a[1].toFixed(2)}" x2="${b[0].toFixed(2)}" y2="${b[1].toFixed(2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
gaits.forEach(([g, v], r) => {
  const G = K.GAITS[g], S = K.strideFor(v, dog.hipH);
  for (let i = 0; i < N; i++){
    const phi = i / N, P = K.pose(dog, phi, G, S.len), ox = i * cw + 4, oy = r * ch + 4;
    svg += `<g transform="translate(${ox} ${oy})">`;
    svg += line([0, H.ground + .9], [62, H.ground + .9], .4, "#9a8f7a");
    const order = ["hF", "fF", null, "hN", "fN"];
    for (const l of order){
      if (l === null){ /* body bar between the girdles, pitched */
        const hy = H.hind[0][1] + P.hindY, fy = H.fore[0][1] + P.foreY;
        svg += line([H.hind[0][0] - 3, hy - 2], [H.fore[0][0] + 3, fy - 2], 7, "#dca45e"); continue; }
      const d = P.debug[l], js = d.sol.joints, far = l[1] === "F", c = far ? "#a97f48" : "#7a5226";
      const w = l[0] === "h" ? [3.4, 2.4, 1.9] : [3.4, 2.2, 1.7];
      for (let b = 0; b < 3; b++) svg += line(js[b], js[b + 1], w[b], c);
      if (d.stance) svg += `<circle cx="${js[3][0].toFixed(2)}" cy="${(js[3][1] + .5).toFixed(2)}" r=".8" fill="#3f8a4f"/>`;
    }
    svg += `<text x="1" y="4" font-size="2.6" fill="#2a1a10">${g} ${phi.toFixed(3)}</text></g>\n`;
  }
});
svg += "</svg>\n";
const out = path.join(__dirname, "stride-frames.svg"); fs.writeFileSync(out, svg); console.log("wrote", out);
