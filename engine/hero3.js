/* hero3 (Oct 8, Firefly): a gray wolf on hero2's rig. Same joints, same tracks, same states, so hero2's walk and tells carry over;
   the drawing is redrawn to the measured wolf (ref/research/wolf-photo-proportions/, 7 standing wolves, and Shutter's back line,
   ref/research/photos/backline/), all as shares of withers height (WH), fur outline. Drawing space 62×38, ground y 35.5, faces right.
   WH = 24.5 (withers top y 11.0).
     body length, chest front to buttock  1.15 (1.08–1.48)  → chest front x 45.6, buttock x 17.4 (28.2 = 1.15)
     chest floor above ground             0.47 (0.42–0.56)  → brisket y 24.0
     nose forward of withers              0.54 (0.49–0.54)  → nose x 50.6 (withers x 37.2)
     nose height                          0.85 (0.75–0.86)  → nose y 14.7: the head is carried level with the back, not raised
     back line                            0.97–0.99 to over the hips, tail root 0.90 → level back, tail root y 13.5
   Tail: a wolf's brush hangs from the croup to about hock height, clear of the hind legs (GrumpyDingo's studio photo, Oct 8).
   Usage: registerHero3(RIG) after registerDenRigs(RIG). Pure data; no Math.random. */
function registerHero3(RIG){
  const H2 = RIG.DEFS.hero2; if (!H2) throw new Error("hero3 needs hero2");
  const f2 = v => +(+v).toFixed(2);
  const limb = (a, b, w0, w1, extra) => { const dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1, ux = dx / m, uy = dy / m, nx = -uy, ny = ux, r0 = w0 / 2, r1 = w1 / 2, pts = [];
    for (let i = 0; i <= 8; i++){ const t = Math.PI * i / 8; pts.push([b[0] + (nx * Math.cos(t) + ux * Math.sin(t)) * r1, b[1] + (ny * Math.cos(t) + uy * Math.sin(t)) * r1]); }
    for (let i = 0; i <= 8; i++){ const t = Math.PI + Math.PI * i / 8; pts.push([a[0] + (nx * Math.cos(t) + ux * Math.sin(t)) * r0, a[1] + (ny * Math.cos(t) + uy * Math.sin(t)) * r0]); }
    return Object.assign({poly:pts.map(q => [f2(q[0]), f2(q[1])])}, extra || {}); };
  /* a wolf paw: bigger and rounder than hero2's, standing on the ground line (p.y + 1) */
  const paw = (p, extra) => { const [x, y] = p, k = .85, X = v => f2(x + v * k), Y = v => f2(v >= 1.05 ? y + 1.05 : y + 1.05 - (1.05 - v) * k * 1.08);
    return Object.assign({d:`M${X(-1.3)} ${Y(-.4)} C${X(-1.9)} ${Y(.4)} ${X(-1.4)} ${Y(1.05)} ${X(-.3)} ${Y(1.05)} L${X(2.3)} ${Y(1.05)} C${X(3.3)} ${Y(1.05)} ${X(3.4)} ${Y(.1)} ${X(2.5)} ${Y(-.4)} C${X(1.8)} ${Y(-.95)} ${X(.7)} ${Y(-1.2)} ${X(-.3)} ${Y(-.95)} C${X(-.8)} ${Y(-.8)} ${X(-1.1)} ${Y(-.6)} ${X(-1.3)} ${Y(-.4)} Z`}, extra || {}); };
  /* a ribbon along a Catmull-Rom curve whose width follows wf(u), u = 0 at the root, 1 at the tip */
  const ribbon = (pts, wf, extra, half) => { const P = [pts[0], ...pts, pts[pts.length - 1]], c = [];
    for (let i = 1; i < P.length - 2; i++){ const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]]; for (let k = 0; k < 10; k++){ const t = k / 10, t2 = t * t, t3 = t2 * t; c.push([0, 1].map(j => .5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } } c.push(pts[pts.length - 1]);
    const L = [], R = []; for (let i = 0; i < c.length; i++){ const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m; const w = wf(i / (c.length - 1)) / 2;
      L.push([c[i][0] - dy * w * (half === -1 ? 0 : 1), c[i][1] + dx * w * (half === -1 ? 0 : 1)]); R.push([c[i][0] + dy * w * (half === 1 ? 0 : 1), c[i][1] - dx * w * (half === 1 ? 0 : 1)]); }
    if (half) return Object.assign({poly:[...L, ...R.reverse()].map(q => [f2(q[0]), f2(q[1])])}, extra || {});
    const tip = c[c.length - 1], a = c[c.length - 2], ang = Math.atan2(tip[1] - a[1], tip[0] - a[0]), rt = wf(1) / 2, cap = [];
    for (let k = 1; k < 8; k++){ const t = ang + Math.PI / 2 - Math.PI * k / 8; cap.push([tip[0] + Math.cos(t) * rt, tip[1] + Math.sin(t) * rt]); }
    return Object.assign({poly:[...L, ...cap, ...R.reverse()].map(q => [f2(q[0]), f2(q[1])])}, extra || {}); };

  /* joints: hero2's hind leg as is; the front leg's elbow drops to the deeper brisket (y 24) */
  const H = {hip:[20.6, 17.8], stifle:[24.4, 26.2], hock:[19.4, 29.8], paw:[20.3, 34.5]};
  const Fj = {sh:[42.4, 16.4], elbow:[40.0, 23.4], past:[40.3, 30.6], paw:[40.8, 34.5]};
  const sh = (o, dx) => Object.fromEntries(Object.entries(o).map(([n, q]) => [n, [f2(q[0] + dx), q[1]]]));
  const FAR_DX = {hind:1.3, front:-1.3}; /* far hind leg a little forward, far front leg a little back */
  const HL = k => k === "F" ? sh(H, FAR_DX.hind) : H, FL = k => k === "F" ? sh(Fj, FAR_DX.front) : Fj;
  const hind = (k, ph, far) => [
    {id:"hip" + k, at:HL(k).hip, track:"hhip", ph, far, in:"root"}, {id:"shank" + k, at:HL(k).stifle, track:"hshank", ph, in:"hip" + k},
    {id:"meta" + k, at:HL(k).hock, track:"hmeta", ph, in:"shank" + k}, {id:"htoe" + k, at:HL(k).paw, track:"htoe", ph, in:"meta" + k}];
  const front = (k, ph, far) => [
    {id:"sh" + k, at:FL(k).sh, track:"fsh", ph, far, in:"root"}, {id:"fore" + k, at:FL(k).elbow, track:"ffore", ph, in:"sh" + k},
    {id:"past" + k, at:FL(k).past, track:"fpast", ph, in:"fore" + k}, {id:"ftoe" + k, at:FL(k).paw, track:"ftoe", ph, in:"past" + k}];
  const THIGH = H2.parts.find(p => p.poly && p.in === "hipF").poly; /* hero2's thigh: the lower half of the rump, flush with the buttock */
  /* legs: thicker than hero2 (a wolf is heavier-boned), still tapering; the pale starts below the elbow and the hock */
  const legParts = k => [
    {poly:k === "F" ? THIGH.map(q => [f2(q[0] + FAR_DX.hind), q[1]]) : THIGH, in:"hip" + k}, limb(HL(k).stifle, HL(k).hock, 4.0, 2.6, {in:"shank" + k}), limb(HL(k).hock, HL(k).paw, 2.5, 2.2, {in:"meta" + k, paint:"leg"}),
    {circle:[HL(k).hock[0], HL(k).hock[1], 1.3], in:"meta" + k}, paw(HL(k).paw, {in:"htoe" + k, paint:"pale2"}),
    limb(FL(k).sh, FL(k).elbow, 5.8, 3.4, {in:"sh" + k}), limb(FL(k).elbow, FL(k).past, 3.0, 2.3, {in:"fore" + k, paint:"leg"}),
    limb(FL(k).elbow, [FL(k).elbow[0], FL(k).elbow[1] + .9], 3.4, 2.9, {in:"fore" + k}), limb(FL(k).past, FL(k).paw, 2.3, 2.0, {in:"past" + k, paint:"leg"}),
    paw(FL(k).paw, {in:"ftoe" + k, paint:"pale2"})];

  /* body: croup → level back → withers → short thick crested neck → skull → stop → long muzzle → nose → jaw → ruffed throat → forechest
     → brisket at the elbow → belly → modest tuck-up → rump. The head is carried at back level, nose forward 0.54 WH. */
  const body = "M23.2 11.5 C27 11.4 33 11.5 37.2 11.0 C39.6 10.6 41.6 9.6 43.0 9.0 C44.0 8.4 45.6 8.2 46.7 8.9 L47.5 9.7 C48.6 10.6 49.8 12.0 50.8 13.3 C51.3 13.7 51.3 14.5 50.7 14.8 C49.6 15.2 48.4 15.5 47.2 15.6 C46.4 15.7 45.7 15.8 45.2 16.0 C45.9 17.2 46.2 18.8 45.6 20.2 C44.8 22.0 42.8 23.6 40.2 24.0 C39.0 24.1 37.8 24.0 36.6 23.8 C33 23.5 28.4 22.4 25.2 20.6 C23.5 19.6 21.4 18.6 19.6 17.6 C17.6 16.4 17.4 14.0 19.6 12.8 C20.8 12.1 22.2 11.6 23.2 11.5 Z";
  /* dark saddle along the back, from behind the ears to the croup, inset under the topline (wolf agouti) */
  const saddle = "M18.10 14.56 C18.27 13.89 18.76 13.26 19.60 12.80 C20.8 12.1 22.2 11.6 23.2 11.5 C27 11.4 33 11.5 37.2 11.0 C39.6 10.6 41.4 9.7 42.6 9.2 C42.6 10.8 41.6 12.4 39.6 13.4 C37.6 14.2 35.8 13.6 34.0 14.3 C32.0 15.0 30.0 14.6 28.0 15.0 C26.0 15.2 24.4 14.4 23.0 13.9 C21.4 13.5 19.4 13.6 18.10 14.56 Z"; /* rear edge stays above the near thigh, which draws over the body */ /* runs over the croup into the tail's dark top */
  /* pale: the throat and forechest ruff, the cheek and lower jaw, the belly line */
  const chest = "M47.0 15.6 C46.3 15.8 45.7 15.9 45.3 16.1 C46.0 17.3 46.3 18.8 45.7 20.2 C44.9 22.0 42.9 23.6 40.3 24.0 L40.3 22.6 C42.4 22.2 43.9 20.8 44.4 19.4 C44.8 18.2 44.7 17.0 44.4 16.0 C45.2 15.3 46.1 15.3 47.0 15.6 Z";
  const cheek = "M47.6 13.0 C48.8 13.4 50.0 13.8 50.9 14.2 C51.0 14.5 50.9 14.7 50.7 14.8 C49.6 15.2 48.4 15.5 47.2 15.6 C46.4 15.7 45.7 15.8 45.2 16.0 C45.2 15.0 46.0 13.6 47.6 13.0 Z";
  const belly = "M38.4 24.0 C35 23.8 30 23.0 25.2 20.6 C26.6 20.9 28.6 21.8 31.0 22.3 C33.6 22.8 36.2 23.1 38.4 24.0 Z";
  const muzzleTop = "M47.5 9.7 C48.6 10.6 49.8 12.0 50.8 13.3 C50.0 13.0 49.0 12.4 48.2 11.8 C47.6 11.2 47.3 10.4 47.5 9.7 Z";
  /* ears: big wolf triangles (0.16 WH ≈ 3.9 tall), wide at the base, set at the back of the skull, upright and a touch back */
  const earFar = "M42.2 11.4 L42.4 9.5 C42.3 7.6 42.3 6.0 42.6 4.8 C42.7 4.5 43.0 4.5 43.2 4.7 C44.0 5.8 44.6 7.2 44.9 8.7 L45.0 11.0 Z";
  const earNear = "M43.2 11.4 L43.4 9.2 C43.4 7.2 43.6 5.6 44.1 4.4 C44.2 4.1 44.6 4.1 44.8 4.3 C45.8 5.5 46.6 7.2 47.1 9.4 L46.8 11.2 Z"; /* base buried in the skull (the body draws over the ear joints); the front edge runs into the forehead */
  const earIn = "M44.2 10.0 L44.2 8.6 C44.3 7.2 44.5 6.0 44.8 5.2 C45.4 6.1 45.8 7.2 46.0 8.4 L46.0 10.0 Z";
  /* tail: a full brush hanging from inside the croup to about hock height, behind the thigh with daylight below it */
  const TAILC = [[21.4, 14.0], [18.8, 14.6], [16.4, 16.3], [14.8, 19.2], [14.0, 22.4], [13.9, 25.6], [14.4, 28.0]];
  const tailW = u => u < .15 ? 2.4 + u / .15 * 1.4 : u < .7 ? 3.8 + Math.sin((u - .15) / .55 * Math.PI) * .6 : 3.8 - (u - .7) / .3 * 2.2;
  const tail = ribbon(TAILC, tailW, {in:"tail"});
  const tailTop = ribbon(TAILC, tailW, {in:"tail", paint:"saddle"}, 1);
  const tailTip = ribbon(TAILC.slice(4), u => tailW(.68 + u * .32) * Math.min(1, .15 + u * 2.2), {in:"tail", paint:"furDark"}); /* the dark tip grows out of the tail as a soft wedge, no hard band */

  RIG.define("hero3", {
    stride:1, tracks:H2.tracks,
    palette:{fur:"#918a7f", saddle:"#625a51", tan:"#a8947a", leg:"#9f8f79", pale:"#ece6da", pale2:"#c8baa4", furDark:"#3f3933", ink:"#1e1a16", far:.74},
    joints:[
      ...hind("F", 0, true), ...front("F", .25, true),
      {id:"body", bob:.45, in:"root"},
      {id:"tail", at:[21.4, 14.0], track:"wag", period:2.2, in:"body"},
      {id:"earFar", at:[43.6, 9.2], in:"body"}, {id:"earNear", at:[45.0, 8.9], in:"body"},
      ...hind("N", .5, false), ...front("N", .75, false)],
    parts:[
      ...legParts("F"),
      tail, tailTop, tailTip,
      {d:earFar, in:"earFar"},
      {d:earNear, in:"earNear", paint:"tan"}, {d:earIn, in:"earNear", paint:"pale"}, /* (ear and tail joints draw under all body parts in rig.js) */
      {d:body, in:"body", id:"body"},
      {d:saddle, in:"body", paint:"saddle"},
      {d:chest, in:"body", paint:"pale"}, {d:cheek, in:"body", paint:"pale"}, {d:belly, in:"body", paint:"pale"},
            {d:muzzleTop, in:"body", paint:"tan"},
      {ellipse:[46.3, 10.9, .75, .45], in:"body", paint:"ink"}, {circle:[50.75, 13.95, .75], in:"body", paint:"ink"},
      ...legParts("N")],
    states:{
      "ears-back":[{joint:"earFar", rot:-40}, {joint:"earNear", rot:-40}],
      "ears-up":[{joint:"earFar", rot:6}, {joint:"earNear", rot:6}],
      howl:[{joint:"earFar", rot:-28}, {joint:"earNear", rot:-28}]
    }
  });
}
if (typeof module !== "undefined") module.exports = {registerHero3};
