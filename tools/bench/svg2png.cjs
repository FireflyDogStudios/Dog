// node tools/bench/svg2png.cjs <in.svg> <out.png>: rasterise an SVG at its own size with Chromium
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => { const [i, o] = process.argv.slice(2); const svg = fs.readFileSync(i, 'utf8'); const w = +svg.match(/width="([\d.]+)"/)[1], h = +svg.match(/height="([\d.]+)"/)[1];
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:Math.ceil(w), height:Math.ceil(h)}});
  await p.setContent(`<html><body style="margin:0">${svg}</body></html>`); await p.screenshot({path:o, clip:{x:0, y:0, width:w, height:h}}); await b.close(); })();
