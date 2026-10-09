/* The Den's rigs as data. The hero: GrumpyDingo's approved Carolina Dog (Den Dingo Workbench), 62×38 drawing space, two-tone. */
function registerDenRigs(RIG){
  const line = (a, b, sw, extra) => Object.assign({line:[a, b], sw}, extra || {});
  const paw = (p, extra) => Object.assign({ellipse:[p[0] + .8, p[1] + .4, 2, 1.05]}, extra || {});
  /* the CSS walk rig's keyframes, verbatim (degrees; ease "io" eases into the next key) */
  const tracks = {
    hhip:[{at:0, v:-16}, {at:.62, v:15, ease:"io"}, {at:1, v:-16}],
    hshank:[{at:0, v:0}, {at:.58, v:0}, {at:.76, v:34}, {at:.94, v:0}, {at:1, v:0}],
    hmeta:[{at:0, v:0}, {at:.58, v:0}, {at:.76, v:-30}, {at:.9, v:6}, {at:1, v:0}],
    fsh:[{at:0, v:-18}, {at:.62, v:16, ease:"io"}, {at:1, v:-18}],
    ffore:[{at:0, v:0}, {at:.6, v:0}, {at:.78, v:-14}, {at:1, v:0}],
    fpast:[{at:0, v:0}, {at:.58, v:0}, {at:.74, v:85}, {at:.9, v:-12}, {at:1, v:0}],
    wag:[{at:0, v:-8, ease:"io"}, {at:.5, v:10, ease:"io"}, {at:1, v:-8}],
    /* toes: the front paw peels off the ground at push-off (heel lifts, toes stay down, so the paw counter-rotates against the pastern), then flicks forward; the hind paw plants flatter */
    ftoe:[{at:0, v:0}, {at:.58, v:0}, {at:.74, v:-48}, {at:.9, v:10}, {at:1, v:0}],
    htoe:[{at:0, v:0}, {at:.58, v:0}, {at:.76, v:-22}, {at:.9, v:6}, {at:1, v:0}]
  };
  const hind = (k, ph, far) => [
    {id:"hip" + k, at:[18, 17], track:"hhip", ph, far, in:"root"},
    {id:"shank" + k, at:[21, 23], track:"hshank", ph, in:"hip" + k},
    {id:"meta" + k, at:[17, 28], track:"hmeta", ph, in:"shank" + k}];
  const front = (k, ph, far) => [
    {id:"sh" + k, at:[38, 15], track:"fsh", ph, far, in:"root"},
    {id:"fore" + k, at:[38, 22], track:"ffore", ph, in:"sh" + k},
    {id:"past" + k, at:[38.4, 30], track:"fpast", ph, in:"fore" + k}];
  const legParts = k => [
    line([18, 17], [21, 23], 4, {in:"hip" + k}), line([21, 23], [17, 28], 2.8, {in:"shank" + k}), line([17, 28], [18.4, 34.5], 2.3, {in:"meta" + k, paint:"pale2"}), paw([18.4, 34.5], {in:"meta" + k, paint:"pale2"}),
    line([38, 15], [38, 22], 3.6, {in:"sh" + k}), line([38, 22], [38.4, 30], 2.6, {in:"fore" + k, paint:"pale2"}), line([38.4, 30], [39.4, 34.5], 2.3, {in:"past" + k, paint:"pale2"}), paw([39.4, 34.5], {in:"past" + k, paint:"pale2"})];
  const body = "M14 15 C16 11.5 26 11 36 12 C39.5 10 41.5 7.5 43.5 6 C45 4.5 47.5 4 49.5 5 C52 6 55 8.5 57.5 10 C58 11 57 12.5 55.5 12.6 C53 13 50.5 13.4 48 12.8 C46.5 13.5 45 15 44 17.5 C43.6 19.5 42.8 21.5 41.5 23 C36 23.8 29 23.6 23 21.5 C19 20.5 15.5 21.5 13.5 20 C12.5 18.5 12.3 16.5 14 15 Z";
  const tail = "M13.5 16.5 C9.5 19.5 8 25 9 30.5 C9.3 32.3 11.2 32 11.2 30.3 C10.6 25.5 12 21.5 15.5 18.5 Z";
  /* the pale underside is cut from the tail's own inner edge, inset a little, so it can never poke past the tan (GrumpyDingo, Oct 3) */
const tailUnder = "M11.1 29.6 C10.7 25.6 12.1 22 15 19.3 L14.1 19.3 C11.3 21.9 9.9 25.4 10.3 29.4 Z";
  const earFar = "M41.6 9.2 L43.8 0.8 L46.6 6 Z", earNear = "M44.2 6.8 L47.4 -0.8 L49.2 6 Z", earIn = "M45.4 6 L47.3 1.2 L48.2 5.6 Z";
  const chest = "M47 13 C45.5 14.5 44.4 16.5 43.8 19 C43.2 21 42.4 22.5 41.5 23 C36 23.8 29 23.6 23 21.5 L23.6 20 C29.5 21.8 36 22 40.6 21.4 C41.8 19.5 42.4 17.5 43 15.5 C43.8 14 45.2 13.2 47 13 Z";
  const muzzle = "M49.5 8.6 C52 9.4 55 10.6 57.3 11.4 C56.6 12.4 55 12.7 53 12.9 C51 13.1 49.4 13 48.2 12.6 C48.4 11 48.8 9.6 49.5 8.6 Z";
  const band = "M38.9 10 L40.9 8.4 C43.6 9.9 45.5 11.9 46.6 14.1 L45.2 15.9 C44 13.7 42.1 11.5 38.9 10 Z";
  RIG.define("hero", {
    stride:1, tracks,
    palette:{fur:"#dca45e", pale:"#f6e9cf", pale2:"#f0dcb4", ink:"#2a1a10", collar:"#3f8a4f", tag:"#d9a441", tag2:"#8a5a1a", furDark:"#b8773a", far:.78},
    joints:[
      ...hind("F", 0, true), ...front("F", .25, true),
      {id:"body", bob:1.2, in:"root"},
      {id:"tail", at:[15.5, 16.5], track:"wag", period:1.4, in:"body"},
      {id:"earFar", at:[44.1, 7.6], in:"body"}, {id:"earNear", at:[46.7, 6.4], in:"body"},
      ...hind("N", .5, false), ...front("N", .75, false)],
    parts:[
      ...legParts("F"),
      {d:tail, in:"tail"}, {d:tailUnder, in:"tail", paint:"pale"},
      {d:body, in:"body", id:"body"},
      {d:earFar, in:"earFar"}, {d:earNear, in:"earNear"}, {d:earIn, in:"earNear", paint:"pale"},
      {d:chest, in:"body", paint:"pale"}, {d:muzzle, in:"body", paint:"pale"},
      {circle:[51, 7.6, .9], in:"body", paint:"ink"}, {circle:[57.2, 10.2, 1], in:"body", paint:"ink"},
      {d:band, in:"body", paint:"collar"}, {circle:[45.8, 15, .7], in:"body", paint:"tag"}, {circle:[45.8, 15, .35], in:"body", paint:"tag2"},
      ...legParts("N")],
    states:{
      "ears-back":[{joint:"earFar", rot:-55}, {joint:"earNear", rot:-55}],
      "ears-up":[{joint:"earFar", rot:8}, {joint:"earNear", rot:8}],
      howl:[{joint:"earFar", rot:-30}, {joint:"earNear", rot:-30}]
    }
  });

  /* ===== hero, second pass (Oct 3): redrawn against Carolina Dog references GrumpyDingo supplied (skeleton, outline, side art).
     Limbs are tapered capsules (thigh and upper arm have mass, shanks are thin), the body has a deep chest and a tuck-up, the croup
     slopes to a tail that hangs behind the hocks and hooks forward, the head is a wedge with a stop and high-set ears. Same joints,
     same tracks, same states, so the gait and the tells carry over. ===== */
  const f2 = v => (+v).toFixed(2);
  /* a tapered capsule from a to b, w0 wide at a and w1 wide at b: a polygon with sampled round ends (no arcs, so it can't flip) */
  const limb = (a, b, w0, w1, extra) => { const dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1, ux = dx / m, uy = dy / m, nx = -uy, ny = ux, r0 = w0 / 2, r1 = w1 / 2, pts = [];
    for (let i = 0; i <= 8; i++){ const t = Math.PI * i / 8; pts.push([b[0] + (nx * Math.cos(t) + ux * Math.sin(t)) * r1, b[1] + (ny * Math.cos(t) + uy * Math.sin(t)) * r1]); } /* +n → +u (beyond b) → −n */
    for (let i = 0; i <= 8; i++){ const t = Math.PI + Math.PI * i / 8; pts.push([a[0] + (nx * Math.cos(t) + ux * Math.sin(t)) * r0, a[1] + (ny * Math.cos(t) + uy * Math.sin(t)) * r0]); } /* −n → −u (behind a) → +n */
    return Object.assign({poly:pts.map(q => [+f2(q[0]), +f2(q[1])])}, extra || {}); };
  /* a compact paw on a toe joint at p: a rounded wedge from a small heel to arched toes, standing on the ground line (p.y + 1) */
  const pawShape = (p, extra) => { const [x, y] = p; const d = `M${f2(x - 1.1)} ${f2(y - .3)} C${f2(x - 1.6)} ${f2(y + .4)} ${f2(x - 1.2)} ${f2(y + 1.05)} ${f2(x - .2)} ${f2(y + 1.05)} L${f2(x + 2.1)} ${f2(y + 1.05)} C${f2(x + 2.9)} ${f2(y + 1.05)} ${f2(x + 3.0)} ${f2(y + .2)} ${f2(x + 2.2)} ${f2(y - .25)} C${f2(x + 1.6)} ${f2(y - .75)} ${f2(x + .7)} ${f2(y - 1.0)} ${f2(x - .2)} ${f2(y - .75)} C${f2(x - .6)} ${f2(y - .6)} ${f2(x - .9)} ${f2(y - .45)} ${f2(x - 1.1)} ${f2(y - .3)} Z`; return Object.assign({d}, extra || {}); };
  /* toe line cut, Oct 3 (GrumpyDingo: not sure on it) */
  const toeLine = (p, extra) => Object.assign({d:`M${f2(p[0] + 1.0)} ${f2(p[1] - .55)} C${f2(p[0] + 1.1)} ${f2(p[1] + .1)} ${f2(p[0] + 1.1)} ${f2(p[1] + .6)} ${f2(p[0] + 1.0)} ${f2(p[1] + 1.0)}`, stroke:true, sw:.3, alpha:.35}, extra || {});
  const paw2 = pawShape; /* (kept name) */
  /* Proportions measured off GrumpyDingo's flipped side-view reference (a near-square, leggy dog: body a third of its height deep,
     legs long, head carried high, big ears, the tail curled up over the croup). Our own drawing to those proportions, nothing traced.
     Box: the dog fills x 11..52, y 0..35.5. Joints: hip in the rump, stifle back and down, hock, paw trailing; front leg straight under the shoulder. */
  /* hind leg per the standard: upper and lower thigh equal, hock just behind the point of the buttock, leg set under the dog, rear pastern longer than the front one */
  /* standing square: the rear pastern is vertical (hock straight above the paw) and the hock sits just behind the point of the buttock (x≈17.5) */
  /* Oct 3, measured off GrumpyDingo's studio photo (flipped): the stifle sits LOW, about a third of the dog's height off the ground, and the
     hock about a fifth; the thigh is a long broad wedge from the croup, the gaskin shorter and angled back, the cannon short and vertical.
     Our earlier leg had the stifle at 54% and the hock at 36%: a long thin cannon, the "chicken leg". Height 24.5 (withers 11 → ground 35.5). */
  const H = {hip:[20.6, 17.8], stifle:[24.4, 26.2], hock:[19.4, 29.8], paw:[20.3, 34.5]}; /* the stifle is the centre of the thigh's knee cap */
  /* front leg: shoulder joint at the point of the chest, upper arm back-and-down to the elbow at the brisket, forearm straight, pastern leaning forward ~17° */
  /* GrumpyDingo, Oct 3: the pastern must not angle OUT. Forearm straight down from the elbow, pastern nearly vertical (a few degrees of lean,
     not the 17° we had), and the wrist only ever folds back, never forward past straight. */
  const Fj = {sh:[42.6, 15.4], elbow:[40.0, 21.8], past:[40.4, 30.4], paw:[40.8, 34.5]};
  /* the thigh is not a tube: it is the lower half of the rump. Its rear edge continues the croup line straight down toward the hock
     (one unbroken buttock line, from GrumpyDingo's path photo), its front edge drops from the tuck to the low stifle. Top sits inside the body. */
  /* GrumpyDingo, Oct 3: the round of the thigh must sit flush with the end of the dog, standing AND walking. The body keeps the rump
     outline down to y≈16; below that the thigh's rear edge IS the outline, and at rest the two are one line. The hip pivot sits right
     at that hand-over, so the swing barely opens the seam; the thigh's top is inset inside the body so it never pokes out behind the croup. */
  const THIGH = [[21.6, 14.4], [19.4, 15.0], [18.2, 16.0], [17.7, 17.4], [17.8, 19.6], [18.3, 22.4], [19.2, 25.2], [20.8, 26.6], [22.4, 26.2], [22.9, 27.5], [24.4, 28.2], [25.9, 27.5], [26.4, 26.2], [26.2, 24.6], [25.6, 22.0], [25.0, 18.8], [24.4, 17.0], [23.6, 15.2]]; /* bottom = knee cap, radius 2 around the stifle */ /* bottom = a round knee cap around the stifle, so the gaskin's top stays inside it as it bends */
  /* second thigh (gaskin): a tapered capsule from the stifle to the hock. Its round top (radius 1.8) sits inside the thigh's knee cap
     (radius 2) about the SAME centre, so the knee stays closed at any bend; its hock end is the point of the hock. */
  const hind2 = (k, ph, far) => [
    {id:"hip" + k, at:H.hip, track:"hhip", ph, far, in:"root"},
    {id:"shank" + k, at:H.stifle, track:"hshank", ph, in:"hip" + k},
    {id:"meta" + k, at:H.hock, track:"hmeta", ph, in:"shank" + k},
    {id:"htoe" + k, at:H.paw, track:"htoe", ph, in:"meta" + k}];
  const front2 = (k, ph, far) => [
    {id:"sh" + k, at:Fj.sh, track:"fsh", ph, far, in:"root"},
    {id:"fore" + k, at:Fj.elbow, track:"ffore", ph, in:"sh" + k},
    {id:"past" + k, at:Fj.past, track:"fpast", ph, in:"fore" + k},
    {id:"ftoe" + k, at:Fj.paw, track:"ftoe", ph, in:"past" + k}];
  const legParts2 = k => [
    {poly:THIGH, in:"hip" + k}, limb(H.stifle, H.hock, 3.6, 2.2, {in:"shank" + k}), limb(H.hock, H.paw, 2.2, 1.9, {in:"meta" + k, paint:"pale2"}), {circle:[H.hock[0], H.hock[1], 1.1], in:"meta" + k} /* a fur disc the size of the gaskin's hock cap hides the pale cannon's top; the pale starts under the hock */, pawShape(H.paw, {in:"htoe" + k, paint:"pale2"}),
    limb(Fj.sh, Fj.elbow, 4.8, 2.8, {in:"sh" + k}), limb(Fj.elbow, Fj.past, 2.5, 1.9, {in:"fore" + k, paint:"pale2"}), limb(Fj.elbow, [Fj.elbow[0], Fj.elbow[1] + .7], 2.9, 2.4, {in:"fore" + k}), /* the elbow point, drawn over the forearm: fur-coloured, so the pale starts at the brisket */ limb(Fj.past, Fj.paw, 1.9, 1.6, {in:"past" + k, paint:"pale2"}), pawShape(Fj.paw, {in:"ftoe" + k, paint:"pale2"})];
  /* body: croup → back → withers → neck → skull → stop → muzzle → nose → lip → jaw → throat → chest → brisket → belly → flank → rump
     chest line: the throat drops steeply, the forechest (prosternum) holds forward at shoulder level, then sweeps down and back to the brisket under the elbow (deepest just behind the front leg) */
  /* head per the standard: a triangle, muzzle as long as the skull, a slight but distinct stop, a crested neck entering the skull at the back.
     Points: withers (37.2,11) → crest → occiput (42.6,5.8) → skull top → stop (47.2,5.4) → muzzle top → nose (53.6,8.6) → lip → jaw (47.6,10.8) → throat */
  const body2 = "M23.2 11.6 C27 11.9 33 12.1 37.2 11.0 C39.4 10.0 41.2 8.0 42.6 5.8 C43.6 4.3 45.6 3.9 47.2 5.4 L47.6 5.9 C49.6 6.3 51.8 7.4 53.6 8.6 C54.0 9.1 53.8 9.7 53.1 9.9 C51.4 10.4 49.5 10.8 47.6 10.8 C46.8 11.6 46.2 12.6 46.0 13.8 C46.3 15.2 46.4 16.6 45.8 18.2 C45.0 20.6 43.0 22.6 40.2 23.2 C39.0 23.3 37.8 23.1 36.6 22.8 C33 22.5 28 21.6 25.0 19.8 C23.4 18.9 21.4 18.4 19.6 17.6 C17.6 16.4 17.4 14.0 19.6 12.8 C20.8 12.1 22.2 11.7 23.2 11.6 Z";
  /* a tapered ribbon along a smooth curve through pts (Catmull-Rom), w0 wide at the start, w1 at the end; `side` = 1 or -1 keeps only one half (for the pale underside) */
  const ribbon = (pts, w0, w1, side, extra) => { const P = [pts[0], ...pts, pts[pts.length - 1]], c = [];
    for (let i = 1; i < P.length - 2; i++){ const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]]; for (let k = 0; k < 10; k++){ const t = k / 10, t2 = t * t, t3 = t2 * t; c.push([0, 1].map(j => .5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } } c.push(pts[pts.length - 1]);
    const L = [], R = []; for (let i = 0; i < c.length; i++){ const a0 = c[Math.max(0, i - 1)], b0 = c[Math.min(c.length - 1, i + 1)]; let dx = b0[0] - a0[0], dy = b0[1] - a0[1]; const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m; const u = i / (c.length - 1), w = (w0 + (w1 - w0) * u) / 2;
      L.push([c[i][0] - dy * w * (side === -1 ? 0 : 1), c[i][1] + dx * w * (side === -1 ? 0 : 1)]); R.push([c[i][0] + dy * w * (side === 1 ? 0 : 1), c[i][1] - dx * w * (side === 1 ? 0 : 1)]); }
    return Object.assign({poly:[...L, ...R.reverse()].map(q => [+f2(q[0]), +f2(q[1])])}, extra || {}); };
  /* tail: the Carolina fishhook. Thick at the croup, rising and leaning back, hooking over at the top, the thin tip hanging behind. */
  /* GrumpyDingo's references (Oct 3, five photos + outline): a Carolina Dog carries the tail OUT behind and a little up, continuing the spine,
     and the last third bends UP and AWAY from the body: the fishhook. A tail that bends in toward the body reads as an upset dog, so the hook
     always turns outward. Alert dogs raise it to a sickle; ours is the relaxed carry: out, slightly up, tip hooking up behind the croup, never over the back. */
  const TAILC = [[23.4, 13.6], [19.6, 14.6], [15.6, 14.6], [12.2, 13.0], [10.2, 10.4], [9.8, 7.8], [11.0, 6.2]];
  const tailRibbon = ribbon(TAILC, 3.8, 1.8, 0, {in:"tail"}), tailPale = ribbon(TAILC, 3.8, 1.8, -1, {in:"tail", paint:"pale"}); /* pale = underside: the bottom edge at the root, the outer (convex) edge of the hook */
  /* (old curl, kept for reference) */
  const tail2 = "M22.4 12.0 C21.4 8.8 20.8 5.0 18.2 2.8 C15.8 1.0 12.4 2.4 11.8 5.2 C11.5 6.8 12.4 7.9 13.3 7.4 C13.6 5.8 15.1 4.8 16.7 5.6 C18.5 6.8 19.3 9.6 20.2 12.2 Z";
  const tailUnder2 = "M14.0 7.1 C14.3 5.9 15.4 5.2 16.6 5.8 C18.1 6.9 18.9 9.4 19.7 12.1 L18.9 12.1 C18.1 9.9 17.4 7.8 16.2 6.8 C15.4 6.3 14.6 6.6 14.0 7.1 Z";
  /* ears set at the BACK of the skull (skill §1), bases buried in the skull outline so no gap shows at the stop; big, triangular, rounded tips */
  const earFar2 = "M42.3 6.5 C42.3 3.6 42.5 1.2 43.1 -0.4 C43.3 -0.7 43.7 -0.7 43.8 -0.3 C44.5 1.8 44.7 3.6 44.6 5.4 Z", earNear2 = "M42.8 6.2 C43.2 2.8 43.8 .4 44.7 -1.5 C44.9 -1.8 45.3 -1.8 45.4 -1.4 C46.2 .8 46.5 2.8 46.4 4.8 Z", earIn2 = "M43.7 5.6 C44.0 3.2 44.4 1.6 45.0 .2 C45.6 1.7 45.8 3.2 45.8 4.6 Z";
  const chest2 = "M47.4 11.0 C46.8 11.8 46.3 12.8 46.1 13.8 C46.4 15.2 46.5 16.6 45.9 18.2 C45.1 20.5 43.1 22.5 40.4 23.1 L40.4 22.0 C42.4 21.6 43.9 20.0 44.6 18.0 C45.1 16.5 45.0 15.1 44.8 13.9 C45.0 12.8 45.6 11.9 46.4 11.0 Z";
  const muzzle2 = "M48.0 9.2 C49.8 9.9 51.6 10.0 53.1 9.9 C51.4 10.4 49.5 10.8 47.6 10.8 C47.6 10.2 47.7 9.7 48.0 9.2 Z";
  /* angel wing: a pale sweep lying along the shoulder blade (withers down-forward to the shoulder joint), broad at the top,
     trailing back over the ribs to a feathered point, like a wing folded along the side. Inset under the topline so it never pokes out. */
  const wing2 = "M39.6 12.6 C40.6 13.6 40.4 15.4 38.8 16.6 C37.4 17.6 35.6 18.2 33.4 18.0 L34.4 17.4 C33.0 17.2 31.4 16.8 30.0 16.0 L31.4 15.7 C30.6 15.1 30.4 14.3 31.0 13.8 C32.2 13.0 33.6 12.6 35.0 12.5 C36.6 12.4 38.2 12.4 39.6 12.6 Z";
  /* base collar: a loop AROUND the neck, so it crosses the outline: the far side shows above the crest, the near side wraps under the throat */
  const band2 = "M39.60 9.41 Q39.79 8.35 40.73 7.81 C43.15 8.79 45.23 10.26 46.97 12.22 Q46.77 13.28 45.83 13.82 C44.10 11.86 42.02 10.39 39.60 9.41 Z"; /* Oct 4: 35.3° below horizontal (GrumpyDingo's red line), ends on the neck outline; tools/lens/place_band.py hero2 --through 43.4,10.9 --angle 35.3 --overhang .2 */
  /* hero2 tracks: the thigh is long and low-stifled, so the hip swings fewer degrees for the same stride (and the rump seam stays shut) */
  const tracks2 = Object.assign({}, tracks, {
    /* Walk (skill §4): a planted foot never slides, so the STANCE sweep (0 → .62) is linear; only the swing eases. Front and hind strides
       cover the same ground: hip lever 16.7 × ±13.5° ≈ 7.8 units, shoulder lever 19.2 × ±11.8° ≈ 7.8 units. */
    hhip:[{at:0, v:-13.5}, {at:.62, v:13.5, ease:"io"}, {at:1, v:-13.5}],
    fsh:[{at:0, v:-11.8}, {at:.62, v:11.8, ease:"io"}, {at:1, v:-11.8}],
    /* elbow: a dog FOLDS the elbow in the swing (forearm tucks back and up under the arm), then extends to reach just before the paw lands;
       it never opens past straight. Positive = forearm swings back. */
    ffore:[{at:0, v:0}, {at:.62, v:0}, {at:.8, v:18, ease:"io"}, {at:.95, v:-3}, {at:1, v:0}],
    /* wrist: folds back in the swing, lands straight; no forward overshoot */
    fpast:[{at:0, v:0}, {at:.58, v:0}, {at:.66, v:30}, {at:.78, v:70, ease:"io"}, {at:.92, v:0}, {at:1, v:0}],
    /* toes: peel at lift-off (heel up, toes still down), then the paw hangs from the folded wrist through the swing */
    ftoe:[{at:0, v:0}, {at:.58, v:0}, {at:.66, v:-40}, {at:.8, v:8}, {at:.92, v:0}, {at:1, v:0}]
  });
  RIG.define("hero2", {
    stride:1, tracks:tracks2,
    palette:{fur:"#dca45e", pale:"#f6e9cf", pale2:"#f0dcb4", wing:"#e8bc7c", ink:"#2a1a10", collar:"#3f8a4f", tag:"#d9a441", tag2:"#8a5a1a", furDark:"#b8773a", far:.78},
    joints:[
      ...hind2("F", 0, true), ...front2("F", .25, true),
      {id:"body", bob:.45, in:"root"}, /* a walk barely bobs; the old 1.2 bounced the whole dog */
      {id:"tail", at:[23.4, 13.6], track:"wag", period:1.4, in:"body"},
      {id:"earFar", at:[42.9, 6.0], in:"body"}, {id:"earNear", at:[44.9, 5.6], in:"body"},
      ...hind2("N", .5, false), ...front2("N", .75, false)],
    parts:[
      ...legParts2("F"),
      {d:body2, in:"body", id:"body"},
      tailRibbon, tailPale, {circle:[11.0, 6.2, .9], in:"tail"}, /* rounded tip on the ribbon's blunt end */
      {d:earFar2, in:"earFar"}, {d:earNear2, in:"earNear"}, {d:earIn2, in:"earNear", paint:"pale"},
      {d:wing2, in:"body", paint:"wing"}, /* the pale buff "angel wing" over the shoulder (UKC) */
      {d:chest2, in:"body", paint:"pale"}, {d:muzzle2, in:"body", paint:"pale"},
      {ellipse:[46.1, 7.1, .9, .6], in:"body", paint:"ink"} /* eye on the skull, just behind and below the stop; never on the muzzle */, {circle:[53.3, 8.7, .85], in:"body", paint:"ink"},
      {d:band2, in:"body", paint:"collar"}, {circle:[45.83, 14.67, .65], in:"body", paint:"tag"}, {circle:[45.83, 14.67, .32], in:"body", paint:"tag2"},
      ...legParts2("N")],
    states:{
      "ears-back":[{joint:"earFar", rot:-42}, {joint:"earNear", rot:-42}],
      "ears-up":[{joint:"earFar", rot:8}, {joint:"earNear", rot:8}],
      howl:[{joint:"earFar", rot:-30}, {joint:"earNear", rot:-30}]
    }
  });

  /* ===== the Meadow creatures (DEN-GAME-CREATURES.md). They face left in the drawing, so they use the mirrored (negated) walk tracks,
     exactly as the Workbench used the …L keyframes. Moods are states: "angry" swaps eyes / lifts wire / swells. ===== */
  const neg = tr => tr.map(k => Object.assign({}, k, k.v != null ? {v:-k.v} : {}));
  const T = {hhip:neg(tracks.hhip), hshank:neg(tracks.hshank), hmeta:neg(tracks.hmeta), fsh:neg(tracks.fsh), ffore:neg(tracks.ffore), fpast:neg(tracks.fpast),
    armsw:[{at:0, v:10, ease:"io"}, {at:.5, v:-14, ease:"io"}, {at:1, v:10}], armfo:[{at:0, v:-6, ease:"io"}, {at:.5, v:12, ease:"io"}, {at:1, v:-6}],
    nod:[{at:0, v:0, ease:"io"}, {at:.5, v:4, ease:"io"}, {at:1, v:0}],
    lurch:[{at:0, v:0, y:0, ease:"io"}, {at:.25, v:-2.5, y:-1.6, ease:"io"}, {at:.5, v:0, y:.4, ease:"io"}, {at:.75, v:2, y:-1.2, ease:"io"}, {at:1, v:0, y:0}],
    hover:[{at:0, y:0, ease:"io"}, {at:.5, y:-2.2, ease:"io"}, {at:1, y:0}],
    bob:[{at:0, y:0, ease:"io"}, {at:.5, y:-1.4, ease:"io"}, {at:1, y:0}],
    twitch:[{at:0, v:-12}, {at:.5, v:12}, {at:1, v:-12}]};
  const stroked = (d, paint, sw, extra) => Object.assign({d, stroke:true, paint, sw}, extra || {});
  /* a three-segment leg (hip, shank, meta) or two-segment (hip, shank); pts = [[hip],[knee],[hock],[foot]] */
  function leg3(k, pts, ws, ph, far, inJ){ const [h, kn, ho, ft] = pts; return {
    joints:[{id:"hip" + k, at:h, track:"hhip", ph, far, in:inJ || "root"}, {id:"shank" + k, at:kn, track:"hshank", ph, in:"hip" + k}, {id:"meta" + k, at:ho, track:"hmeta", ph, in:"shank" + k}],
    parts:[line(h, kn, ws[0], {in:"hip" + k}), line(kn, ho, ws[1], {in:"shank" + k}), line(ho, ft, ws[2], {in:"meta" + k})]}; }
  function leg2(k, pts, ws, ph, far, inJ){ const [h, kn, ft] = pts; return {
    joints:[{id:"hip" + k, at:h, track:"hhip", ph, far, in:inJ || "root"}, {id:"shank" + k, at:kn, track:"hshank", ph, in:"hip" + k}],
    parts:[line(h, kn, ws[0], {in:"hip" + k}), line(kn, ft, ws[1], {in:"shank" + k})]}; }
  const merge = (...L) => ({joints:L.flatMap(l => l.joints), parts:L.flatMap(l => l.parts)});

  /* ---- Hollowhorn: tall, lurching, deer skull, moss. healer ---- */
  (() => {
    const lg = (k, ph, far) => { const L = leg3(k, [[36, 22], [32, 27.5], [35, 32], [34.2, 35]], [3, 2, 1.7], ph, far, "body"); L.parts.push(stroked("M34.2 35 L30.6 36 M34.2 35 L32.6 36.8 M34.2 35 L35.6 36.6", "fur", 1, {in:"meta" + k})); return L; };
    const arm = (k, ph, far) => { const x = far ? 1.12 : 1, el = [16.5, 22 + 9 * x], dy = 9 * x - 9; return {
      joints:[{id:"arm" + k, at:[24, 13], track:"armsw", ph, far, in:"body"}, {id:"fore" + k, at:[20.5, 22], track:"armfo", ph, in:"arm" + k}],
      parts:[line([24, 13], [20.5, 22], 2.6, {in:"arm" + k}), line([20.5, 22], el, 2, {in:"fore" + k}), stroked(`M16.5 ${31 + dy} L13.6 ${34.2 + dy} M16.5 ${31 + dy} L15.8 ${34.8 + dy} M16.5 ${31 + dy} L18.2 ${34.4 + dy}`, "fur", 1.1, {in:"fore" + k})]}; };
    const F = lg("F", 0, true), AF = arm("F", .5, true), N = lg("N", .5, false), AN = arm("N", 0, false);
    RIG.define("hollowhorn", {stride:1.7, tracks:T,
      palette:{fur:"#5b3f2a", bone:"#e3d5b8", socket:"#2a1a10", moss:"#b7c48a", eye:"#f1e6b0", ember:"#ff8a3a", far:.72},
      joints:[{id:"body", at:[36, 22], track:"lurch", in:"root"}, ...F.joints, ...AF.joints, {id:"head", at:[23, 10], track:"nod", period:.85, in:"body"}, ...N.joints, ...AN.joints],
      parts:[...F.parts, ...AF.parts,
        {d:"M22.5 11.5 C19.8 15.5 21 21.5 25.5 24.8 C29.5 27.6 36.5 26.4 40.2 22.2 C43.6 18.2 41.6 11.6 36.4 8.4 C31.6 5.4 26 7 22.5 11.5 Z", in:"body"},
        {d:"M26.7 8.5 L23.6 5.6 L24.2 10.4 Z M30.9 7.3 L28.8 2.8 L27.4 8.2 Z M34.8 8.1 L34.8 4.0 L31.8 7.4 Z M40.1 12.9 L42.5 9.8 L38.3 10.5 Z", paint:"moss", in:"body"},
        {d:"M24 16 C23.4 20 25.4 23.6 28.6 25.2 C32 26.4 35.4 25 37.6 22.4 C34.2 23.4 30.2 22.6 27.6 19.6 C26.4 18 25.2 16.6 24 16 Z", paint:"moss", in:"body"},
        stroked("M18.6 9.6 L17.4 3.2 M17.8 5.8 L14 3.4 M17.6 4.2 L20.8 0.4 M20.8 0.4 L20 -2.2 M14 3.4 L11.8 4.4 M14.6 4.6 L13.2 1.6 M22 9 L22.8 5.4 L25 4.6", "bone", 1.1, {in:"head"}),
        {d:"M23.5 9.6 C21 7.4 15.4 8 11.6 12.4 C11.2 15.4 15 18.4 19.6 17.6 C23 17 24.6 13.2 23.5 9.6 Z", in:"head"},
        {d:"M23 9.8 C19.6 8 14.8 8.8 11.6 12.4 C11.2 14.8 13.6 17 16.8 17.4 C20.4 17.6 23 14.6 23 9.8 Z", paint:"bone", in:"head"},
        {ellipse:[14.9, 12.6, 1.7, 1.5], paint:"socket", in:"head"}, {ellipse:[18.7, 11.3, 1.15, 1.05], paint:"socket", in:"head"},
        {circle:[14.9, 12.7, .55], paint:"eye", in:"head", id:"eyeA"}, {circle:[18.7, 11.4, .45], paint:"eye", in:"head", id:"eyeB"},
        {circle:[14.9, 12.7, 1.9], paint:"eye", alpha:.22, in:"head", id:"glowA"}, {circle:[18.7, 11.4, 1.5], paint:"eye", alpha:.22, in:"head", id:"glowB"},
        {circle:[14.9, 12.7, .55], paint:"ember", in:"head", id:"eyeA2", hidden:true, state:1}, {circle:[18.7, 11.4, .45], paint:"ember", in:"head", id:"eyeB2", hidden:true, state:1},
        {circle:[14.9, 12.7, 1.9], paint:"ember", alpha:.22, in:"head", id:"glowA2", hidden:true, state:1}, {circle:[18.7, 11.4, 1.5], paint:"ember", alpha:.22, in:"head", id:"glowB2", hidden:true, state:1},
        stroked("M12.6 15.6 L13.2 17.2 M14.6 16.4 L14.9 18 M16.6 16.8 L16.4 18.4", "bone", .55, {in:"head"}),
        ...N.parts, ...AN.parts],
      states:{angry:[{part:"eyeA2"}, {part:"eyeB2"}, {part:"glowA2"}, {part:"glowB2"}, {part:"eyeA", show:false}, {part:"eyeB", show:false}, {part:"glowA", show:false}, {part:"glowB", show:false}]}});
  })();

  /* ---- Kindling: six sticks, six twig legs, one knot eye, an ember. quick ---- */
  (() => {
    const lg = (k, hx, ph, far, kx, fx) => { const L = leg2(k, [[hx, 24.5], [hx + kx, 31], [hx + fx, 35.3]], [1.5, 1.2], ph, far, "body"); L.parts.push({poly:[[hx + fx - 1.6, 35.6], [hx + fx + 1.2, 35.6], [hx + fx + .2, 34.6]], in:"shank" + k}); return L; };
    const sticks = [[16.5, 19.6, 41, 20.6, 3.2], [20, 22.6, 44.5, 23.1, 3.4], [18.4, 25.6, 40, 26.2, 3], [22, 16.8, 38, 17.6, 2.6], [26, 28.6, 36, 28.9, 2.2]];
    const F = merge(lg("F1", 24, 0, true, -2.5, -4.5), lg("F2", 31, .33, true, -1.5, -3.5), lg("F3", 38, .66, true, 1, 3)), N = merge(lg("N1", 22, .5, false, 2, 4.5), lg("N2", 29, .83, false, 1, 3.5), lg("N3", 36, .16, false, -2, -4));
    RIG.define("kindling", {stride:.55, tracks:T,
      palette:{fur:"#6b4a2e", twine:"#cbb88a", twine2:"#8a7450", knot:"#e8d9b4", pupil:"#2a1a10", ember:"#d9642a", flare:"#ff9a3a", far:.72},
      joints:[{id:"body", bob:1.2, in:"root"}, ...F.joints, ...N.joints],
      parts:[...F.parts, ...sticks.map(st => line([st[0], st[1]], [st[2], st[3]], st[4], {in:"body"})),
        line([23, 23], [37, 23], 1.4, {paint:"ember", in:"body", id:"emb"}), line([23, 23], [37, 23], 4, {paint:"ember", alpha:.22, in:"body", id:"embg"}),
        line([23, 23], [37, 23], 1.4, {paint:"flare", in:"body", id:"emb2", hidden:true, state:1}), line([23, 23], [37, 23], 4, {paint:"flare", alpha:.45, in:"body", id:"embg2", hidden:true, state:1}),
        {d:"M28.4 15.6 L31.6 15.4 L32.6 29.6 L29.4 29.8 Z", paint:"twine", in:"body"}, stroked("M28.8 18 L32 17.8 M29 22 L32.2 21.8 M29.2 26 L32.4 25.8", "twine2", .5, {in:"body"}),
        {circle:[18.6, 22.6, 1.9], paint:"knot", in:"body"}, {circle:[18.3, 22.7, .75], paint:"pupil", in:"body"},
        ...N.parts],
      states:{angry:[{part:"emb2"}, {part:"embg2"}, {part:"emb", show:false}, {part:"embg", show:false}]}});
  })();

  /* ---- Burrs: five hooked seeds on tiny legs, one eye. swarm ---- */
  (() => {
    const pts = [[20, 30.5, 0], [27, 26.5, .3], [34, 31, .6], [40, 27, .15], [30, 21, .45]]; const joints = [], parts = [];
    pts.forEach(([x, y, ph], i) => { const r = 2.5 + (i % 2) * .4, b = "b" + i;
      joints.push({id:b, track:"bob", period:.45 * 1.6, ph:ph * 1.875, in:"root"}, {id:b + "l", at:[x, y + r], track:"twitch", ph, in:b});
      parts.push(line([x - 1.2, y + r - .5], [x - 2.4, y + r + 2.6], .7, {paint:"leg", in:b + "l"}), line([x, y + r - .3], [x + .4, y + r + 2.8], .7, {paint:"leg", in:b + "l"}), line([x + 1.2, y + r - .5], [x + 2.6, y + r + 2.4], .7, {paint:"leg", in:b + "l"}));
      let hooks = ""; for (let k = 0; k < 8; k++){ const a = k / 8 * Math.PI * 2 + i; hooks += `M${(x + Math.cos(a) * r * .7).toFixed(1)} ${(y + Math.sin(a) * r * .7).toFixed(1)} L${(x + Math.cos(a) * r * 1.7).toFixed(1)} ${(y + Math.sin(a) * r * 1.7).toFixed(1)} `; }
      parts.push(stroked(hooks, "hook", .7, {in:b, id:"hooks" + i}), stroked(hooks, "glow", .7, {in:b, id:"hooksG" + i, hidden:true, state:1}), {circle:[x, y, r], in:b});
      if (i === 1) parts.push({circle:[x - .6, y - .2, .8], paint:"eye", in:b}, {circle:[x - .7, y - .2, .35], paint:"pupil", in:b}); });
    const angry = []; pts.forEach((_, i) => angry.push({part:"hooksG" + i}, {part:"hooks" + i, show:false}));
    RIG.define("burrs", {stride:.45, tracks:T, palette:{fur:"#8a4a6a", hook:"#d9b8c9", leg:"#5a2e44", glow:"#ff8a3a", eye:"#f1e6b0", pupil:"#2a1a10", shadow:"#2a1a10"},
      joints, parts:[{ellipse:[30, 35.4, 13, 1], paint:"shadow", alpha:.15}, ...parts], states:{angry}});
  })();

  /* ---- Clockhead: a dandelion clock that hovers; the seed cluster is a pupil. flying ---- */
  (() => {
    const seeds = (mad) => { let d = ""; const dots = []; for (let k = 0; k < 22; k++){ const a = k / 22 * Math.PI * 2, r0 = 6.6, r1 = mad && k % 3 === 0 ? 14 : 10.2; d += `M${(28 + Math.cos(a) * r0).toFixed(1)} ${(14 + Math.sin(a) * r0).toFixed(1)} L${(28 + Math.cos(a) * r1).toFixed(1)} ${(14 + Math.sin(a) * r1).toFixed(1)} `; dots.push({circle:[+(28 + Math.cos(a) * r1).toFixed(1), +(14 + Math.sin(a) * r1).toFixed(1), .5], in:"hover"}); } return {d, dots}; };
    const calm = seeds(false), mad = seeds(true);
    RIG.define("clockhead", {stride:2.4, tracks:T, palette:{fur:"#e8e6dc", stem:"#7a8a6a", core:"#3b3a2e", ember:"#ff8a3a", glint:"#ffffff", shadow:"#2a1a10"},
      joints:[{id:"hover", track:"hover", period:4.8, always:true, in:"root"}],
      parts:[{ellipse:[29, 35.4, 6, 1], paint:"shadow", alpha:.12},
        stroked("M28 19.4 C27 25 30 29 30.5 33.5", "stem", 1.1, {in:"hover"}), {d:"M30 30 L26.6 31.8 L29.4 32.6 Z", paint:"stem", in:"hover"},
        stroked(calm.d, "fur", .55, {in:"hover", id:"seeds"}), ...calm.dots.map((c, i) => Object.assign(c, {id:"dot" + i})),
        stroked(mad.d, "fur", .55, {in:"hover", id:"seeds2", hidden:true, state:1}), ...mad.dots.map((c, i) => Object.assign(c, {id:"dotM" + i, hidden:true, state:1})),
        {circle:[28, 14, 6.8], in:"hover"}, {circle:[28, 14, 2.3], paint:"core", in:"hover", id:"core"}, {circle:[28, 14, 2.3], paint:"ember", in:"hover", id:"core2", hidden:true, state:1}, {circle:[27.2, 13.2, .5], paint:"glint", alpha:.8, in:"hover"}],
      states:{angry:[{part:"seeds2"}, {part:"seeds", show:false}, {part:"core2"}, {part:"core", show:false}, ...calm.dots.map((_, i) => ({part:"dot" + i, show:false})), ...mad.dots.map((_, i) => ({part:"dotM" + i}))]}});
  })();

  /* ---- Fencepost: a post on two splinter legs, rusty wire. armored + thrower ---- */
  (() => {
    const lg = (k, ph, far, ox) => { const L = leg3(k, [[32.5 + ox, 22.5], [29.5 + ox, 28.5], [31 + ox, 33.2], [31.4 + ox, 35.2]], [1.6, 1.2, 1], ph, far, "body"); L.parts.push(stroked(`M${31.4 + ox} 35.2 L${28.4 + ox} 36.4 M${31.4 + ox} 35.2 L${31 + ox} 37 M${31.4 + ox} 35.2 L${34 + ox} 36.6`, "fur", .9, {in:"meta" + k})); return L; };
    const F = lg("F", 0, true, -1.5), N = lg("N", .5, false, 1.5);
    RIG.define("fencepost", {stride:1.6, tracks:T, palette:{fur:"#8c8a80", rust:"#9a4a2a", grain:"#6a6860", knot:"#3a3630", eye:"#e8e3d2", ember:"#ff8a3a", nail:"#b35a2a", far:.72},
      joints:[{id:"body", bob:1.2, in:"root"}, ...F.joints, ...N.joints],
      parts:[...F.parts,
        stroked("M35.2 14 C40 17 44 22 48 29 M35.4 10.5 C41 12 46 17 50 24", "rust", .8, {in:"body", id:"wire"}), stroked("M40 17.4 l1.4 -1.2 M44 21.6 l1.6 -1 M46.8 26 l1.6 -.8 M41.6 12.4 l1.2 -1.4 M46 16.8 l1.6 -.8", "rust", .7, {in:"body", id:"barb"}),
        stroked("M35.2 8 C40 4 45 3 50 6 M36 11 C42 9 47 10 52 14", "rust", .8, {in:"body", id:"wire2", hidden:true, state:1}), stroked("M41 4.6 l1.2 -1.6 M44.4 3.4 l.4 -2 M48 4.4 l1.6 -1.2 M42.6 9.4 l1 -1.6 M47 10.4 l1.4 -1.4", "rust", .7, {in:"body", id:"barb2", hidden:true, state:1}),
        {d:"M30.4 3.2 L32.2 1.4 L33.6 3 L35.2 1.8 L36 3.4 L36 23.2 C36 24.2 35.2 24.8 34.2 24.8 L31.8 24.8 C30.8 24.8 30 24.2 30 23.2 Z", in:"body"},
        stroked("M31.6 5 L31.4 21 M34.4 6 L34.6 20", "grain", .4, {in:"body"}), stroked("M33 3.4 L33.2 9.8", "grain", .6, {in:"body"}),
        {ellipse:[33, 12.6, 1.3, 1.7], paint:"knot", in:"body"}, {circle:[33, 12.8, .5], paint:"eye", in:"body", id:"eye"}, {circle:[33, 12.8, .5], paint:"ember", in:"body", id:"eye2", hidden:true, state:1},
        {circle:[33, 20.4, .5], paint:"nail", in:"body"},
        ...N.parts],
      states:{angry:[{part:"wire2"}, {part:"barb2"}, {part:"wire", show:false}, {part:"barb", show:false}, {part:"eye2"}, {part:"eye", show:false}]}});
  })();

  /* ---- Mound: a travelling molehill; two pale claws; a nose tip when it surfaces. armored ---- */
  (() => {
    const claw = (k, ph, far, oy) => ({joints:[{id:"sh" + k, at:[24, 30], track:"fsh", ph, far, in:"body"}, {id:"fore" + k, at:[20, 30.5 + oy], track:"ffore", ph, in:"sh" + k}],
      parts:[line([24, 30], [20, 30.5 + oy], 2.2, {paint:"claw", in:"sh" + k}), line([20, 30.5 + oy], [16.5, 33.4], 1.8, {paint:"claw", in:"fore" + k}), stroked("M16.5 33.4 L13.6 33.2 M16.5 33.4 L14 35 M16.5 33.4 L15.4 36", "claw", .9, {in:"fore" + k})]});
    const F = claw("F", 0, true, 1), N = claw("N", .5, false, -1);
    RIG.define("mound", {stride:.8, tracks:T, palette:{fur:"#6a4a30", claw:"#d8c8a8", crumb:"#8a6a4a", nose:"#e09aa0", ember:"#ff8a3a", far:.72},
      joints:[{id:"body", in:"root"}, ...F.joints, ...N.joints],
      parts:[stroked("M38 35.2 C42 34.4 47 35.4 52 34.6", "fur", 1.4), {circle:[44, 33.4, .7]}, {circle:[49, 33.8, .5]},
        ...F.parts,
        {d:"M16 35.4 C18 31 23 26.4 29 26 C35 25.6 40 30 42 35.4 Z", in:"body"},
        {circle:[22, 31.4, .6], paint:"crumb", in:"body"}, {circle:[30, 28.4, .6], paint:"crumb", in:"body"}, {circle:[36, 30.8, .6], paint:"crumb", in:"body"},
        {circle:[17.4, 34.4, .8], paint:"nose", in:"body", id:"nose"}, {circle:[17.6, 33.2 + 4, 1.1], paint:"ember", in:"body", id:"nose2", hidden:true, state:1},
        ...N.parts],
      states:{angry:[{joint:"body", y:-4}, {part:"nose2"}, {part:"nose", show:false}]}});
  })();

  /* ---- Bramble: a blackberry tangle on four thorn legs; one ripe berry for an eye. shover ---- */
  (() => {
    const lg = (k, hx, ph, far, kx, fx) => { const L = leg2(k, [[hx, 26], [hx + kx, 30.5], [hx + fx, 35]], [1.6, 1.2], ph, far, "body"); L.parts.push(stroked(`M${hx + fx} 35 L${hx + fx - 1.8} 36.2 M${hx + fx} 35 L${hx + fx + 1.4} 36.4`, "thorn", .8, {in:"shank" + k})); return L; };
    const ring = [[21, 22], [19, 17], [23, 12], [29, 9.4], [35, 10], [40, 13.6], [42, 19], [40, 25], [34, 28.4], [27, 28.6]];
    const thorns = t => { let a = "", b = ""; ring.forEach(([x, y], i) => { const an = Math.atan2(y - 19, x - 30.5); const seg = `M${x} ${y} L${(x + Math.cos(an) * 2.2 * t).toFixed(1)} ${(y + Math.sin(an) * 2.2 * t).toFixed(1)} `; if (i % 2) a += seg; else b += seg; }); return [a, b]; };
    const [c1, c2] = thorns(1), [m1, m2] = thorns(1.6);
    const F = merge(lg("F1", 25, 0, true, -2, -3), lg("F2", 36, .5, true, 1, 2.5)), N = merge(lg("N1", 27, .5, false, -2.5, -4), lg("N2", 38, 0, false, 2, 3.5));
    RIG.define("bramble", {stride:1.1, tracks:T, palette:{fur:"#3f5a2e", thorn:"#2a3a1e", vine:"#2e4422", leaf:"#6a8a3a", berry:"#3a1f3a", ember:"#ff8a3a", glint:"#f1e6b0", far:.72},
      joints:[{id:"body", bob:1.2, in:"root"}, ...F.joints, ...N.joints],
      parts:[...F.parts,
        stroked(c1, "thorn", .9, {in:"body", id:"th1"}), stroked(c2, "thorn", .7, {in:"body", id:"th2"}), stroked(m1, "thorn", .9, {in:"body", id:"th1m", hidden:true, state:1}), stroked(m2, "thorn", .7, {in:"body", id:"th2m", hidden:true, state:1}),
        {d:"M22 20 C20 15 24 10.4 30.5 10 C37 9.6 42 14 42 19.5 C42 25 37.4 28.8 30.5 28.8 C24 28.8 22 25 22 20 Z", in:"body"},
        stroked("M24 24 C28 20 33 26 38 20 M26 14 C30 18 34 12 39 16", "vine", 1, {in:"body"}),
        {d:"M27.4 12.4 L25 6.4 L30.2 9.6 Z M32.6 11.6 L35.6 5.6 L37.6 11.2 Z M38 14.2 L42.6 10 L41.2 15.8 Z", paint:"leaf", in:"body"},
        {circle:[26.6, 18.4, 1.9], paint:"berry", in:"body", id:"berry"}, {circle:[26.6, 18.4, 1.9], paint:"ember", in:"body", id:"berry2", hidden:true, state:1}, {circle:[25.6, 17.6, .55], paint:"glint", in:"body"},
        ...N.parts],
      states:{angry:[{part:"th1m"}, {part:"th2m"}, {part:"th1", show:false}, {part:"th2", show:false}, {part:"berry2"}, {part:"berry", show:false}]}});
  })();

  /* ---- Puffball: a swollen puffball on three root legs; swells before it pops. splitter ---- */
  (() => {
    const lg = (k, hx, ph, far, kx, fx) => { const L = leg2(k, [[hx, 28], [hx + kx, 31.5], [hx + fx, 35]], [2, 1.5], ph, far, "body"); L.parts.forEach(p => p.paint = "root"); L.parts.push(stroked(`M${hx + fx} 35 L${hx + fx - 2} 36.4 M${hx + fx} 35 L${hx + fx + 1.6} 36.4`, "root", .9, {in:"shank" + k})); return L; };
    const F = merge(lg("F1", 28, 0, true, -1.5, -2.5), lg("F2", 35, .66, true, 1.5, 2.5)), N = lg("N1", 31.5, .33, false, -1, -2);
    RIG.define("puffball", {stride:1, tracks:T, palette:{fur:"#e8dcc0", root:"#b8a888", bruise:"#9a7a52", split:"#8a7050", spot:"#c9b894", far:.78},
      joints:[{id:"body", bob:1.2, in:"root"}, ...F.joints, {id:"swell", at:[31, 24], in:"body"}, ...N.joints],
      parts:[...F.parts,
        {ellipse:[31, 21, 9.5, 8.5], in:"swell"}, {d:"M35 15 C38 16.4 39.6 19.6 39.2 22.8 C37.6 20.4 35.6 17.6 33 15.4 Z", paint:"bruise", in:"swell"},
        stroked("M29.4 13 Q31 14.4 32.6 13", "split", .8, {in:"swell"}), {circle:[26.6, 20.4, .6], paint:"spot", in:"swell"}, {circle:[29, 25.6, .5], paint:"spot", in:"swell"}, {circle:[34, 26.4, .6], paint:"spot", in:"swell"},
        ...N.parts],
      states:{angry:[{joint:"swell", scale:1.18}]}});
  })();

  /* ---- Shade: a tree's shadow walking without its tree. phasing ---- */
  (() => {
    const lg = (k, ph, far, ox) => leg3(k, [[31 + ox, 21], [29 + ox, 28], [31 + ox, 33], [29.5 + ox, 35.4]], [2.4, 1.8, 1.4], ph, far, "body");
    const F = lg("F", 0, true, -2), N = lg("N", .5, false, 2);
    RIG.define("shade", {stride:1.8, tracks:T, alpha:.62, palette:{fur:"#2e2a4a", eye:"#c9c2e8", ember:"#ff8a3a", far:.85},
      joints:[{id:"body", bob:1.2, in:"root"}, ...F.joints, ...N.joints],
      parts:[...F.parts,
        {d:"M28.5 21.5 L33.5 21.5 L34 12 L28 12 Z", in:"body"},
        stroked("M31 12 L31 6 M31 9 L26 4.6 M26 4.6 L23.6 5.4 M26 4.6 L25.4 1.6 M31 7.4 L36.2 3.2 M36.2 3.2 L38.8 4.2 M36.2 3.2 L36.6 .4 M31 6 L30.2 1.2 M31 10.4 L27.2 9.2 M31 9.8 L35 8", "fur", 1.3, {in:"body"}),
        stroked("M28.6 14 L23 19.6 M33.6 14.4 L38.6 18.4", "fur", 1.2, {in:"body"}),
        {ellipse:[30.2, 15.2, .9, 1.2], paint:"eye", in:"body", id:"eye"}, {ellipse:[30.2, 15.2, .9, 1.2], paint:"ember", in:"body", id:"eye2", hidden:true, state:1},
        ...N.parts],
      states:{angry:[{alpha:1 / .62}, {part:"eye2"}, {part:"eye", show:false}]}});
  })();
}
if (typeof module !== "undefined") module.exports = registerDenRigs;
