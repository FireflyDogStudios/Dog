// Spark, Oct 8 2026: form-first canine builder (prototype).
// A dog is ~50 named masses (ellipsoids and tapered capsules) hung on a joint chain built from
// species numbers, blended with a smooth union, so volumes flow into each other and into tendons.
// Parts (head, ears, tail, coat) are swappable modules. Pure function of the params: no randomness.
// Works in the browser (window.Canine) and in node (module.exports).
(function (root) {
  const rad = d => d * Math.PI / 180;
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const mix = (a, b, t) => add(a, mul(sub(b, a), t));
  const dir = deg => [Math.cos(rad(deg)), Math.sin(rad(deg)), 0];
  const z = (p, zz) => [p[0], p[1], zz];
  const ang = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
  const len = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);

  // Presets. Bones in mm (wolf: Law et al. 2025 means from species/wolf.yaml); everything else is a ratio of withers height.
  const PRESETS = {
    wolf: {
      wh: 750, bones: {scap: 175.5, hum: 232, rad: 236.5, mc: 102.8, fem: 247.5, tib: 258, mt: 112},
      length: 1.05, chestDepth: 1.0, chestWidth: 1.0, mass: 1.0, legs: 1.0,
      head: {len: 0.39, width: 0.56, muzzle: 1.0, stop: 0.5, carry: -8},
      ears: {type: 'erect', len: 0.15, width: 0.11, tilt: 8},
      tail: {type: 'hang', len: 0.6, bush: 0.035},
      coat: 'clay', fur: 0
    }
  };
  PRESETS.wolfCoat = {...PRESETS.wolf, coat: 'wolf', fur: 0.012, tail: {type: 'hang', len: 0.6, bush: 0.085}};
  PRESETS.dingo = {
    ...PRESETS.wolf, wh: 560, length: 1.08, chestDepth: 0.94, chestWidth: 0.92, mass: 0.88, legs: 1.0,
    head: {len: 0.35, width: 0.54, muzzle: 0.96, stop: 0.55, carry: -4},
    ears: {type: 'erect', len: 0.16, width: 0.10, tilt: 2},
    tail: {type: 'hook', len: 0.62, bush: 0.055},
    coat: 'ginger', fur: 0.006
  };
  PRESETS.husky = {
    ...PRESETS.wolf, wh: 560, length: 1.06, chestDepth: 1.02, chestWidth: 1.05, mass: 1.08, legs: 0.95,
    head: {len: 0.34, width: 0.6, muzzle: 0.85, stop: 0.65, carry: -2},
    ears: {type: 'erect', len: 0.115, width: 0.095, tilt: 6},
    tail: {type: 'curl', len: 0.55, bush: 0.08},
    coat: 'husky', fur: 0.018
  };
  PRESETS.hound = {
    ...PRESETS.wolf, wh: 600, length: 1.12, chestDepth: 1.12, chestWidth: 1.0, mass: 1.0, legs: 0.92,
    head: {len: 0.36, width: 0.5, muzzle: 1.05, stop: 0.7, carry: -10},
    ears: {type: 'drop', len: 0.2, width: 0.13, tilt: 0},
    tail: {type: 'sickle', len: 0.55, bush: 0.035},
    coat: 'tan', fur: 0.002
  };
  // bones scale with withers height for the non-wolf presets (proportions kept; swap in real numbers per species)
  for (const k of ['dingo', 'husky', 'hound']) {
    const s = PRESETS[k].wh / 750;
    PRESETS[k].bones = Object.fromEntries(Object.entries(PRESETS.wolf.bones).map(([n, v]) => [n, v * s]));
  }

  // Coat palettes by region. Countershading (belly lighter) and saddle (back darker) are applied in the shader by normal.
  const COATS = {
    clay:   {body: '#b9a89a', back: '#b9a89a', belly: '#b9a89a', leg: '#b9a89a', paw: '#a99686', muzzle: '#b9a89a', head: '#b9a89a', ear: '#b09d8e', tail: '#b9a89a', tip: '#b9a89a', nose: '#3a3330', eye: '#1c1816', counter: 0.0, saddle: 0.0},
    wolf:   {body: '#8f857a', back: '#4f4a45', belly: '#e1d8ca', leg: '#c9b79c', paw: '#b8a68c', muzzle: '#ddd2c0', head: '#867b70', ear: '#6e6156', tail: '#7d746a', tip: '#2e2a27', nose: '#1d1a19', eye: '#2a1d10', counter: 0.6, saddle: 0.65},
    ginger: {body: '#c98a4b', back: '#a9692f', belly: '#f0e2c6', leg: '#d9a66d', paw: '#f2e6d0', muzzle: '#e9cfa5', head: '#c88a4c', ear: '#b9773d', tail: '#c48546', tip: '#f4ecdc', nose: '#2a211b', eye: '#2d1b0c', counter: 0.6, saddle: 0.4},
    husky:  {body: '#4a4b50', back: '#2b2c30', belly: '#efece6', leg: '#ece8e1', paw: '#f1eee9', muzzle: '#f1eee9', head: '#45464b', ear: '#35363a', tail: '#3e3f44', tip: '#f1eee9', nose: '#151516', eye: '#5b88b0', counter: 0.85, saddle: 0.6},
    tan:    {body: '#b07a46', back: '#2d2620', belly: '#efe3cf', leg: '#efe3cf', paw: '#f3ebdd', muzzle: '#c08954', head: '#b67f4a', ear: '#8e5a2f', tail: '#2d2620', tip: '#f3ebdd', nose: '#1b1714', eye: '#2b1a0c', counter: 0.7, saddle: 0.9}
  };

  function build(p) {
    const W = p.wh, u = W / 750, b = Object.fromEntries(Object.entries(p.bones).map(([k, v]) => [k, v * p.legs]));
    const m = p.mass, prims = [], C = COATS[p.coat];
    const ell = (c, deg, rx, ry, rz, k, col, name) => prims.push({t: 0, a: c, deg, r: [rx, ry, rz], k, col, name});
    const cone = (a, bb, ra, rb, k, col, name, sz = 1) => prims.push({t: 1, a, b: bb, ra, rb, k, col, name, sz});

    // ---- legs, solved top-down then set on the ground (standing pose, angles from horizontal)
    const pawR = 0.034 * W;
    const fore = (Sx) => {
      const S = [Sx, 0, 0], E = add(S, mul(dir(242), b.hum)), Cc = add(E, mul(dir(-88), b.rad + 0.035 * W)), F = add(Cc, mul(dir(-72), b.mc * 0.72));
      const dy = pawR - F[1]; return [S, E, Cc, F].map(q => add(q, [0, dy, 0]));
    };
    const hind = (Hx) => {
      const H = [Hx, 0, 0], K = add(H, mul(dir(-62), b.fem)), T = add(K, mul(dir(-128), b.tib)), F = add(T, mul(dir(-88), b.mt * 0.8));
      const dy = pawR - F[1]; return [H, K, T, F].map(q => add(q, [0, dy, 0]));
    };
    const span = p.length * 1.05 * W - 0.17 * W;      // point-of-shoulder to point-of-buttock ~ length * WH
    const Hx = -span / 2, Sx = span / 2;
    const [S, E, Cf, Ff] = fore(Sx), [H, K, T, Fh] = hind(Hx);
    const scapTop = add(S, mul(dir(118), b.scap));
    const withers = [scapTop[0] + 0.01 * W, W - 0.045 * W, 0];         // bone/muscle top under skin
    const loinTop = [mix(withers, H, 0.62)[0], 0.94 * W - 0.05 * W, 0];
    const croupTop = [H[0] + 0.05 * W, 0.925 * W - 0.05 * W, 0];
    const chestBot = E[1] + 0.03 * W - (p.chestDepth - 1) * 0.12 * W;
    const tuck = chestBot + 0.2 * W;
    const ch = 0.12 * W * p.chestWidth;                                 // half chest width (bony 0.13 WH + muscle)

    // ---- trunk
    const rcTop = withers[1] - 0.06 * W, rcC = [S[0] - 0.24 * W, (rcTop + chestBot) / 2, 0];
    ell(rcC, -4, 0.37 * W, (rcTop - chestBot) / 2, ch, 0.06 * W, 'body', 'ribcage');
    ell([S[0] + 0.02 * W, S[1] - 0.04 * W, 0], 60, 0.15 * W, 0.11 * W, 0.1 * W * p.chestWidth, 0.05 * W, 'belly', 'prosternum');
    ell([rcC[0] - 0.02 * W, chestBot + 0.06 * W, 0], -3, 0.28 * W, 0.065 * W, ch * 0.75, 0.05 * W, 'belly', 'sternum');
    for (const s of [1, -1]) {
      cone(z([withers[0] - 0.02 * W, withers[1] - 0.03 * W], s * 0.045 * W), z([loinTop[0], loinTop[1]], s * 0.05 * W), 0.07 * W * m, 0.065 * W * m, 0.07 * W, 'back', 'epaxial');
      cone(z(loinTop, s * 0.05 * W), z([croupTop[0] + 0.06 * W, croupTop[1] - 0.02 * W], s * 0.06 * W), 0.06 * W * m, 0.06 * W * m, 0.05 * W, 'back', 'loin');
    }
    // abdomen with tuck-up: from the rear ribs to the flank fold in front of the thigh
    cone([rcC[0] - 0.22 * W, chestBot + 0.13 * W, 0], [H[0] + 0.2 * W, tuck + 0.07 * W, 0], 0.12 * W * ch / (0.12 * W), 0.07 * W, 0.07 * W, 'belly', 'abdomen', 1.2);
    cone([rcC[0] - 0.15 * W, rcTop - 0.06 * W, 0], [H[0] + 0.1 * W, croupTop[1] - 0.12 * W, 0], 0.11 * W, 0.1 * W, 0.08 * W, 'body', 'flank', 1.2);
    ell([H[0] - 0.03 * W, croupTop[1] - 0.085 * W, 0], -18, 0.17 * W, 0.09 * W, 0.11 * W * m, 0.06 * W, 'back', 'croup');

    // ---- hind legs (near +z, far -z, far one set slightly forward)
    const hz = 0.085 * W;
    for (const [s, dx] of [[1, 0], [-1, 0.06 * W]]) {
      const o = [dx, 0, 0], h = add(H, o), k = add(K, o), t = add(T, o), f = add(Fh, o), zz = s * hz;
      const fa = ang(h, k), ta = ang(k, t);
      ell(z(add(mix(h, k, 0.42), [-0.035 * W, 0.01 * W, 0]), zz), fa + 18, b.fem * 0.6, 0.17 * W * m, 0.075 * W * m, 0.07 * W, 'body', 'thigh');
      cone(z([h[0] - 0.13 * W, h[1] + 0.02 * W], zz * 0.9), z(add(mix(k, t, 0.22), [-0.06 * W, 0, 0]), zz), 0.075 * W * m, 0.04 * W * m, 0.045 * W, 'body', 'hamstring');
      ell(z(add(k, mul(dir(fa + 90), -0.035 * W)), zz * 1.05), fa, 0.06 * W, 0.04 * W, 0.04 * W, 0.03 * W, 'leg', 'stifle');
      cone(z(add(k, [-0.02 * W, -0.01 * W, 0]), zz), z(add(mix(k, t, 0.62), [-0.035 * W, 0, 0]), zz), 0.06 * W * m, 0.032 * W * m, 0.035 * W, 'leg', 'gaskin');
      cone(z(add(mix(k, t, 0.5), [-0.045 * W, 0, 0]), zz), z(add(t, [-0.03 * W, 0.005 * W, 0]), zz), 0.02 * W, 0.016 * W, 0.025 * W, 'leg', 'achilles');
      cone(z(add(k, [0.01 * W, -0.02 * W, 0]), zz), z(t, zz), 0.035 * W, 0.024 * W, 0.025 * W, 'leg', 'shin');
      cone(z(t, zz), z(f, zz), 0.025 * W, 0.021 * W, 0.015 * W, 'leg', 'hock');
      ell(z(add(f, [0.035 * W, -0.006 * W, 0]), zz), 0, 0.048 * W, pawR * 1.05, 0.038 * W, 0.025 * W, 'paw', 'hindpaw');
    }

    // ---- fore legs (far one set slightly back)
    const fz = 0.09 * W;
    for (const [s, dx] of [[1, 0], [-1, -0.07 * W]]) {
      const o = [dx, 0, 0], sh = add(S, o), e = add(E, o), c = add(Cf, o), f = add(Ff, o), st = add(scapTop, o), zz = s * fz;
      const sa = ang(sh, st), ha = ang(sh, e);
      ell(z(mix(sh, st, 0.5), s * (ch * 0.75)), sa, b.scap * 0.6, 0.07 * W * m, 0.04 * W, 0.08 * W, 'body', 'shoulder');
      ell(z(add(mix(sh, e, 0.55), [-0.05 * W, 0, 0]), zz), ha, b.hum * 0.62, 0.085 * W * m, 0.06 * W * m, 0.05 * W, 'body', 'triceps');
      cone(z(add(sh, [0.025 * W, 0, 0]), zz), z(add(e, [0.02 * W, 0.01 * W, 0]), zz), 0.065 * W * m, 0.04 * W, 0.045 * W, 'body', 'arm');
      ell(z(add(e, [-0.035 * W, 0, 0]), zz), 0, 0.035 * W, 0.03 * W, 0.03 * W, 0.025 * W, 'leg', 'elbow');
      ell(z(add(mix(e, c, 0.28), [0.012 * W, 0, 0]), zz), -88, 0.12 * W, 0.05 * W * m, 0.045 * W * m, 0.04 * W, 'leg', 'forearm');
      cone(z(e, zz), z(c, zz), 0.046 * W, 0.026 * W, 0.03 * W, 'leg', 'radius');
      cone(z(c, zz), z(f, zz), 0.026 * W, 0.022 * W, 0.015 * W, 'leg', 'pastern');
      ell(z(add(f, [0.035 * W, -0.008 * W, 0]), zz), 0, 0.05 * W, pawR * 1.1, 0.04 * W, 0.025 * W, 'paw', 'forepaw');
    }

    // ---- neck
    const hb = [S[0] + 0.3 * W, withers[1] + 0.02 * W, 0];             // atlas / head base
    cone([S[0] - 0.05 * W, S[1] + 0.13 * W, 0], hb, 0.135 * W * m, 0.08 * W, 0.08 * W, 'body', 'neck', 1.15);
    cone([withers[0] + 0.02 * W, withers[1] - 0.02 * W, 0], add(hb, [-0.04 * W, 0.03 * W, 0]), 0.065 * W * m, 0.06 * W, 0.09 * W, 'back', 'crest', 1.3);
    cone([S[0] + 0.06 * W, S[1] + 0.03 * W, 0], add(hb, [0.06 * W, -0.09 * W, 0]), 0.085 * W, 0.06 * W, 0.06 * W, 'belly', 'throat', 1.2);

    // ---- head module
    head(hb, p, W, ell, cone);
    // ---- tail module
    tail([H[0] - 0.15 * W, croupTop[1] - 0.04 * W, 0], p, W, cone);

    // colours and fur
    const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
    for (const q of prims) q.rgb = hex(C[q.col]);
    return {prims, fur: p.fur * W, counter: C.counter, saddle: C.saddle, backRGB: hex(C.back), bellyRGB: hex(C.belly), bounds: {x0: Hx - 0.9 * W, x1: hb[0] + 0.6 * W, y1: W * 1.35}, W};
  }

  function head(hb, p, W, ell, cone) {
    const h = p.head, L = h.len * W, ax = dir(h.carry), up = dir(h.carry + 90);
    const at = (a, d) => add(add(hb, mul(ax, a * L)), mul(up, d * L));
    ell(at(0.28, 0.0), h.carry + 4, 0.33 * L, 0.29 * L, h.width * 0.5 * L, 0.06 * L, 'head', 'cranium');
    ell(at(0.42, -0.13), h.carry, 0.22 * L, 0.17 * L, h.width * 0.52 * L, 0.06 * L, 'head', 'cheek');
    ell(at(0.55, 0.08 + h.stop * 0.04), h.carry - 10, 0.12 * L, 0.09 * L, 0.2 * L, 0.05 * L, 'head', 'brow');
    const tip = at(0.62 + 0.42 * h.muzzle, -0.04);
    cone(at(0.56, -0.02), tip, 0.17 * L, 0.085 * L, 0.07 * L, 'muzzle', 'muzzle', 1.15);
    cone(at(0.4, -0.2), add(tip, mul(up, -0.11 * L)), 0.1 * L, 0.05 * L, 0.05 * L, 'muzzle', 'jaw', 1.2);
    ell(add(tip, mul(ax, 0.01 * L)), h.carry + 15, 0.06 * L, 0.05 * L, 0.055 * L, 0.02 * L, 'nose', 'nose');
    for (const s of [1, -1]) {
      ell(z(at(0.5, 0.07), s * 0.17 * L), h.carry - 15, 0.04 * L, 0.025 * L, 0.03 * L, 0.004 * L, 'eye', 'eye');
      ear(at(0.18, 0.18), s * 0.17 * L, p, W, L, cone);
    }
  }

  function ear(base, zz, p, W, L, cone) {
    const e = p.ears, el = e.len * W, ew = e.width * W;
    const b = z(base, zz), sq = 3.2;
    if (e.type === 'erect') {
      const tip = add(b, [-0.15 * el - e.tilt * 0.01 * el, el, zz > 0 ? 0.15 * el : -0.15 * el]);
      cone(b, tip, ew * 0.5, ew * 0.07, 0.02 * W, 'ear', 'ear', sq);
    } else if (e.type === 'drop') {
      const mid = add(b, [0.05 * el, 0.05 * el, zz > 0 ? 0.25 * ew : -0.25 * ew]);
      const tip = add(mid, [0.1 * el, -0.95 * el, zz > 0 ? 0.25 * ew : -0.25 * ew]);
      cone(b, mid, ew * 0.4, ew * 0.45, 0.02 * W, 'ear', 'ear', sq);
      cone(mid, tip, ew * 0.45, ew * 0.28, 0.02 * W, 'ear', 'ear', sq);
    }
  }

  function tail(root, p, W, cone) {
    const t = p.tail, L = t.len * W, n = 9, pts = [];
    for (let i = 0; i <= n; i++) {
      const s = i / n; let a;
      if (t.type === 'hang') a = 200 + 55 * s;            // back-down, then hanging
      else if (t.type === 'sickle') a = 165 - 40 * s;     // up and back
      else if (t.type === 'hook') a = 185 + 70 * s * s;   // low, tip hooks up at the end (fish-hook)
      else a = 120 - 230 * s;                             // curl over the back
      pts.push(a);
    }
    let q = root;
    for (let i = 0; i < n; i++) {
      let a = pts[i]; if (t.type === 'hook' && i > n - 3) a = 300 + 40 * (i - n + 3);
      const nq = add(q, mul(dir(a), L / n));
      const s0 = i / n, s1 = (i + 1) / n;
      const r = s => t.bush * W * (0.55 + 0.75 * Math.sin(Math.PI * Math.min(1, s * 1.1)) ) * (1 - 0.65 * s * s) + 0.012 * W;
      cone(q, nq, r(s0), r(s1), 0.06 * W, i >= n - 2 ? 'tip' : 'tail', 'tail' + i);
      q = nq;
    }
  }

  const api = {PRESETS, COATS, build};
  root.Canine = api; if (typeof module !== "undefined" && module.exports) module.exports = api;
})(globalThis);
