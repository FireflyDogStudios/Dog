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
  /* ---- legs from the measured wolf: bone lengths (Law et al. 2025 means, species/wolf.yaml) scaled to WH 24.5 = 750 mm, posed at measured
     standing angles (included, 180 = straight): stifle 140 and tarsus 145 (Catavitello 2015 dog walk at touchdown 143 / 145; Humphries 2020
     standing Labrador 145 / 150), elbow 145 (Catavitello touchdown 148), carpus 186 (slight over-extension in stance), pastern sloping 12 deg
     (breed standards 15-20). The joints are computed from these numbers, from the ground up; hero2's legs were drawn crouched (a shin 6.2
     long against the wolf's 8.4, the hip 3 units low), which is what made the knee and hock read 101 / 115. ---- */
  const MM = 24.5 / 750, BONE = {femur:247.5 * MM, tibia:258 * MM, cannon:(112 + 36) * MM /* mt3 + tarsal block (EST) */, humerus:232 * MM, radius:236.5 * MM, pastern:(102.8 + 20) * MM /* mc3 + carpal (EST) */};
  const STAND = {stifle:140, tarsus:145, elbow:145, carpus:186, pastern:12, hipX:20.6, shoulder:[42.4, 16.4], ground:34.5};
  const sd = d => Math.sin(d * Math.PI / 180), cd = d => Math.cos(d * Math.PI / 180);
  const H = (() => { const t = 180 - STAND.tarsus, f = STAND.tarsus - STAND.stifle; /* tibia leans t forward of vertical; the femur f behind it */
    const px = STAND.hipX - BONE.tibia * sd(t) + BONE.femur * sd(f), paw = [px, STAND.ground], hock = [px, STAND.ground - BONE.cannon];
    const stifle = [hock[0] + BONE.tibia * sd(t), hock[1] - BONE.tibia * cd(t)], hip = [stifle[0] - BONE.femur * sd(f), stifle[1] - BONE.femur * cd(f)];
    return {hip:hip.map(f2), stifle:stifle.map(f2), hock:hock.map(f2), paw:paw.map(f2)}; })();
  const Fj = (() => { const pl = STAND.pastern, fl = STAND.pastern - (STAND.carpus - 180), hu = fl + STAND.elbow; /* angles from straight down, + toward the front */
    const dx = -BONE.pastern * sd(pl) - BONE.radius * sd(fl) + BONE.humerus * sd(hu), dy = -BONE.pastern * cd(pl) - BONE.radius * cd(fl) + BONE.humerus * cd(hu); /* paw → shoulder */
    const paw = [STAND.shoulder[0] - dx, STAND.ground], sh = [STAND.shoulder[0], STAND.ground + dy], past = [paw[0] - BONE.pastern * sd(pl), paw[1] - BONE.pastern * cd(pl)], elbow = [past[0] - BONE.radius * sd(fl), past[1] - BONE.radius * cd(fl)];
    return {sc:[38.8, 11.8] /* top of the shoulder blade (EST) */, sh:sh.map(f2), elbow:elbow.map(f2), past:past.map(f2), paw:paw.map(f2)}; })();
  const sh = (o, dx) => Object.fromEntries(Object.entries(o).map(([n, q]) => [n, [f2(q[0] + dx), q[1]]]));
  const FAR_DX = {hind:1.3, front:-1.3}; /* far hind leg a little forward, far front leg a little back */
  const HL = k => k === "F" ? sh(H, FAR_DX.hind) : H, FL = k => k === "F" ? sh(Fj, FAR_DX.front) : Fj;
  const hind = (k, ph, far) => [
    {id:"hip" + k, at:HL(k).hip, track:"hhip", ph, far, in:"root"}, {id:"shank" + k, at:HL(k).stifle, track:"hshank", ph, in:"hip" + k},
    {id:"meta" + k, at:HL(k).hock, track:"hmeta", ph, in:"shank" + k}, {id:"htoe" + k, at:HL(k).paw, track:"htoe", ph, in:"meta" + k}];
  const front = (k, ph, far) => [
    {id:"scap" + k, at:FL(k).sc, track:"fscap", ph, far, in:"root"}, /* the shoulder blade rotates on the ribcage: most of a dog's front reach */ {id:"sh" + k, at:FL(k).sh, track:"fsh", ph, in:"scap" + k}, {id:"fore" + k, at:FL(k).elbow, track:"ffore", ph, in:"sh" + k},
    {id:"past" + k, at:FL(k).past, track:"fpast", ph, in:"fore" + k}, {id:"ftoe" + k, at:FL(k).paw, track:"ftoe", ph, in:"past" + k}];
  /* the thigh: the lower half of the rump, from inside the croup to a round knee cap at the stifle; the rear edge continues the buttock line */
  const THIGH = (() => { const [sx, sy] = H.stifle, cap = []; for (let k = 0; k <= 8; k++){ const a = Math.PI * (.95 - k / 8 * 1.05); cap.push([f2(sx + Math.cos(a) * 2.1), f2(sy + Math.sin(a) * 2.1)]); }
    return [[22.4, 16.4], [20.4, 16.3], [18.8, 16.4], [17.6, 17.0], [17.4, 18.4], [17.8, 20.2], [18.6, 21.6], ...cap, [23.9, 20.6], [24.6, 18.6], [24.8, 17.0], [24.4, 16.6], [23.6, 16.4]]; })(); /* the top sits below the saddle inside the rump, so the swing never lifts it into the saddle or past the croup */
  /* legs: thicker than hero2 (a wolf is heavier-boned), still tapering; the pale starts below the elbow and the hock */
  const legParts = k => [
    {poly:k === "F" ? THIGH.map(q => [f2(q[0] + FAR_DX.hind), q[1]]) : THIGH, in:"hip" + k}, limb(HL(k).stifle, HL(k).hock, 4.0, 2.6, {in:"shank" + k}), limb(HL(k).hock, HL(k).paw, 2.5, 2.2, {in:"meta" + k, paint:"leg"}),
    {circle:[HL(k).hock[0], HL(k).hock[1], 1.3], in:"meta" + k}, paw(HL(k).paw, {in:"htoe" + k, paint:"pale2"}),
    limb([FL(k).sh[0] + (FL(k).elbow[0] - FL(k).sh[0]) * .22, FL(k).sh[1] + (FL(k).elbow[1] - FL(k).sh[1]) * .22], FL(k).elbow, 5.2, 3.4, {in:"sh" + k}) /* the arm's top stays inside the chest as the blade carries it forward */, limb(FL(k).elbow, FL(k).past, 3.0, 2.3, {in:"fore" + k, paint:"leg"}),
    limb(FL(k).elbow, [FL(k).elbow[0], FL(k).elbow[1] + .9], 3.4, 2.9, {in:"fore" + k}), limb(FL(k).past, FL(k).paw, 2.3, 2.0, {in:"past" + k, paint:"leg"}),
    paw(FL(k).paw, {in:"ftoe" + k, paint:"pale2"})];

  /* body: croup → level back → withers → short thick crested neck → skull → stop → long muzzle → nose → jaw → ruffed throat → forechest
     → brisket at the elbow → belly → modest tuck-up → rump. The head is carried at back level, nose forward 0.54 WH. */
  const body = "M23.2 11.5 C27 11.4 33 11.5 37.2 11.0 C39.4 10.5 41.0 9.6 42.60 9.30 C43.65 8.70 45.35 8.60 46.35 9.40 L47.05 10.20 C47.95 11.00 48.95 12.20 49.75 13.30 C50.15 13.60 50.35 14.20 50.30 14.80 C50.25 15.30 49.95 15.60 49.55 15.70 C48.55 16.00 47.35 16.30 46.35 16.50 C45.75 16.60 45.35 16.70 45.10 17.05 C45.4 17.8 45.6 19.3 45.2 20.6 C44.6 22.3 42.7 23.7 40.2 24.0 C39.0 24.1 37.8 24.0 36.6 23.8 C33 23.5 28.4 22.4 25.2 20.6 C23.5 19.6 21.4 18.6 19.6 17.6 C17.6 16.4 17.4 14.0 19.6 12.8 C20.8 12.1 22.2 11.6 23.2 11.5 Z";
  /* dark saddle along the back, from behind the ears to the croup, inset under the topline (wolf agouti) */
  const saddle = "M18.10 14.56 C18.27 13.89 18.76 13.26 19.60 12.80 C20.8 12.1 22.2 11.6 23.2 11.5 C27 11.4 33 11.5 37.2 11.0 C39.4 10.5 41.0 9.6 42.60 9.30 C42.0 10.2 41.2 12.2 39.6 13.4 C37.6 14.2 35.8 13.6 34.0 14.3 C32.0 15.0 30.0 14.6 28.0 15.0 C26.0 15.2 24.4 14.4 23.0 13.9 C21.4 13.5 19.4 13.6 18.10 14.56 Z"; /* rear edge stays above the near thigh, which draws over the body */ /* runs over the croup into the tail's dark top */
  /* pale: the throat and forechest ruff, the cheek and lower jaw, the belly line */
  const chest = "M46.35 16.50 C45.75 16.60 45.35 16.70 45.10 17.05 C45.4 17.8 45.6 19.3 45.2 20.6 C44.6 22.3 42.7 23.7 40.2 24.0 L40.3 22.6 C42.2 22.2 43.5 21.0 43.9 19.6 C44.2 18.4 44.1 17.6 43.9 17.1 C44.6 16.9 45.4 16.5 46.35 16.50 Z"; /* outer edge = the body outline */ /* outer edge = the body outline, segment for segment */
  const cheek = "M50.30 14.80 C50.25 15.30 49.95 15.60 49.55 15.70 C48.55 16.00 47.35 16.30 46.35 16.50 C45.75 16.60 45.35 16.70 45.10 17.05 C45.15 15.70 45.95 14.40 47.15 13.90 C48.35 13.60 49.45 14.10 50.30 14.80 Z";
  const belly = "M40.2 24.0 C39.0 24.1 37.8 24.0 36.6 23.8 C33 23.5 28.4 22.4 25.2 20.6 C27.6 21.3 31.4 22.2 34.8 22.7 C36.8 23.0 38.6 23.4 40.2 24.0 Z"; /* outer edge = the body underline */
  const muzzleTop = "M47.05 10.20 C47.95 11.00 48.95 12.20 49.75 13.30 C48.95 13.00 48.05 12.40 47.45 11.70 C47.15 11.30 46.95 10.70 47.05 10.20 Z";
  /* ears: big wolf triangles (0.16 WH ≈ 3.9 tall), wide at the base, set at the back of the skull, upright and a touch back */
  const earFar = "M41.35 12.10 L41.55 10.30 C41.55 8.70 41.75 7.30 42.25 6.50 C42.55 6.10 43.05 6.20 43.35 6.60 C43.95 7.60 44.25 8.70 44.35 9.90 L44.35 11.90 Z";
  const earNear = "M43.15 11.90 L43.35 9.90 C43.45 8.30 43.85 6.70 44.45 5.90 C44.75 5.50 45.35 5.50 45.65 5.90 C46.35 7.00 46.75 8.30 46.95 9.70 L46.65 11.70 Z"; /* base buried in the skull (the body draws over the ear joints); the front edge runs into the forehead */
  const earIn = "M44.05 10.90 L44.15 9.50 C44.35 8.10 44.75 7.00 45.05 6.60 C45.55 7.30 45.85 8.30 46.05 9.50 L46.05 10.90 Z";
  /* tail: a full brush hanging from inside the croup to about hock height, behind the thigh with daylight below it */
  const TAILC = [[21.4, 14.0], [18.6, 14.6], [15.9, 16.3], [13.9, 19.0], [12.7, 22.2], [12.3, 25.3], [12.6, 27.6]]; /* hangs behind the hock (which sits just behind the buttock) */
  const tailW = u => u < .15 ? 2.4 + u / .15 * 1.4 : u < .7 ? 3.8 + Math.sin((u - .15) / .55 * Math.PI) * .6 : 3.8 - (u - .7) / .3 * 2.2;
  const tail = ribbon(TAILC, tailW, {in:"tail", id:"tail"});
  const tailTop = ribbon(TAILC, tailW, {in:"tail", paint:"saddle", id:"tailTop"}, 1);
  const tailTip = ribbon(TAILC.slice(4), u => tailW(.68 + u * .32) * Math.min(1, .15 + u * 2.2), {in:"tail", paint:"furDark", id:"tailTip"}); /* the dark tip grows out of the tail as a soft wedge, no hard band */



  /* ---- head joint (Oct 8): the neck and head are cut from the body so the head can drop while walking (fox clip: the nose rides 0.18-0.34
     shoulder heights below the back; standing alert it comes up level with it). Paths are flattened and clipped by a cut from just in front of the
     withers down to the throat; the neck piece reaches 2.5 units back under the shoulders (the body draws over it) so no gap opens as it pivots.
     Markings that cross the cut are split exactly at it, so the standing drawing is unchanged. ---- */
  const flat = d => { const t = d.match(/[MCLZ]|-?\d*\.?\d+/g), pts = []; let i = 0, cur = [0, 0], cmd = "";
    while (i < t.length){ if (/[MCLZ]/.test(t[i])) cmd = t[i++];
      if (cmd === "M" || cmd === "L"){ cur = [+t[i], +t[i + 1]]; i += 2; pts.push(cur); }
      else if (cmd === "C"){ const c1 = [+t[i], +t[i + 1]], c2 = [+t[i + 2], +t[i + 3]], e = [+t[i + 4], +t[i + 5]]; i += 6;
        for (let k = 1; k <= 14; k++){ const u = k / 14, v = 1 - u; pts.push([0, 1].map(j => v * v * v * cur[j] + 3 * v * v * u * c1[j] + 3 * v * u * u * c2[j] + u * u * u * e[j])); } cur = e; }
      else if (cmd === "Z") { i++; } else i++; }
    return pts; };
  /* keep the side of the line a→b where cross((b-a),(p-a)) has sign `side` (Sutherland-Hodgman) */
  const clip = (P, a, b, side) => { const f = q => side * ((b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0])), out = [];
    for (let k = 0; k < P.length; k++){ const p = P[k], q = P[(k + 1) % P.length], fp = f(p), fq = f(q);
      if (fp >= 0) out.push(p); if ((fp >= 0) !== (fq >= 0)){ const u = fp / (fp - fq); out.push([p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u]); } }
    return out; };
  const P2 = P => P.map(q => [f2(q[0]), f2(q[1])]);
  const CUT = {a:[36.0, 9.0], b:[45.6, 20.2], floor:20.2, chest:18.4 /* the chest front keeps its own fur up to here, so the throat can swing back over it */, back:2.5}; /* crosses the back line at x≈37.7, where it is still flat, so the crest's rise is all on the neck piece */ /* the neck's base: in front of the withers, down to where the throat meets the chest */
  const shiftB = [CUT.a[0] - CUT.back, CUT.a[1]], shiftB2 = [CUT.b[0] - CUT.back, CUT.b[1]];
  const ahead = (P, a, b) => clip(P, a, b, -1), behind = (P, a, b) => clip(P, a, b, 1);
  const above = (P, y) => clip(P, [0, y], [1, y], -1), below = (P, y) => clip(P, [0, y], [1, y], 1);
  /* head region: ahead of the cut and above the throat floor; the torso: behind the cut, plus everything below the floor */
  const headOf = d => P2(above(ahead(flat(d), CUT.a, CUT.b), CUT.floor));
  /* the chest front bends (GrumpyDingo, Oct 8): a real neck curves along its length. Below the throat, the front of the chest is a skinned
     piece: each of its points follows the head by a weight that runs from 1 under the throat (y = SK0) to 0 at the brisket (y = SK1), so when
     the head dips the chest front curves back smoothly instead of a still chest jutting 1.3 units past the neck. The torso keeps everything
     behind x = FRONT_X and below SK1; the skin draws over it and only ever moves back onto it. */
  const FRONT_X = 40.8, SK0 = 18.4, SK1 = 24.0, NECK_Y = 18.6;
  const leftOf = (P, x) => clip(P, [x, 0], [x, 30], 1), rightOf = (P, x) => clip(P, [x, 0], [x, 30], -1);
  const torsoOf = d => { const F = flat(d), R = rightOf(F, FRONT_X); return [["A", P2(behind(leftOf(F, FRONT_X), CUT.a, CUT.b))] /* the body behind the front */,
      ["B", P2(below(R, SK1 - .15))] /* the chest's lower front, below the skin */, ["C", P2(above(behind(R, CUT.a, CUT.b), SK0))] /* under the neck, above the skin */].filter(e => e[1].length > 2); };
  const densify = (P, step) => P.flatMap((q, k) => { const n = P[(k + 1) % P.length], m = Math.max(1, Math.ceil(Math.hypot(n[0] - q[0], n[1] - q[1]) / step)); return [...Array(m)].map((_, u) => [q[0] + (n[0] - q[0]) * u / m, q[1] + (n[1] - q[1]) * u / m]); });
  const skinW = q => { const u = Math.max(0, Math.min(1, (q[1] - SK0) / (SK1 - SK0))); return +(1 - u * u * (3 - 2 * u)).toFixed(3); };
  const chestSkin = d => { const P = P2(densify(above(below(rightOf(flat(d), FRONT_X), SK0), SK1), .3)); return {poly:P, skin:{to:"headBody", w:P.map(skinW)}}; };
  /* the hidden overlap behind the cut is trimmed under a line that drops back from the cut's top, so tipping the head nose-down (which lifts
     everything behind the pivot) never pushes it above the back */
  const lap = [[CUT.a[0] + (CUT.b[0] - CUT.a[0]) * (11.0 - CUT.a[1]) / (CUT.b[1] - CUT.a[1]), 11.0]]; lap.push([lap[0][0] - 3.5, 13.6]);
  const underLap = P => clip(P, lap[1], lap[0], 1);
  const neckOf = d => P2(underLap(above(ahead(flat(d), shiftB, shiftB2), CUT.floor + 1)));
  const neckFur = P2(above(neckOf(body), NECK_Y)); /* the neck fur stops at the top of the chest-front bands */
  const HEAD_PIVOT = [37.7, 11.0]; /* on the back line at the base of the neck, so the crest bends down from the withers with no step */
  /* ---- the walk, baked from IK (Oct 8): each paw's path is chosen, then the joint angles that put it there are solved ----
     Stance (62% of the stride; measured walk duty 0.58-0.64, ref/research/fetched/04-gait-curves): the paw stays flat on the ground and
     moves straight back at a constant speed (the ground speed), so it never slides, dips or rises. Swing: it lifts in a smooth arc and
     comes forward, the hock or wrist folding as it goes. Lateral-sequence phases as hero2 (LH 0, LF .25, RH .5, RF .75).
     Hind: thigh + gaskin are a two-bone IK to the hock; the cannon keeps its standing angle in stance. Front: upper arm + forearm to the wrist.
     The solved angles become ordinary rig tracks (keys every 1/48 of the stride), so rig.js plays them unchanged. */
  /* Walk baseline (ref/research/firefly/quad-walk-baseline/SUMMARY.md): lateral sequence, the forefoot 0.16 of a stride after its hind
     (measured dogs 0.135-0.16; wolf recommendation 0.16), duty fore 0.62 / hind 0.60 (measured 0.59 / 0.58, fore above hind), each girdle a
     pendulum that dips just after each of its touchdowns and rides highest over mid-stance (twice per stride), the hips bouncing more than the
     shoulders and both kept low for a wolf's smooth gait; the hind paw plants flatter and lifts lower than the front. */
  const WALK = {speed:20 /* ground units per stride (1.1 shoulder heights; fox clip 1.4, measured dogs 1.2-1.5), the same for every paw (so nothing skates) */, limbPhase:.16, keys:48,
    crouch:1.5 /* the back rides ~8% lower while walking (fox clip: 0.83-0.96 of standing) */, head:{pitch:8, bob:1.5, lag:.06} /* nose down ~13 deg while walking (the nose rides ~0.25 heights below the back), lowest while a front paw takes weight */,
    hind:{duty:.60, lift:.9, fold:4, centre:-.5, maxOpen:148, bob:.45, lean:16}, /* lean: the hock may open up to 16 deg to reach (standing 145, measured walk max 160) */  /* centre: stance centre ahead of the standing paw; maxOpen: knee never opens past (measured walk max 144) */
    front:{duty:.62, lift:1.8, fold:120, carpusHold:190 /* the wrist holds ~10 deg past straight while the paw is down: GrumpyDingo's tracked fox, stance median 193 (IQR 187-198) */, centre:-2.3, maxOpen:152, bob:.30, scap:{top:[38.8, 11.8], swing:16}, lean:10}}; /* scap.swing: degrees the blade rotates each way, forward as the paw reaches, back as it pushes off (EST) */ /* centres: the front paw lands ~0.17 heights behind the nose (fox 0.06-0.29), the hind just ahead of the hip */ /* elbow never past 152 (measured 153); bob: peak-to-peak dip in units (EST) */
  const A = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI, Ln = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const pol = (o, deg, l) => [o[0] + Math.cos(deg * Math.PI / 180) * l, o[1] + Math.sin(deg * Math.PI / 180) * l];
  const easeIO = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  /* two-bone IK: root, lengths, target; side = +1 bends the middle joint to +x (stifle forward), -1 to -x (elbow back) */
  const twoBone = (r, l1, l2, t, side, maxR) => { const d = Math.min(Ln(r, t), maxR || (l1 + l2) * .999), a0 = A(r, t), c = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), off = Math.acos(Math.max(-1, Math.min(1, c))) * 180 / Math.PI;
    const m1 = pol(r, a0 + off, l1), m2 = pol(r, a0 - off, l1); return (side > 0 ? (m1[0] > m2[0] ? m1 : m2) : (m1[0] < m2[0] ? m1 : m2)); };
  /* paw path over one stride, phase 0 = touch-down at the front of the stance */
  const pawAt = (ph, rest0, L, lift) => { const travel = WALK.speed * L.duty, half = travel / 2, rest = [rest0[0] + L.centre, rest0[1]]; /* a planted paw moves back at the ground speed for its stance */
    if (ph < L.duty) { const u = ph / L.duty; return {p:[rest[0] + half - u * travel, rest[1]], u, stance:true}; }
    /* swing: x is a Hermite curve that leaves and lands at the stance speed (no dead stop at lift-off, no slam at touch-down; it overshoots
       ~2% back as the toe peels and ~2% forward before it sets down), y a bump with zero slope at both ends (the paw eases off and onto the ground) */
    const u = (ph - L.duty) / (1 - L.duty), m = -(1 - L.duty) / L.duty, h = m * u + (3 - 3 * m) * u * u + (2 * m - 2) * u * u * u;
    return {p:[rest[0] - half + h * travel, rest[1] - lift * 16 * u * u * (1 - u) * (1 - u)], u, stance:false}; };
  const reachOf = (l1, l2, maxDeg) => Math.sqrt(l1 * l1 + l2 * l2 - 2 * l1 * l2 * Math.cos(maxDeg * Math.PI / 180)); /* hip-to-hock (shoulder-to-wrist) length with the middle joint at maxDeg */
  /* the leg's top (hip, or the shoulder joint carried round by the blade) at phase ph, before any girdle drop; and the blade angle */
  const scapAngle = (J, ph, L) => { if (!L.scap) return 0; const P = pawAt(((ph % 1) + 1) % 1, J[3], L, 0), half = WALK.speed * L.duty / 2, c = J[3][0] + L.centre; return -L.scap.swing * Math.max(-1, Math.min(1, (P.p[0] - c) / half)); };
  const rootAt = (J, ph, L) => { if (!L.scap) return J[0]; const a = scapAngle(J, ph, L) * Math.PI / 180, o = L.scap.top, dx = J[0][0] - o[0], dy = J[0][1] - o[1]; return [o[0] + dx * Math.cos(a) - dy * Math.sin(a), o[1] + dx * Math.sin(a) + dy * Math.cos(a)]; };
  const dropFor = (J, ph, L) => { const P = pawAt(((ph % 1) + 1) % 1, J[3], L, 0); if (!P.stance) return 0; const R0 = rootAt(J, ph, L), l1 = Ln(J[0], J[1]), l2 = Ln(J[1], J[2]), l3 = Ln(J[2], J[3]), reach = reachOf(l1, l2, L.maxOpen);
    const base = A(J[2], J[3]) + 180; let best = Infinity; /* the hock (or wrist) may open by up to L.lean degrees to reach, as at push-off */
    for (let o = -(L.lean || 0); o <= (L.lean || 0); o += 1){ const low = pol(P.p, base + o, l3), dx = low[0] - R0[0]; best = Math.min(best, Ln(R0, low) <= reach ? 0 : Math.max(0, (low[1] - R0[1]) - Math.sqrt(Math.max(0, reach * reach - dx * dx)))); }
    return best; };
  /* the pair shares one girdle: the pendulum dip (lowest 5% after each touchdown, highest over mid-stance), or deeper if a planted paw needs the reach */
  const pend = (ph, L) => WALK.crouch + L.bob * (.5 + .5 * Math.cos(4 * Math.PI * (ph - .05)));
  const girdle0 = (J, ph, L) => Math.max(pend(ph, L), dropFor(J, ph, L), dropFor(J, ph + .5, L));
  /* smoothed over +-2 keys: the reach drop ends when the paw lifts, and unsmoothed the hips jumped up at that instant (the "kick", GrumpyDingo Oct 8) */
  const girdle = (J, ph, L) => Math.max(girdle0(J, ph, L), [1, 4, 6, 4, 1].reduce((a, w, i) => a + w * girdle0(J, ph + (i - 2) / WALK.keys, L), 0) / 16); /* never less than a planted paw needs */
  const bakeLeg = (J, names, side, L, toeTr) => { /* J = [top, mid, low, paw] rest joints; names = [top, mid, low, toe] track names */
    const l1 = Ln(J[0], J[1]), l2 = Ln(J[1], J[2]), l3 = Ln(J[2], J[3]), r1 = A(J[0], J[1]), r2 = A(J[1], J[2]), r3 = A(J[2], J[3]);
    const T = names.map(() => []);
    for (let k = 0; k <= WALK.keys; k++) { const ph = k / WALK.keys, P = pawAt(ph % 1, J[3], L, L.lift), g = girdle(J, ph, L), sa = scapAngle(J, ph, L), R0 = rootAt(J, ph, L), J0 = [R0[0], R0[1] + g];
      const foldDeg = P.stance ? 0 : L.fold * Math.sin(Math.PI * Math.min(1, P.u * 1.25)); /* the distal bone folds back early in the swing, straightens to land */
      let a3 = r3 + side * -foldDeg; /* hind (side +1): cannon swings back; front (side -1): pastern swings back too, folding the wrist */
      /* out of reach (the paw far back or far forward in the stance): lean the distal bone about the paw, the least that brings it in */
      const reach = reachOf(l1, l2, L.maxOpen), leanFor = (J0, p, a) => { for (let o = 0; o <= (L.lean || 0) + .5; o += .25) { const t = [o, -o].find(x => Ln(J0, pol(p, a + x + 180, l3)) <= reach); if (t != null) return t; } return Ln(J0, pol(p, a + L.lean + 180, l3)) < Ln(J0, pol(p, a - L.lean + 180, l3)) ? L.lean : -L.lean; };
      /* front: in the stance the forearm and pastern move as one near-straight column (the paw turns at the toes), so the pastern angle is solved
         to keep the wrist at L.carpusHold, instead of a fixed pastern slope the forearm swings over (which bent the wrist one way then the other) */
      const carpusAt = (e, w, p) => { let t = (A(w, p) - A(e, w)); while (t > 180) t -= 360; while (t < -180) t += 360; return 180 - t; };
      const holdA3 = (J0, p) => { let best = null; for (let o = -60; o <= 60; o += .5) { const a = r3 + o, lo = pol(p, a + 180, l3); if (Ln(J0, lo) > reach) continue;
          const c = carpusAt(twoBone(J0, l1, l2, lo, side, reach), lo, p), cost = Math.abs(c - L.carpusHold) + .002 * o * o; if (!best || cost < best.cost) best = {a, cost}; } return best ? best.a : a3 + leanFor(J0, p, a3); };
      if (P.stance) a3 = L.carpusHold ? holdA3(J0, P.p) : a3 + leanFor(J0, P.p, a3);
      else { /* the push-off lean carries into the swing and eases out over its first 40%, so the hock never snaps back as the paw lifts */
        const e = L.duty - 1e-4, Pe = pawAt(e, J[3], L, L.lift), Re = rootAt(J, e, L), Je = [Re[0], Re[1] + girdle(J, e, L)], oe = L.carpusHold ? holdA3(Je, Pe.p) - r3 : leanFor(Je, Pe.p, r3), w = Math.max(0, 1 - P.u / .4);
        a3 += oe * w * w * (3 - 2 * w);
        if (L.carpusHold) { const P0 = pawAt(0, J[3], L, L.lift), R1 = rootAt(J, 1, L), s0 = holdA3([R1[0], R1[1] + girdle(J, 1, L)], P0.p), q = Math.max(0, Math.min(1, (P.u - .65) / .35)), bq = q * q * (3 - 2 * q);
          a3 = a3 * (1 - bq) + s0 * bq; } } /* the pastern eases into its touchdown angle over the last third of the swing, so the wrist lands without a snap */
      let pp = P.p; { const lo = pol(pp, a3 + 180, l3), d = Ln(J0, lo); if (!P.stance && d > reach){ const k = (d - reach) / d; pp = [pp[0] + (J0[0] - lo[0]) * k, pp[1] + (J0[1] - lo[1]) * k]; } } /* a swinging paw out of reach is drawn in toward the hip */
      const low = pol(pp, a3 + 180, l3), mid = twoBone(J0, l1, l2, low, side, reachOf(l1, l2, L.maxOpen)); /* never past the walk maximum, swing included */
      const a1 = A(J0, mid), a2 = A(mid, low), rot1 = a1 - r1 - sa, rot2 = (a2 - r2) - (a1 - r1), rot3 = (a3 - r3) - (a2 - r2); /* rot1 is relative to the blade */
      const toe = P.stance ? -(a3 - r3) : -(a3 - r3) * .55 + (toeTr ? RIG.sample(toeTr, ph).v * .5 : 0); /* paw flat on the ground in stance; hangs and peels in the swing */
      [rot1, rot2, rot3, toe].forEach((v, i) => T[i].push(Object.assign({at:+ph.toFixed(4), v:+v.toFixed(3)}, i === 0 && !L.scap ? {y:+g.toFixed(3)} : {})));
      if (L.scap) (T.scap ||= []).push({at:+ph.toFixed(4), v:+sa.toFixed(3), y:+g.toFixed(3)}); } /* the blade carries the girdle drop */
    const out = Object.fromEntries(names.map((n, i) => [n, T[i]])); if (L.scap) out.fscap = T.scap; return out;
  };
  const BODY_PIVOT = [31, 18], bodyTrack = [], tailTrack = [], HJ = [H.hip, H.stifle, H.hock, H.paw], FJ = [Fj.sh, Fj.elbow, Fj.past, Fj.paw];
  for (let k = 0; k <= WALK.keys; k++) { const ph = k / WALK.keys, dH = girdle(HJ, ph, WALK.hind), dF = girdle(FJ, ph + 1 - WALK.limbPhase, WALK.front);
    const span = Fj.sh[0] - H.hip[0], yAt = x => dH + (dF - dH) * (x - H.hip[0]) / span;
    bodyTrack.push({at:+ph.toFixed(4), v:+(Math.atan2(dF - dH, span) * 180 / Math.PI).toFixed(3), y:+yAt(BODY_PIVOT[0]).toFixed(3)});
    /* tail: the base follows the hips' dip 15% of a stride late (overlap), a few degrees, so it trails the body instead of wagging on its own clock */
    const lag = girdle(HJ, ph - .15 + 1, WALK.hind); tailTrack.push({at:+ph.toFixed(4), v:+(-(lag - WALK.hind.bob / 2) * 9).toFixed(3)}); }
  const headTrack = []; for (let k = 0; k <= WALK.keys; k++) { const ph = k / WALK.keys, pf = ph + 1 - WALK.limbPhase - WALK.head.lag; /* the near front's stride phase, a little late */
    headTrack.push({at:+ph.toFixed(4), v:+(WALK.head.pitch + WALK.head.bob * Math.cos(4 * Math.PI * (pf - .05))).toFixed(3)}); }
  const walkTracks = Object.assign({bodyWalk:bodyTrack, tailWalk:tailTrack, headWalk:headTrack},
    bakeLeg(HJ, ["hhip", "hshank", "hmeta", "htoe"], 1, WALK.hind, H2.tracks.htoe),
    bakeLeg(FJ, ["fsh", "ffore", "fpast", "ftoe"], -1, WALK.front, H2.tracks.ftoe));

  RIG.define("hero3", {
    stride:1, gait:{duty:WALK.front.duty, hindDuty:WALK.hind.duty, limbPhase:WALK.limbPhase, speed:WALK.speed}, landmarks:{scapTop:{at:[38.8, 11.8], in:"body", note:"top of the shoulder blade (EST), for measuring the shoulder angle"}}, tracks:Object.assign({}, H2.tracks, walkTracks),
    palette:{fur:"#918a7f", saddle:"#625a51", tan:"#a8947a", leg:"#9f8f79", pale:"#ece6da", pale2:"#c8baa4", furDark:"#3f3933", ink:"#1e1a16", far:.74},
    joints:[
      ...hind("F", 0, true), ...front("F", 1 - WALK.limbPhase, true), /* rig.js runs a leg with phase offset +x AHEAD by x, so a fore that lands 0.16 AFTER its hind gets 1 - 0.16 (hero2's +0.25 was a diagonal-sequence walk) */
      {id:"vault", at:BODY_PIVOT, track:"bodyWalk", in:"root"}, {id:"body", in:"vault"}, /* the body vaults over the planted legs (girdle drops); the vault is its own joint so the body keeps drawing over its tail and ear roots (rig.js draws an animated joint's parts under its children) */
      {id:"tail", at:[21.4, 14.0], track:"tailWalk", in:"body"},
      {id:"headBody", at:HEAD_PIVOT, track:"headWalk", in:"body"}, /* no parts: carries the head's dip inside the body, for the skinned chest front (drawn under the near legs) */
      ...hind("N", .5, false), ...front("N", .5 - WALK.limbPhase, false),
      /* the head and neck draw after the near legs, so the jaw and throat sit in front of the top of the near upper arm (GrumpyDingo's tag: it
         poked out in front of the face once the head dipped). They ride a twin of the body's vault so they move with the body exactly. */
      {id:"vaultHead", at:BODY_PIVOT, track:"bodyWalk", in:"root"}, {id:"bodyHead", in:"vaultHead"},
      {id:"head", at:HEAD_PIVOT, track:"headWalk", in:"bodyHead"}, {id:"skull", in:"head"}, /* skull is static so the ear roots stay under the head (rig.js draws an animated joint's parts under its children) */
      {id:"earFar", at:[42.95, 10.1], in:"skull"}, {id:"earNear", at:[45.15, 9.7], in:"skull"}],
    parts:[
      ...legParts("F"),
      tail, tailTop, tailTip,
      {d:earFar, in:"earFar"},
      {d:earNear, in:"earNear", paint:"tan"}, {d:earIn, in:"earNear", paint:"pale", id:"earIn"}, /* (ear and tail joints draw under all body parts in rig.js) */
      {poly:P2(flat(body)), in:"body", id:"outlineRef", hidden:true, ref:true} /* never drawn: the unsplit body outline, for dogcheck */, {poly:neckFur, in:"skull", id:"neck"}, ...neckOf(saddle).length > 2 ? [{poly:neckOf(saddle), in:"skull", paint:"saddle", id:"saddleNeck"}] : [], {poly:P2(above(neckOf(chest), NECK_Y + .2)), in:"skull", paint:"pale", id:"throat", markOn:"outlineRef" /* it lies over the body's own pale chest, not only the neck fur: checked against the whole body outline */, mayHide:true /* tucks behind the chest as the head drops */},
      {d:cheek, in:"skull", paint:"pale", id:"cheek"},
      ...torsoOf(body).map(([t, P]) => ({poly:P, in:"body", id:{A:"body", B:"bodyChest", C:"bodyFront"}[t]})),
      ...torsoOf(saddle).map(([t, P]) => ({poly:P, in:"bodyHead", paint:"saddle", id:{A:"saddle", B:"saddle2", C:"saddle3"}[t]})) /* the saddle draws over the near legs (bodyHead moves exactly with the body), so the thigh's top never shows over its edge as the hip swings (GrumpyDingo's tag, ~49%) */, ...torsoOf(chest).map(([t, P]) => ({poly:P, in:"body", paint:"pale", id:{A:"bibTop", B:"bib", C:"bibC"}[t], mayHide:true /* the pale under-layers: the skinned chest front and the near leg cover them in places */})),
      /* the skinned chest front: fur, then its pale bib, bending between the body and the head */
      {...chestSkin(body), in:"body", id:"chestFront"}, {...chestSkin(chest), in:"body", paint:"pale", id:"chestFrontPale", markOn:"outlineRef"},
      {d:belly, in:"body", paint:"pale", id:"belly"},
            {d:muzzleTop, in:"skull", paint:"tan", id:"muzzleTop"},
      {ellipse:[45.65, 11.3, .72, .44], in:"skull", paint:"ink", id:"eye"}, {ellipse:[49.8, 14.45, .62, .68], in:"skull", paint:"ink", id:"nose"},
      ...legParts("N")],
    states:{
      "ears-back":[{joint:"earFar", rot:-40}, {joint:"earNear", rot:-40}],
      "ears-up":[{joint:"earFar", rot:6}, {joint:"earNear", rot:6}],
      howl:[{joint:"earFar", rot:-28}, {joint:"earNear", rot:-28}]
    }
  });
}
if (typeof module !== "undefined") module.exports = {registerHero3};
