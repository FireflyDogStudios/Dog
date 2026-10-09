/* node ref/research/procedural/ik2d.test.js : checks for the prototype solver. Exits non-zero on failure. */
"use strict";
const fs = require("fs"), path = require("path"), assert = require("assert");
const K = require("./ik2d.js");
const near = (a, b, e, msg) => assert.ok(Math.abs(a - b) <= e, `${msg}: ${a} vs ${b}`);
let n = 0; const t = (name, fn) => { fn(); n++; console.log("ok", name); };

const dog = K.makeDog();
const minmax = a => `${Math.min(...a).toFixed(2)}..${Math.max(...a).toFixed(2)}u`;
const H = K.HERO2;

/* independent FK that mirrors rig.js nesting: a point inside joint J maps to J's parent as
   pivot + (x,y) + R(rot)(q - pivot); apply from the innermost joint outwards */
function fk(pts, js){ /* pts = drawing points top..paw, js = [{rot,x,y}] top..last */
  let q = pts[3].slice();
  for (let i = 2; i >= 0; i--){ const p = pts[i], j = js[i], r = j.rot / K.DEG, c = Math.cos(r), s = Math.sin(r);
    const dx = q[0] - p[0], dy = q[1] - p[1]; q = [p[0] + j.x + c * dx - s * dy, p[1] + j.y + s * dx + c * dy]; }
  return q;
}

t("two-bone reproduces the drawn hind and fore legs", () => {
  const sh = K.solveHind(dog.hind, H.hind[0], H.hind[3], 0);
  near(sh.err, 0, 1e-3, "hind err"); sh.a.forEach((a, i) => near(K.wrap(a - dog.hind.R[i]), 0, 2e-3, "hind angle " + i));
  const sf = K.solveFore(dog.fore, H.fore[0], H.fore[3], dog.fore.R[2]);
  near(sf.err, 0, 1e-3, "fore err"); sf.a.forEach((a, i) => near(K.wrap(a - dog.fore.R[i]), 0, 2e-3, "fore angle " + i));
});

t("bend sides: stifle in front of hip-hock line, elbow behind shoulder-carpus line", () => {
  const sh = K.solveHind(dog.hind, H.hind[0], [H.hind[3][0] + 2, H.ground - 1], 0);
  const [hip, st, hock] = sh.joints; const cross = (hock[0] - hip[0]) * (st[1] - hip[1]) - (hock[1] - hip[1]) * (st[0] - hip[0]);
  assert.ok(cross < 0, "stifle forward"); /* y-down: negative cross = point is to the +x side of a downward line */
  const sf = K.solveFore(dog.fore, H.fore[0], [H.fore[3][0] - 2, H.ground - 1], dog.fore.R[2]);
  const [s, el, ca] = sf.joints; const c2 = (ca[0] - s[0]) * (el[1] - s[1]) - (ca[1] - s[1]) * (el[0] - s[0]);
  assert.ok(c2 > 0, "elbow back");
});

t("joint limits hold for 2000 seeded targets (reachable or not)", () => {
  const rnd = K.mulberry32(12345);
  for (let i = 0; i < 2000; i++){
    const tgt = [10 + rnd() * 40, 10 + rnd() * 30];
    const h = K.solveHind(dog.hind, H.hind[0], tgt, (rnd() - .5) * 1.5);
    const stifle = K.jointDeg(h.a[0], h.a[1]), hock = 180 + K.wrap(h.a[2] - h.a[1]) * K.DEG;
    assert.ok(stifle >= 41 - 1e-6 && stifle <= 162 + 1e-6, "stifle " + stifle);
    assert.ok(hock >= 38 - 1e-6 && hock <= 165 + 1e-6, "hock " + hock);
    const f = K.solveFore(dog.fore, H.fore[0], tgt, dog.fore.R[2] + (rnd() - .5) * 3);
    const elbow = K.jointDeg(f.a[0], f.a[1]), carpus = 180 - K.wrap(f.a[2] - f.a[1]) * K.DEG;
    assert.ok(elbow >= 36 - 1e-6 && elbow <= 166 + 1e-6, "elbow " + elbow);
    assert.ok(carpus >= 32 - 1e-6 && carpus <= 196 + 1e-6, "carpus " + carpus);
  }
});

t("legRig angles drive the rig's nesting back onto the IK paw (conversion is right)", () => {
  for (const ph of [0, .1, .3, .5, .7, .9]){
    const P = K.pose(dog, ph, K.GAITS.trot, 8);
    const hj = ["hipN", "shankN", "metaN"].map(id => P.joints[id]);
    const fj = ["shN", "foreN", "pastN"].map(id => P.joints[id]);
    const ph1 = fk(H.hind, hj), pf1 = fk(H.fore, fj);
    const eh = P.debug.hN.sol.joints[3], ef = P.debug.fN.sol.joints[3];
    near(ph1[0], eh[0], 1e-6, "hind x"); near(ph1[1], eh[1], 1e-6, "hind y");
    near(pf1[0], ef[0], 1e-6, "fore x"); near(pf1[1], ef[1], 1e-6, "fore y");
  }
});

t("no paw slide: in stance every paw keeps its WORLD x and sits on the ground (walk, trot, canter, gallop)", () => {
  for (const g of ["walk", "trot", "canter", "gallop"]){
    const G = K.GAITS[g], v = {walk:20, trot:45, canter:60, gallop:90}[g]; /* drawing units / s */
    const S = K.strideFor(v, dog.hipH), f = v / S.len; /* strides per second */
    const ys = {h:[], f:[]};
    let worldX = {}, worst = 0, worstY = 0, frames = 0;
    for (let i = 0; i < 400; i++){
      const time = i / 240, phi = (time * f) % 1, bodyX = v * time;
      const P = K.pose(dog, phi, G, S.len); ys.h.push(P.hindY); ys.f.push(P.foreY);
      for (const l of K.LEGS){ const d = P.debug[l]; if (!d.stance){ worldX[l] = null; continue; }
        const paw = d.sol.joints[3], wx = bodyX + paw[0];
        if (worldX[l] == null) worldX[l] = wx; else { worst = Math.max(worst, Math.abs(wx - worldX[l])); }
        worstY = Math.max(worstY, Math.abs(paw[1] - H.ground)); frames++; }
    }
    assert.ok(frames > 20, "saw stance frames");
    assert.ok(worst < .02 && worstY < .02, `${g}: slide ${worst.toFixed(4)}u, lift ${worstY.toFixed(4)}u`);
    console.log(`   ${g}: stride ${S.len.toFixed(1)}u, ${f.toFixed(2)} strides/s, Fr ${S.Fr.toFixed(2)}, worst slide ${worst.toFixed(5)}u, hip dip ${minmax(ys.h)}, shoulder dip ${minmax(ys.f)}`);
  }
});

t("second-order follower is frame-rate independent (bit-identical)", () => {
  const x = tt => Math.sin(tt * 5) + (tt > .4 ? 1 : 0);
  const a = new K.SecondOrder(2, .5, 1), b = new K.SecondOrder(2, .5, 1);
  let ta = 0; for (let i = 0; i < 60; i++){ ta += 1 / 60; a.to(ta, x); }
  const steps = [1 / 30, 1 / 144, 1 / 90, 1 / 45, 1 / 240]; let tb = 0, i = 0;
  while (tb < 1 - 1e-9){ tb += Math.min(steps[i++ % steps.length], 1 - tb); b.to(tb, x); }
  /* both have taken exactly 120 fixed steps */
  assert.strictEqual(a.n, 120); assert.strictEqual(b.n, 120); assert.strictEqual(a.y, b.y);
});

t("gait blend walk->trot moves offsets the short way and stays continuous", () => {
  let prev = null;
  for (let k = 0; k <= 1.0001; k += .01){ const G = K.blendGait(K.GAITS.walk, K.GAITS.trot, Math.min(k, 1));
    if (prev) for (const l of K.LEGS){ let d = G.off[l] - prev.off[l]; d -= Math.round(d); assert.ok(Math.abs(d) < .01, l + " jump"); }
    prev = G; }
  near(prev.off.fF, .5, 1e-9, "fF"); near(((prev.off.fN % 1) + 1) % 1 % 1, 0, 1e-9, "fN");
});

t("seeded noise repeats, and the module never calls Math.random", () => {
  assert.strictEqual(K.noise1(7, 3.25), K.noise1(7, 3.25));
  assert.notStrictEqual(K.noise1(7, 3.25), K.noise1(8, 3.25));
  const src = fs.readFileSync(path.join(__dirname, "ik2d.js"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.ok(!/Math\.random/.test(src), "Math.random found");
});

console.log(`${n} checks passed`);
