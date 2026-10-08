// Den canine builder, 2D core (Spark, Oct 8 2026).
// A side-view dog is a set of named masses (ellipses and tapered capsules) hung on flat joints and melted
// together with a smooth union. The union is traced (marching squares), simplified and fitted with Beziers,
// giving one clean SVG outline per layer: BODY (near side) and FAR (far legs and ear, drawn darker behind).
// Units: withers heights (WH). Frame: withers top at (0,0), x forward (toward the nose), y DOWN, ground at y = 1.
// Pure function of its inputs (no Math.random). Works in the browser (globalThis.Canine2D) and in node.
(function (root) {
  'use strict';
  const V = (x, y) => [x, y];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const mul = (a, s) => [a[0] * s, a[1] * s], mix = (a, b, t) => add(a, mul(sub(b, a), t));
  const len = a => Math.hypot(a[0], a[1]), unit = a => mul(a, 1 / (len(a) || 1));
  const perp = a => [-a[1], a[0]];                       // with y down, perp of a forward vector points DOWN
  const rot = (a, deg) => { const c = Math.cos(deg * Math.PI / 180), s = Math.sin(deg * Math.PI / 180); return [a[0] * c - a[1] * s, a[0] * s + a[1] * c]; };
  const lerpTable = (tab, x) => {                         // tab: [[x, y], ...] sorted by x descending or ascending
    const t = [...tab].sort((p, q) => p[0] - q[0]);
    if (x <= t[0][0]) return t[0][1]; if (x >= t[t.length - 1][0]) return t[t.length - 1][1];
    for (let i = 1; i < t.length; i++) if (x <= t[i][0]) { const u = (x - t[i - 1][0]) / (t[i][0] - t[i - 1][0]); const s = u * u * (3 - 2 * u); return t[i - 1][1] + (t[i][1] - t[i - 1][1]) * s; }
  };

  // ---------- the masses ----------
  // P = {J: joints (WH), form: {...}, far: {fore, hind}, ear: {...}, tail: {...}} (see engine/canine/species.mjs)
  function build(P) {
    const J = P.J, F = P.form, M = [];
    const ell = (layer, name, c, axis, rx, ry, k) => M.push({t: 0, layer, name, c, u: unit(axis), rx, ry, k});
    const cap = (layer, name, a, b, ra, rb, k) => M.push({t: 1, layer, name, a, b, ra, rb, k});

    // trunk: lofted from the topline and underline profiles (outer surface, fur included)
    const xs0 = F.trunk_front_x, xs1 = F.trunk_rear_x, n = 18;
    for (let i = 0; i <= n; i++) {
      const x = xs0 + (xs1 - xs0) * i / n, top = lerpTable(F.topline, x), bot = lerpTable(F.underline, x);
      ell('BODY', 'trunk' + i, V(x, (top + bot) / 2), V(1, 0), Math.abs(xs1 - xs0) / n * 2.2, (bot - top) / 2, 0.07);
    }
    // chest front (manubrium and pectorals) and the point of the buttock
    ell('BODY', 'chest', add(J.shoulder, V(F.chest_front - 0.08, 0.02)), V(0.3, 1), 0.15, 0.09, 0.06);
    ell('BODY', 'buttock', add(J.ischium, V(-0.01, 0.0)), V(1, -0.6), 0.1, 0.13, 0.06);

    // fore legs (near in BODY, far in FAR shifted by far.fore)
    const fore = (layer, dx) => {
      const o = V(dx, 0), s = add(J.shoulder, o), e = add(J.elbow, o), c = add(J.carpus, o), m = add(J.mcp, o), toe = add(J.ftoe, o), st = add(J.scap_top, o);
      if (layer === 'BODY') ell(layer, 'shoulder', mix(st, s, 0.5), sub(s, st), len(sub(s, st)) * 0.62, 0.085, 0.06);
      ell(layer, 'triceps', add(mix(s, e, 0.55), V(-0.035, 0)), sub(e, s), len(sub(e, s)) * 0.55, 0.075, 0.05);
      cap(layer, 'arm', add(s, V(0.02, 0)), add(e, V(0.015, 0)), 0.06, 0.045, 0.04);
      ell(layer, 'forearm', add(mix(e, c, 0.25), V(0.008, 0)), sub(c, e), 0.11, 0.045, 0.035);
      cap(layer, 'radius', e, c, 0.042, 0.029, 0.03);
      cap(layer, 'pastern', c, m, 0.03, 0.026, 0.015);
      ell(layer, 'forepaw', V((m[0] + toe[0]) / 2 + 0.005, 1 - 0.032), V(1, 0), 0.06, 0.032, 0.02);
    };
    const hind = (layer, dx) => {
      const o = V(dx, 0), h = add(J.hip, o), k = add(J.stifle, o), t = add(J.hock, o), m = add(J.mtp, o), toe = add(J.htoe, o);
      const back = unit(perp(sub(t, k)));                 // behind the shin (perp of the downward shin vector points back)
      ell(layer, 'thigh', add(mix(h, k, 0.45), V(-0.04, 0)), sub(k, h), len(sub(k, h)) * 0.62, 0.15, 0.06);
      cap(layer, 'hamstring', add(J.ischium, add(o, V(0.01, 0.03))), add(mix(k, t, 0.25), mul(back, -0.05)), 0.075, 0.045, 0.05);
      cap(layer, 'gaskin', add(k, V(-0.01, 0.01)), add(mix(k, t, 0.62), mul(back, -0.02)), 0.06, 0.033, 0.035);
      cap(layer, 'achilles', add(mix(k, t, 0.45), mul(back, -0.045)), add(t, V(-0.022, 0)), 0.02, 0.018, 0.025);
      cap(layer, 'shin', k, t, 0.035, 0.026, 0.025);
      cap(layer, 'hock', t, m, 0.028, 0.025, 0.015);
      ell(layer, 'hindpaw', V((m[0] + toe[0]) / 2 + 0.008, 1 - 0.03), V(1, 0), 0.056, 0.03, 0.02);
    };
    fore('BODY', 0); hind('BODY', 0); fore('FAR', P.far.fore); hind('FAR', P.far.hind);

    // neck and head: head carried so the nose lands on the measured nose point
    const occ = J.occ, nose = F.nose, ax = unit(sub(nose, occ)), dn = perp(ax), L = len(sub(nose, occ));
    const at = (a, d) => add(add(occ, mul(ax, a * L)), mul(dn, d * L));
    cap('BODY', 'neck', add(J.T1, V(-0.1, 0.0)), at(0.1, 0.14), 0.17, 0.12, 0.08);
    cap('BODY', 'ruff', add(J.scap_top, V(0.0, -0.05)), at(0.0, -0.05), 0.08, 0.09, 0.08);
    cap('BODY', 'throat', add(J.shoulder, V(0.08, 0.02)), at(0.34, 0.32), 0.09, 0.07, 0.07);
    ell('BODY', 'cranium', at(0.25, 0.06), ax, 0.27 * L, 0.22 * L, 0.05);
    ell('BODY', 'cheek', at(0.38, 0.24), ax, 0.2 * L, 0.16 * L, 0.05);
    cap('BODY', 'muzzle', at(0.5, 0.12), at(0.97, 0.05), 0.15 * L, 0.075 * L, 0.05);
    cap('BODY', 'jaw', at(0.42, 0.3), at(0.9, 0.15), 0.1 * L, 0.05 * L, 0.04);
    ell('BODY', 'nose', at(0.98, 0.04), ax, 0.045 * L, 0.04 * L, 0.02);
    const ear = (layer, off) => {                           // ear_set: angle of the ear line from the forward skull axis
      const base = add(at(0.22, -0.2), off), dir = rot(ax, -P.ear.set);   // negative = up in a y-down frame
      const tip = add(base, mul(dir, P.ear.len));
      cap(layer, 'ear', base, tip, P.ear.base * 0.55, 0.01, 0.03);
    };
    ear('BODY', V(0, 0)); ear('FAR', V(P.ear.far[0], P.ear.far[1]));

    // tail: leaves the croup along the back line, then bends to its carriage angle
    const T = P.tail, root0 = T.root, segs = 9;
    let q = root0, dir0 = unit(V(-1, 0.7)), dir1 = rot(V(1, 0), 180 - T.carriage);   // carriage below the topline, pointing back
    for (let i = 0; i < segs; i++) {
      const s0 = i / segs, s1 = (i + 1) / segs, d = unit(mix(dir0, dir1, Math.min(1, s1 * 3)));
      const nq = add(q, mul(d, T.len / segs));
      const r = s => lerpTable([[0, T.r[0]], [0.5, T.r[1]], [1, T.r[2]]], s);
      cap('BODY', 'tail' + i, q, nq, r(s0), r(s1), 0.03);
      q = nq;
    }
    return {masses: M, P};
  }

  // ---------- the field ----------
  function dMass(m, x, y) {
    if (m.t === 0) {                                      // ellipse (Quilez-style bound, adequate for a smooth union)
      const dx = x - m.c[0], dy = y - m.c[1], lx = dx * m.u[0] + dy * m.u[1], ly = -dx * m.u[1] + dy * m.u[0];
      const k0 = Math.hypot(lx / m.rx, ly / m.ry), k1 = Math.hypot(lx / (m.rx * m.rx), ly / (m.ry * m.ry));
      return k1 > 1e-9 ? k0 * (k0 - 1) / k1 : -Math.min(m.rx, m.ry);
    }
    const bax = m.b[0] - m.a[0], bay = m.b[1] - m.a[1], pax = x - m.a[0], pay = y - m.a[1];
    const t = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
    return Math.hypot(pax - bax * t, pay - bay * t) - (m.ra + (m.rb - m.ra) * t);
  }
  const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
  function field(model, layer, x, y) {
    let d = 1e9;
    for (const m of model.masses) if (m.layer === layer) d = smin(d, dMass(m, x, y), m.k);
    return d;
  }

  // ---------- trace: marching squares -> loops -> simplify -> Bezier ----------
  function trace(model, layer, box = [-1.45, -0.5, 0.85, 1.04], step = 0.004) {
    const [x0, y0, x1, y1] = box, nx = Math.ceil((x1 - x0) / step) + 1, ny = Math.ceil((y1 - y0) / step) + 1;
    const g = new Float64Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) g[j * nx + i] = field(model, layer, x0 + i * step, y0 + j * step);
    const P = (i, j) => [x0 + i * step, y0 + j * step], v = (i, j) => g[j * nx + i];
    const ip = (a, b, va, vb) => mix(a, b, va / (va - vb));
    const segs = [];
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const a = v(i, j), b = v(i + 1, j), c = v(i + 1, j + 1), d = v(i, j + 1);
      const code = (a < 0) | ((b < 0) << 1) | ((c < 0) << 2) | ((d < 0) << 3);
      if (code === 0 || code === 15) continue;
      const e = [ip(P(i, j), P(i + 1, j), a, b), ip(P(i + 1, j), P(i + 1, j + 1), b, c), ip(P(i + 1, j + 1), P(i, j + 1), c, d), ip(P(i, j + 1), P(i, j), d, a)];
      const T = {1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 5: [[3, 2], [1, 0]], 6: [[0, 2]], 7: [[3, 2]], 8: [[2, 3]], 9: [[2, 0]], 10: [[0, 3], [2, 1]], 11: [[2, 1]], 12: [[1, 3]], 13: [[1, 0]], 14: [[0, 3]]}[code];
      for (const [p, q] of T) segs.push([e[p], e[q]]);
    }
    // chain segments into loops by shared endpoints (direction-free; the even-odd fill makes orientation irrelevant)
    const key = p => Math.round(p[0] / step * 64) + ',' + Math.round(p[1] / step * 64);
    const ends = new Map(), push = (k, i) => { const l = ends.get(k); l ? l.push(i) : ends.set(k, [i]); };
    segs.forEach((s, i) => { push(key(s[0]), i); push(key(s[1]), i); });
    const used = new Uint8Array(segs.length), loops = [];
    for (let i = 0; i < segs.length; i++) {
      if (used[i]) continue; used[i] = 1;
      const loop = [segs[i][0]]; let tip = segs[i][1];
      for (;;) {
        const k = key(tip), nxt = (ends.get(k) || []).find(j => !used[j]);
        if (nxt === undefined) break;
        used[nxt] = 1; loop.push(tip);
        tip = key(segs[nxt][0]) === k ? segs[nxt][1] : segs[nxt][0];
      }
      if (loop.length > 8) loops.push(loop);
    }
    const area = l => l.reduce((s, p, i) => { const q = l[(i + 1) % l.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;
    return loops.filter(l => Math.abs(area(l)) > 2e-4).map(l => simplify(l, step * 0.35));
  }
  function simplify(pts, eps) {                           // Ramer-Douglas-Peucker on a closed loop
    const rdp = (a, b) => {
      let dmax = 0, idx = -1; const A = pts[a], B = pts[b], ab = sub(B, A), L = len(ab) || 1e-9;
      for (let i = a + 1; i < b; i++) { const d = Math.abs(ab[0] * (pts[i][1] - A[1]) - ab[1] * (pts[i][0] - A[0])) / L; if (d > dmax) { dmax = d; idx = i; } }
      return dmax > eps ? [...rdp(a, idx).slice(0, -1), ...rdp(idx, b)] : [A, B];
    };
    const h = Math.floor(pts.length / 2);
    return [...rdp(0, h).slice(0, -1), ...rdp(h, pts.length - 1)];
  }
  function pathD(loop, scale = 1, ox = 0, oy = 0) {     // closed Catmull-Rom -> cubic Beziers
    const n = loop.length, f = p => [(p[0] * scale + ox).toFixed(2), (p[1] * scale + oy).toFixed(2)].join(' ');
    let d = 'M' + f(loop[0]);
    for (let i = 0; i < n; i++) {
      const p0 = loop[(i - 1 + n) % n], p1 = loop[i], p2 = loop[(i + 1) % n], p3 = loop[(i + 2) % n];
      d += ' C' + f(add(p1, mul(sub(p2, p0), 1 / 6))) + ' ' + f(sub(p2, mul(sub(p3, p1), 1 / 6))) + ' ' + f(p2);
    }
    return d + ' Z';
  }

  // ---------- SVG ----------
  function svg(model, o = {}) {
    const W = o.width || 1000, S = o.scale || W / 2.4, ox = o.ox ?? 1.42 * S, oy = o.oy ?? 0.52 * S, H = o.height || Math.round(1.62 * S);
    const body = o.body || '#a08e7a', far = o.far || '#6f6253', line = o.line || '#2b241f', bg = o.bg;
    const lw = o.lineWidth ?? Math.max(0.8, S * 0.004);
    const p = layer => trace(model, layer).map(l => pathD(l, S, ox, oy)).join(' ');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
      (bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : '') + (o.under || '') +
      `<path d="${p('FAR')}" fill="${far}" stroke="${line}" stroke-width="${lw}" stroke-linejoin="round" fill-rule="evenodd"/>` +
      `<path d="${p('BODY')}" fill="${body}" stroke="${line}" stroke-width="${lw}" stroke-linejoin="round" fill-rule="evenodd"/>` +
      (o.over || '') + '</svg>';
  }

  const api = {build, field, trace, pathD, svg, dMass};
  root.Canine2D = api; if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
